import React from 'react';
import GraphModule from '@/components/graph/GraphModule';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: 'Free Online Graph Plotter — Plot Functions & Equations Instantly | Easy Equate',
  },
  description:
    'Free online graph plotter. Plot any function, implicit curve, or equation. Enter y = f(x), x² + y² = r², or parametric equations and see the graph instantly. No download needed.',
  keywords: [
    'graph plotter', 'online graph plotter', 'function plotter', 'plot function online',
    'graphing calculator', 'graph calculator online', 'function graph drawer', 'math function plotter',
    'online graphing calculator', 'plot equations online', 'graph plotting online', 'plotter online',
    'graph online', 'free graph plotter', 'implicit curve plotter',
  ],
  alternates: {
    canonical: '/graph',
  },
  openGraph: {
    title: 'Free Online Graph Plotter — Plot Any Function | Easy Equate',
    description: 'Plot functions, implicit curves and equations instantly. Free online graph plotter — no download, no sign-up.',
    url: 'https://www.easyequate.com/graph',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Easy Equate Graph Plotter',
      alternateName: ['EasyEquate Grapher', 'Easy Equate Function Plotter', 'EasyEquate Online Graph Plotter'],
      url: 'https://www.easyequate.com/graph',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free online graph plotter for plotting functions y = f(x), implicit curves, and parametric equations with instant rendering.',
      featureList: [
        'Plot explicit functions y = f(x)',
        'Plot implicit curves like x² + y² = 25',
        'Plot vertical lines x = c',
        'Domain and range analysis',
        'Asymptote detection',
        'Export printable study sheets',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I plot a function online?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Type your function into the input box — for example y = x^2 + 2x - 3 or sin(x) — and press Enter. The graph appears instantly. You can plot multiple functions at once by adding more inputs.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I plot implicit equations like circles?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Enter implicit equations like x^2 + y^2 = 25 (a circle of radius 5) or x^2/9 + y^2/4 = 1 (an ellipse) directly into the plotter.',
          },
        },
        {
          '@type': 'Question',
          name: 'What functions can I plot?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can plot polynomials, trigonometric functions (sin, cos, tan), exponentials (e^x), logarithms (ln, log), absolute values, and more. The plotter supports standard mathematical notation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this graph plotter free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, completely free. No sign-up, no download, no subscription required. Just open the page and start plotting.',
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

      {/* Hero heading for SEO — visible above the fold */}
      <div className="bg-[#EFEBE9] dark:bg-[#131313] px-4 pt-6 pb-2 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#5D4037] dark:text-[#EFEBE9]">
          Free Online Graph Plotter
        </h1>
        <p className="mt-2 text-base md:text-lg text-[#795548] dark:text-[#BCAAA4] max-w-2xl mx-auto">
          Plot any function, equation, or implicit curve instantly. Enter <em>y = f(x)</em>, press Enter, and see your graph in seconds — no download required.
        </p>
      </div>

      <GraphModule />

      {/* SEO content section — static HTML indexed by Google */}
      <main className="bg-[#EFEBE9] dark:bg-[#131313] px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12 text-[#5D4037] dark:text-[#EFEBE9]">

          {/* Features */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">What Can You Plot?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Explicit Functions', example: 'y = x² − 3x + 2', desc: 'Standard y = f(x) functions — polynomials, trig, exponentials and more.' },
                { title: 'Implicit Curves', example: 'x² + y² = 25', desc: 'Circles, ellipses, hyperbolas and any relation between x and y.' },
                { title: 'Trigonometric', example: 'y = sin(x) + cos(2x)', desc: 'Sine, cosine, tangent and their combinations.' },
                { title: 'Exponential & Log', example: 'y = e^x, y = ln(x)', desc: 'Natural and common exponential and logarithmic functions.' },
                { title: 'Absolute Value', example: 'y = |x² − 4|', desc: 'Absolute value functions with V-shapes and reflections.' },
                { title: 'Multiple Functions', example: 'Add several equations', desc: 'Overlay multiple graphs to compare functions on the same axes.' },
              ].map((f) => (
                <div key={f.title} className="bg-white dark:bg-[#3E2723] p-4 rounded-xl border border-[#E0E0E0] dark:border-[#5D4037]">
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <code className="text-sm text-blue-700 dark:text-blue-300 block mt-1">{f.example}</code>
                  <p className="mt-1 text-sm opacity-80">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How-to guide */}
          <section className="bg-white dark:bg-[#3E2723] p-6 rounded-xl border border-[#E0E0E0] dark:border-[#5D4037] space-y-3">
            <h2 className="text-2xl font-bold">How to Use the Graph Plotter</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Type your function</strong> into the input field at the top of the graph. Example: <code>y = x^2 - 4</code></li>
              <li><strong>Press Enter</strong> or click the Plot button. Your graph appears instantly on the Cartesian plane.</li>
              <li><strong>Zoom and pan</strong> using scroll wheel or pinch gesture to explore the graph.</li>
              <li><strong>Add more functions</strong> by clicking the + button to overlay multiple graphs and compare them.</li>
              <li><strong>Export</strong> your graph as an image for use in assignments, notes, or study sheets.</li>
            </ol>
          </section>

          {/* Quick Examples */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Quick Examples to Try</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Parabola', eq: 'y = x² − 4' },
                { label: 'Sine Wave', eq: 'y = sin(x)' },
                { label: 'Circle', eq: 'x² + y² = 16' },
                { label: 'Cubic', eq: 'y = x³ − 3x' },
                { label: 'Exponential', eq: 'y = 2^x' },
                { label: 'Absolute Value', eq: 'y = |x − 2|' },
              ].map((ex) => (
                <div key={ex.label} className="bg-white dark:bg-[#3E2723] p-4 rounded-lg border border-[#E0E0E0] dark:border-[#5D4037] text-center">
                  <p className="font-semibold">{ex.label}</p>
                  <code className="text-sm text-blue-700 dark:text-blue-300">{ex.eq}</code>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            {[
              { q: 'How do I plot a function online?', a: 'Type your function into the input box — for example y = x^2 + 2x − 3 or sin(x) — and press Enter. The graph renders instantly. Add more inputs to overlay multiple functions.' },
              { q: 'Can I plot implicit equations like x² + y² = 25?', a: 'Yes. Enter the equation directly. The plotter handles implicit curves including circles, ellipses, hyperbolas, and any relation between x and y without needing to solve for y explicitly.' },
              { q: 'What is the difference between a graph plotter and a graphing calculator?', a: 'A graph plotter draws the visual graph of a function. A graphing calculator also evaluates the function, finds roots, intercepts, and turning points. Easy Equate combines both — use the graph plotter to visualise and the solver to compute exact values.' },
              { q: 'Is this graph plotter free to use?', a: 'Yes, completely free. No sign-up, no download, and no hidden cost. Just open the page and start plotting functions instantly.' },
              { q: 'Can I use this graph plotter on my phone?', a: 'Yes. The Easy Equate graph plotter is fully mobile-responsive. Open easyequate.com/graph on any phone or tablet and start plotting.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-[#3E2723] p-4 rounded-lg border border-[#E0E0E0] dark:border-[#5D4037]">
                <h3 className="font-semibold text-lg">{faq.q}</h3>
                <p className="mt-2 opacity-90">{faq.a}</p>
              </div>
            ))}
          </section>

          {/* Internal links */}
          <section className="text-center space-y-3 pt-4 border-t border-[#E0E0E0] dark:border-[#5D4037]">
            <h3 className="text-lg font-medium">Explore More Tools</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/solver" className="text-blue-600 dark:text-blue-400 hover:underline">Equation Solver</Link>
              <Link href="/integral-calculator" className="text-blue-600 dark:text-blue-400 hover:underline">Integral Calculator</Link>
              <Link href="/derivative-calculator" className="text-blue-600 dark:text-blue-400 hover:underline">Derivative Calculator</Link>
              <Link href="/quadratic-equation-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Quadratic Solver</Link>
              <Link href="/formulas" className="text-blue-600 dark:text-blue-400 hover:underline">Maths Formula Sheet</Link>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

