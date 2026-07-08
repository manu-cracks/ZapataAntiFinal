import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Nivel, Analogia } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const canal = searchParams.get('channel');
  const userId = searchParams.get('userId');

  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    // Create client, dynamically authenticating it if token is provided to bypass RLS restrictions
    const clientOptions = token ? {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    } : {};

    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

    // 1. Fetch levels. Filter by channel if provided.
    let levelsQuery = userSupabase
      .from('niveles')
      .select('*')
      .order('orden_index', { ascending: true });

    if (canal) {
      levelsQuery = levelsQuery.eq('canal', canal);
    }

    const { data: dbLevels, error: levelsError } = await levelsQuery;
    if (levelsError) throw levelsError;

    // 2. Fetch analogies
    const { data: dbAnalogies, error: analogiesError } = await userSupabase
      .from('analogias')
      .select('*');
    if (analogiesError) throw analogiesError;

    // 3. Fetch user progress if userId is provided using the authenticated client
    let userProgressMap = new Map<string, number>();
    if (userId) {
      const { data: dbProgress, error: progressError } = await userSupabase
        .from('progreso_usuarios')
        .select('nivel_id, puntaje_energia')
        .eq('usuario_id', userId);

      if (!progressError && dbProgress) {
        dbProgress.forEach((p) => {
          userProgressMap.set(p.nivel_id, p.puntaje_energia);
        });
      }
    }

    // Map analogies to their levels
    const analogiesMap = new Map<string, Analogia>();
    if (dbAnalogies) {
      dbAnalogies.forEach((an) => {
        analogiesMap.set(an.nivel_id, {
          id: an.id,
          nivel_id: an.nivel_id,
          ruta_imagen: an.ruta_imagen,
          pregunta_texto: an.pregunta_texto,
          respuesta_correcta: an.respuesta_correcta,
          respuestas_incorrectas: an.respuestas_incorrectas,
          creado_at: an.creado_at,
        });
      });
    }

    // 4. Merge and process dynamic status unlocking
    const levels: Nivel[] = (dbLevels || []).map((lvl: any) => {
      const hasProgress = userProgressMap.has(lvl.id);
      const score = userProgressMap.get(lvl.id) ?? null;

      return {
        id: lvl.id,
        titulo: lvl.titulo,
        canal: lvl.canal,
        estado: lvl.estado,
        formula_latex: lvl.formula_latex,
        prerrequisito_id: lvl.prerrequisito_id,
        orden_index: lvl.orden_index,
        creado_at: lvl.creado_at,
        completado: hasProgress,
        puntaje_energia: score,
        analogia: analogiesMap.get(lvl.id) || null,
      };
    });

    // Run dynamic unlocking: if a level is 'locked' but its prerequisite is completed, set status to 'active'
    const unlockedLevels = levels.map((lvl) => {
      if (lvl.estado === 'locked' && lvl.prerrequisito_id) {
        // Find if prerequisite is completed in our fetched levels list
        const prereq = levels.find((l) => l.id === lvl.prerrequisito_id);
        if (prereq && prereq.completado) {
          return { ...lvl, estado: 'active' as const };
        }
      }
      return lvl;
    });

    return NextResponse.json({
      success: true,
      levels: unlockedLevels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
