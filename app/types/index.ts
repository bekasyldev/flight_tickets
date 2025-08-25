export interface Passenger {
    type: 'adult' | 'child' | 'infant_without_seat';
    age?: number;
}

export interface Slice {
    origin: string;
    destination: string;
    departure_date: string;
}

export interface SearchFlightRequest {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    tripType: 'one-way' | 'round-trip';
    passengers: number;
    cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
    // Pagination parameters
    offerRequestId?: string; // For getting specific offer request with pagination
    limit?: number;
    after?: string;
    before?: string;
}

// Response Types
export interface Airport {
    city: string | null;
    city_name: string;
    iata_city_code: string;
    iata_code: string;
    iata_country_code: string;
    icao_code: string;
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    time_zone: string;
    type: 'airport';
}

export interface Airline {
    logo_symbol_url: string;
    conditions_of_carriage_url: string;
    iata_code: string;
    name: string;
}

export interface Aircraft {
    iata_code: string;
    name: string;
}

export interface PassengerInfo {
    id: string;
    given_name: string;
    family_name: string;
    loyalty_programme_accounts: string[];
    born_on: string;
}

export interface Media {
    uri: string;
    type: string;
    description: string;
}

export interface Stop {
    airport: Airport;
    arrival_at: string;
    departure_at: string;
    duration: string;
}

export interface Segment {
    aircraft: Aircraft | null;
    arriving_at: string;
    departing_at: string;
    destination: Airport;
    destination_terminal: string;
    distance: string;
    duration: string;
    id: string;
    marketing_carrier: Airline;
    marketing_carrier_flight_number: string;
    media: Media[];
    operating_carrier: Airline;
    operating_carrier_flight_number: string;
    origin: Airport;
    origin_terminal: string;
    passengers: PassengerInfo[];
    stops: Stop[];
}

export interface SliceConditions {
    priority_check_in: null | boolean;
    priority_boarding: null | boolean;
    advance_seat_selection: null | boolean;
}

export interface OfferSlice {
    comparison_key: string;
    ngs_shelf: number;
    destination_type: string;
    conditions: SliceConditions;
    destination: Airport;
    duration: string;
    fare_brand_name: string;
    id: string;
    origin: Airport;
    origin_type: string;
    segments: Segment[];
}

export interface PaymentRequirements {
    requires_instant_payment: boolean;
    price_guarantee_expires_at: string;
    payment_required_by: string;
}

export interface OfferConditions {
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

export interface LoyaltyProgramme {
    airline_iata_code: string;
    name: string;
}

export interface AvailableService {
    id: string;
    type: string;
    total_amount: string;
    total_currency: string;
}

export interface Offer {
    total_emissions_kg: string;
    passenger_identity_documents_required: boolean;
    tax_currency: string;
    available_services: AvailableService[] | null;
    base_amount: string;
    base_currency: string;
    conditions: OfferConditions;
    created_at: string;
    expires_at: string;
    id: string;
    live_mode: boolean;
    owner: Airline;
    partial: boolean;
    passengers: PassengerInfo[];
    payment_requirements: PaymentRequirements;
    private_fares: Array<{
        corporate_code: string;
        tracking_reference: string;
    }>;
    slices: OfferSlice[];
    supported_loyalty_programmes: LoyaltyProgramme[];
    supported_passenger_identity_document_types: string[];
    tax_amount: string;
    total_amount: string;
    total_currency: string;
    updated_at: string;
}

export interface DuffelAPIResponse {
    data: {
        offers: Offer[];
    };
    meta?: {
        limit: number;
        before: string | null;
        after: string | null;
    };
    errors?: Array<{
        code: string;
        message: string;
        documentation_url?: string;
    }>;
}