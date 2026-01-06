export interface DayEntry {
  id: string;
  date: string;
  mood: MoodLevel;
  emotions: string[];
  reflection: string;
  gratitude: string;
  goals: Goal[];
  createdAt: number;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface UserState {
  isOnboarded: boolean;
  isLoggedIn: boolean;
  isPremium: boolean;
  daysUsed: number;
  entries: DayEntry[];
  currentStep: OnboardingStep;
  email?: string;
}

export type OnboardingStep =
  | 'welcome'
  | 'mood'
  | 'emotions'
  | 'reflection'
  | 'gratitude'
  | 'goals'
  | 'complete'
  | 'login-prompt'
  | 'paywall';

export type Theme = 'light' | 'dark';
