'use client';

import { useCalculatorStore } from '@/stores/calculatorStore';

export default function MemoryIndicator() {
  const { memoryAdd, memorySub, memoryRecall, memoryClear } = useCalculatorStore();

  const memoryButtons = [
    { label: 'MC', action: memoryClear },
    { label: 'MR', action: memoryRecall },
    { label: 'M+', action: memoryAdd },
    { label: 'M−', action: memorySub },
  ];

  return (
    <div className="flex gap-2">
      {memoryButtons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.action}
          className="calc-btn-memory px-3 py-1 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
