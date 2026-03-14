import LZString from 'lz-string';
import type { Mixtape } from '../types';

/**
 * Encodes a mixtape object into a compressed, URL-safe Base64 string.
 */
export function encodeMixtape(mixtape: Partial<Mixtape>): string {
  try {
    const jsonStr = JSON.stringify(mixtape);
    // Compress and encode to URL-safe Base64
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    return compressed;
  } catch (err) {
    console.error('Failed to encode mixtape:', err);
    return '';
  }
}

/**
 * Decodes a compressed, URL-safe Base64 string back into a mixtape object.
 */
export function decodeMixtape(encodedStr: string): Partial<Mixtape> | null {
  try {
    if (!encodedStr) return null;
    
    // Decode and decompress
    const jsonStr = LZString.decompressFromEncodedURIComponent(encodedStr);
    if (!jsonStr) return null;

    const mixtape = JSON.parse(jsonStr) as Partial<Mixtape>;
    return mixtape;
  } catch (err) {
    console.error('Failed to decode mixtape:', err);
    return null;
  }
}
