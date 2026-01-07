import { useMemo } from 'react';
import type { DayEntry } from '../types';

interface DailyInsightProps {
  entries: DayEntry[];
  compact?: boolean;
}

// 60+ unique insights to avoid repetition for at least 2 months
const INSIGHTS = [
  // Mindfulness & Meditation
  { text: "Just 5 minutes of mindfulness can reduce cortisol levels by up to 25%.", category: "science" },
  { text: "Your brain creates new neural pathways each time you practice self-reflection.", category: "science" },
  { text: "Regular journaling has been shown to strengthen immune cells.", category: "science" },
  { text: "Meditation can actually increase gray matter in your brain.", category: "science" },
  { text: "Taking deep breaths activates your parasympathetic nervous system.", category: "science" },
  { text: "Gratitude practice rewires your brain to notice positive things more easily.", category: "science" },
  { text: "Mindful breathing can lower blood pressure in just 5 minutes.", category: "science" },
  { text: "Writing about emotions reduces activity in the amygdala.", category: "science" },

  // Mood Tracking Benefits
  { text: "People who track their moods report 23% better emotional awareness.", category: "tracking" },
  { text: "Mood patterns often repeat weekly. Tracking helps you prepare for tough days.", category: "tracking" },
  { text: "Recognizing emotional patterns is the first step to managing them.", category: "tracking" },
  { text: "Your mood data tells a story only you can understand.", category: "tracking" },
  { text: "Tracking creates distance between you and your emotions—healthy perspective.", category: "tracking" },
  { text: "Looking back at entries often reveals resilience you didn't notice.", category: "tracking" },

  // Inspirational Quotes
  { text: "\"The present moment is the only moment available to us.\" — Thich Nhat Hanh", category: "quote" },
  { text: "\"Almost everything will work again if you unplug it for a few minutes.\" — Anne Lamott", category: "quote" },
  { text: "\"Feelings are just visitors. Let them come and go.\" — Mooji", category: "quote" },
  { text: "\"You don't have to control your thoughts. You just have to stop letting them control you.\" — Dan Millman", category: "quote" },
  { text: "\"The greatest weapon against stress is our ability to choose one thought over another.\" — William James", category: "quote" },
  { text: "\"What lies behind us and what lies before us are tiny matters compared to what lies within us.\" — Emerson", category: "quote" },
  { text: "\"Be where you are, not where you think you should be.\" — Unknown", category: "quote" },
  { text: "\"You are the sky. Everything else is just the weather.\" — Pema Chödrön", category: "quote" },
  { text: "\"In the middle of difficulty lies opportunity.\" — Albert Einstein", category: "quote" },
  { text: "\"The only way out is through.\" — Robert Frost", category: "quote" },

  // Wellness Tips
  { text: "Try the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s.", category: "tip" },
  { text: "Naming your emotions reduces their intensity by up to 50%.", category: "tip" },
  { text: "A 10-minute walk in nature can boost mood for hours.", category: "tip" },
  { text: "Morning sunlight helps regulate your circadian rhythm and mood.", category: "tip" },
  { text: "Hydration affects mood more than most people realize.", category: "tip" },
  { text: "Cold water on your wrists can quickly calm your nervous system.", category: "tip" },
  { text: "The 5-4-3-2-1 grounding technique: 5 things you see, 4 hear, 3 feel, 2 smell, 1 taste.", category: "tip" },
  { text: "Smiling, even when forced, triggers positive neurological changes.", category: "tip" },

  // Self-Compassion
  { text: "Treat yourself with the kindness you'd show a good friend.", category: "compassion" },
  { text: "Bad days don't make you a bad person.", category: "compassion" },
  { text: "Progress isn't linear. Setbacks are part of the journey.", category: "compassion" },
  { text: "You're doing better than you think you are.", category: "compassion" },
  { text: "It's okay to not be okay sometimes.", category: "compassion" },
  { text: "Rest is not laziness—it's essential for wellbeing.", category: "compassion" },
  { text: "Your worth isn't measured by your productivity.", category: "compassion" },
  { text: "Small steps still move you forward.", category: "compassion" },

  // Positive Psychology
  { text: "Anticipating good events can be as pleasurable as the events themselves.", category: "psychology" },
  { text: "People who help others report higher levels of happiness.", category: "psychology" },
  { text: "Savoring positive moments extends their emotional benefits.", category: "psychology" },
  { text: "Expressing gratitude strengthens relationships and wellbeing.", category: "psychology" },
  { text: "Flow states—being fully absorbed—are linked to greater life satisfaction.", category: "psychology" },
  { text: "Social connection is as important to health as diet and exercise.", category: "psychology" },

  // Fun Facts
  { text: "Humans have about 6,000 thoughts per day. You're choosing to notice them.", category: "fun" },
  { text: "Your brain uses 20% of your body's energy—thinking is real work.", category: "fun" },
  { text: "Laughter increases dopamine, serotonin, and endorphins all at once.", category: "fun" },
  { text: "The average person spends 47% of waking hours mind-wandering.", category: "fun" },
  { text: "Hugs lasting 20+ seconds release oxytocin, the bonding hormone.", category: "fun" },
  { text: "Your sense of smell is directly connected to the brain's emotion center.", category: "fun" },
  { text: "Music that gives you chills releases dopamine, like food or love.", category: "fun" },
  { text: "Tears of joy and tears of sadness have different chemical compositions.", category: "fun" },

  // Nature & Environment
  { text: "Being near water has been proven to reduce stress and anxiety.", category: "nature" },
  { text: "Indoor plants can reduce stress by up to 15%.", category: "nature" },
  { text: "Natural light improves mood, focus, and sleep quality.", category: "nature" },
  { text: "The Japanese practice 'forest bathing' for mental wellness.", category: "nature" },
  { text: "Birdsong has been linked to reduced anxiety and improved mood.", category: "nature" },

  // Evening Reflections
  { text: "Reflection before sleep helps consolidate positive memories.", category: "evening" },
  { text: "Letting go of the day's worries improves sleep quality.", category: "evening" },
  { text: "Evening gratitude practice leads to more optimistic mornings.", category: "evening" },
  { text: "Writing before bed can reduce next-day anxiety by 50%.", category: "evening" },
];

