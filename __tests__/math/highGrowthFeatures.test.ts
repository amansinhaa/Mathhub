import { describe, it, expect } from '@jest/globals';
import { latexToAscii, extractPlotFunction } from '../../src/utils/mathSanitizer';
import { isPiecewiseExpression, parsePiecewiseBranches } from '../../src/lib/math/graphData';
import { analyzeFunction } from '../../src/lib/math/functionAnalysis';

describe('Math Sanitizer & Bridge Utilities', () => {
  it('converts LaTeX fraction and square roots to evaluatable ASCII', () => {
    const raw = '\\frac{-b + \\sqrt{b^2 - 4ac}}{2a}';
    const clean = latexToAscii(raw);
    expect(clean).toContain('sqrt');
    expect(clean).not.toContain('\\frac');
  });

  it('extracts plotting function and separates roots', () => {
    const res = extractPlotFunction('72t^3 + 4t - 76 = 0', [1]);
    expect(res.fn).toContain('72*x^3');
    expect(res.roots).toEqual([1]);
  });

  it('safely preserves trigonometric function names without mangling', () => {
    const resSin = extractPlotFunction('sin(t) = 0');
    expect(resSin.fn).toBe('sin(x)');
    expect(resSin.fn).not.toContain('xin');

    const resCos = extractPlotFunction('cos(t) - 1 = 0');
    expect(resCos.fn).toBe('cos(x) - 1');
    expect(resCos.fn).not.toContain('xos');

    const resExp = extractPlotFunction('exp(u) - 5 = 0');
    expect(resExp.fn).toBe('exp(x) - 5');
  });
});

describe('Piecewise Parser', () => {
  it('identifies and parses piecewise notation', () => {
    const expr = '{x < 0: -x, x >= 0: x^2}';
    expect(isPiecewiseExpression(expr)).toBe(true);

    const branches = parsePiecewiseBranches(expr);
    expect(branches.length).toBe(2);
    expect(branches[0].testCondition(-2)).toBe(true);
    expect(branches[0].testCondition(2)).toBe(false);
    expect(branches[1].testCondition(3)).toBe(true);
  });
});

describe('Function Analysis Engine', () => {
  it('analyzes standard rational function domain and asymptotes', () => {
    const analysis = analyzeFunction('1/(x-2)');
    expect(analysis).not.toBeNull();
    expect(analysis?.domain).toContain('2');
    expect(analysis?.asymptotes.vertical).toContain('x = 2');
    expect(analysis?.asymptotes.horizontal).toContain('y = 0');
  });
});
