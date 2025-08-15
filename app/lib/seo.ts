import { Metadata } from 'next'

export interface SEOData {
    title: string
    description: string
    keywords: string[]
    ogTitle: string
    ogDescription: string
}

export const seoData: Record<string, SEOData> = {
    en: {
        title: 'Flight Tickets - Search & Book Cheap Flights Online',
        description: 'Compare and book cheap flights from multiple airlines worldwide. Find the best deals on international and domestic flights with flexible booking options.',
        keywords: [
            'cheap flights', 'airline tickets', 'flight booking', 'air travel',
            'flight search', 'international flights', 'domestic flights', 'airline deals',
            'flight comparison', 'travel booking', 'airline reservations'
        ],
        ogTitle: 'Flight Tickets - Search & Book Cheap Flights Online',
        ogDescription: 'Compare and book cheap flights from multiple airlines worldwide. Find the best deals on international and domestic flights.'
    },
    ru: {
        title: 'Авиабилеты - Поиск и Бронирование Дешевых Авиабилетов',
        description: 'Сравните и забронируйте дешевые авиабилеты от множества авиакомпаний по всему миру. Найдите лучшие предложения на международные и внутренние рейсы.',
        keywords: [
            'дешевые авиабилеты', 'авиакассы', 'бронирование рейсов', 'авиаперелеты',
            'поиск авиабилетов', 'международные рейсы', 'внутренние рейсы', 'скидки на авиабилеты',
            'сравнение рейсов', 'путешествия', 'авиакомпании'
        ],
        ogTitle: 'Авиабилеты - Поиск и Бронирование Дешевых Рейсов',
        ogDescription: 'Сравните и забронируйте дешевые авиабилеты от множества авиакомпаний по всему миру.'
    },
    md: {
        title: 'Bilete de Avion - Căutare și Rezervare Bilete Ieftine',
        description: 'Compară și rezervă bilete de avion ieftine de la multiple companii aeriene din întreaga lume. Găsește cele mai bune oferte pentru zboruri internaționale și interne.',
        keywords: [
            'bilete de avion ieftine', 'bilete avion', 'rezervare zbor', 'călătorii aeriene',
            'căutare bilete', 'zboruri internaționale', 'zboruri interne', 'oferte avion',
            'comparare zboruri', 'rezervări călătorie', 'companii aeriene'
        ],
        ogTitle: 'Bilete de Avion - Căutare și Rezervare Zboruri Ieftine',
        ogDescription: 'Compară și rezervă bilete de avion ieftine de la multiple companii aeriene din întreaga lume.'
    },
    ua: {
        title: 'Авіаквитки - Пошук та Бронювання Дешевих Авіаквитків',
        description: 'Порівняйте та забронюйте дешеві авіаквитки від багатьох авіакомпаній по всьому світу. Знайдіть найкращі пропозиції на міжнародні та внутрішні рейси.',
        keywords: [
            'дешеві авіаквитки', 'авіакаси', 'бронювання рейсів', 'авіаперельоти',
            'пошук авіаквитків', 'міжнародні рейси', 'внутрішні рейси', 'знижки на авіаквитки',
            'порівняння рейсів', 'подорожі', 'авіакомпанії'
        ],
        ogTitle: 'Авіаквитки - Пошук та Бронювання Дешевих Рейсів',
        ogDescription: 'Порівняйте та забронюйте дешеві авіаквитки від багатьох авіакомпаній по всьому світу.'
    }
}

export function generateLocalizedMetadata(
    locale: string = 'en',
    pageTitle?: string,
    pageDescription?: string
): Metadata {
    const data = seoData[locale] || seoData.en
    const baseUrl = 'https://flight-tickets.vercel.app'

    const title = pageTitle ? `${pageTitle} | ${data.title}` : data.title
    const description = pageDescription || data.description

    return {
        title,
        description,
        keywords: data.keywords,
        openGraph: {
            title: data.ogTitle,
            description: data.ogDescription,
            url: `${baseUrl}/${locale === 'en' ? '' : locale}`,
            siteName: 'Flight Tickets',
            locale: getOpenGraphLocale(locale),
            type: 'website',
            images: [
                {
                    url: `${baseUrl}/opengraph-image.png`,
                    width: 1200,
                    height: 630,
                    alt: data.ogTitle,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: data.ogTitle,
            description: data.ogDescription,
            images: [`${baseUrl}/opengraph-image.png`],
        },
        alternates: {
            canonical: `${baseUrl}/${locale === 'en' ? '' : locale}`,
            languages: {
                'en': `${baseUrl}/en`,
                'ru': `${baseUrl}/ru`,
                'ro-MD': `${baseUrl}/md`,
                'uk': `${baseUrl}/ua`,
                'x-default': baseUrl,
            },
        },
    }
}

function getOpenGraphLocale(locale: string): string {
    const localeMap: Record<string, string> = {
        'en': 'en_US',
        'ru': 'ru_RU',
        'md': 'ro_MD',
        'ua': 'uk_UA'
    }
    return localeMap[locale] || 'en_US'
}

export function generateStructuredData(locale: string = 'en') {
    const data = seoData[locale] || seoData.en

    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: data.title,
        description: data.description,
        url: `https://flight-tickets.vercel.app/${locale === 'en' ? '' : locale}`,
        inLanguage: locale,
        isPartOf: {
            '@type': 'WebSite',
            name: 'Flight Tickets',
            url: 'https://flight-tickets.vercel.app'
        },
        mainEntity: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `https://flight-tickets.vercel.app/${locale}/search?origin={origin}&destination={destination}&departure={departure_date}`
            },
            'query-input': [
                {
                    '@type': 'PropertyValueSpecification',
                    valueRequired: true,
                    valueName: 'origin'
                },
                {
                    '@type': 'PropertyValueSpecification',
                    valueRequired: true,
                    valueName: 'destination'
                },
                {
                    '@type': 'PropertyValueSpecification',
                    valueRequired: true,
                    valueName: 'departure_date'
                }
            ]
        }
    }
}
