import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function LoginPrompt() {
  const { login, skipLogin, setStep } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    login(email);
    setIsLoading(false);
    setStep('complete');
  };

  const handleSkip = () => {
    skipLogin();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
      <div className="text-center w-full max-w-md px-6">
        {/* Success indicator */}
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-500
                        flex items-center justify-center shadow-lg shadow-lavender-500/25">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
          Beautifully done
        </h2>
        <p className="text-silver-500 dark:text-silver-400 mb-8 leading-relaxed">
          Save your progress to continue your journey tomorrow
        </p>

        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input-field text-center"
          />
          <button
            type="submit"
            disabled={!email.trim() || isLoading}
            className={`btn-primary w-full py-3 ${(!email.trim() || isLoading) ? 'opacity-50' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Save my progress'}
          </button>
        </form>

        <button
          onClick={handleSkip}
          className="text-silver-400 hover:text-silver-600 dark:hover:text-silver-300
                   transition-colors text-sm"
        >
          Continue without saving
        </button>

        <p className="mt-8 text-xs text-silver-400 dark:text-silver-500 leading-relaxed">
          Your data stays private and secure. We'll never share your personal reflections.
        </p>
      </div>
    </div>
  );
}
