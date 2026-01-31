import React, { useEffect, useRef } from 'react';
import { Cassette } from './Cassette';
import { EmbeddedTransport } from './EmbeddedTransport';
import { JCardConfig, TransportState } from '../types';
import { useCassetteAudio } from '../hooks/useCassetteAudio';

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
  const { playClick, playThunk, startMotor, stopMotor } = useCassetteAudio();
  const isMounted = useRef(false);

  // Handle motor sounds based on transport state
  useEffect(() => {
    if (!isMounted.current) {
        isMounted.current = true;
        return;
    }

    if (transport.mode === 'stopped' || transport.mode === 'paused') {
        stopMotor();
        // Play mechanical stop sound only if we are fully stopped
        if (transport.mode === 'stopped') {
            playThunk();
        }
    } else {
        startMotor(transport.mode);
    }
  }, [transport.mode, startMotor, stopMotor, playThunk]);

  // Wrap handlers to add click sounds
  const handlePlay = () => { playClick(); onPlay(); };
  const handlePause = () => { playClick(); onPause(); };
  const handleStop = () => { playClick(); onStop(); };
  const handleRewindStart = () => { playClick(); onRewindStart(); };
  const handleRewindEnd = () => { playClick(); onRewindEnd(); };
  const handleFFStart = () => { playClick(); onFastForwardStart(); };
  const handleFFEnd = () => { playClick(); onFastForwardEnd(); };
  const handleFlip = () => { playClick(); onFlip(); };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* The Deck - Brushed metal aesthetic */}
      <div
        className="relative rounded-3xl p-6 shadow-2xl overflow-hidden border border-gray-700"
        style={{
            backgroundColor: '#1f1f1f',
            backgroundImage: `
                repeating-linear-gradient(90deg, transparent 0, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
                linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)
            `,
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Deck label / brand area */}
        <div className="relative flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  transport.mode === 'playing' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-red-900/50'
              }`}
            />
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
        <div className="relative bg-[#111] rounded-2xl p-4 border border-gray-700/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
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
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onRewindStart={handleRewindStart}
            onRewindEnd={handleRewindEnd}
            onFastForwardStart={handleFFStart}
            onFastForwardEnd={handleFFEnd}
            onFlip={handleFlip}
            canFlip={canFlip}
          />
        </div>

        {/* Subtle deck screws - corner details */}
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-zinc-900 rotate-45" />
          <div className="w-1.5 h-0.5 bg-zinc-900 -rotate-45" />
        </div>
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-zinc-900 rotate-45" />
          <div className="w-1.5 h-0.5 bg-zinc-900 -rotate-45" />
        </div>
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-zinc-900 rotate-45" />
          <div className="w-1.5 h-0.5 bg-zinc-900 -rotate-45" />
        </div>
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-zinc-900 rotate-45" />
          <div className="w-1.5 h-0.5 bg-zinc-900 -rotate-45" />
        </div>
      </div>
    </div>
  );
};
