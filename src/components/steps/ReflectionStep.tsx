import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function ReflectionStep() {
  const { setReflection, setStep, currentEntry } = useApp();
  const [text, setText] = useState(currentEntry.reflection || '');

  const handleContinue = () => {
    setReflection(text);
    setStep('gratitude');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
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
