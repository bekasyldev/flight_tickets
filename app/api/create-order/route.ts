import { NextRequest, NextResponse } from 'next/server';
import { mongoSessionManager } from '@/lib/mongo-session';

const DUFFEL_API_BASE = 'https://api.duffel.com';
const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

interface PassengerData {
  given_name: string;
  family_name: string;
  gender: 'M' | 'F';
  title: string;
  born_on: string;
  email: string;
  phone_number?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!DUFFEL_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Duffel API token not configured' },
        { status: 500 }
      );
    }

    const { sessionToken, offerId, passengers } = await request.json();

    if (!sessionToken || !offerId || !passengers) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionToken, offerId, passengers' },
        { status: 400 }
      );
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json(
        { error: 'Passengers data must be a non-empty array' },
        { status: 400 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

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

    const passengerData = passengers; 

    const selectedOffer = sessionData.offers.find((offer: { 
      id: string; 
      total_amount: string; 
      total_currency: string; 
      payment_requirements?: { 
        requires_instant_payment?: boolean;
        price_guarantee_expires_at?: string | null;
        payment_required_by?: string | null;
      }
    }) => offer.id === offerId);
    if (!selectedOffer) {
      return NextResponse.json(
        { error: 'Offer not found in session' },
        { status: 404 }
      );
    }

    const isValidPassengerData = passengerData.every((passenger: PassengerData) => 
      passenger.given_name && 
      passenger.family_name && 
      passenger.email && 
      passenger.born_on &&
      passenger.gender &&
      passenger.title
    );

    if (!isValidPassengerData) {
      return NextResponse.json(
        { error: 'Invalid passenger data - missing required fields' },
        { status: 400 }
      );
    }

    await mongoSessionManager.logSecurityEvent('DUFFEL_ORDER_CREATION_STARTED', {
      sessionId: sessionData.id,
      offerId,
      passengerCount: passengerData.length,
      clientIp
    });


    const paymentReqs = selectedOffer.payment_requirements as { requires_instant_payment?: boolean } | undefined;
    const requiresInstantPayment = paymentReqs?.requires_instant_payment === true;
    


    const passengerIds = sessionData.passenger_ids || [];
    
    if (passengerIds.length === 0) {
      return NextResponse.json(
        { error: 'No passenger IDs found in session - offer request may have failed' },
        { status: 400 }
      );
    }
    
    if (passengerIds.length !== passengerData.length) {
      return NextResponse.json(
        { error: `Passenger count mismatch: expected ${passengerIds.length}, got ${passengerData.length}` },
        { status: 400 }
      );
    }
    
    const originalAmount = (parseFloat(selectedOffer.total_amount) - 15.00).toFixed(2);
    
    const orderPayload = {
      data: { 
        selected_offers: [offerId],
        passengers: passengerData.map((passenger: PassengerData, index: number) => ({
          id: passengerIds[index], // Use Duffel-generated passenger ID
          given_name: passenger.given_name,
          family_name: passenger.family_name,
          gender: passenger.gender.toLowerCase(),
          title: passenger.title,
          born_on: passenger.born_on,
          email: passenger.email,
          phone_number: passenger.phone_number || null,
        })),
        payments: [
          {
            type: 'balance',
            currency: selectedOffer.total_currency,
            amount: originalAmount // Use original amount without commission
          }
        ],
        ...(requiresInstantPayment ? {
          type: 'instant'
        } : {}),
        metadata: {
          session_token: sessionToken,
          stripe_pending: 'true'
        }
      }
    };

    const orderResponse = await fetch(`${DUFFEL_API_BASE}/air/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('Duffel order creation failed:', orderData);
      return NextResponse.json(
        { 
          error: orderData.errors?.[0]?.message || 'Failed to create order',
          details: orderData
        },
        { status: orderResponse.status }
      );
    }


    await mongoSessionManager.logSecurityEvent('DUFFEL_ORDER_CREATED', {
      sessionId: sessionData.id,
      duffelOrderId: orderData.data.id,
      bookingReference: orderData.data.booking_reference,
      clientIp
    });

    return NextResponse.json({
      success: true,
      order: orderData.data,
      orderId: orderData.data.id,
      bookingReference: orderData.data.booking_reference,
      message: 'Order created successfully, ready for payment'
    });

  } catch (error: unknown) {
    console.error('Create order API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: `Failed to create order: ${errorMessage}` },
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
