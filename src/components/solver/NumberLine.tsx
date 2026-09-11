'use client';

import React from 'react';

export interface NumberLineInterval {
  start?: number; // undefined means -Infinity
  end?: number;   // undefined means +Infinity
  includeStart?: boolean;
  includeEnd?: boolean;
}

export interface NumberLineProps {
  variable?: string;
  roots?: number[]; // discrete root points (e.g. for equations x = 2, 3)
  intervals?: NumberLineInterval[]; // intervals for inequalities (e.g. x > 2, 1 <= x < 5)
  className?: string;
}

export function parseNumberLineData(
  type: string,
  finalAnswer: string,
  variable: string = 'x'
): { roots: number[]; intervals: NumberLineInterval[] } {
  const roots: number[] = [];
  const intervals: NumberLineInterval[] = [];

  if (!finalAnswer) return { roots, intervals };

  // 1. Inequality parsing
  if (type === 'inequality') {
    // Compound interval: e.g. "1 \leq x \leq 5" or "1 < x < 5"
    const compoundMatch = finalAnswer.match(
      /(-?\d+(?:\.\d+)?)\s*(\\leq|\\le|<=|<)\s*([a-zA-Z])\s*(\\leq|\\le|<=|<)\s*(-?\d+(?:\.\d+)?)/
    );
    if (compoundMatch) {
      const start = parseFloat(compoundMatch[1]);
      const includeStart = compoundMatch[2].includes('le') || compoundMatch[2].includes('<=');
      const includeEnd = compoundMatch[4].includes('le') || compoundMatch[4].includes('<=');
      const end = parseFloat(compoundMatch[5]);
      intervals.push({ start, end, includeStart, includeEnd });
      return { roots, intervals };
    }

    // Check for "x <= a \quad \text{or} \quad x >= b"
    const orParts = finalAnswer.split(/\\text\{or\}|or/);
    if (orParts.length > 1) {
      for (const part of orParts) {
        const subData = parseNumberLineData('inequality', part.trim(), variable);
        intervals.push(...subData.intervals);
      }
      return { roots, intervals };
    }

    // Check single inequality: e.g. "x > 3", "x \geq -2", "x < 5"
    const singleMatch = finalAnswer.match(
      /([a-zA-Z])\s*(\\geq|\\ge|>=|>|\\leq|\\le|<=|<)\s*(-?\d+(?:\.\d+)?)/
    );
    if (singleMatch) {
      const op = singleMatch[2];
      const val = parseFloat(singleMatch[3]);
      const isInclusive = op.includes('ge') || op.includes('le') || op.includes('=');

      if (op.includes('>') || op.includes('ge')) {
        intervals.push({ start: val, end: undefined, includeStart: isInclusive });
      } else {
        intervals.push({ start: undefined, end: val, includeEnd: isInclusive });
      }
      return { roots, intervals };
    }
  }

  // 2. Discrete equation roots parsing: e.g. "x = 1/2, 1, 2", "x_1 = \frac{1}{2}, \quad x_2 = 1"
  const addRoot = (val: number) => {
    if (isFinite(val) && !isNaN(val) && !roots.some((r) => Math.abs(r - val) < 1e-5)) {
      roots.push(val);
    }
  };

  const parseTokenValue = (raw: string): number | null => {
    const s = raw.trim();
    if (!s) return null;
    // Discard complex parts with imaginary unit 'i'
    if (s.includes('i') || s.includes('\\pm')) return null;

    // Check LaTeX fraction: optional sign + \frac{n}{d}
    const fracMatch = s.match(/^([+-]?)\s*\\frac\{([+-]?\d+(?:\.\d+)?)\}\{([+-]?\d+(?:\.\d+)?)\}/);
    if (fracMatch) {
      const sign = fracMatch[1] === '-' ? -1 : 1;
      const num = parseFloat(fracMatch[2]);
      const den = parseFloat(fracMatch[3]);
      if (den !== 0) return sign * (num / den);
    }

    // Check slash fraction: n/d
    const slashMatch = s.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)/);
    if (slashMatch) {
      const num = parseFloat(slashMatch[1]);
      const den = parseFloat(slashMatch[2]);
      if (den !== 0) return num / den;
    }

    // Check standard integer / decimal: e.g. -2.5, 3
    const numMatch = s.match(/^[+-]?\d+(?:\.\d+)?/);
    if (numMatch) {
      return parseFloat(numMatch[0]);
    }

    return null;
  };

  const normalized = finalAnswer
    .replace(/\\quad/g, ' , ')
    .replace(/\\;/g, ' , ')
    .replace(/\\,/g, ' , ')
    .replace(/;/g, ' , ');

  const segments = normalized.split(',');
  for (const seg of segments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;
    const cleaned = trimmed.replace(/^[\\a-zA-Z_0-9\s]*=\s*/, '').trim();
    const val = parseTokenValue(cleaned);
    if (val !== null) {
      addRoot(val);
    }
  }

  roots.sort((a, b) => a - b);
  return { roots, intervals };
}

