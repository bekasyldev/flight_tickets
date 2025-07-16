import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_API_BASE = 'https://api.duffel.com';
const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

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
    const body = await request.json();

    // Make the request to Duffel API
    const response = await fetch(`${DUFFEL_API_BASE}/air/offer_requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors || 'Failed to fetch offers' },
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
    console.error('Duffel API proxy error:', error);
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