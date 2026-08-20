'use client';

import { useCalculatorStore } from '@/stores/calculatorStore';
import { MathDisplay } from '@/components/shared/MathDisplay';

/** Simple relative time formatter — avoids date-fns dependency. */
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
    <div className="math-card flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">History</h3>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-center text-sm text-[var(--muted)]">
            <p>No calculations yet.<br />Results will appear here.</p>
          </div>
        ) : (
          history.map((entry) => (
            <button
              key={entry.id}
              onClick={() => loadFromHistory(entry)}
              className="w-full rounded-xl p-3 text-right transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="mb-1 text-xs text-[var(--muted)]">
                {timeAgo(entry.timestamp)}
              </div>
              <div className="font-mono text-sm text-[var(--muted)] break-all">
                {entry.expression}
              </div>
              <div className="mt-0.5 text-lg font-medium">
                {entry.latex ? (
                  <MathDisplay math={entry.latex} />
                ) : (
                  <span className="font-mono">{entry.result}</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
