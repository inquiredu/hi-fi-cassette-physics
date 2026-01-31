import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { JCardConfig, JCardTexture } from '../types';
import { parseDuration, getStandardTapeLength } from '../utils/timeUtils';

interface LinerNotesProps {
  config: JCardConfig;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSeek: (progress: number) => void;
  onFlip: () => void;
  currentSide: 'A' | 'B';
}

export const LinerNotes: React.FC<LinerNotesProps> = ({ config, isOpen, onClose, onEdit, onSeek, onFlip, currentSide }) => {

  const getTextureStyle = (tex: JCardTexture): React.CSSProperties => {
    switch (tex) {
      case 'crumpled-paper':
        return { backgroundColor: '#fdfbf7', backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '10px 10px' };
      case 'cardboard':
        return { backgroundColor: '#d4a373' };
      case 'grid-paper':
        return {
          backgroundColor: '#fff',
          backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        };
      default: return { backgroundColor: '#ffffff' };
    }
  };

  const renderStickerContent = (content: string) => {
    switch (content) {
      case 'star': return <div className="text-yellow-400 text-6xl drop-shadow-md">★</div>;
      case 'heart': return <div className="text-pink-500 text-6xl drop-shadow-md">♥</div>;
      case 'skull': return <div className="text-gray-800 text-6xl drop-shadow-md">☠</div>;
      case 'tape-logo': return <div className="bg-black text-white font-bold px-2 py-1 text-xs tracking-tighter uppercase border-2 border-white shadow-sm">TDK</div>;
      case 'warning': return <div className="bg-yellow-400 text-black font-bold px-4 py-1 text-[10px] tracking-widest border-2 border-black uppercase shadow-sm">PARENTAL ADVISORY</div>;
      case 'band-aid': return <div className="w-16 h-6 bg-orange-200 border border-orange-300 rounded-full shadow-sm flex items-center justify-center"><div className="w-4 h-4 bg-orange-100 rounded-sm"></div></div>;
      default: return <div>?</div>;
    }
  };

  // Calculate tape physics for seeking
  const sideADuration = config.tracklist.sideA.reduce((acc, track) => acc + parseDuration(track.duration || '0:00'), 0);
  const sideBDuration = config.tracklist.sideB.reduce((acc, track) => acc + parseDuration(track.duration || '0:00'), 0);
  const sideATapeMinutes = getStandardTapeLength(sideADuration);
  const sideBTapeMinutes = getStandardTapeLength(sideBDuration);
  const sideATapeSeconds = sideATapeMinutes * 60;
  const sideBTapeSeconds = sideBTapeMinutes * 60;

  const handleTrackClick = (trackIndex: number, side: 'sideA' | 'sideB') => {
    const targetSide = side === 'sideA' ? 'A' : 'B';
    const tracks = side === 'sideA' ? config.tracklist.sideA : config.tracklist.sideB;
    const tapeDurationSeconds = side === 'sideA' ? sideATapeSeconds : sideBTapeSeconds;

    // If we need to flip to the other side, do so first
    if (currentSide !== targetSide) {
      onFlip();
    }

    let accumulatedSeconds = 0;
    for (let i = 0; i < trackIndex; i++) {
      accumulatedSeconds += parseDuration(tracks[i].duration || '0:00');
    }

    // Add a small buffer (e.g. 2 seconds) so we don't start exactly at the very split second
    const seekSeconds = accumulatedSeconds + 1;
    const progress = seekSeconds / tapeDurationSeconds;

    onSeek(Math.min(0.99, progress));
  };

  const getFontClass = () => {
    switch (config.tracklistFont) {
      case 'marker': return 'font-marker';
      case 'sans': return 'font-sans';
      case 'pen': default: return 'font-pen';
    }
  };

  const tracklistStyle = {
    color: config.tracklistColor || '#000000',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-gray-900/80 backdrop-blur-md z-50 shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="relative h-full flex flex-col">
            {/* Controls */}
            <div className="w-full flex justify-between items-center p-4 text-white shrink-0">
              <h2 className="text-lg font-bold">Liner Notes</h2>
              <div className="flex gap-4">
                <button onClick={onEdit} className="text-sm text-gray-400 hover:text-white underline">Edit J-Card</button>
                <button onClick={onClose} className="hover:text-orange-500"><X /></button>
              </div>
            </div>

            {/* The Unfolded J-Card Layout */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    {/* PANEL 1: FRONT ART (Cover) */}
                    <div
                      className="relative w-full h-[300px] overflow-hidden border-b md:border-b-0 md:border-r border-black/10 shrink-0"
                      style={getTextureStyle(config.textureId)}
                    >
                      {/* Render Layers (Read-Only) */}
                      {config.layers.map((layer) => (
                        <div
                          key={layer.id}
                          className="absolute"
                          style={{
                            left: 0,
                            top: 0,
                            transform: `translate3d(${layer.x}px, ${layer.y}px, 0) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                            zIndex: layer.zIndex
                          }}
                        >
                          {layer.type === 'sticker' ? (
                            renderStickerContent(layer.content)
                          ) : (
                            <div
                              className={`${layer.font === 'pen' ? 'font-pen text-5xl leading-none' : 'font-marker text-3xl'}`}
                              style={{ color: layer.color }}
                            >
                              <span>{layer.content}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* TRACKLIST */}
                    <div
                      className="relative w-full p-4 shrink-0"
                      style={getTextureStyle(config.textureId)}
                    >
                      <h3 className="font-marker text-2xl mb-4 border-b-2 border-black/80 pb-2" style={tracklistStyle}>Side A</h3>
                      <ul className={`${getFontClass()} text-xl space-y-2`} style={tracklistStyle}>
                        {config.tracklist.sideA.length === 0 && (
                          <li className="opacity-30 italic">No tracks listed...</li>
                        )}
                        {config.tracklist.sideA.map((track, i) => (
                          <li key={track.id} className="group flex gap-3 items-start">
                            <span className="opacity-50 font-sans text-xs pt-2 w-5 shrink-0">A{i + 1}</span>
                            <button
                              onClick={() => handleTrackClick(i, 'sideA')}
                              className="text-left hover:underline decoration-2 underline-offset-2 flex-1 flex items-center gap-2"
                            >
                              {track.title}
                              <Play size={10} className="opacity-0 group-hover:opacity-100 transition-opacity fill-current" />
                            </button>
                            <span className="opacity-40 text-xs pt-2 whitespace-nowrap">{track.duration}</span>
                          </li>
                        ))}
                      </ul>

                        <h3 className="font-marker text-2xl mt-6 mb-4 border-b-2 border-black/80 pb-2" style={tracklistStyle}>Side B</h3>
                        <ul className={`${getFontClass()} text-xl space-y-2`} style={tracklistStyle}>
                            {config.tracklist.sideB.length === 0 && (
                            <li className="opacity-30 italic">No tracks listed...</li>
                            )}
                            {config.tracklist.sideB.map((track, i) => (
                            <li key={track.id} className="group flex gap-3 items-start">
                                <span className="opacity-50 font-sans text-xs pt-2 w-5 shrink-0">B{i + 1}</span>
                                <button
                                  onClick={() => handleTrackClick(i, 'sideB')}
                                  className="text-left hover:underline decoration-2 underline-offset-2 flex-1 flex items-center gap-2"
                                >
                                  {track.title}
                                  <Play size={10} className="opacity-0 group-hover:opacity-100 transition-opacity fill-current" />
                                </button>
                                <span className="opacity-40 text-xs pt-2 whitespace-nowrap">{track.duration}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
