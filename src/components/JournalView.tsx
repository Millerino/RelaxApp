import { useState, useEffect, useCallback, useMemo } from 'react';
import type { DayEntry } from '../types';

interface JournalViewProps {
  entries: DayEntry[];
  initialDate?: Date;
  onClose: () => void;
  onEditEntry?: (entry: DayEntry) => void;
}

export function JournalView({ entries, initialDate, onClose, onEditEntry }: JournalViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date());
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Get entry for current date
  const currentEntry = useMemo(() => {
    return entries.find(e => e.date === currentDate.toDateString()) || null;
  }, [entries, currentDate]);

  // Check navigation bounds
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canGoNext = useMemo(() => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate <= today;
  }, [currentDate, today]);

  // Navigate to next/prev day with animation
  const navigateTo = useCallback((direction: 'next' | 'prev') => {
    if (isFlipping) return;
    if (direction === 'next' && !canGoNext) return;

    setIsFlipping(true);
    setFlipDirection(direction);

    setTimeout(() => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        return newDate;
      });

      setTimeout(() => {
        setIsFlipping(false);
        setFlipDirection(null);
      }, 300);
    }, 300);
  }, [isFlipping, canGoNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') navigateTo('prev');
      else if (e.key === 'ArrowRight' && canGoNext) navigateTo('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, navigateTo, canGoNext]);

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && canGoNext) {
        navigateTo('next');
      } else if (diff < 0) {
        navigateTo('prev');
      }
    }

    setTouchStart(null);
  };

  // Format dates
  const dateLabel = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const isToday = currentDate.toDateString() === today.toDateString();

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50
                 dark:from-silver-900 dark:via-silver-800 dark:to-silver-900"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative book binding */}
      <div className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2
                      bg-gradient-to-r from-amber-200/50 via-amber-300/30 to-amber-200/50
                      dark:from-silver-700/50 dark:via-silver-600/30 dark:to-silver-700/50
                      hidden md:block" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-4 py-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-amber-700 dark:text-amber-400
                   hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg font-serif font-medium text-amber-900 dark:text-amber-100">
            My Journal
          </h1>
        </div>

        <div className="w-24" /> {/* Spacer for centering */}
      </header>

      {/* Page navigation arrows */}
      <button
        onClick={() => navigateTo('prev')}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10
                   p-3 rounded-full bg-white/80 dark:bg-silver-800/80 shadow-lg
                   text-amber-700 dark:text-amber-400 hover:bg-white dark:hover:bg-silver-700
                   hover:scale-110 transition-all"
        title="Previous day"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => canGoNext && navigateTo('next')}
        disabled={!canGoNext}
        className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10
                   p-3 rounded-full shadow-lg transition-all
                   ${canGoNext
                     ? 'bg-white/80 dark:bg-silver-800/80 text-amber-700 dark:text-amber-400 hover:bg-white dark:hover:bg-silver-700 hover:scale-110'
                     : 'bg-white/30 dark:bg-silver-800/30 text-silver-400 cursor-not-allowed'
                   }`}
        title="Next day"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Journal Page */}
      <div className="h-full flex items-center justify-center px-4 md:px-20 pt-16 pb-8">
        <div
          className={`w-full max-w-2xl h-full bg-white dark:bg-silver-850 rounded-lg shadow-2xl
                     overflow-hidden flex flex-col transition-transform duration-300 ease-in-out
                     ${isFlipping && flipDirection === 'next' ? 'animate-page-flip-out' : ''}
                     ${isFlipping && flipDirection === 'prev' ? 'animate-page-flip-in' : ''}`}
          style={{
            boxShadow: '0 0 40px rgba(0,0,0,0.1), 0 0 80px rgba(0,0,0,0.05)',
            background: 'linear-gradient(to right, #faf8f5 0%, #fffffe 5%, #fffffe 95%, #f5f3f0 100%)',
          }}
        >
          {/* Page header with date */}
          <div className="px-6 md:px-10 pt-8 pb-4 border-b border-amber-100 dark:border-silver-700">
            <div className="flex items-center justify-between">
              <div>
                {isToday && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full
                                 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mb-1">
                    Today
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-serif font-light text-amber-900 dark:text-amber-100">
                  {dateLabel}
                </h2>
              </div>

              {currentEntry && (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold
                               ${getMoodGradient(currentEntry.mood)}`}>
                  {currentEntry.mood}
                </div>
              )}
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
            {currentEntry ? (
              <div className="space-y-6">
                {/* Mood section */}
                <section>
                  <h3 className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500 font-medium mb-2">
                    How I Felt
                  </h3>
                  <p className={`text-2xl font-serif ${getMoodTextColor(currentEntry.mood)}`}>
                    {getMoodLabel(currentEntry.mood)}
                  </p>
                </section>

                {/* Emotions */}
                {currentEntry.emotions.length > 0 && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500 font-medium mb-2">
                      Emotions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentEntry.emotions.map(emotion => (
                        <span
                          key={emotion}
                          className="px-3 py-1.5 rounded-full text-sm
                                   bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300
                                   border border-amber-200 dark:border-amber-800"
                        >
                          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Reflection */}
                {currentEntry.reflection && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500 font-medium mb-2">
                      Reflection
                    </h3>
                    <p className="text-silver-700 dark:text-silver-300 leading-relaxed font-serif text-lg
                                whitespace-pre-wrap">
                      {currentEntry.reflection}
                    </p>
                  </section>
                )}

                {/* Gratitude */}
                {currentEntry.gratitude && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500 font-medium mb-2">
                      Gratitude
                    </h3>
                    <p className="text-silver-700 dark:text-silver-300 leading-relaxed font-serif text-lg
                                whitespace-pre-wrap italic">
                      "{currentEntry.gratitude}"
                    </p>
                  </section>
                )}

                {/* Goals */}
                {currentEntry.goals && currentEntry.goals.length > 0 && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500 font-medium mb-2">
                      Tomorrow's Intentions
                    </h3>
                    <ul className="space-y-2">
                      {currentEntry.goals.map(goal => (
                        <li key={goal.id} className="flex items-start gap-3 text-silver-700 dark:text-silver-300">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                          <span className="font-serif">{goal.text}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Edit button */}
                {onEditEntry && (
                  <button
                    onClick={() => onEditEntry(currentEntry)}
                    className="mt-4 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800
                             dark:hover:text-amber-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit this entry
                  </button>
                )}
              </div>
            ) : (
              /* Empty page */
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-amber-50 dark:bg-amber-900/20
                              flex items-center justify-center">
                  <svg className="w-12 h-12 text-amber-300 dark:text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-amber-900 dark:text-amber-100 mb-2">
                  Blank Page
                </h3>
                <p className="text-silver-500 dark:text-silver-400 mb-6 max-w-xs">
                  No reflection was written on this day. Every day is a new opportunity.
                </p>
                {!isToday && onEditEntry && (
                  <button
                    onClick={() => onEditEntry({
                      id: crypto.randomUUID(),
                      date: currentDate.toDateString(),
                      mood: 3,
                      emotions: [],
                      reflection: '',
                      gratitude: '',
                      goals: [],
                      createdAt: Date.now(),
                    })}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-medium
                             hover:bg-amber-600 transition-colors"
                  >
                    Add Reflection
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Page footer with navigation hint */}
          <div className="px-6 md:px-10 py-4 border-t border-amber-100 dark:border-silver-700
                         flex items-center justify-between text-xs text-silver-400">
            <span>Swipe or use arrow keys to navigate</span>
            <span className="font-serif italic">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in journal
            </span>
          </div>
        </div>
      </div>

      {/* Quick date picker */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <button
          onClick={() => setCurrentDate(today)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                     ${isToday
                       ? 'bg-amber-500 text-white'
                       : 'bg-white/80 dark:bg-silver-800/80 text-amber-700 dark:text-amber-400 hover:bg-white'
                     }`}
        >
          Today
        </button>
      </div>
    </div>
  );
}

// Helper functions
function getMoodLabel(mood: number): string {
  const labels: Record<number, string> = {
    1: 'A Difficult Day',
    2: 'A Challenging Day',
    3: 'An Okay Day',
    4: 'A Good Day',
    5: 'A Great Day',
  };
  return labels[mood] || 'An Okay Day';
}

function getMoodGradient(mood: number): string {
  const gradients: Record<number, string> = {
    1: 'bg-gradient-to-br from-red-400 to-red-500',
    2: 'bg-gradient-to-br from-orange-400 to-orange-500',
    3: 'bg-gradient-to-br from-amber-400 to-amber-500',
    4: 'bg-gradient-to-br from-lime-400 to-lime-500',
    5: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
  };
  return gradients[mood] || gradients[3];
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
