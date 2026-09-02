'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#757575] dark:text-[#8D827A]">
        <Search size={16} />
      </div>
      <input
        type="text"
        className="block w-full pl-9 pr-9 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] leading-5 bg-white dark:bg-[#131313] text-[#131313] dark:text-white placeholder-[#9E9E9E] dark:placeholder-[#8D827A] focus:outline-none focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] text-xs sm:text-sm font-sans transition-colors shadow-xs"
        placeholder="Search formulas by name, symbol, or tags..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
