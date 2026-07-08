'use client';

import React, { useEffect, useState } from 'react';
import katex from 'katex';

interface KatexPreviewProps {
  formula: string;
  onValidationError: (hasError: boolean) => void;
}

export default function KatexPreview({
  formula,
  onValidationError,
}: KatexPreviewProps) {
  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formula.trim()) {
      setHtml('');
      setError(null);
      onValidationError(false);
      return;
    }

    try {
      // Validate KaTeX syntax strictly. If it fails, throw error.
      const rendered = katex.renderToString(formula, {
        displayMode: true,
        throwOnError: true,
      });
      setHtml(rendered);
      setError(null);
      onValidationError(false);
    } catch (err: any) {
      // Clean up KaTeX default error styling for the UI warning log
      const cleanMsg = err.message
        ? err.message.replace('KaTeX parse error:', '').trim()
        : 'Error de sintaxis LaTeX';
      setError(cleanMsg);
      onValidationError(true);
    }
  }, [formula, onValidationError]);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono leading-relaxed">
        <strong className="text-amber-300">⚠️ Sintaxis LaTeX Inválida:</strong>
        <p className="mt-1.5">{error}</p>
      </div>
    );
  }

  if (!formula.trim()) {
    return (
      <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-900 border-dashed flex items-center justify-center min-h-[90px]">
        <p className="text-neutral-500 text-xs italic">
          Escribe una ecuación en LaTeX para ver su previsualización en tiempo real
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-900 flex items-center justify-center min-h-[90px] overflow-x-auto">
      <div
        className="katex-preview-rendered text-white scale-110"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
