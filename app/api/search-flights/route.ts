import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const DUFFEL_ACCESS_TOKEN = process.env.NEXT_PUBLIC_DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_ACCESS_TOKEN;
  if (!DUFFEL_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Duffel access token not set' }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const duffelRes = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify(body),
    });

    const data = await duffelRes.json();
    return NextResponse.json(data, { status: duffelRes.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from Duffel API' }, { status: 500 });
  }
}