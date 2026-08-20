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
  const [inputValue, setInputValue] = useState<string>('1');
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
    <div className="math-card w-full">
      <div className="flex items-center justify-between mb-4 border-b border-[var(--card-border)] pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>Unit & Currency Converter</span>
        </h3>
        {category === 'currency' && (
          <button
            onClick={loadCurrencyRates}
            disabled={isLoadingRates}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <RefreshCw size={12} className={isLoadingRates ? 'animate-spin' : ''} />
            Refresh Rates
          </button>
        )}
      </div>

      {/* Category selector */}
      <div className="flex overflow-x-auto gap-1 mb-4 pb-1 scrollbar-hide">
        {UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setCategory(cat.name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              category === cat.name
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
        <button
          onClick={() => setCategory('currency')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
            category === 'currency'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Currency (Live)
        </button>
      </div>

      {/* Conversion inputs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
        {/* From */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-medium text-[var(--muted)]">From</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="math-input text-sm py-2"
          >
            {currentUnits.map((u) => (
              <option key={u.symbol} value={u.symbol}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="math-input text-lg font-mono py-2"
            placeholder="0"
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center md:col-span-1 pt-4">
          <button
            onClick={swapUnits}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            title="Swap Units"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        {/* To */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-medium text-[var(--muted)]">To</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="math-input text-sm py-2"
          >
            {currentUnits.map((u) => (
              <option key={u.symbol} value={u.symbol}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
          <div className="math-input text-lg font-mono py-2 bg-gray-50 dark:bg-gray-900/50 flex items-center min-h-[46px] overflow-x-auto text-blue-600 dark:text-blue-400 font-semibold">
            {outputValue || '0'}
          </div>
        </div>
      </div>
    </div>
  );
}
