'use client';

import { useCalculatorStore } from '@/stores/calculatorStore';

export default function Keypad() {
  const { isScientificMode, appendToExpression, clear, clearEntry, evaluate } =
    useCalculatorStore();

  const handleBtnClick = (val: string) => {
    if (val === 'AC') {
      clear();
    } else if (val === 'CE') {
      clearEntry();
    } else if (val === '=') {
      evaluate();
    } else {
      appendToExpression(val);
    }
  };

  const standardButtons = [
    { label: 'AC', val: 'AC', className: 'calc-btn-action bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300' },
    { label: 'CE', val: 'CE', className: 'calc-btn-action' },
    { label: '%', val: '%', className: 'calc-btn-operator' },
    { label: '÷', val: '/', className: 'calc-btn-operator' },
    { label: '7', val: '7', className: 'calc-btn-number' },
    { label: '8', val: '8', className: 'calc-btn-number' },
    { label: '9', val: '9', className: 'calc-btn-number' },
    { label: '×', val: '*', className: 'calc-btn-operator' },
    { label: '4', val: '4', className: 'calc-btn-number' },
    { label: '5', val: '5', className: 'calc-btn-number' },
    { label: '6', val: '6', className: 'calc-btn-number' },
    { label: '−', val: '-', className: 'calc-btn-operator' },
    { label: '1', val: '1', className: 'calc-btn-number' },
    { label: '2', val: '2', className: 'calc-btn-number' },
    { label: '3', val: '3', className: 'calc-btn-number' },
    { label: '+', val: '+', className: 'calc-btn-operator' },
    { label: '0', val: '0', className: 'calc-btn-number col-span-2' },
    { label: '.', val: '.', className: 'calc-btn-number' },
    { label: '=', val: '=', className: 'calc-btn-equals bg-blue-500 text-white dark:bg-blue-600' },
  ];

  const scientificButtons = [
    { label: 'sin', val: 'sin(' },
    { label: 'cos', val: 'cos(' },
    { label: 'tan', val: 'tan(' },
    { label: 'π', val: 'pi' },
    { label: 'sin⁻¹', val: 'asin(' },
    { label: 'cos⁻¹', val: 'acos(' },
    { label: 'tan⁻¹', val: 'atan(' },
    { label: 'e', val: 'e' },
    { label: 'sinh', val: 'sinh(' },
    { label: 'cosh', val: 'cosh(' },
    { label: 'tanh', val: 'tanh(' },
    { label: 'i', val: 'i' },
    { label: '√', val: 'sqrt(' },
    { label: '∛', val: 'cbrt(' },
    { label: 'xʸ', val: '^' },
    { label: 'n!', val: '!' },
    { label: 'log', val: 'log10(' },
    { label: 'ln', val: 'log(' },
    { label: 'eˣ', val: 'e^' },
    { label: '|x|', val: 'abs(' },
    { label: '(', val: '(' },
    { label: ')', val: ')' },
    { label: 'nCr', val: ' combinations(' },
    { label: 'nPr', val: ' permutations(' },
    { label: '10ˣ', val: '10^' },
    { label: 'x²', val: '^2' },
    { label: 'x³', val: '^3' },
    { label: '1/x', val: '^-1' },
  ];

  return (
    <div className="flex flex-col gap-2 md:flex-row md:gap-4 w-full h-full">
      {isScientificMode && (
        <div className="grid grid-cols-4 gap-2 md:grid-cols-4 flex-1">
          {scientificButtons.map((btn, idx) => (
            <button
              key={`sci-${idx}`}
              onClick={() => handleBtnClick(btn.val)}
              className="calc-btn-function p-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 flex-1">
        {standardButtons.map((btn, idx) => (
          <button
            key={`std-${idx}`}
            onClick={() => handleBtnClick(btn.val)}
            className={`p-4 rounded-xl text-lg font-semibold transition-colors ${
              btn.className || 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
