import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { isStripeConfigured, buildPaymentLink } from '../lib/stripe';
import { MONTHLY_PRICE } from '../lib/constants';

interface PricingProps {
  onClose: () => void;
  onLoginClick?: () => void;
}

export function Pricing({ onClose, onLoginClick }: PricingProps) {
  const { subscribeToPremium } = useApp();
  const { user, isConfigured: isAuthConfigured } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    // Require login before subscribing
    if (!user && isAuthConfigured && onLoginClick) {
      onLoginClick();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isStripeConfigured) {
        window.location.href = buildPaymentLink({
          email: user?.email ?? undefined,
          userId: user?.id,
        });
        return;
      }

      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      subscribeToPremium();
      onClose();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-lg animate-slide-up my-8">
        <div className="glass-card p-8 md:p-10">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-silver-400 hover:text-silver-600
                     dark:hover:text-silver-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-light text-silver-800 dark:text-silver-100 mb-3">
              Support Pulsero
            </h2>
            <p className="text-silver-500 dark:text-silver-400 leading-relaxed max-w-sm mx-auto">
              Help us continue building a space for mindful reflection and emotional awareness.
            </p>
          </div>

          {/* Mission statement */}
          <div className="mb-8 p-5 rounded-xl bg-lavender-50/50 dark:bg-lavender-900/20 border border-lavender-200/50 dark:border-lavender-700/30">
            <p className="text-sm text-silver-600 dark:text-silver-300 leading-relaxed">
              Pulsero was created with a simple belief: that taking a few minutes each day to
              reflect on our emotions can lead to greater self-awareness and wellbeing. Your
              support helps us keep this space available to everyone who needs it.
            </p>
          </div>

          {/* Pricing card */}
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-1 mb-4">
              <span className="text-4xl md:text-5xl font-light text-silver-800 dark:text-silver-100">${MONTHLY_PRICE}</span>
              <span className="text-silver-500 dark:text-silver-400">/month</span>
            </div>

            <ul className="space-y-3 text-left max-w-xs mx-auto mb-8">
              {[
                'Unlimited daily reflections',
                'Complete mood history & insights',
                'Goal tracking over time',
                'Priority support',
                'Help support this project',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-silver-600 dark:text-silver-300">
                  <svg className="w-5 h-5 text-lavender-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="btn-primary w-full max-w-xs py-4"
            >
              {isLoading ? 'Processing...' : (!user && isAuthConfigured ? 'Sign in to subscribe' : 'Become a supporter')}
            </button>

            {!user && isAuthConfigured && (
              <p className="text-xs text-silver-400 dark:text-silver-500 mt-3">
                You'll create an account before subscribing
              </p>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-silver-400 dark:text-silver-500 mt-6">
            Cancel anytime. 7-day money-back guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}
