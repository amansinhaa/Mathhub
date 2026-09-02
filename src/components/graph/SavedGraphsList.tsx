'use client';

import React, { useState } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import {
  Camera,
  Trash2,
  Pencil,
  Check,
  Play,
  CheckSquare,
  Square,
  Layers,
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
    saveCurrentGraphSnapshot();
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
          <Layers size={15} className="text-[#5D4037] dark:text-[#A1887F]" />
          <h3 className="font-bold text-[#131313] dark:text-white text-xs sm:text-sm font-mono uppercase tracking-wider">
            My Graphs ({savedGraphs.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={handleSaveSnapshot}
          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 bg-[#5D4037] hover:bg-[#6D4C41] text-white rounded-lg transition-colors shadow-xs border border-[#795548]/50"
          title="Save active view as a new snapshot"
        >
          <Camera size={13} />
          <span>Save Active</span>
        </button>
      </div>

      {savedToast && (
        <div className="animate-fade-in px-3 py-1.5 bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] text-xs font-mono rounded-lg flex items-center justify-between dark:border-[#5D4037]">
          <span>Saved snapshot to My Graphs!</span>
        </div>
      )}

      {savedGraphs.length === 0 ? (
        <div className="text-center py-6 px-3 bg-[#F5F5F5] dark:bg-[#131313] rounded-xl border border-dashed border-[#E0E0E0] dark:border-[#2E2825] text-xs text-[#757575] dark:text-[#8D827A] space-y-1">
          <p className="font-medium text-[#131313] dark:text-[#A19891]">No saved graphs yet.</p>
          <p className="text-[10px]">Click "Save Active" above to save snapshots for collage printing.</p>
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
                    ? 'bg-[#EFEBE9] border-[#5D4037] text-[#131313] dark:bg-[#3E2723]/60 dark:border-[#5D4037] dark:text-white'
                    : 'bg-[#F5F5F5] border-[#E0E0E0] hover:border-[#D7CCC8] dark:bg-[#131313] dark:border-[#262220] dark:hover:border-[#5D4037]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Select Checkbox or Thumbnail Pill */}
                  {isSelectionMode ? (
                    <button
                      type="button"
                      onClick={() => onToggleSelect?.(graph.id)}
                      className="text-[#5D4037] dark:text-[#D7CCC8] shrink-0"
                    >
                      {isSelected ? <CheckSquare size={15} className="text-[#5D4037] dark:text-[#D7CCC8]" /> : <Square size={15} className="text-[#757575] dark:text-[#8D827A]" />}
                    </button>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#5D4037] shrink-0" />
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
                          className="math-input py-0.5 px-1.5 text-xs font-semibold w-full bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
                        />
                        <button
                          type="button"
                          onClick={() => saveRename(graph.id)}
                          className="p-1 text-emerald-600 dark:text-[#81C784] hover:bg-gray-100 dark:hover:bg-[#1B1B1B] rounded"
                        >
                          <Check size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5 truncate">
                        <span className="font-semibold text-[#131313] dark:text-white truncate">
                          {graph.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-0.5 shrink-0 text-[#757575] dark:text-[#8D827A]">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startRename(graph)}
                        className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center hover:text-[#131313] hover:bg-white dark:hover:text-white dark:hover:bg-[#1B1B1B] rounded-lg transition-colors"
                        title="Rename"
                        aria-label={`Rename ${graph.title}`}
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        loadSavedGraph(graph.id);
                        setInputMode(graph.type);
                      }}
                      className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center hover:text-[#131313] hover:bg-white dark:hover:text-white dark:hover:bg-[#1B1B1B] rounded-lg transition-colors"
                      title="Load into Main Graph view"
                      aria-label={`Load ${graph.title} into graph view`}
                    >
                      <Play size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavedGraph(graph.id)}
                      className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center hover:text-red-500 hover:bg-white dark:hover:text-[#FFAB91] dark:hover:bg-[#1B1B1B] rounded-lg transition-colors"
                      title="Delete"
                      aria-label={`Delete ${graph.title}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Subtitle with expressions & range */}
                <div className="flex items-center justify-between text-[10px] text-[#757575] dark:text-[#8D827A] font-mono pl-3.5">
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
