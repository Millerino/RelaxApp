import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../AuthModal';
import type { MoodLevel } from '../../types';

const moodLabels: Record<MoodLevel, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

const moodEmojis: Record<MoodLevel, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

const moodColors: Record<MoodLevel, string> = {
  1: 'from-red-400 to-red-500',
  2: 'from-amber-400 to-amber-500',
  3: 'from-yellow-400 to-yellow-500',
  4: 'from-emerald-400 to-emerald-500',
  5: 'from-green-400 to-green-500',
};

export function LoginPrompt() {
  const { currentEntry, skipLogin, saveDayEntry } = useApp();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const mood = (currentEntry.mood || 3) as MoodLevel;
  const emotions = currentEntry.emotions || [];
  const reflection = currentEntry.reflection || '';
  const gratitude = currentEntry.gratitude || '';
  const goals = currentEntry.goals || [];

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleLogIn = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleContinueWithoutSaving = () => {
    saveDayEntry();
    skipLogin();
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    // If user is now logged in, save and continue
    if (user) {
      saveDayEntry();
      skipLogin();
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[70vh] animate-slide-up py-4">
      <div className="w-full max-w-md px-4 sm:px-6">
        {/* Success header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-light text-silver-800 dark:text-silver-100 mb-2">
            Your day, captured
          </h2>
          <p className="text-silver-500 dark:text-silver-400 text-sm">
            Here's a preview of your check-in
          </p>
        </div>

        {/* Day Preview Card */}
        <div className="glass-card p-4 sm:p-6 mb-6 space-y-4">
          {/* Mood */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${moodColors[mood]} flex items-center justify-center text-xl sm:text-2xl`}>
              {moodEmojis[mood]}
            </div>
            <div>
              <p className="text-xs text-silver-400 dark:text-silver-500 uppercase tracking-wide">Mood</p>
              <p className="text-silver-800 dark:text-silver-100 font-medium">{moodLabels[mood]}</p>
            </div>
          </div>

          {/* Emotions */}
          {emotions.length > 0 && (
            <div>
              <p className="text-xs text-silver-400 dark:text-silver-500 uppercase tracking-wide mb-2">Feelings</p>
              <div className="flex flex-wrap gap-1.5">
                {emotions.slice(0, 5).map((emotion, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-full bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-300"
                  >
                    {emotion}
                  </span>
                ))}
                {emotions.length > 5 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-silver-100 dark:bg-silver-800 text-silver-500">
                    +{emotions.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reflection */}
          {reflection && (
            <div>
              <p className="text-xs text-silver-400 dark:text-silver-500 uppercase tracking-wide mb-1">Reflection</p>
              <p className="text-sm text-silver-600 dark:text-silver-300 line-clamp-2 italic">
                "{reflection}"
              </p>
            </div>
          )}

          {/* Gratitude */}
          {gratitude && (
            <div>
              <p className="text-xs text-silver-400 dark:text-silver-500 uppercase tracking-wide mb-1">Grateful for</p>
              <p className="text-sm text-silver-600 dark:text-silver-300 line-clamp-2">
                {gratitude}
              </p>
            </div>
          )}

          {/* Goals */}
          {goals.length > 0 && (
            <div>
              <p className="text-xs text-silver-400 dark:text-silver-500 uppercase tracking-wide mb-1">Tomorrow's goals</p>
              <ul className="space-y-1">
                {goals.slice(0, 3).map((goal, i) => (
                  <li key={i} className="text-sm text-silver-600 dark:text-silver-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                    {goal.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sign up prompt */}
        <div className="text-center space-y-4">
          <p className="text-silver-600 dark:text-silver-300 text-sm">
            Sign up to save your progress and track your journey over time
          </p>

          <button
            onClick={handleSignUp}
            className="btn-primary w-full py-3 text-base"
          >
            Create free account
          </button>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-silver-400 dark:text-silver-500">Already have an account?</span>
            <button
              onClick={handleLogIn}
              className="text-lavender-500 hover:text-lavender-600 font-medium"
            >
              Log in
            </button>
          </div>

          <button
            onClick={handleContinueWithoutSaving}
            className="text-silver-400 hover:text-silver-600 dark:hover:text-silver-300 transition-colors text-sm mt-2"
          >
            Continue without saving
          </button>
        </div>

        <p className="mt-6 text-xs text-silver-400 dark:text-silver-500 leading-relaxed text-center">
          Your reflections stay private and secure.
        </p>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={handleAuthClose} initialMode={authMode} />
      )}
    </div>
  );
}
