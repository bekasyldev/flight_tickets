import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_API_BASE = 'https://api.duffel.com';
const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
    try {
        if (!DUFFEL_ACCESS_TOKEN) {
            return NextResponse.json(
                { error: 'Duffel API token not configured' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        let url = `${DUFFEL_API_BASE}/air/airports`;
        if (query) {
            url += `?name=${encodeURIComponent(query)}`;
        }

        // Make the request to Duffel API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Duffel-Version': 'v2',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.errors || 'Failed to fetch airports' },
                { status: response.status }
            );
        }

        // Return the data with CORS headers
        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Duffel airports API error:', error);
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
