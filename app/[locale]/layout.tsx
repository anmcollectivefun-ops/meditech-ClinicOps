import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Analytics } from "@vercel/analytics/react";

import "../globals.css";

export const metadata: Metadata = {
  title: "ANM Planner | Zorganizuj Swój Wymarzony Event",
  description: "Darmowy planer eventowy online od ANM Collective.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // 1. Pobieramy język z adresu URL (np. 'pl' lub 'it')
  const { locale } = await params;

  // 2. Weryfikujemy, czy to jeden z naszych obsługiwanych języków
  const locales = ['pl', 'en', 'it'];
  if (!locales.includes(locale)) {
    notFound();
  }

  // 3. Pobieramy słownik (json) z folderu messages
  const messages = await getMessages();

  return (
    // Dynamicznie ustawiamy język dla przeglądarek i SEO
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}