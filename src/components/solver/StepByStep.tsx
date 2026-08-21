'use client';

import React, { useState } from 'react';
import { useSolverStore } from '@/stores/solverStore';
import { MathDisplay } from '@/components/shared/MathDisplay';

export default function StepByStep() {
  const { result } = useSolverStore();
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  if (!result) return null;

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Solution Steps</h2>
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium capitalize">
          {result.type}
        </span>
      </div>

      <div className="space-y-6">
        {result.steps.map((step, index) => {
          const isExpanded = expandedSteps[index] !== false; // Default to expanded

          return (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {step.stepNumber || index + 1}
                </div>
                {index < result.steps.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 my-2" />
                )}
              </div>

              <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleStep(index)}
                >
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {step.explanation}
                  </p>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    {step.divisionDetails ? (
                      <div className="space-y-4">
                        {/* Two-Column Side-by-Side on Desktop, Stacked on Mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Method 1: Long Division (NCERT Method) */}
                          <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-4 flex flex-col justify-between shadow-xs">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-blue-200/60 dark:border-blue-800/40">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                                  Method 1: Long Division
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 rounded-full">
                                  NCERT method
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                Standard step-by-step division (divide, multiply, subtract, bring down).
                              </p>
                              <div className="overflow-x-auto py-2 flex justify-center">
                                <MathDisplay math={step.divisionDetails.longDivisionMath} block />
                              </div>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-blue-200/50 dark:border-blue-900/40 text-xs font-mono text-blue-950 dark:text-blue-200 flex justify-between items-center">
                              <span>Quotient: <span className="font-bold">{step.divisionDetails.quotientMath}</span></span>
                              <span>Remainder: <span className="font-bold">{step.divisionDetails.remainderMath}</span></span>
                            </div>
                          </div>

                          {/* Method 2: Synthetic Division (Shortcut) */}
                          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-4 flex flex-col justify-between shadow-xs">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-200/60 dark:border-emerald-800/40">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                  Method 2: Synthetic Division
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-full">
                                  Shortcut
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                {step.divisionDetails.explainer || 'A faster shortcut version of long division — same result, fewer written steps.'}
                              </p>
                              <div className="overflow-x-auto py-2 flex justify-center">
                                <MathDisplay math={step.divisionDetails.syntheticMath} block />
                              </div>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-emerald-200/50 dark:border-emerald-900/40 text-xs font-mono text-emerald-950 dark:text-emerald-200 flex justify-between items-center">
                              <span>Quotient: <span className="font-bold">{step.divisionDetails.quotientMath}</span></span>
                              <span>Remainder: <span className="font-bold">{step.divisionDetails.remainderMath}</span></span>
                            </div>
                          </div>
                        </div>

                        {/* Agreement Note */}
                        <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-center font-mono">
                          Both methods agree: <span className="font-semibold text-gray-800 dark:text-gray-200">({step.divisionDetails.dividendMath}) ÷ ({step.divisionDetails.divisorMath}) = {step.divisionDetails.quotientMath}</span> (Remainder: {step.divisionDetails.remainderMath})
                        </div>
                      </div>
                    ) : step.math ? (
                      <div className="overflow-x-auto">
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

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Final Answer</h3>
          <button
            onClick={() => copyToClipboard(result.finalAnswer)}
            className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 text-sm font-medium"
            title="Copy LaTeX"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copy
          </button>
        </div>
        <div className="overflow-x-auto py-2">
          <MathDisplay math={result.finalAnswer} block />
        </div>
      </div>
    </div>
  );
}
