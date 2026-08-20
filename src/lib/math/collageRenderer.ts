import { SavedGraphSnapshot, CollageLayout } from '@/types/graph';
import { generatePlotData, generateNiceTicks, formatAxisNumber, pointsToSvgPath } from './graphData';
import { isImplicitEquation, generateImplicitContour, segmentsToSvgPath } from './implicitPlot';
import { jsPDF } from 'jspdf';

/**
 * Get grid dimensions (columns and rows) from layout enum
 */
export function getLayoutDimensions(layout: CollageLayout): { cols: number; rows: number } {
  switch (layout) {
    case '1x2':
      return { cols: 2, rows: 1 };
    case '2x1':
      return { cols: 1, rows: 2 };
    case '2x2':
      return { cols: 2, rows: 2 };
    case '2x3':
      return { cols: 3, rows: 2 };
    case '3x2':
      return { cols: 2, rows: 3 };
    case '3x3':
      return { cols: 3, rows: 3 };
    default:
      return { cols: 2, rows: 2 };
  }
}

/**
 * Auto-suggest the optimal layout given the number of selected graphs
 */
export function suggestLayout(count: number): CollageLayout {
  if (count <= 2) return '1x2';
  if (count <= 4) return '2x2';
  if (count <= 6) return '2x3';
  return '3x3';
}

/**
 * Render a single mathematical graph snapshot into an SVG string with origin-centric axes.
 */
