'use client';

import React from 'react';
import { useSolverStore } from '@/stores/solverStore';
import SolverTypeSelector from './SolverTypeSelector';
import EquationInput from './EquationInput';
import SystemOfEquations from './SystemOfEquations';
import StepByStep from './StepByStep';
import { FunctionSquare } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const EMPTY_STATE_MESSAGES = {
  polynomial: 'Enter a polynomial to see step-by-step division, roots, and factorizations.',
  system: 'Add 2 or more equations to view step-by-step elimination and substitution.',
  inequality: 'Enter an inequality to compute solution steps and interval notation.',
  symbolic: 'Enter an expression or equation to see step-by-step algebraic simplification.',
} as const;

export default function EquationSolver() {
  const { solverType, result } = useSolverStore();

  return (
    <div className="w-full h-full flex flex-col space-y-4 animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      {/* Top App Bar / Header */}
      <header className="flex items-center justify-between gap-3 pb-2 shrink-0 border-b border-[#E0E0E0] dark:border-[#2E2825]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#131313] dark:text-white">
                Equation Solver
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] text-[10px] font-mono font-bold uppercase dark:border-[#5D4037]/50">
                STEP-BY-STEP
              </span>
            </div>
            <p className="text-[11px] text-[#616161] dark:text-[#A19891] hidden sm:block">
              Step-by-step solutions for algebra, systems, and inequalities
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Dual-Pane / Multi-Pane Layout */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 items-start">
        {/* Left Pane: Equation Input & Controls */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col space-y-4 transition-colors">
          <SolverTypeSelector />
          
          <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#2E2825]">
            {solverType === 'system' ? (
              <SystemOfEquations />
            ) : (
              <EquationInput />
            )}
          </div>
        </div>

        {/* Right Pane: Step-by-Step Logic & Final Answer */}
        <div className="flex-1 w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 sm:p-6 shadow-sm min-h-[360px] overflow-y-auto transition-colors">
          {result ? (
            <StepByStep />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border border-dashed border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl bg-[#F5F5F5] dark:bg-[#131313]/60">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EFEBE9] border border-[#D7CCC8] dark:bg-[#24201E] dark:border-[#3E2723] mb-3 text-[#5D4037] dark:text-[#A1887F]">
                <FunctionSquare size={28} />
              </div>
              <h3 className="text-sm font-semibold text-[#131313] dark:text-white mb-1">
                Awaiting Input
              </h3>
              <p className="text-xs text-[#616161] dark:text-[#8D827A] max-w-sm">
                {EMPTY_STATE_MESSAGES[solverType]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
