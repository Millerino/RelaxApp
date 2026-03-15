import type { DayEntry } from '../types';

export const EVOLUTION_STAGES = [
  { name: 'Spark', minDays: 0, description: 'The beginning of your journey', colors: ['#cbd5e1', '#94a3b8', '#64748b'], image: '/images/aura/spark.png' },
  { name: 'Ember', minDays: 3, description: 'Your aura is taking shape', colors: ['#fcd34d', '#f97316', '#ea580c'], image: '/images/aura/ember.png' },
  { name: 'Flame', minDays: 10, description: 'Growing stronger each day', colors: ['#fde047', '#eab308', '#ca8a04'], image: '/images/aura/flame.png' },
  { name: 'Blaze', minDays: 24, description: 'A powerful presence', colors: ['#fbbf24', '#f59e0b', '#d97706'], image: '/images/aura/blaze.png' },
  { name: 'Radiance', minDays: 54, description: 'Shining bright', colors: ['#c4b5fd', '#a78bfa', '#8b5cf6'], image: '/images/aura/radiance.png' },
  { name: 'Aurora', minDays: 99, description: 'A magnificent display', colors: ['#a5b4fc', '#818cf8', '#6366f1'], image: '/images/aura/aurora.png' },
  { name: 'Celestial', minDays: 159, description: 'The pinnacle of wellness', colors: ['#e9d5ff', '#c084fc', '#a855f7'], image: '/images/aura/celestial.png' },
];

export interface AuraInfo {
  stageIndex: number;
  stage: typeof EVOLUTION_STAGES[number];
  nextStage: typeof EVOLUTION_STAGES[number] | null;
  totalDays: number;
  daysSinceLastEntry: number;
  decayLevels: number;
  progressToNext: number;
  isDecaying: boolean;
}

export function computeAura(entries: DayEntry[]): AuraInfo {
  // Count unique days with entries
  const totalDays = new Set(entries.map(e => e.date)).size;

  // Base level from total unique days logged
  let stageIndex = 0;
  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    if (totalDays >= EVOLUTION_STAGES[i].minDays) {
      stageIndex = i;
      break;
    }
  }

  // Calculate days since last entry
  let daysSinceLastEntry = Infinity;
  if (entries.length > 0) {
    const sortedEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);
    const lastEntry = new Date(sortedEntries[0].date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastEntry.setHours(0, 0, 0, 0);
    daysSinceLastEntry = Math.floor((today.getTime() - lastEntry.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Decay: lose one level for every 3 consecutive days of inactivity
  let decayLevels = 0;
  if (daysSinceLastEntry >= 3) {
    decayLevels = Math.floor(daysSinceLastEntry / 3);
    stageIndex = Math.max(0, stageIndex - decayLevels);
  }

  const stage = EVOLUTION_STAGES[stageIndex];
  const nextStage = EVOLUTION_STAGES[stageIndex + 1] || null;

  // Progress to next stage (based on total days, ignoring decay for progress bar)
  let progressToNext = 1;
  if (nextStage) {
    progressToNext = (totalDays - stage.minDays) / (nextStage.minDays - stage.minDays);
    progressToNext = Math.max(0, Math.min(1, progressToNext));
  }

  return {
    stageIndex,
    stage,
    nextStage,
    totalDays,
    daysSinceLastEntry,
    decayLevels,
    progressToNext,
    isDecaying: daysSinceLastEntry >= 3,
  };
}
