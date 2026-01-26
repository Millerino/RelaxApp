import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserState, DayEntry, OnboardingStep, MoodLevel, Goal, UserProfile, QuickNote } from '../types';

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
  setProfile: (profile: UserProfile) => void;
  login: (email: string) => void;
  skipLogin: () => void;
  subscribeToPremium: () => void;
  cancelSubscription: () => void;
  clearAllData: () => Promise<void>;
  currentEntry: Partial<DayEntry>;
  shouldShowPaywall: boolean;
  addQuickNote: (text: string, date?: string) => void;
  deleteQuickNote: (id: string) => void;
  updateQuickNoteEmoji: (id: string, emoji: string) => void;
  getNotesForDate: (date: string) => QuickNote[];
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

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Check if today's entry already exists
  useEffect(() => {
    const today = new Date().toDateString();
    const todayEntry = state.entries.find(e => e.date === today);
    if (todayEntry && state.isOnboarded) {
      setState(prev => ({ ...prev, currentStep: 'complete' }));
    }
  }, []);

  const shouldShowPaywall = state.daysUsed >= 3 && !state.isPremium && !state.isLoggedIn;

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

    setState(prev => ({
      ...prev,
      entries: [...prev.entries.filter(e => e.date !== today), entry],
      daysUsed: prev.daysUsed + 1,
      isOnboarded: true,
      xp: (prev.xp || 0) + earnedXP,
    }));

    setCurrentEntry({});
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
    setState(prev => {
      const existingIndex = prev.entries.findIndex(e => e.date === entry.date);
      const isNewEntry = existingIndex === -1;

      // Only give XP for new entries (not edits)
      const xpGain = isNewEntry ? 10 : 0;

      return {
        ...prev,
        entries: isNewEntry
          ? [...prev.entries, entry]
          : prev.entries.map((e, i) => i === existingIndex ? entry : e),
        daysUsed: isNewEntry ? prev.daysUsed + 1 : prev.daysUsed,
        isOnboarded: true,
        xp: (prev.xp || 0) + xpGain,
      };
    });
  };

  const setProfile = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  };

  const addQuickNote = (text: string, date?: string) => {
    const note: QuickNote = {
      id: crypto.randomUUID(),
      text,
      date: date || new Date().toDateString(),
      createdAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      quickNotes: [...(prev.quickNotes || []), note],
    }));
  };

  const deleteQuickNote = (id: string) => {
    setState(prev => ({
      ...prev,
      quickNotes: (prev.quickNotes || []).filter(n => n.id !== id),
    }));
  };

  const updateQuickNoteEmoji = (id: string, emoji: string) => {
    setState(prev => ({
      ...prev,
      quickNotes: (prev.quickNotes || []).map(n =>
        n.id === id ? { ...n, emoji } : n
      ),
    }));
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
