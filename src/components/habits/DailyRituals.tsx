import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useHabitTracker } from '../../hooks/useHabitTracker';
import { HabitTile } from './HabitTile';

interface DailyRitualsProps {
  onSparkChange?: (boost: number) => void;
}

// Bottom sheet component
function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-silver-900 rounded-t-3xl sm:rounded-2xl
                      p-6 pb-8 sm:p-6 animate-slide-up shadow-2xl max-h-[80vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-silver-400 hover:text-silver-600
                     dark:hover:text-silver-200 hover:bg-silver-100 dark:hover:bg-silver-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-silver-800 dark:text-silver-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-silver-500 dark:text-silver-400 italic">
            "{subtitle}"
          </p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>,
    document.body
  );
}

// Water Sheet
function WaterSheet({
  isOpen,
  onClose,
  current,
  goal,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  current: number;
  goal: number;
  onUpdate: (amount: number) => void;
}) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Hydration"
      subtitle="Hydration fuels the Spark"
    >
      <div className="text-center">
        {/* Current amount */}
        <div className="mb-6">
          <span className="text-5xl font-bold text-blue-500">{current}</span>
          <span className="text-2xl text-silver-400 ml-1">ml</span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-silver-200 dark:bg-silver-700 rounded-full mb-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (current / goal) * 100)}%` }}
          />
        </div>
        <p className="text-sm text-silver-500 dark:text-silver-400 mb-6">
          Goal: {goal}ml
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onUpdate(-250)}
            disabled={current <= 0}
            className="w-14 h-14 rounded-full bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300
                       text-2xl font-bold hover:bg-silver-200 dark:hover:bg-silver-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="text-lg text-silver-600 dark:text-silver-300 font-medium w-20">
            250ml
          </span>
          <button
            onClick={() => onUpdate(250)}
            className="w-14 h-14 rounded-full bg-blue-500 text-white text-2xl font-bold
                       hover:bg-blue-600 transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          Done
        </button>
      </div>
    </BottomSheet>
  );
}

// Meditate Sheet
function MeditateSheet({
  isOpen,
  onClose,
  totalMinutes,
  onLog,
}: {
  isOpen: boolean;
  onClose: () => void;
  totalMinutes: number;
  onLog: (minutes: number) => void;
}) {
  const [minutes, setMinutes] = useState(10);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(5 * 60);
  const [isPreparing, setIsPreparing] = useState(false);

  const durations = [3, 5, 10, 15, 20, 30];

  // Timer logic
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setIsTimerActive(false);
          onLog(selectedDuration);
          return selectedDuration * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, onLog, selectedDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startMeditation = () => {
    setTimerSeconds(selectedDuration * 60);
    setIsTimerActive(true);
    setIsPreparing(false);
  };

  // Active meditation session - calm, minimal UI
  if (isTimerActive) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={() => { setIsTimerActive(false); onClose(); }}
        title="Meditating"
        subtitle="Be present"
      >
        <div className="text-center py-8">
          {/* Calm ambient glow */}
          <div className="relative flex justify-center mb-12">
            <div className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-violet-200/40 to-purple-300/30 dark:from-violet-800/30 dark:to-purple-700/20 blur-2xl" />
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-violet-300/50 to-purple-400/40 dark:from-violet-700/40 dark:to-purple-600/30 blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 opacity-80" />
          </div>

          {/* Timer - elegant and minimal */}
          <div className="text-6xl font-extralight tracking-wide text-violet-600 dark:text-violet-400 mb-4">
            {formatTime(timerSeconds)}
          </div>

          <p className="text-sm text-silver-400 dark:text-silver-500 mb-12 italic">
            Let your thoughts drift by like clouds
          </p>

          <button
            onClick={() => {
              const elapsedMinutes = Math.ceil((selectedDuration * 60 - timerSeconds) / 60);
              if (elapsedMinutes > 0) onLog(elapsedMinutes);
              setIsTimerActive(false);
              setTimerSeconds(selectedDuration * 60);
            }}
            className="px-8 py-3 rounded-full border border-violet-300 dark:border-violet-600 text-violet-600 dark:text-violet-400
                       font-medium hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
          >
            End Session
          </button>
        </div>
      </BottomSheet>
    );
  }

  // Preparation screen - calm and inviting
  if (isPreparing) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsPreparing(false)}
        title="Prepare to Meditate"
        subtitle="Find your stillness"
      >
        <div className="text-center py-4">
          {/* Soft ambient visual */}
          <div className="relative flex justify-center mb-8">
            <div className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-violet-200/30 to-purple-300/20 dark:from-violet-800/20 dark:to-purple-700/15 blur-2xl" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 opacity-70" />
          </div>

          {/* Duration display */}
          <div className="mb-8">
            <span className="text-5xl font-extralight text-violet-600 dark:text-violet-400">{selectedDuration}</span>
            <span className="text-xl text-silver-400 dark:text-silver-500 ml-2">minutes</span>
          </div>

          {/* Preparation tips */}
          <div className="space-y-3 mb-8 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-3 text-sm text-silver-600 dark:text-silver-400">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Find a quiet, comfortable space</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-silver-600 dark:text-silver-400">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Sit with a straight but relaxed posture</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-silver-600 dark:text-silver-400">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Close your eyes when ready</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsPreparing(false)}
              className="flex-1 py-3 rounded-xl border border-silver-200 dark:border-silver-700 text-silver-600 dark:text-silver-400
                         font-medium hover:bg-silver-50 dark:hover:bg-silver-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={startMeditation}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium
                         hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/25"
            >
              Begin
            </button>
          </div>
        </div>
      </BottomSheet>
    );
  }

  // Main meditation menu
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Meditate"
      subtitle="Stillness is strength"
    >
      <div className="space-y-6">
        {totalMinutes > 0 && (
          <div className="text-center p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
            <span className="text-sm text-violet-600 dark:text-violet-400">
              {totalMinutes} minutes logged today
            </span>
          </div>
        )}

        {/* Timer duration selector */}
        <div>
          <p className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-3">
            Choose your duration
          </p>
          <div className="grid grid-cols-3 gap-2">
            {durations.map(duration => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`py-4 rounded-xl font-medium transition-all ${
                  selectedDuration === duration
                    ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700'
                }`}
              >
                {duration}m
              </button>
            ))}
          </div>
        </div>

        {/* Start meditation button */}
        <button
          onClick={() => setIsPreparing(true)}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium
                     hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/25"
        >
          Start Meditation
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-silver-200 dark:bg-silver-700" />
          <span className="text-xs text-silver-400">or log manually</span>
          <div className="flex-1 h-px bg-silver-200 dark:bg-silver-700" />
        </div>

        {/* Manual log option */}
        <div className="p-4 rounded-xl bg-silver-50 dark:bg-silver-800/50 border border-silver-200 dark:border-silver-700">
          <p className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-3">Log completed session</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Math.min(120, parseInt(e.target.value) || 0)))}
              className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-silver-900 border border-silver-300 dark:border-silver-600
                         text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-400"
              min={1}
              max={120}
            />
            <span className="text-silver-500">minutes</span>
            <button
              onClick={() => { onLog(minutes); onClose(); }}
              className="px-4 py-2 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
            >
              Log
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

// Sleep Sheet
function SleepSheet({
  isOpen,
  onClose,
  onLog,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLog: (hours: number, quality: 'poor' | 'okay' | 'great') => void;
}) {
  const [hours, setHours] = useState(7.5);
  const [quality, setQuality] = useState<'poor' | 'okay' | 'great' | null>(null);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Sleep"
      subtitle="Rest rebuilds the Spark"
    >
      <div className="space-y-6">
        {/* Hours slider */}
        <div>
          <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-2">
            Hours Slept
          </label>
          <div className="text-center mb-2">
            <span className="text-4xl font-bold text-indigo-500">{hours}</span>
            <span className="text-xl text-silver-400 ml-1">h</span>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value))}
            className="w-full h-2 bg-silver-200 dark:bg-silver-700 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
          />
          <div className="flex justify-between text-xs text-silver-400 mt-1">
            <span>0h</span>
            <span>12h</span>
          </div>
        </div>

        {/* Quality buttons */}
        <div>
          <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-2">
            How did you sleep?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'poor', emoji: '☹️', label: 'Poor' },
              { value: 'okay', emoji: '😐', label: 'Okay' },
              { value: 'great', emoji: '😊', label: 'Great' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuality(opt.value)}
                className={`p-3 rounded-xl border-2 transition-all
                           ${quality === opt.value
                             ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                             : 'border-silver-200 dark:border-silver-700 hover:border-indigo-300'
                           }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-xs font-medium text-silver-600 dark:text-silver-300">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { if (quality) { onLog(hours, quality); onClose(); } }}
          disabled={!quality}
          className="w-full py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </BottomSheet>
  );
}

