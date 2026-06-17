import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const IS_MOCK = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder') || (typeof window !== 'undefined' && sessionStorage.getItem('force_mock') === 'true');

if (!IS_MOCK && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set');
}


export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {}
    },
    accessToken: async () => {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('custom_jwt') ?? '';
      }
      return '';
    }
  }
);
