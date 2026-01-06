import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const emotionOptions = [
  { id: 'peaceful', label: 'Peaceful', icon: '~' },
  { id: 'grateful', label: 'Grateful', icon: '+' },
  { id: 'hopeful', label: 'Hopeful', icon: '^' },
  { id: 'energetic', label: 'Energetic', icon: '*' },
  { id: 'content', label: 'Content', icon: 'o' },
  { id: 'tired', label: 'Tired', icon: '-' },
  { id: 'anxious', label: 'Anxious', icon: '!' },
  { id: 'stressed', label: 'Stressed', icon: '#' },
  { id: 'sad', label: 'Sad', icon: '.' },
  { id: 'frustrated', label: 'Frustrated', icon: '>' },
  { id: 'lonely', label: 'Lonely', icon: '_' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: '~' },
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
      <div className="text-center max-w-2xl px-6">
        <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
          What emotions did you feel?
        </h2>
        <p className="text-silver-500 dark:text-silver-400 mb-8">
          Select all that apply
        </p>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-10">
          {emotionOptions.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => toggleEmotion(id)}
              className={`mood-option py-3 px-4 ${selected.includes(id) ? 'selected' : ''}`}
            >
              <span className={`text-sm md:text-base font-medium
                              ${selected.includes(id)
                                ? 'text-lavender-700 dark:text-lavender-300'
                                : 'text-silver-600 dark:text-silver-300'}`}>
                {label}
              </span>
            </button>
          ))}
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
