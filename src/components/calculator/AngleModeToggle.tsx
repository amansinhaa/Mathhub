'use client';

import { useCalculatorStore } from '@/stores/calculatorStore';
import type { AngleMode } from '@/types/calculator';

export default function AngleModeToggle() {
  const { angleMode, setAngleMode } = useCalculatorStore();
  const modes: AngleMode[] = ['DEG', 'RAD', 'GRAD'];

  return (
    <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-full shadow-inner w-max">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => setAngleMode(mode)}
          className={`px-4 py-1 text-xs font-semibold rounded-full transition-all duration-200 ease-in-out ${
            angleMode === mode
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
