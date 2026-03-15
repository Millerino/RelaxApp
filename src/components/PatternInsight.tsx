import { useMemo, useState } from 'react';
import type { DayEntry } from '../types';

interface PatternInsightProps {
  entries: DayEntry[];
}

// Generates a gentle, language-only insight based on patterns in entries
export function PatternInsight({ entries }: PatternInsightProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const insight = useMemo(() => {
    // Only show insights after 5+ entries
    if (entries.length < 5) return null;

    const recentEntries = entries.slice(-14); // Last 2 weeks

    // Analyze mood patterns
    const avgMood = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
    const highMoodDays = recentEntries.filter(e => e.mood >= 4);
    const lowMoodDays = recentEntries.filter(e => e.mood <= 2);

    // Analyze emotion patterns
    const allEmotions = recentEntries.flatMap(e => e.emotions);
    const emotionCounts: Record<string, number> = {};
    allEmotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    const topEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // Analyze activity patterns
    const allActivities = recentEntries.flatMap(e => e.activities || []);
    const activityCounts: Record<string, number> = {};
    allActivities.forEach(activity => {
      activityCounts[activity] = (activityCounts[activity] || 0) + 1;
    });

    // Correlate activities with mood
    const activityMoodCorrelation: Record<string, { total: number; count: number }> = {};
    recentEntries.forEach(entry => {
      (entry.activities || []).forEach(activity => {
        if (!activityMoodCorrelation[activity]) {
          activityMoodCorrelation[activity] = { total: 0, count: 0 };
        }
        activityMoodCorrelation[activity].total += entry.mood;
        activityMoodCorrelation[activity].count += 1;
      });
    });

    // Generate insights based on patterns
    const insights: string[] = [];

    // Insight about consistency
    if (entries.length >= 7) {
      const lastWeekEntries = entries.slice(-7);
      if (lastWeekEntries.length >= 5) {
        insights.push("You've been showing up for yourself lately. That's something to notice.");
      }
    }

    // Insight about improving mood
    if (recentEntries.length >= 7) {
      const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));
      const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));
      const firstAvg = firstHalf.reduce((sum, e) => sum + e.mood, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, e) => sum + e.mood, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 0.5) {
        insights.push("Something seems to have shifted recently. Your reflections feel a bit lighter.");
      }
    }

    // Insight about common emotions
    if (topEmotions.length > 0) {
      const [topEmotion, count] = topEmotions[0];
      if (count >= 3) {
        const formatted = topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1);
        insights.push(`${formatted} has been a recurring theme in your reflections.`);
      }
    }

    // Insight about activities and mood
    for (const [activity, data] of Object.entries(activityMoodCorrelation)) {
      if (data.count >= 3) {
        const avgMoodWithActivity = data.total / data.count;
        if (avgMoodWithActivity >= 4) {
          const formatted = activity.charAt(0).toUpperCase() + activity.slice(1);
          insights.push(`Days with ${formatted.toLowerCase()} tend to feel a bit brighter for you.`);
          break;
        }
      }
    }

    // Insight about low energy patterns
    const lowEnergyDays = recentEntries.filter(e =>
      e.feelingLevels?.some(f => f.name === 'Energy' && f.value < 40)
    );
    if (lowEnergyDays.length >= 3 && recentEntries.length >= 7) {
      const socialOnLowEnergy = lowEnergyDays.filter(e =>
        e.activities?.includes('social')
      ).length;
      if (socialOnLowEnergy < lowEnergyDays.length / 2) {
        insights.push("Lower energy days often came with fewer social moments.");
      }
    }

    // Insight about good days
    if (highMoodDays.length >= 3 && avgMood >= 3.5) {
      insights.push("There's been some warmth in your recent days. May it continue.");
    }

    // Insight about difficult stretches (gentle)
    if (lowMoodDays.length >= 3 && avgMood < 3) {
      insights.push("It's been a heavier stretch. You're still here, still reflecting.");
    }

    // Insight about reflection depth
    const deepReflections = recentEntries.filter(e => e.reflection && e.reflection.length > 100);
    if (deepReflections.length >= 3) {
      insights.push("You've been taking time to really reflect. That matters.");
    }

    // Pick an insight based on entry count (deterministic, changes as entries grow)
    if (insights.length === 0) return null;
    const index = entries.length % insights.length;
    return insights[index];
  }, [entries]);

  // Don't show if dismissed or no insight
  if (isDismissed || !insight) return null;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-lavender-50/50 dark:from-slate-800/50 dark:to-lavender-900/20
                   rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/40
                   animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Subtle icon */}
        <div className="w-8 h-8 rounded-full bg-lavender-100 dark:bg-lavender-900/40
                      flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
            "{insight}"
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                   hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors flex-shrink-0"
          title="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
