'use client';

import React, { useState } from 'react';
import { X, Compass } from 'lucide-react';
import { MathDisplay } from '@/components/shared/MathDisplay';

interface AngleStop {
  deg: number;
  radLatex: string;
  cosVal: number;
  sinVal: number;
  cosLatex: string;
  sinLatex: string;
  tanLatex: string;
}

const STANDARD_ANGLES: AngleStop[] = [
  { deg: 0, radLatex: '0', cosVal: 1, sinVal: 0, cosLatex: '1', sinLatex: '0', tanLatex: '0' },
  { deg: 30, radLatex: '\\frac{\\pi}{6}', cosVal: Math.sqrt(3) / 2, sinVal: 0.5, cosLatex: '\\frac{\\sqrt{3}}{2}', sinLatex: '\\frac{1}{2}', tanLatex: '\\frac{1}{\\sqrt{3}}' },
  { deg: 45, radLatex: '\\frac{\\pi}{4}', cosVal: Math.SQRT1_2, sinVal: Math.SQRT1_2, cosLatex: '\\frac{\\sqrt{2}}{2}', sinLatex: '\\frac{1}{\\sqrt{2}}', tanLatex: '1' },
  { deg: 60, radLatex: '\\frac{\\pi}{3}', cosVal: 0.5, sinVal: Math.sqrt(3) / 2, cosLatex: '\\frac{1}{2}', sinLatex: '\\frac{\\sqrt{3}}{2}', tanLatex: '\\sqrt{3}' },
  { deg: 90, radLatex: '\\frac{\\pi}{2}', cosVal: 0, sinVal: 1, cosLatex: '0', sinLatex: '1', tanLatex: '\\text{Undefined}' },
  { deg: 120, radLatex: '\\frac{2\\pi}{3}', cosVal: -0.5, sinVal: Math.sqrt(3) / 2, cosLatex: '-\\frac{1}{2}', sinLatex: '\\frac{\\sqrt{3}}{2}', tanLatex: '-\\sqrt{3}' },
  { deg: 135, radLatex: '\\frac{3\\pi}{4}', cosVal: -Math.SQRT1_2, sinVal: Math.SQRT1_2, cosLatex: '-\\frac{\\sqrt{2}}{2}', sinLatex: '\\frac{\\sqrt{2}}{2}', tanLatex: '-1' },
  { deg: 150, radLatex: '\\frac{5\\pi}{6}', cosVal: -Math.sqrt(3) / 2, sinVal: 0.5, cosLatex: '-\\frac{\\sqrt{3}}{2}', sinLatex: '\\frac{1}{2}', tanLatex: '-\\frac{1}{\\sqrt{3}}' },
  { deg: 180, radLatex: '\\pi', cosVal: -1, sinVal: 0, cosLatex: '-1', sinLatex: '0', tanLatex: '0' },
  { deg: 210, radLatex: '\\frac{7\\pi}{6}', cosVal: -Math.sqrt(3) / 2, sinVal: -0.5, cosLatex: '-\\frac{\\sqrt{3}}{2}', sinLatex: '-\\frac{1}{2}', tanLatex: '\\frac{1}{\\sqrt{3}}' },
  { deg: 225, radLatex: '\\frac{5\\pi}{4}', cosVal: -Math.SQRT1_2, sinVal: -Math.SQRT1_2, cosLatex: '-\\frac{\\sqrt{2}}{2}', sinLatex: '-\\frac{\\sqrt{2}}{2}', tanLatex: '1' },
  { deg: 240, radLatex: '\\frac{4\\pi}{3}', cosVal: -0.5, sinVal: -Math.sqrt(3) / 2, cosLatex: '-\\frac{1}{2}', sinLatex: '-\\frac{\\sqrt{3}}{2}', tanLatex: '\\sqrt{3}' },
  { deg: 270, radLatex: '\\frac{3\\pi}{2}', cosVal: 0, sinVal: -1, cosLatex: '0', sinLatex: '-1', tanLatex: '\\text{Undefined}' },
  { deg: 300, radLatex: '\\frac{5\\pi}{3}', cosVal: 0.5, sinVal: -Math.sqrt(3) / 2, cosLatex: '\\frac{1}{2}', sinLatex: '-\\frac{\\sqrt{3}}{2}', tanLatex: '-\\sqrt{3}' },
  { deg: 315, radLatex: '\\frac{7\\pi}{4}', cosVal: Math.SQRT1_2, sinVal: -Math.SQRT1_2, cosLatex: '\\frac{\\sqrt{2}}{2}', sinLatex: '-\\frac{\\sqrt{2}}{2}', tanLatex: '-1' },
  { deg: 330, radLatex: '\\frac{11\\pi}{6}', cosVal: Math.sqrt(3) / 2, sinVal: -0.5, cosLatex: '\\frac{\\sqrt{3}}{2}', sinLatex: '-\\frac{1}{2}', tanLatex: '-\\frac{1}{\\sqrt{3}}' },
  { deg: 360, radLatex: '2\\pi', cosVal: 1, sinVal: 0, cosLatex: '1', sinLatex: '0', tanLatex: '0' },
];

