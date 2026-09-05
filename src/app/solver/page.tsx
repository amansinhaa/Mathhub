import EquationSolver from '@/components/solver/EquationSolver';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Easy Equate: Step-by-Step Equation Solver — Linear, Quadratic & Calculus',
  },
  description:
    'Easy Equate free step-by-step equation solver for linear, quadratic, cubic, systems, inequalities, differentiation, and integration. See every formula used.',
  alternates: {
    canonical: '/solver',
  },
  openGraph: {
    title: 'Easy Equate: Step-by-Step Equation Solver — Linear, Quadratic & Calculus',
    description: 'Solve linear, quadratic, polynomial equations and calculus problems step by step with Easy Equate. Free.',
    url: 'https://www.easyequate.com/solver',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Easy Equate Equation Solver',
  alternateName: ['EasyEquate Solver', 'Easy Equate Math Solver'],
  url: 'https://www.easyequate.com/solver',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free step-by-step equation solver supporting linear, quadratic, polynomial, system, inequality, differentiation, and integration.',
  featureList: [
    'Linear equation solver with steps',
    'Quadratic equation solver (factoring, completing the square, formula)',
    'Cubic & polynomial solver with synthetic division',
    'System of equations (up to 4×4)',
    'Step-by-step differentiation with formula cards',
    'Indefinite integration with formula cards',
    'Inequality solver with number line',
  ],
};

export default function SolverPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EquationSolver />
    </>
  );
}
