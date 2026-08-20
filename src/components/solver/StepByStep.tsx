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

                {isExpanded && step.math && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 overflow-x-auto">
                    <MathDisplay math={step.math} block />
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
