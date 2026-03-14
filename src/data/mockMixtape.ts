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
      side: 'A',
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
      side: 'A',
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
      side: 'B',
      duration: 146,
      source: {
        type: 'url',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      },
    },
  ],
  linerNotes: {
    title: 'Summer Vibes',
    artist: 'Sean',
    notes: 'For lazy afternoons and good company.',
    message: 'Made this while thinking about those late night drives testing out the tape deck. Flip the tape when you get to the beach.'
  },
  theme: {
    preset: 'sunset',
    tapeColor: '#1a1a1a',
    labelColor: '#fef3c7',
    accentColor: '#f59e0b',
    playerTemplate: 'boombox',
    jCardTheme: 'handwritten'
  },
  createdAt: new Date().toISOString(),
};
