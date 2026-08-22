'use client';

import React, { useState } from 'react';
import { useSolverStore } from '@/stores/solverStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { Check, Copy, ChevronDown } from 'lucide-react';

export default function StepByStep() {
  const { result } = useSolverStore();
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 sm:mt-12 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 sm:pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Solution Steps</h2>
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs sm:text-sm font-medium capitalize">
          {result.type}
        </span>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {result.steps.map((step, index) => {
          const isExpanded = expandedSteps[index] !== false; // Default to expanded

          return (
            <div key={index} className="flex gap-2.5 sm:gap-4 items-start">
              {/* Stepper Node & Vertical Line */}
              <div className="flex flex-col items-center shrink-0 pt-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                  {step.stepNumber || index + 1}
                </div>
                {index < result.steps.length - 1 && (
                  <div className="w-0.5 min-h-[2rem] h-full bg-gray-200 dark:bg-gray-800 my-1 sm:my-2" />
                )}
              </div>

              {/* Step Card */}
              <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-xs transition-all">
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
                  className="flex justify-between items-start cursor-pointer gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-0.5"
                  aria-expanded={isExpanded}
                  aria-label={`Step ${step.stepNumber || index + 1}: ${step.explanation}`}
                >
                  <p className="text-gray-800 dark:text-gray-200 font-medium text-xs sm:text-sm leading-relaxed">
                    {step.explanation}
                  </p>
                  <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 shrink-0">
                    <ChevronDown
                      size={18}
                      className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    {step.divisionDetails ? (
                      <div className="space-y-4">
                        {/* Two-Column Side-by-Side on Desktop, Stacked on Mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {/* Method 1: Long Division (NCERT Method) */}
                          <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xs min-w-0">
                            <div>
                              <div className="flex items-center justify-between gap-1.5 mb-2 pb-2 border-b border-blue-200/60 dark:border-blue-800/40">
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                                  Method 1: Long Division
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 rounded-full shrink-0">
                                  NCERT method
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2.5">
                                Standard step-by-step division (divide, multiply, subtract, bring down).
                              </p>
                              <div className="overflow-x-auto py-2 flex justify-center max-w-full text-xs sm:text-sm">
                                <MathDisplay math={step.divisionDetails.longDivisionMath} block />
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-blue-200/50 dark:border-blue-900/40 text-[11px] sm:text-xs font-mono text-blue-950 dark:text-blue-200 flex flex-wrap justify-between items-center gap-1">
                              <span>Quotient: <span className="font-bold">{step.divisionDetails.quotientMath}</span></span>
                              <span>Remainder: <span className="font-bold">{step.divisionDetails.remainderMath}</span></span>
                            </div>
                          </div>

                          {/* Method 2: Synthetic Division (Shortcut) */}
                          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-xs min-w-0">
                            <div>
                              <div className="flex items-center justify-between gap-1.5 mb-2 pb-2 border-b border-emerald-200/60 dark:border-emerald-800/40">
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                  Method 2: Synthetic Division
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-full shrink-0">
                                  Shortcut
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2.5">
                                {step.divisionDetails.explainer || 'A faster shortcut version of long division — same result, fewer written steps.'}
                              </p>
                              <div className="overflow-x-auto py-2 flex justify-center max-w-full text-xs sm:text-sm">
                                <MathDisplay math={step.divisionDetails.syntheticMath} block />
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/40 text-[11px] sm:text-xs font-mono text-emerald-950 dark:text-emerald-200 flex flex-wrap justify-between items-center gap-1">
                              <span>Quotient: <span className="font-bold">{step.divisionDetails.quotientMath}</span></span>
                              <span>Remainder: <span className="font-bold">{step.divisionDetails.remainderMath}</span></span>
                            </div>
                          </div>
                        </div>

                        {/* Agreement Note */}
                        <div className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-center font-mono">
                          Both methods agree: <span className="font-semibold text-gray-800 dark:text-gray-200">({step.divisionDetails.dividendMath}) ÷ ({step.divisionDetails.divisorMath}) = {step.divisionDetails.quotientMath}</span> (Remainder: {step.divisionDetails.remainderMath})
                        </div>
                      </div>
                    ) : step.math ? (
                      <div className="overflow-x-auto max-w-full text-xs sm:text-sm py-1">
                        <MathDisplay math={step.math} block />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Answer Banner with 1-Click Copy & Visual Toast */}
      <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl p-4 sm:p-6 border border-blue-100 dark:border-blue-900/50 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Final Answer</h3>
          <button
            type="button"
            onClick={() => copyToClipboard(result.finalAnswer)}
            className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-white/80 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-1.5 border border-gray-200/60 dark:border-gray-700 shadow-xs"
            title="Copy LaTeX"
            aria-label="Copy LaTeX formula"
          >
            {copied ? (
              <>
                <Check size={15} className="text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>Copy LaTeX</span>
              </>
            )}
          </button>
        </div>
        <div className="overflow-x-auto py-2 text-sm sm:text-base">
          <MathDisplay math={result.finalAnswer} block />
        </div>
      </div>
    </div>
  );
}
