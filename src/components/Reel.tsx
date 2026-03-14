import { useRef } from 'react';
import { useAnimationFrame } from 'framer-motion';
import type { TransportMode } from '../types/index';

interface ReelProps {
  /** 0 to 1 (0% played to 100% played) */
  progress: number;
  /** 'supply' is the Left reel, 'takeup' is the Right reel */
  side: 'supply' | 'takeup';
  /** Transport mode for speed/direction control */
  transportMode: TransportMode;
  /** Size multiplier (1 = default) */
  scale?: number;
}

export function Reel({ progress, side, transportMode, scale = 1 }: ReelProps) {
  // --- PHYSICS CONSTANTS ---
  const HUB_RADIUS = 12; // Visual size of the hub (scaled)
  const MAX_TAPE_THICKNESS = 22; // Max visual thickness of tape pack (scaled)
  const BASE_ANGULAR_VELOCITY = 60; // Base speed factor

  const reelRef = useRef<HTMLDivElement>(null);
  const rotation = useRef(0);

  // Calculate radius based on side and progress
  // Supply (left) starts full and empties
  // Takeup (right) starts empty and fills
  const fullness = side === 'supply' ? (1 - progress) : progress;
  const tapeThickness = MAX_TAPE_THICKNESS * fullness * scale;
  const currentRadius = (HUB_RADIUS * scale) + tapeThickness;
  const hubSize = HUB_RADIUS * 2 * scale;

  useAnimationFrame((_time, delta) => {
    if (!reelRef.current) return;

    // Determine speed and direction based on transport mode
    let speedMultiplier = 0;
    let direction = 1;

    switch (transportMode) {
      case 'playing':
        speedMultiplier = 1;
        break;
      case 'rewinding':
        speedMultiplier = 5;
        direction = -1;
        break;
      case 'fast_forwarding':
        speedMultiplier = 5;
        break;
      case 'paused':
      case 'stopped':
      default:
        speedMultiplier = 0;
    }

    if (speedMultiplier === 0) return;

    // PHYSICS: omega = v / r
    // As radius decreases, angular velocity increases
    const safeRadius = Math.max(currentRadius, 10);
    const speed = BASE_ANGULAR_VELOCITY / (safeRadius / 20) * speedMultiplier * direction;

    rotation.current += speed * (delta / 16);
    reelRef.current.style.transform = `rotate(${rotation.current}deg)`;
  });

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: currentRadius * 2, height: currentRadius * 2 }}
    >
      {/* Tape pack (magnetic tape) */}
      <div
        className="absolute rounded-full transition-all duration-75 ease-linear"
        style={{
          width: currentRadius * 2,
          height: currentRadius * 2,
          backgroundColor: '#1a1208',
          backgroundImage: `repeating-radial-gradient(
            rgba(255,255,255,0.02) 0px,
            rgba(255,255,255,0.02) 1px,
            transparent 1px,
            transparent 2px
          )`,
        }}
      />

      {/* Hub (spinning part) */}
      <div
        ref={reelRef}
        className="relative z-10 rounded-full flex items-center justify-center"
        style={{
          width: hubSize,
          height: hubSize,
          backgroundColor: '#f5f5f0',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {/* Hub spokes */}
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <circle cx="30" cy="30" r="27" stroke="#d4d4d4" strokeWidth="2" fill="transparent" />
          {/* Teeth */}
          <g fill="#d4d4d4">
            <rect x="27" y="6" width="6" height="10" rx="1" />
            <rect x="27" y="44" width="6" height="10" rx="1" />
            <rect x="6" y="27" width="10" height="6" rx="1" />
            <rect x="44" y="27" width="10" height="6" rx="1" />
          </g>
          {/* Center hole */}
          <circle cx="30" cy="30" r="6" fill="#1a1a1a" />
        </svg>
      </div>
    </div>
  );
}
