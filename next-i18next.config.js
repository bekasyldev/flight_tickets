module.exports = {
  i18n: {
    defaultLocale: 'ru',
    locales: ['en', 'ru', 'ua', 'md'],
    domains: [
      {
        domain: 'aviatickets.md',
        defaultLocale: 'md',
      },
    ],
    localeDetection: false,
  },
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}; 