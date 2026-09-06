import React from 'react';
import FormulaLibrary from '@/components/formulas/FormulaLibrary';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Free Maths Formula Sheet: 150+ Formulas (Algebra, Trig, Calculus) | Easy Equate',
  },
  description:
    'Free comprehensive maths formula sheet with 150+ formulas. Instant LaTeX copy, revision guides for GCSE, A-Level, CBSE, algebra, trigonometry, and calculus.',
  alternates: {
    canonical: '/formulas',
  },
  openGraph: {
    title: 'Free Maths Formula Sheet: 150+ Formulas (Algebra, Trig, Calculus) | Easy Equate',
    description: '150+ maths formulas with LaTeX notation. Free revision sheet for algebra, geometry, trig, calculus, and probability.',
    url: 'https://www.easyequate.com/formulas',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Easy Equate Formula Reference Library',
      alternateName: ['EasyEquate Formulas', 'Easy Equate Math Reference', 'Maths Formula Sheet'],
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
        'Downloadable printable PDF formula sheets',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What formulas are included in this math formula sheet?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Easy Equate includes over 150 verified mathematical formulas across algebra, quadratic equations, trigonometry, differentiation, integration, probability, geometry, and vectors.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I export or print the formula sheet?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, you can export and download formatted PDF formula sheets for offline study and revision directly from Easy Equate for free.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are these formula sheets aligned with GCSE, A-Level, and CBSE boards?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, our formula sheets cover standard curricula including UK GCSE, Edexcel, AQA, Cambridge IGCSE, A-Level, and Indian CBSE Class 10 & 12 boards.',
          },
        },
      ],
    },
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
