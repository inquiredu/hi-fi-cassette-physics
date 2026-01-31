import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Music, ChevronDown, ExternalLink } from 'lucide-react';
import { extractSpotifyPlaylistId } from '../utils/spotifyUtils';

interface SpotifyDrawerProps {
  playlistUrl?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const drawerVariants = {
  closed: {
    y: 'calc(100% - 56px)', // Just show the handle
  },
  open: {
    y: 0,
  },
};

const drawerTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const SpotifyDrawer: React.FC<SpotifyDrawerProps> = ({
  playlistUrl,
  isOpen,
  onToggle,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const playlistId = playlistUrl ? extractSpotifyPlaylistId(playlistUrl) : null;

  // Handle swipe gesture
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y > threshold && isOpen) {
      onToggle(); // Close
    } else if (info.offset.y < -threshold && !isOpen) {
      onToggle(); // Open
    }
  };

  if (!playlistId) {
    return null;
  }

  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-gray-900 via-gray-900 to-gray-900/95 backdrop-blur-xl rounded-t-2xl shadow-2xl border-t border-gray-700/50"
      style={{ maxHeight: '70vh' }}
      variants={drawerVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      transition={drawerTransition}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      {/* Handle / Tab */}
      <div
        className="flex items-center justify-center py-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="w-10 h-1 bg-gray-600 rounded-full mb-2" />
      </div>

      {/* Header - always visible */}
      <div
        className="flex items-center justify-between px-4 pb-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
            <Music size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Listen on Spotify</h3>
            <p className="text-[10px] text-gray-400">
              {isOpen ? 'Tap to minimize' : 'Tap to play music'}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
      </div>

      {/* Player Content - shown when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="px-4 pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Spotify Embed */}
            <div className="relative">
              <iframe
                src={embedUrl}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
                onLoad={() => setIsLoaded(true)}
              />

              {/* Loading state */}
              {!isLoaded && (
                <div className="absolute inset-0 bg-gray-800 rounded-xl flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 text-xs">Loading Spotify...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer link */}
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-[#1DB954] transition-colors"
            >
              <ExternalLink size={12} />
              Open in Spotify
            </a>

            {/* Hint text */}
            <p className="text-center text-[10px] text-gray-600 mt-2">
              Spotify Premium required for full playback
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Floating action button to trigger the drawer
 * Used when drawer is closed to provide another way to open it
 */
export const SpotifyFAB: React.FC<{
  hasPlaylist: boolean;
  onClick: () => void;
}> = ({ hasPlaylist, onClick }) => {
  if (!hasPlaylist) return null;

  return (
    <motion.button
      className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#1DB954] text-white flex items-center justify-center shadow-lg shadow-[#1DB954]/30"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label="Play music on Spotify"
    >
      <Music size={24} />
    </motion.button>
  );
};
