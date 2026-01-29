import { useState, useEffect, useCallback, useMemo } from 'react';

export interface HabitState {
  water: { current: number; goal: number; completed: boolean };
  meditate: { minutes: number; completed: boolean };
  sleep: { hours: number; quality: 'poor' | 'okay' | 'great' | null; completed: boolean };
  detox: { active: boolean; startTime: number | null; completed: boolean; successful: boolean | null };
}

interface HabitTrackerReturn {
  habits: HabitState;
  updateWater: (amount: number) => void;
  logMeditation: (minutes: number) => void;
  logSleep: (hours: number, quality: 'poor' | 'okay' | 'great') => void;
  startDetox: () => void;
  endDetox: (successful: boolean) => void;
  resetDaily: () => void;
  completedCount: number;
  allComplete: boolean;
  sparkBoost: number;
}

const getStorageKey = () => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return `pulsero_habits_${dateStr}`;
};

const getDefaultState = (): HabitState => ({
  water: { current: 0, goal: 2000, completed: false },
  meditate: { minutes: 0, completed: false },
  sleep: { hours: 0, quality: null, completed: false },
  detox: { active: false, startTime: null, completed: false, successful: null },
});

const loadState = (): HabitState => {
  try {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading habit state:', e);
  }
  return getDefaultState();
};

const saveState = (state: HabitState) => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  } catch (e) {
    console.error('Error saving habit state:', e);
  }
};

export function useHabitTracker(): HabitTrackerReturn {
  const [habits, setHabits] = useState<HabitState>(loadState);

  // Check for date change (midnight reset)
  useEffect(() => {
    const checkDate = () => {
      const currentKey = getStorageKey();
      const savedKey = localStorage.getItem('pulsero_habits_current_key');
      if (savedKey !== currentKey) {
        // New day - reset state
        setHabits(getDefaultState());
        localStorage.setItem('pulsero_habits_current_key', currentKey);
      }
    };

    checkDate();
    const interval = setInterval(checkDate, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Persist state changes
  useEffect(() => {
    saveState(habits);
  }, [habits]);

  const updateWater = useCallback((amount: number) => {
    setHabits(prev => {
      const newCurrent = Math.max(0, Math.min(4000, prev.water.current + amount));
      const completed = newCurrent >= prev.water.goal;
      return {
        ...prev,
        water: { ...prev.water, current: newCurrent, completed },
      };
    });
  }, []);

  const logMeditation = useCallback((minutes: number) => {
    setHabits(prev => {
      const newMinutes = prev.meditate.minutes + minutes;
      return {
        ...prev,
        meditate: { minutes: newMinutes, completed: true },
      };
    });
  }, []);

  const logSleep = useCallback((hours: number, quality: 'poor' | 'okay' | 'great') => {
    setHabits(prev => ({
      ...prev,
      sleep: { hours, quality, completed: true },
    }));
  }, []);

  const startDetox = useCallback(() => {
    setHabits(prev => ({
      ...prev,
      detox: { active: true, startTime: Date.now(), completed: false, successful: null },
    }));
  }, []);

  const endDetox = useCallback((successful: boolean) => {
    setHabits(prev => ({
      ...prev,
      detox: { active: false, startTime: null, completed: successful, successful },
    }));
  }, []);

  const resetDaily = useCallback(() => {
    setHabits(getDefaultState());
  }, []);

  const completedCount = useMemo(() => {
    let count = 0;
    if (habits.water.completed) count++;
    if (habits.meditate.completed) count++;
    if (habits.sleep.completed) count++;
    if (habits.detox.completed) count++;
    return count;
  }, [habits]);

  const allComplete = completedCount === 4;

  // Spark boost calculation (0-100)
  const sparkBoost = useMemo(() => {
    let boost = (completedCount / 4) * 100;
    // Quality bonuses for sleep
    if (habits.sleep.completed && habits.sleep.quality) {
      if (habits.sleep.quality === 'great') boost += 10;
      else if (habits.sleep.quality === 'okay') boost += 5;
    }
    return Math.min(100, boost);
  }, [completedCount, habits.sleep]);

  return {
    habits,
    updateWater,
    logMeditation,
    logSleep,
    startDetox,
    endDetox,
    resetDaily,
    completedCount,
    allComplete,
    sparkBoost,
  };
}
