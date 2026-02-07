import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Auth features will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!supabase;

// --- Profile helpers ---

export interface SupabaseProfile {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  is_premium: boolean;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  premium_until: string | null;
  created_at: string;
  updated_at: string;
}

/** Fetch the current user's profile from Supabase */
export async function fetchProfile(userId: string): Promise<SupabaseProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // Profile may not exist yet (table not created or user just signed up)
    console.warn('fetchProfile:', error.message);
    return null;
  }
  return data;
}

/** Create or update the user's profile in Supabase */
export async function upsertProfile(userId: string, fields: Partial<SupabaseProfile>): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    console.warn('upsertProfile:', error.message);
    return false;
  }
  return true;
}
