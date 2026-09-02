'use client';

import React, { useState } from 'react';
import { MathDisplay } from '@/components/shared/MathDisplay';

// ─── 1. Section Formula Interactive Mini-Calculator ─────────────────────────
export function SectionFormulaCalculator() {
  const [x1, setX1] = useState('1');
  const [y1, setY1] = useState('2');
  const [x2, setX2] = useState('4');
  const [y2, setY2] = useState('8');
  const [m, setM] = useState('1');
  const [n, setN] = useState('2');
  const [isExternal, setIsExternal] = useState(false);

  const numX1 = parseFloat(x1) || 0;
  const numY1 = parseFloat(y1) || 0;
  const numX2 = parseFloat(x2) || 0;
  const numY2 = parseFloat(y2) || 0;
  const numM = parseFloat(m) || 1;
  const numN = parseFloat(n) || 1;

  const denom = isExternal ? numM - numN : numM + numN;
  const px = denom !== 0 ? (isExternal ? numM * numX2 - numN * numX1 : numM * numX2 + numN * numX1) / denom : 0;
  const py = denom !== 0 ? (isExternal ? numM * numY2 - numN * numY1 : numM * numY2 + numN * numY1) / denom : 0;

  return (
    <div className="mt-3 p-3 bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#282422] rounded-xl space-y-2.5 text-xs font-mono">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase font-bold text-[#5D4037] dark:text-[#D7CCC8]">Interactive Solver:</span>
        <button
          type="button"
          onClick={() => setIsExternal(!isExternal)}
          className="text-[10px] px-2 py-0.5 rounded-md border border-[#D7CCC8] dark:border-[#5D4037]/50 bg-white dark:bg-[#1B1B1B] text-[#5D4037] dark:text-[#D7CCC8]"
        >
          {isExternal ? 'External Division' : 'Internal Division'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <label className="block text-[#757575] text-[10px] mb-0.5">Point A (x₁, y₁)</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={x1}
              onChange={(e) => setX1(e.target.value)}
              className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
              placeholder="x1"
            />
            <input
              type="number"
              value={y1}
              onChange={(e) => setY1(e.target.value)}
              className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
              placeholder="y1"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#757575] text-[10px] mb-0.5">Point B (x₂, y₂)</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={x2}
              onChange={(e) => setX2(e.target.value)}
              className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
              placeholder="x2"
            />
            <input
              type="number"
              value={y2}
              onChange={(e) => setY2(e.target.value)}
              className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
              placeholder="y2"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[#757575] text-[10px] mb-0.5">Ratio m : n</label>
        <div className="flex gap-1 w-1/2">
          <input
            type="number"
            value={m}
            onChange={(e) => setM(e.target.value)}
            className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
            placeholder="m"
          />
          <input
            type="number"
            value={n}
            onChange={(e) => setN(e.target.value)}
            className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
            placeholder="n"
          />
        </div>
      </div>

      <div className="p-2 bg-white dark:bg-[#1B1B1B] rounded-lg border border-[#E0E0E0] dark:border-[#2E2825] text-center">
        <span className="text-[10px] text-[#757575] block">Point P:</span>
        <span className="font-bold text-sm text-[#5D4037] dark:text-[#D7CCC8]">
          ({denom !== 0 ? Number(px.toFixed(3)) : 'Undefined'}, {denom !== 0 ? Number(py.toFixed(3)) : 'Undefined'})
        </span>
      </div>
    </div>
  );
}

// ─── 2. Distance, Midpoint & Slope Mini-Calculator ──────────────────────────
export function DistanceMidpointCalculator() {
  const [x1, setX1] = useState('0');
  const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3');
  const [y2, setY2] = useState('4');

  const numX1 = parseFloat(x1) || 0;
  const numY1 = parseFloat(y1) || 0;
  const numX2 = parseFloat(x2) || 0;
  const numY2 = parseFloat(y2) || 0;

  const dx = numX2 - numX1;
  const dy = numY2 - numY1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const midX = (numX1 + numX2) / 2;
  const midY = (numY1 + numY2) / 2;
  const slope = dx !== 0 ? dy / dx : null;

  return (
    <div className="mt-3 p-3 bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#282422] rounded-xl space-y-2.5 text-xs font-mono">
      <span className="text-[10px] uppercase font-bold text-[#5D4037] dark:text-[#D7CCC8] block">Interactive Solver:</span>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <label className="block text-[#757575] text-[10px] mb-0.5">Point 1 (x₁, y₁)</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={x1}
              onChange={(e) => setX1(e.target.value)}
              className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
            />
            <input
              type="number"
              value={y1}
              onChange={(e) => setY1(e.target.value)}
              className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#757575] text-[10px] mb-0.5">Point 2 (x₂, y₂)</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={x2}
              onChange={(e) => setX2(e.target.value)}
              className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
            />
            <input
              type="number"
              value={y2}
              onChange={(e) => setY2(e.target.value)}
              className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
        <div className="p-1.5 bg-white dark:bg-[#1B1B1B] rounded-lg border border-[#E0E0E0] dark:border-[#2E2825]">
          <span className="text-[#757575] block text-[9.5px]">Distance:</span>
          <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8]">{Number(distance.toFixed(3))}</span>
        </div>
        <div className="p-1.5 bg-white dark:bg-[#1B1B1B] rounded-lg border border-[#E0E0E0] dark:border-[#2E2825]">
          <span className="text-[#757575] block text-[9.5px]">Midpoint:</span>
          <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8]">({midX}, {midY})</span>
        </div>
        <div className="p-1.5 bg-white dark:bg-[#1B1B1B] rounded-lg border border-[#E0E0E0] dark:border-[#2E2825]">
          <span className="text-[#757575] block text-[9.5px]">Slope (m):</span>
          <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8]">{slope !== null ? Number(slope.toFixed(3)) : 'Undefined'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Sine & Cosine Rule Mini-Calculator ──────────────────────────────────
export function TriangleLawCalculator() {
  const [a, setA] = useState('5');
  const [b, setB] = useState('6');
  const [angleC, setAngleC] = useState('60'); // degrees

  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;
  const degC = parseFloat(angleC) || 0;
  const radC = (degC * Math.PI) / 180;

  // Law of Cosines: c^2 = a^2 + b^2 - 2ab cos(C)
  const cSquared = numA * numA + numB * numB - 2 * numA * numB * Math.cos(radC);
  const sideC = cSquared > 0 ? Math.sqrt(cSquared) : 0;

  return (
    <div className="mt-3 p-3 bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#282422] rounded-xl space-y-2.5 text-xs font-mono">
      <span className="text-[10px] uppercase font-bold text-[#5D4037] dark:text-[#D7CCC8] block">Interactive Triangle Solver (SAS):</span>

      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
        <div>
          <label className="block text-[#757575] text-[10px] mb-0.5">Side a</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
          />
        </div>
        <div>
          <label className="block text-[#757575] text-[10px] mb-0.5">Side b</label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
          />
        </div>
        <div>
          <label className="block text-[#757575] text-[10px] mb-0.5">Angle C (°)</label>
          <input
            type="number"
            value={angleC}
            onChange={(e) => setAngleC(e.target.value)}
            className="w-full px-2 py-1 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg text-center"
          />
        </div>
      </div>

      <div className="p-2 bg-white dark:bg-[#1B1B1B] rounded-lg border border-[#E0E0E0] dark:border-[#2E2825] text-center">
        <span className="text-[10px] text-[#757575] block">Computed Side c:</span>
        <span className="font-bold text-sm text-[#5D4037] dark:text-[#D7CCC8]">
          c = {Number(sideC.toFixed(3))}
        </span>
      </div>
    </div>
  );
}
