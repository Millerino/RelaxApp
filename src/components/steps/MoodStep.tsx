import { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { MoodLevel } from '../../types';

const moods: { level: MoodLevel; label: string }[] = [
  { level: 1, label: 'Difficult' },
  { level: 2, label: 'Challenging' },
  { level: 3, label: 'Okay' },
  { level: 4, label: 'Good' },
  { level: 5, label: 'Great' },
];

export function MoodStep() {
  const { setMood, setStep, currentEntry } = useApp();
  const [clickedLevel, setClickedLevel] = useState<MoodLevel | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSelect = (level: MoodLevel) => {
    setClickedLevel(level);
    setMood(level);
    // Auto-advance with smooth delay, clearing any previous timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setStep('emotions');
    }, 400);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
      <div className="text-center max-w-lg px-6">
        <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
          Overall, how did today feel?
        </h2>
        <p className="text-silver-500 dark:text-silver-400 mb-10">
          There's no right or wrong answer
        </p>

        <div className="flex justify-center gap-3 md:gap-4">
          {moods.map(({ level, label }) => {
            const isSelected = currentEntry.mood === level;
            const isClicked = clickedLevel === level;
            return (
              <button
                key={level}
                onClick={() => handleSelect(level)}
                className={`group flex flex-col items-center p-4 md:p-5 rounded-2xl
                           transition-all duration-300 ease-out
                           ${isClicked ? 'animate-pulse-once' : ''}
                           ${isSelected
                             ? `${getSelectedBgColor(level)} border-2 ${getSelectedBorderColor(level)} scale-105 shadow-lg ${getSelectedShadowColor(level)}`
                             : `bg-white/40 dark:bg-silver-800/40 border-2 border-transparent
                                ${getHoverBgColor(level)} ${getHoverBorderColor(level)}`
                           }`}
                style={{
                  transform: isClicked ? 'scale(0.95)' : isSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.15s ease-out, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                <div className={`mb-2 transition-all duration-300 ease-out
                                ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <MoodCircle level={level} isSelected={isSelected} />
                </div>
                <span className={`text-xs md:text-sm font-medium transition-colors duration-300
                                 ${isSelected
                                   ? getSelectedTextColor(level)
                                   : `text-silver-500 dark:text-silver-400 ${getHoverTextColor(level)}`}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Mood circle with hover color effect
function MoodCircle({ level, isSelected }: { level: MoodLevel; isSelected: boolean }) {
  const baseClass = `w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-out`;

  // Colors for selected state
  const selectedColors = {
    1: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    2: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
    3: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    4: 'bg-lime-100 dark:bg-lime-900/50 text-lime-600 dark:text-lime-400',
    5: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
  };

  // Colors for hover state (using group-hover)
  const hoverColors = {
    1: 'group-hover:bg-red-50 dark:group-hover:bg-red-900/30 group-hover:text-red-500 dark:group-hover:text-red-400',
    2: 'group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30 group-hover:text-orange-500 dark:group-hover:text-orange-400',
    3: 'group-hover:bg-amber-50 dark:group-hover:bg-amber-900/30 group-hover:text-amber-500 dark:group-hover:text-amber-400',
    4: 'group-hover:bg-lime-50 dark:group-hover:bg-lime-900/30 group-hover:text-lime-500 dark:group-hover:text-lime-400',
    5: 'group-hover:bg-green-50 dark:group-hover:bg-green-900/30 group-hover:text-green-500 dark:group-hover:text-green-400',
  };

  const defaultColor = 'bg-silver-100 dark:bg-silver-700 text-silver-400';

  return (
    <div className={`${baseClass} ${isSelected ? selectedColors[level] : `${defaultColor} ${hoverColors[level]}`}`}>
      <span className="text-lg md:text-xl font-semibold">{level}</span>
    </div>
  );
}

function getSelectedBgColor(level: MoodLevel): string {
  const colors = {
    1: 'bg-red-50/80 dark:bg-red-900/20',
    2: 'bg-orange-50/80 dark:bg-orange-900/20',
    3: 'bg-amber-50/80 dark:bg-amber-900/20',
    4: 'bg-lime-50/80 dark:bg-lime-900/20',
    5: 'bg-green-50/80 dark:bg-green-900/20',
  };
  return colors[level];
}

function getSelectedBorderColor(level: MoodLevel): string {
  const colors = {
    1: 'border-red-300 dark:border-red-500/50',
    2: 'border-orange-300 dark:border-orange-500/50',
    3: 'border-amber-300 dark:border-amber-500/50',
    4: 'border-lime-300 dark:border-lime-500/50',
    5: 'border-green-300 dark:border-green-500/50',
  };
  return colors[level];
}

function getSelectedShadowColor(level: MoodLevel): string {
  const colors = {
    1: 'shadow-red-400/15',
    2: 'shadow-orange-400/15',
    3: 'shadow-amber-400/15',
    4: 'shadow-lime-400/15',
    5: 'shadow-green-400/15',
  };
  return colors[level];
}

function getSelectedTextColor(level: MoodLevel): string {
  const colors = {
    1: 'text-red-600 dark:text-red-300',
    2: 'text-orange-600 dark:text-orange-300',
    3: 'text-amber-600 dark:text-amber-300',
    4: 'text-lime-600 dark:text-lime-300',
    5: 'text-green-600 dark:text-green-300',
  };
  return colors[level];
}

function getHoverBgColor(level: MoodLevel): string {
  const colors = {
    1: 'hover:bg-red-50/50 dark:hover:bg-red-900/20',
    2: 'hover:bg-orange-50/50 dark:hover:bg-orange-900/20',
    3: 'hover:bg-amber-50/50 dark:hover:bg-amber-900/20',
    4: 'hover:bg-lime-50/50 dark:hover:bg-lime-900/20',
    5: 'hover:bg-green-50/50 dark:hover:bg-green-900/20',
  };
  return colors[level];
}

function getHoverBorderColor(level: MoodLevel): string {
  const colors = {
    1: 'hover:border-red-200 dark:hover:border-red-700/50',
    2: 'hover:border-orange-200 dark:hover:border-orange-700/50',
    3: 'hover:border-amber-200 dark:hover:border-amber-700/50',
    4: 'hover:border-lime-200 dark:hover:border-lime-700/50',
    5: 'hover:border-green-200 dark:hover:border-green-700/50',
  };
  return colors[level];
}

function getHoverTextColor(level: MoodLevel): string {
  const colors = {
    1: 'group-hover:text-red-500 dark:group-hover:text-red-400',
    2: 'group-hover:text-orange-500 dark:group-hover:text-orange-400',
    3: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
    4: 'group-hover:text-lime-500 dark:group-hover:text-lime-400',
    5: 'group-hover:text-green-500 dark:group-hover:text-green-400',
  };
  return colors[level];
}
