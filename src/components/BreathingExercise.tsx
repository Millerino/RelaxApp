import { useState, useEffect, useCallback } from 'react';

interface BreathingExerciseProps {
  onClose: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASES: { phase: BreathPhase; duration: number; instruction: string }[] = [
  { phase: 'inhale', duration: 4000, instruction: 'Breathe in' },
  { phase: 'hold', duration: 7000, instruction: 'Hold' },
  { phase: 'exhale', duration: 8000, instruction: 'Breathe out' },
  { phase: 'rest', duration: 1000, instruction: 'Rest' },
];

const TOTAL_DURATION = 60000; // 1 minute

export function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const currentPhase = PHASES[currentPhaseIndex];

  const startExercise = () => {
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setProgress(0);
    setTotalElapsed(0);
    setCycleCount(0);
  };

  const stopExercise = useCallback(() => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const phaseStartTime = Date.now();
    const phaseDuration = currentPhase.duration;

    const interval = setInterval(() => {
      const elapsed = Date.now() - phaseStartTime;
      const phaseProgress = Math.min(elapsed / phaseDuration, 1);
      setProgress(phaseProgress);

      setTotalElapsed(prev => {
        const newTotal = prev + 50;
        if (newTotal >= TOTAL_DURATION) {
          stopExercise();
          return 0;
        }
        return newTotal;
      });

      if (elapsed >= phaseDuration) {
        setCurrentPhaseIndex(prev => {
          const next = (prev + 1) % PHASES.length;
          if (next === 0) {
            setCycleCount(c => c + 1);
          }
          return next;
        });
        setProgress(0);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, currentPhaseIndex, currentPhase.duration, stopExercise]);

  // Calculate orb scale based on phase
  const getOrbScale = () => {
    if (!isActive) return 1;
    switch (currentPhase.phase) {
      case 'inhale':
        return 1 + progress * 0.5; // Grow from 1 to 1.5
      case 'hold':
        return 1.5; // Stay big
      case 'exhale':
        return 1.5 - progress * 0.5; // Shrink from 1.5 to 1
      case 'rest':
        return 1; // Stay small
      default:
        return 1;
    }
  };

  const getOrbOpacity = () => {
    if (!isActive) return 0.6;
    switch (currentPhase.phase) {
      case 'inhale':
        return 0.6 + progress * 0.3;
      case 'hold':
        return 0.9;
      case 'exhale':
        return 0.9 - progress * 0.3;
      case 'rest':
        return 0.6;
      default:
        return 0.6;
    }
  };

  const overallProgress = totalElapsed / TOTAL_DURATION;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center">
        {/* Progress ring */}
        {isActive && (
          <div className="absolute top-6 left-6">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(167, 139, 250, 0.8)"
                strokeWidth="3"
                strokeDasharray={`${overallProgress * 125.6} 125.6`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white/60">
              {Math.ceil((TOTAL_DURATION - totalElapsed) / 1000)}s
            </span>
          </div>
        )}

        {/* Breathing orb */}
        <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
          {/* Outer glow rings */}
          <div
            className="absolute inset-0 rounded-full bg-lavender-400/20 blur-xl transition-transform duration-500"
            style={{ transform: `scale(${getOrbScale() * 1.2})` }}
          />
          <div
            className="absolute inset-8 rounded-full bg-lavender-400/30 blur-lg transition-transform duration-500"
            style={{ transform: `scale(${getOrbScale() * 1.1})` }}
          />

          {/* Main orb */}
          <div
            className="relative w-40 h-40 rounded-full transition-all duration-500 ease-in-out"
            style={{
              transform: `scale(${getOrbScale()})`,
              background: `radial-gradient(circle at 30% 30%,
                rgba(167, 139, 250, ${getOrbOpacity()}),
                rgba(139, 92, 246, ${getOrbOpacity() * 0.8}),
                rgba(109, 40, 217, ${getOrbOpacity() * 0.6}))`,
              boxShadow: `
                0 0 60px rgba(167, 139, 250, ${getOrbOpacity() * 0.5}),
                0 0 120px rgba(139, 92, 246, ${getOrbOpacity() * 0.3}),
                inset 0 0 60px rgba(255, 255, 255, ${getOrbOpacity() * 0.2})
              `,
            }}
          >
            {/* Inner highlight */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
          </div>

          {/* Floating particles */}
          {isActive && currentPhase.phase !== 'rest' && (
            <>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-lavender-300/60 animate-float"
                  style={{
                    left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 45}%`,
                    top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 45}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${2 + i * 0.3}s`,
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mb-8">
          {isActive ? (
            <>
              <h2 className="text-3xl font-light text-white mb-2 animate-fade-in">
                {currentPhase.instruction}
              </h2>
              <p className="text-white/50 text-sm">
                Cycle {cycleCount + 1} • 4-7-8 breathing
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-light text-white mb-3">
                Take a breath
              </h2>
              <p className="text-white/60 text-sm max-w-xs mx-auto mb-2">
                A 1-minute breathing exercise using the 4-7-8 technique to calm your mind.
              </p>
              <p className="text-white/40 text-xs">
                4 seconds inhale • 7 seconds hold • 8 seconds exhale
              </p>
            </>
          )}
        </div>

        {/* Start/Stop button */}
        {isActive ? (
          <button
            onClick={stopExercise}
            className="px-8 py-3 rounded-full text-white/80 border border-white/30
                     hover:bg-white/10 transition-colors"
          >
            End session
          </button>
        ) : (
          <button
            onClick={startExercise}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-lavender-500 to-lavender-600
                     text-white font-medium shadow-lg shadow-lavender-500/30
                     hover:shadow-xl hover:shadow-lavender-500/40 transition-all"
          >
            Begin breathing
          </button>
        )}
      </div>

      {/* Add keyframes for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
