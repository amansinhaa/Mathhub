import Link from 'next/link';
import GraphModuleClient from '@/components/shared/GraphModuleClient';


export const revalidate = false;

export const metadata = {
  title: 'What is a Function? — Definition, Examples & Graph | EasyEquate',
  description: 'Learn what a function is in maths with simple examples, domain & range explained, and a live interactive graph you can try yourself. Free guide.',
  alternates: {
    canonical: '/learn/what-is-a-function'
  }
};

export default function WhatIsAFunction() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a function in simple terms?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In simple terms, a function is like a machine that takes an input, applies a rule to it, and gives exactly one output."
        }
      },
      {
        "@type": "Question",
        "name": "What is f(x) notation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "f(x) is pronounced 'f of x'. It is a way to name a function (f) and specify its input variable (x). It replaces 'y' in equations."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between a function and an equation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An equation shows that two things are equal, while a function is a specific relationship where every input has exactly one output."
        }
      },
      {
        "@type": "Question",
        "name": "Can a function have two outputs for one input?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. By definition, a true mathematical function must have exactly one output for each valid input."
        }
      },
      {
        "@type": "Question",
        "name": "What is the domain of a function?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The domain of a function is the complete set of all possible input values (usually x-values) that will make the function work."
        }
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 text-[#131313] dark:text-[#EFEBE9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1 className="text-2xl sm:text-3xl font-bold text-[#5D4037] dark:text-[#EFEBE9] mb-4">What is a Function?</h1>
      
      <div className="prose prose-brown dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">Definition</h2>
        <p className="mb-4">
          A function is a mathematical relationship where each input has exactly one output. 
          Think of it like a machine: you put a number in, the machine applies a specific rule, and it spits exactly one number out. 
          If you put the same number in again, you will always get the same output.
        </p>
        <p className="mb-6 bg-[#EFEBE9] dark:bg-[#3E2723] p-4 rounded-lg font-mono">
          f(x)
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">Everyday Examples</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Temperature over time:</strong> At any specific moment in time (input), there is exactly one temperature (output) in your city.</li>
          <li><strong>Speed and distance:</strong> If you drive at a constant speed, the distance you travel (output) is a function of the time you spend driving (input).</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">The Vertical Line Test</h2>
        <p className="mb-8">
          When you look at a graph, there's an easy way to check if it represents a function. It's called the Vertical Line Test.
          If you can draw a perfectly vertical line anywhere on the graph and it only crosses the line or curve exactly once, then it is a function. 
          If the vertical line crosses the shape two or more times, it is not a function.
        </p>
      </div>

      <div className="my-12">
        <h2 className="text-xl font-bold mb-4 text-[#5D4037] dark:text-[#EFEBE9]">Try it: Graph f(x) = 2x + 1 below</h2>
        <div className="h-[700px] border border-[#E0E0E0] dark:border-[#3E2723] rounded-2xl overflow-hidden bg-white dark:bg-[#131313]">
          <GraphModuleClient />
        </div>
      </div>

      <div className="prose prose-brown dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mb-6 text-[#3E2723] dark:text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">What is a function in simple terms?</h3>
            <p>In simple terms, a function is like a machine that takes an input, applies a rule to it, and gives exactly one output.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">What is f(x) notation?</h3>
            <p>f(x) is pronounced &quot;f of x&quot;. It is a way to name a function (f) and specify its input variable (x). It replaces &quot;y&quot; in equations.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">What is the difference between a function and an equation?</h3>
            <p>An equation shows that two things are equal, while a function is a specific relationship where every input has exactly one output.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Can a function have two outputs for one input?</h3>
            <p>No. By definition, a true mathematical function must have exactly one output for each valid input.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">What is the domain of a function?</h3>
            <p>The domain of a function is the complete set of all possible input values (usually x-values) that will make the function work.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4 text-[#3E2723] dark:text-white">Related Articles</h2>
        <ul className="list-none pl-0 space-y-3">
          <li>
            <Link href="/learn/how-to-find-domain-and-range" className="text-[#5D4037] dark:text-[#EFEBE9] hover:underline font-medium">
              How to Find Domain and Range
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
