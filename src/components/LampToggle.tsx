import { useTheme } from '../context/ThemeContext';

export function LampToggle() {
  const { isLampOn, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-full
                 bg-white/20 dark:bg-silver-800/40 backdrop-blur-md
                 border border-white/30 dark:border-silver-700/30
                 hover:bg-white/30 dark:hover:bg-silver-700/40
                 transition-all duration-300 ease-out
                 group"
      aria-label={isLampOn ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <div className="relative w-8 h-8">
        {/* Lamp base/bulb */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`w-8 h-8 transition-all duration-500 ${
            isLampOn
              ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-glow'
              : 'text-silver-400 dark:text-silver-500'
          }`}
        >
          {/* Bulb shape */}
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"
            fill="currentColor"
            className={isLampOn ? 'opacity-100' : 'opacity-60'}
          />
          {/* Light rays when on */}
          {isLampOn && (
            <>
              <line x1="12" y1="1" x2="12" y2="-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-pulse-soft" />
              <line x1="4.22" y1="4.22" x2="2.81" y2="2.81" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-pulse-soft" />
              <line x1="1" y1="12" x2="-1" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-pulse-soft" />
              <line x1="19.78" y1="4.22" x2="21.19" y2="2.81" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-pulse-soft" />
              <line x1="23" y1="12" x2="25" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-pulse-soft" />
            </>
          )}
          {/* Bulb base */}
          <rect
            x="9"
            y="18"
            width="6"
            height="2"
            rx="1"
            fill="currentColor"
            className="opacity-70"
          />
          <rect
            x="10"
            y="20"
            width="4"
            height="2"
            rx="1"
            fill="currentColor"
            className="opacity-70"
          />
        </svg>

        {/* Glow effect for light mode */}
        {isLampOn && (
          <div className="absolute inset-0 -z-10 rounded-full bg-amber-300/30 blur-xl animate-pulse-soft" />
        )}
      </div>
    </button>
  );
}
