import { createClient } from '@supabase/supabase-js';
import type { DayEntry, QuickNote } from '../types';

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
  xp: number | null;
  days_used: number | null;
  first_used_at: number | null;
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

// --- Entry sync helpers ---

interface SupabaseEntry {
  id: string;
  user_id: string;
  date: string;
  mood: number;
  emotions: string[];
  reflection: string;
  gratitude: string;
  goals: DayEntry['goals'];
  activities: string[];
  feeling_levels: DayEntry['feelingLevels'];
  created_at: number;
}

function entryToSupabase(userId: string, entry: DayEntry): SupabaseEntry {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    mood: entry.mood,
    emotions: entry.emotions,
    reflection: entry.reflection,
    gratitude: entry.gratitude,
    goals: entry.goals,
    activities: entry.activities || [],
    feeling_levels: entry.feelingLevels || [],
    created_at: entry.createdAt,
  };
}

function supabaseToEntry(row: SupabaseEntry): DayEntry {
  return {
    id: row.id,
    date: row.date,
    mood: row.mood as DayEntry['mood'],
    emotions: row.emotions || [],
    reflection: row.reflection || '',
    gratitude: row.gratitude || '',
    goals: (row.goals || []) as DayEntry['goals'],
    activities: row.activities || undefined,
    feelingLevels: (row.feeling_levels || undefined) as DayEntry['feelingLevels'],
    createdAt: row.created_at,
  };
}

/** Fetch all entries for a user from Supabase */
export async function fetchEntries(userId: string): Promise<DayEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('fetchEntries:', error.message);
    return [];
  }
  return (data || []).map(supabaseToEntry);
}

/** Upsert a single entry to Supabase */
export async function upsertEntry(userId: string, entry: DayEntry): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('entries')
    .upsert(entryToSupabase(userId, entry), { onConflict: 'user_id,id' });

  if (error) {
    console.warn('upsertEntry:', error.message);
    return false;
  }
  return true;
}

/** Upsert multiple entries to Supabase (for initial sync) */
export async function upsertEntries(userId: string, entries: DayEntry[]): Promise<boolean> {
  if (!supabase || entries.length === 0) return true;
  const { error } = await supabase
    .from('entries')
    .upsert(entries.map(e => entryToSupabase(userId, e)), { onConflict: 'user_id,id' });

  if (error) {
    console.warn('upsertEntries:', error.message);
    return false;
  }
  return true;
}

// --- Quick notes sync helpers ---

interface SupabaseQuickNote {
  id: string;
  user_id: string;
  text: string;
  emoji: string | null;
  date: string;
  created_at: number;
}

/** Fetch all quick notes for a user from Supabase */
export async function fetchQuickNotes(userId: string): Promise<QuickNote[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('quick_notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('fetchQuickNotes:', error.message);
    return [];
  }
  return (data || []).map((row: SupabaseQuickNote) => ({
    id: row.id,
    text: row.text,
    emoji: row.emoji || undefined,
    date: row.date,
    createdAt: row.created_at,
  }));
}

/** Upsert a single quick note to Supabase */
export async function upsertQuickNote(userId: string, note: QuickNote): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('quick_notes')
    .upsert({
      id: note.id,
      user_id: userId,
      text: note.text,
      emoji: note.emoji || null,
      date: note.date,
      created_at: note.createdAt,
    }, { onConflict: 'user_id,id' });

  if (error) {
    console.warn('upsertQuickNote:', error.message);
    return false;
  }
  return true;
}

/** Upsert multiple quick notes to Supabase (for initial sync) */
export async function upsertQuickNotes(userId: string, notes: QuickNote[]): Promise<boolean> {
  if (!supabase || notes.length === 0) return true;
  const { error } = await supabase
    .from('quick_notes')
    .upsert(notes.map(n => ({
      id: n.id,
      user_id: userId,
      text: n.text,
      emoji: n.emoji || null,
      date: n.date,
      created_at: n.createdAt,
    })), { onConflict: 'user_id,id' });

  if (error) {
    console.warn('upsertQuickNotes:', error.message);
    return false;
  }
  return true;
}

/** Delete a quick note from Supabase */
export async function deleteQuickNoteRemote(userId: string, noteId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('quick_notes')
    .delete()
    .eq('user_id', userId)
    .eq('id', noteId);

  if (error) {
    console.warn('deleteQuickNoteRemote:', error.message);
    return false;
  }
  return true;
}
