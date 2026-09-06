import React from 'react';
import FormulaLibrary from '@/components/formulas/FormulaLibrary';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Free Maths Formula Sheet — 150+ Formulas for Algebra, Calculus & Trig | Easy Equate',
  },
  description:
    'Browse 150+ maths formulas instantly — algebra, calculus, trigonometry, geometry & more. Free formula sheet for GCSE, A-Level, Class 10/12. Click any formula to solve it.',
  alternates: {
    canonical: '/formulas',
  },
  keywords: [
    'maths formula sheet', 'math formulas', 'algebra formulas', 'calculus formulas',
    'trigonometry formulas', 'geometry formulas', 'GCSE formula sheet', 'A-level maths formulas',
    'class 10 maths formulas', 'class 12 maths formulas', 'quadratic formula', 'formula reference',
  ],
  openGraph: {
    title: 'Free Maths Formula Sheet — 150+ Formulas | Easy Equate',
    description: '150+ maths formulas for algebra, calculus, trigonometry, geometry and more. Free. No sign-up. Works for GCSE, A-Level, Class 10 & 12.',
    url: 'https://www.easyequate.com/formulas',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Easy Equate Formula Reference Library',
      alternateName: ['EasyEquate Formulas', 'Easy Equate Math Reference', 'EasyEquate Formula Sheet'],
      url: 'https://www.easyequate.com/formulas',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free maths formula sheet with 150+ formulas across algebra, geometry, trigonometry, calculus, probability, vectors and complex numbers.',
      featureList: [
        'Algebra formulas (quadratic, binomial, sequences)',
        'Geometry and mensuration formulas',
        'Trigonometry identities and laws',
        'Calculus derivatives and integrals tables',
        'Probability and statistics formulas',
        'Vectors and complex numbers',
        '1-click send to solver or calculator',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What formulas are included in this maths formula sheet?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The formula sheet covers 150+ formulas across algebra (quadratic formula, binomial theorem, sequences), geometry, trigonometry (SOH-CAH-TOA, laws of sine and cosine), calculus (derivatives and integrals), probability, vectors, and complex numbers.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this formula sheet free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, the Easy Equate formula sheet is completely free. No account or sign-up is required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which exam boards does this formula sheet cover?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The formulas are suitable for GCSE, A-Level (Edexcel, AQA, OCR), IGCSE, IB, Indian Class 10 and Class 12 (CBSE/ICSE) and most international curricula.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use a formula directly in the solver?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Click any formula to instantly send it to the Easy Equate solver or calculator for step-by-step working.',
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
