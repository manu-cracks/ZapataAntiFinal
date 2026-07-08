'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Nivel } from '@/types';
import LevelForm from '@/components/admin/level-form';
import KatexRenderer from '@/components/ui/katex-renderer';
import { Plus, Edit2, Trash2, Home, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form toggles
  const [showForm, setShowForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Nivel | null>(null);

  // Load levels with analogies joined
  const loadLevels = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('niveles')
        .select(`
          *,
          analogia:analogias(*)
        `)
        .order('orden_index', { ascending: true });

      if (fetchError) throw fetchError;
      setLevels(data || []);
    } catch (err: any) {
      console.error('Error fetching levels:', err);
      setError(err.message || 'Error cargando niveles de base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevels();
  }, []);

  const handleEdit = (level: Nivel) => {
    setEditingLevel(level);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este nivel? Esta acción también eliminará la analogía vinculada.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('niveles')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      loadLevels();
    } catch (err: any) {
      alert(`Error eliminando nivel: ${err.message}`);
    }
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingLevel(null);
    loadLevels();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingLevel(null);
  };

  const handleCreateNew = () => {
    setEditingLevel(null);
    setShowForm(true);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth');
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white pb-20">
      {/* Space gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/15 via-black to-black pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-neutral-900 bg-neutral-950/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-wider uppercase text-neutral-100">
              AntiGravity Admin
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-indigo-950/40 border border-indigo-500/20 rounded-md text-indigo-400">
              Database Console
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/path')}
              className="flex items-center space-x-1.5 py-2 px-4 rounded-xl border border-neutral-850 hover:bg-neutral-900 transition text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Ver App Móvil</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1.5 py-2 px-4 rounded-xl border border-neutral-850 hover:bg-neutral-900 hover:border-red-950/40 hover:text-red-400 transition text-xs font-semibold text-neutral-400 cursor-pointer"
            >
              <span>Cerrar Sesión Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Console Workspace */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-12">
        {showForm ? (
          /* Form Component */
          <div className="max-w-3xl mx-auto">
            <LevelForm
              levelToEdit={editingLevel}
              existingLevels={levels}
              onSaveComplete={handleFormComplete}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          /* Levels Table View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-100">Niveles Registrados</h2>
                <p className="text-xs text-neutral-500">
                  Visualiza, edita y agrega nuevos módulos de estudio en la base de datos de Supabase.
                </p>
              </div>

              <button
                onClick={handleCreateNew}
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-950/30"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Nivel</span>
              </button>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-neutral-950/40 border border-neutral-900 rounded-3xl">
                <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                <p className="text-xs text-neutral-500 tracking-widest uppercase">
                  Conectando a Supabase...
                </p>
              </div>
            ) : levels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-950/40 border border-neutral-900 border-dashed rounded-3xl">
                <AlertCircle className="h-10 w-10 text-neutral-600 mb-2" />
                <h3 className="text-neutral-400 font-bold mb-1">Sin Niveles</h3>
                <p className="text-xs text-neutral-500">No se encontraron niveles en la base de datos.</p>
              </div>
            ) : (
              /* Database Table */
              <div className="overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/50 backdrop-blur-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-neutral-400 border-collapse">
                    <thead className="bg-neutral-950 border-b border-neutral-900 text-xs uppercase font-bold tracking-wider text-neutral-500">
                      <tr>
                        <th className="px-6 py-4">Orden</th>
                        <th className="px-6 py-4">Título</th>
                        <th className="px-6 py-4">Canal</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4">Fórmula LaTeX (KaTeX)</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {levels.map((lvl) => (
                        <tr key={lvl.id} className="hover:bg-neutral-900/40 transition-colors">
                          <td className="px-6 py-4 font-mono text-neutral-300">
                            {lvl.orden_index}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-neutral-200">{lvl.titulo}</span>
                              {lvl.analogia ? (
                                <span className="text-[10px] text-indigo-400 max-w-[200px] truncate">
                                  Analogía: {lvl.analogia.pregunta_texto}
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-500/80 italic">
                                  Sin analogía configurada
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize font-medium">{lvl.canal}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                lvl.estado === 'active'
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                  : lvl.estado === 'dx'
                                  ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                  : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                              }`}
                            >
                              {lvl.estado === 'active' ? 'Activo' : lvl.estado === 'dx' ? 'Desarrollo' : 'Bloqueado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-[240px]">
                            <div className="flex flex-col space-y-1">
                              <code className="text-xs bg-neutral-950/60 p-1.5 rounded-lg border border-neutral-900 text-neutral-500 overflow-x-auto whitespace-nowrap scrollbar-thin">
                                {lvl.formula_latex}
                              </code>
                              <div className="scale-90 origin-left max-h-[30px] overflow-hidden">
                                <KatexRenderer formula={lvl.formula_latex} displayMode={false} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(lvl)}
                                className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 hover:border-neutral-700 text-neutral-400 hover:text-white transition duration-200 cursor-pointer"
                                title="Editar nivel"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(lvl.id)}
                                className="p-2 rounded-lg bg-neutral-900 hover:bg-red-950/40 border border-neutral-850 hover:border-red-900/40 text-neutral-400 hover:text-red-400 transition duration-200 cursor-pointer"
                                title="Eliminar nivel"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
