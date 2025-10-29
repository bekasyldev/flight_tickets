'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import TariffRulesModal from '../components/TariffRulesModal';
import DateInput from '../components/DateInput';
import { Offer, Airline, Segment } from '../types';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useTranslation } from '../lib/i18n';
import NotAvailable from '../components/NotAvailable';

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
  const { t } = useTranslation();
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);
  const [travelRequirementsAccepted, setTravelRequirementsAccepted] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isNotAvailable, setIsNotAvailable] = useState(true); 
  const [flightData, setFlightData] = useState<FlightData | null>(null);

  const handlePassengerUpdate = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  // Validation functions
  const validateName = (name: string): boolean => {
    return /^[A-Za-z\s]{2,}$/.test(name.trim()) && name.trim().length >= 2;
  };  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateAge = (birthDate: string): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
      ? age - 1 
      : age;
    
    return actualAge >= 18;
  };

  const isPassengerValid = (passenger: PassengerInfo): boolean => {
    return validateName(passenger.given_name) &&
           validateName(passenger.family_name) &&
           validateEmail(passenger.email) &&
           passenger.born_on.trim() !== '' &&
           validateAge(passenger.born_on) &&
           passenger.phone_number.trim() !== '';
  };

  const areAllPassengersValid = (): boolean => {
    return passengers.every(isPassengerValid);
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
          alert(t('checkout.errors.sessionExpired'));
          window.location.href = '/';
        }
      } catch (error) {
        console.error('❌ Session validation error:', error);
        alert(t('checkout.errors.sessionValidationError'));
        window.location.href = '/';
      }
    };

    validateSessionAndFetchData();
  }, [sessionToken, offerId, transformOfferToFlightData, t]);

  const createStripePayment = async () => {
    if (!sessionToken || !offerId || !flightData || !sessionValidated) {
      alert(t('checkout.errors.missingFlightData'));
      return;
    }

    if (!areAllPassengersValid()) {
      const hasUnderagePassenger = passengers.some(passenger => 
        passenger.born_on.trim() !== '' && !validateAge(passenger.born_on)
      );
      
      if (hasUnderagePassenger) {
        alert(t('checkout.errors.ageRequirement'));
        return;
      }
      
      alert(t('checkout.errors.fillAllFields'));
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
        const errorMessage = orderError.error || orderError.errors?.[0]?.message || 'Unknown error';
        if (errorMessage.includes('select another offer') || 
            errorMessage.includes('create a new offer request') || 
            errorMessage.includes('latest availability') ||
            orderError.errors?.[0]?.code === 'offer_no_longer_available') {
            setIsNotAvailable(true);
        } else {
          alert(`${t('checkout.errors.orderCreationError').replace('{error}', '')}: ${errorMessage}`);
        }
        
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
        alert(`${t('checkout.errors.paymentSessionError').replace('{error}', '')}: ${errorData.error || t('checkout.errors.paymentRejected')}`);
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : t('checkout.errors.paymentRejected');
      alert(`${t('checkout.errors.paymentProcessingError').replace('{error}', '')}: ${errorMessage}`);
      
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
      

      {isNotAvailable ? (
        <NotAvailable />
      ) : (
        <>
          <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 py-8">
            <div className="max-w-6xl mx-auto px-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {flightData ? 
                  `${t('checkout.title')} ${flightData.departure.code} → ${flightData.arrival.code}` :
                  t('checkout.title')
                }
              </h1>
            </div>
          </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            {/* Step 1: Passenger Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-black">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout.passengerInfo')}</h2>
                
                {passengers.map((passenger, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 mb-6 last:border-b-0 last:mb-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {t('checkout.passenger')} {index + 1}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('checkout.firstName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={passenger.given_name}
                          onChange={(e) => handlePassengerUpdate(index, 'given_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            passenger.given_name && !validateName(passenger.given_name) 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                          placeholder={t('checkout.placeholders.firstName')}
                        />
                        {passenger.given_name && !validateName(passenger.given_name) && (
                          <p className="text-red-500 text-xs mt-1">{t('checkout.validation.firstNameError')}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('checkout.lastName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={passenger.family_name}
                          onChange={(e) => handlePassengerUpdate(index, 'family_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            passenger.family_name && !validateName(passenger.family_name) 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                          placeholder={t('checkout.placeholders.lastName')}
                        />
                        {passenger.family_name && !validateName(passenger.family_name) && (
                          <p className="text-red-500 text-xs mt-1">{t('checkout.validation.lastNameError')}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('checkout.gender')}
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerUpdate(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="M">{t('checkout.male')}</option>
                          <option value="F">{t('checkout.female')}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('checkout.dateOfBirth')} <span className="text-red-500">*</span>
                        </label>
                        <DateInput
                          value={passenger.born_on}
                          onChange={(value) => handlePassengerUpdate(index, 'born_on', value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            passenger.born_on && !validateAge(passenger.born_on) 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                        {passenger.born_on && !validateAge(passenger.born_on) && (
                          <p className="text-red-500 text-xs mt-1">{t('checkout.errors.ageRequirement')}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('checkout.email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={passenger.email}
                          onChange={(e) => handlePassengerUpdate(index, 'email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            passenger.email && !validateEmail(passenger.email) 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                          placeholder={t('checkout.placeholders.email')}
                        />
                        {passenger.email && !validateEmail(passenger.email) && (
                          <p className="text-red-500 text-xs mt-1">{t('checkout.validation.emailError')}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('checkout.phone')} <span className="text-red-500">*</span>
                        </label>
                        <PhoneInput
                          defaultCountry="md"
                          value={passenger.phone_number}
                          onChange={(phone) => handlePassengerUpdate(index, 'phone_number', phone)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                                {/* Terms and Conditions */}
                <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.terms.ticketConditions.title')}</h3>
                  
                  {/* Terms Checkboxes */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms-agreement"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="terms-agreement" className="text-sm text-gray-700">
                        {t('checkout.terms.agreeToTerms')}{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsTariffModalOpen(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          {t('checkout.terms.tariffRules')}
                        </button>,{' '}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {t('checkout.terms.termsAndConditions')}
                        </a>,{' '}
                        <a
                          href="/rules-for-special-needs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {t('checkout.terms.rulesForSpecialNeeds')}
                        </a>.
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="data-processing"
                        checked={dataProcessingAccepted}
                        onChange={(e) => setDataProcessingAccepted(e.target.checked)}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="data-processing" className="text-sm text-gray-700">
                        {t('checkout.terms.dataProcessingConsent')}
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="travel-requirements"
                        checked={travelRequirementsAccepted}
                        onChange={(e) => setTravelRequirementsAccepted(e.target.checked)}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="travel-requirements" className="text-sm text-gray-700">
                        {t('checkout.terms.travelRequirements')}
                      </label>
                    </div>
                  </div>

                  {/* Important Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li>• {t('checkout.terms.ticketConditions.nonTransferable')}</li>
                      <li>• {t('checkout.terms.ticketConditions.priceIncludes')}</li>
                      <li>• {t('checkout.terms.ticketConditions.additionalServices')}</li>
                      <li>• {t('checkout.terms.ticketConditions.refunds')}</li>
                      <li>• {t('checkout.terms.ticketConditions.documentation')}</li>
                    </ul>
                  </div>

                  {/* Privacy Notice */}
                  <p className="text-xs text-gray-500 italic">
                    {t('checkout.terms.privacyNotice')}
                  </p>
                </div>
                
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!areAllPassengersValid() || !termsAccepted || !dataProcessingAccepted || !travelRequirementsAccepted}
                    className={`px-6 py-3 rounded-xl font-medium text-lg transition-colors ${
                      areAllPassengersValid() && termsAccepted && dataProcessingAccepted && travelRequirementsAccepted
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {t('checkout.continue')}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout.payment')}</h2>
                
                {/* Payment method info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                    <h3 className="text-lg font-semibold text-blue-900">{t('checkout.securePayment')}</h3>
                  </div>
                  <p className="text-blue-700">
                    {t('checkout.paymentDescription')}
                  </p>
                </div>

                {/* Order Summary */}
                <div className="border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.totalCost')}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('checkout.baseCost')}</span>
                      <span className="font-medium">
                        {flightData ? (parseFloat(flightData.total_amount) - 15).toFixed(2) : '0.00'} {flightData?.total_currency || 'EUR'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('checkout.ourCommission')}</span>
                      <span className="font-medium text-orange-600">€15.00</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-lg font-bold">
                      <span>{t('checkout.totalToPay')}</span>
                      <span className="text-xl">
                        {flightData?.total_amount || '0.00'} {flightData?.total_currency || 'EUR'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passenger Summary */}
                <div className="border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.passengers')} ({passengers.length})</h3>
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
                   {t('checkout.back')}
                  </button>
                  
                  <button
                    onClick={createStripePayment}
                    disabled={isPaymentProcessing || !flightData || !termsAccepted || !dataProcessingAccepted || !travelRequirementsAccepted}
                    className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isPaymentProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {t('checkout.creatingPayment')}...
                      </>
                    ) : (
                      <>
                        💳 {t('checkout.pay')} {flightData?.total_amount || '0.00'} {flightData?.total_currency || 'EUR'}
                      </>
                    )}
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 text-center">
                    {t('checkout.terms.paymentInfo')}
                  </p>
                </div>
              </div>
            )}

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl text-black shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.orderDetails')} </h3>
              
              {/* Flight Summary */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">{t('checkout.flight')}</div>
                {flightData ? (
                  <>
                    <div className="font-medium mb-2">
                      {flightData.departure.code} → {flightData.arrival.code}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {formatDate(flightData.departure.time)}, {passengers.length} {passengers.length > 1 ? t('passengers.passengers2') : t('passengers.passenger')}
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
                    <div className="font-medium">{t('checkout.loadingFlightData')}</div>
                    <div className="text-sm text-gray-600">{passengers.length} {passengers.length > 1 ? t('passengers.passengers2') : t('passengers.passenger')}</div>
                  </>
                )}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkout.ticketBasePrice')}</span>
                  <span>
                    {flightData ? `${flightData.total_amount} ${flightData.total_currency}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-blue-600">
                  <span>{t('checkout.ourCommission')}</span>
                  <span>€15.00</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('checkout.total')}</span>
                  <span>
                    {flightData ? `${(parseFloat(flightData.total_amount) + 15).toFixed(2)} ${flightData.total_currency}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tariff Rules Modal */}
      <TariffRulesModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        flightRoute={flightData ? `${flightData.departure.code} → ${flightData.arrival.code}` : undefined}
      />
    </div>
    </>)}
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