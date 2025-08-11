import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../lib/i18n';

interface Airline {
  logo_symbol_url: string;
  logo_lockup_url?: string;
  conditions_of_carriage_url: string;
  iata_code: string;
  name: string;
}

interface Segment {
  id: string;
  departing_at: string;
  arriving_at: string;
  duration: string;
  origin: {
    name: string;
  };
  destination: {
    name: string;
  };
  marketing_carrier: Airline;
}

interface Slice {
  segments: Segment[];
}

interface Passenger {
  id: string;
  type: string;
  baggages?: {
    type: 'cabin_bag' | 'checked_bag';
    quantity: number;
    weight?: number;
    weight_unit?: 'kg' | 'lb';
  }[];
}

interface Offer {
  id: string;
  total_amount: string;
  total_currency: string;
  slices: Slice[];
  passengers?: Passenger[];
}

type Currency = "EUR" | "USD"

interface TicketCardProps {
  offer: Offer;
  convertCurrency: (amount: number, currency: Currency) => string;
  formatDateTime: (date: string) => string;
  formatDuration: (duration: string) => string;
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const formatDateShort = (dateString: string, t: (key: string) => string): string => {
  const date = new Date(dateString);
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  const monthKey = monthNames[date.getMonth()];
  const dayKey = dayNames[date.getDay()];
  
  return `${date.getDate()} ${t(`calendar.shortMonths.${monthKey}`)}, ${t(`calendar.shortDays.${dayKey}`)}`;
};

const getAirportCode = (name: string): string => {
  const match = name.match(/\(([A-Z]{3})\)/);
  return match ? match[1] : name.substring(0, 3).toUpperCase();
};

// Helper function to check if offer has basic baggage included
const hasBasicBaggage = (offer: Offer): boolean => {
  if (!offer.passengers || offer.passengers.length === 0) {
    return false;
  }

  // Check if any passenger has cabin baggage allowance
  return offer.passengers.some(passenger => {
    if (!passenger.baggages) return false;
    
    return passenger.baggages.some(baggage => {
      return (
        baggage.type === 'cabin_bag' && 
        baggage.quantity > 0 && 
        baggage.weight && 
        baggage.weight >= 5 && // At least 5kg
        baggage.weight_unit === 'kg'
      );
    });
  });
};

const FlightSegment: React.FC<{
  segment: Segment;
  formatDuration: (duration: string) => string;
  t: (key: string) => string;
}> = ({ segment, formatDuration, t }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center space-x-4">
      <div>
        <div className="text-2xl font-normal text-gray-900">
          {formatTime(segment.departing_at)}
        </div>
        <div className="text-sm text-gray-600">
          {segment.origin.name.split(' ')[0]}
        </div>
        <div className="text-sm text-gray-600">
          {formatDateShort(segment.departing_at, t)}
        </div>
      </div>
    </div>

    {/* Flight Path */}
    <div className="flex-1 mx-10">
      <div className="text-center mb-2">
        <div className="text-sm text-gray-500">
          {t('ticketCard.flightTime')}: {formatDuration(segment.duration)}
        </div>
      </div>
      <div className="flex items-center">
        <div className="text-sm text-blue-500 font-medium">
          {getAirportCode(segment.origin.name)}
        </div>
        <div className="flex-1 mx-4 relative">
          <div className="h-px bg-gray-300"></div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-gray-400">✈</div>
          </div>
        </div>
        <div className="text-sm text-blue-500 font-medium">
          {getAirportCode(segment.destination.name)}
        </div>
      </div>
    </div>

    {/* Arrival Time and Location */}
    <div className="flex items-center space-x-4">
      <div>
        <div className="text-2xl font-normal text-gray-900 text-right">
          {formatTime(segment.arriving_at)}
        </div>
        <div className="text-sm text-gray-600 text-right">
            {segment.destination.name.split(' ')[0]}
        </div>
        <div className="text-sm text-gray-600 text-right">
          {formatDateShort(segment.arriving_at, t)}
        </div>
      </div>
    </div>
  </div>
);

const TicketCard: React.FC<TicketCardProps> = ({ 
  offer, 
  convertCurrency, 
  formatDuration 
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const showBaggageToggle = hasBasicBaggage(offer);
  
  const handleSelectTicket = () => {
    // Store flight details in localStorage for checkout page
    const flightData = {
      offer_id: offer.id,
      total_amount: offer.total_amount,
      total_currency: offer.total_currency,
      airline: offer.slices[0]?.segments[0]?.marketing_carrier,
      departure: {
        airport: offer.slices[0]?.segments[0]?.origin.name,
        code: getAirportCode(offer.slices[0]?.segments[0]?.origin.name || ''),
        time: offer.slices[0]?.segments[0]?.departing_at
      },
      arrival: {
        airport: offer.slices[offer.slices.length - 1]?.segments[offer.slices[offer.slices.length - 1].segments.length - 1]?.destination.name,
        code: getAirportCode(offer.slices[offer.slices.length - 1]?.segments[offer.slices[offer.slices.length - 1].segments.length - 1]?.destination.name || ''),
        time: offer.slices[offer.slices.length - 1]?.segments[offer.slices[offer.slices.length - 1].segments.length - 1]?.arriving_at
      },
      segments: offer.slices.flatMap(slice => slice.segments)
    };
    
    localStorage.setItem('selectedFlight', JSON.stringify(flightData));
    router.push(`/checkout?offer_id=${offer.id}`);
  };

  return (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl w-full p-6 mb-4">
    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div>
          <div className="text-3xl font-normal text-gray-900 mb-1">
            {convertCurrency(Number(offer.total_amount), offer.total_currency as Currency)}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={offer.slices[0]?.segments[0]?.marketing_carrier.logo_symbol_url || ''}
              alt={offer.slices[0]?.segments[0]?.marketing_carrier.name || ''}
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-lg text-gray-700">
            {offer.slices[0]?.segments[0]?.marketing_carrier.name}
          </div>
        </div>            
      </div>
      <div className="hidden md:flex items-center space-x-2">
        <button 
          onClick={handleSelectTicket}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-xl font-medium text-lg transition-colors duration-200"
        >
          {t('ticketCard.selectTicket')}
        </button>
      </div>
    </div>

    {/* Baggage Toggle - Only show when basic baggage is included */}
    {showBaggageToggle && (
      <div className="mb-6">
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 max-w-48">
          <span className="text-sm text-gray-700">{t('ticketCard.baggageIncluded')}</span>
          <div className="w-10 h-6 bg-blue-500 rounded-full relative">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
          </div>
        </div>
      </div>
    )}

    {/* Flight Segments */}
    <div className="space-y-4 mb-6">
      {offer.slices.map((slice, sliceIndex) => (
        <div key={sliceIndex}>
          {slice.segments.map((segment) => (
            <FlightSegment
              key={segment.id}
              segment={segment}
              formatDuration={formatDuration}
              t={t}
            />
          ))}
        </div>
      ))}
    </div>

    <div className="flex justify-center md:hidden">
      <button 
        onClick={handleSelectTicket}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-xl font-medium text-lg transition-colors duration-200"
      >
        {t('ticketCard.selectTicket')}
      </button>
    </div>

  </div>
  );
};

export default TicketCard;
