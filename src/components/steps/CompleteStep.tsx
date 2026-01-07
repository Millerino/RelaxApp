import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from '../Calendar';
import { StreakBadge } from '../StreakBadge';
import { MoodGraph } from '../MoodGraph';
import { DailyInsight } from '../DailyInsight';
import { AuraDetailModal } from '../AuraDetailModal';
import { StatsCard } from '../StatsCard';
import { BreathingExercise } from '../BreathingExercise';
import type { DayEntry } from '../../types';

export function CompleteStep() {
  const { state, setStep, shouldShowPaywall, updateEntry } = useApp();
  const { user } = useAuth();
  const [showBreathing, setShowBreathing] = useState(false);
  const [showAuraDetail, setShowAuraDetail] = useState(false);

  // Check if should show paywall
  if (shouldShowPaywall) {
    return null; // Will be handled by parent
  }

  const today = new Date().toDateString();
  const todayEntry = state.entries.find(e => e.date === today);
  const streak = calculateStreak(state.entries);

  // Get user's first name from profile or email
  const userName = useMemo(() => {
    if (state.profile?.name) {
      return state.profile.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return null;
  }, [state.profile?.name, user?.email]);

  // Get time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }, []);

  const handleNewEntry = () => {
    setStep('welcome');
  };

  return (
    <>
      <div className="flex flex-col items-center min-h-[60vh] animate-fade-in pt-4">
        <div className="w-full max-w-5xl px-6">
          {/* Success state - today's entry exists */}
          {todayEntry ? (
            <>
              {/* Header section - centered */}
              <div className="text-center mb-8">
                {/* Streak badge at top */}
                {streak > 0 && (
                  <div className="mb-6">
                    <StreakBadge streak={streak} showMessage={true} />
                  </div>
                )}

                {/* Mini Aura Orb - clickable */}
                <div className="mb-6 flex justify-center">
                  <MiniAuraOrb
                    entries={state.entries}
                    xp={state.xp || 0}
                    onClick={() => setShowAuraDetail(true)}
                  />
                </div>

                <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
                  Today is captured
                </h2>
                <p className="text-silver-500 dark:text-silver-400 leading-relaxed">
                  Well done taking time for yourself. See you tomorrow!
                </p>
              </div>

              {/* Main content - 2 column grid on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  {/* Today's summary card */}
                  <div className="glass-card p-5 text-left">
                    <h3 className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-4">Today's Summary</h3>

                    {/* Mood display - clean and visual */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-xl ${getMoodGradient(todayEntry.mood)}
                                    flex items-center justify-center shadow-md`}>
                        <span className="text-lg font-bold text-white">{todayEntry.mood}</span>
                      </div>
                      <div>
                        <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide">Mood</p>
                        <p className={`text-lg font-semibold ${getMoodTextColor(todayEntry.mood)}`}>
                          {getMoodLabel(todayEntry.mood)}
                        </p>
                      </div>
                    </div>

                    {/* Emotions - cleaner display */}
                    {todayEntry.emotions.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2">
                          Emotions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {todayEntry.emotions.map(e => (
                            <span key={e} className="px-3 py-1.5 rounded-lg text-sm font-medium
                                                   bg-lavender-50 dark:bg-lavender-900/30
                                                   text-lavender-600 dark:text-lavender-300
                                                   border border-lavender-200 dark:border-lavender-800">
                              {e.charAt(0).toUpperCase() + e.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Goals */}
                    {todayEntry.goals.length > 0 && (
                      <div>
                        <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2">
                          Tomorrow's Focus
                        </p>
                        <ul className="space-y-2">
                          {todayEntry.goals.map(g => (
                            <li key={g.id} className="text-sm text-silver-700 dark:text-silver-300 flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-md bg-lavender-100 dark:bg-lavender-900/40
                                             flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              {g.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 7-day Mood Graph */}
                  {state.entries.length >= 2 && (
                    <div className="glass-card p-5">
                      <MoodGraph entries={state.entries} />
                    </div>
                  )}

                  {/* Calendar */}
                  <div className="glass-card p-5">
                    <Calendar entries={state.entries} onSaveEntry={updateEntry} />
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-4">Quick Actions</h3>
                    <button
                      onClick={() => setShowBreathing(true)}
                      className="w-full p-4 rounded-xl bg-lavender-50 dark:bg-lavender-900/20
                               flex items-center gap-4 hover:bg-lavender-100 dark:hover:bg-lavender-900/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-lavender-100 dark:bg-lavender-900/40
                                    flex items-center justify-center">
                        <svg className="w-6 h-6 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium text-silver-700 dark:text-silver-200 block">Breathing Exercise</span>
                        <span className="text-xs text-silver-500 dark:text-silver-400">Calm your mind with guided breathing</span>
                      </div>
                    </button>
                  </div>

                  {/* Statistics */}
                  {state.entries.length >= 3 && (
                    <StatsCard entries={state.entries} />
                  )}

                  {/* Daily Insight */}
                  <DailyInsight entries={state.entries} />
                </div>
              </div>

              {/* Footer */}
              <p className="text-sm text-silver-400 dark:text-silver-500 text-center mt-8">
                {state.daysUsed} day{state.daysUsed !== 1 ? 's' : ''} of reflection • {state.xp || 0} XP
              </p>
            </>
          ) : (
            /* No entry today - welcome back state */
            <>
              {/* Header section - centered */}
              <div className="text-center mb-8">
                {/* Show streak if returning user */}
                {streak > 0 && (
                  <div className="mb-6">
                    <StreakBadge streak={streak} showMessage={false} />
                  </div>
                )}

                {/* Mini Aura Orb for returning users */}
                {state.entries.length > 0 && (
                  <div className="mb-6 flex justify-center">
                    <MiniAuraOrb
                      entries={state.entries}
                      xp={state.xp || 0}
                      onClick={() => setShowAuraDetail(true)}
                    />
                  </div>
                )}

                {/* Personalized greeting */}
                <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-2">
                  {greeting}{userName ? `, ${userName}` : ''}
                </h2>
                <p className="text-silver-500 dark:text-silver-400 mb-6 leading-relaxed">
                  Ready for today's reflection?
                </p>

                {/* Quick Actions - centered */}
                <div className="flex gap-3 justify-center max-w-md mx-auto">
                  <button
                    onClick={handleNewEntry}
                    className="flex-1 btn-primary py-4"
                  >
                    Begin today's entry
                  </button>
                  <button
                    onClick={() => setShowBreathing(true)}
                    className="p-4 glass-card hover:bg-lavender-50/50 dark:hover:bg-lavender-900/20 transition-colors"
                    title="Breathing exercise"
                  >
                    <svg className="w-6 h-6 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Main content - 2 column grid on desktop for returning users */}
              {state.entries.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-6">
                    {/* 7-day Mood Graph */}
                    {state.entries.length >= 2 && (
                      <div className="glass-card p-5">
                        <MoodGraph entries={state.entries} />
                      </div>
                    )}

                    {/* Calendar */}
                    <div className="glass-card p-5">
                      <Calendar entries={state.entries} onSaveEntry={updateEntry} />
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    {/* Statistics */}
                    {state.entries.length >= 3 && (
                      <StatsCard entries={state.entries} />
                    )}

                    {/* Daily Insight */}
                    <DailyInsight entries={state.entries} />
                  </div>
                </div>
              ) : (
                /* New user - just show daily insight */
                <div className="max-w-md mx-auto">
                  <DailyInsight entries={state.entries} />
                </div>
              )}

              {/* Footer */}
              {state.entries.length > 0 && (
                <p className="text-sm text-silver-400 dark:text-silver-500 text-center mt-8">
                  {state.xp || 0} XP earned
                </p>
              )}
</>
          )}
        </div>
      </div>

      {/* Breathing Exercise Modal */}
      {showBreathing && (
        <BreathingExercise onClose={() => setShowBreathing(false)} />
      )}

      {/* Aura Detail Modal */}
      {showAuraDetail && (
        <AuraDetailModal
          entries={state.entries}
          xp={state.xp || 0}
          onClose={() => setShowAuraDetail(false)}
        />
      )}
    </>
  );
}

// Mini Aura Orb component for header
interface MiniAuraOrbProps {
  entries: DayEntry[];
  xp: number;
  onClick: () => void;
}

function MiniAuraOrb({ entries, xp, onClick }: MiniAuraOrbProps) {
  const EVOLUTION_STAGES = [
    { name: 'Spark', minXP: 0 },
    { name: 'Ember', minXP: 50 },
    { name: 'Flame', minXP: 150 },
    { name: 'Blaze', minXP: 300 },
    { name: 'Radiance', minXP: 500 },
    { name: 'Aurora', minXP: 800 },
    { name: 'Celestial', minXP: 1200 },
  ];

  // Calculate vitality based on days since last entry
  const daysSinceLastEntry = (() => {
    if (entries.length === 0) return Infinity;
    const sortedEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);
    const lastEntry = new Date(sortedEntries[0].date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastEntry.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - lastEntry.getTime()) / (1000 * 60 * 60 * 24));
  })();

  const vitality = (() => {
    if (daysSinceLastEntry === 0) return 1;
    if (daysSinceLastEntry === 1) return 0.9;
    if (daysSinceLastEntry === 2) return 0.7;
    if (daysSinceLastEntry === 3) return 0.4;
    return 0.2;
  })();

  // Get current stage
  const currentStage = (() => {
    for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
      if (xp >= EVOLUTION_STAGES[i].minXP) {
        return EVOLUTION_STAGES[i];
      }
    }
    return EVOLUTION_STAGES[0];
  })();

  // Get color based on average recent mood
  const recentMoods = entries.slice(-7).map(e => e.mood);
  const avgMood = recentMoods.length > 0
    ? recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
    : 3;

  const getGradientColors = () => {
    if (avgMood >= 4.5) return ['#34d399', '#10b981', '#059669'];
    if (avgMood >= 4) return ['#a78bfa', '#8b5cf6', '#7c3aed'];
    if (avgMood >= 3) return ['#a78bfa', '#818cf8', '#6366f1'];
    if (avgMood >= 2) return ['#fbbf24', '#f59e0b', '#d97706'];
    return ['#f87171', '#ef4444', '#dc2626'];
  };

  const colors = getGradientColors();
  const size = 80;
  const opacity = 0.5 + vitality * 0.5;

  return (
    <button
      onClick={onClick}
      className="relative group cursor-pointer"
      title={`${currentStage.name} • ${xp} XP - Click for details`}
    >
      {/* Outer glow */}
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          width: size * 1.4,
          height: size * 1.4,
          background: `radial-gradient(circle, ${colors[0]}30, transparent 70%)`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          animationDuration: '3s',
        }}
      />

      {/* Main orb */}
      <div
        className="relative rounded-full transition-all duration-300 group-hover:scale-110"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
          boxShadow: `
            0 0 ${20 * vitality}px ${colors[0]}60,
            0 0 ${40 * vitality}px ${colors[1]}40,
            inset 0 0 ${15 * vitality}px rgba(255,255,255,0.3)
          `,
          opacity,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute inset-[15%] rounded-full"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent 60%)' }}
        />
      </div>

      {/* Hover indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-silver-500 dark:text-silver-400 whitespace-nowrap">
          {currentStage.name}
        </span>
      </div>
    </button>
  );
}

function calculateStreak(entries: DayEntry[]): number {
  if (entries.length === 0) return 0;

  // Sort entries by date descending
  const sortedEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if latest entry is today or yesterday
  const latestDate = new Date(sortedEntries[0].date);
  latestDate.setHours(0, 0, 0, 0);

  if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
    return 0; // Streak broken
  }

  let streak = 1;
  let checkDate = new Date(latestDate);
  checkDate.setDate(checkDate.getDate() - 1);

  for (let i = 1; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (entryDate.getTime() < checkDate.getTime()) {
      break; // Gap in streak
    }
  }

  return streak;
}

function getMoodLabel(mood: number): string {
  const labels: Record<number, string> = {
    1: 'Difficult',
    2: 'Challenging',
    3: 'Okay',
    4: 'Good',
    5: 'Great',
  };
  return labels[mood] || 'Okay';
}

// Softer mood gradients that blend with lavender theme
function getMoodGradient(mood: number): string {
  const gradients: Record<number, string> = {
    1: 'bg-gradient-to-br from-red-300 to-red-400 shadow-red-400/15',
    2: 'bg-gradient-to-br from-orange-300 to-orange-400 shadow-orange-400/15',
    3: 'bg-gradient-to-br from-amber-300 to-amber-400 shadow-amber-400/15',
    4: 'bg-gradient-to-br from-lime-300 to-lime-400 shadow-lime-400/15',
    5: 'bg-gradient-to-br from-emerald-300 to-emerald-400 shadow-emerald-400/15',
  };
  return gradients[mood] || gradients[3];
}

function getMoodTextColor(mood: number): string {
  const colors: Record<number, string> = {
    1: 'text-red-500 dark:text-red-400',
    2: 'text-orange-500 dark:text-orange-400',
    3: 'text-amber-500 dark:text-amber-400',
    4: 'text-lime-500 dark:text-lime-400',
    5: 'text-emerald-500 dark:text-emerald-400',
  };
  return colors[mood] || colors[3];
}

