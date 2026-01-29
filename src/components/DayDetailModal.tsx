import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DayEntry, MoodLevel, QuickNote, FeelingLevel } from '../types';
import { useApp } from '../context/AppContext';

// Emojis for quick notes
const NOTE_EMOJIS = ['😊', '🙂', '😌', '🥰', '😄', '🤗', '🤔', '😐', '💪', '🌟', '✨', '🔥', '❤️', '💜', '😢', '😔', '😤', '🧘', '📖', '☕'];

interface DayDetailModalProps {
  entry: DayEntry | null;
  date: Date;
  onClose: () => void;
  isEmpty: boolean;
  onSaveEntry?: (entry: DayEntry) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  quickNotes?: QuickNote[];
}

const EMOTIONS = [
  'Happy', 'Grateful', 'Calm', 'Energetic', 'Hopeful', 'Proud',
  'Anxious', 'Stressed', 'Sad', 'Lonely', 'Frustrated', 'Tired'
];

const ACTIVITIES = [
  { emoji: '🏃', label: 'Exercise' },
  { emoji: '🚶', label: 'Walk' },
  { emoji: '👥', label: 'Social' },
  { emoji: '😴', label: 'Rest' },
  { emoji: '💼', label: 'Work' },
  { emoji: '🎨', label: 'Creative' },
  { emoji: '🌿', label: 'Nature' },
  { emoji: '🧘', label: 'Meditate' },
];

const DEFAULT_FEELINGS = [
  { name: 'Happiness', color: 'emerald' },
  { name: 'Energy', color: 'amber' },
];

// Available feelings users can track
const AVAILABLE_FEELINGS = [
  'Happiness',
  'Energy',
  'Calmness',
  'Focus',
  'Motivation',
  'Confidence',
  'Creativity',
  'Connection',
  'Gratitude',
  'Hope',
  'Patience',
  'Self-compassion',
  'Resilience',
  'Clarity',
  'Balance',
];

