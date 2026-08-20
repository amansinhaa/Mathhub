'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathDisplayProps {
  /** The LaTeX expression to render. */
  math: string;
  /** Whether to render as a block (centered, larger) or inline. Default: false. */
  block?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Error fallback — shown if KaTeX fails to parse. */
  errorFallback?: string;
}

/**
 * Robust KaTeX math renderer using katex.renderToString.
 * Handles both block and inline LaTeX expressions with full CSS and error handling.
 */
export function MathDisplay({
  math,
  block = false,
  className = '',
  errorFallback,
}: MathDisplayProps) {
  const html = useMemo(() => {
    if (!math || math.trim() === '') return '';
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return '';
    }
  }, [math, block]);

  if (!math || math.trim() === '') {
    return null;
  }

  if (!html) {
    return (
      <span className={`font-mono text-sm text-red-500 ${className}`}>
        {errorFallback || math}
      </span>
    );
  }

  if (block) {
    return (
      <div
        className={`katex-block overflow-x-auto my-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`katex-inline ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MathDisplay;
