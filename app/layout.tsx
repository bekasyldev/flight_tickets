import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import I18nProvider from "./components/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://flight-tickets.vercel.app'),
  title: {
    default: 'Flight Tickets - Cheap Flights & Airline Booking | Search & Compare',
    template: '%s | Flight Tickets'
  },
  description: 'Search and compare cheap flights from multiple airlines. Book your perfect flight with best prices, flexible dates, and secure payment. Available in English, Russian, Moldovan, and Ukrainian.',
  keywords: [
    'cheap flights',
    'airline tickets',
    'flight booking',
    'air travel',
    'flight search',
    'дешевые авиабилеты',
    'поиск авиабилетов',
    'бронирование рейсов',
    'bilete de avion ieftine',
    'rezervare zbor',
    'дешеві авіаквитки',
    'пошук авіаквитків'
  ],
  authors: [{ name: 'Flight Tickets Team' }],
  creator: 'Flight Tickets',
  publisher: 'Flight Tickets',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ru_RU', 'ro_MD', 'uk_UA'],
    url: 'https://flight-tickets.vercel.app',
    siteName: 'Flight Tickets',
    title: 'Flight Tickets - Search & Book Cheap Flights Online',
    description: 'Compare and book cheap flights from multiple airlines. Find the best deals on international and domestic flights with flexible booking options.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Flight Tickets - Search and Book Flights',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flight Tickets - Search & Book Cheap Flights',
    description: 'Compare and book cheap flights from multiple airlines worldwide.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://flight-tickets.vercel.app',
    languages: {
      'en': 'https://flight-tickets.vercel.app/en',
      'ru': 'https://flight-tickets.vercel.app/ru',
      'ro-MD': 'https://flight-tickets.vercel.app/md',
      'uk': 'https://flight-tickets.vercel.app/ua',
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Flight Tickets",
              "url": "https://flight-tickets.vercel.app",
              "description": "Search and compare cheap flights from multiple airlines worldwide",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://flight-tickets.vercel.app/search?origin={origin}&destination={destination}&departure={departure_date}"
                },
                "query-input": [
                  {
                    "@type": "PropertyValueSpecification",
                    "valueRequired": true,
                    "valueName": "origin"
                  },
                  {
                    "@type": "PropertyValueSpecification", 
                    "valueRequired": true,
                    "valueName": "destination"
                  },
                  {
                    "@type": "PropertyValueSpecification",
                    "valueRequired": true,
                    "valueName": "departure_date"
                  }
                ]
              },
              "inLanguage": ["en", "ru", "ro", "uk"],
              "availableLanguage": [
                {
                  "@type": "Language",
                  "name": "English",
                  "alternateName": "en"
                },
                {
                  "@type": "Language", 
                  "name": "Russian",
                  "alternateName": "ru"
                },
                {
                  "@type": "Language",
                  "name": "Moldovan",
                  "alternateName": "ro"
                },
                {
                  "@type": "Language",
                  "name": "Ukrainian", 
                  "alternateName": "uk"
                }
              ],
              "provider": {
                "@type": "Organization",
                "name": "Flight Tickets",
                "url": "https://flight-tickets.vercel.app",
                "logo": "https://flight-tickets.vercel.app/logo.png",
                "sameAs": [
                  "https://twitter.com/flighttickets",
                  "https://facebook.com/flighttickets"
                ]
              }
            })
          }}
        />
        
        {/* Travel Service Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "Flight Tickets",
              "description": "Online flight booking platform offering cheap flights and airline tickets worldwide",
              "url": "https://flight-tickets.vercel.app",
              "logo": "https://flight-tickets.vercel.app/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "email": "avelrusimport@gmail.com",
                "availableLanguage": ["English", "Russian", "Moldovan", "Ukrainian"]
              },
              "serviceType": "Flight Booking",
              "areaServed": "Worldwide",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Flight Offers",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Domestic Flights",
                      "description": "Book domestic flights within your country"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "International Flights",
                      "description": "Book international flights worldwide"
                    }
                  }
                ]
              }
            })
          }}
        />

        {/* Language alternates for SEO */}
        <link rel="alternate" hrefLang="en" href="https://flight-tickets.vercel.app/en" />
        <link rel="alternate" hrefLang="ru" href="https://flight-tickets.vercel.app/ru" />
        <link rel="alternate" hrefLang="ro" href="https://flight-tickets.vercel.app/md" />
        <link rel="alternate" hrefLang="uk" href="https://flight-tickets.vercel.app/ua" />
        <link rel="alternate" hrefLang="x-default" href="https://flight-tickets.vercel.app" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="geo.region" content="Worldwide" />
        <meta name="geo.placename" content="Global" />
        <meta name="theme-color" content="#f97316" />
        
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.jpg" />
        <link rel="icon" type="image/jpeg" sizes="32x32" href="/logo.jpg" />
        <link rel="icon" type="image/jpeg" sizes="16x16" href="/logo.jpg" />
        
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Flight Tickets" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
