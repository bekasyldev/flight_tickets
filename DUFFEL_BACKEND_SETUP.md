# Duffel API Backend Proxy Setup

## Problem Solved

This setup resolves the CORS (Cross-Origin Resource Sharing) issues that occur when trying to call the Duffel API directly from a frontend application. As mentioned in the [Duffel documentation](https://help.duffel.com/hc/en-gb/articles/4504698704530-Can-I-use-the-Duffel-API-directly-from-my-frontend-application-or-mobile-app), the Duffel API should not be called directly from frontend applications for security reasons.

## Architecture

```
Frontend (React/Next.js) -> Backend API Routes (Next.js) -> Duffel API
```

Instead of:
```
Frontend (React/Next.js) -> Duffel API (❌ CORS Error)
```

## Files Created/Modified

### 1. API Routes
- **`app/api/duffel/offer-requests/route.ts`** - Specific endpoint for flight offer requests
- **`app/api/duffel/[...path]/route.ts`** - Generic proxy for all Duffel API endpoints

### 2. Environment Variables
- **`.env.local`** - Contains your actual Duffel API token (server-side only)
- **`.env.example`** - Template for other developers

### 3. Frontend Updates
- **`app/page.tsx`** - Updated to call backend routes instead of Duffel directly

## Setup Instructions

### 1. Configure Environment Variables

1. Copy your Duffel API token from [Duffel Dashboard](https://app.duffel.com/)
2. Update `.env.local`:
   ```
   DUFFEL_ACCESS_TOKEN=your_actual_duffel_token_here
   ```

### 2. API Endpoints Available

#### Specific Endpoint
- **POST** `/api/duffel/offer-requests` - Flight search

#### Generic Proxy
- **GET/POST/PUT/DELETE** `/api/duffel/{any-duffel-endpoint}`

Examples:
- `/api/duffel/air/offers/{offer_id}` -> `https://api.duffel.com/air/offers/{offer_id}`
- `/api/duffel/air/bookings` -> `https://api.duffel.com/air/bookings`

### 3. Usage in Frontend

```javascript
// ✅ Correct - Call your backend
const response = await fetch('/api/duffel/offer-requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data: offerRequest })
});

// ❌ Wrong - Direct call causes CORS
const response = await fetch('https://api.duffel.com/air/offer_requests', {
  // This will fail due to CORS
});
```

## Security Benefits

1. **API Token Security**: Duffel API token is only stored server-side
2. **No CORS Issues**: All requests go through your backend
3. **Request Validation**: You can add validation/rate limiting in your API routes
4. **Error Handling**: Centralized error handling and logging

## CORS Configuration

The API routes include proper CORS headers:
```javascript
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type',
```

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test the flight search functionality in your frontend
3. Check browser Network tab - you should see calls to `/api/duffel/*` instead of `api.duffel.com`

## Future Endpoints

To add more Duffel API functionality, you can either:

1. **Use the generic proxy**: Call `/api/duffel/{endpoint}` for any Duffel endpoint
2. **Create specific routes**: Add new files in `app/api/duffel/` for custom logic

## Troubleshooting

- **500 Error**: Check that `DUFFEL_ACCESS_TOKEN` is set in `.env.local`
- **CORS Still Failing**: Ensure you're calling `/api/duffel/*` routes, not `api.duffel.com`
- **Token Issues**: Verify your Duffel token is valid and has appropriate permissions