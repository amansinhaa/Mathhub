import { SavedGraphSnapshot, CollageLayout } from '@/types/graph';
import {
  generatePlotData,
  generateNiceTicks,
  formatAxisNumber,
  pointsToSvgPath,
  findVerticalAsymptotes,
} from './graphData';
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
 * Get standard sheet pixel dimensions based on page size and orientation
 */
export function getSheetDimensions(
  pageSize: 'a4' | 'letter' = 'a4',
  orientation: 'landscape' | 'portrait' = 'landscape'
): { width: number; height: number } {
  const isPortrait = orientation === 'portrait';
  if (pageSize === 'letter') {
    // 8.5 x 11 inches -> ratio 1 : 1.294
    return isPortrait ? { width: 1000, height: 1294 } : { width: 1294, height: 1000 };
  }
  // A4: 210 x 297 mm -> ratio 1 : 1.4142
  return isPortrait ? { width: 1000, height: 1414 } : { width: 1414, height: 1000 };
}

/**
 * Render a single mathematical graph snapshot into an SVG group with origin-centric axes.
 */
export function renderSnapshotToSvgGroup(
  snapshot: SavedGraphSnapshot,
  cellWidth: number,
  cellHeight: number,
  uniqueClipId: string,
  options: {
    showTitle?: boolean;
    showRanges?: boolean;
    customTitle?: string;
    theme?: 'light' | 'dark';
  } = {}
): string {
  const { showTitle = true, showRanges = true, customTitle, theme = 'light' } = options;

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#f3f4f6' : '#1f2937';
  const gridColor = isDark ? '#1f2937' : '#e5e7eb';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  const headerHeight = showTitle ? (showRanges ? 36 : 24) : 8;
  const padding = { top: headerHeight + 10, right: 30, bottom: 26, left: 34 };

  const plotBox = {
    left: padding.left,
    top: padding.top,
    width: Math.max(10, cellWidth - padding.left - padding.right),
    height: Math.max(10, cellHeight - padding.top - padding.bottom),
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

  // Grid lines SVG
  let gridLinesSvg = '';
  xTicks.forEach((xVal) => {
    const px = toPxX(xVal);
    if (px >= plotBox.left && px <= plotBox.left + plotBox.width) {
      gridLinesSvg += `<line x1="${px.toFixed(1)}" y1="${plotBox.top.toFixed(1)}" x2="${px.toFixed(1)}" y2="${(plotBox.top + plotBox.height).toFixed(1)}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="2 2" />`;
    }
  });
  yTicks.forEach((yVal) => {
    const py = toPxY(yVal);
    if (py >= plotBox.top && py <= plotBox.top + plotBox.height) {
      gridLinesSvg += `<line x1="${plotBox.left.toFixed(1)}" y1="${py.toFixed(1)}" x2="${(plotBox.left + plotBox.width).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="2 2" />`;
    }
  });

  // Curves SVG & Asymptotes
  let curvesSvg = '';
  let asymptotesSvg = '';
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
        curvesSvg += `<path d="${d}" fill="none" stroke="${eq.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`;
      }
    } else {
      const asyms = findVerticalAsymptotes(eq.expression, bounds.xMin, bounds.xMax);
      const pts = generatePlotData(eq.expression, bounds.xMin, bounds.xMax, 400);
      const d = pointsToSvgPath(pts, bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax, plotBox, snapshot.yScale || 'linear', asyms);
      if (d) {
        curvesSvg += `<path d="${d}" fill="none" stroke="${eq.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`;
      }

      // Add dashed asymptote lines in snapshot
      asyms.forEach((a) => {
        const px = toPxX(a);
        if (px >= plotBox.left && px <= plotBox.left + plotBox.width) {
          asymptotesSvg += `<line x1="${px.toFixed(1)}" y1="${plotBox.top.toFixed(1)}" x2="${px.toFixed(1)}" y2="${(plotBox.top + plotBox.height).toFixed(1)}" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.8" />`;
        }
      });
    }
  });

  // Ticks SVG
  let ticksSvg = '';
  xTicks.forEach((xVal) => {
    if (Math.abs(xVal) < 1e-6) return;
    const px = toPxX(xVal);
    if (px >= plotBox.left + 5 && px <= plotBox.left + plotBox.width - 5) {
      ticksSvg += `
        <line x1="${px.toFixed(1)}" y1="${(axisLineY - 3.5).toFixed(1)}" x2="${px.toFixed(1)}" y2="${(axisLineY + 3.5).toFixed(1)}" stroke="${axisColor}" stroke-width="1.2" />
        <text x="${px.toFixed(1)}" y="${(axisLineY + 13).toFixed(1)}" text-anchor="middle" fill="${textColor}" font-family="monospace, sans-serif" font-size="9.5px" font-weight="600">${formatAxisNumber(xVal)}</text>
      `;
    }
  });

  yTicks.forEach((yVal) => {
    if (Math.abs(yVal) < 1e-6) return;
    const py = toPxY(yVal);
    if (py >= plotBox.top + 5 && py <= plotBox.top + plotBox.height - 5) {
      ticksSvg += `
        <line x1="${(axisLineX - 3.5).toFixed(1)}" y1="${py.toFixed(1)}" x2="${(axisLineX + 3.5).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${axisColor}" stroke-width="1.2" />
        <text x="${(axisLineX - 6).toFixed(1)}" y="${(py + 3.5).toFixed(1)}" text-anchor="end" fill="${textColor}" font-family="monospace, sans-serif" font-size="9.5px" font-weight="600">${formatAxisNumber(yVal)}</text>
      `;
    }
  });

  // Check if (0,0) label should be drawn
  const isOriginVisible = bounds.xMin <= 0 && bounds.xMax >= 0 && bounds.yMin <= 0 && bounds.yMax >= 0;
  if (isOriginVisible) {
    ticksSvg += `<text x="${(originPxX - 6).toFixed(1)}" y="${(originPxY + 12).toFixed(1)}" text-anchor="end" fill="${mutedColor}" font-family="monospace, sans-serif" font-size="9.5px" font-weight="600">0</text>`;
  }

  const titleText = customTitle || snapshot.title || 'Function Plot';
  const rangeSubtitle = `x: [${bounds.xMin}, ${bounds.xMax}], y: [${bounds.yMin}, ${bounds.yMax}]`;

  return `
    <g class="graph-cell">
      <!-- Card Header -->
      ${showTitle ? `
        <text x="${(cellWidth / 2).toFixed(1)}" y="16" text-anchor="middle" fill="${isDark ? '#f9fafb' : '#111827'}" font-family="system-ui, -apple-system, sans-serif" font-size="12.5px" font-weight="bold">${escapeXml(titleText)}</text>
      ` : ''}
      ${showRanges ? `
        <text x="${(cellWidth / 2).toFixed(1)}" y="29" text-anchor="middle" fill="${mutedColor}" font-family="monospace, sans-serif" font-size="9px">${escapeXml(rangeSubtitle)}</text>
      ` : ''}

      <!-- Grid -->
      <g opacity="0.85">
        ${gridLinesSvg}
      </g>

      <!-- Vertical Asymptotes -->
      <g opacity="0.85">
        ${asymptotesSvg}
      </g>

      <!-- Axes -->
      <line x1="${(plotBox.left - 6).toFixed(1)}" y1="${axisLineY.toFixed(1)}" x2="${(plotBox.left + plotBox.width + 8).toFixed(1)}" y2="${axisLineY.toFixed(1)}" stroke="${axisColor}" stroke-width="1.8" />
      <line x1="${axisLineX.toFixed(1)}" y1="${(plotBox.top + plotBox.height + 6).toFixed(1)}" x2="${axisLineX.toFixed(1)}" y2="${(plotBox.top - 8).toFixed(1)}" stroke="${axisColor}" stroke-width="1.8" />
      
      <!-- Axis End Labels -->
      <text x="${(plotBox.left + plotBox.width + 12).toFixed(1)}" y="${(axisLineY + 3.5).toFixed(1)}" fill="${axisColor}" font-family="serif" font-style="italic" font-size="12px" font-weight="bold">x</text>
      <text x="${axisLineX.toFixed(1)}" y="${(plotBox.top - 10).toFixed(1)}" text-anchor="middle" fill="${axisColor}" font-family="serif" font-style="italic" font-size="12px" font-weight="bold">y</text>

      <!-- Ticks -->
      ${ticksSvg}

      <!-- Graph Curves -->
      <g clip-path="url(#${uniqueClipId})">
        <clipPath id="${uniqueClipId}">
          <rect x="${plotBox.left.toFixed(1)}" y="${plotBox.top.toFixed(1)}" width="${plotBox.width.toFixed(1)}" height="${plotBox.height.toFixed(1)}" />
        </clipPath>
        ${curvesSvg}
      </g>
    </g>
  `;
}

