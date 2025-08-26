'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import { Offer, Airline, Segment } from '../types';

interface PassengerInfo {
  given_name: string;
  family_name: string;
  gender: 'M' | 'F';
  title: string;
  born_on: string;
  email: string;
  phone_number: string;
}

interface FlightData {
  offer_id: string;
  total_amount: string;
  total_currency: string;
  airline: Airline;
  departure: { airport: string; code: string; time: string };
  arrival: { airport: string; code: string; time: string };
  segments: Segment[];
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get('offer_id');
  const sessionToken = searchParams.get('token');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [passengers, setPassengers] = useState<PassengerInfo[]>([
    {
      given_name: '',
      family_name: '',
      gender: 'M',
      title: 'mr',
      born_on: '',
      email: '',
      phone_number: ''
    }
  ]);

  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);

  const [flightData, setFlightData] = useState<FlightData | null>(null);

  const handlePassengerUpdate = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const getAirportCode = (name: string): string => {
    const match = name.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : name.substring(0, 3).toUpperCase();
  };

  const transformOfferToFlightData = useCallback((offer: Offer) => {
    if (!offer || !offer.slices || offer.slices.length === 0) {
      return null;
    }

    const firstSlice = offer.slices[0];
    const lastSlice = offer.slices[offer.slices.length - 1];
    const firstSegment = firstSlice?.segments[0];
    const lastSegment = lastSlice?.segments[lastSlice.segments.length - 1];

    return {
      offer_id: offer.id,
      total_amount: offer.total_amount,
      total_currency: offer.total_currency,
      airline: firstSegment?.marketing_carrier || { name: 'Unknown', iata_code: 'XX', logo_symbol_url: '' },
      departure: {
        airport: firstSegment?.origin?.name || 'Unknown',
        code: getAirportCode(firstSegment?.origin?.name || ''),
        time: firstSegment?.departing_at || ''
      },
      arrival: {
        airport: lastSegment?.destination?.name || 'Unknown', 
        code: getAirportCode(lastSegment?.destination?.name || ''),
        time: lastSegment?.arriving_at || ''
      },
      segments: offer.slices.flatMap((slice) => slice.segments || [])
    };
  }, []);

  useEffect(() => {
    const validateSessionAndFetchData = async () => {
      if (!sessionToken || !offerId) {
        console.error('Missing session token or offer ID');
        window.location.href = '/';
        return;
      }

      try {
        const response = await fetch('/api/validate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            token: sessionToken,
            offer_id: offerId,
            action: 'checkout_start' 
          })
        });

        if (response.ok) {
          const sessionData = await response.json();
          const transformedFlightData = transformOfferToFlightData(sessionData.offer);
          setFlightData(transformedFlightData);
          setSessionValidated(true);
        } else {
          console.error('❌ Session validation failed');
          alert('❌ Сессия истекла. Пожалуйста, начните поиск заново.');
          window.location.href = '/';
        }
      } catch (error) {
        console.error('❌ Session validation error:', error);
        alert('❌ Ошибка проверки сессии. Пожалуйста, попробуйте снова.');
        window.location.href = '/';
      }
    };

    validateSessionAndFetchData();
  }, [sessionToken, offerId, transformOfferToFlightData]);

  const createStripePayment = async () => {
    if (!sessionToken || !offerId || !flightData || !sessionValidated) {
      alert('Отсутствуют данные рейса или сессия не валидна');
      return;
    }

    const isValidPassengerData = passengers.every(passenger => 
      passenger.given_name && 
      passenger.family_name && 
      passenger.email && 
      passenger.born_on
    );

    if (!isValidPassengerData) {
      alert('Пожалуйста, заполните все обязательные поля для пассажиров');
      return;
    }

    setIsPaymentProcessing(true);
    
    try {
      
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: sessionToken,
          offerId: offerId,
          passengers: passengers
        })
      });

      if (!orderResponse.ok) {
        const orderError = await orderResponse.json();
        console.error('Duffel order creation failed:', orderError);
        alert(`Ошибка при создании заказа: ${orderError.error || 'Неизвестная ошибка'}`);
        setIsPaymentProcessing(false);
        return;
      }

      const orderData = await orderResponse.json();

      
      const stripeResponse = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: sessionToken,
          offerId: offerId,
          customerEmail: passengers[0].email,
          passengers: passengers,
          duffelOrderId: orderData.orderId // Pass the order ID to Stripe metadata
        })
      });

      if (stripeResponse.ok) {
        const stripeData = await stripeResponse.json();
        window.location.href = stripeData.checkout_url;
      } else {
        const errorData = await stripeResponse.json();
        console.error('Stripe checkout creation failed:', errorData);
        alert(`Ошибка при создании платежной сессии: ${errorData.error || 'Неизвестная ошибка'}`);
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Платеж отклонен';
      alert(`Ошибка при обработке платежа: ${errorMessage}`);
      
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Helper functions for formatting
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {flightData ? 
              `Оформление билета ${flightData.departure.code} → ${flightData.arrival.code}` :
              'Оформление билета'
            }
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            {/* Step 1: Passenger Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-black">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Информация о пассажирах</h2>
                
                {passengers.map((passenger, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 mb-6 last:border-b-0 last:mb-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Пассажир {index + 1}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Имя
                        </label>
                        <input
                          type="text"
                          value={passenger.given_name}
                          onChange={(e) => handlePassengerUpdate(index, 'given_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Введите имя"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Фамилия
                        </label>
                        <input
                          type="text"
                          value={passenger.family_name}
                          onChange={(e) => handlePassengerUpdate(index, 'family_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Введите фамилию"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Пол
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerUpdate(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="M">Мужской</option>
                          <option value="F">Женский</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Дата рождения
                        </label>
                        <input
                          type="date"
                          value={passenger.born_on}
                          onChange={(e) => handlePassengerUpdate(index, 'born_on', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={passenger.email}
                          onChange={(e) => handlePassengerUpdate(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="example@email.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          value={passenger.phone_number}
                          onChange={(e) => handlePassengerUpdate(index, 'phone_number', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+7 (___) ___-__-__"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium text-lg transition-colors"
                  >
                    Продолжить
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Оплата билета</h2>
                
                {/* Payment method info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                    <h3 className="text-lg font-semibold text-blue-900">Безопасная оплата через Stripe</h3>
                  </div>
                  <p className="text-blue-700">
                    После оплаты через Stripe ваш билет будет автоматически приобретен и отправлен на email.
                  </p>
                </div>

                {/* Order Summary */}
                <div className="border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Итоговая стоимость</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Базовая стоимость билета:</span>
                      <span className="font-medium">
                        {flightData ? (parseFloat(flightData.total_amount) - 15).toFixed(2) : '0.00'} {flightData?.total_currency || 'EUR'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Наша комиссия:</span>
                      <span className="font-medium text-orange-600">€15.00</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-lg font-bold">
                      <span>Итого к оплате:</span>
                      <span className="text-xl">
                        {flightData?.total_amount || '0.00'} {flightData?.total_currency || 'EUR'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passenger Summary */}
                <div className="border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Пассажиры ({passengers.length})</h3>
                  <div className="space-y-2">
                    {passengers.map((passenger, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                          {index + 1}
                        </span>
                        <span>
                          {passenger.given_name} {passenger.family_name} ({passenger.email})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    ← Назад
                  </button>
                  
                  <button
                    onClick={createStripePayment}
                    disabled={isPaymentProcessing || !flightData}
                    className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isPaymentProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Создание платежа...
                      </>
                    ) : (
                      <>
                        💳 Оплатить {flightData?.total_amount || '0.00'} {flightData?.total_currency || 'EUR'}
                      </>
                    )}
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 text-center">
                    После успешной оплаты билет будет отправлен на указанный email адрес.
                    Процесс может занять несколько минут.
                  </p>
                </div>
              </div>
            )}

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl text-black shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Детали заказа</h3>
              
              {/* Flight Summary */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Рейс</div>
                {flightData ? (
                  <>
                    <div className="font-medium mb-2">
                      {flightData.departure.code} → {flightData.arrival.code}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {formatDate(flightData.departure.time)}, {passengers.length} пассажир{passengers.length > 1 ? 'а' : ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(flightData.departure.time)} - {formatTime(flightData.arrival.time)}
                    </div>
                    {flightData.airline && (
                      <div className="text-sm text-gray-500 mt-1">
                        {flightData.airline.name}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="font-medium">Загрузка данных рейса...</div>
                    <div className="text-sm text-gray-600">{passengers.length} пассажир{passengers.length > 1 ? 'а' : ''}</div>
                  </>
                )}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Билет (базовая цена)</span>
                  <span>
                    {flightData ? `${flightData.total_amount} ${flightData.total_currency}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-blue-600">
                  <span>Наша комиссия</span>
                  <span>€15.00</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого</span>
                  <span>
                    {flightData ? `${flightData.total_amount + 15} ${flightData.total_currency}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Загрузка страницы...</div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
} 