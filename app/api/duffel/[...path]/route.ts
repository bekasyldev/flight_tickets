import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_API_BASE = 'https://api.duffel.com';
const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

// Generic proxy for all Duffel API endpoints
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleDuffelRequest(request, 'GET', path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleDuffelRequest(request, 'POST', path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleDuffelRequest(request, 'PUT', path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleDuffelRequest(request, 'DELETE', path);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function handleDuffelRequest(
  request: NextRequest,
  method: string,
  pathSegments: string[]
) {
  try {
    // Check if API token is configured
    if (!DUFFEL_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Duffel API token not configured' },
        { status: 500 }
      );
    }

    // Build the Duffel API URL
    const duffelPath = pathSegments.join('/');
    const url = `${DUFFEL_API_BASE}/${duffelPath}`;
    
    // Get search params from the original request
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
      },
    };

    // Add body for POST, PUT requests
    if (['POST', 'PUT'].includes(method)) {
      const body = await request.text();
      if (body) {
        requestOptions.body = body;
      }
    }

    // Make the request to Duffel API
    const response = await fetch(fullUrl, requestOptions);
    const data = await response.text();

    // Return the response with CORS headers
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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