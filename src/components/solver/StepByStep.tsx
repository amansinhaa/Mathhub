'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSolverStore } from '@/stores/solverStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { Check, Copy, ChevronDown, Share2, LineChart, Info } from 'lucide-react';
import { extractPlotFunction } from '@/utils/mathSanitizer';

export default function StepByStep() {
  const { result, solverType, equation, quadraticMethod } = useSolverStore();
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [showSteps, setShowSteps] = useState(true);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Keep showSteps open when result or method changes so user immediately sees the new steps
  useEffect(() => {
    setShowSteps(true);
    setExpandedSteps({});
  }, [result, solverType, equation, quadraticMethod]);

  if (!result) return null;

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  const copyShareLink = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.origin + '/solver');
    url.searchParams.set('tab', solverType);
    if (equation) {
      url.searchParams.set('eq', equation);
      if (solverType === 'polynomial' && quadraticMethod !== 'auto') {
        url.searchParams.set('method', quadraticMethod);
      }
    }
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Determine equation expression and roots for plotting in graph
  const getGraphLink = () => {
    if (!equation) return '/graph';

    // Parse roots from result.finalAnswer if present (e.g. t = 1, t_1 = 2, t_2 = 3)
    const roots: number[] = [];
    if (result && result.finalAnswer) {
      const matches = result.finalAnswer.match(/=\s*(-?\d+(\.\d+)?)/g);
      if (matches) {
        matches.forEach((m) => {
          const val = parseFloat(m.replace('=', '').trim());
          if (!isNaN(val) && !roots.includes(val)) {
            roots.push(val);
          }
        });
      }
    }

    const { fn, roots: cleanRoots } = extractPlotFunction(equation, roots);
    const params = new URLSearchParams();
    params.set('fn', fn);
    if (cleanRoots.length > 0) {
      params.set('roots', cleanRoots.join(','));
    }
    return `/graph?${params.toString()}`;
  };

  return (
    <div className="w-full space-y-5 animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      {/* 1. Wolfram-Style Input Interpretation Pod */}
      {result.inputInterpretation && (
        <div className="bg-[#F5F5F5] dark:bg-[#181818] rounded-2xl p-4 border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#E0E0E0] dark:border-[#282422]">
            <Info size={15} className="text-[#5D4037] dark:text-[#D7CCC8]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8]">
              Input Interpretation
            </span>
          </div>
          <div className="overflow-x-auto py-1 text-xs sm:text-sm text-[#131313] dark:text-white">
            <MathDisplay math={result.inputInterpretation} block />
          </div>
        </div>
      )}

      {/* 2. Result Summary Card (Answer-First View) */}
      <div className="bg-[#F5F5F5] dark:bg-[#131313] rounded-2xl p-5 border border-[#5D4037]/60 relative overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5D4037]" />
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8]">
              Final Answer
            </h3>
            <span className="px-2.5 py-0.5 bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] dark:border-[#5D4037]/50 rounded-full text-[10px] font-mono font-bold uppercase">
              {result.type}
            </span>
            {result.type === 'polynomial' && (
              <span className="px-2.5 py-0.5 bg-[#5D4037]/10 text-[#5D4037] border border-[#5D4037]/30 dark:bg-[#5D4037]/40 dark:text-[#D7CCC8] dark:border-[#5D4037]/50 rounded-full text-[10px] font-mono font-bold">
                Method: {quadraticMethod === 'factoring' ? 'Factoring (AC)' : quadraticMethod === 'completing_square' ? 'Completing the Square' : quadraticMethod === 'formula' ? 'Quadratic Formula' : 'Auto'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Share Link Button */}
            <button
              type="button"
              onClick={copyShareLink}
              className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-[#1B1B1B] hover:bg-[#EFEBE9] dark:hover:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] hover:text-[#131313] dark:hover:text-white transition-all flex items-center gap-1.5 border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs"
              title="Share Link"
              aria-label="Share problem URL"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-600 dark:text-[#81C784]" />
                  <span className="text-emerald-600 dark:text-[#81C784] font-bold">Copied Link!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share Link</span>
                </>
              )}
            </button>

            {/* Copy LaTeX Button */}
            <button
              type="button"
              onClick={() => copyToClipboard(result.finalAnswer)}
              className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-[#1B1B1B] hover:bg-[#EFEBE9] dark:hover:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] hover:text-[#131313] dark:hover:text-white transition-all flex items-center gap-1.5 border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs"
              title="Copy LaTeX"
              aria-label="Copy LaTeX formula"
            >
              {copiedLatex ? (
                <>
                  <Check size={14} className="text-emerald-600 dark:text-[#81C784]" />
                  <span className="text-emerald-600 dark:text-[#81C784] font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy LaTeX</span>
                </>
              )}
            </button>

            {/* Plot in Graph Button (for polynomial or inequality) */}
            {(result.type === 'polynomial' || result.type === 'inequality') && (
              <Link
                href={getGraphLink()}
                className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-[#EFEBE9] dark:bg-[#2A2220] hover:bg-[#D7CCC8] dark:hover:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] hover:text-[#131313] dark:hover:text-white transition-all flex items-center gap-1.5 border border-[#D7CCC8] dark:border-[#5D4037]/50 shadow-xs"
                title="Plot in Graph"
              >
                <LineChart size={14} />
                <span className="hidden sm:inline">Plot in Graph</span>
              </Link>
            )}
          </div>
        </div>

        <div className="overflow-x-auto py-3 text-base sm:text-lg font-semibold text-[#131313] dark:text-white">
          <MathDisplay math={result.finalAnswer} block />
        </div>

        <div className="mt-2 pt-2 border-t border-[#E0E0E0] dark:border-[#24201E] flex items-center justify-between text-[10px] font-mono text-[#757575] dark:text-[#8D827A]">
          <span>Computation complete</span>
          <span className="font-semibold text-[#5D4037] dark:text-[#D7CCC8]">Generated with EasyEquate.com</span>
        </div>
      </div>

      {/* 3. Collapsible Steps Controller Button */}
      {result.steps && result.steps.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowSteps(!showSteps)}
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-[#1B1B1B] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] border border-[#E0E0E0] dark:border-[#2E2825] text-[#5D4037] dark:text-[#D7CCC8] font-mono font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <ChevronDown
              size={16}
              className={`transform transition-transform duration-200 ${showSteps ? 'rotate-180' : ''}`}
            />
            <span>{showSteps ? 'Hide Step-by-Step Solution' : 'Show Step-by-Step Solution'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFEBE9] text-[#5D4037] dark:bg-[#3E2723] dark:text-[#D7CCC8]">
              {result.steps.length} {result.steps.length === 1 ? 'step' : 'steps'}
            </span>
          </button>
        </div>
      )}

      {/* 4. Collapsible Step-by-Step Stepper Accordion */}
      {showSteps && result.steps && result.steps.length > 0 && (
        <div className="space-y-4 pt-2 animate-fade-in">
          {result.steps.map((step, index) => {
            const isExpanded = expandedSteps[index] !== false; // Default individual step to open inside expanded stepper

            return (
              <div key={index} className="flex gap-3 items-start">
                {/* Stepper Node & Vertical Line */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div className="w-7 h-7 rounded-full bg-[#5D4037] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-[#795548]/50">
                    {step.stepNumber || index + 1}
                  </div>
                  {index < result.steps.length - 1 && (
                    <div className="w-0.5 min-h-[2rem] h-full bg-[#E0E0E0] dark:bg-[#2E2825] my-1" />
                  )}
                </div>

                {/* Step Card */}
                <div className="flex-1 min-w-0 bg-[#F5F5F5] dark:bg-[#131313] rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] p-4 shadow-xs transition-all">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleStep(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleStep(index);
                      }
                    }}
                    className="flex justify-between items-start cursor-pointer gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5D4037] rounded-lg p-0.5"
                    aria-expanded={isExpanded}
                    aria-label={`Step ${step.stepNumber || index + 1}: ${step.explanation}`}
                  >
                    <p className="text-[#131313] dark:text-[#E0E0E0] font-medium text-xs sm:text-sm leading-relaxed">
                      {step.explanation}
                    </p>
                    <div className="text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white p-1 shrink-0">
                      <ChevronDown
                        size={16}
                        className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#E0E0E0] dark:border-[#24201E] space-y-4">
                      {step.divisionDetails ? (
                        <div className="space-y-3">
                          {/* Two-Column Side-by-Side on Desktop, Stacked on Mobile */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Method 1: Long Division (NCERT Method) */}
                            <div className="bg-white dark:bg-[#1B1B1B] border border-[#D7CCC8] dark:border-[#5D4037]/40 rounded-xl p-3.5 flex flex-col justify-between shadow-xs min-w-0">
                              <div>
                                <div className="flex items-center justify-between gap-1.5 mb-2 pb-2 border-b border-[#E0E0E0] dark:border-[#2E2825]">
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8]">
                                    Method 1: Long Division
                                  </span>
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] rounded-full dark:border-[#5D4037]/50 shrink-0">
                                    NCERT standard
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#616161] dark:text-[#8D827A] mb-2">
                                  Standard step-by-step division (divide, multiply, subtract, bring down).
                                </p>
                                <div className="overflow-x-auto py-2 flex justify-center max-w-full text-xs text-[#131313] dark:text-white">
                                  <MathDisplay math={step.divisionDetails.longDivisionMath} block />
                                </div>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-[#E0E0E0] dark:border-[#2E2825] text-[10px] font-mono text-[#5D4037] dark:text-[#D7CCC8] flex flex-wrap justify-between items-center gap-1">
                                <span>Quotient: <span className="font-bold text-[#131313] dark:text-white">{step.divisionDetails.quotientMath}</span></span>
                                <span>Remainder: <span className="font-bold text-[#131313] dark:text-white">{step.divisionDetails.remainderMath}</span></span>
                              </div>
                            </div>

                            {/* Method 2: Synthetic Division (Shortcut) */}
                            <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#3E2723] rounded-xl p-3.5 flex flex-col justify-between shadow-xs min-w-0">
                              <div>
                                <div className="flex items-center justify-between gap-1.5 mb-2 pb-2 border-b border-[#E0E0E0] dark:border-[#2E2825]">
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#BCAAA4]">
                                    Method 2: Synthetic Division
                                  </span>
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5F5F5] text-[#757575] border border-[#E0E0E0] dark:bg-[#24201E] dark:text-[#BCAAA4] rounded-full dark:border-[#3E2723] shrink-0">
                                    Shortcut
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#616161] dark:text-[#8D827A] mb-2">
                                  {step.divisionDetails.explainer || 'A faster shortcut version of long division — same result, fewer written steps.'}
                                </p>
                                <div className="overflow-x-auto py-2 flex justify-center max-w-full text-xs text-[#131313] dark:text-white">
                                  <MathDisplay math={step.divisionDetails.syntheticMath} block />
                                </div>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-[#E0E0E0] dark:border-[#2E2825] text-[10px] font-mono text-[#757575] dark:text-[#BCAAA4] flex flex-wrap justify-between items-center gap-1">
                                <span>Quotient: <span className="font-bold text-[#131313] dark:text-white">{step.divisionDetails.quotientMath}</span></span>
                                <span>Remainder: <span className="font-bold text-[#131313] dark:text-white">{step.divisionDetails.remainderMath}</span></span>
                              </div>
                            </div>
                          </div>

                          {/* Agreement Note */}
                          <div className="text-[11px] font-mono text-[#616161] dark:text-[#A19891] bg-white dark:bg-[#1B1B1B] p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] text-center shadow-xs">
                            Both methods agree: <span className="font-semibold text-[#131313] dark:text-white">({step.divisionDetails.dividendMath}) ÷ ({step.divisionDetails.divisorMath}) = {step.divisionDetails.quotientMath}</span> (Remainder: {step.divisionDetails.remainderMath})
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Dedicated Formula Used Callout for Calculus & Step Rules */}
                          {step.formulaUsed && (
                            <div className="bg-[#EFEBE9]/70 dark:bg-[#3E2723]/40 border border-[#D7CCC8] dark:border-[#5D4037]/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8]">
                                  Formula Applied: {step.formulaUsed.name}
                                </span>
                                {step.formulaUsed.description && (
                                  <span className="text-[11px] text-[#616161] dark:text-[#A19891]">
                                    {step.formulaUsed.description}
                                  </span>
                                )}
                              </div>
                              <div className="bg-white dark:bg-[#1B1B1B] px-2.5 py-1 rounded-lg border border-[#E0E0E0] dark:border-[#2E2825] text-xs shrink-0 self-start sm:self-auto">
                                <MathDisplay math={step.formulaUsed.latex} />
                              </div>
                            </div>
                          )}

                          {step.math && (
                            <div className="overflow-x-auto max-w-full text-xs sm:text-sm py-1 text-[#131313] dark:text-white">
                              <MathDisplay math={step.math} block />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
