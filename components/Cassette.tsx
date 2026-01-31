import React from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { CassetteReel } from './CassetteReel';
import { CassetteLabel } from './CassetteLabel';
import { JCardConfig, TransportState, TapeSide } from '../types';

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

  return (
    <div
      className="relative w-full aspect-[1.6] perspective-1000"
      style={{ perspective: '1200px' }}
    >
      {/* The cassette shell with flip animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-amber-50 to-amber-100 rounded-xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing"
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
        {/* === SIDE A (Front) === */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Top label area - THE J-CARD LIVES HERE */}
          <div
            className="relative h-[35%] mx-3 mt-3 rounded-t-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
            onClick={onLabelClick}
          >
            <CassetteLabel
              config={config}
              side="A"
              tapeLabel={tapeLabel}
            />
            {/* Edit hint on hover */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-xs font-mono text-white/80 bg-black/40 px-2 py-1 rounded">
                TAP TO EDIT
              </span>
            </div>
          </div>

          {/* The Window - Where the reels spin */}
          <div className="flex-1 relative mx-3 mb-3 bg-gray-900/90 rounded-lg border border-gray-700/30 shadow-inner overflow-hidden">
            {/* Dark tape bay background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />

            {/* Reel container */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              {/* Left Reel (Supply) */}
              <div className="relative z-10">
                <CassetteReel
                  side="supply"
                  isPlaying={isPlaying}
                  completionPercentage={currentProgress}
                  transportMode={transport.mode}
                />
              </div>

              {/* Tape path visual - the magnetic tape running between reels */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 flex items-center justify-center pointer-events-none">
                <div className="w-full h-1 bg-tape-brown/60 mx-16" />
              </div>

              {/* Right Reel (Takeup) */}
              <div className="relative z-10">
                <CassetteReel
                  side="takeup"
                  isPlaying={isPlaying}
                  completionPercentage={currentProgress}
                  transportMode={transport.mode}
                />
              </div>
            </div>

            {/* Window frame details */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[8px] font-mono text-gray-600">
              <span>LOW NOISE</span>
              <span className="text-orange-500/80">HIGH OUTPUT</span>
            </div>
          </div>

          {/* Bottom shell detail */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4 text-[8px] font-mono text-gray-400/50">
            <span>A</span>
            <span>{tapeLabel}</span>
          </div>
        </div>

        {/* === SIDE B (Back) - Mirrored === */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Top label area - Side B label */}
          <div
            className="relative h-[35%] mx-3 mt-3 rounded-t-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
            onClick={onLabelClick}
          >
            <CassetteLabel
              config={config}
              side="B"
              tapeLabel={tapeLabel}
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-xs font-mono text-white/80 bg-black/40 px-2 py-1 rounded">
                TAP TO EDIT
              </span>
            </div>
          </div>

          {/* The Window */}
          <div className="flex-1 relative mx-3 mb-3 bg-gray-900/90 rounded-lg border border-gray-700/30 shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />

            <div className="absolute inset-0 flex items-center justify-between px-4">
              <div className="relative z-10">
                <CassetteReel
                  side="supply"
                  isPlaying={isPlaying}
                  completionPercentage={currentProgress}
                  transportMode={transport.mode}
                />
              </div>

              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 flex items-center justify-center pointer-events-none">
                <div className="w-full h-1 bg-tape-brown/60 mx-16" />
              </div>

              <div className="relative z-10">
                <CassetteReel
                  side="takeup"
                  isPlaying={isPlaying}
                  completionPercentage={currentProgress}
                  transportMode={transport.mode}
                />
              </div>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[8px] font-mono text-gray-600">
              <span>LOW NOISE</span>
              <span className="text-orange-500/80">HIGH OUTPUT</span>
            </div>
          </div>

          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4 text-[8px] font-mono text-gray-400/50">
            <span>B</span>
            <span>{tapeLabel}</span>
          </div>
        </div>
      </motion.div>

      {/* Swipe hint - subtle gesture affordance */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-600 flex items-center gap-2">
        <span className="opacity-50">&larr;</span>
        <span>swipe to flip</span>
        <span className="opacity-50">&rarr;</span>
      </div>
    </div>
  );
};
