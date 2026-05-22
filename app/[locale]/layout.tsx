import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Analytics } from "@vercel/analytics/react";

import "../globals.css";

export const metadata: Metadata = {
  title: "ANM ClinicOps | System zarządzania pacjentem",
  description: "ClinicOps CRM dla placówek medycznych: pacjent 360, pierwszy kontakt, zgody, follow-up i analityka kliniki.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  const locales = ['pl', 'en', 'it'];
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
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
