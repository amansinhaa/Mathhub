import { create, all } from 'mathjs';
import type { DataPoint } from '@/types/graph';
import { normalizeExpression } from './normalizer';

// Create a custom mathjs instance with real-domain nth root support for odd roots
const math = create(all);

function getOddDenominatorFraction(r: number): { p: number; q: number } | null {
  for (let q = 1; q <= 99; q += 2) {
    const p = Math.round(r * q);
    if (Math.abs(r - p / q) < 1e-6) {
      return { p, q };
    }
  }
  return null;
}

function realPow(base: any, exp: any): any {
  if (typeof base === 'number' && typeof exp === 'number') {
    if (base < 0) {
      const frac = getOddDenominatorFraction(exp);
      if (frac) {
        const sign = frac.p % 2 === 0 ? 1 : -1;
        return sign * Math.pow(Math.abs(base), exp);
      }
      return NaN;
    }
    return Math.pow(base, exp);
  }
  try {
    return (math as any).pow(base, exp);
  } catch {
    return NaN;
  }
}

math.import(
  {
    pow: realPow,
    power: realPow,
    cbrt: (a: number) => (a < 0 ? -Math.cbrt(Math.abs(a)) : Math.cbrt(a)),
    nthRoot: (a: number, root: number = 2) => {
      if (a < 0 && Math.round(root) % 2 !== 0) {
        return -Math.pow(Math.abs(a), 1 / root);
      }
      return Math.pow(a, 1 / root);
    },
  },
  { override: true }
);

export function parseExpression(input: string): string {
  let expr = input.replace(/^y\s*=\s*/, '').trim();
  if (!expr) return '0';
  // Normalize Unicode superscripts (x², x³), symbols (√, π, ×), etc.
  expr = normalizeExpression(expr);
  return expr;
}

export function generatePlotData(
  expression: string,
  xMin: number,
  xMax: number,
  numPoints: number = 400
): DataPoint[] {
  const data: DataPoint[] = [];
  if (xMin >= xMax) return data;
  const step = (xMax - xMin) / numPoints;
  const expr = parseExpression(expression);

  let compiled: any = null;
  try {
    compiled = math.compile(expr);
  } catch {
    return data;
  }

  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + i * step;
    try {
      const y = compiled.evaluate({ x });
      if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
        data.push({ x, y });
      } else if (y && typeof y.re === 'number' && Math.abs(y.im || 0) < 1e-10) {
        data.push({ x, y: y.re });
      } else {
        data.push({ x, y: null as any });
      }
    } catch {
      data.push({ x, y: null as any });
    }
  }
  return data;
}

/**
 * Generate clean "nice" tick marks following D3-style nice numbers algorithm.
 * Prevents tick duplication and odd rounding artifacts.
 */
export function generateNiceTicks(min: number, max: number, maxTicks: number = 6): number[] {
  if (min >= max || !isFinite(min) || !isFinite(max)) {
    return [min, (min + max) / 2, max];
  }

  const range = max - min;
  const rawStep = range / Math.max(2, maxTicks);
  const exponent = Math.floor(Math.log10(rawStep));
  const frac = rawStep / Math.pow(10, exponent);

  let niceFraction = 1;
  if (frac <= 1.5) niceFraction = 1;
  else if (frac <= 3) niceFraction = 2;
  else if (frac <= 7) niceFraction = 5;
  else niceFraction = 10;

  const niceStep = niceFraction * Math.pow(10, exponent);
  const startTick = Math.ceil(min / niceStep) * niceStep;
  const endTick = Math.floor(max / niceStep) * niceStep;

  const ticks: number[] = [];
  const precision = Math.max(0, -exponent + 2);

  for (let t = startTick; t <= endTick + niceStep * 0.5; t += niceStep) {
    const rounded = Number(t.toFixed(precision));
    if (ticks.length === 0 || Math.abs(ticks[ticks.length - 1] - rounded) > niceStep * 0.1) {
      ticks.push(rounded);
    }
  }

  // Ensure 0 is included if domain spans across 0
  if (min < 0 && max > 0 && !ticks.some((t) => Math.abs(t) < niceStep * 0.1)) {
    ticks.push(0);
    ticks.sort((a, b) => a - b);
  }

  if (ticks.length < 2) {
    return [Number(min.toFixed(1)), 0, Number(max.toFixed(1))];
  }

  return ticks;
}

/**
 * Format a number cleanly for graph axes using Intl.NumberFormat and compact SI symbols.
 */