export function renderSnapshotToSvg(
  snapshot: SavedGraphSnapshot,
  cellWidth: number,
  cellHeight: number,
  options: {
    showTitle?: boolean;
    showRanges?: boolean;
    customTitle?: string;
    theme?: 'light' | 'dark';
  } = {}
): string {
  const { showTitle = true, showRanges = true, customTitle, theme = 'light' } = options;

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#111827' : '#ffffff';
  const axisColor = isDark ? '#f3f4f6' : '#1f2937';
  const gridColor = isDark ? '#1f2937' : '#e5e7eb';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  const headerHeight = showTitle ? (showRanges ? 34 : 22) : 10;
  const padding = { top: headerHeight + 10, right: 18, bottom: 20, left: 22 };

  const plotBox = {
    left: padding.left,
    top: padding.top,
    width: Math.max(1, cellWidth - padding.left - padding.right),
    height: Math.max(1, cellHeight - padding.top - padding.bottom),
  };

  const bounds = snapshot.bounds || { xMin: -8, xMax: 8, yMin: -8, yMax: 8 };
  const xSpan = Math.max(1e-9, bounds.xMax - bounds.xMin);
  const ySpan = Math.max(1e-9, bounds.yMax - bounds.yMin);

  const toPxX = (x: number) => plotBox.left + ((x - bounds.xMin) / xSpan) * plotBox.width;
  const toPxY = (y: number) => plotBox.top + ((bounds.yMax - y) / ySpan) * plotBox.height;

  const originPxX = toPxX(0);
  const originPxY = toPxY(0);

  const axisLineY = Math.max(plotBox.top, Math.min(plotBox.top + plotBox.height, originPxY));
  const axisLineX = Math.max(plotBox.left, Math.min(plotBox.left + plotBox.width, originPxX));

  const xTicks = generateNiceTicks(bounds.xMin, bounds.xMax, 6);
  const yTicks = generateNiceTicks(bounds.yMin, bounds.yMax, 6);

  // Generate Grid lines SVG
  let gridLinesSvg = '';
  xTicks.forEach((xVal) => {
    const px = toPxX(xVal);
    if (px >= plotBox.left && px <= plotBox.left + plotBox.width) {
      gridLinesSvg += `<line x1="${px.toFixed(1)}" y1="${plotBox.top}" x2="${px.toFixed(1)}" y2="${(plotBox.top + plotBox.height).toFixed(1)}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="2 2" />`;
    }
  });
  yTicks.forEach((yVal) => {
    const py = toPxY(yVal);
    if (py >= plotBox.top && py <= plotBox.top + plotBox.height) {
      gridLinesSvg += `<line x1="${plotBox.left}" y1="${py.toFixed(1)}" x2="${(plotBox.left + plotBox.width).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="2 2" />`;
    }
  });

  // Generate Curves SVG
  let curvesSvg = '';
  const expressions = snapshot.expressions || (snapshot.equations ? snapshot.equations.map((e) => e.expression) : ['x^2']);
  const equations = snapshot.equations || expressions.map((expr, i) => ({
    id: `eq-${i}`,
    expression: expr,
    color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][i % 5],
    visible: true,
  }));

  equations.forEach((eq) => {
    if (!eq.visible || !eq.expression.trim()) return;
    if (isImplicitEquation(eq.expression)) {
      const segments = generateImplicitContour(eq.expression, bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax, 90);
      const d = segmentsToSvgPath(segments, bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax, plotBox);
      if (d) {
        curvesSvg += `<path d="${d}" fill="none" stroke="${eq.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`;
      }
    } else {
      const pts = generatePlotData(eq.expression, bounds.xMin, bounds.xMax, 300);
      const d = pointsToSvgPath(pts, bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax, plotBox, snapshot.yScale || 'linear');
      if (d) {
        curvesSvg += `<path d="${d}" fill="none" stroke="${eq.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`;
      }
    }
  });

  // Generate Ticks SVG
  let ticksSvg = '';
  xTicks.forEach((xVal) => {
    if (Math.abs(xVal) < 1e-6) return;
    const px = toPxX(xVal);
    if (px >= plotBox.left + 10 && px <= plotBox.left + plotBox.width - 10) {
      ticksSvg += `
        <line x1="${px.toFixed(1)}" y1="${(axisLineY - 3).toFixed(1)}" x2="${px.toFixed(1)}" y2="${(axisLineY + 3).toFixed(1)}" stroke="${axisColor}" stroke-width="1.2" />
        <text x="${px.toFixed(1)}" y="${(axisLineY + 12).toFixed(1)}" text-anchor="middle" fill="${textColor}" font-family="monospace, sans-serif" font-size="9px" font-weight="600">${formatAxisNumber(xVal)}</text>
      `;
    }
  });

  yTicks.forEach((yVal) => {
    if (Math.abs(yVal) < 1e-6) return;
    const py = toPxY(yVal);
    if (py >= plotBox.top + 10 && py <= plotBox.top + plotBox.height - 10) {
      ticksSvg += `
        <line x1="${(axisLineX - 3).toFixed(1)}" y1="${py.toFixed(1)}" x2="${(axisLineX + 3).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${axisColor}" stroke-width="1.2" />
        <text x="${(axisLineX - 5).toFixed(1)}" y="${(py + 3).toFixed(1)}" text-anchor="end" fill="${textColor}" font-family="monospace, sans-serif" font-size="9px" font-weight="600">${formatAxisNumber(yVal)}</text>
      `;
    }
  });

  // Check if (0,0) label should be drawn
  const isOriginVisible = bounds.xMin <= 0 && bounds.xMax >= 0 && bounds.yMin <= 0 && bounds.yMax >= 0;
  if (isOriginVisible) {
    ticksSvg += `<text x="${(originPxX - 5).toFixed(1)}" y="${(originPxY + 11).toFixed(1)}" text-anchor="end" fill="${mutedColor}" font-family="monospace, sans-serif" font-size="9px" font-weight="600">0</text>`;
  }

  const titleText = customTitle || snapshot.title || 'Function Plot';
  const rangeSubtitle = `x: [${bounds.xMin}, ${bounds.xMax}], y: [${bounds.yMin}, ${bounds.yMax}]`;

  return `
    <svg width="${cellWidth}" height="${cellHeight}" viewBox="0 0 ${cellWidth} ${cellHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${cellWidth}" height="${cellHeight}" fill="${bgColor}" />
      
      <!-- Card Header -->
      ${showTitle ? `
        <text x="${cellWidth / 2}" y="16" text-anchor="middle" fill="${isDark ? '#f9fafb' : '#111827'}" font-family="system-ui, -apple-system, sans-serif" font-size="13px" font-weight="bold">${escapeXml(titleText)}</text>
      ` : ''}
      ${showRanges ? `
        <text x="${cellWidth / 2}" y="28" text-anchor="middle" fill="${mutedColor}" font-family="monospace, sans-serif" font-size="9px">${escapeXml(rangeSubtitle)}</text>
      ` : ''}

      <!-- Grid -->
      <g opacity="0.85">
        ${gridLinesSvg}
      </g>

      <!-- Axes -->
      <line x1="${(plotBox.left - 6).toFixed(1)}" y1="${axisLineY.toFixed(1)}" x2="${(plotBox.left + plotBox.width + 6).toFixed(1)}" y2="${axisLineY.toFixed(1)}" stroke="${axisColor}" stroke-width="1.8" />
      <line x1="${axisLineX.toFixed(1)}" y1="${(plotBox.top + plotBox.height + 6).toFixed(1)}" x2="${axisLineX.toFixed(1)}" y2="${(plotBox.top - 6).toFixed(1)}" stroke="${axisColor}" stroke-width="1.8" />
      
      <!-- Axis End Labels -->
      <text x="${(plotBox.left + plotBox.width + 12).toFixed(1)}" y="${(axisLineY + 3).toFixed(1)}" fill="${axisColor}" font-family="serif" font-style="italic" font-size="11px" font-weight="bold">x</text>
      <text x="${axisLineX.toFixed(1)}" y="${(plotBox.top - 9).toFixed(1)}" text-anchor="middle" fill="${axisColor}" font-family="serif" font-style="italic" font-size="11px" font-weight="bold">y</text>

      <!-- Ticks -->
      ${ticksSvg}

      <!-- Graph Curves -->
      <g clip-path="url(#clip-${snapshot.id})">
        <clipPath id="clip-${snapshot.id}">
          <rect x="${plotBox.left}" y="${plotBox.top}" width="${plotBox.width}" height="${plotBox.height}" />
        </clipPath>
        ${curvesSvg}
      </g>
    </svg>
  `;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Compose multiple graph snapshots into a full sheet SVG with optional scissor cut-lines.
 */
