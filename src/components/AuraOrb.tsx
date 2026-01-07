import { useMemo, useState } from 'react';
import type { DayEntry } from '../types';

interface AuraOrbProps {
  entries: DayEntry[];
  xp: number;
}

// Info tooltip component
function InfoTooltip({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="absolute right-0 top-8 w-64 p-4 glass-card shadow-xl z-50 text-left animate-fade-in">
      <h5 className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-2">About Your Aura</h5>
      <p className="text-xs text-silver-600 dark:text-silver-400 mb-2">
        Your Aura is a visual representation of your wellness journey. It grows and evolves as you log your reflections.
      </p>
      <div className="text-xs text-silver-500 dark:text-silver-400 space-y-1">
        <p><strong>XP:</strong> Earn points by logging daily, adding emotions, reflections, and goals.</p>
        <p><strong>Evolution:</strong> Your Aura evolves through 7 stages as you gain XP.</p>
        <p><strong>Vitality:</strong> Log regularly to keep your Aura thriving. It dims after 2+ days without activity.</p>
        <p><strong>Color:</strong> Changes based on your recent mood average.</p>
      </div>
    </div>
  );
}

// XP thresholds for evolution stages
const EVOLUTION_STAGES = [
  { name: 'Spark', minXP: 0, size: 40, rings: 1, glow: 'low' },
  { name: 'Ember', minXP: 50, size: 50, rings: 2, glow: 'low' },
  { name: 'Flame', minXP: 150, size: 60, rings: 2, glow: 'medium' },
  { name: 'Blaze', minXP: 300, size: 70, rings: 3, glow: 'medium' },
  { name: 'Radiance', minXP: 500, size: 80, rings: 3, glow: 'high' },
  { name: 'Aurora', minXP: 800, size: 90, rings: 4, glow: 'high' },
  { name: 'Celestial', minXP: 1200, size: 100, rings: 4, glow: 'max' },
];

