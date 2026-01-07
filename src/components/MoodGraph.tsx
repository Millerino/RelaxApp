import { useMemo, useState } from 'react';
import type { DayEntry } from '../types';

interface MoodGraphProps {
  entries: DayEntry[];
}

interface TooltipData {
  x: number;
  y: number;
  day: {
    date: Date;
    label: string;
    fullLabel: string;
    entry: DayEntry | null;
  };
}

export function MoodGraph({ entries }: MoodGraphProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const last7Days = useMemo(() => {
    const days: { date: Date; label: string; fullLabel: string; entry: DayEntry | null }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const entry = entries.find(e => e.date === dateStr) || null;

      // Get day label (Mon, Tue, etc)
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      const fullLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

      days.push({ date, label, fullLabel, entry });
    }

    return days;
  }, [entries]);

  // Calculate statistics
  const stats = useMemo(() => {
    const moods = last7Days.filter(d => d.entry).map(d => d.entry!.mood);
    if (moods.length === 0) return { avg: 0, high: 0, low: 0, trend: 'neutral' as const, daysLogged: 0 };

    const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
    const high = Math.max(...moods);
    const low = Math.min(...moods);

    // Calculate trend (comparing first half to second half)
    const firstHalf = moods.slice(0, Math.ceil(moods.length / 2));
    const secondHalf = moods.slice(Math.ceil(moods.length / 2));
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;

    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (secondAvg > firstAvg + 0.3) trend = 'up';
    else if (secondAvg < firstAvg - 0.3) trend = 'down';

    return { avg, high, low, trend, daysLogged: moods.length };
  }, [last7Days]);

  // SVG dimensions - larger for better visibility
  const width = 320;
  const height = 140;
  const padding = { top: 20, right: 15, bottom: 35, left: 30 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Create path for the mood line
  const linePath = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const stepX = graphWidth / 6;

    last7Days.forEach((day, i) => {
      if (day.entry) {
        const x = padding.left + i * stepX;
        const y = padding.top + graphHeight - ((day.entry.mood - 1) / 4) * graphHeight;
        points.push({ x, y });
      }
    });

    if (points.length < 2) return '';

    // Create smooth curve
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    return path;
  }, [last7Days, graphWidth, graphHeight]);

  // Area fill path
  const areaPath = useMemo(() => {
    if (!linePath) return '';
    const points: { x: number; y: number }[] = [];
    const stepX = graphWidth / 6;

    last7Days.forEach((day, i) => {
      if (day.entry) {
        const x = padding.left + i * stepX;
        const y = padding.top + graphHeight - ((day.entry.mood - 1) / 4) * graphHeight;
        points.push({ x, y });
      }
    });

    if (points.length < 2) return '';

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = padding.top + graphHeight;

    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, last7Days, graphWidth, graphHeight]);

  const getMoodColor = (mood: number): string => {
    const colors: Record<number, string> = {
      1: '#f87171',
      2: '#fb923c',
      3: '#fbbf24',
      4: '#84cc16',
      5: '#34d399',
    };
    return colors[mood] || colors[3];
  };

  const getMoodLabel = (mood: number): string => {
    const labels: Record<number, string> = {
      1: 'Difficult',
      2: 'Challenging',
      3: 'Okay',
      4: 'Good',
      5: 'Great',
    };
    return labels[mood] || 'Okay';
  };

  const handleMouseEnter = (day: typeof last7Days[0], index: number, x: number, y: number) => {
    setHoveredIndex(index);
    setTooltip({ x, y, day });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltip(null);
  };

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  return (
    <div className="relative">
      {/* Header with title and stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-medium text-silver-700 dark:text-silver-200">
            Your Week
          </h4>
          <p className="text-xs text-silver-400 dark:text-silver-500 mt-0.5">
            {stats.daysLogged} of 7 days logged
          </p>
        </div>
        {stats.daysLogged > 0 && (
          <div className="flex items-center gap-3">
            {/* Trend indicator */}
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className="text-xs text-silver-500 dark:text-silver-400">
                {stats.trend === 'up' ? 'Improving' : stats.trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
            {/* Average badge */}
            <div className="px-2.5 py-1 rounded-lg bg-lavender-100/50 dark:bg-lavender-900/30">
              <span className="text-sm font-semibold text-lavender-600 dark:text-lavender-400">
                {stats.avg.toFixed(1)}
              </span>
              <span className="text-xs text-lavender-500 dark:text-lavender-400 ml-0.5">avg</span>
            </div>
          </div>
        )}
      </div>

      {/* Graph */}
      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Gradient definition */}
          <defs>
            <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(167, 139, 250)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(167, 139, 250)" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background grid */}
          {[1, 2, 3, 4, 5].map(level => {
            const y = padding.top + graphHeight - ((level - 1) / 4) * graphHeight;
            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-silver-400 dark:fill-silver-500 text-[10px]"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#moodGradient)"
              className="transition-opacity duration-300"
            />
          )}

          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="rgb(167, 139, 250)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-all duration-300"
            />
          )}

          {/* Data points and interactive areas */}
          {last7Days.map((day, i) => {
            const stepX = graphWidth / 6;
            const x = padding.left + i * stepX;
            const labelY = height - 8;
            const isHovered = hoveredIndex === i;
            const isToday = i === 6;

            return (
              <g key={i}>
                {/* Vertical hover zone */}
                <rect
                  x={x - stepX / 2}
                  y={padding.top}
                  width={stepX}
                  height={graphHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    const y = day.entry
                      ? padding.top + graphHeight - ((day.entry.mood - 1) / 4) * graphHeight
                      : padding.top + graphHeight / 2;
                    handleMouseEnter(day, i, x, y);
                  }}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Hover highlight line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + graphHeight}
                    stroke="rgb(167, 139, 250)"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                )}

                {/* Day label */}
                <text
                  x={x}
                  y={labelY}
                  textAnchor="middle"
                  className={`text-[10px] transition-all duration-200
                             ${isHovered
                               ? 'fill-lavender-600 dark:fill-lavender-400 font-medium'
                               : isToday
                                 ? 'fill-lavender-500 dark:fill-lavender-400 font-medium'
                                 : 'fill-silver-400 dark:fill-silver-500'
                             }`}
                >
                  {day.label}
                </text>

                {/* Today indicator dot */}
                {isToday && (
                  <circle
                    cx={x}
                    cy={labelY + 6}
                    r="2"
                    fill="rgb(167, 139, 250)"
                  />
                )}

                {/* Data point */}
                {day.entry && (
                  <circle
                    cx={x}
                    cy={padding.top + graphHeight - ((day.entry.mood - 1) / 4) * graphHeight}
                    r={isHovered ? 8 : 6}
                    fill={getMoodColor(day.entry.mood)}
                    stroke="white"
                    strokeWidth={isHovered ? 3 : 2}
                    className="drop-shadow-md transition-all duration-200 cursor-pointer"
                    filter={isHovered ? 'url(#glow)' : undefined}
                  />
                )}

                {/* Empty day indicator */}
                {!day.entry && (
                  <circle
                    cx={x}
                    cy={padding.top + graphHeight / 2}
                    r={isHovered ? 4 : 2.5}
                    fill="currentColor"
                    fillOpacity={isHovered ? 0.3 : 0.15}
                    className="transition-all duration-200"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 pointer-events-none animate-fade-in"
            style={{
              left: `${(tooltip.x / width) * 100}%`,
              top: `${Math.max(0, ((tooltip.y - 20) / height) * 100 - 30)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-white dark:bg-silver-800 rounded-xl shadow-xl border border-silver-200 dark:border-silver-700
                          px-3 py-2 min-w-[140px]">
              <p className="text-xs text-silver-500 dark:text-silver-400 mb-1">
                {tooltip.day.fullLabel}
              </p>
              {tooltip.day.entry ? (
                <>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: getMoodColor(tooltip.day.entry.mood) }}
                    >
                      {tooltip.day.entry.mood}
                    </div>
                    <span className="text-sm font-medium text-silver-700 dark:text-silver-200">
                      {getMoodLabel(tooltip.day.entry.mood)}
                    </span>
                  </div>
                  {tooltip.day.entry.emotions.length > 0 && (
                    <p className="text-xs text-silver-400 dark:text-silver-500 mt-1.5 truncate">
                      {tooltip.day.entry.emotions.slice(0, 3).join(', ')}
                      {tooltip.day.entry.emotions.length > 3 && '...'}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-silver-400 dark:text-silver-500 italic">
                  No entry
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick stats row */}
      {stats.daysLogged >= 2 && (
        <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-silver-100 dark:border-silver-800">
          <div className="text-center">
            <p className="text-xs text-silver-400 dark:text-silver-500">Highest</p>
            <p className="text-sm font-semibold" style={{ color: getMoodColor(stats.high) }}>
              {getMoodLabel(stats.high)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-silver-400 dark:text-silver-500">Lowest</p>
            <p className="text-sm font-semibold" style={{ color: getMoodColor(stats.low) }}>
              {getMoodLabel(stats.low)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-silver-400 dark:text-silver-500">Range</p>
            <p className="text-sm font-semibold text-silver-600 dark:text-silver-300">
              {stats.high - stats.low} pts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
