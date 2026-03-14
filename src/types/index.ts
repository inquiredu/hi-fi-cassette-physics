// Core data types for Mixtape

export interface Track {
  id: string;
  title: string;
  artist?: string;
  duration: number; // seconds
  source: AudioSource;
}

export type AudioSource =
  | { type: 'url'; url: string }
  | { type: 'soundcloud'; trackUrl: string }
  | { type: 'dropbox'; shareLink: string };

export interface Mixtape {
  id: string;
  slug: string; // URL slug like "summerjams"
  tracks: Track[];
  linerNotes: {
    title: string;
    artist?: string;
    coverArt?: string; // URL or base64
    dedication?: string; // Personal message
    notes?: string; // Longer text
  };
  theme: MixtapeTheme;
  createdAt: string;
}

export interface MixtapeTheme {
  preset: 'midnight' | 'sunset' | 'neon' | 'minimal' | 'retro';
  tapeColor: string;
  labelColor: string;
  accentColor: string;
  playerTemplate?: 'boombox' | 'walkman' | 'minimal';
}

// Transport state
export type TransportMode = 'stopped' | 'playing' | 'paused' | 'rewinding' | 'fast_forwarding';

// Audio controller interface - source-agnostic
export interface AudioState {
  isPlaying: boolean;
  currentTrackIndex: number;
  progress: number; // 0-1
  duration: number; // seconds
  currentTime: number; // seconds
}

export interface AudioController {
  // Actions
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  seekToPercent: (percent: number) => void;
  next: () => void;
  prev: () => void;
  goToTrack: (index: number) => void;

  // State
  state: AudioState;

  // Cleanup
  destroy: () => void;
}
