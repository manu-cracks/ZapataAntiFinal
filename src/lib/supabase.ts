import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Database queries will fail.'
  );
}

const isProd = process.env.NODE_ENV === 'production';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    cookieOptions: {
      name: 'sb-session',
      domain: isProd ? 'zapata-anti-final.vercel.app' : 'localhost',
      path: '/',
      sameSite: 'lax',
      secure: isProd,
    },
  },
  cookieOptions: {
    name: 'sb-session',
    domain: isProd ? 'zapata-anti-final.vercel.app' : 'localhost',
    path: '/',
    sameSite: 'lax',
    secure: isProd,
  },
} as any);
