import React from 'react';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import { CassetteReel } from './CassetteReel';
import { CassetteLabel } from './CassetteLabel';
import { JCardConfig, TransportState } from '../types';

interface CassetteProps {
  config: JCardConfig;
  transport: TransportState;
  tapeLabel: string;
  onLabelClick?: () => void;
  onSwipeFlip?: () => void;
}

// Spring config for natural tape flip feel
const flipSpring = {
  type: "spring" as const,
  stiffness: 120,
  damping: 20,
};

// Realistic Screw Component
const Screw = ({ className, rotation = 45 }: { className?: string, rotation?: number }) => (
  <div className={`w-3 h-3 rounded-full bg-zinc-300 border border-zinc-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.8)] flex items-center justify-center ${className}`}>
    <div className="relative w-full h-full opacity-70" style={{ transform: `rotate(${rotation}deg)` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-zinc-500 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-zinc-500 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] rotate-90" />
    </div>
  </div>
);

export const Cassette: React.FC<CassetteProps> = ({
  config,
  transport,
  tapeLabel,
  onLabelClick,
  onSwipeFlip,
}) => {
  const controls = useAnimation();
  const x = useMotionValue(0);

  // Calculate current progress
  const currentProgress = transport.currentSide === 'A'
    ? transport.sideAProgress
    : transport.sideBProgress;

  const isPlaying = transport.mode === 'playing';

  // Flip animation variants
  const flipVariants = {
    sideA: { rotateY: 0 },
    sideB: { rotateY: 180 },
  };

  // Handle swipe gesture for flip
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold && onSwipeFlip) {
      onSwipeFlip();
    }
    // Reset position
    controls.start({ x: 0 });
  };

  const renderSide = (side: 'A' | 'B') => (
    <div
      className="absolute inset-0 flex flex-col bg-[#e8e8e5]"
      style={{
        backfaceVisibility: 'hidden',
        transform: side === 'B' ? 'rotateY(180deg)' : 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`
      }}
    >
      {/* Texture overlay for realism */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none" />

      {/* Screws */}
      <div className="absolute top-2 left-2 z-20"><Screw rotation={15} /></div>
      <div className="absolute top-2 right-2 z-20"><Screw rotation={-45} /></div>
      <div className="absolute bottom-2 left-2 z-20"><Screw rotation={60} /></div>
      <div className="absolute bottom-2 right-2 z-20"><Screw rotation={-10} /></div>
      {/* Center screw */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 z-20"><Screw rotation={90} /></div>

      {/* Top label area - THE J-CARD LIVES HERE */}
      <div
        className="relative h-[35%] mx-5 mt-4 rounded-sm overflow-hidden cursor-pointer shadow-sm transition-transform hover:scale-[1.01] z-10"
        onClick={onLabelClick}
      >
        <CassetteLabel
          config={config}
          side={side}
          tapeLabel={tapeLabel}
        />
        {/* Edit hint on hover */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <span className="text-xs font-mono text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
            TAP TO EDIT
          </span>
        </div>
      </div>

      {/* The Window Area */}
      <div className="flex-1 relative mx-4 mb-3 mt-1 px-2 pt-2 pb-1">

        {/* Trapezoid window cutout shape using clip-path or simple borders */}
        <div className="relative h-full bg-gray-900 rounded-lg border-[3px] border-zinc-300 shadow-inner overflow-hidden">

            {/* Dark tape bay background with depth */}
            <div className="absolute inset-0 bg-[#1a1a1a]"
                 style={{
                     boxShadow: 'inset 0 0 20px black'
                 }}
            />

            {/* Reel container */}
            <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
              {/* Left Reel (Supply) */}
              <div className="relative">
                <CassetteReel
                  side="supply"
                  isPlaying={isPlaying}
                  completionPercentage={currentProgress}
                  transportMode={transport.mode}
                />
              </div>

              {/* Tape path visual - the magnetic tape running between reels */}
              <div className="absolute inset-x-0 top-[52%] -translate-y-1/2 h-8 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[3px] bg-[#3a2e26] mx-20 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
              </div>

              {/* Right Reel (Takeup) */}
              <div className="relative">
                <CassetteReel
                  side="takeup"
                  isPlaying={isPlaying}
                  completionPercentage={currentProgress}
                  transportMode={transport.mode}
                />
              </div>
            </div>

            {/* Window Glass Reflection */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-40" />

            {/* Pressure Pad Visual */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#4a3b2a] rounded-t-sm shadow-[0_-1px_2px_rgba(0,0,0,0.5)] z-0" />

            {/* Guide Rollers */}
            <div className="absolute bottom-2 left-6 w-2 h-2 rounded-full bg-zinc-200 shadow-sm z-0" />
            <div className="absolute bottom-2 right-6 w-2 h-2 rounded-full bg-zinc-200 shadow-sm z-0" />

            {/* Window frame text */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[6px] font-mono text-zinc-500 font-bold tracking-widest pointer-events-none z-10">
              <span>NR-[Yes]</span>
              <span className="text-zinc-600">IEC I / TYPE I</span>
            </div>
        </div>
      </div>

      {/* Bottom shell detail - Write protect tabs */}
      <div className="absolute bottom-0 left-0 right-0 h-3 flex justify-between px-6">
         <div className="w-3 h-2 bg-[#1a1a1a] opacity-30 rounded-sm" /> {/* Tab hole */}
         <div className="w-3 h-2 bg-[#1a1a1a] opacity-30 rounded-sm" />
      </div>

      {/* Side Label */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black text-zinc-400 tracking-widest">
         {side}
      </div>
    </div>
  );

  return (
    <div
      className="relative w-full aspect-[1.6] perspective-1000"
      style={{ perspective: '1200px' }}
    >
      {/* The cassette shell with flip animation */}
      <motion.div
        className="absolute inset-0 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
        style={{
          transformStyle: 'preserve-3d',
          x
        }}
        variants={flipVariants}
        animate={transport.currentSide === 'A' ? 'sideA' : 'sideB'}
        transition={flipSpring}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {renderSide('A')}
        {renderSide('B')}
      </motion.div>

      {/* Swipe hint */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-500/50 flex items-center gap-2 select-none">
        <span>&larr; swipe to flip &rarr;</span>
      </div>
    </div>
  );
};
