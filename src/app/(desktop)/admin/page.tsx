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

  // Dynamic channels/courses states
  const [channels, setChannels] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('aritmética');

  // New course modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseStatus, setNewCourseStatus] = useState<'active' | 'dx'>('active');
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseError, setCourseError] = useState<string | null>(null);

  // Load levels and channels
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch channels
      const { data: channelsData, error: channelsError } = await supabase
        .from('canales')
        .select('*')
        .order('creado_at', { ascending: true });

      if (channelsError) throw channelsError;
      setChannels(channelsData || []);

      // 2. Fetch levels with analogies joined
      const { data: levelsData, error: fetchError } = await supabase
        .from('niveles')
        .select(`
          *,
          analogia:analogias(*)
        `)
        .order('orden_index', { ascending: true });

      if (fetchError) throw fetchError;
      setLevels(levelsData || []);

      // Set activeTab to first channel if not set or not in the retrieved channels list
      if (channelsData && channelsData.length > 0) {
        if (!activeTab || !channelsData.some((c: any) => c.slug === activeTab)) {
          setActiveTab(channelsData[0].slug);
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error cargando datos de la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      loadData();
    } catch (err: any) {
      alert(`Error eliminando nivel: ${err.message}`);
    }
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingLevel(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingLevel(null);
  };

  const handleCreateNew = () => {
    setEditingLevel(null);
    setShowForm(true);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    setSavingCourse(true);
    setCourseError(null);
    try {
      const slug = newCourseName.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/\s+/g, '-') // spaces to hyphens
        .replace(/[^a-z0-9-]/g, ''); // keep alphanumeric and hyphens

      const { error: insertError } = await supabase
        .from('canales')
        .insert({
          nombre: newCourseName.trim(),
          slug,
          estado: newCourseStatus,
        });

      if (insertError) throw insertError;

      setNewCourseName('');
      setNewCourseStatus('active');
      setShowCourseModal(false);
      await loadData();

      // Auto select the newly created course tab
      setActiveTab(slug);
    } catch (err: any) {
      setCourseError(err.message || 'Error al guardar el curso');
    } finally {
      setSavingCourse(false);
    }
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

  const filteredLevels = levels.filter((lvl) => lvl.canal === activeTab);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white pb-20 w-full max-w-full overflow-x-hidden">
      {/* Space gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/15 via-black to-black pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-neutral-900 bg-neutral-950/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full max-w-full p-4">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-wider uppercase text-neutral-100">
              AntiGravity Admin
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-indigo-950/40 border border-indigo-500/20 rounded-md text-indigo-400">
              Database Console
            </span>
          </div>

          <div className="w-full sm:w-auto flex gap-2 justify-end items-center">
            <button
              onClick={() => router.push('/path')}
              className="flex items-center space-x-1.5 text-xs px-2.5 py-2 sm:text-sm sm:px-4 sm:py-2 rounded-xl border border-neutral-850 hover:bg-neutral-900 transition font-semibold text-neutral-400 hover:text-white cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              <span>
                <span className="hidden sm:inline">Ver App Móvil</span>
                <span className="inline sm:hidden">Ver App</span>
              </span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1.5 text-xs px-2.5 py-2 sm:text-sm sm:px-4 sm:py-2 rounded-xl border border-neutral-850 hover:bg-neutral-900 hover:border-red-950/40 hover:text-red-400 transition font-semibold text-neutral-400 cursor-pointer"
            >
              <span>
                <span className="hidden sm:inline">Cerrar Sesión Admin</span>
                <span className="inline sm:hidden">Salir</span>
              </span>
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
              channels={channels}
              defaultChannel={activeTab}
            />
          </div>
        ) : (
          /* Levels Table View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>

              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 transition-all rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer text-neutral-300 hover:text-white"
                >
                  <Plus className="h-4 w-4 text-indigo-400" />
                  <span>Crear Curso</span>
                </button>

                <button
                  onClick={handleCreateNew}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-950/30"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Nivel</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Dynamic Tabs Filter Bar */}
            <div className="flex border-b border-neutral-900 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
              {channels.map((chan) => (
                <button
                  key={chan.slug}
                  onClick={() => setActiveTab(chan.slug)}
                  className={`px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === chan.slug
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-950/5'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    }`}
                >
                  {chan.nombre}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-neutral-950/40 border border-neutral-900 rounded-3xl">
                <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                <p className="text-xs text-neutral-500 tracking-widest uppercase">
                  Conectando a Supabase...
                </p>
              </div>
            ) : filteredLevels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-950/40 border border-neutral-900 border-dashed rounded-3xl">
                <AlertCircle className="h-10 w-10 text-neutral-600 mb-2" />
                <h3 className="text-neutral-400 font-bold mb-1">Sin Niveles</h3>
                <p className="text-xs text-neutral-500">No se encontraron niveles en este curso.</p>
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
                      {filteredLevels.map((lvl) => (
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
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${lvl.estado === 'active'
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

      {/* Dynamic Create Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCourseModal(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-8 shadow-2xl space-y-6 text-white text-left animate-fade-in">
            <h3 className="text-base font-bold text-neutral-100 uppercase tracking-wider border-b border-neutral-800 pb-3">
              Crear Nuevo Curso
            </h3>

            {courseError && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <span>{courseError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Nombre del Curso</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Ej: Geometría"
                  className="px-4 py-2.5 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-neutral-400">Estado del Curso</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition text-[10px] font-bold uppercase tracking-wider text-center ${newCourseStatus === 'active'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-neutral-850 bg-neutral-950 text-neutral-500 hover:text-neutral-300'
                    }`}>
                    <input
                      type="radio"
                      name="courseStatus"
                      value="active"
                      checked={newCourseStatus === 'active'}
                      onChange={() => setNewCourseStatus('active')}
                      className="sr-only"
                    />
                    Activo
                  </label>

                  <label className={`flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition text-[10px] font-bold uppercase tracking-wider text-center ${newCourseStatus === 'dx'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-neutral-850 bg-neutral-950 text-neutral-500 hover:text-neutral-300'
                    }`}>
                    <input
                      type="radio"
                      name="courseStatus"
                      value="dx"
                      checked={newCourseStatus === 'dx'}
                      onChange={() => setNewCourseStatus('dx')}
                      className="sr-only"
                    />
                    En Desarrollo
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-450 hover:text-white hover:bg-neutral-800 transition text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  {savingCourse ? 'Guardando...' : 'Crear Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
