'use client';

import React, { useState } from 'react';

function getPrimes(n: number): Record<number, number> {
  const factors: Record<number, number> = {};
  let d = 2;
  n = Math.abs(n);
  while (d * d <= n) {
    while (n % d === 0) {
      factors[d] = (factors[d] || 0) + 1;
      n /= d;
    }
    d++;
  }
  if (n > 1) {
    factors[n] = (factors[n] || 0) + 1;
  }
  return factors;
}

function gcdTwo(a: number, b: number): { gcd: number; steps: string[] } {
  let x = Math.abs(a);
  let y = Math.abs(b);
  const steps: string[] = [];
  while (y !== 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push(`${x} = ${y} × ${q} + ${r}`);
    x = y;
    y = r;
  }
  return { gcd: x || 1, steps };
}

function lcmTwo(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  const { gcd } = gcdTwo(a, b);
  return Math.abs(a * b) / gcd;
}

export default function GcdLcmCalculator() {
  const [num1Str, setNum1Str] = useState<string>('48');
  const [num2Str, setNum2Str] = useState<string>('180');
  const [num3Str, setNum3Str] = useState<string>('');

  const n1 = parseInt(num1Str, 10);
  const n2 = parseInt(num2Str, 10);
  const n3 = num3Str.trim() !== '' ? parseInt(num3Str, 10) : null;

  const valid1 = !isNaN(n1) && n1 > 0;
  const valid2 = !isNaN(n2) && n2 > 0;
  const valid3 = n3 === null || (!isNaN(n3) && n3 > 0);

  const isValid = valid1 && valid2 && valid3;

  let finalGcd = 1;
  let finalLcm = 1;
  let euclidSteps: string[] = [];

  if (isValid) {
    const res12 = gcdTwo(n1, n2);
    euclidSteps = res12.steps;
    if (n3 !== null) {
      const resTotal = gcdTwo(res12.gcd, n3);
      finalGcd = resTotal.gcd;
      finalLcm = lcmTwo(lcmTwo(n1, n2), n3);
    } else {
      finalGcd = res12.gcd;
      finalLcm = lcmTwo(n1, n2);
    }
  }

  const p1 = valid1 ? getPrimes(n1) : {};
  const p2 = valid2 ? getPrimes(n2) : {};
  const p3 = n3 !== null && valid3 ? getPrimes(n3) : null;

  const formatPrimeExp = (factors: Record<number, number>) => {
    const parts = Object.entries(factors).map(([p, exp]) => (exp > 1 ? `${p}^${exp}` : `${p}`));
    return parts.length > 0 ? parts.join(' × ') : 'None';
  };

  return (
    <div className="w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl shadow-xs p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#8D6E63] dark:text-[#D7CCC8] mb-1.5">
            First Number
          </label>
          <input
            type="number"
            min="1"
            value={num1Str}
            onChange={(e) => setNum1Str(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-base font-bold text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            placeholder="e.g. 48"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#8D6E63] dark:text-[#D7CCC8] mb-1.5">
            Second Number
          </label>
          <input
            type="number"
            min="1"
            value={num2Str}
            onChange={(e) => setNum2Str(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-base font-bold text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            placeholder="e.g. 180"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase text-[#8D6E63] dark:text-[#D7CCC8] mb-1.5">
            Third Number (Optional)
          </label>
          <input
            type="number"
            min="1"
            value={num3Str}
            onChange={(e) => setNum3Str(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] text-base font-bold text-[#131313] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            placeholder="Optional 3rd number"
          />
        </div>
      </div>

      {isValid && (
        <div className="space-y-6">
          {/* Results cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] dark:bg-[#221D1B] border border-[#D7CCC8] dark:border-[#3E2723]">
              <div className="text-xs uppercase tracking-wider font-mono font-bold text-[#8D6E63] dark:text-[#D7CCC8] mb-1">
                Greatest Common Divisor (GCD / HCF)
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#2E7D32] dark:text-[#81C784]">
                {finalGcd}
              </div>
              <div className="text-xs text-[#616161] dark:text-[#A19891] mt-2">
                The largest positive integer that divides all inputs evenly without remainder.
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] dark:bg-[#221D1B] border border-[#D7CCC8] dark:border-[#3E2723]">
              <div className="text-xs uppercase tracking-wider font-mono font-bold text-[#8D6E63] dark:text-[#D7CCC8] mb-1">
                Least Common Multiple (LCM)
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#5D4037] dark:text-[#EFEBE9]">
                {finalLcm}
              </div>
              <div className="text-xs text-[#616161] dark:text-[#A19891] mt-2">
                The smallest positive integer that is divisible by all specified inputs.
              </div>
            </div>
          </div>

          {/* Prime Factorizations */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] dark:bg-[#221D1B] border border-[#D7CCC8] dark:border-[#3E2723] space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#8D6E63] dark:text-[#D7CCC8]">
              Prime Factorization Method
            </h4>
            <div className="space-y-1.5 text-xs sm:text-sm font-mono text-[#616161] dark:text-[#A19891]">
              <div>{n1} = {formatPrimeExp(p1)}</div>
              <div>{n2} = {formatPrimeExp(p2)}</div>
              {n3 !== null && p3 && <div>{n3} = {formatPrimeExp(p3)}</div>}
            </div>
          </div>

          {/* Euclidean Algorithm (for 2 numbers) */}
          {n3 === null && euclidSteps.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] dark:bg-[#221D1B] border border-[#D7CCC8] dark:border-[#3E2723] space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[#8D6E63] dark:text-[#D7CCC8]">
                Euclidean Algorithm (Division Steps)
              </h4>
              <div className="space-y-1 text-xs sm:text-sm font-mono text-[#616161] dark:text-[#A19891]">
                {euclidSteps.map((s, idx) => (
                  <div key={idx}>{s}</div>
                ))}
              </div>
              <div className="text-xs text-[#2E7D32] dark:text-[#81C784] font-medium pt-2">
                Last non-zero remainder = {finalGcd}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
