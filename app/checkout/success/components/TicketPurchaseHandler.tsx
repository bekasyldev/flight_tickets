'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface TicketPurchaseStatus {
  status: 'processing' | 'success' | 'error';
  message: string;
  orderId?: string;
}

export default function TicketPurchaseHandler() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const sessionToken = searchParams.get('token'); 
  const offerId = searchParams.get('offer_id'); 
  
  const [purchaseStatus, setPurchaseStatus] = useState<TicketPurchaseStatus>({
    status: 'processing',
    message: 'Оформляем ваш билет и отправляем на email...'
  });

  useEffect(() => {
    const completeTicketPurchase = async () => {
      if (!sessionId || !sessionToken || !offerId) {
        setPurchaseStatus({
          status: 'error',
          message: 'Отсутствуют необходимые параметры сессии'
        });
        return;
      }

      try {
        const stripeResponse = await fetch('/api/get-stripe-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId,
            sessionToken: sessionToken
          })
        });

        if (!stripeResponse.ok) {
          throw new Error('Failed to get Stripe session details');
        }

        const stripeData = await stripeResponse.json();
        const duffelOrderId = stripeData.metadata?.duffel_order_id;

        if (!duffelOrderId) {
          throw new Error('Duffel order ID not found in Stripe metadata');
        }


        const response = await fetch('/api/complete-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: duffelOrderId,
            sessionToken: sessionToken,
            stripeSessionId: sessionId
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Send ticket email after successful payment completion
          try {
            const orderData = result.order;
            const slice = orderData.slices[0];
            const segment = slice.segments[0];
            const passenger = orderData.passengers[0];

            // Format data for email template
            const emailData = {
              to: passenger.email,
              bookingReference: orderData.booking_reference,
              flightNumber: `${segment.marketing_carrier.iata_code} ${segment.marketing_carrier_flight_number}`,
              flightDate: new Date(segment.departing_at).toLocaleDateString('en-GB'),
              duration: segment.duration,
              departure: {
                time: new Date(segment.departing_at).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}) + 'h',
                airportCode: segment.origin.iata_code,
                cityName: segment.origin.city_name || segment.origin.name,
                terminal: segment.origin_terminal ? `Terminal ${segment.origin_terminal}` : 'N/A'
              },
              arrival: {
                time: new Date(segment.arriving_at).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}) + 'h',
                airportCode: segment.destination.iata_code,
                cityName: segment.destination.city_name || segment.destination.name,
                terminal: segment.destination_terminal ? `Terminal ${segment.destination_terminal}` : 'N/A'
              },
              operatedBy: segment.operating_carrier?.name || segment.marketing_carrier.name,
              passenger: {
                name: `${passenger.given_name} ${passenger.family_name}`,
                baggage: '5 kg', // Default or get from order if available
                class: slice.fare_brand_name || 'Economy',
                seat: segment.passengers?.[0]?.seat?.designator || 'To be assigned'
              },
              pricing: {
                fare: orderData.base_amount,
                fees: orderData.tax_amount,
                total: orderData.total_amount,
                currency: orderData.total_currency
              }
            };

            console.log('Sending ticket email to:', passenger.email);
            
            const emailResponse = await fetch('/api/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailData)
            });

            if (emailResponse.ok) {
              console.log('Ticket email sent successfully');
            } else {
              console.error('Failed to send ticket email');
            }
          } catch (emailError) {
            console.error('Error sending ticket email:', emailError);
            // Don't fail the whole process if email fails
          }

          setPurchaseStatus({
            status: 'success',
            message: 'Билет успешно оформлен! Email с билетом отправлен.',
            orderId: result.order.id
          });
        } else {
          setPurchaseStatus({
            status: 'error',
            message: result.error || 'Ошибка при завершении оплаты билета'
          });
          console.error('Payment completion failed:', result);
        }

      } catch (error) {
        console.error('Error completing ticket purchase:', error);
        setPurchaseStatus({
          status: 'error',
          message: 'Ошибка при завершении оплаты билета. Обратитесь в поддержку.'
        });
      }
    };

    completeTicketPurchase();
  }, [sessionId, sessionToken, offerId]);

  if (purchaseStatus.status === 'processing') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-700 font-medium">{purchaseStatus.message}</span>
        </div>
      </div>
    );
  }

  if (purchaseStatus.status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700 font-medium">{purchaseStatus.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <span className="text-green-700 font-medium block">{purchaseStatus.message}</span>
          {purchaseStatus.orderId && (
            <span className="text-green-600 text-sm">Номер заказа: {purchaseStatus.orderId}</span>
          )}
        </div>
      </div>
    </div>
  );
}
