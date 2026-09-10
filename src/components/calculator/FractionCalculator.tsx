'use client';

import React, { useState } from 'react';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function lcm(a: number, b: number): number {
  return (Math.abs(a * b)) / gcd(a, b);
}

export default function FractionCalculator() {
  const [op, setOp] = useState<'+' | '-' | '*' | '/'>('+');

  // Fraction 1: n1 / d1
  const [n1, setN1] = useState<string>('3');
  const [d1, setD1] = useState<string>('4');

  // Fraction 2: n2 / d2
  const [n2, setN2] = useState<string>('2');
  const [d2, setD2] = useState<string>('5');

  const num1 = parseInt(n1, 10);
  const den1 = parseInt(d1, 10);
  const num2 = parseInt(n2, 10);
  const den2 = parseInt(d2, 10);

  const isValid = !isNaN(num1) && !isNaN(den1) && den1 !== 0 && !isNaN(num2) && !isNaN(den2) && den2 !== 0;

  // Calculation details
  let rawNum = 0;
  let rawDen = 1;
  let steps: string[] = [];

  if (isValid) {
    if (op === '+') {
      const commonDen = lcm(den1, den2);
      const mult1 = commonDen / den1;
      const mult2 = commonDen / den2;
      const scaledN1 = num1 * mult1;
      const scaledN2 = num2 * mult2;
      rawNum = scaledN1 + scaledN2;
      rawDen = commonDen;
      steps.push(`Step 1: Find Least Common Denominator (LCD) of ${den1} and ${den2} = ${commonDen}`);
      steps.push(`Step 2: Convert fractions to common denominator: ${num1}/${den1} = ${scaledN1}/${commonDen} and ${num2}/${den2} = ${scaledN2}/${commonDen}`);
      steps.push(`Step 3: Add numerators: (${scaledN1} + ${scaledN2}) / ${commonDen} = ${rawNum}/${rawDen}`);
    } else if (op === '-') {
      const commonDen = lcm(den1, den2);
      const mult1 = commonDen / den1;
      const mult2 = commonDen / den2;
      const scaledN1 = num1 * mult1;
      const scaledN2 = num2 * mult2;
      rawNum = scaledN1 - scaledN2;
      rawDen = commonDen;
      steps.push(`Step 1: Find Least Common Denominator (LCD) of ${den1} and ${den2} = ${commonDen}`);
      steps.push(`Step 2: Convert fractions: ${num1}/${den1} = ${scaledN1}/${commonDen} and ${num2}/${den2} = ${scaledN2}/${commonDen}`);
      steps.push(`Step 3: Subtract numerators: (${scaledN1} - ${scaledN2}) / ${commonDen} = ${rawNum}/${rawDen}`);
    } else if (op === '*') {
      rawNum = num1 * num2;
      rawDen = den1 * den2;
      steps.push(`Step 1: Multiply numerators straight across: ${num1} × ${num2} = ${rawNum}`);
      steps.push(`Step 2: Multiply denominators straight across: ${den1} × ${den2} = ${rawDen}`);
      steps.push(`Result before simplifying: ${rawNum}/${rawDen}`);
    } else if (op === '/') {
      if (num2 === 0) {
        // division by zero
        steps.push('Cannot divide by zero fraction (numerator of divisor is 0).');
      } else {
        // Keep, Change, Flip
        rawNum = num1 * den2;
        rawDen = den1 * num2;
        steps.push(`Step 1: Keep first fraction, change ÷ to ×, and flip second fraction: (${num1}/${den1}) × (${den2}/${num2})`);
        steps.push(`Step 2: Multiply straight across: (${num1} × ${den2}) / (${den1} × ${num2}) = ${rawNum}/${rawDen}`);
      }
    }
  }

  // Simplify
  const divisor = gcd(rawNum, rawDen);
  let simpNum = rawNum / divisor;
  let simpDen = rawDen / divisor;
  if (simpDen < 0) {
    simpNum = -simpNum;
    simpDen = -simpDen;
  }

  // Mixed number
  const isImproper = Math.abs(simpNum) >= simpDen && simpDen !== 1;
  const wholePart = isImproper ? Math.trunc(simpNum / simpDen) : 0;
  const remNum = isImproper ? Math.abs(simpNum % simpDen) : 0;
  const decimalVal = isValid && rawDen !== 0 ? Math.round((rawNum / rawDen) * 100000) / 100000 : 0;

  return (
    <div className="w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl shadow-xs p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4">
        {/* Fraction 1 */}
        <div className="flex flex-col items-center gap-1.5 w-20 sm:w-24">
          <input
            type="number"
            value={n1}
            onChange={(e) => setN1(e.target.value)}
            className="w-full text-center py-2 px-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-base sm:text-lg font-bold text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            placeholder="Num"
          />
          <div className="w-full h-0.5 bg-[#5D4037] dark:bg-[#D7CCC8] rounded-full" />
          <input
            type="number"
            value={d1}
            onChange={(e) => setD1(e.target.value)}
            className="w-full text-center py-2 px-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-base sm:text-lg font-bold text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            placeholder="Den"
          />
        </div>

        {/* Operator Selector */}
        <div className="flex flex-row sm:flex-col gap-1">
          {(['+', '-', '*', '/'] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOp(o)}
              className={`w-10 h-10 rounded-xl font-mono text-lg font-bold transition-all ${
                op === o
                  ? 'bg-[#5D4037] text-white shadow-sm'
                  : 'bg-[#EFEBE9] dark:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#D7CCC8] dark:hover:bg-[#3E2723]'
              }`}
            >
              {o === '*' ? '×' : o === '/' ? '÷' : o}
            </button>
          ))}
        </div>

        {/* Fraction 2 */}
        <div className="flex flex-col items-center gap-1.5 w-20 sm:w-24">
          <input
            type="number"
            value={n2}
            onChange={(e) => setN2(e.target.value)}
            className="w-full text-center py-2 px-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-base sm:text-lg font-bold text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            placeholder="Num"
          />
          <div className="w-full h-0.5 bg-[#5D4037] dark:bg-[#D7CCC8] rounded-full" />
          <input
            type="number"
            value={d2}
            onChange={(e) => setD2(e.target.value)}
            className="w-full text-center py-2 px-2 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-base sm:text-lg font-bold text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            placeholder="Den"
          />
        </div>
      </div>

      {/* Result Display */}
      {isValid && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#FDFBF7] dark:bg-[#221D1B] border border-[#D7CCC8] dark:border-[#3E2723] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#8D6E63] dark:text-[#D7CCC8]">
              Solution & Forms
            </span>
            <span className="text-xs text-[#616161] dark:text-[#A19891]">Reduced Fraction & Mixed Number</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {/* Primary Reduced Fraction */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#8D6E63] dark:text-[#A19891]">Reduced:</span>
              <div className="inline-flex flex-col items-center justify-center font-bold text-2xl sm:text-3xl text-[#2E7D32] dark:text-[#81C784]">
                {simpDen === 1 ? (
                  <span>{simpNum}</span>
                ) : (
                  <>
                    <span>{simpNum}</span>
                    <div className="w-full h-0.5 bg-current" />
                    <span>{simpDen}</span>
                  </>
                )}
              </div>
            </div>

            {/* Mixed Number (if applicable) */}
            {isImproper && remNum !== 0 && (
              <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-[#5D4037] dark:text-[#EFEBE9] pl-4 border-l border-[#D7CCC8] dark:border-[#3E2723]">
                <span className="text-xs font-normal text-[#8D6E63] dark:text-[#A19891] block">Mixed:</span>
                <span>{wholePart}</span>
                <div className="inline-flex flex-col items-center text-lg leading-tight">
                  <span>{remNum}</span>
                  <div className="w-full h-0.5 bg-current" />
                  <span>{simpDen}</span>
                </div>
              </div>
            )}

            {/* Decimal Equivalent */}
            <div className="text-sm text-[#616161] dark:text-[#A19891] pl-4 border-l border-[#D7CCC8] dark:border-[#3E2723]">
              <span className="block text-xs font-semibold text-[#8D6E63] dark:text-[#A19891]">Decimal:</span>
              <span className="text-lg font-mono font-bold text-[#131313] dark:text-white">{decimalVal}</span>
            </div>
          </div>

          {/* Working Steps */}
          <div className="pt-4 border-t border-[#E0E0E0] dark:border-[#3E2723] space-y-1.5">
            <h4 className="text-xs font-bold font-mono uppercase text-[#8D6E63] dark:text-[#D7CCC8]">Working Steps:</h4>
            {steps.map((st, i) => (
              <div key={i} className="text-xs sm:text-sm font-mono text-[#616161] dark:text-[#A19891]">
                {st}
              </div>
            ))}
            {divisor > 1 && (
              <div className="text-xs sm:text-sm font-mono text-[#2E7D32] dark:text-[#81C784]">
                Step {steps.length + 1}: Simplify by dividing numerator and denominator by GCD ({divisor}): {rawNum} ÷ {divisor} = {simpNum}, {rawDen} ÷ {divisor} = {simpDen} → {simpNum}/{simpDen}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
