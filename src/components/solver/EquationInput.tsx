'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSolverStore } from '@/stores/solverStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { HelpCircle, X, AlertCircle } from 'lucide-react';
import { SYNTAX_HELP } from '@/lib/math/normalizer';

function SolverQuerySync() {
  const searchParams = useSearchParams();
  const { setEquation, setSolverType, setSolveForVariable, setQuadraticMethod, solve } = useSolverStore();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['polynomial', 'system', 'inequality', 'symbolic'].includes(tab)) {
      setSolverType(tab as any);
    }

    const method = searchParams.get('method');
    if (method && ['auto', 'factoring', 'completing_square', 'formula'].includes(method)) {
      setQuadraticMethod(method as any);
    }

    const variable = searchParams.get('var');
    if (variable) {
      setSolveForVariable(variable);
    }

    const formula = searchParams.get('formula') || searchParams.get('eq');
    if (formula) {
      setEquation(formula);
      // Automatically trigger solve on mount with a tick delay so store state settles
      setTimeout(() => {
        useSolverStore.getState().solve();
      }, 50);
    }
  }, [searchParams, setEquation, setSolverType, setSolveForVariable, setQuadraticMethod]);

  return null;
}

export default function EquationInput() {
  const { 
    equation, 
    setEquation, 
    solverType, 
    quadraticMethod,
    setQuadraticMethod,
    solveForVariable, 
    setSolveForVariable, 
    solve, 
    isLoading, 
    error 
  } = useSolverStore();
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equation.trim()) {
      solve();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <Suspense fallback={null}>
        <SolverQuerySync />
      </Suspense>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="equation" className="block text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8]">
              {solverType === 'polynomial'
                ? 'Enter Polynomial'
                : solverType === 'inequality'
                ? 'Enter Inequality'
                : 'Enter Expression or Equation'}
            </label>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg transition-colors border ${
                showHelp
                  ? 'bg-[#5D4037] text-white border-[#795548]'
                  : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white'
              }`}
              aria-label="Toggle Syntax Guide"
            >
              <HelpCircle size={13} />
              <span>Syntax</span>
            </button>
          </div>

          {/* Syntax Help Panel */}
          {showHelp && (
            <div className="mb-3 bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#3E2723] rounded-xl p-3 text-xs space-y-1.5 animate-fade-in shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8]">Input Syntax Guide</span>
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="p-1 text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white rounded"
                  aria-label="Close syntax guide"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-[#616161] dark:text-[#A19891] mb-2 leading-relaxed text-[11px]">
                Type using <strong>Unicode superscripts</strong> (x², x³) or <strong>caret notation</strong> (x^2, x^3). Both work seamlessly!
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {SYNTAX_HELP.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <code className="bg-white dark:bg-[#1B1B1B] px-1.5 py-0.5 rounded text-[#5D4037] dark:text-[#D7CCC8] font-mono text-[11px] border border-[#E0E0E0] dark:border-[#2E2825]">
                      {item.input}
                    </code>
                    <span className="text-[#757575] dark:text-[#8D827A] text-[11px]">{item.description}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-[#E0E0E0] dark:border-[#2E2825] text-[#5D4037] dark:text-[#D7CCC8] text-[11px]">
                <strong>Examples:</strong> <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded border border-[#E0E0E0] dark:border-[#2E2825]">x³+3x+5=0</code> or <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded border border-[#E0E0E0] dark:border-[#2E2825]">72t³+4t-76=0</code>
              </div>
            </div>
          )}

          <input
            id="equation"
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-sm shadow-xs"
            placeholder={
              solverType === 'polynomial' ? 'e.g. x²-5x+6=0  or  x^3-2x^2-x+2=0' :
              solverType === 'inequality' ? 'e.g. 2x - 3 > 0' :
              'e.g. v = u + a*t'
            }
          />

          {/* Quadratic Method Selector (when in polynomial mode) */}
          {solverType === 'polynomial' && (
            <div className="mt-2.5 pt-2 border-t border-[#E0E0E0] dark:border-[#282422]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">
                  Quadratic Method:
                </span>
                <span className="text-[10px] font-mono text-[#5D4037] dark:text-[#D7CCC8]">
                  {quadraticMethod === 'auto' ? 'Auto (Factoring with Formula fallback)' :
                   quadraticMethod === 'factoring' ? 'Factoring (AC Method)' :
                   quadraticMethod === 'completing_square' ? 'Completing the Square' :
                   'Quadratic Formula'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {(
                  [
                    { id: 'auto', label: 'Auto' },
                    { id: 'factoring', label: 'Factoring' },
                    { id: 'completing_square', label: 'Square' },
                    { id: 'formula', label: 'Formula' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setQuadraticMethod(m.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                      quadraticMethod === m.id
                        ? 'bg-[#5D4037] text-white border-[#795548] shadow-2xs font-bold'
                        : 'bg-[#F5F5F5] dark:bg-[#181818] text-[#616161] dark:text-[#A19891] border-[#E0E0E0] dark:border-[#282422] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Feedback Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-[#3E2723]/60 border border-red-200 dark:border-[#5D4037]/60 flex items-start gap-2.5 text-xs text-red-600 dark:text-[#FFAB91] animate-fade-in font-mono">
            <AlertCircle size={16} className="shrink-0 text-red-500 dark:text-[#FFAB91] mt-0.5" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {solverType === 'symbolic' && (
          <div>
            <label htmlFor="solveFor" className="block text-xs font-mono font-medium text-[#5D4037] dark:text-[#D7CCC8] mb-1">
              Solve for Variable
            </label>
            <input
              id="solveFor"
              type="text"
              value={solveForVariable}
              onChange={(e) => setSolveForVariable(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-1.5 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-xs"
              placeholder="e.g. a"
            />
          </div>
        )}

        {/* Live KaTeX Preview */}
        {equation && (
          <div className="p-3 rounded-xl bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#2E2825] text-center max-w-full">
            <span className="text-[10px] font-mono font-semibold text-[#757575] dark:text-[#8D827A] block mb-1">Live LaTeX Preview</span>
            <div className="text-sm sm:text-base overflow-x-auto max-w-full py-1 text-[#131313] dark:text-white">
              <MathDisplay math={equation} />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !equation.trim()}
        className="w-full py-3 px-5 rounded-xl bg-[#5D4037] hover:bg-[#6D4C41] active:bg-[#4E342E] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center border border-[#795548]/50"
      >
        {isLoading ? 'Solving...' : 'Solve Equation'}
      </button>
    </form>
  );
}
