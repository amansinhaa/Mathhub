'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import {
  generateCollageSvg,
  exportCollageToPdf,
  exportCollageToPng,
  getLayoutDimensions,
  suggestLayout,
  getSheetDimensions,
} from '@/lib/math/collageRenderer';
import { CollageLayout, SavedGraphSnapshot } from '@/types/graph';
import {
  FileText,
  Download,
  FileCode,
  Printer,
  Grid,
  Scissors,
  CheckSquare,
  Square,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Camera,
  Layers,
  HelpCircle,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

export default function CollageExport() {
  const { savedGraphs, saveCurrentGraphSnapshot } = useGraphStore();

  // Selected graphs state (defaults to selecting up to the first 4 saved graphs)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [layout, setLayout] = useState<CollageLayout>('2x2');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [showCutLines, setShowCutLines] = useState(true);
  const [showTitles, setShowTitles] = useState(true);
  const [showRanges, setShowRanges] = useState(true);
  const [sheetTitle, setSheetTitle] = useState('MathHub Function Study Sheet');
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<number>(100); // percentage

  // Initialize selection with saved graphs
  useEffect(() => {
    if (savedGraphs.length > 0 && selectedIds.length === 0) {
      const initial = savedGraphs.slice(0, 4).map((g) => g.id);
      setSelectedIds(initial);
      setLayout(suggestLayout(initial.length));
    }
  }, [savedGraphs]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      if (next.length > 0) {
        setLayout(suggestLayout(next.length));
      }
      return next;
    });
  };

  const selectAll = () => {
    const allIds = savedGraphs.map((g) => g.id);
    setSelectedIds(allIds);
    setLayout(suggestLayout(allIds.length));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Reorder selected items
  const moveItem = (index: number, direction: 'left' | 'right') => {
    const newArr = [...selectedIds];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setSelectedIds(newArr);
  };

  // Selected items mapped with snapshots
  const selectedGraphsWithData = useMemo(() => {
    return selectedIds
      .map((id) => {
        const snap = savedGraphs.find((g) => g.id === id);
        if (!snap) return null;
        return {
          snapshot: snap,
          customTitle: customTitles[snap.id] || snap.title,
        };
      })
      .filter(Boolean) as { snapshot: SavedGraphSnapshot; customTitle?: string }[];
  }, [selectedIds, savedGraphs, customTitles]);

  // Generate full collage SVG string for live preview and exports
  const collageSvgString = useMemo(() => {
    return generateCollageSvg(selectedGraphsWithData, layout, {
      sheetTitle,
      pageSize,
      orientation,
      showCutLines,
      showTitles,
      showRanges,
      theme: 'light',
    });
  }, [selectedGraphsWithData, layout, sheetTitle, pageSize, orientation, showCutLines, showTitles, showRanges]);

  // Export handlers
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportCollageToPdf(collageSvgString, {
        pageSize,
        orientation,
        fileName: `${sheetTitle.replace(/\s+/g, '_')}-${layout}.pdf`,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF generation failed. Please try PNG export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    try {
      setIsExporting(true);
      const { width, height } = getSheetDimensions(pageSize, orientation);
      const pngUrl = await exportCollageToPng(collageSvgString, width, height, 2.5);

      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${sheetTitle.replace(/\s+/g, '_')}-${layout}-collage.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('PNG export failed:', err);
      alert('PNG export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSVG = () => {
    const blob = new Blob([collageSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheetTitle.replace(/\s+/g, '_')}-${layout}-collage.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveActiveToCollage = () => {
    const snap = saveCurrentGraphSnapshot();
    setSelectedIds((prev) => [...prev, snap.id]);
  };

  // Sheet aspect ratio style calculation
  const { width: sheetWidth, height: sheetHeight } = getSheetDimensions(pageSize, orientation);
  const aspectRatio = sheetWidth / sheetHeight;

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      {/* Collage Builder Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-[var(--card-border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Printer className="text-blue-500" size={22} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Multi-Graph Printable Collage Sheet
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Fit multiple graphs cleanly onto an A4 or Letter page with scissor cut-lines for notebooks & revision.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveActiveToCollage}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors shadow-sm"
            title="Snap the currently active graph into this collage"
          >
            <Camera size={14} />
            <span>Snapshot Current</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={selectedIds.length === 0 || isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={15} />
            <span>{isExporting ? 'Generating PDF...' : 'Export PDF (Print-Ready)'}</span>
          </button>
          <button
            onClick={handleExportPNG}
            disabled={selectedIds.length === 0 || isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-40"
          >
            <Download size={14} />
            <span>PNG (2.5x HD)</span>
          </button>
          <button
            onClick={handleExportSVG}
            disabled={selectedIds.length === 0 || isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-40"
          >
            <FileCode size={14} />
            <span>Vector SVG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Settings Sidebar */}
        <div className="lg:col-span-4 flex flex-col space-y-5">
          {/* 1. Saved Graphs Multi-Selector */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-[var(--card-border)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Layers size={15} className="text-blue-500" />
                Select Graphs ({selectedIds.length}/{savedGraphs.length})
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={selectAll}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={clearSelection}
                  className="text-gray-500 hover:underline font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* List of selectables */}
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
              {savedGraphs.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--muted)]">
                  No saved graphs yet. Plot equations or data and click &ldquo;Snapshot Current&rdquo; or save from the sidebar.
                </div>
              ) : (
                savedGraphs.map((graph) => {
                  const isSelected = selectedIds.includes(graph.id);
                  return (
                    <div
                      key={graph.id}
                      onClick={() => toggleSelect(graph.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-semibold'
                          : 'bg-gray-50 dark:bg-gray-900/40 border-[var(--card-border)] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSelected ? (
                          <CheckSquare size={15} className="text-blue-600 shrink-0" />
                        ) : (
                          <Square size={15} className="text-gray-400 shrink-0" />
                        )}
                        <span className="truncate">{graph.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[var(--muted)] shrink-0">
                        x:[{graph.bounds.xMin},{graph.bounds.xMax}]
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Grid Layout Picker */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-[var(--card-border)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Grid size={15} className="text-blue-500" />
                Grid Arrangement
              </span>
              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                {getLayoutDimensions(layout).cols} Cols × {getLayoutDimensions(layout).rows} Rows
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: '1x2', label: '1×2 (2-Up)' },
                  { id: '2x1', label: '2×1 (2-Up)' },
                  { id: '2x2', label: '2×2 (4-Up)' },
                  { id: '2x3', label: '2×3 (6-Up)' },
                  { id: '3x2', label: '3×2 (6-Up)' },
                  { id: '3x3', label: '3×3 (9-Up)' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLayout(opt.id)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                    layout === opt.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900/40 border-[var(--card-border)] text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Sheet Title & Print Margins */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-[var(--card-border)] shadow-sm space-y-3 text-xs">
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100 block">
              Paper & Print Options
            </span>

            <div>
              <label className="block text-[var(--muted)] mb-1 font-medium">Sheet Header Title</label>
              <input
                type="text"
                value={sheetTitle}
                onChange={(e) => setSheetTitle(e.target.value)}
                className="math-input py-1.5 text-xs w-full font-semibold"
                placeholder="e.g. Polynomial Power Comparison"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[var(--muted)] mb-1 font-medium">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="math-input py-1.5 text-xs w-full font-semibold"
                >
                  <option value="a4">A4 (210×297 mm)</option>
                  <option value="letter">US Letter (8.5×11")</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--muted)] mb-1 font-medium">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="math-input py-1.5 text-xs w-full font-semibold"
                >
                  <option value="landscape">Landscape (Wide)</option>
                  <option value="portrait">Portrait (Tall)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--card-border)] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium flex items-center gap-1">
                  <Scissors size={13} className="text-gray-500" />
                  Scissor Cut-Lines (for pasting into notebook)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showTitles}
                  onChange={(e) => setShowTitles(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Show Individual Graph Titles</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showRanges}
                  onChange={(e) => setShowRanges(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Show Coordinate Ranges Subtitle</span>
              </label>
            </div>
          </div>

          {/* 4. Cell Titles & Ordering */}
          {selectedGraphsWithData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-[var(--card-border)] shadow-sm space-y-2.5 text-xs">
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100 block">
                Cell Titles & Order
              </span>
              <p className="text-[11px] text-[var(--muted)]">
                Reorder or rename individual cells on the sheet:
              </p>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {selectedGraphsWithData.map((item, idx) => (
                  <div
                    key={item.snapshot.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-[var(--card-border)]"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={customTitles[item.snapshot.id] ?? item.snapshot.title}
                      onChange={(e) =>
                        setCustomTitles((prev) => ({
                          ...prev,
                          [item.snapshot.id]: e.target.value,
                        }))
                      }
                      className="math-input py-1 px-2 text-xs flex-1 font-semibold"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveItem(idx, 'left')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                        title="Move Up/Left"
                      >
                        <ArrowLeft size={13} />
                      </button>
                      <button
                        onClick={() => moveItem(idx, 'right')}
                        disabled={idx === selectedGraphsWithData.length - 1}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                        title="Move Down/Right"
                      >
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Live Preview Canvas */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Eye size={15} className="text-blue-500" />
              Live Print-Ready Sheet Preview
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--muted)]">
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md font-semibold">
                {pageSize.toUpperCase()} • {orientation}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md px-1.5 py-0.5">
                <button
                  onClick={() => setPreviewZoom((z) => Math.max(50, z - 15))}
                  className="hover:text-blue-500 font-bold px-1"
                  title="Zoom Out"
                >
                  -
                </button>
                <span>{previewZoom}%</span>
                <button
                  onClick={() => setPreviewZoom((z) => Math.min(150, z + 15))}
                  className="hover:text-blue-500 font-bold px-1"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => setPreviewZoom(100)}
                  className="hover:text-blue-500 text-[10px] ml-1 text-blue-600"
                  title="Fit to Frame"
                >
                  Fit
                </button>
              </div>
            </div>
          </div>

          {/* Full Page Fit Sheet Container */}
          <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 sm:p-6 border border-[var(--card-border)] shadow-inner flex justify-center items-center min-h-[600px] overflow-auto">
            {selectedGraphsWithData.length === 0 ? (
              <div className="text-center py-16 px-4 max-w-md text-xs text-[var(--muted)] space-y-2">
                <Printer size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="font-semibold text-gray-700 dark:text-gray-200">No Graphs Selected</p>
                <p>
                  Select one or more graphs from the sidebar list to arrange and preview your printable collage sheet.
                </p>
              </div>
            ) : (
              <div
                className="transition-all duration-200 shadow-2xl rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 bg-white"
                style={{
                  width: `${(previewZoom / 100) * (orientation === 'portrait' ? 560 : 720)}px`,
                  maxWidth: '100%',
                  aspectRatio: `${sheetWidth} / ${sheetHeight}`,
                }}
                dangerouslySetInnerHTML={{ __html: collageSvgString }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
