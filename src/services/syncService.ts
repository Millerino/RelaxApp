/**
 * SyncService - Professional Supabase Data Sync
 *
 * Inspired by sync architectures from Notion, Linear, Todoist:
 * - Offline-first with optimistic updates
 * - Conflict resolution using last-write-wins with timestamps
 * - Exponential backoff retry for network failures
 * - Queue-based sync for offline changes
 * - Real-time subscriptions for instant cross-device sync
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  SyncQueueItem,
  FullSyncData,
  SyncChanges,
  DbProfile,
  DbEntry,
  DbGoal,
  DbQuickNote,
  DbHabit,
  RealtimeCallback,
  HabitState,
} from '../types/sync';
import type { DayEntry, Goal, QuickNote, UserProfile, WellnessGoal } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// CONSTANTS
// ============================================================================

const SYNC_QUEUE_KEY = 'relaxapp_sync_queue';
const LAST_SYNC_KEY = 'relaxapp_last_sync';
const MAX_RETRY_COUNT = 5;
const BASE_RETRY_DELAY = 1000; // 1 second

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate exponential backoff delay
 */
const getRetryDelay = (retryCount: number): number => {
  return Math.min(BASE_RETRY_DELAY * Math.pow(2, retryCount), 30000);
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if online
 */
const checkOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// ============================================================================
// CONVERSION FUNCTIONS: Local ↔ Database
// ============================================================================

/**
 * Convert local UserProfile to database format
 */
export const profileToDb = (
  profile: UserProfile,
  userId: string,
  xp: number,
  firstEntryDate?: string
): Partial<DbProfile> => ({
  id: userId,
  name: profile.name,
  birthday: profile.birthday || null,
  gender: profile.gender || null,
  country: profile.country || null,
  timezone: profile.timezone || null,
  avatar: profile.avatar || null,
  wellness_goals: profile.wellnessGoals || null,
  notification_preferences: profile.notificationPreferences || null,
  tracked_feelings: profile.trackedFeelings || null,
  xp,
  first_entry_date: firstEntryDate || null,
});

/**
 * Convert database profile to local UserProfile
 */
export const dbToProfile = (db: DbProfile): UserProfile => ({
  name: db.name || '',
  birthday: db.birthday || undefined,
  gender: db.gender || undefined,
  country: db.country || undefined,
  timezone: db.timezone || undefined,
  avatar: db.avatar || undefined,
  wellnessGoals: (db.wellness_goals as WellnessGoal[]) || undefined,
  notificationPreferences: db.notification_preferences || undefined,
  trackedFeelings: db.tracked_feelings || undefined,
  createdAt: new Date(db.created_at).getTime(),
});

/**
 * Convert local DayEntry to database format
 */
export const entryToDb = (
  entry: DayEntry,
  userId: string
): Omit<DbEntry, 'created_at' | 'updated_at'> => ({
  id: entry.id,
  user_id: userId,
  date: formatDateForDb(entry.date),
  mood: entry.mood,
  emotions: entry.emotions,
  reflection: entry.reflection,
  gratitude: entry.gratitude,
  activities: entry.activities || [],
  feeling_levels: entry.feelingLevels || [],
});

/**
 * Convert database entry to local DayEntry
 */
export const dbToEntry = (db: DbEntry, goals: DbGoal[]): DayEntry => ({
  id: db.id,
  date: new Date(db.date).toDateString(),
  mood: db.mood as 1 | 2 | 3 | 4 | 5,
  emotions: db.emotions,
  reflection: db.reflection,
  gratitude: db.gratitude,
  goals: goals.filter(g => g.entry_id === db.id).map(dbToGoal),
  activities: db.activities,
  feelingLevels: db.feeling_levels,
  createdAt: new Date(db.created_at).getTime(),
});

/**
 * Convert local Goal to database format
 */
export const goalToDb = (
  goal: Goal,
  userId: string,
  entryId: string | null,
  date: string
): Omit<DbGoal, 'created_at' | 'updated_at'> => ({
  id: goal.id,
  user_id: userId,
  entry_id: entryId,
  text: goal.text,
  completed: goal.completed,
  date: formatDateForDb(date),
});

/**
 * Convert database goal to local Goal
 */
export const dbToGoal = (db: DbGoal): Goal => ({
  id: db.id,
  text: db.text,
  completed: db.completed,
});

/**
 * Convert local QuickNote to database format
 */
export const quickNoteToDb = (
  note: QuickNote,
  userId: string
): Omit<DbQuickNote, 'created_at' | 'updated_at'> => ({
  id: note.id,
  user_id: userId,
  text: note.text,
  emoji: note.emoji || null,
  date: formatDateForDb(note.date),
});

/**
 * Convert database quick note to local QuickNote
 */
export const dbToQuickNote = (db: DbQuickNote): QuickNote => ({
  id: db.id,
  text: db.text,
  emoji: db.emoji || undefined,
  date: new Date(db.date).toDateString(),
  createdAt: new Date(db.created_at).getTime(),
});

/**
 * Convert local HabitState to database format
 */
export const habitToDb = (
  habit: HabitState,
  userId: string,
  date: string
): Omit<DbHabit, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  date: formatDateForDb(date),
  water_current: habit.water.current,
  water_goal: habit.water.goal,
  water_completed: habit.water.completed,
  meditate_minutes: habit.meditate.minutes,
  meditate_completed: habit.meditate.completed,
  sleep_hours: habit.sleep.hours,
  sleep_quality: habit.sleep.quality,
  sleep_completed: habit.sleep.completed,
  detox_active: habit.detox.active,
  detox_start_time: habit.detox.startTime ? new Date(habit.detox.startTime).toISOString() : null,
  detox_completed: habit.detox.completed,
  detox_successful: habit.detox.successful,
});

