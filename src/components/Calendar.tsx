import { useState, useCallback, useMemo } from 'react';
import type { DayEntry } from '../types';
import { DayDetailModal } from './DayDetailModal';

interface Props {
  entries: DayEntry[];
  onSaveEntry?: (entry: DayEntry) => void;
}

export function Calendar({ entries, onSaveEntry }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DayEntry | null>(null);
  const [showEmptyDay, setShowEmptyDay] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Get the week's days based on offset
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(today);
    // Go to Sunday of current week
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [today, weekOffset]);

  // Get week label
  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}`;
  }, [weekDays]);

  const getEntryForDate = useCallback((date: Date): DayEntry | undefined => {
    return entries.find(e => e.date === date.toDateString());
  }, [entries]);

  // Check if date is in the future
  const isFuture = (date: Date): boolean => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d > today;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  // More saturated mood colors
  const getMoodColor = (mood: number): string => {
    const colors: Record<number, string> = {
      1: 'bg-red-400 dark:bg-red-500',
      2: 'bg-orange-400 dark:bg-orange-500',
      3: 'bg-amber-400 dark:bg-amber-500',
      4: 'bg-lime-500 dark:bg-lime-500',
      5: 'bg-emerald-500 dark:bg-emerald-500',
    };
    return colors[mood] || 'bg-lavender-400';
  };

  const handleDayClick = (date: Date) => {
    const entry = getEntryForDate(date);

    setSelectedDate(date);

    if (entry) {
      setSelectedEntry(entry);
      setShowEmptyDay(false);
    } else {
      setSelectedEntry(null);
      setShowEmptyDay(true);
    }
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedEntry(null);
    setShowEmptyDay(false);
  };

  // Navigate to previous/next day in modal
  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));

    // Don't allow navigating to future dates
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    if (newDate > todayDate) return;

    const entry = getEntryForDate(newDate);
    setSelectedDate(newDate);

    if (entry) {
      setSelectedEntry(entry);
      setShowEmptyDay(false);
    } else {
      setSelectedEntry(null);
      setShowEmptyDay(true);
    }
  }, [selectedDate, getEntryForDate]);

  // Check if can navigate
  const canNavigatePrev = selectedDate ? true : false;
  const canNavigateNext = selectedDate ? (() => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return nextDate <= todayDate;
  })() : false;

  const goToPrevWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(prev => prev + 1);
    }
  };

  const canGoNext = weekOffset < 0;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <div className="w-full">
        {/* Week header with navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevWeek}
            className="p-2 rounded-lg text-silver-400 hover:text-silver-600 dark:hover:text-silver-300
                     hover:bg-silver-100 dark:hover:bg-silver-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h4 className="text-sm font-medium text-silver-600 dark:text-silver-300">
              {weekLabel}
            </h4>
            {weekOffset === 0 && (
              <span className="text-xs text-lavender-500 dark:text-lavender-400">This week</span>
            )}
          </div>
          <button
            onClick={goToNextWeek}
            disabled={!canGoNext}
            className={`p-2 rounded-lg transition-colors
                       ${canGoNext
                         ? 'text-silver-400 hover:text-silver-600 dark:hover:text-silver-300 hover:bg-silver-100 dark:hover:bg-silver-800'
                         : 'text-silver-200 dark:text-silver-700 cursor-not-allowed'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Weekly view - larger day cards */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, i) => {
            const entry = getEntryForDate(date);
            const future = isFuture(date);
            const todayDate = isToday(date);
            const hasData = !!entry;
            const isClickable = !future;

            return (
              <button
                key={i}
                onClick={() => isClickable && handleDayClick(date)}
                disabled={future}
                className={`flex flex-col items-center justify-center rounded-xl p-2 min-h-[72px]
                           transition-all duration-200 relative
                           ${future
                             ? 'text-silver-300 dark:text-silver-700 cursor-not-allowed bg-silver-50/50 dark:bg-silver-900/20'
                             : hasData
                               ? `${getMoodColor(entry.mood)} text-white cursor-pointer
                                  hover:ring-2 hover:ring-lavender-400/50 hover:scale-105 active:scale-95 shadow-md`
                               : todayDate
                                 ? 'bg-gradient-to-br from-cyan-100 to-sky-200 dark:from-cyan-900/40 dark:to-sky-900/40 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-300 dark:ring-cyan-600 cursor-pointer hover:scale-105 shadow-sm'
                                 : 'bg-gradient-to-br from-slate-100 to-cyan-50 dark:from-slate-800/50 dark:to-cyan-900/20 text-slate-500 dark:text-slate-400 cursor-pointer hover:from-cyan-100 hover:to-sky-100 dark:hover:from-cyan-900/30 dark:hover:to-sky-900/30 hover:scale-105'
                           }`}
              >
                <span className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
                  {dayNames[date.getDay()]}
                </span>
                <span className={`text-lg font-semibold ${hasData ? '' : ''}`}>
                  {date.getDate()}
                </span>
                {hasData && (
                  <span className="text-[10px] opacity-80 mt-0.5">
                    {getMoodEmoji(entry.mood)}
                  </span>
                )}
                {!hasData && !future && (
                  <span className="text-[10px] opacity-50 mt-0.5">+</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick hint */}
        <p className="text-center text-xs text-silver-400 dark:text-silver-500 mt-3">
          Tap any day to view or add a reflection
        </p>
      </div>

      {/* Day Detail Modal */}
      {selectedDate && (selectedEntry || showEmptyDay) && (
        <DayDetailModal
          entry={selectedEntry}
          date={selectedDate}
          onClose={closeModal}
          isEmpty={!selectedEntry}
          onSaveEntry={(entry) => {
            onSaveEntry?.(entry);
            setSelectedEntry(entry);
            setShowEmptyDay(false);
          }}
          onNavigate={handleNavigate}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
        />
      )}
    </>
  );
}

function getMoodEmoji(mood: number): string {
  const emojis: Record<number, string> = {
    1: '😔',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😊',
  };
  return emojis[mood] || '😐';
}
