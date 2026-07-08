'use client';

import React from 'react';
import { Nivel } from '@/types';
import LevelNode from './level-node';
import { ChevronDown } from 'lucide-react';

interface ChannelColumnProps {
  titulo: string;
  levels: Nivel[];
  onLevelClick: (id: string) => void;
  onDxClick: (nivel: Nivel) => void;
  themeColor?: 'indigo' | 'emerald' | 'amber' | 'sky';
  isOpen?: boolean;
  onToggle?: () => void;
  bloqueado?: boolean;
}

export default function ChannelColumn({
  titulo,
  levels,
  onLevelClick,
  onDxClick,
  themeColor = 'indigo',
  isOpen = false,
  onToggle,
  bloqueado = false,
}: ChannelColumnProps) {
  // Sort levels by orden_index just to be safe
  const sortedLevels = [...levels].sort((a, b) => a.orden_index - b.orden_index);

  // Theme configuration for column headers
  const themeClasses = {
    indigo: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    sky: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
  };

  const lineThemeClasses = {
    indigo: 'from-indigo-600/30 via-indigo-500/40 to-indigo-600/30',
    emerald: 'from-emerald-600/30 via-emerald-500/40 to-emerald-600/30',
    amber: 'from-amber-600/30 via-amber-500/40 to-amber-600/30',
    sky: 'from-sky-600/30 via-sky-500/40 to-sky-600/30',
  };

  return (
    <div className="flex flex-col items-center flex-1 min-w-[160px] max-w-[240px] select-none mx-auto w-full">
      {/* Column Header as Toggle Button */}
      <button
        onClick={bloqueado ? undefined : onToggle}
        disabled={bloqueado}
        className={
          bloqueado
            ? 'w-full py-3 px-4 mb-6 rounded-2xl border flex items-center justify-between font-bold text-xs tracking-wider uppercase opacity-60 saturate-50 cursor-not-allowed bg-neutral-950 border-neutral-900 text-neutral-500 shadow-inner'
            : `w-full py-3 px-4 mb-6 rounded-2xl border flex items-center justify-between font-bold text-sm tracking-wider uppercase transition-all duration-300 active:scale-95 cursor-pointer hover:bg-neutral-900/50 hover:border-neutral-700/55 shadow-md ${themeClasses[themeColor]}`
        }
      >
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="truncate">{titulo}</span>
          {bloqueado && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-amber-500/80 normal-case tracking-normal shrink-0">
              Próximamente
            </span>
          )}
        </div>
        {!bloqueado && (
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 shrink-0 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        )}
      </button>

      {/* Vertical Path of Levels */}
      {isOpen && (
        <div className="relative flex flex-col items-center space-y-16 w-full py-4 transition-all duration-300 animate-fade-in">
          {/* SVG/Div Vertical Connector Line */}
          {sortedLevels.length > 1 && (
            <div className={`absolute top-10 bottom-10 w-0.5 bg-linear-to-b ${lineThemeClasses[themeColor]}`} />
          )}

          {/* Level Nodes */}
          {sortedLevels.map((nivel) => (
            <div key={nivel.id} className="relative z-10">
              <LevelNode
                nivel={nivel}
                onLevelClick={onLevelClick}
                onDxClick={onDxClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
