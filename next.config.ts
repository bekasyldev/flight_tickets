import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: true,
  },
  i18n: {
    locales: ['en', 'ru', 'ua', 'md'],
    defaultLocale: 'ru',
    domains: [
      {
        domain: 'aviatickets.md',
        defaultLocale: 'md',
      },
    ],
    localeDetection: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  transpilePackages: ['@duffel/components'],
};

export default nextConfig;
