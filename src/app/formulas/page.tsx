import React from 'react';
import FormulaLibrary from '@/components/formulas/FormulaLibrary';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Easy Equate: Complete Maths Formula Sheet & Reference Library',
  },
  description:
    'Easy Equate free maths formula sheet covering algebra, geometry, trigonometry, calculus, and probability. 150+ formulas with LaTeX display and 1-click solver integration.',
  alternates: {
    canonical: '/formulas',
  },
  openGraph: {
    title: 'Easy Equate: Complete Maths Formula Sheet & Reference Library',
    description: '150+ maths formulas: algebra, geometry, trig, calculus, probability. Free reference library.',
    url: 'https://www.easyequate.com/formulas',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Easy Equate Formula Reference Library',
  alternateName: ['EasyEquate Formulas', 'Easy Equate Math Reference'],
  url: 'https://www.easyequate.com/formulas',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Comprehensive maths formula reference library with 150+ formulas across algebra, geometry, trigonometry, calculus, and probability.',
  featureList: [
    'Algebra formulas (quadratic, binomial, sequences)',
    'Geometry and mensuration formulas',
    'Trigonometry identities and laws',
    'Calculus derivatives and integrals',
    'Probability and statistics formulas',
    'Vectors and complex numbers',
    '1-click send to solver or calculator',
  ],
};

export default function FormulasPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FormulaLibrary />
    </>
  );
}