export default function UnitCircleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedAngle, setSelectedAngle] = useState<AngleStop>(STANDARD_ANGLES[1]); // Default 30 deg

  if (!isOpen) return null;

  const radius = 130;
  const cx = 160;
  const cy = 160;

  const rad = (selectedAngle.deg * Math.PI) / 180;
  const ptX = cx + radius * Math.cos(rad);
  const ptY = cy - radius * Math.sin(rad); // SVG y inverted

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-3xl p-5 sm:p-6 w-full max-w-xl shadow-2xl space-y-4 text-[#131313] dark:text-[#F5F5F5]">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#E0E0E0] dark:border-[#282422]">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-[#5D4037] dark:text-[#D7CCC8]" />
            <h2 className="text-base sm:text-lg font-bold">Interactive Unit Circle</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#25201E]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content: SVG Circle & Info Card */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* SVG Canvas */}
          <div className="relative shrink-0">
            <svg width="320" height="320" viewBox="0 0 320 320" className="overflow-visible select-none">
              {/* Axes */}
              <line x1="20" y1="160" x2="300" y2="160" stroke="#BCAAA4" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="160" y1="20" x2="160" y2="300" stroke="#BCAAA4" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Main Circle */}
              <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#5D4037" strokeWidth="2" opacity="0.8" />

              {/* Standard Angle Tick Dots */}
              {STANDARD_ANGLES.map((a) => {
                const r = (a.deg * Math.PI) / 180;
                const ax = cx + radius * Math.cos(r);
                const ay = cy - radius * Math.sin(r);
                const isSelected = a.deg === selectedAngle.deg;
                return (
                  <circle
                    key={a.deg}
                    cx={ax}
                    cy={ay}
                    r={isSelected ? 6 : 3.5}
                    fill={isSelected ? '#5D4037' : '#BCAAA4'}
                    stroke={isSelected ? '#FFFFFF' : 'none'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:scale-125"
                    onClick={() => setSelectedAngle(a)}
                  />
                );
              })}

              {/* Triangle Component */}
              <line x1={cx} y1={cy} x2={ptX} y2={ptY} stroke="#5D4037" strokeWidth="2.5" />
              <line x1={ptX} y1={cy} x2={ptX} y2={ptY} stroke="#8D6E63" strokeWidth="1.5" strokeDasharray="2,2" />
              <line x1={cx} y1={cy} x2={ptX} y2={cy} stroke="#8D6E63" strokeWidth="1.5" strokeDasharray="2,2" />

              {/* Active Dot */}
              <circle cx={ptX} cy={ptY} r="6.5" fill="#5D4037" stroke="#FFF" strokeWidth="2" />
            </svg>
          </div>

          {/* Coordinates & Trig Values Pod */}
          <div className="flex-1 w-full space-y-3 font-mono text-xs">
            <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#282422] p-3 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#757575]">Angle:</span>
                <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8]">
                  {selectedAngle.deg}° <span className="text-[#8D827A]">({<MathDisplay math={selectedAngle.radLatex} />})</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#757575]">Coordinates:</span>
                <span className="font-bold text-[#131313] dark:text-white">
                  (<MathDisplay math={selectedAngle.cosLatex} />, <MathDisplay math={selectedAngle.sinLatex} />)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#282422] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#757575] block mb-1">cos(θ)</span>
                <div className="text-[#5D4037] dark:text-[#D7CCC8] font-bold text-xs">
                  <MathDisplay math={selectedAngle.cosLatex} />
                </div>
              </div>

              <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#282422] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#757575] block mb-1">sin(θ)</span>
                <div className="text-[#5D4037] dark:text-[#D7CCC8] font-bold text-xs">
                  <MathDisplay math={selectedAngle.sinLatex} />
                </div>
              </div>

              <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#282422] p-2.5 rounded-xl">
                <span className="text-[10px] text-[#757575] block mb-1">tan(θ)</span>
                <div className="text-[#5D4037] dark:text-[#D7CCC8] font-bold text-xs">
                  <MathDisplay math={selectedAngle.tanLatex} />
                </div>
              </div>
            </div>

            {/* Quick Angle Buttons */}
            <div className="pt-1">
              <span className="text-[10px] text-[#757575] uppercase font-bold block mb-1.5">Common Angles:</span>
              <div className="flex flex-wrap gap-1">
                {[0, 30, 45, 60, 90, 180, 270].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const found = STANDARD_ANGLES.find((a) => a.deg === d);
                      if (found) setSelectedAngle(found);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      selectedAngle.deg === d
                        ? 'bg-[#5D4037] text-white border-[#795548]'
                        : 'bg-[#F5F5F5] dark:bg-[#131313] text-[#616161] dark:text-[#A19891] border-[#E0E0E0] dark:border-[#282422]'
                    }`}
                  >
                    {d}°
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
