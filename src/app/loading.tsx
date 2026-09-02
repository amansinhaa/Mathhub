import React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#5D4037]/30 border-t-[#5D4037] animate-spin" />
        <span className="text-xs font-mono text-[#757575] dark:text-[#8D827A] tracking-wider uppercase">
          Loading EasyEquate...
        </span>
      </div>
    </div>
  );
}
