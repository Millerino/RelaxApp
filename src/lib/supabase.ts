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
  birthday: string | null;
  gender: string | null;
  country: string | null;
  timezone: string | null;
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

  // Use .update() since profile row already exists (created by signup trigger).
  // .upsert() can fail silently with certain RLS configurations.
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (updateError) {
    console.error('upsertProfile update failed:', updateError.message, updateError);
    // Fallback: try upsert in case row doesn't exist yet
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) {
      console.error('upsertProfile upsert fallback failed:', error.message, error);
      return false;
    }
  }
  return true;
}

// --- Subscription management ---

interface ManageSubscriptionResult {
  success?: boolean;
  error?: string;
  premium_until?: string;
  status?: string;
}

/** Cancel the user's Stripe subscription at end of billing period */
export async function cancelStripeSubscription(): Promise<ManageSubscriptionResult> {
  if (!supabase) return { error: 'Not configured' };
  const { data, error } = await supabase.functions.invoke('manage-subscription', {
    body: { action: 'cancel' },
  });
  if (error) return { error: error.message };
  return data;
}

/** Resume a canceled Stripe subscription (undo cancel) */
export async function resumeStripeSubscription(): Promise<ManageSubscriptionResult> {
  if (!supabase) return { error: 'Not configured' };
  const { data, error } = await supabase.functions.invoke('manage-subscription', {
    body: { action: 'resume' },
  });
  if (error) return { error: error.message };
  return data;
}
