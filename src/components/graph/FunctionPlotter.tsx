'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import {
  generatePlotData,
  generateNiceTicks,
  formatAxisNumber,
  pointsToSvgPath,
} from '@/lib/math/graphData';
import {
  isImplicitEquation,
  generateImplicitContour,
  segmentsToSvgPath,
  PlotBox,
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
  Scale,
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

const TOTAL_HEIGHT = 480;
const PADDING = { top: 25, right: 30, bottom: 25, left: 30 };

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
  const [isSquareAspect, setIsSquareAspect] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: TOTAL_HEIGHT });
  const [mousePos, setMousePos] = useState<{ x: number; y: number; px: number; py: number } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Sync temp title
  useEffect(() => {
    setTempTitle(chartTitle);
  }, [chartTitle]);

  const handleSaveTitle = () => {
    setChartTitle(tempTitle.trim() || '4-Quadrant Function Plot');
    setIsEditingTitle(false);
  };

  // Measure container dimensions
  const updateDims = useCallback(() => {
    if (chartContainerRef.current) {
      const w = chartContainerRef.current.clientWidth || 800;
      setContainerDimensions({ width: w, height: TOTAL_HEIGHT });
    }
  }, []);

  useEffect(() => {
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, [updateDims]);

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

  // Non-passive Touch Listener for gesture isolation
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
      const height = TOTAL_HEIGHT;

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

  // Origin-Centric Mathematical Plot Box
  const plotBox: PlotBox = useMemo(() => {
    const left = PADDING.left;
    const top = PADDING.top;
    const width = Math.max(1, containerDimensions.width - PADDING.left - PADDING.right);
    const height = Math.max(1, TOTAL_HEIGHT - PADDING.top - PADDING.bottom);
    return { left, top, width, height };
  }, [containerDimensions.width]);

  // Coordinate transforms
  const xSpan = Math.max(1e-9, bounds.xMax - bounds.xMin);
  const ySpan = Math.max(1e-9, bounds.yMax - bounds.yMin);

  const toPxX = useCallback((x: number) => {
    return plotBox.left + ((x - bounds.xMin) / xSpan) * plotBox.width;
  }, [bounds.xMin, xSpan, plotBox]);

  const toPxY = useCallback((y: number) => {
    if (yScale === 'log') {
      const logMin = symlog(bounds.yMin);
      const logMax = symlog(bounds.yMax);
      const logSpan = Math.max(1e-9, logMax - logMin);
      const ly = symlog(y);
      return plotBox.top + ((logMax - ly) / logSpan) * plotBox.height;
    }
    return plotBox.top + ((bounds.yMax - y) / ySpan) * plotBox.height;
  }, [bounds.yMin, bounds.yMax, ySpan, yScale, plotBox]);

  const fromPxX = useCallback((px: number) => {
    return bounds.xMin + ((px - plotBox.left) / plotBox.width) * xSpan;
  }, [bounds.xMin, xSpan, plotBox]);

  const fromPxY = useCallback((py: number) => {
    if (yScale === 'log') {
      const logMin = symlog(bounds.yMin);
      const logMax = symlog(bounds.yMax);
      const logSpan = Math.max(1e-9, logMax - logMin);
      const ly = logMax - ((py - plotBox.top) / plotBox.height) * logSpan;
      return invSymlog(ly);
    }
    return bounds.yMax - ((py - plotBox.top) / plotBox.height) * ySpan;
  }, [bounds.yMin, bounds.yMax, ySpan, yScale, plotBox]);

  // Pixel Position of the Origin (0,0)
  const originPxX = toPxX(0);
  const originPxY = toPxY(0);

  // Clamped positions for axis lines so ticks remain visible when panned off screen
  const axisLineY = Math.max(plotBox.top, Math.min(plotBox.top + plotBox.height, originPxY));
  const axisLineX = Math.max(plotBox.left, Math.min(plotBox.left + plotBox.width, originPxX));

  const isOriginOnScreen =
    bounds.xMin <= 0 && bounds.xMax >= 0 && bounds.yMin <= 0 && bounds.yMax >= 0;

  // Separate explicit and implicit equations
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

  // Generate continuous SVG paths for explicit functions with asymptote splitting
  const explicitPaths = useMemo(() => {
    const numPoints = 600;
    return explicitEquations.map((eq) => {
      const data = generatePlotData(eq.expression, bounds.xMin, bounds.xMax, numPoints);
      const pathD = pointsToSvgPath(
        data,
        bounds.xMin,
        bounds.xMax,
        bounds.yMin,
        bounds.yMax,
        plotBox,
        yScale
      );

      // Find label anchor point
      let labelPoint: { x: number; y: number; px: number; py: number } | null = null;
      const targetX = bounds.xMax * 0.65;
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
          if (diff < minDiff) {
            minDiff = diff;
            labelPoint = { x: p.x, y: p.y, px: toPxX(p.x), py: toPxY(p.y) };
          }
        }
      });

      return {
        id: eq.id,
        expression: eq.expression,
        color: eq.color,
        pathD,
        labelPoint,
      };
    });
  }, [explicitEquations, bounds, plotBox, yScale, toPxX, toPxY]);

  // Detect scale disparity among explicit functions
  const scaleDisparityDetected = useMemo(() => {
    if (explicitEquations.length < 2) return false;
    const maxVals: number[] = [];
    explicitEquations.forEach((eq) => {
      const data = generatePlotData(eq.expression, bounds.xMin, bounds.xMax, 80);
      let maxAbs = 0;
      data.forEach((d) => {
        if (d.y !== null && !isNaN(d.y) && isFinite(d.y)) {
          const abs = Math.abs(d.y);
          if (abs > maxAbs) maxAbs = abs;
        }
      });
      if (maxAbs > 0) maxVals.push(maxAbs);
    });
    if (maxVals.length >= 2) {
      const maxOverall = Math.max(...maxVals);
      const minOverall = Math.min(...maxVals);
      return minOverall > 0 && maxOverall / minOverall >= 100;
    }
    return false;
  }, [explicitEquations, bounds.xMin, bounds.xMax]);

  // Generate Marching Squares implicit contour SVG paths
  const implicitPaths = useMemo(() => {
    return implicitEquations.map((eq) => {
      const segments = generateImplicitContour(
        eq.expression,
        bounds.xMin,
        bounds.xMax,
        bounds.yMin,
        bounds.yMax,
        120
      );
      const svgPath = segmentsToSvgPath(
        segments,
        bounds.xMin,
        bounds.xMax,
        bounds.yMin,
        bounds.yMax,
        plotBox
      );
      return {
        id: eq.id,
        expression: eq.expression,
        color: eq.color,
        svgPath,
      };
    });
  }, [implicitEquations, bounds, plotBox]);

  // Compute D3-style Nice Ticks for X and Y axes
  const xTicks = useMemo(
    () => generateNiceTicks(bounds.xMin, bounds.xMax, 8),
    [bounds.xMin, bounds.xMax]
  );

  const yTicks = useMemo(
    () => generateNiceTicks(bounds.yMin, bounds.yMax, 8),
    [bounds.yMin, bounds.yMax]
  );

  // Toggle 1:1 Square Aspect Ratio for circles and isometric graphing
  const handleToggleSquareAspect = () => {
    const nextState = !isSquareAspect;
    setIsSquareAspect(nextState);
    if (nextState) {
      const ratio = plotBox.width / plotBox.height;
      const ySpanCurrent = bounds.yMax - bounds.yMin;
      const newXHalf = (ySpanCurrent * ratio) / 2;
      const xCenter = (bounds.xMin + bounds.xMax) / 2;
      setBounds({
        xMin: Number((xCenter - newXHalf).toFixed(2)),
        xMax: Number((xCenter + newXHalf).toFixed(2)),
        yMin: bounds.yMin,
        yMax: bounds.yMax,
      });
    }
  };

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
    const container = chartContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (px >= plotBox.left && px <= plotBox.left + plotBox.width && py >= plotBox.top && py <= plotBox.top + plotBox.height) {
      setMousePos({
        px,
        py,
        x: Number(fromPxX(px).toFixed(2)),
        y: Number(fromPxY(py).toFixed(2)),
      });
    } else {
      setMousePos(null);
    }

    if (!isMouseDown || !touchState.current.isDragging) return;

    const width = container.clientWidth || 600;
    const height = TOTAL_HEIGHT;

    const dx = e.clientX - touchState.current.startX;
    const dy = e.clientY - touchState.current.startY;

    const init = touchState.current.initialBounds;
    const initXSpan = init.xMax - init.xMin;
    const initYSpan = init.yMax - init.yMin;

    const shiftX = (dx / width) * initXSpan;
    const shiftY = (dy / height) * initYSpan;

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

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    touchState.current.isDragging = false;
    setMousePos(null);
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

  // Export current graph view as High-Resolution PNG with Title & Origin-Centric Axes
  const handleExportPNG = () => {
    const svg = svgRef.current;
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
      const width = (svg.clientWidth || containerDimensions.width) * scaleFactor;
      const height = (svg.clientHeight || TOTAL_HEIGHT) * scaleFactor;
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
          `4-Quadrant Cartesian Plane: X ∈ [${bounds.xMin}, ${bounds.xMax}], Y ∈ [${bounds.yMin}, ${bounds.yMax}]`,
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
    const svg = svgRef.current;
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
      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-[var(--card-border)] flex flex-col min-h-[560px] relative">
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
            Origin-Centric (0,0) Cartesian Plane
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

            {/* Line Labels & Quadrants & 1:1 Aspect Ratio Toggles */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-0.5 border border-[var(--card-border)]">
              <button
                onClick={handleToggleSquareAspect}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSquareAspect
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Lock 1:1 Aspect Ratio (Perfect Circle & Isometric Grid)"
              >
                <Scale size={12} />
                <span>1:1 Ratio</span>
              </button>
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
            Origin-Centric 4-Quadrant Plane: X ∈ [{bounds.xMin}, {bounds.xMax}], Y ∈ [{bounds.yMin}, {bounds.yMax}]
            {isSquareAspect && ' • 1:1 Aspect Ratio'}
          </span>
          <span className="text-blue-500 font-medium">
            🖐️ Drag to pan • ✌️ Pinch or scroll to zoom
          </span>
        </div>

        {/* Origin-Centric Mathematical SVG Canvas */}
        <div
          ref={chartContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ touchAction: 'none' }}
          className={`flex-1 w-full min-h-[${TOTAL_HEIGHT}px] relative select-none touch-none bg-[#fdfdfd] dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/80 ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-crosshair'
          }`}
        >
          {/* 4 Quadrant Background Watermarks */}
          {showQuadrants && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2 select-none z-0 px-12 py-8 opacity-25 dark:opacity-20 font-bold font-mono text-xs text-gray-500">
              <div className="flex items-start justify-start p-2">
                <span>Quadrant II (-,+)</span>
              </div>
              <div className="flex items-start justify-end p-2">
                <span>Quadrant I (+,+)</span>
              </div>
              <div className="flex items-end justify-start p-2">
                <span>Quadrant III (-,-)</span>
              </div>
              <div className="flex items-end justify-end p-2">
                <span>Quadrant IV (+,-)</span>
              </div>
            </div>
          )}

          {/* Core Mathematical SVG Render Layer */}
          <svg
            ref={svgRef}
            className="w-full h-full absolute inset-0 z-10"
            viewBox={`0 0 ${containerDimensions.width} ${TOTAL_HEIGHT}`}
            preserveAspectRatio="none"
          >
            <defs>
              {/* Arrow Markers for X and Y Axes */}
              <marker
                id="axis-arrow-x"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#374151" className="dark:fill-gray-200" />
              </marker>
              <marker
                id="axis-arrow-y"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#374151" className="dark:fill-gray-200" />
              </marker>

              {/* Clip path for curves to stay inside plot box */}
              <clipPath id="plot-clip">
                <rect
                  x={plotBox.left}
                  y={plotBox.top}
                  width={plotBox.width}
                  height={plotBox.height}
                />
              </clipPath>
            </defs>

            {/* 1. Grid Lines (Centered on ticks) */}
            <g className="grid-lines" opacity="0.85">
              {/* Vertical Grid Lines (X-ticks) */}
              {xTicks.map((xVal) => {
                const px = toPxX(xVal);
                if (px < plotBox.left || px > plotBox.left + plotBox.width) return null;
                const isOrigin = Math.abs(xVal) < 1e-6;
                return (
                  <line
                    key={`grid-x-${xVal}`}
                    x1={px}
                    y1={plotBox.top}
                    x2={px}
                    y2={plotBox.top + plotBox.height}
                    stroke={isOrigin ? '#9ca3af' : '#e5e7eb'}
                    strokeWidth={isOrigin ? 1.5 : 1}
                    strokeDasharray={isOrigin ? 'none' : '3 3'}
                    className="dark:stroke-gray-800"
                  />
                );
              })}

              {/* Horizontal Grid Lines (Y-ticks) */}
              {yTicks.map((yVal) => {
                const py = toPxY(yVal);
                if (py < plotBox.top || py > plotBox.top + plotBox.height) return null;
                const isOrigin = Math.abs(yVal) < 1e-6;
                return (
                  <line
                    key={`grid-y-${yVal}`}
                    x1={plotBox.left}
                    y1={py}
                    x2={plotBox.left + plotBox.width}
                    y2={py}
                    stroke={isOrigin ? '#9ca3af' : '#e5e7eb'}
                    strokeWidth={isOrigin ? 1.5 : 1}
                    strokeDasharray={isOrigin ? 'none' : '3 3'}
                    className="dark:stroke-gray-800"
                  />
                );
              })}
            </g>

            {/* 2. Central Origin-Centric Coordinate Axes (Crosshairs through Origin) */}
            <g className="central-axes">
              {/* Horizontal X-Axis Line through y = 0 */}
              <line
                x1={plotBox.left - 10}
                y1={axisLineY}
                x2={plotBox.left + plotBox.width + 12}
                y2={axisLineY}
                stroke="#1f2937"
                strokeWidth={2}
                markerEnd="url(#axis-arrow-x)"
                className="dark:stroke-gray-100"
              />
              {/* X-Axis Label */}
              <text
                x={plotBox.left + plotBox.width + 20}
                y={axisLineY + 4}
                fill="#1f2937"
                className="dark:fill-gray-100 font-serif italic text-sm font-bold select-none"
              >
                x
              </text>

              {/* Vertical Y-Axis Line through x = 0 */}
              <line
                x1={axisLineX}
                y1={plotBox.top + plotBox.height + 10}
                x2={axisLineX}
                y2={plotBox.top - 12}
                stroke="#1f2937"
                strokeWidth={2}
                markerEnd="url(#axis-arrow-y)"
                className="dark:stroke-gray-100"
              />
              {/* Y-Axis Label */}
              <text
                x={axisLineX}
                y={plotBox.top - 18}
                textAnchor="middle"
                fill="#1f2937"
                className="dark:fill-gray-100 font-serif italic text-sm font-bold select-none"
              >
                y
              </text>

              {/* Origin Label "0" */}
              {isOriginOnScreen && (
                <text
                  x={originPxX - 7}
                  y={originPxY + 14}
                  textAnchor="end"
                  fill="#4b5563"
                  className="dark:fill-gray-400 font-mono text-[11px] font-semibold select-none"
                >
                  0
                </text>
              )}

              {/* X-Axis Tick Marks and Numbers along y = 0 */}
              {xTicks.map((xVal) => {
                if (Math.abs(xVal) < 1e-6) return null; // 0 already labeled
                const px = toPxX(xVal);
                if (px < plotBox.left + 15 || px > plotBox.left + plotBox.width - 15) return null;
                return (
                  <g key={`xtick-${xVal}`}>
                    {/* Tick notch */}
                    <line
                      x1={px}
                      y1={axisLineY - 4}
                      x2={px}
                      y2={axisLineY + 4}
                      stroke="#1f2937"
                      strokeWidth={1.5}
                      className="dark:stroke-gray-200"
                    />
                    {/* Tick number directly below axis */}
                    <text
                      x={px}
                      y={axisLineY + 16}
                      textAnchor="middle"
                      fill="#4b5563"
                      className="dark:fill-gray-300 font-mono text-[10px] font-semibold select-none"
                    >
                      {formatAxisNumber(xVal)}
                    </text>
                  </g>
                );
              })}

              {/* Y-Axis Tick Marks and Numbers along x = 0 */}
              {yTicks.map((yVal) => {
                if (Math.abs(yVal) < 1e-6) return null; // 0 already labeled
                const py = toPxY(yVal);
                if (py < plotBox.top + 15 || py > plotBox.top + plotBox.height - 15) return null;
                return (
                  <g key={`ytick-${yVal}`}>
                    {/* Tick notch */}
                    <line
                      x1={axisLineX - 4}
                      y1={py}
                      x2={axisLineX + 4}
                      stroke="#1f2937"
                      strokeWidth={1.5}
                      className="dark:stroke-gray-200"
                    />
                    {/* Tick number directly to the left of axis */}
                    <text
                      x={axisLineX - 7}
                      y={py + 3.5}
                      textAnchor="end"
                      fill="#4b5563"
                      className="dark:fill-gray-300 font-mono text-[10px] font-semibold select-none"
                    >
                      {formatAxisNumber(yVal)}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* 3. Function Curves & Implicit Curves (Clipped to Plot Area) */}
            <g clipPath="url(#plot-clip)">
              {/* Explicit Functions f(x) */}
              {explicitPaths.map((eq) =>
                eq.pathD ? (
                  <path
                    key={`explicit-${eq.id}-${eq.expression}`}
                    d={eq.pathD}
                    fill="none"
                    stroke={eq.color}
                    strokeWidth={hoveredEqId === eq.id ? 3.5 : 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null
              )}

              {/* Implicit 2D Curves F(x,y)=0 (Circles, Ellipses, Hyperbolas) */}
              {implicitPaths.map((imp) =>
                imp.svgPath ? (
                  <path
                    key={`implicit-${imp.id}-${imp.expression}`}
                    d={imp.svgPath}
                    fill="none"
                    stroke={imp.color}
                    strokeWidth={hoveredEqId === imp.id ? 3.5 : 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null
              )}
            </g>

            {/* 4. On-Chart Direct Function Callout Badges */}
            {showLineLabels &&
              explicitPaths.map((eq, idx) => {
                if (!eq.labelPoint) return null;
                const { px, py } = eq.labelPoint;
                if (px < plotBox.left + 20 || px > plotBox.left + plotBox.width - 60) return null;
                if (py < plotBox.top + 20 || py > plotBox.top + plotBox.height - 20) return null;

                const badgeY = py - 18 - (idx % 2) * 12;
                return (
                  <g key={`lbl-${eq.id}`} className="transition-all select-none">
                    {/* Anchor Dot */}
                    <circle cx={px} cy={py} r={3.5} fill={eq.color} stroke="#ffffff" strokeWidth={1.5} />
                    {/* Leader Line */}
                    <line
                      x1={px}
                      y1={py}
                      x2={px + 10}
                      y2={badgeY + 6}
                      stroke={eq.color}
                      strokeWidth={1.2}
                      strokeDasharray="2 2"
                    />
                    {/* Badge text */}
                    <rect
                      x={px + 8}
                      y={badgeY - 8}
                      width={eq.expression.length * 7 + 55}
                      height={18}
                      rx={4}
                      fill="#ffffff"
                      stroke={eq.color}
                      strokeWidth={1.2}
                      className="dark:fill-gray-900 shadow-sm"
                    />
                    <text
                      x={px + 12}
                      y={badgeY + 5}
                      fill={eq.color}
                      className="font-mono text-[10px] font-bold"
                    >
                      f(x) = {eq.expression}
                    </text>
                  </g>
                );
              })}

            {/* 5. Interactive Mouse Crosshair Tracker */}
            {mousePos && (
              <g className="crosshair-tracker pointer-events-none">
                <line
                  x1={mousePos.px}
                  y1={plotBox.top}
                  x2={mousePos.px}
                  y2={plotBox.top + plotBox.height}
                  stroke="#3b82f6"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.7}
                />
                <line
                  x1={plotBox.left}
                  y1={mousePos.py}
                  x2={plotBox.left + plotBox.width}
                  y2={mousePos.py}
                  stroke="#3b82f6"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.7}
                />
                <circle cx={mousePos.px} cy={mousePos.py} r={3} fill="#3b82f6" />
              </g>
            )}
          </svg>

          {/* Interactive Floating Coordinate Pill */}
          {mousePos && (
            <div
              className="absolute pointer-events-none z-30 bg-gray-900/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[11px] font-mono shadow-lg border border-gray-700/80 -translate-x-1/2 -translate-y-full -mt-2 animate-fade-in"
              style={{ left: mousePos.px, top: mousePos.py }}
            >
              ({mousePos.x}, {mousePos.y})
            </div>
          )}
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
