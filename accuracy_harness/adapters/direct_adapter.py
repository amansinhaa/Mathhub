"""
Direct TypeScript Solver Adapter
Executes the website's native TypeScript solver via the solve_bridge.ts Node script.
"""

import json
import os
import subprocess
import time
from typing import Any, Dict
from adapters.base import BaseAdapter, SolverOutput

class DirectAdapter(BaseAdapter):
    """Invokes the site's TypeScript solver directly in milliseconds."""

    def __init__(self, root_dir: str = "."):
        self.root_dir = root_dir
        self.bridge_path = os.path.join(root_dir, "accuracy_harness", "bridge", "solve_bridge.ts")
        
        # Determine tsx executable path (Windows .cmd vs Unix)
        win_tsx = os.path.join(root_dir, "node_modules", ".bin", "tsx.cmd")
        unix_tsx = os.path.join(root_dir, "node_modules", ".bin", "tsx")
        if os.path.exists(win_tsx):
            self.tsx_cmd = win_tsx
        elif os.path.exists(unix_tsx):
            self.tsx_cmd = unix_tsx
        else:
            self.tsx_cmd = "npx tsx"

    def solve(self, case: Dict[str, Any], category: str) -> SolverOutput:
        start_t = time.perf_counter()
        case_id = case.get("id", "")
        import base64
        payload_b64 = base64.b64encode(json.dumps(case).encode('utf-8')).decode('ascii')

        try:
            cmd = [self.tsx_cmd, self.bridge_path, category, payload_b64]
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=self.root_dir,
                timeout=15,
                shell=True if os.name == 'nt' else False
            )
            elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)

            if proc.returncode != 0:
                err_text = proc.stderr.strip() or proc.stdout.strip()
                return SolverOutput(
                    case_id=case_id,
                    input_text=case.get("input"),
                    raw_answer="",
                    equation_type="",
                    status="error",
                    error_message=err_text,
                    execution_time_ms=elapsed_ms
                )

            data = json.loads(proc.stdout)
            return SolverOutput(
                case_id=case_id,
                input_text=case.get("input"),
                raw_answer=data.get("finalAnswer", ""),
                equation_type=data.get("equationType", ""),
                parsed_roots=data.get("numericRoots", []),
                steps=data.get("steps", []),
                matrix_output=data.get("matrixOutput"),
                status="success",
                execution_time_ms=elapsed_ms
            )
        except Exception as e:
            elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
            return SolverOutput(
                case_id=case_id,
                input_text=case.get("input"),
                raw_answer="",
                equation_type="",
                status="error",
                error_message=str(e),
                execution_time_ms=elapsed_ms
            )
