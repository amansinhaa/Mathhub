import {
  findVerticalAsymptotes,
  generatePlotData,
  pointsToSvgPath,
} from '@/lib/math/graphData';

describe('Vertical Asymptote & Discontinuity Detection Engine', () => {
  const plotBox = { left: 50, top: 40, width: 700, height: 420 };

  describe('findVerticalAsymptotes', () => {
    it('detects rational function asymptotes for (x+1)/(x^2 - 4) at x = -2 and x = 2', () => {
      const asyms = findVerticalAsymptotes('(x+1)/((x^2)-4)', -6, 6);
      expect(asyms.length).toBe(2);
      expect(asyms[0]).toBeCloseTo(-2, 1);
      expect(asyms[1]).toBeCloseTo(2, 1);
    });

    it('detects single vertical asymptote for 1/x at x = 0', () => {
      const asyms = findVerticalAsymptotes('1/x', -5, 5);
      expect(asyms.length).toBe(1);
      expect(asyms[0]).toBeCloseTo(0, 1);
    });

    it('detects same-sign vertical asymptote for 1/(x^2) at x = 0', () => {
      const asyms = findVerticalAsymptotes('1/(x^2)', -5, 5);
      expect(asyms.length).toBe(1);
      expect(asyms[0]).toBeCloseTo(0, 1);
    });

    it('detects trigonometric vertical asymptotes for tan(x) on [-pi, pi]', () => {
      const asyms = findVerticalAsymptotes('tan(x)', -3.14, 3.14);
      expect(asyms.length).toBe(2);
      expect(asyms[0]).toBeCloseTo(-Math.PI / 2, 1);
      expect(asyms[1]).toBeCloseTo(Math.PI / 2, 1);
    });

    it('returns empty array for continuous polynomial and exponential functions', () => {
      expect(findVerticalAsymptotes('x^2 + 2x + 1', -10, 10)).toEqual([]);
      expect(findVerticalAsymptotes('sin(x)', -10, 10)).toEqual([]);
      expect(findVerticalAsymptotes('exp(x)', -5, 5)).toEqual([]);
    });
  });

  describe('pointsToSvgPath Discontinuity Splitting', () => {
    it('splits (x+1)/(x^2 - 4) into 3 independent branches with no false connector lines', () => {
      const expr = '(x+1)/((x^2)-4)';
      const xMin = -6;
      const xMax = 6;
      const yMin = -6;
      const yMax = 6;

      const data = generatePlotData(expr, xMin, xMax, 500);
      const asyms = findVerticalAsymptotes(expr, xMin, xMax);
      const pathD = pointsToSvgPath(data, xMin, xMax, yMin, yMax, plotBox, 'linear', asyms);

      // Count 'M' (MoveTo) commands to verify the path is split into at least 3 distinct branches
      const moveCount = (pathD.match(/M /g) || []).length;
      expect(moveCount).toBeGreaterThanOrEqual(3);

      // Verify that data has null gaps at x = -2 and x = 2
      const hasNullNearMinus2 = data.some(
        (p) => Math.abs(p.x - -2) < 0.05 && p.y === null
      );
      const hasNullNearPlus2 = data.some(
        (p) => Math.abs(p.x - 2) < 0.05 && p.y === null
      );
      expect(hasNullNearMinus2).toBe(true);
      expect(hasNullNearPlus2).toBe(true);
    });

    it('splits 1/(x^2) into 2 branches across x = 0 (same sign asymptote)', () => {
      const expr = '1/(x^2)';
      const xMin = -4;
      const xMax = 4;
      const yMin = -2;
      const yMax = 12;

      const data = generatePlotData(expr, xMin, xMax, 400);
      const asyms = findVerticalAsymptotes(expr, xMin, xMax);
      const pathD = pointsToSvgPath(data, xMin, xMax, yMin, yMax, plotBox, 'linear', asyms);

      const moveCount = (pathD.match(/M /g) || []).length;
      expect(moveCount).toBeGreaterThanOrEqual(2);
    });

    it('remains robust when zooming in near asymptote x = -2', () => {
      const expr = '(x+1)/((x^2)-4)';
      // Zoomed in tightly to [-2.5, -1.5]
      const xMin = -2.5;
      const xMax = -1.5;
      const yMin = -20;
      const yMax = 20;

      const data = generatePlotData(expr, xMin, xMax, 400);
      const asyms = findVerticalAsymptotes(expr, xMin, xMax);
      const pathD = pointsToSvgPath(data, xMin, xMax, yMin, yMax, plotBox, 'linear', asyms);

      const moveCount = (pathD.match(/M /g) || []).length;
      expect(moveCount).toBeGreaterThanOrEqual(2);
    });

    it('remains robust when zoomed out to large domain [-20, 20]', () => {
      const expr = '(x+1)/((x^2)-4)';
      const xMin = -20;
      const xMax = 20;
      const yMin = -10;
      const yMax = 10;

      const data = generatePlotData(expr, xMin, xMax, 500);
      const asyms = findVerticalAsymptotes(expr, xMin, xMax);
      const pathD = pointsToSvgPath(data, xMin, xMax, yMin, yMax, plotBox, 'linear', asyms);

      const moveCount = (pathD.match(/M /g) || []).length;
      expect(moveCount).toBeGreaterThanOrEqual(3);
    });

    it('remains robust under extreme wide zoom-out [-344, 384] and Y in [-644, 84]', () => {
      const expr = '(x+1)/((x^2)-4)';
      const xMin = -344;
      const xMax = 384;
      const yMin = -644;
      const yMax = 84;

      const data = generatePlotData(expr, xMin, xMax, 650);
      const asyms = findVerticalAsymptotes(expr, xMin, xMax);
      const pathD = pointsToSvgPath(data, xMin, xMax, yMin, yMax, plotBox, 'linear', asyms);

      // Verify path is split across both asymptotes (-2 and 2)
      const moveCount = (pathD.match(/M /g) || []).length;
      expect(moveCount).toBeGreaterThanOrEqual(3);
    });
  });
});
