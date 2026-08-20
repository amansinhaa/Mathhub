import { FormulaEntry } from '@/types/formula';

export const geometry: FormulaEntry[] = [
  { id: 'geom-1', name: 'Distance Formula (2D)', latex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}', description: 'Distance between two points (x1, y1) and (x2, y2)', category: 'geometry', tags: ['coordinate', 'distance'] },
  { id: 'geom-2', name: 'Midpoint Formula', latex: 'M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)', description: 'Midpoint of a line segment', category: 'geometry', tags: ['coordinate', 'midpoint'] },
  { id: 'geom-3', name: 'Slope of a Line', latex: 'm = \\frac{y_2-y_1}{x_2-x_1} = \\tan\\theta', description: 'Slope of line passing through two points', category: 'geometry', tags: ['coordinate', 'line', 'slope'] },
  { id: 'geom-4', name: 'Slope-Intercept Form', latex: 'y = mx + c', description: 'Equation of a straight line with slope m and y-intercept c', category: 'geometry', tags: ['coordinate', 'line'] },
  { id: 'geom-5', name: 'Point-Slope Form', latex: 'y - y_1 = m(x - x_1)', description: 'Equation of line passing through (x1, y1) with slope m', category: 'geometry', tags: ['coordinate', 'line'] },
  { id: 'geom-6', name: 'Standard Circle Equation', latex: '(x-h)^2 + (y-k)^2 = r^2', description: 'Circle with center (h, k) and radius r', category: 'geometry', tags: ['conic', 'circle'] },
  { id: 'geom-7', name: 'General Parabola Equation', latex: 'y = a(x-h)^2 + k \\quad \\text{or} \\quad (y-k)^2 = 4a(x-h)', description: 'Parabola in vertex form', category: 'geometry', tags: ['conic', 'parabola'] },
  { id: 'geom-8', name: 'Standard Ellipse Equation', latex: '\\frac{(x-h)^2}{a^2} + \\frac{(y-k)^2}{b^2} = 1', description: 'Ellipse centered at (h, k) with semi-major/minor axes a, b', category: 'geometry', tags: ['conic', 'ellipse'] },
  { id: 'geom-9', name: 'Standard Hyperbola Equation', latex: '\\frac{(x-h)^2}{a^2} - \\frac{(y-k)^2}{b^2} = 1', description: 'Horizontal hyperbola centered at (h, k)', category: 'geometry', tags: ['conic', 'hyperbola'] },
  { id: 'geom-10', name: 'Section Formula (Internal)', latex: 'P = \\left(\\frac{m x_2 + n x_1}{m+n}, \\frac{m y_2 + n y_1}{m+n}\\right)', description: 'Coordinates of point dividing line segment in ratio m:n', category: 'geometry', tags: ['coordinate', 'section'] },
  { id: 'geom-11', name: 'Perpendicular Distance from Point to Line', latex: 'd = \\frac{|Ax_1 + By_1 + C|}{\\sqrt{A^2 + B^2}}', description: 'Distance from point (x1, y1) to line Ax + By + C = 0', category: 'geometry', tags: ['coordinate', 'distance', 'line'] },
];
