import EquationSolver from '@/components/solver/EquationSolver';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Step-by-Step Equation & Polynomial Division Solver | EasyEquate',
  },
  description:
    'Solve polynomial equations, linear systems, inequalities, and symbolic algebra with step-by-step NCERT long division and synthetic division.',
  alternates: {
    canonical: '/solver',
  },
};

export default function SolverPage() {
  return <EquationSolver />;
}
