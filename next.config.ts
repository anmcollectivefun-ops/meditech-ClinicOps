import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

// TUTAJ JEST POPRAWKA - wskazujemy dokładny plik!
const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'anmcollective.fun' },
      { protocol: 'https', hostname: 'anmcollective.pl' },
      { protocol: 'https', hostname: 'sklep.anmcollective.pl' },
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: '**.supabase.co' }
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true }
};

export default withNextIntl(nextConfig);