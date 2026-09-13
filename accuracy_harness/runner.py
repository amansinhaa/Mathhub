"""
Accuracy Test Suite Runner
Orchestrates test execution across the SymPy Oracle, adapters, and reporting engine.
"""

import argparse
import json
import os
import sys
from typing import Any, Dict, List

# Ensure accuracy_harness directory is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from oracle import SympyOracle
from comparator import SymbolicComparator
from reporter import Reporter
from adapters.mock_adapter import MockAdapter
from adapters.direct_adapter import DirectAdapter

def load_test_bank(path: str) -> Dict[str, List[Dict[str, Any]]]:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Test cases file not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def run_suite(
    mode: str = "mock",
    category_filter: str = None,
    cases_path: str = None,
    output_json: str = "accuracy_report.json",
    base_url: str = "http://localhost:4321",
    fail_on_error: bool = False
) -> int:
    if not cases_path:
        cases_path = os.path.join(SCRIPT_DIR, "test_cases.json")

    bank = load_test_bank(cases_path)

    # Instantiate adapter
    if mode == "mock":
        adapter = MockAdapter()
    elif mode == "direct":
        root_dir = os.path.dirname(SCRIPT_DIR)
        adapter = DirectAdapter(root_dir=root_dir)
    elif mode == "browser":
        from adapters.browser_adapter import BrowserAdapter
        adapter = BrowserAdapter(base_url=base_url)
    else:
        raise ValueError(f"Unknown mode: {mode}. Choose mock, direct, or browser.")

    results: List[Dict[str, Any]] = []

    categories = [category_filter] if category_filter else list(bank.keys())

    for cat in categories:
        if cat not in bank:
            print(f"Warning: Category '{cat}' not found in test bank. Skipping.")
            continue

        cases = bank[cat]
        for case in cases:
            case_id = case.get("id", "")
            var_name = case.get("variable", "x")

            # 1. SymPy Ground-Truth Oracle
            try:
                oracle_res = SympyOracle.solve_case(case, cat)
            except Exception as e:
                print(f"Oracle error for case {case_id}: {e}")
                continue

            # 2. Run solver via adapter
            solver_res = adapter.solve(case, cat)

            # 3. Symbolic Comparison
            comp_res = SymbolicComparator.compare(oracle_res, solver_res, variable=var_name)

            results.append({
                "case": case,
                "category": cat,
                "oracle": oracle_res.to_dict(),
                "solver": solver_res.to_dict(),
                "comparison": comp_res.to_dict()
            })

    # Close browser if used
    if mode == "browser" and hasattr(adapter, "close"):
        adapter.close()

    # Output reports
    Reporter.print_cli_report(results, mode=mode)
    json_path = Reporter.save_json_report(results, mode=mode, output_path=output_json)
    print(f"\nMachine-readable report saved to: {json_path}")

    failed_count = sum(1 for r in results if not r["comparison"]["passed"])
    if fail_on_error and failed_count > 0:
        return 1
    return 0

def main():
    parser = argparse.ArgumentParser(description="EasyEquate Automated Math Accuracy Testing Harness")
    parser.add_argument("--mode", choices=["mock", "direct", "browser"], default="mock",
                        help="Solver adapter mode: mock (simulated baseline), direct (Node TS solver), or browser (Playwright UI)")
    parser.add_argument("--category", type=str, default=None,
                        help="Run only a specific category (e.g. polynomial, rational, radical, etc.)")
    parser.add_argument("--cases", type=str, default=None,
                        help="Path to custom test_cases.json file")
    parser.add_argument("--report", type=str, default="accuracy_report.json",
                        help="Path to output accuracy_report.json file")
    parser.add_argument("--url", "--base-url", dest="url", type=str, default="http://localhost:4321",
                        help="Base URL of live website for browser mode")
    parser.add_argument("--strict", action="store_true",
                        help="Exit with non-zero code if any test fails (for CI)")

    args = parser.parse_args()
    exit_code = run_suite(
        mode=args.mode,
        category_filter=args.category,
        cases_path=args.cases,
        output_json=args.report,
        base_url=args.url,
        fail_on_error=args.strict
    )
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
