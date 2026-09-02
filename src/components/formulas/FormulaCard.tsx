'use client';

import React from 'react';
import { FormulaEntry } from '@/types/formula';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Calculator } from 'lucide-react';
import { latexToAscii } from '@/utils/mathSanitizer';
import {
  SectionFormulaCalculator,
  DistanceMidpointCalculator,
  TriangleLawCalculator,
} from './InteractiveMiniCalculators';

export default function FormulaCard({ formula }: { formula: FormulaEntry }) {
  const router = useRouter();

  // Route to calculator with sanitized expression
  const handleOpenCalculator = () => {
    const raw = formula.calculatorExpression || latexToAscii(formula.latex);
    router.push(`/calculator?expr=${encodeURIComponent(raw)}`);
  };

  // Route to solver with sanitized equation and autoSolve
  const handleOpenSolver = () => {
    const raw = formula.solverExpression || latexToAscii(formula.latex);
    router.push(`/solver?eq=${encodeURIComponent(raw)}&autoSolve=true`);
  };

  return (
    <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] hover:border-[#D7CCC8] dark:border-[#2E2825] dark:hover:border-[#5D4037]/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full group">
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2.5 gap-2">
          <h3 className="font-bold text-sm sm:text-base text-[#131313] dark:text-white leading-snug group-hover:text-[#5D4037] dark:group-hover:text-[#D7CCC8] transition-colors">
            {formula.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {formula.level && (
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 bg-[#F5F5F5] text-[#5D4037] border border-[#E0E0E0] dark:bg-[#131313] dark:text-[#D7CCC8] dark:border-[#2E2825] rounded-md">
                {formula.level === 'class10' ? 'Class 10' : formula.level === 'class12' ? 'Class 12' : 'Calculus'}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] dark:border-[#5D4037]/50 rounded-md">
              {formula.category}
            </span>
          </div>
        </div>

        <div className="my-3 py-3 px-2 overflow-x-auto text-center flex justify-center items-center flex-1 bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#262220] rounded-xl max-w-full text-sm text-[#131313] dark:text-white">
          <MathDisplay math={formula.latex} block />
        </div>

        <p className="text-xs text-[#616161] dark:text-[#A19891] mb-3 leading-relaxed">
          {formula.description}
        </p>

        {/* Interactive Mini-Calculators for high-growth formulas */}
        {formula.id === 'geom-10' && <SectionFormulaCalculator />}
        {formula.id === 'geom-1' && <DistanceMidpointCalculator />}
        {(formula.id === 'trig-10' || formula.id === 'trig-11') && <TriangleLawCalculator />}

        <div className="flex flex-wrap gap-1 mt-auto pt-2">
          {formula.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-mono bg-[#F5F5F5] text-[#757575] border border-[#E0E0E0] dark:bg-[#131313] dark:text-[#8D827A] dark:border-[#262220] px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#FAFAFA] dark:bg-[#131313] border-t border-[#E0E0E0] dark:border-[#262220] p-2.5 sm:p-3 flex gap-2">
        <button
          type="button"
          onClick={handleOpenCalculator}
          className="flex-1 text-xs font-semibold py-2 px-2.5 bg-white hover:bg-[#EFEBE9] border border-[#E0E0E0] hover:border-[#D7CCC8] dark:bg-[#1B1B1B] dark:hover:bg-[#3E2723]/50 dark:border-[#2E2825] dark:hover:border-[#5D4037]/60 rounded-xl transition-all text-[#5D4037] hover:text-[#131313] dark:text-[#D7CCC8] dark:hover:text-white text-center min-h-[36px] flex items-center justify-center gap-1 active:scale-95 shadow-xs"
          aria-label={`Use ${formula.name} in Calculator`}
        >
          <span>In Calculator</span>
          <ArrowUpRight size={13} className="text-[#5D4037] dark:text-[#8D827A]" />
        </button>
        <button
          type="button"
          onClick={handleOpenSolver}
          className="flex-1 text-xs font-semibold py-2 px-2.5 bg-white hover:bg-[#EFEBE9] border border-[#E0E0E0] hover:border-[#D7CCC8] dark:bg-[#1B1B1B] dark:hover:bg-[#3E2723]/50 dark:border-[#2E2825] dark:hover:border-[#5D4037]/60 rounded-xl transition-all text-[#5D4037] hover:text-[#131313] dark:text-[#D7CCC8] dark:hover:text-white text-center min-h-[36px] flex items-center justify-center gap-1 active:scale-95 shadow-xs"
          aria-label={`Use ${formula.name} in Solver`}
        >
          <span>In Solver</span>
          <ArrowUpRight size={13} className="text-[#5D4037] dark:text-[#8D827A]" />
        </button>
      </div>
    </div>
  );
}
