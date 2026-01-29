/**
 * SyncContext - Global Sync State Management
 *
 * Provides app-wide sync state, triggers, and real-time updates.
 * Integrates with AppContext and AuthContext for seamless data sync.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  syncService,
  dbToProfile,
  dbToEntry,
  dbToQuickNote,
  dbToHabit,
} from '../services/syncService';
import type {
  SyncState,
  SyncStatus,
  FullSyncData,
  DbGoal,
} from '../types/sync';
import type { DayEntry, QuickNote, UserProfile, HabitState } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface SyncContextType {
  // State
  syncState: SyncState;
  isSupabaseReady: boolean;

  // Sync operations
  triggerFullSync: () => Promise<void>;
  triggerPullSync: () => Promise<void>;
  syncNow: () => Promise<void>;

  // Data from last sync (for merging with local)
  lastSyncData: FullSyncData | null;

  // Callbacks for realtime updates
  onRemoteEntryChange: (entry: DayEntry, action: 'upsert' | 'delete') => void;
  onRemoteNoteChange: (note: QuickNote, action: 'upsert' | 'delete') => void;
  onRemoteProfileChange: (profile: UserProfile, xp: number, isPremium: boolean, firstEntryDate?: string) => void;
  onRemoteHabitChange: (habits: HabitState, date: string) => void;

  // Register callbacks from AppContext
  registerEntryCallback: (cb: (entry: DayEntry, action: 'upsert' | 'delete') => void) => void;
  registerNoteCallback: (cb: (note: QuickNote, action: 'upsert' | 'delete') => void) => void;
  registerProfileCallback: (cb: (profile: UserProfile, xp: number, isPremium: boolean, firstEntryDate?: string) => void) => void;
  registerHabitCallback: (cb: (habits: HabitState, date: string) => void) => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Sync state
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSyncAt: syncService.getLastSyncTime(),
    pendingChanges: syncService.getQueueSize(),
    error: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
  });

  const [lastSyncData, setLastSyncData] = useState<FullSyncData | null>(null);

  // Callback refs for AppContext to register
  const entryCallbackRef = useRef<((entry: DayEntry, action: 'upsert' | 'delete') => void) | null>(null);
  const noteCallbackRef = useRef<((note: QuickNote, action: 'upsert' | 'delete') => void) | null>(null);
  const profileCallbackRef = useRef<((profile: UserProfile, xp: number, isPremium: boolean, firstEntryDate?: string) => void) | null>(null);
  const habitCallbackRef = useRef<((habits: HabitState, date: string) => void) | null>(null);

  // Unsubscribe ref for realtime
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Goals cache for entry conversion
  const goalsCache = useRef<DbGoal[]>([]);

  // ============================================================================
  // SYNC STATUS HELPERS
  // ============================================================================

  const setStatus = useCallback((status: SyncStatus, error?: string) => {
    setSyncState(prev => ({
      ...prev,
      status,
      error: error || null,
      isSyncing: status === 'syncing',
      lastSyncAt: status === 'synced' ? new Date() : prev.lastSyncAt,
      pendingChanges: syncService.getQueueSize(),
    }));
  }, []);

  // ============================================================================
  // ONLINE/OFFLINE DETECTION
  // ============================================================================

  useEffect(() => {
    const handleOnline = () => {
      setSyncState(prev => ({ ...prev, isOnline: true, status: 'idle' }));
      // Process queue when coming back online
      if (user) {
        syncService.processQueue(user.id);
      }
    };

    const handleOffline = () => {
      setSyncState(prev => ({ ...prev, isOnline: false, status: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // ============================================================================
  // FULL SYNC
  // ============================================================================

  const triggerFullSync = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      console.log('[SyncContext] Cannot sync - no user or Supabase not configured');
      return;
    }

    if (!syncState.isOnline) {
      setStatus('offline');
      return;
    }

    try {
      setStatus('syncing');
      console.log('[SyncContext] Starting full sync...');

      const data = await syncService.fullSync(user.id);

      if (data) {
        setLastSyncData(data);
        goalsCache.current = data.goals;
        setStatus('synced');
        console.log('[SyncContext] Full sync completed successfully');
      } else {
        setStatus('error', 'Failed to fetch data from server');
      }
    } catch (error) {
      console.error('[SyncContext] Full sync failed:', error);
      setStatus('error', String(error));
    }
  }, [user, syncState.isOnline, setStatus]);

  // ============================================================================
  // PULL SYNC (incremental)
  // ============================================================================

  const triggerPullSync = useCallback(async () => {
    if (!user || !isSupabaseConfigured || !syncState.isOnline) {
      return;
    }

    try {
      setStatus('syncing');
      const changes = await syncService.pullChanges(user.id);

      if (changes) {
        // Update goals cache
        if (changes.goals.length > 0) {
          goalsCache.current = [
            ...goalsCache.current.filter(g => !changes.goals.find(cg => cg.id === g.id)),
            ...changes.goals,
          ];
        }
        setStatus('synced');
      }
    } catch (error) {
      console.error('[SyncContext] Pull sync failed:', error);
      setStatus('error', String(error));
    }
  }, [user, syncState.isOnline, setStatus]);

  // ============================================================================
  // SYNC NOW (process queue + pull)
  // ============================================================================

  const syncNow = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return;

    // First process any pending changes
    await syncService.processQueue(user.id);
    setSyncState(prev => ({ ...prev, pendingChanges: syncService.getQueueSize() }));

    // Then pull any remote changes
    await triggerPullSync();
  }, [user, triggerPullSync]);

  // ============================================================================
  // REALTIME SUBSCRIPTIONS
  // ============================================================================

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      // Cleanup existing subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    // Subscribe to realtime changes
    const unsubscribe = syncService.subscribeToChanges(user.id, {
      onEntryChange: (payload) => {
        if (payload.eventType === 'DELETE' && payload.old) {
          const oldEntry = dbToEntry(payload.old, goalsCache.current);
          entryCallbackRef.current?.(oldEntry, 'delete');
        } else if (payload.new) {
          const newEntry = dbToEntry(payload.new, goalsCache.current);
          entryCallbackRef.current?.(newEntry, 'upsert');
        }
      },
      onQuickNoteChange: (payload) => {
        if (payload.eventType === 'DELETE' && payload.old) {
          const oldNote = dbToQuickNote(payload.old);
          noteCallbackRef.current?.(oldNote, 'delete');
        } else if (payload.new) {
          const newNote = dbToQuickNote(payload.new);
          noteCallbackRef.current?.(newNote, 'upsert');
        }
      },
      onProfileChange: (payload) => {
        if (payload.new) {
          const profile = dbToProfile(payload.new);
          profileCallbackRef.current?.(
            profile,
            payload.new.xp,
            payload.new.is_premium,
            payload.new.first_entry_date || undefined
          );
        }
      },
      onHabitChange: (payload) => {
        if (payload.new) {
          const habits = dbToHabit(payload.new);
          habitCallbackRef.current?.(habits, payload.new.date);
        }
      },
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount or user change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user]);

  // ============================================================================
  // INITIAL SYNC ON LOGIN
  // ============================================================================

  useEffect(() => {
    if (user && isSupabaseConfigured) {
      // Trigger full sync when user logs in
      triggerFullSync();
    }
  }, [user]); // Intentionally only depend on user

  // ============================================================================
  // PERIODIC SYNC (every 5 minutes when online)
  // ============================================================================

  useEffect(() => {
    if (!user || !isSupabaseConfigured || !syncState.isOnline) {
      return;
    }

    const interval = setInterval(() => {
      syncNow();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, syncState.isOnline, syncNow]);

  // ============================================================================
  // CALLBACK REGISTRATION
  // ============================================================================

  const registerEntryCallback = useCallback(
    (cb: (entry: DayEntry, action: 'upsert' | 'delete') => void) => {
      entryCallbackRef.current = cb;
    },
    []
  );

  const registerNoteCallback = useCallback(
    (cb: (note: QuickNote, action: 'upsert' | 'delete') => void) => {
      noteCallbackRef.current = cb;
    },
    []
  );

  const registerProfileCallback = useCallback(
    (cb: (profile: UserProfile, xp: number, isPremium: boolean, firstEntryDate?: string) => void) => {
      profileCallbackRef.current = cb;
    },
    []
  );

  const registerHabitCallback = useCallback(
    (cb: (habits: HabitState, date: string) => void) => {
      habitCallbackRef.current = cb;
    },
    []
  );

  // Placeholder callbacks (will be replaced by AppContext)
  const onRemoteEntryChange = useCallback((entry: DayEntry, action: 'upsert' | 'delete') => {
    entryCallbackRef.current?.(entry, action);
  }, []);

  const onRemoteNoteChange = useCallback((note: QuickNote, action: 'upsert' | 'delete') => {
    noteCallbackRef.current?.(note, action);
  }, []);

  const onRemoteProfileChange = useCallback(
    (profile: UserProfile, xp: number, isPremium: boolean, firstEntryDate?: string) => {
      profileCallbackRef.current?.(profile, xp, isPremium, firstEntryDate);
    },
    []
  );

  const onRemoteHabitChange = useCallback((habits: HabitState, date: string) => {
    habitCallbackRef.current?.(habits, date);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SyncContext.Provider
      value={{
        syncState,
        isSupabaseReady: isSupabaseConfigured,
        triggerFullSync,
        triggerPullSync,
        syncNow,
        lastSyncData,
        onRemoteEntryChange,
        onRemoteNoteChange,
        onRemoteProfileChange,
        onRemoteHabitChange,
        registerEntryCallback,
        registerNoteCallback,
        registerProfileCallback,
        registerHabitCallback,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
