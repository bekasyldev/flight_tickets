# Flight Search Application ✈️

A modern, responsive flight search application built with Next.js and the Duffel API.

## Features

- **Flight Search**: Search for flights using airport codes or city codes
- **Trip Types**: Support for both one-way and round-trip flights
- **Flexible Options**: Choose cabin class, number of passengers, and travel dates
- **Real-time Results**: Get live flight data from 300+ airlines via Duffel API
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **TypeScript**: Fully typed for better development experience

## Getting Started

### Prerequisites

1. Sign up for a Duffel account at [https://app.duffel.com/join](https://app.duffel.com/join)
2. Create a test access token from the "Access tokens" page in your Duffel dashboard
3. Node.js 18+ installed on your system

### Installation

1. Clone or download this project
2. Install dependencies:
```bash
npm install
```

3. Add your Duffel access token:

**Option 1: Environment Variable (Recommended)**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_DUFFEL_ACCESS_TOKEN=your_access_token_here
```

**Option 2: Direct Code Update**
Edit `app/page.tsx` and replace `YOUR_ACCESS_TOKEN_HERE` with your actual token:
```typescript
const DUFFEL_ACCESS_TOKEN = 'your_actual_duffel_token_here';
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Search for Flights

1. **Choose Trip Type**: Select either "Round Trip" or "One Way"
2. **Enter Locations**: Use IATA airport codes (e.g., JFK, LHR, NYC) or city codes
3. **Select Dates**: Choose your departure date (and return date for round trips)
4. **Passengers & Class**: Specify number of passengers and cabin class
5. **Search**: Click "Search Flights" to get results

### Popular Airport Codes

- **New York**: JFK, LGA, EWR, NYC (city code)
- **London**: LHR, LGW, STN, LTN, LCY
- **Los Angeles**: LAX
- **San Francisco**: SFO
- **Chicago**: ORD, MDW
- **Miami**: MIA
- **Atlanta**: ATL
- **Barcelona**: BCN
- **Paris**: CDG, ORY
- **Tokyo**: NRT, HND

### Understanding Results

Each flight result shows:
- **Price**: Total cost in the airline's currency
- **Flight Details**: Departure/arrival times, airports, and duration
- **Airline Information**: Carrier name and aircraft type
- **Journey Segments**: Individual flights (including connections)

## Duffel API Integration

This application uses the Duffel API v2 to:

1. **Create Offer Requests**: Search for flights based on your criteria
2. **Receive Flight Offers**: Get real-time flight options from airlines
3. **Display Results**: Show formatted flight information with pricing

### API Endpoints Used

- `POST /air/offer_requests` - Search for flights

### Key Concepts

- **Slices**: Journey segments (e.g., NYC to ATL)
- **Passengers**: Travelers with types (adult, child, infant)
- **Offers**: Bookable flight options with pricing
- **Segments**: Individual flights within a journey

## Development

### Project Structure

```
├── app/
│   ├── page.tsx          # Main flight search component
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
├── package.json          # Dependencies
└── README.md            # This file
```

### Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Duffel API**: Flight search and booking platform

### TypeScript Interfaces

The application includes comprehensive TypeScript interfaces for:
- Flight offers and segments
- Search parameters
- API responses
- Form data

## Troubleshooting

### Common Issues

1. **"Access token" error**: Make sure you've added your Duffel access token
2. **"No flights found"**: Try different airport codes or dates
3. **CORS errors**: The API calls are made server-side to avoid CORS issues

### Testing

For testing purposes, try searching:
- **From**: LHR (London Heathrow)
- **To**: JFK (New York JFK)
- **Date**: Any future date
- **Passengers**: 1 adult

## Next Steps

Once you have the basic search working, you can extend the application with:

1. **Flight Booking**: Implement the Duffel booking flow
2. **Payment Integration**: Add payment processing
3. **User Accounts**: Save searches and bookings
4. **Filters**: Add price, airline, and time filters
5. **Ancillaries**: Offer seat selection and baggage options

## Resources

- [Duffel API Documentation](https://duffel.com/docs)
- [Duffel Getting Started Guide](https://duffel.com/docs/guides/getting-started-with-flights)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For Duffel API issues:
- [Duffel Help Centre](https://help.duffel.com)
- [Duffel Slack Community](https://slack.duffel.com)
- Email: help@duffel.com