// Detox Sheet
function DetoxSheet({
  isOpen,
  onClose,
  isActive,
  startTime,
  onStart,
  onEnd,
}: {
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
  startTime: number | null;
  onStart: () => void;
  onEnd: (successful: boolean) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);

  const durations = [15, 30, 45, 60, 90, 120];

  // Timer countdown
  useEffect(() => {
    if (!isActive || !startTime) return;

    const updateTime = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, selectedDuration * 60 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        onEnd(true);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime, onEnd, selectedDuration]);

  // Visibility change detection
  useEffect(() => {
    if (!isActive) return;

    const handleVisibility = () => {
      if (document.hidden) {
        // User left the app
        setShowConfirm(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Confirmation modal
  if (showConfirm) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setShowConfirm(false)}
        title="Welcome back"
        subtitle="Presence is the gift"
      >
        <div className="text-center space-y-4">
          <p className="text-silver-600 dark:text-silver-300">
            Did you stay focused?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { onEnd(true); setShowConfirm(false); onClose(); }}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
            >
              Yes, I did
            </button>
            <button
              onClick={() => { onEnd(false); setShowConfirm(false); onClose(); }}
              className="flex-1 py-3 rounded-xl bg-silver-200 dark:bg-silver-700 text-silver-600 dark:text-silver-300
                         font-medium hover:bg-silver-300 dark:hover:bg-silver-600 transition-colors"
            >
              Got distracted
            </button>
          </div>
        </div>
      </BottomSheet>
    );
  }

  // Active timer state - clean and focused
  if (isActive) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Focus Mode"
        subtitle="Presence is the gift"
      >
        <div className="text-center py-6">
          {/* Calm amber glow */}
          <div className="relative flex justify-center mb-10">
            <div className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-300/20 dark:from-amber-800/20 dark:to-orange-700/15 blur-2xl" />
            <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-amber-300/40 to-orange-400/30 dark:from-amber-700/30 dark:to-orange-600/20 blur-xl" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-80" />
          </div>

          {/* Timer */}
          <div className="text-6xl font-extralight tracking-wide text-amber-600 dark:text-amber-400 mb-4">
            {formatTime(timeLeft)}
          </div>

          <p className="text-sm text-silver-500 dark:text-silver-400 mb-10 italic">
            Focus on what truly matters
          </p>

          <button
            onClick={() => { onEnd(false); onClose(); }}
            className="px-8 py-3 rounded-full border border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400
                       font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
          >
            End Early
          </button>
        </div>
      </BottomSheet>
    );
  }

  // Start state - duration selection
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Detox"
      subtitle="Presence is the gift"
    >
      <div className="space-y-6">
        {/* Motivational message */}
        <div className="text-center py-4">
          <p className="text-silver-600 dark:text-silver-300 italic">
            "Now it's time to focus on what matters"
          </p>
        </div>

        {/* Duration selector */}
        <div>
          <p className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-3">
            Choose your focus time
          </p>
          <div className="grid grid-cols-3 gap-2">
            {durations.map(duration => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`py-4 rounded-xl font-medium transition-all ${
                  selectedDuration === duration
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700'
                }`}
              >
                {duration >= 60 ? `${duration / 60}h` : `${duration}m`}
              </button>
            ))}
          </div>
        </div>

        {/* What you'll do */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
            Step away from screens and notifications for {selectedDuration} minutes
          </p>
        </div>

        <button
          onClick={() => { setTimeLeft(selectedDuration * 60); onStart(); }}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold
                     hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
        >
          Start Focus Session
        </button>
      </div>
    </BottomSheet>
  );
}

