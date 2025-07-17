'use client';

import { useState } from 'react';
import Link from 'next/link';

// Types based on Duffel API documentation
interface FlightSegment {
  id: string;
  origin: {
    iata_code: string;
    name: string;
  };
  destination: {
    iata_code: string;
    name: string;
  };
  departing_at: string;
  arriving_at: string;
  airline: {
    name: string;
    iata_code: string;
  };
  aircraft: {
    name: string;
  };
  duration: string;
}

interface FlightOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  slices: Array<{
    segments: FlightSegment[];
  }>;
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

export default function FlightSearch() {
  const [formData, setFormData] = useState<SearchFormData>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    tripType: 'round-trip',
    passengers: 1,
    cabinClass: 'economy'
  });

  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setOffers(data.data.offers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Flight search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.tripType === 'round-trip' && !formData.returnDate) {
      setError('Please select a return date for round-trip flights');
      return;
    }
    searchFlights();
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration: string) => {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return duration;
    const hours = match[1] ? `${match[1]}h` : '';
    const minutes = match[2] ? `${match[2]}m` : '';
    return `${hours} ${minutes}`.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ✈️ Flight Search
            </h1>
            <p className="text-gray-600">
              Search flights powered by Duffel API
            </p>
            <div className="mt-4">
              <Link 
                href="/airports" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Browse Airports →
              </Link>
            </div>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-black">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trip Type */}
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    value="round-trip"
                    checked={formData.tripType === 'round-trip'}
                    onChange={(e) => setFormData({...formData, tripType: e.target.value as 'round-trip'})}
                    className="mr-2"
                  />
                  Round Trip
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    value="one-way"
                    checked={formData.tripType === 'one-way'}
                    onChange={(e) => setFormData({...formData, tripType: e.target.value as 'one-way'})}
                    className="mr-2"
                  />
                  One Way
                </label>
              </div>

              {/* Origin and Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From (Airport Code)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., JFK, LHR, NYC"
                    value={formData.origin}
                    onChange={(e) => setFormData({...formData, origin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To (Airport Code)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., ATL, BCN, LAX"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {formData.tripType === 'round-trip' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      min={formData.departureDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.tripType === 'round-trip'}
                    />
                  </div>
                )}
              </div>

              {/* Passengers and Cabin Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passengers
                  </label>
                  <select
                    value={formData.passengers}
                    onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cabin Class
                  </label>
                  <select
                    value={formData.cabinClass}
                    onChange={(e) => setFormData({...formData, cabinClass: e.target.value as 'economy' | 'premium_economy' | 'business' | 'first'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="economy">Economy</option>
                    <option value="premium_economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  'Search Flights'
                )}
              </button>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}



          {/* Results */}
          {offers.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Flight Results ({offers.length} found)
              </h2>
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      {offer.total_currency} {offer.total_amount}
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                      Select Flight
                    </button>
                  </div>

                  {offer.slices.map((slice, sliceIndex) => (
                    <div key={sliceIndex} className="mb-4 last:mb-0">
                      <div className="text-sm font-medium text-gray-500 mb-2">
                        {sliceIndex === 0 ? 'Outbound' : 'Return'} Journey
                      </div>
                      {slice.segments.map((segment) => (
                        <div key={segment.id} className="flex text-black items-center justify-between p-4 bg-gray-50 rounded-lg mb-2 last:mb-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="font-bold text-lg">
                                  {formatDateTime(segment.departing_at)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {segment.origin.iata_code}
                                </div>
                                <div className="text-xs text-gray-500">
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
                                <div className="text-xs text-black">
                                  {segment.airline?.name || 'Unknown Airline'}
                                  {' • '}
                                  {segment.aircraft?.name || 'Unknown Aircraft'}
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <div className="font-bold text-lg">
                                  {formatDateTime(segment.arriving_at)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {segment.destination.iata_code}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {segment.destination.name}
                                </div>
                              </div>
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
        </div>
      </div>
    </div>
  );
}
