import { describe, it, expect } from 'vitest';
import { encodeMixtape, decodeMixtape } from './serialization';
import type { Mixtape } from '../types';

describe('serialization utility', () => {
  const mockData: Partial<Mixtape> = {
    id: 'test-mix',
    slug: 'test',
    tracks: [
      { id: '1', title: 'Track 1', duration: 120, source: { type: 'url', url: 'test.mp3' } }
    ],
    theme: {
      preset: 'retro',
      tapeColor: '#000000',
      labelColor: '#ffffff',
      accentColor: '#ff0000',
      playerTemplate: 'boombox'
    },
    linerNotes: { title: 'Greatest Hits' }
  };

  it('encodes and decodes a mixtape object losslessly', () => {
    const encoded = encodeMixtape(mockData);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeMixtape(encoded);
    expect(decoded).toEqual(mockData);
  });

  it('returns null when decoding an invalid string', () => {
    const decoded = decodeMixtape('invalid-base64-string!!!');
    expect(decoded).toBeNull();
  });
});
