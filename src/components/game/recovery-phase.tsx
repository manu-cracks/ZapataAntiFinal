'use client';

import React, { useMemo, useState } from 'react';
import { Brain, Heart, ArrowRight } from 'lucide-react';
import { Analogia } from '@/types';
import { supabase } from '@/lib/supabase';

interface RecoveryPhaseProps {
  analogy: Analogia;
  wrongSelections: string[];
  onSubmit: (selection: string) => void;
  isCompleted: boolean;
  neuralEnergy: number;
}

export default function RecoveryPhase({
  analogy,
  wrongSelections,
  onSubmit,
  isCompleted,
  neuralEnergy,
}: RecoveryPhaseProps) {
  const { pregunta_texto, respuesta_correcta, respuestas_incorrectas, ruta_imagen } = analogy;

  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(() => {
    if (!ruta_imagen || ruta_imagen === 'default.png') return null;
    if (ruta_imagen.startsWith('http://') || ruta_imagen.startsWith('https://')) {
      return ruta_imagen;
    }
    const { data } = supabase.storage.from('analogias-imagenes').getPublicUrl(ruta_imagen);
    return data?.publicUrl || null;
  }, [ruta_imagen]);

  // Shuffle options once and keep the order consistent
  const shuffledOptions = useMemo(() => {
    const allOptions = [respuesta_correcta, ...respuestas_incorrectas];
    // Simple deterministic-feeling shuffle or simple random sort
    return allOptions.sort(() => 0.5 - Math.random());
  }, [respuesta_correcta, respuestas_incorrectas]);

  return (
    <div className="flex flex-col items-center justify-between min-h-[75vh] w-full px-6 py-8 text-white relative z-10 select-none">
      {/* Header */}
      <div className="text-center space-y-2 mt-4">
        <div className="flex items-center justify-center space-x-2 text-emerald-400">
          <Brain className="h-5 w-5 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase">
            Fase 3: Recuperación Activa
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-100">
          Analogía Práctica
        </h2>
        <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto">
          La fórmula ha sido oculta. Aplica el concepto a esta situación práctica del mundo real.
        </p>
      </div>

      {/* Center Section: Analogy Display Card */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md my-6">
        <div className="w-full rounded-3xl bg-neutral-900/60 border border-neutral-800 p-6 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
          {/* Analogy Visual representation */}
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt="Analogía visual"
              onError={() => setImageError(true)}
              className="w-full h-auto object-contain max-h-48 rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-32 mb-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center relative overflow-hidden">
              {/* Subtle glow background */}
              <div className="absolute inset-0 bg-indigo-500/5 filter blur-md" />
              
              {/* Image Placeholder representing the dynamic asset */}
              <div className="relative z-10 flex flex-col items-center space-y-1">
                <span className="text-neutral-500 text-[10px] tracking-widest uppercase font-bold">
                  Visualización de Analogía
                </span>
                <span className="text-xs text-indigo-400 font-mono">
                  {ruta_imagen || 'Sin imagen'}
                </span>
              </div>
            </div>
          )}

          {/* Question Text */}
          <p className="text-sm sm:text-base text-neutral-200 font-light leading-relaxed mb-2 px-2">
            {pregunta_texto}
          </p>
        </div>
      </div>

      {/* Bottom Section: Multiple Choice Options (Bottom 1/3) */}
      <div className="w-full max-w-sm flex flex-col space-y-3 mb-4">
        <div className="grid grid-cols-1 gap-3">
          {shuffledOptions.map((option, idx) => {
            const isWrong = wrongSelections.includes(option);
            const isCorrectSelected = isCompleted && option === respuesta_correcta;

            let buttonStyle = 'border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700 hover:scale-101';
            let textStyle = 'text-neutral-300';

            if (isWrong) {
              buttonStyle = 'border-neutral-800/40 bg-neutral-950/20 opacity-30 cursor-not-allowed';
              textStyle = 'text-neutral-600 line-through';
            } else if (isCorrectSelected) {
              buttonStyle = 'border-emerald-500 bg-emerald-950/20 text-emerald-400 shadow-md shadow-emerald-500/10 cursor-default';
              textStyle = 'text-emerald-400 font-semibold';
            }

            return (
              <button
                key={idx}
                disabled={isWrong || isCompleted}
                onClick={() => onSubmit(option)}
                className={`w-full py-4 px-5 rounded-2xl border text-left text-sm tracking-wide transition-all duration-300 ease-out flex items-center justify-between cursor-pointer ${buttonStyle}`}
              >
                <span className={textStyle}>{option}</span>
                {isCorrectSelected && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
                    Correcto
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Growth-mindset Feedbacks */}
        <div className="text-center min-h-[20px] pt-1">
          {isCompleted ? (
            <p className="text-xs text-emerald-400 font-bold tracking-wide uppercase animate-pulse">
              ¡Conexión sináptica completada con éxito!
            </p>
          ) : wrongSelections.length > 0 ? (
            <p className="text-xs text-amber-400 italic">
              ¡Casi! Sigue intentando, tu cerebro se fortalece con cada intento.
            </p>
          ) : (
            <p className="text-xs text-neutral-500 italic">
              Elige la opción que mejor represente la fórmula
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
