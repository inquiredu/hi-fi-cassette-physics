// Core data types for Mixtape

export interface Track {
  id: string;
  title: string;
  artist: string;
  // Which physical side the track is on
  side: 'A' | 'B';
  // duration in seconds
  duration: number; // seconds
  source: AudioSource;
}

export type AudioSource =
  | { type: 'url'; url: string }
  | { type: 'soundcloud'; trackUrl: string }
  | { type: 'dropbox'; shareLink: string };

export interface MixtapeLinerNotes {
  title: string;
  artist?: string;
  coverArt?: string; // URL or base64
  dedication?: string; // Personal message
  notes?: string; // Longer text
  message?: string; // For J-Card explainer
}

export interface Mixtape {
  id: string;
  slug: string; // URL slug like "summerjams"
  tracks: Track[];
  linerNotes: MixtapeLinerNotes;
  theme: MixtapeTheme;
  createdAt: string;
}

export interface MixtapeTheme {
  preset?: string;
  tapeColor: string;
  labelColor: string;
  accentColor: string;
  playerTemplate: 'minimal' | 'walkman' | 'boombox';
  jCardTheme: 'handwritten' | 'collage' | 'ransom' | 'minimal';
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
  needsFlip: boolean; // True when playback stops exactly at a side boundary
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
  flipTape: () => void;

  // State
  state: AudioState;

  // Cleanup
  destroy: () => void;
}
