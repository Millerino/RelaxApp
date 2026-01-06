import type { DayEntry } from '../types';

interface Props {
  entries: DayEntry[];
  currentMonth?: Date;
}

export function Calendar({ entries, currentMonth = new Date() }: Props) {
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

  // Check if a day has an entry
  const hasEntry = (day: number): DayEntry | undefined => {
    const dateStr = new Date(year, month, day).toDateString();
    return entries.find(e => e.date === dateStr);
  };

  // Get mood color for a day
  const getMoodColor = (entry: DayEntry | undefined): string => {
    if (!entry) return '';

    const colors = {
      1: 'bg-red-400 dark:bg-red-500',
      2: 'bg-orange-400 dark:bg-orange-500',
      3: 'bg-amber-400 dark:bg-amber-500',
      4: 'bg-lime-400 dark:bg-lime-500',
      5: 'bg-green-400 dark:bg-green-500',
    };
    return colors[entry.mood] || 'bg-lavender-400';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="w-full">
      {/* Month header */}
      <div className="text-center mb-4">
        <h4 className="text-sm font-medium text-silver-600 dark:text-silver-300">
          {monthNames[month]} {year}
        </h4>
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

          const entry = hasEntry(day);
          const moodColor = getMoodColor(entry);

          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs
                         transition-all duration-200 relative
                         ${entry
                           ? `${moodColor} text-white font-medium shadow-sm`
                           : isToday(day)
                             ? 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400 ring-2 ring-lavender-400'
                             : 'text-silver-500 dark:text-silver-400 hover:bg-silver-100 dark:hover:bg-silver-800'
                         }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-xs text-silver-500 dark:text-silver-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-500" />
          <span>Great</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-400 dark:bg-amber-500" />
          <span>Okay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-400 dark:bg-red-500" />
          <span>Difficult</span>
        </div>
      </div>
    </div>
  );
}
