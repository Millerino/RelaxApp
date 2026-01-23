import { useState } from 'react';

interface LandingPageProps {
  onShowAuth: (mode: 'login' | 'signup') => void;
  onShowPricing: () => void;
  onShowFAQ: () => void;
  onShowSupport: () => void;
  onShowLegal: () => void;
}

export function LandingPage({
  onShowAuth,
  onShowPricing,
  onShowFAQ,
  onShowSupport,
  onShowLegal,
}: LandingPageProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const handleOrbClick = () => {
    setShowIntro(true);
  };

  const handleCloseIntro = () => {
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <span className="text-silver-700 dark:text-silver-300 text-sm font-semibold tracking-wide">
            pulsero
          </span>

          {/* Auth buttons */}
          <div className="flex items-center gap-2 mr-14">
            <button
              onClick={() => onShowAuth('login')}
              className="text-xs text-silver-500 dark:text-silver-400
                       hover:text-silver-700 dark:hover:text-silver-200
                       transition-colors px-3 py-1.5 rounded-lg
                       hover:bg-white/30 dark:hover:bg-silver-800/30"
            >
              Log in
            </button>
            <button
              onClick={() => onShowAuth('signup')}
              className="text-xs font-medium text-lavender-600 dark:text-lavender-400
                       hover:text-lavender-700 dark:hover:text-lavender-300
                       transition-colors px-3 py-1.5 rounded-lg
                       bg-lavender-100/50 dark:bg-lavender-900/30
                       hover:bg-lavender-100 dark:hover:bg-lavender-900/50"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Aura Orb */}
      <main className="flex-1 flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          {/* Interactive Aura Orb */}
          <button
            onClick={handleOrbClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative cursor-pointer focus:outline-none group"
            aria-label="Learn more about Pulsero"
          >
            {/* Outer glow rings - animated on hover */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-700 ${
                isHovering ? 'scale-150 opacity-30' : 'scale-100 opacity-20'
              }`}
              style={{
                width: 280,
                height: 280,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) ${isHovering ? 'scale(1.5)' : 'scale(1)'}`,
                background: 'radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)',
              }}
            />
            <div
              className={`absolute rounded-full animate-pulse transition-all duration-500 ${
                isHovering ? 'opacity-40' : 'opacity-25'
              }`}
              style={{
                width: 220,
                height: 220,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(167,139,250,0.5), transparent 70%)',
                animationDuration: '3s',
              }}
            />
            <div
              className={`absolute rounded-full animate-pulse transition-all duration-500 ${
                isHovering ? 'opacity-50' : 'opacity-30'
              }`}
              style={{
                width: 160,
                height: 160,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(167,139,250,0.6), transparent 70%)',
                animationDuration: '2s',
              }}
            />

            {/* Main orb */}
            <div
              className={`relative rounded-full transition-all duration-500 ${
                isHovering ? 'scale-110' : 'scale-100'
              }`}
              style={{
                width: 100,
                height: 100,
                background: `radial-gradient(circle at 30% 30%,
                  #c4b5fd,
                  #a78bfa,
                  #8b5cf6)`,
                boxShadow: isHovering
                  ? `0 0 40px rgba(167,139,250,0.8),
                     0 0 80px rgba(139,92,246,0.6),
                     0 0 120px rgba(124,58,237,0.4),
                     inset 0 0 30px rgba(255,255,255,0.4)`
                  : `0 0 20px rgba(167,139,250,0.5),
                     0 0 40px rgba(139,92,246,0.3),
                     0 0 60px rgba(124,58,237,0.2),
                     inset 0 0 20px rgba(255,255,255,0.3)`,
              }}
            >
              {/* Inner highlight */}
              <div
                className="absolute inset-[15%] rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5), transparent 60%)',
                }}
              />

              {/* Subtle particle effects on hover */}
              {isHovering && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-white/70 animate-ping"
                      style={{
                        left: `${20 + i * 20}%`,
                        top: `${15 + (i % 2) * 60}%`,
                        animationDuration: `${1.5 + i * 0.3}s`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </button>

          {/* Subtle hint text */}
          <p className={`mt-8 text-xs text-silver-400 dark:text-silver-500 transition-opacity duration-500 ${
            isHovering ? 'opacity-100' : 'opacity-60'
          }`}>
            {isHovering ? 'Click to discover' : 'Hover to explore'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-center items-center gap-6">
          <button
            onClick={onShowFAQ}
            className="text-xs text-silver-500 dark:text-silver-400
                     hover:text-silver-700 dark:hover:text-silver-200
                     transition-colors"
          >
            FAQ
          </button>
          <span className="text-silver-400 dark:text-silver-500">·</span>
          <button
            onClick={onShowSupport}
            className="text-xs text-silver-500 dark:text-silver-400
                     hover:text-silver-700 dark:hover:text-silver-200
                     transition-colors"
          >
            Support
          </button>
          <span className="text-silver-400 dark:text-silver-500">·</span>
          <button
            onClick={onShowPricing}
            className="text-xs text-silver-500 dark:text-silver-400
                     hover:text-silver-700 dark:hover:text-silver-200
                     transition-colors"
          >
            Pricing
          </button>
          <span className="text-silver-400 dark:text-silver-500">·</span>
          <button
            onClick={onShowLegal}
            className="text-xs text-silver-500 dark:text-silver-400
                     hover:text-silver-700 dark:hover:text-silver-200
                     transition-colors"
          >
            Legal
          </button>
        </div>
      </footer>

      {/* Introduction Modal */}
      {showIntro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleCloseIntro}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative bg-white/95 dark:bg-silver-900/95 backdrop-blur-xl rounded-2xl
                      shadow-2xl w-full max-w-sm p-8 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseIntro}
              className="absolute top-4 right-4 p-2 rounded-full
                       text-silver-400 hover:text-silver-600 dark:hover:text-silver-300
                       hover:bg-silver-100 dark:hover:bg-silver-800
                       transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Mini aura orb */}
            <div className="flex justify-center mb-6">
              <div
                className="relative rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  background: `radial-gradient(circle at 30% 30%,
                    #c4b5fd,
                    #a78bfa,
                    #8b5cf6)`,
                  boxShadow: `0 0 30px rgba(167,139,250,0.6),
                             0 0 50px rgba(139,92,246,0.4),
                             inset 0 0 20px rgba(255,255,255,0.3)`,
                }}
              >
                <div
                  className="absolute inset-[15%] rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.5), transparent 60%)',
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-silver-800 dark:text-silver-100">
                Welcome to Pulsero
              </h2>

              <p className="text-sm text-silver-600 dark:text-silver-300 leading-relaxed">
                A mindful companion for your emotional well-being. Track your daily moods,
                capture moments of gratitude, and discover patterns that help you understand
                yourself better.
              </p>

              <p className="text-sm text-silver-500 dark:text-silver-400 leading-relaxed">
                Take a moment each day to pause, reflect, and nurture your inner calm.
                Your journey to mindfulness begins with a single breath.
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  handleCloseIntro();
                  onShowAuth('signup');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-lavender-500 to-lavender-600
                         text-white font-medium text-sm
                         hover:from-lavender-600 hover:to-lavender-700
                         transition-all hover:shadow-lg hover:shadow-lavender-500/30
                         active:scale-[0.98]"
              >
                Get started
              </button>
              <button
                onClick={() => {
                  handleCloseIntro();
                  onShowAuth('login');
                }}
                className="w-full py-3 rounded-xl border border-silver-200 dark:border-silver-700
                         text-silver-600 dark:text-silver-300 font-medium text-sm
                         hover:bg-silver-50 dark:hover:bg-silver-800
                         transition-all active:scale-[0.98]"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
