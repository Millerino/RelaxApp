import { useState } from 'react';

interface SupportModalProps {
  onClose: () => void;
}

export function SupportModal({ onClose }: SupportModalProps) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to your support system
    setSubmitted(true);
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
            <p className="text-sm text-silver-500 dark:text-silver-400 mt-2">
              We're here to help with any questions or concerns
            </p>
          </div>

          {submitted ? (
            /* Success message */
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                            flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-silver-800 dark:text-silver-100 mb-2">
                Message Sent
              </h3>
              <p className="text-sm text-silver-500 dark:text-silver-400 mb-6">
                We'll get back to you within 24 hours.
              </p>
              <button onClick={onClose} className="btn-secondary px-6 py-2">
                Close
              </button>
            </div>
          ) : (
            /* Contact form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-1.5">
                  Your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-1.5">
                  How can we help?
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Tell us what's on your mind..."
                  className="input-field resize-none"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                Send Message
              </button>
            </form>
          )}

          {/* Contact info */}
          {!submitted && (
            <div className="mt-6 pt-4 border-t border-silver-200/50 dark:border-silver-700/30">
              <p className="text-xs text-silver-500 dark:text-silver-400 text-center mb-3">
                Or reach us directly
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="mailto:support@pulsero.fit"
                  className="flex items-center gap-2 text-sm text-silver-600 dark:text-silver-300
                           hover:text-lavender-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@pulsero.fit
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
