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
    <main className="min-h-screen bg-[#EFEBE9] dark:bg-[#131313] text-[#5D4037] dark:text-[#EFEBE9] p-4 md:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }}
      />
      
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5D4037] dark:text-[#EFEBE9]">
            Matrix Solver — Step-by-Step
          </h1>
          <div className="text-lg md:text-xl max-w-2xl mx-auto space-y-4">
            <p>
              Perform complex matrix operations with ease. Our matrix calculator supports addition, multiplication, determinants, inverses, and Reduced Row Echelon Form (RREF).
            </p>
            <p>
              Not only will you get the final answer, but our solver also breaks down the calculations to show you exactly how the result was obtained.
            </p>
          </div>
        </header>

        <section className="bg-white dark:bg-[#3E2723] p-6 rounded-xl shadow-sm border border-[#E0E0E0] dark:border-[#5D4037]">
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Select Size:</strong> Choose the dimensions of your matrix (2x2, 3x3, or 4x4).</li>
            <li><strong>Enter Values:</strong> Input your numbers into the matrix grid(s).</li>
            <li><strong>Choose Operation:</strong> Select whether you want the determinant, inverse, multiplication, RREF, or eigenvalues.</li>
            <li><strong>Calculate:</strong> Click calculate to see the step-by-step solution.</li>
          </ol>
        </section>

        <section className="flex justify-center">
          <Suspense fallback={<div className="p-8 text-center">Loading solver...</div>}>
            <div className="w-full max-w-3xl bg-white dark:bg-[#3E2723] p-6 rounded-xl shadow border border-[#E0E0E0] dark:border-[#5D4037]">
              <MatrixSolverWidget />
            </div>
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
              <div key={i} className="bg-white dark:bg-[#3E2723] p-4 rounded-lg border border-[#E0E0E0] dark:border-[#5D4037]">
                <h3 className="font-semibold text-lg">{faq.q}</h3>
                <p className="mt-2 opacity-90">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center space-y-4 pt-8 border-t border-[#E0E0E0] dark:border-[#5D4037]">
          <h3 className="text-xl font-medium">Explore Other Solvers</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/solver" className="text-blue-600 dark:text-blue-400 hover:underline">General Math Solver</Link>
            <Link href="/quadratic-equation-solver" className="text-blue-600 dark:text-blue-400 hover:underline">Quadratic Equation Solver</Link>
            <Link href="/equation-solver-with-steps" className="text-blue-600 dark:text-blue-400 hover:underline">Equation Solver with Steps</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
