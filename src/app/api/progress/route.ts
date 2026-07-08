import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level_id, energy_score, user_id } = body;

    // Get session user
    const { data: { session } } = await supabase.auth.getSession();
    const activeUserId = user_id || session?.user?.id;

    if (!activeUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: User session not found' },
        { status: 401 }
      );
    }

    // Save user progress in Supabase
    const { error } = await supabase.from('progreso_usuarios').upsert(
      {
        usuario_id: activeUserId,
        nivel_id: level_id,
        puntaje_energia: Number(energy_score),
      },
      { onConflict: 'usuario_id,nivel_id' }
    );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Progress recorded successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
