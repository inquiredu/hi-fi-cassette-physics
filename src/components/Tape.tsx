import { Reel } from './Reel';
import type { TransportMode, Track } from '../types/index';
import { Info } from 'lucide-react';

interface TapeProps {
  title: string;
  progress: number;
  transportMode: TransportMode;
  shellColor?: string;
  labelColor?: string;
  onInfoClick?: () => void;
  // Now playing info (displayed in label)
  currentTrack?: Track | null;
  trackIndex?: number;
  totalTracks?: number;
  currentTime?: number;
  duration?: number;
  onSeek?: (percent: number) => void;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Tape({
  title,
  progress,
  transportMode,
  shellColor = '#1a1a1a',
  labelColor = '#f5f5f0',
  onInfoClick,
  currentTrack,
  trackIndex = 0,
  totalTracks = 0,
  currentTime = 0,
  duration = 0,
  onSeek,
}: TapeProps) {
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, percent)));
  };

  return (
    <div className="relative" style={{ width: 340, height: 216 }}>
      {/* Cassette shell */}
      <div
        className="relative w-full h-full rounded-lg overflow-hidden"
        style={{
          backgroundColor: shellColor,
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.1),
            inset 0 -1px 0 rgba(0,0,0,0.3)
          `,
        }}
      >
        {/* Top header strip */}
        <div
          className="absolute top-0 left-0 right-0 h-3 flex items-center justify-between px-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        >
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-neutral-600" />
            <div className="w-1 h-1 rounded-full bg-neutral-600" />
          </div>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-neutral-600" />
            <div className="w-1 h-1 rounded-full bg-neutral-600" />
          </div>
        </div>

        {/* Main window area - the transparent part showing reels and tape */}
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 rounded-sm overflow-hidden"
          style={{
            width: 280,
            height: 80,
            backgroundColor: '#0a0806',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          {/* Tape visible through window */}
          <div className="absolute inset-0 flex items-center justify-between px-6">
            {/* Left reel (supply) */}
            <Reel
              progress={progress}
              side="supply"
              transportMode={transportMode}
              scale={1}
            />

            {/* Center: tape path and head assembly */}
            <div className="flex flex-col items-center justify-center gap-1 h-full py-2">
              <div className="w-16 h-0.5 rounded-full" style={{ backgroundColor: '#1a1208' }} />
              <div className="flex items-center gap-0.5">
                <div className="w-1 h-6 bg-neutral-700 rounded-sm" />
                <div className="w-3 h-8 bg-neutral-600 rounded-sm" />
                <div className="w-1 h-6 bg-neutral-700 rounded-sm" />
              </div>
              <div className="w-16 h-0.5 rounded-full" style={{ backgroundColor: '#1a1208' }} />
            </div>

            {/* Right reel (takeup) */}
            <Reel
              progress={progress}
              side="takeup"
              transportMode={transportMode}
              scale={1}
            />
          </div>

          {/* Window frame overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-sm"
            style={{ boxShadow: 'inset 0 0 0 2px rgba(40,40,40,0.8)' }}
          />
        </div>

        {/* Label area - now includes track info and progress */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-sm overflow-hidden"
          style={{
            width: 290,
            height: 76,
            backgroundColor: labelColor,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          <div className="relative w-full h-full px-3 py-2 flex flex-col">
            {/* Top row: mixtape title and side indicator */}
            <div className="flex items-start justify-between">
              <p
                className="text-[10px] font-bold tracking-wider uppercase truncate flex-1"
                style={{ color: '#666' }}
              >
                {title}
              </p>
              <span
                className="text-[10px] font-bold tracking-widest ml-2"
                style={{ color: '#999' }}
              >
                A
              </span>
            </div>

            {/* Middle: current track info */}
            <div className="flex-1 flex items-center justify-between mt-1">
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: '#222' }}
                >
                  {currentTrack?.title || 'No track'}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: '#666' }}
                >
                  {currentTrack?.artist || '\u00A0'}
                </p>
              </div>

              {/* Track number and info button */}
              <div className="flex items-center gap-2 ml-2">
                <span
                  className="text-xs font-mono"
                  style={{ color: '#888' }}
                >
                  {trackIndex + 1}/{totalTracks}
                </span>
                {onInfoClick && (
                  <button
                    onClick={onInfoClick}
                    className="p-1 rounded-full hover:bg-black/10 transition-colors"
                    aria-label="View liner notes"
                  >
                    <Info size={14} color="#666" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom: progress bar with time */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono" style={{ color: '#888' }}>
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 h-1 rounded-full cursor-pointer group"
                style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
                onClick={handleProgressClick}
              >
                <div
                  className="h-full rounded-full relative"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: '#c026d3',
                  }}
                />
              </div>
              <span className="text-[10px] font-mono" style={{ color: '#888' }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom detail strip */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        />

        {/* Corner screws */}
        <div className="absolute top-2 left-3 w-1.5 h-1.5 rounded-full bg-neutral-600 shadow-inner" />
        <div className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-neutral-600 shadow-inner" />
        <div className="absolute bottom-2.5 left-3 w-1.5 h-1.5 rounded-full bg-neutral-600 shadow-inner" />
        <div className="absolute bottom-2.5 right-3 w-1.5 h-1.5 rounded-full bg-neutral-600 shadow-inner" />
      </div>
    </div>
  );
}
