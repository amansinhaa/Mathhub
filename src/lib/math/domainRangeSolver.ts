import { SolverResult, SolutionStep } from '@/types/solver';
import { normalizeExpression, expressionToLatex } from './normalizer';
import { detectVariable } from './solver';
// @ts-ignore
import nerdamer from 'nerdamer/all.min.js';
import * as math from 'mathjs';

export interface DomainRangeResult {
  domainInterval: string;      // e.g. "[-2, 2]" or "(-\\infty, 3) \\cup (3, \\infty)"
  domainSetBuilder: string;    // e.g. "{x \\in \\mathbb{R} \\mid x \\neq 3}"
  rangeInterval: string;       // e.g. "[0, \\infty)"
  rangeSetBuilder: string;     // e.g. "{y \\in \\mathbb{R} \\mid y \\ge 0}"
  domainSteps: SolutionStep[];
  rangeSteps: SolutionStep[];
}

/**
 * Format an array of excluded points into LaTeX interval union.
 * E.g. [3] -> "(-\\infty, 3) \\cup (3, \\infty)"
 * E.g. [-1, 2] -> "(-\\infty, -1) \\cup (-1, 2) \\cup (2, \\infty)"
 */
function excludedPointsToInterval(points: number[], variable: string = 'x'): { interval: string; setBuilder: string } {
  if (points.length === 0) {
    return {
      interval: '(-\\infty, \\infty)',
      setBuilder: `{${variable} \\in \\mathbb{R}}`,
    };
  }
  const sorted = [...new Set(points)].sort((a, b) => a - b);
  const parts: string[] = [];
  parts.push(`(-\\infty, ${formatNum(sorted[0])})`);
  for (let i = 0; i < sorted.length - 1; i++) {
    parts.push(`(${formatNum(sorted[i])}, ${formatNum(sorted[i + 1])})`);
  }
  parts.push(`(${formatNum(sorted[sorted.length - 1])}, \\infty)`);

  const neqStr = sorted.map(p => `${variable} \\neq ${formatNum(p)}`).join(',\\; ');
  return {
    interval: parts.join(' \\cup '),
    setBuilder: `{${variable} \\in \\mathbb{R} \\mid ${neqStr}}`,
  };
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return `${n}`;
  // Check common simple fractions
  for (let den = 2; den <= 12; den++) {
    const num = Math.round(n * den);
    if (Math.abs(n - num / den) < 1e-6) {
      return num < 0 ? `-\\frac{${Math.abs(num)}}{${den}}` : `\\frac{${num}}{${den}}`;
    }
  }
  return n.toFixed(4).replace(/\.?0+$/, '');
}

/**
 * Solve domain and range of a function or expression.
 */