export function AuraOrb({ entries, xp }: AuraOrbProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Calculate days since last entry
  const daysSinceLastEntry = useMemo(() => {
    if (entries.length === 0) return Infinity;
    const sortedEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);
    const lastEntry = new Date(sortedEntries[0].date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastEntry.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - lastEntry.getTime()) / (1000 * 60 * 60 * 24));
  }, [entries]);

  // Calculate health/vitality (0-1) based on activity
  const vitality = useMemo(() => {
    if (daysSinceLastEntry === 0) return 1;
    if (daysSinceLastEntry === 1) return 0.9;
    if (daysSinceLastEntry === 2) return 0.7;
    if (daysSinceLastEntry === 3) return 0.4;
    if (daysSinceLastEntry >= 4) return 0.2;
    return 1;
  }, [daysSinceLastEntry]);

  // Get current evolution stage
  const currentStage = useMemo(() => {
    for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
      if (xp >= EVOLUTION_STAGES[i].minXP) {
        return EVOLUTION_STAGES[i];
      }
    }
    return EVOLUTION_STAGES[0];
  }, [xp]);

  // Get next stage for progress
  const nextStage = useMemo(() => {
    const currentIndex = EVOLUTION_STAGES.findIndex(s => s.name === currentStage.name);
    return EVOLUTION_STAGES[currentIndex + 1] || null;
  }, [currentStage]);

  // Progress to next stage
  const progressToNext = useMemo(() => {
    if (!nextStage) return 1;
    const currentMin = currentStage.minXP;
    const nextMin = nextStage.minXP;
    return (xp - currentMin) / (nextMin - currentMin);
  }, [xp, currentStage, nextStage]);

  // Calculate visual properties based on vitality
  const size = currentStage.size * vitality;
  const opacity = 0.4 + vitality * 0.6;

  // Get color based on average recent mood
  const recentMoods = entries.slice(-7).map(e => e.mood);
  const avgMood = recentMoods.length > 0
    ? recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
    : 3;

  const getGradientColors = () => {
    // Blend between colors based on mood
    if (avgMood >= 4.5) return ['#34d399', '#10b981', '#059669']; // Emerald
    if (avgMood >= 4) return ['#a78bfa', '#8b5cf6', '#7c3aed']; // Violet
    if (avgMood >= 3) return ['#a78bfa', '#818cf8', '#6366f1']; // Lavender-indigo
    if (avgMood >= 2) return ['#fbbf24', '#f59e0b', '#d97706']; // Amber
    return ['#f87171', '#ef4444', '#dc2626']; // Red
  };

  const colors = getGradientColors();

  // Is the orb "dying" (low vitality)?
  const isDying = vitality <= 0.4;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div>
            <h4 className="text-sm font-medium text-silver-700 dark:text-silver-200">
              Your Aura
            </h4>
            <p className="text-xs text-silver-500 dark:text-silver-400">
              {currentStage.name} • {xp} XP
            </p>
          </div>
          {/* Info button */}
          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              onBlur={() => setTimeout(() => setShowInfo(false), 150)}
              className="p-1 text-silver-400 hover:text-silver-600 dark:hover:text-silver-300 transition-colors"
              aria-label="Learn more about Your Aura"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <InfoTooltip isVisible={showInfo} />
          </div>
        </div>
        {isDying && (
          <span className="text-xs text-amber-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Needs attention
          </span>
        )}
      </div>

      {/* Orb container */}
      <div className="relative h-32 flex items-center justify-center mb-4">
        {/* Outer glow rings */}
        {currentStage.rings >= 3 && (
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              width: size * 2.2,
              height: size * 2.2,
              background: `radial-gradient(circle, ${colors[0]}15, transparent 70%)`,
              opacity: opacity * 0.3,
              animationDuration: '4s',
            }}
          />
        )}
        {currentStage.rings >= 2 && (
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              width: size * 1.8,
              height: size * 1.8,
              background: `radial-gradient(circle, ${colors[0]}20, transparent 70%)`,
              opacity: opacity * 0.4,
              animationDuration: '3s',
            }}
          />
        )}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: size * 1.4,
            height: size * 1.4,
            background: `radial-gradient(circle, ${colors[0]}30, transparent 70%)`,
            opacity: opacity * 0.5,
            animationDuration: '2s',
          }}
        />

        {/* Main orb */}
        <div
          className="relative rounded-full transition-all duration-1000"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle at 30% 30%,
              ${colors[0]},
              ${colors[1]},
              ${colors[2]})`,
            boxShadow: `
              0 0 ${20 * vitality}px ${colors[0]}60,
              0 0 ${40 * vitality}px ${colors[1]}40,
              0 0 ${60 * vitality}px ${colors[2]}20,
              inset 0 0 ${20 * vitality}px rgba(255,255,255,0.3)
            `,
            opacity,
            filter: isDying ? 'grayscale(30%)' : 'none',
          }}
        >
          {/* Inner highlight */}
          <div
            className="absolute inset-[15%] rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent 60%)',
            }}
          />

          {/* Particle effects for high glow */}
          {currentStage.glow === 'max' && vitality > 0.7 && (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white/60 animate-ping"
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

        {/* Orbiting particles for higher stages */}
        {currentStage.rings >= 4 && vitality > 0.5 && (
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 120}deg) translateX(${size * 0.8}px)`,
                  background: colors[0],
                  boxShadow: `0 0 10px ${colors[0]}`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress to next stage */}
      {nextStage && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-silver-500 dark:text-silver-400">
              Next: {nextStage.name}
            </span>
            <span className="text-silver-500 dark:text-silver-400">
              {nextStage.minXP - xp} XP to go
            </span>
          </div>
          <div className="h-1.5 bg-silver-100 dark:bg-silver-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressToNext * 100}%`,
                background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Status message */}
      <p className="text-xs text-center text-silver-500 dark:text-silver-400">
        {daysSinceLastEntry === 0 && "Your aura is thriving! ✨"}
        {daysSinceLastEntry === 1 && "Your aura awaits today's reflection"}
        {daysSinceLastEntry === 2 && "Your aura is getting dim..."}
        {daysSinceLastEntry >= 3 && "Your aura needs your attention! Log a reflection to restore it."}
      </p>
    </div>
  );
}
