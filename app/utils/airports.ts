// Airport search utilities and types

export interface Airport {
    id: string;
    iata_code: string;
    icao_code: string;

    name: string;
    city_name: string;
    country: {
        name: string;
        iso_code: string;
    };
    iata_country_code: string;
    latitude: number;
    longitude: number;
    time_zone: string;
}

export interface AirportSearchResponse {
    data: Airport[];
    meta: {
        count: number;
        limit: number;
        offset: number;
    };
}

/**
 * Search for airports using the backend API
 * @param query - Search query (airport name, city, or IATA code)
 * @returns Promise with airport search results
 */
export async function searchAirports(query: string): Promise<Airport[]> {
    try {
        const response = await fetch(`/api/airports?query=${encodeURIComponent(query)}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to search airports');
        }

        const data: AirportSearchResponse = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Airport search error:', error);
        throw error;
    }
}

/**
 * Get all airports (without search query)
 * @returns Promise with all airports
 */
export async function getAllAirports(): Promise<Airport[]> {
    try {
        const response = await fetch('/api/airports');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch airports');
        }

        const data: AirportSearchResponse = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Fetch airports error:', error);
        throw error;
    }
}
