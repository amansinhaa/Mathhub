"""
Base Adapter Interface
Abstract interface representing a math solver implementation.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class SolverOutput:
    def __init__(
        self,
        case_id: str,
        input_text: Any,
        raw_answer: str,
        equation_type: str = "",
        parsed_roots: Optional[List[Any]] = None,
        parsed_solutions: Optional[List[Dict[str, Any]]] = None,
        steps: Optional[List[Dict[str, Any]]] = None,
        execution_time_ms: float = 0.0,
        status: str = "success",
        error_message: str = ""
    ):
        self.case_id = case_id
        self.input_text = input_text
        self.raw_answer = raw_answer
        self.equation_type = equation_type
        self.parsed_roots = parsed_roots or []
        self.parsed_solutions = parsed_solutions or []
        self.steps = steps or []
        self.execution_time_ms = execution_time_ms
        self.status = status
        self.error_message = error_message

    def to_dict(self) -> Dict[str, Any]:
        return {
            "case_id": self.case_id,
            "input_text": self.input_text,
            "raw_answer": self.raw_answer,
            "equation_type": self.equation_type,
            "parsed_roots": [str(r) for r in self.parsed_roots],
            "parsed_solutions": self.parsed_solutions,
            "execution_time_ms": self.execution_time_ms,
            "status": self.status,
            "error_message": self.error_message
        }

class BaseAdapter(ABC):
    """Abstract base class for solver adapters."""

    @abstractmethod
    def solve(self, case: Dict[str, Any], category: str) -> SolverOutput:
        """Run the solver on a single test case and return standardized SolverOutput."""
        pass
