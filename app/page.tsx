'use client';

import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import BookingForm from './components/BookingForm';
import MobileBookingForm from './components/MobileBookingForm';
import CountryModal from './components/CountryModal';
import { convertCurrency } from './utils/currencyTransform';
import { Clock, Plane } from 'lucide-react';
import Image from 'next/image';

interface Airport {
  city_name: string;
  iata_code: string;
  iata_city_code: string;
  name: string;
  city: string | null;
  icao_code: string;
  iata_country_code: string;
  id: string;
  latitude: number;
  longitude: number;
  time_zone: string;
  type: 'airport';
}

interface Airline {
  logo_symbol_url: string;
  conditions_of_carriage_url: string;
  iata_code: string;
  name: string;
}

interface Aircraft {
  iata_code: string;
  name: string;
}

interface FlightSegment {
  id: string;
  origin: Airport;
  destination: Airport;
  origin_terminal: string;
  destination_terminal: string;
  departing_at: string;
  arriving_at: string;
  marketing_carrier: Airline;
  operating_carrier: Airline;
  marketing_carrier_flight_number: string;
  operating_carrier_flight_number: string;
  aircraft: Aircraft | null;
  duration: string;
  distance: string;
}

interface SliceConditions {
  priority_check_in: null | boolean;
  priority_boarding: null | boolean;
  advance_seat_selection: null | boolean;
}

interface OfferSlice {
  id: string;
  origin: Airport;
  destination: Airport;
  origin_type: string;
  destination_type: string;
  duration: string;
  conditions: SliceConditions;
  segments: FlightSegment[];
  fare_brand_name: string;
}

interface OfferConditions {
  refund_before_departure: {
    penalty_currency: string | null;
    penalty_amount: number | null;
    allowed: boolean;
  };
  change_before_departure: {
    penalty_currency: string | null;
    penalty_amount: number | null;
    allowed: boolean;
  };
}

interface PaymentRequirements {
  requires_instant_payment: boolean;
  price_guarantee_expires_at: string;
  payment_required_by: string;
}

interface FlightOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  tax_amount: string;
  tax_currency: string;
  base_amount: string;
  base_currency: string;
  total_emissions_kg: string;
  passenger_identity_documents_required: boolean;
  conditions: OfferConditions;
  slices: OfferSlice[];
  owner: Airline;
  live_mode: boolean;
  expires_at: string;
  payment_requirements: PaymentRequirements;
  created_at: string;
  updated_at: string;
  partial: boolean;
}

interface SearchFormData {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  tripType: 'one-way' | 'round-trip';
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
}

interface LocationSelection {
  countryName: string;
  airportCode: string;
  airportName: string;
}

export default function FlightSearch() {
  const [activeTab, setActiveTab] = useState('flights');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  const [formData, setFormData] = useState<SearchFormData>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    tripType: 'round-trip',
    passengers: 1,
    cabinClass: 'economy'
  });

  const [originSelection, setOriginSelection] = useState<LocationSelection | null>(null);
  const [destinationSelection, setDestinationSelection] = useState<LocationSelection | null>(null);

  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const searchFlights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search-flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data.data.offers);
      setOffers(data.data.offers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Flight search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      setError('Please select origin, destination, and departure date');
      return;
    }
    if (formData.tripType === 'round-trip' && !formData.returnDate) {
      setError('Please select a return date for round-trip flights');
      return;
    }
    searchFlights();
  };

  const handleOriginSelect = (countryName: string, airportCode: string, airportName: string) => {
    setOriginSelection({ countryName, airportCode, airportName });
    setFormData({ ...formData, origin: airportCode });
  };

  const handleDestinationSelect = (countryName: string, airportCode: string, airportName: string) => {
    setDestinationSelection({ countryName, airportCode, airportName });
    setFormData({ ...formData, destination: airportCode });
  };



  // flight tickets format
  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    
    if (hours && minutes) {
      return `${hours}ч ${minutes}м`;
    } else if (hours) {
      return `${hours}ч`;
    } else {
      return `${minutes}м`;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const day = date.toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'short'
    });
    return { time, day };
  };

    // const formatDateTime = (dateTimeString: string) => {
  //   const date = new Date(dateTimeString);
  //   const pad = (n: number) => n.toString().padStart(2, '0');
  //   return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  // };

  // const formatDuration = (duration: string) => {
  //   // Convert ISO 8601 duration to readable format
  //   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  //   if (!match) return duration;
  //   const hours = match[1] ? `${match[1]}h` : '';
  //   const minutes = match[2] ? `${match[2]}m` : '';
  //   return `${hours} ${minutes}`.trim();
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700">
      {!isMobile && <Header />}
      
      <main className="flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Тут покупают дешёвые авиабилеты
          </h1>
          <div className="max-w-sm mx-auto">
            {!isMobile && (
              <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
            )}
          </div>
          
          {isMobile && (
            <div className="mb-8">
              <div className="bg-white/20 backdrop-blur rounded-full px-6 py-3 inline-block">
                <span className="text-white font-medium">Авиабилеты</span>
              </div>
            </div>
          )}
        </div>

        {isMobile ? 
          <MobileBookingForm 
            formData={formData}
            setFormData={setFormData}
            originSelection={originSelection}
            destinationSelection={destinationSelection}
            onOriginClick={() => setIsOriginModalOpen(true)}
            onDestinationClick={() => setIsDestinationModalOpen(true)}
            onSubmit={handleSubmit}
            loading={loading}
          /> : 
          <BookingForm 
            formData={formData}
            setFormData={setFormData}
            originSelection={originSelection}
            destinationSelection={destinationSelection}
            onOriginClick={() => setIsOriginModalOpen(true)}
            onDestinationClick={() => setIsDestinationModalOpen(true)}
            onSubmit={handleSubmit}
            loading={loading}
          />
        }

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 mt-6 max-w-6xl w-full">
            <strong>Error:</strong> {error}
          </div>
        )}

