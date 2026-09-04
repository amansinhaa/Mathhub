import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | EasyEquate',
  description:
    'EasyEquate Privacy Policy. Details on client-side computations, cookie usage, Google AdSense, analytics disclosures, and data protection.',
  alternates: {
    canonical: 'https://easyequate.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
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
        <span className="text-[#5D4037] dark:text-[#D7CCC8] font-bold">Privacy Policy</span>
      </div>

      {/* Title & Introduction */}
      <div className="space-y-2 border-b border-[#E0E0E0] dark:border-[#2E2825] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8]">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
            Privacy Policy
          </h1>
        </div>
        <p className="text-xs font-mono text-[#757575] dark:text-[#A19891]">
          Effective Date: September 5, 2026 • Last Updated: September 5, 2026
        </p>
      </div>

      {/* Main Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed space-y-6 text-[#424242] dark:text-[#D7CCC8]">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            1. Overview & Commitment to Privacy
          </h2>
          <p>
            At <strong>EasyEquate</strong> (accessible at{' '}
            <a
              href="https://easyequate.com"
              className="text-[#5D4037] dark:text-[#E0A99A] underline font-mono"
            >
              https://easyequate.com
            </a>
            ), your privacy is of paramount importance. This Privacy Policy details the types of
            information collected and recorded by EasyEquate and how it is utilized.
          </p>
          <p>
            EasyEquate is engineered as a <strong>free, client-side educational math workspace</strong>.
            All mathematical evaluations, step-by-step polynomial solutions, and 2D coordinate plots are computed
            locally within your browser using client-side JavaScript. Your expressions, equations, and values
            are never transmitted to or stored on remote servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            2. Information We Collect and Process
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>No Account Required:</strong> EasyEquate does not require registration, login, passwords,
              or profile creation. You can use every tool anonymously.
            </li>
            <li>
              <strong>Local Browser Storage (localStorage):</strong> We use your device&apos;s local storage
              strictly to remember your calculation history, saved formulas, and theme preference (light or dark mode).
              This data remains on your physical device.
            </li>
            <li>
              <strong>Direct Correspondence:</strong> If you contact us directly via email (
              <a
                href="mailto:kumaraman6376@gmail.com"
                className="text-[#5D4037] dark:text-[#E0A99A] underline font-mono"
              >
                kumaraman6376@gmail.com
              </a>
              ), we receive your email address and message contents solely to assist with your inquiry.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            3. Cookies and Web Beacons
          </h2>
          <p>
            EasyEquate uses standard cookies to store information including visitors&apos; preferences
            and the specific pages accessed. This information helps us optimize the user experience
            by tailoring content according to browser attributes and device form factors.
          </p>
        </section>

        <section className="space-y-3 p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825]">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            4. Google AdSense & DoubleClick DART Cookies
          </h2>
          <p>
            Google is a third-party vendor on our site. It uses cookies, commonly known as DART cookies,
            to serve advertisements to visitors based upon their visit to{' '}
            <code className="text-xs bg-white dark:bg-[#131313] px-1.5 py-0.5 rounded border border-[#E0E0E0] dark:border-[#2E2825]">
              https://easyequate.com
            </code>{' '}
            and other websites across the internet.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on previous visits to this or other websites.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners to serve targeted ads based on your visits to our site and other internet destinations.
            </li>
            <li>
              You can opt out of personalized advertising at any time by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5D4037] dark:text-[#E0A99A] underline"
              >
                Google Ads Settings
              </a>{' '}
              or via{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5D4037] dark:text-[#E0A99A] underline"
              >
                aboutads.info
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            5. Analytics (Google Analytics & Vercel)
          </h2>
          <p>
            We deploy privacy-focused analytics services including <strong>Google Analytics</strong> and{' '}
            <strong>Vercel Web Analytics / Speed Insights</strong>. These utilities capture anonymized, aggregated
            usage statistics (e.g., page load times, geographic country, browser type, referral paths) to ensure
            uptime and optimize responsive layout performance. No student input formulas are tracked.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            6. GDPR, CCPA, and Indian IT Act Disclosures
          </h2>
          <p>
            We honor data subject rights globally, including the European Union GDPR, California CCPA/CPRA,
            and the Digital Personal Data Protection Act (India):
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The right to know what personal data is processed and request a copy.</li>
            <li>The right to rectify inaccurate data or request total deletion.</li>
            <li>The right to opt-out of third-party profiling or advertising trackers.</li>
            <li>We do not sell, rent, or trade your personal information under any circumstance.</li>
          </ul>
          <p>
            To submit a privacy inquiry or data erasure request, please email{' '}
            <a
              href="mailto:kumaraman6376@gmail.com"
              className="text-[#5D4037] dark:text-[#E0A99A] underline font-mono"
            >
              kumaraman6376@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            7. Children&apos;s Privacy Protection
          </h2>
          <p>
            EasyEquate is a general educational resource for learners of all ages. In compliance with COPPA
            and international child safety standards, we do not knowingly collect personal information from children
            under the age of 13. If you believe your child has submitted personal details through email correspondence,
            contact us immediately so we can remove it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#131313] dark:text-white">
            8. Contact & Administration
          </h2>
          <div className="p-4 rounded-xl bg-white dark:bg-[#181818] border border-[#E0E0E0] dark:border-[#2E2825] font-mono text-xs space-y-1">
            <div><strong>Platform:</strong> EasyEquate</div>
            <div><strong>Location:</strong> India</div>
            <div><strong>Support Email:</strong> <a href="mailto:kumaraman6376@gmail.com" className="text-[#5D4037] dark:text-[#E0A99A] underline">kumaraman6376@gmail.com</a></div>
            <div><strong>Website:</strong> <a href="https://easyequate.com" className="text-[#5D4037] dark:text-[#E0A99A] underline">https://easyequate.com</a></div>
          </div>
        </section>
      </div>
    </div>
  );
}