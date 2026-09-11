import katex from 'katex';
import { FormulaEntry } from '@/types/formula';

/**
 * Escapes HTML characters in text strings.
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Human-readable curriculum level badge label.
 */
function formatLevelBadge(level?: string): string {
  if (!level) return '';
  switch (level) {
    case 'class10':
      return 'Class 10';
    case 'class12':
      return 'Class 12';
    case 'higher_ed':
      return 'Higher Ed';
    default:
      return level.toUpperCase();
  }
}

/**
 * Generates a self-contained, laboratory-grade printable HTML document
 * rendering all mathematical formulas in true WYSIWYG notation via KaTeX.
 */
export function generatePrintableHtml(
  formulas: FormulaEntry[],
  title: string = 'EasyEquate Formula Reference Sheet'
): string {
  const safeTitle = escapeHtml(title);
  const formulaCount = formulas.length;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const cardsHtml = formulas
    .map((f, idx) => {
      let mathHtml = '';
      try {
        mathHtml = katex.renderToString(f.latex, {
          displayMode: true,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch {
        mathHtml = `<div class="card-math-fallback"><code>${escapeHtml(f.latex)}</code></div>`;
      }

      const levelLabel = formatLevelBadge(f.level);
      const categoryLabel = escapeHtml(f.category || 'General');
      const name = escapeHtml(f.name);
      const desc = escapeHtml(f.description);

      return `
        <article class="formula-card">
          <div class="card-head">
            <h3 class="card-title"><span class="card-index">${idx + 1}.</span> ${name}</h3>
            <div class="card-badges">
              ${levelLabel ? `<span class="badge-level">${levelLabel}</span>` : ''}
              <span class="badge-cat">${categoryLabel}</span>
            </div>
          </div>
          <div class="card-math">
            ${mathHtml}
          </div>
          ${desc ? `<p class="card-desc">${desc}</p>` : ''}
        </article>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EasyEquate — ${safeTitle}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" crossorigin="anonymous">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #131313;
      background: #F8F9FA;
      -webkit-font-smoothing: antialiased;
    }

    /* Screen Top Action Toolbar (Hidden during Print) */
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #ffffff;
      border-bottom: 1px solid #E0E0E0;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .toolbar-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .toolbar-title {
      font-weight: 700;
      font-size: 13px;
      color: #131313;
    }
    .toolbar-hint {
      font-size: 11px;
      color: #616161;
      background: #EFEBE9;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #D7CCC8;
    }
    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
    .btn-print {
      background: #5D4037;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .btn-print:hover {
      background: #4E342E;
    }
    .btn-close {
      background: #FAFAFA;
      color: #5D4037;
      border: 1px solid #D7CCC8;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-close:hover {
      background: #EFEBE9;
    }

    /* Document Sheet Wrapper */
    .sheet-wrapper {
      max-width: 860px;
      margin: 20px auto 40px auto;
      background: #ffffff;
      padding: 28px 32px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      border-radius: 10px;
    }

    /* Header Banner (#5D4037) */
    .sheet-header {
      background: #5D4037;
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .sheet-brand {
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .sheet-subtitle {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.95;
    }
    .sheet-meta {
      font-size: 10.5px;
      color: #616161;
      margin-bottom: 16px;
      padding-bottom: 6px;
      border-bottom: 1px solid #E0E0E0;
      display: flex;
      justify-content: space-between;
    }

    /* 2-Column Responsive Grid */
    .formula-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (max-width: 640px) {
      .formula-grid {
        grid-template-columns: 1fr;
      }
      .toolbar-hint {
        display: none;
      }
    }

    /* Formula Cards */
    .formula-card {
      border: 1px solid #E0E0E0;
      border-radius: 8px;
      padding: 10px 14px;
      background: #FAFAFA;
      break-inside: avoid;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
      gap: 6px;
    }
    .card-title {
      font-size: 12px;
      font-weight: 700;
      color: #131313;
      margin: 0;
      line-height: 1.3;
    }
    .card-index {
      color: #5D4037;
    }
    .card-badges {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }
    .badge-level {
      font-size: 8.5px;
      font-weight: 700;
      color: #5D4037;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      background: #F5F5F5;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #E0E0E0;
    }
    .badge-cat {
      font-size: 8.5px;
      font-weight: 700;
      color: #5D4037;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      background: #EFEBE9;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #D7CCC8;
    }
    .card-math {
      font-size: 13.5px;
      padding: 8px 10px;
      background: #ffffff;
      border: 1px solid #EAEAEA;
      border-radius: 6px;
      text-align: center;
      margin: 4px 0 6px 0;
      color: #131313;
      overflow-x: auto;
    }
    .card-math .katex-display {
      margin: 0.25em 0 !important;
    }
    .card-desc {
      font-size: 9.5px;
      color: #616161;
      font-style: italic;
      margin: 0;
      line-height: 1.35;
    }
    .sheet-footer {
      margin-top: 20px;
      font-size: 9.5px;
      color: #9E9E9E;
      text-align: center;
      border-top: 1px solid #E0E0E0;
      padding-top: 8px;
    }

    /* Print Stylesheet */
    @media print {
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .toolbar {
        display: none !important;
      }
      .sheet-wrapper {
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
      .formula-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
      }
      .formula-card {
        border: 1px solid #D6D6D6 !important;
        background: #FAFAFA !important;
      }
      .card-math {
        border: 1px solid #E2E2E2 !important;
        background: #ffffff !important;
      }
    }
  </style>
</head>
<body>
  <nav class="toolbar" aria-label="Formula Sheet Toolbar">
    <div class="toolbar-info">
      <span class="toolbar-title">Formula Sheet Preview</span>
      <span class="toolbar-hint">Tip: Choose "Save as PDF" to download the PDF file</span>
    </div>
    <div class="toolbar-actions">
      <button type="button" class="btn-print" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>Save as PDF / Print</span>
      </button>
      <button type="button" class="btn-close" onclick="window.close()">Close</button>
    </div>
  </nav>

  <main class="sheet-wrapper">
    <header class="sheet-header">
      <div class="sheet-brand">EASYEQUATE</div>
      <div class="sheet-subtitle">${safeTitle.toUpperCase()}</div>
    </header>
    <div class="sheet-meta">
      <span>Curated Reference Sheet • ${formulaCount} Formulas • EasyEquate.com</span>
      <span>${currentDate}</span>
    </div>
    <div class="formula-grid">
      ${cardsHtml}
    </div>
    <footer class="sheet-footer">
      EasyEquate — All-in-One Step-by-Step Math & Graphing Studio • https://easyequate.com
    </footer>
  </main>

  <script>
    // Automatically trigger the print/PDF dialog once KaTeX webfonts are active
    window.addEventListener('load', function() {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
          setTimeout(function() {
            try { window.print(); } catch(e) {}
          }, 250);
        });
      } else {
        setTimeout(function() {
          try { window.print(); } catch(e) {}
        }, 400);
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Exports formulas as an authentic, laboratory-grade WYSIWYG PDF / Printable sheet.
 * Renders true KaTeX mathematical notation (fractions, radicals, powers, integrals)
 * instead of raw LaTeX or ASCII code.
 */
export function exportFormulaSheetPdf(
  formulas: FormulaEntry[],
  title: string = 'EasyEquate Formula Reference Sheet'
): void {
  if (typeof window === 'undefined') return;

  if (!formulas || formulas.length === 0) {
    alert('No formulas selected to export.');
    return;
  }

  const html = generatePrintableHtml(formulas, title);

  // 1. Try opening dedicated printable preview window
  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank');
  } catch {
    printWindow = null;
  }

  if (printWindow && !printWindow.closed) {
    try {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      return;
    } catch {
      // If writing to window failed due to browser restriction, fall through to iframe
    }
  }

  // 2. Fallback: seamless hidden iframe print if pop-ups are blocked
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    const triggerPrint = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print error:', e);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 60000);
        }
      }, 350);
    };

    if (iframe.contentWindow) {
      iframe.contentWindow.onload = triggerPrint;
    } else {
      triggerPrint();
    }
  }
}
