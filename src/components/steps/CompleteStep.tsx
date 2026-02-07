import { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from '../Calendar';
import { StreakBadge } from '../StreakBadge';
import { MoodGraph } from '../MoodGraph';
import { DailyInsight } from '../DailyInsight';
import { AuraDetailModal } from '../AuraDetailModal';
import { StatsCard } from '../StatsCard';
import { BreathingExercise } from '../BreathingExercise';
import { AuthModal } from '../AuthModal';
import { DayDetailModal } from '../DayDetailModal';
import { QuickNotes } from '../QuickNotes';
import { PatternInsight } from '../PatternInsight';
import type { DayEntry } from '../../types';

export function CompleteStep() {
  const { state, setStep, shouldShowPaywall, updateEntry } = useApp();
  const { user } = useAuth();
  const [showBreathing, setShowBreathing] = useState(false);
  const [showAuraDetail, setShowAuraDetail] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [showTodayEditor, setShowTodayEditor] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasTriggeredConfetti = useRef(false);

  const today = new Date().toDateString();
  const todayEntry = state.entries.find(e => e.date === today);
  const streak = calculateStreak(state.entries);

  // Trigger confetti when entry is first completed
  useEffect(() => {
    if (todayEntry && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [todayEntry]);

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

  // Check if should show paywall (but not if user is authenticated via Supabase)
  // Placed after all hooks to satisfy React's Rules of Hooks
  if (shouldShowPaywall && !user) {
    return null; // Will be handled by parent
  }

  const handleNewEntry = () => {
    setStep('mood');
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

              {/* Signup prompt for non-logged-in users */}
              {!user && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-lavender-500/10 to-lavender-600/10 border border-lavender-300/30 dark:border-lavender-700/30">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-medium text-silver-700 dark:text-silver-200">
                        Save your progress
                      </p>
                      <p className="text-xs text-silver-500 dark:text-silver-400">
                        Create a free account to keep your entries safe
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-lavender-500 text-white hover:bg-lavender-600 transition-colors"
                      >
                        Sign up free
                      </button>
                      <button
                        onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-lavender-600 dark:text-lavender-400 hover:bg-lavender-100 dark:hover:bg-lavender-900/30 transition-colors"
                      >
                        Log in
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Main content - 2 column grid on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  {/* Today's summary card - clickable to edit */}
                  <button
                    onClick={() => setShowTodayEditor(true)}
                    className="glass-card p-5 text-left w-full hover:ring-2 hover:ring-lavender-400/50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-silver-700 dark:text-silver-200">Today's Summary</h3>
                      <span className="text-xs text-lavender-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to edit
                      </span>
                    </div>

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
                  </button>

                  {/* 7-day Mood Graph */}
                  {state.entries.length >= 2 && (
                    <div className="glass-card p-5">
                      <MoodGraph entries={state.entries} weekOffset={weekOffset} />
                    </div>
                  )}

                  {/* Calendar */}
                  <div className="glass-card p-5">
                    <Calendar entries={state.entries} onSaveEntry={updateEntry} quickNotes={state.quickNotes} weekOffset={weekOffset} onWeekOffsetChange={setWeekOffset} />
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {/* Quick Actions - Grid layout */}
                  <div className="glass-card p-4">
                    <h3 className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowBreathing(true)}
                        className="p-3 rounded-xl bg-lavender-50 dark:bg-lavender-900/20
                                 flex flex-col items-center gap-2 hover:bg-lavender-100 dark:hover:bg-lavender-900/30 transition-all hover:scale-[1.02]"
                      >
                        <img src="/images/actions/breathe.png" alt="Breathe" className="w-10 h-10 rounded-xl object-cover" />
                        <span className="text-xs font-medium text-silver-700 dark:text-silver-200">Breathe</span>
                      </button>

                      <button
                        onClick={() => setShowAuraDetail(true)}
                        className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20
                                 flex flex-col items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all hover:scale-[1.02]"
                      >
                        <img src="/images/actions/your-aura.png" alt="Your Aura" className="w-10 h-10 rounded-xl object-cover" />
                        <span className="text-xs font-medium text-silver-700 dark:text-silver-200">Your Aura</span>
                      </button>

                      <button
                        onClick={handleNewEntry}
                        className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20
                                 flex flex-col items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all hover:scale-[1.02]"
                      >
                        <img src="/images/actions/new-entry.png" alt="New Entry" className="w-10 h-10 rounded-xl object-cover" />
                        <span className="text-xs font-medium text-silver-700 dark:text-silver-200">New Entry</span>
                      </button>

                      <button
                        onClick={() => {
                          const event = new CustomEvent('openProfileEditor');
                          window.dispatchEvent(event);
                        }}
                        className="p-3 rounded-xl bg-silver-50 dark:bg-silver-800/50
                                 flex flex-col items-center gap-2 hover:bg-silver-100 dark:hover:bg-silver-700/50 transition-all hover:scale-[1.02]"
                      >
                        <img src="/images/actions/profile.png" alt="Profile" className="w-10 h-10 rounded-xl object-cover" />
                        <span className="text-xs font-medium text-silver-700 dark:text-silver-200">Profile</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Notes */}
                  <QuickNotes />

                  {/* Pattern Insight - occasional, language only */}
                  {state.entries.length >= 5 && (
                    <PatternInsight entries={state.entries} />
                  )}

                  {/* Statistics */}
                  {state.entries.length >= 3 && (
                    <StatsCard entries={state.entries} />
                  )}
                </div>
              </div>

              {/* Daily Insight - Compact footer style */}
              <div className="mt-6 px-2">
                <DailyInsight entries={state.entries} compact />
              </div>
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
                        <MoodGraph entries={state.entries} weekOffset={weekOffset} />
                      </div>
                    )}

                    {/* Calendar */}
                    <div className="glass-card p-5">
                      <Calendar entries={state.entries} onSaveEntry={updateEntry} quickNotes={state.quickNotes} weekOffset={weekOffset} onWeekOffsetChange={setWeekOffset} />
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

      {/* Auth Modal for signup prompt */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      )}

      {/* Today's Entry Editor */}
      {showTodayEditor && (
        <DayDetailModal
          entry={todayEntry || null}
          date={new Date()}
          onClose={() => setShowTodayEditor(false)}
          isEmpty={!todayEntry}
          onSaveEntry={(entry: DayEntry) => {
            updateEntry(entry);
            setShowTodayEditor(false);
          }}
        />
      )}

      {/* Confetti celebration effect */}
      {showConfetti && <ConfettiEffect />}
    </>
  );
}