export function DailyRituals({ onSparkChange }: DailyRitualsProps) {
  const {
    habits,
    updateWater,
    logMeditation,
    logSleep,
    startDetox,
    endDetox,
    completedCount,
    allComplete,
    sparkBoost,
  } = useHabitTracker();

  const [activeSheet, setActiveSheet] = useState<'water' | 'meditate' | 'sleep' | 'detox' | null>(null);

  // Notify parent of spark changes
  useEffect(() => {
    onSparkChange?.(sparkBoost);
  }, [sparkBoost, onSparkChange]);

  // Detox time remaining for tile display
  const getDetoxDisplay = useCallback(() => {
    if (habits.detox.completed) return 'Done';
    if (habits.detox.active && habits.detox.startTime) {
      const elapsed = Math.floor((Date.now() - habits.detox.startTime) / 1000);
      const remaining = Math.max(0, 30 * 60 - elapsed);
      const mins = Math.floor(remaining / 60);
      return `${mins}m left`;
    }
    return 'Start';
  }, [habits.detox]);

  const [detoxDisplay, setDetoxDisplay] = useState(getDetoxDisplay());

  useEffect(() => {
    const interval = setInterval(() => {
      setDetoxDisplay(getDetoxDisplay());
    }, 1000);
    return () => clearInterval(interval);
  }, [getDetoxDisplay]);

  return (
    <div className="glass-card p-5 relative overflow-hidden">
      {/* Completed badge */}
      {allComplete && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500
                        flex items-center justify-center shadow-lg shadow-amber-500/30">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-silver-700 dark:text-silver-200">
          Daily Rituals
        </h3>
        <p className="text-xs text-silver-400 dark:text-silver-500">
          {completedCount}/4 completed
        </p>
      </div>

      {/* 2x2 Grid of habits */}
      <div className="grid grid-cols-2 gap-3">
        {/* Water */}
        <HabitTile
          icon={
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6a6 6 0 016 6c0 3.314-2.686 6-6 6s-6-2.686-6-6a6 6 0 016-6z" />
            </svg>
          }
          label="Water"
          value={`${habits.water.current}ml`}
          progress={habits.water.current / habits.water.goal}
          color="#3B82F6"
          iconBgColor="rgba(59, 130, 246, 0.15)"
          completed={habits.water.completed}
          onClick={() => setActiveSheet('water')}
        />

        {/* Meditate */}
        <HabitTile
          icon={
            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          label="Meditate"
          value={habits.meditate.completed ? `${habits.meditate.minutes}m` : 'Start'}
          progress={habits.meditate.completed ? 1 : 0}
          color="#8B5CF6"
          iconBgColor="rgba(139, 92, 246, 0.15)"
          completed={habits.meditate.completed}
          onClick={() => setActiveSheet('meditate')}
        />

        {/* Sleep */}
        <HabitTile
          icon={
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          }
          label="Sleep"
          value={habits.sleep.completed ? `${habits.sleep.hours}h` : 'Log'}
          progress={habits.sleep.completed ? 1 : 0}
          color="#6366F1"
          iconBgColor="rgba(99, 102, 241, 0.15)"
          completed={habits.sleep.completed}
          onClick={() => setActiveSheet('sleep')}
        />

        {/* Digital Detox */}
        <HabitTile
          icon={
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          label="Detox"
          value={detoxDisplay}
          progress={habits.detox.completed ? 1 : habits.detox.active ? 0.5 : 0}
          color="#F59E0B"
          iconBgColor="rgba(245, 158, 11, 0.15)"
          completed={habits.detox.completed}
          onClick={() => setActiveSheet('detox')}
          isActive={habits.detox.active}
        />
      </div>

      {/* All complete message */}
      {allComplete && (
        <div className="mt-4 pt-3 border-t border-silver-200/50 dark:border-silver-700/30 text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            ✨ Your Spark shines brightest when you show up for yourself.
          </p>
        </div>
      )}

      {/* Bottom Sheets */}
      <WaterSheet
        isOpen={activeSheet === 'water'}
        onClose={() => setActiveSheet(null)}
        current={habits.water.current}
        goal={habits.water.goal}
        onUpdate={updateWater}
      />

      <MeditateSheet
        isOpen={activeSheet === 'meditate'}
        onClose={() => setActiveSheet(null)}
        totalMinutes={habits.meditate.minutes}
        onLog={logMeditation}
      />

      <SleepSheet
        isOpen={activeSheet === 'sleep'}
        onClose={() => setActiveSheet(null)}
        onLog={logSleep}
      />

      <DetoxSheet
        isOpen={activeSheet === 'detox'}
        onClose={() => setActiveSheet(null)}
        isActive={habits.detox.active}
        startTime={habits.detox.startTime}
        onStart={startDetox}
        onEnd={endDetox}
      />
    </div>
  );
}
