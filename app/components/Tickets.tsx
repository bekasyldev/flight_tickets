import TicketCard from './TicketCard';

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

const Tickets: React.FC<TicketsProps> = ({ 
  offers, 
  convertCurrency, 
  formatDateTime, 
  formatDuration 
}) => (
  <div className="space-y-0 mt-8 flex flex-col items-center w-full px-4">
    {offers.slice(0, 10).map((offer) => (
      <TicketCard
        offer={offer}
        key={offer.id}
        convertCurrency={convertCurrency}
        formatDateTime={formatDateTime}
        formatDuration={formatDuration}
      />
    ))}
  </div>
);

export default Tickets;