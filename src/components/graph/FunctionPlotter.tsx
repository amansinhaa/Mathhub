'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { useGraphStore } from '@/stores/graphStore';
import {
  generatePlotData,
  generateNiceTicks,
  formatAxisNumber,
} from '@/lib/math/graphData';
import {
  isImplicitEquation,
  generateImplicitContour,
  segmentsToSvgPath,
} from '@/lib/math/implicitPlot';
import {
  Eye,
  EyeOff,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Download,
  FileCode,
  Maximize2,
  SlidersHorizontal,
  Tag,
  Grid,
  Pencil,
  Check,
} from 'lucide-react';

/**
 * Symmetric Log Transformation (symlog).
 */
function symlog(y: number): number {
  if (y === 0) return 0;
  return Math.sign(y) * Math.log10(1 + Math.abs(y));
}

function invSymlog(z: number): number {
  if (z === 0) return 0;
  return Math.sign(z) * (Math.pow(10, Math.abs(z)) - 1);
}

export default function FunctionPlotter() {
  const {
    chartTitle,
    setChartTitle,
    equations,
    bounds,
    setBounds,
    yScale,
    setYScale,
    showLineLabels,
    setShowLineLabels,
    showQuadrants,
    setShowQuadrants,
    updateEquation,
    zoomIn,
    zoomOut,
    pan,
    autoFitView,
    resetBounds,
  } = useGraphStore();

  const [hoveredEqId, setHoveredEqId] = useState<string | null>(null);
  const [showRangeInputs, setShowRangeInputs] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(chartTitle);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 410 });
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Sync temp title
  useEffect(() => {
    setTempTitle(chartTitle);
  }, [chartTitle]);

  const handleSaveTitle = () => {
    setChartTitle(tempTitle.trim() || '4-Quadrant Function Plot');
    setIsEditingTitle(false);
  };

  // Track container dimensions for SVG overlay alignment
  useEffect(() => {
    const updateDims = () => {
      if (chartContainerRef.current) {
        setContainerDimensions({
          width: chartContainerRef.current.clientWidth || 800,
          height: chartContainerRef.current.clientHeight || 410,
        });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  // Keep a ref to bounds for non-passive touch listeners
  const boundsRef = useRef(bounds);
  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  // Multi-Touch & Mouse Drag State
  const touchState = useRef<{
    startX: number;
    startY: number;
    initialBounds: typeof bounds;
    initialDist: number;
    isDragging: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialBounds: bounds,
    initialDist: 0,
    isDragging: false,
  });

  const [isMouseDown, setIsMouseDown] = useState(false);

  // Non-passive Touch Listener to PREVENT whole page viewport zoom on pinch
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();

      if (e.touches.length === 1) {
        touchState.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          initialBounds: { ...boundsRef.current },
          initialDist: 0,
          isDragging: true,
        };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        touchState.current = {
          startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          startY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          initialBounds: { ...boundsRef.current },
          initialDist: dist,
          isDragging: true,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchState.current.isDragging) return;
      if (e.cancelable) e.preventDefault();

      const width = container.clientWidth || 600;
      const height = container.clientHeight || 400;

      if (e.touches.length === 1 && touchState.current.initialDist === 0) {
        const dx = e.touches[0].clientX - touchState.current.startX;
        const dy = e.touches[0].clientY - touchState.current.startY;

        const init = touchState.current.initialBounds;
        const xSpan = init.xMax - init.xMin;
        const ySpan = init.yMax - init.yMin;

        const shiftX = (dx / width) * xSpan;
        const shiftY = (dy / height) * ySpan;

        setBounds({
          xMin: Number((init.xMin - shiftX).toFixed(2)),
          xMax: Number((init.xMax - shiftX).toFixed(2)),
          yMin: Number((init.yMin + shiftY).toFixed(2)),
          yMax: Number((init.yMax + shiftY).toFixed(2)),
        });
      } else if (e.touches.length === 2 && touchState.current.initialDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);

        const scale = touchState.current.initialDist / Math.max(10, currentDist);
        const init = touchState.current.initialBounds;
        const xCenter = (init.xMin + init.xMax) / 2;
        const yCenter = (init.yMin + init.yMax) / 2;
        const xHalf = ((init.xMax - init.xMin) * scale) / 2;
        const yHalf = ((init.yMax - init.yMin) * scale) / 2;

        setBounds({
          xMin: Number((xCenter - xHalf).toFixed(2)),
          xMax: Number((xCenter + xHalf).toFixed(2)),
          yMin: Number((yCenter - yHalf).toFixed(2)),
          yMax: Number((yCenter + yHalf).toFixed(2)),
        });
      }
    };

    const onTouchEnd = () => {
      touchState.current.isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [setBounds]);

  // Separate explicit f(x) functions and implicit F(x, y) = 0 equations
  const { explicitEquations, implicitEquations } = useMemo(() => {
    const explicit: typeof equations = [];
    const implicit: typeof equations = [];

    equations.forEach((eq) => {
      if (!eq.visible || eq.expression.trim() === '') return;
      if (isImplicitEquation(eq.expression)) {
        implicit.push(eq);
      } else {
        explicit.push(eq);
      }
    });

    return { explicitEquations: explicit, implicitEquations: implicit };
  }, [equations]);

  // Generate high-density plot data for explicit functions
  const { rawDataMap, scaleDisparityDetected } = useMemo(() => {
    const numPoints = 400;
    const rawMap: Record<string, { x: number; y: number | null }[]> = {};
    const maxMap: Record<string, number> = {};

    explicitEquations.forEach((eq) => {
      const data = generatePlotData(eq.expression, bounds.xMin, bounds.xMax, numPoints);
      rawMap[eq.id] = data;

      let maxAbs = 0;
      data.forEach((d) => {
        if (d.y !== null && !isNaN(d.y) && isFinite(d.y)) {
          const abs = Math.abs(d.y);
          if (abs > maxAbs) maxAbs = abs;
        }
      });
      maxMap[eq.id] = maxAbs;
    });

    const maxVals = Object.values(maxMap).filter((v) => v > 0);
    let disparity = false;
    if (maxVals.length >= 2) {
      const maxOverall = Math.max(...maxVals);
      const minOverall = Math.min(...maxVals);
      if (minOverall > 0 && maxOverall / minOverall >= 100) {
        disparity = true;
      }
    }

    return { rawDataMap: rawMap, scaleDisparityDetected: disparity };
  }, [explicitEquations, bounds.xMin, bounds.xMax]);

  // Generate Marching Squares implicit contour SVG paths
  const implicitPaths = useMemo(() => {
    const margin = { top: 20, right: 35, left: 65, bottom: 20 };
    return implicitEquations.map((eq) => {
      const segments = generateImplicitContour(
        eq.expression,
        bounds.xMin,
        bounds.xMax,
        bounds.yMin,
        bounds.yMax,
        110
      );
      const svgPath = segmentsToSvgPath(
        segments,
        bounds.xMin,
        bounds.xMax,
        bounds.yMin,
        bounds.yMax,
        containerDimensions.width,
        containerDimensions.height,
        margin
      );
      return {
        id: eq.id,
        expression: eq.expression,
        color: eq.color,
        svgPath,
        segmentCount: segments.length,
      };
    });
  }, [implicitEquations, bounds, containerDimensions]);

  // Transform data points for Recharts
  const chartData = useMemo(() => {
    const numPoints = 400;
    const step = (bounds.xMax - bounds.xMin) / numPoints;
    const data: Record<string, any>[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const x = bounds.xMin + i * step;
      const point: Record<string, any> = {
        x: Number(x.toFixed(3)),
        _raw: {},
      };

      explicitEquations.forEach((eq) => {
        const rawPoint = rawDataMap[eq.id]?.[i];
        if (rawPoint && rawPoint.y !== null && !isNaN(rawPoint.y) && isFinite(rawPoint.y)) {
          point._raw[eq.id] = rawPoint.y;
          if (yScale === 'log') {
            point[eq.id] = symlog(rawPoint.y);
          } else {
            point[eq.id] = rawPoint.y;
          }
        } else {
          point[eq.id] = null;
          point._raw[eq.id] = null;
        }
      });

      data.push(point);
    }

    return data;
  }, [explicitEquations, bounds, rawDataMap, yScale]);

  // Compute leader-line callout labels for explicit functions
  const curveLabelPoints = useMemo(() => {
    if (!showLineLabels) return [];

    return explicitEquations
      .map((eq, index) => {
        const data = rawDataMap[eq.id];
        if (!data || data.length === 0) return null;

        const xTargets = [
          bounds.xMax * 0.4,
          bounds.xMax * 0.65,
          bounds.xMax * 0.88,
          bounds.xMax * 0.25,
        ];
        const targetX = xTargets[index % xTargets.length];

        let bestPoint: { x: number; y: number } | null = null;
        let minDiff = Infinity;

        data.forEach((p) => {
          if (
            p.y !== null &&
            !isNaN(p.y) &&
            isFinite(p.y) &&
            p.x >= bounds.xMin &&
            p.x <= bounds.xMax &&
            p.y >= bounds.yMin &&
            p.y <= bounds.yMax
          ) {
            const diff = Math.abs(p.x - targetX);
            if (p.x > 0 && diff < minDiff) {
              minDiff = diff;
              bestPoint = { x: p.x, y: p.y };
            }
          }
        });

        if (!bestPoint) {
          for (let i = data.length - 1; i >= 0; i--) {
            const p = data[i];
            if (
              p &&
              p.y !== null &&
              !isNaN(p.y) &&
              isFinite(p.y) &&
              p.x >= bounds.xMin &&
              p.x <= bounds.xMax &&
              p.y >= bounds.yMin &&
              p.y <= bounds.yMax
            ) {
              bestPoint = { x: p.x, y: p.y };
              break;
            }
          }
        }

        if (!bestPoint) return null;

        const plottedY = yScale === 'log' ? symlog(bestPoint.y) : bestPoint.y;
        return {
          id: eq.id,
          expression: eq.expression,
          color: eq.color,
          x: bestPoint.x,
          y: plottedY,
          rawY: bestPoint.y,
          offsetY: 8 + (index % 2) * 6,
        };
      })
      .filter(Boolean) as {
      id: string;
      expression: string;
      color: string;
      x: number;
      y: number;
      rawY: number;
      offsetY: number;
    }[];
  }, [explicitEquations, bounds, rawDataMap, showLineLabels, yScale]);

  // Compute D3-style Nice Ticks for X and Y axes
  const xTicks = useMemo(
    () => generateNiceTicks(bounds.xMin, bounds.xMax, 7),
    [bounds.xMin, bounds.xMax]
  );

  const yTicksConfig = useMemo(() => {
    if (yScale === 'log') {
      const logMin = symlog(bounds.yMin);
      const logMax = symlog(bounds.yMax);
      const ticks = generateNiceTicks(logMin, logMax, 7);
      return {
        ticks,
        domain: [logMin, logMax],
        tickFormatter: (val: number) => {
          if (val === 0) return '0';
          const original = invSymlog(val);
          return formatAxisNumber(original);
        },
      };
    }

    const ticks = generateNiceTicks(bounds.yMin, bounds.yMax, 7);
    return {
      ticks,
      domain: [bounds.yMin, bounds.yMax],
      tickFormatter: (val: number) => formatAxisNumber(val),
    };
  }, [bounds.yMin, bounds.yMax, yScale]);

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsMouseDown(true);
    touchState.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialBounds: { ...bounds },
      initialDist: 0,
      isDragging: true,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !touchState.current.isDragging) return;
    const container = chartContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const dx = e.clientX - touchState.current.startX;
    const dy = e.clientY - touchState.current.startY;

    const init = touchState.current.initialBounds;
    const xSpan = init.xMax - init.xMin;
    const ySpan = init.yMax - init.yMin;

    const shiftX = (dx / width) * xSpan;
    const shiftY = (dy / height) * ySpan;

    setBounds({
      xMin: Number((init.xMin - shiftX).toFixed(2)),
      xMax: Number((init.xMax - shiftX).toFixed(2)),
      yMin: Number((init.yMin + shiftY).toFixed(2)),
      yMax: Number((init.yMax + shiftY).toFixed(2)),
    });
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    touchState.current.isDragging = false;
  };

  // Mouse Wheel / Trackpad Pinch Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn(0.85);
    } else {
      zoomOut(1.2);
    }
  };

  // Export current graph view as High-Resolution PNG with Title & Implicit Paths
  const handleExportPNG = () => {
    const svg = chartContainerRef.current?.querySelector('svg');
    if (!svg) {
      alert('Graph SVG is not available.');
      return;
    }

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const scaleFactor = 2;
      const width = (svg.clientWidth || 800) * scaleFactor;
      const height = (svg.clientHeight || 450) * scaleFactor;
      const topPadding = 70;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height + topPadding;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height + topPadding);

        ctx.fillStyle = '#111827';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(chartTitle || 'MathHub Graph', width / 2, 40);

        ctx.fillStyle = '#6b7280';
        ctx.font = '14px monospace';
        ctx.fillText(
          `X ∈ [${bounds.xMin}, ${bounds.xMax}], Y ∈ [${bounds.yMin}, ${bounds.yMax}]`,
          width / 2,
          60
        );

        ctx.drawImage(img, 0, topPadding, width, height);

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `${(chartTitle || 'mathhub-graph').replace(/\s+/g, '_')}-plot.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Export current graph view as SVG with Title
  const handleExportSVG = () => {
    const svg = chartContainerRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${(chartTitle || 'mathhub-graph').replace(/\s+/g, '_')}-plot.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Chart Canvas Card */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-[var(--card-border)] flex flex-col min-h-[520px] relative">
        {/* Editable Chart Title Bar */}
        <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-[var(--card-border)]/60">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                placeholder="Enter chart title..."
                className="math-input py-1 px-2.5 text-sm font-semibold flex-1"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                title="Save Title"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-2 cursor-pointer select-none py-0.5 px-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
              title="Click to edit chart title"
            >
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {chartTitle}
              </h2>
              <Pencil
                size={13}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}

          {/* Quick status pill */}
          <span className="text-[11px] font-mono text-[var(--muted)] hidden sm:inline-block">
            4-Quadrant Cartesian Plane
          </span>
        </div>

        {/* Graph Header: Legend, Scale, Zoom, and Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[var(--card-border)]">
          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-2">
            {equations.map((eq) => {
              const isPlotted = eq.expression.trim() !== '';
              const isImplicit = isImplicitEquation(eq.expression);
              return (
                <button
                  key={eq.id}
                  onClick={() => updateEquation(eq.id, undefined, !eq.visible)}
                  onMouseEnter={() => setHoveredEqId(eq.id)}
                  onMouseLeave={() => setHoveredEqId(null)}
                  disabled={!isPlotted}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    !isPlotted
                      ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400'
                      : eq.visible
                      ? 'bg-gray-100 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'opacity-50 line-through bg-gray-50 dark:bg-gray-800 text-gray-400'
                  }`}
                  title={eq.visible ? 'Click to hide curve' : 'Click to show curve'}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                    style={{ backgroundColor: eq.visible ? eq.color : '#9ca3af' }}
                  />
                  <span>{isImplicit ? eq.expression : `f(x) = ${eq.expression || '...'}`}</span>
                  {isPlotted && (
                    <span className="text-[10px] text-gray-400 ml-0.5">
                      {eq.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Toolbar: Zoom + Scale + Quick Download */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-0.5 border border-[var(--card-border)]">
              <button
                onClick={() => zoomIn(0.7)}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => zoomOut(1.4)}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={() => pan('left')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                title="Pan Left"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => pan('right')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                title="Pan Right"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => pan('up')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                title="Pan Up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => pan('down')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                title="Pan Down"
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={autoFitView}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors"
                title="4-Quadrant Auto-Fit View"
              >
                <Maximize2 size={13} />
                <span>Auto-Fit</span>
              </button>
              <button
                onClick={resetBounds}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                title="Reset to 4-Quadrant View [-8, 8]"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Line Labels & Quadrants Toggles */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-0.5 border border-[var(--card-border)]">
              <button
                onClick={() => setShowLineLabels(!showLineLabels)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  showLineLabels
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Toggle On-Chart Line Labels"
              >
                <Tag size={12} />
                <span>Labels</span>
              </button>
              <button
                onClick={() => setShowQuadrants(!showQuadrants)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  showQuadrants
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Toggle 4 Quadrant Indicators"
              >
                <Grid size={12} />
                <span>4 Quadrants</span>
              </button>
            </div>

            {/* Linear / Log Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-0.5 rounded-xl border border-[var(--card-border)]">
              <button
                onClick={() => setYScale('linear')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  yScale === 'linear'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setYScale('log')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  yScale === 'log'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Sparkles size={11} />
                <span>Log</span>
              </button>
            </div>

            {/* Range adjustment toggle */}
            <button
              onClick={() => setShowRangeInputs(!showRangeInputs)}
              className={`p-1.5 rounded-xl border border-[var(--card-border)] transition-colors ${
                showRangeInputs
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
              }`}
              title="Manual Axis Bounds Settings"
            >
              <SlidersHorizontal size={14} />
            </button>

            {/* Quick Export */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-0.5 border border-[var(--card-border)]">
              <button
                onClick={handleExportPNG}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                title="Download this exact view as PNG with Title"
              >
                <Download size={13} />
                <span>PNG</span>
              </button>
              <button
                onClick={handleExportSVG}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                title="Download this exact view as SVG with Title"
              >
                <FileCode size={13} />
                <span>SVG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Manual Range Adjustment Panel */}
        {showRangeInputs && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-[var(--card-border)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-[var(--muted)] font-mono block mb-1">X Min</label>
              <input
                type="number"
                value={bounds.xMin}
                onChange={(e) => setBounds({ ...bounds, xMin: parseFloat(e.target.value) || -1 })}
                className="math-input py-1 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[var(--muted)] font-mono block mb-1">X Max</label>
              <input
                type="number"
                value={bounds.xMax}
                onChange={(e) => setBounds({ ...bounds, xMax: parseFloat(e.target.value) || 1 })}
                className="math-input py-1 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[var(--muted)] font-mono block mb-1">Y Min</label>
              <input
                type="number"
                value={bounds.yMin}
                onChange={(e) => setBounds({ ...bounds, yMin: parseFloat(e.target.value) || -1 })}
                className="math-input py-1 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[var(--muted)] font-mono block mb-1">Y Max</label>
              <input
                type="number"
                value={bounds.yMax}
                onChange={(e) => setBounds({ ...bounds, yMax: parseFloat(e.target.value) || 1 })}
                className="math-input py-1 text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* Viewport Range Info Badge */}
        <div className="flex justify-between items-center text-[11px] text-[var(--muted)] px-1 mb-1 font-mono">
          <span>
            4 Quadrants: X ∈ [{bounds.xMin}, {bounds.xMax}], Y ∈ [{bounds.yMin}, {bounds.yMax}]
          </span>
          <span className="text-blue-500 font-medium">
            🖐️ Drag with mouse/finger to pan • ✌️ 2-finger pinch or scroll to zoom
          </span>
        </div>

        {/* Recharts Container with Non-Passive Gesture Isolation & Implicit 2D Curves */}
        <div
          ref={chartContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ touchAction: 'none' }}
          className={`flex-1 w-full min-h-[410px] relative select-none touch-none ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Subtle 4 Quadrant Watermarks */}
          {showQuadrants && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2 select-none z-0 px-16 py-6 opacity-35 dark:opacity-25 font-bold font-mono">
              <div className="flex items-start justify-end p-2 text-xs text-gray-500">
                <span>II (-,+)</span>
              </div>
              <div className="flex items-start justify-start p-2 text-xs text-gray-500">
                <span>I (+,+)</span>
              </div>
              <div className="flex items-end justify-end p-2 text-xs text-gray-500">
                <span>III (-,-)</span>
              </div>
              <div className="flex items-end justify-start p-2 text-xs text-gray-500">
                <span>IV (+,-)</span>
              </div>
            </div>
          )}

          {/* SVG Overlay for Implicit Equations (e.g. circles, ellipses, hyperbolas) */}
          {implicitPaths.length > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none z-10 w-full h-full"
              style={{ width: '100%', height: '100%' }}
            >
              {implicitPaths.map((imp) =>
                imp.svgPath ? (
                  <path
                    key={`implicit-${imp.id}`}
                    d={imp.svgPath}
                    fill="none"
                    stroke={imp.color}
                    strokeWidth={hoveredEqId === imp.id ? 3.5 : 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null
              )}
            </svg>
          )}

          <ResponsiveContainer width="100%" height={410}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 35, left: 65, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[bounds.xMin, bounds.xMax]}
                ticks={xTicks}
                tickFormatter={(val) => Number(val.toFixed(2)).toString()}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                allowDataOverflow={true}
              />
              <YAxis
                domain={yTicksConfig.domain as any}
                ticks={yTicksConfig.ticks}
                tickFormatter={yTicksConfig.tickFormatter}
                stroke="#9ca3af"
                width={65}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                allowDataOverflow={true}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const rawPoint = payload[0]?.payload?._raw || {};
                  return (
                    <div className="bg-gray-900/95 backdrop-blur text-white p-3 rounded-xl shadow-xl border border-gray-700 text-xs font-mono space-y-1.5 z-50">
                      <div className="text-gray-400 font-semibold border-b border-gray-700 pb-1">
                        x = {label}
                      </div>
                      {payload.map((p: any) => {
                        const eq = equations.find((e) => e.id === p.dataKey);
                        if (!eq) return null;
                        const trueY = rawPoint[eq.id];
                        return (
                          <div key={eq.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: eq.color }}
                              />
                              <span className="text-gray-300">f(x) = {eq.expression}:</span>
                            </div>
                            <span className="font-semibold text-white">
                              {trueY !== undefined && trueY !== null
                                ? formatAxisNumber(trueY) + ` (${Number(trueY.toFixed(4))})`
                                : 'undefined (non-real)'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
              {/* Prominent Crosshair Cartesian Axes */}
              <ReferenceLine x={0} stroke="#6b7280" strokeWidth={1.75} />
              <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.75} />

              {/* Key Intersection Point Dots: (0,0), (1,1), (-1,-1) */}
              <ReferenceDot x={0} y={0} r={4} fill="#3b82f6" stroke="#ffffff" strokeWidth={2} />
              {bounds.xMin <= 1 && bounds.xMax >= 1 && bounds.yMin <= 1 && bounds.yMax >= 1 && (
                <ReferenceDot
                  x={1}
                  y={yScale === 'log' ? symlog(1) : 1}
                  r={3.5}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              )}
              {bounds.xMin <= -1 && bounds.xMax >= -1 && bounds.yMin <= -1 && bounds.yMax >= -1 && (
                <ReferenceDot
                  x={-1}
                  y={yScale === 'log' ? symlog(-1) : -1}
                  r={3.5}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              )}

              {/* Render Explicit Curves */}
              {explicitEquations.map((eq) => {
                const isHovered = hoveredEqId === eq.id;
                return (
                  <Line
                    key={eq.id}
                    type="monotone"
                    dataKey={eq.id}
                    stroke={eq.color}
                    strokeWidth={isHovered ? 3.5 : 2.5}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls={false}
                  />
                );
              })}

              {/* On-Chart Direct Line Labels with Staggering */}
              {showLineLabels &&
                curveLabelPoints.map((lbl) => (
                  <ReferenceDot
                    key={`lbl-${lbl.id}`}
                    x={lbl.x}
                    y={lbl.y}
                    r={4}
                    fill={lbl.color}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    label={{
                      value: `f(x) = ${lbl.expression}`,
                      fill: lbl.color,
                      position: 'top',
                      fontSize: 11,
                      fontWeight: 700,
                      offset: lbl.offsetY,
                    }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scale Disparity Alert Banner for Linear Mode */}
      {scaleDisparityDetected && yScale === 'linear' && (
        <div className="animate-fade-in bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold">Scale Disparity Detected: </span>
              <span>
                Lower growth functions appear flat near zero due to higher growth curves. Switch to Log scale or use Auto-Fit to compare all functions clearly.
              </span>
            </div>
          </div>
          <button
            onClick={() => setYScale('log')}
            className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1"
          >
            <Sparkles size={12} />
            <span>Switch to Log Scale</span>
          </button>
        </div>
      )}
    </div>
  );
}
