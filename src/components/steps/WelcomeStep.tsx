import { useApp } from '../../context/AppContext';

export function WelcomeStep() {
  const { setStep } = useApp();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center max-w-md px-6">
        {/* Hero tagline */}
        <h2 className="text-2xl md:text-3xl font-light text-lavender-500 dark:text-lavender-400 mb-6 tracking-wide">
          Calm Your Mind
        </h2>

        {/* Glowing orb */}
        <div className="relative h-32 flex items-center justify-center mb-8">
          {/* Outer glow rings */}
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15), transparent 70%)',
              animationDuration: '3s',
            }}
          />
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              width: 90,
              height: 90,
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25), transparent 70%)',
              animationDuration: '2s',
            }}
          />
          {/* Main orb */}
          <div
            className="relative rounded-full"
            style={{
              width: 60,
              height: 60,
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
        </div>

        <h1 className="text-4xl md:text-5xl font-light text-silver-800 dark:text-silver-100 mb-6 tracking-tight">
          How was your day?
        </h1>

        <p className="text-lg text-silver-500 dark:text-silver-400 mb-12 font-light leading-relaxed">
          Take a moment to reflect. It only takes a minute.
        </p>

        <button
          onClick={() => setStep('mood')}
          className="btn-primary text-lg px-10 py-4"
        >
          Begin
        </button>

        <p className="mt-8 text-sm text-silver-400 dark:text-silver-500">
          No account needed to start
        </p>
      </div>
    </div>
  );
}
