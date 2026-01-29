import { HabitProgressRing } from './HabitProgressRing';

interface HabitTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  progress: number;
  color: string;
  completed: boolean;
  onClick: () => void;
  isActive?: boolean; // For detox timer
}

export function HabitTile({
  icon,
  label,
  value,
  progress,
  color,
  completed,
  onClick,
  isActive,
}: HabitTileProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl
                 transition-all duration-200 ease-out
                 hover:scale-[0.98] active:scale-[0.95]
                 ${completed
                   ? 'ring-2 ring-amber-400/50 bg-gradient-to-br from-amber-500/10 to-amber-600/10'
                   : 'bg-white/5 hover:bg-white/10'
                 }
                 ${isActive ? 'animate-pulse' : ''}
                 backdrop-blur-sm border border-white/10`}
      style={{
        background: completed
          ? `linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))`
          : `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
      }}
    >
      {/* Completed badge */}
      {completed && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Progress ring with icon */}
      <div className="relative mb-2">
        <HabitProgressRing
          progress={progress}
          size={56}
          strokeWidth={4}
          color={color}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>

      {/* Value */}
      <span className="text-sm font-semibold text-white/90 mb-0.5">
        {value}
      </span>

      {/* Label */}
      <span className="text-xs text-white/50">
        {label}
      </span>
    </button>
  );
}
