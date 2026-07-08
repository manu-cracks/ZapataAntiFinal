'use client';

import React from 'react';
import { Activity, Brain } from 'lucide-react';

interface EnergyBarProps {
  value: number; // 0 to 100
}

export default function EnergyBar({ value }: EnergyBarProps) {
  // Ensure the value stays within 0 - 100
  const normalizedValue = Math.min(100, Math.max(0, value));

  // Determine bar theme (we avoid RED even at low energy! Fieles a la identidad no punitiva)
  // Low energy: Indigo-600/Blue-600
  // High energy: Purple-500/Indigo-500
  const getProgressStyles = () => {
    if (normalizedValue > 50) {
      return 'from-indigo-500 to-purple-500 shadow-indigo-500/20';
    }
    return 'from-sky-500 to-indigo-500 shadow-indigo-500/10';
  };

  return (
    <div className="w-full max-w-md px-6 py-4 bg-neutral-950 border border-neutral-900 rounded-2xl relative overflow-hidden select-none">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-indigo-500/[0.01] pointer-events-none" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Brain className="h-4.5 w-4.5 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">
            Energía Neural
          </span>
        </div>
        <span className="text-xs font-black tracking-wider text-neutral-300">
          {normalizedValue}%
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3 rounded-full bg-neutral-900 border border-neutral-800/80 overflow-hidden">
        <div
          style={{ width: `${normalizedValue}%` }}
          className={`absolute left-0 top-0 h-full rounded-full bg-linear-to-r shadow-lg transition-all duration-500 ease-out ${getProgressStyles()}`}
        />
      </div>
    </div>
  );
}
