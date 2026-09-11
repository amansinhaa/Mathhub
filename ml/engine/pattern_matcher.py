"""Pattern matching and equation fingerprinting engine for mathematical equations.

This module provides structural fingerprinting of mathematical equations,
converts fingerprints to numerical feature vectors for similarity search using
scikit-learn's NearestNeighbors, and manages a PatternDatabase for retrieving
nearest equations and abstracted step-by-step solution templates.
"""

from __future__ import annotations

import collections
import json
import logging
import math
import re
from pathlib import Path
from typing import Any

import numpy as np
import sympy as sp
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)

logger = logging.getLogger(__name__)

# SymPy parsing transformations allowing implicit multiplication and exponentiation with ^
SYMPY_TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)

# Canonical feature names matching the numerical vector specification
FEATURE_NAMES: list[str] = [
    "degree",
    "num_terms",
    "coeff_sign_hash",
    "discriminant_sign",
    "has_complex_roots",
    "is_factorable",
    "max_coeff_magnitude",
    "gcd_of_coefficients",
]


def clean_equation_string(equation: str) -> str:
    """Cleans and standardizes raw mathematical equation strings.

    Handles LaTeX formatting (fractions, exponents, operators) and collapses
    extraneous whitespace for SymPy parsing.

    Args:
        equation: The raw equation string, possibly with LaTeX markup.

    Returns:
        Cleaned, evaluatable equation string.
    """
    if not equation:
        return ""

    s = equation.strip()

    # Normalize common LaTeX brackets and wrappers
    s = re.sub(r"\\left\(", "(", s)
    s = re.sub(r"\\right\)", ")", s)
    s = re.sub(r"\\left\[", "[", s)
    s = re.sub(r"\\right\]", "]", s)
    s = re.sub(r"\\left\{", "{", s)
    s = re.sub(r"\\right\}", "}", s)
    s = re.sub(r"\\mathbf\{([^}]+)\}", r"\1", s)
    s = re.sub(r"\\mathrm\{([^}]+)\}", r"\1", s)
    s = re.sub(r"\\text\{([^}]+)\}", r"\1", s)

    # Normalize LaTeX fractions: \frac{a}{b} -> ((a)/(b))
    prev = ""
    while s != prev:
        prev = s
        s = re.sub(r"\\d?frac\{([^{}]+)\}\{([^{}]+)\}", r"((\1)/(\2))", s)

    # Normalize exponents with curly braces: ^{2} -> ^(2)
    s = re.sub(r"\^{([^{}]+)\}", r"^(\1)", s)

    # Normalize math operators
    s = s.replace(r"\cdot", "*").replace(r"\times", "*")
    s = s.replace(r"\pm", "+")
    s = s.replace(r"\\", " ").replace("\\", "")

    # Collapse extra whitespace
    s = re.sub(r"\s+", " ", s).strip()
    return s


def hash_sign_pattern(sign_pattern: list[str]) -> int:
    """Computes a deterministic integer hash for a sign pattern.

    Uses a base-3 positional encoding where '+' maps to 1, '-' maps to 2, and '0'
    maps to 0. This provides a compact, collision-free, deterministic integer representation.

    Args:
        sign_pattern: List of sign strings (e.g., ['+', '+', '-']).

    Returns:
        Deterministic integer hash of the sign pattern.
    """
    val = 0
    for idx, s in enumerate(sign_pattern):
        digit = 1 if s == "+" else (2 if s == "-" else 0)
        val += digit * (3**idx)
    return int(val)


