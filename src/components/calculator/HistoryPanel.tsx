'use client';

import React from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { History as HistoryIcon, Trash2 } from 'lucide-react';

/** Simple relative time formatter — avoids external dependencies. */
function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HistoryPanel() {
  const { history, clearHistory, loadFromHistory } = useCalculatorStore();

  return (
    <div className="math-card flex h-full flex-col bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] p-3.5 sm:p-4 rounded-2xl transition-colors">
      <div className="mb-3 flex items-center justify-between pb-2 border-b border-[#E0E0E0] dark:border-[#2E2825]">
        <div className="flex items-center gap-2">
          <HistoryIcon size={16} className="text-[#5D4037] dark:text-[#A1887F]" />
          <h3 className="font-semibold text-sm text-[#131313] dark:text-white">Calculation History</h3>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-1 text-xs text-[#5D4037] dark:text-[#FFAB91] hover:text-[#131313] dark:hover:text-white hover:bg-[#EFEBE9] dark:hover:bg-[#3E2723]/60 px-2 py-1 rounded-lg transition-colors"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {history.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-[#757575] dark:text-[#8D827A] space-y-1">
            <HistoryIcon size={24} className="text-[#BCAAA4] dark:text-[#3E2723] mb-1" />
            <p className="font-medium text-[#131313] dark:text-[#A19891]">No calculations yet</p>
            <p className="text-[11px]">Results will appear here as you calculate.</p>
          </div>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              className="w-full rounded-xl p-3 text-right transition-all bg-[#F5F5F5] hover:bg-[#EFEBE9] border border-[#E0E0E0] hover:border-[#D7CCC8] dark:bg-[#131313] dark:hover:bg-[#262220] dark:border-[#262220] dark:hover:border-[#5D4037]/50 group shadow-2xs space-y-1.5"
            >
              <div className="flex justify-between items-center text-[10px] font-mono text-[#757575] dark:text-[#8D827A]">
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={`/solver?eq=${encodeURIComponent(entry.expression)}&autoSolve=true`}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1B1B1B] text-[#5D4037] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#5D4037] hover:text-white"
                    title="Solve as equation in Solver"
                  >
                    To Solver
                  </a>
                  <a
                    href={`/graph?fn=${encodeURIComponent(entry.expression)}`}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1B1B1B] text-[#5D4037] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#5D4037] hover:text-white"
                    title="Plot expression in Graph"
                  >
                    To Graph
                  </a>
                </div>
                <span>{timeAgo(entry.timestamp)}</span>
              </div>

              <button
                type="button"
                onClick={() => loadFromHistory(entry)}
                className="w-full text-right"
              >
                <div className="font-mono text-xs text-[#616161] group-hover:text-[#5D4037] dark:text-[#A19891] dark:group-hover:text-[#D7CCC8] break-all">
                  {entry.expression}
                </div>
                <div className="mt-1 text-base font-bold text-[#131313] dark:text-white">
                  {entry.latex ? (
                    <MathDisplay math={entry.latex} />
                  ) : (
                    <span className="font-mono">{entry.result}</span>
                  )}
                </div>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
