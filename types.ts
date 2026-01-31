export type JCardTexture = 'clean-white' | 'crumpled-paper' | 'cardboard' | 'grid-paper';

export type LayerType = 'sticker' | 'text';

export interface JCardLayer {
  id: string;
  type: LayerType;
  content: string; // Text content or Sticker ID (e.g., 'star', 'skull')
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  font?: 'marker' | 'pen'; // Only for text
  color?: string; // Only for text
}

export interface Track {
  id: string;
  title: string;
  artist?: string;
  duration: string; // "MM:SS" format
  url?: string;
}

export interface Tracklist {
  sideA: Track[];
  sideB: Track[];
}

export interface JCardConfig {
  textureId: JCardTexture;
  layers: JCardLayer[];
  tracklist: Tracklist;
  tracklistFont?: 'marker' | 'pen' | 'sans';
  tracklistColor?: string;
}

// Transport mode - what the deck is currently doing
export type TransportMode = 'stopped' | 'playing' | 'paused' | 'rewinding' | 'fast_forwarding';

// Which side of the tape is loaded
export type TapeSide = 'A' | 'B';

// Complete transport state
export interface TransportState {
  mode: TransportMode;
  currentSide: TapeSide;
  sideAProgress: number;  // 0-1
  sideBProgress: number;  // 0-1
}