import { NextRequest, NextResponse } from 'next/server';
import type { SearchFlightRequest, DuffelAPIResponse, Slice, Passenger} from "@/app/types"
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

        const searchData: SearchFlightRequest = await request.json();

        if (searchData.offerRequestId) {
            const queryParams = new URLSearchParams();
            if (searchData.limit) {
                queryParams.append('limit', searchData.limit.toString());
            } else {
                queryParams.append('limit', '20');
            }
            if (searchData.after) {
                queryParams.append('after', searchData.after);
            }
            if (searchData.before) {
                queryParams.append('before', searchData.before);
            }

            const response = await fetch(
                `${DUFFEL_API_BASE}/air/offer_requests/${searchData.offerRequestId}?${queryParams.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
                        'Duffel-Version': 'v2',
                        'Accept-Encoding': 'gzip',
                    },
                }
            );

            const data = await response.json() as DuffelAPIResponse;

            if (!response.ok) {
                return NextResponse.json(
                    { error: data.errors || 'Failed to get offers' },
                    { status: response.status }
                );
            }

            return NextResponse.json({
                offers: data.data?.offers || [],
                pagination: {
                    limit: data.meta?.limit || 20,
                    after: data.meta?.after || null,
                    before: data.meta?.before || null,
                    hasNext: !!data.meta?.after,
                    hasPrevious: !!data.meta?.before
                },
                offerRequestId: searchData.offerRequestId
            }, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

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

        const passengers: Passenger[] = Array(searchData.passengers).fill({ type: 'adult' });

        const offerRequest = {
            slices,
            passengers,
            cabin_class: searchData.cabinClass,
        };

        const response = await fetch(`${DUFFEL_API_BASE}/air/offer_requests`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Duffel-Version': 'v2',
                'Accept-Encoding': 'gzip',
            },
            body: JSON.stringify({
                data: offerRequest
            }),
        });

        const data = await response.json() as DuffelAPIResponse;

        if (!response.ok) {
            return NextResponse.json(
                { error: data.errors || 'Failed to search flights' },
                { status: response.status }
            );
        }

        // Return first 20 offers and offer request ID for pagination
        const offers = data.data?.offers || [];
        const firstPageOffers = offers.slice(0, 20);

        let sessionToken = null;
        let sessionId = null;
        let expiresAt = null;

        if (firstPageOffers.length > 0) {
            try {
                const clientIp = request.headers.get('x-forwarded-for') || 
                                 request.headers.get('x-real-ip') || 
                                 'unknown';
                const userAgent = request.headers.get('user-agent') || 'unknown';

                const session = await mongoSessionManager.createSession(
                    {
                        origin: searchData.origin,
                        destination: searchData.destination,
                        departureDate: searchData.departureDate,
                        returnDate: searchData.returnDate,
                        passengers: searchData.passengers,
                        cabinClass: searchData.cabinClass,
                        tripType: searchData.tripType
                    },
                    firstPageOffers as unknown as import('@/lib/secure-session').DuffelOffer[],
                    { ip: clientIp, userAgent }
                );

                sessionToken = session.token;
                sessionId = session.id;
                expiresAt = session.expires_at.toISOString();

            } catch (error) {
                console.error('❌ Failed to create session:', error);
            }
        }

        return NextResponse.json({
            offers: firstPageOffers,
            session_token: sessionToken,  // 🔐 Токен для безопасной покупки
            session_id: sessionId,
            expires_at: expiresAt,
            pagination: {
                limit: 20,
                after: null,
                before: null,
                hasNext: offers.length > 20,
                hasPrevious: false,
                totalOffers: offers.length
            },
            offerRequestId: data.data?.offers[0].id || null // Store this for pagination
        }, {
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
