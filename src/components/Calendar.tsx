import { useState } from 'react';
import type { DayEntry } from '../types';

interface Props {
  entries: DayEntry[];
  onDayClick?: (entry: DayEntry) => void;
}

export function Calendar({ entries, onDayClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<DayEntry | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  // Create array of days
  const days: (number | null)[] = [];

  // Add empty slots for days before the first
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if a day has an entry
  const getEntry = (day: number): DayEntry | undefined => {
    const dateStr = new Date(year, month, day).toDateString();
    return entries.find(e => e.date === dateStr);
  };

  // Check if day is in the future
  const isFuture = (day: number): boolean => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Check if day is today
  const isToday = (day: number): boolean => {
    return day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
  };

  // Check if day is in the past (before today)
  const isPast = (day: number): boolean => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Softer mood colors for lavender theme
  const getMoodColor = (mood: number): string => {
    const colors: Record<number, string> = {
      1: 'bg-red-300/80 dark:bg-red-400/60',
      2: 'bg-orange-300/80 dark:bg-orange-400/60',
      3: 'bg-amber-300/80 dark:bg-amber-400/60',
      4: 'bg-lime-300/80 dark:bg-lime-400/60',
      5: 'bg-emerald-300/80 dark:bg-emerald-400/60',
    };
    return colors[mood] || 'bg-lavender-300/80';
  };

  const handleDayClick = (day: number) => {
    const entry = getEntry(day);
    if (entry) {
      setSelectedEntry(entry);
      onDayClick?.(entry);
    }
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedEntry(null);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(year, month + 1, 1);
    if (nextMonth <= today) {
      setCurrentMonth(nextMonth);
      setSelectedEntry(null);
    }
  };

  const canGoNext = new Date(year, month + 1, 1) <= today;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="w-full">
      {/* Month header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-1.5 rounded-lg text-silver-400 hover:text-silver-600 dark:hover:text-silver-300
                   hover:bg-silver-100 dark:hover:bg-silver-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h4 className="text-sm font-medium text-silver-600 dark:text-silver-300">
          {monthNames[month]} {year}
        </h4>
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={`p-1.5 rounded-lg transition-colors
                     ${canGoNext
                       ? 'text-silver-400 hover:text-silver-600 dark:hover:text-silver-300 hover:bg-silver-100 dark:hover:bg-silver-800'
                       : 'text-silver-200 dark:text-silver-700 cursor-not-allowed'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name, i) => (
          <div
            key={i}
            className="text-center text-xs text-silver-400 dark:text-silver-500 py-1"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={i} className="aspect-square" />;
          }

          const entry = getEntry(day);
          const future = isFuture(day);
          const todayDate = isToday(day);
          const past = isPast(day);
          const hasData = !!entry;

          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              disabled={future || !hasData}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs
                         transition-all duration-200 relative
                         ${future
                           ? 'text-silver-300 dark:text-silver-700 cursor-not-allowed bg-silver-50/50 dark:bg-silver-900/20'
                           : hasData
                             ? `${getMoodColor(entry.mood)} text-white font-medium cursor-pointer
                                hover:ring-2 hover:ring-lavender-400/50 hover:scale-105 active:scale-95`
                             : todayDate
                               ? 'bg-lavender-100/80 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400 ring-2 ring-lavender-300 dark:ring-lavender-600'
                               : past
                                 ? 'text-silver-400 dark:text-silver-500 bg-silver-100/50 dark:bg-silver-800/30'
                                 : 'text-silver-500 dark:text-silver-400'
                         }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected entry detail */}
      {selectedEntry && (
        <div className="mt-4 p-3 rounded-xl bg-white/50 dark:bg-silver-800/30 border border-silver-200/50 dark:border-silver-700/30 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-silver-500 dark:text-silver-400">
              {new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-silver-400 hover:text-silver-600 dark:hover:text-silver-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded-full ${getMoodColor(selectedEntry.mood)} flex items-center justify-center text-white text-xs font-medium`}>
              {selectedEntry.mood}
            </div>
            <span className="text-sm font-medium text-silver-700 dark:text-silver-200">
              {getMoodLabel(selectedEntry.mood)}
            </span>
          </div>
          {selectedEntry.emotions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedEntry.emotions.slice(0, 4).map(e => (
                <span key={e} className="px-2 py-0.5 rounded-full text-xs bg-lavender-100/80 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400">
                  {e}
                </span>
              ))}
              {selectedEntry.emotions.length > 4 && (
                <span className="text-xs text-silver-400">+{selectedEntry.emotions.length - 4}</span>
              )}
            </div>
          )}
        </div>
      )}
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
