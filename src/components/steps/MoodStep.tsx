import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { MoodLevel } from '../../types';

const moods: { level: MoodLevel; label: string; emoji: string }[] = [
  { level: 1, label: 'Difficult', emoji: '😔' },
  { level: 2, label: 'Challenging', emoji: '😕' },
  { level: 3, label: 'Okay', emoji: '😐' },
  { level: 4, label: 'Good', emoji: '🙂' },
  { level: 5, label: 'Great', emoji: '😊' },
];

export function MoodStep() {
  const { setMood, setStep, currentEntry } = useApp();
  const [clickedLevel, setClickedLevel] = useState<MoodLevel | null>(null);

  const handleSelect = (level: MoodLevel) => {
    setClickedLevel(level);
    setMood(level);
    // Auto-advance with smooth delay
    setTimeout(() => {
      setStep('emotions');
    }, 400);
  };

  const handleCancel = () => {
    // Go back to dashboard without saving
    setStep('complete');
  };

  return (
    <div className="relative flex flex-col items-center justify-start pt-8 md:justify-center md:pt-0 min-h-0 md:min-h-[60vh] animate-slide-up">
      <div className="text-center w-full max-w-2xl px-4 sm:px-6">
        {/* Cancel/Exit button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full
                   bg-silver-100 dark:bg-silver-800 text-silver-500 dark:text-silver-400
                   hover:bg-silver-200 dark:hover:bg-silver-700 hover:text-silver-700 dark:hover:text-silver-200
                   transition-all"
          title="Cancel and go back"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
          Overall, how did today feel?
        </h2>
        <p className="text-silver-500 dark:text-silver-400 mb-10">
          There's no right or wrong answer
        </p>

        {/* Mood buttons - horizontal on all screens */}
        <div className="flex justify-center items-end gap-2 sm:gap-3 md:gap-4">
          {moods.map(({ level, label }) => {
            const isSelected = currentEntry.mood === level;
            const isClicked = clickedLevel === level;
            return (
              <button
                key={level}
                onClick={() => handleSelect(level)}
                className={`group flex flex-col items-center transition-all duration-200 ease-out
                           ${isClicked ? 'scale-95' : isSelected ? 'scale-105' : 'hover:scale-105'}`}
              >
                {/* Mood circle with number */}
                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full
                               flex items-center justify-center transition-all duration-200
                               ${isSelected
                                 ? getMoodSelectedBg(level)
                                 : 'bg-silver-100 dark:bg-silver-800 group-hover:bg-silver-200 dark:group-hover:bg-silver-700'
                               }
                               ${isSelected ? 'ring-2 ring-offset-2 dark:ring-offset-silver-900 ' + getMoodRingColor(level) : ''}`}
                >
                  <span className={`text-xl sm:text-2xl md:text-3xl font-bold transition-colors duration-200
                                   ${isSelected
                                     ? getMoodTextColor(level)
                                     : 'text-silver-400 dark:text-silver-500 group-hover:' + getMoodHoverTextColor(level)
                                   }`}>
                    {level}
                  </span>
                </div>

                {/* Label below - always visible, no truncation */}
                <span className={`mt-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200
                                 ${isSelected
                                   ? getMoodTextColor(level)
                                   : 'text-silver-500 dark:text-silver-400'}`}>
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

function getMoodSelectedBg(level: MoodLevel): string {
  const colors = {
    1: 'bg-red-100 dark:bg-red-900/40',
    2: 'bg-orange-100 dark:bg-orange-900/40',
    3: 'bg-amber-100 dark:bg-amber-900/40',
    4: 'bg-lime-100 dark:bg-lime-900/40',
    5: 'bg-emerald-100 dark:bg-emerald-900/40',
  };
  return colors[level];
}

function getMoodRingColor(level: MoodLevel): string {
  const colors = {
    1: 'ring-red-400',
    2: 'ring-orange-400',
    3: 'ring-amber-400',
    4: 'ring-lime-400',
    5: 'ring-emerald-400',
  };
  return colors[level];
}

function getMoodTextColor(level: MoodLevel): string {
  const colors = {
    1: 'text-red-600 dark:text-red-400',
    2: 'text-orange-600 dark:text-orange-400',
    3: 'text-amber-600 dark:text-amber-400',
    4: 'text-lime-600 dark:text-lime-400',
    5: 'text-emerald-600 dark:text-emerald-400',
  };
  return colors[level];
}

function getMoodHoverTextColor(level: MoodLevel): string {
  const colors = {
    1: 'text-red-500',
    2: 'text-orange-500',
    3: 'text-amber-500',
    4: 'text-lime-500',
    5: 'text-emerald-500',
  };
  return colors[level];
}
