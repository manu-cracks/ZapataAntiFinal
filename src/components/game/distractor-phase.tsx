'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface DistractorPhaseProps {
  timeLeft: number;
}

export default function DistractorPhase({ timeLeft }: DistractorPhaseProps) {
  const [ballPosition, setBallPosition] = useState<number>(0);
  const [selectedCup, setSelectedCup] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize and shuffle
  const shuffleCups = () => {
    setIsShuffling(true);
    setSelectedCup(null);
    const newBallPos = Math.floor(Math.random() * 3);
    
    // Simulate brief shuffle delay
    setTimeout(() => {
      setBallPosition(newBallPos);
      setIsShuffling(false);
    }, 600);
  };

  useEffect(() => {
    shuffleCups();
  }, []);

  const handleCupClick = (index: number) => {
    if (isShuffling || selectedCup !== null) return;
    setSelectedCup(index);
    if (index === ballPosition) {
      setScore((s) => s + 1);
      // Auto reshuffle after a brief delay if they found the ball
      setTimeout(() => {
        shuffleCups();
      }, 1000);
    } else {
      // Allow trying again after a short delay
      setTimeout(() => {
        shuffleCups();
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[75vh] w-full px-6 py-8 text-white relative z-10 select-none">
      {/* Header */}
      <div className="text-center space-y-2 mt-4">
        <div className="flex items-center justify-center space-x-2 text-amber-400">
          <ShieldAlert className="h-5 w-5 animate-bounce" />
          <span className="text-xs font-bold tracking-widest uppercase">
            Fase 2: Distractor Cognitivo
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-100">
          Juego de los 3 Vasos
        </h2>
        <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto">
          ¿Dónde está la esfera de energía? ¡Encuéntrala antes de que expire el tiempo!
        </p>
      </div>

      {/* Main Game Area: Three Cups */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md my-8">
        <div className="grid grid-cols-3 gap-6 w-full max-w-xs justify-center items-end min-h-[160px] relative">
          {/* Subtle glow */}
          <div className="absolute inset-0 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
          
          {[0, 1, 2].map((idx) => {
            const isSelected = selectedCup === idx;
            const isCorrect = idx === ballPosition;
            const isRevealed = selectedCup !== null;

            let cupTranslation = 'translate-y-0';
            if (isRevealed && isSelected) {
              cupTranslation = '-translate-y-12';
            }

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-end relative h-36"
              >
                {/* Ball / Energy Core under the cup */}
                {isRevealed && isCorrect && (
                  <div className="absolute bottom-2 w-7 h-7 bg-amber-400 rounded-full animate-ping filter blur-xs shadow-lg shadow-amber-400/80 z-0" />
                )}
                {isRevealed && isCorrect && (
                  <div className="absolute bottom-2 w-7 h-7 bg-linear-to-r from-amber-300 to-yellow-500 rounded-full shadow-lg shadow-amber-400/80 z-0" />
                )}

                {/* Cup Body */}
                <button
                  onClick={() => handleCupClick(idx)}
                  disabled={isShuffling || isRevealed}
                  className={`w-16 h-20 bg-linear-to-b from-neutral-700 to-neutral-800 rounded-t-2xl border-t border-neutral-600 shadow-xl z-10 transition-all duration-500 ease-out cursor-pointer ${cupTranslation} ${
                    isShuffling ? 'animate-bounce' : ''
                  } ${
                    isRevealed
                      ? isCorrect
                        ? 'border-2 border-emerald-500/40 shadow-emerald-500/10'
                        : isSelected
                        ? 'border-2 border-neutral-500/40'
                        : ''
                      : 'hover:scale-105 active:scale-95'
                  }`}
                  aria-label={`Vaso ${idx + 1}`}
                >
                  {/* Decorative stripes on cup */}
                  <div className="w-full h-1 bg-neutral-600/30 mt-4" />
                  <div className="w-full h-1.5 bg-neutral-600/20 mt-2" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Feedback message */}
        <div className="mt-8 text-center min-h-[24px]">
          {isShuffling ? (
            <p className="text-xs text-neutral-500 italic flex items-center justify-center space-x-1.5 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Mezclando vasos...</span>
            </p>
          ) : selectedCup !== null ? (
            selectedCup === ballPosition ? (
              <p className="text-sm font-semibold text-emerald-400">
                ¡Excelente! Esfera localizada (+1 acierto)
              </p>
            ) : (
              <p className="text-sm font-semibold text-neutral-400">
                Vaso vacío. ¡Sigue buscando!
              </p>
            )
          ) : (
            <p className="text-xs text-neutral-400 italic">
              Elige un vaso para levantarlo
            </p>
          )}
        </div>
      </div>

      {/* Footer Area: Stats & Countdown (Bottom 1/3) */}
      <div className="w-full max-w-xs flex items-center justify-between px-6 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 backdrop-blur-xs mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
            Esferas
          </span>
          <span className="text-lg font-black text-neutral-200">{score}</span>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
            Cuenta Regresiva
          </span>
          <span className="text-lg font-black text-amber-400 animate-pulse">
            {timeLeft}s
          </span>
        </div>
      </div>
    </div>
  );
}
