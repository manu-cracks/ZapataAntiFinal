'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, RefreshCw, Star } from 'lucide-react';
import { Nivel } from '@/types';
import { useGameEngine } from '@/hooks/useGameEngine';
import ExposurePhase from '@/components/game/exposure-phase';
import DistractorPhase from '@/components/game/distractor-phase';
import RecoveryPhase from '@/components/game/recovery-phase';
import EnergyBar from '@/components/ui/energy-bar';
import { supabase } from '@/lib/supabase';

interface GamePageProps {
  params: Promise<{ levelId: string }>;
}

export default function GamePage({ params }: GamePageProps) {
  const router = useRouter();
  const { levelId } = use(params);
  
  const [level, setLevel] = useState<Nivel | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);

  // 1. Fetch active level data
  useEffect(() => {
    async function fetchLevel() {
      try {
        const res = await fetch('/api/levels');
        const data = await res.json();
        if (data.success) {
          const currentLevel = data.levels.find((l: Nivel) => l.id === levelId);
          if (currentLevel) {
            setLevel(currentLevel);
          } else {
            console.error('Level not found in list');
          }
        }
      } catch (err) {
        console.error('Error fetching level:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLevel();
  }, [levelId]);

  // 2. Save completion progress in database
  const saveProgress = async (finalScore: number) => {
    setSavingProgress(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;

      if (currentUserId) {
        // Post completion to progress database (or local storage if fallback is needed)
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level_id: levelId,
            energy_score: finalScore,
            user_id: currentUserId,
          }),
        });
      } else {
        // Fallback: anonymous local progress
        const localProg = localStorage.getItem('guest_progress') || '{}';
        const progObj = JSON.parse(localProg);
        progObj[levelId] = finalScore;
        localStorage.setItem('guest_progress', JSON.stringify(progObj));
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleComplete = (finalScore: number) => {
    saveProgress(finalScore);
  };

  const {
    phase,
    timeLeft,
    neuralEnergy,
    isCompleted,
    wrongSelections,
    skipExposure,
    submitAnswer,
    reset,
  } = useGameEngine(level?.analogia?.respuesta_correcta || '', handleComplete);

  const handleBack = () => {
    router.push('/path');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-4 border-indigo-950 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
        </div>
        <p className="text-xs text-neutral-500 tracking-widest uppercase animate-pulse">
          Inicializando partida...
        </p>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <h2 className="text-xl font-bold text-neutral-200 mb-2">Error de Partida</h2>
        <p className="text-sm text-neutral-500 mb-6">No pudimos cargar la fórmula de este nivel.</p>
        <button
          onClick={handleBack}
          className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider"
        >
          Volver a la Ruta
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative pb-12 overflow-x-hidden">
      {/* Space gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black pointer-events-none" />

      {/* Header Container */}
      <header className="relative z-10 max-w-lg mx-auto px-6 pt-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center space-x-1.5 py-2 px-3.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-750 transition-all rounded-xl text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver</span>
        </button>

        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 border border-neutral-900 px-2 py-0.5 rounded-md">
          Nivel {level.orden_index}
        </span>
      </header>

      {/* Neural Energy Bar Displayed across the loop */}
      <div className="relative z-10 max-w-md mx-auto px-6 pt-6">
        <EnergyBar value={neuralEnergy} />
      </div>

      {/* Phase Container */}
      <div className="relative z-10 max-w-lg mx-auto">
        {phase === 'EXPOSURE' && (
          <ExposurePhase
            formula={level.formula_latex}
            timeLeft={timeLeft || 30}
            onSkip={skipExposure}
            titulo={level.titulo}
          />
        )}

        {phase === 'DISTRACTOR' && (
          <DistractorPhase timeLeft={timeLeft || 8} />
        )}

        {phase === 'RECOVERY' && (
          <RecoveryPhase
            analogy={level.analogia!}
            wrongSelections={wrongSelections}
            onSubmit={submitAnswer}
            isCompleted={isCompleted}
            neuralEnergy={neuralEnergy}
          />
        )}
      </div>

      {/* Successful Completion Overlay */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

          {/* Dialog Container */}
          <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl text-center space-y-6 text-white transform scale-100 transition-all duration-300">
            {/* Ambient gold glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-500/10 rounded-full filter blur-xl pointer-events-none" />

            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="h-8 w-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold tracking-tight">
                ¡Conexión Completada!
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Has superado con éxito la memoria de corto plazo y consolidado el conocimiento en tu memoria kinetic.
              </p>
            </div>

            {/* Neural energy score summary */}
            <div className="py-3 px-5 rounded-2xl bg-neutral-950 border border-neutral-850 flex justify-between items-center text-sm font-semibold">
              <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                Energía Final
              </span>
              <span className="text-emerald-400 font-black">{neuralEnergy}%</span>
            </div>

            <button
              onClick={handleBack}
              disabled={savingProgress}
              className="w-full py-4.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold transition-all duration-200 shadow-xl shadow-indigo-950/40 text-sm tracking-wide uppercase cursor-pointer flex items-center justify-center space-x-2"
            >
              {savingProgress ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Continuar a la Ruta</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
