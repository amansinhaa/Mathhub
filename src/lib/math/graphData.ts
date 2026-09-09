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

export interface PiecewiseBranch {
  condition: string;
  expression: string;
  compiledExpr: any;
  testCondition: (x: number) => boolean;
  min?: number;
  max?: number;
  includeMin?: boolean;
  includeMax?: boolean;
}

export interface PiecewiseEndpoint {
  x: number;
  y: number;
  inclusive: boolean;
}

/** Check if input string is in piecewise syntax, e.g. {x < 0: -x, x >= 0: x^2} */
export function isPiecewiseExpression(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  return trimmed.startsWith('{') && trimmed.endsWith('}') && trimmed.includes(':');
}

/** Parse piecewise syntax into branches and condition evaluators */
export function parsePiecewiseBranches(input: string): PiecewiseBranch[] {
  const trimmed = input.trim();
  const inner = trimmed.replace(/^\{|\}$/g, '').trim();
  const parts = inner.split(/,(?![^{]*\})/);
  const branches: PiecewiseBranch[] = [];

  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const condStr = part.slice(0, colonIdx).trim();
    const exprStr = part.slice(colonIdx + 1).trim();

    let compiledExpr: any = null;
    try {
      compiledExpr = math.compile(normalizeExpression(exprStr));
    } catch {
      continue;
    }

    // Build condition evaluator
    let testFn: (x: number) => boolean = () => true;
    let min: number | undefined;
    let max: number | undefined;
    let includeMin = false;
    let includeMax = false;

    // Pattern 1: x < val, x <= val, x > val, x >= val
    const singleComp = condStr.match(/x\s*(<=|>=|<|>|==|=)\s*(-?\d+(\.\d+)?)/);
    // Pattern 2: a < x < b, a <= x <= b
    const doubleComp = condStr.match(/(-?\d+(\.\d+)?)\s*(<=|<)\s*x\s*(<=|<)\s*(-?\d+(\.\d+)?)/);

    if (doubleComp) {
      const a = parseFloat(doubleComp[1]);
      const op1 = doubleComp[3];
      const op2 = doubleComp[4];
      const b = parseFloat(doubleComp[5]);
      min = a;
      max = b;
      includeMin = op1 === '<=';
      includeMax = op2 === '<=';
      testFn = (x: number) => {
        const c1 = includeMin ? x >= a : x > a;
        const c2 = includeMax ? x <= b : x < b;
        return c1 && c2;
      };
    } else if (singleComp) {
      const op = singleComp[1];
      const val = parseFloat(singleComp[2]);
      if (op === '<') {
        max = val;
        includeMax = false;
        testFn = (x: number) => x < val;
      } else if (op === '<=') {
        max = val;
        includeMax = true;
        testFn = (x: number) => x <= val;
      } else if (op === '>') {
        min = val;
        includeMin = false;
        testFn = (x: number) => x > val;
      } else if (op === '>=') {
        min = val;
        includeMin = true;
        testFn = (x: number) => x >= val;
      } else if (op === '==' || op === '=') {
        min = val;
        max = val;
        includeMin = true;
        includeMax = true;
        testFn = (x: number) => Math.abs(x - val) < 1e-6;
      }
    } else {
      // Fallback condition evaluator using mathjs
      try {
        const condCompiled = math.compile(condStr);
        testFn = (x: number) => Boolean(condCompiled.evaluate({ x }));
      } catch {
        testFn = () => true;
      }
    }

    branches.push({
      condition: condStr,
      expression: exprStr,
      compiledExpr,
      testCondition: testFn,
      min,
      max,
      includeMin,
      includeMax,
    });
  }

  return branches;
}

