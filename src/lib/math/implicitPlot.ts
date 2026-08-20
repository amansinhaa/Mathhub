import { create, all } from 'mathjs';
import { normalizeExpression } from './normalizer';

const math = create(all);

export interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Path2DData {
  segments: LineSegment[];
  svgPath: string;
}

/**
 * Linear interpolation to find the zero-crossing between two scalar values.
 */
function interpolate(
  x1: number,
  y1: number,
  v1: number,
  x2: number,
  y2: number,
  v2: number
): [number, number] {
  if (Math.abs(v2 - v1) < 1e-12) {
    return [(x1 + x2) / 2, (y1 + y2) / 2];
  }
  const t = Math.max(0, Math.min(1, -v1 / (v2 - v1)));
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

/**
 * Check whether an expression is an implicit relation (contains 'y' or an '=' with y).
 */
export function isImplicitEquation(expr: string): boolean {
  const clean = expr.trim();
  if (!clean) return false;
  // If it starts with y = f(x) where RHS has no y, it's an explicit function
  if (/^y\s*=/.test(clean)) {
    const rhs = clean.replace(/^y\s*=\s*/, '');
    const tokens = rhs.match(/[a-zA-Z]+/g) || [];
    return tokens.includes('y');
  }
  // If there's a y anywhere in the expression
  const tokens = clean.match(/[a-zA-Z]+/g) || [];
  return tokens.includes('y');
}

/**
 * Parse an equation into F(x, y) = 0 form.
 * If expression has '=', moves RHS to LHS: (LHS) - (RHS).
 * If no '=' but contains 'y', evaluates as F(x, y) = 0.
 */
export function parseImplicitExpression(expr: string): string {
  let clean = expr.trim();
  if (!clean) return '0';

  clean = normalizeExpression(clean);

  if (clean.includes('=')) {
    const [lhs, rhs] = clean.split('=');
    return `(${lhs.trim() || '0'}) - (${rhs.trim() || '0'})`;
  }
  return clean;
}

/**
 * Marching Squares 2D contour algorithm to plot F(x, y) = 0.
 */
export function generateImplicitContour(
  rawExpr: string,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  gridResolution: number = 100
): LineSegment[] {
  const expr = parseImplicitExpression(rawExpr);
  let compiled: any = null;

  try {
    compiled = math.compile(expr);
  } catch {
    return [];
  }

  const nx = gridResolution;
  const ny = gridResolution;
  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;

  // 1. Evaluate scalar field F(x, y) over the 2D grid
  const grid: number[][] = [];
  for (let j = 0; j <= ny; j++) {
    const y = yMin + j * dy;
    const row: number[] = [];
    for (let i = 0; i <= nx; i++) {
      const x = xMin + i * dx;
      try {
        const val = compiled.evaluate({ x, y });
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
          row.push(val);
        } else {
          row.push(NaN);
        }
      } catch {
        row.push(NaN);
      }
    }
    grid.push(row);
  }

  const segments: LineSegment[] = [];

  // 2. March across each cell in the grid
  for (let j = 0; j < ny; j++) {
    const y0 = yMin + j * dy;
    const y1 = y0 + dy;

    for (let i = 0; i < nx; i++) {
      const x0 = xMin + i * dx;
      const x1 = x0 + dx;

      // 4 cell corners:
      // v0: bottom-left (i, j)
      // v1: bottom-right (i+1, j)
      // v2: top-right (i+1, j+1)
      // v3: top-left (i, j+1)
      const v0 = grid[j][i];
      const v1 = grid[j][i + 1];
      const v2 = grid[j + 1][i + 1];
      const v3 = grid[j + 1][i];

      // Skip cell if any vertex is NaN
      if (isNaN(v0) || isNaN(v1) || isNaN(v2) || isNaN(v3)) continue;

      // 4-bit state
      let cellCase = 0;
      if (v0 > 0) cellCase |= 1;
      if (v1 > 0) cellCase |= 2;
      if (v2 > 0) cellCase |= 4;
      if (v3 > 0) cellCase |= 8;

      if (cellCase === 0 || cellCase === 15) continue;

      // Calculate intersection points on the 4 cell edges
      // e0: bottom edge (x0, y0) to (x1, y0)
      // e1: right edge  (x1, y0) to (x1, y1)
      // e2: top edge    (x0, y1) to (x1, y1)
      // e3: left edge   (x0, y0) to (x0, y1)
      const e0 = (): [number, number] => interpolate(x0, y0, v0, x1, y0, v1);
      const e1 = (): [number, number] => interpolate(x1, y0, v1, x1, y1, v2);
      const e2 = (): [number, number] => interpolate(x0, y1, v3, x1, y1, v2);
      const e3 = (): [number, number] => interpolate(x0, y0, v0, x0, y1, v3);

      switch (cellCase) {
        case 1:
        case 14: {
          const [ax, ay] = e3();
          const [bx, by] = e0();
          segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
          break;
        }
        case 2:
        case 13: {
          const [ax, ay] = e0();
          const [bx, by] = e1();
          segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
          break;
        }
        case 3:
        case 12: {
          const [ax, ay] = e3();
          const [bx, by] = e1();
          segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
          break;
        }
        case 4:
        case 11: {
          const [ax, ay] = e1();
          const [bx, by] = e2();
          segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
          break;
        }
        case 5: {
          // Ambiguous saddle case
          const [a1x, a1y] = e3();
          const [b1x, b1y] = e2();
          const [a2x, a2y] = e0();
          const [b2x, b2y] = e1();
          segments.push({ x1: a1x, y1: a1y, x2: b1x, y2: b1y });
          segments.push({ x1: a2x, y1: a2y, x2: b2x, y2: b2y });
          break;
        }
        case 10: {
          // Ambiguous saddle case
          const [a1x, a1y] = e3();
          const [b1x, b1y] = e0();
          const [a2x, a2y] = e2();
          const [b2x, b2y] = e1();
          segments.push({ x1: a1x, y1: a1y, x2: b1x, y2: b1y });
          segments.push({ x1: a2x, y1: a2y, x2: b2x, y2: b2y });
          break;
        }
        case 6:
        case 9: {
          const [ax, ay] = e0();
          const [bx, by] = e2();
          segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
          break;
        }
        case 7:
        case 8: {
          const [ax, ay] = e3();
          const [bx, by] = e2();
          segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
          break;
        }
      }
    }
  }

  return segments;
}

/**
 * Convert coordinate-space line segments into an SVG path string for a given SVG pixel bounding box.
 */
export function segmentsToSvgPath(
  segments: LineSegment[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
  margin = { top: 20, right: 35, left: 65, bottom: 20 }
): string {
  if (segments.length === 0) return '';

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const toPxX = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const toPxY = (y: number) => margin.top + ((yMax - y) / (yMax - yMin)) * plotHeight;

  const pathParts: string[] = [];
  for (const seg of segments) {
    const px1 = toPxX(seg.x1);
    const py1 = toPxY(seg.y1);
    const px2 = toPxX(seg.x2);
    const py2 = toPxY(seg.y2);
    pathParts.push(`M ${px1.toFixed(1)} ${py1.toFixed(1)} L ${px2.toFixed(1)} ${py2.toFixed(1)}`);
  }

  return pathParts.join(' ');
}
