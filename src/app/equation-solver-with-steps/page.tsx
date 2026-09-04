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
    <main className="min-h-screen bg-[#EFEBE9] dark:bg-[#131313] text-[#5D4037] dark:text-[#EFEBE9] p-4 md:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }}
      />
      
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5D4037] dark:text-[#EFEBE9]">
            Equation Solver with Steps — See Every Working
          </h1>
          <div className="text-lg md:text-xl max-w-2xl mx-auto space-y-4">
            <p>
              Stuck on a math problem? Our step-by-step equation solver breaks down complex equations into understandable chunks.
            </p>
            <p>
              Whether you are working with simple linear equations, quadratics, complex polynomials, or systems of equations, our solver will show you exactly how to arrive at the correct answer.
            </p>
          </div>
        </header>

        <section className="bg-white dark:bg-[#3E2723] p-6 rounded-xl shadow-sm border border-[#E0E0E0] dark:border-[#5D4037]">
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Enter equation:</strong> Type your linear, quadratic, or polynomial equation.</li>
            <li><strong>Choose method:</strong> Select an appropriate solving method if applicable.</li>
            <li><strong>See every step:</strong> Follow along as we break down the math process line by line.</li>
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
            <Link href="/solver" className="text-blue-600 dark:text-blue-400 hover:underline">General Math Solver</Link>
            <Link href="/quadratic-equation-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Quadratic Equation Solver</Link>
            <Link href="/matrix-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Matrix Solver</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
