'use client';

import React from 'react';
import { useGraphStore } from '@/stores/graphStore';

export default function DataTableInput() {
  const { dataPoints, setDataPoints, addDataPoint, removeDataPoint } = useGraphStore();

  const handleCellChange = (index: number, field: 'x' | 'y', value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      const newPoints = [...dataPoints];
      newPoints[index] = { ...newPoints[index], [field]: num };
      setDataPoints(newPoints);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Data Table</h3>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-3 py-2 font-medium">X</th>
              <th className="px-3 py-2 font-medium">Y</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {dataPoints.map((point, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900">
                <td className="px-3 py-1">
                  <input
                    type="number"
                    value={point.x}
                    onChange={(e) => handleCellChange(i, 'x', e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-gray-200"
                  />
                </td>
                <td className="px-3 py-1 border-l border-gray-100 dark:border-gray-700/50">
                  <input
                    type="number"
                    value={point.y}
                    onChange={(e) => handleCellChange(i, 'y', e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-gray-200"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <button onClick={() => removeDataPoint(i)} className="text-gray-400 hover:text-red-500">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => addDataPoint({ x: 0, y: 0 })}
        className="mt-2 text-sm text-blue-500 hover:text-blue-600 text-left flex items-center"
      >
        <span className="mr-1">+</span> Add Row
      </button>
    </div>
  );
}
