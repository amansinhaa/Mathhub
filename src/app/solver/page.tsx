import EquationSolver from '@/components/solver/EquationSolver';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Equation Solver | MathHub',
  description: 'Step-by-step mathematical equation solver.',
};

export default function SolverPage() {
  return <EquationSolver />;
}
