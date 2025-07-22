// Country data with major airports for flight search

export interface Country {
    code: string;
    name: string;
    flag: string;
    majorAirports: {
        code: string;
        name: string;
        city: string;
    }[];
}

export const POPULAR_COUNTRIES: Country[] = [
    {
        code: 'US',
        name: 'United States',
        flag: '🇺🇸',
        majorAirports: [
            { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
            { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles' },
            { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago' },
            { code: 'MIA', name: 'Miami International Airport', city: 'Miami' },
            { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco' },
            { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas' },
            { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta' }
        ]
    },
    {
        code: 'GB',
        name: 'United Kingdom',
        flag: '🇬🇧',
        majorAirports: [
            { code: 'LHR', name: 'Heathrow Airport', city: 'London' },
            { code: 'LGW', name: 'Gatwick Airport', city: 'London' },
            { code: 'STN', name: 'Stansted Airport', city: 'London' },
            { code: 'MAN', name: 'Manchester Airport', city: 'Manchester' },
            { code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh' }
        ]
    },
    {
        code: 'FR',
        name: 'France',
        flag: '🇫🇷',
        majorAirports: [
            { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris' },
            { code: 'ORY', name: 'Orly Airport', city: 'Paris' },
            { code: 'NCE', name: 'Nice Côte d\'Azur Airport', city: 'Nice' },
            { code: 'LYS', name: 'Lyon-Saint Exupéry Airport', city: 'Lyon' }
        ]
    },
    {
        code: 'DE',
        name: 'Germany',
        flag: '🇩🇪',
        majorAirports: [
            { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
            { code: 'MUC', name: 'Munich Airport', city: 'Munich' },
            { code: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin' },
            { code: 'DUS', name: 'Düsseldorf Airport', city: 'Düsseldorf' }
        ]
    },
    {
        code: 'ES',
        name: 'Spain',
        flag: '🇪🇸',
        majorAirports: [
            { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid' },
            { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona' },
            { code: 'AGP', name: 'Málaga Airport', city: 'Málaga' },
            { code: 'VLC', name: 'Valencia Airport', city: 'Valencia' }
        ]
    },
    {
        code: 'IT',
        name: 'Italy',
        flag: '🇮🇹',
        majorAirports: [
            { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome' },
            { code: 'MXP', name: 'Malpensa Airport', city: 'Milan' },
            { code: 'NAP', name: 'Naples International Airport', city: 'Naples' },
            { code: 'VCE', name: 'Venice Marco Polo Airport', city: 'Venice' }
        ]
    },
    {
        code: 'NL',
        name: 'Netherlands',
        flag: '🇳🇱',
        majorAirports: [
            { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam' },
            { code: 'RTM', name: 'Rotterdam The Hague Airport', city: 'Rotterdam' }
        ]
    },
    {
        code: 'JP',
        name: 'Japan',
        flag: '🇯🇵',
        majorAirports: [
            { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo' },
            { code: 'HND', name: 'Haneda Airport', city: 'Tokyo' },
            { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka' },
            { code: 'NGO', name: 'Chubu Centrair International Airport', city: 'Nagoya' }
        ]
    },
    {
        code: 'AU',
        name: 'Australia',
        flag: '🇦🇺',
        majorAirports: [
            { code: 'SYD', name: 'Kingsford Smith Airport', city: 'Sydney' },
            { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne' },
            { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane' },
            { code: 'PER', name: 'Perth Airport', city: 'Perth' }
        ]
    },
    {
        code: 'CA',
        name: 'Canada',
        flag: '🇨🇦',
        majorAirports: [
            { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto' },
            { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver' },
            { code: 'YUL', name: 'Montreal-Pierre Elliott Trudeau International Airport', city: 'Montreal' },
            { code: 'YYC', name: 'Calgary International Airport', city: 'Calgary' }
        ]
    },
    {
        code: 'BR',
        name: 'Brazil',
        flag: '🇧🇷',
        majorAirports: [
            { code: 'GRU', name: 'São Paulo-Guarulhos International Airport', city: 'São Paulo' },
            { code: 'GIG', name: 'Rio de Janeiro-Galeão International Airport', city: 'Rio de Janeiro' },
            { code: 'BSB', name: 'Brasília International Airport', city: 'Brasília' }
        ]
    },
    {
        code: 'AE',
        name: 'United Arab Emirates',
        flag: '🇦🇪',
        majorAirports: [
            { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
            { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi' }
        ]
    },
    {
        code: 'SG',
        name: 'Singapore',
        flag: '🇸🇬',
        majorAirports: [
            { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore' }
        ]
    },
    {
        code: 'TH',
        name: 'Thailand',
        flag: '🇹🇭',
        majorAirports: [
            { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok' },
            { code: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok' },
            { code: 'HKT', name: 'Phuket International Airport', city: 'Phuket' }
        ]
    },
    {
        code: 'IN',
        name: 'India',
        flag: '🇮🇳',
        majorAirports: [
            { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi' },
            { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
            { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore' }
        ]
    },
    {
        code: 'KZ',
        name: 'Kazakhstan',
        flag: '🇰🇿',
        majorAirports: [
            { code: 'NQZ', name: 'Nursultan Nazarbayev International Airport', city: 'Astana' },
            { code: 'ALA', name: 'Almaty International Airport', city: 'Almaty' },
            { code: 'CIT', name: 'Shymkent International Airport', city: 'Shymkent' }
        ]
    },
    {
        code: 'KG',
        name: 'Kyrgyzstan',
        flag: '🇰🇬',
        majorAirports: [
            { code: 'FRU', name: 'Manas International Airport', city: 'Bishkek' },
            { code: 'OSS', name: 'Osh Airport', city: 'Osh' }
        ]
    },
    {
        code: 'UZ',
        name: 'Uzbekistan',
        flag: '🇺🇿',
        majorAirports: [
            { code: 'TAS', name: 'Tashkent International Airport', city: 'Tashkent' },
            { code: 'SKD', name: 'Samarkand International Airport', city: 'Samarkand' }
        ]
    },
    {
        code: 'TJ',
        name: 'Tajikistan',
        flag: '🇹🇯',
        majorAirports: [
            { code: 'DYU', name: 'Dushanbe International Airport', city: 'Dushanbe' }
        ]
    },
    {
        code: 'TM',
        name: 'Turkmenistan',
        flag: '🇹🇲',
        majorAirports: [
            { code: 'ASB', name: 'Ashgabat International Airport', city: 'Ashgabat' }
        ]
    },
    {
        code: 'AM',
        name: 'Armenia',
        flag: '🇦🇲',
        majorAirports: [
            { code: 'EVN', name: 'Zvartnots International Airport', city: 'Yerevan' }
        ]
    },
    {
        code: 'AZ',
        name: 'Azerbaijan',
        flag: '🇦🇿',
        majorAirports: [
            { code: 'GYD', name: 'Heydar Aliyev International Airport', city: 'Baku' }
        ]
    },
    {
        code: 'TR',
        name: 'Turkey',
        flag: '🇹🇷',
        majorAirports: [
            { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul' },
            { code: 'SAW', name: 'Sabiha Gökçen International Airport', city: 'Istanbul' },
            { code: 'ESB', name: 'Esenboğa Airport', city: 'Ankara' }
        ]
    },
    {
        code: 'RU',
        name: 'Russia',
        flag: '🇷🇺',
        majorAirports: [
            { code: 'SVO', name: 'Sheremetyevo International Airport', city: 'Moscow' },
            { code: 'DME', name: 'Domodedovo International Airport', city: 'Moscow' },
            { code: 'LED', name: 'Pulkovo Airport', city: 'St. Petersburg' }
        ]
    },
    {
        code: 'RO',
        name: 'Romania',
        flag: '🇷🇴',
        majorAirports: [
            { code: 'OTP', name: 'Henri Coandă International Airport', city: 'Bucharest' },
            { code: 'CLJ', name: 'Cluj International Airport', city: 'Cluj-Napoca' },
            { code: 'IAS', name: 'Iași International Airport', city: 'Iași' }
        ]
    },
    {
        code: 'MD',
        name: 'Moldova',
        flag: '🇲🇩',
        majorAirports: [
            { code: 'RMO', name: 'Chișinău International Airport', city: 'Chișinău' }
        ]
    }
];

export function getMainAirportForCountry(countryCode: string): string {
    const country = POPULAR_COUNTRIES.find(c => c.code === countryCode);
    return country?.majorAirports[0]?.code || '';
}

export function searchCountries(query: string): Country[] {
    if (!query) return POPULAR_COUNTRIES;

    const lowercaseQuery = query.toLowerCase();
    return POPULAR_COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(lowercaseQuery) ||
        country.code.toLowerCase().includes(lowercaseQuery)
    );
} 