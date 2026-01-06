import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedPreference = localStorage.getItem('cookie-consent');
    if (!savedPreference) {
      // Delay showing banner for smoother UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('cookie-consent', 'necessary');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-slide-up">
      <div className="max-w-xl mx-auto">
        <div className="glass-card p-5 md:p-6 shadow-2xl">
          {!showDetails ? (
            /* Main banner */
            <>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-lavender-100 dark:bg-lavender-900/40
                              flex items-center justify-center">
                  <svg className="w-5 h-5 text-lavender-600 dark:text-lavender-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-silver-800 dark:text-silver-100 mb-1">
                    We value your privacy
                  </h3>
                  <p className="text-xs text-silver-600 dark:text-silver-300 leading-relaxed">
                    We use cookies to enhance your experience and analyze site usage.
                    You can choose which cookies to accept.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  Accept All
                </button>
                <button
                  onClick={handleAcceptNecessary}
                  className="btn-secondary flex-1 py-2.5 text-sm"
                >
                  Only Necessary
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2.5 text-sm text-silver-500 hover:text-silver-700
                           dark:text-silver-400 dark:hover:text-silver-200 transition-colors"
                >
                  Customize
                </button>
              </div>
            </>
          ) : (
            /* Detailed preferences */
            <>
              <div className="mb-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex items-center gap-1 text-sm text-silver-500 hover:text-silver-700
                           dark:text-silver-400 dark:hover:text-silver-200 transition-colors mb-3"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <h3 className="text-sm font-medium text-silver-800 dark:text-silver-100">
                  Cookie Preferences
                </h3>
              </div>

              <div className="space-y-3 mb-4">
                {/* Essential cookies */}
                <div className="p-3 rounded-xl bg-white/50 dark:bg-silver-800/50 border border-silver-200/50 dark:border-silver-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-silver-800 dark:text-silver-100">
                      Essential Cookies
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-silver-200 dark:bg-silver-700 text-silver-600 dark:text-silver-300">
                      Always on
                    </span>
                  </div>
                  <p className="text-xs text-silver-500 dark:text-silver-400">
                    Required for basic site functionality, security, and remembering your preferences.
                  </p>
                </div>

                {/* Analytics cookies */}
                <div className="p-3 rounded-xl bg-white/50 dark:bg-silver-800/50 border border-silver-200/50 dark:border-silver-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-silver-800 dark:text-silver-100">
                      Analytics Cookies
                    </span>
                    <span className="text-xs text-silver-500 dark:text-silver-400">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-silver-500 dark:text-silver-400">
                    Help us understand how you use Pulsero so we can improve the experience.
                  </p>
                </div>

                {/* Marketing cookies */}
                <div className="p-3 rounded-xl bg-white/50 dark:bg-silver-800/50 border border-silver-200/50 dark:border-silver-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-silver-800 dark:text-silver-100">
                      Marketing Cookies
                    </span>
                    <span className="text-xs text-silver-500 dark:text-silver-400">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-silver-500 dark:text-silver-400">
                    Used to show you relevant content and measure ad effectiveness.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  Accept All
                </button>
                <button
                  onClick={handleAcceptNecessary}
                  className="btn-secondary flex-1 py-2.5 text-sm"
                >
                  Essential Only
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
