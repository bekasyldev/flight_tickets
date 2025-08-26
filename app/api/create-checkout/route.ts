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
    const { sessionToken, offerId, customerEmail, passengers, duffelOrderId } = await request.json();

    if (!sessionToken || !offerId) {
      return NextResponse.json(
        { error: 'Session token and offer ID are required' },
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

    const selectedOffer = sessionData.offers.find((offer: { id: string }) => offer.id === offerId);
    
    if (!selectedOffer) {
      return NextResponse.json(
        { error: 'Offer not found in session' },
        { status: 404 }
      );
    }

    if (passengers && Array.isArray(passengers)) {
      try {
        const db = await import('@/lib/mongodb').then(m => m.getDatabase());
        const passengersCollection = db.collection('passenger_data');
        
        // Create TTL index for automatic cleanup
        await passengersCollection.createIndex(
          { expires_at: 1 }, 
          { expireAfterSeconds: 0 }
        );

        await passengersCollection.insertOne({
          session_token: sessionToken,
          offer_id: offerId,
          passengers: passengers,
          client_ip: clientIp,
          user_agent: userAgent,
          created_at: new Date(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes TTL
        });

        await mongoSessionManager.logSecurityEvent('PASSENGER_DATA_STORED', {
          sessionId: sessionData.id,
          offerId,
          passengerCount: passengers.length,
          clientIp
        });
      } catch (error) {
        console.error('Failed to store passenger data:', error);
      }
    }

    const totalAmountCents = Math.round(parseFloat(selectedOffer.total_amount) * 100);

    const stripeExpiresAt = Math.floor((Date.now() + 30 * 60 * 1000) / 1000);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: selectedOffer.total_currency.toLowerCase(),
            product_data: {
              name: `Flight Ticket ${sessionData.search_params.origin} → ${sessionData.search_params.destination}`,
              description: `Flight on ${sessionData.search_params.departureDate}`,
            },
            unit_amount: totalAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        session_token: sessionToken,
        offer_id: offerId,
        duffel_order_id: duffelOrderId || 'unknown', 
        original_amount: selectedOffer.total_amount,
        commission: '15.00',
        client_ip: clientIp,
        search_origin: sessionData.search_params.origin,
        search_destination: sessionData.search_params.destination,
        departure_date: sessionData.search_params.departureDate,
      },
      success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&token=${sessionToken}&offer_id=${offerId}`,
      cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/checkout?token=${sessionToken}&offer_id=${offerId}`,
      expires_at: stripeExpiresAt,
    });


    return NextResponse.json({
      success: true,
      checkout_url: checkoutSession.url,
      stripe_session_id: checkoutSession.id,
      amount: selectedOffer.total_amount,
      currency: selectedOffer.total_currency,
      commission: selectedOffer.commission || '15.00',
      original_amount: selectedOffer.original_amount || selectedOffer.total_amount,
      expires_at: sessionData.expires_at.toISOString(),
    });

  } catch (error: unknown) {
    console.error('Stripe Checkout API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorType = (error as {type?: string})?.type;
    
    if (errorMessage.includes('Invalid or expired session')) {
      return NextResponse.json(
        { error: 'Session expired. Please search for flights again.' },
        { status: 401 }
      );
    }
    
    if (errorType === 'StripeCardError') {
      return NextResponse.json(
        { error: 'Card was declined. Please try a different payment method.' },
        { status: 402 }
      );
    }
    
    if (errorType === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid payment request. Please check your details.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment processing failed. Please try again.' },
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
