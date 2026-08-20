import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GraphEquation, DataPoint, YScaleType, SavedGraphSnapshot } from '@/types/graph';
import { GRAPH_COLORS } from '@/types/graph';
import { computeSmartAutoFitBounds } from '@/lib/math/graphData';

type InputMode = 'equation' | 'table' | 'file' | 'collage';

interface GraphState {
  inputMode: InputMode;
  chartTitle: string;
  equations: GraphEquation[];
  dataPoints: DataPoint[];
  chartType: 'line' | 'scatter' | 'bar' | 'area';
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  yScale: YScaleType;
  showLineLabels: boolean;
  showQuadrants: boolean;
  regressionType: 'none' | 'linear' | 'polynomial' | 'exponential';
  fileData: any;
  savedGraphs: SavedGraphSnapshot[];

  setInputMode: (mode: InputMode) => void;
  setChartTitle: (title: string) => void;
  setYScale: (scale: YScaleType) => void;
  setShowLineLabels: (show: boolean) => void;
  setShowQuadrants: (show: boolean) => void;
  addEquation: () => void;
  updateEquation: (id: string, expr?: string, visible?: boolean) => void;
  removeEquation: (id: string) => void;
  setDataPoints: (points: DataPoint[]) => void;
  addDataPoint: (point: DataPoint) => void;
  removeDataPoint: (index: number) => void;
  setBounds: (bounds: { xMin: number; xMax: number; yMin: number; yMax: number }) => void;
  zoomIn: (factor?: number) => void;
  zoomOut: (factor?: number) => void;
  pan: (direction: 'left' | 'right' | 'up' | 'down') => void;
  autoFitView: () => void;
  resetBounds: () => void;
  setChartType: (type: 'line' | 'scatter' | 'bar' | 'area') => void;
  setRegressionType: (type: 'none' | 'linear' | 'polynomial' | 'exponential') => void;
  setFileData: (data: any) => void;
  saveCurrentGraphSnapshot: (customTitle?: string) => SavedGraphSnapshot;
  deleteSavedGraph: (id: string) => void;
  renameSavedGraph: (id: string, newTitle: string) => void;
  loadSavedGraph: (id: string) => void;
}

// Symmetric 4-Quadrant Default Bounds centered at (0, 0)
const DEFAULT_BOUNDS = { xMin: -8, xMax: 8, yMin: -8, yMax: 8 };

