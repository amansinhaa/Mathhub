'use client';

import React from 'react';
import { MathDisplay } from './MathDisplay';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Parses a string containing LaTeX equations wrapped in $...$ or $$...$$
 * and renders the LaTeX parts using KaTeX MathDisplay inline.
 */
export function MathText({ text, className = '' }: MathTextProps) {
  if (!text) return null;

  // If no math markers exist, render standard text directly
  if (!text.includes('$')) {
    return <span className={className}>{text}</span>;
  }

  // Regex to match $$...$$ (block/display) or $...$ (inline)
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          const math = part.slice(2, -2).trim();
          return <MathDisplay key={index} math={math} block />;
        }

        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1).trim();
          return (
            <span key={index} className="inline-block mx-0.5 align-middle">
              <MathDisplay math={math} />
            </span>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}

export default MathText;
