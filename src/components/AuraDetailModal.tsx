import { useMemo, useState } from 'react';
import type { DayEntry } from '../types';

interface AuraDetailModalProps {
  entries: DayEntry[];
  xp: number;
  onClose: () => void;
}

const EVOLUTION_STAGES = [
  { name: 'Spark', minXP: 0, size: 60, rings: 1, glow: 'low', description: 'The beginning of your journey', emoji: '✨', color: '#94a3b8' },
  { name: 'Ember', minXP: 50, size: 70, rings: 2, glow: 'low', description: 'Your aura is taking shape', emoji: '🔥', color: '#f97316' },
  { name: 'Flame', minXP: 150, size: 80, rings: 2, glow: 'medium', description: 'Growing stronger each day', emoji: '💫', color: '#eab308' },
  { name: 'Blaze', minXP: 300, size: 90, rings: 3, glow: 'medium', description: 'A powerful presence', emoji: '⚡', color: '#f59e0b' },
  { name: 'Radiance', minXP: 500, size: 100, rings: 3, glow: 'high', description: 'Shining bright', emoji: '🌟', color: '#a78bfa' },
  { name: 'Aurora', minXP: 800, size: 110, rings: 4, glow: 'high', description: 'A magnificent display', emoji: '🌈', color: '#8b5cf6' },
  { name: 'Celestial', minXP: 1200, size: 120, rings: 4, glow: 'max', description: 'The pinnacle of wellness', emoji: '👑', color: '#6366f1' },
];

