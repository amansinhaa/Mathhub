import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import UnitConverter from '@/components/calculator/UnitConverter';

export function generateMetadata(): Metadata {
  return {
    title: 'Unit Converter — Instant Length, Mass, Currency & Speed | EasyEquate',
    description: 'Free dedicated online unit converter. Convert metric, imperial, currency, digital data, temperature, speed, and volume with live real-time rates.',
    alternates: {
      canonical: '/unit-converter',
    },
    openGraph: {
      title: 'Dedicated Unit & Currency Converter | EasyEquate',
      description: 'Convert between length, mass, currency, temperature, speed, and data storage instantly. Free with no sign-up.',
      url: 'https://www.easyequate.com/unit-converter',
    },
  };
}

export default function UnitConverterPage() {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does the unit converter handle currency rates?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The currency converter fetches live foreign exchange rates with an instant refresh button, converting between USD, EUR, GBP, JPY, and other major world currencies."
            }
          },
          {
            "@type": "Question",
            "name": "Can I convert between Metric and Imperial units?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, EasyEquate supports seamless two-way conversion for meters, feet, inches, kilometers, miles, kilograms, pounds, Celsius, and Fahrenheit."
            }
          },
          {
            "@type": "Question",
            "name": "Is the unit converter free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, it is 100% free with no sign-up, subscriptions, or ads required."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="w-full text-[#131313] dark:text-[#F5F5F5] py-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }}
      />
      
      <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-3 sm:space-y-5">
        <header className="space-y-1 sm:space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EFEBE9] dark:bg-[#25201E] border border-[#D7CCC8] dark:border-[#3E2723] text-[10px] sm:text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8]">
            <span>PRECISION CONVERTER</span>
            <span>•</span>
            <span>REAL-TIME RATES</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
            Unit & Currency Converter
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] max-w-3xl">
            Convert measurements across Length, Mass, Speed, Temperature, Volume, Digital Data, and live exchange currencies.
          </p>
        </header>

        {/* Unit Converter Widget — Immediate Above-the-Fold Access */}
        <section className="w-full">
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#757575]">Loading converter...</div>}>
            <UnitConverter />
          </Suspense>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Standardized</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">SI Metric & Imperial</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              High-precision conversions calibrated for engineering, physics, science homework, and everyday trade standards.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Financial</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Live Forex Rates</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Real-time exchange rate synchronization with instant refresh capabilities for accurate financial modeling.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Computing</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Bytes, Bits & Speed</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Convert binary storage (MB, GB, TB) and network bandwidth speeds (Mbps, Gbps) accurately.
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-[#1B1B1B] p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-[#131313] dark:text-white">Frequently Asked Questions</h2>
          <div className="space-y-4 text-sm text-[#616161] dark:text-[#A19891]">
            <div>
              <h3 className="font-semibold text-sm text-[#131313] dark:text-white mb-1">How accurate are the conversion constants?</h3>
              <p>All conversions follow IEEE 754 64-bit precision standards and NIST published reference multipliers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#131313] dark:text-white mb-1">Can I swap units with one click?</h3>
              <p>Yes, tapping the swap button immediately interchanges the source and destination values.</p>
            </div>
          </div>
        </section>

        <footer className="text-center space-y-4 pt-4 border-t border-[#E0E0E0] dark:border-[#2E2825]">
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">Related Workstations</h3>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <Link href="/calculator" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">Scientific Calculator</Link>
            <Link href="/graph" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">2D Graph Plotter</Link>
            <Link href="/formulas" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">Formula Reference Hub</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
