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
          className="calc-btn-memory px-2.5 sm:px-3 py-1 text-xs font-mono font-bold min-h-[30px]"
          title={btn.title}
          aria-label={btn.title}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
