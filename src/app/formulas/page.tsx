import React from 'react';
import FormulaLibrary from '@/components/formulas/FormulaLibrary';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Complete Math Formula Reference Guide | EasyEquate',
  },
  description:
    'Interactive mathematics formula library covering algebra, geometry, trigonometry, calculus, and probability with 1-click calculator and solver integration.',
  alternates: {
    canonical: '/formulas',
  },
};

export default function FormulasPage() {
  return <FormulaLibrary />;
}
