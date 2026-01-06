import { useApp } from '../../context/AppContext';

export function CompleteStep() {
  const { state, setStep, shouldShowPaywall } = useApp();

  // Check if should show paywall
  if (shouldShowPaywall) {
    return null; // Will be handled by parent
  }

  const today = new Date().toDateString();
  const todayEntry = state.entries.find(e => e.date === today);

  const handleNewEntry = () => {
    setStep('welcome');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center w-full max-w-md px-6">
        {/* Success state */}
        {todayEntry ? (
          <>
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-500
                            flex items-center justify-center shadow-xl shadow-lavender-500/25
                            animate-pulse-soft">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
              Today is captured
            </h2>
            <p className="text-silver-500 dark:text-silver-400 mb-8 leading-relaxed">
              Well done taking time for yourself. See you tomorrow for another moment of reflection.
            </p>

            {/* Today's summary */}
            <div className="glass-card p-6 text-left mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-silver-500 dark:text-silver-400">Today's mood</span>
                <span className="text-lg font-medium text-lavender-600 dark:text-lavender-400">
                  {getMoodLabel(todayEntry.mood)}
                </span>
              </div>

              {todayEntry.emotions.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm text-silver-500 dark:text-silver-400 block mb-2">Emotions felt</span>
                  <div className="flex flex-wrap gap-2">
                    {todayEntry.emotions.map(e => (
                      <span key={e} className="px-3 py-1 rounded-full text-sm
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

            <p className="text-sm text-silver-400 dark:text-silver-500">
              {state.daysUsed} day{state.daysUsed !== 1 ? 's' : ''} of reflection
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
              Welcome back
            </h2>
            <p className="text-silver-500 dark:text-silver-400 mb-8 leading-relaxed">
              Ready for today's reflection?
            </p>
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
