'use client';

import React from 'react';
import { useSolverStore } from '@/stores/solverStore';
import { Plus, Trash2 } from 'lucide-react';

export default function SystemOfEquations() {
  const { 
    systemEquations, 
    updateSystemEquation, 
    addSystemEquation, 
    removeSystemEquation,
    systemVariables,
    setSystemVariables,
    solve,
    isLoading
  } = useSolverStore();

  const handleVarsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vars = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
    setSystemVariables(vars);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    solve();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-end mb-1">
          <label className="block text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8]">
            System Equations
          </label>
          <span className="text-[10px] font-mono text-[#757575] dark:text-[#8D827A]">
            {systemEquations.length} of 4 equations
          </span>
        </div>

        {systemEquations.map((eq, idx) => (
          <div key={idx} className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={eq}
                onChange={(e) => updateSystemEquation(idx, e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-xs"
                placeholder={`Equation ${idx + 1} (e.g. 2x + y = 5)`}
                required
              />
            </div>
            {systemEquations.length > 2 && (
              <button
                type="button"
                onClick={() => removeSystemEquation(idx)}
                className="px-3 py-2 rounded-xl border border-red-200 dark:border-[#5D4037]/50 text-red-500 dark:text-[#FFAB91] bg-red-50 dark:bg-[#3E2723]/40 hover:bg-red-100 dark:hover:bg-[#3E2723]/80 transition-colors"
                aria-label="Remove equation"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        {systemEquations.length < 4 && (
          <button
            type="button"
            onClick={addSystemEquation}
            className="w-full py-2 border border-dashed border-[#BCAAA4] dark:border-[#3E2723] rounded-xl text-[#5D4037] dark:text-[#A1887F] hover:border-[#5D4037] hover:bg-[#EFEBE9] dark:hover:bg-[#22201F] dark:hover:text-white transition-colors flex items-center justify-center gap-1.5 text-xs font-mono"
          >
            <Plus size={14} />
            <span>Add Equation</span>
          </button>
        )}

        <div className="pt-2">
          <label htmlFor="variables" className="block text-xs font-mono font-medium text-[#5D4037] dark:text-[#D7CCC8] mb-1">
            Variables (comma separated)
          </label>
          <input
            id="variables"
            type="text"
            value={systemVariables.join(', ')}
            onChange={handleVarsChange}
            className="w-full px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-xs"
            placeholder="x, y, z"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || systemEquations.some(eq => !eq.trim())}
        className="w-full py-3 px-5 rounded-xl bg-[#5D4037] hover:bg-[#6D4C41] active:bg-[#4E342E] text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#795548]/50"
      >
        {isLoading ? 'Solving...' : 'Solve System'}
      </button>
    </form>
  );
}
