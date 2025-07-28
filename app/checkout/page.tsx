'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import DuffelAncillaries from '../components/DuffelAncillaries';
import DuffelCardForm from '../components/DuffelCardForm';

interface PassengerInfo {
  given_name: string;
  family_name: string;
  gender: 'M' | 'F';
  title: string;
  born_on: string;
  email: string;
  phone_number: string;
}

interface Airline {
  name: string;
  iata_code: string;
  logo_symbol_url: string;
}

interface Segment {
  id: string;
  departing_at: string;
  arriving_at: string;
  duration: string;
  origin: { name: string };
  destination: { name: string };
  marketing_carrier: Airline;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get('offer_id');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Passenger information state
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

  // Payment state
  // const [paymentStep, setPaymentStep] = useState<'ancillaries' | 'payment' | 'confirmation'>('ancillaries');
  const [selectedServices, setSelectedServices] = useState<{ id: string; quantity: number }[]>([]);
  
  // Duffel state
  const [clientKey, setClientKey] = useState<string>('');
  const [, setCardData] = useState<{
    id: string;
    last_four_digits: string;
    brand: string;
    cardholder_name: string;
  } | null>(null);
  const [, setIsPaymentProcessing] = useState(false);
  
  // Flight data state
  const [flightData, setFlightData] = useState<{
    offer_id: string;
    total_amount: string;
    total_currency: string;
    airline: Airline;
    departure: { airport: string; code: string; time: string };
    arrival: { airport: string; code: string; time: string };
    segments: Segment[];
  } | null>(null);

