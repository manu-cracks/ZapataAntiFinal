import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level_id, energy_score, user_id } = body;

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    // Create a dynamic client with the user's JWT token to pass RLS checks
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

    // Securely verify session user asynchronously using getUser()
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    const activeUserId = user?.id || user_id;

    if (!activeUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: User session not found' },
        { status: 401 }
      );
    }

    // Save user progress in Supabase with the authenticated client
    const { error } = await userSupabase.from('progreso_usuarios').upsert(
      {
        usuario_id: activeUserId,
        nivel_id: level_id,
        puntaje_energia: Number(energy_score),
      },
      { onConflict: 'usuario_id,nivel_id' }
    );

    if (error) {
      console.error("Error crítico guardando progreso:", error.message, error.details, error.hint);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Progress recorded successfully',
    });
  } catch (error: any) {
    console.error('[SERVER PROGRESS API EXCEPTION]: Detailed error inserting progress in database:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
