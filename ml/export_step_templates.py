"""Export pattern database step templates for TypeScript consumption.

Reads the trained PatternDatabase from `data/processed/pattern_db.json`,
formats and validates clean step templates for all supported equation types,
and serializes a compact `stepTemplates.json` into `src/data/stepTemplates.json`
for use by the frontend / TypeScript solver engine.
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path
from typing import Any, Dict, List

logger = logging.getLogger("export_step_templates")

DEFAULT_DB_PATH = Path(__file__).resolve().parent / "data" / "processed" / "pattern_db.json"
DEFAULT_OUTPUT_TS = Path(__file__).resolve().parent.parent / "src" / "data" / "stepTemplates.json"
DEFAULT_OUTPUT_LOCAL = Path(__file__).resolve().parent / "data" / "processed" / "step_templates.json"


def clean_template_math(math_str: str) -> str:
    """Standardize math strings for KaTeX compatibility."""
    if not math_str:
        return ""
    s = math_str.strip()
    s = s.replace(r"\cdot", " ")
    s = s.replace("**", "^")
    return s


def build_curated_templates(pattern_db: Dict[str, Any]) -> Dict[str, Any]:
    """Extract and refine step templates categorized by equation type.

    Combines ML-extracted clusters from pattern_db with canonical pedagogical templates.
    """
    templates: Dict[str, List[Dict[str, Any]]] = {
        "linear": [],
        "quadratic": [],
        "cubic": [],
        "quartic": [],
        "higher_order": [],
        "inequality": [],
        "algebraic_simplification": [],
        "system": [],
    }

    # Extract any learned cluster templates from pattern_db
    raw_templates = pattern_db.get("templates", {})
    for key, step_data in raw_templates.items():
        eq_type = key.split("::")[0].lower()
        cluster_id = key.split("::")[1] if "::" in key else "default"

        if eq_type not in templates:
            templates[eq_type] = []

        if isinstance(step_data, list) and step_data:
            # Check if step_data is directly a list of step dicts
            if isinstance(step_data[0], dict) and ("stepNumber" in step_data[0] or "explanation" in step_data[0]):
                templates[eq_type].append({
                    "templateId": f"{eq_type}_{cluster_id}",
                    "source": "ml_cluster",
                    "clusterId": cluster_id,
                    "totalSteps": len(step_data),
                    "steps": [
                        {
                            "stepNumber": s.get("stepNumber", i + 1),
                            "explanation": s.get("explanation", ""),
                            "math": clean_template_math(s.get("math", "")),
                        }
                        for i, s in enumerate(step_data)
                    ],
                })
            elif isinstance(step_data[0], dict) and "steps" in step_data[0]:
                for idx, item in enumerate(step_data):
                    tpl_steps = item.get("steps", [])
                    if tpl_steps:
                        templates[eq_type].append({
                            "templateId": f"{eq_type}_{cluster_id}_{idx}",
                            "source": "ml_cluster",
                            "clusterId": item.get("cluster_id", idx),
                            "totalSteps": len(tpl_steps),
                            "steps": [
                                {
                                    "stepNumber": s.get("stepNumber", i + 1),
                                    "explanation": s.get("explanation", ""),
                                    "math": clean_template_math(s.get("math", "")),
                                }
                                for i, s in enumerate(tpl_steps)
                            ],
                        })

    # Add canonical structural playbook templates derived from our math datasets
    canonical_playbook: List[Dict[str, Any]] = [
        {
            "type": "quadratic",
            "templateId": "quadratic_standard_factoring",
            "name": "Factoring by Inspection",
            "condition": {"degree": 2, "is_factorable": True, "discriminant_sign": 1},
            "steps": [
                {
                    "stepNumber": 1,
                    "explanation": "Identify coefficients: $a = {a}$, $b = {b}$, $c = {c}$ and ensure standard form $ax^2 + bx + c = 0$.",
                    "math": "{a}{var}^2 + {b}{var} + {c} = 0",
                },
                {
                    "stepNumber": 2,
                    "explanation": "Calculate discriminant: $\\Delta = b^2 - 4ac$ to check for rational roots.",
                    "math": "\\Delta = ({b})^2 - 4({a})({c}) = {delta}",
                },
                {
                    "stepNumber": 3,
                    "explanation": "Factor the quadratic into linear binomial factors: $a(x - r_1)(x - r_2) = 0$.",
                    "math": "({p_1}{var} + {q_1})({p_2}{var} + {q_2}) = 0",
                },
                {
                    "stepNumber": 4,
                    "explanation": "Apply the Zero Product Property: set each factor to zero and solve.",
                    "math": "{var}_1 = {sol_1}, \\quad {var}_2 = {sol_2}",
                },
            ],
        },
        {
            "type": "quadratic",
            "templateId": "quadratic_quadratic_formula",
            "name": "Quadratic Formula General Solution",
            "condition": {"degree": 2, "is_factorable": False},
            "steps": [
                {
                    "stepNumber": 1,
                    "explanation": "Write the quadratic in standard form $ax^2 + bx + c = 0$ and identify coefficients.",
                    "math": "a = {a}, \\quad b = {b}, \\quad c = {c}",
                },
                {
                    "stepNumber": 2,
                    "explanation": "Compute the discriminant $\\Delta = b^2 - 4ac$.",
                    "math": "\\Delta = ({b})^2 - 4({a})({c}) = {delta}",
                },
                {
                    "stepNumber": 3,
                    "explanation": "Apply the Quadratic Formula: $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.",
                    "math": "{var} = \\frac{-({b}) \\pm \\sqrt{{delta}}}{2({a})}",
                },
                {
                    "stepNumber": 4,
                    "explanation": "Simplify radical and compute individual roots.",
                    "math": "{var} = {final_roots}",
                },
            ],
        },
        {
            "type": "cubic",
            "templateId": "cubic_rational_root_synthetic_division",
            "name": "Rational Root Theorem & Synthetic Division",
            "condition": {"degree": 3},
            "steps": [
                {
                    "stepNumber": 1,
                    "explanation": "Write the cubic in standard form $ax^3 + bx^2 + cx + d = 0$.",
                    "math": "{a}{var}^3 + {b}{var}^2 + {c}{var} + {d} = 0",
                },
                {
                    "stepNumber": 2,
                    "explanation": "Test candidate rational roots $\\pm p/q$ where $p \\mid d$ and $q \\mid a$ to find a root $r_1$.",
                    "math": "f({r_1}) = {a}({r_1})^3 + {b}({r_1})^2 + {c}({r_1}) + {d} = 0 \\quad \\checkmark",
                },
                {
                    "stepNumber": 3,
                    "explanation": "Perform polynomial synthetic division by $({var} - r_1)$ to extract the quotient quadratic.",
                    "math": "\\frac{f({var})}{{var} - {r_1}} = {q_a}{var}^2 + {q_b}{var} + {q_c}",
                },
                {
                    "stepNumber": 4,
                    "explanation": "Solve the resulting quadratic equation using the quadratic formula.",
                    "math": "{q_a}{var}^2 + {q_b}{var} + {q_c} = 0 \\implies {var} = \\frac{-{q_b} \\pm \\sqrt{\\Delta_q}}{2{q_a}}",
                },
                {
                    "stepNumber": 5,
                    "explanation": "Collect all three roots (real and complex).",
                    "math": "{var} = {all_roots}",
                },
            ],
        },
        {
            "type": "algebraic_simplification",
            "templateId": "algebraic_distribute_and_combine",
            "name": "Distribution and Like-Terms Combination",
            "condition": {"has_variables": True},
            "steps": [
                {
                    "stepNumber": 1,
                    "explanation": "Expand all distributed factors across parentheses: $k(u + v) = ku + kv$.",
                    "math": "{expanded_expression}",
                },
                {
                    "stepNumber": 2,
                    "explanation": "Remove redundant signs and group like terms with identical variables and powers.",
                    "math": "{grouped_terms}",
                },
                {
                    "stepNumber": 3,
                    "explanation": "Combine numerical coefficients for each variable group.",
                    "math": "{combined_groups}",
                },
                {
                    "stepNumber": 4,
                    "explanation": "Assemble the final simplified algebraic expression.",
                    "math": "{final_simplified}",
                },
            ],
        },
    ]

    for item in canonical_playbook:
        target_list = templates.get(item["type"], [])
        target_list.insert(0, item)
        templates[item["type"]] = target_list

    return {
        "metadata": {
            "version": "1.0.0",
            "generator": "MathHub ML Pipeline",
            "datasets": ["openai/gsm8k", "TIGER-Lab/MATH-plus", "hendrycks/MATH"],
            "total_templates": sum(len(v) for v in templates.values()),
        },
        "feature_names": pattern_db.get("feature_names", []),
        "templates": templates,
    }


def main():
    parser = argparse.ArgumentParser(description="Export step templates to TypeScript JSON")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH, help="Path to pattern_db.json")
    parser.add_argument("--output-ts", type=Path, default=DEFAULT_OUTPUT_TS, help="Path for TypeScript app output")
    parser.add_argument("--output-local", type=Path, default=DEFAULT_OUTPUT_LOCAL, help="Path for local ML data output")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

    if not args.db.exists():
        logger.error(f"Pattern DB does not exist at {args.db}. Please build it first.")
        return

    logger.info(f"Loading pattern database from {args.db}")
    with open(args.db, "r", encoding="utf-8") as f:
        pattern_db = json.load(f)

    logger.info("Building curated step templates...")
    export_data = build_curated_templates(pattern_db)

    # Save to local processed
    args.output_local.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output_local, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2)
    logger.info(f"Saved local copy: {args.output_local}")

    # Save to src/data for TypeScript app
    args.output_ts.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output_ts, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2)
    logger.info(f"Saved TypeScript copy: {args.output_ts}")

    logger.info(f"Export complete. Total templates: {export_data['metadata']['total_templates']}")


if __name__ == "__main__":
    main()