  const handlePassengerUpdate = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const addPassenger = () => {
    setPassengers([...passengers, {
      given_name: '',
      family_name: '',
      gender: 'M',
      title: 'mr',
      born_on: '',
      email: '',
      phone_number: ''
    }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  // Load flight data and fetch client key when component mounts
  useEffect(() => {
    // Load flight data from localStorage
    const storedFlightData = localStorage.getItem('selectedFlight');
    if (storedFlightData) {
      try {
        const parsedData = JSON.parse(storedFlightData);
        setFlightData(parsedData);
      } catch (error) {
        console.error('Failed to parse flight data:', error);
      }
    }

    const fetchClientKey = async () => {
      try {
        const response = await fetch('/api/duffel/client-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: offerId })
        });
        
        if (response.ok) {
          const data = await response.json();
          setClientKey(data.client_key);
        }
      } catch (error) {
        console.error('Failed to fetch client key:', error);
      }
    };

    // Only fetch client key if we have an offerId
    if (offerId) {
      fetchClientKey();
    }
  }, [offerId]);

  // Handle ancillaries payload
  const handleAncillariesPayload = (payload: { data: { passengers: PassengerInfo[]; services: { id: string; quantity: number }[] } }) => {
    setSelectedServices(payload.data.services);
    console.log('Ancillaries payload:', payload);
  };

  // Handle card form events
  const handleCardValidateSuccess = () => {
    console.log('Card validation successful');
  };

  const handleCardForTemporaryUseSuccess = (card: { id: string; last_four_digits: string; brand: string; cardholder_name: string }) => {
    setCardData(card);
    console.log('Card created for temporary use:', card);
    // Here you would proceed with 3D Secure and payment
    processPayment(card.id);
  };

  const handleCardError = (error: object) => {
    console.error('Card form error:', error);
    setIsPaymentProcessing(false);
  };

  const processPayment = async (cardId: string) => {
    setIsPaymentProcessing(true);
    
    try {
      // Simulate different payment decline scenarios based on cardholder name
      const cardholderName = passengers[0]?.given_name || 'Unknown';

      // Test scenarios for payment declines
      const simulatePaymentDecline = (name: string) => {
        const declineScenarios: { [key: string]: { success: boolean; reason: string } } = {
          'Declined': { 
            success: false, 
            reason: 'Card payment declined by issuer' 
          },
          'Insufficient': { 
            success: false, 
            reason: 'Insufficient funds' 
          },
          'Fraud': { 
            success: false, 
            reason: 'Suspected fraudulent activity' 
          }
        };

        return declineScenarios[name] || { success: true, reason: 'Payment successful' };
      };

      const paymentResult = simulatePaymentDecline(cardholderName);

      if (paymentResult.success) {
        // Simulate successful payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert('Оплата прошла успешно! 💳');
        
        // Here you would typically:
        // 1. Create the order
        // 2. Send confirmation email
        // 3. Redirect to confirmation page
      } else {
        // Payment declined scenarios
        throw new Error(paymentResult.reason);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Different error handling based on decline reason
      const errorMessage = error instanceof Error ? error.message : 'Платеж отклонен';
      
      switch (errorMessage) {
        case 'Insufficient funds':
          alert('❌ Недостаточно средств. Пожалуйста, используйте другую карту.');
          break;
        case 'Suspected fraudulent activity':
          alert('❌ Подозрение на мошенничество. Свяжитесь с вашим банком.');
          break;
        default:
          alert('❌ Платеж отклонен. Пожалуйста, попробуйте другую карту.');
      }
      
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

  const convertCurrency = (amount: string, currency: string): string => {
    const numAmount = parseFloat(amount);
    if (currency === 'USD') {
      return `$${numAmount.toLocaleString()}`;
    }
    return `${(numAmount * 500).toLocaleString()} ₸`; // Example conversion rate
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
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-6">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-white' : 'text-blue-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'} mr-2`}>
                1
              </div>
              <span className="text-sm font-medium">Пассажиры</span>
            </div>
            
            <div className="w-8 h-px bg-blue-300"></div>
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-white' : 'text-blue-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'} mr-2`}>
                2
              </div>
              <span className="text-sm font-medium">Услуги</span>
            </div>
            
            <div className="w-8 h-px bg-blue-300"></div>
            
            <div className={`flex items-center ${currentStep >= 3 ? 'text-white' : 'text-blue-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'} mr-2`}>
                3
              </div>
              <span className="text-sm font-medium">Оплата</span>
            </div>
          </div>
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
                      {passengers.length > 1 && (
                        <button
                          onClick={() => removePassenger(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Удалить
                        </button>
                      )}
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
                
                <button
                  onClick={addPassenger}
                  className="text-blue-600 hover:text-blue-700 font-medium mb-6"
                >
                  + Добавить пассажира
                </button>
                
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

            {/* Step 2: Ancillaries (Services) */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Дополнительные услуги</h2>
                
                {/* Duffel Ancillaries Component */}
                <div className="mb-6">
                  {clientKey && offerId ? (
                    <DuffelAncillaries
                      clientKey={clientKey}
                      offerId={offerId}
                      passengers={passengers}
                      onPayloadReady={handleAncillariesPayload}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Загрузка дополнительных услуг...
                      <br />
                      <small>Получение ключа клиента Duffel</small>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium text-lg transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium text-lg transition-colors"
                  >
                    Продолжить
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Оплата</h2>
                
                {/* Duffel Card Form Component */}
                <div className="mb-6">
                  {clientKey ? (
                    <DuffelCardForm
                      clientKey={clientKey}
                      intent="to-create-card-for-temporary-use"
                      onValidateSuccess={handleCardValidateSuccess}
                      onValidateFailure={handleCardError}
                      onCreateCardForTemporaryUseSuccess={handleCardForTemporaryUseSuccess}
                      onCreateCardForTemporaryUseFailure={handleCardError}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Загрузка формы оплаты...
                      <br />
                      <small>Получение ключа клиента Duffel</small>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium text-lg transition-colors"
                  >
                    Назад
                  </button>
                </div>
              </div>
            )}
          </div>

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
                  <span className="text-gray-600">Билет</span>
                  <span>
                    {flightData ? convertCurrency(flightData.total_amount, flightData.total_currency) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Сборы</span>
                  <span>0 ₸</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Дополнительные услуги</span>
                  <span>
                    {selectedServices.length > 0 ? 
                      `${selectedServices.length} услуг` : '0 ₸'
                    }
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого</span>
                  <span>
                    {flightData ? convertCurrency(flightData.total_amount, flightData.total_currency) : '—'}
                  </span>
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