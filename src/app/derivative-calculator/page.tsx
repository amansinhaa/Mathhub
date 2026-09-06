import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import EquationSolver from '@/components/solver/EquationSolver';

export function generateMetadata(): Metadata {
  return {
    title: 'Derivative Calculator with Steps — d/dx Step-by-Step Solver | EasyEquate',
    description: 'Free derivative calculator with steps. Differentiate any function step-by-step with Power Rule, Product Rule, Quotient Rule, and Chain Rule explained.',
    alternates: {
      canonical: '/derivative-calculator',
    },
    openGraph: {
      title: 'Derivative Calculator with Steps | EasyEquate',
      description: 'Differentiate any function step-by-step with formulas shown. Free, fast, and no sign-up required.',
      url: 'https://easyequate.com/derivative-calculator',
    },
  };
}

export default function DerivativeCalculatorPage() {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "EasyEquate Derivative Calculator",
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
            "name": "How does this derivative calculator show steps?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The solver breaks down your expression term-by-term, identifying the exact calculus rule used (Power Rule, Product Rule, Quotient Rule, Chain Rule, or Trigonometric Rules) and displaying the intermediate substitution."
            }
          },
          {
            "@type": "Question",
            "name": "What is the power rule for derivatives?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The power rule states that d/dx [x^n] = n * x^(n - 1). For example, the derivative of x³ is 3x²."
            }
          },
          {
            "@type": "Question",
            "name": "Can it differentiate trigonometric and logarithmic functions?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, it supports sin(x), cos(x), tan(x), ln(x), e^x, and combinations using the product, quotient, and chain rules."
            }
          },
          {
            "@type": "Question",
            "name": "What is the chain rule?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The chain rule is used for composite functions: d/dx [f(g(x))] = f'(g(x)) * g'(x). It multiplies the derivative of the outer function evaluated at the inner function by the derivative of the inner function."
            }
          },
          {
            "@type": "Question",
            "name": "Is this derivative calculator free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, EasyEquate is 100% free with no subscription or account required."
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
            <span>CALCULUS ENGINE</span>
            <span>•</span>
            <span>d/dx WITH STEPS</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
            Derivative Calculator with Steps
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] max-w-3xl">
            Calculates symbolic derivatives with step-by-step breakdown of Power Rule, Product Rule, Quotient Rule, Chain Rule, and trigonometric identities.
          </p>
        </header>

        {/* Embedded Interactive Solver Widget — Immediate Above-the-Fold Access */}
        <section className="w-full">
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#757575]">Loading calculator...</div>}>
            <EquationSolver initialMode="derivative" initialEquation="3x^2 + 5x" hideHeader wideLayout />
          </Suspense>
        </section>

        {/* How It Works & Common Rules */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Rule 1</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Power Rule</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              For any expression <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">xⁿ</code>, the derivative is <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">n · xⁿ⁻¹</code>.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Rule 2</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Product & Quotient</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Differentiates products <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">(u·v)&apos; = u&apos;v + uv&apos;</code> and fractions with complete denominator expansion.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Rule 3</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Chain Rule</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Solves nested composite functions <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">f(g(x))</code> by multiplying the outer and inner derivative terms.
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
              { q: "How does this derivative calculator show steps?", a: "The solver breaks down your expression term-by-term, identifying the exact calculus rule used (Power Rule, Product Rule, Quotient Rule, Chain Rule, or Trigonometric Rules) and displaying the intermediate substitution." },
              { q: "What is the power rule for derivatives?", a: "The power rule states that d/dx [x^n] = n * x^(n - 1). For example, the derivative of x³ is 3x²." },
              { q: "Can it differentiate trigonometric and logarithmic functions?", a: "Yes, it supports sin(x), cos(x), tan(x), ln(x), e^x, and combinations using the product, quotient, and chain rules." },
              { q: "What is the chain rule?", a: "The chain rule is used for composite functions: d/dx [f(g(x))] = f'(g(x)) * g'(x). It multiplies the derivative of the outer function evaluated at the inner function by the derivative of the inner function." },
              { q: "Is this derivative calculator free?", a: "Yes, EasyEquate is 100% free with no subscription, ads, or account required." }
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
            <Link href="/integral-calculator" className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] transition-colors">
              Integral Calculator with Steps
            </Link>
            <Link href="/quadratic-equation-solver" className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] transition-colors">
              Quadratic Equation Solver
            </Link>
            <Link href="/matrix-solver" className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] transition-colors">
              Matrix Solver
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
