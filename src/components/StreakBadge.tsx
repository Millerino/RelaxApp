interface Props {
  streak: number;
  showMessage?: boolean;
}

export function StreakBadge({ streak, showMessage = false }: Props) {
  if (streak < 1) return null;

  const getMessage = () => {
    if (streak === 1) return "You've started your journey!";
    if (streak === 2) return "Two days strong!";
    if (streak === 3) return "Three days in a row!";
    if (streak === 7) return "One week streak!";
    if (streak === 14) return "Two weeks of reflection!";
    if (streak >= 100) return "Legendary dedication!";
    if (streak >= 50) return "Incredible commitment!";
    if (streak >= 30) return "One month champion!";
    if (streak >= 21) return "Habit formed!";
    return `${streak} day streak!`;
  };

  return (
    <div className="flex flex-col items-center gap-2 animate-fade-in">
      {/* Streak badge - softer lavender tones */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                    bg-gradient-to-r from-lavender-300 to-lavender-400
                    dark:from-lavender-500/80 dark:to-lavender-600/80
                    text-white shadow-md shadow-lavender-400/20">
        <svg className="w-4 h-4 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-sm font-semibold">{streak}</span>
        <span className="text-xs opacity-80">day{streak !== 1 ? 's' : ''}</span>
      </div>

      {/* Message */}
      {showMessage && (
        <p className="text-sm font-medium text-lavender-600 dark:text-lavender-400 text-center">
          {getMessage()}
        </p>
      )}
    </div>
  );
}
