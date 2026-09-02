import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold font-mono text-[#5D4037] mb-2">404</h1>
      <p className="text-sm text-[#616161] dark:text-[#A19891] mb-4">Page Not Found</p>
      <Link
        href="/calculator"
        className="px-4 py-2 bg-[#5D4037] hover:bg-[#6D4C41] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
      >
        Return to Calculator
      </Link>
    </div>
  );
}