function ConfettiEffect() {
  const particles = useMemo(() => {
    const colors = ['#c4b5fd', '#a78bfa', '#8b5cf6', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1.5,
      size: 4 + Math.random() * 6,
      drift: -30 + Math.random() * 60,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  );
}

// Mini Aura Orb component for header - with XP progress and better interactivity
interface MiniAuraOrbProps {
  entries: DayEntry[];
  xp: number;
  onClick: () => void;
}

function MiniAuraOrb({ entries, xp, onClick }: MiniAuraOrbProps) {
  const EVOLUTION_STAGES = [
    { name: 'Spark', minXP: 0, colors: ['#cbd5e1', '#94a3b8', '#64748b'], image: '/images/aura/spark.png' },
    { name: 'Ember', minXP: 50, colors: ['#fcd34d', '#f97316', '#ea580c'], image: '/images/aura/ember.png' },
    { name: 'Flame', minXP: 150, colors: ['#fde047', '#eab308', '#ca8a04'], image: '/images/aura/flame.png' },
    { name: 'Blaze', minXP: 300, colors: ['#fbbf24', '#f59e0b', '#d97706'], image: '/images/aura/blaze.png' },
    { name: 'Radiance', minXP: 500, colors: ['#c4b5fd', '#a78bfa', '#8b5cf6'], image: '/images/aura/radiance.png' },
    { name: 'Aurora', minXP: 800, colors: ['#a5b4fc', '#818cf8', '#6366f1'], image: '/images/aura/aurora.png' },
    { name: 'Celestial', minXP: 1200, colors: ['#e9d5ff', '#c084fc', '#a855f7'], image: '/images/aura/celestial.png' },
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

  const vitalityLabel = (() => {
    if (vitality >= 0.9) return 'Thriving';
    if (vitality >= 0.7) return 'Healthy';
    if (vitality >= 0.4) return 'Fading';
    return 'Dormant';
  })();

  // Get current and next stage
  const getCurrentStageIndex = () => {
    for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
      if (xp >= EVOLUTION_STAGES[i].minXP) return i;
    }
    return 0;
  };

  const stageIndex = getCurrentStageIndex();
  const currentStage = EVOLUTION_STAGES[stageIndex];
  const nextStage = EVOLUTION_STAGES[stageIndex + 1];

  // Progress to next stage
  const progressToNext = nextStage
    ? (xp - currentStage.minXP) / (nextStage.minXP - currentStage.minXP)
    : 1;

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
  const size = 72;
  const opacity = 0.6 + vitality * 0.4;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group cursor-pointer relative"
    >
      {/* Hover card with evolution details - appears on hover */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full
                     opacity-0 group-hover:opacity-100 pointer-events-none
                     transition-all duration-300 ease-out z-20
                     group-hover:-translate-y-[calc(100%+8px)]">
        <div className="bg-white dark:bg-silver-800 rounded-xl shadow-xl p-3 w-48
                       border border-silver-200 dark:border-silver-700">
          {/* Stage progression - mini images */}
          <div className="flex justify-between items-center mb-3 px-1">
            {EVOLUTION_STAGES.map((stage, i) => (
              i <= stageIndex ? (
                <img
                  key={stage.name}
                  src={stage.image}
                  alt={stage.name}
                  className={`w-5 h-5 transition-all duration-300 ${
                    i === stageIndex ? 'ring-2 ring-lavender-400 rounded-full ring-offset-1 ring-offset-white dark:ring-offset-silver-800 scale-125' : 'opacity-60'
                  }`}
                  style={{ filter: `drop-shadow(0 0 3px ${stage.colors[0]}60)` }}
                  title={stage.name}
                />
              ) : (
                <div
                  key={stage.name}
                  className="w-4 h-4 rounded-full border border-dashed border-silver-300 dark:border-silver-600"
                  title={stage.name}
                />
              )
            ))}
          </div>

          {/* Current stage info */}
          <div className="text-center mb-2">
            <p className="text-sm font-medium text-silver-800 dark:text-silver-100">
              {currentStage.name}
            </p>
            <p className="text-xs text-silver-500 dark:text-silver-400">
              {vitalityLabel}
            </p>
          </div>

          {/* Progress to next - softer language */}
          {nextStage && (
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-silver-500 dark:text-silver-400 mb-1">
                <span>Growing toward {nextStage.name}</span>
              </div>
              <div className="h-1.5 bg-silver-200 dark:bg-silver-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressToNext * 100}%`,
                    background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Tap to explore */}
          <p className="text-[10px] text-center text-lavender-500 dark:text-lavender-400 pt-1 border-t border-silver-100 dark:border-silver-700">
            Tap to explore your journey
          </p>

          {/* Arrow pointing down */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3
                         bg-white dark:bg-silver-800 rotate-45
                         border-r border-b border-silver-200 dark:border-silver-700" />
        </div>
      </div>

      {/* Image container with hover effects */}
      <div className="relative">
        {/* Outer glow - expands on hover */}
        <div
          className="absolute rounded-full transition-all duration-500 group-hover:scale-150"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            background: `radial-gradient(circle, ${colors[0]}25, transparent 70%)`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Main aura image */}
        <img
          src={currentStage.image}
          alt={currentStage.name}
          className="relative transition-all duration-300 ease-out
                     group-hover:scale-110 group-hover:-translate-y-1"
          style={{
            width: size,
            height: size,
            opacity,
            filter: `drop-shadow(0 0 ${15 * vitality}px ${colors[0]}50) drop-shadow(0 0 ${30 * vitality}px ${colors[1]}30)`,
          }}
        />
      </div>

      {/* Label below orb - no explicit XP */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium text-silver-600 dark:text-silver-300 group-hover:text-lavender-500 transition-colors">
          {currentStage.name}
        </span>

        {/* Subtle progress indicator - no numbers */}
        <div className="w-16 h-1 bg-silver-200 dark:bg-silver-700 rounded-full overflow-hidden
                      group-hover:h-1.5 transition-all">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressToNext * 100}%`,
              background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
            }}
          />
        </div>
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

