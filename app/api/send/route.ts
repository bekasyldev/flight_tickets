import { NextRequest, NextResponse } from 'next/server';
import { FlightTicketEmail } from '@/app/components/email/template';
import { Resend } from 'resend';
import React from 'react';
import { customerManager } from '@/lib/customer-manager';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendTicketEmailRequest {
  to: string;
  bookingReference: string;
  orderId: string;
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
    given_name: string;
    family_name: string;
    phone_number?: string;
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

    if (!emailData.to || !emailData.bookingReference || !emailData.orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: to, bookingReference, orderId' },
        { status: 400 }
      );
    }

    const emailAlreadySent = await customerManager.checkEmailAlreadySent(emailData.bookingReference);
    if (emailAlreadySent) {
      console.log(`Email already sent for booking ${emailData.bookingReference}, skipping...`);
      return NextResponse.json({ 
        success: true,
        message: 'Email already sent for this booking',
        duplicate: true
      });
    }

    try {
      await customerManager.createOrUpdateCustomer({
        email: emailData.to,
        given_name: emailData.passenger.given_name,
        family_name: emailData.passenger.family_name,
        phone_number: emailData.passenger.phone_number,
        booking_reference: emailData.bookingReference
      });
      console.log(`Customer saved/updated for email: ${emailData.to}`);
    } catch (customerError) {
      console.error('Error saving customer:', customerError);
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
      
      try {
        await customerManager.logEmailSent({
          booking_reference: emailData.bookingReference,
          customer_email: emailData.to,
          order_id: emailData.orderId,
          status: 'failed'
        });
      } catch (logError) {
        console.error('Error logging failed email:', logError);
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await customerManager.logEmailSent({
        booking_reference: emailData.bookingReference,
        customer_email: emailData.to,
        order_id: emailData.orderId,
        resend_message_id: data?.id,
        status: 'sent'
      });
    } catch (logError) {
      console.error('Error logging successful email:', logError);
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
