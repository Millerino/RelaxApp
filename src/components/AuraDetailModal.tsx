import { useEffect, useState } from 'react';
import type { DayEntry } from '../types';
import { EVOLUTION_STAGES, computeAura } from '../lib/aura';

interface AuraDetailModalProps {
  entries: DayEntry[];
  xp: number;
  onClose: () => void;
}

export function AuraDetailModal({ entries, onClose }: AuraDetailModalProps) {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  // Preload all aura images on mount so hover tooltips are instant
  useEffect(() => {
    EVOLUTION_STAGES.forEach(stage => {
      const img = new Image();
      img.src = stage.image;
    });
  }, []);

  const aura = computeAura(entries);
  const { stageIndex, stage, nextStage, totalDays, daysSinceLastEntry, progressToNext, isDecaying } = aura;

  // Calculate vitality based on days since last entry
  const vitality = (() => {
    if (daysSinceLastEntry === 0) return 1;
    if (daysSinceLastEntry === 1) return 0.9;
    if (daysSinceLastEntry === 2) return 0.7;
    if (daysSinceLastEntry === 3) return 0.4;
    return 0.2;
  })();

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
  const baseSize = 60 + stageIndex * 10;
  const size = baseSize * vitality;
  const opacity = 0.4 + vitality * 0.6;
  const rings = stageIndex >= 3 ? 3 : stageIndex >= 1 ? 2 : 1;

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
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30
                     text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-xl font-medium text-white">Your Aura</h3>
          <p className="text-white/80 text-sm">{stage.name}</p>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Aura Image Display */}
          <div className="py-8 flex justify-center relative">
            {rings >= 3 && (
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
            {rings >= 2 && (
              <div
                className="absolute rounded-full animate-pulse"
                style={{
                  width: size * 2,
                  height: size * 2,
                  background: `radial-gradient(circle, ${colors[0]}20, transparent 70%)`,
                  opacity: opacity * 0.4,
                  animationDuration: '3s',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}

            {/* Main aura image */}
            <img
              src={stage.image}
              alt={stage.name}
              className="relative transition-all duration-1000 drop-shadow-2xl"
              style={{
                width: size * 1.4,
                height: size * 1.4,
                opacity,
                filter: `drop-shadow(0 0 ${20 * vitality}px ${colors[0]}60) drop-shadow(0 0 ${40 * vitality}px ${colors[1]}30)`,
              }}
            />
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-5">
            {/* Stage description */}
            <div className="text-center">
              <p className="text-silver-600 dark:text-silver-300 text-sm italic">
                "{stage.description}"
              </p>
            </div>

            {/* Decay warning */}
            {isDecaying && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-700/30">
                <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
                  Your aura is fading. Log today to restore it!
                </p>
              </div>
            )}

            {/* Progress to next stage */}
            {nextStage && (
              <div className="bg-silver-50 dark:bg-silver-800/50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-silver-700 dark:text-silver-200">
                    Growing toward {nextStage.name}
                  </span>
                  <span className="text-silver-500 dark:text-silver-400 text-xs">
                    {totalDays} / {nextStage.minDays} days
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
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-silver-50 dark:bg-silver-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-semibold text-silver-800 dark:text-silver-100">{totalDays}</p>
                <p className="text-xs text-silver-500 dark:text-silver-400">
                  {totalDays === 1 ? 'Day logged' : 'Days logged'}
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
                  style={{ width: `${(stageIndex / (EVOLUTION_STAGES.length - 1)) * 100}%` }}
                />

                {/* Stages */}
                <div className="relative flex justify-between">
                  {EVOLUTION_STAGES.map((s, index) => {
                    const isReached = index <= stageIndex;
                    const isCurrent = index === stageIndex;
                    const isHovered = hoveredStage === index;
                    const glowIntensity = 0.2 + index * 0.13;

                    return (
                      <div
                        key={s.name}
                        className="relative flex flex-col items-center group"
                        onMouseEnter={() => setHoveredStage(index)}
                        onMouseLeave={() => setHoveredStage(null)}
                      >
                        {/* Hover tooltip */}
                        {isHovered && (
                          <div className={`absolute bottom-full mb-3 z-10
                                        bg-white dark:bg-silver-800 rounded-lg shadow-lg p-3 w-44
                                        border border-silver-200 dark:border-silver-700
                                        animate-fade-in
                                        ${index === 0 ? 'left-0' : index === EVOLUTION_STAGES.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                            <div className="text-center">
                              <div className="flex justify-center mb-2">
                                <img
                                  src={s.image}
                                  alt={s.name}
                                  className="drop-shadow-lg"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    filter: `drop-shadow(0 0 ${6 * glowIntensity}px ${s.colors[0]}80)`,
                                  }}
                                />
                              </div>
                              <p className="text-sm font-medium text-silver-800 dark:text-silver-100">
                                {s.name}
                              </p>
                              <p className="text-xs text-silver-500 dark:text-silver-400 mt-0.5">
                                {s.description}
                              </p>
                              <p className="text-[10px] text-silver-400 dark:text-silver-500 mt-1">
                                {s.minDays === 0 ? 'Starting level' : `${s.minDays} days to unlock`}
                              </p>
                              {!isReached && (
                                <p className="text-xs text-silver-400 dark:text-silver-500 mt-1 italic">
                                  Still ahead on your journey
                                </p>
                              )}
                              {isReached && !isCurrent && (
                                <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                                  You've been here
                                </p>
                              )}
                              {isCurrent && (
                                <p className="text-xs text-lavender-500 dark:text-lavender-400 mt-1">
                                  Where you are now
                                </p>
                              )}
                            </div>
                            <div className={`absolute -bottom-1 w-2 h-2
                                          bg-white dark:bg-silver-800 rotate-45
                                          border-r border-b border-silver-200 dark:border-silver-700
                                          ${index === 0 ? 'left-5' : index === EVOLUTION_STAGES.length - 1 ? 'right-5' : 'left-1/2 -translate-x-1/2'}`} />
                          </div>
                        )}

                        {/* Mini Aura Image */}
                        <div
                          className={`relative flex items-center justify-center
                                    transition-all duration-300 cursor-pointer
                                    ${isCurrent ? 'scale-125' : isHovered ? 'scale-110' : ''}`}
                          style={{ width: 40, height: 40 }}
                        >
                          {isReached ? (
                            <img
                              src={s.image}
                              alt={s.name}
                              className="transition-all duration-300"
                              style={{
                                width: (16 + index * 2) * 1.4,
                                height: (16 + index * 2) * 1.4,
                                filter: `drop-shadow(0 0 ${6 * glowIntensity * (isHovered ? 2 : 1)}px ${s.colors[0]}80)`,
                                opacity: isCurrent ? 1 : 0.7,
                              }}
                            />
                          ) : (
                            <div
                              className="rounded-full border-2 border-dashed border-silver-300 dark:border-silver-600
                                        flex items-center justify-center"
                              style={{ width: 18, height: 18 }}
                            >
                              <span className="text-[8px] text-silver-400 dark:text-silver-500">···</span>
                            </div>
                          )}
                        </div>

                        {/* Stage name */}
                        <span className={`text-[10px] mt-1 text-center transition-colors
                                       ${isReached
                                         ? 'text-silver-700 dark:text-silver-200 font-medium'
                                         : 'text-silver-400 dark:text-silver-500'
                                       }
                                       ${isHovered ? 'text-lavender-500 dark:text-lavender-400' : ''}`}>
                          {s.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Aura info - how it works */}
            <div className="bg-gradient-to-br from-lavender-50 to-lavender-100/50 dark:from-lavender-900/20 dark:to-lavender-800/20
                          rounded-xl p-4 border border-lavender-200/50 dark:border-lavender-700/30">
              <h4 className="text-sm font-medium text-lavender-700 dark:text-lavender-300 mb-2">
                How your aura grows
              </h4>
              <ul className="text-xs text-lavender-600 dark:text-lavender-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-lavender-400">·</span>
                  <span>Each day you log helps your aura evolve</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lavender-400">·</span>
                  <span>3 days without logging and your aura starts to fade back</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lavender-400">·</span>
                  <span>Log regularly to maintain and grow your presence</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