export function formatAxisNumber(val: number): string {
  if (val === 0) return '0';
  const abs = Math.abs(val);

  if (abs >= 1e9) {
    const v = val / 1e9;
    return `${Number(v.toFixed(1))}B`;
  }
  if (abs >= 1e6) {
    const v = val / 1e6;
    return `${Number(v.toFixed(1))}M`;
  }
  if (abs >= 1e3) {
    const v = val / 1e3;
    return `${Number(v.toFixed(1))}k`;
  }
  if (abs < 0.001) {
    return val.toExponential(1);
  }
  return Number(val.toFixed(2)).toString();
}

/**
 * 4-Quadrant Smart Auto-Fit:
 * Always establishes a balanced, symmetric 4-quadrant coordinate space centered at (0, 0).
 */
export function computeSmartAutoFitBounds(
  expressions: string[],
  preferredSpan = 6
): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const validExprs = expressions.filter((e) => e && e.trim() !== '');
  if (validExprs.length === 0) {
    return { xMin: -preferredSpan, xMax: preferredSpan, yMin: -preferredSpan, yMax: preferredSpan };
  }

  const sampledYValues: number[] = [];

  // Sample points across moderate domain [-preferredSpan, preferredSpan]
  validExprs.forEach((expr) => {
    const data = generatePlotData(expr, -preferredSpan, preferredSpan, 150);
    data.forEach((p) => {
      if (p.y !== null && !isNaN(p.y) && isFinite(p.y)) {
        sampledYValues.push(p.y);
      }
    });
  });

  if (sampledYValues.length === 0) {
    return { xMin: -preferredSpan, xMax: preferredSpan, yMin: -preferredSpan, yMax: preferredSpan };
  }

  // Sort values to compute robust trimmed percentiles
  sampledYValues.sort((a, b) => a - b);
  const n = sampledYValues.length;

  const p05 = Math.abs(sampledYValues[Math.floor(n * 0.05)] || 0);
  const p85 = Math.abs(sampledYValues[Math.floor(n * 0.85)] || 0);

  // Compute a balanced symmetric half-height for Y
  const maxExtent = Math.max(p05, p85, 2);
  const clampedYHalf = Math.min(Math.max(maxExtent * 1.15, 3), 15);

  return {
    xMin: -preferredSpan,
    xMax: preferredSpan,
    yMin: -Number(clampedYHalf.toFixed(1)),
    yMax: Number(clampedYHalf.toFixed(1)),
  };
}

/**
 * Convert data points for an explicit function f(x) into an SVG path string.
 * Automatically splits segments across vertical asymptotes to prevent vertical jump lines.
 */
export function pointsToSvgPath(
  points: DataPoint[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  plotBox: { left: number; top: number; width: number; height: number },
  yScale: 'linear' | 'log' = 'linear'
): string {
  if (!points || points.length < 2) return '';
  const xSpan = Math.max(1e-9, xMax - xMin);

  const symlog = (y: number) => (y === 0 ? 0 : Math.sign(y) * Math.log10(1 + Math.abs(y)));
  const ySpan = Math.max(1e-9, yMax - yMin);
  const logMin = symlog(yMin);
  const logMax = symlog(yMax);
  const logSpan = Math.max(1e-9, logMax - logMin);

  const toPxX = (x: number) => plotBox.left + ((x - xMin) / xSpan) * plotBox.width;
  const toPxY = (y: number) => {
    if (yScale === 'log') {
      const ly = symlog(y);
      return plotBox.top + ((logMax - ly) / logSpan) * plotBox.height;
    }
    return plotBox.top + ((yMax - y) / ySpan) * plotBox.height;
  };

  const pathParts: string[] = [];
  let isDrawing = false;
  let prevY: number | null = null;
  const yThreshold = ySpan * 1.5;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.y === null || isNaN(p.y) || !isFinite(p.y)) {
      isDrawing = false;
      prevY = null;
      continue;
    }

    // Detect asymptote jump: opposite signs and large jump
    if (prevY !== null && Math.abs(p.y - prevY) > yThreshold && p.y * prevY < 0) {
      isDrawing = false;
    }

    const px = toPxX(p.x);
    const py = toPxY(p.y);

    // Limit extreme pixel values to prevent renderer overflow
    const clampedPy = Math.max(plotBox.top - 100, Math.min(plotBox.top + plotBox.height + 100, py));

    if (!isDrawing) {
      pathParts.push(`M ${px.toFixed(2)} ${clampedPy.toFixed(2)}`);
      isDrawing = true;
    } else {
      pathParts.push(`L ${px.toFixed(2)} ${clampedPy.toFixed(2)}`);
    }
    prevY = p.y;
  }

  return pathParts.join(' ');
}

