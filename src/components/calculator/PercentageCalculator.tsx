'use client';

import React, { useState } from 'react';
import { Percent, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

type Mode = 'percentageOf' | 'whatPercent' | 'change' | 'addSubtract';

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>('percentageOf');

  // Mode 1: What is P% of X?
  const [p1, setP1] = useState<string>('15');
  const [x1, setX1] = useState<string>('240');

  // Mode 2: X is what percent of Y?
  const [x2, setX2] = useState<string>('45');
  const [y2, setY2] = useState<string>('180');

  // Mode 3: Percentage Increase / Decrease from X to Y
  const [x3, setX3] = useState<string>('80');
  const [y3, setY3] = useState<string>('100');

  // Mode 4: Add / Subtract P% to X
  const [x4, setX4] = useState<string>('120');
  const [p4, setP4] = useState<string>('20');
  const [isAdd, setIsAdd] = useState<boolean>(true);

  // Helper calculation 1:
  const numP1 = parseFloat(p1);
  const numX1 = parseFloat(x1);
  const res1 = !isNaN(numP1) && !isNaN(numX1) ? (numP1 / 100) * numX1 : null;

  // Helper calculation 2:
  const numX2 = parseFloat(x2);
  const numY2 = parseFloat(y2);
  const res2 = !isNaN(numX2) && !isNaN(numY2) && numY2 !== 0 ? (numX2 / numY2) * 100 : null;

  // Helper calculation 3:
  const numX3 = parseFloat(x3);
  const numY3 = parseFloat(y3);
  const diff3 = !isNaN(numX3) && !isNaN(numY3) ? numY3 - numX3 : null;
  const pctChange3 = diff3 !== null && numX3 !== 0 ? (diff3 / Math.abs(numX3)) * 100 : null;

  // Helper calculation 4:
  const numX4 = parseFloat(x4);
  const numP4 = parseFloat(p4);
  const changeAmt4 = !isNaN(numX4) && !isNaN(numP4) ? (numP4 / 100) * numX4 : null;
  const res4 = changeAmt4 !== null && !isNaN(numX4) ? (isAdd ? numX4 + changeAmt4 : numX4 - changeAmt4) : null;

  const round = (val: number, decimals = 4) => {
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  };

  return (
    <div className="w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl shadow-xs overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#E0E0E0] dark:border-[#2E2825] bg-[#FDFBF7] dark:bg-[#141414] overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setMode('percentageOf')}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            mode === 'percentageOf'
              ? 'border-[#5D4037] dark:border-[#D7CCC8] text-[#5D4037] dark:text-[#EFEBE9] bg-white dark:bg-[#1B1B1B]'
              : 'border-transparent text-[#616161] dark:text-[#A19891] hover:text-[#131313] dark:hover:text-white'
          }`}
        >
          What is X% of Y?
        </button>
        <button
          onClick={() => setMode('whatPercent')}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            mode === 'whatPercent'
              ? 'border-[#5D4037] dark:border-[#D7CCC8] text-[#5D4037] dark:text-[#EFEBE9] bg-white dark:bg-[#1B1B1B]'
              : 'border-transparent text-[#616161] dark:text-[#A19891] hover:text-[#131313] dark:hover:text-white'
          }`}
        >
          X is What % of Y?
        </button>
        <button
          onClick={() => setMode('change')}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            mode === 'change'
              ? 'border-[#5D4037] dark:border-[#D7CCC8] text-[#5D4037] dark:text-[#EFEBE9] bg-white dark:bg-[#1B1B1B]'
              : 'border-transparent text-[#616161] dark:text-[#A19891] hover:text-[#131313] dark:hover:text-white'
          }`}
        >
          Percentage Increase / Decrease
        </button>
        <button
          onClick={() => setMode('addSubtract')}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            mode === 'addSubtract'
              ? 'border-[#5D4037] dark:border-[#D7CCC8] text-[#5D4037] dark:text-[#EFEBE9] bg-white dark:bg-[#1B1B1B]'
              : 'border-transparent text-[#616161] dark:text-[#A19891] hover:text-[#131313] dark:hover:text-white'
          }`}
        >
          Add or Subtract %
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* MODE 1: What is P% of X? */}
        {mode === 'percentageOf' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-medium text-[#131313] dark:text-white">
              <span>What is</span>
              <div className="relative inline-block w-24 sm:w-28">
                <input
                  type="number"
                  value={p1}
                  onChange={(e) => setP1(e.target.value)}
                  className="w-full px-3 py-2 pr-7 text-right rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
                <span className="absolute right-2.5 top-2.5 text-[#8D6E63] font-bold">%</span>
              </div>
              <span>of</span>
              <div className="inline-block w-28 sm:w-36">
                <input
                  type="number"
                  value={x1}
                  onChange={(e) => setX1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
              <span>?</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#8D6E63] dark:text-[#A19891] font-semibold">Common %:</span>
              {['5', '10', '15', '20', '25', '50', '75'].map((val) => (
                <button
                  key={val}
                  onClick={() => setP1(val)}
                  className="px-2.5 py-1 rounded-lg bg-[#EFEBE9] dark:bg-[#2A2320] text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#D7CCC8] dark:hover:bg-[#3E2723] transition-colors"
                >
                  {val}%
                </button>
              ))}
            </div>

            {/* Result Display */}
            {res1 !== null && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#FDFBF7] dark:bg-[#221D1B] border border-[#D7CCC8] dark:border-[#3E2723] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#8D6E63] dark:text-[#D7CCC8]">
                    Calculated Result
                  </span>
                  <span className="text-xs text-[#616161] dark:text-[#A19891]">Formula: (P ÷ 100) × X</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#5D4037] dark:text-[#EFEBE9]">
                  {p1}% of {x1} = <span className="text-[#2E7D32] dark:text-[#81C784]">{round(res1)}</span>
                </div>
                <div className="text-xs sm:text-sm font-mono text-[#616161] dark:text-[#A19891] pt-2 border-t border-[#E0E0E0] dark:border-[#3E2723]">
                  Working: ({p1} ÷ 100) × {x1} = {(numP1 / 100)} × {x1} = {round(res1)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: X is What % of Y? */}
        {mode === 'whatPercent' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-medium text-[#131313] dark:text-white">
              <div className="inline-block w-28 sm:w-32">
                <input
                  type="number"
                  value={x2}
                  onChange={(e) => setX2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
              <span>is what percent of</span>
              <div className="inline-block w-28 sm:w-32">
                <input
                  type="number"
                  value={y2}
                  onChange={(e) => setY2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
              <span>?</span>
            </div>

            {res2 !== null && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#FDFBF7] dark:bg-[#221D1B] border border-[#D7CCC8] dark:border-[#3E2723] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#8D6E63] dark:text-[#D7CCC8]">
                    Calculated Result
                  </span>
                  <span className="text-xs text-[#616161] dark:text-[#A19891]">Formula: (X ÷ Y) × 100</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#5D4037] dark:text-[#EFEBE9]">
                  {x2} is <span className="text-[#2E7D32] dark:text-[#81C784]">{round(res2)}%</span> of {y2}
                </div>
                <div className="text-xs sm:text-sm font-mono text-[#616161] dark:text-[#A19891] pt-2 border-t border-[#E0E0E0] dark:border-[#3E2723]">
                  Working: ({x2} ÷ {y2}) × 100 = {round(numX2 / numY2, 6)} × 100 = {round(res2)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: Percentage Increase / Decrease */}
        {mode === 'change' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-medium text-[#131313] dark:text-white">
              <span>From initial value</span>
              <div className="inline-block w-28 sm:w-32">
                <input
                  type="number"
                  value={x3}
                  onChange={(e) => setX3(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
              <span>to final value</span>
              <div className="inline-block w-28 sm:w-32">
                <input
                  type="number"
                  value={y3}
                  onChange={(e) => setY3(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
            </div>

            {pctChange3 !== null && diff3 !== null && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#FDFBF7] dark:bg-[#221D1B] border border-[#D7CCC8] dark:border-[#3E2723] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#8D6E63] dark:text-[#D7CCC8]">
                    Percentage Difference
                  </span>
                  <span className="text-xs text-[#616161] dark:text-[#A19891]">Formula: ((New - Old) ÷ |Old|) × 100</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#5D4037] dark:text-[#EFEBE9] flex items-center gap-2">
                  <span>Change:</span>
                  <span className={pctChange3 >= 0 ? 'text-[#2E7D32] dark:text-[#81C784]' : 'text-[#C62828] dark:text-[#EF5350]'}>
                    {pctChange3 >= 0 ? `+${round(pctChange3)}%` : `${round(pctChange3)}%`}
                  </span>
                  <span className="text-sm font-normal text-[#616161] dark:text-[#A19891]">
                    ({pctChange3 >= 0 ? 'Increase' : 'Decrease'})
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-mono text-[#616161] dark:text-[#A19891] pt-2 border-t border-[#E0E0E0] dark:border-[#3E2723] space-y-1">
                  <div>Absolute difference: {y3} - {x3} = {round(diff3)}</div>
                  <div>Step: ({round(diff3)} ÷ {Math.abs(numX3)}) × 100 = {round(pctChange3)}%</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 4: Add or Subtract % */}
        {mode === 'addSubtract' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-medium text-[#131313] dark:text-white">
              <div className="flex rounded-xl overflow-hidden border border-[#D7CCC8] dark:border-[#3E2723]">
                <button
                  type="button"
                  onClick={() => setIsAdd(true)}
                  className={`px-3 py-2 text-sm font-bold transition-colors ${
                    isAdd ? 'bg-[#5D4037] text-white' : 'bg-white dark:bg-[#25201E] text-[#616161] dark:text-[#A19891]'
                  }`}
                >
                  Add (+)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdd(false)}
                  className={`px-3 py-2 text-sm font-bold transition-colors ${
                    !isAdd ? 'bg-[#5D4037] text-white' : 'bg-white dark:bg-[#25201E] text-[#616161] dark:text-[#A19891]'
                  }`}
                >
                  Subtract (−)
                </button>
              </div>

              <div className="relative inline-block w-24 sm:w-28">
                <input
                  type="number"
                  value={p4}
                  onChange={(e) => setP4(e.target.value)}
                  className="w-full px-3 py-2 pr-7 text-right rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
                <span className="absolute right-2.5 top-2.5 text-[#8D6E63] font-bold">%</span>
              </div>

              <span>{isAdd ? 'to' : 'from'}</span>

              <div className="inline-block w-28 sm:w-36">
                <input
                  type="number"
                  value={x4}
                  onChange={(e) => setX4(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
            </div>

            {res4 !== null && changeAmt4 !== null && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#FDFBF7] dark:bg-[#221D1B] border border-[#D7CCC8] dark:border-[#3E2723] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#8D6E63] dark:text-[#D7CCC8]">
                    Calculated Result
                  </span>
                  <span className="text-xs text-[#616161] dark:text-[#A19891]">
                    {isAdd ? 'Markup / Tax' : 'Discount / Markdown'}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#5D4037] dark:text-[#EFEBE9]">
                  Result = <span className="text-[#2E7D32] dark:text-[#81C784]">{round(res4)}</span>
                </div>
                <div className="text-xs sm:text-sm font-mono text-[#616161] dark:text-[#A19891] pt-2 border-t border-[#E0E0E0] dark:border-[#3E2723] space-y-1">
                  <div>Percentage Amount: ({p4} ÷ 100) × {x4} = {round(changeAmt4)}</div>
                  <div>Final Value: {x4} {isAdd ? '+' : '−'} {round(changeAmt4)} = {round(res4)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
