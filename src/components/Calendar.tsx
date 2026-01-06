import { useState } from 'react';
import type { DayEntry } from '../types';
import { DayDetailModal } from './DayDetailModal';

interface Props {
  entries: DayEntry[];
}

export function Calendar({ entries }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DayEntry | null>(null);
  const [showEmptyDay, setShowEmptyDay] = useState(false);

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

  const handleDayClick = (day: number) => {
    const entry = getEntry(day);
    const clickedDate = new Date(year, month, day);

    setSelectedDate(clickedDate);

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

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(year, month + 1, 1);
    if (nextMonth <= today) {
      setCurrentMonth(nextMonth);
    }
  };

  const canGoNext = new Date(year, month + 1, 1) <= today;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <>
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
            const isClickable = !future; // Past days and today are clickable

            return (
              <button
                key={i}
                onClick={() => isClickable && handleDayClick(day)}
                disabled={future}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs
                           transition-all duration-200 relative
                           ${future
                             ? 'text-silver-300 dark:text-silver-700 cursor-not-allowed bg-silver-50/50 dark:bg-silver-900/20'
                             : hasData
                               ? `${getMoodColor(entry.mood)} text-white font-medium cursor-pointer
                                  hover:ring-2 hover:ring-lavender-400/50 hover:scale-105 active:scale-95 shadow-sm`
                               : todayDate
                                 ? 'bg-lavender-100/80 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400 ring-2 ring-lavender-300 dark:ring-lavender-600 cursor-pointer hover:bg-lavender-200/80 dark:hover:bg-lavender-800/40'
                                 : past
                                   ? 'text-silver-500 dark:text-silver-400 bg-silver-100/50 dark:bg-silver-800/30 cursor-pointer hover:bg-silver-200/60 dark:hover:bg-silver-700/40'
                                   : 'text-silver-500 dark:text-silver-400'
                           }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDate && (selectedEntry || showEmptyDay) && (
        <DayDetailModal
          entry={selectedEntry}
          date={selectedDate}
          onClose={closeModal}
          isEmpty={!selectedEntry}
        />
      )}
    </>
  );
}
