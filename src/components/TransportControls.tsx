import { Play, Pause, SkipBack, SkipForward, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface TransportControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  needsFlip?: boolean;
  onFlipTape?: () => void;
}

export function TransportControls({
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  needsFlip = false,
  onFlipTape,
}: TransportControlsProps) {
  const { playClick } = useSoundEffects();

  const handleAction = (action: () => void) => {
    playClick();
    action();
  };

  return (
    <div className="flex items-center justify-center gap-6 mt-6 bg-neutral-900/80 p-3 rounded-full shadow-inner border border-neutral-800 min-h-[72px]">
      {needsFlip ? (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFlipTape && handleAction(onFlipTape)}
          className="flex items-center gap-3 px-8 py-3 rounded-full bg-orange-600 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:bg-orange-500 transition-colors"
        >
          <RefreshCw size={20} />
          Flip Tape
        </motion.button>
      ) : (
        <>
          {/* Previous / Rewind */}
          <motion.button
            whileTap={{ scale: 0.9, y: 2 }}
            onClick={() => handleAction(onPrev)}
            disabled={!canPrev}
            className="p-3 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous track"
          >
            <SkipBack size={20} />
          </motion.button>

          {/* Play / Pause */}
          <motion.button
            whileTap={{ scale: 0.95, y: 3 }}
            onClick={() => handleAction(onPlayPause)}
            className="p-4 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </motion.button>

          {/* Next / Fast Forward */}
          <motion.button
            whileTap={{ scale: 0.9, y: 2 }}
            onClick={() => handleAction(onNext)}
            disabled={!canNext}
            className="p-3 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next track"
          >
            <SkipForward size={20} />
          </motion.button>
        </>
      )}
    </div>
  );
}
