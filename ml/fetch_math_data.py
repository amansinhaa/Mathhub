"""Data ingestion and filtering pipeline for math equation datasets.

Downloads and filters HuggingFace math benchmarks (GSM8K, MATH) for training
an equation solver. Applies step-by-step reasoning validation, subject domain
filtering, geometry term rejection, and equation presence prioritization.
"""

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np
import pandas as pd
from datasets import get_dataset_config_names, load_dataset
from tqdm import tqdm

logger = logging.getLogger("fetch_math_data")

# Default directory structure
DEFAULT_OUTPUT_DIR: Path = Path(__file__).resolve().parent / "data" / "raw"
DEFAULT_GSM8K_DATASET: str = "openai/gsm8k"
DEFAULT_MATH_DATASET: str = "lighteval/MATH"
FALLBACK_MATH_DATASET: str = "EleutherAI/hendrycks_math"

# Target subjects for the MATH competition benchmark
MATH_TARGET_SUBJECTS: Set[str] = {
    "algebra",
    "prealgebra",
    "intermediate_algebra",
    "number_theory",
}

# Step-by-step solution indicators
STEP_PATTERNS: List[re.Pattern] = [
    # GSM8K standard delimiter
    re.compile(r"####\s*"),
    # Explicit step labels: "Step 1:", "step 2."
    re.compile(r"(?i)\bstep\s*\d+[:.]?"),
    # Explicit case labels: "Case 1:", "case 2."
    re.compile(r"(?i)\bcase\s*\d+[:.]?"),
    # Numbered list items at the start of a line, e.g. "1. ", "2) ", "(1) "
    re.compile(r"(?m)^\s*(?:\d+[\.\)]|\(\d+\))\s+"),
    # Numbered step transitions within sentences, e.g. "; 1) ... ; 2) ..."
    re.compile(r"(?:^|[.;])\s*(?:\d+[\.\)]|\(\d+\))\s+"),
    # Procedural transition markers
    re.compile(
        r"(?i)\b(?:first|second|third|fourth|fifth|finally|next|firstly|secondly)\s*,\s*"
    ),
    # Multi-line LaTeX aligned equation environments
    re.compile(r"\\begin\{(?:align|aligned|gather|gathered|cases|split)\*?\}"),
]

# Geometry-heavy terms and diagram indicators to skip
GEOMETRY_PATTERNS: List[re.Pattern] = [
    re.compile(r"\btriangles?\b", re.IGNORECASE),
    re.compile(r"\btriangular\b", re.IGNORECASE),
    re.compile(r"\bcircles?\b", re.IGNORECASE),
    re.compile(r"\bcircular\b", re.IGNORECASE),
    re.compile(r"\bdiagrams?\b", re.IGNORECASE),
    re.compile(r"\bfigures?\b", re.IGNORECASE),
    re.compile(r"\bpolygons?\b", re.IGNORECASE),
    re.compile(r"\bquadrilaterals?\b", re.IGNORECASE),
    re.compile(r"\brectangles?\b", re.IGNORECASE),
    re.compile(r"\brectangular\b", re.IGNORECASE),
    re.compile(r"\brhombus(?:es)?\b", re.IGNORECASE),
    re.compile(r"\brhombi\b", re.IGNORECASE),
    re.compile(r"\btrapezoids?\b", re.IGNORECASE),
    re.compile(r"\btrapezium(?:s)?\b", re.IGNORECASE),
    re.compile(r"\bparallelograms?\b", re.IGNORECASE),
    re.compile(r"\bhexagons?\b", re.IGNORECASE),
    re.compile(r"\bpentagons?\b", re.IGNORECASE),
    re.compile(r"\boctagons?\b", re.IGNORECASE),
    re.compile(r"\bcylinders?\b", re.IGNORECASE),
    re.compile(r"\bcylindrical\b", re.IGNORECASE),
    re.compile(r"\bspheres?\b", re.IGNORECASE),
    re.compile(r"\bspherical\b", re.IGNORECASE),
    re.compile(r"\bpyramids?\b", re.IGNORECASE),
    re.compile(r"\bcones?\b", re.IGNORECASE),
    re.compile(r"\bconical\b", re.IGNORECASE),
    re.compile(r"\bperimeters?\b", re.IGNORECASE),
    re.compile(r"\bhypotenuses?\b", re.IGNORECASE),
    re.compile(r"\bradius\b", re.IGNORECASE),
    re.compile(r"\bradii\b", re.IGNORECASE),
    re.compile(r"\bdiameters?\b", re.IGNORECASE),
    # Asymptote diagram source code embedded in MATH problems
    re.compile(r"\[asy\]", re.IGNORECASE),
]

