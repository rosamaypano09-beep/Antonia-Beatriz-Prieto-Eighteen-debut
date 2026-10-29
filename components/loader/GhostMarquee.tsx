import React from 'react';
import './ghost-marquee.css';

interface GhostMarqueeProps {
  /** Line repeated down both edges, e.g. "Bea  ·  Antonia Beatriz Prieto  ·  Eighteen" */
  text: string;
  /** Placement for this screen (position, z-index, fade-in) */
  className?: string;
  /** Font for the lettering (a next/font className) */
  fontClassName?: string;
  /** Hold the columns still (reduced motion) */
  still?: boolean;
  /**
   * Copies of the line per column (even number). 2 covers a screen; tall page sections
   * need more so the loop never runs out. The timing stretches to keep the same speed.
   */
  repeat?: number;
}

// Seconds to drift one copy of the line (left / right columns move at slightly different speeds)
const SECONDS_PER_COPY = { left: 46, right: 52 } as const;

/**
 * Ghost lettering drifting along both screen edges: left reads upward and moves down,
 * right moves up. Each track holds the line `repeat` times so a -50% shift loops seamlessly.
 */
export function GhostMarquee({ text, className = '', fontClassName = '', still = false, repeat = 2 }: GhostMarqueeProps) {
  if (!text) return null;
  const copies = Math.max(2, repeat + (repeat % 2));
  return (
    <div className={`ghost-marquee ${className}${still ? ' is-still' : ''}`} aria-hidden="true">
      {(['left', 'right'] as const).map((side) => (
        <div key={side} className={`ghost-marquee__col ghost-marquee__col--${side}`}>
          <div
            className={`ghost-marquee__track ${fontClassName}`}
            style={copies > 2 ? { animationDuration: `${(SECONDS_PER_COPY[side] * copies) / 2}s` } : undefined}
          >
            {Array.from({ length: copies }, (_, i) => (
              <span key={i}>{text}  ·  </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
