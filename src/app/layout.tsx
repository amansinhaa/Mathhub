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
  metadataBase: new URL('https://www.easyequate.com'),
  title: {
    default: 'Easy Equate (EasyEquate) — Free Online Math & Graphing Studio',
    template: '%s | Easy Equate',
  },
  description:
    'Easy Equate is a free all-in-one mathematics and graphing studio featuring an online scientific calculator, step-by-step polynomial & calculus solver, 2D function plotter, and formula sheets.',
  applicationName: 'Easy Equate',
  keywords: [
    'Easy Equate',
    'EasyEquate',
    'easy equate math',
    'easy equate calculator',
    'scientific calculator',
    'polynomial solver',
    'step by step solver',
    'graphing calculator',
    'online math calculator',
    'function plotter',
    'polynomial long division',
    'math formula reference',
  ],
  authors: [{ name: 'EasyEquate Team', url: 'https://www.easyequate.com' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.svg', type: 'image/svg+xml' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Easy Equate (EasyEquate) — Free Online Math & Graphing Studio',
    description:
      'Easy Equate is a free all-in-one mathematics and graphing studio featuring an online scientific calculator, step-by-step polynomial & calculus solver, 2D function plotter, and formula reference.',
    url: 'https://www.easyequate.com',
    siteName: 'Easy Equate',
    images: [
      {
        url: 'https://www.easyequate.com/og-image.png',
        width: 1024,
        height: 1024,
        alt: 'EasyEquate Logo — Online Math & Graphing Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyEquate | All-in-One Step-by-Step Math & Graphing Studio',
    description:
      'All-in-one mathematics and graphing studio with scientific calculator, equation solver, 2D function plotter, and formula library.',
    images: ['https://www.easyequate.com/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#131313' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Easy Equate',
  alternateName: ['EasyEquate', 'Easy Equate Math', 'EasyEquate Studio'],
  url: 'https://www.easyequate.com',
  image: 'https://www.easyequate.com/logo.png',
  logo: 'https://www.easyequate.com/logo.png',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Easy Equate is a free all-in-one mathematics and graphing studio featuring an online scientific calculator, step-by-step polynomial & calculus solver, 2D function plotter, and formula sheets.',
  featureList: [
    'Online Scientific Calculator with History and Memory',
    'Step-by-Step Polynomial and Long Division Solver',
    'Calculus Differentiation & Integration with Steps',
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
        {/* Anti-FOUC Theme Script - Defaults to system mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var raw=localStorage.getItem('mathhub-theme-mode');var theme='system';if(raw){var p=JSON.parse(raw);if(p&&p.state&&p.state.theme){theme=p.state.theme;}}else{var old=localStorage.getItem('mathhub-theme');if(old){var op=JSON.parse(old);if(op&&op.state&&op.state.theme){theme=op.state.theme;}}}var isDark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}`,
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
            {/* Main content area — full width canvas and responsive container */}
            <main className="flex-1 overflow-y-auto min-h-0">
              <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-5 h-full">
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
