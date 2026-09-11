'use client';

import React, { useState, useEffect } from 'react';
import Link from '@/components/shared/Link';
import { useSolverStore } from '@/stores/solverStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { MathText } from '@/components/shared/MathText';
import { Check, Copy, ChevronDown, Share2, LineChart, Info } from 'lucide-react';
import dynamic from '@/components/shared/DynamicShim';
import { extractPlotFunction } from '@/utils/mathSanitizer';
import { NumberLine, parseNumberLineData } from './NumberLine';

const FunctionPlotter = dynamic(() => import('@/components/graph/FunctionPlotter'), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-2xl bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center text-xs font-mono text-[#757575]">
      Rendering Graph...
    </div>
  ),
});

export default function StepByStep() {
  const { result, solverType, equation, quadraticMethod } = useSolverStore();
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [showSteps, setShowSteps] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [copiedSteps, setCopiedSteps] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDecimal, setShowDecimal] = useState(false);

  // Keep steps collapsed by default when result or method changes
  useEffect(() => {
    setShowSteps(false);
    setShowDecimal(false);
    setExpandedSteps({});
  }, [result, solverType, equation, quadraticMethod]);

  if (!result) return null;

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const copyQuestion = () => {
    const q = result.inputInterpretation || equation;
    if (q) {
      navigator.clipboard.writeText(q);
      setCopiedQuestion(true);
      setTimeout(() => setCopiedQuestion(false), 2000);
    }
  };

  const copySolution = () => {
    if (result.finalAnswer) {
      navigator.clipboard.writeText(result.finalAnswer);
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    }
  };

  const copySteps = () => {
    const q = result.inputInterpretation || equation || '';
    const ans = result.finalAnswer || '';
    const stepsText = (result.steps || [])
      .map((s, i) => `Step ${i + 1}: ${s.explanation}${s.math ? `\n   ${s.math}` : ''}`)
      .join('\n\n');
    const fullText = `Problem: ${q}\n\n${stepsText}\n\nFinal Solution: ${ans}`;
    navigator.clipboard.writeText(fullText);
    setCopiedSteps(true);
    setTimeout(() => setCopiedSteps(false), 2000);
  };

  const copyShareLink = () => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname && window.location.pathname !== '/' ? window.location.pathname : '/equation-solver-with-steps';
    const url = new URL(window.location.origin + path);
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

    const nlData = parseNumberLineData(result?.type || 'polynomial', result?.finalAnswer || '');
    const roots: number[] = (result?.numericRoots && result.numericRoots.length > 0)
      ? result.numericRoots
      : nlData.roots;

    const { fn, roots: cleanRoots } = extractPlotFunction(equation, roots);
    const params = new URLSearchParams();
    params.set('fn', fn);
    if (cleanRoots.length > 0) {
      params.set('roots', cleanRoots.join(','));
    }
    return `/graph?${params.toString()}`;
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5 animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      {/* 1. Direct Solution Summary Card (Direct Answer-First View) */}
      <div
        id="direct-solution"
        className="bg-[#FBF9F8] dark:bg-[#151515] rounded-2xl p-4 sm:p-6 border-2 border-[#5D4037]/70 dark:border-[#5D4037]/80 relative overflow-hidden shadow-sm scroll-mt-6"
      >
        <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-full bg-[#5D4037] dark:bg-[#A1887F]" />

        {/* Clean Problem Header */}
        {(equation || result.inputInterpretation) && (
          <div className="mb-2 pb-2 border-b border-[#E0E0E0]/80 dark:border-[#282422] flex items-center justify-between gap-2 text-xs font-mono text-[#616161] dark:text-[#A19891]">
            <div className="flex items-center gap-1.5 shrink-0">
              <Info size={13} className="text-[#5D4037] dark:text-[#D7CCC8]" />
              <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase text-[10px] sm:text-xs">Problem:</span>
            </div>
            <div className="overflow-x-auto scrollbar-none text-right text-xs font-bold text-[#131313] dark:text-white max-w-full">
              {equation || result.inputInterpretation?.replace(/\\text\{[^}]*\}|\{|\}/g, '').trim()}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8]">
              Solution
            </h3>
            <span className="px-2 py-0.5 bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] dark:border-[#5D4037]/50 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase">
              {!equation.includes('=') && !result.finalAnswer.includes('=') ? 'Simplification' : result.type}
            </span>
            {result.type === 'polynomial' && equation.includes('=') && quadraticMethod && quadraticMethod !== 'auto' && (
              <span className="hidden sm:inline px-2 py-0.5 bg-[#5D4037]/10 text-[#5D4037] border border-[#5D4037]/30 dark:bg-[#5D4037]/40 dark:text-[#D7CCC8] dark:border-[#5D4037]/50 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold">
                {quadraticMethod === 'factoring' ? 'Factoring' : quadraticMethod === 'completing_square' ? 'Completing Square' : 'Formula'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Direct Solution Copy Button */}
            <button
              type="button"
              onClick={copySolution}
              className="p-1.5 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-[#EFEBE9] dark:hover:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] transition-all border border-[#E0E0E0] dark:border-[#2E2825]"
              title="Copy Solution"
              aria-label="Copy Solution"
            >
              {copiedSolution ? <Check size={14} className="text-emerald-600 dark:text-[#81C784]" /> : <Copy size={14} />}
            </button>

            {/* Share Link Button */}
            <button
              type="button"
              onClick={copyShareLink}
              className="p-1.5 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-[#EFEBE9] dark:hover:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] transition-all border border-[#E0E0E0] dark:border-[#2E2825]"
              title="Share Link"
              aria-label="Share problem URL"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600 dark:text-[#81C784]" /> : <Share2 size={14} />}
            </button>

            {/* Plot in Graph Button */}
            {(result.type === 'polynomial' || result.type === 'inequality') && (
              <Link
                href={getGraphLink()}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#EFEBE9] dark:bg-[#2A2220] hover:bg-[#D7CCC8] dark:hover:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] transition-all flex items-center gap-1 border border-[#D7CCC8] dark:border-[#5D4037]/50"
                title="Plot in Graph"
              >
                <LineChart size={14} />
                <span className="hidden sm:inline text-xs font-mono font-medium">Graph</span>
              </Link>
            )}
          </div>
        </div>

        {/* Direct Solution Output - Responsive Multi-Root Layout with Decimal Toggle (Symbolab style) */}
        <div className="py-2">
          {result.decimalAnswer && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[#757575] dark:text-[#A19891]">Format:</span>
              <button
                type="button"
                onClick={() => setShowDecimal(false)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  !showDecimal
                    ? 'bg-[#5D4037] text-white shadow-xs'
                    : 'bg-[#EFEBE9] dark:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#E0D7D2]'
                }`}
              >
                Exact (Fractions)
              </button>
              <button
                type="button"
                onClick={() => setShowDecimal(true)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  showDecimal
                    ? 'bg-[#5D4037] text-white shadow-xs'
                    : 'bg-[#EFEBE9] dark:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#E0D7D2]'
                }`}
              >
                Decimal
              </button>
            </div>
          )}

          <div className="text-base sm:text-xl font-bold text-[#131313] dark:text-white">
            {(() => {
              const activeAns = (showDecimal && result.decimalAnswer) ? result.decimalAnswer : (result.finalAnswer || '');
              // If activeAns contains multiple separate variable assignments (e.g. "x = 2, \quad y = 3" or "x_1 = 1, \quad x_2 = 2")
              if (activeAns.includes('\\quad')) {
                const parts = activeAns.split(/\\quad/).map((s) => s.trim().replace(/^,\s*|,\s*$/g, '')).filter(Boolean);
                if (parts.length > 1 && parts.every((p) => p.includes('='))) {
                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      {parts.map((rp, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2C2724] rounded-xl shadow-xs"
                        >
                          <MathDisplay math={rp} />
                        </div>
                      ))}
                    </div>
                  );
                }
              }
              return (
                <div className="overflow-x-auto scrollbar-none max-w-full">
                  <MathDisplay math={activeAns} block />
                </div>
              );
            })()}
          </div>

          {/* If parametric Nature of Roots analysis is present, show it directly in Solution Bar */}
          {result.natureOfRoots && result.natureOfRoots.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#E0E0E0] dark:border-[#282422]">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8] mb-1.5 flex items-center gap-1.5">
                <span>Nature of the Roots:</span>
              </div>
              <div className="space-y-1.5 bg-white dark:bg-[#1A1A1A] rounded-xl p-2.5 sm:p-3 border border-[#E0E0E0] dark:border-[#282422]">
                {result.natureOfRoots.map((natureLine, idx) => (
                  <div key={idx} className="text-xs sm:text-sm text-[#333333] dark:text-[#E0E0E0] overflow-x-auto scrollbar-none py-0.5">
                    <MathDisplay math={natureLine} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Number Line Visualizer (for equations and inequalities) */}
      {(() => {
        if (result.type !== 'polynomial' && result.type !== 'inequality') return null;
        const nlData = parseNumberLineData(result.type, result.finalAnswer);
        const roots = (result.numericRoots && result.numericRoots.length > 0)
          ? result.numericRoots
          : nlData.roots;
        if (roots.length === 0 && nlData.intervals.length === 0) return null;
        const eqVar = equation?.match(/[a-zA-Z]/)?.[0] || 'x';
        return (
          <NumberLine
            variable={eqVar}
            roots={roots}
            intervals={nlData.intervals}
          />
        );
      })()}

      {/* Visual Graph & Step-by-Step Controller Section */}
      {(() => {
        // Extract graph if applicable
        let graphCard: React.ReactNode = null;
        if (equation && (result.type === 'polynomial' || result.type === 'inequality')) {
          const hasEqOrRoots = equation.includes('=') || (result.numericRoots && result.numericRoots.length > 0) || result.finalAnswer.includes('=');
          if (hasEqOrRoots) {
            const nlData = parseNumberLineData(result.type, result.finalAnswer);
            const roots = (result.numericRoots && result.numericRoots.length > 0)
              ? result.numericRoots
              : nlData.roots;
            const { fn, roots: cleanRoots } = extractPlotFunction(equation, roots);
            if (fn) {
              graphCard = (
                <div className="w-full md:w-[380px] lg:w-[440px] shrink-0 bg-white dark:bg-[#181818] rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] p-2.5 sm:p-3 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#E0E0E0] dark:border-[#2C2724]">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#5D4037] dark:text-[#D7CCC8]">
                      <LineChart size={13} />
                      <span>Visual Curve &amp; Roots</span>
                    </div>
                    <Link
                      href={getGraphLink()}
                      className="text-xs font-mono text-[#795548] dark:text-[#BCAAA4] hover:underline flex items-center gap-1"
                    >
                      Full Graph Studio &rarr;
                    </Link>
                  </div>
                  <div className="w-full h-[220px] sm:h-[250px]">
                    <FunctionPlotter
                      compact
                      initialExpression={fn}
                      initialRoots={cleanRoots}
                      height={250}
                      mobileHeight={220}
                    />
                  </div>
                </div>
              );
            }
          }
        }

        const hasSteps = result.steps && result.steps.length > 0;

        if (graphCard && hasSteps) {
          return (
            <div className="flex flex-col md:flex-row items-stretch gap-3 my-2">
              {/* Left: Step Box */}
              <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#181818] rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] p-4 sm:p-5 shadow-xs">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E0E0E0] dark:border-[#2C2724]">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#5D4037] dark:text-[#D7CCC8]">
                      <span>Step-by-Step Solution</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EFEBE9] text-[#5D4037] dark:bg-[#3E2723] dark:text-[#D7CCC8]">
                      {result.steps!.length} {result.steps!.length === 1 ? 'step' : 'steps'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#616161] dark:text-[#9E9E9E] leading-relaxed">
                    Step-by-step mathematical working showing factoring, Rational Root Theorem testing, polynomial division, and formulas.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSteps(!showSteps)}
                    className="w-full py-3 px-4 rounded-xl bg-[#5D4037] hover:bg-[#4E342E] text-white dark:bg-[#D7CCC8] dark:text-[#1B1B1B] dark:hover:bg-[#EFEBE9] font-mono font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform duration-200 ${showSteps ? 'rotate-180' : ''}`}
                    />
                    <span>{showSteps ? 'Hide Working Steps' : 'Show Step-by-Step Solution'}</span>
                  </button>
                </div>
              </div>

              {/* Right: Graph Box */}
              {graphCard}
            </div>
          );
        }

        if (graphCard) {
          return <div className="flex justify-end my-2">{graphCard}</div>;
        }

        if (hasSteps) {
          return (
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
                  {result.steps!.length} {result.steps!.length === 1 ? 'step' : 'steps'}
                </span>
              </button>
            </div>
          );
        }

        return null;
      })()}

      {/* 4. Unified Step-by-Step Solution Document Box */}
      {showSteps && result.steps && result.steps.length > 0 && (
        <div className="bg-[#FBF9F8] dark:bg-[#151515] rounded-2xl border border-[#E0E0E0] dark:border-[#282422] p-5 sm:p-7 shadow-xs space-y-6 animate-fade-in divide-y divide-[#E0E0E0]/80 dark:divide-[#282422]">
          {result.steps.map((step, index) => {
            return (
              <div key={index} className={index === 0 ? '' : 'pt-6'}>
                {/* Step Header */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase tracking-wider shrink-0">
                    Step {step.stepNumber || index + 1}:
                  </span>
                  <div className="text-sm sm:text-base font-semibold text-[#131313] dark:text-[#EAEAEA] leading-relaxed">
                    <MathText text={step.explanation} />
                  </div>
                </div>

                {/* Division Details or Standard Step Content */}
                {step.divisionDetails ? (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Method 1: Long Division */}
                      <div className="bg-white dark:bg-[#1B1B1B] border border-[#D7CCC8] dark:border-[#5D4037]/40 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs min-w-0">
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

                      {/* Method 2: Synthetic Division */}
                      <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#3E2723] rounded-xl p-3.5 flex flex-col justify-between shadow-2xs min-w-0">
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
                  </div>
                ) : (
                  <div className="mt-2.5 space-y-3">
                    {/* Dedicated Formula Applied Callout */}
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

                    {/* Step Math Block */}
                    {step.math && (
                      <div className="overflow-x-auto max-w-full py-1 text-center sm:text-left text-[#131313] dark:text-white">
                        <MathDisplay math={step.math} block />
                      </div>
                    )}

                    {/* Sub-Steps (Zero factor principle, Newton iterations, etc.) */}
                    {step.subSteps && step.subSteps.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#E0E0E0]/80 dark:border-[#2C2724] space-y-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8]">
                          Detailed Breakdown:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {step.subSteps.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-xl p-3 shadow-2xs"
                            >
                              <div className="text-xs font-semibold text-[#5D4037] dark:text-[#D7CCC8] mb-1">
                                {sub.title}
                              </div>
                              <div className="overflow-x-auto text-xs sm:text-sm font-mono text-[#131313] dark:text-white">
                                <MathDisplay math={sub.math} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
