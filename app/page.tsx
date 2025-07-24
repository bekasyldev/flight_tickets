'use client';

import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import BookingForm from './components/BookingForm';
import MobileBookingForm from './components/MobileBookingForm';
import CountryModal from './components/CountryModal';
import { convertCurrency } from './utils/currencyTransform';

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

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}.${pad(date.getMonth() + 1)}`;
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
    <div className="min-h-screen bg-white">
      {!isMobile && <Header />}
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 pb-8">
        <main className="flex flex-col items-center justify-center px-4 pt-12">
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
        </main>
      </div>
      <main className="flex flex-col items-center justify-center px-4 bg-[#edeff2] py-12">

        {/* Results */}
        {offers.length > 0 && (
          <div className="space-y-4 mt-8 flex flex-col items-center w-full">
            {/* <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Flight Results ({offers.length} found)
            </h2> */}
            {offers.slice(0, 10).map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl max-w-2xl w-full shadow-lg p-4 sm:p-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="text-lg sm:text-xl font-semibold text-black">
                    {convertCurrency(Number(offer.total_amount), offer.total_currency as "EUR" | "USD")}
                  </div>
                  <button className="bg-orange-500 text-white px-4 py-2 sm:px-6 rounded-md hover:bg-orange-600 w-full sm:w-auto">
                    Выбрать билет
                  </button>
                </div>

                {offer.slices.map((slice, sliceIndex) => (
                  <div key={sliceIndex} className="mb-4 last:mb-0">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      {sliceIndex === 0 ? 'Outbound' : 'Return'} Journey
                    </div>
                    {slice.segments.map((segment) => (
                      <div key={segment.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg mb-2 last:mb-0">
                        <div className="text-black">
                          {/* Mobile layout: departure and arrival on same line */}
                          <div className="flex justify-between items-start mb-2 sm:hidden">
                            <div>
                              <div className="font-bold text-base">
                                {formatDateTime(segment.departing_at)}
                              </div>
                            </div>
                            <div className="text-center px-4">
                              <div className="text-xs text-gray-600">✈️ {formatDuration(segment.duration)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-base">
                                {formatDateTime(segment.arriving_at)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Desktop layout: horizontal with center divider */}
                          <div className="hidden sm:flex items-center space-x-4">
                            <div className="text-center">
                              <div className="font-bold text-lg">
                                {formatDateTime(segment.departing_at)}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-24">
                                {segment.origin.name}
                              </div>
                            </div>
                            
                            <div className="flex-1 text-center">
                              <div className="text-sm text-gray-600">
                                {formatDuration(segment.duration)}
                              </div>
                              <div className="flex items-center justify-center my-1">
                                <div className="h-px bg-gray-400 flex-1"></div>
                                <div className="mx-2">✈️</div>
                                <div className="h-px bg-gray-400 flex-1"></div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-bold text-lg">
                                {formatDateTime(segment.arriving_at)}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-24">
                                {segment.destination.name}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 text-center mt-1 sm:hidden">
                            {(() => {
                              const dep = new Date(segment.departing_at);
                              const arr = new Date(segment.arriving_at);
                              const pad = (n: number) => n.toString().padStart(2, '0');
                              const depTime = `${pad(dep.getHours())}:${pad(dep.getMinutes())}`;
                              const arrTime = `${pad(arr.getHours())}:${pad(arr.getMinutes())}`;
                              return `${depTime} - ${arrTime}`;
                            })()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && offers.length === 0 && formData.origin && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No flights found for your search criteria.
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Try adjusting your search parameters.
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
