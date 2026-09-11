'use client';

import React, { useState, useMemo } from 'react';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import FormulaCard from './FormulaCard';
import { ALL_FORMULAS, getCategoryGroups } from '@/data/formulas';
import { FormulaCategory, CurriculumLevel, CURRICULUM_LABELS, formulaMatchesLevel } from '@/types/formula';
import { BookOpen, Download, GraduationCap } from 'lucide-react';
import { exportFormulaSheetPdf } from '@/lib/export/FormulaPdfExport';

export default function FormulaLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FormulaCategory | 'all'>('all');
  const [curriculum, setCurriculum] = useState<CurriculumLevel>('all');

  const groups = useMemo(() => getCategoryGroups(curriculum, query), [curriculum, query]);

  const filteredFormulas = useMemo(() => {
    let result = ALL_FORMULAS;

    if (category !== 'all') {
      result = result.filter((f) => f.category === category);
    }

    if (curriculum !== 'all') {
      result = result.filter((f) => formulaMatchesLevel(f, curriculum));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [query, category, curriculum]);

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      {/* Top App Bar / Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E0E0] dark:border-[#2E2825] pb-3 gap-3">
        <div className="flex items-center gap-3 pl-28 sm:pl-36 md:pl-44">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#131313] dark:text-white">
                Formula Reference
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] text-[10px] font-mono font-bold uppercase dark:border-[#5D4037]/50">
                LIBRARY
              </span>
            </div>
            <p className="text-[11px] text-[#616161] dark:text-[#A19891] hidden sm:block">
              Interactive formulas across algebra, geometry, calculus, and physics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          {/* Download Printable PDF Button */}
          <button
            type="button"
            onClick={() => exportFormulaSheetPdf(filteredFormulas, `${curriculum !== 'all' ? CURRICULUM_LABELS[curriculum] : 'Complete'} Reference Sheet`)}
            className="h-[38px] px-3.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 border border-[#D7CCC8] dark:border-[#5D4037]/50 bg-white dark:bg-[#1B1B1B] text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#EFEBE9] dark:hover:bg-[#3E2723]/60 shadow-xs shrink-0"
            title="Download printable PDF formula sheet"
          >
            <Download size={13} />
            <span>PDF Sheet</span>
          </button>

          <div className="flex-1 sm:w-64">
            <SearchBar onSearch={setQuery} />
          </div>
        </div>
      </header>

      {/* Curriculum Level Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <div className="flex items-center gap-1.5 text-xs text-[#757575] dark:text-[#8D827A] font-mono shrink-0 pr-1">
          <GraduationCap size={15} className="text-[#5D4037] dark:text-[#D7CCC8]" />
          <span>Level:</span>
        </div>
        {(
          [
            { id: 'all', label: 'All Levels' },
            { id: 'class10', label: 'Class 10 / GCSE' },
            { id: 'class12', label: 'Class 12 / A-Level' },
            { id: 'higher_ed', label: 'University / Higher Ed' },
          ] as const
        ).map((lvl) => (
          <button
            key={lvl.id}
            type="button"
            onClick={() => setCurriculum(lvl.id)}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap border ${
              curriculum === lvl.id
                ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
                : 'bg-white dark:bg-[#1B1B1B] text-[#616161] dark:text-[#A19891] border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#F5F5F5] dark:hover:bg-[#22201F]'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Dual-Pane / Multi-Column Layout */}
      <div className="flex flex-col md:flex-row gap-5 flex-1 min-h-0 items-start">
        {/* Left Category Rail */}
        <div className="w-full md:w-60 shrink-0 bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-3.5 shadow-sm transition-colors">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8] mb-3 hidden md:block px-1">
            Categories
          </h3>
          <CategoryFilter 
            groups={groups} 
            activeCategory={category} 
            onSelect={setCategory} 
          />
        </div>

        {/* Right Formula Grid */}
        <div className="flex-1 w-full overflow-y-auto">
          <div className="mb-3 flex items-center justify-between text-xs font-mono text-[#757575] dark:text-[#8D827A] px-1">
            <span>
              Showing {filteredFormulas.length} {filteredFormulas.length === 1 ? 'formula' : 'formulas'}
            </span>
          </div>
          
          {filteredFormulas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pb-4">
              {filteredFormulas.map(formula => (
                <FormulaCard key={formula.id} formula={formula} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#1B1B1B] rounded-2xl border border-dashed border-[#E0E0E0] dark:border-[#2E2825] p-8 shadow-sm">
              <BookOpen size={28} className="mx-auto text-[#BCAAA4] dark:text-[#3E2723] mb-2" />
              <p className="text-xs text-[#616161] dark:text-[#A19891] mb-1">No formulas found matching your filter criteria.</p>
              <p className="text-[11px] text-[#757575] dark:text-[#8D827A] mb-3">
                {category !== 'all' && curriculum !== 'all'
                  ? `There are no formulas in this category for ${CURRICULUM_LABELS[curriculum]}.`
                  : 'Try switching to All Levels or clearing your search.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {category !== 'all' && (
                  <button 
                    type="button"
                    onClick={() => setCategory('all')}
                    className="text-xs font-mono font-semibold text-[#5D4037] dark:text-[#D7CCC8] bg-[#EFEBE9] dark:bg-[#25201E] hover:bg-[#D7CCC8] dark:hover:bg-[#332B27] px-3 py-1.5 rounded-xl transition-colors border border-[#D7CCC8] dark:border-[#3E2723]"
                  >
                    View All Categories
                  </button>
                )}
                {curriculum !== 'all' && (
                  <button 
                    type="button"
                    onClick={() => setCurriculum('all')}
                    className="text-xs font-mono font-semibold text-[#5D4037] dark:text-[#D7CCC8] bg-[#EFEBE9] dark:bg-[#25201E] hover:bg-[#D7CCC8] dark:hover:bg-[#332B27] px-3 py-1.5 rounded-xl transition-colors border border-[#D7CCC8] dark:border-[#3E2723]"
                  >
                    Show All Levels
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => { setQuery(''); setCategory('all'); setCurriculum('all'); }}
                  className="text-xs font-mono font-semibold text-white bg-[#5D4037] hover:bg-[#6D4C41] px-3.5 py-1.5 rounded-xl transition-colors border border-[#795548]/50 shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