/**
 * Convert database habit to local HabitState
 */
export const dbToHabit = (db: DbHabit): HabitState => ({
  water: {
    current: db.water_current,
    goal: db.water_goal,
    completed: db.water_completed,
  },
  meditate: {
    minutes: db.meditate_minutes,
    completed: db.meditate_completed,
  },
  sleep: {
    hours: db.sleep_hours,
    quality: db.sleep_quality,
    completed: db.sleep_completed,
  },
  detox: {
    active: db.detox_active,
    startTime: db.detox_start_time ? new Date(db.detox_start_time).getTime() : null,
    completed: db.detox_completed,
    successful: db.detox_successful,
  },
});

/**
 * Format date string for database (YYYY-MM-DD)
 */
const formatDateForDb = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

// ============================================================================
// SYNC QUEUE MANAGEMENT
// ============================================================================

/**
 * Load sync queue from localStorage
 */
const loadQueue = (): SyncQueueItem[] => {
  try {
    const saved = localStorage.getItem(SYNC_QUEUE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * Save sync queue to localStorage
 */
const saveQueue = (queue: SyncQueueItem[]): void => {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Add item to sync queue
 */
export const addToQueue = (
  item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>
): void => {
  const queue = loadQueue();

  // Check for existing item with same entity
  const existingIndex = queue.findIndex(
    q => q.entityType === item.entityType && q.entityId === item.entityId
  );

  const newItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0,
  };

  if (existingIndex >= 0) {
    // Replace existing item (newer operation wins)
    queue[existingIndex] = newItem;
  } else {
    queue.push(newItem);
  }

  saveQueue(queue);
};

/**
 * Remove item from queue
 */
const removeFromQueue = (id: string): void => {
  const queue = loadQueue();
  saveQueue(queue.filter(q => q.id !== id));
};

/**
 * Update queue item
 */
const updateQueueItem = (id: string, updates: Partial<SyncQueueItem>): void => {
  const queue = loadQueue();
  const index = queue.findIndex(q => q.id === id);
  if (index >= 0) {
    queue[index] = { ...queue[index], ...updates };
    saveQueue(queue);
  }
};

/**
 * Get queue size
 */
export const getQueueSize = (): number => loadQueue().length;

/**
 * Clear entire queue
 */
export const clearQueue = (): void => {
  localStorage.removeItem(SYNC_QUEUE_KEY);
};

// ============================================================================
// LAST SYNC TIME
// ============================================================================

/**
 * Get last sync time
 */
export const getLastSyncTime = (): Date | null => {
  const saved = localStorage.getItem(LAST_SYNC_KEY);
  return saved ? new Date(saved) : null;
};

/**
 * Set last sync time
 */
const setLastSyncTime = (date: Date): void => {
  localStorage.setItem(LAST_SYNC_KEY, date.toISOString());
};

// ============================================================================
// CORE SYNC OPERATIONS
// ============================================================================

/**
 * Perform a full sync - pull all data from server
 */
export const fullSync = async (userId: string): Promise<FullSyncData | null> => {
  if (!supabase || !isSupabaseConfigured) {
    console.warn('[Sync] Supabase not configured');
    return null;
  }

  if (!checkOnline()) {
    console.warn('[Sync] Offline - cannot perform full sync');
    return null;
  }

  try {
    console.log('[Sync] Starting full sync for user:', userId);

    // Fetch all data in parallel
    const [profileResult, entriesResult, goalsResult, notesResult, habitsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('quick_notes').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('habits').select('*').eq('user_id', userId).order('date', { ascending: false }),
    ]);

    // Check for errors
    if (profileResult.error && profileResult.error.code !== 'PGRST116') {
      console.error('[Sync] Error fetching profile:', profileResult.error);
    }
    if (entriesResult.error) {
      console.error('[Sync] Error fetching entries:', entriesResult.error);
      throw entriesResult.error;
    }

    const result: FullSyncData = {
      profile: profileResult.data,
      entries: entriesResult.data || [],
      goals: goalsResult.data || [],
      quick_notes: notesResult.data || [],
      habits: habitsResult.data || [],
    };

    setLastSyncTime(new Date());
    console.log('[Sync] Full sync completed:', {
      entries: result.entries.length,
      goals: result.goals.length,
      notes: result.quick_notes.length,
      habits: result.habits.length,
    });

    return result;
  } catch (error) {
    console.error('[Sync] Full sync failed:', error);
    throw error;
  }
};

/**
 * Pull changes since last sync
 */
export const pullChanges = async (
  userId: string,
  since?: Date
): Promise<SyncChanges | null> => {
  if (!supabase || !isSupabaseConfigured || !checkOnline()) {
    return null;
  }

  const sinceDate = since || getLastSyncTime();
  if (!sinceDate) {
    // No last sync, do full sync
    const fullData = await fullSync(userId);
    return fullData ? {
      profile: fullData.profile || undefined,
      entries: fullData.entries,
      goals: fullData.goals,
      quick_notes: fullData.quick_notes,
      habits: fullData.habits,
    } : null;
  }

  try {
    const sinceIso = sinceDate.toISOString();

    const [profileResult, entriesResult, goalsResult, notesResult, habitsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).gt('updated_at', sinceIso).single(),
      supabase.from('entries').select('*').eq('user_id', userId).gt('updated_at', sinceIso),
      supabase.from('goals').select('*').eq('user_id', userId).gt('updated_at', sinceIso),
      supabase.from('quick_notes').select('*').eq('user_id', userId).gt('updated_at', sinceIso),
      supabase.from('habits').select('*').eq('user_id', userId).gt('updated_at', sinceIso),
    ]);

    setLastSyncTime(new Date());

    return {
      profile: profileResult.data || undefined,
      entries: entriesResult.data || [],
      goals: goalsResult.data || [],
      quick_notes: notesResult.data || [],
      habits: habitsResult.data || [],
    };
  } catch (error) {
    console.error('[Sync] Pull changes failed:', error);
    return null;
  }
};

