import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface CancelSubscriptionModalProps {
  onClose: () => void;
}

type CancelStep = 'confirm' | 'offer' | 'reason' | 'success';

export function CancelSubscriptionModal({ onClose }: CancelSubscriptionModalProps) {
  const { cancelSubscription } = useApp();
  const [step, setStep] = useState<CancelStep>('confirm');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reasons = [
    'Too expensive',
    'Not using it enough',
    'Found an alternative',
    'Technical issues',
    'Other',
  ];

  const handleAcceptFreeMonth = async () => {
    setIsLoading(true);
    // In production, this would call Stripe API to apply a coupon
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('success');
    setIsLoading(false);
  };

  const handleConfirmCancel = async () => {
    setIsLoading(true);
    // In production, this would call Stripe API to cancel subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    cancelSubscription?.();
    setStep('success');
    setIsLoading(false);
  };

  const handleManageInStripe = () => {
    // Redirect to Stripe Customer Portal
    // You need to set this up in Stripe Dashboard -> Settings -> Customer portal
    window.open('https://billing.stripe.com/p/login/pulsero', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-6 md:p-8 w-full max-w-md animate-slide-up">
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

        {step === 'confirm' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-light text-silver-800 dark:text-silver-100 mb-2">
              We're sorry to see you go
            </h2>
            <p className="text-sm text-silver-500 dark:text-silver-400 mb-6">
              Before you cancel, would you like to tell us why? Your feedback helps us improve.
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setStep('offer')}
                className="btn-primary w-full py-3"
              >
                Continue to cancel
              </button>
              <button
                onClick={onClose}
                className="btn-secondary w-full py-3"
              >
                Keep my subscription
              </button>
            </div>

            <p className="text-xs text-silver-400 dark:text-silver-500">
              You can also{' '}
              <button
                onClick={handleManageInStripe}
                className="text-lavender-500 hover:text-lavender-600 underline"
              >
                manage your subscription in Stripe
              </button>
            </p>
          </div>
        )}

        {step === 'offer' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lavender-100 dark:bg-lavender-900/30
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h2 className="text-xl font-light text-silver-800 dark:text-silver-100 mb-2">
              Wait! Here's a gift for you
            </h2>
            <p className="text-sm text-silver-500 dark:text-silver-400 mb-4">
              We'd love for you to stay. How about a <span className="font-semibold text-lavender-500">free month</span> on us?
            </p>

            <div className="p-4 mb-6 rounded-xl bg-gradient-to-r from-lavender-50 to-lavender-100
                          dark:from-lavender-900/30 dark:to-lavender-800/30
                          border border-lavender-200/50 dark:border-lavender-700/30">
              <p className="text-2xl font-light text-lavender-600 dark:text-lavender-400 mb-1">
                1 Month Free
              </p>
              <p className="text-xs text-silver-500 dark:text-silver-400">
                Your next billing will be skipped
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAcceptFreeMonth}
                disabled={isLoading}
                className="btn-primary w-full py-3"
              >
                {isLoading ? 'Applying...' : 'Accept free month & stay'}
              </button>
              <button
                onClick={() => setStep('reason')}
                disabled={isLoading}
                className="text-sm text-silver-500 dark:text-silver-400 hover:text-silver-700
                         dark:hover:text-silver-200 transition-colors"
              >
                No thanks, continue canceling
              </button>
            </div>
          </div>
        )}

        {step === 'reason' && (
          <div>
            <h2 className="text-xl font-light text-silver-800 dark:text-silver-100 mb-2">
              Help us improve
            </h2>
            <p className="text-sm text-silver-500 dark:text-silver-400 mb-6">
              What's the main reason you're canceling?
            </p>

            <div className="space-y-2 mb-6">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors
                            ${selectedReason === reason
                              ? 'bg-lavender-100 dark:bg-lavender-900/40 text-lavender-700 dark:text-lavender-300 border-2 border-lavender-400'
                              : 'bg-silver-50 dark:bg-silver-800/50 text-silver-600 dark:text-silver-300 border-2 border-transparent hover:bg-silver-100 dark:hover:bg-silver-700/50'
                            }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirmCancel}
                disabled={!selectedReason || isLoading}
                className={`btn-secondary w-full py-3 ${!selectedReason ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Canceling...' : 'Cancel subscription'}
              </button>
              <button
                onClick={() => setStep('offer')}
                className="text-sm text-lavender-500 hover:text-lavender-600 transition-colors"
              >
                Go back to free month offer
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-light text-silver-800 dark:text-silver-100 mb-2">
              {selectedReason ? 'Subscription canceled' : 'Free month applied!'}
            </h2>
            <p className="text-sm text-silver-500 dark:text-silver-400 mb-6">
              {selectedReason
                ? 'Your access continues until the end of your billing period. We hope to see you again!'
                : 'Your next billing will be skipped. Enjoy your free month of Pulsero!'
              }
            </p>
            <button onClick={onClose} className="btn-primary px-8 py-3">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
