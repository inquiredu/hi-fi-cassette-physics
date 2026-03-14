import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Mixtape, Track } from '../types/index';

interface LinerNotesProps {
  isOpen: boolean;
  onClose: () => void;
  mixtape: Mixtape;
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
}

export function LinerNotes({
  isOpen,
  onClose,
  mixtape,
  currentTrackIndex,
  onTrackSelect,
}: LinerNotesProps) {
  const { linerNotes, tracks } = mixtape;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-neutral-900 z-50 overflow-hidden flex flex-col"
            style={{
              boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">Liner Notes</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-neutral-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Cover art */}
              {linerNotes.coverArt ? (
                <div className="aspect-square w-full bg-neutral-800">
                  <img
                    src={linerNotes.coverArt}
                    alt={linerNotes.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                  <div className="text-6xl opacity-20">🎵</div>
                </div>
              )}

              {/* Title and artist */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {linerNotes.title}
                </h1>
                {linerNotes.artist && (
                  <p className="text-neutral-400">{linerNotes.artist}</p>
                )}
              </div>

              {/* Dedication */}
              {linerNotes.dedication && (
                <div className="px-6 pb-6">
                  <div className="p-4 bg-neutral-800/50 rounded-lg border-l-2 border-rose-500">
                    <p className="text-neutral-300 italic">
                      "{linerNotes.dedication}"
                    </p>
                  </div>
                </div>
              )}

              {/* Track list */}
              <div className="px-6 pb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Tracks
                </h3>
                <div className="space-y-1">
                  {tracks.map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isPlaying={index === currentTrackIndex}
                      onClick={() => onTrackSelect(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Notes */}
              {linerNotes.notes && (
                <div className="px-6 pb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                    Notes
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-line">
                    {linerNotes.notes}
                  </p>
                </div>
              )}

              {/* Save to collection CTA */}
              <div className="p-6 border-t border-neutral-800">
                <button className="w-full py-3 px-4 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 transition-colors">
                  Save to Collection
                </button>
                <p className="text-xs text-neutral-500 text-center mt-2">
                  Keep this tape in your library
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface TrackRowProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  onClick: () => void;
}

function TrackRow({ track, index, isPlaying, onClick }: TrackRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
        isPlaying
          ? 'bg-white/10 text-white'
          : 'hover:bg-white/5 text-neutral-300'
      }`}
    >
      {/* Track number or playing indicator */}
      <span className={`w-6 text-sm ${isPlaying ? 'text-rose-500' : 'text-neutral-500'}`}>
        {isPlaying ? '▶' : String(index + 1).padStart(2, '0')}
      </span>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className={`truncate ${isPlaying ? 'font-medium' : ''}`}>
          {track.title}
        </p>
        {track.artist && (
          <p className="text-sm text-neutral-500 truncate">{track.artist}</p>
        )}
      </div>

      {/* Duration */}
      <span className="text-sm text-neutral-500">
        {formatDuration(track.duration)}
      </span>
    </button>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
