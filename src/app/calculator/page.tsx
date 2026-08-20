import Calculator from '@/components/calculator/Calculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scientific Calculator | MathHub',
  description: 'Advanced scientific calculator with history and memory functions.',
};

export default function CalculatorPage() {
  return <Calculator />;
}
