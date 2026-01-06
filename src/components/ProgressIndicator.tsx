import type { OnboardingStep } from '../types';

interface Props {
  currentStep: OnboardingStep;
  isFirstTime?: boolean;
}

const steps: { key: OnboardingStep; label: string; icon: string }[] = [
  { key: 'mood', label: 'Mood', icon: '☀️' },
  { key: 'emotions', label: 'Emotions', icon: '💭' },
  { key: 'reflection', label: 'Reflect', icon: '✨' },
  { key: 'gratitude', label: 'Gratitude', icon: '🙏' },
  { key: 'goals', label: 'Goals', icon: '🎯' },
];

export function ProgressIndicator({ currentStep, isFirstTime = true }: Props) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  // Don't show for non-onboarding steps
  if (currentIndex === -1) return null;

  const progress = ((currentIndex) / (steps.length - 1)) * 100;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-6">
      {/* Progress bar container */}
      <div className="relative">
        {/* Background track */}
        <div className="h-1.5 rounded-full bg-silver-200/60 dark:bg-silver-700/40 overflow-hidden">
          {/* Animated progress fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-lavender-400 via-lavender-500 to-lavender-400
                     transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                          animate-shimmer" />
          </div>
        </div>

        {/* Step indicators */}
        <div className="absolute -top-1 left-0 right-0 flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={step.key}
                className={`flex flex-col items-center transition-all duration-300 ${
                  isCurrent ? 'scale-110' : ''
                }`}
              >
                {/* Dot indicator */}
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 flex items-center justify-center
                            ${isCompleted
                              ? 'bg-lavender-500 dark:bg-lavender-400 shadow-lg shadow-lavender-500/30'
                              : isCurrent
                                ? 'bg-lavender-500 dark:bg-lavender-400 ring-4 ring-lavender-200/50 dark:ring-lavender-700/30 shadow-lg shadow-lavender-500/40'
                                : 'bg-silver-300 dark:bg-silver-600'}`}
                >
                  {isCompleted && (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current step label - only show for first-time users */}
      {isFirstTime && (
        <div className="mt-4 text-center animate-fade-in">
          <span className="text-lg mr-1.5">{steps[currentIndex]?.icon}</span>
          <span className="text-sm font-medium text-silver-600 dark:text-silver-300">
            {steps[currentIndex]?.label}
          </span>
          <span className="text-xs text-silver-400 dark:text-silver-500 ml-2">
            {currentIndex + 1} of {steps.length}
          </span>
        </div>
      )}
    </div>
  );
}
