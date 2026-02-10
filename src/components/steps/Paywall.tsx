import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { buildPaymentLink, isStripeConfigured } from '../../lib/stripe';
import { MONTHLY_PRICE } from '../../lib/constants';

export function Paywall() {
  const { setStep, state, subscribeToPremium } = useApp();
  const { user, isConfigured: isAuthConfigured } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const daysUsed = state.daysUsed || 0;
  const entriesCount = state.entries?.length || 0;

  const handleSubscribe = async () => {
    // Require login so we can verify payment against Supabase
    if (!user && isAuthConfigured) {
      setShowLoginPrompt(true);
      return;
    }

    setIsLoading(true);
    if (isStripeConfigured) {
      window.location.href = buildPaymentLink({
        email: user?.email ?? undefined,
        userId: user?.id,
      });
      return;
    }
    // Stripe not configured - demo mode only
    subscribeToPremium();
    setIsLoading(false);
    setStep('complete');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
      <div className="text-center w-full max-w-md px-6">
        {/* Warm welcome back */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lavender-100 to-lavender-200
                        dark:from-lavender-900/40 dark:to-lavender-800/30
                        flex items-center justify-center">
            <svg className="w-10 h-10 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-light text-silver-800 dark:text-silver-100 mb-3">
          You're doing great
        </h2>
        <p className="text-silver-500 dark:text-silver-400 mb-2 leading-relaxed text-sm">
          {daysUsed > 0
            ? `${daysUsed} day${daysUsed !== 1 ? 's' : ''} of reflection${entriesCount > 1 ? `, ${entriesCount} entries` : ''} — that's real progress.`
            : "Your wellness journey has just begun."}
        </p>
        <p className="text-silver-400 dark:text-silver-500 mb-8 leading-relaxed text-sm">
          Your free trial has ended. Continue your journey with Premium, or take a look around first.
        </p>

        {/* Login prompt if not logged in */}
        {showLoginPrompt && !user && (
          <div className="glass-card p-5 mb-6 border-2 border-lavender-300/50 dark:border-lavender-700/50">
            <p className="text-sm text-silver-700 dark:text-silver-200 mb-3">
              Create a free account first so we can link your subscription
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  // Dispatch event to open auth modal from AppShell
                  window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'signup' } }));
                }}
                className="btn-primary px-5 py-2 text-sm"
              >
                Sign up free
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }));
                }}
                className="px-5 py-2 text-sm font-medium rounded-lg text-lavender-600 dark:text-lavender-400
                         hover:bg-lavender-100 dark:hover:bg-lavender-900/30 transition-colors"
              >
                Log in
              </button>
            </div>
          </div>
        )}

        {/* Pricing card - soft glass style */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl font-light text-silver-800 dark:text-silver-100">${MONTHLY_PRICE}</span>
            <span className="text-silver-400 dark:text-silver-500 text-sm">/month</span>
          </div>
          <p className="text-xs text-silver-400 dark:text-silver-500 mb-5">
            Cancel anytime &middot; 7-day money-back guarantee
          </p>

          <ul className="space-y-2.5 text-left mb-6">
            {[
              'Unlimited daily reflections',
              'Full mood & emotion history',
              'Goal tracking insights',
              'Priority support',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2.5 text-silver-600 dark:text-silver-300">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="btn-primary w-full py-3.5 text-base"
          >
            {isLoading ? 'Processing...' : user ? 'Continue with Premium' : 'Sign up & subscribe'}
          </button>
        </div>

        {/* Soft continue option - very visible */}
        <button
          onClick={() => setStep('complete')}
          className="text-lavender-500 hover:text-lavender-600 dark:text-lavender-400 dark:hover:text-lavender-300
                   transition-colors text-sm font-medium mb-4"
        >
          Continue exploring for free &rarr;
        </button>

        <p className="text-[11px] text-silver-400 dark:text-silver-500 leading-relaxed mt-4">
          Free users can still view past reflections. Premium unlocks unlimited entries and insights.
        </p>
      </div>
    </div>
  );
}
