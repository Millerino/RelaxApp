import type { OnboardingStep } from '../types';

interface Props {
  currentStep: OnboardingStep;
}

const steps: OnboardingStep[] = ['mood', 'emotions', 'reflection', 'gratitude', 'goals'];

export function ProgressIndicator({ currentStep }: Props) {
  const currentIndex = steps.indexOf(currentStep);

  if (currentIndex === -1) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`h-1 rounded-full transition-all duration-300 ${
              index <= currentIndex
                ? 'w-8 bg-lavender-400 dark:bg-lavender-500'
                : 'w-6 bg-silver-200 dark:bg-silver-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
