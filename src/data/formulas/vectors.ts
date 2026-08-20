import { FormulaEntry } from '@/types/formula';

export const vectors: FormulaEntry[] = [
  { id: 'vec-1', name: 'Vector Dot Product', latex: '\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta = a_x b_x + a_y b_y + a_z b_z', description: 'Scalar product of two vectors', category: 'vectors', tags: ['vectors', 'dot-product'] },
  { id: 'vec-2', name: 'Vector Cross Product', latex: '\\vec{a} \\times \\vec{b} = |\\vec{a}||\\vec{b}|\\sin\\theta \\, \\hat{n} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ a_x & a_y & a_z \\\\ b_x & b_y & b_z \\end{vmatrix}', description: 'Vector product yielding orthogonal vector', category: 'vectors', tags: ['vectors', 'cross-product'] },
  { id: 'vec-3', name: 'Vector Magnitude', latex: '|\\vec{a}| = \\sqrt{a_x^2 + a_y^2 + a_z^2}', description: 'Euclidean norm or length of a vector', category: 'vectors', tags: ['vectors', 'magnitude'] },
  { id: 'vec-4', name: 'Unit Vector', latex: '\\hat{a} = \\frac{\\vec{a}}{|\\vec{a}|}', description: 'Vector of length 1 pointing in same direction', category: 'vectors', tags: ['vectors', 'unit-vector'] },
  { id: 'vec-5', name: 'Scalar Projection of A onto B', latex: '\\text{proj}_{\\vec{b}}(\\vec{a}) = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|}', description: 'Magnitude of vector a in direction of vector b', category: 'vectors', tags: ['vectors', 'projection'] },
  { id: 'vec-6', name: 'Matrix Determinant (2x2)', latex: '\\det\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} = ad - bc', description: 'Determinant of a 2 by 2 matrix', category: 'vectors', tags: ['matrices', 'determinant'] },
  { id: 'vec-7', name: 'Matrix Inverse (2x2)', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}', description: 'Inverse of an invertible 2 by 2 matrix', category: 'vectors', tags: ['matrices', 'inverse'] },
  { id: 'vec-8', name: 'Characteristic Equation (Eigenvalues)', latex: '\\det(A - \\lambda I) = 0', description: 'Equation for finding eigenvalues λ of matrix A', category: 'vectors', tags: ['matrices', 'eigenvalues'] },
];
