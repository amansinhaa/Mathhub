'use client';

import { useCalculatorStore } from '@/stores/calculatorStore';
import { MathDisplay } from '@/components/shared/MathDisplay';

export default function Display() {
  const { expression, resultLatex, result, angleMode, isError, memory } = useCalculatorStore();

  return (
    <div className="relative flex flex-col items-end justify-end p-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-inner min-h-[120px] overflow-hidden">
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          {angleMode}
        </span>
        {memory.hasValue && (
          <span className="text-xs font-bold text-blue-500 dark:text-blue-400">
            M ({memory.value})
          </span>
        )}
      </div>

      <div className="w-full overflow-x-auto text-right whitespace-nowrap scrollbar-hide text-xl font-mono text-gray-600 dark:text-gray-300 min-h-[1.75rem]">
        {expression}
      </div>

      <div
        className={`w-full overflow-x-auto text-right whitespace-nowrap scrollbar-hide text-4xl font-semibold mt-2 min-h-[3rem] flex items-center justify-end ${
          isError ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'
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
