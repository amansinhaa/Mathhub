'use client';

import React, { useState } from 'react';
import { useSolverStore } from '@/stores/solverStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { HelpCircle, X } from 'lucide-react';
import { SYNTAX_HELP } from '@/lib/math/normalizer';

export default function EquationInput() {
  const { equation, setEquation, solverType, solveForVariable, setSolveForVariable, solve, isLoading } = useSolverStore();
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equation.trim()) {
      solve();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="equation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter your {solverType} equation
            </label>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg transition-colors ${
                showHelp
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                  : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <HelpCircle size={13} />
              <span>Syntax</span>
            </button>
          </div>

          {/* Syntax Help Panel */}
          {showHelp && (
            <div className="mb-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3 text-xs space-y-1.5 animate-fade-in">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-blue-800 dark:text-blue-200">✏️ Input Syntax Guide</span>
                <button type="button" onClick={() => setShowHelp(false)} className="text-blue-400 hover:text-blue-600">
                  <X size={14} />
                </button>
              </div>
              <p className="text-blue-700 dark:text-blue-300 mb-2">
                Type using <strong>Unicode superscripts</strong> (x², x³) or <strong>caret notation</strong> (x^2, x^3). Both work!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
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
                <strong>💡 Examples:</strong> Type <code className="bg-white dark:bg-gray-800 px-1 rounded">x³+3x+5</code> or <code className="bg-white dark:bg-gray-800 px-1 rounded">72t³+4t-76=0</code>
              </div>
            </div>
          )}

          <input
            id="equation"
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
            placeholder={
              solverType === 'polynomial' ? 'e.g. x²-5x+6=0  or  x^2-5x+6=0' :
              solverType === 'inequality' ? 'e.g. 2x - 3 > 0' :
              'e.g. v = u + a*t'
            }
          />
        </div>

        {solverType === 'symbolic' && (
          <div>
            <label htmlFor="solveFor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Solve for
            </label>
            <input
              id="solveFor"
              type="text"
              value={solveForVariable}
              onChange={(e) => setSolveForVariable(e.target.value)}
              className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
              placeholder="e.g. a"
            />
          </div>
        )}

        {equation && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 overflow-x-auto text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Preview</span>
            <div className="text-xl">
              <MathDisplay math={equation} />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !equation.trim()}
        className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Solving...' : 'Solve'}
      </button>
    </form>
  );
}
