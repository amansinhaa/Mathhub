'use client';

import React from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { MathDisplay } from '@/components/shared/MathDisplay';

export default function Display() {
  const { expression, resultLatex, result, angleMode, isError, memory } = useCalculatorStore();

  return (
    <div className="relative flex flex-col items-end justify-end p-3 sm:p-4 mb-2 sm:mb-3 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-inner min-h-[85px] sm:min-h-[110px] max-h-[140px] shrink-0 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
      <div className="absolute top-2.5 left-3 sm:top-3.5 sm:left-4 flex items-center gap-2">
        <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {angleMode}
        </span>
        {memory.hasValue && (
          <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
            M ({memory.value})
          </span>
        )}
      </div>

      <div className="w-full overflow-x-auto text-right whitespace-nowrap scrollbar-hide text-sm sm:text-lg font-mono text-gray-600 dark:text-gray-300 min-h-[1.25rem] sm:min-h-[1.5rem]">
        {expression || <span className="opacity-0">0</span>}
      </div>

      <div
        className={`w-full overflow-x-auto text-right whitespace-nowrap scrollbar-hide text-2xl sm:text-3xl md:text-4xl font-semibold mt-1 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-end ${
          isError ? 'text-red-500 dark:text-red-400 font-medium text-lg sm:text-xl' : 'text-gray-900 dark:text-white'
        }`}
      >
        {resultLatex ? (
          <MathDisplay math={resultLatex} block={false} />
        ) : result ? (
          <span>{result}</span>
        ) : (
          <span>0</span>
        )}
      </div>
    </div>
  );
}
