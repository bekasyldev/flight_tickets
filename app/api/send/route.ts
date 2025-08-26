import { NextRequest, NextResponse } from 'next/server';
import { FlightTicketEmail } from '@/app/components/email/template';
import { Resend } from 'resend';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendTicketEmailRequest {
  to: string;
  bookingReference: string;
  flightNumber: string;
  flightDate: string;
  duration: string;
  departure: {
    time: string;
    airportCode: string;
    cityName: string;
    terminal: string;
  };
  arrival: {
    time: string;
    airportCode: string;
    cityName: string;
    terminal: string;
  };
  operatedBy: string;
  passenger: {
    name: string;
    baggage: string;
    class: string;
    seat: string;
  };
  pricing: {
    fare: string;
    fees: string;
    total: string;
    currency: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Resend API key not configured' },
        { status: 500 }
      );
    }

    const emailData: SendTicketEmailRequest = await request.json();

    if (!emailData.to || !emailData.bookingReference) {
      return NextResponse.json(
        { error: 'Missing required fields: to, bookingReference' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Flight Tickets <noreply@resend.dev>',
      to: [emailData.to],
      subject: `Flight Confirmation - ${emailData.bookingReference}`,
      react: React.createElement(FlightTicketEmail, {
        bookingReference: emailData.bookingReference,
        flightNumber: emailData.flightNumber,
        flightDate: emailData.flightDate,
        duration: emailData.duration,
        departure: emailData.departure,
        arrival: emailData.arrival,
        operatedBy: emailData.operatedBy,
        passenger: emailData.passenger,
        pricing: emailData.pricing
      }),
    });

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Flight ticket email sent successfully:', data);
    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      message: 'Flight ticket email sent successfully' 
    });

  } catch (error) {
    console.error('Send email API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to send email: ${errorMessage}` },
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
