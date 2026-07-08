'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Nivel, CanalTipo, EstadoNivel } from '@/types';
import KatexPreview from './katex-preview';
import { Save, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LevelFormProps {
  levelToEdit?: Nivel | null;
  existingLevels: Nivel[];
  onSaveComplete: () => void;
  onCancel: () => void;
  channels?: any[];
  defaultChannel?: string;
}

export default function LevelForm({
  levelToEdit = null,
  existingLevels,
  onSaveComplete,
  onCancel,
  channels = [],
  defaultChannel,
}: LevelFormProps) {
  // 1. Form States
  const [titulo, setTitulo] = useState('');
  const [canal, setCanal] = useState<string>('');
  const [estado, setEstado] = useState<EstadoNivel>('locked');
  const [formulaLatex, setFormulaLatex] = useState('');
  const [prerrequisitoId, setPrerrequisitoId] = useState<string>('');
  const [ordenIndex, setOrdenIndex] = useState<number>(1);

  // Analogy fields
  const [rutaImagen, setRutaImagen] = useState('');
  const [preguntaTexto, setPreguntaTexto] = useState('');
  const [respuestaCorrecta, setRespuestaCorrecta] = useState('');
  const [wrong1, setWrong1] = useState('');
  const [wrong2, setWrong2] = useState('');
  const [wrong3, setWrong3] = useState('');

  // UI status states
  const [hasLaTeXError, setHasLaTeXError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas 2D'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Conversión a WebP fallida'));
              }
            },
            'image/webp',
            0.8
          );
        };
        img.onerror = () => {
          reject(new Error('Error al cargar la imagen'));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setErrorMsg(null);
    try {
      const webpBlob = await convertToWebP(file);
      const fileName = `analogia_${Date.now()}.webp`;
      
      const { data, error } = await supabase.storage
        .from('analogias-imagenes')
        .upload(fileName, webpBlob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (error) throw error;
      setRutaImagen(fileName);
    } catch (err: any) {
      setErrorMsg(`Error al subir imagen: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  // Load level data if in editing mode
  useEffect(() => {
    if (levelToEdit) {
      setTitulo(levelToEdit.titulo);
      setCanal(levelToEdit.canal);
      setEstado(levelToEdit.estado);
      setFormulaLatex(levelToEdit.formula_latex);
      setPrerrequisitoId(levelToEdit.prerrequisito_id || '');
      setOrdenIndex(levelToEdit.orden_index);

      if (levelToEdit.analogia) {
        setRutaImagen(levelToEdit.analogia.ruta_imagen);
        setPreguntaTexto(levelToEdit.analogia.pregunta_texto);
        setRespuestaCorrecta(levelToEdit.analogia.respuesta_correcta);
        const wrongs = levelToEdit.analogia.respuestas_incorrectas || [];
        setWrong1(wrongs[0] || '');
        setWrong2(wrongs[1] || '');
        setWrong3(wrongs[2] || '');
      } else {
        // clear analogy if missing
        setRutaImagen('');
        setPreguntaTexto('');
        setRespuestaCorrecta('');
        setWrong1('');
        setWrong2('');
        setWrong3('');
      }
    } else {
      // defaults
      setTitulo('');
      setCanal(defaultChannel || channels[0]?.slug || 'aritmética');
      setEstado('locked');
      setFormulaLatex('');
      setPrerrequisitoId('');
      setOrdenIndex(existingLevels.length + 1);
      setRutaImagen('');
      setPreguntaTexto('');
      setRespuestaCorrecta('');
      setWrong1('');
      setWrong2('');
      setWrong3('');
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [levelToEdit, existingLevels.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasLaTeXError) return;
    
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const levelData = {
      titulo,
      canal,
      estado,
      formula_latex: formulaLatex,
      prerrequisito_id: prerrequisitoId || null,
      orden_index: Number(ordenIndex),
    };

    try {
      let savedLevelId = levelToEdit?.id;

      if (levelToEdit) {
        // Edit Niveles
        const { error: editError } = await supabase
          .from('niveles')
          .update(levelData)
          .eq('id', levelToEdit.id);

        if (editError) throw editError;
      } else {
        // Create Niveles
        const { data: newLevel, error: insertError } = await supabase
          .from('niveles')
          .insert(levelData)
          .select('id')
          .single();

        if (insertError) throw insertError;
        savedLevelId = newLevel.id;
      }

      // Upsert Analogy
      const wrongAnswers = [wrong1.trim(), wrong2.trim(), wrong3.trim()];
      const analogyData = {
        nivel_id: savedLevelId,
        ruta_imagen: rutaImagen.trim() || 'default.png',
        pregunta_texto: preguntaTexto.trim(),
        respuesta_correcta: respuestaCorrecta.trim(),
        respuestas_incorrectas: wrongAnswers,
      };

      if (levelToEdit && levelToEdit.analogia) {
        // Update Analogy
        const { error: analogyError } = await supabase
          .from('analogias')
          .update(analogyData)
          .eq('nivel_id', levelToEdit.id);

        if (analogyError) throw analogyError;
      } else {
        // Create Analogy
        const { error: analogyError } = await supabase
          .from('analogias')
          .insert(analogyData);

        if (analogyError) throw analogyError;
      }

      setSuccessMsg('Nivel y Analogía guardados con éxito.');
      setTimeout(() => {
        onSaveComplete();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error guardando datos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-neutral-300">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-base font-bold uppercase tracking-wider text-neutral-100 border-b border-neutral-800 pb-3">
          {levelToEdit ? 'Editar Nivel' : 'Crear Nuevo Nivel'}
        </h3>

        {/* Status Messages */}
        {errorMsg && (
          <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. Core Level Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Título del Nivel</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Suma de Fracciones"
              className="px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div className="flex grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Canal</label>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                className="px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
              >
                {channels.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoNivel)}
                className="px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
              >
                <option value="active">Activo</option>
                <option value="locked">Bloqueado</option>
                <option value="dx">En Desarrollo (dx)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Prerequisite & Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Prerrequisito</label>
            <select
              value={prerrequisitoId}
              onChange={(e) => setPrerrequisitoId(e.target.value)}
              className="px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
            >
              <option value="">Ninguno (Primer Nivel)</option>
              {existingLevels
                .filter((l) => l.id !== levelToEdit?.id)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.canal.toUpperCase()} - {l.titulo}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Índice de Orden</label>
            <input
              type="number"
              min="0"
              required
              value={ordenIndex}
              onChange={(e) => setOrdenIndex(Number(e.target.value))}
              className="px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
            />
          </div>
        </div>

        {/* 3. LaTeX Formula & Real-time preview */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-neutral-400">
            Fórmula Matemática (Sintaxis LaTeX)
          </label>
          <textarea
            required
            rows={3}
            value={formulaLatex}
            onChange={(e) => setFormulaLatex(e.target.value)}
            placeholder="Ej: \frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd}"
            className="px-4 py-3 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white font-mono leading-relaxed"
          />
          {/* Katex validation Preview */}
          <div className="mt-1">
            <KatexPreview formula={formulaLatex} onValidationError={setHasLaTeXError} />
          </div>
        </div>

        {/* 4. Analogy Configuration */}
        <div className="border-t border-neutral-800 pt-6 space-y-4">
          <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
            Configuración de Analogía (Fase 3)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Pregunta de Analogía</label>
              <textarea
                required
                rows={2}
                value={preguntaTexto}
                onChange={(e) => setPreguntaTexto(e.target.value)}
                placeholder="Ej: Si tienes 1/2 de pizza..."
                className="px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Imagen de la Analogía</label>
              <div className="flex items-center space-x-3 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-950 file:text-indigo-400 hover:file:bg-indigo-900 cursor-pointer"
                />
                {uploadingFile && <span className="text-xs text-neutral-500 animate-pulse">Subiendo...</span>}
              </div>
              {rutaImagen && (
                <span className="text-[10px] text-emerald-400 font-mono mt-1">
                  Imagen cargada: {rutaImagen}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Respuesta Correcta</label>
              <input
                type="text"
                required
                value={respuestaCorrecta}
                onChange={(e) => setRespuestaCorrecta(e.target.value)}
                placeholder="Ej: 5/6"
                className="px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-400">Respuestas Incorrectas (3)</label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={wrong1}
                  onChange={(e) => setWrong1(e.target.value)}
                  placeholder="Incorrecta 1"
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
                />
                <input
                  type="text"
                  required
                  value={wrong2}
                  onChange={(e) => setWrong2(e.target.value)}
                  placeholder="Incorrecta 2"
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
                />
                <input
                  type="text"
                  required
                  value={wrong3}
                  onChange={(e) => setWrong3(e.target.value)}
                  placeholder="Incorrecta 3"
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-850 rounded-xl focus:outline-hidden focus:border-indigo-500 text-sm text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 border-t border-neutral-800 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition text-sm font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || hasLaTeXError}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-950/45"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{saving ? 'Guardando...' : 'Guardar Nivel'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
