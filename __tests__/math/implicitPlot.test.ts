import {
  generateImplicitContour,
  isImplicitEquation,
  segmentsToSvgPath,
} from '@/lib/math/implicitPlot';

describe('MathHub Implicit Equation Plotter', () => {
  it('identifies implicit equations with y', () => {
    expect(isImplicitEquation('x^2 + y^2 = 25')).toBe(true);
    expect(isImplicitEquation('x^2 + y^2')).toBe(true);
    expect(isImplicitEquation('y^2 = x^3 - x')).toBe(true);
    expect(isImplicitEquation('sin(x) + cos(y) = 0.5')).toBe(true);
    expect(isImplicitEquation('x^2 - 4')).toBe(false);
    expect(isImplicitEquation('sin(x)')).toBe(false);
  });

  it('generates contour line segments for circle x^2 + y^2 = 25', () => {
    const segments = generateImplicitContour('x^2 + y^2 = 25', -8, 8, -8, 8, 80);
    expect(segments.length).toBeGreaterThan(20);

    // Verify radii of segments are approximately 5
    const avgRadius =
      segments.reduce((sum, s) => sum + Math.hypot(s.x1, s.y1), 0) / segments.length;
    expect(avgRadius).toBeCloseTo(5, 1);
  });

  it('generates contour line segments for ellipse x^2/16 + y^2/9 = 1', () => {
    const segments = generateImplicitContour('x^2/16 + y^2/9 = 1', -8, 8, -8, 8, 80);
    expect(segments.length).toBeGreaterThan(20);
  });

  it('converts line segments to valid SVG path string', () => {
    const segments = generateImplicitContour('x^2 + y^2 = 25', -8, 8, -8, 8, 40);
    const svgPath = segmentsToSvgPath(segments, -8, 8, -8, 8, 800, 450);
    expect(svgPath).toContain('M ');
    expect(svgPath).toContain('L ');
  });
});
