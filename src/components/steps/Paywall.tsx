import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { STRIPE_PAYMENT_LINK, isStripeConfigured } from '../../lib/stripe';

export function Paywall() {
  const { setStep } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    if (isStripeConfigured) {
      // Redirect to Stripe payment page
      window.location.href = STRIPE_PAYMENT_LINK;
      return;
    }
    // Stripe not configured - show demo message
    setIsLoading(false);
    setStep('complete');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
      <div className="text-center w-full max-w-md px-6">
        {/* Premium badge */}
        <div className="mb-8 flex justify-center">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-lavender-400 to-lavender-500
                        text-white text-sm font-medium shadow-lg shadow-lavender-500/25">
            Premium
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-light text-silver-800 dark:text-silver-100 mb-4">
          You're on a roll
        </h2>
        <p className="text-silver-500 dark:text-silver-400 mb-8 leading-relaxed">
          3 days of mindful reflection. Continue your journey with unlimited access.
        </p>

        {/* Pricing card */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-5xl font-light text-silver-800 dark:text-silver-100">$4.99</span>
            <span className="text-silver-500 dark:text-silver-400">/month</span>
          </div>

          <ul className="space-y-3 text-left mb-8">
            {[
              'Unlimited daily reflections',
              'Full mood & emotion history',
              'Goal tracking insights',
              'Export your journal anytime',
              'Priority support',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-silver-600 dark:text-silver-300">
                <svg className="w-5 h-5 text-lavender-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="btn-primary w-full py-4 text-lg"
          >
            {isLoading ? 'Processing...' : 'Start Premium'}
          </button>
        </div>

        <button
          onClick={() => setStep('complete')}
          className="text-silver-400 hover:text-silver-600 dark:hover:text-silver-300
                   transition-colors text-sm"
        >
          Maybe later
        </button>

        <p className="mt-6 text-xs text-silver-400 dark:text-silver-500">
          Cancel anytime. 7-day money-back guarantee.
        </p>
      </div>
    </div>
  );
}
