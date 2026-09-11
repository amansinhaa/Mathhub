"""Fetch and filter TIGER-Lab/MATH-plus dataset into our pipeline JSONL format.

This is a supplementary fetcher for the MATH-plus dataset which uses
'instruction'/'output' columns instead of the standard MATH 'problem'/'solution' format.
"""

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Set

from datasets import load_dataset
from tqdm import tqdm

logger = logging.getLogger("fetch_math_plus")

DEFAULT_OUTPUT = Path(__file__).resolve().parent / "data" / "raw" / "math_plus_filtered.jsonl"

# Algebra-related keywords in problem text
ALGEBRA_KEYWORDS = re.compile(
    r"(?i)\b(?:solve|equation|polynomial|quadratic|linear|cubic|factor|root|"
    r"variable|coefficient|simplif|expand|expression|inequality|system\s+of|"
    r"find\s+(?:the\s+)?(?:value|root|solution)|x\s*=|y\s*=)\b"
)

# Geometry terms to skip
GEOMETRY_SKIP = re.compile(
    r"(?i)\b(?:triangle|circle|rectangle|polygon|cylinder|sphere|cone|"
    r"parallelogram|trapezoid|rhombus|diameter|radius|circumference|"
    r"perimeter|area\s+of|volume\s+of|angle\s+(?:of|between)|"
    r"right\s+angle|hypotenuse|altitude|median|bisector)\b"
)

# Coordinate/trig-heavy problems to skip
COORD_SKIP = re.compile(
    r"(?i)\b(?:spherical\s+coord|rectangular\s+coord|polar\s+coord|"
    r"cylindrical\s+coord|convert\s+the\s+point)\b"
)

# Equation presence indicators
HAS_EQUATION = re.compile(r"[a-zA-Z]\s*[\^]?\s*[=<>]|=\s*\d|\\(?:eq|neq|leq|geq)")


def is_algebra_relevant(text: str) -> bool:
    """Check if problem text is algebra-relevant."""
    if GEOMETRY_SKIP.search(text):
        return False
    if COORD_SKIP.search(text):
        return False
    # Must have equation-like content or algebra keywords
    return bool(ALGEBRA_KEYWORDS.search(text) or HAS_EQUATION.search(text))


def has_steps(text: str) -> bool:
    """Check if solution has step-by-step reasoning."""
    if not text:
        return False
    lines = text.strip().split("\n")
    if len(lines) >= 2:
        return True
    # Check for inline step markers
    if re.search(r"(?i)\b(?:step\s+\d|first|then|therefore|thus|hence)\b", text):
        return True
    return False


def main():
    parser = argparse.ArgumentParser(description="Fetch TIGER-Lab/MATH-plus dataset")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT,
                        help="Output JSONL file path")
    parser.add_argument("--limit", type=int, default=None,
                        help="Max problems to retain (default: all)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print stats without saving")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    logger.info("Downloading TIGER-Lab/MATH-plus dataset...")
    try:
        ds = load_dataset("TIGER-Lab/MATH-plus", split="train")
    except Exception as e:
        logger.error(f"Failed to download MATH-plus: {e}")
        sys.exit(1)

    logger.info(f"Loaded {len(ds)} raw examples")

    # Filter and convert
    records = []
    stats = {"total": len(ds), "algebra": 0, "has_steps": 0, "geometry_skip": 0, "no_steps": 0}

    for i, row in enumerate(tqdm(ds, desc="Filtering MATH-plus")):
        problem = row.get("instruction", "")
        solution = row.get("output", "")

        if not problem or not solution:
            continue

        if not is_algebra_relevant(problem + " " + solution):
            if GEOMETRY_SKIP.search(problem + " " + solution):
                stats["geometry_skip"] += 1
            continue

        stats["algebra"] += 1

        if not has_steps(solution):
            stats["no_steps"] += 1
            continue

        stats["has_steps"] += 1

        records.append({
            "id": f"mathplus_{i:06d}",
            "source": "MATH-plus",
            "problem": problem,
            "solution": solution,
            "subject": "algebra",  # Pre-filtered to algebra
            "level": "",
            "has_equation": bool(HAS_EQUATION.search(problem)),
        })

        if args.limit and len(records) >= args.limit:
            break

    # Sort: equation problems first
    records.sort(key=lambda r: (not r["has_equation"], r["id"]))

    logger.info(f"[MATH-plus] Raw: {stats['total']} | Algebra-relevant: {stats['algebra']} | "
                f"With steps: {stats['has_steps']} | Geometry skipped: {stats['geometry_skip']} | "
                f"No steps: {stats['no_steps']}")
    logger.info(f"[MATH-plus] Final retained: {len(records)} | "
                f"With equations: {sum(1 for r in records if r['has_equation'])}")

    if args.dry_run:
        logger.info(f"[DRY RUN] Would write {len(records)} records to '{args.output}'")
        return

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        for rec in tqdm(records, desc=f"Writing {args.output.name}"):
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    logger.info(f"Successfully wrote '{args.output}' ({len(records)} records)")


if __name__ == "__main__":
    main()