def compute_fingerprint(equation: str) -> dict[str, Any]:
    """Computes a structural fingerprint for a mathematical equation.

    Extracts:
    - Degree of polynomial
    - Number of terms
    - Sign pattern of coefficients (e.g. ['+', '+', '-'])
    - Discriminant sign (for quadratics: 1, 0, -1)
    - Root type ('all_real', 'some_complex', 'all_complex')
    - Whether equation is factorable over integers
    - Variable count (single vs multi-variable)

    Args:
        equation: Mathematical equation or expression string (e.g., "3x^2 + 5x - 2 = 0").

    Returns:
        Dictionary containing structural attributes and metadata.
    """
    cleaned = clean_equation_string(equation)
    if not cleaned:
        return _empty_fingerprint()

    # Guard against huge exponents (e.g. (1 - i)**2023) that hang SymPy parser
    high_powers = [int(m) for m in re.findall(r"(?:\*\*|\^)\s*(\d+)", cleaned)]
    if any(p > 10 for p in high_powers):
        return _fallback_fingerprint(cleaned)

    try:
        if "=" in cleaned:
            parts = cleaned.split("=", 1)
            lhs_expr = parse_expr(parts[0], transformations=SYMPY_TRANSFORMATIONS)
            rhs_expr = parse_expr(parts[1], transformations=SYMPY_TRANSFORMATIONS)
            expr = lhs_expr - rhs_expr
        else:
            expr = parse_expr(cleaned, transformations=SYMPY_TRANSFORMATIONS)
    except Exception as exc:
        logger.warning(
            "Failed to parse equation '%s' with SymPy: %s. Using fallback fingerprint.",
            equation,
            exc,
        )
        return _fallback_fingerprint(cleaned)

    try:
        symbols = sorted(list(expr.free_symbols), key=lambda s: s.name)
        variable_count = len(symbols)
        variable_type = "single" if variable_count <= 1 else "multi-variable"

        primary_var = symbols[0] if variable_count == 1 else None

        # Polynomial construction and degree determination
        poly: sp.Poly | None = None
        degree = 0
        if variable_count == 1 and primary_var is not None:
            try:
                poly = sp.Poly(expr, primary_var)
                degree = int(poly.degree())
            except Exception:
                degree = 0
        elif 1 < variable_count <= 3:
            try:
                poly = sp.Poly(expr, *symbols)
                degree = int(poly.total_degree())
            except Exception:
                degree = 1
        elif variable_count > 3:
            degree = 1
        else:
            degree = 0

        # Number of terms and coefficient extraction
        if hasattr(expr, "as_ordered_terms"):
            terms = expr.as_ordered_terms()
        else:
            terms = [expr]
        num_terms = len(terms) if terms else 1

        coeffs: list[float] = []
        sign_pattern: list[str] = []
        for t in terms:
            if hasattr(t, "as_coeff_Mul"):
                c, _ = t.as_coeff_Mul()
            else:
                c = 1.0
            try:
                val = float(c)
            except (TypeError, ValueError):
                val = 1.0
            coeffs.append(val)
            sign_pattern.append("+" if val > 0 else "-")

        if not sign_pattern:
            sign_pattern = ["+"]

        coeff_sign_hash = hash_sign_pattern(sign_pattern)

        # Discriminant calculation for quadratics
        discriminant_sign = 0
        discriminant_type = "none"
        if degree == 2 and variable_count == 1 and poly is not None and primary_var is not None:
            try:
                a_val = float(poly.coeff_monomial(primary_var**2))
                b_val = float(poly.coeff_monomial(primary_var**1))
                c_val = float(poly.coeff_monomial(primary_var**0))
                disc = b_val**2 - 4.0 * a_val * c_val
                if disc > 1e-9:
                    discriminant_sign = 1
                    discriminant_type = "positive"
                elif disc < -1e-9:
                    discriminant_sign = -1
                    discriminant_type = "negative"
                else:
                    discriminant_sign = 0
                    discriminant_type = "zero"
            except Exception as exc:
                logger.debug("Failed calculating quadratic discriminant: %s", exc)
                discriminant_sign = 0

        # Root classification (all real, some complex, all complex)
        root_type = "all_real"
        has_complex_roots = False
        if 1 <= degree <= 5 and variable_count == 1 and poly is not None:
            try:
                roots = poly.nroots(maxsteps=15)
                if roots:
                    real_roots = sum(1 for r in roots if abs(sp.im(r)) < 1e-7)
                    complex_roots = len(roots) - real_roots
                    if complex_roots == 0:
                        root_type = "all_real"
                        has_complex_roots = False
                    elif real_roots == 0:
                        root_type = "all_complex"
                        has_complex_roots = True
                    else:
                        root_type = "some_complex"
                        has_complex_roots = True
            except Exception as exc:
                logger.debug("Roots classification fallback for poly %s: %s", poly, exc)
                if discriminant_sign == -1:
                    root_type = "all_complex"
                    has_complex_roots = True

        # Factorability check over integers
        is_factorable = False
        if 2 <= degree <= 5 and variable_count == 1 and poly is not None and primary_var is not None:
            try:
                _, factors = sp.factor_list(poly)
                poly_deg_sum = sum(
                    mult for f, mult in factors if sp.Poly(f, primary_var).degree() >= 1
                )
                is_factorable = (len(factors) > 1 and poly_deg_sum >= 2) or any(
                    mult >= 2 for _, mult in factors
                )
            except Exception as exc:
                logger.debug("Factorization check failed: %s", exc)
                is_factorable = False

        # Coefficient magnitude and GCD calculation
        abs_coeffs = [abs(c) for c in coeffs if math.isfinite(c)]
        max_coeff = max(abs_coeffs) if abs_coeffs else 1.0
        max_coeff_magnitude = float(np.log1p(max_coeff))

        int_coeffs = [int(abs(round(c))) for c in coeffs if math.isfinite(c) and abs(c) >= 1e-4]
        gcd_of_coefficients = math.gcd(*int_coeffs) if int_coeffs else 1

        return {
            "degree": degree,
            "num_terms": num_terms,
            "sign_pattern": sign_pattern,
            "coeff_sign_hash": coeff_sign_hash,
            "discriminant_sign": discriminant_sign,
            "discriminant_type": discriminant_type,
            "root_type": root_type,
            "has_complex_roots": has_complex_roots,
            "is_factorable": is_factorable,
            "variable_count": variable_count,
            "variable_type": variable_type,
            "max_coeff_magnitude": max_coeff_magnitude,
            "gcd_of_coefficients": gcd_of_coefficients,
        }
    except Exception as exc:
        logger.error("Error computing fingerprint for equation '%s': %s", equation, exc)
        return _fallback_fingerprint(cleaned)