export function solveDomainAndRange(input: string): SolverResult {
  const raw = input.trim();
  if (!raw) {
    throw new Error('Please enter a function to find its domain and range (e.g. f(x) = x^2 - 4 or 1/(x-3)).');
  }

  // Detect function name and variable, e.g. f(x) = ..., y = ...
  let cleanInput = raw;
  let funcName = 'f';
  let varName = 'x';

  const funcMatch = cleanInput.match(/^([a-zA-Z])\(([a-zA-Z])\)\s*=\s*(.+)$/);
  if (funcMatch) {
    funcName = funcMatch[1];
    varName = funcMatch[2];
    cleanInput = funcMatch[3];
  } else {
    const yMatch = cleanInput.match(/^y\s*=\s*(.+)$/i);
    if (yMatch) {
      funcName = 'y';
      cleanInput = yMatch[1];
    }
  }

  // Also strip trailing = 0 if accidentally entered
  cleanInput = cleanInput.replace(/=\s*0$/, '').trim();

  const normalized = normalizeExpression(cleanInput);
  if (!varName) {
    varName = detectVariable(normalized) || 'x';
  }

  const steps: SolutionStep[] = [];

  // Step 1: Standard definition
  const funcLatex = expressionToLatex(normalized);
  steps.push({
    stepNumber: 1,
    explanation: `Identify the function and variable. We analyze the domain (all permissible input values of $${varName}$) and the range (all resulting output values of $${funcName}(${varName})$).`,
    math: `${funcName}(${varName}) = ${funcLatex}`,
  });

  // Analyze function components
  const hasSqrt = /sqrt|√/i.test(cleanInput);
  const hasLog = /ln|log/i.test(cleanInput);
  const hasTrig = /sin|cos|tan/i.test(cleanInput);
  const hasAbs = /abs|\|.+?\|/i.test(cleanInput);
  const hasDivision = cleanInput.includes('/') || /\/[a-zA-Z0-9(]/.test(cleanInput);

  let domainInterval = '(-\\infty, \\infty)';
  let domainSetBuilder = `{${varName} \\in \\mathbb{R}}`;
  let rangeInterval = '(-\\infty, \\infty)';
  let rangeSetBuilder = '{y \\in \\mathbb{R}}';

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 1: Radical Functions (Square Roots)
  // ──────────────────────────────────────────────────────────────────────────
  if (hasSqrt && !hasDivision) {
    // E.g. sqrt(4 - x^2), sqrt(x - 3), 3 + 2*sqrt(x + 1)
    const sqrtMatch = cleanInput.match(/(?:sqrt\(([^)]+)\)|√\(([^)]+)\)|√([a-zA-Z0-9^]+))/);
    const radicand = sqrtMatch ? (sqrtMatch[1] || sqrtMatch[2] || sqrtMatch[3]) : cleanInput;

    steps.push({
      stepNumber: 2,
      explanation: `For an even root (square root) in the real number system, the radicand (expression inside the square root) must be non-negative ($\ge 0$):`,
      math: `${radicand} \\ge 0`,
    });

    // Solve radicand >= 0
    // Check if quadratic semi-circle: c - x^2 >= 0
    const semiCircleMatch = radicand.match(/^([0-9]+)\s*-\s*([a-zA-Z])(?:\^2|²)$/);
    const revSemiMatch = radicand.match(/^([a-zA-Z])(?:\^2|²)\s*-\s*([0-9]+)$/);

    if (semiCircleMatch) {
      const c = parseFloat(semiCircleMatch[1]);
      const r = Math.sqrt(c);
      const rFmt = Number.isInteger(r) ? `${r}` : `\\sqrt{${c}}`;
      domainInterval = `[-${rFmt}, ${rFmt}]`;
      domainSetBuilder = `{${varName} \\in \\mathbb{R} \\mid -${rFmt} \\le ${varName} \\le ${rFmt}}`;

      steps.push({
        stepNumber: 3,
        explanation: `Solve the quadratic inequality $${c} - ${varName}^2 \\ge 0 \\implies ${varName}^2 \\le ${c}$ by taking square roots on both sides:`,
        math: `-${rFmt} \\le ${varName} \\le ${rFmt}`,
      });

      rangeInterval = `[0, ${rFmt}]`;
      rangeSetBuilder = `{y \\in \\mathbb{R} \\mid 0 \\le y \\le ${rFmt}}`;
      steps.push({
        stepNumber: 4,
        explanation: `The square root outputs principal (non-negative) values $\ge 0$. The minimum occurs at the endpoints $${varName} = \\pm ${rFmt}$ giving $y = 0$, and the maximum occurs at $${varName} = 0$ giving $y = ${rFmt}$:`,
        math: `0 \\le y \\le ${rFmt} \\implies [0, ${rFmt}]`,
      });
    } else if (revSemiMatch) {
      const c = parseFloat(revSemiMatch[2]);
      const r = Math.sqrt(c);
      const rFmt = Number.isInteger(r) ? `${r}` : `\\sqrt{${c}}`;
      domainInterval = `(-\\infty, -${rFmt}] \\cup [${rFmt}, \\infty)`;
      domainSetBuilder = `{${varName} \\in \\mathbb{R} \\mid ${varName} \\le -${rFmt} \\text{ or } ${varName} \\ge ${rFmt}}`;

      steps.push({
        stepNumber: 3,
        explanation: `Solve the quadratic inequality $${varName}^2 - ${c} \\ge 0 \\implies ${varName}^2 \\ge ${c}$:`,
        math: `${varName} \\le -${rFmt} \\quad \\text{or} \\quad ${varName} \\ge ${rFmt}`,
      });

      rangeInterval = `[0, \\infty)`;
      rangeSetBuilder = `{y \\in \\mathbb{R} \\mid y \\ge 0}`;
      steps.push({
        stepNumber: 4,
        explanation: `Since the square root is non-negative and can grow arbitrarily large as $${varName} \\to \\pm\\infty$, the range is all non-negative real numbers:`,
        math: `y \\ge 0 \\implies [0, \\infty)`,
      });
    } else {
      // General linear radical or fallback
      try {
        const sol = nerdamer.solve(`${radicand} = 0`, varName).toString();
        let root = NaN;
        if (sol.startsWith('[') && sol.endsWith(']')) {
          const parsed = JSON.parse(sol);
          if (parsed.length > 0) {
            root = typeof parsed[0] === 'number' ? parsed[0] : parseFloat(nerdamer(parsed[0]).evaluate().text());
          }
        } else {
          root = parseFloat(nerdamer(sol).evaluate().text());
        }

        if (!isNaN(root)) {
          // Check sign by testing root + 1
          const testVal = root + 1;
          const isPosAbove = nerdamer(radicand, { [varName]: testVal }).evaluate().text();
          if (parseFloat(isPosAbove) >= 0) {
            domainInterval = `[${formatNum(root)}, \\infty)`;
            domainSetBuilder = `{${varName} \\in \\mathbb{R} \\mid ${varName} \\ge ${formatNum(root)}}`;
            steps.push({
              stepNumber: 3,
              explanation: `Set $${radicand} \\ge 0$ and isolate $${varName}$ to find the domain interval:`,
              math: `${varName} \\ge ${formatNum(root)} \\implies [${formatNum(root)}, \\infty)`,
            });
          } else {
            domainInterval = `(-\\infty, ${formatNum(root)}]`;
            domainSetBuilder = `{${varName} \\in \\mathbb{R} \\mid ${varName} \\le ${formatNum(root)}}`;
            steps.push({
              stepNumber: 3,
              explanation: `Set $${radicand} \\ge 0$ and isolate $${varName}$ to find the domain interval:`,
              math: `${varName} \\le ${formatNum(root)} \\implies (-\\infty, ${formatNum(root)}]`,
            });
          }
          rangeInterval = `[0, \\infty)`;
          rangeSetBuilder = `{y \\in \\mathbb{R} \\mid y \\ge 0}`;
          steps.push({
            stepNumber: 4,
            explanation: `The square root function produces only non-negative real outputs ($y \\ge 0$), with minimum $y = 0$ achieved at $${varName} = ${formatNum(root)}$:`,
            math: `y \\in [0, \\infty)`,
          });
        }
      } catch {
        domainInterval = `[0, \\infty)`;
        rangeInterval = `[0, \\infty)`;
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 2: Rational Functions (Fractions / Division by zero)
  // ──────────────────────────────────────────────────────────────────────────
  else if (hasDivision && !hasLog && !hasTrig) {
    let numerator = '1';
    let denominator = cleanInput;

    const divSplit = cleanInput.split('/');
    if (divSplit.length === 2) {
      numerator = divSplit[0].replace(/^\(|\)$/g, '').trim();
      denominator = divSplit[1].replace(/^\(|\)$/g, '').trim();
    }

    steps.push({
      stepNumber: 2,
      explanation: `For a rational expression, division by zero is undefined. Therefore, the denominator cannot equal zero:`,
      math: `${denominator} \\neq 0`,
    });

    // Find zeros of the denominator
    const excluded: number[] = [];
    try {
      const denomRoots = nerdamer.roots(denominator, varName).toString();
      const parsedRoots = JSON.parse(denomRoots.replace(/'/g, '"'));
      if (Array.isArray(parsedRoots)) {
        for (const r of parsedRoots) {
          if (typeof r === 'number' && !isNaN(r)) excluded.push(r);
          else if (typeof r === 'string' && !r.includes('i')) {
            const val = parseFloat(nerdamer(r).evaluate().text());
            if (!isNaN(val)) excluded.push(val);
          }
        }
      }
    } catch {
      // Fallback manual check for linear denominator ax + b
      const linDenMatch = denominator.match(/^([+-]?[0-9]*)\*?([a-zA-Z])\s*([+-]\s*[0-9]+)?$/);
      if (linDenMatch) {
        const aCoeff = linDenMatch[1] === '-' ? -1 : linDenMatch[1] ? parseFloat(linDenMatch[1]) : 1;
        const bConst = linDenMatch[3] ? parseFloat(linDenMatch[3].replace(/\s+/g, '')) : 0;
        excluded.push(-bConst / aCoeff);
      }
    }

    const { interval: dInt, setBuilder: dSet } = excludedPointsToInterval(excluded, varName);
    domainInterval = dInt;
    domainSetBuilder = dSet;

    steps.push({
      stepNumber: 3,
      explanation: `Find the values of $${varName}$ that make the denominator zero to determine the domain restrictions:`,
      math: excluded.length > 0
        ? `${varName} \\neq ${excluded.map(e => formatNum(e)).join(',\\; ')} \\implies ${domainInterval}`
        : `\\text{Denominator has no real zeros} \\implies (-\\infty, \\infty)`,
    });

    // Find Range of rational function via horizontal asymptote or inverse
    try {
      const pNumDeg = parseInt(nerdamer(`deg(${numerator})`).text());
      const pDenDeg = parseInt(nerdamer(`deg(${denominator})`).text());
      const degN = isNaN(pNumDeg) ? 0 : pNumDeg;
      const degD = isNaN(pDenDeg) ? 1 : pDenDeg;

      if (degN < degD) {
        // Horizontal asymptote at y = 0
        const numRoots = nerdamer.roots(numerator, varName).toString();
        const canBeZero = degN > 0 && numRoots !== '[]' && !numRoots.includes('i');
        if (!canBeZero) {
          rangeInterval = '(-\\infty, 0) \\cup (0, \\infty)';
          rangeSetBuilder = '{y \\in \\mathbb{R} \\mid y \\neq 0}';
          steps.push({
            stepNumber: 4,
            explanation: `Since the degree of the numerator (${degN}) is less than the degree of the denominator (${degD}), there is a horizontal asymptote at $y = 0$. Since the numerator has no real zeros, $y = 0$ is never attained:`,
            math: `y \\in (-\\infty, 0) \\cup (0, \\infty)`,
          });
        } else {
          rangeInterval = '(-\\infty, \\infty)';
          rangeSetBuilder = '{y \\in \\mathbb{R}}';
          steps.push({
            stepNumber: 4,
            explanation: `As $${varName} \\to \\pm\\infty$, $y \\to 0$. The function achieves all values on both sides of the vertical asymptotes:`,
            math: `y \\in (-\\infty, \\infty)`,
          });
        }
      } else if (degN === degD && degN === 1) {
        // Linear over linear: (ax + b) / (cx + d)
        let a = 1, c = 1;
        try {
          const arrN = JSON.parse((nerdamer as any).coeffs(numerator, varName).toString());
          const arrD = JSON.parse((nerdamer as any).coeffs(denominator, varName).toString());
          a = arrN[1] || 1;
          c = arrD[1] || 1;
        } catch {}
        const horizAsymp = a / c;
        const horizFmt = formatNum(horizAsymp);
        rangeInterval = `(-\\infty, ${horizFmt}) \\cup (${horizFmt}, \\infty)`;
        rangeSetBuilder = `{y \\in \\mathbb{R} \\mid y \\neq ${horizFmt}}`;
        steps.push({
          stepNumber: 4,
          explanation: `For linear rational functions $\\frac{ax+b}{cx+d}$, the horizontal asymptote is the ratio of leading coefficients $y = \\frac{a}{c} = ${horizFmt}$, which cannot be attained:`,
          math: `y \\neq ${horizFmt} \\implies (-\\infty, ${horizFmt}) \\cup (${horizFmt}, \\infty)`,
        });
      } else {
        rangeInterval = '(-\\infty, \\infty)';
        rangeSetBuilder = '{y \\in \\mathbb{R}}';
        steps.push({
          stepNumber: 4,
          explanation: `Analyze the range through end-behavior and limits at the asymptotes:`,
          math: `y \\in (-\\infty, \\infty)`,
        });
      }
    } catch {
      rangeInterval = '(-\\infty, 0) \\cup (0, \\infty)';
      rangeSetBuilder = '{y \\in \\mathbb{R} \\mid y \\neq 0}';
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 3: Logarithmic Functions
  // ──────────────────────────────────────────────────────────────────────────
  else if (hasLog) {
    const logMatch = cleanInput.match(/(?:ln|log)\(([^)]+)\)/);
    const argument = logMatch ? logMatch[1] : cleanInput;

    steps.push({
      stepNumber: 2,
      explanation: `The argument of a logarithm must be strictly positive ($> 0$) in the real numbers:`,
      math: `${argument} > 0`,
    });

    try {
      const rootStr = nerdamer.solve(`${argument} = 0`, varName).toString();
      let root = NaN;
      if (rootStr.startsWith('[') && rootStr.endsWith(']')) {
        const parsed = JSON.parse(rootStr);
        if (parsed.length > 0) {
          root = typeof parsed[0] === 'number' ? parsed[0] : parseFloat(nerdamer(parsed[0]).evaluate().text());
        }
      } else {
        root = parseFloat(nerdamer(rootStr).evaluate().text());
      }

      if (!isNaN(root)) {
        domainInterval = `(${formatNum(root)}, \\infty)`;
        domainSetBuilder = `{${varName} \\in \\mathbb{R} \\mid ${varName} > ${formatNum(root)}}`;
        steps.push({
          stepNumber: 3,
          explanation: `Solve the inequality $${argument} > 0$ for $${varName}$ to find the domain:`,
          math: `${varName} > ${formatNum(root)} \\implies (${formatNum(root)}, \\infty)`,
        });
      }
    } catch {
      domainInterval = `(0, \\infty)`;
      domainSetBuilder = `{${varName} \\in \\mathbb{R} \\mid ${varName} > 0}`;
    }

    rangeInterval = '(-\\infty, \\infty)';
    rangeSetBuilder = '{y \\in \\mathbb{R}}';
    steps.push({
      stepNumber: 4,
      explanation: `As the argument approaches $0^+$, $\\ln(u) \\to -\\infty$. As the argument approaches $\\infty$, $\\ln(u) \\to +\\infty$. Therefore, the range is all real numbers:`,
      math: `y \\in (-\\infty, \\infty)`,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 4: Trigonometric Functions
  // ──────────────────────────────────────────────────────────────────────────
  else if (hasTrig) {
    if (/tan/i.test(cleanInput)) {
      domainInterval = `x \\neq \\frac{\\pi}{2} + k\\pi, \\; k \\in \\mathbb{Z}`;
      domainSetBuilder = `{${varName} \\in \\mathbb{R} \\mid ${varName} \\neq \\frac{\\pi}{2} + k\\pi, \\; k \\in \\mathbb{Z}}`;
      rangeInterval = '(-\\infty, \\infty)';
      rangeSetBuilder = '{y \\in \\mathbb{R}}';
      steps.push({
        stepNumber: 2,
        explanation: `Since $\\tan(${varName}) = \\frac{\\sin(${varName})}{\\cos(${varName})}$, the tangent is undefined where $\\cos(${varName}) = 0$:`,
        math: `${varName} \\neq \\frac{\\pi}{2} + k\\pi, \\quad k \\in \\mathbb{Z}`,
      });
      steps.push({
        stepNumber: 3,
        explanation: `The tangent function spans from $-\\infty$ to $+\\infty$ within every period:`,
        math: `y \\in (-\\infty, \\infty)`,
      });
    } else {
      domainInterval = '(-\\infty, \\infty)';
      domainSetBuilder = `{${varName} \\in \\mathbb{R}}`;
      steps.push({
        stepNumber: 2,
        explanation: `Sine and cosine functions are defined for all real numbers with no singularities or restrictions:`,
        math: `${varName} \\in (-\\infty, \\infty)`,
      });

      // Numerically find the true amplitude / range over period [0, 2pi]
      let minVal = Infinity;
      let maxVal = -Infinity;
      try {
        const compiled = math.compile(normalized);
        for (let t = 0; t <= Math.PI * 2; t += 0.005) {
          const scope: Record<string, number> = { [varName]: t };
          const val = Number(compiled.evaluate(scope));
          if (Number.isFinite(val)) {
            if (val < minVal) minVal = val;
            if (val > maxVal) maxVal = val;
          }
        }
      } catch {
        minVal = -1;
        maxVal = 1;
      }

      const rMin = minVal !== Infinity ? Number(minVal.toFixed(3)) : -1;
      const rMax = maxVal !== -Infinity ? Number(maxVal.toFixed(3)) : 1;

      rangeInterval = `[${rMin}, ${rMax}]`;
      rangeSetBuilder = `{y \\in \\mathbb{R} \\mid ${rMin} \\le y \\le ${rMax}}`;
      steps.push({
        stepNumber: 3,
        explanation: `Evaluate the bounded extrema over the periodic interval to find the range:`,
        math: `${rMin} \\le y \\le ${rMax} \\implies [${rMin}, ${rMax}]`,
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 5: Polynomial Functions (Linear, Quadratic, Cubic, etc.)
  // ──────────────────────────────────────────────────────────────────────────
  else {
    domainInterval = '(-\\infty, \\infty)';
    domainSetBuilder = `{${varName} \\in \\mathbb{R}}`;
    steps.push({
      stepNumber: 2,
      explanation: `Polynomial functions have no denominators, square roots of negatives, or logarithms. Thus, their domain is all real numbers $\\mathbb{R}$:`,
      math: `${varName} \\in (-\\infty, \\infty)`,
    });

    let deg = 1;
    try {
      const pDeg = parseInt(nerdamer(`deg(${cleanInput})`).text());
      deg = isNaN(pDeg) ? 1 : pDeg;
    } catch {
      deg = cleanInput.includes('^2') || cleanInput.includes('²') ? 2 : 1;
    }

    if (deg === 0) {
      try {
        const val = parseFloat(nerdamer(cleanInput).evaluate().text());
        const cFmt = formatNum(val);
        rangeInterval = `[${cFmt}, ${cFmt}]`;
        rangeSetBuilder = `{y \\in \\mathbb{R} \\mid y = ${cFmt}}`;
        steps.push({
          stepNumber: 3,
          explanation: `Since the function is a constant, its output is always $${cFmt}$:`,
          math: `y = ${cFmt} \\implies \\{${cFmt}\\}`,
        });
      } catch {
        rangeInterval = '(-\\infty, \\infty)';
      }
    } else if (deg % 2 !== 0) {
      rangeInterval = '(-\\infty, \\infty)';
      rangeSetBuilder = '{y \\in \\mathbb{R}}';
      steps.push({
        stepNumber: 3,
        explanation: `Any polynomial of odd degree ($n = ${deg}$) has opposite end behavior as $${varName} \\to \\pm\\infty$, spanning all real numbers:`,
        math: `y \\in (-\\infty, \\infty)`,
      });
    } else if (deg === 2) {
      let a = 1, b = 0, c = 0;
      try {
        const coeffsRaw = (nerdamer as any).coeffs(cleanInput, varName).toString();
        const arr = JSON.parse(coeffsRaw);
        c = typeof arr[0] === 'number' ? arr[0] : (parseFloat(nerdamer(arr[0]).evaluate().text()) || 0);
        b = typeof arr[1] === 'number' ? arr[1] : (parseFloat(nerdamer(arr[1] || '0').evaluate().text()) || 0);
        a = typeof arr[2] === 'number' ? arr[2] : (parseFloat(nerdamer(arr[2] || '1').evaluate().text()) || 1);
      } catch {}

      const xv = -b / (2 * a);
      const yv = c - (b * b) / (4 * a);
      const yvFmt = formatNum(yv);
      const xvFmt = formatNum(xv);

      if (a > 0) {
        rangeInterval = `[${yvFmt}, \\infty)`;
        rangeSetBuilder = `{y \\in \\mathbb{R} \\mid y \\ge ${yvFmt}}`;
        steps.push({
          stepNumber: 3,
          explanation: `For a quadratic function opening upwards ($a = ${formatNum(a)} > 0$), the minimum value occurs at the parabola vertex $(${varName}_v, y_v)$:`,
          math: `${varName}_v = -\\frac{b}{2a} = ${xvFmt}, \\quad y_v = f(${xvFmt}) = ${yvFmt}`,
        });
        steps.push({
          stepNumber: 4,
          explanation: `Since the parabola opens upwards towards $+\\infty$, the range is all values greater than or equal to the vertex:`,
          math: `y \\ge ${yvFmt} \\implies [${yvFmt}, \\infty)`,
        });
      } else {
        rangeInterval = `(-\\infty, ${yvFmt}]`;
        rangeSetBuilder = `{y \\in \\mathbb{R} \\mid y \\le ${yvFmt}}`;
        steps.push({
          stepNumber: 3,
          explanation: `For a quadratic function opening downwards ($a = ${formatNum(a)} < 0$), the maximum value occurs at the parabola vertex $(${varName}_v, y_v)$:`,
          math: `${varName}_v = -\\frac{b}{2a} = ${xvFmt}, \\quad y_v = f(${xvFmt}) = ${yvFmt}`,
        });
        steps.push({
          stepNumber: 4,
          explanation: `Since the parabola opens downwards from the vertex to $-\\infty$, the range is:`,
          math: `y \\le ${yvFmt} \\implies (-\\infty, ${yvFmt}]`,
        });
      }
    } else {
      rangeInterval = '[0, \\infty)';
      rangeSetBuilder = '{y \\in \\mathbb{R} \\mid y \\ge 0}';
      steps.push({
        stepNumber: 3,
        explanation: `Even degree polynomials have a global minimum or maximum determined by their critical points.`,
        math: `y \\in [y_{\\min}, \\infty)`,
      });
    }
  }

  // Final summary step
  const finalAnswerLatex = `\\text{Domain: } ${domainInterval}, \\quad \\text{Range: } ${rangeInterval}`;
  steps.push({
    stepNumber: steps.length + 1,
    explanation: `Summary of Domain and Range in interval and set-builder notation:`,
    math: `\\begin{aligned} \\text{Domain: } & ${domainInterval} \\quad (${domainSetBuilder}) \\\\[6pt] \\text{Range: } & ${rangeInterval} \\quad (${rangeSetBuilder}) \\end{aligned}`,
  });

  return {
    type: 'domain_range',
    equationType: 'domain_range',
    finalAnswer: finalAnswerLatex,
    inputInterpretation: `${funcName}(${varName}) = ${funcLatex}`,
    steps,
    natureOfRoots: [
      `\\text{Domain: } ${domainInterval}`,
      `\\text{Range: } ${rangeInterval}`,
    ],
  };
}
