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

    // Activity correlations - which activities are associated with higher moods
    const activityMoods: Record<string, { total: number; count: number }> = {};
    entries.forEach(e => {
      if (e.activities) {
        e.activities.forEach(activity => {
          if (!activityMoods[activity]) {
            activityMoods[activity] = { total: 0, count: 0 };
          }
          activityMoods[activity].total += e.mood;
          activityMoods[activity].count++;
        });
      }
    });

    const activityCorrelations = Object.entries(activityMoods)
      .map(([activity, data]) => ({
        activity,
        avgMood: data.total / data.count,
        count: data.count,
      }))
      .filter(a => a.count >= 2) // Only show activities done at least twice
      .sort((a, b) => b.avgMood - a.avgMood);

    const happyActivities = activityCorrelations.slice(0, 3);

    // Mood trend - comparing last 7 days to previous 7 days
    const sortedByDate = [...entries].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const last7 = sortedByDate.slice(0, 7);
    const prev7 = sortedByDate.slice(7, 14);

    let moodTrend: 'improving' | 'declining' | 'stable' | null = null;
    if (last7.length >= 3 && prev7.length >= 3) {
      const last7Avg = last7.reduce((sum, e) => sum + e.mood, 0) / last7.length;
      const prev7Avg = prev7.reduce((sum, e) => sum + e.mood, 0) / prev7.length;
      const diff = last7Avg - prev7Avg;

      if (diff > 0.3) moodTrend = 'improving';
      else if (diff < -0.3) moodTrend = 'declining';
      else moodTrend = 'stable';
    }

    return {
      totalEntries,
      avgMood,
      currentStreak,
      longestStreak,
      moodByDayArray,
      bestDay,
      worstDay,
      topEmotions,
      happyActivities,
      moodTrend,
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

  const getActivityIcon = (activity: string): string => {
    const icons: Record<string, string> = {
      work: '💼',
      exercise: '🏃',
      family: '👨‍👩‍👧',
      friends: '👥',
      dating: '💕',
      reading: '📚',
      gaming: '🎮',
      movies: '🎬',
      music: '🎵',
      cooking: '🍳',
      shopping: '🛒',
      cleaning: '🧹',
      travel: '✈️',
      nature: '🌳',
      meditation: '🧘',
      sleep: '😴',
    };
    return icons[activity] || '✨';
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

      {/* Mood Trend */}
      {stats.moodTrend && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              stats.moodTrend === 'improving'
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : stats.moodTrend === 'declining'
                  ? 'bg-orange-100 dark:bg-orange-900/30'
                  : 'bg-silver-100 dark:bg-silver-800'
            }`}>
              {stats.moodTrend === 'improving' && (
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {stats.moodTrend === 'declining' && (
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {stats.moodTrend === 'stable' && (
                <svg className="w-5 h-5 text-silver-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${
                stats.moodTrend === 'improving'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : stats.moodTrend === 'declining'
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-silver-600 dark:text-silver-300'
              }`}>
                {stats.moodTrend === 'improving' && 'Mood improving'}
                {stats.moodTrend === 'declining' && 'Mood declining'}
                {stats.moodTrend === 'stable' && 'Mood stable'}
              </p>
              <p className="text-xs text-silver-500 dark:text-silver-400">
                Compared to last week
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Happy Activities - Daylio-inspired correlation */}
      {stats.happyActivities.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-3">
            Activities that boost your mood
          </h4>
          <div className="space-y-2">
            {stats.happyActivities.map(({ activity, avgMood, count }) => (
              <div key={activity} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30
                              flex items-center justify-center">
                  <span className="text-sm">
                    {getActivityIcon(activity)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-silver-600 dark:text-silver-300 capitalize">
                      {activity} <span className="text-xs text-silver-400">({count}x)</span>
                    </span>
                    <span className={`text-xs font-medium ${getMoodColor(avgMood)}`}>
                      {avgMood.toFixed(1)} avg
                    </span>
                  </div>
                  <div className="h-1 bg-silver-100 dark:bg-silver-800 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${getMoodBarColor(avgMood)}`}
                      style={{ width: `${(avgMood / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
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