def _empty_fingerprint() -> dict[str, Any]:
    """Generates an empty default fingerprint for null or empty inputs."""
    return {
        "degree": 0,
        "num_terms": 0,
        "sign_pattern": ["+"],
        "coeff_sign_hash": 1,
        "discriminant_sign": 0,
        "discriminant_type": "none",
        "root_type": "all_real",
        "has_complex_roots": False,
        "is_factorable": False,
        "variable_count": 0,
        "variable_type": "single",
        "max_coeff_magnitude": 0.0,
        "gcd_of_coefficients": 1,
    }


def _fallback_fingerprint(cleaned_eq: str) -> dict[str, Any]:
    """Regex-based fallback fingerprint when SymPy parsing fails."""
    # Approximate degree by largest power
    powers = [int(m) for m in re.findall(r"\^(\d+)", cleaned_eq)]
    degree = max(powers) if powers else (1 if re.search(r"[a-zA-Z]", cleaned_eq) else 0)

    # Extract terms approximately
    terms = re.split(r"[+-]", cleaned_eq.split("=")[0])
    num_terms = max(1, len([t for t in terms if t.strip()]))

    # Approximate sign pattern
    first_char = cleaned_eq.strip()[0] if cleaned_eq.strip() else "+"
    initial_sign = "-" if first_char == "-" else "+"
    other_signs = re.findall(r"[+-]", cleaned_eq.lstrip("+-"))
    sign_pattern = [initial_sign] + other_signs if other_signs else [initial_sign]

    coeff_sign_hash = hash_sign_pattern(sign_pattern)
    numbers = [abs(float(n)) for n in re.findall(r"\b\d+(?:\.\d+)?\b", cleaned_eq)]
    max_coeff_magnitude = float(np.log1p(max(numbers))) if numbers else 0.0
    int_numbers = [int(round(n)) for n in numbers if n > 0]
    gcd_of_coefficients = math.gcd(*int_numbers) if int_numbers else 1

    return {
        "degree": degree,
        "num_terms": num_terms,
        "sign_pattern": sign_pattern,
        "coeff_sign_hash": coeff_sign_hash,
        "discriminant_sign": 0,
        "discriminant_type": "none",
        "root_type": "all_real",
        "has_complex_roots": False,
        "is_factorable": False,
        "variable_count": 1 if re.search(r"[a-zA-Z]", cleaned_eq) else 0,
        "variable_type": "single",
        "max_coeff_magnitude": max_coeff_magnitude,
        "gcd_of_coefficients": gcd_of_coefficients,
    }


