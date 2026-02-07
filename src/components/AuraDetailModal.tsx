import { useMemo, useState } from 'react';
import type { DayEntry } from '../types';

interface AuraDetailModalProps {
  entries: DayEntry[];
  xp: number;
  onClose: () => void;
}

const EVOLUTION_STAGES = [
  { name: 'Spark', minXP: 0, size: 60, rings: 1, glow: 'low', description: 'The beginning of your journey', colors: ['#cbd5e1', '#94a3b8', '#64748b'], orbSize: 16, glowIntensity: 0.2 },
  { name: 'Ember', minXP: 50, size: 70, rings: 2, glow: 'low', description: 'Your aura is taking shape', colors: ['#fcd34d', '#f97316', '#ea580c'], orbSize: 18, glowIntensity: 0.3 },
  { name: 'Flame', minXP: 150, size: 80, rings: 2, glow: 'medium', description: 'Growing stronger each day', colors: ['#fde047', '#eab308', '#ca8a04'], orbSize: 20, glowIntensity: 0.4 },
  { name: 'Blaze', minXP: 300, size: 90, rings: 3, glow: 'medium', description: 'A powerful presence', colors: ['#fbbf24', '#f59e0b', '#d97706'], orbSize: 22, glowIntensity: 0.5 },
  { name: 'Radiance', minXP: 500, size: 100, rings: 3, glow: 'high', description: 'Shining bright', colors: ['#c4b5fd', '#a78bfa', '#8b5cf6'], orbSize: 24, glowIntensity: 0.6 },
  { name: 'Aurora', minXP: 800, size: 110, rings: 4, glow: 'high', description: 'A magnificent display', colors: ['#a5b4fc', '#818cf8', '#6366f1'], orbSize: 26, glowIntensity: 0.75 },
  { name: 'Celestial', minXP: 1200, size: 120, rings: 4, glow: 'max', description: 'The pinnacle of wellness', colors: ['#e9d5ff', '#c084fc', '#a855f7'], orbSize: 30, glowIntensity: 1 },
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-0 w-full max-w-md animate-slide-up overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
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
          <p className="text-white/80 text-sm">{currentStage.name}</p>
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

            {/* Progress to next stage - subtle, no explicit numbers */}
            {nextStage && (
              <div className="bg-silver-50 dark:bg-silver-800/50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-silver-700 dark:text-silver-200">
                    Growing toward {nextStage.name}
                  </span>
                  <span className="text-silver-500 dark:text-silver-400 text-xs">
                    {progressToNext < 0.3 ? 'Just beginning' : progressToNext < 0.6 ? 'Making progress' : 'Almost there'}
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

            {/* Stats grid - softer language */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-silver-50 dark:bg-silver-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-semibold text-silver-800 dark:text-silver-100">{entries.length}</p>
                <p className="text-xs text-silver-500 dark:text-silver-400">
                  {entries.length === 1 ? 'Reflection' : 'Reflections'}
                </p>
              </div>
              <div className="bg-silver-50 dark:bg-silver-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-semibold text-silver-800 dark:text-silver-100">
                  {vitality >= 0.9 ? 'Vibrant' : vitality >= 0.7 ? 'Steady' : vitality >= 0.4 ? 'Resting' : 'Quiet'}
                </p>
                <p className="text-xs text-silver-500 dark:text-silver-400">Presence</p>
              </div>
            </div>

            {/* Evolution stages - Interactive */}
            <div>
              <h4 className="text-sm font-medium text-silver-700 dark:text-silver-200 mb-4">Evolution Journey</h4>
              <div className="relative">
                {/* Connection line */}
                <div className="absolute top-5 left-4 right-4 h-0.5 bg-silver-200 dark:bg-silver-700" />
                <div
                  className="absolute top-5 left-4 h-0.5 bg-gradient-to-r from-lavender-400 to-lavender-500 transition-all duration-500"
                  style={{ width: `${(currentStage.index / (EVOLUTION_STAGES.length - 1)) * 100}%` }}
                />

                {/* Stages */}
                <div className="relative flex justify-between">
                  {EVOLUTION_STAGES.map((stage, index) => {
                    const isReached = index <= currentStage.index;
                    const isCurrent = index === currentStage.index;
                    const isHovered = hoveredStage === index;

                    return (
                      <div
                        key={stage.name}
                        className="relative flex flex-col items-center group"
                        onMouseEnter={() => setHoveredStage(index)}
                        onMouseLeave={() => setHoveredStage(null)}
                      >
                        {/* Hover tooltip */}
                        {isHovered && (
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-10
                                        bg-white dark:bg-silver-800 rounded-lg shadow-lg p-3 w-44
                                        border border-silver-200 dark:border-silver-700
                                        animate-fade-in">
                            <div className="text-center">
                              {/* Mini aura orb in tooltip */}
                              <div className="flex justify-center mb-2">
                                <div
                                  className="relative rounded-full"
                                  style={{
                                    width: stage.orbSize * 1.5,
                                    height: stage.orbSize * 1.5,
                                    background: `radial-gradient(circle at 30% 30%, ${stage.colors[0]}, ${stage.colors[1]}, ${stage.colors[2]})`,
                                    boxShadow: `
                                      0 0 ${8 * stage.glowIntensity}px ${stage.colors[0]}80,
                                      0 0 ${16 * stage.glowIntensity}px ${stage.colors[1]}60,
                                      0 0 ${24 * stage.glowIntensity}px ${stage.colors[2]}40
                                    `,
                                  }}
                                >
                                  <div
                                    className="absolute inset-[15%] rounded-full"
                                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.5), transparent 60%)' }}
                                  />
                                </div>
                              </div>
                              <p className="text-sm font-medium text-silver-800 dark:text-silver-100">
                                {stage.name}
                              </p>
                              <p className="text-xs text-silver-500 dark:text-silver-400 mt-0.5">
                                {stage.description}
                              </p>
                              {!isReached && (
                                <p className="text-xs text-silver-400 dark:text-silver-500 mt-2 italic">
                                  Still ahead on your journey
                                </p>
                              )}
                              {isReached && !isCurrent && (
                                <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-2">
                                  You've been here
                                </p>
                              )}
                              {isCurrent && (
                                <p className="text-xs text-lavender-500 dark:text-lavender-400 mt-2">
                                  Where you are now
                                </p>
                              )}
                            </div>
                            {/* Tooltip arrow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2
                                          bg-white dark:bg-silver-800 rotate-45
                                          border-r border-b border-silver-200 dark:border-silver-700" />
                          </div>
                        )}

                        {/* Mini Aura Orb */}
                        <div
                          className={`relative flex items-center justify-center
                                    transition-all duration-300 cursor-pointer
                                    ${isCurrent ? 'scale-125' : isHovered ? 'scale-115' : ''}`}
                          style={{ width: 40, height: 40 }}
                        >
                          {/* Outer glow ring for reached stages */}
                          {isReached && stage.glowIntensity >= 0.4 && (
                            <div
                              className={`absolute rounded-full ${isHovered || isCurrent ? 'animate-pulse' : ''}`}
                              style={{
                                width: stage.orbSize * 1.8,
                                height: stage.orbSize * 1.8,
                                background: `radial-gradient(circle, ${stage.colors[0]}30, transparent 70%)`,
                                animationDuration: '2s',
                              }}
                            />
                          )}
                          {/* Second glow ring for high-level stages */}
                          {isReached && stage.glowIntensity >= 0.6 && (
                            <div
                              className={`absolute rounded-full ${isHovered || isCurrent ? 'animate-pulse' : ''}`}
                              style={{
                                width: stage.orbSize * 1.4,
                                height: stage.orbSize * 1.4,
                                background: `radial-gradient(circle, ${stage.colors[1]}40, transparent 70%)`,
                                animationDuration: '1.5s',
                              }}
                            />
                          )}
                          {/* The orb itself */}
                          <div
                            className={`relative rounded-full transition-all duration-500
                                      ${isCurrent ? 'ring-2 ring-white/60 dark:ring-white/40' : ''}`}
                            style={{
                              width: isReached ? stage.orbSize : 14,
                              height: isReached ? stage.orbSize : 14,
                              background: isReached
                                ? `radial-gradient(circle at 30% 30%, ${stage.colors[0]}, ${stage.colors[1]}, ${stage.colors[2]})`
                                : 'transparent',
                              border: !isReached ? '2px dashed rgba(148, 163, 184, 0.5)' : 'none',
                              boxShadow: isReached
                                ? `
                                    0 0 ${6 * stage.glowIntensity * (isHovered ? 2 : 1)}px ${stage.colors[0]}80,
                                    0 0 ${12 * stage.glowIntensity * (isHovered ? 2 : 1)}px ${stage.colors[1]}60,
                                    0 0 ${18 * stage.glowIntensity * (isHovered ? 2 : 1)}px ${stage.colors[2]}40,
                                    inset 0 0 ${4 * stage.glowIntensity}px rgba(255,255,255,0.3)
                                  `
                                : 'none',
                              transform: isHovered && isReached ? 'scale(1.15)' : 'scale(1)',
                            }}
                          >
                            {/* Inner highlight */}
                            {isReached && (
                              <div
                                className="absolute inset-[15%] rounded-full"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent 60%)' }}
                              />
                            )}
                            {/* Subtle indicator for locked stages - no explicit numbers */}
                            {!isReached && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[8px] text-silver-400 dark:text-silver-500">
                                  ···
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stage name */}
                        <span className={`text-[10px] mt-1 text-center transition-colors
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

            {/* Tips to nurture your aura - softer language */}
            {nextStage && (
              <div className="bg-gradient-to-br from-lavender-50 to-lavender-100/50 dark:from-lavender-900/20 dark:to-lavender-800/20
                            rounded-xl p-4 border border-lavender-200/50 dark:border-lavender-700/30">
                <h4 className="text-sm font-medium text-lavender-700 dark:text-lavender-300 mb-2">
                  Ways to nurture your aura
                </h4>
                <ul className="text-xs text-lavender-600 dark:text-lavender-400 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-lavender-400">·</span>
                    <span>Show up and reflect, even briefly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lavender-400">·</span>
                    <span>Name what you're feeling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lavender-400">·</span>
                    <span>Write about what matters to you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lavender-400">·</span>
                    <span>Return when you can — your aura remembers</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
