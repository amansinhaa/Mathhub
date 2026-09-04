import Calculator from '@/components/calculator/Calculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Online Scientific Calculator with History | EasyEquate',
  },
  description:
    'Advanced online scientific calculator with memory, calculation history, angle modes, unit conversions, and keyboard support. Free, no sign-up.',
  alternates: {
    canonical: '/calculator',
  },
  openGraph: {
    title: 'Online Scientific Calculator with History | EasyEquate',
    description: 'Advanced online scientific calculator with memory, history, angle modes, unit conversions. Free.',
    url: 'https://easyequate.com/calculator',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EasyEquate Scientific Calculator',
  url: 'https://easyequate.com/calculator',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Advanced online scientific calculator with memory, calculation history, angle modes, and unit conversions.',
  featureList: ['Memory functions (M+, M-, MR, MC)', 'Calculation history', 'Degree and Radian modes', 'Unit conversions', 'Keyboard support'],
};

export default function CalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Calculator />
    </>
  );
}
