import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// Using a lazy load or import for the client component
import EquationSolver from '@/components/solver/EquationSolver';

export function generateMetadata(): Metadata {
  return {
    title: 'Quadratic Equation Solver — Solve ax²+bx+c=0 Step by Step | Easy Equate',
    description: 'Free quadratic equation solver with step-by-step working. Enter any ax²+bx+c=0 equation and get solutions using the quadratic formula, factoring, or completing the square. Handles real and complex roots.',
    keywords: [
      'quadratic equation solver', 'solve quadratic equation', 'quadratic formula calculator',
      'ax2 bx c 0 solver', 'quadratic equation step by step', 'factoring quadratic equations',
      'completing the square calculator', 'discriminant calculator', 'quadratic roots calculator',
    ],
    alternates: {
      canonical: '/quadratic-equation-solver',
    },
  };
}

export default function QuadraticEquationSolverPage() {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "EasyEquate Quadratic Equation Solver",
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
            "name": "What is the quadratic formula?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a. It is used to find the roots of a quadratic equation ax² + bx + c = 0."
            }
          },
          {
            "@type": "Question",
            "name": "How do I factor?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Factoring involves finding two numbers that multiply to c (or a*c) and add to b, then grouping the terms to factor out common expressions."
            }
          },
          {
            "@type": "Question",
            "name": "What is discriminant?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The discriminant is the part of the quadratic formula under the square root, b² - 4ac. It tells you the number and type of roots."
            }
          },
          {
            "@type": "Question",
            "name": "Can it solve imaginary roots?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, if the discriminant is negative, the solver will show the complex or imaginary roots."
            }
          },
          {
            "@type": "Question",
            "name": "Is it free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our quadratic equation solver is completely free to use with no sign-up required."
            }
          }
        ]
      }
    ]
  };

  return (
    <main className="min-h-screen bg-[#EFEBE9] dark:bg-[#131313] text-[#5D4037] dark:text-[#EFEBE9] p-4 md:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }}
      />
      
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5D4037] dark:text-[#EFEBE9]">
            Quadratic Equation Solver — Step-by-Step
          </h1>
          <div className="text-lg md:text-xl max-w-2xl mx-auto space-y-4">
            <p>
              A quadratic equation is a second-degree polynomial equation in a single variable x with the form <em>ax² + bx + c = 0</em>, where x represents an unknown, and a, b, and c represent known numbers, with a ≠ 0.
            </p>
            <p>
              Our solver provides step-by-step solutions using multiple methods: factoring, completing the square, and the quadratic formula. Simply enter your equation to see every step of the working.
            </p>
          </div>
        </header>

        <section className="bg-white dark:bg-[#3E2723] p-6 rounded-xl shadow-sm border border-[#E0E0E0] dark:border-[#5D4037]">
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Enter equation:</strong> Type your quadratic equation in the input box.</li>
            <li><strong>Choose method:</strong> Select whether you want to use the formula, factoring, or completing the square (or let the solver decide).</li>
            <li><strong>See every step:</strong> The solver will break down the math process line by line.</li>
          </ol>
        </section>

        {/* Worked Examples — static HTML for SEO indexing */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Worked Examples</h2>
          <p className="text-center opacity-75">See how the quadratic formula and factoring work on real equations.</p>

          {/* Example 1 */}
          <div className="bg-white dark:bg-[#3E2723] p-6 rounded-xl border border-[#E0E0E0] dark:border-[#5D4037] space-y-3">
            <h3 className="text-xl font-semibold">Example 1: Solve x² − 5x + 6 = 0 (Factoring)</h3>
            <p>Here <strong>a = 1, b = −5, c = 6</strong>. We need two numbers that multiply to 6 and add to −5. Those are −2 and −3.</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Write in factored form: <strong>(x − 2)(x − 3) = 0</strong></li>
              <li>Set each factor to zero: x − 2 = 0 → <strong>x = 2</strong></li>
              <li>And: x − 3 = 0 → <strong>x = 3</strong></li>
            </ol>
            <p className="font-medium text-green-700 dark:text-green-400">✓ Solutions: x = 2 and x = 3</p>
          </div>

          {/* Example 2 */}
          <div className="bg-white dark:bg-[#3E2723] p-6 rounded-xl border border-[#E0E0E0] dark:border-[#5D4037] space-y-3">
            <h3 className="text-xl font-semibold">Example 2: Solve 2x² + 3x − 2 = 0 (Quadratic Formula)</h3>
            <p>Here <strong>a = 2, b = 3, c = −2</strong>. Apply the quadratic formula x = (−b ± √(b² − 4ac)) / 2a:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Discriminant: Δ = 3² − 4(2)(−2) = 9 + 16 = <strong>25</strong></li>
              <li>√Δ = <strong>5</strong></li>
              <li>x = (−3 + 5) / 4 = 2/4 = <strong>½</strong></li>
              <li>x = (−3 − 5) / 4 = −8/4 = <strong>−2</strong></li>
            </ol>
            <p className="font-medium text-green-700 dark:text-green-400">✓ Solutions: x = ½ and x = −2</p>
          </div>

          {/* Example 3 — complex roots */}
          <div className="bg-white dark:bg-[#3E2723] p-6 rounded-xl border border-[#E0E0E0] dark:border-[#5D4037] space-y-3">
            <h3 className="text-xl font-semibold">Example 3: Solve x² + x + 1 = 0 (Complex Roots)</h3>
            <p>Here <strong>a = 1, b = 1, c = 1</strong>. The discriminant is negative, so roots are complex:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Discriminant: Δ = 1² − 4(1)(1) = 1 − 4 = <strong>−3</strong></li>
              <li>√(−3) = i√3</li>
              <li>x = (−1 + i√3) / 2 and x = (−1 − i√3) / 2</li>
            </ol>
            <p className="font-medium text-blue-700 dark:text-blue-400">✓ Solutions: x = (−1 ± i√3) / 2 (complex conjugate pair)</p>
          </div>
        </section>

        <section className="flex justify-center">
          <Suspense fallback={<div className="p-8 text-center">Loading solver...</div>}>
            <div className="w-full bg-white dark:bg-[#1B1B1B] p-4 sm:p-6 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2E2825]">
              <EquationSolver initialMode="polynomial" initialEquation="x^2 - 5x + 6 = 0" hideHeader />
            </div>
          </Suspense>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "What is the quadratic formula?",
                a: "The quadratic formula is x = (−b ± √(b² − 4ac)) / 2a. It solves any quadratic equation ax² + bx + c = 0 by substituting the coefficients a, b, and c. The ± gives two solutions."
              },
              {
                q: "How do you solve a quadratic equation by factoring?",
                a: "Find two numbers that multiply to c (or a×c for non-monic equations) and add to b. Rewrite the middle term and group the factors. Set each factor equal to zero and solve. Factoring only works when the discriminant is a perfect square."
              },
              {
                q: "What is the discriminant and what does it tell you?",
                a: "The discriminant is Δ = b² − 4ac. If Δ > 0, the equation has two distinct real roots. If Δ = 0, it has one repeated real root. If Δ < 0, it has two complex (imaginary) roots with no real solution."
              },
              {
                q: "How do you complete the square to solve a quadratic equation?",
                a: "Move c to the right side, divide by a so the x² coefficient is 1, then add (b/2a)² to both sides to form a perfect square trinomial. Take the square root of both sides and solve for x."
              },
              {
                q: "Can this solver handle complex or imaginary roots?",
                a: "Yes. When the discriminant is negative, the solver automatically computes the complex conjugate roots in the form p ± qi and shows every step."
              },
              {
                q: "Is this quadratic equation solver free?",
                a: "Yes, completely free. No account, no sign-up, no ads blocking your results. Just enter your equation and get step-by-step working instantly."
              },
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
            <Link href="/solver" className="text-blue-600 dark:text-blue-400 hover:underline">General Math Solver</Link>
            <Link href="/integral-calculator" className="text-blue-600 dark:text-blue-400 hover:underline">Integral Calculator</Link>
            <Link href="/derivative-calculator" className="text-blue-600 dark:text-blue-400 hover:underline">Derivative Calculator</Link>
            <Link href="/formulas" className="text-blue-600 dark:text-blue-400 hover:underline">Maths Formula Sheet</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
