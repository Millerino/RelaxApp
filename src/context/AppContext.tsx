import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { UserState, DayEntry, OnboardingStep, MoodLevel, Goal, UserProfile, QuickNote } from '../types';
import { FREE_TRIAL_MS } from '../lib/constants';
import { useAuth } from './AuthContext';
import {
  fetchEntries, upsertEntry, upsertEntries,
  fetchQuickNotes, upsertQuickNote, upsertQuickNotes,
  deleteQuickNoteRemote, upsertProfile, fetchProfile,
} from '../lib/supabase';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

interface AppContextType {
  state: UserState;
  setStep: (step: OnboardingStep) => void;
  setMood: (mood: MoodLevel) => void;
  setEmotions: (emotions: string[]) => void;
  setReflection: (text: string) => void;
  setGratitude: (text: string) => void;
  setGoals: (goals: Goal[]) => void;
  saveDayEntry: (overrides?: Partial<DayEntry>) => void;
  updateEntry: (entry: DayEntry) => void;
  setProfile: (profile: UserProfile) => void;
  login: (email: string) => void;
  skipLogin: () => void;
  subscribeToPremium: () => void;
  cancelSubscription: () => void;
  clearAllData: () => Promise<void>;
  currentEntry: Partial<DayEntry>;
  shouldShowPaywall: boolean;
  addQuickNote: (text: string, date?: string, emoji?: string) => void;
  deleteQuickNote: (id: string) => void;
  updateQuickNoteEmoji: (id: string, emoji: string) => void;
  getNotesForDate: (date: string) => QuickNote[];
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'relaxapp_state';

const getInitialState = (): UserState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Invalid JSON, use default
    }
  }
  return {
    isOnboarded: false,
    isLoggedIn: false,
    isPremium: false,
    daysUsed: 0,
    entries: [],
    currentStep: 'welcome',
    xp: 0,
  };
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(getInitialState);
  const [currentEntry, setCurrentEntry] = useState<Partial<DayEntry>>({});
  const { user } = useAuth();
  const hasSyncedRef = useRef(false);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // --- Cloud sync: pull remote data on login, merge with local ---
  useEffect(() => {
    if (!user || hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    const sync = async () => {
      const [remoteEntries, remoteNotes, remoteProfile] = await Promise.all([
        fetchEntries(user.id),
        fetchQuickNotes(user.id),
        fetchProfile(user.id),
      ]);

      setState(prev => {
        // Merge entries: for same date, keep the one with later createdAt
        const localByDate = new Map(prev.entries.map(e => [e.date, e]));
        const remoteByDate = new Map(remoteEntries.map(e => [e.date, e]));

        const mergedEntries: DayEntry[] = [];
        const allDates = new Set([...localByDate.keys(), ...remoteByDate.keys()]);

        for (const date of allDates) {
          const local = localByDate.get(date);
          const remote = remoteByDate.get(date);
          if (local && remote) {
            // Keep whichever was created/updated later
            mergedEntries.push(local.createdAt >= remote.createdAt ? local : remote);
          } else {
            mergedEntries.push((local || remote)!);
          }
        }

        // Merge quick notes: remote wins for same ID, keep unique from both
        const localNotesById = new Map((prev.quickNotes || []).map(n => [n.id, n]));
        const remoteNotesById = new Map(remoteNotes.map(n => [n.id, n]));
        const allNoteIds = new Set([...localNotesById.keys(), ...remoteNotesById.keys()]);
        const mergedNotes: QuickNote[] = [];
        for (const id of allNoteIds) {
          const remote = remoteNotesById.get(id);
          const local = localNotesById.get(id);
          mergedNotes.push((remote || local)!);
        }

        // Use the higher XP and days_used (in case remote is ahead)
        const remoteXp = remoteProfile?.xp || 0;
        const newXp = Math.max(prev.xp || 0, remoteXp);
        const newDaysUsed = Math.max(prev.daysUsed, mergedEntries.length);

        return {
          ...prev,
          entries: mergedEntries,
          quickNotes: mergedNotes,
          daysUsed: newDaysUsed,
          xp: newXp,
        };
      });

      // Push any local-only entries to Supabase
      setState(prev => {
        const remoteIds = new Set(remoteEntries.map(e => e.id));
        const localOnly = prev.entries.filter(e => !remoteIds.has(e.id));
        if (localOnly.length > 0) {
          upsertEntries(user.id, localOnly);
        }

        const remoteNoteIds = new Set(remoteNotes.map(n => n.id));
        const localOnlyNotes = (prev.quickNotes || []).filter(n => !remoteNoteIds.has(n.id));
        if (localOnlyNotes.length > 0) {
          upsertQuickNotes(user.id, localOnlyNotes);
        }

        // Sync XP/daysUsed to profile
        upsertProfile(user.id, {
          xp: prev.xp || 0,
          days_used: prev.daysUsed,
          first_used_at: prev.firstUsedAt ?? null,
        });

        return prev;
      });
    };

    sync();
  }, [user]);

  // Reset sync flag on logout so next login re-syncs
  useEffect(() => {
    if (!user) {
      hasSyncedRef.current = false;
    }
  }, [user]);

  // Check if today's entry already exists
  useEffect(() => {
    const today = new Date().toDateString();
    const todayEntry = state.entries.find(e => e.date === today);
    if (todayEntry && state.isOnboarded) {
      setState(prev => ({ ...prev, currentStep: 'complete' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  // --- Realtime sync: listen for changes from other devices via WebSocket ---
  useRealtimeSync(user?.id, {
    onEntryChange: useCallback((entry: DayEntry) => {
      setState(prev => {
        const existing = prev.entries.find(e => e.date === entry.date);
        // Only update if the incoming entry is newer
        if (existing && existing.createdAt >= entry.createdAt) return prev;
        return {
          ...prev,
          entries: [...prev.entries.filter(e => e.date !== entry.date), entry],
          daysUsed: existing ? prev.daysUsed : prev.daysUsed + 1,
          isOnboarded: true,
        };
      });
    }, []),
    onNoteChange: useCallback((note: QuickNote) => {
      setState(prev => ({
        ...prev,
        quickNotes: [
          ...(prev.quickNotes || []).filter(n => n.id !== note.id),
          note,
        ],
      }));
    }, []),
    onNoteDelete: useCallback((noteId: string) => {
      setState(prev => ({
        ...prev,
        quickNotes: (prev.quickNotes || []).filter(n => n.id !== noteId),
      }));
    }, []),
    onProfileChange: useCallback((profile: { xp?: number; days_used?: number }) => {
      setState(prev => ({
        ...prev,
        xp: Math.max(prev.xp || 0, profile.xp || 0),
        daysUsed: Math.max(prev.daysUsed, profile.days_used || 0),
      }));
    }, []),
  });

  // 3-day free trial: show paywall after 3 calendar days from first use
  const shouldShowPaywall = useMemo(() => {
    if (state.isPremium) return false;
    if (!state.firstUsedAt) return false;
    return Date.now() - state.firstUsedAt >= FREE_TRIAL_MS;
  }, [state.isPremium, state.firstUsedAt]);

  const setStep = (step: OnboardingStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setMood = (mood: MoodLevel) => {
    setCurrentEntry(prev => ({ ...prev, mood }));
  };

  const setEmotions = (emotions: string[]) => {
    setCurrentEntry(prev => ({ ...prev, emotions }));
  };

  const setReflection = (text: string) => {
    setCurrentEntry(prev => ({ ...prev, reflection: text }));
  };

  const setGratitude = (text: string) => {
    setCurrentEntry(prev => ({ ...prev, gratitude: text }));
  };

  const setGoals = (goals: Goal[]) => {
    setCurrentEntry(prev => ({ ...prev, goals }));
  };

  // Calculate XP earned for an entry
  const calculateXP = (entry: DayEntry, isStreak: boolean): number => {
    let xp = 10; // Base XP for logging

    // Bonus for detailed entries
    if (entry.emotions.length >= 3) xp += 5;
    if (entry.reflection.length >= 50) xp += 5;
    if (entry.gratitude.length >= 20) xp += 5;
    if (entry.goals.length >= 1) xp += 5;

    // Streak bonus
    if (isStreak) xp += 10;

    return xp;
  };

  const saveDayEntry = useCallback((overrides?: Partial<DayEntry>) => {
    const today = new Date().toDateString();
    const merged = { ...currentEntry, ...overrides };
    const entry: DayEntry = {
      id: crypto.randomUUID(),
      date: today,
      mood: merged.mood || 3,
      emotions: merged.emotions || [],
      reflection: merged.reflection || '',
      gratitude: merged.gratitude || '',
      goals: merged.goals || [],
      createdAt: Date.now(),
    };

    // Check if this continues a streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const hadYesterday = state.entries.some(e => e.date === yesterday.toDateString());

    const earnedXP = calculateXP(entry, hadYesterday);

    setState(prev => {
      const alreadyHasToday = prev.entries.some(e => e.date === today);
      return {
        ...prev,
        entries: [...prev.entries.filter(e => e.date !== today), entry],
        daysUsed: alreadyHasToday ? prev.daysUsed : prev.daysUsed + 1,
        isOnboarded: true,
        xp: alreadyHasToday ? (prev.xp || 0) : (prev.xp || 0) + earnedXP,
        firstUsedAt: prev.firstUsedAt || Date.now(),
      };
    });

    // Sync to Supabase
    if (user) {
      upsertEntry(user.id, entry);
    }

    setCurrentEntry({});
  }, [currentEntry, state.entries, user]);

  const login = (email: string) => {
    setState(prev => ({ ...prev, isLoggedIn: true, email }));
  };

  const skipLogin = () => {
    setState(prev => ({ ...prev, currentStep: 'complete' }));
  };

  const subscribeToPremium = () => {
    setState(prev => ({ ...prev, isPremium: true }));
  };

  const cancelSubscription = () => {
    setState(prev => ({ ...prev, isPremium: false }));
  };

  const updateEntry = useCallback((entry: DayEntry) => {
    setState(prev => {
      const existingIndex = prev.entries.findIndex(e => e.date === entry.date);
      const isNewEntry = existingIndex === -1;

      return {
        ...prev,
        entries: isNewEntry
          ? [...prev.entries, entry]
          : prev.entries.map((e, i) => i === existingIndex ? entry : e),
        daysUsed: isNewEntry ? prev.daysUsed + 1 : prev.daysUsed,
        isOnboarded: true,
      };
    });

    // Sync to Supabase
    if (user) {
      upsertEntry(user.id, entry);
    }
  }, [user]);

  const setProfile = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  };

  const addQuickNote = useCallback((text: string, date?: string, emoji?: string) => {
    const note: QuickNote = {
      id: crypto.randomUUID(),
      text,
      date: date || new Date().toDateString(),
      createdAt: Date.now(),
      ...(emoji ? { emoji } : {}),
    };
    setState(prev => ({
      ...prev,
      quickNotes: [...(prev.quickNotes || []), note],
    }));

    if (user) {
      upsertQuickNote(user.id, note);
    }
  }, [user]);

  const deleteQuickNote = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      quickNotes: (prev.quickNotes || []).filter(n => n.id !== id),
    }));

    if (user) {
      deleteQuickNoteRemote(user.id, id);
    }
  }, [user]);

  const updateQuickNoteEmoji = useCallback((id: string, emoji: string) => {
    setState(prev => {
      const updated = (prev.quickNotes || []).map(n =>
        n.id === id ? { ...n, emoji } : n
      );
      // Sync the updated note
      if (user) {
        const note = updated.find(n => n.id === id);
        if (note) upsertQuickNote(user.id, note);
      }
      return { ...prev, quickNotes: updated };
    });
  }, [user]);

  const getNotesForDate = (date: string): QuickNote[] => {
    return (state.quickNotes || []).filter(n => n.date === date);
  };

  // Re-fetch entries and quick notes from Supabase (called on focus / interval)
  const refreshData = useCallback(async () => {
    if (!user) return;

    const [remoteEntries, remoteNotes] = await Promise.all([
      fetchEntries(user.id),
      fetchQuickNotes(user.id),
    ]);

    setState(prev => {
      // Merge entries: for same date, keep the one with later createdAt
      const localByDate = new Map(prev.entries.map(e => [e.date, e]));
      const remoteByDate = new Map(remoteEntries.map(e => [e.date, e]));
      const mergedEntries: DayEntry[] = [];
      const allDates = new Set([...localByDate.keys(), ...remoteByDate.keys()]);

      for (const date of allDates) {
        const local = localByDate.get(date);
        const remote = remoteByDate.get(date);
        if (local && remote) {
          mergedEntries.push(local.createdAt >= remote.createdAt ? local : remote);
        } else {
          mergedEntries.push((local || remote)!);
        }
      }

      // Merge quick notes: remote wins for same ID, keep unique from both
      const localNotesById = new Map((prev.quickNotes || []).map(n => [n.id, n]));
      const remoteNotesById = new Map(remoteNotes.map(n => [n.id, n]));
      const allNoteIds = new Set([...localNotesById.keys(), ...remoteNotesById.keys()]);
      const mergedNotes: QuickNote[] = [];
      for (const id of allNoteIds) {
        const remote = remoteNotesById.get(id);
        const local = localNotesById.get(id);
        mergedNotes.push((remote || local)!);
      }

      return {
        ...prev,
        entries: mergedEntries,
        quickNotes: mergedNotes,
        daysUsed: Math.max(prev.daysUsed, mergedEntries.length),
      };
    });
  }, [user]);

  const clearAllData = async (): Promise<void> => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    // Reset state to initial
    setState({
      isOnboarded: false,
      isLoggedIn: false,
      isPremium: false,
      daysUsed: 0,
      entries: [],
      currentStep: 'welcome',
      xp: 0,
      firstUsedAt: undefined,
    });
    setCurrentEntry({});
  };

  return (
    <AppContext.Provider value={{
      state,
      setStep,
      setMood,
      setEmotions,
      setReflection,
      setGratitude,
      setGoals,
      saveDayEntry,
      updateEntry,
      setProfile,
      login,
      skipLogin,
      subscribeToPremium,
      cancelSubscription,
      clearAllData,
      currentEntry,
      shouldShowPaywall,
      addQuickNote,
      deleteQuickNote,
      updateQuickNoteEmoji,
      getNotesForDate,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
