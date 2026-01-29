import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function ReflectionStep() {
  const { setReflection, setStep, currentEntry } = useApp();
  const [text, setText] = useState(currentEntry.reflection || '');

  const handleContinue = () => {
    setReflection(text);
    setStep('gratitude');
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
                 transition-all"
        title="Cancel and go back"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center w-full max-w-lg px-6">
        <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
          What's on your mind?
        </h2>
        <p className="text-silver-500 dark:text-silver-400 mb-8">
          A moment to unload your thoughts
        </p>

        <div className="mb-8">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write freely... no one else will see this unless you want them to"
            rows={5}
            className="input-field resize-none text-base leading-relaxed"
          />
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setStep('emotions')}
            className="btn-secondary px-8 py-3"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="btn-primary px-10 py-3"
          >
            {text.trim() ? 'Continue' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
}