{offers.length > 0 && (
        <div className="space-y-4 mt-8 max-w-6xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Найдено билетов: {offers.length}
            </h2>
            <div className="text-white/80 text-sm">
              Цены указаны за одного пассажира
            </div>
          </div>

          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {offer.slices.map((slice, sliceIndex) => (
                <div key={sliceIndex} className="p-6">
                  {slice.segments.map((segment) => (
                    <div key={segment.id} className="flex flex-col">
                      {/* Flight Route */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Departure */}
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            {formatDateTime(segment.departing_at).time}
                          </div>
                          <div className="text-lg font-semibold text-gray-700 mb-1">
                            {segment.origin.iata_code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(segment.departing_at).day}
                          </div>
                        </div>

                        {/* Flight Info */}
                        <div className="flex-2 mx-8 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(segment.duration)}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-center mb-2">
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent flex-1"></div>
                            <div className="mx-4 bg-blue-600 rounded-full p-2">
                              <Plane className="w-4 h-4 text-white" />
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent flex-1"></div>
                          </div>
                          
                          <div className="text-sm font-medium text-gray-700">
                            {segment.marketing_carrier.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {segment.marketing_carrier.iata_code}
                          </div>
                        </div>

                        {/* Arrival */}
                        <div className="flex-1 text-right">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            {formatDateTime(segment.arriving_at).time}
                          </div>
                          <div className="text-lg font-semibold text-gray-700 mb-1">
                            {segment.destination.iata_code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(segment.arriving_at).day}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {formatDateTime(segment.departing_at).time}
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                              {segment.origin.iata_code}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDateTime(segment.departing_at).day}
                            </div>
                          </div>
                          
                          <div className="flex-1 text-center mx-4">
                            <div className="flex items-center justify-center mb-1">
                              <Plane className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDuration(segment.duration)}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              {segment.marketing_carrier.iata_code}
                            </div>
                            <div className="flex items-center justify-center my-1">
                              <div className="h-px bg-gray-400 flex-1"></div>
                              <div className="mx-2">
                                <Image 
                                  src={segment.marketing_carrier.logo_symbol_url} 
                                  alt={segment.marketing_carrier.name}
                                  width={24}
                                  height={24}
                                  className="h-6 w-6"
                                />
                              </div>
                              <div className="h-px bg-gray-400 flex-1"></div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {formatDateTime(segment.arriving_at).time}
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                              {segment.destination.iata_code}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDateTime(segment.arriving_at).day}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100">
                        <div className="mb-3 sm:mb-0">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {convertCurrency(Number(offer.total_amount), offer.total_currency as "USD" || "EUR")}
                          </div>
                          <div className="text-sm text-gray-500">
                            за пассажира
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg">
                            Выбрать
                          </button>
                          <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-colors">
                            Подробнее
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* Load More Button */}
          <div className="text-center pt-6">
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors backdrop-blur-sm border border-white/20">
              Показать ещё билеты
            </button>
          </div>
        </div>
      )}


        {/* No Results */}
        {!loading && offers.length === 0 && formData.origin && (
          <div className="text-center py-12">
            <div className="text-white text-lg">
              По вашему запросу не найдено ни одного билета.
            </div>
            <div className="text-white/80 text-sm mt-2">
              Попробуйте изменить параметры поиска.
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CountryModal
        isOpen={isOriginModalOpen}
        onClose={() => setIsOriginModalOpen(false)}
        onSelect={handleOriginSelect}
        title="Select Departure Country"
      />

      <CountryModal
        isOpen={isDestinationModalOpen}
        onClose={() => setIsDestinationModalOpen(false)}
        onSelect={handleDestinationSelect}
        title="Select Destination Country"
      />
    </div>
  );
}
