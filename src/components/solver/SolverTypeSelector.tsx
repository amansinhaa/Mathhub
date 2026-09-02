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
    <div className="flex w-full overflow-x-auto scrollbar-none bg-[#F5F5F5] dark:bg-[#131313] rounded-xl p-1 border border-[#E0E0E0] dark:border-[#2E2825] gap-1 transition-colors">
      {types.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => setSolverType(type.value)}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-center ${
            solverType === type.value
              ? 'bg-[#5D4037] text-white shadow-xs font-bold'
              : 'text-[#616161] hover:text-[#131313] hover:bg-[#EFEBE9] dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
          }`}
          aria-label={`Select ${type.label} Solver`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
