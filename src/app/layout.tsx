import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

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
  title: 'MathHub — All-Round Mathematics Workspace',
  description:
    'Scientific calculator, equation solver, graphing tool, and formula reference library in one unified workspace.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f1a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            {/* Main content area — takes remaining space above navbar */}
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-4 lg:pl-20">
              <div className="mx-auto max-w-6xl px-4 py-4">
                {children}
              </div>
            </main>

            {/* Navigation — bottom on mobile, side on desktop */}
            <Navbar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