def fingerprint_to_feature_vector(fingerprint: dict[str, Any]) -> list[float]:
    """Converts equation fingerprints into a numerical feature vector for sklearn.

    Features (in order):
    1. degree (int)
    2. num_terms (int)
    3. coeff_sign_hash (int, hash of sign pattern)
    4. discriminant_sign (int: -1, 0, 1)
    5. has_complex_roots (bool -> int: 0 or 1)
    6. is_factorable (bool -> int: 0 or 1)
    7. max_coeff_magnitude (float, log-scaled)
    8. gcd_of_coefficients (int)

    Args:
        fingerprint: Dictionary generated by compute_fingerprint.

    Returns:
        List of 8 numerical features.
    """
    return [
        float(fingerprint.get("degree", 0)),
        float(fingerprint.get("num_terms", 0)),
        float(fingerprint.get("coeff_sign_hash", 0)),
        float(fingerprint.get("discriminant_sign", 0)),
        1.0 if fingerprint.get("has_complex_roots") else 0.0,
        1.0 if fingerprint.get("is_factorable") else 0.0,
        float(fingerprint.get("max_coeff_magnitude", 0.0)),
        float(fingerprint.get("gcd_of_coefficients", 1)),
    ]


def infer_equation_type(fingerprint: dict[str, Any]) -> str:
    """Infers the mathematical equation type from its fingerprint.

    Args:
        fingerprint: Equation fingerprint dictionary.

    Returns:
        Type label (e.g., 'quadratic', 'linear', 'cubic', 'polynomial', 'constant').
    """
    degree = fingerprint.get("degree", 0)
    var_count = fingerprint.get("variable_count", 1)

    if var_count > 1:
        return "system" if degree == 1 else "multivariable_polynomial"

    if degree == 1:
        return "linear"
    if degree == 2:
        return "quadratic"
    if degree == 3:
        return "cubic"
    if degree > 3:
        return "polynomial"
    return "constant"


def abstract_text(text: str, var_map: dict[str, str] | None = None) -> tuple[str, dict[str, str]]:
    """Abstracts specific numerical literals in text with placeholders (a, b, c, ...).

    Preserves mathematical exponents (e.g., ^2, ^3) and LaTeX commands while
    replacing coefficient and scalar numbers.

    Args:
        text: Input string containing mathematical explanations or formulas.
        var_map: Existing dictionary mapping numeric strings to placeholder variables.

    Returns:
        Tuple of (abstracted_text, updated_var_map).
    """
    if var_map is None:
        var_map = {}

    placeholders = [
        "a", "b", "c", "d", "e", "f", "g", "h", "k", "m", "n", "p", "q", "r", "s", "t"
    ]

    def replacer(match: re.Match[str]) -> str:
        num = match.group(0)
        if num not in var_map:
            idx = len(var_map)
            placeholder = placeholders[idx] if idx < len(placeholders) else f"c_{idx}"
            var_map[num] = placeholder
        return var_map[num]

    # Replace numbers that are not exponents (i.e. not immediately preceded by ^ or ^{)
    abstracted = re.sub(r"(?<!\^)(?<!\^\()\b\d+(?:\.\d+)?\b", replacer, text)
    return abstracted, var_map