# Patterns indicating equations, algebraic queries, or variable evaluation
EQUATION_PATTERNS: List[re.Pattern] = [
    re.compile(r"="),
    re.compile(r"\bsolve\b", re.IGNORECASE),
    re.compile(r"\bsolving\b", re.IGNORECASE),
    re.compile(r"\bfind\s+(?:the\s+value\s+of\s+)?\$?[a-zA-Z]\$?\b", re.IGNORECASE),
    re.compile(r"\bwhat\s+is\s+the\s+value\b", re.IGNORECASE),
    re.compile(r"\bfind\s+the\s+value\b", re.IGNORECASE),
    re.compile(r"\bcalculate\s+(?:the\s+)?value\b", re.IGNORECASE),
    re.compile(r"\bdetermine\s+(?:the\s+)?value\b", re.IGNORECASE),
    re.compile(r"\bequations?\b", re.IGNORECASE),
    re.compile(r"\bsystem\s+of\s+equations\b", re.IGNORECASE),
    re.compile(r"\bexpression\b", re.IGNORECASE),
    re.compile(r"\bformula\b", re.IGNORECASE),
]


def setup_logging(verbose: bool = False) -> logging.Logger:
    """Configure and return the root logger for the ML pipeline.

    Args:
        verbose: Whether to set logging level to DEBUG.

    Returns:
        logging.Logger: Configured logger instance.
    """
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    return logging.getLogger("fetch_math_data")


def normalize_subject(subject: Optional[str]) -> str:
    """Normalize a subject or category name into a lowercase slug.

    Replaces non-alphanumeric characters with spaces, then joins words with
    underscores to match standard subject tags (e.g., 'Intermediate Algebra' ->
    'intermediate_algebra').

    Args:
        subject: Raw subject string or None.

    Returns:
        Normalized lowercase slug.
    """
    if not subject:
        return ""
    cleaned = re.sub(r"[^\w\s]", " ", subject.lower())
    return "_".join(cleaned.split())


def is_target_math_subject(subject: Optional[str]) -> bool:
    """Check whether a subject matches the target MATH competition subjects.

    Target subjects are: algebra, prealgebra, intermediate_algebra, number_theory.

    Args:
        subject: Raw subject string or None.

    Returns:
        True if the subject matches any target subject, False otherwise.
    """
    normalized = normalize_subject(subject)
    return normalized in MATH_TARGET_SUBJECTS


def has_step_by_step_markers(solution: Optional[str]) -> bool:
    """Check if the solution text contains step-by-step reasoning markers.

    Validates presence of:
    - Newlines separating reasoning lines (multiline explanation)
    - Delimiter '####'
    - Explicit step tags (e.g., 'Step 1:', 'Case 1:')
    - Numbered steps (e.g., '1.', '1)', '(1)')
    - Procedural transition words (e.g., 'First,', 'Next,')
    - Multi-line LaTeX aligned equation environments

    Args:
        solution: Full solution text.

    Returns:
        True if step-by-step markers are present, False otherwise.
    """
    if not solution or not solution.strip():
        return False

    trimmed = solution.strip()
    if "\n" in trimmed:
        return True

    for pattern in STEP_PATTERNS:
        if pattern.search(trimmed):
            return True

    return False


def is_geometry_problem(problem: Optional[str]) -> bool:
    """Check whether a problem statement is geometry-heavy.

    Searches for words like 'triangle', 'circle', 'diagram', 'figure', 'polygon',
    and Asymptote diagram blocks [asy].

    Args:
        problem: Problem description text.

    Returns:
        True if geometry-heavy, False otherwise.
    """
    if not problem:
        return False
    for pattern in GEOMETRY_PATTERNS:
        if pattern.search(problem):
            return True
    return False


def contains_equation(problem: Optional[str]) -> bool:
    """Check whether a problem statement contains an equation or algebraic query.

    Looks for '=', 'solve', 'find x', 'what is the value', and related patterns.

    Args:
        problem: Problem description text.

    Returns:
        True if equation or algebraic request is detected, False otherwise.
    """
    if not problem:
        return False
    return any(pattern.search(problem) for pattern in EQUATION_PATTERNS)


