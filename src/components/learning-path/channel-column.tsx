'use client';

import React from 'react';
import { Nivel } from '@/types';
import LevelNode from './level-node';

interface ChannelColumnProps {
  titulo: string;
  levels: Nivel[];
  onLevelClick: (id: string) => void;
  onDxClick: (nivel: Nivel) => void;
  themeColor?: 'indigo' | 'emerald' | 'amber' | 'sky';
}

export default function ChannelColumn({
  titulo,
  levels,
  onLevelClick,
  onDxClick,
  themeColor = 'indigo',
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
    <div className="flex flex-col items-center flex-1 min-w-[120px] max-w-[200px] select-none">
      {/* Column Header */}
      <div className={`w-full py-2.5 px-4 mb-8 rounded-2xl border text-center font-bold text-sm tracking-wider uppercase ${themeClasses[themeColor]}`}>
        {titulo}
      </div>

      {/* Vertical Path of Levels */}
      <div className="relative flex flex-col items-center space-y-16 w-full py-4">
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
    </div>
  );
}
