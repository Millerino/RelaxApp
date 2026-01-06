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

  const handleSelect = (level: MoodLevel) => {
    setMood(level);
    // Auto-advance to next step after brief delay for visual feedback
    setTimeout(() => {
      setStep('emotions');
    }, 300);
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
          {moods.map(({ level, label }) => {
            const isSelected = currentEntry.mood === level;
            return (
              <button
                key={level}
                onClick={() => handleSelect(level)}
                className={`group flex flex-col items-center p-4 md:p-5 rounded-2xl
                           transition-all duration-300 ease-out
                           ${isSelected
                             ? `${getSelectedBgColor(level)} border-2 ${getSelectedBorderColor(level)} scale-105 shadow-lg ${getSelectedShadowColor(level)}`
                             : 'bg-white/40 dark:bg-silver-800/40 border-2 border-transparent hover:bg-white/60 dark:hover:bg-silver-700/40 hover:border-silver-300 dark:hover:border-silver-600'
                           }`}
              >
                <div className={`text-3xl md:text-4xl mb-2 transition-transform duration-200
                                ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {getMoodVisual(level, isSelected)}
                </div>
                <span className={`text-xs md:text-sm font-medium transition-colors
                                 ${isSelected
                                   ? getSelectedTextColor(level)
                                   : 'text-silver-500 dark:text-silver-400'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-silver-400 dark:text-silver-500">
          Tap a number to continue
        </p>
      </div>
    </div>
  );
}

// Deep red (1) to deep green (5) gradient
function getMoodVisual(level: MoodLevel, isSelected: boolean): React.ReactNode {
  const baseClass = `w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300`;
  const colors = {
    1: isSelected ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
    2: isSelected ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
    3: isSelected ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
    4: isSelected ? 'bg-lime-100 dark:bg-lime-900/50 text-lime-600 dark:text-lime-400' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
    5: isSelected ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-silver-100 dark:bg-silver-700 text-silver-400',
  };

  return (
    <div className={`${baseClass} ${colors[level]}`}>
      <span className="text-lg md:text-xl font-semibold">{level}</span>
    </div>
  );
}

function getSelectedBgColor(level: MoodLevel): string {
  const colors = {
    1: 'bg-red-50 dark:bg-red-900/30',
    2: 'bg-orange-50 dark:bg-orange-900/30',
    3: 'bg-amber-50 dark:bg-amber-900/30',
    4: 'bg-lime-50 dark:bg-lime-900/30',
    5: 'bg-green-50 dark:bg-green-900/30',
  };
  return colors[level];
}

function getSelectedBorderColor(level: MoodLevel): string {
  const colors = {
    1: 'border-red-400 dark:border-red-500',
    2: 'border-orange-400 dark:border-orange-500',
    3: 'border-amber-400 dark:border-amber-500',
    4: 'border-lime-400 dark:border-lime-500',
    5: 'border-green-400 dark:border-green-500',
  };
  return colors[level];
}

function getSelectedShadowColor(level: MoodLevel): string {
  const colors = {
    1: 'shadow-red-500/20',
    2: 'shadow-orange-500/20',
    3: 'shadow-amber-500/20',
    4: 'shadow-lime-500/20',
    5: 'shadow-green-500/20',
  };
  return colors[level];
}

function getSelectedTextColor(level: MoodLevel): string {
  const colors = {
    1: 'text-red-700 dark:text-red-300',
    2: 'text-orange-700 dark:text-orange-300',
    3: 'text-amber-700 dark:text-amber-300',
    4: 'text-lime-700 dark:text-lime-300',
    5: 'text-green-700 dark:text-green-300',
  };
  return colors[level];
}
