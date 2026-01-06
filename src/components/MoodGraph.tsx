import { useMemo } from 'react';
import type { DayEntry } from '../types';

interface MoodGraphProps {
  entries: DayEntry[];
}

export function MoodGraph({ entries }: MoodGraphProps) {
  const last7Days = useMemo(() => {
    const days: { date: Date; label: string; entry: DayEntry | null }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const entry = entries.find(e => e.date === dateStr) || null;

      // Get day label (Mon, Tue, etc)
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });

      days.push({ date, label, entry });
    }

    return days;
  }, [entries]);

  // Calculate average mood
  const averageMood = useMemo(() => {
    const moods = last7Days.filter(d => d.entry).map(d => d.entry!.mood);
    if (moods.length === 0) return 0;
    return moods.reduce((a, b) => a + b, 0) / moods.length;
  }, [last7Days]);

  // SVG dimensions
  const width = 280;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 25, left: 25 };
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

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-silver-700 dark:text-silver-200">
          Your week
        </h4>
        {averageMood > 0 && (
          <span className="text-xs text-silver-500 dark:text-silver-400">
            Avg: {averageMood.toFixed(1)}/5
          </span>
        )}
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Gradient definition */}
        <defs>
          <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(167, 139, 250)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(167, 139, 250)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal guide lines */}
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
                strokeOpacity="0.1"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-silver-400 dark:fill-silver-500 text-[8px]"
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
          />
        )}

        {/* Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="rgb(167, 139, 250)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {last7Days.map((day, i) => {
          const stepX = graphWidth / 6;
          const x = padding.left + i * stepX;
          const labelY = height - 5;

          return (
            <g key={i}>
              {/* Day label */}
              <text
                x={x}
                y={labelY}
                textAnchor="middle"
                className="fill-silver-400 dark:fill-silver-500 text-[9px]"
              >
                {day.label}
              </text>

              {/* Data point */}
              {day.entry && (
                <circle
                  cx={x}
                  cy={padding.top + graphHeight - ((day.entry.mood - 1) / 4) * graphHeight}
                  r="5"
                  fill={getMoodColor(day.entry.mood)}
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
              )}

              {/* Empty day indicator */}
              {!day.entry && (
                <circle
                  cx={x}
                  cy={padding.top + graphHeight / 2}
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.2"
                  strokeWidth="1"
                  strokeDasharray="2,1"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
