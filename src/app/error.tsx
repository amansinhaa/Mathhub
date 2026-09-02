'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('EasyEquate Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-[#EFEBE9] dark:bg-[#3E2723]/60 border border-[#D7CCC8] dark:border-[#5D4037] flex items-center justify-center text-[#5D4037] dark:text-[#FFAB91] mb-4 shadow-sm">
        <AlertCircle size={28} />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold font-sans text-[#131313] dark:text-white mb-2">
        Calculation or Rendering Error
      </h2>
      <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] max-w-md mb-6 leading-relaxed">
        An unexpected error occurred while processing this page. You can try refreshing the view or return to the calculator workspace.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5D4037] hover:bg-[#6D4C41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 border border-[#795548]/50"
        >
          <RotateCcw size={14} />
          <span>Try Again</span>
        </button>
        <Link
          href="/calculator"
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F5F5F5] text-[#5D4037] dark:bg-[#1B1B1B] dark:hover:bg-[#262220] dark:text-[#D7CCC8] text-xs font-semibold rounded-xl transition-all border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs active:scale-95"
        >
          <Home size={14} />
          <span>Workspace</span>
        </Link>
      </div>
    </div>
  );
}
