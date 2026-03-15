interface SupportModalProps {
  onClose: () => void;
}

export function SupportModal({ onClose }: SupportModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-md my-8 animate-slide-up">
        <div className="glass-card p-6 md:p-8" onClick={e => e.stopPropagation()}>
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
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lavender-100 dark:bg-lavender-900/30
                          flex items-center justify-center">
              <svg className="w-8 h-8 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-silver-800 dark:text-silver-100 mb-2">
              Need Help?
            </h2>
            <p className="text-sm text-silver-500 dark:text-silver-400 leading-relaxed">
              We'd love to hear from you. Send us an email and we'll get back to you within 24 hours.
            </p>
          </div>

          {/* Email contact */}
          <div className="text-center">
            <a
              href="mailto:pulsero.help@gmail.com"
              className="inline-flex items-center gap-3 px-6 py-4 rounded-xl
                       bg-lavender-50 dark:bg-lavender-900/20
                       border border-lavender-200/50 dark:border-lavender-700/30
                       hover:bg-lavender-100 dark:hover:bg-lavender-900/30
                       transition-colors group"
            >
              <svg className="w-5 h-5 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-silver-700 dark:text-silver-200 font-medium group-hover:text-lavender-600 dark:group-hover:text-lavender-400 transition-colors">
                pulsero.help@gmail.com
              </span>
            </a>
          </div>

          {/* Helpful topics */}
          <div className="mt-8 pt-6 border-t border-silver-200/50 dark:border-silver-700/30">
            <p className="text-xs text-silver-500 dark:text-silver-400 text-center mb-3">
              Common topics we can help with
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Account issues', 'Subscription', 'Bug reports', 'Feature requests', 'General feedback'].map(topic => (
                <span key={topic} className="px-3 py-1 rounded-full text-xs
                                           bg-silver-100 dark:bg-silver-800
                                           text-silver-600 dark:text-silver-400">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
