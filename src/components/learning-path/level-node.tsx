'use client';

import React from 'react';
import { Lock, Hammer, CheckCircle2 } from 'lucide-react';
import { Nivel } from '@/types';

interface LevelNodeProps {
  nivel: Nivel;
  onLevelClick: (id: string) => void;
  onDxClick: (nivel: Nivel) => void;
}

export default function LevelNode({ nivel, onLevelClick, onDxClick }: LevelNodeProps) {
  const { id, titulo, estado, completado, orden_index } = nivel;

  // Render icons/status overlays
  const renderStatusIndicator = () => {
    if (estado === 'dx') {
      return (
        <div className="absolute -top-1.5 -right-1.5 bg-yellow-500/90 border border-yellow-600 rounded-full p-1 shadow-md">
          <Hammer className="h-3 w-3 text-neutral-900" />
        </div>
      );
    }
    if (estado === 'locked') {
      return (
        <div className="absolute -top-1.5 -right-1.5 bg-neutral-800 border border-neutral-700 rounded-full p-1 shadow-md">
          <Lock className="h-3 w-3 text-neutral-400" />
        </div>
      );
    }
    if (completado) {
      return (
        <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 border border-emerald-600 rounded-full p-0.5 shadow-md">
          <CheckCircle2 className="h-4.5 w-4.5 text-white fill-emerald-500" />
        </div>
      );
    }
    return (
      <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 border border-indigo-600 rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
        {orden_index}
      </div>
    );
  };

  // Node styles based on level state
  let nodeStyle = '';
  if (estado === 'dx') {
    nodeStyle = 'opacity-40 border-2 border-dashed border-neutral-600 bg-neutral-900/60 cursor-pointer scale-98 active:scale-95';
  } else if (estado === 'locked') {
    nodeStyle = 'border-2 border-neutral-800 bg-neutral-950 text-neutral-600 cursor-not-allowed';
  } else {
    // Active state - premium kinetic style (floating animation, smooth shadows)
    nodeStyle = completado
      ? 'border-2 border-emerald-500/50 bg-neutral-900 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-400 cursor-pointer active:scale-95'
      : 'border-2 border-indigo-500 bg-neutral-900 shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-400 hover:scale-105 cursor-pointer active:scale-95';
  }

  const handleClick = () => {
    if (estado === 'dx') {
      onDxClick(nivel);
    } else if (estado === 'active') {
      onLevelClick(id);
    }
  };

  return (
    <div className="flex flex-col items-center group">
      {/* Node Button */}
      <button
        onClick={handleClick}
        disabled={estado === 'locked'}
        className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ease-out focus:outline-hidden ${nodeStyle}`}
        aria-label={`Nivel: ${titulo}. Estado: ${estado}`}
      >
        {renderStatusIndicator()}

        {/* Content Inside */}
        <span className="text-xl font-bold tracking-tight">
          {estado === 'locked' ? (
            <Lock className="h-6 w-6 text-neutral-700" />
          ) : estado === 'dx' ? (
            <Hammer className="h-6 w-6 text-neutral-500" />
          ) : (
            orden_index
          )}
        </span>
      </button>

      {/* Title */}
      <span className="mt-2 text-xs font-medium tracking-wide text-neutral-400 text-center max-w-[100px] line-clamp-2 group-hover:text-neutral-200 transition-colors duration-200">
        {titulo}
      </span>
    </div>
  );
}
