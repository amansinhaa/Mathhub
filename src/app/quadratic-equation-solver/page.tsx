import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// Using a lazy load or import for the client component
import EquationSolver from '@/components/solver/EquationSolver';

export function generateMetadata(): Metadata {
  return {
    title: 'Quadratic Equation Solver — Step-by-Step with Formulas | EasyEquate',
    description: 'Solve any quadratic equation step-by-step. Enter ax² + bx + c = 0 and get factoring, completing the square, and quadratic formula methods shown. Free.',
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

        <section className="flex justify-center">
          <Suspense fallback={<div className="p-8 text-center">Loading solver...</div>}>
            <div className="w-full max-w-2xl bg-white dark:bg-[#3E2723] p-6 rounded-xl shadow border border-[#E0E0E0] dark:border-[#5D4037]">
              <EquationSolver />
            </div>
          </Suspense>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What is the quadratic formula?", a: "The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a. It is used to find the roots of a quadratic equation ax² + bx + c = 0." },
              { q: "How do I factor?", a: "Factoring involves finding two numbers that multiply to c (or a*c) and add to b, then grouping the terms to factor out common expressions." },
              { q: "What is discriminant?", a: "The discriminant is the part of the quadratic formula under the square root, b² - 4ac. It tells you the number and type of roots." },
              { q: "Can it solve imaginary roots?", a: "Yes, if the discriminant is negative, the solver will show the complex or imaginary roots." },
              { q: "Is it free?", a: "Yes, our quadratic equation solver is completely free to use with no sign-up required." }
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
            <Link href="/equation-solver-with-steps" className="text-blue-600 dark:text-blue-400 hover:underline">Equation Solver with Steps</Link>
            <Link href="/matrix-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Matrix Solver</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