export function DayDetailModal({
  entry,
  date,
  onClose,
  isEmpty,
  onSaveEntry,
  onNavigate,
  canNavigatePrev = true,
  canNavigateNext = true,
  quickNotes = []
}: DayDetailModalProps) {
  const [isEditing, setIsEditing] = useState(isEmpty);
  const [editMood, setEditMood] = useState<MoodLevel | null>(entry?.mood || null);
  const [editEmotions, setEditEmotions] = useState<string[]>(entry?.emotions || []);
  const [editReflection, setEditReflection] = useState(entry?.reflection || '');
  const [editGratitude, setEditGratitude] = useState(entry?.gratitude || '');
  const [editActivities, setEditActivities] = useState<string[]>(entry?.activities || []);
  const [editFeelings, setEditFeelings] = useState<FeelingLevel[]>(
    entry?.feelingLevels || DEFAULT_FEELINGS.map(f => ({ name: f.name, value: 50 }))
  );
  const [hoveredFeeling, setHoveredFeeling] = useState<string | null>(null);
  const [draggingFeeling, setDraggingFeeling] = useState<string | null>(null);
  const [feelingDropdownOpen, setFeelingDropdownOpen] = useState<number | null>(null);

  // Quick notes editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [editNoteEmoji, setEditNoteEmoji] = useState<string | undefined>(undefined);
  const [showNoteEmojiPicker, setShowNoteEmojiPicker] = useState(false);

  const { deleteQuickNote, updateQuickNote } = useApp();

  // Store slider refs for accurate drag tracking
  const sliderRefs = useState<Record<string, HTMLDivElement | null>>(() => ({}))[0];

  // Handle drag for feeling sliders - improved for smooth dragging
  const handleFeelingMouseDown = (e: React.MouseEvent, feelingName: string, sliderElement: HTMLDivElement) => {
    e.preventDefault(); // Prevent text selection during drag
    setDraggingFeeling(feelingName);

    const updatePosition = (clientX: number) => {
      const rect = sliderElement.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.round((x / rect.width) * 100);
      updateFeeling(feelingName, Math.max(0, Math.min(100, percent)));
    };

    // Update immediately on click
    updatePosition(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      updatePosition(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      setDraggingFeeling(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleFeelingTouchStart = (e: React.TouchEvent, feelingName: string, sliderElement: HTMLDivElement) => {
    setDraggingFeeling(feelingName);
    const touch = e.touches[0];
    const rect = sliderElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percent = Math.round((x / rect.width) * 100);
    updateFeeling(feelingName, Math.max(0, Math.min(100, percent)));
  };

  const handleFeelingTouchMove = (e: React.TouchEvent, feelingName: string, sliderElement: HTMLDivElement) => {
    if (draggingFeeling === feelingName && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = sliderElement.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percent = Math.round((x / rect.width) * 100);
      updateFeeling(feelingName, Math.max(0, Math.min(100, percent)));
    }
  };

  const handleFeelingTouchEnd = () => {
    setDraggingFeeling(null);
  };

  // Filter notes for this day
  const dayNotes = quickNotes.filter(n => n.date === date.toDateString());

  // Quick note edit helpers
  const startEditingNote = (note: QuickNote) => {
    setEditingNoteId(note.id);
    setEditNoteText(note.text);
    setEditNoteEmoji(note.emoji);
    setShowNoteEmojiPicker(false);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditNoteText('');
    setEditNoteEmoji(undefined);
    setShowNoteEmojiPicker(false);
  };

  const saveNoteEdit = () => {
    if (editingNoteId && editNoteText.trim()) {
      updateQuickNote(editingNoteId, editNoteText.trim(), editNoteEmoji);
      cancelEditingNote();
    }
  };

  // Reset form when entry changes
  useEffect(() => {
    setEditMood(entry?.mood || null);
    setEditEmotions(entry?.emotions || []);
    setEditReflection(entry?.reflection || '');
    setEditGratitude(entry?.gratitude || '');
    setEditActivities(entry?.activities || []);
    setEditFeelings(entry?.feelingLevels || DEFAULT_FEELINGS.map(f => ({ name: f.name, value: 50 })));
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

  const toggleActivity = (activity: string) => {
    setEditActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const updateFeeling = (name: string, value: number) => {
    setEditFeelings(prev =>
      prev.map(f => f.name === name ? { ...f, value } : f)
    );
  };

  const changeFeelingType = (index: number, newName: string) => {
    setEditFeelings(prev =>
      prev.map((f, i) => i === index ? { ...f, name: newName } : f)
    );
    setFeelingDropdownOpen(null);
  };

  // Get available feelings that aren't already selected
  const getAvailableFeelings = (currentIndex: number) => {
    const currentNames = editFeelings.map(f => f.name);
    return AVAILABLE_FEELINGS.filter(f =>
      f === editFeelings[currentIndex].name || !currentNames.includes(f)
    );
  };

  const handleSave = () => {
    if (!onSaveEntry || editMood === null) return;

    const newEntry: DayEntry = {
      id: entry?.id || crypto.randomUUID(),
      date: date.toDateString(),
      mood: editMood,
      emotions: editEmotions,
      reflection: editReflection,
      gratitude: editGratitude,
      goals: entry?.goals || [],
      activities: editActivities,
      feelingLevels: editFeelings,
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

  const getFeelingColor = (value: number) => {
    // High: lightly glowing green - positive reinforcement
    if (value >= 70) return {
      bg: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
      glow: 'shadow-emerald-400/40',
      text: 'text-emerald-500 dark:text-emerald-400',
      shimmer: 'from-emerald-300/30 via-emerald-200/50 to-emerald-300/30'
    };
    // Mid: neutral muted lavender tone
    if (value >= 40) return {
      bg: 'bg-gradient-to-r from-slate-400 to-lavender-400',
      glow: 'shadow-lavender-400/20',
      text: 'text-slate-500 dark:text-slate-400',
      shimmer: 'from-lavender-300/20 via-lavender-200/40 to-lavender-300/20'
    };
    // Low: soft desaturated rose - gentle, not punishing
    return {
      bg: 'bg-gradient-to-r from-slate-400 to-rose-300',
      glow: 'shadow-rose-300/20',
      text: 'text-rose-400 dark:text-rose-300',
      shimmer: 'from-rose-200/20 via-rose-100/30 to-rose-200/20'
    };
  };

  // Use portal to render at document body level to avoid stacking context issues
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      onClick={handleBackdropClick}
    >
      {/* Backdrop - click to close */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Navigation arrows - positioned with much more space from modal */}
      {onNavigate && (
        <>
          <button
            onClick={() => canNavigatePrev && onNavigate('prev')}
            disabled={!canNavigatePrev}
            className={`absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full transition-all
                       hidden lg:flex
                       ${canNavigatePrev
                         ? 'bg-white/90 dark:bg-silver-800/90 text-silver-700 dark:text-silver-200 hover:bg-white dark:hover:bg-silver-700 hover:scale-110 shadow-lg'
                         : 'bg-white/30 dark:bg-silver-800/30 text-silver-400 dark:text-silver-600 cursor-not-allowed'
                       }`}
            title="Previous day (←)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => canNavigateNext && onNavigate('next')}
            disabled={!canNavigateNext}
            className={`absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full transition-all
                       hidden lg:flex
                       ${canNavigateNext
                         ? 'bg-white/90 dark:bg-silver-800/90 text-silver-700 dark:text-silver-200 hover:bg-white dark:hover:bg-silver-700 hover:scale-110 shadow-lg'
                         : 'bg-white/30 dark:bg-silver-800/30 text-silver-400 dark:text-silver-600 cursor-not-allowed'
                       }`}
            title="Next day (→)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Modal - extra wide for comfortable editing */}
      <div
        className="relative bg-white dark:bg-silver-900 rounded-2xl shadow-2xl
                   w-[95vw] sm:w-[90vw] md:w-[800px] lg:w-[850px] xl:w-[900px]
                   min-w-[320px] md:min-w-[700px] lg:min-w-[800px]
                   max-w-[900px]
                   animate-slide-up overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => {
          e.stopPropagation();
          // Close feeling dropdown when clicking elsewhere in modal
          if (feelingDropdownOpen !== null) {
            setFeelingDropdownOpen(null);
          }
        }}
      >
        {/* Header */}
        <div className={`px-6 py-5 ${getMoodHeaderGradient(entry?.mood || editMood || null)} relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30
                     text-white transition-all hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
            <span className="px-2 py-0.5 bg-white/20 rounded-full">
              {isToday ? 'Today' : isPastDate ? 'Past' : 'Future'}
            </span>
            {onNavigate && (
              <span className="text-white/60 hidden md:inline">Use arrow keys to navigate</span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-white pr-10">
            {formattedDate}
          </h3>

          {/* Navigation bar below date - visible on tablet and mobile */}
          {onNavigate && (
            <div className="flex items-center justify-center gap-4 mt-2 lg:hidden">
              <button
                onClick={() => canNavigatePrev && onNavigate('prev')}
                disabled={!canNavigatePrev}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
                  canNavigatePrev
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Prev</span>
              </button>
              <button
                onClick={() => canNavigateNext && onNavigate('next')}
                disabled={!canNavigateNext}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
                  canNavigateNext
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Content - generous padding for comfortable editing */}
        <div className="p-6 md:p-8 lg:p-10 overflow-y-auto flex-1">
          {isEditing ? (
            <div className="space-y-8">
              {/* Mood selector */}
              <div>
                <label className="text-sm font-medium text-silver-700 dark:text-silver-200 block mb-3">
                  How were you feeling?
                </label>
                <div className="flex justify-center gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5].map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setEditMood(mood as MoodLevel)}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-lg md:text-xl font-bold
                               transition-all duration-200 ${editMood === mood
                                 ? `${getMoodBgColor(mood)} text-white scale-105 shadow-lg ring-2 ring-offset-2 ring-offset-white dark:ring-offset-silver-900 ${getMoodRingColor(mood)}`
                                 : 'bg-gradient-to-br from-slate-100 to-cyan-50 dark:from-slate-800 dark:to-cyan-900/30 text-slate-500 dark:text-slate-400 hover:scale-105 hover:from-cyan-100 hover:to-sky-100 dark:hover:from-cyan-900/40 dark:hover:to-sky-900/40 border border-cyan-200/50 dark:border-cyan-700/30'
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
                {editMood === null && (
                  <p className="text-xs text-cyan-500 dark:text-cyan-400 mt-2 text-center">
                    Select your mood to continue
                  </p>
                )}
              </div>

              {/* Feeling Bars */}
              <div>
                <label className="text-sm font-medium text-silver-700 dark:text-silver-200 block mb-3">
                  How's your...
                </label>
                <div className="space-y-4">
                  {editFeelings.map((feeling, index) => {
                    const colors = getFeelingColor(feeling.value);
                    const isHovered = hoveredFeeling === feeling.name;
                    const isDragging = draggingFeeling === feeling.name;
                    const isDropdownOpen = feelingDropdownOpen === index;
                    return (
                      <div key={index} className="relative">
                        <div className="flex justify-between text-xs mb-1.5">
                          {/* Feeling name with dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setFeelingDropdownOpen(isDropdownOpen ? null : index)}
                              className="flex items-center gap-1 text-silver-600 dark:text-silver-300 font-medium
                                       hover:text-lavender-600 dark:hover:text-lavender-400 transition-colors"
                            >
                              {feeling.name}
                              <svg className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {/* Dropdown menu */}
                            {isDropdownOpen && (
                              <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-silver-800
                                            rounded-lg shadow-lg border border-silver-200 dark:border-silver-700
                                            py-1 min-w-[160px] max-h-48 overflow-y-auto">
                                {getAvailableFeelings(index).map(f => (
                                  <button
                                    key={f}
                                    type="button"
                                    onClick={() => changeFeelingType(index, f)}
                                    className={`w-full text-left px-3 py-1.5 text-sm transition-colors
                                              ${f === feeling.name
                                                ? 'bg-lavender-100 dark:bg-lavender-900/40 text-lavender-700 dark:text-lavender-300'
                                                : 'hover:bg-silver-100 dark:hover:bg-silver-700 text-silver-700 dark:text-silver-300'
                                              }`}
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className={`font-medium transition-colors ${colors.text}`}>
                            {feeling.value >= 70 ? 'High' : feeling.value >= 40 ? 'Neutral' : 'Low'}
                          </span>
                        </div>
                        <div
                          ref={(el) => { if (el) sliderRefs[feeling.name] = el; }}
                          className={`relative h-8 bg-silver-100 dark:bg-silver-800 rounded-full overflow-hidden cursor-pointer
                                    select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                          style={{ touchAction: 'none' }}
                          onMouseEnter={() => setHoveredFeeling(feeling.name)}
                          onMouseLeave={() => !isDragging && setHoveredFeeling(null)}
                          onMouseDown={(e) => {
                            const el = sliderRefs[feeling.name];
                            if (el) handleFeelingMouseDown(e, feeling.name, el);
                          }}
                          onTouchStart={(e) => {
                            const el = sliderRefs[feeling.name];
                            if (el) handleFeelingTouchStart(e, feeling.name, el);
                          }}
                          onTouchMove={(e) => {
                            const el = sliderRefs[feeling.name];
                            if (el) handleFeelingTouchMove(e, feeling.name, el);
                          }}
                          onTouchEnd={handleFeelingTouchEnd}
                        >
                          {/* Fill bar */}
                          <div
                            className={`absolute inset-y-0 left-0 ${colors.bg} rounded-full
                                      transition-[width] duration-75 ease-out
                                      ${(isHovered || isDragging) ? `shadow-lg ${colors.glow}` : ''}`}
                            style={{ width: `${feeling.value}%` }}
                          />
                          {/* Dopamine shimmer on hover */}
                          {(isHovered || isDragging) && (
                            <div
                              className={`absolute inset-0 bg-gradient-to-r ${colors.shimmer}
                                        animate-[shimmer_1.5s_ease-in-out_infinite]`}
                              style={{
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s ease-in-out infinite',
                              }}
                            />
                          )}
                          {/* Thumb */}
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white
                                      shadow-md transition-transform duration-100 flex items-center justify-center
                                      ${(isHovered || isDragging) ? 'scale-110 shadow-lg' : ''}`}
                            style={{ left: `calc(${feeling.value}% - 14px)` }}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />
                          </div>
                        </div>
                        {/* Optional: subtle feedback text */}
                        {isDragging && (
                          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-silver-400 dark:text-silver-500">
                            {feeling.value}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="text-sm font-medium text-silver-700 dark:text-silver-200 block mb-3">
                  What did you do today?
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITIES.map(activity => {
                    const isSelected = editActivities.includes(activity.label.toLowerCase());
                    return (
                      <button
                        key={activity.label}
                        onClick={() => toggleActivity(activity.label.toLowerCase())}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                 ${isSelected
                                   ? 'bg-lavender-500 dark:bg-lavender-600 text-white shadow-md shadow-lavender-500/30 dark:shadow-lavender-600/30 ring-2 ring-lavender-400 dark:ring-lavender-500'
                                   : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700 border border-silver-200 dark:border-silver-700'
                                 }`}
                      >
                        <span>{activity.emoji}</span>
                        <span>{activity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Emotions */}
              <div>
                <label className="text-sm font-medium text-silver-700 dark:text-silver-200 block mb-3">
                  What emotions did you feel?
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map(emotion => {
                    const isSelected = editEmotions.includes(emotion.toLowerCase());
                    return (
                      <button
                        key={emotion}
                        onClick={() => toggleEmotion(emotion.toLowerCase())}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                 ${isSelected
                                   ? 'bg-lavender-500 dark:bg-lavender-600 text-white shadow-md shadow-lavender-500/30 dark:shadow-lavender-600/30 ring-2 ring-lavender-400 dark:ring-lavender-500'
                                   : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700 border border-silver-200 dark:border-silver-700'
                                 }`}
                      >
                        {emotion}
                      </button>
                    );
                  })}
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

              {/* Quick Notes for this day - with edit/delete */}
              {dayNotes.length > 0 && (
                <div className="pt-2 border-t border-silver-200/50 dark:border-silver-700/30">
                  <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Quick Notes ({dayNotes.length})
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {dayNotes.map(note => (
                      <div key={note.id} className="group flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg
                                                   border border-slate-200/60 dark:border-slate-700/50">
                        {editingNoteId === note.id ? (
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="relative">
                                <button
                                  onClick={() => setShowNoteEmojiPicker(!showNoteEmojiPicker)}
                                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm hover:bg-slate-300 dark:hover:bg-slate-600"
                                >
                                  {editNoteEmoji || '➕'}
                                </button>
                                {showNoteEmojiPicker && (
                                  <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-silver-800 rounded-lg shadow-lg border border-silver-200 dark:border-silver-700 z-20 grid grid-cols-5 gap-1 w-36">
                                    <button onClick={() => { setEditNoteEmoji(undefined); setShowNoteEmojiPicker(false); }} className="w-6 h-6 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700">✕</button>
                                    {NOTE_EMOJIS.slice(0, 14).map(emoji => (
                                      <button key={emoji} onClick={() => { setEditNoteEmoji(emoji); setShowNoteEmojiPicker(false); }} className="w-6 h-6 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">{emoji}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <textarea
                                value={editNoteText}
                                onChange={(e) => setEditNoteText(e.target.value)}
                                className="flex-1 text-xs bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-lavender-400"
                                rows={2}
                                autoFocus
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={cancelEditingNote} className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                              <button onClick={saveNoteEdit} className="px-3 py-1 text-xs bg-lavender-500 text-white rounded-lg hover:bg-lavender-600">Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {note.emoji && <span className="text-sm">{note.emoji}</span>}
                            <p className="flex-1 text-xs text-slate-600 dark:text-slate-300">{note.text}</p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditingNote(note)} className="p-1 rounded text-slate-400 hover:text-lavender-500 hover:bg-lavender-50 dark:hover:bg-lavender-900/20" title="Edit">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={() => deleteQuickNote(note.id)} className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Delete">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  disabled={editMood === null}
                  className={`flex-1 py-3 text-sm rounded-xl font-medium transition-all
                            ${editMood === null
                              ? 'bg-silver-200 dark:bg-silver-700 text-silver-400 dark:text-silver-500 cursor-not-allowed'
                              : 'btn-primary'
                            }`}
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

              {/* How's your... (Feeling Levels) */}
              {entry.feelingLevels && entry.feelingLevels.length > 0 && (
                <div>
                  <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2">
                    How's your...
                  </p>
                  <div className="space-y-2">
                    {entry.feelingLevels.map(feeling => {
                      const colors = getFeelingColor(feeling.value);
                      return (
                        <div key={feeling.name} className="flex items-center gap-3">
                          <span className="text-sm text-silver-600 dark:text-silver-300 w-20">{feeling.name}</span>
                          <div className="flex-1 h-2 bg-silver-200 dark:bg-silver-700 rounded-full overflow-hidden">
                            <div className={`h-full ${colors.bg} rounded-full`} style={{ width: `${feeling.value}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${colors.text} w-12 text-right`}>
                            {feeling.value}%
                          </span>
                        </div>
                      );
                    })}
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
                    {entry.activities.map(a => {
                      const activity = ACTIVITIES.find(act => act.label.toLowerCase() === a);
                      return (
                        <span key={a} className="px-3 py-1.5 rounded-full text-sm
                                               bg-amber-100 dark:bg-amber-900/30
                                               text-amber-700 dark:text-amber-300
                                               border border-amber-200 dark:border-amber-700/50">
                          {activity?.emoji} {a.charAt(0).toUpperCase() + a.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

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

              {/* Quick Notes for this day - with edit/delete */}
              {dayNotes.length > 0 && (
                <div>
                  <p className="text-xs text-silver-500 dark:text-silver-400 uppercase tracking-wide mb-2">
                    Quick Notes ({dayNotes.length})
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {dayNotes.map(note => (
                      <div key={note.id} className="group flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg
                                                   border border-slate-200/60 dark:border-slate-700/50">
                        {editingNoteId === note.id ? (
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="relative">
                                <button
                                  onClick={() => setShowNoteEmojiPicker(!showNoteEmojiPicker)}
                                  className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-base hover:bg-slate-300 dark:hover:bg-slate-600"
                                >
                                  {editNoteEmoji || '➕'}
                                </button>
                                {showNoteEmojiPicker && (
                                  <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-silver-800 rounded-lg shadow-lg border border-silver-200 dark:border-silver-700 z-20 grid grid-cols-5 gap-1 w-40">
                                    <button onClick={() => { setEditNoteEmoji(undefined); setShowNoteEmojiPicker(false); }} className="w-6 h-6 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700">✕</button>
                                    {NOTE_EMOJIS.slice(0, 14).map(emoji => (
                                      <button key={emoji} onClick={() => { setEditNoteEmoji(emoji); setShowNoteEmojiPicker(false); }} className="w-6 h-6 rounded text-base hover:bg-slate-200 dark:hover:bg-slate-700">{emoji}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <textarea
                                value={editNoteText}
                                onChange={(e) => setEditNoteText(e.target.value)}
                                className="flex-1 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-lavender-400"
                                rows={2}
                                autoFocus
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={cancelEditingNote} className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                              <button onClick={saveNoteEdit} className="px-3 py-1 text-xs bg-lavender-500 text-white rounded-lg hover:bg-lavender-600">Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {note.emoji && <span className="text-base">{note.emoji}</span>}
                            <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">{note.text}</p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditingNote(note)} className="p-1.5 rounded text-slate-400 hover:text-lavender-500 hover:bg-lavender-50 dark:hover:bg-lavender-900/20" title="Edit">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={() => deleteQuickNote(note.id)} className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Delete">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
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
            /* Empty state */
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-sky-200
                            dark:from-cyan-900/50 dark:to-sky-800/50
                            flex items-center justify-center">
                <svg className="w-10 h-10 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </div>
    </div>,
    document.body
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

function getMoodHeaderGradient(mood: number | null): string {
  if (mood === null) {
    return 'bg-gradient-to-r from-cyan-400 to-sky-500';
  }
  const gradients: Record<number, string> = {
    1: 'bg-gradient-to-r from-red-400 to-red-500',
    2: 'bg-gradient-to-r from-orange-400 to-orange-500',
    3: 'bg-gradient-to-r from-amber-400 to-amber-500',
    4: 'bg-gradient-to-r from-lime-400 to-emerald-400',
    5: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
  };
  return gradients[mood] || 'bg-gradient-to-r from-cyan-400 to-sky-500';
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
