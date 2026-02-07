import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ onClose, initialMode = 'login' }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, isConfigured } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email to confirm your account');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-silver-500 hover:text-silver-700
                     dark:text-silver-400 dark:hover:text-silver-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center py-8">
            <h2 className="text-xl font-light text-silver-800 dark:text-silver-100 mb-4">
              Coming Soon
            </h2>
            <p className="text-silver-500 dark:text-silver-400">
              Account features are being set up. Check back soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-silver-500 hover:text-silver-700
                   dark:text-silver-400 dark:hover:text-silver-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-light text-silver-800 dark:text-silver-100 mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-silver-500 dark:text-silver-400">
            {mode === 'login'
              ? 'Sign in to access your reflections'
              : 'Start your mindfulness journey'}
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                   bg-white dark:bg-silver-800 border border-silver-200 dark:border-silver-700
                   text-silver-700 dark:text-silver-200 hover:bg-silver-50 dark:hover:bg-silver-700
                   transition-colors mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-silver-200 dark:border-silver-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-silver-900 px-2 text-silver-400 dark:text-silver-500">
              or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {success && (
            <p className="text-emerald-500 text-sm">{success}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-silver-500 dark:text-silver-400 mt-6">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                className="text-lavender-500 hover:text-lavender-600 font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className="text-lavender-500 hover:text-lavender-600 font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
