'use client';

import { useSolverStore } from '@/stores/solverStore';
import SolverTypeSelector from './SolverTypeSelector';
import EquationInput from './EquationInput';
import SystemOfEquations from './SystemOfEquations';
import StepByStep from './StepByStep';

export default function EquationSolver() {
  const { solverType, result } = useSolverStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <div className="flex justify-center items-center gap-4 relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Equation Solver
            </h1>
            {/* ThemeToggle would be injected via Layout or placed here if available globally */}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Step-by-step solutions for polynomials, systems of equations, inequalities, and symbolic math.
          </p>
        </header>

        <main className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 p-6 sm:p-10 transition-all">
          <SolverTypeSelector />
          
          <div className="mt-8 transition-all duration-300">
            {solverType === 'system' ? (
              <SystemOfEquations />
            ) : (
              <EquationInput />
            )}
          </div>

          {result ? (
            <StepByStep />
          ) : (
            <div className="mt-12 text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Enter an equation above to see the step-by-step solution.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
