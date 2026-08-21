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

/**
 * Find vertical asymptotes of an expression in the domain [xMin, xMax].
 * Uses zero-crossing and singularity detection of 1/f(x) = 0.
 */
export function findVerticalAsymptotes(
  expression: string,
  xMin: number,
  xMax: number
): number[] {
  const asymptotes: number[] = [];
  const expr = parseExpression(expression);
  if (!expr || expr === '0') return asymptotes;

  let compiled: any = null;
  try {
    compiled = math.compile(expr);
  } catch {
    return asymptotes;
  }

  const evalF = (xVal: number): number | null => {
    try {
      const res = compiled.evaluate({ x: xVal });
      if (typeof res === 'number' && !isNaN(res)) return res;
      if (res && typeof res.re === 'number' && Math.abs(res.im || 0) < 1e-9) return res.re;
      return null;
    } catch {
      return null;
    }
  };

  const evalInv = (xVal: number): number | null => {
    const val = evalF(xVal);
    if (val === null || !isFinite(val)) return 0;
    if (Math.abs(val) < 1e-15) return 1e15;
    return 1 / val;
  };

  // Numerical search by scanning 1/f(x) over fine intervals
  const scanSteps = Math.min(1500, Math.max(350, Math.round((xMax - xMin) * 60)));
  const dx = (xMax - xMin) / scanSteps;

  let prevX = xMin;
  let prevInv = evalInv(prevX);

  for (let i = 1; i <= scanSteps; i++) {
    const currX = xMin + i * dx;
    const currInv = evalInv(currX);

    // If 1/f(x) is zero or changes sign across the interval
    if (
      currInv !== null &&
      prevInv !== null &&
      ((prevInv * currInv <= 0 && (prevInv !== 0 || currInv !== 0)) ||
        (Math.abs(currInv) < 1e-5 && Math.abs(prevInv) < 1e-5))
    ) {
      // Binary search root of 1/f(x) = 0
      let lo = prevX;
      let hi = currX;
      for (let iter = 0; iter < 24; iter++) {
        const mid = (lo + hi) / 2;
        const midInv = evalInv(mid);
        if (midInv === null || midInv === 0 || Math.abs(midInv) < 1e-14) {
          lo = mid;
          hi = mid;
          break;
        }
        if (prevInv * midInv <= 0) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      const root = Number(((lo + hi) / 2).toFixed(5));
      // Verify that near this root, |f(x)| actually blows up
      const testLeft = evalF(root - 1e-4);
      const testRight = evalF(root + 1e-4);
      const isBlowup =
        testLeft === null ||
        testRight === null ||
        !isFinite(testLeft) ||
        !isFinite(testRight) ||
        Math.abs(testLeft) > 15 ||
        Math.abs(testRight) > 15;

      if (isBlowup) {
        if (!asymptotes.some((a) => Math.abs(a - root) < 0.015)) {
          asymptotes.push(root);
        }
      }
    }

    prevX = currX;
    prevInv = currInv;
  }

  return asymptotes.sort((a, b) => a - b);
}

export function generatePlotData(
  expression: string,
  xMin: number,
  xMax: number,
  numPoints: number = 450
): DataPoint[] {
  const data: DataPoint[] = [];
  if (xMin >= xMax) return data;
  const expr = parseExpression(expression);

  let compiled: any = null;
  try {
    compiled = math.compile(expr);
  } catch {
    return data;
  }

  const evalAt = (x: number): number | null => {
    try {
      const y = compiled.evaluate({ x });
      if (typeof y === 'number' && !isNaN(y) && isFinite(y)) return y;
      if (y && typeof y.re === 'number' && Math.abs(y.im || 0) < 1e-9) return y.re;
      return null;
    } catch {
      return null;
    }
  };

  const asymptotes = findVerticalAsymptotes(expression, xMin, xMax);
  const step = (xMax - xMin) / numPoints;

  // Collect all critical x coordinates
  const xSamples: number[] = [];
  for (let i = 0; i <= numPoints; i++) {
    xSamples.push(xMin + i * step);
  }

  // Insert fine samples and exact null breaks around asymptotes
  asymptotes.forEach((asym) => {
    if (asym > xMin && asym < xMax) {
      xSamples.push(asym - 0.01);
      xSamples.push(asym - 0.001);
      xSamples.push(asym); // Exact asymptote
      xSamples.push(asym + 0.001);
      xSamples.push(asym + 0.01);
    }
  });

  // Sort and deduplicate
  xSamples.sort((a, b) => a - b);
  const uniqueX: number[] = [];
  for (let i = 0; i < xSamples.length; i++) {
    if (i === 0 || Math.abs(xSamples[i] - xSamples[i - 1]) > 1e-7) {
      uniqueX.push(xSamples[i]);
    }
  }

  uniqueX.forEach((x) => {
    // If x is at an exact asymptote, insert null gap
    if (asymptotes.some((a) => Math.abs(a - x) < 1e-4)) {
      data.push({ x, y: null as any });
      return;
    }

    const y = evalAt(x);
    if (y !== null && Math.abs(y) < 1e9) {
      data.push({ x, y });
    } else {
      data.push({ x, y: null as any });
    }
  });

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
  for (let t = startTick; t <= endTick + 1e-9; t += niceStep) {
    ticks.push(Number(t.toFixed(4)));
  }

  return ticks.length >= 2 ? ticks : [min, (min + max) / 2, max];
}

/**
 * Clean compact number formatter for axis labels.
 */
export function formatAxisNumber(val: number): string {
  if (Math.abs(val) < 1e-10) return '0';
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
 * Automatically splits segments across vertical asymptotes to prevent false connector lines.
 */
export function pointsToSvgPath(
  points: DataPoint[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  plotBox: { left: number; top: number; width: number; height: number },
  yScale: 'linear' | 'log' = 'linear',
  knownAsymptotes: number[] = []
): string {
  if (!points || points.length < 2) return '';
  const xSpan = Math.max(1e-9, xMax - xMin);
  const ySpan = Math.max(1e-9, yMax - yMin);

  const symlog = (y: number) => (y === 0 ? 0 : Math.sign(y) * Math.log10(1 + Math.abs(y)));
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
  let prevPoint: DataPoint | null = null;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.y === null || isNaN(p.y) || !isFinite(p.y)) {
      isDrawing = false;
      prevPoint = null;
      continue;
    }

    if (prevPoint && prevPoint.y !== null) {
      const dx = Math.abs(p.x - prevPoint.x);
      const dy = Math.abs(p.y - prevPoint.y);
      const minX = Math.min(prevPoint.x, p.x);
      const maxX = Math.max(prevPoint.x, p.x);

      // Check 1: Known asymptote crossing in [prevX, currX]
      const hasAsymptoteCrossing = knownAsymptotes.some(
        (a) => a >= minX - 1e-4 && a <= maxX + 1e-4
      );

      // Check 2: Steep jump with opposite signs
      const isOppositeSignJump =
        prevPoint.y * p.y < 0 &&
        dy / Math.max(1e-6, dx) > (ySpan / xSpan) * 6 &&
        (Math.abs(prevPoint.y) > ySpan * 0.3 || Math.abs(p.y) > ySpan * 0.3);

      // Check 3: Huge same-sign spike (like 1/x^2)
      const isExtremeSpike =
        (Math.abs(prevPoint.y) > ySpan * 1.8 && Math.abs(p.y) > ySpan * 1.8) ||
        dy > ySpan * 2.5;

      if (hasAsymptoteCrossing || isOppositeSignJump || isExtremeSpike) {
        isDrawing = false;
      }
    }

    const px = toPxX(p.x);
    const py = toPxY(p.y);

    // Limit extreme pixel values to prevent renderer overflow
    const clampedPy = Math.max(plotBox.top - 120, Math.min(plotBox.top + plotBox.height + 120, py));

    if (!isDrawing) {
      pathParts.push(`M ${px.toFixed(2)} ${clampedPy.toFixed(2)}`);
      isDrawing = true;
    } else {
      pathParts.push(`L ${px.toFixed(2)} ${clampedPy.toFixed(2)}`);
    }
    prevPoint = p;
  }

  return pathParts.join(' ');
}
