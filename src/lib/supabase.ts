import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log environment variable status (not the actual values for security)
console.log('[Pulsero Debug] Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseAnonKey,
  urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'NOT SET',
  mode: import.meta.env.MODE,
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Auth features will be disabled.');
  console.warn('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!supabase;
