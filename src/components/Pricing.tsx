import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface PricingProps {
  onClose: () => void;
}

export function Pricing({ onClose }: PricingProps) {
  const { subscribeToPremium } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    // In production, this would redirect to Stripe Checkout
    await new Promise(resolve => setTimeout(resolve, 1000));
    subscribeToPremium();
    setIsLoading(false);
    onClose();
  };

  const copyReferralLink = () => {
    // In production, this would be a unique referral link
    const referralLink = 'https://pulsero.fit/ref/yourcode';
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
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
              <span className="text-4xl md:text-5xl font-light text-silver-800 dark:text-silver-100">$4.99</span>
              <span className="text-silver-500 dark:text-silver-400">/month</span>
            </div>

            <ul className="space-y-3 text-left max-w-xs mx-auto mb-8">
              {[
                'Unlimited daily reflections',
                'Complete mood history & insights',
                'Goal tracking over time',
                'Export your journal anytime',
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

            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="btn-primary w-full max-w-xs py-4"
            >
              {isLoading ? 'Processing...' : 'Become a supporter'}
            </button>
          </div>

          {/* Referral section */}
          <div className="mt-6 pt-6 border-t border-silver-200/50 dark:border-silver-700/30">
            <div className="text-center">
              <p className="text-sm text-silver-600 dark:text-silver-300 mb-3">
                Know someone who'd benefit from daily reflection?
              </p>
              <p className="text-xs text-silver-500 dark:text-silver-400 mb-4 leading-relaxed max-w-sm mx-auto">
                Share Pulsero with friends. When they subscribe, you both get a free month.
                <span className="text-lavender-500"> Earn up to 6 free months through referrals.</span>
              </p>
              <button
                onClick={copyReferralLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                         bg-silver-100 dark:bg-silver-800 hover:bg-silver-200 dark:hover:bg-silver-700
                         text-silver-600 dark:text-silver-300 transition-colors"
              >
                {referralCopied ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Copy referral link
                  </>
                )}
              </button>
            </div>
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
