import { useState } from 'react';
import type { DayEntry, MoodLevel } from '../types';

interface DayDetailModalProps {
  entry: DayEntry | null;
  date: Date;
  onClose: () => void;
  isEmpty: boolean;
  onSaveEntry?: (entry: DayEntry) => void;
}

const EMOTIONS = [
  'Happy', 'Grateful', 'Calm', 'Energetic', 'Hopeful', 'Proud',
  'Anxious', 'Stressed', 'Sad', 'Lonely', 'Frustrated', 'Tired'
];

export function DayDetailModal({ entry, date, onClose, isEmpty, onSaveEntry }: DayDetailModalProps) {
  const [isEditing, setIsEditing] = useState(isEmpty);
  const [editMood, setEditMood] = useState<MoodLevel>(entry?.mood || 3);
  const [editEmotions, setEditEmotions] = useState<string[]>(entry?.emotions || []);
  const [editReflection, setEditReflection] = useState(entry?.reflection || '');
  const [editGratitude, setEditGratitude] = useState(entry?.gratitude || '');

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
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

  const handleSave = () => {
    if (!onSaveEntry) return;

    const newEntry: DayEntry = {
      id: entry?.id || crypto.randomUUID(),
      date: date.toDateString(),
      mood: editMood,
      emotions: editEmotions,
      reflection: editReflection,
      gratitude: editGratitude,
      goals: entry?.goals || [],
      createdAt: entry?.createdAt || Date.now(),
    };

    onSaveEntry(newEntry);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-0 w-full max-w-md animate-slide-up overflow-hidden">
        {/* Header with gradient */}
        <div className={`px-6 py-5 ${getMoodHeaderGradient(entry?.mood || editMood)}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30
                     text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <p className="text-white/80 text-sm mb-1">{isToday ? 'Today' : isPastDate ? 'Past reflection' : 'Future'}</p>
          <h3 className="text-xl font-medium text-white">
            {formattedDate}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-6">
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
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold
                               transition-all ${editMood === mood
                                 ? `${getMoodBgColor(mood)} text-white scale-110 shadow-lg`
                                 : 'bg-silver-100 dark:bg-silver-800 text-silver-500 dark:text-silver-400 hover:scale-105'
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
                      className={`px-3 py-1.5 rounded-full text-sm transition-all
                               ${editEmotions.includes(emotion.toLowerCase())
                                 ? 'bg-lavender-500 text-white'
                                 : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700'
                               }`}
                    >
                      {emotion}
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
                           resize-none text-sm"
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
                           resize-none text-sm"
                  rows={2}
                />
              </div>

              {/* Save button */}
              <div className="flex gap-3 pt-2">
                {!isEmpty && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 btn-secondary py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary py-2.5 text-sm"
                >
                  Save reflection
                </button>
              </div>
            </div>
          ) : entry ? (
            /* View Mode */
            <div className="space-y-5">
              {/* Mood display */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${getMoodBgColor(entry.mood)}
                              flex items-center justify-center shadow-lg`}>
                  <span className="text-xl font-bold text-white">{entry.mood}</span>
                </div>
                <div>
                  <p className="text-sm text-silver-500 dark:text-silver-400">Mood</p>
                  <p className={`text-lg font-medium ${getMoodTextColor(entry.mood)}`}>
                    {getMoodLabel(entry.mood)}
                  </p>
                </div>
              </div>

              {/* Emotions */}
              {entry.emotions.length > 0 && (
                <div>
                  <p className="text-sm text-silver-500 dark:text-silver-400 mb-2">Emotions felt</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.emotions.map(e => (
                      <span key={e} className="px-3 py-1.5 rounded-full text-sm
                                             bg-lavender-100 dark:bg-lavender-900/50
                                             text-lavender-700 dark:text-lavender-300
                                             border border-lavender-200 dark:border-lavender-700/50">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflection */}
              {entry.reflection && (
                <div>
                  <p className="text-sm text-silver-500 dark:text-silver-400 mb-2">Reflection</p>
                  <p className="text-silver-700 dark:text-silver-200 text-sm leading-relaxed
                              bg-silver-50 dark:bg-silver-800/50 rounded-xl p-4">
                    {entry.reflection}
                  </p>
                </div>
              )}

              {/* Gratitude */}
              {entry.gratitude && (
                <div>
                  <p className="text-sm text-silver-500 dark:text-silver-400 mb-2">Gratitude</p>
                  <p className="text-silver-700 dark:text-silver-200 text-sm leading-relaxed
                              bg-silver-50 dark:bg-silver-800/50 rounded-xl p-4">
                    {entry.gratitude}
                  </p>
                </div>
              )}

              {/* Goals */}
              {entry.goals && entry.goals.length > 0 && (
                <div>
                  <p className="text-sm text-silver-500 dark:text-silver-400 mb-2">Goals set</p>
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

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 btn-primary py-2.5 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Empty state with add option */
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-lavender-100 to-lavender-200
                            dark:from-lavender-900/50 dark:to-lavender-800/50
                            flex items-center justify-center">
                <svg className="w-10 h-10 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="text-xl font-light text-silver-700 dark:text-silver-200 mb-2">
                Add a reflection
              </h4>
              <p className="text-silver-500 dark:text-silver-400 mb-6 text-sm leading-relaxed">
                Log how you felt on this day. Past reflections help you understand your patterns over time.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary px-8 py-3 text-sm flex items-center justify-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add reflection
              </button>
            </div>
          )}
        </div>
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