def abstract_step(
    step: dict[str, Any] | str, var_map: dict[str, str] | None = None
) -> tuple[dict[str, Any] | str, dict[str, str]]:
    """Abstracts a single solution step dictionary or string.

    Args:
        step: Either a step dict (with fields like explanation, math) or a plain string.
        var_map: Existing mapping from numbers to placeholder symbols.

    Returns:
        Tuple of (abstracted_step, updated_var_map).
    """
    if var_map is None:
        var_map = {}

    if isinstance(step, str):
        return abstract_text(step, var_map)

    if not isinstance(step, dict):
        return step, var_map

    abstracted_dict: dict[str, Any] = {}
    for k, v in step.items():
        if k in ("stepNumber", "step_number", "step", "index", "id"):
            abstracted_dict[k] = v
        elif isinstance(v, str):
            abs_str, var_map = abstract_text(v, var_map)
            abstracted_dict[k] = abs_str
        elif isinstance(v, list):
            # Nested items like subSteps
            new_list = []
            for item in v:
                if isinstance(item, (dict, str)):
                    abs_item, var_map = abstract_step(item, var_map)
                    new_list.append(abs_item)
                else:
                    new_list.append(item)
            abstracted_dict[k] = new_list
        elif isinstance(v, dict):
            abs_dict, var_map = abstract_step(v, var_map)
            abstracted_dict[k] = abs_dict
        else:
            abstracted_dict[k] = v

    return abstracted_dict, var_map


def abstract_step_sequence(
    steps: list[dict[str, Any] | str], equation_str: str = ""
) -> list[dict[str, Any]]:
    """Abstracts an entire sequence of steps, consistently binding equation coefficients.

    Extracts numbers present in the equation first so that equation coefficients
    are naturally bound to 'a', 'b', 'c', followed by intermediate step values.

    Args:
        steps: List of steps (dicts or strings).
        equation_str: Original equation string for initial placeholder anchoring.

    Returns:
        List of abstracted step dictionaries.
    """
    var_map: dict[str, str] = {}
    if equation_str:
        # Pre-seed var_map with numbers found in the equation
        clean_eq = clean_equation_string(equation_str)
        abstract_text(clean_eq, var_map)

    abstracted_steps: list[dict[str, Any]] = []
    for step in steps:
        abs_s, var_map = abstract_step(step, var_map)
        if isinstance(abs_s, str):
            abstracted_steps.append({"explanation": abs_s, "math": ""})
        elif isinstance(abs_s, dict):
            abstracted_steps.append(abs_s)

    return abstracted_steps


