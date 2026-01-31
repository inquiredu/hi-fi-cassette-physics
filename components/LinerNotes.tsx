import React from 'react';
import { X, ExternalLink, Play } from 'lucide-react';
import { JCardConfig, JCardTexture } from '../types';
import { parseDuration, getStandardTapeLength } from '../utils/timeUtils';

interface LinerNotesProps {
  config: JCardConfig;
  onClose: () => void;
  onEdit: () => void;
  onSeek: (progress: number) => void;
}

export const LinerNotes: React.FC<LinerNotesProps> = ({ config, onClose, onEdit, onSeek }) => {

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
  const tapeDurationMinutes = getStandardTapeLength(sideADuration);
  const tapeDurationSeconds = tapeDurationMinutes * 60;

  const handleTrackClick = (trackIndex: number, side: 'sideA' | 'sideB') => {
    if (side === 'sideB') return; // TODO: Handle Side B seeking (requires flip)

    let accumulatedSeconds = 0;
    for (let i = 0; i < trackIndex; i++) {
      accumulatedSeconds += parseDuration(config.tracklist.sideA[i].duration || '0:00');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md">
      <div className="min-h-full flex items-center justify-center p-4 md:p-8">
        <div className="relative max-w-5xl w-full flex flex-col items-center">

          {/* Controls */}
          <div className="w-full flex justify-between mb-4 text-white sticky top-0 z-50 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl font-bold font-mono tracking-widest uppercase">Liner Notes</h2>
            <div className="flex gap-4">
              <button onClick={onEdit} className="text-sm text-gray-400 hover:text-white underline">Edit J-Card</button>
              <button onClick={onClose} className="hover:text-orange-500"><X /></button>
            </div>
          </div>

          {/* The Unfolded J-Card Layout */}
          <div className="flex flex-col md:flex-row shadow-2xl overflow-hidden rounded-sm w-full md:w-auto" style={{ minHeight: '500px' }}>

            {/* PANEL 1: FRONT ART (Cover) */}
            <div
              className="relative w-full md:w-[320px] h-[500px] overflow-hidden border-b md:border-b-0 md:border-r border-black/10 shrink-0"
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

            {/* PANEL 2: SPINE */}
            <div
              className="relative w-full md:w-[50px] h-[50px] md:h-[500px] border-b md:border-b-0 md:border-r border-black/10 flex items-center justify-center shrink-0"
              style={getTextureStyle(config.textureId)}
            >
              <span className="transform md:-rotate-90 whitespace-nowrap font-marker text-xl opacity-50 tracking-widest uppercase">
                {/* Just use first text layer as mock title */}
                {config.layers.find(l => l.type === 'text')?.content || 'MIXTAPE'}
              </span>
            </div>

            {/* PANEL 3: FLAP (Side A) */}
            <div
              className="relative w-full md:w-[300px] h-auto md:h-[500px] border-b md:border-b-0 md:border-r border-black/10 p-8 shrink-0 overflow-y-auto"
              style={getTextureStyle(config.textureId)}
            >
              <h3 className="font-marker text-3xl mb-6 border-b-2 border-black/80 pb-2" style={tracklistStyle}>Side A</h3>
              <ul className={`${getFontClass()} text-2xl space-y-3`} style={tracklistStyle}>
                {config.tracklist.sideA.length === 0 && (
                  <li className="opacity-30 italic">No tracks listed...</li>
                )}
                {config.tracklist.sideA.map((track, i) => (
                  <li key={track.id} className="group flex gap-3 items-start">
                    <span className="opacity-50 font-sans text-sm pt-2 w-6 shrink-0">A{i + 1}</span>
                    <button
                      onClick={() => handleTrackClick(i, 'sideA')}
                      className="text-left hover:underline decoration-2 underline-offset-2 flex-1 flex items-center gap-2"
                    >
                      {track.title}
                      <Play size={12} className="opacity-0 group-hover:opacity-100 transition-opacity fill-current" />
                    </button>
                    <span className="opacity-40 text-sm pt-2 whitespace-nowrap">{track.duration}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PANEL 4: EXTENDED FLAP (Side B) */}
            <div
              className="relative w-full md:w-[300px] h-auto md:h-[500px] p-8 shrink-0 overflow-y-auto"
              style={getTextureStyle(config.textureId)}
            >
              <h3 className="font-marker text-3xl mb-6 border-b-2 border-black/80 pb-2" style={tracklistStyle}>Side B</h3>
              <ul className={`${getFontClass()} text-2xl space-y-3`} style={tracklistStyle}>
                {config.tracklist.sideB.length === 0 && (
                  <li className="opacity-30 italic">No tracks listed...</li>
                )}
                {config.tracklist.sideB.map((track, i) => (
                  <li key={track.id} className="flex gap-3 items-start opacity-70">
                    <span className="opacity-50 font-sans text-sm pt-2 w-6 shrink-0">B{i + 1}</span>
                    <span className="flex-1">{track.title}</span>
                    <span className="opacity-40 text-sm pt-2 whitespace-nowrap">{track.duration}</span>
                  </li>
                ))}
              </ul>

              {config.spotifyUrl && (
                <div className="mt-12 pt-8 border-t border-black/10">
                  <a href={config.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 hover:text-green-600 transition-all">
                    <ExternalLink size={16} /> Listen on Spotify
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};