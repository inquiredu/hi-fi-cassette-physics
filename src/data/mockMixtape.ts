import type { Mixtape } from '../types/index';

// Free sample audio from various sources
export const mockMixtape: Mixtape = {
  id: 'demo-001',
  slug: 'summer-vibes',
  tracks: [
    {
      id: 't1',
      title: 'Acoustic Breeze',
      artist: 'Benjamin Tissot',
      duration: 145,
      source: {
        type: 'url',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      },
    },
    {
      id: 't2',
      title: 'Sunny',
      artist: 'Benjamin Tissot',
      duration: 143,
      source: {
        type: 'url',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      },
    },
    {
      id: 't3',
      title: 'Ukulele',
      artist: 'Benjamin Tissot',
      duration: 146,
      source: {
        type: 'url',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      },
    },
  ],
  linerNotes: {
    title: 'Summer Vibes',
    artist: 'Various Artists',
    dedication: 'For lazy afternoons and good company.',
    notes: 'A collection of chill acoustic tracks to set the mood. Perfect for backyard hangs, road trips, or just unwinding after a long day.',
  },
  theme: {
    preset: 'sunset',
    tapeColor: '#2a2a2a',
    labelColor: '#fef3c7',
    accentColor: '#f59e0b',
  },
  createdAt: new Date().toISOString(),
};
