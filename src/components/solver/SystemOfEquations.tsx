'use client';

import { useSolverStore } from '@/stores/solverStore';

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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-end mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            System of Equations
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {systemEquations.length} of 4 equations
          </span>
        </div>

        {systemEquations.map((eq, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={eq}
                onChange={(e) => updateSystemEquation(idx, e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
                placeholder={`Equation ${idx + 1} (e.g. 2x + y = 5)`}
                required
              />
            </div>
            {systemEquations.length > 2 && (
              <button
                type="button"
                onClick={() => removeSystemEquation(idx)}
                className="px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                aria-label="Remove equation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>
        ))}

        {systemEquations.length < 4 && (
          <button
            type="button"
            onClick={addSystemEquation}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Equation
          </button>
        )}

        <div className="pt-4">
          <label htmlFor="variables" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Variables (comma separated)
          </label>
          <input
            id="variables"
            type="text"
            value={systemVariables.join(', ')}
            onChange={handleVarsChange}
            className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
            placeholder="x, y, z"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || systemEquations.some(eq => !eq.trim())}
        className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Solving...' : 'Solve System'}
      </button>
    </form>
  );
}
