import Link from 'next/link';
import GraphModuleClient from '@/components/shared/GraphModuleClient';


export const revalidate = false;

export const metadata = {
  title: 'How to Find Domain and Range — Step-by-Step Guide | EasyEquate',
  description: 'Learn how to find the domain and range of any function step by step. Includes worked examples, interval notation, and an interactive graph tool.',
  alternates: {
    canonical: '/learn/how-to-find-domain-and-range'
  }
};

export default function HowToFindDomainAndRange() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is domain in maths?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The domain is the complete set of all possible input values (usually the x-values) for which the function is defined and produces a real output."
        }
      },
      {
        "@type": "Question",
        "name": "What is range in maths?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The range is the complete set of all possible output values (usually the y-values or f(x)) that a function can produce from its domain."
        }
      },
      {
        "@type": "Question",
        "name": "How do you write domain in interval notation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Interval notation uses brackets like [ and ] for included values, and parentheses like ( and ) for excluded values or infinity. For example, [0, ∞) means all numbers greater than or equal to 0."
        }
      },
      {
        "@type": "Question",
        "name": "What is the domain of f(x) = 1/x?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The domain is all real numbers except x = 0, because dividing by zero is undefined."
        }
      },
      {
        "@type": "Question",
        "name": "Can domain and range be all real numbers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, many functions like basic linear functions (e.g., f(x) = x) or odd-degree polynomials have both a domain and range of all real numbers."
        }
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#131313] dark:text-[#EFEBE9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1 className="text-4xl font-bold text-[#5D4037] dark:text-[#EFEBE9] mb-8">How to Find Domain and Range</h1>
      
      <div className="prose prose-brown dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">What is domain?</h2>
        <p className="mb-6">
          The domain is simply all the valid input values you can put into a function. Usually, these are your x-values. 
          If putting a certain number into the function causes a mathematical error (like dividing by zero), that number is not in the domain.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">What is range?</h2>
        <p className="mb-6">
          The range is all the possible output values the function can give you after you plug in the domain values. 
          Usually, these are your y-values or f(x). It describes how high or low the graph can go.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">Step-by-Step Method</h2>
        <ol className="list-decimal pl-6 mb-8 space-y-4">
          <li>
            <strong>How to find domain:</strong> Start by assuming the domain is all real numbers. Then, look for two main things that restrict the domain:
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Division by zero:</strong> If there's a fraction, set the denominator to zero and solve for x. Exclude those x-values.</li>
              <li><strong>Square roots of negatives:</strong> If there's an even root (like a square root), the expression inside must be greater than or equal to zero.</li>
            </ul>
          </li>
          <li>
            <strong>How to find range:</strong> Look at the outputs of the function for the valid domain. You can graph the function, or look for minimum/maximum values (like a squared number is always ≥ 0).
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">Worked Examples</h2>
        
        <div className="space-y-6 mb-8">
          <div className="bg-[#EFEBE9] dark:bg-[#3E2723]/30 p-6 rounded-xl border border-[#E0E0E0] dark:border-[#3E2723]">
            <h3 className="font-bold text-lg mb-2">Example 1: f(x) = x²</h3>
            <p><strong>Domain:</strong> All real numbers (-∞, ∞). You can square any number.</p>
            <p><strong>Range:</strong> y ≥ 0 or [0, ∞). When you square a real number, the result is never negative.</p>
          </div>

          <div className="bg-[#EFEBE9] dark:bg-[#3E2723]/30 p-6 rounded-xl border border-[#E0E0E0] dark:border-[#3E2723]">
            <h3 className="font-bold text-lg mb-2">Example 2: f(x) = 1/x</h3>
            <p><strong>Domain:</strong> x ≠ 0. We cannot divide by zero.</p>
            <p><strong>Range:</strong> y ≠ 0. The fraction 1/x can never equal 0.</p>
          </div>

          <div className="bg-[#EFEBE9] dark:bg-[#3E2723]/30 p-6 rounded-xl border border-[#E0E0E0] dark:border-[#3E2723]">
            <h3 className="font-bold text-lg mb-2">Example 3: f(x) = √x</h3>
            <p><strong>Domain:</strong> x ≥ 0 or [0, ∞). We cannot take the square root of a negative number in real numbers.</p>
            <p><strong>Range:</strong> y ≥ 0 or [0, ∞). The principal square root is always non-negative.</p>
          </div>
        </div>
      </div>

      <div className="my-12">
        <h2 className="text-xl font-bold mb-4 text-[#5D4037] dark:text-[#EFEBE9]">Try it: Graph the examples above to see domain and range visually</h2>
        <div className="h-[700px] border border-[#E0E0E0] dark:border-[#3E2723] rounded-2xl overflow-hidden bg-white dark:bg-[#131313]">
          <GraphModuleClient />
        </div>
      </div>

      <div className="prose prose-brown dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mb-6 text-[#3E2723] dark:text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">What is domain in maths?</h3>
            <p>The domain is the complete set of all possible input values (usually the x-values) for which the function is defined and produces a real output.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">What is range in maths?</h3>
            <p>The range is the complete set of all possible output values (usually the y-values or f(x)) that a function can produce from its domain.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">How do you write domain in interval notation?</h3>
            <p>Interval notation uses brackets like [ and ] for included values, and parentheses like ( and ) for excluded values or infinity. For example, [0, ∞) means all numbers greater than or equal to 0.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">What is the domain of f(x) = 1/x?</h3>
            <p>The domain is all real numbers except x = 0, because dividing by zero is undefined.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Can domain and range be all real numbers?</h3>
            <p>Yes, many functions like basic linear functions (e.g., f(x) = x) or odd-degree polynomials have both a domain and range of all real numbers.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4 text-[#3E2723] dark:text-white">Related Articles</h2>
        <ul className="list-none pl-0 space-y-3">
          <li>
            <Link href="/learn/what-is-a-function" className="text-[#5D4037] dark:text-[#EFEBE9] hover:underline font-medium">
              What is a Function?
            </Link>
          </li>
          <li>
            <Link href="/learn/how-to-graph-a-quadratic-function" className="text-[#5D4037] dark:text-[#EFEBE9] hover:underline font-medium">
              How to Graph a Quadratic Function
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
