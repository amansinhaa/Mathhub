import React from 'react';
import GraphModule from '@/components/graph/GraphModule';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Free Online Graph Plotter & Function Grapher | Easy Equate',
  },
  description:
    'Free online graph plotter and function calculator. Plot 2D functions, implicit curves, circles, and data tables with instant interactive visual analysis.',
  alternates: {
    canonical: '/graph',
  },
  openGraph: {
    title: 'Free Online Graph Plotter & Function Grapher | Easy Equate',
    description: 'Plot any math function, polynomial, or implicit equation online with instant interactive graphs. Free with no sign-up.',
    url: 'https://www.easyequate.com/graph',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Easy Equate Online Graph Plotter',
      alternateName: [
        'Easy Equate Grapher',
        'Online Graph Plotter',
        'Function Graph Plotter',
        'Function Plotter Online',
        'Function Graph Drawer',
        'Math Function Plotter',
        'Grapher Online',
      ],
      url: 'https://www.easyequate.com/graph',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free online function graph plotter supporting explicit functions, implicit equations, trigonometric curves, and printable study sheets.',
      featureList: [
        'Online graph plotter for explicit functions y = f(x)',
        'Implicit function plotter for circles, ellipses, and hyperbolas',
        'Parametric and trigonometric curve plotting',
        'Function analysis with roots, extrema, and intercepts',
        'Export high-resolution PNG, SVG, or printable study sheets',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I plot a function online with this graph plotter?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Simply enter your equation into the input field (e.g., y = x^2, sin(x), or e^x). The graph plotter will automatically render the curve in real time with interactive pan and zoom.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can this online graph plotter handle implicit curves and circles?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Easy Equate supports implicit relations such as x^2 + y^2 = 25 or xy = 1, as well as vertical lines and inequalities.',
          },
        },
        {
          '@type': 'Question',
          name: 'What functions can be graphed?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can plot polynomials, trigonometric (sin, cos, tan), inverse trig, exponential, logarithmic, rational, absolute value, and piecewise functions.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I plot multiple functions on the same graph?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, click the + Add Equation button to plot multiple simultaneous equations with color-coded curves and intersection points.',
          },
        },
      ],
    },
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

