import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TransportState } from '../types';

interface EmbeddedTransportProps {
  transport: TransportState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewindStart: () => void;
  onRewindEnd: () => void;
  onFastForwardStart: () => void;
  onFastForwardEnd: () => void;
  onFlip: () => void;
  canFlip: boolean;
}

// Transport button with satisfying mechanical feel
const buttonSpring = { type: "spring" as const, stiffness: 500, damping: 30 };

interface TransportBtnProps {
  children: React.ReactNode;
  isActive?: boolean;
  isHeld?: boolean;
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'play' | 'flip';
  label: string;
}

const TransportBtn: React.FC<TransportBtnProps> = ({
  children,
  isActive,
  isHeld,
  onClick,
  onPointerDown,
  onPointerUp,
  disabled,
  variant = 'default',
  label,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressed(true);
    onPointerDown?.();
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    onPointerUp?.();
  };

  const handlePointerLeave = () => {
    if (isPressed) {
      setIsPressed(false);
      onPointerUp?.();
    }
  };

  const handleClick = () => {
    if (!onPointerDown && onClick) {
      onClick();
    }
  };

  // Base styles
  const baseClasses = "relative w-10 h-10 rounded-lg flex items-center justify-center select-none touch-none transition-colors";

  // Variant-specific styles
  const variantClasses = {
    default: disabled
      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
      : isActive || isHeld
        ? "bg-gray-500 text-white"
        : "bg-gray-600 text-gray-300 hover:bg-gray-500",
    play: isActive
      ? "bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
      : "bg-gray-600 text-gray-300 hover:bg-orange-500/80 hover:text-white",
    flip: disabled
      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
      : "bg-amber-500/80 text-gray-900 hover:bg-amber-400",
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]}`}
      style={{
        boxShadow: (isPressed || isHeld) && !disabled
          ? "inset 0 2px 4px rgba(0,0,0,0.3)"
          : "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
      }}
      animate={{ y: (isPressed || isHeld) && !disabled ? 2 : 0 }}
      transition={buttonSpring}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
      {/* Active LED indicator */}
      {isActive && variant !== 'flip' && (
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
      )}
    </motion.button>
  );
};

// SVG icons - clean, minimal
const PlayIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" />
  </svg>
);

const RewindIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
  </svg>
);

const FFIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
  </svg>
);

const FlipIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 6V3L8 7l4 4V8c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 17.03 20 15.57 20 14c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 9.74C4.46 10.97 4 12.43 4 14c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
);

export const EmbeddedTransport: React.FC<EmbeddedTransportProps> = ({
  transport,
  onPlay,
  onPause,
  onStop,
  onRewindStart,
  onRewindEnd,
  onFastForwardStart,
  onFastForwardEnd,
  onFlip,
  canFlip,
}) => {
  const isPlaying = transport.mode === 'playing';
  const isPaused = transport.mode === 'paused';
  const isStopped = transport.mode === 'stopped';
  const isRewinding = transport.mode === 'rewinding';
  const isFastForwarding = transport.mode === 'fast_forwarding';

  const currentProgress = transport.currentSide === 'A'
    ? transport.sideAProgress
    : transport.sideBProgress;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Progress bar - subtle, integrated */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
          style={{ width: `${currentProgress * 100}%` }}
          transition={{ type: "tween", duration: 0.1 }}
        />
      </div>

      {/* Transport buttons row */}
      <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-xl">
        {/* Rewind */}
        <TransportBtn
          label="Rewind (hold)"
          isHeld={isRewinding}
          onPointerDown={onRewindStart}
          onPointerUp={onRewindEnd}
        >
          <RewindIcon />
        </TransportBtn>

        {/* Stop */}
        <TransportBtn
          label="Stop"
          isActive={isStopped && currentProgress === 0}
          onClick={onStop}
        >
          <StopIcon />
        </TransportBtn>

        {/* Play/Pause - the hero button */}
        <TransportBtn
          label={isPlaying ? "Pause" : "Play"}
          isActive={isPlaying}
          onClick={isPlaying ? onPause : onPlay}
          variant="play"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </TransportBtn>

        {/* Fast Forward */}
        <TransportBtn
          label="Fast Forward (hold)"
          isHeld={isFastForwarding}
          onPointerDown={onFastForwardStart}
          onPointerUp={onFastForwardEnd}
        >
          <FFIcon />
        </TransportBtn>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Flip */}
        <TransportBtn
          label={`Flip to Side ${transport.currentSide === 'A' ? 'B' : 'A'}`}
          onClick={onFlip}
          disabled={!canFlip}
          variant="flip"
        >
          <FlipIcon />
        </TransportBtn>
      </div>

      {/* Side indicator - minimal */}
      <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500">
        <span className={transport.currentSide === 'A' ? 'text-orange-400' : ''}>
          A
        </span>
        <span className="text-gray-700">|</span>
        <span className={transport.currentSide === 'B' ? 'text-orange-400' : ''}>
          B
        </span>
      </div>
    </div>
  );
};
