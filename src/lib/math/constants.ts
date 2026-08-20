export interface MathConstant {
  name: string;
  value: number;
  symbol: string;
  latex: string;
}

export const MATH_CONSTANTS: Record<string, MathConstant> = {
  PI: { name: 'Pi', value: Math.PI, symbol: 'π', latex: '\\pi' },
  EULER: { name: "Euler's number", value: Math.E, symbol: 'e', latex: 'e' },
  GOLDEN_RATIO: { name: 'Golden ratio', value: (1 + Math.sqrt(5)) / 2, symbol: 'φ', latex: '\\phi' },
  SQRT2: { name: 'Square root of 2', value: Math.SQRT2, symbol: '√2', latex: '\\sqrt{2}' },
  SQRT3: { name: 'Square root of 3', value: Math.sqrt(3), symbol: '√3', latex: '\\sqrt{3}' },
  LN2: { name: 'Natural log of 2', value: Math.LN2, symbol: 'ln(2)', latex: '\\ln(2)' },
  LN10: { name: 'Natural log of 10', value: Math.LN10, symbol: 'ln(10)', latex: '\\ln(10)' }
};

export function getConstant(key: string): MathConstant | undefined {
  return MATH_CONSTANTS[key.toUpperCase()];
}
