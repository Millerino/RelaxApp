import type { DayEntry } from '../types';

interface DayDetailModalProps {
  entry: DayEntry | null;
  date: Date;
  onClose: () => void;
  isEmpty: boolean;
}

export function DayDetailModal({ entry, date, onClose, isEmpty }: DayDetailModalProps) {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-6 md:p-8 w-full max-w-md animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-silver-500 hover:text-silver-700
                   dark:text-silver-400 dark:hover:text-silver-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Date header */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-silver-800 dark:text-silver-100">
            {formattedDate}
          </h3>
        </div>

        {isEmpty ? (
          /* Empty day prompt */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-silver-100 dark:bg-silver-800
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-silver-400 dark:text-silver-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="text-xl font-light text-silver-700 dark:text-silver-200 mb-2">
              No reflection yet
            </h4>
            <p className="text-silver-500 dark:text-silver-400 mb-6 text-sm">
              This day doesn't have a journal entry. Past reflections help you understand your patterns over time.
            </p>
            <button
              onClick={onClose}
              className="btn-secondary px-6 py-2.5 text-sm"
            >
              Close
            </button>
          </div>
        ) : entry && (
          /* Entry details */
          <div className="space-y-5">
            {/* Mood display */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${getMoodBgColor(entry.mood)}
                            flex items-center justify-center shadow-md`}>
                <span className="text-xl font-bold text-white">{entry.mood}</span>
              </div>
              <div>
                <p className="text-sm text-silver-500 dark:text-silver-400">Mood</p>
                <p className={`text-lg font-medium ${getMoodTextColor(entry.mood)}`}>
                  {getMoodLabel(entry.mood)}
                </p>
              </div>
            </div>

            {/* Emotions */}
            {entry.emotions.length > 0 && (
              <div>
                <p className="text-sm text-silver-500 dark:text-silver-400 mb-2">Emotions felt</p>
                <div className="flex flex-wrap gap-2">
                  {entry.emotions.map(e => (
                    <span key={e} className="px-3 py-1.5 rounded-full text-sm
                                           bg-lavender-100 dark:bg-lavender-900/50
                                           text-lavender-700 dark:text-lavender-300
                                           border border-lavender-200 dark:border-lavender-700/50">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reflection */}
            {entry.reflection && (
              <div>
                <p className="text-sm text-silver-500 dark:text-silver-400 mb-2">Reflection</p>
                <p className="text-silver-700 dark:text-silver-200 text-sm leading-relaxed
                            bg-silver-50 dark:bg-silver-800/50 rounded-xl p-4">
                  {entry.reflection}
                </p>
              </div>
            )}

            {/* Gratitude */}
            {entry.gratitude && (
              <div>
                <p className="text-sm text-silver-500 dark:text-silver-400 mb-2">Gratitude</p>
                <p className="text-silver-700 dark:text-silver-200 text-sm leading-relaxed
                            bg-silver-50 dark:bg-silver-800/50 rounded-xl p-4">
                  {entry.gratitude}
                </p>
              </div>
            )}

            {/* Goals */}
            {entry.goals && entry.goals.length > 0 && (
              <div>
                <p className="text-sm text-silver-500 dark:text-silver-400 mb-2">Goals set</p>
                <ul className="space-y-2">
                  {entry.goals.map(g => (
                    <li key={g.id} className="flex items-center gap-2 text-sm text-silver-700 dark:text-silver-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                      {g.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Close button */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="btn-secondary w-full py-2.5 text-sm"
              >
                Close
              </button>
            </div>
          </div>
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

function getMoodBgColor(mood: number): string {
  const colors: Record<number, string> = {
    1: 'bg-gradient-to-br from-red-400 to-red-500',
    2: 'bg-gradient-to-br from-orange-400 to-orange-500',
    3: 'bg-gradient-to-br from-amber-400 to-amber-500',
    4: 'bg-gradient-to-br from-lime-400 to-lime-500',
    5: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
  };
  return colors[mood] || colors[3];
}

function getMoodTextColor(mood: number): string {
  const colors: Record<number, string> = {
    1: 'text-red-600 dark:text-red-400',
    2: 'text-orange-600 dark:text-orange-400',
    3: 'text-amber-600 dark:text-amber-400',
    4: 'text-lime-600 dark:text-lime-400',
    5: 'text-emerald-600 dark:text-emerald-400',
  };
  return colors[mood] || colors[3];
}