export function generateCollageSvg(
  graphs: { snapshot: SavedGraphSnapshot; customTitle?: string }[],
  layout: CollageLayout,
  options: {
    sheetTitle?: string;
    sheetWidth?: number;
    sheetHeight?: number;
    showCutLines?: boolean;
    showTitles?: boolean;
    showRanges?: boolean;
    theme?: 'light' | 'dark';
  } = {}
): string {
  const { cols, rows } = getLayoutDimensions(layout);
  const {
    sheetTitle = 'MathHub Graph Collage',
    sheetWidth = 1200,
    sheetHeight = 900,
    showCutLines = true,
    showTitles = true,
    showRanges = true,
    theme = 'light',
  } = options;

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const sheetHeaderHeight = sheetTitle ? 55 : 20;
  const margin = 25;

  const gridWidth = sheetWidth - margin * 2;
  const gridHeight = sheetHeight - sheetHeaderHeight - margin;

  const cellWidth = gridWidth / cols;
  const cellHeight = gridHeight / rows;

  let cellSvgs = '';
  let cutLinesSvg = '';

  // Render cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const item = graphs[idx];
      const cellX = margin + c * cellWidth;
      const cellY = sheetHeaderHeight + r * cellHeight;

      if (item && item.snapshot) {
        const innerSvg = renderSnapshotToSvg(item.snapshot, cellWidth - 12, cellHeight - 12, {
          customTitle: item.customTitle,
          showTitle: showTitles,
          showRanges: showRanges,
          theme,
        });

        cellSvgs += `
          <g transform="translate(${cellX + 6}, ${cellY + 6})">
            ${innerSvg}
          </g>
        `;
      } else {
        // Empty cell placeholder
        cellSvgs += `
          <g transform="translate(${cellX + 6}, ${cellY + 6})">
            <rect width="${cellWidth - 12}" height="${cellHeight - 12}" fill="${isDark ? '#1e293b' : '#f8fafc'}" stroke="${isDark ? '#334155' : '#e2e8f0'}" stroke-dasharray="4 4" rx="8" />
            <text x="${(cellWidth - 12) / 2}" y="${(cellHeight - 12) / 2}" text-anchor="middle" fill="${isDark ? '#64748b' : '#94a3b8'}" font-family="sans-serif" font-size="12px">Empty Graph Slot</text>
          </g>
        `;
      }
    }
  }

  // Render Scissor Cut Lines between cells if enabled
  if (showCutLines) {
    const cutColor = isDark ? '#475569' : '#cbd5e1';

    // Vertical cut lines
    for (let c = 1; c < cols; c++) {
      const x = margin + c * cellWidth;
      cutLinesSvg += `
        <line x1="${x}" y1="${sheetHeaderHeight}" x2="${x}" y2="${sheetHeaderHeight + gridHeight}" stroke="${cutColor}" stroke-width="1.5" stroke-dasharray="6 6" />
        <text x="${x}" y="${sheetHeaderHeight + 14}" text-anchor="middle" font-size="14px">✂</text>
        <text x="${x}" y="${sheetHeaderHeight + gridHeight - 6}" text-anchor="middle" font-size="14px">✂</text>
      `;
    }

    // Horizontal cut lines
    for (let r = 1; r < rows; r++) {
      const y = sheetHeaderHeight + r * cellHeight;
      cutLinesSvg += `
        <line x1="${margin}" y1="${y}" x2="${margin + gridWidth}" y2="${y}" stroke="${cutColor}" stroke-width="1.5" stroke-dasharray="6 6" />
        <text x="${margin + 12}" y="${y + 4}" text-anchor="middle" font-size="14px">✂</text>
        <text x="${margin + gridWidth - 12}" y="${y + 4}" text-anchor="middle" font-size="14px">✂</text>
      `;
    }
  }

  return `
    <svg width="${sheetWidth}" height="${sheetHeight}" viewBox="0 0 ${sheetWidth} ${sheetHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${sheetWidth}" height="${sheetHeight}" fill="${bgColor}" />
      
      ${sheetTitle ? `
        <!-- Sheet Header -->
        <text x="${sheetWidth / 2}" y="32" text-anchor="middle" fill="${isDark ? '#f8fafc' : '#0f172a'}" font-family="system-ui, -apple-system, sans-serif" font-size="20px" font-weight="bold">${escapeXml(sheetTitle)}</text>
        <text x="${sheetWidth / 2}" y="48" text-anchor="middle" fill="${isDark ? '#94a3b8' : '#64748b'}" font-family="sans-serif" font-size="11px">MathHub Multi-Graph Printable Notebook Sheet • ${graphs.length} graphs (${cols}×${rows} grid)</text>
      ` : ''}

      <!-- Cells -->
      ${cellSvgs}

      <!-- Scissor Cut Lines -->
      ${cutLinesSvg}
    </svg>
  `;
}

/**
 * Export collage SVG to High-Resolution PNG via Canvas
 */
export async function exportCollageToPng(
  svgString: string,
  width: number,
  height: number,
  scale = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Export collage to a print-ready PDF (A4 or Letter) with proper margins and resolution.
 */
export async function exportCollageToPdf(
  svgString: string,
  options: {
    pageSize?: 'a4' | 'letter';
    orientation?: 'portrait' | 'landscape';
    fileName?: string;
  } = {}
): Promise<void> {
  const { pageSize = 'a4', orientation = 'landscape', fileName = 'mathhub-graph-collage.pdf' } = options;

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginMm = 10;

  const targetWidth = pageWidth - marginMm * 2;
  const targetHeight = pageHeight - marginMm * 2;

  // Convert SVG string to high-res image data
  const pngDataUrl = await exportCollageToPng(svgString, 1200, 900, 2);

  // Add high-resolution image to PDF page
  pdf.addImage(pngDataUrl, 'PNG', marginMm, marginMm, targetWidth, targetHeight, undefined, 'FAST');
  pdf.save(fileName);
}
