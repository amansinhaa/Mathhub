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
  addEquation: (initialExpression?: string) => void;
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
      chartTitle: '',
      equations: [
        { id: 'eq-1', expression: '', color: GRAPH_COLORS[0], visible: true },
      ],
      dataPoints: [],
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
      addEquation: (initialExpression: string = '') =>
        set((state) => {
          if (state.equations.length >= 8) return state;
          const color = GRAPH_COLORS[state.equations.length % GRAPH_COLORS.length];
          return {
            equations: [
              ...state.equations,
              { id: Date.now().toString(), expression: initialExpression, color, visible: true },
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

      savedGraphs: [],

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
