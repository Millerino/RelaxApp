import { useApp } from '../../context/AppContext';
import { Calendar } from '../Calendar';
import { StreakBadge } from '../StreakBadge';
import type { DayEntry } from '../../types';

export function CompleteStep() {
  const { state, setStep, shouldShowPaywall } = useApp();

  // Check if should show paywall
  if (shouldShowPaywall) {
    return null; // Will be handled by parent
  }

  const today = new Date().toDateString();
  const todayEntry = state.entries.find(e => e.date === today);
  const streak = calculateStreak(state.entries);

  const handleNewEntry = () => {
    setStep('welcome');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center w-full max-w-md px-6">
        {/* Success state */}
        {todayEntry ? (
          <>
            {/* Streak badge at top */}
            {streak > 0 && (
              <div className="mb-6">
                <StreakBadge streak={streak} showMessage={true} />
              </div>
            )}

            {/* Success icon */}
            <div className="mb-6 flex justify-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl
                            ${getMoodGradient(todayEntry.mood)}`}>
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
              Today is captured
            </h2>
            <p className="text-silver-500 dark:text-silver-400 mb-6 leading-relaxed">
              Well done taking time for yourself. See you tomorrow!
            </p>

            {/* Today's summary card */}
            <div className="glass-card p-5 text-left mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-silver-500 dark:text-silver-400">Today's mood</span>
                <span className={`text-base font-medium ${getMoodTextColor(todayEntry.mood)}`}>
                  {getMoodLabel(todayEntry.mood)}
                </span>
              </div>

              {todayEntry.emotions.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm text-silver-500 dark:text-silver-400 block mb-2">Emotions felt</span>
                  <div className="flex flex-wrap gap-1.5">
                    {todayEntry.emotions.map(e => (
                      <span key={e} className="px-2.5 py-1 rounded-full text-xs
                                             bg-lavender-100 dark:bg-lavender-900/40
                                             text-lavender-700 dark:text-lavender-300">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {todayEntry.goals.length > 0 && (
                <div>
                  <span className="text-sm text-silver-500 dark:text-silver-400 block mb-2">Tomorrow's focus</span>
                  <ul className="space-y-1">
                    {todayEntry.goals.map(g => (
                      <li key={g.id} className="text-sm text-silver-700 dark:text-silver-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                        {g.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="glass-card p-5 mb-6">
              <Calendar entries={state.entries} />
            </div>

            <p className="text-sm text-silver-400 dark:text-silver-500">
              {state.daysUsed} day{state.daysUsed !== 1 ? 's' : ''} of reflection
            </p>
          </>
        ) : (
          <>
            {/* Show streak if returning user */}
            {streak > 0 && (
              <div className="mb-6">
                <StreakBadge streak={streak} showMessage={false} />
              </div>
            )}

            <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
              Welcome back
            </h2>
            <p className="text-silver-500 dark:text-silver-400 mb-6 leading-relaxed">
              Ready for today's reflection?
            </p>

            {/* Show calendar for returning users */}
            {state.entries.length > 0 && (
              <div className="glass-card p-5 mb-6">
                <Calendar entries={state.entries} />
              </div>
            )}

            <button
              onClick={handleNewEntry}
              className="btn-primary px-10 py-4"
            >
              Begin today's entry
            </button>
          </>
        )}
      </div>
    </div>
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
