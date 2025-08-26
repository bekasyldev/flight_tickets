import { NextRequest, NextResponse } from 'next/server';
import { mongoSessionManager } from '@/lib/mongo-session';

const DUFFEL_API_BASE = 'https://api.duffel.com';
const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    if (!DUFFEL_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Duffel API token not configured' },
        { status: 500 }
      );
    }

    const { orderId, sessionToken, stripeSessionId } = await request.json();

    if (!orderId || !sessionToken || !stripeSessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, sessionToken, stripeSessionId' },
        { status: 400 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validate session for security
    const sessionData = await mongoSessionManager.validateSessionWithSecurity(
      sessionToken, 
      clientIp, 
      userAgent
    );
    
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 }
      );
    }

    await mongoSessionManager.logSecurityEvent('DUFFEL_PAYMENT_STARTED', {
      sessionId: sessionData.id,
      orderId,
      stripeSessionId,
      clientIp
    });


    const orderDetailsResponse = await fetch(`${DUFFEL_API_BASE}/air/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Duffel-Version': 'v2',
      }
    });

    if (!orderDetailsResponse.ok) {
      const orderError = await orderDetailsResponse.json();
      console.error('Failed to get order details:', orderError);
      return NextResponse.json(
        { error: 'Failed to get order details', details: orderError },
        { status: orderDetailsResponse.status }
      );
    }

    const orderDetails = await orderDetailsResponse.json();


    if (orderDetails.data.payment_status?.awaiting_payment === false) {
      await mongoSessionManager.logSecurityEvent('DUFFEL_ORDER_ALREADY_PAID', {
        sessionId: sessionData.id,
        orderId,
        stripeSessionId,
        clientIp
      });

      return NextResponse.json({
        success: true,
        order: orderDetails.data,
        message: 'Order already paid and completed'
      });
    }

    // Create payment for the order
    const paymentPayload = {
      data: {
        order_id: orderId,
        payment: {
          type: 'balance',
          currency: orderDetails.data.total_currency,
          amount: orderDetails.data.total_amount
        }
      }
    };


    const paymentResponse = await fetch(`${DUFFEL_API_BASE}/air/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload)
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('Duffel payment creation failed:', paymentData);
      return NextResponse.json(
        { 
          error: paymentData.errors?.[0]?.message || 'Failed to create payment',
          details: paymentData
        },
        { status: paymentResponse.status }
      );
    }

    await mongoSessionManager.logSecurityEvent('DUFFEL_PAYMENT_COMPLETED', {
      sessionId: sessionData.id,
      orderId,
      paymentId: paymentData.data.id,
      stripeSessionId,
      clientIp
    });

    return NextResponse.json({
      success: true,
      payment: paymentData.data,
      order: orderDetails.data,
      message: 'Payment completed successfully'
    });

  } catch (error: unknown) {
    console.error('Complete payment API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: `Failed to complete payment: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
