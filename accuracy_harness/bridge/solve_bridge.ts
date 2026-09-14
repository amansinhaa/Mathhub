import { solvePolynomial, solveSystem, solveInequality } from '../../src/lib/math/solver';
import { solveDerivative, solveIntegral } from '../../src/lib/math/calculusSolver';
import { solveODE } from '../../src/lib/math/odeSolver';
import { solveMatrix } from '../../src/lib/math/matrixSolver';
import { evaluateExpression } from '../../src/lib/math/evaluator';
import { convertUnit } from '../../src/lib/math/units';
import { gcd } from '../../src/lib/math/stepGenerator';

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
    } else if (category === "systems" || category === "systems_linear" || category === "systems_nonlinear") {
      result = solveSystem(payload.input, payload.variables || ["x", "y"]);
    } else if (category === "inequalities") {
      result = solveInequality(payload.input);
    } else if (category === "ode") {
      result = solveODE(payload.input);
    } else if (category === "matrix") {
      const matRes = solveMatrix(payload.operation, payload.matrixA, payload.matrixB, payload.scalar, payload.matrixC, payload.polyCoeffs);
      result = {
        finalAnswer: typeof matRes.result === "object" ? JSON.stringify(matRes.result) : String(matRes.result),
        equationType: "matrix",
        numericRoots: typeof matRes.result === "number" ? [matRes.result] : [],
        steps: matRes.steps || [],
        matrixOutput: matRes.result
      };
    } else if (category === "scientific_calculator") {
      const evRes = evaluateExpression(payload.input, payload.angleMode || 'RAD');
      result = {
        finalAnswer: evRes.result,
        equationType: "calculator",
        numericRoots: [parseFloat(evRes.result)],
        steps: [{ explanation: "Evaluate expression", math: evRes.latex }]
      };
    } else if (category === "arithmetic_gcd_lcm") {
      const a = Math.round(Number(payload.a));
      const b = Math.round(Number(payload.b));
      const g = gcd(a, b);
      const l = Math.abs(a * b) / g;
      const ans = payload.operation === "lcm" ? l : g;
      result = {
        finalAnswer: String(ans),
        equationType: "arithmetic",
        numericRoots: [ans],
        steps: []
      };
    } else if (category === "unit_converter") {
      const conv = convertUnit(Number(payload.value), payload.fromUnit, payload.toUnit);
      result = {
        finalAnswer: String(conv),
        equationType: "unit_converter",
        numericRoots: [conv],
        steps: []
      };
    } else if (category === "arithmetic_scientific") {
      if (payload.subtype === "gcd" || payload.subtype === "lcm" || payload.operation === "gcd" || payload.operation === "lcm") {
        const a = Math.round(Number(payload.a));
        const b = Math.round(Number(payload.b));
        const g = gcd(a, b);
        const l = Math.abs(a * b) / g;
        const ans = (payload.operation === "lcm" || payload.subtype === "lcm") ? l : g;
        result = {
          finalAnswer: String(ans),
          equationType: "arithmetic",
          numericRoots: [ans],
          steps: []
        };
      } else if (payload.subtype === "unit" || payload.fromUnit) {
        const conv = convertUnit(Number(payload.value), payload.fromUnit, payload.toUnit);
        result = {
          finalAnswer: String(conv),
          equationType: "unit_converter",
          numericRoots: [conv],
          steps: []
        };
      } else {
        const evRes = evaluateExpression(payload.input, payload.angleMode || 'RAD');
        result = {
          finalAnswer: evRes.result,
          equationType: "calculator",
          numericRoots: [parseFloat(evRes.result)],
          steps: [{ explanation: "Evaluate expression", math: evRes.latex }]
        };
      }
    } else {
      // linear, quadratic, cubic_quartic, rational, radical, trigonometric, exponential_logarithmic, edge_cases
      result = solvePolynomial(payload.input);
    }

    console.log(JSON.stringify({
      finalAnswer: result.finalAnswer || "",
      equationType: result.equationType || result.type || "",
      numericRoots: result.numericRoots || [],
      steps: result.steps || [],
      matrixOutput: result.matrixOutput
    }));
  } catch (err: any) {
    console.error(JSON.stringify({ error: err.message || String(err) }));
    process.exit(1);
  }
}

main();
