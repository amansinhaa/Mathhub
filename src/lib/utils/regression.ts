import type { RegressionResult } from '@/types/graph';

export function linearRegression(points: { x: number; y: number }[]): RegressionResult {
  const n = points.length;
  if (n < 2) {
    return {
      type: 'linear',
      equation: 'y = x',
      latex: 'y = x',
      r2: 0,
      rSquared: 0,
      coefficients: [1, 0],
      predict: (x: number) => x,
    };
  }

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denom = n * sumXX - sumX * sumX;
  const m = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const b = (sumY - m * sumX) / n;

  // Calculate R^2
  const yMean = sumY / n;
  let ssTot = 0,
    ssRes = 0;
  for (const p of points) {
    const yPred = m * p.x + b;
    ssTot += (p.y - yMean) ** 2;
    ssRes += (p.y - yPred) ** 2;
  }
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 1;

  const sign = b >= 0 ? '+' : '-';
  const absB = Math.abs(b).toFixed(4);

  return {
    type: 'linear',
    equation: `y = ${m.toFixed(4)}x ${sign} ${absB}`,
    latex: `y = ${m.toFixed(4)}x ${sign} ${absB}`,
    r2,
    rSquared: r2,
    coefficients: [m, b],
    predict: (x: number) => m * x + b,
  };
}

export function polynomialRegression(
  points: { x: number; y: number }[],
  degree: number = 2
): RegressionResult {
  if (degree === 1 || points.length < 3) return linearRegression(points);

  // Fit quadratic y = ax^2 + bx + c using least squares normal equations
  const n = points.length;
  let s0 = n,
    s1 = 0,
    s2 = 0,
    s3 = 0,
    s4 = 0;
  let t0 = 0,
    t1 = 0,
    t2 = 0;

  for (const p of points) {
    const x = p.x;
    const y = p.y;
    const x2 = x * x;
    s1 += x;
    s2 += x2;
    s3 += x2 * x;
    s4 += x2 * x2;

    t0 += y;
    t1 += x * y;
    t2 += x2 * y;
  }

  // Cramer's rule determinant:
  const det3 = (
    m00: number, m01: number, m02: number,
    m10: number, m11: number, m12: number,
    m20: number, m21: number, m22: number
  ) =>
    m00 * (m11 * m22 - m12 * m21) -
    m01 * (m10 * m22 - m12 * m20) +
    m02 * (m10 * m21 - m11 * m20);

  const D = det3(s4, s3, s2, s3, s2, s1, s2, s1, s0);
  if (Math.abs(D) < 1e-12) return linearRegression(points);

  const Da = det3(t2, s3, s2, t1, s2, s1, t0, s1, s0);
  const Db = det3(s4, t2, s2, s3, t1, s1, s2, t0, s0);
  const Dc = det3(s4, s3, t2, s3, s2, t1, s2, s1, t0);

  const a = Da / D;
  const b = Db / D;
  const c = Dc / D;

  const yMean = t0 / n;
  let ssTot = 0,
    ssRes = 0;
  for (const p of points) {
    const yPred = a * p.x * p.x + b * p.x + c;
    ssTot += (p.y - yMean) ** 2;
    ssRes += (p.y - yPred) ** 2;
  }
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 1;

  return {
    type: 'polynomial',
    equation: `y = ${a.toFixed(4)}x^2 + ${b.toFixed(4)}x + ${c.toFixed(4)}`,
    latex: `y = ${a.toFixed(4)}x^2 + ${b.toFixed(4)}x + ${c.toFixed(4)}`,
    r2,
    rSquared: r2,
    coefficients: [a, b, c],
    predict: (x: number) => a * x * x + b * x + c,
  };
}

export function exponentialRegression(points: { x: number; y: number }[]): RegressionResult {
  const validPoints = points.filter((p) => p.y > 0);
  const n = validPoints.length;
  if (n < 2) return linearRegression(points);

  let sumX = 0,
    sumLogY = 0,
    sumXLogY = 0,
    sumXX = 0,
    sumY = 0;

  for (const p of validPoints) {
    const logY = Math.log(p.y);
    sumX += p.x;
    sumLogY += logY;
    sumXLogY += p.x * logY;
    sumXX += p.x * p.x;
    sumY += p.y;
  }

  const denom = n * sumXX - sumX * sumX;
  const b = denom !== 0 ? (n * sumXLogY - sumX * sumLogY) / denom : 0;
  const logA = (sumLogY - b * sumX) / n;
  const a = Math.exp(logA);

  const yMean = sumY / n;
  let ssTot = 0,
    ssRes = 0;
  for (const p of validPoints) {
    const yPred = a * Math.exp(b * p.x);
    ssTot += (p.y - yMean) ** 2;
    ssRes += (p.y - yPred) ** 2;
  }
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 1;

  return {
    type: 'exponential',
    equation: `y = ${a.toFixed(4)} * e^(${b.toFixed(4)}x)`,
    latex: `y = ${a.toFixed(4)} e^{${b.toFixed(4)}x}`,
    r2,
    rSquared: r2,
    coefficients: [a, b],
    predict: (x: number) => a * Math.exp(b * x),
  };
}
