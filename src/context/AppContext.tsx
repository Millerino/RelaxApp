import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserState, DayEntry, OnboardingStep, MoodLevel, Goal, UserProfile } from '../types';

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
  currentEntry: Partial<DayEntry>;
  shouldShowPaywall: boolean;
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

    setState(prev => ({
      ...prev,
      entries: [...prev.entries.filter(e => e.date !== today), entry],
      daysUsed: prev.daysUsed + 1,
      isOnboarded: true,
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

      return {
        ...prev,
        entries: isNewEntry
          ? [...prev.entries, entry]
          : prev.entries.map((e, i) => i === existingIndex ? entry : e),
        daysUsed: isNewEntry ? prev.daysUsed + 1 : prev.daysUsed,
        isOnboarded: true,
      };
    });
  };

  const setProfile = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
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
      currentEntry,
      shouldShowPaywall,
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
