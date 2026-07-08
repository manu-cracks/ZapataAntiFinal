'use client';

import React, { useEffect } from 'react';
import { X, Hammer } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title = 'Módulo en Construcción',
  description = 'Estamos calibrando los sensores gravitacionales y refinando este módulo. ¡Estará listo muy pronto para poner a prueba tu memoria cinética!',
}: BottomSheetProps) {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-md transform rounded-t-3xl bg-neutral-900 border-t border-neutral-800 p-6 pb-8 shadow-2xl transition-transform duration-300 ease-out translate-y-0 text-white">
        {/* AntiGravity Floating Decor Handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-700" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Hammer className="h-5 w-5 animate-pulse" />
            <h3 className="text-lg font-semibold tracking-wide uppercase text-neutral-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 bg-neutral-800 text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-hidden"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm text-neutral-300 leading-relaxed font-light">
            {description}
          </p>

          {/* Neural Energy Bar decoration */}
          <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-2/5 animate-pulse" />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 active:scale-95 transition-all duration-200 shadow-lg shadow-indigo-900/30 text-sm tracking-wide"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
