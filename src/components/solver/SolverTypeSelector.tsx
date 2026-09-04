'use client';

import React from 'react';
import { SolverType } from '@/types/solver';
import { useSolverStore } from '@/stores/solverStore';

export default function SolverTypeSelector() {
  const { solverType, setSolverType } = useSolverStore();

  const types: { value: SolverType; label: string; iconSymbol?: string; description?: string }[] = [
    { value: 'polynomial', label: 'Equation', iconSymbol: '=', description: 'Linear, Quadratic, & Polynomials' },
    { value: 'derivative', label: 'd/dx', description: 'Step-by-Step Differentiation' },
    { value: 'integral', label: '∫ dx', description: 'Step-by-Step Integration (+ C)' },
    { value: 'system', label: 'System', iconSymbol: '{ }', description: '2+ Simultaneous Equations' },
    { value: 'inequality', label: 'Inequality', iconSymbol: '>', description: 'Intervals & Number Line' },
    { value: 'symbolic', label: 'Rearrange', iconSymbol: 'a=', description: 'Solve for any variable' },
  ];

  return (
    <div className="flex w-full overflow-x-auto scrollbar-none bg-[#F5F5F5] dark:bg-[#131313] rounded-xl p-1 border border-[#E0E0E0] dark:border-[#2E2825] gap-1 transition-colors">
      {types.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => setSolverType(type.value)}
          title={type.description}
          className={`flex-1 min-w-[72px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-center flex items-center justify-center gap-1 ${
            solverType === type.value
              ? 'bg-[#5D4037] text-white shadow-xs font-bold'
              : 'text-[#616161] hover:text-[#131313] hover:bg-[#EFEBE9] dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
          }`}
          aria-label={`Select ${type.label} Solver`}
        >
          {type.iconSymbol && (
            <span className="text-[10px] font-mono opacity-80">{type.iconSymbol}</span>
          )}
          <span>{type.label}</span>
        </button>
      ))}
    </div>
  );
}
