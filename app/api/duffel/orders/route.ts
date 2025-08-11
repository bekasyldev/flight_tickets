import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_API_URL = 'https://api.duffel.com';
const DUFFEL_API_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

interface OrderRequest {
    selected_offers: string[];
    services?: { id: string; quantity: number }[];
    passengers: {
        given_name: string;
        family_name: string;
        gender: 'M' | 'F';
        title: string;
        born_on: string;
        email: string;
        phone_number: string;
    }[];
    payments: {
        type: 'card';
        currency: string;
        amount: string;
        three_d_secure_session_id?: string;
    }[];
    markup_amount?: string;
}

// Helper function to calculate markup
function calculateFinalAmount(
    offerAmount: number,
    servicesAmount: number,
    markupAmount: number,
    exchangeRate: number = 1,
    duffelFeeRate: number = 0.029
): string {
    const subtotal = offerAmount + servicesAmount + markupAmount;
    const finalAmount = (subtotal * exchangeRate) / (1 - duffelFeeRate);
    return finalAmount.toFixed(2);
}

export async function POST(request: NextRequest) {
    try {
        if (!DUFFEL_API_TOKEN) {
            return NextResponse.json(
                { error: 'Duffel API token not configured' },
                { status: 500 }
            );
        }

        const body: OrderRequest = await request.json();
        const {
            selected_offers,
            services = [],
            passengers,
            payments,
            markup_amount
        } = body;

        if (!selected_offers?.length || !passengers?.length || !payments?.length) {
            return NextResponse.json(
                { error: 'selected_offers, passengers, and payments are required' },
                { status: 400 }
            );
        }

        // First, get the offer details to calculate total with markup
        const offerResponse = await fetch(`${DUFFEL_API_URL}/air/offers/${selected_offers[0]}`, {
            headers: {
                'Authorization': `Bearer ${DUFFEL_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Duffel-Version': 'v2',
                'Accept': 'application/json'
            }
        });

        if (!offerResponse.ok) {
            throw new Error('Failed to fetch offer details');
        }

        const offerData = await offerResponse.json();
        const offer = offerData.data;

        // Calculate amounts
        const offerAmount = parseFloat(offer.total_amount);
        const servicesAmount = services.reduce((sum, service) => sum + (service.quantity * 10), 0); // Assuming €10 per service
        const markupAmount = markup_amount ? parseFloat(markup_amount) : 15.0; // Default €15 markup

        // Calculate final amount with Duffel fees
        const finalAmount = calculateFinalAmount(offerAmount, servicesAmount, markupAmount);

        // Prepare order payload
        const orderPayload = {
            selected_offers: selected_offers,
            services: services,
            passengers: passengers.map(passenger => ({
                ...passenger,
                type: 'adult' // Assuming all passengers are adults for simplicity
            })),
            payments: payments.map(payment => ({
                ...payment,
                amount: finalAmount // Use calculated amount with markup
            }))
        };

        console.log('Creating order with payload:', {
            ...orderPayload,
            calculated_amounts: {
                offer_amount: offerAmount,
                services_amount: servicesAmount,
                markup_amount: markupAmount,
                final_amount: finalAmount
            }
        });

        const response = await fetch(`${DUFFEL_API_URL}/air/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DUFFEL_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Duffel-Version': 'v2',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            },
            body: JSON.stringify(orderPayload)
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Duffel Order API error:', responseData);
            return NextResponse.json(
                {
                    error: 'Failed to create order',
                    details: responseData,
                    debug_info: {
                        original_amount: offerAmount,
                        markup_added: markupAmount,
                        final_charged: finalAmount
                    }
                },
                { status: response.status }
            );
        }

        console.log('Order created successfully:', responseData);

        return NextResponse.json({
            success: true,
            order: responseData.data,
            payment_details: {
                original_amount: offerAmount,
                markup_amount: markupAmount,
                services_amount: servicesAmount,
                final_amount: finalAmount,
                your_profit: markupAmount
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
