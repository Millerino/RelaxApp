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

export interface UserProfile {
  name: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  country?: string;
  timezone?: string;
  wellnessGoals?: WellnessGoal[];
  notificationPreferences?: NotificationPreferences;
  createdAt: number;
}

export type WellnessGoal =
  | 'reduce-stress'
  | 'improve-sleep'
  | 'build-mindfulness'
  | 'track-emotions'
  | 'increase-gratitude'
  | 'boost-productivity'
  | 'better-relationships'
  | 'self-discovery';

export interface NotificationPreferences {
  dailyReminder: boolean;
  reminderTime?: string;
  weeklyInsights: boolean;
}

export interface QuickNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface UserState {
  isOnboarded: boolean;
  isLoggedIn: boolean;
  isPremium: boolean;
  daysUsed: number;
  entries: DayEntry[];
  currentStep: OnboardingStep;
  email?: string;
  profile?: UserProfile;
  xp: number;
  quickNotes?: QuickNote[];
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
