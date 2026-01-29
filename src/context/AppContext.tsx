import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { UserState, DayEntry, OnboardingStep, MoodLevel, Goal, UserProfile, QuickNote } from '../types';
import { useAuth } from './AuthContext';
import { syncService, dbToEntry, dbToQuickNote, dbToProfile } from '../services/syncService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  state: UserState;
  setStep: (step: OnboardingStep) => void;
  setMood: (mood: MoodLevel) => void;
  setEmotions: (emotions: string[]) => void;
  setReflection: (text: string) => void;
  setGratitude: (text: string) => void;
  setGoals: (goals: Goal[]) => void;
  saveDayEntry: () => void;
  updateEntry: (entry: DayEntry) => void;
  deleteEntry: (entryId: string) => void;
  setProfile: (profile: UserProfile) => void;
  login: (email: string) => void;
  skipLogin: () => void;
  subscribeToPremium: () => void;
  cancelSubscription: () => void;
  clearAllData: () => Promise<void>;
  currentEntry: Partial<DayEntry>;
  shouldShowPaywall: boolean;
  addQuickNote: (text: string, emoji?: string, date?: string) => void;
  deleteQuickNote: (id: string) => void;
  updateQuickNote: (id: string, text: string, emoji?: string) => void;
  updateQuickNoteEmoji: (id: string, emoji: string) => void;
  getNotesForDate: (date: string) => QuickNote[];
  // Sync-related
  isSyncing: boolean;
  lastSyncAt: Date | null;
  triggerSync: () => Promise<void>;
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
    firstEntryDate: undefined, // Track when user first started to prevent XP cheating
  };
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(getInitialState);
  const [currentEntry, setCurrentEntry] = useState<Partial<DayEntry>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(syncService.getLastSyncTime());

  // Get premium status from AuthContext (Supabase)
  const { isPremium: authIsPremium, user } = useAuth();

  // Track if initial sync has been done
  const hasInitialSyncRef = useRef(false);
  const goalsCache = useRef<{ id: string; user_id: string; entry_id: string | null; text: string; completed: boolean; date: string; created_at: string; updated_at: string }[]>([]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Sync premium status from Supabase - Supabase is source of truth for logged-in users
  useEffect(() => {
    // Only sync if user is logged in - Supabase is the source of truth
    if (user) {
      if (authIsPremium !== state.isPremium) {
        setState(prev => ({ ...prev, isPremium: authIsPremium }));
      }
    }
  }, [authIsPremium, user, state.isPremium]);

  // Check if today's entry already exists
  useEffect(() => {
    const today = new Date().toDateString();
    const todayEntry = state.entries.find(e => e.date === today);
    if (todayEntry && state.isOnboarded) {
      setState(prev => ({ ...prev, currentStep: 'complete' }));
    }
  }, []);

  // ============================================================================
  // FULL SYNC ON LOGIN
  // ============================================================================

  useEffect(() => {
    if (!user || !isSupabaseConfigured || hasInitialSyncRef.current) {
      return;
    }

    const performInitialSync = async () => {
      try {
        setIsSyncing(true);
        console.log('[AppContext] Performing initial sync...');

        const data = await syncService.fullSync(user.id);

        if (data) {
          goalsCache.current = data.goals;

          // Merge server data with local data (server wins for conflicts)
          setState(prev => {
            // Convert server entries
            const serverEntries = data.entries.map(dbEntry =>
              dbToEntry(dbEntry, data.goals)
            );

            // Merge: server entries + local entries not on server
            const serverEntryDates = new Set(serverEntries.map(e => e.date));
            const localOnlyEntries = prev.entries.filter(
              e => !serverEntryDates.has(e.date)
            );

            // Convert server quick notes
            const serverNotes = data.quick_notes.map(dbToQuickNote);
            const serverNoteIds = new Set(serverNotes.map(n => n.id));
            const localOnlyNotes = (prev.quickNotes || []).filter(
              n => !serverNoteIds.has(n.id)
            );

            // Merge profile (server wins if exists)
            let profile = prev.profile;
            if (data.profile) {
              profile = dbToProfile(data.profile);
            }

            // Use server XP if higher (prevents gaming)
            const xp = data.profile ? Math.max(prev.xp || 0, data.profile.xp) : prev.xp;

            // Use server's firstEntryDate if exists
            const firstEntryDate = data.profile?.first_entry_date || prev.firstEntryDate;

            console.log('[AppContext] Merged data:', {
              serverEntries: serverEntries.length,
              localOnly: localOnlyEntries.length,
              totalNotes: serverNotes.length + localOnlyNotes.length,
            });

            return {
              ...prev,
              entries: [...serverEntries, ...localOnlyEntries],
              quickNotes: [...serverNotes, ...localOnlyNotes],
              profile,
              xp,
              firstEntryDate,
              isPremium: data.profile?.is_premium ?? prev.isPremium,
              isLoggedIn: true,
              isOnboarded: prev.isOnboarded || serverEntries.length > 0,
            };
          });

          // Push any local-only entries to server
          const localOnlyEntries = state.entries.filter(
            e => !data.entries.find(de => new Date(de.date).toDateString() === e.date)
          );
          for (const entry of localOnlyEntries) {
            await syncService.syncEntry(user.id, entry);
          }

          // Push any local-only notes to server
          const localOnlyNotes = (state.quickNotes || []).filter(
            n => !data.quick_notes.find(dn => dn.id === n.id)
          );
          for (const note of localOnlyNotes) {
            await syncService.syncQuickNote(user.id, note);
          }

          // Push profile if exists locally
          if (state.profile) {
            await syncService.syncProfile(user.id, state.profile, state.xp || 0, state.firstEntryDate);
          }

          setLastSyncAt(new Date());
          hasInitialSyncRef.current = true;
          console.log('[AppContext] Initial sync completed');
        }
      } catch (error) {
        console.error('[AppContext] Initial sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    performInitialSync();
  }, [user]);

  // ============================================================================
  // REALTIME SUBSCRIPTION
  // ============================================================================

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      return;
    }

    const unsubscribe = syncService.subscribeToChanges(user.id, {
      onEntryChange: (payload) => {
        if (payload.eventType === 'DELETE' && payload.old) {
          // Remove deleted entry
          setState(prev => ({
            ...prev,
            entries: prev.entries.filter(e => e.id !== payload.old!.id),
          }));
        } else if (payload.new) {
          // Upsert entry from remote
          const newEntry = dbToEntry(payload.new, goalsCache.current);
          setState(prev => {
            const existingIndex = prev.entries.findIndex(e => e.id === newEntry.id || e.date === newEntry.date);
            if (existingIndex >= 0) {
              // Update existing
              const updated = [...prev.entries];
              updated[existingIndex] = newEntry;
              return { ...prev, entries: updated };
            } else {
              // Add new
              return { ...prev, entries: [...prev.entries, newEntry] };
            }
          });
        }
      },
      onQuickNoteChange: (payload) => {
        if (payload.eventType === 'DELETE' && payload.old) {
          setState(prev => ({
            ...prev,
            quickNotes: (prev.quickNotes || []).filter(n => n.id !== payload.old!.id),
          }));
        } else if (payload.new) {
          const newNote = dbToQuickNote(payload.new);
          setState(prev => {
            const notes = prev.quickNotes || [];
            const existingIndex = notes.findIndex(n => n.id === newNote.id);
            if (existingIndex >= 0) {
              const updated = [...notes];
              updated[existingIndex] = newNote;
              return { ...prev, quickNotes: updated };
            } else {
              return { ...prev, quickNotes: [...notes, newNote] };
            }
          });
        }
      },
      onProfileChange: (payload) => {
        if (payload.new) {
          const profile = dbToProfile(payload.new);
          setState(prev => ({
            ...prev,
            profile,
            xp: payload.new!.xp,
            isPremium: payload.new!.is_premium,
            firstEntryDate: payload.new!.first_entry_date || prev.firstEntryDate,
          }));
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // ============================================================================
  // MANUAL SYNC TRIGGER
  // ============================================================================

  const triggerSync = useCallback(async () => {
    if (!user || !isSupabaseConfigured || isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);

      // Process any pending queue items
      await syncService.processQueue(user.id);

      // Pull latest changes
      const changes = await syncService.pullChanges(user.id);

      if (changes) {
        // Update goals cache
        if (changes.goals.length > 0) {
          goalsCache.current = [
            ...goalsCache.current.filter(g => !changes.goals.find(cg => cg.id === g.id)),
            ...changes.goals,
          ];
        }

        // Apply changes to state
        if (changes.entries.length > 0 || changes.quick_notes.length > 0) {
          setState(prev => {
            let entries = [...prev.entries];
            let notes = [...(prev.quickNotes || [])];

            // Merge entries
            for (const dbEntry of changes.entries) {
              const entry = dbToEntry(dbEntry, goalsCache.current);
              const idx = entries.findIndex(e => e.id === entry.id || e.date === entry.date);
              if (idx >= 0) {
                entries[idx] = entry;
              } else {
                entries.push(entry);
              }
            }

            // Merge notes
            for (const dbNote of changes.quick_notes) {
              const note = dbToQuickNote(dbNote);
              const idx = notes.findIndex(n => n.id === note.id);
              if (idx >= 0) {
                notes[idx] = note;
              } else {
                notes.push(note);
              }
            }

            return { ...prev, entries, quickNotes: notes };
          });
        }
      }

      setLastSyncAt(new Date());
    } catch (error) {
      console.error('[AppContext] Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing]);

  // Premium is active if either local state OR Supabase says so
  // For logged-in users, Supabase is the source of truth (synced above)
  const isPremiumActive = user ? authIsPremium : state.isPremium;
  const shouldShowPaywall = state.daysUsed >= 3 && !isPremiumActive && !state.isLoggedIn;

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

  const saveDayEntry = () => {
    const today = new Date().toDateString();
    const entry: DayEntry = {
      id: crypto.randomUUID(),
      date: today,
      mood: currentEntry.mood || 3,
      emotions: currentEntry.emotions || [],
      reflection: currentEntry.reflection || '',
      gratitude: currentEntry.gratitude || '',
      goals: currentEntry.goals || [],
      createdAt: Date.now(),
    };

    // Check if this continues a streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const hadYesterday = state.entries.some(e => e.date === yesterday.toDateString());

    const earnedXP = calculateXP(entry, hadYesterday);
    const newXp = (state.xp || 0) + earnedXP;
    const newFirstEntryDate = state.firstEntryDate || today;

    setState(prev => ({
      ...prev,
      entries: [...prev.entries.filter(e => e.date !== today), entry],
      daysUsed: prev.daysUsed + 1,
      isOnboarded: true,
      xp: newXp,
      firstEntryDate: newFirstEntryDate,
    }));

    setCurrentEntry({});

    // Sync to Supabase in background
    if (user && isSupabaseConfigured) {
      syncService.syncEntry(user.id, entry);
      // Also sync profile with updated XP
      if (state.profile) {
        syncService.syncProfile(user.id, state.profile, newXp, newFirstEntryDate);
      }
    }
  };

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

  const updateEntry = (entry: DayEntry) => {
    let xpGainCapture = 0;
    let newFirstEntryDateCapture = state.firstEntryDate;

    setState(prev => {
      const existingIndex = prev.entries.findIndex(e => e.date === entry.date);
      const isNewEntry = existingIndex === -1;

      // Determine if XP should be awarded:
      // 1. Must be a new entry (not an edit)
      // 2. Entry date must be on or after firstEntryDate (prevents backdating cheats)
      // 3. If no firstEntryDate yet, only give XP if entry is for today
      const today = new Date().toDateString();
      const entryDate = new Date(entry.date);
      const firstDate = prev.firstEntryDate ? new Date(prev.firstEntryDate) : null;

      let xpGain = 0;
      let newFirstEntryDate = prev.firstEntryDate;

      if (isNewEntry) {
        if (!firstDate) {
          // First ever entry - set firstEntryDate and only give XP if it's today
          if (entry.date === today) {
            xpGain = 10;
            newFirstEntryDate = today;
          }
          // If backdating their first entry, no XP but track when they actually started
          else {
            newFirstEntryDate = today; // Their journey starts today, not the backdated date
          }
        } else {
          // Has existing entries - only give XP if entry is on or after firstEntryDate
          entryDate.setHours(0, 0, 0, 0);
          firstDate.setHours(0, 0, 0, 0);
          if (entryDate >= firstDate) {
            xpGain = 10;
          }
          // Backdated entries before firstEntryDate get no XP
        }
      }

      xpGainCapture = xpGain;
      newFirstEntryDateCapture = newFirstEntryDate;

      return {
        ...prev,
        entries: isNewEntry
          ? [...prev.entries, entry]
          : prev.entries.map((e, i) => i === existingIndex ? entry : e),
        daysUsed: isNewEntry ? prev.daysUsed + 1 : prev.daysUsed,
        isOnboarded: true,
        xp: (prev.xp || 0) + xpGain,
        firstEntryDate: newFirstEntryDate,
      };
    });

    // Sync to Supabase in background
    if (user && isSupabaseConfigured) {
      syncService.syncEntry(user.id, entry);
      // Also sync profile if XP changed
      if (xpGainCapture > 0 && state.profile) {
        const newXp = (state.xp || 0) + xpGainCapture;
        syncService.syncProfile(user.id, state.profile, newXp, newFirstEntryDateCapture);
      }
    }
  };

  const deleteEntry = (entryId: string) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== entryId),
    }));

    // Sync deletion to Supabase
    if (user && isSupabaseConfigured) {
      syncService.deleteEntry(user.id, entryId);
    }
  };

  const setProfile = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));

    // Sync to Supabase in background
    if (user && isSupabaseConfigured) {
      syncService.syncProfile(user.id, profile, state.xp || 0, state.firstEntryDate);
    }
  };

  const addQuickNote = (text: string, emoji?: string, date?: string) => {
    const note: QuickNote = {
      id: crypto.randomUUID(),
      text,
      emoji: emoji || undefined,
      date: date || new Date().toDateString(),
      createdAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      quickNotes: [...(prev.quickNotes || []), note],
    }));

    // Sync to Supabase in background
    if (user && isSupabaseConfigured) {
      syncService.syncQuickNote(user.id, note);
    }
  };

  const deleteQuickNote = (id: string) => {
    setState(prev => ({
      ...prev,
      quickNotes: (prev.quickNotes || []).filter(n => n.id !== id),
    }));

    // Sync deletion to Supabase
    if (user && isSupabaseConfigured) {
      syncService.deleteQuickNote(user.id, id);
    }
  };

  const updateQuickNote = (id: string, text: string, emoji?: string) => {
    const updatedNote = (state.quickNotes || []).find(n => n.id === id);

    setState(prev => ({
      ...prev,
      quickNotes: (prev.quickNotes || []).map(n =>
        n.id === id ? { ...n, text, emoji: emoji || n.emoji } : n
      ),
    }));

    // Sync to Supabase in background
    if (user && isSupabaseConfigured && updatedNote) {
      syncService.syncQuickNote(user.id, { ...updatedNote, text, emoji: emoji || updatedNote.emoji });
    }
  };

  const updateQuickNoteEmoji = (id: string, emoji: string) => {
    const updatedNote = (state.quickNotes || []).find(n => n.id === id);

    setState(prev => ({
      ...prev,
      quickNotes: (prev.quickNotes || []).map(n =>
        n.id === id ? { ...n, emoji } : n
      ),
    }));

    // Sync to Supabase in background
    if (user && isSupabaseConfigured && updatedNote) {
      syncService.syncQuickNote(user.id, { ...updatedNote, emoji });
    }
  };

  const getNotesForDate = (date: string): QuickNote[] => {
    return (state.quickNotes || []).filter(n => n.date === date);
  };

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
      deleteEntry,
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
      updateQuickNote,
      updateQuickNoteEmoji,
      getNotesForDate,
      // Sync-related
      isSyncing,
      lastSyncAt,
      triggerSync,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
