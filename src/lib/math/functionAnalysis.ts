/**
 * Mathematical Function Analysis Engine
 * Computes Domain, Range, Intercepts, and Asymptotes for display in Graphing Studio
 */
import * as math from 'mathjs';
import { normalizeExpression } from './normalizer';
import { findVerticalAsymptotes } from './graphData';

export interface FunctionAnalysisResult {
  expression: string;
  domain: string; // e.g. "(-∞, ∞)", "x ≠ 2", "[0, ∞)"
  range: string;  // e.g. "(-∞, ∞)", "[0, ∞)", "y ≠ 0"
  xIntercepts: string[]; // roots e.g. ["x = 2", "x = -3"]
  yIntercept: string;   // e.g. "(0, 1)" or "None (x = 0 not in domain)"
  asymptotes: {
    vertical: string[];   // e.g. ["x = 2"]
    horizontal: string[]; // e.g. ["y = 0"]
    slant: string[];      // e.g. ["y = x + 1"]
  };
}

export function analyzeFunction(input: string): FunctionAnalysisResult | null {
  if (!input) return null;
  let expr = input.replace(/^y\s*=\s*/, '').trim();
  if (!expr || expr.startsWith('{')) return null; // skip piecewise
  expr = normalizeExpression(expr);

  let compiled: any = null;
  try {
    compiled = math.compile(expr);
  } catch {
    return null;
  }

  const evalAt = (x: number): number | null => {
    try {
      const res = compiled.evaluate({ x });
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) return res;
      if (res && typeof res.re === 'number' && Math.abs(res.im || 0) < 1e-9) return res.re;
      return null;
    } catch {
      return null;
    }
  };

  // 1. Vertical Asymptotes & Denominator Discontinuities
  const vAsyms = findVerticalAsymptotes(expr, -20, 20);
  const verticalStr = vAsyms.map((a) => `x = ${Number(a.toFixed(3))}`);

  // 2. Domain
  let domain = '(-\\infty, \\infty)';
  if (vAsyms.length > 0) {
    domain = vAsyms.map((a) => `x \\neq ${Number(a.toFixed(3))}`).join(', \\; ');
  } else if (/\bsqrt\s*\(/.test(expr)) {
    // Basic detection for sqrt(x)
    if (/sqrt\s*\(\s*x\s*\)/.test(expr)) {
      domain = '[0, \\infty)';
    } else {
      domain = '\\text{Restricted (non-negative radicand)}';
    }
  } else if (/\b(ln|log)\s*\(/.test(expr)) {
    if (/(ln|log)\s*\(\s*x\s*\)/.test(expr)) {
      domain = '(0, \\infty)';
    } else {
      domain = '\\text{Restricted (positive argument)}';
    }
  }

  // 3. y-Intercept: f(0)
  let yIntercept = 'None';
  const y0 = evalAt(0);
  if (y0 !== null && isFinite(y0)) {
    yIntercept = `(0, \\; ${Number(y0.toFixed(4))})`;
  } else {
    yIntercept = '\\text{None } (x = 0 \\notin \\text{Domain})';
  }

  // 4. x-Intercepts (Numerical scan for roots in [-15, 15])
  const roots: number[] = [];
  const scanStep = 0.05;
  for (let x = -15; x <= 15; x += scanStep) {
    const y1 = evalAt(x);
    const y2 = evalAt(x + scanStep);
    if (y1 !== null && y2 !== null && y1 * y2 <= 0 && Math.abs(y1 - y2) < 5) {
      const approxRoot = Number((x + (scanStep * Math.abs(y1)) / (Math.abs(y1) + Math.abs(y2) || 1)).toFixed(3));
      if (!roots.some((r) => Math.abs(r - approxRoot) < 0.1)) {
        roots.push(approxRoot);
      }
    }
  }
  const xIntercepts = roots.length > 0
    ? roots.slice(0, 5).map((r) => `(${r}, \\; 0)`)
    : ['\\text{None in range}'];

  // 5. Horizontal & Slant Asymptotes
  const horizontal: string[] = [];
  const slant: string[] = [];

  const yPosInf = evalAt(10000);
  const yNegInf = evalAt(-10000);

  if (yPosInf !== null && isFinite(yPosInf) && Math.abs(yPosInf) < 1000) {
    const limPos = Number(yPosInf.toFixed(3));
    horizontal.push(`y = ${limPos}`);
  }

  // Slant asymptote check: m = lim f(x)/x, b = lim (f(x) - mx)
  if (horizontal.length === 0) {
    const yHuge1 = evalAt(10000);
    const yHuge2 = evalAt(20000);
    if (yHuge1 !== null && yHuge2 !== null) {
      const mApprox = (yHuge2 - yHuge1) / 10000;
      if (Math.abs(mApprox) > 1e-4 && Math.abs(mApprox) < 100) {
        const bApprox = yHuge2 - mApprox * 20000;
        if (Math.abs(bApprox) < 100) {
          const mRound = Number(mApprox.toFixed(2));
          const bRound = Number(bApprox.toFixed(2));
          slant.push(`y = ${mRound === 1 ? '' : mRound}x ${bRound >= 0 ? `+ ${bRound}` : `- ${Math.abs(bRound)}`}`);
        }
      }
    }
  }

  // 6. Range estimation
  let range = '(-\\infty, \\infty)';
  if (horizontal.length > 0 && vAsyms.length > 0) {
    const hVal = parseFloat(horizontal[0].replace('y =', '').trim());
    if (!isNaN(hVal)) {
      range = `y \\neq ${hVal}`;
    }
  } else if (/x\^2/.test(expr) && !/x\^3/.test(expr)) {
    // Parabolic vertex estimation
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let x = -20; x <= 20; x += 0.2) {
      const y = evalAt(x);
      if (y !== null) {
        if (y < minVal) minVal = y;
        if (y > maxVal) maxVal = y;
      }
    }
    if (minVal > -100 && minVal !== Infinity) {
      range = `[${Number(minVal.toFixed(2))}, \\; \\infty)`;
    }
  }

  return {
    expression: input,
    domain,
    range,
    xIntercepts,
    yIntercept,
    asymptotes: {
      vertical: verticalStr.length > 0 ? verticalStr : ['\\text{None}'],
      horizontal: horizontal.length > 0 ? horizontal : ['\\text{None}'],
      slant: slant.length > 0 ? slant : ['\\text{None}'],
    },
  };
}
