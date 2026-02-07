import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthCallbackProps {
  onComplete: () => void;
}

export function AuthCallback({ onComplete }: AuthCallbackProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let fallbackTimeout: ReturnType<typeof setTimeout>;
    let errorTimeout: ReturnType<typeof setTimeout>;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const handleCallback = async () => {
      try {
        if (!supabase) {
          throw new Error('Auth not configured');
        }

        // Get the session from URL hash (Supabase puts tokens there)
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          throw error;
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          window.history.replaceState({}, '', '/');
          onComplete();
        } else {
          // No session yet, wait for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              clearTimeout(fallbackTimeout);
              subscription.unsubscribe();
              if (mounted) {
                window.history.replaceState({}, '', '/');
                onComplete();
              }
            }
          });
          authSubscription = subscription;

          // Timeout fallback
          fallbackTimeout = setTimeout(() => {
            subscription.unsubscribe();
            if (mounted) {
              window.history.replaceState({}, '', '/');
              onComplete();
            }
          }, 5000);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Redirect home after showing error
        errorTimeout = setTimeout(() => {
          if (mounted) {
            window.history.replaceState({}, '', '/');
            onComplete();
          }
        }, 3000);
      }
    };

    handleCallback();

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      clearTimeout(errorTimeout);
      authSubscription?.unsubscribe();
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center max-w-md px-6">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-light text-silver-800 dark:text-silver-100 mb-4">
              Authentication Error
            </h1>
            <p className="text-silver-500 dark:text-silver-400 mb-4">
              {error}
            </p>
            <p className="text-sm text-silver-400 dark:text-silver-500">
              Redirecting you back...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-lavender-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-light text-silver-800 dark:text-silver-100 mb-4">
              Completing sign in...
            </h1>
            <p className="text-silver-500 dark:text-silver-400">
              Please wait while we authenticate your account.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
