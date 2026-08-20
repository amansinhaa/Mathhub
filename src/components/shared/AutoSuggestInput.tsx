'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/** Function suggestion entry. */
interface FunctionSuggestion {
  name: string;
  insert: string;
  description: string;
}

/** Built-in math function suggestions. */
const MATH_FUNCTIONS: FunctionSuggestion[] = [
  { name: 'sin', insert: 'sin(', description: 'Sine' },
  { name: 'cos', insert: 'cos(', description: 'Cosine' },
  { name: 'tan', insert: 'tan(', description: 'Tangent' },
  { name: 'asin', insert: 'asin(', description: 'Inverse sine (arcsin)' },
  { name: 'acos', insert: 'acos(', description: 'Inverse cosine (arccos)' },
  { name: 'atan', insert: 'atan(', description: 'Inverse tangent (arctan)' },
  { name: 'sinh', insert: 'sinh(', description: 'Hyperbolic sine' },
  { name: 'cosh', insert: 'cosh(', description: 'Hyperbolic cosine' },
  { name: 'tanh', insert: 'tanh(', description: 'Hyperbolic tangent' },
  { name: 'sqrt', insert: 'sqrt(', description: 'Square root' },
  { name: 'cbrt', insert: 'cbrt(', description: 'Cube root' },
  { name: 'nthRoot', insert: 'nthRoot(', description: 'Nth root' },
  { name: 'log', insert: 'log(', description: 'Base-10 logarithm' },
  { name: 'log2', insert: 'log2(', description: 'Base-2 logarithm' },
  { name: 'ln', insert: 'log(', description: 'Natural logarithm (ln)' },
  { name: 'exp', insert: 'exp(', description: 'Exponential (e^x)' },
  { name: 'abs', insert: 'abs(', description: 'Absolute value' },
  { name: 'ceil', insert: 'ceil(', description: 'Ceiling' },
  { name: 'floor', insert: 'floor(', description: 'Floor' },
  { name: 'round', insert: 'round(', description: 'Round' },
  { name: 'factorial', insert: 'factorial(', description: 'Factorial (n!)' },
  { name: 'combinations', insert: 'combinations(', description: 'nCr — combinations' },
  { name: 'permutations', insert: 'permutations(', description: 'nPr — permutations' },
  { name: 'gcd', insert: 'gcd(', description: 'Greatest common divisor' },
  { name: 'lcm', insert: 'lcm(', description: 'Least common multiple' },
  { name: 'mod', insert: 'mod(', description: 'Modulo' },
  { name: 'pi', insert: 'pi', description: 'π ≈ 3.14159...' },
  { name: 'e', insert: 'e', description: 'Euler\'s number ≈ 2.71828...' },
  { name: 'i', insert: 'i', description: 'Imaginary unit' },
  { name: 'matrix', insert: 'matrix([', description: 'Create matrix' },
  { name: 'det', insert: 'det(', description: 'Matrix determinant' },
  { name: 'inv', insert: 'inv(', description: 'Matrix inverse' },
  { name: 'transpose', insert: 'transpose(', description: 'Matrix transpose' },
];

interface AutoSuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

/**
 * Expression input with auto-suggest dropdown for math functions.
 * Typing partial function names shows a filtered list of suggestions.
 */
export function AutoSuggestInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type an expression...',
  className = '',
  autoFocus = false,
}: AutoSuggestInputProps) {
  const [suggestions, setSuggestions] = useState<FunctionSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /** Extract the current word being typed (from cursor position backwards). */
  const getCurrentWord = useCallback((): string => {
    if (!inputRef.current) return '';
    const cursorPos = inputRef.current.selectionStart || value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    // Match the last word/identifier characters
    const match = textBeforeCursor.match(/[a-zA-Z][a-zA-Z0-9]*$/);
    return match ? match[0] : '';
  }, [value]);

  /** Update suggestions based on current input. */
  const updateSuggestions = useCallback(() => {
    const word = getCurrentWord();
    if (word.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = word.toLowerCase();
    const filtered = MATH_FUNCTIONS.filter(
      (fn) =>
        fn.name.toLowerCase().startsWith(lower) &&
        fn.name.toLowerCase() !== lower
    ).slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(0);
  }, [getCurrentWord]);

  useEffect(() => {
    updateSuggestions();
  }, [value, updateSuggestions]);

  /** Apply a suggestion by replacing the current word. */
  const applySuggestion = (suggestion: FunctionSuggestion) => {
    const cursorPos = inputRef.current?.selectionStart || value.length;
    const word = getCurrentWord();
    const start = cursorPos - word.length;
    const newValue = value.slice(0, start) + suggestion.insert + value.slice(cursorPos);
    onChange(newValue);
    setShowSuggestions(false);
    // Focus back on input and set cursor after inserted text
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = start + suggestion.insert.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  /** Handle keyboard navigation within suggestions. */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && suggestions.length > 0)) {
        e.preventDefault();
        applySuggestion(suggestions[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }
    if (e.key === 'Enter' && !showSuggestions) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={updateSuggestions}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`math-input ${className}`}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.name}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-100 dark:bg-blue-900/40'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => applySuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                {suggestion.name}
              </span>
              <span className="text-[var(--muted)]">{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
