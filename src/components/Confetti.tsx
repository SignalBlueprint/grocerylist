'use client';

import { useEffect, useState, useCallback } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const COLORS = [
  '#22c55e', // green-500
  '#16a34a', // green-600
  '#4ade80', // green-400
  '#86efac', // green-300
  '#fbbf24', // amber-400
  '#f97316', // orange-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
];

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const generatePieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 500,
        duration: 2000 + Math.random() * 1000,
        rotation: Math.random() * 360,
      });
    }
    return newPieces;
  }, []);

  useEffect(() => {
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPieces(generatePieces());
      setIsVisible(true);

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(hideTimer);
    }
  }, [active, duration, generatePieces]);

  if (!isVisible || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
          }}
        >
          <div
            className="w-3 h-3 animate-confetti-spin"
            style={{
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
