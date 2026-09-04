import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Cpu, ShieldCheck, Heart, ArrowLeft, BookOpen, Compass, Calculator } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | EasyEquate',
  description:
    'About EasyEquate — Mission, architecture, and principles behind our free, privacy-first, client-side mathematics and graphing workspace.',
  alternates: {
    canonical: 'https://easyequate.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-8 animate-fade-in">
      {/* Header Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#757575] dark:text-[#A19891]">
        <Link
          href="/"
          className="hover:text-[#5D4037] dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} /> Back to EasyEquate
        </Link>
        <span>/</span>
        <span className="text-[#5D4037] dark:text-[#D7CCC8] font-bold">About Us</span>
      </div>

      {/* Title Header */}
      <div className="space-y-3 border-b border-[#E0E0E0] dark:border-[#2E2825] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8]">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
              About EasyEquate
            </h1>
            <p className="text-xs font-mono text-[#757575] dark:text-[#A19891]">
              Democratizing Precision Mathematics & Interactive Visual Learning
            </p>
          </div>
        </div>
      </div>

      {/* Story & Mission */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed space-y-6 text-[#424242] dark:text-[#D7CCC8]">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            Our Mission
          </h2>
          <p>
            <strong>EasyEquate</strong> was founded with a singular conviction: mathematical tools
            should be <em>fast</em>, <em>frictionless</em>, and <em>accessible to every student and educator worldwide</em> without
            paywalls, subscription gates, or invasive data harvesting.
          </p>
          <p>
            Traditional graphing software and step-by-step solvers often lock necessary intermediate steps
            behind expensive monthly subscriptions or bombard students with intrusive pop-ups that derail
            their concentration. EasyEquate provides a distraction-free, instrument-grade mathematics studio
            that pairs symbolic computational power with human-readable pedagogy.
          </p>
        </section>

        {/* Core Pillars Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 not-prose">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] flex items-center justify-center font-bold">
              <Cpu size={18} />
            </div>
            <h3 className="font-bold text-sm text-[#131313] dark:text-white">100% Client-Side</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
              Every expression, derivative, integral, and polynomial division runs directly in your browser.
              Calculations are instant and work offline.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <h3 className="font-bold text-sm text-[#131313] dark:text-white">Privacy First</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
              No accounts, no user tracking, no hidden profiles. Your educational queries never leave your machine.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] flex items-center justify-center font-bold">
              <Heart size={18} />
            </div>
            <h3 className="font-bold text-sm text-[#131313] dark:text-white">Free for Everyone</h3>
            <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
              Built for high schoolers, university engineering students, and educators preparing classroom sheets.
            </p>
          </div>
        </section>

        {/* Modules Overview */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            What EasyEquate Offers
          </h2>
          <div className="space-y-3 not-prose">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5F5F5] dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825]">
              <Calculator className="text-[#5D4037] dark:text-[#D7CCC8] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-[#131313] dark:text-white">Scientific Calculator & Matrix Engine</h4>
                <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
                  Real and complex evaluation, unit conversions, matrix determinants, inverses, eigenvalues, and full history logging.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5F5F5] dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825]">
              <Compass className="text-[#5D4037] dark:text-[#D7CCC8] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-[#131313] dark:text-white">Step-by-Step Polynomial & Equation Solver</h4>
                <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
                  Complete intermediate workings including factoring, synthetic division, and polynomial long division steps rendered in clean KaTeX.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5F5F5] dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825]">
              <BookOpen className="text-[#5D4037] dark:text-[#D7CCC8] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-[#131313] dark:text-white">Curriculum Formula Sheets & 2D Graphing</h4>
                <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
                  Board-aligned revision guides (GCSE, A-Level, Edexcel, Class 10/12) and zero-scroll interactive function plotting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Standards & Integrity */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            Editorial Integrity & Quality Standards
          </h2>
          <p>
            All mathematical algorithms and formula derivations are vetted against standard academic
            curricula and verified using established symbolic libraries (Math.js and Nerdamer). We
            regularly update our step generator to ensure pedagogy aligns with examination standards.
          </p>
        </section>

        {/* Creator / Organization Info */}
        <section className="space-y-3 pt-4 border-t border-[#E0E0E0] dark:border-[#2E2825]">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            Creator & Location
          </h2>
          <div className="p-4 rounded-xl bg-white dark:bg-[#181818] border border-[#E0E0E0] dark:border-[#2E2825] font-mono text-xs space-y-1">
            <div><strong>Project:</strong> EasyEquate</div>
            <div><strong>Founder / Maintainer:</strong> Aman Kumar</div>
            <div><strong>Origin:</strong> India</div>
            <div><strong>Contact:</strong> <a href="mailto:kumaraman6376@gmail.com" className="text-[#5D4037] dark:text-[#E0A99A] underline">kumaraman6376@gmail.com</a></div>
          </div>
        </section>
      </div>
    </div>
  );
}