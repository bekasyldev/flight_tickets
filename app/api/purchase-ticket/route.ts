import { NextRequest, NextResponse } from 'next/server';
import { mongoSessionManager } from '@/lib/mongo-session';
import { getDatabase } from '@/lib/mongodb';

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

    const { sessionToken, offerId, stripeSessionId } = await request.json();

    if (!sessionToken || !offerId || !stripeSessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionToken, offerId, stripeSessionId' },
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

    const db = await getDatabase();
    const passengersCollection = db.collection('passenger_data');
    
    const passengerDoc = await passengersCollection.findOne({
      session_token: sessionToken,
      offer_id: offerId,
      expires_at: { $gt: new Date() }
    });

    if (!passengerDoc || !passengerDoc.passengers) {
      return NextResponse.json(
        { error: 'Passenger data not found or expired' },
        { status: 404 }
      );
    }

    const passengers = passengerDoc.passengers;
    const services = passengerDoc.services || []; 

    // Get the original offer amount (without commission) for Duffel payment
    const selectedOffer = sessionData.offers.find((offer: { id: string; total_amount: string; total_currency: string; payment_requirements?: unknown }) => offer.id === offerId);
    if (!selectedOffer) {
      return NextResponse.json(
        { error: 'Offer not found in session' },
        { status: 404 }
      );
    }

    if (!offerId || !passengers || !Array.isArray(passengers)) {
      return NextResponse.json(
        { error: 'Missing required fields: offerId, passengers' },
        { status: 400 }
      );
    }

    const isValidPassengerData = passengers.every((passenger: PassengerData) => 
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

    await mongoSessionManager.logSecurityEvent('TICKET_PURCHASE_STARTED', {
      sessionId: sessionData.id,
      offerId,
      stripeSessionId,
      passengerCount: passengers.length,
      clientIp
    });

    const orderPayload = {
      data: { 
        selected_offers: [offerId],
        services: services,
        passengers: passengers.map((passenger: PassengerData) => ({
          given_name: passenger.given_name,
          family_name: passenger.family_name,
          gender: passenger.gender,
          title: passenger.title,
          born_on: passenger.born_on,
          email: passenger.email,
          phone_number: passenger.phone_number || null,
        })),
        payments: [
          {
            type: 'balance',
            currency: selectedOffer.total_currency,
            amount: selectedOffer.total_amount
          }
        ]
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

    return NextResponse.json({
      success: true,
      order: orderData.data,
      message: 'Ticket purchased successfully with balance'
    });

  } catch (error: unknown) {
    console.error('Purchase ticket API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: `Failed to purchase ticket: ${errorMessage}` },
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
