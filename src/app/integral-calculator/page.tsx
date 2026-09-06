import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import EquationSolver from '@/components/solver/EquationSolver';

export function generateMetadata(): Metadata {
  return {
    title: 'Integral Calculator with Steps — Indefinite & Definite Integrals | EasyEquate',
    description: 'Free integral calculator with steps. Calculate indefinite and definite integrals step-by-step with power rule, substitution, and + C shown.',
    alternates: {
      canonical: '/integral-calculator',
    },
    openGraph: {
      title: 'Integral Calculator with Steps | EasyEquate',
      description: 'Integrate any function step-by-step with integration rules and constants explained. Free, instant, and clean.',
      url: 'https://easyequate.com/integral-calculator',
    },
  };
}

export default function IntegralCalculatorPage() {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "EasyEquate Integral Calculator",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Why is the constant + C added to integrals?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "For indefinite integrals, any constant term differentiates to zero. Therefore, there are infinitely many antiderivatives differing by a constant C, which represents this unknown constant."
            }
          },
          {
            "@type": "Question",
            "name": "What is the reverse power rule for integration?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The power rule for integration is ∫ x^n dx = (x^(n + 1)) / (n + 1) + C (for n ≠ -1). If n = -1, the integral is ln|x| + C."
            }
          },
          {
            "@type": "Question",
            "name": "Can this solve definite integrals with bounds?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, enter limits to compute definite integrals using the Fundamental Theorem of Calculus: F(b) - F(a)."
            }
          },
          {
            "@type": "Question",
            "name": "Can it integrate polynomials and trig functions?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, it supports polynomials, sin(x), cos(x), e^x, 1/x, and rational functions step-by-step."
            }
          },
          {
            "@type": "Question",
            "name": "Is this integral calculator free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, EasyEquate is 100% free with no sign-up or paywalls."
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
        {/* Clean Hero Header */}
        <header className="space-y-1 sm:space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EFEBE9] dark:bg-[#25201E] border border-[#D7CCC8] dark:border-[#3E2723] text-[10px] sm:text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8]">
            <span>INTEGRAL ENGINE</span>
            <span>•</span>
            <span>∫ dx WITH STEPS</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
            Integral Calculator with Steps
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] max-w-3xl">
            Solves definite and indefinite integrals with reverse power rule, u-substitution, integration by parts, and constant of integration (+ C).
          </p>
        </header>

        {/* Embedded Interactive Solver Widget — Immediate Above-the-Fold Access */}
        <section className="w-full">
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#757575]">Loading calculator...</div>}>
            <EquationSolver initialMode="integral" initialEquation="2x + 3" hideHeader wideLayout />
          </Suspense>
        </section>

        {/* Core Integration Rules Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Rule 1</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Reverse Power Rule</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">∫ xⁿ dx = (xⁿ⁺¹)/(n + 1) + C</code> for all powers <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">n ≠ -1</code>.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Rule 2</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Logarithmic & Exponential</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Integrates <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">∫ (1/x) dx = ln|x| + C</code> and natural exponents <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">∫ eˣ dx = eˣ + C</code>.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Rule 3</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Definite Integrals</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Evaluates areas under curves using the Fundamental Theorem of Calculus: <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">F(b) - F(a)</code>.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-[#131313] dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              { q: "Why is the constant + C added to integrals?", a: "For indefinite integrals, any constant term differentiates to zero. Therefore, there are infinitely many antiderivatives differing by a constant C, which represents this unknown constant." },
              { q: "What is the reverse power rule for integration?", a: "The power rule for integration is ∫ x^n dx = (x^(n + 1)) / (n + 1) + C (for n ≠ -1). If n = -1, the integral is ln|x| + C." },
              { q: "Can this solve definite integrals with bounds?", a: "Yes, enter limits to compute definite integrals using the Fundamental Theorem of Calculus: F(b) - F(a)." },
              { q: "Can it integrate polynomials and trig functions?", a: "Yes, it supports polynomials, sin(x), cos(x), e^x, 1/x, and rational functions step-by-step." },
              { q: "Is this integral calculator free to use?", a: "Yes, EasyEquate is 100% free with no sign-up or paywalls." }
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-[#1B1B1B] p-4 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs">
                <h3 className="font-semibold text-sm sm:text-base text-[#131313] dark:text-white">{faq.q}</h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#616161] dark:text-[#A19891]">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Solvers */}
        <footer className="text-center space-y-3 pt-6 border-t border-[#E0E0E0] dark:border-[#2E2825]">
          <h3 className="text-sm font-bold font-mono text-[#5D4037] dark:text-[#D7CCC8] uppercase tracking-wider">
            Explore Related Math Tools
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold">
            <Link href="/derivative-calculator" className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] transition-colors">
              Derivative Calculator with Steps
            </Link>
            <Link href="/equation-solver-with-steps" className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] transition-colors">
              Equation Solver with Steps
            </Link>
            <Link href="/quadratic-equation-solver" className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] transition-colors">
              Quadratic Equation Solver
            </Link>
            <Link href="/graph" className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] transition-colors">
              2D Graphing Calculator
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
