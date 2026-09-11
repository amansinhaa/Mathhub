"""Orchestration script for building the MathHub equation pattern database.

This script:
1. Loads all processed equation JSONL files from the processed directory.
2. Initializes a PatternDatabase instance.
3. Adds all entries (computing fingerprints and feature vectors).
4. Builds the NearestNeighbors KNN index.
5. Clusters equations by type.
6. Extracts abstracted step templates per cluster.
7. Saves the compiled PatternDatabase to pattern_db.json.
8. Optionally validates the database by executing 5 sample similarity queries.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any

from tqdm import tqdm

from engine.pattern_matcher import (
    PatternDatabase,
    compute_fingerprint,
    infer_equation_type,
)

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("build_pattern_db")

# Example equations to validate similarity searches and template matching
VALIDATION_QUERIES: list[str] = [
    "x^2 - 5x + 6 = 0",          # Standard factorable quadratic
    "2x^2 + 3x - 5 = 0",         # Quadratic with leading coefficient > 1
    "x^2 + 4 = 0",               # Quadratic with complex roots
    "3x - 12 = 0",               # Linear equation
    "x^3 - 6x^2 + 11x - 6 = 0",  # Cubic polynomial
]


def parse_args() -> argparse.Namespace:
    """Parses command-line arguments for building the pattern database.

    Returns:
        Parsed arguments namespace.
    """
    default_base_dir = Path(__file__).resolve().parent
    default_input_dir = default_base_dir / "data" / "processed"
    default_output_file = default_input_dir / "pattern_db.json"

    parser = argparse.ArgumentParser(
        description="Build Pattern Database for MathHub ML Equation Engine"
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=default_input_dir,
        help=f"Input directory containing processed JSONL files (default: {default_input_dir})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=default_output_file,
        help=f"Output file path for serialized PatternDatabase (default: {default_output_file})",
    )
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Run validation queries after building (prints 5 example similarity searches)",
    )
    parser.add_argument(
        "--min-cluster-size",
        type=int,
        default=3,
        help="Minimum cluster size for step template extraction (default: 3)",
    )
    parser.add_argument(
        "--log-level",
        type=str,
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging level (default: INFO)",
    )
    return parser.parse_args()


def load_jsonl_entries(input_dir: Path) -> list[dict[str, Any]]:
    """Discovers and loads all equation entries from JSONL files in the input directory.

    Args:
        input_dir: Path to directory containing processed JSONL files.

    Returns:
        List of loaded dictionary records.
    """
    if not input_dir.exists():
        logger.warning("Input directory does not exist: %s", input_dir)
        return []

    # Find all .jsonl files in input_dir (excluding output json file if inside)
    jsonl_files: list[Path] = []
    for p in sorted(input_dir.glob("*.jsonl")):
        if p.is_file():
            jsonl_files.append(p)
    for p in sorted(input_dir.glob("*/*.jsonl")):
        if p.is_file() and p not in jsonl_files:
            jsonl_files.append(p)

    if not jsonl_files:
        logger.warning("No .jsonl files found in directory: %s", input_dir)
        return []

    logger.info("Found %d JSONL file(s) in %s", len(jsonl_files), input_dir)
    all_entries: list[dict[str, Any]] = []

    for file_path in tqdm(jsonl_files, desc="Reading JSONL files", unit="file"):
        line_count = 0
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                for line_num, line in enumerate(f, start=1):
                    line_str = line.strip()
                    if not line_str:
                        continue
                    try:
                        record = json.loads(line_str)
                        if isinstance(record, dict):
                            all_entries.append(record)
                            line_count += 1
                    except json.JSONDecodeError as err:
                        logger.warning(
                            "Skipping malformed JSON at %s:%d: %s",
                            file_path.name,
                            line_num,
                            err,
                        )
            logger.debug("Loaded %d records from %s", line_count, file_path.name)
        except Exception as exc:
            logger.error("Failed reading file %s: %s", file_path, exc)

    logger.info("Successfully loaded total of %d entries from JSONL files.", len(all_entries))
    return all_entries


def run_validation_queries(db: PatternDatabase, queries: list[str]) -> None:
    """Executes validation similarity searches and logs retrieved results and templates.

    Args:
        db: The built PatternDatabase instance.
        queries: List of equation strings to test.
    """
    logger.info("=" * 60)
    logger.info("RUNNING VALIDATION QUERIES (5 Example Searches)")
    logger.info("=" * 60)

    for i, query in enumerate(queries, start=1):
        logger.info("-" * 50)
        logger.info("Validation Query %d: '%s'", i, query)

        try:
            # 1. Compute fingerprint and infer type
            fp = compute_fingerprint(query)
            eq_type = infer_equation_type(fp)
            logger.info("  Fingerprint: degree=%d, terms=%d, sign_hash=%d, disc=%d, complex=%s, factorable=%s",
                        fp.get("degree"), fp.get("num_terms"), fp.get("coeff_sign_hash"),
                        fp.get("discriminant_sign"), fp.get("has_complex_roots"), fp.get("is_factorable"))
            logger.info("  Inferred Type: %s", eq_type)

            # 2. Similarity search
            similar_matches = db.find_similar(query, k=3)
            logger.info("  Top %d Nearest Equation(s):", len(similar_matches))
            for rank, match in enumerate(similar_matches, start=1):
                logger.info(
                    "    [%d] Equation: '%s' | Type: %s | Distance: %.4f | SimScore: %.4f",
                    rank,
                    match.get("equation"),
                    match.get("type"),
                    match.get("distance", 0.0),
                    match.get("similarity_score", 0.0),
                )

            # 3. Retrieve step template
            template = db.get_step_template(eq_type, fp)
            logger.info("  Retrieved Step Template (%d steps):", len(template))
            for step_idx, step in enumerate(template[:3], start=1):
                exp = step.get("explanation", "") if isinstance(step, dict) else str(step)
                math_expr = step.get("math", "") if isinstance(step, dict) else ""
                logger.info("    Step %d: %s (Math: %s)", step_idx, exp[:60], math_expr[:40])
            if len(template) > 3:
                logger.info("    ... (%d more step(s))", len(template) - 3)

        except Exception as exc:
            logger.error("  Validation query '%s' encountered an error: %s", query, exc)

    logger.info("=" * 60)
    logger.info("VALIDATION COMPLETE")
    logger.info("=" * 60)


def main() -> None:
    """Main execution function for building the equation pattern database."""
    args = parse_args()
    logger.setLevel(getattr(logging, args.log_level.upper(), logging.INFO))

    logger.info("Starting Pattern Database build process...")
    logger.info("Input directory: %s", args.input_dir)
    logger.info("Output file:     %s", args.output)
    logger.info("Min cluster size: %d", args.min_cluster_size)

    # Step 1: Load all processed JSONL files from data/processed/
    entries = load_jsonl_entries(args.input_dir)
    if not entries:
        logger.warning(
            "No entries found in '%s'. Initializing empty database.",
            args.input_dir,
        )

    # Step 2: Create a PatternDatabase instance
    db = PatternDatabase()

    # Step 3: Add all entries
    logger.info("Adding entries to PatternDatabase...")
    for entry in tqdm(entries, desc="Fingerprinting & Adding Entries", unit="entry"):
        try:
            db.add_entry(entry)
        except Exception as exc:
            logger.warning("Failed to add entry '%s': %s", entry.get("equation"), exc)

    logger.info("Database loaded with %d total entries across types: %s",
                len(db.entries), list(db.type_indices.keys()))

    # Step 4: Build the KNN index
    logger.info("Building scikit-learn NearestNeighbors index...")
    db.build_index()

    # Steps 5 & 6: Cluster equations by type and extract step templates per cluster
    logger.info("Clustering equations and extracting step templates (min_cluster_size=%d)...",
                args.min_cluster_size)
    templates = db.cluster_and_extract_templates(min_cluster_size=args.min_cluster_size)
    logger.info("Extracted %d step template(s): %s", len(templates), list(templates.keys()))

    # Step 7: Save the pattern database to data/processed/pattern_db.json
    logger.info("Saving PatternDatabase to %s...", args.output)
    db.save(args.output)
    logger.info("PatternDatabase successfully saved to %s", args.output)

    # Validation (if requested)
    if args.validate:
        run_validation_queries(db, VALIDATION_QUERIES)


if __name__ == "__main__":
    main()
