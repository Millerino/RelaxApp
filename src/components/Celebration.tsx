import { useEffect, useState } from 'react';

interface CelebrationProps {
  onComplete?: () => void;
  duration?: number;
}

// Generate random confetti pieces
function generateConfetti(count: number) {
  const colors = [
    '#a78bfa', // lavender-400
    '#c4b5fd', // lavender-300
    '#8b5cf6', // lavender-500
    '#fcd34d', // amber-300
    '#34d399', // emerald-400
    '#f472b6', // pink-400
    '#60a5fa', // blue-400
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    duration: 2 + Math.random() * 1.5,
  }));
}

export function Celebration({ onComplete, duration = 2500 }: CelebrationProps) {
  const [confetti] = useState(() => generateConfetti(50));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Confetti pieces */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}

      {/* Central celebration burst */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-celebration-burst">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-lavender-400/30 to-lavender-600/10 blur-xl" />
        </div>
      </div>
    </div>
  );
}
