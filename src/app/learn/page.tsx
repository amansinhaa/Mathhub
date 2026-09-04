import Link from 'next/link';

export const revalidate = false;

export const metadata = {
  title: 'Math Learning Guides — Functions, Graphs & Algebra Explained | EasyEquate',
  description: 'Free step-by-step math guides with live interactive examples. Learn functions, domain & range, quadratics, and more with embedded graphing tools.',
  alternates: {
    canonical: '/learn'
  }
};

export default function LearnIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 prose prose-brown dark:prose-invert">
      <h1 className="text-4xl font-bold text-[#5D4037] dark:text-[#EFEBE9] mb-4">Math Learning Guides</h1>
      <p className="text-lg text-[#131313] dark:text-[#E0E0E0] mb-12">
        Welcome to our step-by-step math guides. Each guide comes with simple English explanations, everyday examples, and embedded interactive graphing tools so you can visualize the math immediately.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/learn/what-is-a-function" className="block border border-[#E0E0E0] dark:border-[#3E2723] rounded-xl p-6 hover:shadow-lg transition-shadow bg-white dark:bg-[#131313] no-underline">
          <h2 className="text-xl font-bold text-[#5D4037] dark:text-[#EFEBE9] mb-2 mt-0">What is a Function?</h2>
          <p className="text-[#131313] dark:text-[#E0E0E0] text-sm m-0">Definition, examples, and the vertical line test explained simply.</p>
        </Link>
        <Link href="/learn/how-to-find-domain-and-range" className="block border border-[#E0E0E0] dark:border-[#3E2723] rounded-xl p-6 hover:shadow-lg transition-shadow bg-white dark:bg-[#131313] no-underline">
          <h2 className="text-xl font-bold text-[#5D4037] dark:text-[#EFEBE9] mb-2 mt-0">Find Domain & Range</h2>
          <p className="text-[#131313] dark:text-[#E0E0E0] text-sm m-0">Step-by-step guide to finding domain and range with worked examples.</p>
        </Link>
        <Link href="/learn/how-to-graph-a-quadratic-function" className="block border border-[#E0E0E0] dark:border-[#3E2723] rounded-xl p-6 hover:shadow-lg transition-shadow bg-white dark:bg-[#131313] no-underline">
          <h2 className="text-xl font-bold text-[#5D4037] dark:text-[#EFEBE9] mb-2 mt-0">Graph a Quadratic</h2>
          <p className="text-[#131313] dark:text-[#E0E0E0] text-sm m-0">Find the vertex, intercepts, and graph parabolas with ease.</p>
        </Link>
      </div>
    </div>
  );
}
