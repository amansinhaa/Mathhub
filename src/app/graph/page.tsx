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
      {/* Interactive Graph Tool directly at the top — zero top offset for optimal mobile & Android UX */}
      <GraphModule />

      {/* SEO & Knowledge Guide placed below the graph so it never interferes with mobile plotting */}
      <footer className="mt-8 border-t border-[#E0E0E0] dark:border-[#2E2825] bg-white dark:bg-[#1B1B1B] p-6 rounded-2xl mx-2 sm:mx-4 mb-12 text-[#5D4037] dark:text-[#EFEBE9] space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#5D4037] dark:text-[#EFEBE9]">
              About the Easy Equate Online Graph Plotter
            </h2>
            <p className="text-sm opacity-90 leading-relaxed">
              Easy Equate is a free, fast online graph plotter and function drawer designed for students, educators, and engineers. Whether you need to plot linear graphs, quadratic parabolas, cubic polynomials, trigonometric waves, or implicit conic sections, our graphing engine renders high-precision mathematical plots directly in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] bg-[#FAF8F7] dark:bg-[#131313]/60 space-y-2">
              <span className="font-bold block text-sm">Supported Function Types</span>
              <ul className="list-disc list-inside space-y-1 opacity-90">
                <li><strong>Polynomials:</strong> Linear, quadratic, cubic, and higher-order functions</li>
                <li><strong>Trigonometric:</strong> sin(x), cos(x), tan(x), sec(x), csc(x), cot(x)</li>
                <li><strong>Exponentials & Logarithms:</strong> e^x, ln(x), log10(x), 2^x</li>
                <li><strong>Implicit Relations:</strong> x² + y² = r² (circles), ellipses, hyperbolas</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] bg-[#FAF8F7] dark:bg-[#131313]/60 space-y-2">
              <span className="font-bold block text-sm">Key Plotter Capabilities</span>
              <ul className="list-disc list-inside space-y-1 opacity-90">
                <li><strong>Multi-Curve Graphing:</strong> Overlay multiple functions to compare intersections</li>
                <li><strong>Touch & Pan:</strong> Smooth pinch-to-zoom and drag navigation on touchscreens</li>
                <li><strong>Analysis Tools:</strong> Roots, vertex coordinates, and extrema detection</li>
                <li><strong>Export:</strong> Download SVG, high-res PNG, or printable study sheets</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#E0E0E0] dark:border-[#2E2825]">
            <span className="font-bold text-sm block">Quick Math Tools & Navigation</span>
            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
              <a href="/quadratic-equation-solver" className="hover:underline">Quadratic Equation Solver</a>
              <span>·</span>
              <a href="/solver" className="hover:underline">Step-by-Step Math Solver</a>
              <span>·</span>
              <a href="/formulas" className="hover:underline">Math Formulas Sheet</a>
              <span>·</span>
              <a href="/matrix-solver" className="hover:underline">Matrix Solver</a>
              <span>·</span>
              <a href="/calculator" className="hover:underline">Scientific Calculator</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
