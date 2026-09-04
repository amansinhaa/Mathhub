import Link from 'next/link';
import GraphModuleClient from '@/components/shared/GraphModuleClient';


export const revalidate = false;

export const metadata = {
  title: 'How to Graph a Quadratic Function — Step-by-Step | EasyEquate',
  description: 'Learn how to graph a quadratic function step by step. Find the vertex, axis of symmetry, and x-intercepts with worked examples and a live graphing tool.',
  alternates: {
    canonical: '/learn/how-to-graph-a-quadratic-function'
  }
};

export default function HowToGraphAQuadraticFunction() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What shape does a quadratic function make?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A quadratic function forms a U-shaped curve called a parabola. If 'a' is positive, it opens upwards. If 'a' is negative, it opens downwards."
        }
      },
      {
        "@type": "Question",
        "name": "How do you find the vertex of a parabola?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The x-coordinate of the vertex is found using the formula x = -b / (2a). Then, plug this x-value back into the original function to find the y-coordinate."
        }
      },
      {
        "@type": "Question",
        "name": "What is the axis of symmetry?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The axis of symmetry is the vertical line that divides the parabola exactly in half. It passes through the vertex and its equation is x = -b / (2a)."
        }
      },
      {
        "@type": "Question",
        "name": "How do you find x-intercepts of a quadratic?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can find x-intercepts (also called roots or zeros) by setting y = 0 and solving for x. You can solve by factoring, completing the square, or using the quadratic formula."
        }
      },
      {
        "@type": "Question",
        "name": "Does a² + bx + c always have two roots?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Depending on the discriminant (b² - 4ac), a quadratic can have two real roots, one real root (if the vertex touches the x-axis), or no real roots (if it never crosses the x-axis)."
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
      <h1 className="text-4xl font-bold text-[#5D4037] dark:text-[#EFEBE9] mb-8">How to Graph a Quadratic Function</h1>
      
      <div className="prose prose-brown dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">What is a quadratic function?</h2>
        <p className="mb-6">
          A quadratic function is a mathematical function that can be written in the standard form <strong>f(x) = ax² + bx + c</strong> (where a is not zero). 
          When you graph it, it creates a smooth, U-shaped curve called a parabola.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">Key Features to Identify</h2>
        <ul className="list-disc pl-6 mb-8 space-y-2">
          <li><strong>Vertex:</strong> The lowest or highest point on the parabola (the turning point).</li>
          <li><strong>Axis of Symmetry:</strong> The invisible vertical line passing through the vertex that splits the parabola into two mirror images.</li>
          <li><strong>x-intercepts (roots):</strong> The points where the parabola crosses the x-axis.</li>
          <li><strong>y-intercept:</strong> The point where the parabola crosses the y-axis.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">Step-by-Step Method</h2>
        <ol className="list-decimal pl-6 mb-8 space-y-4">
          <li>
            <strong>Find the vertex:</strong> Use the formula <strong>x = -b / (2a)</strong> to find the x-coordinate. Then plug that x back into the equation to find the y-coordinate.
          </li>
          <li>
            <strong>Find the y-intercept:</strong> Substitute 0 for x. The y-intercept is simply the 'c' value in the standard form.
          </li>
          <li>
            <strong>Find the x-intercepts:</strong> Set f(x) = 0 and solve using the quadratic formula, factoring, or completing the square.
          </li>
          <li>
            <strong>Plot and draw:</strong> Plot these key points on a graph and draw a smooth U-shaped curve connecting them, making sure it is symmetric around the axis of symmetry.
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4 text-[#3E2723] dark:text-white">Worked Example</h2>
        
        <div className="bg-[#EFEBE9] dark:bg-[#3E2723]/30 p-6 rounded-xl border border-[#E0E0E0] dark:border-[#3E2723] mb-8">
          <h3 className="font-bold text-lg mb-4">Graph f(x) = x² - 4x + 3</h3>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>Vertex:</strong> Here, a = 1, b = -4, c = 3.<br />
              x = -(-4) / (2 * 1) = 4 / 2 = 2.<br />
              Plug in x = 2: y = (2)² - 4(2) + 3 = 4 - 8 + 3 = -1.<br />
              <strong>Vertex is at (2, -1).</strong>
            </li>
            <li>
              <strong>y-intercept:</strong> Plug in x = 0.<br />
              y = 3.<br />
              <strong>y-intercept is at (0, 3).</strong>
            </li>
            <li>
              <strong>x-intercepts:</strong> Set x² - 4x + 3 = 0.<br />
              This factors to (x - 3)(x - 1) = 0.<br />
              So x = 3 and x = 1.<br />
              <strong>x-intercepts are at (1, 0) and (3, 0).</strong>
            </li>
          </ol>
        </div>
      </div>

      <div className="my-12">
        <h2 className="text-xl font-bold mb-4 text-[#5D4037] dark:text-[#EFEBE9]">Try it: Graph x² - 4x + 3 to see the parabola</h2>
        <div className="h-[700px] border border-[#E0E0E0] dark:border-[#3E2723] rounded-2xl overflow-hidden bg-white dark:bg-[#131313]">
          <GraphModuleClient />
        </div>
      </div>

      <div className="prose prose-brown dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mb-6 text-[#3E2723] dark:text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">What shape does a quadratic function make?</h3>
            <p>A quadratic function forms a U-shaped curve called a parabola. If 'a' is positive, it opens upwards. If 'a' is negative, it opens downwards.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">How do you find the vertex of a parabola?</h3>
            <p>The x-coordinate of the vertex is found using the formula x = -b / (2a). Then, plug this x-value back into the original function to find the y-coordinate.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">What is the axis of symmetry?</h3>
            <p>The axis of symmetry is the vertical line that divides the parabola exactly in half. It passes through the vertex and its equation is x = -b / (2a).</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">How do you find x-intercepts of a quadratic?</h3>
            <p>You can find x-intercepts (also called roots or zeros) by setting y = 0 and solving for x. You can solve by factoring, completing the square, or using the quadratic formula.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Does a² + bx + c always have two roots?</h3>
            <p>No. Depending on the discriminant (b² - 4ac), a quadratic can have two real roots, one real root (if the vertex touches the x-axis), or no real roots (if it never crosses the x-axis).</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4 text-[#3E2723] dark:text-white">Related Resources</h2>
        <ul className="list-none pl-0 space-y-3">
          <li>
            <Link href="/learn/what-is-a-function" className="text-[#5D4037] dark:text-[#EFEBE9] hover:underline font-medium">
              What is a Function?
            </Link>
          </li>
          <li>
            <Link href="/learn/how-to-find-domain-and-range" className="text-[#5D4037] dark:text-[#EFEBE9] hover:underline font-medium">
              How to Find Domain and Range
            </Link>
          </li>
          <li>
            <Link href="/quadratic-equation-solver" className="text-[#5D4037] dark:text-[#EFEBE9] hover:underline font-medium">
              Quadratic Equation Solver
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
