'use client';

import React from 'react';
import { FormulaEntry } from '@/types/formula';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { useRouter } from 'next/navigation';

export default function FormulaCard({ formula }: { formula: FormulaEntry }) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2.5 gap-2">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 leading-snug">
            {formula.name}
          </h3>
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md shrink-0">
            {formula.category}
          </span>
        </div>

        <div className="my-3 py-3 px-2 overflow-x-auto text-center flex justify-center items-center flex-grow bg-gray-50 dark:bg-gray-900 rounded-lg max-w-full text-sm sm:text-base">
          <MathDisplay math={formula.latex} block />
        </div>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
          {formula.description}
        </p>

        <div className="flex flex-wrap gap-1 mt-auto">
          {formula.tags.map((tag) => (
            <span key={tag} className="text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 p-2.5 sm:p-3 flex gap-2">
        <button
          type="button"
          onClick={() => router.push(`/calculator?formula=${encodeURIComponent(formula.calculatorExpression || formula.latex)}`)}
          className="flex-1 text-xs sm:text-sm font-medium py-2 px-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 text-center min-h-[38px] flex items-center justify-center shadow-2xs"
          aria-label={`Use ${formula.name} in Calculator`}
        >
          In Calculator
        </button>
        <button
          type="button"
          onClick={() => router.push(`/solver?formula=${encodeURIComponent(formula.solverExpression || formula.latex)}`)}
          className="flex-1 text-xs sm:text-sm font-medium py-2 px-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 text-center min-h-[38px] flex items-center justify-center shadow-2xs"
          aria-label={`Use ${formula.name} in Solver`}
        >
          In Solver
        </button>
      </div>
    </div>
  );
}
