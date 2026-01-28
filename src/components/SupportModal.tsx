import { useState } from 'react';

interface SupportModalProps {
  onClose: () => void;
}

// Simple bot test questions
const BOT_QUESTIONS = [
  { question: 'What is 3 + 4?', answer: '7' },
  { question: 'What is 5 + 2?', answer: '7' },
  { question: 'What is 8 - 3?', answer: '5' },
  { question: 'What is 2 + 6?', answer: '8' },
  { question: 'What is 9 - 4?', answer: '5' },
];

export function SupportModal({ onClose }: SupportModalProps) {
  const [showBotTest, setShowBotTest] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [botAnswer, setBotAnswer] = useState('');
  const [botError, setBotError] = useState(false);
  const [currentQuestion] = useState(() =>
    BOT_QUESTIONS[Math.floor(Math.random() * BOT_QUESTIONS.length)]
  );

  const handleGetSupport = () => {
    setShowBotTest(true);
  };

  const handleBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (botAnswer.trim() === currentQuestion.answer) {
      setShowEmail(true);
      setBotError(false);
    } else {
      setBotError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-md my-8 animate-slide-up">
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
              Get Support
            </h2>
          </div>

          {/* Main content */}
          <div className="space-y-6">
            {/* Intro text */}
            <p className="text-silver-600 dark:text-silver-300 leading-relaxed">
              We understand that websites like ours can sometimes have errors, or that you may
              simply have questions you'd like answered. We're here to help.
            </p>

            {!showBotTest && !showEmail && (
              <button
                onClick={handleGetSupport}
                className="btn-primary w-full py-3"
              >
                Get Support
              </button>
            )}

            {/* Bot test */}
            {showBotTest && !showEmail && (
              <div className="p-4 rounded-xl bg-lavender-50/50 dark:bg-lavender-900/20
                            border border-lavender-200/50 dark:border-lavender-700/30">
                <p className="text-sm text-silver-600 dark:text-silver-300 mb-3">
                  Quick verification to prevent spam:
                </p>
                <form onSubmit={handleBotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-1.5">
                      {currentQuestion.question}
                    </label>
                    <input
                      type="text"
                      value={botAnswer}
                      onChange={(e) => {
                        setBotAnswer(e.target.value);
                        setBotError(false);
                      }}
                      placeholder="Your answer"
                      className="input-field"
                      autoFocus
                    />
                    {botError && (
                      <p className="text-red-500 text-xs mt-1">
                        That's not quite right. Please try again.
                      </p>
                    )}
                  </div>
                  <button type="submit" className="btn-primary w-full py-2.5">
                    Verify
                  </button>
                </form>
              </div>
            )}

            {/* Email reveal */}
            {showEmail && (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                              flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-silver-600 dark:text-silver-300 mb-4">
                  You can reach us at:
                </p>
                <a
                  href="mailto:pulsero.help@gmail.com"
                  className="inline-flex items-center gap-2 text-lg text-lavender-600 dark:text-lavender-400
                           hover:text-lavender-700 dark:hover:text-lavender-300 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  pulsero.help@gmail.com
                </a>
                <p className="text-xs text-silver-400 dark:text-silver-500 mt-4">
                  We typically respond within 24-48 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