export function AuraDetailModal({ entries, xp, onClose }: AuraDetailModalProps) {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

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

  // Calculate vitality
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
        return { ...EVOLUTION_STAGES[i], index: i };
      }
    }
    return { ...EVOLUTION_STAGES[0], index: 0 };
  }, [xp]);

  // Get next stage
  const nextStage = EVOLUTION_STAGES[currentStage.index + 1] || null;

  // Progress to next stage
  const progressToNext = useMemo(() => {
    if (!nextStage) return 1;
    const currentMin = currentStage.minXP;
    const nextMin = nextStage.minXP;
    return (xp - currentMin) / (nextMin - currentMin);
  }, [xp, currentStage, nextStage]);

  // Get color based on average recent mood
  const recentMoods = entries.slice(-7).map(e => e.mood);
  const avgMood = recentMoods.length > 0
    ? recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
    : 3;

  const getGradientColors = () => {
    if (avgMood >= 4.5) return ['#34d399', '#10b981', '#059669'];
    if (avgMood >= 4) return ['#a78bfa', '#8b5cf6', '#7c3aed'];
    if (avgMood >= 3) return ['#a78bfa', '#818cf8', '#6366f1'];
    if (avgMood >= 2) return ['#fbbf24', '#f59e0b', '#d97706'];
    return ['#f87171', '#ef4444', '#dc2626'];
  };

  const colors = getGradientColors();
  const size = currentStage.size * vitality;
  const opacity = 0.4 + vitality * 0.6;

  // Get XP needed for a specific stage
  const getXPToStage = (stageIndex: number) => {
    if (stageIndex <= currentStage.index) return 0;
    return EVOLUTION_STAGES[stageIndex].minXP - xp;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-0 w-full max-w-md animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-lavender-500 to-lavender-600 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30
                     text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-xl font-medium text-white">Your Aura</h3>
          <p className="text-white/80 text-sm">{currentStage.name} • {xp} XP</p>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Orb Display */}
          <div className="py-8 flex justify-center relative">
            {/* Outer glow rings */}
            {currentStage.rings >= 3 && (
              <div
                className="absolute rounded-full animate-pulse"
                style={{
                  width: size * 2,
                  height: size * 2,
                  background: `radial-gradient(circle, ${colors[0]}15, transparent 70%)`,
                  opacity: opacity * 0.3,
                  animationDuration: '4s',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
            {currentStage.rings >= 2 && (
              <div
                className="absolute rounded-full animate-pulse"
                style={{
                  width: size * 1.6,
                  height: size * 1.6,
                  background: `radial-gradient(circle, ${colors[0]}20, transparent 70%)`,
                  opacity: opacity * 0.4,
                  animationDuration: '3s',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}

            {/* Main orb */}
            <div
              className="relative rounded-full transition-all duration-1000"
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
                boxShadow: `
                  0 0 ${20 * vitality}px ${colors[0]}60,
                  0 0 ${40 * vitality}px ${colors[1]}40,
                  0 0 ${60 * vitality}px ${colors[2]}20,
                  inset 0 0 ${20 * vitality}px rgba(255,255,255,0.3)
                `,
                opacity,
              }}
            >
              <div
                className="absolute inset-[15%] rounded-full"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent 60%)' }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-5">
            {/* Stage description */}
            <div className="text-center">
              <p className="text-silver-600 dark:text-silver-300 text-sm italic">
                "{currentStage.description}"
              </p>
            </div>

            {/* Progress to next stage */}
            {nextStage && (
              <div className="bg-silver-50 dark:bg-silver-800/50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-silver-700 dark:text-silver-200">
                    Next: {nextStage.name}
                  </span>
                  <span className="text-silver-500 dark:text-silver-400">
                    {nextStage.minXP - xp} XP to go
                  </span>
                </div>
                <div className="h-2 bg-silver-200 dark:bg-silver-700 rounded-full overflow-hidden">
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

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-silver-50 dark:bg-silver-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-semibold text-silver-800 dark:text-silver-100">{xp}</p>
                <p className="text-xs text-silver-500 dark:text-silver-400">Total XP</p>
              </div>
              <div className="bg-silver-50 dark:bg-silver-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-semibold text-silver-800 dark:text-silver-100">{entries.length}</p>
                <p className="text-xs text-silver-500 dark:text-silver-400">Entries</p>
              </div>
              <div className="bg-silver-50 dark:bg-silver-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-semibold text-silver-800 dark:text-silver-100">
                  {Math.round(vitality * 100)}%
                </p>
                <p className="text-xs text-silver-500 dark:text-silver-400">Vitality</p>
              </div>
            </div>

            {/* Evolution stages - Interactive */}
            <div>
              <h4 className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-4">Evolution Journey</h4>
              <div className="relative">
                {/* Connection line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-silver-200 dark:bg-silver-700" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-lavender-400 to-lavender-500 transition-all duration-500"
                  style={{ width: `${(currentStage.index / (EVOLUTION_STAGES.length - 1)) * 100}%` }}
                />

                {/* Stages */}
                <div className="relative flex justify-between">
                  {EVOLUTION_STAGES.map((stage, index) => {
                    const isReached = index <= currentStage.index;
                    const isCurrent = index === currentStage.index;
                    const isHovered = hoveredStage === index;
                    const xpNeeded = getXPToStage(index);

                    return (
                      <div
                        key={stage.name}
                        className="relative flex flex-col items-center group"
                        onMouseEnter={() => setHoveredStage(index)}
                        onMouseLeave={() => setHoveredStage(null)}
                      >
                        {/* Hover tooltip */}
                        {isHovered && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10
                                        bg-white dark:bg-silver-800 rounded-lg shadow-lg p-3 w-40
                                        border border-silver-200 dark:border-silver-700
                                        animate-fade-in">
                            <div className="text-center">
                              <span className="text-2xl">{stage.emoji}</span>
                              <p className="text-sm font-medium text-silver-800 dark:text-silver-100 mt-1">
                                {stage.name}
                              </p>
                              <p className="text-xs text-silver-500 dark:text-silver-400 mt-0.5">
                                {stage.description}
                              </p>
                              {!isReached && (
                                <p className="text-xs font-medium text-lavender-500 mt-2">
                                  {xpNeeded} XP to unlock
                                </p>
                              )}
                              {isReached && !isCurrent && (
                                <p className="text-xs text-emerald-500 mt-2">
                                  Achieved!
                                </p>
                              )}
                              {isCurrent && (
                                <p className="text-xs text-lavender-500 mt-2">
                                  Current level
                                </p>
                              )}
                            </div>
                            {/* Tooltip arrow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2
                                          bg-white dark:bg-silver-800 rotate-45
                                          border-r border-b border-silver-200 dark:border-silver-700" />
                          </div>
                        )}

                        {/* Stage circle */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                                    transition-all duration-300 cursor-pointer
                                    ${isCurrent
                                      ? 'ring-2 ring-lavender-400 ring-offset-2 ring-offset-white dark:ring-offset-silver-900 scale-110'
                                      : isHovered ? 'scale-110' : ''
                                    }
                                    ${isReached
                                      ? 'shadow-lg'
                                      : 'border-2 border-dashed border-silver-300 dark:border-silver-600'
                                    }`}
                          style={{
                            background: isReached
                              ? `linear-gradient(135deg, ${stage.color}dd, ${stage.color})`
                              : 'transparent',
                            boxShadow: isReached && isHovered
                              ? `0 0 20px ${stage.color}60`
                              : isReached
                              ? `0 0 10px ${stage.color}40`
                              : 'none',
                          }}
                        >
                          {isReached ? (
                            <span className="text-white text-xs">{stage.emoji}</span>
                          ) : (
                            <span className="text-silver-400 dark:text-silver-500 text-[10px]">
                              {stage.minXP}
                            </span>
                          )}
                        </div>

                        {/* Stage name */}
                        <span className={`text-[10px] mt-1.5 text-center transition-colors
                                       ${isReached
                                         ? 'text-silver-700 dark:text-silver-200 font-medium'
                                         : 'text-silver-400 dark:text-silver-500'
                                       }
                                       ${isHovered ? 'text-lavender-500 dark:text-lavender-400' : ''}`}>
                          {stage.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tips to level up */}
            {nextStage && (
              <div className="bg-gradient-to-br from-lavender-50 to-lavender-100/50 dark:from-lavender-900/20 dark:to-lavender-800/20
                            rounded-xl p-4 border border-lavender-200/50 dark:border-lavender-700/30">
                <h4 className="text-sm font-medium text-lavender-700 dark:text-lavender-300 mb-2 flex items-center gap-2">
                  <span>💡</span> Level up faster
                </h4>
                <ul className="text-xs text-lavender-600 dark:text-lavender-400 space-y-1">
                  <li>• Log daily for +10 XP base</li>
                  <li>• Add 3+ emotions for +5 XP</li>
                  <li>• Write longer reflections for +5 XP</li>
                  <li>• Maintain streaks for bonus XP</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
