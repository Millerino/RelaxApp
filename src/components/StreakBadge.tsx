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
    if (streak === 30) return "One month champion!";
    if (streak >= 100) return "Legendary dedication!";
    if (streak >= 50) return "Incredible commitment!";
    if (streak >= 21) return "Habit formed!";
    return `${streak} day streak!`;
  };

  return (
    <div className="flex flex-col items-center gap-2 animate-slide-up">
      {/* Streak badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                    bg-gradient-to-r from-amber-400 to-orange-400
                    dark:from-amber-500 dark:to-orange-500
                    text-white shadow-lg shadow-orange-500/25">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span className="text-sm font-semibold">{streak}</span>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      </div>

      {/* Message */}
      {showMessage && (
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 text-center">
          {getMessage()}
        </p>
      )}
    </div>
  );
}
