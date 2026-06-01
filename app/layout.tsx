import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { Archivo, Oswald, Public_Sans, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { AppTopBar } from '@/components/AppTopBar/AppTopBar';
import { MainContainer } from './MainContainer';
import { EmbedGuard } from './EmbedGuard';
import MaterialUIThemeProvider from '@/components/ThemeProvider';
import { FloatingChatDrawer } from '@/components/FloatingChatDrawer';
import { organizationConfig } from '@/config/organizationConfig';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-public-sans',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
});

const siteTitle =
  organizationConfig.displayName && organizationConfig.name && organizationConfig.displayName !== organizationConfig.name
    ? `${organizationConfig.displayName} - ${organizationConfig.name}`
    : organizationConfig.displayName || organizationConfig.name;
const siteDescription = organizationConfig.description;

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = `${archivo.variable} ${oswald.variable} ${publicSans.variable} ${sourceSerif.variable}`;

  return (
    <html className={`overflow-x-hidden ${fontVars}`} lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MaterialUIThemeProvider>
          <Suspense>
            <MainContainer>
              <EmbedGuard>
                <AppTopBar />
              </EmbedGuard>
              {children}
              <FloatingChatDrawer />
            </MainContainer>
          </Suspense>
        </MaterialUIThemeProvider>
      </body>
    </html>
  );
}
