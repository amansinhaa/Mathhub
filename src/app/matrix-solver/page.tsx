import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// Using a lazy load or import for the client component
import MatrixSolverWidget from '@/components/solver/MatrixSolverWidget';

export function generateMetadata(): Metadata {
  return {
    title: 'Matrix Solver — Determinant, Inverse & RREF | EasyEquate',
    description: 'Free step-by-step matrix solver. Calculate determinant, inverse, multiply matrices, RREF, and find eigenvalues with full working shown.',
    alternates: {
      canonical: '/matrix-solver',
    },
  };
}

export default function MatrixSolverPage() {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "EasyEquate Matrix Solver",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do you find the determinant of a matrix?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "For a 2x2 matrix, the determinant is ad - bc. For a 3x3, you use cofactor expansion along a row or column. Our solver shows the exact steps for both."
            }
          },
          {
            "@type": "Question",
            "name": "What is an inverse matrix?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "An inverse matrix is a matrix that, when multiplied by the original matrix, yields the identity matrix. A matrix must be square and have a non-zero determinant to be invertible."
            }
          },
          {
            "@type": "Question",
            "name": "How does matrix multiplication work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To multiply matrices, you multiply the elements of each row of the first matrix by the corresponding elements of each column of the second matrix, then add the products."
            }
          },
          {
            "@type": "Question",
            "name": "What is RREF?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "RREF stands for Reduced Row Echelon Form. It is found using Gaussian elimination and is useful for solving systems of linear equations and finding the rank of a matrix."
            }
          },
          {
            "@type": "Question",
            "name": "Can you find eigenvalues with this solver?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our matrix solver can compute the eigenvalues for square matrices by finding the roots of the characteristic polynomial."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="w-full text-[#131313] dark:text-[#F5F5F5] py-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }}
      />
      
      <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-3 sm:space-y-5">
        <header className="space-y-1 sm:space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EFEBE9] dark:bg-[#25201E] border border-[#D7CCC8] dark:border-[#3E2723] text-[10px] sm:text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8]">
            <span>LINEAR ALGEBRA</span>
            <span>•</span>
            <span>MATRIX STUDIO</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#131313] dark:text-white">
            Matrix Solver — Step-by-Step
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] max-w-3xl">
            Custom dimensions ($m \times n$), determinants, inverses, matrix multiplication, RREF, rank, and eigenvalues with complete step-by-step working.
          </p>
        </header>

        {/* Matrix Solver Widget — Immediate Above-the-Fold Access */}
        <section className="w-full">
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#757575]">Loading matrix workstation...</div>}>
            <MatrixSolverWidget />
          </Suspense>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How do you find the determinant of a matrix?", a: "For a 2x2 matrix, the determinant is ad - bc. For a 3x3, you use cofactor expansion along a row or column. Our solver shows the exact steps for both." },
              { q: "What is an inverse matrix?", a: "An inverse matrix is a matrix that, when multiplied by the original matrix, yields the identity matrix. A matrix must be square and have a non-zero determinant to be invertible." },
              { q: "How does matrix multiplication work?", a: "To multiply matrices, you multiply the elements of each row of the first matrix by the corresponding elements of each column of the second matrix, then add the products." },
              { q: "What is RREF?", a: "RREF stands for Reduced Row Echelon Form. It is found using Gaussian elimination and is useful for solving systems of linear equations and finding the rank of a matrix." },
              { q: "Can you find eigenvalues with this solver?", a: "Yes, our matrix solver can compute the eigenvalues for square matrices by finding the roots of the characteristic polynomial." }
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs">
                <h3 className="font-semibold text-base text-[#131313] dark:text-white">{faq.q}</h3>
                <p className="mt-1 text-xs text-[#616161] dark:text-[#A19891]">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center space-y-4 pt-4 border-t border-[#E0E0E0] dark:border-[#2E2825]">
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">Explore Other Solvers</h3>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <Link href="/system-of-equations" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">System of Equations</Link>
            <Link href="/quadratic-equation-solver" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">Quadratic Equation Solver</Link>
            <Link href="/equation-solver-with-steps" className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] transition-colors">Equation Solver with Steps</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