export const useGraphStore = create<GraphState>()(
  persist(
    (set, get) => ({
      inputMode: 'equation',
      chartTitle: '4-Quadrant Function Plot',
      equations: [
        { id: 'eq-1', expression: 'x^(1/3)', color: GRAPH_COLORS[0], visible: true },
        { id: 'eq-2', expression: 'x^(1/5)', color: GRAPH_COLORS[1], visible: true },
        { id: 'eq-3', expression: 'x^(1/11)', color: GRAPH_COLORS[2], visible: true },
      ],
      dataPoints: [
        { x: 1, y: 2 },
        { x: 2, y: 3.8 },
        { x: 3, y: 6.1 },
        { x: 4, y: 7.9 },
        { x: 5, y: 10.2 },
      ],
      chartType: 'line',
      bounds: { ...DEFAULT_BOUNDS },
      yScale: 'linear',
      showLineLabels: true,
      showQuadrants: true,
      regressionType: 'none',
      fileData: null,

      setInputMode: (mode) => set({ inputMode: mode }),
      setChartTitle: (title) => set({ chartTitle: title }),
      setYScale: (scale) => set({ yScale: scale }),
      setShowLineLabels: (show) => set({ showLineLabels: show }),
      setShowQuadrants: (show) => set({ showQuadrants: show }),
      addEquation: () =>
        set((state) => {
          if (state.equations.length >= 8) return state;
          const color = GRAPH_COLORS[state.equations.length % GRAPH_COLORS.length];
          return {
            equations: [
              ...state.equations,
              { id: Date.now().toString(), expression: '', color, visible: true },
            ],
          };
        }),
      updateEquation: (id, expression, visible) =>
        set((state) => ({
          equations: state.equations.map((eq) =>
            eq.id === id
              ? {
                  ...eq,
                  expression: expression !== undefined ? expression : eq.expression,
                  visible: visible !== undefined ? visible : eq.visible,
                }
              : eq
          ),
        })),
      removeEquation: (id) =>
        set((state) => ({
          equations: state.equations.filter((eq) => eq.id !== id),
        })),
      setDataPoints: (points) => set({ dataPoints: points }),
      addDataPoint: (point) => set((state) => ({ dataPoints: [...state.dataPoints, point] })),
      removeDataPoint: (index) =>
        set((state) => ({ dataPoints: state.dataPoints.filter((_, i) => i !== index) })),
      setBounds: (bounds) => set({ bounds }),

      zoomIn: (factor = 0.7) =>
        set((state) => {
          const xCenter = (state.bounds.xMin + state.bounds.xMax) / 2;
          const xSpan = ((state.bounds.xMax - state.bounds.xMin) * factor) / 2;
          const yCenter = (state.bounds.yMin + state.bounds.yMax) / 2;
          const ySpan = ((state.bounds.yMax - state.bounds.yMin) * factor) / 2;
          return {
            bounds: {
              xMin: Number((xCenter - xSpan).toFixed(2)),
              xMax: Number((xCenter + xSpan).toFixed(2)),
              yMin: Number((yCenter - ySpan).toFixed(2)),
              yMax: Number((yCenter + ySpan).toFixed(2)),
            },
          };
        }),

      zoomOut: (factor = 1.4) =>
        set((state) => {
          const xCenter = (state.bounds.xMin + state.bounds.xMax) / 2;
          const xSpan = ((state.bounds.xMax - state.bounds.xMin) * factor) / 2;
          const yCenter = (state.bounds.yMin + state.bounds.yMax) / 2;
          const ySpan = ((state.bounds.yMax - state.bounds.yMin) * factor) / 2;
          return {
            bounds: {
              xMin: Number((xCenter - xSpan).toFixed(2)),
              xMax: Number((xCenter + xSpan).toFixed(2)),
              yMin: Number((yCenter - ySpan).toFixed(2)),
              yMax: Number((yCenter + ySpan).toFixed(2)),
            },
          };
        }),

      pan: (direction) =>
        set((state) => {
          const xSpan = state.bounds.xMax - state.bounds.xMin;
          const ySpan = state.bounds.yMax - state.bounds.yMin;
          const xShift = xSpan * 0.25;
          const yShift = ySpan * 0.25;

          if (direction === 'left') {
            return {
              bounds: {
                ...state.bounds,
                xMin: Number((state.bounds.xMin - xShift).toFixed(2)),
                xMax: Number((state.bounds.xMax - xShift).toFixed(2)),
              },
            };
          }
          if (direction === 'right') {
            return {
              bounds: {
                ...state.bounds,
                xMin: Number((state.bounds.xMin + xShift).toFixed(2)),
                xMax: Number((state.bounds.xMax + xShift).toFixed(2)),
              },
            };
          }
          if (direction === 'up') {
            return {
              bounds: {
                ...state.bounds,
                yMin: Number((state.bounds.yMin + yShift).toFixed(2)),
                yMax: Number((state.bounds.yMax + yShift).toFixed(2)),
              },
            };
          }
          if (direction === 'down') {
            return {
              bounds: {
                ...state.bounds,
                yMin: Number((state.bounds.yMin - yShift).toFixed(2)),
                yMax: Number((state.bounds.yMax - yShift).toFixed(2)),
              },
            };
          }
          return state;
        }),

      autoFitView: () => {
        const { equations } = get();
        const activeExprs = equations
          .filter((eq) => eq.visible && eq.expression.trim() !== '')
          .map((e) => e.expression);
        const fittedBounds = computeSmartAutoFitBounds(activeExprs, 8);
        set({ bounds: fittedBounds });
      },

      resetBounds: () => set({ bounds: { ...DEFAULT_BOUNDS } }),
      setChartType: (type) => set({ chartType: type }),
      setRegressionType: (type) => set({ regressionType: type }),
      setFileData: (data) => set({ fileData: data }),

      savedGraphs: [
        {
          id: 'snap-x2',
          title: 'f(x) = x²',
          type: 'equation',
          expressions: ['x^2'],
          equations: [{ id: 'eq-x2', expression: 'x^2', color: '#3b82f6', visible: true }],
          bounds: { xMin: -5, xMax: 5, yMin: -2, yMax: 12 },
          createdAt: Date.now() - 3600000,
        },
        {
          id: 'snap-x4',
          title: 'f(x) = x⁴',
          type: 'equation',
          expressions: ['x^4'],
          equations: [{ id: 'eq-x4', expression: 'x^4', color: '#ef4444', visible: true }],
          bounds: { xMin: -3, xMax: 3, yMin: -2, yMax: 16 },
          createdAt: Date.now() - 2400000,
        },
        {
          id: 'snap-x10',
          title: 'f(x) = x¹⁰',
          type: 'equation',
          expressions: ['x^10'],
          equations: [{ id: 'eq-x10', expression: 'x^10', color: '#8b5cf6', visible: true }],
          bounds: { xMin: -2, xMax: 2, yMin: -2, yMax: 16 },
          createdAt: Date.now() - 1200000,
        },
        {
          id: 'snap-circle',
          title: 'Circle: x² + y² = 25',
          type: 'equation',
          expressions: ['x^2 + y^2 = 25'],
          equations: [{ id: 'eq-circle', expression: 'x^2 + y^2 = 25', color: '#10b981', visible: true }],
          bounds: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
          createdAt: Date.now() - 600000,
        },
      ],

      saveCurrentGraphSnapshot: (customTitle) => {
        const state = get();
        let title = customTitle?.trim();
        if (!title) {
          if (state.inputMode === 'equation') {
            const active = state.equations.filter((e) => e.visible && e.expression.trim());
            title = active.length > 0 ? active.map((e) => e.expression).join(', ') : state.chartTitle;
          } else {
            title = state.chartTitle || 'Data Plot';
          }
        }

        const snapshot: SavedGraphSnapshot = {
          id: 'graph-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          title: title || 'Saved Graph',
          type: state.inputMode === 'collage' ? 'equation' : state.inputMode,
          expressions: state.equations.filter((e) => e.visible).map((e) => e.expression),
          equations: JSON.parse(JSON.stringify(state.equations)),
          dataPoints: state.inputMode === 'table' ? JSON.parse(JSON.stringify(state.dataPoints)) : undefined,
          bounds: { ...state.bounds },
          yScale: state.yScale,
          chartType: state.chartType,
          createdAt: Date.now(),
        };

        set((s) => ({
          savedGraphs: [snapshot, ...s.savedGraphs.filter((g) => g.id !== snapshot.id)],
        }));

        return snapshot;
      },

      deleteSavedGraph: (id) =>
        set((state) => ({
          savedGraphs: state.savedGraphs.filter((g) => g.id !== id),
        })),

      renameSavedGraph: (id, newTitle) =>
        set((state) => ({
          savedGraphs: state.savedGraphs.map((g) =>
            g.id === id ? { ...g, title: newTitle.trim() || g.title } : g
          ),
        })),

      loadSavedGraph: (id) => {
        const target = get().savedGraphs.find((g) => g.id === id);
        if (!target) return;

        set({
          inputMode: target.type,
          chartTitle: target.title,
          equations: target.equations || [
            { id: 'eq-1', expression: target.expressions?.[0] || 'x^2', color: GRAPH_COLORS[0], visible: true },
          ],
          dataPoints: target.dataPoints || get().dataPoints,
          bounds: { ...target.bounds },
          yScale: target.yScale || 'linear',
          chartType: target.chartType || 'line',
        });
      },
    }),
    {
      name: 'mathhub-graph',
    }
  )
);
