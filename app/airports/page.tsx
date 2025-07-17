'use client';

import { useState } from 'react';
import Link from 'next/link';

import { searchAirports, getAllAirports, Airport } from '../utils/airports';

const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  FR: 'France',
  DE: 'Germany',
  ES: 'Spain',
  IT: 'Italy',
  CA: 'Canada',
  AU: 'Australia',
  CN: 'China',
  JP: 'Japan',
  RU: 'Russia',
  IN: 'India',
  BR: 'Brazil',
  MX: 'Mexico',
  KR: 'South Korea',
  TR: 'Turkey',
  SA: 'Saudi Arabia',
  ZA: 'South Africa',
  AR: 'Argentina',
  ID: 'Indonesia',
  NL: 'Netherlands',
  SE: 'Sweden',
  CH: 'Switzerland',
  BE: 'Belgium',
  PL: 'Poland',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  NZ: 'New Zealand',
  IE: 'Ireland',
  IL: 'Israel',
  AE: 'United Arab Emirates',
  TH: 'Thailand',
  MY: 'Malaysia',
  PH: 'Philippines',
  NG: 'Nigeria',
  EG: 'Egypt',
  KE: 'Kenya',
  CO: 'Colombia',
  CL: 'Chile',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  VN: 'Vietnam',
  CZ: 'Czech Republic',
  AT: 'Austria',
  GR: 'Greece',
  PT: 'Portugal',
  SG: 'Singapore',
  HU: 'Hungary',
  RO: 'Romania',
  PE: 'Peru',
  UA: 'Ukraine',
  QA: 'Qatar',
  MA: 'Morocco',
  KZ: 'Kazakhstan',
  KW: 'Kuwait',
  DZ: 'Algeria',
  SK: 'Slovakia',
  BG: 'Bulgaria',
  HR: 'Croatia',
  SI: 'Slovenia',
  RS: 'Serbia',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  LU: 'Luxembourg',
  IS: 'Iceland',
  CY: 'Cyprus',
  GE: 'Georgia',
  OM: 'Oman',
  JO: 'Jordan',
  LK: 'Sri Lanka',
  MM: 'Myanmar',
  KH: 'Cambodia',
  NP: 'Nepal',
  GH: 'Ghana',
  TZ: 'Tanzania',
  UG: 'Uganda',
  ET: 'Ethiopia',
  SN: 'Senegal',
  CI: 'Ivory Coast',
  TN: 'Tunisia',
  BY: 'Belarus',
  MD: 'Moldova',
  AL: 'Albania',
  MK: 'North Macedonia',
  BO: 'Bolivia',
  UY: 'Uruguay',
  EC: 'Ecuador',
  CR: 'Costa Rica',
  PA: 'Panama',
  GT: 'Guatemala',
  SV: 'El Salvador',
  DO: 'Dominican Republic',
  JM: 'Jamaica',
  TT: 'Trinidad and Tobago',
  BH: 'Bahrain',
  AZ: 'Azerbaijan',
  AM: 'Armenia',
  UZ: 'Uzbekistan',
  TM: 'Turkmenistan',
  MN: 'Mongolia',
};

export default function AirportSearch() {
  const [query, setQuery] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchAirports(query);
      setAirports(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search airports');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAll = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await getAllAirports();
      setAirports(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch airports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Flight Search
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Airport Search</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search airports (e.g., London, JFK, LAX)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleGetAll}
              disabled={loading}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Get All
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        </div>

        {airports.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Results ({airports.length} airports found)
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {airports.map((airport) => (
                <div key={airport.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {airport.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {airport?.city_name || 'Unknown City'}, {COUNTRY_CODE_TO_NAME[airport.iata_country_code] || airport.iata_country_code || 'Unknown Country'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        IATA: {airport.iata_code} | ICAO: {airport.icao_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {airport.iata_code}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {airport.time_zone}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
