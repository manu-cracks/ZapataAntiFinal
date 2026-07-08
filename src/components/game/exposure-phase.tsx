'use client';

import React from 'react';
import { Eye, ChevronRight } from 'lucide-react';
import KatexRenderer from '../ui/katex-renderer';

interface ExposurePhaseProps {
  formula: string;
  timeLeft: number;
  onSkip: () => void;
  titulo: string;
}

export default function ExposurePhase({
  formula,
  timeLeft,
  onSkip,
  titulo,
}: ExposurePhaseProps) {
  // Calculate stroke dasharray for the timer SVG ring
  const strokeDashoffset = ((30 - timeLeft) / 30) * 283;

  return (
    <div className="flex flex-col items-center justify-between min-h-[75vh] w-full px-6 py-8 text-white relative z-10">
      {/* Top Section: Title & Icon */}
      <div className="text-center space-y-2 mt-4 animate-fade-in">
        <div className="flex items-center justify-center space-x-2 text-indigo-400">
          <Eye className="h-5 w-5 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase">
            Fase 1: Exposición Visual
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-100">
          {titulo}
        </h2>
        <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto">
          Memoriza la fórmula matemática pura. Intenta retener su estructura y símbolos.
        </p>
      </div>

      {/* Center Section: Formula Render in Floating Card */}
      <div className="flex-1 flex items-center justify-center w-full max-w-md my-8">
        <div className="relative w-full p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-500/20 transition-all duration-500 animate-float text-center flex flex-col justify-center items-center min-h-[220px]">
          {/* Subtle Ambient glow */}
          <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl filter blur-xl pointer-events-none" />
          
          <KatexRenderer formula={formula} />
        </div>
      </div>

      {/* Bottom Section: Circular Timer & Skip button (Bottom 1/3) */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-6 mb-4">
        {/* Visual Timer Ring */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="22"
              className="stroke-neutral-800 fill-none"
              strokeWidth="3.5"
            />
            <circle
              cx="32"
              cy="32"
              r="22"
              className="stroke-indigo-500 fill-none transition-all duration-1000 ease-linear"
              strokeWidth="3.5"
              strokeDasharray="138"
              strokeDashoffset={((30 - timeLeft) / 30) * 138}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-semibold text-neutral-200">
            {timeLeft}s
          </span>
        </div>

        {/* Primary Skippable Button ("Listo") */}
        <button
          onClick={onSkip}
          className="w-full group relative flex items-center justify-center space-x-2 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 active:scale-95 transition-all duration-200 shadow-xl shadow-indigo-950/40 text-base tracking-wider uppercase cursor-pointer"
        >
          <span>Listo</span>
          <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
