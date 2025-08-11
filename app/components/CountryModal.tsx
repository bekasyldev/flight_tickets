'use client';

import { useState, useEffect } from 'react';
import { POPULAR_COUNTRIES, Country, searchCountries } from '../utils/countries';

interface CountryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (countryName: string, airportCode: string, airportName: string) => void;
    title: string;
}

export default function CountryModal({ isOpen, onClose, onSelect, title }: CountryModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCountries, setFilteredCountries] = useState<Country[]>(POPULAR_COUNTRIES);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    useEffect(() => {
        setFilteredCountries(searchCountries(searchQuery));
    }, [searchQuery]);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedCountry(null);
            setFilteredCountries(POPULAR_COUNTRIES);
        }
    }, [isOpen]);

    const handleCountrySelect = (country: Country) => {
        if (country.majorAirports.length === 1) {
            const airport = country.majorAirports[0];
            onSelect(country.name, airport.code, `${airport.city} (${airport.code})`);
            onClose();
        } else {
            setSelectedCountry(country);
        }
    };

    const handleAirportSelect = (country: Country, airport: Country['majorAirports'][0]) => {
        onSelect(country.name, airport.code, `${airport.city} (${airport.code})`);
        onClose();
    };

    const handleBack = () => {
        setSelectedCountry(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                {/* Modal content */}
                <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-10">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="w-full">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {selectedCountry ? `Select Airport in ${selectedCountry.name}` : title}
                                    </h3>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {selectedCountry ? (
                                    // Airport selection view
                                    <div>
                                        <button
                                            onClick={handleBack}
                                            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back to countries
                                        </button>
                                        
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {selectedCountry.majorAirports.map((airport) => (
                                                <button
                                                    key={airport.code}
                                                    onClick={() => handleAirportSelect(selectedCountry, airport)}
                                                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        {airport.city} ({airport.code})
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {airport.name}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    // Country selection view
                                    <div>
                                        {/* Search input */}
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                placeholder="Search countries..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                            />
                                        </div>

                                        {/* Country list */}
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {filteredCountries.map((country) => (
                                                <button
                                                    key={country.code}
                                                    onClick={() => handleCountrySelect(country)}
                                                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center"
                                                >
                                                    <span className="text-2xl mr-3">{country.flag}</span>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {country.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {country.majorAirports.length} airport{country.majorAirports.length > 1 ? 's' : ''} available
                                                        </div>
                                                    </div>
                                                    {country.majorAirports.length > 1 && (
                                                        <svg className="w-5 h-5 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {filteredCountries.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                No countries found matching &quot;{searchQuery}&quot;
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 