// ============================================================================
// INDIVIDUAL ENTITY SYNC OPERATIONS
// ============================================================================

/**
 * Sync user profile to database
 */
export const syncProfile = async (
  userId: string,
  profile: UserProfile,
  xp: number,
  firstEntryDate?: string
): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured) return false;

  if (!checkOnline()) {
    addToQueue({
      entityType: 'profile',
      entityId: userId,
      operation: 'update',
      data: { profile, xp, firstEntryDate },
    });
    return false;
  }

  try {
    const dbProfile = profileToDb(profile, userId, xp, firstEntryDate);

    const { error } = await supabase
      .from('profiles')
      .upsert(dbProfile, { onConflict: 'id' });

    if (error) throw error;

    console.log('[Sync] Profile synced successfully');
    return true;
  } catch (error) {
    console.error('[Sync] Profile sync failed:', error);
    addToQueue({
      entityType: 'profile',
      entityId: userId,
      operation: 'update',
      data: { profile, xp, firstEntryDate },
    });
    return false;
  }
};

/**
 * Sync a day entry to database
 */
export const syncEntry = async (
  userId: string,
  entry: DayEntry
): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured) return false;

  if (!checkOnline()) {
    addToQueue({
      entityType: 'entry',
      entityId: entry.id,
      operation: 'update',
      data: entry,
    });
    return false;
  }

  try {
    const dbEntry = entryToDb(entry, userId);

    // Upsert entry
    const { error: entryError } = await supabase
      .from('entries')
      .upsert(dbEntry, { onConflict: 'id' });

    if (entryError) throw entryError;

    // Sync goals for this entry
    if (entry.goals && entry.goals.length > 0) {
      const dbGoals = entry.goals.map(g => goalToDb(g, userId, entry.id, entry.date));

      // Delete existing goals for this entry first
      await supabase
        .from('goals')
        .delete()
        .eq('entry_id', entry.id);

      // Insert new goals
      const { error: goalsError } = await supabase
        .from('goals')
        .insert(dbGoals);

      if (goalsError) throw goalsError;
    }

    console.log('[Sync] Entry synced successfully:', entry.id);
    return true;
  } catch (error) {
    console.error('[Sync] Entry sync failed:', error);
    addToQueue({
      entityType: 'entry',
      entityId: entry.id,
      operation: 'update',
      data: entry,
    });
    return false;
  }
};

