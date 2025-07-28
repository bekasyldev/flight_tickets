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
    // Pagination parameters
    offerRequestId?: string; // For getting specific offer request with pagination
    limit?: number;
    after?: string;
    before?: string;
}

// Response Types
interface Airport {
    city: string | null;
    city_name: string;
    iata_city_code: string;
    iata_code: string;
    iata_country_code: string;
    icao_code: string;
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    time_zone: string;
    type: 'airport';
}

interface Airline {
    logo_symbol_url: string;
    conditions_of_carriage_url: string;
    iata_code: string;
    name: string;
}

interface Aircraft {
    iata_code: string;
    name: string;
}

interface PassengerInfo {
    id: string;
    given_name: string;
    family_name: string;
    loyalty_programme_accounts: string[];
    born_on: string;
}

interface Media {
    uri: string;
    type: string;
    description: string;
}

interface Stop {
    airport: Airport;
    arrival_at: string;
    departure_at: string;
    duration: string;
}

interface Segment {
    aircraft: Aircraft | null;
    arriving_at: string;
    departing_at: string;
    destination: Airport;
    destination_terminal: string;
    distance: string;
    duration: string;
    id: string;
    marketing_carrier: Airline;
    marketing_carrier_flight_number: string;
    media: Media[];
    operating_carrier: Airline;
    operating_carrier_flight_number: string;
    origin: Airport;
    origin_terminal: string;
    passengers: PassengerInfo[];
    stops: Stop[];
}

interface SliceConditions {
    priority_check_in: null | boolean;
    priority_boarding: null | boolean;
    advance_seat_selection: null | boolean;
}

interface OfferSlice {
    comparison_key: string;
    ngs_shelf: number;
    destination_type: string;
    conditions: SliceConditions;
    destination: Airport;
    duration: string;
    fare_brand_name: string;
    id: string;
    origin: Airport;
    origin_type: string;
    segments: Segment[];
}

interface PaymentRequirements {
    requires_instant_payment: boolean;
    price_guarantee_expires_at: string;
    payment_required_by: string;
}

interface OfferConditions {
    refund_before_departure: {
        penalty_currency: string | null;
        penalty_amount: number | null;
        allowed: boolean;
    };
    change_before_departure: {
        penalty_currency: string | null;
        penalty_amount: number | null;
        allowed: boolean;
    };
}

interface LoyaltyProgramme {
    airline_iata_code: string;
    name: string;
}

interface AvailableService {
    id: string;
    type: string;
    total_amount: string;
    total_currency: string;
}

interface Offer {
    total_emissions_kg: string;
    passenger_identity_documents_required: boolean;
    tax_currency: string;
    available_services: AvailableService[] | null;
    base_amount: string;
    base_currency: string;
    conditions: OfferConditions;
    created_at: string;
    expires_at: string;
    id: string;
    live_mode: boolean;
    owner: Airline;
    partial: boolean;
    passengers: PassengerInfo[];
    payment_requirements: PaymentRequirements;
    private_fares: Array<{
        corporate_code: string;
        tracking_reference: string;
    }>;
    slices: OfferSlice[];
    supported_loyalty_programmes: LoyaltyProgramme[];
    supported_passenger_identity_document_types: string[];
    tax_amount: string;
    total_amount: string;
    total_currency: string;
    updated_at: string;
}

interface DuffelAPIResponse {
    data: {
        offers: Offer[];
    };
    meta?: {
        limit: number;
        before: string | null;
        after: string | null;
    };
    errors?: Array<{
        code: string;
        message: string;
        documentation_url?: string;
    }>;
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

        // If we have an offerRequestId, get paginated offers from existing request
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

        // Validate required fields for new search
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
            cabin_class: searchData.cabinClass,
        };

        // Create new offer request
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

        return NextResponse.json({
            offers: firstPageOffers,
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
