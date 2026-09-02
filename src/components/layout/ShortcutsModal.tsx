'use client';

import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutGroup {
  category: string;
  items: { key: string; description: string }[];
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    category: 'Calculator Controls',
    items: [
      { key: '0 – 9', description: 'Enter numbers' },
      { key: '+  −  *  /  ^  %', description: 'Arithmetic & power operators' },
      { key: 'Enter or =', description: 'Calculate expression' },
      { key: 'Backspace', description: 'Delete last character' },
      { key: 'Escape', description: 'All Clear (AC)' },
    ],
  },
  {
    category: 'Solver & Graph Tools',
    items: [
      { key: 'Enter', description: 'Submit equation / solve' },
      { key: 'Scroll', description: 'Zoom graph in / out' },
      { key: 'Drag', description: 'Pan Cartesian coordinate plane' },
    ],
  },
  {
    category: 'General & Studio',
    items: [
      { key: '?', description: 'Toggle this keyboard shortcut guide' },
    ],
  },
];

export function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-xl text-[#757575] hover:text-[#131313] hover:bg-[#F5F5F5] dark:text-[#8D827A] dark:hover:text-white dark:hover:bg-[#1B1B1B] transition-colors"
        title="Keyboard Shortcuts (Press ?)"
        aria-label="Keyboard Shortcuts"
      >
        <Keyboard size={16} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-5 shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0] dark:border-[#2E2825] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#5D4037] text-white flex items-center justify-center">
                  <Keyboard size={16} />
                </div>
                <div>
                  <h3 id="shortcuts-title" className="font-bold text-sm text-[#131313] dark:text-white">
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-[11px] text-[#757575] dark:text-[#8D827A]">
                    Speed up calculations and navigation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#22201F]"
                aria-label="Close shortcuts modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {SHORTCUTS.map((group) => (
                <div key={group.category} className="space-y-2">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8]">
                    {group.category}
                  </h4>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#262220]"
                      >
                        <span className="text-[#616161] dark:text-[#A19891]">{item.description}</span>
                        <kbd className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-[#1B1B1B] text-[#5D4037] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#332D2A] shadow-2xs">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E0E0E0] dark:border-[#2E2825] text-center">
              <span className="text-[10px] font-mono text-[#757575] dark:text-[#8D827A]">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#2E2825] text-[#5D4037] dark:text-[#D7CCC8]">?</kbd> anywhere to open or close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