/**
 * Delete an entry from database
 */
export const deleteEntry = async (
  userId: string,
  entryId: string
): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured) return false;

  if (!checkOnline()) {
    addToQueue({
      entityType: 'entry',
      entityId: entryId,
      operation: 'delete',
      data: null,
    });
    return false;
  }

  try {
    // Goals will be deleted via CASCADE
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) throw error;

    console.log('[Sync] Entry deleted successfully:', entryId);
    return true;
  } catch (error) {
    console.error('[Sync] Entry delete failed:', error);
    addToQueue({
      entityType: 'entry',
      entityId: entryId,
      operation: 'delete',
      data: null,
    });
    return false;
  }
};

/**
 * Sync a quick note to database
 */
export const syncQuickNote = async (
  userId: string,
  note: QuickNote
): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured) return false;

  if (!checkOnline()) {
    addToQueue({
      entityType: 'quick_note',
      entityId: note.id,
      operation: 'update',
      data: note,
    });
    return false;
  }

  try {
    const dbNote = quickNoteToDb(note, userId);

    const { error } = await supabase
      .from('quick_notes')
      .upsert(dbNote, { onConflict: 'id' });

    if (error) throw error;

    console.log('[Sync] Quick note synced successfully:', note.id);
    return true;
  } catch (error) {
    console.error('[Sync] Quick note sync failed:', error);
    addToQueue({
      entityType: 'quick_note',
      entityId: note.id,
      operation: 'update',
      data: note,
    });
    return false;
  }
};

/**
 * Delete a quick note from database
 */
export const deleteQuickNote = async (
  userId: string,
  noteId: string
): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured) return false;

  if (!checkOnline()) {
    addToQueue({
      entityType: 'quick_note',
      entityId: noteId,
      operation: 'delete',
      data: null,
    });
    return false;
  }

  try {
    const { error } = await supabase
      .from('quick_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) throw error;

    console.log('[Sync] Quick note deleted successfully:', noteId);
    return true;
  } catch (error) {
    console.error('[Sync] Quick note delete failed:', error);
    addToQueue({
      entityType: 'quick_note',
      entityId: noteId,
      operation: 'delete',
      data: null,
    });
    return false;
  }
};

