import React from 'react';
import { motion } from 'framer-motion';
import { Cassette } from './Cassette';
import { EmbeddedTransport } from './EmbeddedTransport';
import { JCardConfig, TransportState, TransportMode } from '../types';

interface UnifiedDeckProps {
  config: JCardConfig;
  transport: TransportState;
  tapeLabel: string;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewindStart: () => void;
  onRewindEnd: () => void;
  onFastForwardStart: () => void;
  onFastForwardEnd: () => void;
  onFlip: () => void;
  onOpenEditor: () => void;
  canFlip: boolean;
}

export const UnifiedDeck: React.FC<UnifiedDeckProps> = ({
  config,
  transport,
  tapeLabel,
  onPlay,
  onPause,
  onStop,
  onRewindStart,
  onRewindEnd,
  onFastForwardStart,
  onFastForwardEnd,
  onFlip,
  onOpenEditor,
  canFlip,
}) => {
  const currentProgress = transport.currentSide === 'A'
    ? transport.sideAProgress
    : transport.sideBProgress;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* The Deck - Brushed metal aesthetic */}
      <div className="relative bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl overflow-hidden">

        {/* Brushed metal texture overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(255,255,255,0.03) 1px,
              rgba(255,255,255,0.03) 2px
            )`
          }}
        />

        {/* Deck label / brand area */}
        <div className="relative flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">
              {transport.mode === 'playing' ? 'Playing' :
               transport.mode === 'rewinding' ? 'Rewinding' :
               transport.mode === 'fast_forwarding' ? 'Fast Forward' :
               transport.mode === 'paused' ? 'Paused' : 'Ready'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-500 tracking-widest">
            SIDE {transport.currentSide}
          </span>
        </div>

        {/* The Cassette Bay - where the magic happens */}
        <div className="relative bg-gray-900/80 rounded-2xl p-4 border border-gray-700/50 shadow-inner">
          <Cassette
            config={config}
            transport={transport}
            tapeLabel={tapeLabel}
            onLabelClick={onOpenEditor}
          />
        </div>

        {/* Embedded Transport Controls */}
        <div className="mt-4">
          <EmbeddedTransport
            transport={transport}
            onPlay={onPlay}
            onPause={onPause}
            onStop={onStop}
            onRewindStart={onRewindStart}
            onRewindEnd={onRewindEnd}
            onFastForwardStart={onFastForwardStart}
            onFastForwardEnd={onFastForwardEnd}
            onFlip={onFlip}
            canFlip={canFlip}
          />
        </div>

        {/* Subtle deck screws */}
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gray-600 shadow-inner flex items-center justify-center">
          <div className="w-1 h-px bg-gray-800 rotate-45" />
        </div>
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gray-600 shadow-inner flex items-center justify-center">
          <div className="w-1 h-px bg-gray-800 -rotate-12" />
        </div>
        <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-gray-600 shadow-inner flex items-center justify-center">
          <div className="w-1 h-px bg-gray-800 rotate-90" />
        </div>
        <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gray-600 shadow-inner flex items-center justify-center">
          <div className="w-1 h-px bg-gray-800 rotate-12" />
        </div>
      </div>
    </div>
  );
};
