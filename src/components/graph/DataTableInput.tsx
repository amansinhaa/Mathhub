'use client';

import React from 'react';
import { useGraphStore } from '@/stores/graphStore';
import { Plus, Trash2 } from 'lucide-react';

export default function DataTableInput() {
  const { dataPoints, setDataPoints, addDataPoint, removeDataPoint } = useGraphStore();

  const handleCellChange = (index: number, field: 'x' | 'y', value: string) => {
    const num = value === '' ? 0 : Number(value);
    if (!isNaN(num)) {
      const newPoints = [...dataPoints];
      newPoints[index] = { ...newPoints[index], [field]: num };
      setDataPoints(newPoints);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Data Table</h3>
        <span className="text-xs text-[var(--muted)] font-mono">{dataPoints.length} points</span>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-xs sm:text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
            <tr>
              <th className="px-3 py-2 font-medium">X</th>
              <th className="px-3 py-2 font-medium">Y</th>
              <th className="px-2 py-2 w-8 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-xs text-[var(--muted)] bg-white dark:bg-gray-900">
                  No data points yet. Click below to add rows.
                </td>
              </tr>
            ) : (
              dataPoints.map((point, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      value={point.x}
                      onChange={(e) => handleCellChange(i, 'x', e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-mono text-gray-800 dark:text-gray-200"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-1.5 border-l border-gray-100 dark:border-gray-800">
                    <input
                      type="number"
                      value={point.y}
                      onChange={(e) => handleCellChange(i, 'y', e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-mono text-gray-800 dark:text-gray-200"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeDataPoint(i)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors rounded"
                      title="Remove Row"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => addDataPoint({ x: dataPoints.length + 1, y: 0 })}
        className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 w-fit transition-colors"
      >
        <Plus size={14} />
        <span>Add Row</span>
      </button>
    </div>
  );
}
