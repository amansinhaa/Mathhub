'use client';

import React from 'react';
import { FormulaEntry } from '@/types/formula';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { useRouter } from '@/components/shared/RouterShim';
import { ArrowUpRight, Calculator, Sparkles } from 'lucide-react';
import { latexToAscii } from '@/utils/mathSanitizer';
import { FORMULA_PRACTICE_MAP } from '@/data/formulaSheets/syllabusTopics';
import {
  SectionFormulaCalculator,
  DistanceMidpointCalculator,
  TriangleLawCalculator,
} from './InteractiveMiniCalculators';

export default function FormulaCard({ formula }: { formula: FormulaEntry }) {
  const router = useRouter();
  const practiceConfig = FORMULA_PRACTICE_MAP[formula.id];

  // Route to calculator with sanitized expression
  const handleOpenCalculator = () => {
    const raw = formula.calculatorExpression || latexToAscii(formula.latex);
    router.push(`/calculator?expr=${encodeURIComponent(raw)}`);
  };

  // Route to solver with sanitized equation and autoSolve
  const handleOpenSolver = () => {
    if (practiceConfig) {
      router.push(practiceConfig.url);
      return;
    }
    const raw = formula.solverExpression || latexToAscii(formula.latex);
    router.push(`/equation-solver-with-steps?eq=${encodeURIComponent(raw)}&autoSolve=true`);
  };

  return (
    <div className="formula-card bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] hover:border-[#D7CCC8] dark:border-[#2E2825] dark:hover:border-[#5D4037]/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full group">
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-sm sm:text-base text-[#131313] dark:text-white leading-snug group-hover:text-[#5D4037] dark:group-hover:text-[#D7CCC8] transition-colors">
            {formula.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 no-print">
            {formula.level && (
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 bg-[#F5F5F5] text-[#5D4037] border border-[#E0E0E0] dark:bg-[#131313] dark:text-[#D7CCC8] dark:border-[#2E2825] rounded-md">
                {formula.level === 'class10' ? 'Class 10' : formula.level === 'class12' ? 'Class 12' : 'Higher Ed'}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] dark:border-[#5D4037]/50 rounded-md">
              {formula.category}
            </span>
          </div>
        </div>

        {practiceConfig && (
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-mono text-[#5D4037] dark:text-[#D7CCC8] bg-[#FDFBF7] dark:bg-[#201B18] px-2.5 py-1 rounded-lg border border-[#EFEBE9] dark:border-[#3E2723]/60 no-print">
            <Sparkles size={12} className="text-[#8D6E63] shrink-0" />
            <span className="font-semibold">{practiceConfig.badgeLabel || 'Exam Problem'}:</span>
            <span className="font-bold text-[#131313] dark:text-white truncate">{practiceConfig.exampleText}</span>
          </div>
        )}

        <div className="my-2.5 py-3 px-2 overflow-x-auto text-center flex justify-center items-center flex-1 bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#262220] rounded-xl max-w-full text-sm text-[#131313] dark:text-white">
          <MathDisplay math={formula.latex} block />
        </div>

        <p className="text-xs text-[#616161] dark:text-[#A19891] mb-3 leading-relaxed">
          {formula.description}
        </p>

        {/* Interactive Mini-Calculators for high-growth formulas */}
        <div className="no-print">
          {formula.id === 'geom-10' && <SectionFormulaCalculator />}
          {formula.id === 'geom-1' && <DistanceMidpointCalculator />}
          {(formula.id === 'trig-10' || formula.id === 'trig-11') && <TriangleLawCalculator />}
        </div>

        <div className="flex flex-wrap gap-1 mt-auto pt-2 no-print">
          {formula.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-mono bg-[#F5F5F5] text-[#757575] border border-[#E0E0E0] dark:bg-[#131313] dark:text-[#8D827A] dark:border-[#262220] px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#FAFAFA] dark:bg-[#131313] border-t border-[#E0E0E0] dark:border-[#262220] p-2.5 sm:p-3 flex gap-2 no-print">
        {practiceConfig ? (
          <a
            href={practiceConfig.url}
            className="flex-1 py-2 px-2.5 bg-[#5D4037] hover:bg-[#4E342E] text-white dark:bg-[#D7CCC8] dark:text-[#131313] dark:hover:bg-white rounded-xl transition-all text-center min-h-[36px] flex items-center justify-center gap-1.5 active:scale-95 shadow-xs font-semibold text-xs no-underline"
            title={`Practice in Solver with exam example: ${practiceConfig.exampleText}`}
          >
            <span>Practice in Solver</span>
            <ArrowUpRight size={13} className="shrink-0" />
          </a>
        ) : (
          <button
            type="button"
            onClick={handleOpenSolver}
            className="flex-1 text-xs font-semibold py-2 px-2.5 bg-white hover:bg-[#EFEBE9] border border-[#E0E0E0] hover:border-[#D7CCC8] dark:bg-[#1B1B1B] dark:hover:bg-[#3E2723]/50 dark:border-[#2E2825] dark:hover:border-[#5D4037]/60 rounded-xl transition-all text-[#5D4037] hover:text-[#131313] dark:text-[#D7CCC8] dark:hover:text-white text-center min-h-[36px] flex items-center justify-center gap-1 active:scale-95 shadow-xs cursor-pointer"
            aria-label={`Use ${formula.name} in Solver`}
          >
            <span>Practice in Solver</span>
            <ArrowUpRight size={13} className="text-[#5D4037] dark:text-[#8D827A]" />
          </button>
        )}

        <button
          type="button"
          onClick={handleOpenCalculator}
          className="px-3 text-xs font-semibold py-2 bg-white hover:bg-[#EFEBE9] border border-[#E0E0E0] hover:border-[#D7CCC8] dark:bg-[#1B1B1B] dark:hover:bg-[#3E2723]/50 dark:border-[#2E2825] dark:hover:border-[#5D4037]/60 rounded-xl transition-all text-[#5D4037] hover:text-[#131313] dark:text-[#D7CCC8] dark:hover:text-white text-center min-h-[36px] flex items-center justify-center gap-1 active:scale-95 shadow-xs cursor-pointer shrink-0"
          aria-label={`Use ${formula.name} in Calculator`}
          title="Open in Scientific Calculator"
        >
          <Calculator size={13} className="text-[#5D4037] dark:text-[#8D827A]" />
          <span className="hidden sm:inline">Calculator</span>
        </button>
      </div>
    </div>
  );
}
