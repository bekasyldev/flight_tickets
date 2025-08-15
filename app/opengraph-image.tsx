import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Flight Tickets - Search and Book Flights'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              marginRight: '20px',
            }}
          >
            ✈️
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Flight Tickets
          </div>
        </div>
        
        <div
          style={{
            fontSize: '36px',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.2',
            opacity: 0.95,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          Search & Book Cheap Flights Worldwide
        </div>
        
        <div
          style={{
            fontSize: '24px',
            textAlign: 'center',
            marginTop: '30px',
            opacity: 0.9,
            display: 'flex',
            gap: '40px',
          }}
        >
          <div>🌍 Worldwide</div>
          <div>💰 Best Prices</div>
          <div>🔒 Secure Booking</div>
          <div>🌐 4 Languages</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
