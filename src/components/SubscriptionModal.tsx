import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface SubscriptionModalProps {
  onClose: () => void;
}

export function SubscriptionModal({ onClose }: SubscriptionModalProps) {
  const { state, cancelSubscription, subscribeToPremium } = useApp();
  const { user } = useAuth();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showFreeMonthOffer, setShowFreeMonthOffer] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Mock subscription data - in production this would come from Stripe
  const subscriptionData = {
    plan: 'Premium',
    price: '$4.99',
    interval: 'month',
    // Mock renewal date - 30 days from now or subscription start
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    memberSince: state.profile?.createdAt
      ? new Date(state.profile.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })
      : 'Recently'
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowFreeMonthOffer(true);
  };

  const handleAcceptFreeMonth = () => {
    // In production, this would extend the subscription
    setShowFreeMonthOffer(false);
    setShowCancelConfirm(false);
    onClose();
  };

  const handleFinalCancel = async () => {
    setIsCancelling(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    cancelSubscription();
    setIsCancelling(false);
    onClose();
  };

  // Free month offer screen
  if (showFreeMonthOffer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass-card p-8 w-full max-w-md animate-slide-up">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-500
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-silver-800 dark:text-silver-100 mb-2">
              Wait! Here's a gift
            </h2>
            <p className="text-silver-500 dark:text-silver-400 mb-6">
              We'd hate to see you go. How about a <strong>free month</strong> on us?
            </p>

            <div className="glass-card p-4 mb-6 bg-lavender-50/50 dark:bg-lavender-900/20">
              <p className="text-lg font-medium text-lavender-600 dark:text-lavender-400">
                1 Month Free
              </p>
              <p className="text-sm text-silver-500 dark:text-silver-400">
                Continue your wellness journey at no cost
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAcceptFreeMonth}
                className="btn-primary w-full py-3"
              >
                Accept free month
              </button>
              <button
                onClick={handleFinalCancel}
                disabled={isCancelling}
                className="w-full py-3 text-sm text-silver-500 dark:text-silver-400
                         hover:text-silver-700 dark:hover:text-silver-200 transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'No thanks, cancel anyway'}
              </button>
            </div>
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
        <div className="relative glass-card p-8 w-full max-w-md animate-slide-up">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-silver-100 dark:bg-silver-800
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-silver-800 dark:text-silver-100 mb-2">
              We're sad to see you go
            </h2>
            <p className="text-silver-500 dark:text-silver-400 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to premium features.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="btn-primary w-full py-3"
              >
                Keep my subscription
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full py-3 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Continue with cancellation
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
      <div className="relative glass-card p-0 w-full max-w-md animate-slide-up overflow-hidden">
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
                    {subscriptionData.plan}
                  </p>
                </div>
              </div>

              {/* Subscription details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-silver-200/50 dark:border-silver-700/30">
                  <span className="text-sm text-silver-500 dark:text-silver-400">Monthly price</span>
                  <span className="text-sm font-medium text-silver-700 dark:text-silver-200">
                    {subscriptionData.price}/{subscriptionData.interval}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-silver-200/50 dark:border-silver-700/30">
                  <span className="text-sm text-silver-500 dark:text-silver-400">Next billing date</span>
                  <span className="text-sm font-medium text-silver-700 dark:text-silver-200">
                    {subscriptionData.renewalDate}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-silver-200/50 dark:border-silver-700/30">
                  <span className="text-sm text-silver-500 dark:text-silver-400">Member since</span>
                  <span className="text-sm font-medium text-silver-700 dark:text-silver-200">
                    {subscriptionData.memberSince}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-silver-500 dark:text-silver-400">Email</span>
                  <span className="text-sm font-medium text-silver-700 dark:text-silver-200 truncate max-w-[180px]">
                    {user?.email}
                  </span>
                </div>
              </div>

              {/* Premium features */}
              <div className="glass-card p-4 mb-6 bg-lavender-50/30 dark:bg-lavender-900/10">
                <p className="text-xs font-medium text-lavender-600 dark:text-lavender-400 uppercase tracking-wide mb-2">
                  Your premium benefits
                </p>
                <ul className="space-y-1.5">
                  {['Unlimited reflections', 'Full mood history', 'AI insights', 'Export data'].map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-silver-600 dark:text-silver-300">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={onClose}
                  className="btn-primary w-full py-3"
                >
                  Done
                </button>
                <button
                  onClick={handleCancelClick}
                  className="w-full py-2 text-sm text-silver-400 dark:text-silver-500
                           hover:text-red-500 transition-colors"
                >
                  Cancel subscription
                </button>
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
                    subscribeToPremium();
                    onClose();
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
