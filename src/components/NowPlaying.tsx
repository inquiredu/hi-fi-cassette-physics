import type { Track } from '../types/index';

interface NowPlayingProps {
  track: Track | null;
  trackIndex: number;
  totalTracks: number;
  currentTime: number;
  duration: number;
  progress: number;
  onSeek?: (percent: number) => void;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function NowPlaying({
  track,
  trackIndex,
  totalTracks,
  currentTime,
  duration,
  progress,
  onSeek,
}: NowPlayingProps) {
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, percent)));
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      {/* Track info */}
      <div className="text-center">
        <p className="text-sm text-neutral-400">
          Track {trackIndex + 1} of {totalTracks}
        </p>
        {track && (
          <p className="text-white font-medium truncate max-w-[280px]">
            {track.title}
            {track.artist && <span className="text-neutral-400"> - {track.artist}</span>}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full flex items-center gap-2">
        <span className="text-xs text-neutral-500 w-10 text-right">
          {formatTime(currentTime)}
        </span>

        <div
          className="flex-1 h-1 bg-neutral-800 rounded-full cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-white rounded-full relative group-hover:bg-rose-500 transition-colors"
            style={{ width: `${progress * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <span className="text-xs text-neutral-500 w-10">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
