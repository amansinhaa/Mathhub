import { MetadataRoute } from 'next';

const BASE = 'https://www.easyequate.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Exam-board formula sheet pages
  const boards = ['gcse', 'a-level', 'edexcel', 'aqa', 'igcse', 'class-10', 'class-12'];

  // Learn tutorial articles
  const learnArticles = [
    'what-is-a-function',
    'how-to-find-domain-and-range',
    'how-to-graph-a-quadratic-function',
  ];

  return [
    // ── Core tool pages ────────────────────────────────────────────────
    { url: `${BASE}/calculator`,              lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/solver`,                  lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/graph`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/formulas`,                lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },

    // ── Dedicated solver landing pages ─────────────────────────────────
    { url: `${BASE}/derivative-calculator`,     lastModified: now, changeFrequency: 'weekly',   priority: 0.95 },
    { url: `${BASE}/integral-calculator`,       lastModified: now, changeFrequency: 'weekly',   priority: 0.95 },
    { url: `${BASE}/quadratic-equation-solver`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${BASE}/equation-solver-with-steps`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/matrix-solver`,            lastModified: now, changeFrequency: 'monthly', priority: 0.85 },

    // ── Exam-board formula sheet pages ─────────────────────────────────
    ...boards.map((board) => ({
      url: `${BASE}/formula-sheet/${board}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),

    // ── Learn / tutorial articles ──────────────────────────────────────
    { url: `${BASE}/learn`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    ...learnArticles.map((slug) => ({
      url: `${BASE}/learn/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    // ── Informational & Legal pages (Google AdSense compliance) ────────
    { url: `${BASE}/about`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/privacy-policy`,          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/terms`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
