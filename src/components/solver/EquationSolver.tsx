'use client';

import React, { useEffect } from 'react';
import { useSolverStore } from '@/stores/solverStore';
import EquationInput from './EquationInput';
import StepByStep from './StepByStep';
import { FunctionSquare } from 'lucide-react';

const EMPTY_STATE_MESSAGES: Record<string, string> = {
  polynomial:  'Enter any equation like  2x + 8 = 20  or  x² - 5x + 6 = 0  to get step-by-step solutions.',
  derivative:  'Enter any function like  3x² + 5x  or  sin(x)  to see step-by-step differentiation.',
  integral:    'Enter any function like  2x + 3  or  cos(x)  to see the integral with formulas used.',
  system:      'Enter 2 or more equations below to find where they intersect.',
  inequality:  'Enter an inequality like  2x - 3 > 0  to compute the solution range.',
  symbolic:    'Enter any formula like  v = u + a*t  to rearrange and solve for any variable.',
  domain_range: 'Enter any function like  f(x) = sqrt(4 - x²)  or  1/(x-3)  to find its domain and range.',
};

interface EquationSolverProps {
  initialMode?: 'polynomial' | 'derivative' | 'integral' | 'system' | 'inequality' | 'symbolic' | 'domain_range';
  initialEquation?: string;
  hideHeader?: boolean;
  wideLayout?: boolean;
}

export default function EquationSolver({
  initialMode,
  initialEquation,
  hideHeader = false,
  wideLayout = false,
}: EquationSolverProps = {}) {
  const { solverType, result, setSolverType, setEquation } = useSolverStore();

  React.useEffect(() => {
    const store = useSolverStore.getState();
    if (initialMode && store.solverType !== initialMode) {
      store.setSolverType(initialMode);
    }
    if (initialEquation && store.equation !== initialEquation) {
      store.setEquation(initialEquation);
      setTimeout(() => {
        useSolverStore.getState().solve();
      }, 50);
    }
  }, [initialMode, initialEquation]);

  // Automatically scroll smoothly to direct solution as soon as result is ready
  useEffect(() => {
    if (result && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        const el = document.getElementById('direct-solution');
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the top of the solution card is below the visible viewport or outside immediate focus
          if (rect.top > window.innerHeight * 0.45 || rect.bottom > window.innerHeight) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [result]);

  return (
    <div className="w-full h-full flex flex-col space-y-3 sm:space-y-4 animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      {/* Header */}
      {!hideHeader && (
        <header className="flex flex-col gap-2 pb-2 shrink-0 border-b border-[#E0E0E0] dark:border-[#2E2825]">
          <div className="flex items-center justify-between gap-3 pl-28 sm:pl-36 md:pl-44">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-[#131313] dark:text-white">
                  Equation Solver
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] text-[10px] font-mono font-bold uppercase dark:border-[#5D4037]/50">
                  STEP-BY-STEP
                </span>
              </div>
              <p className="text-[11px] text-[#616161] dark:text-[#A19891] hidden sm:block mt-0.5">
                Type anything — equation, function, or system — then choose what you want to do with it
              </p>
            </div>
          </div>

          {/* Quick Solver Hub Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            <span className="text-[10px] uppercase font-bold text-[#8D827A] dark:text-[#A19891] shrink-0 mr-1">
              Solvers:
            </span>
            <a
              href="/equation-solver-with-steps"
              className="px-2.5 py-1 rounded-lg bg-[#5D4037] text-white font-semibold text-[11px] shrink-0 shadow-2xs"
            >
              General Solver
            </a>
            <a
              href="/integral-calculator"
              className="px-2.5 py-1 rounded-lg bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#616161] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#332D2A] hover:bg-[#EFEBE9] dark:hover:bg-[#2A2421] text-[11px] shrink-0 transition-colors"
            >
              ∫ Integral
            </a>
            <a
              href="/derivative-calculator"
              className="px-2.5 py-1 rounded-lg bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#616161] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#332D2A] hover:bg-[#EFEBE9] dark:hover:bg-[#2A2421] text-[11px] shrink-0 transition-colors"
            >
              d/dx Derivative
            </a>
            <a
              href="/quadratic-equation-solver"
              className="px-2.5 py-1 rounded-lg bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#616161] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#332D2A] hover:bg-[#EFEBE9] dark:hover:bg-[#2A2421] text-[11px] shrink-0 transition-colors"
            >
              x² Quadratic
            </a>
            <a
              href="/domain-and-range-calculator"
              className="px-2.5 py-1 rounded-lg bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#616161] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#332D2A] hover:bg-[#EFEBE9] dark:hover:bg-[#2A2421] text-[11px] shrink-0 transition-colors"
            >
              [a,b] Domain &amp; Range
            </a>
            <a
              href="/matrix-solver"
              className="px-2.5 py-1 rounded-lg bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#616161] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#332D2A] hover:bg-[#EFEBE9] dark:hover:bg-[#2A2421] text-[11px] shrink-0 transition-colors"
            >
              [A] Matrix
            </a>
            <a
              href="/equation-solver-with-steps"
              className="px-2.5 py-1 rounded-lg bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#616161] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#332D2A] hover:bg-[#EFEBE9] dark:hover:bg-[#2A2421] text-[11px] shrink-0 transition-colors"
            >
              Step-by-Step
            </a>
          </div>
        </header>
      )}

      {/* Dual pane or Stacked layout */}
      {wideLayout ? (
        <div className="w-full flex flex-col gap-3 sm:gap-5">
          {/* Top: Full-Width Input Console */}
          <div className="w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-sm transition-colors">
            <EquationInput />
          </div>

          {/* Bottom: Expansive Full-Width Results & Steps */}
          <div className="w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-3.5 sm:p-6 md:p-8 shadow-sm min-h-[200px] sm:min-h-[360px] transition-colors">
            {result ? (
              <StepByStep />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[260px] text-center p-8 border border-dashed border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl bg-[#F5F5F5] dark:bg-[#131313]/60">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EFEBE9] border border-[#D7CCC8] dark:bg-[#24201E] dark:border-[#3E2723] mb-3 text-[#5D4037] dark:text-[#A1887F]">
                  <FunctionSquare size={28} />
                </div>
                <h3 className="text-sm font-semibold text-[#131313] dark:text-white mb-1">Awaiting Input</h3>
                <p className="text-xs text-[#616161] dark:text-[#8D827A] max-w-sm leading-relaxed">
                  {EMPTY_STATE_MESSAGES[solverType]}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-5 flex-1 min-h-0 items-start">
          {/* Left: Input + Controls */}
          <div className="w-full xl:w-[420px] shrink-0 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
            <EquationInput />
          </div>

          {/* Right: Results */}
          <div className="flex-1 w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 sm:p-6 shadow-sm min-h-[360px] overflow-y-auto transition-colors">
            {result ? (
              <StepByStep />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border border-dashed border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl bg-[#F5F5F5] dark:bg-[#131313]/60">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EFEBE9] border border-[#D7CCC8] dark:bg-[#24201E] dark:border-[#3E2723] mb-3 text-[#5D4037] dark:text-[#A1887F]">
                  <FunctionSquare size={28} />
                </div>
                <h3 className="text-sm font-semibold text-[#131313] dark:text-white mb-1">Awaiting Input</h3>
                <p className="text-xs text-[#616161] dark:text-[#8D827A] max-w-sm leading-relaxed">
                  {EMPTY_STATE_MESSAGES[solverType]}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
