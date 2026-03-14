import { Tape } from './Tape';
import { TransportControls } from './TransportControls';
import type { TransportMode, Track } from '../types/index';

interface CassetteDeckProps {
  // Tape props
  title: string;
  progress: number;
  transportMode: TransportMode;
  shellColor?: string;
  labelColor?: string;
  onInfoClick?: () => void;

  // Playback props
  isPlaying: boolean;
  currentTrack: Track | null;
  trackIndex: number;
  totalTracks: number;
  currentTime: number;
  duration: number;

  // Controls
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (percent: number) => void;
}

export function CassetteDeck({
  title,
  progress,
  transportMode,
  shellColor,
  labelColor,
  onInfoClick,
  isPlaying,
  currentTrack,
  trackIndex,
  totalTracks,
  currentTime,
  duration,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
}: CassetteDeckProps) {
  return (
    <div className="flex flex-col items-center">
      {/* The cassette tape - now contains all track info in label */}
      <Tape
        title={title}
        progress={progress}
        transportMode={transportMode}
        shellColor={shellColor}
        labelColor={labelColor}
        onInfoClick={onInfoClick}
        currentTrack={currentTrack}
        trackIndex={trackIndex}
        totalTracks={totalTracks}
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />

      <TransportControls
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onPrev={onPrev}
        onNext={onNext}
        canPrev={trackIndex > 0 || progress > 0.05}
        canNext={trackIndex < totalTracks - 1}
      />
    </div>
  );
}
