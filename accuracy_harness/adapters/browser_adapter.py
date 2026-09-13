"""
Playwright Browser Adapter
Drives the live website UI to test real browser rendering, input handling, and classification badges.
"""

import time
import urllib.parse
from typing import Any, Dict
from playwright.sync_api import sync_playwright
from adapters.base import BaseAdapter, SolverOutput

class BrowserAdapter(BaseAdapter):
    """Automates real browser interaction via Playwright."""

    def __init__(self, base_url: str = "http://localhost:4321", headless: bool = True):
        self.base_url = base_url.rstrip("/")
        self.headless = headless
        self._pw = None
        self._browser = None

    def _ensure_browser(self):
        if not self._browser:
            self._pw = sync_playwright().start()
            self._browser = self._pw.chromium.launch(headless=self.headless)

    def close(self):
        if self._browser:
            self._browser.close()
            self._browser = None
        if self._pw:
            self._pw.stop()
            self._pw = None

    def solve(self, case: Dict[str, Any], category: str) -> SolverOutput:
        self._ensure_browser()
        start_t = time.perf_counter()
        case_id = case.get("id", "")
        raw_input = case.get("input")

        # In browser, handle multi-line systems vs single equation
        query_eq = raw_input if isinstance(raw_input, str) else ", ".join(raw_input)

        context = self._browser.new_context()
        page = context.new_page()

        try:
            # Navigate to solver with equation preloaded in query param or type into input
            encoded_eq = urllib.parse.quote(query_eq)
            target_url = f"{self.base_url}/solver?eq={encoded_eq}"
            page.goto(target_url, timeout=15000)

            # Wait for solution card or step container
            page.wait_for_selector("#direct-solution, [data-testid='solution-card'], .katex", timeout=8000)

            # Extract final answer
            sol_elem = page.query_selector("#direct-solution") or page.query_selector(".katex-display")
            raw_answer = sol_elem.inner_text().strip() if sol_elem else ""

            # Extract equation classification badge if visible
            badge_elem = page.query_selector("[class*='font-mono'][class*='uppercase']")
            eq_type = badge_elem.inner_text().strip() if badge_elem else ""

            elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
            context.close()

            return SolverOutput(
                case_id=case_id,
                input_text=raw_input,
                raw_answer=raw_answer,
                equation_type=eq_type,
                status="success",
                execution_time_ms=elapsed_ms
            )
        except Exception as e:
            elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
            context.close()
            return SolverOutput(
                case_id=case_id,
                input_text=raw_input,
                raw_answer="",
                equation_type="",
                status="error",
                error_message=str(e),
                execution_time_ms=elapsed_ms
            )
