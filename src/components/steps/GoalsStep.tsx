import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Celebration } from '../Celebration';
import type { Goal } from '../../types';

export function GoalsStep() {
  const { setGoals, setStep, saveDayEntry, currentEntry, state } = useApp();
  const [goals, setLocalGoals] = useState<Goal[]>(
    currentEntry.goals || [{ id: crypto.randomUUID(), text: '', completed: false }]
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const handleGoalChange = (id: string, text: string) => {
    setLocalGoals(prev =>
      prev.map(g => g.id === id ? { ...g, text } : g)
    );
  };

  const addGoal = () => {
    if (goals.length < 5) {
      setLocalGoals(prev => [...prev, { id: crypto.randomUUID(), text: '', completed: false }]);
    }
  };

  const removeGoal = (id: string) => {
    if (goals.length > 1) {
      setLocalGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleComplete = () => {
    const validGoals = goals.filter(g => g.text.trim());
    setGoals(validGoals);
    saveDayEntry();

    // Show celebration before navigating
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    // Show login prompt for first-time users
    if (!state.isLoggedIn && !state.isOnboarded) {
      setStep('login-prompt');
    } else {
      setStep('complete');
    }
  };

  const handleCancel = () => {
    setStep('complete');
  };

  return (
    <>
      {showCelebration && (
        <Celebration onComplete={handleCelebrationComplete} duration={1800} />
      )}
      <div className="relative flex flex-col items-center justify-start pt-8 md:justify-center md:pt-0 min-h-0 md:min-h-[60vh] animate-slide-up">
      {/* Cancel button */}
      <button
        onClick={handleCancel}
        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full
                 bg-silver-100 dark:bg-silver-800 text-silver-500 dark:text-silver-400
                 hover:bg-silver-200 dark:hover:bg-silver-700 hover:text-silver-700 dark:hover:text-silver-200
                 transition-all"
        title="Cancel and go back"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center w-full max-w-lg px-6">
        <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
          Tomorrow's intentions
        </h2>
        <p className="text-silver-500 dark:text-silver-400 mb-8">
          What would you like to focus on?
        </p>

        <div className="space-y-3 mb-8">
          {goals.map((goal, index) => (
            <div key={goal.id} className="flex gap-2 items-center">
              <span className="text-silver-400 dark:text-silver-500 text-sm w-6">
                {index + 1}.
              </span>
              <input
                type="text"
                value={goal.text}
                onChange={e => handleGoalChange(goal.id, e.target.value)}
                placeholder="Enter a goal..."
                className="input-field flex-1 text-base"
              />
              {goals.length > 1 && (
                <button
                  onClick={() => removeGoal(goal.id)}
                  className="p-2 text-silver-400 hover:text-silver-600 dark:hover:text-silver-300
                           transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {goals.length < 5 && (
          <button
            onClick={addGoal}
            className="mb-8 text-lavender-500 hover:text-lavender-600 dark:text-lavender-400
                     dark:hover:text-lavender-300 transition-colors text-sm font-medium"
          >
            + Add another goal
          </button>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setStep('gratitude')}
            className="btn-secondary px-8 py-3"
          >
            Back
          </button>
          <button
            onClick={handleComplete}
            className="btn-primary px-10 py-3"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
