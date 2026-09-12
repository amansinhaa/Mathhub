/**
 * Web Worker for Pyodide & SymPy CAS Ground Truth Verification
 * Runs in a dedicated background worker to ensure zero main-thread blocking.
 */

let pyodideInstance = null;
let initPromise = null;

async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
      const pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
      });
      await pyodide.loadPackage("micropip");
      const micropip = pyodide.pyimport("micropip");
      await micropip.install("sympy");
      await pyodide.runPythonAsync(`
import sympy
from sympy import symbols, Eq, solve, simplify, factor, expand, latex, diff, integrate
`);
      pyodideInstance = pyodide;
      return pyodide;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

self.onmessage = async (e) => {
  const { id, type, payload } = e.data || {};
  if (!id) return;

  try {
    const py = await getPyodide();

    if (type === 'PING') {
      self.postMessage({ id, type: 'PONG', success: true });
      return;
    }

    if (type === 'SOLVE') {
      const { equation, variable = 'x' } = payload || {};
      py.globals.set('eq_str', String(equation));
      py.globals.set('var_str', String(variable));

      const code = `
try:
    var_sym = sympy.Symbol(var_str)
    eq_in = eq_str.strip()
    if '=' in eq_in:
        lhs, rhs = eq_in.split('=', 1)
        target_eq = sympy.Eq(sympy.sympify(lhs), sympy.sympify(rhs))
    else:
        target_eq = sympy.Eq(sympy.sympify(eq_in), 0)
    sols = sympy.solve(target_eq, var_sym)
    res_latex = [sympy.latex(s) for s in sols]
    res_numeric = []
    for s in sols:
        try:
            val = float(s.evalf())
            if not sympy.isnan(val) and s != sympy.zoo:
                res_numeric.append(val)
        except Exception:
            pass
    out_res = {
        'latex': ', '.join([f"{var_str} = {l}" for l in res_latex]),
        'solutions': res_latex,
        'numeric': res_numeric,
        'count': len(sols)
    }
except Exception as err:
    out_res = {'error': str(err)}
`;
      await py.runPythonAsync(code);
      const res = py.globals.get('out_res').toJs({ dict_converter: Object.fromEntries });
      if (res.error) {
        self.postMessage({ id, success: false, error: res.error });
      } else {
        self.postMessage({ id, success: true, data: res });
      }
      return;
    }

    if (type === 'SIMPLIFY') {
      const { expression } = payload || {};
      py.globals.set('expr_str', String(expression));
      const code = `
try:
    simp = sympy.simplify(sympy.sympify(expr_str))
    out_res = {'latex': sympy.latex(simp), 'ascii': str(simp)}
except Exception as err:
    out_res = {'error': str(err)}
`;
      await py.runPythonAsync(code);
      const res = py.globals.get('out_res').toJs({ dict_converter: Object.fromEntries });
      self.postMessage({ id, success: !res.error, data: res, error: res.error });
      return;
    }

    if (type === 'VERIFY') {
      const { equation, roots = [], variable = 'x' } = payload || {};
      py.globals.set('eq_str', String(equation));
      py.globals.set('var_str', String(variable));
      py.globals.set('roots_in', roots);
      const code = `
try:
    var_sym = sympy.Symbol(var_str)
    eq_in = eq_str.strip()
    if '=' in eq_in:
        lhs, rhs = eq_in.split('=', 1)
        expr_to_eval = sympy.sympify(lhs) - sympy.sympify(rhs)
    else:
        expr_to_eval = sympy.sympify(eq_in)
    verified = []
    for r in roots_in:
        try:
            val = expr_to_eval.subs(var_sym, r).evalf()
            verified.append(abs(float(val)) < 1e-4)
        except Exception:
            verified.append(False)
    out_res = {'verified': verified, 'allValid': len(verified) > 0 and all(verified)}
except Exception as err:
    out_res = {'error': str(err), 'verified': [], 'allValid': False}
`;
      await py.runPythonAsync(code);
      const res = py.globals.get('out_res').toJs({ dict_converter: Object.fromEntries });
      self.postMessage({ id, success: !res.error, data: res, error: res.error });
      return;
    }

    self.postMessage({ id, success: false, error: 'Unknown action' });
  } catch (err) {
    self.postMessage({ id, success: false, error: err ? err.message || String(err) : 'Unknown worker error' });
  }
};
