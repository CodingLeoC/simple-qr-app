import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import i18nConfig from '@/i18nConfig';
import { notFound } from 'next/navigation';
import initTranslations from '@/app/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';

const i18nNamespaces = ['home'];

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simple QR Code Generator",
  description: "A simple and powerful QR code generator built with Next.js",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale)) {
    notFound();
  }

  const { t, resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TranslationsProvider
          namespaces={i18nNamespaces}
          locale={locale}
          resources={resources}
        >
          {children}
        </TranslationsProvider>
      </body>
    </html>
  );
}
