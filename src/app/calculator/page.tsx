import Calculator from '@/components/calculator/Calculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Online Scientific Calculator with History | EasyEquate',
  },
  description:
    'Advanced online scientific calculator with memory, calculation history, angle modes, unit conversions, and matrix operations.',
  alternates: {
    canonical: '/calculator',
  },
};

export default function CalculatorPage() {
  return <Calculator />;
}
