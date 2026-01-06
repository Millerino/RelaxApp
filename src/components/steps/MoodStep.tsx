import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { MoodLevel } from '../../types';

const moods: { level: MoodLevel; emoji: string; label: string }[] = [
  { level: 1, emoji: '1', label: 'Difficult' },
  { level: 2, emoji: '2', label: 'Challenging' },
  { level: 3, emoji: '3', label: 'Okay' },
  { level: 4, emoji: '4', label: 'Good' },
  { level: 5, emoji: '5', label: 'Great' },
];

export function MoodStep() {
  const { setMood, setStep, currentEntry } = useApp();
  const [selected, setSelected] = useState<MoodLevel | null>(currentEntry.mood || null);

  const handleSelect = (level: MoodLevel) => {
    setSelected(level);
    setMood(level);
  };

  const handleContinue = () => {
    if (selected) {
      setStep('emotions');
    }
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

        <div className="flex justify-center gap-3 md:gap-4 mb-12">
          {moods.map(({ level, label }) => (
            <button
              key={level}
              onClick={() => handleSelect(level)}
              className={`group flex flex-col items-center p-4 md:p-5 rounded-2xl
                         transition-all duration-300 ease-out
                         ${selected === level
                           ? 'bg-lavender-100 dark:bg-lavender-900/40 border-2 border-lavender-400 dark:border-lavender-500 scale-105 shadow-lg shadow-lavender-500/20'
                           : 'bg-white/40 dark:bg-silver-800/40 border-2 border-transparent hover:bg-white/60 dark:hover:bg-silver-700/40 hover:border-lavender-200 dark:hover:border-lavender-700'
                         }`}
            >
              <div className={`text-3xl md:text-4xl mb-2 transition-transform duration-200
                              ${selected === level ? 'scale-110' : 'group-hover:scale-105'}`}>
                {getMoodVisual(level, selected === level)}
              </div>
              <span className={`text-xs md:text-sm font-medium transition-colors
                               ${selected === level
                                 ? 'text-lavender-700 dark:text-lavender-300'
                                 : 'text-silver-500 dark:text-silver-400'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`btn-primary px-10 py-3 ${!selected ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function getMoodVisual(level: MoodLevel, isSelected: boolean): React.ReactNode {
  const baseClass = `w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300`;
  const colors = {
    1: isSelected ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-500' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
    2: isSelected ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-500' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
    3: isSelected ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-500' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
    4: isSelected ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
    5: isSelected ? 'bg-lavender-100 dark:bg-lavender-900/50 text-lavender-600' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
  };

  return (
    <div className={`${baseClass} ${colors[level]}`}>
      <span className="text-lg md:text-xl font-semibold">{level}</span>
    </div>
  );
}
