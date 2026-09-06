import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// Using a lazy load or import for the client component
import EquationSolver from '@/components/solver/EquationSolver';

export function generateMetadata(): Metadata {
  return {
    title: 'Quadratic Equation Solver with Steps: Factoring & Formula | Easy Equate',
    description: 'Free step-by-step quadratic equation solver. Shows factoring, quadratic formula, discriminant (Δ), vertex, and complex roots with complete working steps.',
    alternates: {
      canonical: '/quadratic-equation-solver',
    },
    openGraph: {
      title: 'Quadratic Equation Solver with Steps: Factoring & Formula | Easy Equate',
      description: 'Solve any quadratic equation ax² + bx + c = 0. See factoring, quadratic formula, discriminant, and step-by-step working.',
      url: 'https://www.easyequate.com/quadratic-equation-solver',
    },
  };
}

export default function QuadraticEquationSolverPage() {
  const faqs = [
    {
      q: "What is the quadratic formula?",
      a: "The quadratic formula is x = (-b ± √(b² - 4ac)) / (2a). It provides the exact roots for any quadratic equation in standard form ax² + bx + c = 0."
    },
    {
      q: "How do I solve a quadratic equation by factoring?",
      a: "To factor ax² + bx + c = 0, find two numbers that multiply to ac and add to b. Rewrite the middle term, factor by grouping, and set each factor to zero to solve for x."
    },
    {
      q: "What does the discriminant (b² - 4ac) tell you?",
      a: "If Δ > 0, there are two distinct real roots. If Δ = 0, there is exactly one repeated real root. If Δ < 0, there are two conjugate complex (imaginary) roots."
    },
    {
      q: "Can this solver find complex or imaginary roots?",
      a: "Yes. When the discriminant is negative, the solver automatically calculates complex numbers using the imaginary unit i (where i = √-1) and shows each intermediate step."
    },
    {
      q: "How do you solve when a quadratic cannot be factored easily?",
      a: "When integers do not readily factor, use the quadratic formula or complete the square. Both methods work universally for every quadratic equation."
    },
    {
      q: "What is the difference between quadratic and cubic equations?",
      a: "A quadratic equation has degree 2 (ax² + bx + c = 0) with up to 2 roots. A cubic equation has degree 3 (ax³ + bx² + cx + d = 0) with up to 3 roots, solved using Cardano's formula or synthetic division."
    },
    {
      q: "Is this quadratic solver completely free?",
      a: "Yes, Easy Equate's quadratic equation solver is 100% free with unlimited step-by-step calculations and no registration needed."
    }
  ];

  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Easy Equate Quadratic Equation Solver",
        "alternateName": ["Quadratic Formula Calculator", "Quadratic Equation Solver with Steps"],
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Free step-by-step quadratic equation calculator that solves ax² + bx + c = 0 by factoring, completing the square, and the quadratic formula."
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
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
            <span>QUADRATIC STUDIO</span>
            <span>•</span>
            <span>REAL & COMPLEX ROOTS</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
            Quadratic Equation Solver with Steps
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] max-w-3xl">
            Solves <em className="font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8]">ax² + bx + c = 0</em> with factoring, completing the square, quadratic formula, discriminant (Δ), and number line visualizer.
          </p>
        </header>

        {/* Live Interactive Solver Widget — Immediate Above-the-Fold Access */}
        <section className="w-full">
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#757575]">Loading solver workstation...</div>}>
            <EquationSolver initialMode="polynomial" initialEquation="x^2 - 5x + 6 = 0" hideHeader wideLayout />
          </Suspense>
        </section>

        {/* How It Works */}
        <section className="bg-white dark:bg-[#1B1B1B] p-6 rounded-xl shadow-sm border border-[#E0E0E0] dark:border-[#2E2825]">
          <h2 className="text-2xl font-semibold mb-4 text-[#5D4037] dark:text-[#EFEBE9]">How to Solve Quadratic Equations</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base leading-relaxed">
            <li><strong>Write in standard form:</strong> Rearrange all terms to one side so the equation equals zero: <code>ax² + bx + c = 0</code>.</li>
            <li><strong>Calculate the discriminant:</strong> Compute <code>Δ = b² - 4ac</code> to determine whether roots are two distinct reals, one repeated real, or two complex conjugates.</li>
            <li><strong>Apply the quadratic formula:</strong> Plug coefficients into <code>x = (-b ± √Δ) / 2a</code> or factor into binomials <code>(x - r₁)(x - r₂) = 0</code>.</li>
            <li><strong>Inspect step-by-step solutions:</strong> Review factored brackets, square root simplifications, and decimal approximations.</li>
          </ol>
        </section>

        {/* Static Worked Examples for Google SEO */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[#5D4037] dark:text-[#EFEBE9] text-center">
            Worked Examples: Step-by-Step Solutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Example 1 */}
            <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] space-y-3">
              <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                Example 1 · Factoring
              </span>
              <h3 className="font-bold text-lg text-[#5D4037] dark:text-[#EFEBE9]">x² - 5x + 6 = 0</h3>
              <ul className="text-sm space-y-1.5 opacity-90 font-mono">
                <li>1. Find factors of +6 that add to -5: (-2) and (-3).</li>
                <li>2. Rewrite as factored binomials: (x - 2)(x - 3) = 0.</li>
                <li>3. Apply Zero Product Property: x - 2 = 0 or x - 3 = 0.</li>
                <li className="font-bold text-[#5D4037] dark:text-emerald-400">Roots: x = 2, x = 3</li>
              </ul>
            </div>

            {/* Example 2 */}
            <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] space-y-3">
              <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                Example 2 · Quadratic Formula
              </span>
              <h3 className="font-bold text-lg text-[#5D4037] dark:text-[#EFEBE9]">2x² + 5x - 3 = 0</h3>
              <ul className="text-sm space-y-1.5 opacity-90 font-mono">
                <li>1. Identify coefficients: a = 2, b = 5, c = -3.</li>
                <li>2. Discriminant: Δ = 5² - 4(2)(-3) = 25 + 24 = 49.</li>
                <li>3. Formula: x = (-5 ± √49) / (2 · 2) = (-5 ± 7) / 4.</li>
                <li className="font-bold text-[#5D4037] dark:text-blue-400">Roots: x = 1/2, x = -3</li>
              </ul>
            </div>

            {/* Example 3 */}
            <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] space-y-3">
              <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                Example 3 · Complex Roots (Δ &lt; 0)
              </span>
              <h3 className="font-bold text-lg text-[#5D4037] dark:text-[#EFEBE9]">x² + 4x + 13 = 0</h3>
              <ul className="text-sm space-y-1.5 opacity-90 font-mono">
                <li>1. Coefficients: a = 1, b = 4, c = 13.</li>
                <li>2. Discriminant: Δ = 4² - 4(1)(13) = 16 - 52 = -36.</li>
                <li>3. Square root of negative: √(-36) = 6i.</li>
                <li className="font-bold text-[#5D4037] dark:text-purple-400">Roots: x = -2 ± 3i</li>
              </ul>
            </div>

            {/* Example 4 */}
            <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] space-y-3">
              <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                Example 4 · Completing the Square
              </span>
              <h3 className="font-bold text-lg text-[#5D4037] dark:text-[#EFEBE9]">x² + 6x - 7 = 0</h3>
              <ul className="text-sm space-y-1.5 opacity-90 font-mono">
                <li>1. Move constant: x² + 6x = 7.</li>
                <li>2. Add (6/2)² = 9 to both sides: (x + 3)² = 16.</li>
                <li>3. Take square root: x + 3 = ±4.</li>
                <li className="font-bold text-[#5D4037] dark:text-amber-400">Roots: x = 1, x = -7</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[#5D4037] dark:text-[#EFEBE9] text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-[#1B1B1B] p-5 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825]">
                <h3 className="font-semibold text-lg text-[#5D4037] dark:text-[#EFEBE9]">{faq.q}</h3>
                <p className="mt-2 text-sm sm:text-base opacity-90 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center space-y-4 pt-8 border-t border-[#E0E0E0] dark:border-[#2E2825]">
          <h3 className="text-xl font-medium">Explore Other Solvers</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/equation-solver-with-steps" className="text-blue-600 dark:text-blue-400 hover:underline">Equation Solver with Steps</Link>
            <Link href="/system-of-equations" className="text-blue-600 dark:text-blue-400 hover:underline">System of Equations</Link>
            <Link href="/inequality-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Inequality Solver</Link>
            <Link href="/matrix-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Matrix Solver</Link>
            <Link href="/formulas" className="text-blue-600 dark:text-blue-400 hover:underline">Math Formulas Sheet</Link>
            <Link href="/graph" className="text-blue-600 dark:text-blue-400 hover:underline">Online Graph Plotter</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
