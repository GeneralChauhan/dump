import React from 'react';

interface CursorProps {
  x: number;
  y: number;
  color: string;
  size: number;
  isPinching: boolean;
  isVisible: boolean;
}

export const Cursor: React.FC<CursorProps> = ({
  x,
  y,
  color,
  size,
  isPinching,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-40 rounded-full transition-opacity duration-100"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundColor: color,
        opacity: isPinching ? 1 : 0.6,
        boxShadow: isPinching 
          ? `0 0 0 2px rgba(0, 0, 0, 0.3)` 
          : `0 0 0 2px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)`,
        transform: isPinching ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
      }}
    />
  );
};