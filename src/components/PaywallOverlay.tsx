import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStripe, isStripeConfigured, STRIPE_PAYMENT_LINK } from '../lib/stripe';

interface PaywallOverlayProps {
  onShowAuth: () => void;
}

export function PaywallOverlay({ onShowAuth }: PaywallOverlayProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    // Require login before subscribing
    if (!user) {
      onShowAuth();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isStripeConfigured) {
        await getStripe();

        // Add customer email if user is logged in
        const url = user?.email
          ? `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(user.email)}`
          : STRIPE_PAYMENT_LINK;

        window.location.href = url;
        return;
      }

      // Fallback for demo/development
      setError('Payment system is being set up. Please try again later.');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Greyed out backdrop - blocks entire UI */}
      <div className="absolute inset-0 bg-black/80 dark:bg-black/90" />

      {/* Content - no animation to ensure immediate visibility */}
      <div className="relative w-full max-w-md">
        <div className="relative bg-white dark:bg-silver-900 rounded-2xl shadow-2xl p-8 md:p-10 border border-silver-200/50 dark:border-silver-700/50">
          {/* Soft glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-lavender-400/20 to-lavender-500/20 rounded-2xl blur-xl -z-10" />

          <div className="relative">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-500
                            flex items-center justify-center shadow-lg shadow-lavender-500/30">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-silver-800 dark:text-silver-100 mb-3">
                Your free trial has ended
              </h2>
              <p className="text-silver-500 dark:text-silver-400 leading-relaxed">
                You've completed 3 days of mindful reflection. Continue your wellness journey with Pulsero Premium.
              </p>
            </div>

            {/* What you get */}
            <div className="mb-6 p-4 rounded-xl bg-lavender-50/50 dark:bg-lavender-900/20
                          border border-lavender-200/50 dark:border-lavender-700/30">
              <p className="text-xs font-medium text-lavender-600 dark:text-lavender-400 mb-3 uppercase tracking-wide">
                Premium includes
              </p>
              <ul className="space-y-2">
                {[
                  'Unlimited daily mood tracking',
                  'Full calendar & history access',
                  'Mood insights & patterns',
                  'Export your journal anytime',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-silver-600 dark:text-silver-300">
                    <svg className="w-4 h-4 text-lavender-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing */}
            <div className="text-center mb-6">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-4xl font-light text-silver-800 dark:text-silver-100">$4.99</span>
                <span className="text-silver-500 dark:text-silver-400">/month</span>
              </div>
              <p className="text-xs text-silver-400 dark:text-silver-500 mt-1">
                Cancel anytime • 7-day money-back guarantee
              </p>
            </div>

            {/* Support message */}
            <p className="text-center text-xs text-silver-500 dark:text-silver-400 mb-6 leading-relaxed">
              Your subscription supports Pulsero's mission to make mindful wellness accessible to everyone.
            </p>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            {/* CTA Button */}
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-lavender-500 to-lavender-600
                       text-white font-medium text-base
                       hover:from-lavender-600 hover:to-lavender-700
                       transition-all hover:shadow-lg hover:shadow-lavender-500/30
                       active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                user ? 'Continue with Premium' : 'Sign in to subscribe'
              )}
            </button>

            {/* Sign in hint for non-logged users */}
            {!user && (
              <p className="text-center text-xs text-silver-400 dark:text-silver-500 mt-3">
                Already have an account?{' '}
                <button onClick={onShowAuth} className="text-lavender-500 hover:text-lavender-600 transition-colors">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
