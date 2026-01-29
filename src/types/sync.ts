/**
 * Sync Types - Defines all types for the Supabase data sync system
 * Inspired by Notion, Linear, and Todoist sync architectures
 */

import type { DayEntry, Goal, QuickNote, UserProfile, HabitState } from './index';

// ============================================================================
// SYNC STATUS TYPES
// ============================================================================

export type SyncStatus =
  | 'idle'           // No sync in progress
  | 'syncing'        // Currently syncing
  | 'synced'         // All data synced
  | 'offline'        // No network connection
  | 'error'          // Sync error occurred
  | 'conflict';      // Merge conflict detected

export type SyncDirection = 'push' | 'pull' | 'both';

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: Date | null;
  pendingChanges: number;
  error: string | null;
  isOnline: boolean;
  isSyncing: boolean;
}

// ============================================================================
// DATABASE TYPES (matching Supabase schema)
// ============================================================================

export interface DbProfile {
  id: string;
  email: string | null;
  name: string | null;
  birthday: string | null;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null;
  country: string | null;
  timezone: string | null;
  avatar: string | null;
  wellness_goals: string[] | null;
  notification_preferences: {
    dailyReminder: boolean;
    reminderTime?: string;
    weeklyInsights: boolean;
  } | null;
  tracked_feelings: string[] | null;
  is_premium: boolean;
  xp: number;
  first_entry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEntry {
  id: string;
  user_id: string;
  date: string;
  mood: number;
  emotions: string[];
  reflection: string;
  gratitude: string;
  activities: string[];
  feeling_levels: { name: string; value: number }[];
  created_at: string;
  updated_at: string;
}

export interface DbGoal {
  id: string;
  user_id: string;
  entry_id: string | null;
  text: string;
  completed: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface DbQuickNote {
  id: string;
  user_id: string;
  text: string;
  emoji: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface DbHabit {
  id: string;
  user_id: string;
  date: string;
  water_current: number;
  water_goal: number;
  water_completed: boolean;
  meditate_minutes: number;
  meditate_completed: boolean;
  sleep_hours: number;
  sleep_quality: 'poor' | 'okay' | 'great' | null;
  sleep_completed: boolean;
  detox_active: boolean;
  detox_start_time: string | null;
  detox_completed: boolean;
  detox_successful: boolean | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SYNC QUEUE TYPES
// ============================================================================

export type SyncOperation = 'create' | 'update' | 'delete';
export type SyncEntityType = 'profile' | 'entry' | 'goal' | 'quick_note' | 'habit';

export interface SyncQueueItem {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  data: unknown;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

// ============================================================================
// FULL SYNC DATA TYPES
// ============================================================================

export interface FullSyncData {
  profile: DbProfile | null;
  entries: DbEntry[];
  goals: DbGoal[];
  quick_notes: DbQuickNote[];
  habits: DbHabit[];
}

export interface SyncChanges {
  profile?: DbProfile;
  entries: DbEntry[];
  goals: DbGoal[];
  quick_notes: DbQuickNote[];
  habits: DbHabit[];
}

// ============================================================================
// CONVERSION HELPERS TYPES
// ============================================================================

export interface LocalToDbConverters {
  profileToDb: (profile: UserProfile, userId: string, xp: number, firstEntryDate?: string) => Partial<DbProfile>;
  entryToDb: (entry: DayEntry, userId: string) => Omit<DbEntry, 'created_at' | 'updated_at'>;
  goalToDb: (goal: Goal, userId: string, entryId: string | null, date: string) => Omit<DbGoal, 'created_at' | 'updated_at'>;
  quickNoteToDb: (note: QuickNote, userId: string) => Omit<DbQuickNote, 'created_at' | 'updated_at'>;
  habitToDb: (habit: HabitState, userId: string, date: string) => Omit<DbHabit, 'id' | 'created_at' | 'updated_at'>;
}

export interface DbToLocalConverters {
  dbToProfile: (db: DbProfile) => UserProfile;
  dbToEntry: (db: DbEntry, goals: DbGoal[]) => DayEntry;
  dbToGoal: (db: DbGoal) => Goal;
  dbToQuickNote: (db: DbQuickNote) => QuickNote;
  dbToHabit: (db: DbHabit) => HabitState;
}

// ============================================================================
// REALTIME SUBSCRIPTION TYPES
// ============================================================================

export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
}

export type RealtimeCallback<T> = (payload: RealtimePayload<T>) => void;

// ============================================================================
// SYNC SERVICE INTERFACE
// ============================================================================

export interface SyncService {
  // Core sync operations
  fullSync: () => Promise<FullSyncData | null>;
  pushChanges: () => Promise<boolean>;
  pullChanges: (since?: Date) => Promise<SyncChanges | null>;

  // Individual entity operations
  syncProfile: (profile: UserProfile, xp: number, firstEntryDate?: string) => Promise<boolean>;
  syncEntry: (entry: DayEntry) => Promise<boolean>;
  deleteEntry: (entryId: string) => Promise<boolean>;
  syncQuickNote: (note: QuickNote) => Promise<boolean>;
  deleteQuickNote: (noteId: string) => Promise<boolean>;
  syncHabits: (habits: HabitState, date: string) => Promise<boolean>;

  // Queue management
  addToQueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => void;
  processQueue: () => Promise<void>;
  getQueueSize: () => number;
  clearQueue: () => void;

  // Realtime subscriptions
  subscribeToChanges: (userId: string, callbacks: {
    onEntryChange?: RealtimeCallback<DbEntry>;
    onQuickNoteChange?: RealtimeCallback<DbQuickNote>;
    onProfileChange?: RealtimeCallback<DbProfile>;
    onHabitChange?: RealtimeCallback<DbHabit>;
  }) => () => void;

  // Status
  isOnline: () => boolean;
  getLastSyncTime: () => Date | null;
}

// Re-export HabitState for convenience
export type { HabitState } from './index';
