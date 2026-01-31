import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Check, ExternalLink, Loader2 } from 'lucide-react';
import { isSpotifyPlaylistUrl } from '../utils/spotifyUtils';

interface AddMusicPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export const AddMusicPrompt: React.FC<AddMusicPromptProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const isValid = url.trim() && isSpotifyPlaylistUrl(url);

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Please enter a valid Spotify playlist URL');
      return;
    }

    setIsValidating(true);
    // Small delay for UX feedback
    await new Promise(r => setTimeout(r, 500));
    setIsValidating(false);
    onSubmit(url);
    setUrl('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError('');
    } catch (err) {
      // Clipboard access denied
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-b from-gray-900 to-gray-950 w-full max-w-md rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="relative p-6 pb-4 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1DB954] to-[#169c46] flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
                <Music size={32} className="text-white" />
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Add Music</h2>
              <p className="text-sm text-gray-400">
                Paste a Spotify playlist to make your mixtape playable
              </p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-4">
              {/* URL Input */}
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError('');
                  }}
                  placeholder="https://open.spotify.com/playlist/..."
                  className={`w-full bg-gray-800/50 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-xl px-4 py-3 pr-20 text-white placeholder-gray-500 focus:outline-none focus:border-[#1DB954] transition-colors text-sm`}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  onClick={handlePaste}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  Paste
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              {/* Validation indicator */}
              {url && (
                <div className={`flex items-center gap-2 text-xs ${isValid ? 'text-[#1DB954]' : 'text-gray-500'}`}>
                  {isValid ? (
                    <>
                      <Check size={14} />
                      <span>Valid Spotify playlist URL</span>
                    </>
                  ) : (
                    <span>Enter a Spotify playlist URL (not a track or album)</span>
                  )}
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!isValid || isValidating}
                className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                  isValid
                    ? 'bg-[#1DB954] hover:bg-[#1ed760] shadow-lg shadow-[#1DB954]/20'
                    : 'bg-gray-700 cursor-not-allowed'
                }`}
              >
                {isValidating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Music size={18} />
                    Add Playlist
                  </>
                )}
              </button>

              {/* Help text */}
              <div className="pt-4 border-t border-gray-800">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">How to get a playlist URL</h4>
                <ol className="space-y-2 text-xs text-gray-400">
                  <li className="flex gap-2">
                    <span className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px] shrink-0">1</span>
                    Open Spotify and find a playlist you love
                  </li>
                  <li className="flex gap-2">
                    <span className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px] shrink-0">2</span>
                    Click the three dots (...) → Share → Copy link
                  </li>
                  <li className="flex gap-2">
                    <span className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px] shrink-0">3</span>
                    Paste it here!
                  </li>
                </ol>

                <a
                  href="https://open.spotify.com/search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 text-xs text-[#1DB954] hover:underline"
                >
                  Open Spotify <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Floating "Add Music" button when no playlist is set
 */
export const AddMusicFAB: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full bg-gradient-to-r from-[#1DB954] to-[#169c46] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#1DB954]/30"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
    >
      <Music size={18} />
      Add Music
    </motion.button>
  );
};
