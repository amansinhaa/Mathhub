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
        <h3 className="font-bold text-[#131313] dark:text-white text-xs sm:text-sm font-mono uppercase tracking-wider">
          Data Table
        </h3>
        <span className="text-[10px] text-[#757575] dark:text-[#8D827A] font-mono">{dataPoints.length} points</span>
      </div>

      <div className="border border-[#E0E0E0] dark:border-[#2E2825] rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#5D4037] text-white dark:bg-[#131313] border-b border-[#795548] dark:border-[#2E2825] dark:text-[#D7CCC8] font-mono font-bold">
            <tr>
              <th className="px-3 py-2">X</th>
              <th className="px-3 py-2 border-l border-[#795548]/60 dark:border-[#2E2825]">Y</th>
              <th className="px-2 py-2 w-8 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-xs text-[#757575] dark:text-[#8D827A] bg-white dark:bg-[#1B1B1B]">
                  No data points yet. Click below to add rows.
                </td>
              </tr>
            ) : (
              dataPoints.map((point, i) => (
                <tr
                  key={i}
                  className={`border-b border-[#E0E0E0] dark:border-[#24201E] ${
                    i % 2 === 1 ? 'bg-[#F5F5F5] dark:bg-[#151515]' : 'bg-white dark:bg-[#1B1B1B]'
                  }`}
                >
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      value={point.x}
                      onChange={(e) => handleCellChange(i, 'x', e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-mono text-[#131313] dark:text-white"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-1.5 border-l border-[#E0E0E0] dark:border-[#24201E]">
                    <input
                      type="number"
                      value={point.y}
                      onChange={(e) => handleCellChange(i, 'y', e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-mono text-[#131313] dark:text-white"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeDataPoint(i)}
                      className="text-[#757575] hover:text-red-500 dark:text-[#8D827A] dark:hover:text-[#FFAB91] p-1 transition-colors rounded"
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
        className="mt-1 text-xs font-mono font-semibold text-[#5D4037] hover:text-white bg-[#F5F5F5] hover:bg-[#5D4037] dark:bg-[#131313] dark:hover:bg-[#262220] dark:text-[#D7CCC8] dark:hover:text-white border border-[#E0E0E0] dark:border-[#2E2825] flex items-center gap-1 py-1.5 px-3 rounded-xl w-fit transition-all active:scale-95 shadow-2xs"
      >
        <Plus size={13} />
        <span>Add Row</span>
      </button>
    </div>
  );
}
