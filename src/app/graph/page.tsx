import React from 'react';
import GraphModule from '@/components/graph/GraphModule';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Free Online Graphing Calculator & Function Plotter | EasyEquate',
  },
  description:
    'Free online graphing calculator. Plot functions, implicit curves, circles, and parametric equations. Export printable study sheets. No sign-up required.',
  alternates: {
    canonical: '/graph',
  },
  openGraph: {
    title: 'Free Online Graphing Calculator | EasyEquate',
    description: 'Plot any function, implicit curve, or equation. Export printable graphs. Free.',
    url: 'https://easyequate.com/graph',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EasyEquate Graphing Calculator',
  url: 'https://easyequate.com/graph',
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
