import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://flight-tickets.vercel.app'

    // Main pages in all languages
    const languages = ['en', 'ru', 'md', 'ua']
    const pages = ['', '/support', '/checkout']

    const siteMap: MetadataRoute.Sitemap = []

    // Add main page and its language variants
    siteMap.push({
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
        alternates: {
            languages: {
                en: `${baseUrl}/en`,
                ru: `${baseUrl}/ru`,
                'ro-MD': `${baseUrl}/md`,
                uk: `${baseUrl}/ua`,
            }
        }
    })

    // Add other pages for each language
    for (const lang of languages) {
        for (const page of pages) {
            if (page === '') continue // Skip empty page as it's already added above

            siteMap.push({
                url: `${baseUrl}/${lang}${page}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: page === '/support' ? 0.8 : 0.7,
            })
        }
    }

    // Add main pages without language prefix
    for (const page of pages) {
        if (page === '') continue

        siteMap.push({
            url: `${baseUrl}${page}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: page === '/support' ? 0.8 : 0.7,
            alternates: {
                languages: {
                    en: `${baseUrl}/en${page}`,
                    ru: `${baseUrl}/ru${page}`,
                    'ro-MD': `${baseUrl}/md${page}`,
                    uk: `${baseUrl}/ua${page}`,
                }
            }
        })
    }

    return siteMap
}
