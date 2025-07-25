import React, { useState } from 'react';
import TicketCard from './TicketCard';
import TicketFilters from './TicketFilters';

type Currency = "EUR" | "USD"

interface TicketsProps {
    offers: Offer[];
    convertCurrency: (amount: number, currency: Currency) => string;
    formatDateTime: (date: string) => string;
    formatDuration: (duration: string) => string;
}

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

interface Offer {
    id: string;
    total_amount: string;
    total_currency: string;
    slices: Slice[];
}

const isNightTransfer = (segment: Segment) => {
  const arrivalTime = new Date(segment.arriving_at);
  const departureTime = new Date(segment.departing_at);
  const hours = arrivalTime.getHours();
  return hours >= 0 && hours < 6;
};

const Tickets: React.FC<TicketsProps> = ({ 
  offers, 
  convertCurrency, 
  formatDateTime, 
  formatDuration 
}) => {
  const [filters, setFilters] = useState({
    noStops: false,
    maxOneStop: false,
    maxTwoStops: false,
    excludeNightTransfers: false,
  });

  const handleFilterChange = (filterName: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const filteredOffers = offers.filter(offer => {
    // Get maximum number of segments in any slice
    const maxSegments = Math.max(...offer.slices.map(slice => slice.segments.length));
    
    // Check if any segment has a night transfer
    const hasNightTransfer = offer.slices.some(slice => 
      slice.segments.some(segment => isNightTransfer(segment))
    );

    // Apply filters
    if (filters.noStops && maxSegments > 1) return false;
    if (filters.maxOneStop && maxSegments > 2) return false;
    if (filters.maxTwoStops && maxSegments > 3) return false;
    if (filters.excludeNightTransfers && hasNightTransfer) return false;

    return true;
  });

  return (
      <div className="w-full flex flex-col lg:flex-row justify-center items-start gap-4 lg:gap-6 px-4 lg:px-0">
      <div className="w-full lg:w-auto lg:sticky lg:top-24">
        <TicketFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
      <div className="space-y-0 flex flex-col items-center w-full max-w-2xl">
        {filteredOffers.slice(0, 10).map((offer) => (
          <TicketCard
            key={offer.id}
            offer={offer}
            convertCurrency={convertCurrency}
            formatDateTime={formatDateTime}
            formatDuration={formatDuration}
          />
        ))}
        {filteredOffers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Билеты не найдены</p>
            <p className="text-gray-400 mt-2">Попробуйте изменить параметры фильтрации</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;