/**
 * Sync habits to database
 */
export const syncHabits = async (
  userId: string,
  habits: HabitState,
  date: string
): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured) return false;

  if (!checkOnline()) {
    addToQueue({
      entityType: 'habit',
      entityId: date,
      operation: 'update',
      data: { habits, date },
    });
    return false;
  }

  try {
    const dbHabit = habitToDb(habits, userId, date);
    const formattedDate = formatDateForDb(date);

    // Check if habit record exists for today
    const { data: existing } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .eq('date', formattedDate)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('habits')
        .update(dbHabit)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('habits')
        .insert(dbHabit);
      if (error) throw error;
    }

    console.log('[Sync] Habits synced successfully for:', date);
    return true;
  } catch (error) {
    console.error('[Sync] Habits sync failed:', error);
    addToQueue({
      entityType: 'habit',
      entityId: date,
      operation: 'update',
      data: { habits, date },
    });
    return false;
  }
};

// ============================================================================
// QUEUE PROCESSING
// ============================================================================

/**
 * Process sync queue with exponential backoff
 */
export const processQueue = async (userId: string): Promise<void> => {
  if (!supabase || !isSupabaseConfigured || !checkOnline()) {
    return;
  }

  const queue = loadQueue();
  if (queue.length === 0) return;

  console.log('[Sync] Processing queue with', queue.length, 'items');

  for (const item of queue) {
    if (item.retryCount >= MAX_RETRY_COUNT) {
      console.error('[Sync] Max retries reached for:', item);
      removeFromQueue(item.id);
      continue;
    }

    try {
      let success = false;

      switch (item.entityType) {
        case 'profile': {
          const { profile, xp, firstEntryDate } = item.data as {
            profile: UserProfile;
            xp: number;
            firstEntryDate?: string;
          };
          success = await syncProfileDirect(userId, profile, xp, firstEntryDate);
          break;
        }
        case 'entry': {
          if (item.operation === 'delete') {
            success = await deleteEntryDirect(userId, item.entityId);
          } else {
            success = await syncEntryDirect(userId, item.data as DayEntry);
          }
          break;
        }
        case 'quick_note': {
          if (item.operation === 'delete') {
            success = await deleteQuickNoteDirect(userId, item.entityId);
          } else {
            success = await syncQuickNoteDirect(userId, item.data as QuickNote);
          }
          break;
        }
        case 'habit': {
          const { habits, date } = item.data as { habits: HabitState; date: string };
          success = await syncHabitsDirect(userId, habits, date);
          break;
        }
      }

      if (success) {
        removeFromQueue(item.id);
      } else {
        throw new Error('Sync operation returned false');
      }
    } catch (error) {
      console.error('[Sync] Queue item failed:', error);
      updateQueueItem(item.id, {
        retryCount: item.retryCount + 1,
        lastError: String(error),
      });

      // Exponential backoff
      await sleep(getRetryDelay(item.retryCount));
    }
  }
};

// Direct sync functions (without queue fallback, for queue processing)
const syncProfileDirect = async (
  userId: string,
  profile: UserProfile,
  xp: number,
  firstEntryDate?: string
): Promise<boolean> => {
  if (!supabase) return false;
  const dbProfile = profileToDb(profile, userId, xp, firstEntryDate);
  const { error } = await supabase.from('profiles').upsert(dbProfile, { onConflict: 'id' });
  return !error;
};

const syncEntryDirect = async (userId: string, entry: DayEntry): Promise<boolean> => {
  if (!supabase) return false;
  const dbEntry = entryToDb(entry, userId);
  const { error } = await supabase.from('entries').upsert(dbEntry, { onConflict: 'id' });
  if (error) return false;

  // Sync goals
  if (entry.goals && entry.goals.length > 0) {
    const dbGoals = entry.goals.map(g => goalToDb(g, userId, entry.id, entry.date));
    await supabase.from('goals').delete().eq('entry_id', entry.id);
    const { error: goalsError } = await supabase.from('goals').insert(dbGoals);
    if (goalsError) return false;
  }
  return true;
};

