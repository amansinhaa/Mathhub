'use client';

import React, { useState } from 'react';
import { useSolverStore } from '@/stores/solverStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { HelpCircle, X, AlertCircle } from 'lucide-react';
import { SYNTAX_HELP } from '@/lib/math/normalizer';

export default function EquationInput() {
  const { equation, setEquation, solverType, solveForVariable, setSolveForVariable, solve, isLoading, error } = useSolverStore();
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equation.trim()) {
      solve();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="equation" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
              Enter your {solverType} equation
            </label>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors min-h-[30px] ${
                showHelp
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              aria-label="Toggle Syntax Guide"
            >
              <HelpCircle size={14} />
              <span>Syntax</span>
            </button>
          </div>

          {/* Syntax Help Panel */}
          {showHelp && (
            <div className="mb-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3 text-xs space-y-1.5 animate-fade-in shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-blue-800 dark:text-blue-200">✏️ Input Syntax Guide</span>
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="p-1 text-blue-400 hover:text-blue-600 rounded"
                  aria-label="Close syntax guide"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-blue-700 dark:text-blue-300 mb-2 leading-relaxed">
                Type using <strong>Unicode superscripts</strong> (x², x³) or <strong>caret notation</strong> (x^2, x^3). Both work seamlessly!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {SYNTAX_HELP.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <code className="bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded text-blue-900 dark:text-blue-100 font-mono text-[11px] whitespace-nowrap">
                      {item.input}
                    </code>
                    <span className="text-blue-600 dark:text-blue-400">{item.description}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400">
                <strong>💡 Examples:</strong> Type <code className="bg-white dark:bg-gray-800 px-1 rounded">x³+3x+5=0</code> or <code className="bg-white dark:bg-gray-800 px-1 rounded">72t³+4t-76=0</code>
              </div>
            </div>
          )}

          <input
            id="equation"
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm sm:text-base shadow-xs"
            placeholder={
              solverType === 'polynomial' ? 'e.g. x²-5x+6=0  or  x^3-2x^2-x+2=0' :
              solverType === 'inequality' ? 'e.g. 2x - 3 > 0' :
              'e.g. v = u + a*t'
            }
          />
        </div>

        {/* Error Feedback Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-xs sm:text-sm text-red-700 dark:text-red-300 animate-fade-in">
            <AlertCircle size={17} className="shrink-0 text-red-500 mt-0.5" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {solverType === 'symbolic' && (
          <div>
            <label htmlFor="solveFor" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Solve for Variable
            </label>
            <input
              id="solveFor"
              type="text"
              value={solveForVariable}
              onChange={(e) => setSolveForVariable(e.target.value)}
              className="w-full sm:w-1/3 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
              placeholder="e.g. a"
            />
          </div>
        )}

        {/* Live KaTeX Preview with text wrap / contained overflow */}
        {equation && (
          <div className="p-3 sm:p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/30 overflow-x-auto text-center max-w-full">
            <span className="text-[11px] sm:text-xs font-semibold text-blue-600/80 dark:text-blue-400/80 block mb-1">Live LaTeX Preview</span>
            <div className="text-base sm:text-xl overflow-x-auto max-w-full py-1">
              <MathDisplay math={equation} />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !equation.trim()}
        className="w-full py-2.5 sm:py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm sm:text-base shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
      >
        {isLoading ? 'Solving...' : 'Solve Equation'}
      </button>
    </form>
  );
}
