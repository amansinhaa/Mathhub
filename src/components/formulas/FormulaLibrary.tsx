'use client';

import React, { useState, useMemo } from 'react';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import FormulaCard from './FormulaCard';
import { ALL_FORMULAS, getCategoryGroups } from '@/data/formulas';
import { FormulaCategory } from '@/types/formula';

export default function FormulaLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FormulaCategory | 'all'>('all');

  const groups = useMemo(() => getCategoryGroups(), []);

  const filteredFormulas = useMemo(() => {
    let result = ALL_FORMULAS;
    
    if (category !== 'all') {
      result = result.filter(f => f.category === category);
    }
    
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.description.toLowerCase().includes(q) || 
        f.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [query, category]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Formula Reference</h2>
        <SearchBar onSearch={setQuery} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 hidden md:block">Categories</h3>
            <CategoryFilter 
              groups={groups} 
              activeCategory={category} 
              onSelect={setCategory} 
            />
          </div>
        </div>

        <div className="flex-grow">
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredFormulas.length} {filteredFormulas.length === 1 ? 'result' : 'results'}
          </div>
          
          {filteredFormulas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFormulas.map(formula => (
                <FormulaCard key={formula.id} formula={formula} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No formulas found matching your criteria.</p>
              <button 
                onClick={() => { setQuery(''); setCategory('all'); }}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