export function DailyInsight({ entries, compact = false }: DailyInsightProps) {
  // Get today's insight based on the date (ensures same insight all day)
  const todayInsight = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = dayOfYear % INSIGHTS.length;
    return INSIGHTS[index];
  }, []);

  // Optionally generate personalized insight based on recent entries
  const personalizedInsight = useMemo(() => {
    if (entries.length < 3) return null;

    const recentEntries = entries.slice(-7);
    const avgMood = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;

    // If mood has been consistently high
    if (avgMood >= 4) {
      return "Your recent reflections show positive momentum. Keep nurturing what's working!";
    }

    // If mood has been improving
    const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));
    const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));
    const firstAvg = firstHalf.reduce((sum, e) => sum + e.mood, 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((sum, e) => sum + e.mood, 0) / (secondHalf.length || 1);

    if (secondAvg > firstAvg + 0.5) {
      return "Your mood has been trending upward recently. You're doing great!";
    }

    return null;
  }, [entries]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'science':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'quote':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'tip':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'compassion':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'nature':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
    }
  };

  // Compact mode - subtle one-liner at footer
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4
                     bg-silver-50/50 dark:bg-silver-800/30 rounded-xl">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-lavender-100 dark:bg-lavender-900/40
                      flex items-center justify-center text-lavender-500">
          {getCategoryIcon(todayInsight.category)}
        </div>
        <p className="text-xs text-silver-500 dark:text-silver-400 leading-relaxed truncate">
          {personalizedInsight || todayInsight.text}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 border-l-4 border-lavender-400">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lavender-100 dark:bg-lavender-900/40
                      flex items-center justify-center text-lavender-500">
          {getCategoryIcon(todayInsight.category)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-lavender-600 dark:text-lavender-400 uppercase tracking-wide mb-1">
            Daily Insight
          </p>
          <p className="text-sm text-silver-700 dark:text-silver-200 leading-relaxed">
            {personalizedInsight || todayInsight.text}
          </p>
        </div>
      </div>
    </div>
  );
}
