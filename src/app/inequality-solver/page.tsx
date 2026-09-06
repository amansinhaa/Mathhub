import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import EquationSolver from '@/components/solver/EquationSolver';

export function generateMetadata(): Metadata {
  return {
    title: 'Inequality Solver with Number Line — Step-by-Step | EasyEquate',
    description: 'Free step-by-step inequality solver with interactive number line. Solves linear and quadratic inequalities with intervals and visual rays shown.',
    alternates: {
      canonical: '/inequality-solver',
    },
    openGraph: {
      title: 'Inequality Solver with Steps & Number Line | EasyEquate',
      description: 'Solve any inequality step-by-step. Features interval notation, sign testing, and interactive number line graphs.',
      url: 'https://easyequate.com/inequality-solver',
    },
  };
}

export default function InequalitySolverPage() {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does the inequality solver graph on a number line?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The solver computes boundary roots and displays an interactive SVG number line with open circles for strict inequalities (<, >) and solid closed circles for inclusive inequalities (<=, >=), shading the solution ray."
            }
          },
          {
            "@type": "Question",
            "name": "What happens when dividing an inequality by a negative number?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "When you multiply or divide both sides by a negative number, the direction of the inequality sign must flip (e.g. > becomes <)."
            }
          },
          {
            "@type": "Question",
            "name": "Can it solve quadratic inequalities like x² - 4 > 0?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, it finds the critical roots and tests the sign of each interval to determine whether the solution is outside the roots (x < -2 or x > 2) or between them."
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
            <span>INEQUALITY ENGINE</span>
            <span>•</span>
            <span>NUMBER LINE GRAPH</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
            Inequality Solver with Steps
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] max-w-3xl">
            Solves linear and quadratic inequalities with interval solutions, sign reversal test points, and an interactive real number line.
          </p>
        </header>

        {/* Live Interactive Solver Widget — Immediate Above-the-Fold Access */}
        <section className="w-full">
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#757575]">Loading solver workstation...</div>}>
            <EquationSolver initialMode="inequality" initialEquation="x^2 - 5x + 6 > 0" hideHeader wideLayout />
          </Suspense>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Feature 1</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Boundary Roots</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Identifies the critical zero-crossings where the polynomial changes sign along the continuous real axis.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Feature 2</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Interval Testing</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Tests sample points in each region to determine whether the function values are strictly positive or negative.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Feature 3</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">SVG Number Line</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Instantly plots shaded solution rays with open <code className="font-mono">○</code> or closed <code className="font-mono">●</code> boundary circles.
            </p>
          </div>
        </section>

        <footer className="text-center space-y-4 pt-4 border-t border-[#E0E0E0] dark:border-[#2E2825]">
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">Related Solvers</h3>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <Link href="/quadratic-equation-solver" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">Quadratic Solver</Link>
            <Link href="/equation-solver-with-steps" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">Polynomial Solver</Link>
            <Link href="/graph" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">2D Graph Plotter</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
