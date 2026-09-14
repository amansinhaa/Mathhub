"""
Accuracy Test Reporter
Outputs a clean visual CLI report and exports machine-readable accuracy_report.json.
"""

from datetime import datetime
import json
import os
import sys
from typing import Any, Dict, List

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

class Reporter:
    """Generates CLI report tables and structured JSON artifact logs."""

    @staticmethod
    def print_cli_report(results: List[Dict[str, Any]], mode: str) -> None:
        total = len(results)
        passed = sum(1 for r in results if r["comparison"]["passed"])
        failed = total - passed
        pass_rate = (passed / total * 100) if total > 0 else 0.0

        # Category aggregates
        cat_stats: Dict[str, Dict[str, int]] = {}
        for r in results:
            cat = r["category"]
            if cat not in cat_stats:
                cat_stats[cat] = {"total": 0, "passed": 0, "failed": 0}
            cat_stats[cat]["total"] += 1
            if r["comparison"]["passed"]:
                cat_stats[cat]["passed"] += 1
            else:
                cat_stats[cat]["failed"] += 1

        print("\n" + "=" * 80)
        print(f" MATH CALCULATOR ACCURACY AUDIT REPORT  [{mode.upper()} MODE]")
        print(f" Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        print(f" Overall Score: {passed}/{total} Passed ({pass_rate:.1f}%) | Failures: {failed}")
        print("-" * 80)
        print(f" {'CATEGORY':<26} | {'TOTAL':<6} | {'PASS':<6} | {'FAIL':<6} | {'RATE':<8} | {'STATUS'}")
        print("-" * 80)

        for cat, stats in sorted(cat_stats.items()):
            c_rate = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0.0
            status_indicator = "[PASS]" if stats["failed"] == 0 else "[FAIL]"
            print(f" {cat:<26} | {stats['total']:<6} | {stats['passed']:<6} | {stats['failed']:<6} | {c_rate:>5.1f}%  | {status_indicator}")

        print("=" * 80)

        # Failure details
        failures = [r for r in results if not r["comparison"]["passed"]]
        if failures:
            print("\n" + "!" * 80)
            print(f" DETAILED FAILURE DIAGNOSTICS ({len(failures)} Issues Found)")
            print("!" * 80)

            for i, f in enumerate(failures, 1):
                case = f["case"]
                oracle = f["oracle"]
                solver = f["solver"]
                comp = f["comparison"]

                print(f"\n[{i}] Case: {case.get('id')} ({f['category']} / {case.get('subtype', 'generic')})")
                print(f"    Input:            {case.get('input')}")
                print(f"    Expected (SymPy): {comp.get('expected')}")
                print(f"    Actual (Solver):  {solver.get('raw_answer') or comp.get('actual')}")
                if solver.get("equation_type"):
                    print(f"    UI Type Label:    {solver.get('equation_type')}")
                print(f"    Failure Reason:   {comp.get('reason')}")
            print("\n" + "=" * 80)
        else:
            print("\n ALL TEST CASES PASSED WITH SYMBOLIC EQUIVALENCE!\n" + "=" * 80)

    @staticmethod
    def save_json_report(results: List[Dict[str, Any]], mode: str, output_path: str = "accuracy_report.json") -> str:
        total = len(results)
        passed = sum(1 for r in results if r["comparison"]["passed"])
        failed = total - passed
        pass_rate = round((passed / total * 100), 2) if total > 0 else 0.0

        report_data = {
            "timestamp": datetime.now().isoformat(),
            "mode": mode,
            "summary": {
                "total": total,
                "passed": passed,
                "failed": failed,
                "pass_rate_percent": pass_rate
            },
            "results": results
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, default=str)

        return os.path.abspath(output_path)
