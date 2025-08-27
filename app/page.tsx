'use client';

import React, { useState } from 'react';
import Header from './components/Header';
import BookingForm from './components/BookingForm';
import MobileBookingForm from './components/MobileBookingForm';
import CountryModal from './components/CountryModal';
import { convertCurrency } from './utils/currencyTransform';
import Tickets from './components/Tickets';
import { useTranslation } from './lib/i18n';

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
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

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
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial mobile state
    handleResize();
    
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
      setOffers(data.offers || []);
      setSessionToken(data.session_token || null); 
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
      formData.tripType = 'one-way';
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
      return `${hours}${t('time.hours')} ${minutes}${t('time.minutes')}`;
    } else if (hours) {
      return `${hours}${t('time.hours')}`;
    } else {
      return `${minutes}${t('time.minutes')}`;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthKey = monthNames[date.getMonth()];
    return `${pad(date.getHours())}:${pad(date.getMinutes())} ${date.getDate()} ${t(`calendar.shortMonths.${monthKey}`)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 pb-8">
        <main className="flex flex-col items-center justify-center px-4 pt-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              {t('mainPage.title')}
            </h1>
   
            {isMobile && (
              <div className="mb-8">
                <div className="bg-white/20 backdrop-blur rounded-full px-6 py-3 inline-block">
                  <span className="text-white font-medium">{t('mainPage.flights')}</span>
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
          <Tickets
            offers={offers}
            sessionToken={sessionToken}
            convertCurrency={convertCurrency}
            formatDateTime={formatDateTime}
            formatDuration={formatDuration}
          />
        )}

        {/* No Results */}
        {!loading && offers.length === 0 && formData.origin && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {t('mainPage.noFlights')}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {t('mainPage.adjustSearch')}
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
