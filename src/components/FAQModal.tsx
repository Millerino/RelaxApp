interface FAQModalProps {
  onClose: () => void;
}

const faqs = [
  {
    question: 'What is Pulsero?',
    answer: 'Pulsero is a mindful journaling app designed to help you track your daily mood and emotional wellbeing. By taking a few minutes each day to reflect, you can gain deeper insights into your emotional patterns and overall mental health.',
  },
  {
    question: 'Is my data private?',
    answer: 'Absolutely. Your journal entries and personal reflections are encrypted and stored securely. We never share your data with third parties, and you can export or delete your data at any time.',
  },
  {
    question: 'How does the free trial work?',
    answer: 'You can use Pulsero for free for 3 days to experience all features. After that, a subscription is required to continue journaling. Your existing entries will always remain accessible.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel anytime from your account settings. Your subscription will remain active until the end of the billing period, and we offer a 7-day money-back guarantee.',
  },
  {
    question: 'What happens to my entries if I cancel?',
    answer: 'Your entries are never deleted. Even if you cancel, you can still view and export all your past reflections. To start new entries, you would need to resubscribe.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Pulsero is designed as a progressive web app that works beautifully on all devices. You can add it to your home screen for an app-like experience on mobile.',
  },
];

export function FAQModal({ onClose }: FAQModalProps) {
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
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-silver-500 dark:text-silver-400 mt-2">
              Everything you need to know about Pulsero
            </p>
          </div>

          {/* FAQ list */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/50 dark:bg-silver-800/50
                         border border-silver-200/50 dark:border-silver-700/30"
              >
                <h3 className="text-sm font-medium text-silver-800 dark:text-silver-100 mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-silver-600 dark:text-silver-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-silver-200/50 dark:border-silver-700/30">
            <p className="text-xs text-silver-500 dark:text-silver-400 text-center">
              Still have questions? Contact us at{' '}
              <a href="mailto:pulsero.help@gmail.com" className="text-lavender-500 hover:text-lavender-600">
                pulsero.help@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
