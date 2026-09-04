'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import { useSearchParams } from 'next/navigation';
import {
  generatePlotData,
  generateNiceTicks,
  formatAxisNumber,
  pointsToSvgPath,
  findVerticalAsymptotes,
  parseExpression,
  isPiecewiseExpression,
  parsePiecewiseBranches,
  extractPiecewiseEndpoints,
  PiecewiseEndpoint,
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
  Split,
} from 'lucide-react';
import * as math from 'mathjs';

interface SnappedPoint {
  x: number;
  y: number;
  px: number;
  py: number;
  color: string;
  expression: string;
  distPx: number;
}

const DEFAULT_DESKTOP_HEIGHT = 520;
const DEFAULT_MOBILE_HEIGHT = 360;
const TOTAL_HEIGHT = DEFAULT_DESKTOP_HEIGHT;
const PADDING = { top: 32, right: 32, bottom: 36, left: 36 };

export default function FunctionPlotter() {
  const {
    equations,
    bounds,
    setBounds,
    resetBounds,
    yScale,
    setYScale,
    chartTitle,
    setChartTitle,
    updateEquation,
    autoFitView,
    pan,
  } = useGraphStore();

  const searchParams = useSearchParams();
  const [highlightedRoots, setHighlightedRoots] = useState<number[]>([]);

  // Synchronize URL parameters (e.g. from Solver or Formulas quick launch)
  useEffect(() => {
    const fn = searchParams.get('fn') || searchParams.get('eq');
    if (fn) {
      const firstEq = useGraphStore.getState().equations[0];
      if (firstEq && firstEq.expression !== fn) {
        updateEquation(firstEq.id, fn, true);
      }
    }

    const rootsParam = searchParams.get('roots');
    if (rootsParam) {
      const parsed = rootsParam.split(',').map(Number).filter((n) => !isNaN(n) && isFinite(n));
      setHighlightedRoots((prev) => {
        if (prev.length === parsed.length && prev.every((v, i) => v === parsed[i])) {
          return prev;
        }
        return parsed;
      });
    }
  }, [searchParams, updateEquation]);

  const [hoveredEqId, setHoveredEqId] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: TOTAL_HEIGHT,
  });

  const [mousePos, setMousePos] = useState<{
    px: number;
    py: number;
    x: number;
    y: number;
  } | null>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showRangeInputs, setShowRangeInputs] = useState(false);
  const [showLineLabels, setShowLineLabels] = useState(true);
  const [showQuadrants, setShowQuadrants] = useState(false);
  const [isSquareAspect, setIsSquareAspect] = useState(false);
  const [showAsymptotes, setShowAsymptotes] = useState(true);

  // Editable title state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(chartTitle);

  useEffect(() => {
    setTempTitle(chartTitle);
  }, [chartTitle]);

  const handleSaveTitle = () => {
    setChartTitle(tempTitle.trim() || '4-Quadrant Function Plot');
    setIsEditingTitle(false);
  };

  // Measure container dimensions with responsive mobile height
  const updateDims = useCallback(() => {
    if (chartContainerRef.current) {
      const w = chartContainerRef.current.clientWidth || 800;
      const h = typeof window !== 'undefined' && window.innerWidth < 768 ? DEFAULT_MOBILE_HEIGHT : DEFAULT_DESKTOP_HEIGHT;
      setContainerDimensions({ width: w, height: h });
    }
  }, []);

  useEffect(() => {
    updateDims();
    const el = chartContainerRef.current;
    if (!el) return;

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateDims();
      });
      ro.observe(el);
    }
    window.addEventListener('resize', updateDims);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateDims);
    };
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

  // Origin-Centric Mathematical Plot Box
  const plotBox: PlotBox = useMemo(() => {
    const left = PADDING.left;
    const top = PADDING.top;
    const width = Math.max(1, containerDimensions.width - PADDING.left - PADDING.right);
    const height = Math.max(1, containerDimensions.height - PADDING.top - PADDING.bottom);
    return { left, top, width, height };
  }, [containerDimensions.width, containerDimensions.height]);

  // Coordinate transforms
  const xSpan = Math.max(1e-9, bounds.xMax - bounds.xMin);
  const ySpan = Math.max(1e-9, bounds.yMax - bounds.yMin);

  const symlog = useCallback((y: number) => (y === 0 ? 0 : Math.sign(y) * Math.log10(1 + Math.abs(y))), []);
  const invSymlog = useCallback((v: number) => (v === 0 ? 0 : Math.sign(v) * (Math.pow(10, Math.abs(v)) - 1)), []);

  const toPxX = useCallback(
    (x: number) => {
      return plotBox.left + ((x - bounds.xMin) / xSpan) * plotBox.width;
    },
    [bounds.xMin, xSpan, plotBox]
  );

  const toPxY = useCallback(
    (y: number) => {
      if (yScale === 'log') {
        const logMin = symlog(bounds.yMin);
        const logMax = symlog(bounds.yMax);
        const logSpan = Math.max(1e-9, logMax - logMin);
        const ly = symlog(y);
        return plotBox.top + ((logMax - ly) / logSpan) * plotBox.height;
      }
      return plotBox.top + ((bounds.yMax - y) / ySpan) * plotBox.height;
    },
    [bounds.yMin, bounds.yMax, ySpan, yScale, plotBox, symlog]
  );

  const fromPxX = useCallback(
    (px: number) => {
      return bounds.xMin + ((px - plotBox.left) / plotBox.width) * xSpan;
    },
    [bounds.xMin, xSpan, plotBox]
  );

  const fromPxY = useCallback(
    (py: number) => {
      if (yScale === 'log') {
        const logMin = symlog(bounds.yMin);
        const logMax = symlog(bounds.yMax);
        const logSpan = Math.max(1e-9, logMax - logMin);
        const ly = logMax - ((py - plotBox.top) / plotBox.height) * logSpan;
        return invSymlog(ly);
      }
      return bounds.yMax - ((py - plotBox.top) / plotBox.height) * ySpan;
    },
    [bounds.yMin, bounds.yMax, ySpan, yScale, plotBox, symlog, invSymlog]
  );

  // Pixel Position of the Origin (0,0)
  const originPxX = toPxX(0);
  const originPxY = toPxY(0);

  // Clamped positions for axis lines so ticks remain visible when panned off screen
  const axisLineY = Math.max(plotBox.top, Math.min(plotBox.top + plotBox.height, originPxY));
  const axisLineX = Math.max(plotBox.left, Math.min(plotBox.left + plotBox.width, originPxX));

  const isOriginOnScreen =
    bounds.xMin <= 0 && bounds.xMax >= 0 && bounds.yMin <= 0 && bounds.yMax >= 0;

  // Non-passive Touch Drag/Pinch listeners
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
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
        const xSpanCur = init.xMax - init.xMin;
        const ySpanCur = init.yMax - init.yMin;

        const shiftX = (dx / width) * xSpanCur;
        const shiftY = (dy / height) * ySpanCur;

        setBounds({
          xMin: Number((init.xMin - shiftX).toFixed(4)),
          xMax: Number((init.xMax - shiftX).toFixed(4)),
          yMin: Number((init.yMin + shiftY).toFixed(4)),
          yMax: Number((init.yMax + shiftY).toFixed(4)),
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
          xMin: Number((xCenter - xHalf).toFixed(4)),
          xMax: Number((xCenter + xHalf).toFixed(4)),
          yMin: Number((yCenter - yHalf).toFixed(4)),
          yMax: Number((yCenter + yHalf).toFixed(4)),
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

  // Non-passive Native Mouse Wheel & Pinch-to-Zoom Listener (Stops Browser Page Zoom Leak)
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Prevent browser native page zoom and page scroll when hovering graph canvas
      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const mouseMathX = fromPxX(px);
      const mouseMathY = fromPxY(py);

      // Handle trackpad pinch-to-zoom (ctrlKey) vs standard mouse wheel (deltaY)
      let zoomFactor = 1;
      if (e.ctrlKey) {
        // Continuous smooth zoom for trackpad pinch
        zoomFactor = Math.exp(e.deltaY * 0.01);
      } else {
        zoomFactor = e.deltaY < 0 ? 0.88 : 1.14;
      }

      const curBounds = boundsRef.current;
      const newXMin = mouseMathX - (mouseMathX - curBounds.xMin) * zoomFactor;
      const newXMax = mouseMathX + (curBounds.xMax - mouseMathX) * zoomFactor;
      const newYMin = mouseMathY - (mouseMathY - curBounds.yMin) * zoomFactor;
      const newYMax = mouseMathY + (curBounds.yMax - mouseMathY) * zoomFactor;

      if (newXMax - newXMin < 1e-4 || newYMax - newYMin < 1e-4) return;
      if (newXMax - newXMin > 1e7 || newYMax - newYMin > 1e7) return;

      setBounds({
        xMin: Number(newXMin.toFixed(4)),
        xMax: Number(newXMax.toFixed(4)),
        yMin: Number(newYMin.toFixed(4)),
        yMax: Number(newYMax.toFixed(4)),
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [fromPxX, fromPxY, setBounds]);

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
    const numPoints = 650;
    return explicitEquations.map((eq) => {
      const data = generatePlotData(eq.expression, bounds.xMin, bounds.xMax, numPoints);
      const asyms = findVerticalAsymptotes(eq.expression, bounds.xMin, bounds.xMax);
      const pathD = pointsToSvgPath(
        data,
        bounds.xMin,
        bounds.xMax,
        bounds.yMin,
        bounds.yMax,
        plotBox,
        yScale,
        asyms
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
        asymptotes: asyms,
        labelPoint,
        piecewiseEndpoints: isPiecewiseExpression(eq.expression)
          ? extractPiecewiseEndpoints(parsePiecewiseBranches(eq.expression))
          : [],
      };
    });
  }, [explicitEquations, bounds, plotBox, yScale, toPxX, toPxY]);

  // Compute all unique vertical asymptotes for dashed guide line rendering
  const allAsymptotes = useMemo(() => {
    if (!showAsymptotes) return [];
    const list: { x: number; label: string; color: string }[] = [];
    explicitPaths.forEach((path) => {
      path.asymptotes.forEach((a) => {
        if (!list.some((item) => Math.abs(item.x - a) < 0.05)) {
          list.push({
            x: a,
            label: `x = ${formatAxisNumber(a)}`,
            color: path.color,
          });
        }
      });
    });
    return list;
  }, [explicitPaths, showAsymptotes]);

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

  // Compute Major D3-style Nice Ticks for X and Y axes
  const xTicks = useMemo(
    () => generateNiceTicks(bounds.xMin, bounds.xMax, 8),
    [bounds.xMin, bounds.xMax]
  );

  const yTicks = useMemo(
    () => generateNiceTicks(bounds.yMin, bounds.yMax, 8),
    [bounds.yMin, bounds.yMax]
  );

  // Compute Minor Sub-grid Ticks (Desmos style 5 subdivisions between major ticks)
  const { minorXTicks, minorYTicks } = useMemo(() => {
    const minorX: number[] = [];
    if (xTicks.length >= 2) {
      const step = (xTicks[1] - xTicks[0]) / 5;
      const first = xTicks[0] - step * 5;
      const last = xTicks[xTicks.length - 1] + step * 5;
      for (let t = first; t <= last + 1e-9; t += step) {
        if (t >= bounds.xMin && t <= bounds.xMax) {
          if (!xTicks.some((maj) => Math.abs(maj - t) < step * 0.2)) {
            minorX.push(t);
          }
        }
      }
    }

    const minorY: number[] = [];
    if (yTicks.length >= 2) {
      const step = (yTicks[1] - yTicks[0]) / 5;
      const first = yTicks[0] - step * 5;
      const last = yTicks[yTicks.length - 1] + step * 5;
      for (let t = first; t <= last + 1e-9; t += step) {
        if (t >= bounds.yMin && t <= bounds.yMax) {
          if (!yTicks.some((maj) => Math.abs(maj - t) < step * 0.2)) {
            minorY.push(t);
          }
        }
      }
    }

    return { minorXTicks: minorX, minorYTicks: minorY };
  }, [xTicks, yTicks, bounds]);

  // Desmos-Style Curve Snapping & Trace Dot
  const snappedPoint: SnappedPoint | null = useMemo(() => {
    if (!mousePos || isMouseDown || explicitEquations.length === 0) return null;
    const mouseMathX = fromPxX(mousePos.px);

    let closest: SnappedPoint | null = null;

    explicitEquations.forEach((eq) => {
      try {
        const compiled = math.compile(parseExpression(eq.expression));
        const evalY = compiled.evaluate({ x: mouseMathX });
        let yVal: number | null = null;
        if (typeof evalY === 'number' && !isNaN(evalY) && isFinite(evalY)) {
          yVal = evalY;
        } else if (evalY && typeof evalY.re === 'number' && Math.abs(evalY.im || 0) < 1e-9) {
          yVal = evalY.re;
        }

        if (
          yVal !== null &&
          yVal >= bounds.yMin - (bounds.yMax - bounds.yMin) * 0.25 &&
          yVal <= bounds.yMax + (bounds.yMax - bounds.yMin) * 0.25
        ) {
          const px = toPxX(mouseMathX);
          const py = toPxY(yVal);
          const dist = Math.abs(mousePos.py - py);
          if (dist < 32 && (!closest || dist < closest.distPx)) {
            closest = {
              x: mouseMathX,
              y: yVal,
              px,
              py,
              color: eq.color,
              expression: eq.expression,
              distPx: dist,
            };
          }
        }
      } catch {
        // Ignore evaluation errors for trace snapping
      }
    });

    return closest;
  }, [mousePos, isMouseDown, explicitEquations, fromPxX, toPxX, toPxY, bounds]);

  // Smooth Animated Zoom for Toolbar Buttons
  const animateZoom = useCallback(
    (factor: number) => {
      const cx = (bounds.xMin + bounds.xMax) / 2;
      const cy = (bounds.yMin + bounds.yMax) / 2;

      const start = { ...bounds };
      const target = {
        xMin: cx - (cx - start.xMin) * factor,
        xMax: cx + (start.xMax - cx) * factor,
        yMin: cy - (cy - start.yMin) * factor,
        yMax: cy + (start.yMax - cy) * factor,
      };

      const startTime = performance.now();
      const duration = 150; // ms

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        setBounds({
          xMin: Number((start.xMin + (target.xMin - start.xMin) * ease).toFixed(4)),
          xMax: Number((start.xMax + (target.xMax - start.xMax) * ease).toFixed(4)),
          yMin: Number((start.yMin + (target.yMin - start.yMin) * ease).toFixed(4)),
          yMax: Number((start.yMax + (target.yMax - start.yMax) * ease).toFixed(4)),
        });

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    },
    [bounds, setBounds]
  );

  const zoomIn = (factor = 0.75) => animateZoom(factor);
  const zoomOut = (factor = 1.33) => animateZoom(factor);

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

    if (
      px >= plotBox.left &&
      px <= plotBox.left + plotBox.width &&
      py >= plotBox.top &&
      py <= plotBox.top + plotBox.height
    ) {
      setMousePos({
        px,
        py,
        x: Number(fromPxX(px).toFixed(3)),
        y: Number(fromPxY(py).toFixed(3)),
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
      xMin: Number((init.xMin - shiftX).toFixed(4)),
      xMax: Number((init.xMax - shiftX).toFixed(4)),
      yMin: Number((init.yMin + shiftY).toFixed(4)),
      yMax: Number((init.yMax + shiftY).toFixed(4)),
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
    <div className="flex flex-col space-y-4 text-[#131313] dark:text-[#F5F5F5]">
      {/* Chart Canvas Card */}
      <div className="w-full bg-white dark:bg-[#1B1B1B] rounded-2xl p-3 sm:p-5 shadow-sm border border-[#E0E0E0] dark:border-[#2E2825] flex flex-col min-h-[380px] md:min-h-[560px] relative transition-colors">
        {/* Editable Chart Title Bar & Compact Toolbar */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#E0E0E0] dark:border-[#2E2825]">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1 max-w-xs sm:max-w-md">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="math-input py-1 px-2 text-sm sm:text-base font-bold flex-1 bg-white dark:bg-[#131313] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
                placeholder="Enter chart title..."
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1.5 bg-[#5D4037] hover:bg-[#6D4C41] text-white rounded-lg text-xs shadow-xs"
                title="Save Title"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h2 className="font-bold text-[#131313] dark:text-white text-sm sm:text-lg select-none truncate max-w-[180px] sm:max-w-xs">
                {chartTitle}
              </h2>
              <Pencil
                size={12}
                className="text-[#757575] group-hover:text-[#5D4037] dark:text-[#8D827A] dark:group-hover:text-white opacity-40 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}

          {/* Controls Bar: Compact Floating Style */}
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {/* Quick Zoom In/Out & Auto-Fit */}
            <div className="flex items-center bg-[#F5F5F5] dark:bg-[#131313] rounded-xl p-0.5 border border-[#E0E0E0] dark:border-[#2E2825]">
              <button
                type="button"
                onClick={() => zoomIn()}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#22201F] text-[#616161] hover:text-[#131313] dark:text-[#D7CCC8] dark:hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => zoomOut()}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#22201F] text-[#616161] hover:text-[#131313] dark:text-[#D7CCC8] dark:hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={resetBounds}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#22201F] text-[#616161] hover:text-[#131313] dark:text-[#D7CCC8] dark:hover:text-white transition-colors"
                title="Reset to [-8, 8]"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Line Labels & Quadrants & 1:1 Aspect Ratio & Asymptotes Toggles */}
            <div className="flex items-center bg-[#F5F5F5] dark:bg-[#131313] rounded-xl p-0.5 border border-[#E0E0E0] dark:border-[#2E2825]">
              <button
                type="button"
                onClick={handleToggleSquareAspect}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSquareAspect
                    ? 'bg-[#5D4037] text-white shadow-xs'
                    : 'text-[#616161] hover:text-[#131313] hover:bg-white dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
                }`}
                title="Lock 1:1 Aspect Ratio"
              >
                <Scale size={12} />
                <span>1:1</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLineLabels(!showLineLabels)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  showLineLabels
                    ? 'bg-[#5D4037] text-white shadow-xs'
                    : 'text-[#616161] hover:text-[#131313] hover:bg-white dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
                }`}
                title="Toggle On-Chart Line Labels"
              >
                <Tag size={12} />
                <span>Labels</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQuadrants(!showQuadrants)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  showQuadrants
                    ? 'bg-[#5D4037] text-white shadow-xs'
                    : 'text-[#616161] hover:text-[#131313] hover:bg-white dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
                }`}
                title="Toggle 4 Quadrant Indicators"
              >
                <Grid size={12} />
                <span>Quadrants</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAsymptotes(!showAsymptotes)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  showAsymptotes
                    ? 'bg-[#5D4037] text-white shadow-xs'
                    : 'text-[#616161] hover:text-[#131313] hover:bg-white dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
                }`}
                title="Toggle Dashed Vertical Asymptote Guide Lines"
              >
                <Split size={12} />
                <span>Asymptotes</span>
              </button>
            </div>

            {/* Linear / Log Toggle */}
            <div className="flex items-center bg-[#F5F5F5] dark:bg-[#131313] p-0.5 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825]">
              <button
                type="button"
                onClick={() => setYScale('linear')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  yScale === 'linear'
                    ? 'bg-[#5D4037] text-white shadow-xs font-bold'
                    : 'text-[#616161] hover:text-[#131313] hover:bg-white dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
                }`}
              >
                Linear
              </button>
              <button
                type="button"
                onClick={() => setYScale('log')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  yScale === 'log'
                    ? 'bg-[#5D4037] text-white shadow-xs font-bold'
                    : 'text-[#616161] hover:text-[#131313] hover:bg-white dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
                }`}
              >
                <Sparkles size={11} />
                <span>Log</span>
              </button>
            </div>

            {/* Range adjustment toggle */}
            <button
              type="button"
              onClick={() => setShowRangeInputs(!showRangeInputs)}
              className={`p-1.5 rounded-xl border transition-colors ${
                showRangeInputs
                  ? 'bg-[#5D4037] text-white border-[#795548]'
                  : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] hover:bg-white dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white dark:hover:bg-[#22201F]'
              }`}
              title="Manual Axis Bounds Settings"
            >
              <SlidersHorizontal size={14} />
            </button>

            {/* Quick Export */}
            <div className="flex items-center bg-[#F5F5F5] dark:bg-[#131313] rounded-xl p-0.5 border border-[#E0E0E0] dark:border-[#2E2825]">
              <button
                type="button"
                onClick={handleExportPNG}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#22201F] text-[#616161] hover:text-[#131313] dark:text-[#D7CCC8] dark:hover:text-white transition-colors"
                title="Download as HD PNG"
              >
                <Download size={14} />
              </button>
              <button
                type="button"
                onClick={handleExportSVG}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#22201F] text-[#616161] hover:text-[#131313] dark:text-[#D7CCC8] dark:hover:text-white transition-colors"
                title="Download as Vector SVG"
              >
                <FileCode size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Manual Range Adjustment Expandable Inputs */}
        {showRangeInputs && (
          <div className="animate-fade-in grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 p-3 bg-[#F5F5F5] dark:bg-[#131313] rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] text-xs">
            <div>
              <label className="text-[#616161] dark:text-[#8D827A] font-mono block mb-1">X Min</label>
              <input
                type="number"
                value={bounds.xMin}
                onChange={(e) => setBounds({ ...bounds, xMin: parseFloat(e.target.value) || -1 })}
                className="math-input py-1 text-xs font-mono bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
              />
            </div>
            <div>
              <label className="text-[#616161] dark:text-[#8D827A] font-mono block mb-1">X Max</label>
              <input
                type="number"
                value={bounds.xMax}
                onChange={(e) => setBounds({ ...bounds, xMax: parseFloat(e.target.value) || 1 })}
                className="math-input py-1 text-xs font-mono bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
              />
            </div>
            <div>
              <label className="text-[#616161] dark:text-[#8D827A] font-mono block mb-1">Y Min</label>
              <input
                type="number"
                value={bounds.yMin}
                onChange={(e) => setBounds({ ...bounds, yMin: parseFloat(e.target.value) || -1 })}
                className="math-input py-1 text-xs font-mono bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
              />
            </div>
            <div>
              <label className="text-[#616161] dark:text-[#8D827A] font-mono block mb-1">Y Max</label>
              <input
                type="number"
                value={bounds.yMax}
                onChange={(e) => setBounds({ ...bounds, yMax: parseFloat(e.target.value) || 1 })}
                className="math-input py-1 text-xs font-mono bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
              />
            </div>
          </div>
        )}

        {/* Viewport Range Info Badge */}
        <div className="flex justify-between items-center text-[10px] text-[#757575] dark:text-[#8D827A] px-1 mb-1 font-mono">
          <span>
            4-Quadrant Plane: X ∈ [{Number(bounds.xMin.toFixed(2))}, {Number(bounds.xMax.toFixed(2))}], Y ∈ [{Number(bounds.yMin.toFixed(2))}, {Number(bounds.yMax.toFixed(2))}]
            {isSquareAspect && ' • 1:1 Aspect'}
          </span>
          <span className="text-[#5D4037] dark:text-[#A1887F] font-medium hidden sm:inline">
            Drag to pan • Scroll to zoom • Hover curve to trace
          </span>
        </div>

        {/* Origin-Centric Mathematical SVG Canvas (White Paper Graph in Light Mode) */}
        <div
          ref={chartContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ touchAction: 'none', height: containerDimensions.height }}
          className={`w-full relative select-none touch-none bg-white dark:bg-[#131313] rounded-2xl overflow-hidden border border-[#E0E0E0] dark:border-[#2E2825] shadow-inner transition-colors ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-crosshair'
          }`}
        >
          {/* 4 Quadrant Background Watermarks */}
          {showQuadrants && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2 select-none z-0 px-12 py-8 opacity-25 dark:opacity-20 font-bold font-mono text-xs text-[#9E9E9E] dark:text-[#8D827A]">
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
            viewBox={`0 0 ${containerDimensions.width} ${containerDimensions.height}`}
            preserveAspectRatio="none"
          >
            <defs>
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

            {/* 1. Grid Lines (Desmos Solid Clean Style) */}
            <g className="grid-lines">
              {/* Minor Vertical Grid Lines */}
              {minorXTicks.map((xVal, i) => {
                if (Math.abs(xVal) < 1e-6) return null; // Avoid minor grid line near Y-axis
                const px = toPxX(xVal);
                if (px < plotBox.left || px > plotBox.left + plotBox.width) return null;
                return (
                  <line
                    key={`minor-grid-x-${i}-${xVal}`}
                    x1={px}
                    y1={plotBox.top}
                    x2={px}
                    y2={plotBox.top + plotBox.height}
                    stroke="#F3F4F6"
                    className="dark:stroke-[#1E1C1A]"
                    strokeWidth={0.75}
                  />
                );
              })}

              {/* Minor Horizontal Grid Lines */}
              {minorYTicks.map((yVal, i) => {
                if (Math.abs(yVal) < 1e-6) return null; // Avoid minor grid line near X-axis
                const py = toPxY(yVal);
                if (py < plotBox.top || py > plotBox.top + plotBox.height) return null;
                return (
                  <line
                    key={`minor-grid-y-${i}-${yVal}`}
                    x1={plotBox.left}
                    y1={py}
                    x2={plotBox.left + plotBox.width}
                    y2={py}
                    stroke="#F3F4F6"
                    className="dark:stroke-[#1E1C1A]"
                    strokeWidth={0.75}
                  />
                );
              })}

              {/* Major Vertical Grid Lines */}
              {xTicks.map((xVal) => {
                if (Math.abs(xVal) < 1e-6) return null; // Avoid doubling with Y-axis
                const px = toPxX(xVal);
                if (px < plotBox.left || px > plotBox.left + plotBox.width) return null;
                return (
                  <line
                    key={`grid-x-${xVal}`}
                    x1={px}
                    y1={plotBox.top}
                    x2={px}
                    y2={plotBox.top + plotBox.height}
                    stroke="#E5E7EB"
                    className="dark:stroke-[#2C2825]"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Major Horizontal Grid Lines */}
              {yTicks.map((yVal) => {
                if (Math.abs(yVal) < 1e-6) return null; // Avoid doubling with X-axis
                const py = toPxY(yVal);
                if (py < plotBox.top || py > plotBox.top + plotBox.height) return null;
                return (
                  <line
                    key={`grid-y-${yVal}`}
                    x1={plotBox.left}
                    y1={py}
                    x2={plotBox.left + plotBox.width}
                    y2={py}
                    stroke="#E5E7EB"
                    className="dark:stroke-[#2C2825]"
                    strokeWidth={1}
                  />
                );
              })}
            </g>

            {/* 1.5 Vertical Asymptote Dashed Guide Lines */}
            {allAsymptotes.map((asym, idx) => {
              const px = toPxX(asym.x);
              if (px < plotBox.left || px > plotBox.left + plotBox.width) return null;
              return (
                <g key={`asym-guide-${idx}-${asym.x}`} className="asymptote-guide">
                  <line
                    x1={px}
                    y1={plotBox.top}
                    x2={px}
                    y2={plotBox.top + plotBox.height}
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    opacity={0.8}
                    className="dark:stroke-gray-500"
                  />
                  <rect
                    x={px - 22}
                    y={plotBox.top + 6}
                    width={44}
                    height={18}
                    rx={4}
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth={1}
                    className="dark:fill-gray-900 dark:stroke-gray-700 shadow-sm"
                  />
                  <text
                    x={px}
                    y={plotBox.top + 19}
                    textAnchor="middle"
                    fill="#475569"
                    className="dark:fill-gray-300 font-mono text-[9.5px] font-bold select-none"
                  >
                    {asym.label}
                  </text>
                </g>
              );
            })}

            {/* 2. Central Origin-Centric Coordinate Axes (Desmos-Style Crisp Vectors) */}
            <g className="central-axes text-[#334155] dark:text-[#cbd5e1]">
              {/* Horizontal X-Axis Line through y = 0 */}
              <line
                x1={plotBox.left}
                y1={axisLineY}
                x2={plotBox.left + plotBox.width}
                y2={axisLineY}
                stroke="currentColor"
                strokeWidth={1.5}
              />
              {/* Right Arrowhead */}
              <polygon
                points={`${plotBox.left + plotBox.width + 6},${axisLineY} ${plotBox.left + plotBox.width},${axisLineY - 3.5} ${plotBox.left + plotBox.width},${axisLineY + 3.5}`}
                fill="currentColor"
                stroke="none"
              />
              {/* Left Arrowhead */}
              <polygon
                points={`${plotBox.left - 6},${axisLineY} ${plotBox.left},${axisLineY - 3.5} ${plotBox.left},${axisLineY + 3.5}`}
                fill="currentColor"
                stroke="none"
              />
              {/* X-Axis Label */}
              <text
                x={plotBox.left + plotBox.width + 14}
                y={axisLineY + 4}
                fill="currentColor"
                stroke="none"
                className="font-serif italic text-sm font-bold select-none"
              >
                x
              </text>

              {/* Vertical Y-Axis Line through x = 0 */}
              <line
                x1={axisLineX}
                y1={plotBox.top + plotBox.height}
                x2={axisLineX}
                y2={plotBox.top}
                stroke="currentColor"
                strokeWidth={1.5}
              />
              {/* Top Arrowhead */}
              <polygon
                points={`${axisLineX},${plotBox.top - 6} ${axisLineX - 3.5},${plotBox.top} ${axisLineX + 3.5},${plotBox.top}`}
                fill="currentColor"
                stroke="none"
              />
              {/* Bottom Arrowhead */}
              <polygon
                points={`${axisLineX},${plotBox.top + plotBox.height + 6} ${axisLineX - 3.5},${plotBox.top + plotBox.height} ${axisLineX + 3.5},${plotBox.top + plotBox.height}`}
                fill="currentColor"
                stroke="none"
              />
              {/* Y-Axis Label */}
              <text
                x={axisLineX}
                y={plotBox.top - 12}
                textAnchor="middle"
                fill="currentColor"
                stroke="none"
                className="font-serif italic text-sm font-bold select-none"
              >
                y
              </text>

              {/* Origin Label "0" */}
              {isOriginOnScreen && (
                <text
                  x={originPxX - 8}
                  y={originPxY + 14}
                  textAnchor="end"
                  fill="currentColor"
                  stroke="none"
                  className="font-mono text-[10.5px] font-semibold select-none opacity-80"
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
                      y1={axisLineY - 3.5}
                      x2={px}
                      y2={axisLineY + 3.5}
                      stroke="currentColor"
                      strokeWidth={1.2}
                    />
                    {/* Tick number directly below axis */}
                    <text
                      x={px}
                      y={axisLineY + 15}
                      textAnchor="middle"
                      fill="currentColor"
                      stroke="none"
                      className="font-mono text-[10px] font-medium select-none opacity-90"
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
                      x1={axisLineX - 3.5}
                      y1={py}
                      x2={axisLineX + 3.5}
                      y2={py}
                      stroke="currentColor"
                      strokeWidth={1.2}
                    />
                    {/* Tick number directly to the left of axis */}
                    <text
                      x={axisLineX - 7}
                      y={py + 3.5}
                      textAnchor="end"
                      fill="currentColor"
                      stroke="none"
                      className="font-mono text-[10px] font-medium select-none opacity-90"
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

              {/* Piecewise Open / Closed Endpoint Markers */}
              {explicitPaths.flatMap((eq) =>
                (eq.piecewiseEndpoints || []).map((pt, pIdx) => {
                  const px = toPxX(pt.x);
                  const py = toPxY(pt.y);
                  if (px < plotBox.left - 5 || px > plotBox.left + plotBox.width + 5) return null;
                  if (py < plotBox.top - 5 || py > plotBox.top + plotBox.height + 5) return null;

                  return (
                    <circle
                      key={`pw-endpoint-${eq.id}-${pIdx}`}
                      cx={px}
                      cy={py}
                      r={4.5}
                      fill={pt.inclusive ? eq.color : '#FFFFFF'}
                      stroke={eq.color}
                      strokeWidth={2}
                      className="dark:fill-[#131313]"
                    />
                  );
                })
              )}

              {/* Highlighted Roots from Equation Solver (Bridge) */}
              {highlightedRoots.map((root, rIdx) => {
                const px = toPxX(root);
                const py = toPxY(0);
                if (px < plotBox.left - 10 || px > plotBox.left + plotBox.width + 10) return null;
                if (py < plotBox.top - 10 || py > plotBox.top + plotBox.height + 10) return null;

                return (
                  <g key={`root-marker-${rIdx}-${root}`} className="select-none">
                    <circle cx={px} cy={py} r={9} fill="#5D4037" opacity={0.25} />
                    <circle cx={px} cy={py} r={5} fill="#5D4037" stroke="#FFFFFF" strokeWidth={2} />
                    <rect
                      x={px - 28}
                      y={py - 24}
                      width={56}
                      height={16}
                      rx={4}
                      fill="#131313"
                      className="dark:fill-[#2B2320]"
                    />
                    <text
                      x={px}
                      y={py - 12}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      className="font-mono text-[9px] font-bold"
                    >
                      ({formatAxisNumber(root)}, 0)
                    </text>
                  </g>
                );
              })}
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

            {/* 5. Desmos-Style Interactive Trace Dot & Snapped Coordinate Tooltip */}
            {(() => {
              if (!snappedPoint || isMouseDown) return null;
              const pt = snappedPoint as SnappedPoint;
              const tipX = pt.px + 14 > plotBox.left + plotBox.width - 100 ? pt.px - 106 : pt.px + 12;
              const tipY = pt.py - 26 < plotBox.top + 10 ? pt.py + 12 : pt.py - 24;

              return (
                <g className="trace-point pointer-events-none">
                  {/* Outer glow ring */}
                  <circle cx={pt.px} cy={pt.py} r={8} fill={pt.color} opacity={0.3} />
                  {/* Solid center dot */}
                  <circle
                    cx={pt.px}
                    cy={pt.py}
                    r={5}
                    fill={pt.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="dark:stroke-gray-900"
                  />
                  {/* Coordinate Pill Tooltip (Black with White text for maximum contrast on paper canvas) */}
                  <g transform={`translate(${tipX}, ${tipY})`}>
                    <rect
                      width={104}
                      height={24}
                      rx={8}
                      fill="#131313"
                      stroke="#000000"
                      strokeWidth={1}
                      className="dark:fill-[#1B1B1B] dark:stroke-[#5D4037] shadow-lg"
                    />
                    <text
                      x={52}
                      y={16}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      className="font-mono text-[10.5px] font-bold select-none"
                    >
                      ({Number(pt.x.toFixed(2))}, {Number(pt.y.toFixed(2))})
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* Subtle Crosshairs when NOT snapped */}
            {(() => {
              if (!mousePos || snappedPoint || isMouseDown) return null;
              return (
                <g className="mouse-crosshair pointer-events-none" opacity={0.4}>
                  <line
                    x1={mousePos.px}
                    y1={plotBox.top}
                    x2={mousePos.px}
                    y2={plotBox.top + plotBox.height}
                    stroke="#5D4037"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={plotBox.left}
                    y1={mousePos.py}
                    x2={plotBox.left + plotBox.width}
                    y2={mousePos.py}
                    stroke="#5D4037"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                </g>
              );
            })()}
          </svg>

          {/* Interactive Floating Cursor Coordinate Pill (Bottom Right Corner of Canvas) */}
          {(() => {
            if (!mousePos) return null;
            return (
              <div className="absolute bottom-3 right-3 pointer-events-none z-30 bg-white/95 text-[#131313] border-[#E0E0E0] dark:bg-[#1B1B1B]/95 dark:text-white px-3 py-1 rounded-xl text-[11px] font-mono shadow-md border dark:border-[#5D4037]/60 select-none animate-fade-in">
                {snappedPoint ? (
                  <span className="font-bold flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: (snappedPoint as SnappedPoint).color }}
                    />
                    <span>({Number((snappedPoint as SnappedPoint).x.toFixed(3))}, {Number((snappedPoint as SnappedPoint).y.toFixed(3))})</span>
                  </span>
                ) : (
                  <span className="text-[#5D4037] dark:text-[#D7CCC8]">
                    ({mousePos.x}, {mousePos.y})
                  </span>
                )}
              </div>
            );
          })()}
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
