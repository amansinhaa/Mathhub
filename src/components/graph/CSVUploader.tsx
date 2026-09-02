'use client';

import React, { useRef } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import { parseCSV } from '@/lib/utils/csv';
import { UploadCloud } from 'lucide-react';

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
    <div className="flex flex-col space-y-3">
      <h3 className="font-bold text-[#131313] dark:text-white text-xs sm:text-sm font-mono uppercase tracking-wider">
        Upload CSV / TSV
      </h3>
      <div 
        className="border border-dashed border-[#D7CCC8] hover:border-[#5D4037] dark:border-[#3E2723] dark:hover:border-[#5D4037] bg-[#F5F5F5] hover:bg-[#EFEBE9] dark:bg-[#131313] dark:hover:bg-[#22201F] rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group shadow-2xs"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={24} className="text-[#5D4037] dark:text-[#A1887F] group-hover:scale-110 transition-transform" />
        <p className="text-xs text-[#616161] group-hover:text-[#131313] dark:text-[#A19891] dark:group-hover:text-white">
          Drop a CSV/TSV file here or click to browse
        </p>
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
