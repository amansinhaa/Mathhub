'use client';

import React from 'react';
import { FormulaEntry } from '@/types/formula';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { useRouter } from 'next/navigation';

export default function FormulaCard({ formula }: { formula: FormulaEntry }) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{formula.name}</h3>
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md">
            {formula.category}
          </span>
        </div>

        <div className="my-4 py-4 overflow-x-auto text-center flex justify-center items-center flex-grow bg-gray-50 dark:bg-gray-900 rounded-lg">
          <MathDisplay math={formula.latex} block />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{formula.description}</p>

        <div className="flex flex-wrap gap-1 mt-auto">
          {formula.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 p-3 flex space-x-2">
        <button
          onClick={() => router.push(`/calculator?formula=${encodeURIComponent(formula.calculatorExpression || formula.latex)}`)}
          className="flex-1 text-sm font-medium py-1.5 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 text-center"
        >
          Use in Calculator
        </button>
        <button
          onClick={() => router.push(`/solver?formula=${encodeURIComponent(formula.solverExpression || formula.latex)}`)}
          className="flex-1 text-sm font-medium py-1.5 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 text-center"
        >
          Use in Solver
        </button>
      </div>
    </div>
  );
}
