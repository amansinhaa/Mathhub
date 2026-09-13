"""
Mock Solver Adapter
Generates realistic solver outputs to test the accuracy testing harness end-to-end.
"""

import time
from typing import Any, Dict, List
from adapters.base import BaseAdapter, SolverOutput
from oracle import SympyOracle

class MockAdapter(BaseAdapter):
    """
    Mock adapter that simulates solver output.
    Mostly produces ground-truth answers from SymPy with solver formatting,
    with a few intentional edge-case bugs to verify diagnostic failure detection.
    """

    def __init__(self, failure_rate: float = 0.05):
        self.failure_rate = failure_rate
        # Intentional bug cases to test that the reporting and diagnostics catch errors
        self.intentional_bugs = {
            "rat_04": SolverOutput(
                case_id="rat_04",
                input_text="(x^2 - 1)/(x - 1) = 2",
                raw_answer="x = 1",
                equation_type="polynomial",  # BUG: mislabeled as polynomial, didn't exclude hole
                parsed_roots=[1.0]
            ),
            "rad_02": SolverOutput(
                case_id="rad_02",
                input_text="sqrt(2x - 1) = x - 2",
                raw_answer="x = 1, \\quad x = 5",
                equation_type="radical",  # BUG: failed to discard extraneous root x = 1
                parsed_roots=[1.0, 5.0]
            ),
            "ineq_03": SolverOutput(
                case_id="ineq_03",
                input_text="-3x + 9 > 0",
                raw_answer="x > 3",
                equation_type="inequality",  # BUG: forgot to flip inequality sign on negative division
                parsed_roots=[]
            )
        }

    def solve(self, case: Dict[str, Any], category: str) -> SolverOutput:
        start_t = time.perf_counter()
        case_id = case.get("id", "")

        # Check intentional bugs
        if case_id in self.intentional_bugs:
            bug_output = self.intentional_bugs[case_id]
            bug_output.execution_time_ms = round((time.perf_counter() - start_t) * 1000, 2)
            return bug_output

        # Otherwise synthesize realistic output from SymPy oracle
        try:
            oracle_res = SympyOracle.solve_case(case, category)
            elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
            res_type = oracle_res.result_type

            if res_type == "no_solution":
                return SolverOutput(
                    case_id=case_id,
                    input_text=case["input"],
                    raw_answer="No real solution",
                    equation_type=category,
                    parsed_roots=[],
                    execution_time_ms=elapsed_ms
                )
            elif res_type == "all_reals":
                return SolverOutput(
                    case_id=case_id,
                    input_text=case["input"],
                    raw_answer="All real numbers",
                    equation_type=category,
                    parsed_roots=[],
                    execution_time_ms=elapsed_ms
                )
            elif res_type == "system":
                sols = oracle_res.details.get("solutions", [])
                return SolverOutput(
                    case_id=case_id,
                    input_text=case["input"],
                    raw_answer=oracle_res.latex_str,
                    equation_type="system",
                    parsed_solutions=sols,
                    execution_time_ms=elapsed_ms
                )
            elif res_type == "interval":
                return SolverOutput(
                    case_id=case_id,
                    input_text=case["input"],
                    raw_answer=oracle_res.latex_str,
                    equation_type="inequality",
                    execution_time_ms=elapsed_ms
                )
            elif res_type == "expression":
                ans_str = oracle_res.latex_str
                return SolverOutput(
                    case_id=case_id,
                    input_text=case["input"],
                    raw_answer=ans_str,
                    equation_type=category,
                    execution_time_ms=elapsed_ms
                )
            else:
                # Set of roots
                roots = oracle_res.ground_truth
                root_strs = [str(r) for r in roots] if isinstance(roots, (list, tuple, set)) else [str(roots)]
                raw_ans = ", ".join(f"x = {r}" for r in root_strs)
                return SolverOutput(
                    case_id=case_id,
                    input_text=case["input"],
                    raw_answer=raw_ans,
                    equation_type=category,
                    parsed_roots=root_strs,
                    execution_time_ms=elapsed_ms
                )
        except Exception as e:
            elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
            return SolverOutput(
                case_id=case_id,
                input_text=case["input"],
                raw_answer="Error",
                equation_type=category,
                status="error",
                error_message=str(e),
                execution_time_ms=elapsed_ms
            )
