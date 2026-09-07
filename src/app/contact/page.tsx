import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageSquare, MapPin, Globe, ArrowLeft, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | EasyEquate',
  description:
    'Contact the EasyEquate development and editorial team. Send feedback, report formula bugs, suggest solver enhancements, or request academic partnerships.',
  alternates: {
    canonical: 'https://www.easyequate.com/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-8 animate-fade-in">
      {/* Header Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#757575] dark:text-[#A19891]">
        <Link
          href="/"
          className="hover:text-[#5D4037] dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} /> Back to EasyEquate
        </Link>
        <span>/</span>
        <span className="text-[#5D4037] dark:text-[#D7CCC8] font-bold">Contact Us</span>
      </div>

      {/* Header Title */}
      <div className="space-y-2 border-b border-[#E0E0E0] dark:border-[#2E2825] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8]">
            <Mail size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
              Contact EasyEquate
            </h1>
            <p className="text-xs font-mono text-[#757575] dark:text-[#A19891]">
              We value student feedback, bug reports, and educational inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-[#5D4037] dark:text-[#D7CCC8]">
            <Mail size={20} />
            <span className="font-bold text-sm">Direct Email Support</span>
          </div>
          <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
            For questions about equation steps, reporting calculation discrepancies, or general feedback:
          </p>
          <a
            href="mailto:kumaraman6376@gmail.com"
            className="inline-block font-mono text-xs font-bold text-[#5D4037] dark:text-[#E0A99A] hover:underline"
          >
            kumaraman6376@gmail.com
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-[#5D4037] dark:text-[#D7CCC8]">
            <MapPin size={20} />
            <span className="font-bold text-sm">Location & Hours</span>
          </div>
          <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
            Headquartered in India. We review feedback regularly and strive to respond to all academic inquiries within 24–48 business hours.
          </p>
          <div className="font-mono text-xs text-[#757575] dark:text-[#A19891]">
            Standard Time: IST (UTC +5:30)
          </div>
        </div>
      </div>

      {/* Direct Message Form Card */}
      <div className="p-6 rounded-2xl bg-[#F5F5F5] dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] space-y-4 shadow-2xs">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#131313] dark:text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-[#5D4037] dark:text-[#D7CCC8]" />
            Send a Direct Inquiry
          </h2>
          <p className="text-xs text-[#616161] dark:text-[#A19891]">
            Prefer sending a quick message right now? Fill in the details below to draft an email:
          </p>
        </div>

        <form
          action="mailto:kumaraman6376@gmail.com"
          method="GET"
          className="space-y-3 font-sans"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-[#616161] dark:text-[#A19891] mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Alex"
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white outline-none focus:border-[#5D4037]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-[#616161] dark:text-[#A19891] mb-1">
                Inquiry Topic
              </label>
              <select
                name="subject"
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white outline-none focus:border-[#5D4037]"
              >
                <option value="Formula Bug Report">Formula / Solver Bug Report</option>
                <option value="Feature Suggestion">Feature Suggestion</option>
                <option value="Curriculum Collaboration">Educational / Curriculum Query</option>
                <option value="General Feedback">General Feedback</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#616161] dark:text-[#A19891] mb-1">
              Your Message
            </label>
            <textarea
              name="body"
              rows={4}
              required
              placeholder="Describe your suggestion, formula discrepancy, or academic inquiry..."
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white outline-none focus:border-[#5D4037]"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5D4037] hover:bg-[#4E342E] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Send size={14} />
            <span>Open in Email Client</span>
          </button>
        </form>
      </div>
    </div>
  );
}