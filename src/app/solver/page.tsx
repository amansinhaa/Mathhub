import EquationSolver from '@/components/solver/EquationSolver';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Step-by-Step Equation Solver — Linear, Quadratic & Calculus | EasyEquate',
  },
  description:
    'Free step-by-step equation solver for linear, quadratic, cubic, systems, inequalities, differentiation, and integration. See every formula used.',
  alternates: {
    canonical: '/solver',
  },
  openGraph: {
    title: 'Step-by-Step Equation Solver | EasyEquate',
    description: 'Solve linear, quadratic, polynomial equations and calculus problems step by step, free.',
    url: 'https://easyequate.com/solver',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EasyEquate Equation Solver',
  url: 'https://easyequate.com/solver',
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
