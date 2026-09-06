import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import EquationSolver from '@/components/solver/EquationSolver';

export function generateMetadata(): Metadata {
  return {
    title: 'Equation Solver with Steps — Linear, Quadratic & Polynomial | EasyEquate',
    description: 'Free step-by-step equation solver. Shows every working step for linear, quadratic, cubic equations, systems, and inequalities. No sign-up required.',
    alternates: {
      canonical: '/equation-solver-with-steps',
    },
  };
}

export default function EquationSolverWithStepsPage() {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "EasyEquate Equation Solver with Steps",
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
            "name": "How does the step-by-step solver work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The solver parses your equation and applies algebraic rules sequentially, showing each transformation like adding/subtracting from both sides or factoring, until the variable is isolated."
            }
          },
          {
            "@type": "Question",
            "name": "Can it solve linear equations?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, it can solve linear equations with one or multiple variables by simplifying and isolating the target variable."
            }
          },
          {
            "@type": "Question",
            "name": "Does it handle systems of equations?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, it can solve systems of equations using substitution, elimination, or matrix methods, providing steps for each."
            }
          },
          {
            "@type": "Question",
            "name": "What about polynomials?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "It can solve quadratic, cubic, and higher-order polynomials using factoring, formulas, or numerical approximation where necessary."
            }
          },
          {
            "@type": "Question",
            "name": "Do I have to pay to see the steps?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, EasyEquate provides all step-by-step solutions completely free."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="w-full text-[#5D4037] dark:text-[#EFEBE9] py-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }}
      />
      
      <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-3 sm:space-y-5">
        <header className="space-y-1 sm:space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EFEBE9] dark:bg-[#25201E] border border-[#D7CCC8] dark:border-[#3E2723] text-[10px] sm:text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8]">
            <span>ALGEBRAIC ENGINE</span>
            <span>•</span>
            <span>STEP-BY-STEP WORKINGS</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
            Equation Solver with Steps
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] max-w-3xl">
            Solves linear equations, quadratics, polynomials, or systems line-by-line with complete algebraic proofs.
          </p>
        </header>

        {/* Live Interactive Solver Widget — Immediate Above-the-Fold Access */}
        <section className="w-full">
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#757575]">Loading solver workstation...</div>}>
            <EquationSolver hideHeader wideLayout />
          </Suspense>
        </section>

        {/* Educational Guide Section */}
        <section className="bg-white dark:bg-[#1B1B1B] p-4 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[#131313] dark:text-white">How This Step-by-Step Solver Works</h2>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] leading-relaxed">
            Stuck on a math problem? Our solver breaks down complex equations into understandable steps, applying algebraic rules sequentially until the variable is isolated. Follow along line by line to understand every transformation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left text-[#131313] dark:text-white">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q: "How does the step-by-step solver work?", a: "The solver parses your equation and applies algebraic rules sequentially, showing each transformation like adding/subtracting from both sides or factoring, until the variable is isolated." },
              { q: "Can it solve linear equations?", a: "Yes, it can solve linear equations with one or multiple variables by simplifying and isolating the target variable." },
              { q: "Does it handle systems of equations?", a: "Yes, it can solve systems of equations using substitution, elimination, or matrix methods, providing steps for each." },
              { q: "What about polynomials?", a: "It can solve quadratic, cubic, and higher-order polynomials using factoring, formulas, or numerical approximation where necessary." },
              { q: "Do I have to pay to see the steps?", a: "No, EasyEquate provides all step-by-step solutions completely free." }
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-[#3E2723] p-4 rounded-lg border border-[#E0E0E0] dark:border-[#5D4037]">
                <h3 className="font-semibold text-lg">{faq.q}</h3>
                <p className="mt-2 opacity-90">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center space-y-4 pt-8 border-t border-[#E0E0E0] dark:border-[#5D4037]">
          <h3 className="text-xl font-medium">Explore Other Solvers</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/quadratic-equation-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Quadratic Equation Solver</Link>
            <Link href="/system-of-equations" className="text-blue-600 dark:text-blue-400 hover:underline">System of Equations</Link>
            <Link href="/inequality-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Inequality Solver</Link>
            <Link href="/matrix-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Matrix Solver</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