def fetch_gsm8k(dataset_name: str = DEFAULT_GSM8K_DATASET) -> List[Dict[str, Any]]:
    """Download and extract examples from the GSM8K dataset.

    Uses HuggingFace datasets to load the 'main' split. Aggregates all splits
    into a standardized list of problem dictionaries.

    Args:
        dataset_name: HuggingFace repository identifier (default: 'openai/gsm8k').

    Returns:
        List of dictionaries with keys: 'problem', 'solution', 'subject', 'level'.

    Raises:
        Exception: If download or extraction fails.
    """
    logger.info("Downloading GSM8K dataset from '%s' (config: 'main')...", dataset_name)
    ds = load_dataset(dataset_name, "main")

    records: List[Dict[str, Any]] = []
    if hasattr(ds, "keys"):
        split_names = list(ds.keys())
        for split_name in split_names:
            split_data = ds[split_name]
            logger.info("GSM8K: loaded %d examples from split '%s'", len(split_data), split_name)
            for row in split_data:
                records.append({
                    "problem": str(row.get("question", "")).strip(),
                    "solution": str(row.get("answer", "")).strip(),
                    "subject": None,
                    "level": None,
                })
    else:
        logger.info("GSM8K: loaded %d examples from single dataset", len(ds))
        for row in ds:
            records.append({
                "problem": str(row.get("question", "")).strip(),
                "solution": str(row.get("answer", "")).strip(),
                "subject": None,
                "level": None,
            })

    return records


def fetch_math(
    dataset_name: str = DEFAULT_MATH_DATASET,
    allow_fallback: bool = False,
) -> List[Dict[str, Any]]:
    """Download and extract examples from the MATH competition dataset.

    Handles both single-table datasets with 'type' columns (e.g. lighteval/MATH)
    and multi-configuration datasets (e.g. EleutherAI/hendrycks_math). If the
    primary dataset fails and allow_fallback is enabled, attempts fallback to
    the alternative Hendrycks MATH repository.

    Args:
        dataset_name: HuggingFace repository identifier (default: 'lighteval/MATH').
        allow_fallback: Whether to attempt fallback if the primary repository fails.

    Returns:
        List of dictionaries with keys: 'problem', 'solution', 'subject', 'level'.

    Raises:
        Exception: If download fails and no fallback succeeds.
    """
    records: List[Dict[str, Any]] = []

    def _try_load_repo(repo_name: str) -> List[Dict[str, Any]]:
        extracted: List[Dict[str, Any]] = []
        logger.info("Downloading MATH dataset from '%s'...", repo_name)

        # Check if the repository uses configuration subsets (e.g. algebra, etc.)
        config_names: List[str] = []
        try:
            config_names = get_dataset_config_names(repo_name)
        except Exception as err:
            logger.debug("Could not inspect configs for '%s': %s", repo_name, err)

        matching_configs = [
            cfg for cfg in config_names if normalize_subject(cfg) in MATH_TARGET_SUBJECTS
        ]

        if matching_configs:
            logger.info(
                "Loading MATH target configs from '%s': %s",
                repo_name,
                matching_configs,
            )
            for cfg in matching_configs:
                cfg_ds = load_dataset(repo_name, cfg)
                splits = list(cfg_ds.keys()) if hasattr(cfg_ds, "keys") else [None]
                for split in splits:
                    split_data = cfg_ds[split] if split else cfg_ds
                    logger.info(
                        "Config '%s' split '%s': %d examples",
                        cfg,
                        split or "default",
                        len(split_data),
                    )
                    for row in split_data:
                        extracted.append({
                            "problem": str(row.get("problem") or row.get("question") or "").strip(),
                            "solution": str(row.get("solution") or row.get("answer") or "").strip(),
                            "subject": row.get("type") or row.get("subject") or cfg,
                            "level": row.get("level"),
                        })
            return extracted

        # If not configured with subset names, load directly
        ds = load_dataset(repo_name)
        if hasattr(ds, "keys"):
            for split in ds.keys():
                split_data = ds[split]
                logger.info("MATH split '%s': %d examples", split, len(split_data))
                for row in split_data:
                    extracted.append({
                        "problem": str(row.get("problem") or row.get("question") or "").strip(),
                        "solution": str(row.get("solution") or row.get("answer") or "").strip(),
                        "subject": row.get("type") or row.get("subject"),
                        "level": row.get("level"),
                    })
        else:
            logger.info("MATH: %d examples in single split", len(ds))
            for row in ds:
                extracted.append({
                    "problem": str(row.get("problem") or row.get("question") or "").strip(),
                    "solution": str(row.get("solution") or row.get("answer") or "").strip(),
                    "subject": row.get("type") or row.get("subject"),
                    "level": row.get("level"),
                })

        return extracted

    try:
        records = _try_load_repo(dataset_name)
    except Exception as primary_exc:
        logger.error(
            "Primary MATH dataset download failed from '%s': %s",
            dataset_name,
            primary_exc,
        )
        if allow_fallback and dataset_name != FALLBACK_MATH_DATASET:
            logger.info("Attempting fallback to '%s'...", FALLBACK_MATH_DATASET)
            records = _try_load_repo(FALLBACK_MATH_DATASET)
        else:
            raise primary_exc

    return records


