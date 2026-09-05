import Calculator from '@/components/calculator/Calculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Easy Equate: Online Scientific Calculator, Equation Solver & Grapher',
  description:
    'Easy Equate is a free online scientific calculator, step-by-step polynomial & calculus solver, and 2D function grapher with memory, history, and keyboard support.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Easy Equate: Online Scientific Calculator, Equation Solver & Grapher',
    description:
      'Easy Equate is a free all-in-one mathematics and graphing studio featuring an online scientific calculator, equation solver, and 2D function plotter.',
    url: 'https://www.easyequate.com',
  },
};

export default function Home() {
  return <Calculator />;
}
