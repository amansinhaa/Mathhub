'use client';

import React from 'react';
import { CategoryGroup, FormulaCategory } from '@/types/formula';

interface CategoryFilterProps {
  groups: CategoryGroup[];
  activeCategory: FormulaCategory | 'all';
  onSelect: (category: FormulaCategory | 'all') => void;
}

export default function CategoryFilter({ groups, activeCategory, onSelect }: CategoryFilterProps) {
  const totalCount = groups.reduce((acc, g) => acc + g.count, 0);

  return (
    <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible space-x-1.5 md:space-x-0 md:space-y-1 pb-2 md:pb-0 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`shrink-0 flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[36px] border ${
          activeCategory === 'all'
            ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
            : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] hover:bg-[#EFEBE9] dark:bg-[#1B1B1B] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white dark:hover:bg-[#242220]'
        }`}
        aria-label="All Formulas"
      >
        <span>All Formulas</span>
        <span
          className={`ml-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            activeCategory === 'all' ? 'bg-[#3E2723] text-white' : 'bg-white text-[#5D4037] border border-[#E0E0E0] dark:bg-[#131313] dark:text-[#8D827A] dark:border-[#2E2825]'
          }`}
        >
          {totalCount}
        </span>
      </button>

      {groups.map((group) => {
        const isActive = activeCategory === group.category;
        const isEmpty = group.count === 0;
        return (
          <button
            key={group.category}
            type="button"
            onClick={() => onSelect(group.category)}
            className={`shrink-0 flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[36px] border ${
              isActive
                ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
                : isEmpty
                ? 'bg-[#F5F5F5]/60 text-[#9E9E9E] border-[#E0E0E0]/60 hover:bg-[#EFEBE9]/60 dark:bg-[#181818]/60 dark:text-[#6D625C] dark:border-[#262220]'
                : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] hover:bg-[#EFEBE9] dark:bg-[#1B1B1B] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white dark:hover:bg-[#242220]'
            }`}
            aria-label={`Category ${group.label}`}
          >
            <span className={isEmpty && !isActive ? 'opacity-50' : ''}>{group.label}</span>
            <span
              className={`ml-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-[#3E2723] text-white'
                  : isEmpty
                  ? 'bg-[#EEEEEE] text-[#9E9E9E] dark:bg-[#24201E] dark:text-[#6D625C]'
                  : 'bg-white text-[#5D4037] border border-[#E0E0E0] dark:bg-[#131313] dark:text-[#8D827A] dark:border-[#2E2825]'
              }`}
            >
              {group.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
