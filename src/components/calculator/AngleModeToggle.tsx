'use client';

import React from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import type { AngleMode } from '@/types/calculator';

export default function AngleModeToggle() {
  const { angleMode, setAngleMode } = useCalculatorStore();
  const modes: AngleMode[] = ['DEG', 'RAD', 'GRAD'];

  return (
    <div className="flex bg-gray-200 dark:bg-gray-800 p-0.5 sm:p-1 rounded-full shadow-inner w-max shrink-0">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setAngleMode(mode)}
          className={`px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-all duration-200 ease-in-out min-h-[30px] flex items-center justify-center ${
            angleMode === mode
              ? 'bg-blue-500 text-white shadow-xs font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          aria-label={`Set angle mode to ${mode}`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
