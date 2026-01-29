import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const emotionOptions = [
  { id: 'peaceful', label: 'Peaceful' },
  { id: 'grateful', label: 'Grateful' },
  { id: 'hopeful', label: 'Hopeful' },
  { id: 'energetic', label: 'Energetic' },
  { id: 'content', label: 'Content' },
  { id: 'tired', label: 'Tired' },
  { id: 'anxious', label: 'Anxious' },
  { id: 'stressed', label: 'Stressed' },
  { id: 'sad', label: 'Sad' },
  { id: 'frustrated', label: 'Frustrated' },
  { id: 'lonely', label: 'Lonely' },
  { id: 'overwhelmed', label: 'Overwhelmed' },
];

export function EmotionsStep() {
  const { setEmotions, setStep, currentEntry } = useApp();
  const [selected, setSelected] = useState<string[]>(currentEntry.emotions || []);

  const toggleEmotion = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(e => e !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    setEmotions(selected);
    setStep('reflection');
  };

  const handleCancel = () => {
    setStep('complete');
  };

  return (
    <div className="relative flex flex-col items-center justify-start pt-8 md:justify-center md:pt-0 min-h-0 md:min-h-[60vh] animate-slide-up">
      {/* Cancel button */}
      <button
        onClick={handleCancel}
        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full
                 bg-silver-100 dark:bg-silver-800 text-silver-500 dark:text-silver-400
                 hover:bg-silver-200 dark:hover:bg-silver-700 hover:text-silver-700 dark:hover:text-silver-200
                 transition-colors"
        title="Cancel and go back"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center max-w-2xl px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
          What emotions did you feel?
        </h2>
        <p className="text-silver-500 dark:text-silver-400 mb-8">
          Select all that apply
        </p>

        {/* Emotion grid - fixed size buttons, no layout shifts */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-10">
          {emotionOptions.map(({ id, label }) => {
            const isSelected = selected.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleEmotion(id)}
                className={`py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl cursor-pointer
                           transition-colors duration-100 ease-out
                           ${isSelected
                             ? 'bg-lavender-500 dark:bg-lavender-600 text-white'
                             : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700'
                           }`}
              >
                <span className="text-xs sm:text-sm font-medium">
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setStep('mood')}
            className="btn-secondary px-8 py-3"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="btn-primary px-10 py-3"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
