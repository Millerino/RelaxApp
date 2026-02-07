import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { buildPaymentLink, isStripeConfigured } from '../lib/stripe';
import { cancelStripeSubscription, resumeStripeSubscription } from '../lib/supabase';

interface SubscriptionModalProps {
  onClose: () => void;
}

export function SubscriptionModal({ onClose }: SubscriptionModalProps) {
  const { state, subscribeToPremium } = useApp();
  const { user, profile: supabaseProfile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCanceling = supabaseProfile?.subscription_status === 'canceling'
    || supabaseProfile?.subscription_status === 'canceled';
  const premiumUntil = supabaseProfile?.premium_until
    ? new Date(supabaseProfile.premium_until)
    : null;
  const premiumUntilFormatted = premiumUntil
    ? premiumUntil.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const memberSince = state.profile?.createdAt
    ? new Date(state.profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  const handleCancel = async () => {
    setIsLoading(true);
    setError(null);
    const result = await cancelStripeSubscription();
    if (result.error) {
      setError(result.error);
    } else {
      setCancelSuccess(true);
      await refreshProfile();
    }
    setIsLoading(false);
  };

  const handleResume = async () => {
    setIsLoading(true);
    setError(null);
    const result = await resumeStripeSubscription();
    if (result.error) {
      setError(result.error);
    } else {
      setResumeSuccess(true);
      await refreshProfile();
    }
    setIsLoading(false);
  };

  // Cancel success farewell screen
  if (cancelSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lavender-100 dark:bg-lavender-900/30
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-silver-800 dark:text-silver-100 mb-2">
              Sorry to see you go
            </h2>
            <p className="text-silver-500 dark:text-silver-400 mb-2">
              Your subscription has been canceled.
            </p>
            {premiumUntilFormatted && (
              <p className="text-sm text-silver-600 dark:text-silver-300 mb-6">
                You can still enjoy Premium until{' '}
                <span className="font-medium text-lavender-600 dark:text-lavender-400">
                  {premiumUntilFormatted}
                </span>
              </p>
            )}
            <p className="text-xs text-silver-400 dark:text-silver-500 mb-6">
              Hope to see you again soon. You can resubscribe anytime.
            </p>
            <button onClick={onClose} className="btn-primary px-8 py-3">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Resume success screen
  if (resumeSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-silver-800 dark:text-silver-100 mb-2">
              Welcome back!
            </h2>
            <p className="text-silver-500 dark:text-silver-400 mb-6">
              Your subscription has been renewed. Premium continues uninterrupted.
            </p>
            <button onClick={onClose} className="btn-primary px-8 py-3">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cancel confirmation screen
  if (showCancelConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-silver-100 dark:bg-silver-800
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-silver-800 dark:text-silver-100 mb-2">
              Are you sure?
            </h2>
            <p className="text-silver-500 dark:text-silver-400 mb-2">
              Your Premium access will continue until the end of your current billing period.
            </p>
            {premiumUntilFormatted && (
              <p className="text-sm text-silver-600 dark:text-silver-300 mb-6">
                That's <span className="font-medium">{premiumUntilFormatted}</span>.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <div className="space-y-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="btn-primary w-full py-3"
              >
                Keep my subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full py-3 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                {isLoading ? 'Canceling...' : 'Yes, cancel subscription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main subscription status screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card p-0 w-full max-w-md animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-lavender-400 to-lavender-500 px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30
                     text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-white/80 text-sm mb-1">Your subscription</p>
          <h2 className="text-xl font-medium text-white">Membership Status</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {state.isPremium ? (
            <>
              {/* Premium status */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-lavender-400 to-lavender-500
                              flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-silver-500 dark:text-silver-400">Current plan</p>
                  <p className="text-xl font-medium text-silver-800 dark:text-silver-100">
                    Premium
                  </p>
                </div>
              </div>

              {/* Canceling banner */}
              {isCanceling && premiumUntilFormatted && (
                <div className="p-4 mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20
                              border border-amber-200/50 dark:border-amber-700/30">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Subscription ending
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                        Your Premium access ends on {premiumUntilFormatted}. It will not renew.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-silver-200/50 dark:border-silver-700/30">
                  <span className="text-sm text-silver-500 dark:text-silver-400">Monthly price</span>
                  <span className="text-sm font-medium text-silver-700 dark:text-silver-200">
                    $4.99/month
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-silver-200/50 dark:border-silver-700/30">
                  <span className="text-sm text-silver-500 dark:text-silver-400">
                    {isCanceling ? 'Access until' : 'Next billing date'}
                  </span>
                  <span className={`text-sm font-medium ${isCanceling
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-silver-700 dark:text-silver-200'}`}>
                    {premiumUntilFormatted || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-silver-200/50 dark:border-silver-700/30">
                  <span className="text-sm text-silver-500 dark:text-silver-400">Status</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${isCanceling
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                    {isCanceling ? 'Canceling' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-silver-200/50 dark:border-silver-700/30">
                  <span className="text-sm text-silver-500 dark:text-silver-400">Member since</span>
                  <span className="text-sm font-medium text-silver-700 dark:text-silver-200">
                    {memberSince}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-silver-500 dark:text-silver-400">Email</span>
                  <span className="text-sm font-medium text-silver-700 dark:text-silver-200 truncate max-w-[180px]">
                    {user?.email}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {isCanceling ? (
                  <>
                    <button
                      onClick={handleResume}
                      disabled={isLoading}
                      className="btn-primary w-full py-3"
                    >
                      {isLoading ? 'Renewing...' : 'Renew subscription'}
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full py-2 text-sm text-silver-400 dark:text-silver-500
                               hover:text-silver-600 transition-colors"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="btn-primary w-full py-3"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full py-2 text-sm text-silver-400 dark:text-silver-500
                               hover:text-red-500 transition-colors"
                    >
                      Cancel subscription
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Free tier status */}
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-silver-100 dark:bg-silver-800
                              flex items-center justify-center">
                  <svg className="w-8 h-8 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light text-silver-800 dark:text-silver-100 mb-2">
                  Free Plan
                </h3>
                <p className="text-silver-500 dark:text-silver-400 mb-6">
                  Upgrade to Premium for unlimited features
                </p>

                <button
                  onClick={() => {
                    if (isStripeConfigured) {
                      window.location.href = buildPaymentLink({
                        email: user?.email ?? undefined,
                        userId: user?.id,
                      });
                    } else {
                      subscribeToPremium();
                      onClose();
                    }
                  }}
                  className="btn-primary w-full py-3"
                >
                  Upgrade to Premium - $4.99/mo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
