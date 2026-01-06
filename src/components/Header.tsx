import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function Header() {
  const { state } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* Logo/Brand - left side */}
          <div className="text-silver-600 dark:text-silver-400 text-sm font-medium tracking-wide">
            reflect
          </div>

          {/* Login button - positioned to the left of lamp */}
          <div className="flex items-center gap-3 mr-14">
            {state.isLoggedIn ? (
              <span className="text-xs text-silver-500 dark:text-silver-400">
                {state.email}
              </span>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-xs text-silver-500 dark:text-silver-400
                         hover:text-silver-700 dark:hover:text-silver-200
                         transition-colors px-3 py-1.5 rounded-lg
                         hover:bg-white/30 dark:hover:bg-silver-800/30"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    login(email);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-8 w-full max-w-sm animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-silver-400 hover:text-silver-600
                   dark:hover:text-silver-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-medium text-silver-800 dark:text-silver-100 mb-2">
          Welcome back
        </h3>
        <p className="text-sm text-silver-500 dark:text-silver-400 mb-6">
          Enter your email to sync your reflections
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input-field"
            autoFocus
          />
          <button
            type="submit"
            disabled={!email.trim() || isLoading}
            className={`btn-primary w-full ${(!email.trim() || isLoading) ? 'opacity-50' : ''}`}
          >
            {isLoading ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-silver-400 dark:text-silver-500">
          We'll send you a magic link
        </p>
      </div>
    </div>
  );
}
