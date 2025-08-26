import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { mongoSessionManager } from '@/lib/mongo-session';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId, sessionToken } = await request.json();

    if (!sessionId || !sessionToken) {
      return NextResponse.json(
        { error: 'Session ID and token are required' },
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

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession) {
      return NextResponse.json(
        { error: 'Stripe session not found' },
        { status: 404 }
      );
    }

    // Verify the session belongs to this user
    if (stripeSession.metadata?.session_token !== sessionToken) {
      return NextResponse.json(
        { error: 'Session token mismatch' },
        { status: 403 }
      );
    }

    await mongoSessionManager.logSecurityEvent('STRIPE_SESSION_RETRIEVED', {
      sessionId: sessionData.id,
      stripeSessionId: sessionId,
      duffelOrderId: stripeSession.metadata?.duffel_order_id,
      clientIp
    });

    return NextResponse.json({
      success: true,
      metadata: stripeSession.metadata,
      payment_status: stripeSession.payment_status,
      amount_total: stripeSession.amount_total
    });

  } catch (error: unknown) {
    console.error('Get Stripe session API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: `Failed to get Stripe session: ${errorMessage}` },
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
