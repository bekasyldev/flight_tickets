# Flight Tickets Backend API

This project has been refactored to move all Duffel API calls to the backend for better security and performance.

## Backend API Routes

### 1. Flight Search API

**Endpoint:** `POST /api/search-flights`

**Purpose:** Search for flight offers based on search criteria

**Request Body:**

```json
{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-08-15",
    "returnDate": "2025-08-22", // Optional for round-trip
    "tripType": "round-trip", // or "one-way"
    "passengers": 2,
    "cabinClass": "economy" // economy, premium_economy, business, first
}
```

**Response:**

```json
{
  "data": {
    "offers": [
      {
        "id": "offer_id",
        "total_amount": "450.00",
        "total_currency": "USD",
        "slices": [...]
      }
    ]
  }
}
```

### 2. Airport Search API

**Endpoint:** `GET /api/airports`

**Purpose:** Search for airports by name, city, or IATA code

**Query Parameters:**

-   `query` (optional): Search term (e.g., "London", "JFK", "New York")

**Examples:**

-   `GET /api/airports` - Get all airports
-   `GET /api/airports?query=London` - Search for airports with "London"

**Response:**

```json
{
    "data": [
        {
            "id": "airport_id",
            "iata_code": "LHR",
            "icao_code": "EGLL",
            "name": "London Heathrow Airport",
            "city": {
                "name": "London",
                "id": "city_id"
            },
            "country": {
                "name": "United Kingdom",
                "iso_code": "GB"
            },
            "latitude": 51.4706,
            "longitude": -0.4619,
            "time_zone": "Europe/London"
        }
    ],
    "meta": {
        "count": 1,
        "limit": 50,
        "offset": 0
    }
}
```

## Frontend Usage

### Flight Search

The main page (`/`) provides a flight search interface that:

-   Sends search requests to `/api/search-flights`
-   Handles form validation on the frontend
-   Displays flight results with detailed information

### Airport Browser

The airports page (`/airports`) demonstrates how to:

-   Search for specific airports using `/api/airports?query=...`
-   Fetch all airports using `/api/airports`
-   Display airport information including IATA codes and locations

### Utilities

The `app/utils/airports.ts` file provides helper functions:

-   `searchAirports(query: string)` - Search for airports
-   `getAllAirports()` - Fetch all airports

## Security Benefits

1. **API Key Protection**: Duffel API keys are now only stored on the server
2. **Request Validation**: Backend validates all requests before forwarding to Duffel
3. **Error Handling**: Centralized error handling and user-friendly error messages
4. **CORS Headers**: Proper CORS configuration for API endpoints

## Environment Variables

Make sure to set the following environment variable:

```
DUFFEL_ACCESS_TOKEN=your_duffel_api_token_here
```

## Development

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`
4. Visit `http://localhost:3000` for flight search
5. Visit `http://localhost:3000/airports` for airport browser

## File Structure

```
app/
├── api/
│   ├── airports/
│   │   └── route.ts          # Airport search API
│   ├── search-flights/
│   │   └── route.ts          # Flight search API
│   └── duffel/
│       └── offer-requests/
│           └── route.ts      # Legacy endpoint (can be removed)
├── airports/
│   └── page.tsx              # Airport browser page
├── utils/
│   └── airports.ts           # Airport utilities
└── page.tsx                  # Main flight search page
```
