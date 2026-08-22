'use client';

import React from 'react';
import { SolverType } from '@/types/solver';
import { useSolverStore } from '@/stores/solverStore';

export default function SolverTypeSelector() {
  const { solverType, setSolverType } = useSolverStore();

  const types: { value: SolverType; label: string }[] = [
    { value: 'polynomial', label: 'Polynomial' },
    { value: 'system', label: 'System' },
    { value: 'inequality', label: 'Inequality' },
    { value: 'symbolic', label: 'Symbolic' },
  ];

  return (
    <div className="flex justify-center mb-6 sm:mb-8 w-full">
      <div className="flex w-full sm:w-auto overflow-x-auto scrollbar-none bg-gray-100 dark:bg-gray-800 rounded-2xl sm:rounded-full p-1 shadow-inner gap-1">
        {types.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setSolverType(type.value)}
            className={`flex-1 sm:flex-none px-3.5 sm:px-6 py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 text-center ${
              solverType === type.value
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            aria-label={`Select ${type.label} Solver`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
