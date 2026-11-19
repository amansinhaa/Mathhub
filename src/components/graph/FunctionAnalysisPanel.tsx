'use client';

import React, { useMemo, useState } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import { analyzeFunction } from '@/lib/math/functionAnalysis';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { ChevronDown, Sparkles, Activity } from 'lucide-react';

export default function FunctionAnalysisPanel() {
  const { equations } = useGraphStore();
  const [isExpanded, setIsExpanded] = useState(true);

  // Extract slider parameters from all equations
  const parameters = useMemo(() => {
    const params: Record<string, number> = {};
    equations.forEach((eq) => {
      const trimmed = eq.expression.trim();
      const match = trimmed.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*([-+]?[0-9]*\.?[0-9]+)$/);
      if (match && match[1] !== 'x' && match[1] !== 'y') {
        const val = parseFloat(match[2]);
        if (!isNaN(val)) params[match[1]] = val;
      }
    });
    return params;
  }, [equations]);

  // Analyze the first active visible function (ignoring slider parameters)
  const activeEq = useMemo(() => {
    return equations.find((eq) => {
      if (!eq.visible || eq.expression.trim().length === 0) return false;
      const isSlider = /^([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*([-+]?[0-9]*\.?[0-9]+)$/.test(eq.expression.trim());
      return !isSlider;
    });
  }, [equations]);

  const analysis = useMemo(() => {
    if (!activeEq) return null;
    return analyzeFunction(activeEq.expression, parameters);
  }, [activeEq, parameters]);

  if (!activeEq || !analysis) return null;

  return (
    <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl overflow-hidden shadow-sm transition-colors">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3.5 flex items-center justify-between hover:bg-[#FAFAFA] dark:hover:bg-[#22201F] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-[#5D4037] dark:text-[#D7CCC8]" />
          <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-[#131313] dark:text-white">
            Function Analysis
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFEBE9] text-[#5D4037] dark:bg-[#3E2723] dark:text-[#D7CCC8] border border-[#D7CCC8] dark:border-[#5D4037]/40 truncate max-w-[140px]">
            {activeEq.expression}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-[#757575] transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="p-3.5 pt-0 border-t border-[#E0E0E0] dark:border-[#262220] space-y-2.5 text-xs font-mono animate-fade-in">
          {/* Domain & Range Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2.5">
            <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#262220] p-2.5 rounded-xl">
              <span className="text-[10px] text-[#757575] dark:text-[#8D827A] block mb-1 uppercase font-bold">
                Domain
              </span>
              <div className="text-[#131313] dark:text-white text-xs font-semibold overflow-x-auto">
                <MathDisplay math={analysis.domain} />
              </div>
            </div>

            <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#262220] p-2.5 rounded-xl">
              <span className="text-[10px] text-[#757575] dark:text-[#8D827A] block mb-1 uppercase font-bold">
                Range
              </span>
              <div className="text-[#131313] dark:text-white text-xs font-semibold overflow-x-auto">
                <MathDisplay math={analysis.range} />
              </div>
            </div>
          </div>

          {/* Intercepts */}
          <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#262220] p-2.5 rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#757575] dark:text-[#8D827A] uppercase font-bold text-[10px]">
                y-Intercept:
              </span>
              <span className="text-[#131313] dark:text-white font-semibold">
                <MathDisplay math={analysis.yIntercept} />
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 text-[11px] pt-1 border-t border-[#E0E0E0] dark:border-[#262220]">
              <span className="text-[#757575] dark:text-[#8D827A] uppercase font-bold text-[10px] shrink-0">
                x-Intercepts:
              </span>
              <div className="text-[#131313] dark:text-white font-semibold text-left sm:text-right overflow-x-auto scrollbar-thin max-w-full py-0.5">
                <MathDisplay math={analysis.xIntercepts.join(', \\; ')} />
              </div>
            </div>
          </div>

          {/* Asymptotes Card */}
          <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#262220] p-2.5 rounded-xl space-y-1">
            <span className="text-[10px] text-[#5D4037] dark:text-[#D7CCC8] font-bold uppercase tracking-wider block mb-1">
              Asymptotes
            </span>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-[#757575] dark:text-[#8D827A]">Vertical:</span>
                <span className="text-[#131313] dark:text-white font-semibold">
                  <MathDisplay math={analysis.asymptotes.vertical.join(', \\; ')} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#757575] dark:text-[#8D827A]">Horizontal:</span>
                <span className="text-[#131313] dark:text-white font-semibold">
                  <MathDisplay math={analysis.asymptotes.horizontal.join(', \\; ')} />
                </span>
              </div>
              {analysis.asymptotes.slant.some((s) => s !== '\\text{None}') && (
                <div className="flex justify-between items-center">
                  <span className="text-[#757575] dark:text-[#8D827A]">Slant / Oblique:</span>
                  <span className="text-[#131313] dark:text-white font-semibold">
                    <MathDisplay math={analysis.asymptotes.slant.join(', \\; ')} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
