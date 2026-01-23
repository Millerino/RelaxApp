import { useState, useEffect } from 'react';
import type { DayEntry, MoodLevel } from '../types';

interface DayDetailModalProps {
  entry: DayEntry | null;
  date: Date;
  onClose: () => void;
  isEmpty: boolean;
  onSaveEntry?: (entry: DayEntry) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
}

const EMOTIONS = [
  'Happy', 'Grateful', 'Calm', 'Energetic', 'Hopeful', 'Proud',
  'Anxious', 'Stressed', 'Sad', 'Lonely', 'Frustrated', 'Tired'
];

// Daylio-inspired activities - what you were doing
const ACTIVITIES = [
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'exercise', label: 'Exercise', icon: '🏃' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { id: 'friends', label: 'Friends', icon: '👥' },
  { id: 'dating', label: 'Dating', icon: '💕' },
  { id: 'reading', label: 'Reading', icon: '📚' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'cooking', label: 'Cooking', icon: '🍳' },
  { id: 'shopping', label: 'Shopping', icon: '🛒' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'nature', label: 'Nature', icon: '🌳' },
  { id: 'meditation', label: 'Meditation', icon: '🧘' },
  { id: 'sleep', label: 'Good Sleep', icon: '😴' },
];

export function DayDetailModal({
  entry,
  date,
  onClose,
  isEmpty,
  onSaveEntry,
  onNavigate,
  canNavigatePrev = true,
  canNavigateNext = true
}: DayDetailModalProps) {
  const [isEditing, setIsEditing] = useState(isEmpty);
  const [editMood, setEditMood] = useState<MoodLevel>(entry?.mood || 3);
  const [editEmotions, setEditEmotions] = useState<string[]>(entry?.emotions || []);
  const [editActivities, setEditActivities] = useState<string[]>(entry?.activities || []);
  const [editReflection, setEditReflection] = useState(entry?.reflection || '');
  const [editGratitude, setEditGratitude] = useState(entry?.gratitude || '');

  // Reset form when entry changes (navigation)
  useEffect(() => {
    setEditMood(entry?.mood || 3);
    setEditEmotions(entry?.emotions || []);
    setEditActivities(entry?.activities || []);
    setEditReflection(entry?.reflection || '');
    setEditGratitude(entry?.gratitude || '');
    setIsEditing(isEmpty);
  }, [entry, isEmpty, date]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && canNavigatePrev && onNavigate && !isEditing) {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight' && canNavigateNext && onNavigate && !isEditing) {
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, canNavigatePrev, canNavigateNext, isEditing]);

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const isToday = date.toDateString() === new Date().toDateString();
  const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));

  const toggleEmotion = (emotion: string) => {
    setEditEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleActivity = (activityId: string) => {
    setEditActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(a => a !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSave = () => {
    if (!onSaveEntry) return;

    const newEntry: DayEntry = {
      id: entry?.id || crypto.randomUUID(),
      date: date.toDateString(),
      mood: editMood,
      emotions: editEmotions,
      activities: editActivities,
      reflection: editReflection,
      gratitude: editGratitude,
      goals: entry?.goals || [],
      createdAt: entry?.createdAt || Date.now(),
    };

    onSaveEntry(newEntry);
    setIsEditing(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

      {/* Desktop Navigation arrows - positioned outside modal, hidden on mobile */}
      {onNavigate && (
        <>
          {/* Previous day arrow - desktop only */}
          <button
            onClick={() => canNavigatePrev && onNavigate('prev')}
            disabled={!canNavigatePrev}
            className={`absolute left-4 lg:left-[calc(50%-280px)] top-1/2 -translate-y-1/2 z-10
                       hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all
                       ${canNavigatePrev
                         ? 'bg-white/95 dark:bg-silver-800/95 text-silver-700 dark:text-silver-200 hover:bg-white dark:hover:bg-silver-700 hover:scale-105 shadow-lg backdrop-blur-sm'
                         : 'bg-white/30 dark:bg-silver-800/30 text-silver-400 dark:text-silver-600 cursor-not-allowed'
                       }`}
            title="Previous day (←)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium hidden lg:inline">Previous</span>
          </button>

          {/* Next day arrow - desktop only */}
          <button
            onClick={() => canNavigateNext && onNavigate('next')}
            disabled={!canNavigateNext}
            className={`absolute right-4 lg:right-[calc(50%-280px)] top-1/2 -translate-y-1/2 z-10
                       hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all
                       ${canNavigateNext
                         ? 'bg-white/95 dark:bg-silver-800/95 text-silver-700 dark:text-silver-200 hover:bg-white dark:hover:bg-silver-700 hover:scale-105 shadow-lg backdrop-blur-sm'
                         : 'bg-white/30 dark:bg-silver-800/30 text-silver-400 dark:text-silver-600 cursor-not-allowed'
                       }`}
            title="Next day (→)"
          >
            <span className="text-sm font-medium hidden lg:inline">Next</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-silver-900 rounded-2xl shadow-2xl w-full max-w-md
                   animate-slide-up overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 ${getMoodHeaderGradient(entry?.mood || editMood)} relative`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30
                     text-white transition-all hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Date info */}
          <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
            <span className="px-2 py-0.5 bg-white/20 rounded-full">
              {isToday ? 'Today' : isPastDate ? 'Past' : 'Future'}
            </span>
            {onNavigate && (
              <span className="text-white/60 hidden md:inline">Use ← → to navigate</span>
            )}
          </div>

          {/* Date title */}
          <h3 className="text-xl font-semibold text-white pr-10">
            {formattedDate}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-5">
              {/* Mood selector */}
              <div>
                <label className="text-sm font-medium text-silver-700 dark:text-silver-200 block mb-3">
                  How were you feeling?
                </label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setEditMood(mood as MoodLevel)}
                      className={`flex-1 aspect-square max-w-[56px] rounded-xl flex items-center justify-center text-lg font-bold
                               transition-all duration-200 ${editMood === mood
                                 ? `${getMoodBgColor(mood)} text-white scale-105 shadow-lg ring-2 ring-offset-2 ring-offset-white dark:ring-offset-silver-900 ${getMoodRingColor(mood)}`
                                 : 'bg-silver-100 dark:bg-silver-800 text-silver-500 dark:text-silver-400 hover:scale-105 hover:bg-silver-200 dark:hover:bg-silver-700'
                               }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-silver-400 mt-2 px-1">
                  <span>Difficult</span>
                  <span>Great</span>
                </div>
              </div>

              {/* Emotions */}
              <div>
                <label className="text-sm font-medium text-silver-700 dark:text-silver-200 block mb-3">
                  What emotions did you feel?
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map(emotion => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion.toLowerCase())}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200
                               ${editEmotions.includes(emotion.toLowerCase())
                                 ? 'bg-lavender-500 text-white shadow-md'
                                 : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700'
                               }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities - Daylio-inspired */}
              <div>
                <label className="text-sm font-medium text-silver-700 dark:text-silver-200 block mb-3">
                  What were you doing?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ACTIVITIES.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => toggleActivity(activity.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all duration-200
                               ${editActivities.includes(activity.id)
                                 ? 'bg-emerald-500 text-white shadow-md scale-105'
                                 : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700'
                               }`}
                    >
                      <span className="text-lg">{activity.icon}</span>
                      <span className="truncate w-full text-center">{activity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reflection */}
              <div>
                <label className="text-sm font-medium text-silver-700 dark:text-silver-200 block mb-2">
                  Reflection
                </label>
                <textarea
                  value={editReflection}
                  onChange={(e) => setEditReflection(e.target.value)}
                  placeholder="What was on your mind?"
                  className="w-full px-4 py-3 rounded-xl bg-silver-50 dark:bg-silver-800/50
                           border border-silver-200 dark:border-silver-700 text-silver-800 dark:text-silver-100
                           placeholder-silver-400 focus:outline-none focus:ring-2 focus:ring-lavender-400
                           resize-none text-sm transition-all"
                  rows={3}
                />
              </div>

              {/* Gratitude */}
              <div>
                <label className="text-sm font-medium text-silver-700 dark:text-silver-200 block mb-2">
                  Gratitude
                </label>
                <textarea
                  value={editGratitude}
                  onChange={(e) => setEditGratitude(e.target.value)}
                  placeholder="What were you grateful for?"
                  className="w-full px-4 py-3 rounded-xl bg-silver-50 dark:bg-silver-800/50
                           border border-silver-200 dark:border-silver-700 text-silver-800 dark:text-silver-100
                           placeholder-silver-400 focus:outline-none focus:ring-2 focus:ring-lavender-400
                           resize-none text-sm transition-all"
                  rows={2}
                />
              </div>

              {/* Save button */}
              <div className="flex gap-3 pt-2">
                {!isEmpty && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-silver-200 dark:border-silver-700
                             text-silver-600 dark:text-silver-300 hover:bg-silver-50 dark:hover:bg-silver-800
                             transition-all text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary py-3 text-sm"
                >
                  Save reflection
                </button>
              </div>
            </div>
          ) : entry ? (
            /* View Mode */
            <div className="space-y-5">
              {/* Mood display */}
              <div className="flex items-center gap-4 p-4 bg-silver-50 dark:bg-silver-800/30 rounded-xl">
                <div className={`w-14 h-14 rounded-xl ${getMoodBgColor(entry.mood)}
                              flex items-center justify-center shadow-lg`}>
                  <span className="text-xl font-bold text-white">{entry.mood}</span>
                </div>
                <div>
                  <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide">Mood</p>
                  <p className={`text-lg font-semibold ${getMoodTextColor(entry.mood)}`}>
                    {getMoodLabel(entry.mood)}
                  </p>
                </div>
              </div>

              {/* Emotions */}
              {entry.emotions.length > 0 && (
                <div>
                  <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2">
                    Emotions felt
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {entry.emotions.map(e => (
                      <span key={e} className="px-3 py-1.5 rounded-full text-sm
                                             bg-lavender-100 dark:bg-lavender-900/50
                                             text-lavender-700 dark:text-lavender-300
                                             border border-lavender-200 dark:border-lavender-700/50">
                        {e.charAt(0).toUpperCase() + e.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {entry.activities && entry.activities.length > 0 && (
                <div>
                  <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2">
                    Activities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {entry.activities.map(actId => {
                      const activity = ACTIVITIES.find(a => a.id === actId);
                      if (!activity) return null;
                      return (
                        <span key={actId} className="px-3 py-1.5 rounded-xl text-sm flex items-center gap-1.5
                                                    bg-emerald-100 dark:bg-emerald-900/50
                                                    text-emerald-700 dark:text-emerald-300
                                                    border border-emerald-200 dark:border-emerald-700/50">
                          <span>{activity.icon}</span>
                          {activity.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reflection */}
              {entry.reflection && (
                <div>
                  <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2">
                    Reflection
                  </p>
                  <p className="text-silver-700 dark:text-silver-200 text-sm leading-relaxed
                              bg-silver-50 dark:bg-silver-800/50 rounded-xl p-4">
                    {entry.reflection}
                  </p>
                </div>
              )}

              {/* Gratitude */}
              {entry.gratitude && (
                <div>
                  <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2">
                    Gratitude
                  </p>
                  <p className="text-silver-700 dark:text-silver-200 text-sm leading-relaxed
                              bg-silver-50 dark:bg-silver-800/50 rounded-xl p-4">
                    {entry.gratitude}
                  </p>
                </div>
              )}

              {/* Goals */}
              {entry.goals && entry.goals.length > 0 && (
                <div>
                  <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2">
                    Goals set
                  </p>
                  <ul className="space-y-2">
                    {entry.goals.map(g => (
                      <li key={g.id} className="flex items-center gap-2 text-sm text-silver-700 dark:text-silver-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                        {g.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Edit button */}
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 rounded-xl border border-silver-200 dark:border-silver-700
                         text-silver-600 dark:text-silver-300 hover:bg-silver-50 dark:hover:bg-silver-800
                         transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit this reflection
              </button>
            </div>
          ) : (
            /* Empty state with add option */
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-lavender-100 to-lavender-200
                            dark:from-lavender-900/50 dark:to-lavender-800/50
                            flex items-center justify-center">
                <svg className="w-10 h-10 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="text-xl font-medium text-silver-700 dark:text-silver-200 mb-2">
                No reflection yet
              </h4>
              <p className="text-silver-500 dark:text-silver-400 mb-6 text-sm leading-relaxed max-w-xs mx-auto">
                Add how you felt on this day to track your emotional patterns over time.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary px-8 py-3 text-sm"
              >
                Add reflection
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Bar - Bottom positioned */}
        {onNavigate && (
          <div className="md:hidden border-t border-silver-200 dark:border-silver-700 bg-silver-50 dark:bg-silver-800/50">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => canNavigatePrev && onNavigate('prev')}
                disabled={!canNavigatePrev}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  canNavigatePrev
                    ? 'bg-white dark:bg-silver-700 text-silver-700 dark:text-silver-200 hover:bg-silver-100 dark:hover:bg-silver-600 shadow-sm'
                    : 'text-silver-300 dark:text-silver-600 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Prev</span>
              </button>

              <span className="text-xs text-silver-400 dark:text-silver-500">
                Swipe or tap arrows
              </span>

              <button
                onClick={() => canNavigateNext && onNavigate('next')}
                disabled={!canNavigateNext}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  canNavigateNext
                    ? 'bg-white dark:bg-silver-700 text-silver-700 dark:text-silver-200 hover:bg-silver-100 dark:hover:bg-silver-600 shadow-sm'
                    : 'text-silver-300 dark:text-silver-600 cursor-not-allowed'
                }`}
              >
                <span className="text-sm font-medium">Next</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
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

function getMoodBgColor(mood: number): string {
  const colors: Record<number, string> = {
    1: 'bg-gradient-to-br from-red-400 to-red-500',
    2: 'bg-gradient-to-br from-orange-400 to-orange-500',
    3: 'bg-gradient-to-br from-amber-400 to-amber-500',
    4: 'bg-gradient-to-br from-lime-400 to-lime-500',
    5: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
  };
  return colors[mood] || colors[3];
}

function getMoodRingColor(mood: number): string {
  const colors: Record<number, string> = {
    1: 'ring-red-400',
    2: 'ring-orange-400',
    3: 'ring-amber-400',
    4: 'ring-lime-400',
    5: 'ring-emerald-400',
  };
  return colors[mood] || colors[3];
}

function getMoodHeaderGradient(mood: number): string {
  const gradients: Record<number, string> = {
    1: 'bg-gradient-to-r from-red-400 to-red-500',
    2: 'bg-gradient-to-r from-orange-400 to-orange-500',
    3: 'bg-gradient-to-r from-amber-400 to-amber-500',
    4: 'bg-gradient-to-r from-lime-400 to-emerald-400',
    5: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
  };
  return gradients[mood] || 'bg-gradient-to-r from-lavender-400 to-lavender-500';
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
