import { solvePolynomial, solveSystem, solveInequality } from '../../src/lib/math/solver';
import { solveDerivative, solveIntegral } from '../../src/lib/math/calculusSolver';

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(JSON.stringify({ error: "No input provided" }));
    process.exit(1);
  }

  const category = args[0];
  const payload = JSON.parse(args[1]);

  try {
    let result: any = null;

    if (category === "derivatives") {
      result = solveDerivative(payload.input, payload.variable || "x");
    } else if (category === "integrals") {
      if (payload.type === "definite") {
        result = solveIntegral(payload.input, payload.variable || "x", payload.lower, payload.upper);
      } else {
        result = solveIntegral(payload.input, payload.variable || "x");
      }
    } else if (category === "systems") {
      result = solveSystem(payload.input, payload.variables || ["x", "y"]);
    } else if (category === "inequalities") {
      result = solveInequality(payload.input);
    } else {
      // polynomial, rational, radical, trigonometric, exponential_logarithmic, edge_cases
      result = solvePolynomial(payload.input);
    }

    console.log(JSON.stringify({
      finalAnswer: result.finalAnswer || "",
      equationType: result.equationType || result.type || "",
      numericRoots: result.numericRoots || [],
      steps: result.steps || []
    }));
  } catch (err: any) {
    console.error(JSON.stringify({ error: err.message || String(err) }));
    process.exit(1);
  }
}

main();
