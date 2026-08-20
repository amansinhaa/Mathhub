import { FormulaEntry } from '@/types/formula';

export const complex: FormulaEntry[] = [
  { id: 'comp-1', name: "Euler's Formula", latex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta', description: 'Links complex exponential with trig functions', category: 'complex', tags: ['euler', 'polar'] },
  { id: 'comp-2', name: "De Moivre's Theorem", latex: '(r(\\cos\\theta + i\\sin\\theta))^n = r^n(\\cos(n\\theta) + i\\sin(n\\theta))', description: 'Power of a complex number in polar form', category: 'complex', tags: ['power', 'polar'] },
  { id: 'comp-3', name: 'Modulus of Complex Number', latex: '|z| = \\sqrt{a^2 + b^2}', description: 'Absolute value of z = a + bi', category: 'complex', tags: ['magnitude', 'modulus'] },
  { id: 'comp-4', name: 'Complex Conjugate', latex: '\\bar{z} = a - bi', description: 'Conjugate of z = a + bi', category: 'complex', tags: ['conjugate'] },
  { id: 'comp-5', name: 'Polar Form', latex: 'z = r(\\cos\\theta + i\\sin\\theta)', description: 'Polar representation of a complex number', category: 'complex', tags: ['polar', 'argument'] },
  { id: 'comp-6', name: 'Argument of Complex Number', latex: '\\arg(z) = \\tan^{-1}\\left(\\frac{b}{a}\\right)', description: 'Angle of z = a + bi in the complex plane', category: 'complex', tags: ['argument', 'angle'] },
  { id: 'comp-7', name: 'Complex Multiplication', latex: '(a+bi)(c+di) = (ac-bd) + (ad+bc)i', description: 'Product of two complex numbers', category: 'complex', tags: ['multiplication', 'arithmetic'] },
  { id: 'comp-8', name: 'Complex Division', latex: '\\frac{a+bi}{c+di} = \\frac{(ac+bd)+(bc-ad)i}{c^2+d^2}', description: 'Quotient of two complex numbers', category: 'complex', tags: ['division', 'arithmetic'] },
  { id: 'comp-9', name: 'Roots of Unity', latex: 'z_k = e^{i \\cdot 2\\pi k/n}, \\quad k=0,1,\\ldots,n-1', description: 'The n-th roots of unity', category: 'complex', tags: ['roots', 'unity'] },
  { id: 'comp-10', name: 'Exponential Form', latex: 'z = re^{i\\theta}', description: 'Exponential representation using Euler formula', category: 'complex', tags: ['exponential', 'polar'] },
];

export const mensuration: FormulaEntry[] = [
  { id: 'men-1', name: 'Circle Area', latex: 'A = \\pi r^2', description: 'Area of a circle with radius r', category: 'mensuration', tags: ['2d', 'area', 'circle'] },
  { id: 'men-2', name: 'Circle Circumference', latex: 'C = 2\\pi r', description: 'Perimeter of a circle', category: 'mensuration', tags: ['2d', 'perimeter', 'circle'] },
  { id: 'men-3', name: 'Triangle Area', latex: 'A = \\frac{1}{2}bh', description: 'Area of a triangle with base b and height h', category: 'mensuration', tags: ['2d', 'area', 'triangle'] },
  { id: 'men-4', name: "Heron's Formula", latex: 'A = \\sqrt{s(s-a)(s-b)(s-c)}', description: 'Triangle area from side lengths, s = (a+b+c)/2', category: 'mensuration', tags: ['2d', 'area', 'triangle'] },
  { id: 'men-5', name: 'Rectangle Area', latex: 'A = l \\times w', description: 'Area of a rectangle', category: 'mensuration', tags: ['2d', 'area', 'rectangle'] },
  { id: 'men-6', name: 'Trapezium Area', latex: 'A = \\frac{1}{2}(a+b)h', description: 'Area of a trapezium with parallel sides a, b', category: 'mensuration', tags: ['2d', 'area', 'trapezium'] },
  { id: 'men-7', name: 'Sphere Volume', latex: 'V = \\frac{4}{3}\\pi r^3', description: 'Volume of a sphere', category: 'mensuration', tags: ['3d', 'volume', 'sphere'] },
  { id: 'men-8', name: 'Sphere Surface Area', latex: 'S = 4\\pi r^2', description: 'Surface area of a sphere', category: 'mensuration', tags: ['3d', 'surface', 'sphere'] },
  { id: 'men-9', name: 'Cylinder Volume', latex: 'V = \\pi r^2 h', description: 'Volume of a cylinder', category: 'mensuration', tags: ['3d', 'volume', 'cylinder'] },
  { id: 'men-10', name: 'Cylinder Surface Area', latex: 'S = 2\\pi r(r+h)', description: 'Total surface area of a cylinder', category: 'mensuration', tags: ['3d', 'surface', 'cylinder'] },
  { id: 'men-11', name: 'Cone Volume', latex: 'V = \\frac{1}{3}\\pi r^2 h', description: 'Volume of a cone', category: 'mensuration', tags: ['3d', 'volume', 'cone'] },
  { id: 'men-12', name: 'Cone Curved Surface Area', latex: 'S = \\pi r l', description: 'Lateral surface area of a cone with slant height l', category: 'mensuration', tags: ['3d', 'surface', 'cone'] },
  { id: 'men-13', name: 'Cuboid Volume', latex: 'V = l \\times w \\times h', description: 'Volume of a cuboid', category: 'mensuration', tags: ['3d', 'volume', 'cuboid'] },
  { id: 'men-14', name: 'Hemisphere Volume', latex: 'V = \\frac{2}{3}\\pi r^3', description: 'Volume of a hemisphere', category: 'mensuration', tags: ['3d', 'volume', 'hemisphere'] },
];

export const numberTheory: FormulaEntry[] = [
  { id: 'nt-1', name: 'GCD-LCM Relationship', latex: '\\gcd(a,b) \\times \\text{lcm}(a,b) = |ab|', description: 'Product of GCD and LCM equals product of numbers', category: 'numberTheory', tags: ['gcd', 'lcm'] },
  { id: 'nt-2', name: "Fermat's Little Theorem", latex: 'a^{p-1} \\equiv 1 \\pmod{p}', description: 'For prime p and integer a not divisible by p', category: 'numberTheory', tags: ['modular', 'prime', 'fermat'] },
  { id: 'nt-3', name: "Euler's Totient Theorem", latex: 'a^{\\phi(n)} \\equiv 1 \\pmod{n}', description: 'Generalization of Fermat\'s Little Theorem', category: 'numberTheory', tags: ['modular', 'euler', 'totient'] },
  { id: 'nt-4', name: "Wilson's Theorem", latex: '(p-1)! \\equiv -1 \\pmod{p}', description: 'A number p is prime iff this holds', category: 'numberTheory', tags: ['prime', 'factorial', 'wilson'] },
  { id: 'nt-5', name: 'Euclidean Algorithm', latex: '\\gcd(a,b) = \\gcd(b, a \\bmod b)', description: 'Recursive algorithm for finding GCD', category: 'numberTheory', tags: ['gcd', 'algorithm', 'euclidean'] },
  { id: 'nt-6', name: 'Divisibility Rule for 3', latex: 'n \\equiv 0 \\pmod{3} \\iff \\text{digit sum} \\equiv 0 \\pmod{3}', description: 'A number is divisible by 3 if its digit sum is', category: 'numberTheory', tags: ['divisibility', 'rules'] },
  { id: 'nt-7', name: 'Modular Addition', latex: '(a + b) \\bmod n = ((a \\bmod n) + (b \\bmod n)) \\bmod n', description: 'Modular arithmetic addition property', category: 'numberTheory', tags: ['modular', 'addition'] },
  { id: 'nt-8', name: 'Modular Multiplication', latex: '(a \\cdot b) \\bmod n = ((a \\bmod n) \\cdot (b \\bmod n)) \\bmod n', description: 'Modular arithmetic multiplication property', category: 'numberTheory', tags: ['modular', 'multiplication'] },
  { id: 'nt-9', name: 'Chinese Remainder Theorem', latex: 'x \\equiv a_i \\pmod{n_i} \\text{ has unique solution mod } N = \\prod n_i', description: 'System of congruences with coprime moduli', category: 'numberTheory', tags: ['crt', 'congruence'] },
  { id: 'nt-10', name: 'Prime Counting (Approx)', latex: '\\pi(x) \\sim \\frac{x}{\\ln x}', description: 'Approximate number of primes up to x', category: 'numberTheory', tags: ['prime', 'counting', 'approximation'] },
];

export const setsAndFunctions: FormulaEntry[] = [
  { id: 'set-1', name: "De Morgan's Law (Union)", latex: '(A \\cup B)^c = A^c \\cap B^c', description: 'Complement of a union is intersection of complements', category: 'setsAndFunctions', tags: ['sets', 'complement', 'de morgan'] },
  { id: 'set-2', name: "De Morgan's Law (Intersection)", latex: '(A \\cap B)^c = A^c \\cup B^c', description: 'Complement of an intersection is union of complements', category: 'setsAndFunctions', tags: ['sets', 'complement', 'de morgan'] },
  { id: 'set-3', name: 'Inclusion-Exclusion (2 Sets)', latex: '|A \\cup B| = |A| + |B| - |A \\cap B|', description: 'Cardinality of union of two sets', category: 'setsAndFunctions', tags: ['sets', 'cardinality', 'counting'] },
  { id: 'set-4', name: 'Inclusion-Exclusion (3 Sets)', latex: '|A \\cup B \\cup C| = |A|+|B|+|C|-|A\\cap B|-|A\\cap C|-|B\\cap C|+|A\\cap B\\cap C|', description: 'Cardinality of union of three sets', category: 'setsAndFunctions', tags: ['sets', 'cardinality', 'counting'] },
  { id: 'set-5', name: 'Function Composition', latex: '(f \\circ g)(x) = f(g(x))', description: 'Applying function f to result of function g', category: 'setsAndFunctions', tags: ['functions', 'composition'] },
  { id: 'set-6', name: 'Inverse Function', latex: 'f(f^{-1}(x)) = x = f^{-1}(f(x))', description: 'Property of an inverse function', category: 'setsAndFunctions', tags: ['functions', 'inverse'] },
  { id: 'set-7', name: 'Cartesian Product', latex: 'A \\times B = \\{(a,b) \\mid a \\in A, b \\in B\\}', description: 'Set of all ordered pairs from A and B', category: 'setsAndFunctions', tags: ['sets', 'product', 'cartesian'] },
  { id: 'set-8', name: 'Power Set Cardinality', latex: '|\\mathcal{P}(A)| = 2^{|A|}', description: 'Number of subsets of a set with n elements', category: 'setsAndFunctions', tags: ['sets', 'power set', 'cardinality'] },
  { id: 'set-9', name: 'Set Difference', latex: 'A \\setminus B = A \\cap B^c', description: 'Elements in A but not in B', category: 'setsAndFunctions', tags: ['sets', 'difference'] },
  { id: 'set-10', name: 'Symmetric Difference', latex: 'A \\triangle B = (A \\setminus B) \\cup (B \\setminus A)', description: 'Elements in exactly one of the two sets', category: 'setsAndFunctions', tags: ['sets', 'symmetric', 'difference'] },
];
