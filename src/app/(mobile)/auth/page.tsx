'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSignUpSuccess(true);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user?.email === 'enzocostareyes@gmail.com') {
          router.push('/admin');
        } else {
          router.push('/path');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex items-center justify-center p-6 select-none">
      {/* Background space gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl space-y-6 transition-all duration-300">
        {/* Glowing decor */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-24 h-24 bg-indigo-500/10 rounded-full filter blur-xl pointer-events-none" />

        {signUpSuccess ? (
          /* Sign Up Success Verification Card */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-neutral-100">
                ¡Registro casi completado!
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Hemos enviado un enlace de verificación a tu bandeja de entrada. Por favor, revisa tu correo para activar tu cuenta de AntiGravity.
              </p>
            </div>

            <button
              onClick={() => {
                setSignUpSuccess(false);
                setIsSignUp(false);
                setEmail('');
                setPassword('');
              }}
              className="w-full py-3.5 rounded-xl border border-neutral-850 bg-neutral-950 hover:bg-neutral-900 transition-all duration-200 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Volver a Iniciar Sesión
            </button>
          </div>
        ) : (
          /* Default Sign In / Sign Up Form */
          <>
            {/* Logo and title */}
            <div className="text-center space-y-2">
              <span className="text-sm font-bold tracking-widest text-indigo-400 uppercase flex items-center justify-center space-x-1.5">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>AntiGravity Learn</span>
              </span>
              <h2 className="text-2xl font-black tracking-tight text-neutral-100">
                {isSignUp ? 'Crear Cuenta' : 'Ingresar'}
              </h2>
              <p className="text-xs text-neutral-500 font-light">
                {isSignUp
                  ? 'Regístrate para guardar tu progreso educativo en Supabase.'
                  : 'Inicia sesión para sincronizar tus avances kinetic.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center space-x-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl animate-shake">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alumno@antigravity.edu"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-850 focus:border-indigo-500 rounded-xl text-sm focus:outline-hidden text-white"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-850 focus:border-indigo-500 rounded-xl text-sm focus:outline-hidden text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold transition-all duration-200 shadow-xl shadow-indigo-950/40 text-xs tracking-wider uppercase cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                <span>{loading ? 'Procesando...' : isSignUp ? 'Registrar' : 'Entrar'}</span>
              </button>
            </form>

            {/* Toggle option */}
            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg(null);
                }}
                className="text-xs text-neutral-400 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