/** Extract open/closed boundary endpoint points for piecewise curves */
export function extractPiecewiseEndpoints(branches: PiecewiseBranch[]): PiecewiseEndpoint[] {
  const endpoints: PiecewiseEndpoint[] = [];

  branches.forEach((b) => {
    if (b.min !== undefined && b.compiledExpr) {
      try {
        const y = b.compiledExpr.evaluate({ x: b.min });
        if (typeof y === 'number' && Number.isFinite(y)) {
          endpoints.push({ x: b.min, y, inclusive: Boolean(b.includeMin) });
        }
      } catch {
        // skip
      }
    }
    if (b.max !== undefined && b.compiledExpr) {
      try {
        const y = b.compiledExpr.evaluate({ x: b.max });
        if (typeof y === 'number' && Number.isFinite(y)) {
          endpoints.push({ x: b.max, y, inclusive: Boolean(b.includeMax) });
        }
      } catch {
        // skip
      }
    }
  });

  return endpoints;
}

export function parseExpression(input: string): string {
  let expr = input.replace(/^y\s*=\s*/, '').trim();
  if (!expr) return '0';
  // Normalize Unicode superscripts (x², x³), symbols (√, π, ×), etc.
  expr = normalizeExpression(expr);
  return expr;
}

/** Check whether an equation is a constant parameter/slider definition, e.g. "a = 2", "i = 0.4", "m = -1.5" */
export function isSliderParameter(expr: string): { variable: string; value: number } | null {
  if (!expr) return null;
  const clean = expr.trim();
  const match = clean.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*([-+]?[0-9]*\.?[0-9]+)$/);
  if (!match) return null;
  const varName = match[1];
  if (varName === 'x' || varName === 'y') return null;
  const val = parseFloat(match[2]);
  if (isNaN(val) || !isFinite(val)) return null;
  return { variable: varName, value: val };
}

/** Check whether an equation is a vertical line, e.g. "x = 3" or "x = -4" */
export function isVerticalLine(expr: string, parameters: Record<string, number> = {}): { x: number } | null {
  if (!expr) return null;
  const clean = expr.trim();
  const match = clean.match(/^x\s*=\s*([^=]+)$/i);
  if (!match) return null;
  const rhs = match[1].trim();
  if (/\by\b/i.test(rhs)) return null;
  try {
    const compiled = math.compile(normalizeExpression(rhs));
    const val = compiled.evaluate(parameters);
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return { x: val };
    }
  } catch {
    // fallback
  }
  return null;
}

/** Extract all unbound single-letter variables in an expression (e.g. "i" in "y = i2x - 3i") */
export function findUnboundVariables(expr: string, definedVars: string[] = []): string[] {
  if (!expr) return [];
  const clean = expr.replace(/^[a-zA-Z]\s*=\s*/, '').replace(/^f\s*\(\s*x\s*\)\s*=\s*/, '').trim();
  const norm = normalizeExpression(clean);
  const reserved = new Set([
    'x', 'y', 'e', 'pi', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh', 'log', 'ln',
    'exp', 'sqrt', 'cbrt', 'abs', 'ceil', 'floor', 'round', 'sign',
    'min', 'max', 'nthRoot', 'pow', 'mod', 'theta', 'alpha', 'beta',
    'gamma', 'lambda', 'mu', 'sigma', 'omega', 'phi', 'Delta'
  ]);
  definedVars.forEach(v => reserved.add(v));

  const tokens = norm.match(/[a-zA-Z]+/g) || [];
  const unbound = new Set<string>();
  for (const t of tokens) {
    if (!reserved.has(t) && t.length === 1) {
      unbound.add(t);
    }
  }
  return Array.from(unbound);
}

/**
 * Find vertical asymptotes of an expression in the domain [xMin, xMax].
 * Uses zero-crossing and singularity detection of 1/f(x) = 0.
 */
