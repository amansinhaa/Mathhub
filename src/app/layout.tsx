import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://easyequate.com'),
  title: {
    default: 'EasyEquate | All-in-One Step-by-Step Math & Graphing Studio',
    template: '%s | EasyEquate',
  },
  description:
    'All-in-one mathematics and graphing studio featuring an online scientific calculator, step-by-step polynomial solver with long division, 2D function plotter, and comprehensive formula library.',
  applicationName: 'EasyEquate',
  keywords: [
    'scientific calculator',
    'polynomial solver',
    'step by step solver',
    'graphing calculator',
    'online math calculator',
    'EasyEquate',
    'function plotter',
    'polynomial long division',
    'math formula reference',
  ],
  authors: [{ name: 'EasyEquate Team', url: 'https://easyequate.com' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon-192.svg',
  },
  openGraph: {
    title: 'EasyEquate | All-in-One Step-by-Step Math & Graphing Studio',
    description:
      'All-in-one mathematics and graphing studio featuring an online scientific calculator, step-by-step polynomial solver with long division, 2D function plotter, and comprehensive formula library.',
    url: 'https://easyequate.com',
    siteName: 'EasyEquate',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyEquate | All-in-One Step-by-Step Math & Graphing Studio',
    description:
      'All-in-one mathematics and graphing studio with scientific calculator, equation solver, 2D function plotter, and formula library.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#131313' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'EasyEquate',
  url: 'https://easyequate.com',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'All-in-one mathematics and graphing studio featuring an online scientific calculator, step-by-step polynomial solver with long division, 2D function plotter, and comprehensive formula library.',
  featureList: [
    'Online Scientific Calculator with History and Memory',
    'Step-by-Step Polynomial and Long Division Solver',
    '2D Function Plotter with Printable Study Sheets',
    'Interactive Math Formula Reference Guide',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC Theme Script - Defaults to light mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('mathhub-theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}`,
          }}
        />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-white dark:bg-[#131313] text-[#131313] dark:text-[#F5F5F5] antialiased`}
      >
        <ThemeProvider>
          <div className="flex h-dvh min-h-screen flex-col overflow-hidden bg-[#FAFAFA] dark:bg-[#131313] transition-colors duration-150">
            {/* Main content area — takes remaining space above mobile bottom bar and right of desktop sidebar */}
            <main className="flex-1 overflow-y-auto pb-16 lg:pb-3 lg:pl-56 min-h-0">
              <div className="mx-auto max-w-7xl px-3 sm:px-5 py-2 sm:py-3.5 h-full">
                {children}
              </div>
            </main>

            {/* Navigation — Material 3 bottom bar on mobile, persistent sidebar on desktop */}
            <Navbar />
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
