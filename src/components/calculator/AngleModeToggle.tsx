'use client';

import React from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import type { AngleMode } from '@/types/calculator';

export default function AngleModeToggle() {
  const { angleMode, setAngleMode } = useCalculatorStore();
  const modes: AngleMode[] = ['DEG', 'RAD', 'GRAD'];

  return (
    <div className="flex bg-[#F5F5F5] dark:bg-[#1B1B1B] p-0.5 sm:p-1 rounded-full border border-[#E0E0E0] dark:border-[#2E2825] shadow-inner w-max shrink-0 transition-colors">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setAngleMode(mode)}
          className={`px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-all duration-150 min-h-[30px] flex items-center justify-center ${
            angleMode === mode
              ? 'bg-[#5D4037] text-white shadow-xs font-bold'
              : 'text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white'
          }`}
          aria-label={`Set angle mode to ${mode}`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
