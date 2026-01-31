import React, { useRef } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import { TransportMode } from '../types';

interface ReelProps {
  isPlaying: boolean;
  /** 0 to 1 (0% played to 100% played) */
  completionPercentage: number;
  /** 'supply' is the Left reel, 'takeup' is the Right reel */
  side: 'supply' | 'takeup';
  /** Transport mode for speed/direction control */
  transportMode?: TransportMode;
}

export const CassetteReel: React.FC<ReelProps> = ({ isPlaying, completionPercentage, side, transportMode = 'stopped' }) => {
  // --- PHYSICS CONSTANTS ---
  const HUB_RADIUS_PX = 24; // Visual size of the white plastic hub
  const MAX_TAPE_THICKNESS_PX = 45; // Max visual thickness of tape pack
  const BASE_ANGULAR_VELOCITY = 60; // Base speed factor

  // --- STATE & REFS ---
  const reelRef = useRef<HTMLDivElement>(null);
  // We track rotation in a ref to persist across renders without causing re-renders
  const rotation = useRef(0);

  // --- CALCULATE RADIUS ---
  // If 'supply' (Left), it starts full (1.0) and empties to 0.0 based on completion
  // If 'takeup' (Right), it starts empty (0.0) and fills to 1.0
  const fullness = side === 'supply' ? (1 - completionPercentage) : completionPercentage;
  
  // The visual radius of the dark tape pack
  const tapeThickness = MAX_TAPE_THICKNESS_PX * fullness;
  const currentRadius = HUB_RADIUS_PX + tapeThickness;

  // --- ANIMATION LOOP ---
  // This runs on every frame (approx 60fps or higher)
  useAnimationFrame((time, delta) => {
    if (!reelRef.current) return;

    // Determine speed multiplier and direction based on transport mode
    let speedMultiplier = 0;
    let direction = 1;

    switch (transportMode) {
      case 'playing':
        speedMultiplier = 1;
        break;
      case 'rewinding':
        speedMultiplier = 5; // 5x speed for rewind
        direction = -1; // Spin backwards
        break;
      case 'fast_forwarding':
        speedMultiplier = 5; // 5x speed for fast forward
        break;
      case 'paused':
      case 'stopped':
      default:
        speedMultiplier = 0;
    }

    // Don't animate if stopped/paused
    if (speedMultiplier === 0) return;

    // PHYSICS FORMULA: omega = v / r
    // As radius gets smaller, speed gets faster.
    // We add a safety clamp to currentRadius to prevent division by zero or infinite speed visually
    const safeRadius = Math.max(currentRadius, 10);

    // Calculate rotation step for this frame
    // Speed factor is arbitrary to look good visually
    const speed = BASE_ANGULAR_VELOCITY / (safeRadius / 40) * speedMultiplier * direction;

    // Apply rotation
    // delta is time since last frame in ms. We divide by 1000 to get seconds.
    rotation.current += speed * (delta / 16);

    reelRef.current.style.transform = `rotate(${rotation.current}deg)`;
  });

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      {/* 1. The Tape Pack (Dark Magnetic Tape) */}
      {/* We use a hard transition style to make the size change performant, or let React handle it naturally. */}
      <div 
        className="absolute rounded-full bg-tape-brown shadow-sm transition-all duration-75 ease-linear"
        style={{
          width: `${currentRadius * 2}px`,
          height: `${currentRadius * 2}px`,
          // Add a subtle gradient to show the layers of tape
          backgroundImage: `repeating-radial-gradient(
            rgba(255,255,255,0.03) 0px, 
            rgba(255,255,255,0.03) 1px, 
            transparent 1px, 
            transparent 2px
          )`
        }}
      />

      {/* 2. The Plastic Hub (Spinning Part) */}
      <div 
        ref={reelRef}
        className="relative z-10 w-[48px] h-[48px] rounded-full bg-tape-plastic shadow-md flex items-center justify-center overflow-hidden"
      >
        {/* Hub Detail: The Spokes */}
        <svg viewBox="0 0 60 60" className="w-full h-full text-white">
           <circle cx="30" cy="30" r="28" stroke="#d4d4d4" strokeWidth="2" fill="transparent" />
           {/* The Reel Teeth */}
           <g fill="#d4d4d4">
             <rect x="27" y="4" width="6" height="12" rx="1" />
             <rect x="27" y="44" width="6" height="12" rx="1" />
             <rect x="4" y="27" width="12" height="6" rx="1" />
             <rect x="44" y="27" width="12" height="6" rx="1" />
           </g>
           {/* Center Pin Hole */}
           <circle cx="30" cy="30" r="8" fill="#1a1a1a" />
        </svg>
      </div>
    </div>
  );
};