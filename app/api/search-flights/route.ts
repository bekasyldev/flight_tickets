import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_API_BASE = 'https://api.duffel.com';
const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

interface Passenger {
    type: 'adult' | 'child' | 'infant_without_seat';
    age?: number;
}

interface Slice {
    origin: string;
    destination: string;
    departure_date: string;
}

interface SearchFlightRequest {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    tripType: 'one-way' | 'round-trip';
    passengers: number;
    cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
}

export async function POST(request: NextRequest) {
    try {
        // Check if API token is configured
        if (!DUFFEL_ACCESS_TOKEN) {
            return NextResponse.json(
                { error: 'Duffel API token not configured' },
                { status: 500 }
            );
        }

        // Get the request body
        const searchData: SearchFlightRequest = await request.json();

        // Validate required fields
        if (!searchData.origin || !searchData.destination || !searchData.departureDate) {
            return NextResponse.json(
                { error: 'Missing required fields: origin, destination, or departureDate' },
                { status: 400 }
            );
        }

        if (searchData.tripType === 'round-trip' && !searchData.returnDate) {
            return NextResponse.json(
                { error: 'Return date is required for round-trip flights' },
                { status: 400 }
            );
        }

        // Build the slices based on trip type
        const slices: Slice[] = [
            {
                origin: searchData.origin.toUpperCase(),
                destination: searchData.destination.toUpperCase(),
                departure_date: searchData.departureDate
            }
        ];

        if (searchData.tripType === 'round-trip' && searchData.returnDate) {
            slices.push({
                origin: searchData.destination.toUpperCase(),
                destination: searchData.origin.toUpperCase(),
                departure_date: searchData.returnDate
            });
        }

        // Build passengers array
        const passengers: Passenger[] = Array(searchData.passengers).fill({ type: 'adult' });

        const offerRequest = {
            slices,
            passengers,
            cabin_class: searchData.cabinClass
        };

        // Make the request to Duffel API
        const response = await fetch(`${DUFFEL_API_BASE}/air/offer_requests`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Duffel-Version': 'v2',
            },
            body: JSON.stringify({
                data: offerRequest
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.errors || 'Failed to search flights' },
                { status: response.status }
            );
        }

        // Return the data with CORS headers
        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Flight search API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
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
