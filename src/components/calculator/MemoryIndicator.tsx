'use client';

import React from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';

export default function MemoryIndicator() {
  const { memoryAdd, memorySub, memoryRecall, memoryClear } = useCalculatorStore();

  const memoryButtons = [
    { label: 'MC', action: memoryClear, title: 'Memory Clear' },
    { label: 'MR', action: memoryRecall, title: 'Memory Recall' },
    { label: 'M+', action: memoryAdd, title: 'Memory Add' },
    { label: 'M−', action: memorySub, title: 'Memory Subtract' },
  ];

  return (
    <div className="flex gap-1 sm:gap-1.5 shrink-0">
      {memoryButtons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.action}
          className="calc-btn-memory px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[30px] flex items-center justify-center transition-colors border border-gray-200/50 dark:border-gray-700/50"
          title={btn.title}
          aria-label={btn.title}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
