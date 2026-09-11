import { generatePrintableHtml } from '../../src/lib/export/FormulaPdfExport';
import { FormulaEntry } from '../../src/types/formula';

describe('generatePrintableHtml', () => {
  const sampleFormulas: FormulaEntry[] = [
    {
      id: 'log-1',
      name: 'Change of Base Formula',
      category: 'logarithms',
      level: 'class12',
      levels: ['class12', 'higher_ed'],
      latex: '\\log_b(x) = \\frac{\\log_k(x)}{\\log_k(b)} = \\frac{\\ln x}{\\ln b}',
      description: 'Converting logarithm to a different base k',
      tags: ['logarithms', 'change-of-base'],
    },
    {
      id: 'calc-1',
      name: 'Power Rule',
      category: 'calculus',
      level: 'class12',
      levels: ['class12', 'higher_ed'],
      latex: '\\frac{d}{dx}[x^n] = n x^{n-1}',
      description: 'Derivative of power functions',
      tags: ['derivative', 'power-rule'],
    }
  ];

  it('renders authentic KaTeX HTML instead of raw LaTeX or ASCII syntax', () => {
    const html = generatePrintableHtml(sampleFormulas, 'University / Higher Ed Reference Sheet');

    // Should include KaTeX CSS link
    expect(html).toContain('katex.min.css');

    // Should include KaTeX rendered classes
    expect(html).toContain('katex');
    expect(html).toContain('katex-display');

    // Should render real KaTeX HTML with fraction lines and display containers
    expect(html).toContain('katex-html');
    expect(html).toContain('frac-line');
    expect(html).not.toContain('courier');

    // Should contain formula names and badges
    expect(html).toContain('Change of Base Formula');
    expect(html).toContain('Power Rule');
    expect(html).toContain('Class 12');
    expect(html).toContain('logarithms');
    expect(html).toContain('calculus');

    // Should contain document header and branding
    expect(html).toContain('EASYEQUATE');
    expect(html).toContain('UNIVERSITY / HIGHER ED REFERENCE SHEET');
    expect(html).toContain('2 Formulas');
  });

  it('handles empty formula lists gracefully', () => {
    const html = generatePrintableHtml([], 'Empty Sheet');
    expect(html).toContain('0 Formulas');
    expect(html).toContain('EMPTY SHEET');
  });
});
