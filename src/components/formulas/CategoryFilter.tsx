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
    <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-1 pb-2 md:pb-0 scrollbar-hide">
      <button
        onClick={() => onSelect('all')}
        className={`flex-shrink-0 flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeCategory === 'all'
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <span>All Formulas</span>
        <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">{totalCount}</span>
      </button>

      {groups.map((group) => (
        <button
          key={group.category}
          onClick={() => onSelect(group.category)}
          className={`flex-shrink-0 flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === group.category
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span>{group.label}</span>
          <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">{group.count}</span>
        </button>
      ))}
    </div>
  );
}
