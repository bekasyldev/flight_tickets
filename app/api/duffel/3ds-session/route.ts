import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_API_URL = 'https://api.duffel.com';
const DUFFEL_API_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

interface ThreeDSSessionRequest {
    card_id: string;
    offer_id: string;
    services?: { id: string; quantity: number }[];
}

export async function POST(request: NextRequest) {
    try {
        if (!DUFFEL_API_TOKEN) {
            return NextResponse.json(
                { error: 'Duffel API token not configured' },
                { status: 500 }
            );
        }

        const body: ThreeDSSessionRequest = await request.json();
        const { card_id, offer_id, services = [] } = body;

        if (!card_id || !offer_id) {
            return NextResponse.json(
                { error: 'card_id and offer_id are required' },
                { status: 400 }
            );
        }

        // Create 3DS session request payload
        const threeDSPayload = {
            card_id,
            resource_id: offer_id,
            resource_type: 'offer',
            services,
            cardholder_present: true
        };

        console.log('Creating 3DS session with payload:', threeDSPayload);

        const response = await fetch(`${DUFFEL_API_URL}/payments/three_d_secure_sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DUFFEL_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Duffel-Version': 'v2',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            },
            body: JSON.stringify(threeDSPayload)
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Duffel 3DS API error:', responseData);
            return NextResponse.json(
                { error: 'Failed to create 3DS session', details: responseData },
                { status: response.status }
            );
        }

        console.log('3DS session created successfully:', responseData);

        return NextResponse.json({
            success: true,
            three_d_secure_session: responseData.data
        });

    } catch (error) {
        console.error('Error creating 3DS session:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
