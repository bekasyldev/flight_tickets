import { NextResponse } from 'next/server';

const DUFFEL_API_URL = 'https://api.duffel.com';
const DUFFEL_API_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

export async function POST() {
    try {
        if (!DUFFEL_API_TOKEN) {
            return NextResponse.json(
                { error: 'Duffel API token not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(`${DUFFEL_API_URL}/identity/component_client_keys`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DUFFEL_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Duffel-Version': 'v2',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Duffel API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to create client key' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({
            client_key: data.data.component_client_key
        });

    } catch (error) {
        console.error('Client key creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 