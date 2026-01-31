import React from 'react';
import { JCardConfig, TapeSide } from '../types';

interface CassetteLabelProps {
  config: JCardConfig;
  side: TapeSide;
  tapeLabel: string;
}

// Texture backgrounds mapped to CSS
const textureStyles: Record<string, React.CSSProperties> = {
  'clean-white': {
    backgroundColor: '#fafafa',
  },
  'crumpled-paper': {
    backgroundColor: '#f5f0e6',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundBlendMode: 'multiply' as const,
  },
  'cardboard': {
    backgroundColor: '#c9b896',
    backgroundImage: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    )`,
  },
  'grid-paper': {
    backgroundColor: '#f8f8f0',
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
  },
};

// Sticker components
const StickerGraphics: Record<string, React.FC<{ className?: string }>> = {
  'tape-logo': ({ className }) => (
    <svg className={className} viewBox="0 0 40 40" fill="currentColor">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="14" cy="20" r="4" />
      <circle cx="26" cy="20" r="4" />
      <path d="M14 20 L26 20" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  'star': ({ className }) => (
    <svg className={className} viewBox="0 0 40 40" fill="currentColor">
      <path d="M20 2l4.5 13.8h14.5l-11.7 8.5 4.5 13.8L20 29.6 8.2 38.1l4.5-13.8L1 15.8h14.5z" />
    </svg>
  ),
  'skull': ({ className }) => (
    <svg className={className} viewBox="0 0 40 40" fill="currentColor">
      <ellipse cx="20" cy="18" rx="12" ry="14" />
      <circle cx="14" cy="16" r="3" fill="white" />
      <circle cx="26" cy="16" r="3" fill="white" />
      <path d="M16 28 L16 36 M20 28 L20 36 M24 28 L24 36" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  'heart': ({ className }) => (
    <svg className={className} viewBox="0 0 40 40" fill="currentColor">
      <path d="M20 35 L8 22 C4 18 4 12 8 8 C12 4 18 4 20 10 C22 4 28 4 32 8 C36 12 36 18 32 22 Z" />
    </svg>
  ),
  'lightning': ({ className }) => (
    <svg className={className} viewBox="0 0 40 40" fill="currentColor">
      <path d="M22 2 L10 22 H18 L16 38 L30 16 H22 Z" />
    </svg>
  ),
};

// Font styles for text layers
const fontStyles: Record<string, string> = {
  'marker': 'font-bold tracking-tight',
  'pen': 'italic tracking-wide',
};

export const CassetteLabel: React.FC<CassetteLabelProps> = ({
  config,
  side,
  tapeLabel,
}) => {
  const textureStyle = textureStyles[config.textureId] || textureStyles['clean-white'];

  // Get tracks for this side
  const tracks = side === 'A' ? config.tracklist.sideA : config.tracklist.sideB;

  // Find title from layers (first text layer is the title)
  const titleLayer = config.layers.find(l => l.type === 'text');
  const title = titleLayer?.content || 'UNTITLED';

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={textureStyle}
    >
      {/* Decorative red stripe at top */}
      <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-between px-3">
        <span className="text-[8px] font-mono text-white/70 tracking-widest">
          SIDE {side}
        </span>
        <span className="text-[10px] font-mono text-white font-bold tracking-wider">
          {tapeLabel}
        </span>
      </div>

      {/* Main label content area */}
      <div className="absolute top-6 inset-x-0 bottom-0 p-2 overflow-hidden">
        {/* Render J-Card layers (stickers, text) */}
        {config.layers.map((layer) => {
          // Scale coordinates from J-card space (300x500ish) to label space
          const scaleX = 0.5;
          const scaleY = 0.3;
          const x = layer.x * scaleX;
          const y = (layer.y - 100) * scaleY; // Offset for label starting below header

          if (layer.type === 'sticker') {
            const StickerComponent = StickerGraphics[layer.content];
            if (!StickerComponent) return null;

            return (
              <div
                key={layer.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${Math.max(0, Math.min(x, 100))}%`,
                  top: `${Math.max(0, Math.min(y, 80))}%`,
                  transform: `rotate(${layer.rotation}deg) scale(${layer.scale * 0.6})`,
                  zIndex: layer.zIndex,
                }}
              >
                <StickerComponent className="w-8 h-8 text-gray-800" />
              </div>
            );
          }

          if (layer.type === 'text') {
            return (
              <div
                key={layer.id}
                className={`absolute ${fontStyles[layer.font || 'marker']} text-sm whitespace-nowrap`}
                style={{
                  left: `${Math.max(5, Math.min(x, 90))}%`,
                  top: `${Math.max(5, Math.min(y, 70))}%`,
                  transform: `rotate(${layer.rotation}deg) scale(${layer.scale * 0.7})`,
                  color: layer.color || '#000',
                  zIndex: layer.zIndex,
                }}
              >
                {layer.content}
              </div>
            );
          }

          return null;
        })}

        {/* Handwritten tracklist preview - the essence! */}
        <div
          className="absolute bottom-1 left-2 right-2 text-[7px] leading-tight opacity-60"
          style={{
            fontFamily: config.tracklistFont === 'pen' ? 'cursive' : 'system-ui',
            color: config.tracklistColor || '#333',
          }}
        >
          {tracks.slice(0, 3).map((track, i) => (
            <div key={track.id} className="truncate">
              {i + 1}. {track.title}
            </div>
          ))}
          {tracks.length > 3 && (
            <div className="text-gray-400">+{tracks.length - 3} more...</div>
          )}
        </div>
      </div>

      {/* Subtle worn edges effect */}
      <div className="absolute inset-0 pointer-events-none border border-black/10 rounded" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)`
        }}
      />
    </div>
  );
};
