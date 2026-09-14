import { solvePolynomial, solveSystem, solveInequality } from '../../src/lib/math/solver';
import { solveDerivative, solveIntegral } from '../../src/lib/math/calculusSolver';
import { solveODE } from '../../src/lib/math/odeSolver';

import * as fs from 'fs';

function main() {
  let category = '';
  let payload: any = null;

  const args = process.argv.slice(2);
  if (args.length >= 2) {
    category = args[0];
    try {
      payload = JSON.parse(args[1]);
    } catch {
      // Could be base64 encoded
      try {
        payload = JSON.parse(Buffer.from(args[1], 'base64').toString('utf-8'));
      } catch {
        // fall through
      }
    }
  }

  if (!payload) {
    try {
      const inputRaw = fs.readFileSync(0, 'utf-8').trim();
      if (inputRaw) {
        const parsed = JSON.parse(inputRaw);
        category = parsed.category;
        payload = parsed.payload;
      }
    } catch {
      // ignore
    }
  }

  if (!category || !payload) {
    console.error(JSON.stringify({ error: "No valid input provided" }));
    process.exit(1);
  }

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
    } else if (category === "ode") {
      result = solveODE(payload.input);
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
