'use client';

import React from 'react';
import { Download, FileCode } from 'lucide-react';
import { useGraphStore } from '@/stores/graphStore';

export default function ExportButton() {
  const { chartTitle, bounds, yScale } = useGraphStore();

  const handleExportSVG = () => {
    const svgElement = document.querySelector('.recharts-wrapper svg');
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
    downloadLink.download = `${(chartTitle || 'mathhub-graph').replace(/\s+/g, '_')}-${yScale}-x[${bounds.xMin}_to_${bounds.xMax}].svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    const svgElement = document.querySelector('.recharts-wrapper svg');
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
      const height = (svgElement.clientHeight || 450) * scaleFactor;
      const topPadding = 70;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height + topPadding;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height + topPadding);

        ctx.fillStyle = '#111827';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(chartTitle || 'MathHub Graph', width / 2, 40);

        ctx.fillStyle = '#6b7280';
        ctx.font = '14px monospace';
        ctx.fillText(
          `X ∈ [${bounds.xMin}, ${bounds.xMax}], Y ∈ [${bounds.yMin}, ${bounds.yMax}]`,
          width / 2,
          60
        );

        ctx.drawImage(img, 0, topPadding, width, height);
        const pngUrl = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${(chartTitle || 'mathhub-graph').replace(/\s+/g, '_')}-${yScale}-x[${bounds.xMin}_to_${bounds.xMax}].png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Export Active View</span>
        <span className="text-[10px] font-mono text-[var(--muted)]">x: [{bounds.xMin}, {bounds.xMax}]</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleExportPNG}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Download size={14} />
          <span>PNG (2x HD)</span>
        </button>
        <button
          onClick={handleExportSVG}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition-colors"
        >
          <FileCode size={14} />
          <span>Vector SVG</span>
        </button>
      </div>
    </div>
  );
}
