import { useMemo } from 'react';
import type { DayEntry } from '../types';

interface StatsCardProps {
  entries: DayEntry[];
}

export function StatsCard({ entries }: StatsCardProps) {
  const stats = useMemo(() => {
    if (entries.length === 0) {
      return null;
    }

    // Calculate basic stats
    const totalEntries = entries.length;
    const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / totalEntries;

    // Calculate streak
    const sortedEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let checkDate = today;

    // Check if latest entry is today or yesterday
    const latestDate = new Date(sortedEntries[0]?.date || today);
    latestDate.setHours(0, 0, 0, 0);

    if (latestDate.getTime() === today.getTime() || latestDate.getTime() === yesterday.getTime()) {
      currentStreak = 1;
      checkDate = new Date(latestDate);
      checkDate.setDate(checkDate.getDate() - 1);

      for (let i = 1; i < sortedEntries.length; i++) {
        const entryDate = new Date(sortedEntries[i].date);
        entryDate.setHours(0, 0, 0, 0);
        if (entryDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    const dateSet = new Set(entries.map(e => e.date));
    const sortedDates = Array.from(dateSet).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        prevDate.setDate(prevDate.getDate() + 1);
        if (prevDate.getTime() === currDate.getTime()) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Mood by day of week
    const moodByDay: Record<number, { total: number; count: number }> = {};
    entries.forEach(e => {
      const day = new Date(e.date).getDay();
      if (!moodByDay[day]) {
        moodByDay[day] = { total: 0, count: 0 };
      }
      moodByDay[day].total += e.mood;
      moodByDay[day].count++;
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const moodByDayArray = dayNames.map((name, i) => ({
      name,
      avg: moodByDay[i] ? moodByDay[i].total / moodByDay[i].count : 0,
      count: moodByDay[i]?.count || 0,
    }));

    // Find best and worst days
    const daysWithData = moodByDayArray.filter(d => d.count >= 1);
    const bestDay = daysWithData.length > 0
      ? daysWithData.reduce((a, b) => a.avg > b.avg ? a : b)
      : null;
    const worstDay = daysWithData.length > 0
      ? daysWithData.reduce((a, b) => a.avg < b.avg ? a : b)
      : null;

    // Most common emotions
    const emotionCounts: Record<string, number> = {};
    entries.forEach(e => {
      e.emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalEntries,
      avgMood,
      currentStreak,
      longestStreak,
      moodByDayArray,
      bestDay,
      worstDay,
      topEmotions,
    };
  }, [entries]);

  if (!stats) {
    return null;
  }

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-emerald-500';
    if (mood >= 3) return 'text-amber-500';
    return 'text-red-400';
  };

  const getMoodBarColor = (mood: number) => {
    if (mood >= 4) return 'bg-emerald-400';
    if (mood >= 3) return 'bg-amber-400';
    if (mood >= 2) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-light text-silver-800 dark:text-silver-100">
            {stats.totalEntries}
          </p>
          <p className="text-xs text-silver-500 dark:text-silver-400">Entries</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className={`text-2xl font-light ${getMoodColor(stats.avgMood)}`}>
            {stats.avgMood.toFixed(1)}
          </p>
          <p className="text-xs text-silver-500 dark:text-silver-400">Avg Mood</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-light text-lavender-500">
            {stats.currentStreak}
          </p>
          <p className="text-xs text-silver-500 dark:text-silver-400">Streak</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-light text-silver-800 dark:text-silver-100">
            {stats.longestStreak}
          </p>
          <p className="text-xs text-silver-500 dark:text-silver-400">Best</p>
        </div>
      </div>

      {/* Mood by Day of Week */}
      {entries.length >= 7 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-3">
            Mood by day
          </h4>
          <div className="flex justify-between items-end h-20 gap-1">
            {stats.moodByDayArray.map((day) => (
              <div key={day.name} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end h-14">
                  {day.count > 0 && (
                    <div
                      className={`w-full rounded-t ${getMoodBarColor(day.avg)} transition-all`}
                      style={{ height: `${(day.avg / 5) * 100}%`, minHeight: '4px' }}
                    />
                  )}
                </div>
                <span className={`text-xs ${
                  stats.bestDay?.name === day.name
                    ? 'text-emerald-500 font-medium'
                    : stats.worstDay?.name === day.name
                      ? 'text-red-400 font-medium'
                      : 'text-silver-400 dark:text-silver-500'
                }`}>
                  {day.name}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs">
            {stats.bestDay && (
              <span className="text-emerald-500">
                Best: {stats.bestDay.name} ({stats.bestDay.avg.toFixed(1)})
              </span>
            )}
            {stats.worstDay && stats.worstDay.name !== stats.bestDay?.name && (
              <span className="text-silver-400 dark:text-silver-500">
                Hardest: {stats.worstDay.name} ({stats.worstDay.avg.toFixed(1)})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Emotions */}
      {stats.topEmotions.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-3">
            Most felt emotions
          </h4>
          <div className="space-y-2">
            {stats.topEmotions.map(([emotion, count], i) => (
              <div key={emotion} className="flex items-center gap-3">
                <span className="text-lg">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-silver-600 dark:text-silver-300 capitalize">
                      {emotion}
                    </span>
                    <span className="text-xs text-silver-400 dark:text-silver-500">
                      {count}x
                    </span>
                  </div>
                  <div className="h-1.5 bg-silver-100 dark:bg-silver-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lavender-400 rounded-full"
                      style={{ width: `${(count / stats.topEmotions[0][1]) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
