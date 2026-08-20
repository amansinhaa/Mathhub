'use client';

import React, { useRef } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import { parseCSV } from '@/lib/utils/csv';

export default function CSVUploader() {
  const { setFileData, setDataPoints } = useGraphStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setFileData(parsed);
      
      // Auto-assign first two numeric columns if available
      if (parsed.numericColumns.length >= 2) {
        const xCol = parsed.numericColumns[0];
        const yCol = parsed.numericColumns[1];
        const points = parsed.rows.map(row => ({
          x: Number(row[xCol]),
          y: Number(row[yCol])
        })).filter(p => !isNaN(p.x) && !isNaN(p.y));
        setDataPoints(points);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200">Upload Data</h3>
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop a CSV file here, or click to browse</p>
        <input 
          type="file" 
          accept=".csv,.tsv,.txt"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