export function findVerticalAsymptotes(
  expression: string,
  xMin: number,
  xMax: number,
  parameters: Record<string, number> = {}
): number[] {
  const asymptotes: number[] = [];
  const expr = parseExpression(expression);
  if (!expr || expr === '0') return asymptotes;

  // Optimization & Accuracy check: Only expressions with potential singularities can have vertical asymptotes.
  // Polynomials, linear functions, pure sin/cos, etc. have no vertical asymptotes.
  const hasSingularityPattern =
    /\//.test(expr) ||
    /\b(tan|cot|sec|csc)\b/.test(expr) ||
    /\^(-|\([+-]?[0-9])/.test(expr) ||
    /\b(ln|log)\b/.test(expr);

  if (!hasSingularityPattern) {
    return asymptotes;
  }

  let compiled: any = null;
  try {
    compiled = math.compile(expr);
  } catch {
    return asymptotes;
  }

  const evalF = (xVal: number): number | null => {
    try {
      const res = compiled.evaluate({ x: xVal, ...parameters });
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
      // Verify that near this root, |f(x)| actually blows up towards infinity
      const testLeft = evalF(root - 1e-4);
      const testRight = evalF(root + 1e-4);
      const testFarLeft = evalF(root - 0.05);
      const testFarRight = evalF(root + 0.05);

      const isLeftBlowup =
        testLeft === null ||
        !isFinite(testLeft) ||
        (Math.abs(testLeft) > 50 && (testFarLeft === null || Math.abs(testLeft) > Math.abs(testFarLeft) * 1.5));
      const isRightBlowup =
        testRight === null ||
        !isFinite(testRight) ||
        (Math.abs(testRight) > 50 && (testFarRight === null || Math.abs(testRight) > Math.abs(testFarRight) * 1.5));

      const isBlowup = isLeftBlowup || isRightBlowup;

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
  numPoints: number = 450,
  parameters: Record<string, number> = {}
): DataPoint[] {
  const data: DataPoint[] = [];
  if (xMin >= xMax) return data;

  // ─── Piecewise Evaluation Branch ──────────────────────────────────────────
  if (isPiecewiseExpression(expression)) {
    const branches = parsePiecewiseBranches(expression);
    if (branches.length === 0) return data;

    const step = (xMax - xMin) / numPoints;
    let prevActiveBranch = -1;

    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + i * step;
      let activeBranch = -1;
      let yVal: number | null = null;

      for (let bIdx = 0; bIdx < branches.length; bIdx++) {
        const branch = branches[bIdx];
        if (branch.testCondition(x)) {
          activeBranch = bIdx;
          try {
            const res = branch.compiledExpr.evaluate({ x, ...parameters });
            if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
              yVal = res;
            } else if (res && typeof res.re === 'number' && Math.abs(res.im || 0) < 1e-9) {
              yVal = res.re;
            }
          } catch {
            yVal = null;
          }
          break;
        }
      }

      // If switching branches, insert a null gap so svg path doesn't connect disparate branches
      if (activeBranch !== prevActiveBranch && prevActiveBranch !== -1) {
        data.push({ x, y: null as any });
      }

      if (yVal !== null && Math.abs(yVal) < 1e9) {
        data.push({ x, y: yVal });
      } else {
        data.push({ x, y: null as any });
      }

      prevActiveBranch = activeBranch;
    }

    return data;
  }

  // ─── Standard Function Evaluation ─────────────────────────────────────────
  const expr = parseExpression(expression);

  let compiled: any = null;
  try {
    compiled = math.compile(expr);
  } catch {
    return data;
  }

  const evalAt = (x: number): number | null => {
    try {
      const y = compiled.evaluate({ x, ...parameters });
      if (typeof y === 'number' && !isNaN(y) && isFinite(y)) return y;
      if (y && typeof y.re === 'number' && Math.abs(y.im || 0) < 1e-9) return y.re;
      return null;
    } catch {
      return null;
    }
  };

  const asymptotes = findVerticalAsymptotes(expression, xMin, xMax, parameters);
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
  const yBoxTop = plotBox.top;
  const yBoxBottom = plotBox.top + plotBox.height;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.y === null || isNaN(p.y) || !isFinite(p.y)) {
      isDrawing = false;
      prevPoint = null;
      continue;
    }

    const px = toPxX(p.x);
    const py = toPxY(p.y);
    const isAbove = py < yBoxTop;
    const isBelow = py > yBoxBottom;
    const isInside = !isAbove && !isBelow;

    if (prevPoint && prevPoint.y !== null) {
      const prevPx = toPxX(prevPoint.x);
      const prevPy = toPxY(prevPoint.y);
      const prevAbove = prevPy < yBoxTop;
      const prevBelow = prevPy > yBoxBottom;
      const prevInside = !prevAbove && !prevBelow;

      // Check 1: Known asymptote crossing in [prevX, currX]
      const dx = Math.abs(p.x - prevPoint.x);
      const dy = Math.abs(p.y - prevPoint.y);
      const minX = Math.min(prevPoint.x, p.x);
      const maxX = Math.max(prevPoint.x, p.x);

      const hasAsymptoteCrossing = knownAsymptotes.some(
        (a) => a >= minX - 1e-4 && a <= maxX + 1e-4
      );

      // Check 2: Steep jump with opposite signs across an asymptote (e.g. f(x) -> -inf on one side and +inf on the other)
      // Must NOT trigger for normal continuous functions crossing y = 0!
      // Therefore, both points must be significantly away from 0, and dy must be large.
      const isOppositeSignJump =
        prevPoint.y * p.y < 0 &&
        Math.abs(prevPoint.y) > ySpan * 0.4 &&
        Math.abs(p.y) > ySpan * 0.4 &&
        dy > ySpan * 0.8;

      // Check 3: Huge same-sign spike (like 1/x^2)
      const isExtremeSpike =
        (Math.abs(prevPoint.y) > ySpan * 1.5 && Math.abs(p.y) > ySpan * 1.5 && dy > ySpan * 1.5) ||
        dy > ySpan * 3.0;

      // Check 4: Cross-viewport jump (one point way above and one way below the viewport)
      const isCrossViewportJump =
        (prevPoint.y < yMin && p.y > yMax) ||
        (prevPoint.y > yMax && p.y < yMin);

      if (hasAsymptoteCrossing || isOppositeSignJump || isExtremeSpike || isCrossViewportJump) {
        isDrawing = false;
        prevPoint = p;
        continue;
      }

      // Both points are outside on the same side: lift pen, do not draw horizontal line
      if ((isAbove && prevAbove) || (isBelow && prevBelow)) {
        isDrawing = false;
        prevPoint = p;
        continue;
      }

      // Transition: Inside -> Outside (interpolate exact exit on boundary)
      if (prevInside && (isAbove || isBelow)) {
        const targetPy = isAbove ? yBoxTop : yBoxBottom;
        const t = (targetPy - prevPy) / (py - prevPy);
        const intersectPx = prevPx + t * (px - prevPx);
        pathParts.push(`L ${intersectPx.toFixed(2)} ${targetPy.toFixed(2)}`);
        isDrawing = false;
        prevPoint = p;
        continue;
      }

      // Transition: Outside -> Inside (interpolate exact entry on boundary)
      if ((prevAbove || prevBelow) && isInside) {
        const targetPy = prevAbove ? yBoxTop : yBoxBottom;
        const t = (targetPy - prevPy) / (py - prevPy);
        const intersectPx = prevPx + t * (px - prevPx);
        pathParts.push(`M ${intersectPx.toFixed(2)} ${targetPy.toFixed(2)}`);
        pathParts.push(`L ${px.toFixed(2)} ${py.toFixed(2)}`);
        isDrawing = true;
        prevPoint = p;
        continue;
      }
    }

    // Normal inside point
    if (isInside) {
      if (!isDrawing) {
        pathParts.push(`M ${px.toFixed(2)} ${py.toFixed(2)}`);
        isDrawing = true;
      } else {
        pathParts.push(`L ${px.toFixed(2)} ${py.toFixed(2)}`);
      }
    }

    prevPoint = p;
  }

  return pathParts.join(' ');
}
