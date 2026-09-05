import React from 'react';
import GraphModule from '@/components/graph/GraphModule';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Easy Equate: Free Online Graphing Calculator & Function Plotter',
  },
  description:
    'Easy Equate free online graphing calculator. Plot functions, implicit curves, circles, and parametric equations. Export printable study sheets. No sign-up required.',
  alternates: {
    canonical: '/graph',
  },
  openGraph: {
    title: 'Easy Equate: Free Online Graphing Calculator & Function Plotter',
    description: 'Plot any function, implicit curve, or equation with Easy Equate. Export printable graphs. Free.',
    url: 'https://www.easyequate.com/graph',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Easy Equate Graphing Calculator',
  alternateName: ['EasyEquate Grapher', 'Easy Equate Plotter'],
  url: 'https://www.easyequate.com/graph',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free online graphing calculator supporting explicit functions, implicit equations, and printable study sheet export.',
  featureList: [
    'Plot explicit functions y = f(x)',
    'Plot implicit curves like x² + y² = 25',
    'Plot vertical lines x = c',
    'Domain and range analysis',
    'Asymptote detection',
    'Export printable study sheets',
  ],
};

export default function GraphPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GraphModule />
    </>
  );
}
