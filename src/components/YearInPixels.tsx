import { useState, useMemo } from 'react';
import type { DayEntry } from '../types';

interface YearInPixelsProps {
  entries: DayEntry[];
  onDayClick?: (date: Date, entry?: DayEntry) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function YearInPixels({ entries, onDayClick }: YearInPixelsProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Get all years that have entries
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    entries.forEach(entry => {
      const year = new Date(entry.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [entries, currentYear]);

  // Create a map of date strings to entries for quick lookup
  const entryMap = useMemo(() => {
    const map = new Map<string, DayEntry>();
    entries.forEach(entry => {
      map.set(entry.date, entry);
    });
    return map;
  }, [entries]);

  // Generate all days of the selected year
  const yearData = useMemo(() => {
    const months: { month: number; days: { date: Date; entry?: DayEntry }[] }[] = [];

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
      const days: { date: Date; entry?: DayEntry }[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, month, day);
        const entry = entryMap.get(date.toDateString());
        days.push({ date, entry });
      }

      months.push({ month, days });
    }

    return months;
  }, [selectedYear, entryMap]);

  // Get mood color
  const getMoodColor = (mood: number): string => {
    const colors: Record<number, string> = {
      1: 'bg-red-400 hover:bg-red-500',
      2: 'bg-orange-400 hover:bg-orange-500',
      3: 'bg-amber-400 hover:bg-amber-500',
      4: 'bg-lime-400 hover:bg-lime-500',
      5: 'bg-emerald-400 hover:bg-emerald-500',
    };
    return colors[mood] || 'bg-silver-200 dark:bg-silver-700';
  };

  // Stats for the year
  const yearStats = useMemo(() => {
    const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === selectedYear);
    if (yearEntries.length === 0) return null;

    const totalMood = yearEntries.reduce((sum, e) => sum + e.mood, 0);
    const avgMood = totalMood / yearEntries.length;
    const moodCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    yearEntries.forEach(e => moodCounts[e.mood]++);

    return {
      totalDays: yearEntries.length,
      avgMood: avgMood.toFixed(1),
      moodCounts,
      mostCommonMood: Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0],
    };
  }, [entries, selectedYear]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-silver-700 dark:text-silver-200">
          Year in Pixels
        </h3>

        {/* Year selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedYear(y => y - 1)}
            disabled={!availableYears.includes(selectedYear - 1) && selectedYear <= currentYear - 2}
            className="p-1 rounded text-silver-400 hover:text-silver-600 dark:hover:text-silver-300
                     hover:bg-silver-100 dark:hover:bg-silver-800 transition-colors disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-silver-600 dark:text-silver-300 min-w-[4rem] text-center">
            {selectedYear}
          </span>
          <button
            onClick={() => setSelectedYear(y => y + 1)}
            disabled={selectedYear >= currentYear}
            className="p-1 rounded text-silver-400 hover:text-silver-600 dark:hover:text-silver-300
                     hover:bg-silver-100 dark:hover:bg-silver-800 transition-colors disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Year Stats Summary */}
      {yearStats && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-silver-50 dark:bg-silver-800/30 rounded-xl">
          <div className="text-center">
            <p className="text-lg font-semibold text-silver-800 dark:text-silver-100">{yearStats.totalDays}</p>
            <p className="text-xs text-silver-500 dark:text-silver-400">days logged</p>
          </div>
          <div className="w-px h-8 bg-silver-200 dark:bg-silver-700" />
          <div className="text-center">
            <p className="text-lg font-semibold text-silver-800 dark:text-silver-100">{yearStats.avgMood}</p>
            <p className="text-xs text-silver-500 dark:text-silver-400">avg mood</p>
          </div>
          <div className="w-px h-8 bg-silver-200 dark:bg-silver-700" />
          <div className="flex-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(mood => (
                <div key={mood} className="flex-1">
                  <div
                    className={`h-1.5 rounded-full ${getMoodColor(mood).split(' ')[0]}`}
                    style={{ opacity: yearStats.moodCounts[mood] > 0 ? 1 : 0.2 }}
                  />
                  <p className="text-[10px] text-center text-silver-400 mt-1">
                    {yearStats.moodCounts[mood]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pixels Grid */}
      <div className="space-y-1.5">
        {yearData.map(({ month, days }) => (
          <div key={month} className="flex items-center gap-1.5">
            {/* Month label */}
            <span className="text-[10px] text-silver-400 dark:text-silver-500 w-7 flex-shrink-0">
              {MONTHS[month]}
            </span>

            {/* Days */}
            <div className="flex gap-[2px] flex-wrap">
              {days.map(({ date, entry }) => {
                const isFuture = date > today;
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => !isFuture && onDayClick?.(date, entry)}
                    disabled={isFuture}
                    className={`w-[10px] h-[10px] rounded-[2px] transition-all duration-150
                              ${isFuture
                                ? 'bg-silver-100 dark:bg-silver-800/50 cursor-not-allowed'
                                : entry
                                  ? `${getMoodColor(entry.mood)} cursor-pointer hover:scale-150 hover:z-10`
                                  : 'bg-silver-200 dark:bg-silver-700 cursor-pointer hover:bg-silver-300 dark:hover:bg-silver-600'
                              }
                              ${isToday ? 'ring-1 ring-lavender-400 ring-offset-1 ring-offset-white dark:ring-offset-silver-900' : ''}`}
                    title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${entry ? ` - Mood: ${entry.mood}` : ''}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-silver-200 dark:border-silver-700">
        <span className="text-xs text-silver-400 dark:text-silver-500">Mood:</span>
        {[1, 2, 3, 4, 5].map(mood => (
          <div key={mood} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${getMoodColor(mood).split(' ')[0]}`} />
            <span className="text-[10px] text-silver-500 dark:text-silver-400">{mood}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-2">
          <div className="w-3 h-3 rounded-sm bg-silver-200 dark:bg-silver-700" />
          <span className="text-[10px] text-silver-500 dark:text-silver-400">No entry</span>
        </div>
      </div>
    </div>
  );
}
