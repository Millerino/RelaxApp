import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function WelcomeStep() {
  const { setStep } = useApp();
  const [showInfo, setShowInfo] = useState(false);

  const handleOrbClick = () => {
    setShowInfo(true);
  };

  const handleStart = () => {
    setStep('mood');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="text-center max-w-md px-6">
        {/* Hero tagline */}
        <h1 className="text-3xl md:text-4xl font-light text-lavender-400 dark:text-lavender-300 mb-12 tracking-wide">
          Calm Your Mind
        </h1>

        {/* Clickable Glowing orb */}
        <button
          onClick={handleOrbClick}
          className="relative h-40 w-40 mx-auto mb-8 group cursor-pointer focus:outline-none"
          aria-label="Learn more about Pulsero"
        >
          {/* Outer glow rings */}
          <div
            className="absolute inset-0 rounded-full animate-pulse transition-transform group-hover:scale-110"
            style={{
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15), transparent 70%)',
              animationDuration: '3s',
            }}
          />
          <div
            className="absolute inset-4 rounded-full animate-pulse transition-transform group-hover:scale-110"
            style={{
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25), transparent 70%)',
              animationDuration: '2s',
            }}
          />
          {/* Main orb */}
          <div
            className="absolute inset-1/4 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(167,139,250,0.8)]"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #c4b5fd, #a78bfa, #8b5cf6)',
              boxShadow: `
                0 0 20px rgba(167, 139, 250, 0.6),
                0 0 40px rgba(139, 92, 246, 0.4),
                0 0 60px rgba(124, 58, 237, 0.2),
                inset 0 0 20px rgba(255, 255, 255, 0.3)
              `,
            }}
          >
            {/* Inner highlight */}
            <div
              className="absolute inset-[15%] rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent 60%)',
              }}
            />
          </div>

          {/* Tap hint */}
          {!showInfo && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-silver-400 dark:text-silver-500 opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Tap to begin
            </span>
          )}
        </button>

        {/* Info overlay - appears after clicking orb */}
        {showInfo && (
          <div className="animate-fade-in mt-8 space-y-6">
            <p className="text-lg text-silver-600 dark:text-silver-300 font-light leading-relaxed">
              Your personal space for daily reflection.
            </p>
            <p className="text-silver-500 dark:text-silver-400 text-sm leading-relaxed">
              Track your mood, express your feelings, and build mindful habits — all in under a minute.
            </p>

            <button
              onClick={handleStart}
              className="btn-primary text-lg px-10 py-4 mt-4"
            >
              Start Check-in
            </button>

            <p className="text-xs text-silver-400 dark:text-silver-500 mt-4">
              No account needed — sign up later if you want to save
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