function formatRootLabel(val: number): string {
  const rounded = Math.round(val);
  if (Math.abs(val - rounded) < 1e-6) return rounded.toString();
  for (let d = 2; d <= 16; d++) {
    const n = Math.round(val * d);
    if (Math.abs(val - n / d) < 1e-5) {
      return `${n}/${d}`;
    }
  }
  return Number(val.toFixed(2)).toString();
}

export const NumberLine: React.FC<NumberLineProps> = ({
  variable = 'x',
  roots = [],
  intervals = [],
  className = '',
}) => {
  const criticalValues: number[] = [...roots];
  intervals.forEach((iv) => {
    if (iv.start !== undefined) criticalValues.push(iv.start);
    if (iv.end !== undefined) criticalValues.push(iv.end);
  });

  if (criticalValues.length === 0) {
    return null;
  }

  const minVal = Math.min(...criticalValues);
  const maxVal = Math.max(...criticalValues);

  const span = Math.max(maxVal - minVal, 4);
  const padding = Math.max(2, Math.ceil(span * 0.25));
  const axisMin = Math.floor(minVal - padding);
  const axisMax = Math.ceil(maxVal + padding);

  const width = 840;
  const height = 112;
  const paddingX = 56;
  const axisY = 62;
  const usableWidth = width - paddingX * 2;

  const toSvgX = (v: number): number => {
    const t = (v - axisMin) / (axisMax - axisMin);
    return paddingX + t * usableWidth;
  };

  const range = axisMax - axisMin;
  let tickStep = 1;
  if (range > 40) tickStep = 5;
  else if (range > 20) tickStep = 2;

  const ticks: number[] = [];
  const startTick = Math.ceil(axisMin / tickStep) * tickStep;
  for (let t = startTick; t <= axisMax; t += tickStep) {
    ticks.push(t);
  }

  return (
    <div className={`w-full overflow-hidden bg-white dark:bg-[#181818] rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] p-4 sm:p-5 shadow-sm transition-colors ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E0E0E0]/60 dark:border-[#2E2825]/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5D4037] dark:bg-[#D7CCC8]" />
          <span className="font-mono font-bold text-xs sm:text-sm text-[#5D4037] dark:text-[#D7CCC8] uppercase tracking-wider">
            Real Number Line
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#EFEBE9] dark:bg-[#2A2421] text-[#5D4037] dark:text-[#D7CCC8] text-[10px] font-mono font-semibold">
            Interactive
          </span>
        </div>
        <span className="font-mono text-xs text-[#757575] dark:text-[#8D827A]">
          Domain: {variable} ∈ ℝ
        </span>
      </div>

      <div className="w-full overflow-x-auto select-none py-2 scrollbar-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[580px] max-w-full"
          aria-label="Number line diagram"
        >
          <defs>
            <marker
              id="arrow-left"
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 10 0 L 0 5 L 10 10 z" className="fill-[#8D827A] dark:fill-[#A19891]" />
            </marker>
            <marker
              id="arrow-right"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-[#8D827A] dark:fill-[#A19891]" />
            </marker>
          </defs>

          {/* Main Axis Line */}
          <line
            x1={paddingX - 24}
            y1={axisY}
            x2={width - paddingX + 24}
            y2={axisY}
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-[#BCAAA4] dark:text-[#4E342E]"
            markerStart="url(#arrow-left)"
            markerEnd="url(#arrow-right)"
          />

          {/* Integer Coordinate Ticks & Labels */}
          {ticks.map((t) => {
            const x = toSvgX(t);
            return (
              <g key={`tick-${t}`}>
                <line
                  x1={x}
                  y1={axisY - 6}
                  x2={x}
                  y2={axisY + 6}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#8D827A] dark:text-[#757575]"
                />
                <text
                  x={x}
                  y={axisY + 22}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="monospace"
                  fill="currentColor"
                  className="text-[#757575] dark:text-[#A19891] select-none font-semibold"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* Inequality Shaded Regions */}
          {intervals.map((iv, idx) => {
            const hasStart = iv.start !== undefined;
            const hasEnd = iv.end !== undefined;

            const startX = hasStart ? toSvgX(iv.start!) : paddingX - 18;
            const endX = hasEnd ? toSvgX(iv.end!) : width - paddingX + 18;

            return (
              <g key={`interval-${idx}`}>
                <line
                  x1={startX}
                  y1={axisY}
                  x2={endX}
                  y2={axisY}
                  stroke="#5D4037"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="dark:stroke-[#D7CCC8]"
                  opacity="0.85"
                />

                {hasStart && (
                  <circle
                    cx={startX}
                    cy={axisY}
                    r="6.5"
                    fill={iv.includeStart ? '#5D4037' : '#FFFFFF'}
                    stroke="#5D4037"
                    strokeWidth="3"
                    className="dark:fill-[#181818] dark:stroke-[#D7CCC8]"
                  />
                )}

                {hasEnd && (
                  <circle
                    cx={endX}
                    cy={axisY}
                    r="6.5"
                    fill={iv.includeEnd ? '#5D4037' : '#FFFFFF'}
                    stroke="#5D4037"
                    strokeWidth="3"
                    className="dark:fill-[#181818] dark:stroke-[#D7CCC8]"
                  />
                )}
              </g>
            );
          })}

          {/* Discrete Root Pins with Coordinates */}
          {roots.map((r, idx) => {
            const x = toSvgX(r);
            const label = `${variable}=${formatRootLabel(r)}`;
            const badgeWidth = Math.max(46, label.length * 8 + 12);
            return (
              <g key={`root-${idx}`}>
                {/* Dashed connector line */}
                <line
                  x1={x}
                  y1={axisY - 32}
                  x2={x}
                  y2={axisY}
                  stroke="#5D4037"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  className="dark:stroke-[#D7CCC8]"
                />
                {/* Pin Badge Background */}
                <rect
                  x={x - badgeWidth / 2}
                  y={axisY - 48}
                  width={badgeWidth}
                  height="20"
                  rx="6"
                  fill="#5D4037"
                  className="dark:fill-[#D7CCC8] shadow-sm"
                />
                {/* Pin Badge Text */}
                <text
                  x={x}
                  y={axisY - 34}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="monospace"
                  fill="#FFFFFF"
                  className="font-bold dark:fill-[#131313]"
                >
                  {label}
                </text>
                {/* Root Point Marker on the line */}
                <circle
                  cx={x}
                  cy={axisY}
                  r="7.5"
                  fill="#5D4037"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="dark:fill-[#D7CCC8] dark:stroke-[#181818]"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E0E0E0]/60 dark:border-[#2E2825]/60 text-xs text-[#757575] dark:text-[#8D827A] font-mono">
        <div className="flex items-center gap-4">
          {roots.length > 0 && (
            <span className="flex items-center gap-1.5 font-medium text-[#5D4037] dark:text-[#D7CCC8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5D4037] dark:bg-[#D7CCC8]" />
              <span>Real Roots: {roots.map((r) => `${variable} = ${formatRootLabel(r)}`).join(', ')}</span>
            </span>
          )}
          {intervals.length > 0 && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-[#5D4037] dark:border-[#D7CCC8] bg-white dark:bg-[#181818]" />
                <span>Strict Boundary (&lt;, &gt;)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5D4037] dark:bg-[#D7CCC8]" />
                <span>Inclusive Boundary (≤, ≥)</span>
              </span>
            </>
          )}
        </div>
        <span className="text-[11px] opacity-80">Real Number Line Graph</span>
      </div>
    </div>
  );
};

export default NumberLine;
