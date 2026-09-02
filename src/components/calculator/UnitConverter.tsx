'use client';

import React, { useState, useEffect } from 'react';
import {
  UNIT_CATEGORIES,
  convertUnit,
  getUnitsByCategory,
  fetchExchangeRates,
  convertCurrency,
  CURRENCY_LIST,
} from '@/lib/math/units';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';

export default function UnitConverter() {
  const [category, setCategory] = useState<string>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [inputValue, setInputValue] = useState<string>('');
  const [outputValue, setOutputValue] = useState<string>('');
  const [currencyRates, setCurrencyRates] = useState<Record<string, number>>({});
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);

  // Update unit selectors when category changes
  useEffect(() => {
    if (category === 'currency') {
      setFromUnit('USD');
      setToUnit('EUR');
      loadCurrencyRates();
    } else {
      const units = getUnitsByCategory(category);
      if (units.length >= 2) {
        setFromUnit(units[0].symbol);
        setToUnit(units[1].symbol);
      } else if (units.length === 1) {
        setFromUnit(units[0].symbol);
        setToUnit(units[0].symbol);
      }
    }
  }, [category]);

  const loadCurrencyRates = async () => {
    setIsLoadingRates(true);
    try {
      const rates = await fetchExchangeRates('USD');
      setCurrencyRates(rates);
    } catch {
      // fallback
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Compute conversion
  useEffect(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setOutputValue('');
      return;
    }

    if (category === 'currency') {
      if (Object.keys(currencyRates).length > 0) {
        const res = convertCurrency(val, fromUnit, toUnit, currencyRates);
        setOutputValue(res.toFixed(4));
      } else {
        setOutputValue('Loading rates...');
      }
    } else {
      try {
        const res = convertUnit(val, fromUnit, toUnit);
        setOutputValue(Number(res.toPrecision(7)).toString());
      } catch {
        setOutputValue('Error');
      }
    }
  }, [inputValue, fromUnit, toUnit, category, currencyRates]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const currentUnits = category === 'currency'
    ? CURRENCY_LIST.map((c) => ({ name: `${c.code} (${c.name})`, symbol: c.code, category: 'currency' }))
    : getUnitsByCategory(category);

  return (
    <div className="math-card w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] p-4 sm:p-6 rounded-2xl transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-[#E0E0E0] dark:border-[#2E2825] pb-3">
        <h3 className="text-base sm:text-lg font-bold text-[#131313] dark:text-white flex items-center gap-2">
          <span>Unit & Currency Converter</span>
        </h3>
        {category === 'currency' && (
          <button
            type="button"
            onClick={loadCurrencyRates}
            disabled={isLoadingRates}
            className="flex items-center gap-1.5 text-xs text-[#5D4037] hover:text-white bg-[#EFEBE9] hover:bg-[#5D4037] dark:text-[#D7CCC8] dark:hover:text-white dark:bg-[#3E2723] dark:hover:bg-[#5D4037] px-2.5 py-1 rounded-lg transition-colors border border-[#D7CCC8] dark:border-[#5D4037]/60"
          >
            <RefreshCw size={12} className={isLoadingRates ? 'animate-spin' : ''} />
            <span>Refresh Rates</span>
          </button>
        )}
      </div>

      {/* Category selector */}
      <div className="flex overflow-x-auto gap-1.5 mb-5 pb-1 scrollbar-none">
        {UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setCategory(cat.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
              category === cat.name
                ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
                : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] hover:bg-[#EFEBE9] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white dark:hover:bg-[#262220]'
            }`}
          >
            {cat.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCategory('currency')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
            category === 'currency'
              ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
              : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] hover:bg-[#EFEBE9] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white dark:hover:bg-[#262220]'
          }`}
        >
          Currency (Live)
        </button>
      </div>

      {/* Conversion inputs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* From */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-mono font-medium text-[#616161] dark:text-[#A19891]">From</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="math-input text-sm py-2 bg-white dark:bg-[#131313] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
          >
            {currentUnits.map((u) => (
              <option key={u.symbol} value={u.symbol} className="bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white">
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="math-input text-lg font-mono py-2 bg-white dark:bg-[#131313] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
            placeholder="0"
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center md:col-span-1 pt-4">
          <button
            type="button"
            onClick={swapUnits}
            className="p-3 rounded-full bg-[#F5F5F5] hover:bg-[#5D4037] text-[#5D4037] hover:text-white border border-[#E0E0E0] dark:bg-[#131313] dark:hover:bg-[#5D4037] dark:text-[#D7CCC8] dark:border-[#3E2723] transition-all active:scale-95 shadow-sm"
            title="Swap Units"
            aria-label="Swap Units"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        {/* To */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-mono font-medium text-[#616161] dark:text-[#A19891]">To</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="math-input text-sm py-2 bg-white dark:bg-[#131313] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
          >
            {currentUnits.map((u) => (
              <option key={u.symbol} value={u.symbol} className="bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white">
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
          <div className="math-input text-lg font-mono py-2 bg-[#F5F5F5] dark:bg-[#131313] flex items-center min-h-[46px] overflow-x-auto text-[#5D4037] dark:text-[#D7CCC8] font-bold border-[#E0E0E0] dark:border-[#332D2A]">
            {outputValue || '0'}
          </div>
        </div>
      </div>
    </div>
  );
}
