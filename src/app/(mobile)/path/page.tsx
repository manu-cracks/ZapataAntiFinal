'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Award, LogIn, User, LogOut } from 'lucide-react';
import { Nivel } from '@/types';
import ChannelColumn from '@/components/learning-path/channel-column';
import BottomSheet from '@/components/ui/bottom-sheet';
import { supabase } from '@/lib/supabase';

export default function PathPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedDxLevel, setSelectedDxLevel] = useState<Nivel | null>(null);
  const [cursoAbierto, setCursoAbierto] = useState<string | null>(null);

  // Load user session and fetch levels
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // Get current authenticated user if any
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;
      setUser(session?.user || null);

      try {
        // Fetch levels merging progress for this user
        const url = currentUserId ? `/api/levels?userId=${currentUserId}` : '/api/levels';
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          setLevels(data.levels);
        }
      } catch (err) {
        console.error('Error loading levels:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLevelClick = (id: string) => {
    router.push(`/game/${id}`);
  };

  const handleDxClick = (nivel: Nivel) => {
    setSelectedDxLevel(nivel);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/auth');
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  // Group levels by channel
  const aritmeticaLevels = levels.filter((l) => l.canal === 'aritmética');
  const algebraLevels = levels.filter((l) => l.canal === 'álgebra');
  const fisicaLevels = levels.filter((l) => l.canal === 'física');

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white pb-16 w-full max-w-full overflow-x-hidden">
      {/* Decorative Outer Space Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black pointer-events-none" />
      
      {/* Starry background animation effect */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-ping opacity-30" />
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-40" />
      <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-20" />

      {/* Top Header / Profile Bar */}
      <header className="relative z-10 max-w-5xl mx-auto flex items-center justify-between p-4 w-full border-b border-neutral-900">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-tighter bg-linear-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200 cursor-pointer">
            ANTIGRAVITY
          </span>
          <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-neutral-950 border border-neutral-850 rounded-md text-neutral-500">
            MVP
          </span>
        </div>

        {/* Profile Info / Auth Trigger */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-neutral-950 border border-neutral-800/80 rounded-2xl py-1.5 px-2.5 sm:px-3.5">
                <User className="h-4 w-4 text-indigo-400" />
                <span className="hidden sm:inline text-xs font-medium text-neutral-300 max-w-[120px] truncate">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:bg-red-900/20 hover:text-red-400 transition-colors font-semibold cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:block">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition-colors duration-250 rounded-xl text-xs font-semibold tracking-wide cursor-pointer shadow-lg shadow-indigo-950/30"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Ingresar</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Hero Header */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-neutral-100">
            Ruta de Aprendizaje
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed">
            Supera la gravedad de la memoria a corto plazo. Supera los niveles en los tres canales independientes para que las fórmulas matemáticas floten en tu mente.
          </p>
        </div>

        {loading ? (
          /* Premium Shimmer Loading State */
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-indigo-950 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
            </div>
            <p className="text-xs text-neutral-500 tracking-widest uppercase animate-pulse">
              Alineando órbitas...
            </p>
          </div>
        ) : (
          /* Responsive 3-Column Roadmap */
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:space-x-8 lg:space-x-12 space-y-16 md:space-y-0 px-4 w-full">
            <ChannelColumn
              titulo="Aritmética"
              levels={aritmeticaLevels}
              onLevelClick={handleLevelClick}
              onDxClick={handleDxClick}
              themeColor="indigo"
              isOpen={cursoAbierto === 'aritmética'}
              onToggle={() => setCursoAbierto(cursoAbierto === 'aritmética' ? null : 'aritmética')}
            />
            <ChannelColumn
              titulo="Álgebra"
              levels={algebraLevels}
              onLevelClick={handleLevelClick}
              onDxClick={handleDxClick}
              themeColor="emerald"
              isOpen={cursoAbierto === 'álgebra'}
              onToggle={() => setCursoAbierto(cursoAbierto === 'álgebra' ? null : 'álgebra')}
            />
            <ChannelColumn
              titulo="Física"
              levels={fisicaLevels}
              onLevelClick={handleLevelClick}
              onDxClick={handleDxClick}
              themeColor="sky"
              isOpen={cursoAbierto === 'física'}
              onToggle={() => setCursoAbierto(cursoAbierto === 'física' ? null : 'física')}
            />
          </div>
        )}
      </main>

      {/* Bottom Sheet for "dx" modules */}
      <BottomSheet
        isOpen={!!selectedDxLevel}
        onClose={() => setSelectedDxLevel(null)}
        title={selectedDxLevel ? `Módulo ${selectedDxLevel.titulo}` : undefined}
        description={
          selectedDxLevel
            ? `El nivel "${selectedDxLevel.titulo}" en el canal de ${selectedDxLevel.canal} está actualmente en desarrollo (dx). Nuestro equipo está calibrando los sensores gravitacionales para entregarte una experiencia cinematográfica de memorización.`
            : undefined
        }
      />
    </div>
  );
}
