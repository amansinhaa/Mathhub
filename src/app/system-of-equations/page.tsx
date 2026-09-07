import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import EquationSolver from '@/components/solver/EquationSolver';

export function generateMetadata(): Metadata {
  return {
    title: "System of Equations Solver — Step-by-Step with Cramer's Rule | EasyEquate",
    description: "Free system of equations solver. Solves 2x2 and 3x3 linear systems step-by-step using Cramer's Rule, substitution, and Gaussian elimination. Free.",
    alternates: {
      canonical: '/system-of-equations',
    },
    openGraph: {
      title: 'System of Equations Solver with Steps | EasyEquate',
      description: 'Solve simultaneous linear equations step-by-step. Free with full matrix and elimination workings shown.',
      url: 'https://www.easyequate.com/system-of-equations',
    },
  };
}

export default function SystemOfEquationsPage() {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does the system of equations solver work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Enter your equations separated by commas (e.g. 2x + y = 7, x - y = 2). The solver sets up the matrix form Ax = b and computes the determinant using Cramer's Rule or Gaussian elimination to find the exact intersection point."
            }
          },
          {
            "@type": "Question",
            "name": "Can it solve 3-variable systems?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, it supports systems with x, y, and z variables using row reduction and back-substitution."
            }
          },
          {
            "@type": "Question",
            "name": "What happens if a system has no solution?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "When the determinant is zero, the solver identifies whether the lines are parallel (inconsistent / no solution) or coincident (infinitely many solutions)."
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
            <span>LINEAR ALGEBRA</span>
            <span>•</span>
            <span>SIMULTANEOUS EQUATIONS</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
            System of Equations Solver
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] max-w-3xl">
            Solves 2×2 and 3×3 simultaneous equations with Cramer's Rule, Gaussian elimination, substitution, and geometric intersections.
          </p>
        </header>

        {/* Live Interactive Solver Widget — Immediate Above-the-Fold Access */}
        <section className="w-full">
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#757575]">Loading solver workstation...</div>}>
            <EquationSolver initialMode="system" initialEquation="2x + y = 7, x - y = 2" hideHeader wideLayout />
          </Suspense>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Method 1</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Cramer's Rule</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Evaluates the determinant <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">det(A)</code> and calculates variables by matrix column substitution.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Method 2</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Gaussian Elimination</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Transforms augmented matrices into row-echelon form, ideal for 3-variable and higher dimensional systems.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase">Method 3</span>
            <h3 className="font-bold text-base text-[#131313] dark:text-white">Geometric Intersection</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891]">
              Instantly transfer your system into the 2D Graph Plotter to see the visual point of intersection <code className="font-mono bg-[#F5F5F5] dark:bg-[#22201F] px-1 rounded">(x, y)</code>.
            </p>
          </div>
        </section>

        <footer className="text-center space-y-4 pt-4 border-t border-[#E0E0E0] dark:border-[#2E2825]">
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">Related Solvers</h3>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <Link href="/matrix-solver" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">Matrix Studio</Link>
            <Link href="/quadratic-equation-solver" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">Quadratic Solver</Link>
            <Link href="/graph" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">2D Graph Plotter</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