class PatternDatabase:
    """Pattern matching database for equations and solution step templates.

    Uses scikit-learn's NearestNeighbors for k-nearest equation retrieval based on
    structural fingerprints and extracts abstracted step templates grouped by
    equation type and cluster.
    """

    def __init__(self) -> None:
        """Initializes an empty PatternDatabase."""
        self.entries: list[dict[str, Any]] = []
        self.feature_vectors: list[list[float]] = []
        self.scaler: StandardScaler = StandardScaler()
        self.nn_index: NearestNeighbors | None = None
        self.templates: dict[str, list[dict[str, Any]]] = {}
        self.cluster_centers: dict[str, list[list[float]]] = {}
        self.type_indices: dict[str, list[int]] = {}
        self.is_indexed: bool = False

    def add_entry(self, entry: dict[str, Any]) -> None:
        """Adds an equation entry to the database.

        If fingerprint or feature_vector are missing, they are automatically computed.
        If equation type is missing, it is inferred from the fingerprint.

        Args:
            entry: Dictionary representing an equation problem with optional steps.
        """
        entry_copy = dict(entry)

        # Standardize equation text field
        eq_text = (
            entry_copy.get("equation")
            or entry_copy.get("problem")
            or entry_copy.get("expression")
            or entry_copy.get("inputExpression")
            or ""
        )
        entry_copy["equation"] = str(eq_text)

        # Compute or validate fingerprint
        if "fingerprint" not in entry_copy or not isinstance(entry_copy["fingerprint"], dict):
            coeffs = entry_copy.get("coefficients")
            deg = entry_copy.get("degree")
            if deg is not None and coeffs and isinstance(coeffs, list) and len(coeffs) > 0:
                abs_coeffs = [abs(c) for c in coeffs if isinstance(c, (int, float)) and math.isfinite(c)]
                max_c = max(abs_coeffs) if abs_coeffs else 1.0
                sign_pat = ["+" if c > 0 else "-" for c in coeffs if isinstance(c, (int, float))] or ["+"]
                disc_sign = 0
                if deg == 2 and len(coeffs) >= 3:
                    a, b, c = coeffs[0], coeffs[1], coeffs[2]
                    d_val = b * b - 4.0 * a * c
                    disc_sign = 1 if d_val > 1e-9 else (-1 if d_val < -1e-9 else 0)
                int_c = [int(abs(round(c))) for c in coeffs if isinstance(c, (int, float)) and math.isfinite(c) and abs(c) >= 1e-4]
                entry_copy["fingerprint"] = {
                    "degree": int(deg),
                    "num_terms": len(coeffs),
                    "sign_pattern": sign_pat,
                    "coeff_sign_hash": hash_sign_pattern(sign_pat),
                    "discriminant_sign": disc_sign,
                    "discriminant_type": "positive" if disc_sign == 1 else ("negative" if disc_sign == -1 else "zero"),
                    "root_type": "all_real" if disc_sign >= 0 else "all_complex",
                    "has_complex_roots": disc_sign < 0,
                    "is_factorable": disc_sign >= 0,
                    "variable_count": 1,
                    "variable_type": "single",
                    "max_coeff_magnitude": float(np.log1p(max_c)),
                    "gcd_of_coefficients": math.gcd(*int_c) if int_c else 1,
                }
            else:
                entry_copy["fingerprint"] = compute_fingerprint(entry_copy["equation"])

        # Compute or validate feature vector
        if "feature_vector" not in entry_copy or not entry_copy["feature_vector"]:
            entry_copy["feature_vector"] = fingerprint_to_feature_vector(entry_copy["fingerprint"])

        # Standardize equation type
        eq_type = (
            entry_copy.get("type")
            or entry_copy.get("equation_type")
            or entry_copy.get("toolType")
            or entry_copy.get("category")
            or infer_equation_type(entry_copy["fingerprint"])
        )
        entry_copy["type"] = str(eq_type)

        idx = len(self.entries)
        self.entries.append(entry_copy)
        self.feature_vectors.append(entry_copy["feature_vector"])
        self.type_indices.setdefault(eq_type, []).append(idx)
        self.is_indexed = False

    def build_index(self) -> None:
        """Builds the scikit-learn NearestNeighbors index and feature scaler."""
        if not self.entries:
            logger.warning("No entries in database to build index.")
            self.nn_index = None
            self.is_indexed = False
            return

        try:
            X = np.array(self.feature_vectors, dtype=np.float64)
            # Handle potential zero-variance features safely
            self.scaler = StandardScaler(with_mean=True, with_std=True)
            X_scaled = self.scaler.fit_transform(X)

            # Avoid division by zero in zero-variance columns by fallback
            if np.isnan(X_scaled).any():
                X_scaled = np.nan_to_num(X_scaled, nan=0.0)

            n_neighbors = min(len(self.entries), 5)
            self.nn_index = NearestNeighbors(
                n_neighbors=n_neighbors, metric="euclidean", algorithm="auto"
            )
            self.nn_index.fit(X_scaled)
            self.is_indexed = True
            logger.info("Successfully built NearestNeighbors index with %d entries.", len(self.entries))
        except Exception as exc:
            logger.error("Failed building NearestNeighbors index: %s", exc)
            self.nn_index = None
            self.is_indexed = False

    def cluster_and_extract_templates(
        self, min_cluster_size: int = 3
    ) -> dict[str, list[dict[str, Any]]]:
        """Clusters equations within each type and extracts abstracted step templates.

        For each cluster, finds the most common step sequence pattern among equations
        and abstracts the numbers into variable placeholders.

        Args:
            min_cluster_size: Minimum number of equations required to form an abstracted template.

        Returns:
            Dictionary mapping cluster keys (e.g., 'quadratic::0') to step templates.
        """
        self.templates.clear()
        self.cluster_centers.clear()

        if not self.entries:
            return self.templates

        for eq_type, indices in self.type_indices.items():
            if not indices:
                continue

            type_entries = [self.entries[i] for i in indices]
            type_features = [self.feature_vectors[i] for i in indices]
            num_samples = len(type_entries)

            # Determine number of clusters
            if num_samples < min_cluster_size:
                labels = [0] * num_samples
                centers = [np.mean(type_features, axis=0).tolist()]
            else:
                n_clusters = max(1, min(num_samples // min_cluster_size, 6))
                try:
                    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
                    labels = kmeans.fit_predict(type_features).tolist()
                    centers = kmeans.cluster_centers_.tolist()
                except Exception as exc:
                    logger.warning("KMeans failed for type '%s': %s. Falling back to single cluster.", eq_type, exc)
                    labels = [0] * num_samples
                    centers = [np.mean(type_features, axis=0).tolist()]

            self.cluster_centers[eq_type] = centers

            # Group entries by assigned cluster ID
            cluster_groups: dict[int, list[dict[str, Any]]] = collections.defaultdict(list)
            for entry, label in zip(type_entries, labels):
                entry["cluster_id"] = label
                cluster_groups[label].append(entry)

            # Extract step templates per cluster
            for cluster_id, cluster_entries in cluster_groups.items():
                if len(cluster_entries) < min_cluster_size and num_samples >= min_cluster_size:
                    logger.debug(
                        "Skipping cluster %d for type %s: size %d < min %d",
                        cluster_id,
                        eq_type,
                        len(cluster_entries),
                        min_cluster_size,
                    )
                    continue

                # Collect step sequences
                entries_with_steps = [e for e in cluster_entries if e.get("steps")]
                if not entries_with_steps:
                    continue

                # Find the most common step sequence pattern
                pattern_counts: collections.Counter[tuple[str, ...]] = collections.Counter()
                entry_by_pattern: dict[tuple[str, ...], dict[str, Any]] = {}

                for entry in entries_with_steps:
                    steps = entry["steps"]
                    if not isinstance(steps, list):
                        continue

                    # Create canonical step signature by replacing numbers with token
                    signature = tuple(
                        re.sub(r"\d+", "#", s.get("explanation", "") if isinstance(s, dict) else str(s))
                        for s in steps
                    )
                    pattern_counts[signature] += 1
                    if signature not in entry_by_pattern:
                        entry_by_pattern[signature] = entry

                if not pattern_counts:
                    continue

                most_common_sig, _ = pattern_counts.most_common(1)[0]
                representative_entry = entry_by_pattern[most_common_sig]

                # Abstract the representative sequence
                template = abstract_step_sequence(
                    representative_entry["steps"], representative_entry.get("equation", "")
                )

                cluster_key = f"{eq_type}::{cluster_id}"
                self.templates[cluster_key] = template
                logger.info(
                    "Extracted step template for '%s' (cluster size: %d, steps: %d)",
                    cluster_key,
                    len(cluster_entries),
                    len(template),
                )

                # Set default template for equation type if not already set
                if eq_type not in self.templates:
                    self.templates[eq_type] = template

        return self.templates

    def find_similar(self, equation: str, k: int = 5) -> list[dict[str, Any]]:
        """Finds the top-k most similar equations in the database using KNN.

        Args:
            equation: Query equation string.
            k: Number of similar neighbors to retrieve (default: 5).

        Returns:
            List of matching entry dictionaries, each augmented with 'distance'
            and 'similarity_score'.
        """
        if not self.entries:
            return []

        if not self.is_indexed or self.nn_index is None:
            self.build_index()

        if self.nn_index is None:
            return []

        try:
            query_fp = compute_fingerprint(equation)
            query_vec = fingerprint_to_feature_vector(query_fp)
            scaled_query = self.scaler.transform([query_vec])

            n_neighbors = min(k, len(self.entries))
            distances, indices = self.nn_index.kneighbors(scaled_query, n_neighbors=n_neighbors)

            results: list[dict[str, Any]] = []
            for dist, idx in zip(distances[0], indices[0]):
                entry_match = dict(self.entries[idx])
                entry_match["distance"] = float(dist)
                entry_match["similarity_score"] = float(1.0 / (1.0 + dist))
                results.append(entry_match)

            return results
        except Exception as exc:
            logger.error("Error finding similar equations for '%s': %s", equation, exc)
            return []

    def get_step_template(self, equation_type: str, fingerprint: dict[str, Any]) -> list[dict[str, Any]]:
        """Retrieves the best matching abstracted step template for an equation.

        Compares the equation fingerprint's feature vector to cluster centers for
        the specified equation type to find the closest matching cluster.

        Args:
            equation_type: Category/type of equation (e.g., 'quadratic', 'linear').
            fingerprint: Equation fingerprint dictionary.

        Returns:
            List of abstracted step dictionaries, or an empty list if none found.
        """
        if not self.templates:
            logger.debug("No templates extracted in database.")
            return []

        centers = self.cluster_centers.get(equation_type)
        if centers:
            try:
                query_vec = fingerprint_to_feature_vector(fingerprint)
                scaled_query = self.scaler.transform([query_vec])[0]
                scaled_centers = self.scaler.transform(centers)

                # Find nearest cluster center that has an extracted template
                best_cluster_id = -1
                best_dist = float("inf")
                for cid, center in enumerate(scaled_centers):
                    cluster_key = f"{equation_type}::{cid}"
                    if cluster_key in self.templates:
                        dist = float(np.linalg.norm(scaled_query - center))
                        if dist < best_dist:
                            best_dist = dist
                            best_cluster_id = cid

                if best_cluster_id != -1:
                    return self.templates[f"{equation_type}::{best_cluster_id}"]
            except Exception as exc:
                logger.debug("Distance computation to cluster centers failed: %s", exc)

        # Fallback 1: Type-level default template
        if equation_type in self.templates:
            return self.templates[equation_type]

        # Fallback 2: Any template matching equation_type prefix
        for key, tmpl in self.templates.items():
            if key.startswith(f"{equation_type}::"):
                return tmpl

        # Fallback 3: Nearest neighbor with steps
        similar = self.find_similar(fingerprint.get("equation", "x"), k=3)
        for match in similar:
            if match.get("steps") and isinstance(match["steps"], list):
                return abstract_step_sequence(match["steps"], match.get("equation", ""))

        return []

    def save(self, path: Path | str) -> None:
        """Serializes the pattern database to a JSON file.

        Args:
            path: Destination file path.
        """
        target_path = Path(path)
        try:
            target_path.parent.mkdir(parents=True, exist_ok=True)
            scaler_mean = self.scaler.mean_.tolist() if hasattr(self.scaler, "mean_") and self.scaler.mean_ is not None else []
            scaler_scale = self.scaler.scale_.tolist() if hasattr(self.scaler, "scale_") and self.scaler.scale_ is not None else []

            payload = {
                "version": "1.0.0",
                "feature_names": FEATURE_NAMES,
                "entries": self.entries,
                "templates": self.templates,
                "cluster_centers": self.cluster_centers,
                "scaler": {
                    "mean": scaler_mean,
                    "scale": scaler_scale,
                },
            }

            with open(target_path, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2, ensure_ascii=False)

            logger.info("Saved PatternDatabase with %d entries to %s", len(self.entries), target_path)
        except Exception as exc:
            logger.error("Failed saving PatternDatabase to %s: %s", target_path, exc)
            raise

    def load(self, path: Path | str) -> None:
        """Loads and reconstructs the pattern database from a JSON file.

        Args:
            path: Path to serialized JSON file.
        """
        source_path = Path(path)
        if not source_path.exists():
            raise FileNotFoundError(f"Pattern database file not found: {source_path}")

        try:
            with open(source_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            self.entries = data.get("entries", [])
            self.templates = data.get("templates", {})
            self.cluster_centers = data.get("cluster_centers", {})

            self.feature_vectors = []
            self.type_indices = {}
            for idx, entry in enumerate(self.entries):
                feat = entry.get("feature_vector")
                if not feat:
                    fp = entry.get("fingerprint") or compute_fingerprint(entry.get("equation", ""))
                    feat = fingerprint_to_feature_vector(fp)
                    entry["feature_vector"] = feat
                self.feature_vectors.append(feat)

                eq_type = entry.get("type", "unknown")
                self.type_indices.setdefault(eq_type, []).append(idx)

            # Rebuild the NearestNeighbors index and scaler
            self.build_index()
            logger.info("Loaded PatternDatabase with %d entries from %s", len(self.entries), source_path)
        except Exception as exc:
            logger.error("Failed loading PatternDatabase from %s: %s", source_path, exc)
            raise
