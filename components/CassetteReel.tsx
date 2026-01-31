import React, { useRef } from 'react';
import { useAnimationFrame } from 'framer-motion';
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

export const CassetteReel: React.FC<ReelProps> = ({ completionPercentage, side, transportMode = 'stopped' }) => {
  // --- PHYSICS CONSTANTS ---
  const HUB_RADIUS_PX = 24; // Visual size of the white plastic hub
  const MAX_TAPE_THICKNESS_PX = 48; // Max visual thickness of tape pack
  const BASE_ANGULAR_VELOCITY = 60; // Base speed factor

  // --- STATE & REFS ---
  const reelRef = useRef<HTMLDivElement>(null);
  // We track rotation in a ref to persist across renders without causing re-renders
  const rotation = useRef(0);
  const wobbleX = useRef(0);
  const wobbleY = useRef(0);

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

    // Even when stopped, apply a tiny amount of wobble if we were moving recently or just to simulate looseness?
    // Nah, just when moving.
    if (speedMultiplier !== 0) {
      // PHYSICS FORMULA: omega = v / r
      // As radius gets smaller, speed gets faster.
      const safeRadius = Math.max(currentRadius, 12);

      // FLUTTER: Add random micro-variations to speed (0.98 - 1.02)
      const flutter = 1 + (Math.random() * 0.04 - 0.02);

      // WOW: Slow oscillation for wobble
      const wowFrequency = 0.005;
      const wowAmplitude = 0.5; // pixels
      wobbleX.current = Math.sin(time * wowFrequency) * wowAmplitude;
      wobbleY.current = Math.cos(time * wowFrequency * 1.3) * wowAmplitude;

      // Calculate rotation step for this frame
      const speed = (BASE_ANGULAR_VELOCITY / (safeRadius / 40)) * speedMultiplier * direction * flutter;

      // Apply rotation
      rotation.current += speed * (delta / 16);

      // Apply transform with wobble
      reelRef.current.style.transform = `
        rotate(${rotation.current}deg)
        translate(${wobbleX.current}px, ${wobbleY.current}px)
      `;
    } else {
      // Maintain rotation when stopped
      reelRef.current.style.transform = `rotate(${rotation.current}deg)`;
    }
  });

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      {/* 1. The Tape Pack (Dark Magnetic Tape) */}
      <div 
        className="absolute rounded-full transition-all duration-75 ease-linear shadow-lg"
        style={{
          width: `${currentRadius * 2}px`,
          height: `${currentRadius * 2}px`,
          backgroundColor: '#2c241b', // Deep magnetic brown
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8), 0 2px 5px rgba(0,0,0,0.3)',
        }}
      >
         {/* Tape windings texture - improved realism */}
         <div className="absolute inset-0 rounded-full opacity-40"
          style={{
             backgroundImage: `repeating-radial-gradient(
              transparent 0px,
              transparent 1px,
              rgba(255,255,255,0.08) 1px,
              rgba(255,255,255,0.08) 2px
            )`
          }}
        />
        {/* Specular highlight on the tape pack */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50 pointer-events-none" />
      </div>

      {/* 2. The Plastic Hub (Spinning Part) */}
      <div 
        ref={reelRef}
        className="relative z-10 w-[48px] h-[48px] rounded-full bg-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden border border-gray-300"
      >
        {/* Hub Detail: The Spokes */}
        <svg viewBox="0 0 60 60" className="w-full h-full">
           <defs>
             <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#f8f8f8" />
               <stop offset="100%" stopColor="#d0d0d0" />
             </linearGradient>
           </defs>
           <circle cx="30" cy="30" r="30" fill="url(#hubGradient)" />

           {/* The Reel Teeth */}
           <g fill="#d4d4d4" stroke="#bfbfbf" strokeWidth="0.5">
             <path d="M25 4 h10 v12 h-10 z" rx="1" />
             <path d="M25 44 h10 v12 h-10 z" rx="1" />
             <path d="M4 25 h12 v10 h-12 z" rx="1" />
             <path d="M44 25 h12 v10 h-12 z" rx="1" />

             {/* Diagonal teeth holes */}
             <circle cx="15" cy="15" r="4" fill="#ccc" />
             <circle cx="45" cy="15" r="4" fill="#ccc" />
             <circle cx="15" cy="45" r="4" fill="#ccc" />
             <circle cx="45" cy="45" r="4" fill="#ccc" />
           </g>

           {/* Inner ring */}
           <circle cx="30" cy="30" r="18" fill="none" stroke="#ccc" strokeWidth="1" />

           {/* Center Pin Hole (Spindle) */}
           <circle cx="30" cy="30" r="7" fill="#1a1a1a" opacity="0.9">
             <animate attributeName="opacity" values="0.9;0.95;0.9" dur="3s" repeatCount="indefinite" />
           </circle>
           {/* Metal spindle clip */}
           <path d="M28 28 L32 28 L32 32 L28 32 Z" fill="#666" transform="rotate(45 30 30)" />
        </svg>
      </div>
    </div>
  );
};
