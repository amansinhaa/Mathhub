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
import { CollageLayout } from '@/types/graph';
import {
  Download,
  FileCode,
  Printer,
  Grid,
  Scissors,
  CheckSquare,
  Square,
  ArrowLeft,
  ArrowRight,
  Camera,
  Layers,
  Eye,
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
  const [sheetTitle, setSheetTitle] = useState('EasyEquate Function Study Sheet');
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
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length > 0) {
        setLayout(suggestLayout(next.length));
      }
      return next;
    });
  };

  const selectAll = () => {
    const all = savedGraphs.map((g) => g.id);
    setSelectedIds(all);
    setLayout(suggestLayout(all.length));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Reorder selected list
  const moveItem = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= selectedIds.length) return;
    const copy = [...selectedIds];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setSelectedIds(copy);
  };

  // Selected graphs data in order
  const selectedGraphsWithData = useMemo(() => {
    return selectedIds
      .map((id) => {
        const snap = savedGraphs.find((g) => g.id === id);
        if (!snap) return null;
        return {
          snapshot: snap,
        };
      })
      .filter(Boolean) as { snapshot: typeof savedGraphs[0] }[];
  }, [selectedIds, savedGraphs]);

  // Generate real-time SVG string for the collage preview & export
  const collageSvgString = useMemo(() => {
    if (selectedGraphsWithData.length === 0) return '';

    return generateCollageSvg(
      selectedGraphsWithData.map((item) => ({
        snapshot: item.snapshot,
        customTitle: customTitles[item.snapshot.id],
      })),
      layout,
      {
        pageSize,
        orientation,
        showCutLines,
        showTitles,
        showRanges,
        sheetTitle,
        theme: 'light', // Print-ready white background
      }
    );
  }, [
    selectedGraphsWithData,
    layout,
    pageSize,
    orientation,
    showCutLines,
    showTitles,
    showRanges,
    sheetTitle,
    customTitles,
  ]);

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

  // Sheet dimensions calculation
  const { width: sheetWidth, height: sheetHeight } = getSheetDimensions(pageSize, orientation);

  return (
    <div className="flex flex-col space-y-5 animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      {/* Collage Builder Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1B1B1B] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <Printer className="text-[#5D4037] dark:text-[#A1887F]" size={22} />
            <h2 className="text-lg sm:text-xl font-bold text-[#131313] dark:text-white">
              Multi-Graph Printable Collage Sheet
            </h2>
          </div>
          <p className="text-xs text-[#616161] dark:text-[#A19891] mt-1">
            Fit multiple graphs cleanly onto an A4 or Letter page with scissor cut-lines for notebooks & revision.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveActiveToCollage}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] hover:bg-[#EFEBE9] text-[#5D4037] hover:text-[#131313] text-xs font-semibold rounded-xl transition-all border border-[#E0E0E0] dark:bg-[#131313] dark:hover:bg-[#262220] dark:text-[#D7CCC8] dark:hover:text-white dark:border-[#2E2825] shadow-2xs active:scale-95"
            title="Snap the currently active graph into this collage"
          >
            <Camera size={14} />
            <span>Snapshot Current</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={selectedIds.length === 0 || isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#5D4037] hover:bg-[#6D4C41] text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed border border-[#795548]/50 active:scale-95"
          >
            <Printer size={15} />
            <span>{isExporting ? 'Generating PDF...' : 'Export PDF'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportPNG}
            disabled={selectedIds.length === 0 || isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] hover:bg-[#EFEBE9] text-[#5D4037] hover:text-[#131313] text-xs font-semibold rounded-xl transition-all border border-[#E0E0E0] dark:bg-[#131313] dark:hover:bg-[#262220] dark:text-[#D7CCC8] dark:hover:text-white dark:border-[#2E2825] shadow-2xs disabled:opacity-40 active:scale-95"
          >
            <Download size={14} />
            <span>PNG HD</span>
          </button>
          <button
            type="button"
            onClick={handleExportSVG}
            disabled={selectedIds.length === 0 || isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] hover:bg-[#EFEBE9] text-[#5D4037] hover:text-[#131313] text-xs font-semibold rounded-xl transition-all border border-[#E0E0E0] dark:bg-[#131313] dark:hover:bg-[#262220] dark:text-[#D7CCC8] dark:hover:text-white dark:border-[#2E2825] shadow-2xs disabled:opacity-40 active:scale-95"
          >
            <FileCode size={14} />
            <span>SVG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Settings Sidebar */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* 1. Saved Graphs Multi-Selector */}
          <div className="bg-white dark:bg-[#1B1B1B] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-sm space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs font-mono uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8] flex items-center gap-1.5">
                <Layers size={14} className="text-[#5D4037] dark:text-[#A1887F]" />
                Select Graphs ({selectedIds.length}/{savedGraphs.length})
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[#5D4037] dark:text-[#D7CCC8] hover:text-[#131313] dark:hover:text-white font-medium"
                >
                  Select All
                </button>
                <span className="text-[#D7CCC8] dark:text-[#3E2723]">|</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* List of selectables */}
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
              {savedGraphs.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#757575] dark:text-[#8D827A]">
                  No saved graphs yet. Plot equations or data and click &ldquo;Snapshot Current&rdquo;.
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
                          ? 'bg-[#EFEBE9] border-[#5D4037] text-[#131313] dark:bg-[#3E2723]/60 dark:border-[#5D4037] dark:text-white font-semibold'
                          : 'bg-[#F5F5F5] border-[#E0E0E0] text-[#616161] hover:text-[#131313] hover:bg-white dark:bg-[#131313] dark:border-[#262220] dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSelected ? (
                          <CheckSquare size={15} className="text-[#5D4037] dark:text-[#D7CCC8] shrink-0" />
                        ) : (
                          <Square size={15} className="text-[#757575] dark:text-[#8D827A] shrink-0" />
                        )}
                        <span className="truncate">{graph.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#757575] dark:text-[#8D827A] shrink-0">
                        x:[{graph.bounds.xMin},{graph.bounds.xMax}]
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Grid Layout Picker */}
          <div className="bg-white dark:bg-[#1B1B1B] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-sm space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs font-mono uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8] flex items-center gap-1.5">
                <Grid size={14} className="text-[#5D4037] dark:text-[#A1887F]" />
                Grid Arrangement
              </span>
              <span className="text-[11px] font-mono text-[#5D4037] dark:text-[#D7CCC8] font-bold">
                {getLayoutDimensions(layout).cols} Cols × {getLayoutDimensions(layout).rows} Rows
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: '1x2', label: '1×2' },
                  { id: '2x1', label: '2×1' },
                  { id: '2x2', label: '2×2' },
                  { id: '2x3', label: '2×3' },
                  { id: '3x2', label: '3×2' },
                  { id: '3x3', label: '3×3' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLayout(opt.id)}
                  className={`py-2 px-1 text-xs font-mono font-bold rounded-xl border transition-all ${
                    layout === opt.id
                      ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
                      : 'bg-[#F5F5F5] border-[#E0E0E0] text-[#616161] hover:text-[#131313] hover:bg-[#EFEBE9] dark:bg-[#131313] dark:border-[#262220] dark:text-[#A19891] dark:hover:text-white dark:hover:border-[#5D4037]/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Sheet Title & Print Margins */}
          <div className="bg-white dark:bg-[#1B1B1B] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-sm space-y-3 text-xs transition-colors">
            <span className="font-bold text-xs font-mono uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8] block">
              Paper & Print Options
            </span>

            <div>
              <label className="block text-[#757575] dark:text-[#8D827A] mb-1 font-mono">Sheet Title</label>
              <input
                type="text"
                value={sheetTitle}
                onChange={(e) => setSheetTitle(e.target.value)}
                className="math-input py-1.5 text-xs w-full font-semibold bg-[#F5F5F5] dark:bg-[#131313] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
                placeholder="e.g. Polynomial Power Comparison"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#757575] dark:text-[#8D827A] mb-1 font-mono">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="math-input py-1.5 text-xs w-full font-semibold bg-[#F5F5F5] dark:bg-[#131313] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
                >
                  <option value="a4">A4 (210×297 mm)</option>
                  <option value="letter">US Letter (8.5×11")</option>
                </select>
              </div>

              <div>
                <label className="block text-[#757575] dark:text-[#8D827A] mb-1 font-mono">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="math-input py-1.5 text-xs w-full font-semibold bg-[#F5F5F5] dark:bg-[#131313] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
                >
                  <option value="landscape">Landscape (Wide)</option>
                  <option value="portrait">Portrait (Tall)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#2E2825] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  className="rounded text-[#5D4037] focus:ring-[#5D4037] bg-white dark:bg-[#131313] border-[#E0E0E0] dark:border-[#332D2A]"
                />
                <span className="font-medium flex items-center gap-1 text-[#5D4037] dark:text-[#D7CCC8]">
                  <Scissors size={13} className="text-[#5D4037] dark:text-[#A1887F]" />
                  Scissor Cut-Lines (for pasting)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showTitles}
                  onChange={(e) => setShowTitles(e.target.checked)}
                  className="rounded text-[#5D4037] focus:ring-[#5D4037] bg-white dark:bg-[#131313] border-[#E0E0E0] dark:border-[#332D2A]"
                />
                <span className="font-medium text-[#5D4037] dark:text-[#D7CCC8]">Show Individual Graph Titles</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showRanges}
                  onChange={(e) => setShowRanges(e.target.checked)}
                  className="rounded text-[#5D4037] focus:ring-[#5D4037] bg-white dark:bg-[#131313] border-[#E0E0E0] dark:border-[#332D2A]"
                />
                <span className="font-medium text-[#5D4037] dark:text-[#D7CCC8]">Show Coordinate Ranges Subtitle</span>
              </label>
            </div>
          </div>

          {/* 4. Cell Titles & Ordering */}
          {selectedGraphsWithData.length > 0 && (
            <div className="bg-white dark:bg-[#1B1B1B] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-sm space-y-2.5 text-xs transition-colors">
              <span className="font-bold text-xs font-mono uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8] block">
                Cell Titles & Order
              </span>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {selectedGraphsWithData.map((item, idx) => (
                  <div
                    key={item.snapshot.id}
                    className="flex items-center gap-2 p-2 bg-[#F5F5F5] dark:bg-[#131313] rounded-xl border border-[#E0E0E0] dark:border-[#2E2825]"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#5D4037] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
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
                      className="math-input py-1 px-2 text-xs flex-1 font-semibold bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'left')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-white dark:hover:bg-[#22201F] text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white rounded disabled:opacity-30"
                        title="Move Up/Left"
                      >
                        <ArrowLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'right')}
                        disabled={idx === selectedGraphsWithData.length - 1}
                        className="p-1 hover:bg-white dark:hover:bg-[#22201F] text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white rounded disabled:opacity-30"
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
            <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] flex items-center gap-1.5">
              <Eye size={15} className="text-[#5D4037] dark:text-[#A1887F]" />
              Live Print-Ready Sheet Preview
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#757575] dark:text-[#8D827A]">
              <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E0E0E0] dark:bg-[#1B1B1B] dark:border-[#2E2825] rounded-md font-semibold text-[#5D4037] dark:text-[#D7CCC8]">
                {pageSize.toUpperCase()} • {orientation}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1 bg-[#F5F5F5] border border-[#E0E0E0] dark:bg-[#1B1B1B] dark:border-[#2E2825] rounded-md px-1.5 py-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(50, z - 15))}
                  className="hover:text-[#131313] dark:hover:text-white font-bold px-1 text-[#5D4037] dark:text-[#D7CCC8]"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="text-[#5D4037] dark:text-[#D7CCC8]">{previewZoom}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(150, z + 15))}
                  className="hover:text-[#131313] dark:hover:text-white font-bold px-1 text-[#5D4037] dark:text-[#D7CCC8]"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(100)}
                  className="hover:text-[#131313] dark:hover:text-white text-[10px] ml-1 text-[#5D4037] dark:text-[#D7CCC8]"
                  title="Fit to Frame"
                >
                  Fit
                </button>
              </div>
            </div>
          </div>

          {/* Full Page Fit Sheet Container */}
          <div className="w-full bg-[#F5F5F5] dark:bg-[#131313] rounded-2xl p-4 sm:p-6 border border-[#E0E0E0] dark:border-[#2E2825] shadow-inner flex justify-center items-center min-h-[600px] overflow-auto transition-colors">
            {selectedGraphsWithData.length === 0 ? (
              <div className="text-center py-16 px-4 max-w-md text-xs text-[#757575] dark:text-[#8D827A] space-y-2">
                <Printer size={36} className="mx-auto text-[#BCAAA4] dark:text-[#3E2723] mb-2" />
                <p className="font-semibold text-[#5D4037] dark:text-[#D7CCC8]">No Graphs Selected</p>
                <p>
                  Select one or more graphs from the sidebar list to arrange and preview your printable collage sheet.
                </p>
              </div>
            ) : (
              <div
                className="transition-all duration-200 shadow-2xl rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#2E2825] bg-white"
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