const deleteEntryDirect = async (userId: string, entryId: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase.from('entries').delete().eq('id', entryId).eq('user_id', userId);
  return !error;
};

const syncQuickNoteDirect = async (userId: string, note: QuickNote): Promise<boolean> => {
  if (!supabase) return false;
  const dbNote = quickNoteToDb(note, userId);
  const { error } = await supabase.from('quick_notes').upsert(dbNote, { onConflict: 'id' });
  return !error;
};

const deleteQuickNoteDirect = async (userId: string, noteId: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase.from('quick_notes').delete().eq('id', noteId).eq('user_id', userId);
  return !error;
};

const syncHabitsDirect = async (
  userId: string,
  habits: HabitState,
  date: string
): Promise<boolean> => {
  if (!supabase) return false;
  const dbHabit = habitToDb(habits, userId, date);
  const formattedDate = formatDateForDb(date);

  const { data: existing } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('date', formattedDate)
    .single();

  if (existing) {
    const { error } = await supabase.from('habits').update(dbHabit).eq('id', existing.id);
    return !error;
  } else {
    const { error } = await supabase.from('habits').insert(dbHabit);
    return !error;
  }
};

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to realtime changes for cross-device sync
 */
export const subscribeToChanges = (
  userId: string,
  callbacks: {
    onEntryChange?: RealtimeCallback<DbEntry>;
    onQuickNoteChange?: RealtimeCallback<DbQuickNote>;
    onProfileChange?: RealtimeCallback<DbProfile>;
    onHabitChange?: RealtimeCallback<DbHabit>;
  }
): (() => void) => {
  if (!supabase || !isSupabaseConfigured) {
    return () => {};
  }

  const channels: RealtimeChannel[] = [];

  // Subscribe to entries changes
  if (callbacks.onEntryChange) {
    const entriesChannel = supabase
      .channel(`entries:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entries',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Realtime] Entry change:', payload.eventType);
          callbacks.onEntryChange!({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as DbEntry | null,
            old: payload.old as DbEntry | null,
          });
        }
      )
      .subscribe();
    channels.push(entriesChannel);
  }

  // Subscribe to quick notes changes
  if (callbacks.onQuickNoteChange) {
    const notesChannel = supabase
      .channel(`quick_notes:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quick_notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Realtime] Quick note change:', payload.eventType);
          callbacks.onQuickNoteChange!({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as DbQuickNote | null,
            old: payload.old as DbQuickNote | null,
          });
        }
      )
      .subscribe();
    channels.push(notesChannel);
  }

  // Subscribe to profile changes
  if (callbacks.onProfileChange) {
    const profileChannel = supabase
      .channel(`profiles:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Realtime] Profile change:', payload.eventType);
          callbacks.onProfileChange!({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as DbProfile | null,
            old: payload.old as DbProfile | null,
          });
        }
      )
      .subscribe();
    channels.push(profileChannel);
  }

  // Subscribe to habits changes
  if (callbacks.onHabitChange) {
    const habitsChannel = supabase
      .channel(`habits:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Realtime] Habit change:', payload.eventType);
          callbacks.onHabitChange!({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as DbHabit | null,
            old: payload.old as DbHabit | null,
          });
        }
      )
      .subscribe();
    channels.push(habitsChannel);
  }

  console.log('[Realtime] Subscribed to', channels.length, 'channels for user:', userId);

  // Return cleanup function
  return () => {
    channels.forEach(channel => {
      supabase?.removeChannel(channel);
    });
    console.log('[Realtime] Unsubscribed from all channels');
  };
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const syncService = {
  // Core operations
  fullSync,
  pullChanges,

  // Entity sync
  syncProfile,
  syncEntry,
  deleteEntry,
  syncQuickNote,
  deleteQuickNote,
  syncHabits,

  // Queue management
  addToQueue,
  processQueue,
  getQueueSize,
  clearQueue,

  // Realtime
  subscribeToChanges,

  // Utils
  getLastSyncTime,
  isOnline: checkOnline,

  // Converters (exposed for context use)
  dbToProfile,
  dbToEntry,
  dbToQuickNote,
  dbToHabit,
};

export default syncService;
