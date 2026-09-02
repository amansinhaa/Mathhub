'use client';

import React, { useState } from 'react';
import { Download, FileCode, Printer, Camera, Check } from 'lucide-react';
import { useGraphStore } from '@/stores/graphStore';

export default function ExportButton() {
  const { chartTitle, bounds, yScale, setInputMode, saveCurrentGraphSnapshot } = useGraphStore();
  const [savedToast, setSavedToast] = useState(false);

  const handleExportSVG = () => {
    const svgElement = document.querySelector('svg');
    if (!svgElement) {
      alert('No graph SVG found to export.');
      return;
    }

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${(chartTitle || 'easyequate-graph').replace(/\s+/g, '_')}-${yScale}-x[${bounds.xMin}_to_${bounds.xMax}].svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    const svgElement = document.querySelector('svg');
    if (!svgElement) {
      alert('No graph SVG found to export.');
      return;
    }

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scaleFactor = 2; // 2x high resolution
      const width = (svgElement.clientWidth || 800) * scaleFactor;
      const height = (svgElement.clientHeight || 480) * scaleFactor;
      const topPadding = 70;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height + topPadding;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height + topPadding);

        ctx.fillStyle = '#131313';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(chartTitle || 'EasyEquate Graph', width / 2, 40);

        ctx.fillStyle = '#616161';
        ctx.font = '14px monospace';
        ctx.fillText(
          `4-Quadrant Cartesian Plane: X ∈ [${bounds.xMin}, ${bounds.xMax}], Y ∈ [${bounds.yMin}, ${bounds.yMax}] • Generated with EasyEquate.com`,
          width / 2,
          60
        );

        ctx.drawImage(img, 0, topPadding, width, height);
        const pngUrl = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${(chartTitle || 'easyequate-graph').replace(/\s+/g, '_')}-${yScale}-x[${bounds.xMin}_to_${bounds.xMax}].png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleSnapshot = () => {
    saveCurrentGraphSnapshot();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase tracking-wider">Quick Export & Print</span>
        <span className="text-[10px] font-mono text-[#757575] dark:text-[#8D827A]">x: [{bounds.xMin}, {bounds.xMax}]</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExportPNG}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#5D4037] hover:bg-[#6D4C41] text-white rounded-xl text-xs font-bold shadow-xs transition-all border border-[#795548]/50 active:scale-95"
          title="Download single graph as PNG"
        >
          <Download size={14} />
          <span>PNG HD</span>
        </button>
        <button
          type="button"
          onClick={handleExportSVG}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-[#EFEBE9] text-[#5D4037] hover:text-[#131313] border border-[#E0E0E0] hover:border-[#D7CCC8] dark:bg-[#131313] dark:hover:bg-[#262220] dark:text-[#D7CCC8] dark:hover:text-white rounded-xl text-xs font-bold transition-all dark:border-[#2E2825] active:scale-95 shadow-2xs"
          title="Download single graph as Vector SVG"
        >
          <FileCode size={14} />
          <span>SVG</span>
        </button>
      </div>

      {/* Collage and Snapshot Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E0E0E0] dark:border-[#2E2825]">
        <button
          type="button"
          onClick={handleSnapshot}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#EFEBE9] text-[#5D4037] hover:text-[#131313] border border-[#E0E0E0] hover:border-[#D7CCC8] dark:bg-[#131313] dark:hover:bg-[#262220] dark:text-[#D7CCC8] dark:hover:text-white dark:border-[#2E2825] rounded-xl text-xs font-medium transition-all active:scale-95 shadow-2xs"
          title="Snapshot active plot into My Graphs history"
        >
          {savedToast ? <Check size={13} className="text-emerald-600 dark:text-[#81C784]" /> : <Camera size={13} />}
          <span>{savedToast ? 'Saved!' : 'Save Snapshot'}</span>
        </button>

        <button
          type="button"
          onClick={() => setInputMode('collage')}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#EFEBE9] hover:bg-[#5D4037] text-[#5D4037] hover:text-white border border-[#D7CCC8] dark:bg-[#3E2723] dark:hover:bg-[#5D4037] dark:text-[#D7CCC8] dark:hover:text-white dark:border-[#5D4037]/60 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs"
          title="Open Multi-Graph Collage Sheet for Printing"
        >
          <Printer size={13} />
          <span>Collage Sheet</span>
        </button>
      </div>
    </div>
  );
}
