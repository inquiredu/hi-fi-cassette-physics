import { JCardConfig } from '../types';

/**
 * Encodes the JCardConfig into a base64 string for URL sharing.
 * We use JSON.stringify -> btoa (base64) to create a portable string.
 * We also handle unicode characters properly.
 */
export const encodeConfig = (config: JCardConfig): string => {
  try {
    const jsonString = JSON.stringify(config);
    // Handle unicode characters by escaping them before btoa
    const base64 = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    return base64;
  } catch (e) {
    console.error('Failed to encode config:', e);
    return '';
  }
};

/**
 * Decodes a base64 string back into a JCardConfig object.
 */
export const decodeConfig = (encoded: string): JCardConfig | null => {
  try {
    // Decode base64 -> percent encoded string -> original JSON string
    const jsonString = decodeURIComponent(atob(encoded).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonString) as JCardConfig;
  } catch (e) {
    console.error('Failed to decode config:', e);
    return null;
  }
};
