import {
  getLayoutDimensions,
  suggestLayout,
  renderSnapshotToSvg,
  generateCollageSvg,
} from '@/lib/math/collageRenderer';
import { SavedGraphSnapshot } from '@/types/graph';

describe('MathHub Multi-Graph Collage Renderer', () => {
  const sampleGraphs: SavedGraphSnapshot[] = [
    {
      id: 'test-x2',
      title: 'f(x) = x^2',
      type: 'equation',
      expressions: ['x^2'],
      bounds: { xMin: -5, xMax: 5, yMin: -2, yMax: 12 },
      createdAt: 1000,
    },
    {
      id: 'test-x4',
      title: 'f(x) = x^4',
      type: 'equation',
      expressions: ['x^4'],
      bounds: { xMin: -3, xMax: 3, yMin: -2, yMax: 16 },
      createdAt: 2000,
    },
    {
      id: 'test-x10',
      title: 'f(x) = x^10',
      type: 'equation',
      expressions: ['x^10'],
      bounds: { xMin: -2, xMax: 2, yMin: -2, yMax: 16 },
      createdAt: 3000,
    },
    {
      id: 'test-circle',
      title: 'Circle: x^2 + y^2 = 25',
      type: 'equation',
      expressions: ['x^2 + y^2 = 25'],
      bounds: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
      createdAt: 4000,
    },
  ];

  it('correctly computes layout dimensions', () => {
    expect(getLayoutDimensions('1x2')).toEqual({ cols: 2, rows: 1 });
    expect(getLayoutDimensions('2x1')).toEqual({ cols: 1, rows: 2 });
    expect(getLayoutDimensions('2x2')).toEqual({ cols: 2, rows: 2 });
    expect(getLayoutDimensions('2x3')).toEqual({ cols: 3, rows: 2 });
    expect(getLayoutDimensions('3x2')).toEqual({ cols: 2, rows: 3 });
    expect(getLayoutDimensions('3x3')).toEqual({ cols: 3, rows: 3 });
  });

  it('auto-suggests optimal layout based on item count', () => {
    expect(suggestLayout(1)).toBe('1x2');
    expect(suggestLayout(2)).toBe('1x2');
    expect(suggestLayout(3)).toBe('2x2');
    expect(suggestLayout(4)).toBe('2x2');
    expect(suggestLayout(5)).toBe('2x3');
    expect(suggestLayout(6)).toBe('2x3');
    expect(suggestLayout(7)).toBe('3x3');
  });

  it('renders a single snapshot to origin-centric SVG', () => {
    const svg = renderSnapshotToSvg(sampleGraphs[0], 400, 300, {
      showTitle: true,
      showRanges: true,
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('f(x) = x^2');
    expect(svg).toContain('x: [-5, 5]');
    expect(svg).toContain('<path'); // curve path
    expect(svg).toContain('>x</text>'); // x-axis label
    expect(svg).toContain('>y</text>'); // y-axis label
  });

  it('generates a full multi-graph collage SVG with cut lines', () => {
    const items = sampleGraphs.slice(0, 3).map((g) => ({ snapshot: g }));
    const collage = generateCollageSvg(items, '2x2', {
      sheetTitle: 'Polynomial Powers Study Sheet',
      showCutLines: true,
    });

    expect(collage).toContain('Polynomial Powers Study Sheet');
    expect(collage).toContain('f(x) = x^2');
    expect(collage).toContain('f(x) = x^4');
    expect(collage).toContain('f(x) = x^10');
    expect(collage).toContain('✂'); // scissor cut-line icon
  });
});
