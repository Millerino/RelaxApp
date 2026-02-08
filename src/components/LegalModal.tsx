import { useState } from 'react';
import { MONTHLY_PRICE } from '../lib/constants';

interface LegalModalProps {
  onClose: () => void;
}

type LegalTab = 'privacy' | 'terms';

export function LegalModal({ onClose }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>('privacy');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-lg my-8 animate-slide-up">
        <div className="glass-card p-6 md:p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1 text-silver-500 hover:text-silver-700
                     dark:text-silver-400 dark:hover:text-silver-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-light text-silver-800 dark:text-silver-100">
              Legal
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${activeTab === 'privacy'
                          ? 'bg-lavender-100 dark:bg-lavender-900/40 text-lavender-700 dark:text-lavender-300'
                          : 'text-silver-500 hover:text-silver-700 dark:hover:text-silver-300'}`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${activeTab === 'terms'
                          ? 'bg-lavender-100 dark:bg-lavender-900/40 text-lavender-700 dark:text-lavender-300'
                          : 'text-silver-500 hover:text-silver-700 dark:hover:text-silver-300'}`}
            >
              Terms of Service
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[50vh] overflow-y-auto pr-2">
            {activeTab === 'privacy' ? (
              <div className="space-y-4 text-sm text-silver-600 dark:text-silver-300">
                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    Information We Collect
                  </h3>
                  <p className="leading-relaxed">
                    Pulsero collects the information you provide directly, including mood entries,
                    reflections, and account information. We also collect usage data to improve
                    our service.
                  </p>
                </section>

                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    How We Use Your Information
                  </h3>
                  <p className="leading-relaxed">
                    Your data is used solely to provide and improve the Pulsero service. We never
                    sell your personal information or share your journal entries with third parties.
                  </p>
                </section>

                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    Data Security
                  </h3>
                  <p className="leading-relaxed">
                    We implement industry-standard security measures to protect your data. Your
                    journal entries are encrypted both in transit and at rest.
                  </p>
                </section>

                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    Your Rights
                  </h3>
                  <p className="leading-relaxed">
                    You have the right to access, export, or delete your data at any time. Contact
                    us at pulsero.help@gmail.com for any data-related requests.
                  </p>
                </section>

                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    Cookies & Analytics
                  </h3>
                  <p className="leading-relaxed">
                    We use essential cookies to maintain your session and optional analytics cookies
                    to understand how users interact with Pulsero. You can manage your cookie
                    preferences at any time.
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-silver-600 dark:text-silver-300">
                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    Acceptance of Terms
                  </h3>
                  <p className="leading-relaxed">
                    By using Pulsero, you agree to these Terms of Service. If you do not agree,
                    please do not use our service.
                  </p>
                </section>

                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    Service Description
                  </h3>
                  <p className="leading-relaxed">
                    Pulsero provides a digital journaling platform for mood tracking and personal
                    reflection. The service is provided "as is" and we make no guarantees about
                    availability or functionality.
                  </p>
                </section>

                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    User Responsibilities
                  </h3>
                  <p className="leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account
                    credentials and for all activities that occur under your account.
                  </p>
                </section>

                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    Subscription & Billing
                  </h3>
                  <p className="leading-relaxed">
                    Premium subscriptions are billed monthly at ${MONTHLY_PRICE} USD. You may cancel at any
                    time, and your subscription will remain active until the end of your billing
                    period. We offer a 7-day money-back guarantee.
                  </p>
                </section>

                <section>
                  <h3 className="font-medium text-silver-800 dark:text-silver-100 mb-2">
                    Limitation of Liability
                  </h3>
                  <p className="leading-relaxed">
                    Pulsero is not a replacement for professional mental health care. We are not
                    liable for any decisions made based on your use of our service.
                  </p>
                </section>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-silver-200/50 dark:border-silver-700/30">
            <p className="text-xs text-silver-500 dark:text-silver-400 text-center">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