/**
 * Standalone snapshot SVG generator for individual thumbnail/card rendering.
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
  const isDark = options.theme === 'dark';
  const bgColor = isDark ? '#111827' : '#ffffff';
  const clipId = `clip-single-${snapshot.id || Math.random().toString(36).slice(2, 6)}`;
  const groupContent = renderSnapshotToSvgGroup(snapshot, cellWidth, cellHeight, clipId, options);

  return `
    <svg width="${cellWidth}" height="${cellHeight}" viewBox="0 0 ${cellWidth} ${cellHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${cellWidth}" height="${cellHeight}" fill="${bgColor}" />
      ${groupContent}
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
 * Compose multiple graph snapshots into a full printable sheet SVG with scissor cut-lines.
 * Formatted to fit all cells within exact sheet boundaries.
 */
export function generateCollageSvg(
  graphs: { snapshot: SavedGraphSnapshot; customTitle?: string }[],
  layout: CollageLayout,
  options: {
    sheetTitle?: string;
    pageSize?: 'a4' | 'letter';
    orientation?: 'landscape' | 'portrait';
    showCutLines?: boolean;
    showTitles?: boolean;
    showRanges?: boolean;
    theme?: 'light' | 'dark';
  } = {}
): string {
  const { cols, rows } = getLayoutDimensions(layout);
  const {
    sheetTitle = 'MathHub Function Study Sheet',
    pageSize = 'a4',
    orientation = 'landscape',
    showCutLines = true,
    showTitles = true,
    showRanges = true,
    theme = 'light',
  } = options;

  const { width: sheetWidth, height: sheetHeight } = getSheetDimensions(pageSize, orientation);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const sheetHeaderHeight = sheetTitle ? 55 : 20;
  const margin = 28;

  const gridWidth = sheetWidth - margin * 2;
  const gridHeight = sheetHeight - sheetHeaderHeight - margin;

  const cellWidth = gridWidth / cols;
  const cellHeight = gridHeight / rows;

  let cellElementsSvg = '';
  let cutLinesSvg = '';

  // Render cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const item = graphs[idx];
      const cellX = margin + c * cellWidth;
      const cellY = sheetHeaderHeight + r * cellHeight;
      const uniqueClipId = `clip-${r}-${c}-${Math.random().toString(36).slice(2, 6)}`;

      if (item && item.snapshot) {
        const cellGroup = renderSnapshotToSvgGroup(
          item.snapshot,
          cellWidth - 10,
          cellHeight - 10,
          uniqueClipId,
          {
            customTitle: item.customTitle,
            showTitle: showTitles,
            showRanges: showRanges,
            theme,
          }
        );

        cellElementsSvg += `
          <g transform="translate(${(cellX + 5).toFixed(1)}, ${(cellY + 5).toFixed(1)})">
            <rect width="${(cellWidth - 10).toFixed(1)}" height="${(cellHeight - 10).toFixed(1)}" fill="${isDark ? '#111827' : '#ffffff'}" rx="4" />
            ${cellGroup}
          </g>
        `;
      } else {
        // Empty cell slot placeholder
        cellElementsSvg += `
          <g transform="translate(${(cellX + 5).toFixed(1)}, ${(cellY + 5).toFixed(1)})">
            <rect width="${(cellWidth - 10).toFixed(1)}" height="${(cellHeight - 10).toFixed(1)}" fill="${isDark ? '#1e293b' : '#f8fafc'}" stroke="${isDark ? '#334155' : '#e2e8f0'}" stroke-dasharray="4 4" rx="8" />
            <text x="${((cellWidth - 10) / 2).toFixed(1)}" y="${((cellHeight - 10) / 2).toFixed(1)}" text-anchor="middle" fill="${isDark ? '#64748b' : '#94a3b8'}" font-family="sans-serif" font-size="12px">Empty Graph Slot</text>
          </g>
        `;
      }
    }
  }

  // Render Scissor Cut Lines between cells if enabled
  if (showCutLines) {
    const cutColor = isDark ? '#475569' : '#94a3b8';

    // Vertical cut lines between columns
    for (let c = 1; c < cols; c++) {
      const x = margin + c * cellWidth;
      cutLinesSvg += `
        <line x1="${x.toFixed(1)}" y1="${sheetHeaderHeight}" x2="${x.toFixed(1)}" y2="${(sheetHeaderHeight + gridHeight).toFixed(1)}" stroke="${cutColor}" stroke-width="1.2" stroke-dasharray="5 5" />
        <text x="${x.toFixed(1)}" y="${sheetHeaderHeight + 14}" text-anchor="middle" font-size="13px" fill="${cutColor}">✂</text>
        <text x="${x.toFixed(1)}" y="${(sheetHeaderHeight + gridHeight - 6).toFixed(1)}" text-anchor="middle" font-size="13px" fill="${cutColor}">✂</text>
      `;
    }

    // Horizontal cut lines between rows
    for (let r = 1; r < rows; r++) {
      const y = sheetHeaderHeight + r * cellHeight;
      cutLinesSvg += `
        <line x1="${margin}" y1="${y.toFixed(1)}" x2="${(margin + gridWidth).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${cutColor}" stroke-width="1.2" stroke-dasharray="5 5" />
        <text x="${margin + 12}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="13px" fill="${cutColor}">✂</text>
        <text x="${(margin + gridWidth - 12).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="13px" fill="${cutColor}">✂</text>
      `;
    }
  }

  return `
    <svg width="100%" height="100%" viewBox="0 0 ${sheetWidth} ${sheetHeight}" style="max-width: 100%; max-height: 100%; display: block; margin: auto;" xmlns="http://www.w3.org/2000/svg">
      <rect width="${sheetWidth}" height="${sheetHeight}" fill="${bgColor}" />
      
      ${sheetTitle ? `
        <!-- Sheet Header -->
        <text x="${(sheetWidth / 2).toFixed(1)}" y="30" text-anchor="middle" fill="${isDark ? '#f8fafc' : '#0f172a'}" font-family="system-ui, -apple-system, sans-serif" font-size="18px" font-weight="bold">${escapeXml(sheetTitle)}</text>
        <text x="${(sheetWidth / 2).toFixed(1)}" y="46" text-anchor="middle" fill="${isDark ? '#94a3b8' : '#64748b'}" font-family="sans-serif" font-size="10.5px">EasyEquate Multi-Graph Printable Notebook Sheet • ${graphs.length} graphs (${cols}×${rows} grid • ${pageSize.toUpperCase()} ${orientation})</text>
      ` : ''}

      <!-- Grid Cells -->
      ${cellElementsSvg}

      <!-- Scissor Cut Lines -->
      ${cutLinesSvg}

      <!-- EasyEquate Footer Attribution -->
      <text x="${(sheetWidth / 2).toFixed(1)}" y="${(sheetHeight - 8).toFixed(1)}" text-anchor="middle" fill="${isDark ? '#64748b' : '#9ca3af'}" font-family="sans-serif" font-size="10px" font-weight="500">Generated with EasyEquate.com</text>
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
  scale = 2.5
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
  const { pageSize = 'a4', orientation = 'landscape', fileName = 'easyequate-graph-collage.pdf' } = options;

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginMm = 8;

  const targetWidth = pageWidth - marginMm * 2;
  const targetHeight = pageHeight - marginMm * 2;

  const { width: sheetWidth, height: sheetHeight } = getSheetDimensions(pageSize, orientation);

  // Convert SVG string to high-res image data
  const pngDataUrl = await exportCollageToPng(svgString, sheetWidth, sheetHeight, 2.5);

  // Add high-resolution image to PDF page
  pdf.addImage(pngDataUrl, 'PNG', marginMm, marginMm, targetWidth, targetHeight, undefined, 'FAST');
  pdf.save(fileName);
}
