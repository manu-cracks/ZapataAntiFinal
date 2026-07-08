'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface KatexRendererProps {
  formula: string;
  displayMode?: boolean;
}

export default function KatexRenderer({
  formula,
  displayMode = true,
}: KatexRendererProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return formula; // fallback to raw text formula
    }
  }, [formula, displayMode]);

  return (
    <div
      className="katex-math overflow-x-auto overflow-y-hidden py-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
