import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Flight Tickets - Search & Book Flights',
        short_name: 'Flight Tickets',
        description: 'Search and compare cheap flights from multiple airlines worldwide. Book your perfect flight with best prices and secure payment.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f97316',
        orientation: 'portrait-primary',
        categories: ['travel', 'business', 'lifestyle'],
        lang: 'en',
        dir: 'ltr',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            }
        ],
        screenshots: [
            {
                src: '/screenshot-wide.png',
                sizes: '1280x720',
                type: 'image/png',
                form_factor: 'wide',
                label: 'Flight search on desktop'
            },
            {
                src: '/screenshot-narrow.png',
                sizes: '750x1334',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'Flight search on mobile'
            }
        ],
        shortcuts: [
            {
                name: 'Search Flights',
                short_name: 'Search',
                description: 'Quick flight search',
                url: '/?utm_source=pwa_shortcut',
                icons: [
                    {
                        src: '/icon-96.png',
                        sizes: '96x96'
                    }
                ]
            },
            {
                name: 'Support',
                short_name: 'Help',
                description: 'Get help and support',
                url: '/support?utm_source=pwa_shortcut',
                icons: [
                    {
                        src: '/icon-96.png',
                        sizes: '96x96'
                    }
                ]
            }
        ]
    }
}
