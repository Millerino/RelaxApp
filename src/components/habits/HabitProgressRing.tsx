interface HabitProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color: string;
  backgroundColor?: string;
}

export function HabitProgressRing({
  progress,
  size = 64,
  strokeWidth = 4,
  color,
  backgroundColor = 'rgba(255,255,255,0.1)',
}: HabitProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - Math.min(1, Math.max(0, progress)) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
}
