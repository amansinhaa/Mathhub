'use client';

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
    <div className="flex justify-center mb-8">
      <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-inner">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => setSolverType(type.value)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              solverType === type.value
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
