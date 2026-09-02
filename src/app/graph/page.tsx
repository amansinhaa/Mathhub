import React from 'react';
import GraphModule from '@/components/graph/GraphModule';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Free Online Graphing Calculator & Plotter | EasyEquate',
  },
  description:
    'Free online 2D function plotter and graphing calculator. Plot explicit and implicit equations, data tables, regressions, and export printable study sheets.',
  alternates: {
    canonical: '/graph',
  },
};

export default function GraphPage() {
  return <GraphModule />;
}
