'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-[#131313] text-[#131313] dark:text-[#F5F5F5] font-sans antialiased flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-4 p-6 bg-[#F5F5F5] dark:bg-[#1B1B1B] rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-lg">
          <h2 className="text-xl font-bold text-[#5D4037]">EasyEquate Error</h2>
          <p className="text-xs text-[#616161] dark:text-[#A19891]">
            A critical application error occurred. Click below to recover.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 bg-[#5D4037] text-white text-xs font-semibold rounded-xl hover:bg-[#6D4C41]"
            >
              Reset Application
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-white dark:bg-[#131313] text-[#5D4037] dark:text-[#D7CCC8] text-xs font-semibold rounded-xl border border-[#E0E0E0] dark:border-[#2E2825]"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
