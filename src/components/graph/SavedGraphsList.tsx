'use client';

import React, { useState } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import {
  Camera,
  Trash2,
  Pencil,
  Check,
  Plus,
  Play,
  CheckSquare,
  Square,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SavedGraphSnapshot } from '@/types/graph';

interface SavedGraphsListProps {
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  isSelectionMode?: boolean;
}

export default function SavedGraphsList({
  selectedIds = [],
  onToggleSelect,
  isSelectionMode = false,
}: SavedGraphsListProps) {
  const {
    savedGraphs,
    saveCurrentGraphSnapshot,
    deleteSavedGraph,
    renameSavedGraph,
    loadSavedGraph,
    setInputMode,
  } = useGraphStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const handleSaveSnapshot = () => {
    const snap = saveCurrentGraphSnapshot();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const startRename = (graph: SavedGraphSnapshot) => {
    setEditingId(graph.id);
    setTempTitle(graph.title);
  };

  const saveRename = (id: string) => {
    if (tempTitle.trim()) {
      renameSavedGraph(id, tempTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers size={16} className="text-blue-500" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            My Graphs ({savedGraphs.length})
          </h3>
        </div>
        <button
          onClick={handleSaveSnapshot}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          title="Save active view as a new snapshot"
        >
          <Camera size={13} />
          <span>Save Active</span>
        </button>
      </div>

      {savedToast && (
        <div className="animate-fade-in px-3 py-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs rounded-lg flex items-center justify-between">
          <span>✨ Saved snapshot to My Graphs!</span>
        </div>
      )}

      {savedGraphs.length === 0 ? (
        <div className="text-center py-6 px-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-[var(--card-border)] text-xs text-[var(--muted)] space-y-1">
          <p>No saved graphs yet.</p>
          <p className="text-[11px]">Click "Save Active" above or plot an equation to save snapshots for collage printing.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {savedGraphs.map((graph) => {
            const isSelected = selectedIds.includes(graph.id);
            const isEditing = editingId === graph.id;
            const exprList = graph.expressions?.join(', ') || graph.title;

            return (
              <div
                key={graph.id}
                className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-800/80 border-[var(--card-border)] hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Select Checkbox (if in collage mode) or Thumbnail Pill */}
                  {isSelectionMode ? (
                    <button
                      onClick={() => onToggleSelect?.(graph.id)}
                      className="text-blue-600 dark:text-blue-400 shrink-0"
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} className="text-gray-400" />}
                    </button>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  )}

                  {/* Title / Renaming Input */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(graph.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="math-input py-0.5 px-1.5 text-xs font-semibold w-full"
                        />
                        <button
                          onClick={() => saveRename(graph.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5 truncate">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {graph.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Icons with comfortable touch targets */}
                  <div className="flex items-center gap-0.5 shrink-0 text-gray-400">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startRename(graph)}
                        className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                        title="Rename"
                        aria-label={`Rename ${graph.title}`}
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        loadSavedGraph(graph.id);
                        setInputMode(graph.type);
                      }}
                      className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40 rounded-lg transition-colors"
                      title="Load into Main Graph view"
                      aria-label={`Load ${graph.title} into graph view`}
                    >
                      <Play size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavedGraph(graph.id)}
                      className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete"
                      aria-label={`Delete ${graph.title}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Subtitle with expressions & range */}
                <div className="flex items-center justify-between text-[10px] text-[var(--muted)] font-mono pl-4">
                  <span className="truncate max-w-[170px]">{exprList}</span>
                  <span>
                    x:[{graph.bounds.xMin},{graph.bounds.xMax}]
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