def filter_dataset(
    raw_records: List[Dict[str, Any]],
    source_name: str,
    id_prefix: str,
    is_math: bool = False,
    limit: Optional[int] = None,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Filter raw math problems according to pipeline quality rules.

    Filtering rules applied:
    1. Step-by-step solution markers (newlines, '####', 'Step 1:', numbered steps, etc.)
    2. For MATH dataset: restrict to target subjects (algebra, prealgebra,
       intermediate_algebra, number_theory).
    3. Skip geometry-heavy problems (containing triangle, circle, diagram, figure, polygon, etc.)
    4. Prefer problems containing equations (prioritize problems with '=', 'solve',
       'find x', 'what is the value', etc.).

    Args:
        raw_records: List of raw problem dictionaries.
        source_name: Name of the data source for record attribution.
        id_prefix: Prefix for generated unique record IDs (e.g. 'gsm8k', 'math').
        is_math: Whether this dataset is the MATH competition benchmark.
        limit: Optional maximum number of records to retain after filtering.

    Returns:
        Tuple containing:
        - List of filtered and formatted record dictionaries.
        - Dictionary of detailed processing statistics.
    """
    total_raw = len(raw_records)
    dropped_empty = 0
    dropped_no_steps = 0
    dropped_subject = 0
    dropped_geometry = 0
    kept_candidates: List[Dict[str, Any]] = []

    for record in tqdm(raw_records, desc=f"Filtering {id_prefix}", unit="problem"):
        problem = str(record.get("problem", "")).strip()
        solution = str(record.get("solution", "")).strip()
        subject = record.get("subject")
        level = record.get("level")

        if not problem or not solution:
            dropped_empty += 1
            continue

        # Rule 1: Step-by-step solution validation
        if not has_step_by_step_markers(solution):
            dropped_no_steps += 1
            continue

        # Rule 2: Subject filtering for MATH dataset
        if is_math:
            if not is_target_math_subject(subject):
                dropped_subject += 1
                continue

        # Rule 3: Skip geometry-heavy problems
        if is_geometry_problem(problem):
            dropped_geometry += 1
            continue

        # Rule 4: Detect presence of equations
        has_eq = contains_equation(problem)

        kept_candidates.append({
            "source": source_name,
            "problem": problem,
            "solution": solution,
            "subject": normalize_subject(subject) if is_math and subject else None,
            "level": str(level) if level is not None else None,
            "has_equation": has_eq,
        })

    # Rule 4 (preference): Sort records so problems with equations are prioritized first
    kept_candidates.sort(key=lambda item: not item["has_equation"])

    total_filtered_before_limit = len(kept_candidates)

    # Apply limit if requested
    if limit is not None and limit > 0:
        kept_candidates = kept_candidates[:limit]

    # Assign final sequential IDs and build final records
    filtered_records: List[Dict[str, Any]] = []
    for idx, item in enumerate(kept_candidates, start=1):
        record_id = f"{id_prefix}_{idx:04d}"
        filtered_records.append({
            "id": record_id,
            "source": item["source"],
            "problem": item["problem"],
            "solution": item["solution"],
            "subject": item["subject"],
            "level": item["level"],
            "has_equation": item["has_equation"],
        })

    # Compute statistics using pandas for breakdown analysis
    df = pd.DataFrame(filtered_records) if filtered_records else pd.DataFrame()
    with_eq = int((df["has_equation"] == True).sum()) if not df.empty else 0
    without_eq = int((df["has_equation"] == False).sum()) if not df.empty else 0

    stats: Dict[str, Any] = {
        "dataset": id_prefix,
        "source": source_name,
        "total_raw": total_raw,
        "dropped_empty": dropped_empty,
        "dropped_no_steps": dropped_no_steps,
        "dropped_subject": dropped_subject,
        "dropped_geometry": dropped_geometry,
        "retained_before_limit": total_filtered_before_limit,
        "final_retained": len(filtered_records),
        "retention_rate_pct": (
            round((len(filtered_records) / total_raw) * 100, 2) if total_raw > 0 else 0.0
        ),
        "with_equations": with_eq,
        "without_equations": without_eq,
    }

    if not df.empty and is_math and "subject" in df.columns:
        stats["subject_breakdown"] = df["subject"].value_counts(dropna=False).to_dict()

    if not df.empty and is_math and "level" in df.columns:
        stats["level_breakdown"] = df["level"].value_counts(dropna=False).to_dict()

    logger.info(
        "[%s] Raw: %d | Filtered: %d (%.1f%% retained) | Equations: %d (%.1f%%) | Non-Eq: %d",
        id_prefix.upper(),
        total_raw,
        len(filtered_records),
        stats["retention_rate_pct"],
        with_eq,
        (with_eq / len(filtered_records) * 100) if filtered_records else 0.0,
        without_eq,
    )
    logger.info(
        "[%s] Rejections: no_steps=%d, non_target_subject=%d, geometry=%d, empty=%d",
        id_prefix.upper(),
        dropped_no_steps,
        dropped_subject,
        dropped_geometry,
        dropped_empty,
    )

    return filtered_records, stats


def save_jsonl(records: List[Dict[str, Any]], output_path: Path) -> None:
    """Save problem records to a JSONL file.

    Args:
        records: List of problem dictionaries to serialize.
        output_path: Destination file path.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    logger.info("Saving %d records to '%s'...", len(records), output_path)
    with open(output_path, "w", encoding="utf-8") as f:
        for record in tqdm(records, desc=f"Writing {output_path.name}", unit="line"):
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    logger.info("Successfully wrote '%s'.", output_path)


def log_summary_statistics(
    all_stats: Dict[str, Dict[str, Any]],
    dry_run: bool = False,
) -> None:
    """Log formatted summary statistics for all processed datasets.

    Args:
        all_stats: Map of dataset name to its statistics dictionary.
        dry_run: Whether execution was performed in dry-run mode.
    """
    logger.info("=" * 70)
    logger.info("DATA PROCESSING PIPELINE SUMMARY STATS %s", "[DRY RUN]" if dry_run else "")
    logger.info("=" * 70)

    if not all_stats:
        logger.warning("No datasets were successfully processed.")
        logger.info("=" * 70)
        return

    total_raw_all = 0
    total_retained_all = 0
    total_eq_all = 0

    for name, stats in all_stats.items():
        raw_cnt = stats.get("total_raw", 0)
        ret_cnt = stats.get("final_retained", 0)
        eq_cnt = stats.get("with_equations", 0)
        no_eq_cnt = stats.get("without_equations", 0)
        pct = stats.get("retention_rate_pct", 0.0)

        total_raw_all += raw_cnt
        total_retained_all += ret_cnt
        total_eq_all += eq_cnt

        logger.info("Dataset: %s (%s)", name.upper(), stats.get("source", "unknown"))
        logger.info("  - Raw examples:         %d", raw_cnt)
        logger.info("  - Filtered retained:    %d (%.2f%%)", ret_cnt, pct)
        logger.info("  - Problems w/ Equation: %d", eq_cnt)
        logger.info("  - Problems w/o Equation:%d", no_eq_cnt)
        logger.info("  - Dropped (no steps):   %d", stats.get("dropped_no_steps", 0))
        logger.info("  - Dropped (subject):    %d", stats.get("dropped_subject", 0))
        logger.info("  - Dropped (geometry):   %d", stats.get("dropped_geometry", 0))

        if "subject_breakdown" in stats:
            logger.info("  - Subject distribution: %s", stats["subject_breakdown"])
        if "level_breakdown" in stats:
            logger.info("  - Level distribution:   %s", stats["level_breakdown"])
        logger.info("-" * 50)

    overall_pct = (
        round((total_retained_all / total_raw_all) * 100, 2) if total_raw_all > 0 else 0.0
    )
    logger.info("TOTAL ACROSS ALL DATASETS:")
    logger.info("  - Total Raw:      %d", total_raw_all)
    logger.info("  - Total Retained: %d (%.2f%%)", total_retained_all, overall_pct)
    logger.info("  - Total Equations:%d", total_eq_all)
    logger.info("=" * 70)


def parse_args() -> argparse.Namespace:
    """Parse and validate command line arguments.

    Returns:
        Parsed arguments namespace.
    """
    parser = argparse.ArgumentParser(
        description="Download, filter, and save HuggingFace math datasets for equation solver training."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only compute and print statistics without saving files to disk.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of problems per dataset (useful for fast testing).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Output directory for JSONL files (default: {DEFAULT_OUTPUT_DIR}).",
    )
    parser.add_argument(
        "--gsm8k-dataset",
        type=str,
        default=DEFAULT_GSM8K_DATASET,
        help=f"HuggingFace dataset path for GSM8K (default: '{DEFAULT_GSM8K_DATASET}').",
    )
    parser.add_argument(
        "--math-dataset",
        type=str,
        default=DEFAULT_MATH_DATASET,
        help=f"HuggingFace dataset path for MATH (default: '{DEFAULT_MATH_DATASET}').",
    )
    parser.add_argument(
        "--fallback-math",
        action="store_true",
        help=f"Fallback to '{FALLBACK_MATH_DATASET}' if primary MATH dataset fails to download.",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable debug logging.",
    )

    return parser.parse_args()


def main() -> int:
    """Execute the math dataset ingestion, filtering, and export pipeline.

    Returns:
        Integer exit code (0 for success).
    """
    args = parse_args()
    setup_logging(verbose=args.verbose)

    output_dir: Path = args.output_dir
    logger.info("Starting math dataset processing pipeline")
    logger.info("Configuration: dry_run=%s, limit=%s, output_dir=%s", args.dry_run, args.limit, output_dir)

    dataset_configs = [
        {
            "name": "gsm8k",
            "fetch_fn": lambda: fetch_gsm8k(args.gsm8k_dataset),
            "output_file": output_dir / "gsm8k_filtered.jsonl",
            "id_prefix": "gsm8k",
            "is_math": False,
            "source": args.gsm8k_dataset,
        },
        {
            "name": "math",
            "fetch_fn": lambda: fetch_math(args.math_dataset, allow_fallback=args.fallback_math),
            "output_file": output_dir / "math_filtered.jsonl",
            "id_prefix": "math",
            "is_math": True,
            "source": args.math_dataset,
        },
    ]

    all_stats: Dict[str, Dict[str, Any]] = {}

    for config in dataset_configs:
        dataset_name = config["name"]
        source_id = config["source"]
        logger.info("=" * 60)
        logger.info("Processing dataset '%s' from source '%s'", dataset_name, source_id)
        logger.info("=" * 60)

        # Requirement 6: Error handling - if a dataset fails to download, log error & continue
        try:
            raw_records = config["fetch_fn"]()
            logger.info(
                "Fetched %d raw records from dataset '%s' ('%s')",
                len(raw_records),
                dataset_name,
                source_id,
            )
        except Exception as exc:
            logger.error(
                "Failed to download or load dataset '%s' ('%s'): %s",
                dataset_name,
                source_id,
                exc,
            )
            logger.info("Continuing with next dataset according to pipeline policy...")
            continue

        try:
            filtered_records, stats = filter_dataset(
                raw_records=raw_records,
                source_name=source_id,
                id_prefix=config["id_prefix"],
                is_math=config["is_math"],
                limit=args.limit,
            )
            all_stats[dataset_name] = stats

            if args.dry_run:
                logger.info(
                    "[DRY RUN] Would write %d records to '%s'",
                    len(filtered_records),
                    config["output_file"],
                )
            else:
                save_jsonl(filtered_records, config["output_file"])

        except Exception as exc:
            logger.error(
                "Error during filtering/saving for dataset '%s': %s",
                dataset_name,
                exc,
                exc_info=True,
            )
            logger.info("Continuing with next dataset...")
            continue

    log_summary_statistics(all_stats, dry_run=args.dry_run)
    logger.info("Dataset ingestion and filtering pipeline completed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
