import { Track } from '../types';

/**
 * Extract playlist ID from various Spotify URL formats
 */
export function extractSpotifyPlaylistId(url: string): string | null {
  // Handle various formats:
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
  // spotify:playlist:37i9dQZF1DXcBWIGoYBM5M

  const patterns = [
    /spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
    /spotify:playlist:([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Fetch playlist info using Spotify's oEmbed API (no auth required for public playlists)
 * Returns basic info - title and thumbnail
 */
export async function fetchSpotifyPlaylistInfo(playlistUrl: string): Promise<{
  title: string;
  thumbnail: string;
} | null> {
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(playlistUrl)}`;
    const response = await fetch(oembedUrl);

    if (!response.ok) return null;

    const data = await response.json();
    return {
      title: data.title || 'Spotify Playlist',
      thumbnail: data.thumbnail_url || '',
    };
  } catch (error) {
    console.error('Error fetching Spotify oEmbed:', error);
    return null;
  }
}

/**
 * Fetch tracks from a Spotify playlist using the Spotify embed page
 * This scrapes the embed page which contains track data
 *
 * Note: This is a workaround since the full API requires OAuth.
 * For production, you'd want a proper backend with Spotify API integration.
 */
export async function fetchSpotifyPlaylistTracks(playlistUrl: string): Promise<{
  name: string;
  tracks: Track[];
} | null> {
  const playlistId = extractSpotifyPlaylistId(playlistUrl);
  if (!playlistId) {
    console.error('Invalid Spotify playlist URL');
    return null;
  }

  try {
    // Use the embed endpoint which returns JSON data
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;

    // Fetch through a CORS proxy or directly if allowed
    // Note: This may not work directly from browser due to CORS
    // In production, this should go through your own backend
    const response = await fetch(embedUrl, {
      headers: {
        'Accept': 'text/html',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Parse the embedded data from the HTML
    // Spotify embeds include a script tag with __PRELOADED_STATE__ or resource data
    const tracks = parseSpotifyEmbedHtml(html);

    if (tracks.length > 0) {
      return {
        name: 'Spotify Playlist',
        tracks
      };
    }

    // Fallback: try the oEmbed API for at least the title
    const info = await fetchSpotifyPlaylistInfo(playlistUrl);
    return {
      name: info?.title || 'Spotify Playlist',
      tracks: []
    };

  } catch (error) {
    console.error('Error fetching Spotify playlist:', error);

    // Return null to indicate failure - UI should show an error
    return null;
  }
}

/**
 * Parse track data from Spotify embed HTML
 */
function parseSpotifyEmbedHtml(html: string): Track[] {
  const tracks: Track[] = [];

  try {
    // Look for the embedded JSON data in the HTML
    // Spotify embeds track data in a script tag
    const scriptMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/);

    if (scriptMatch) {
      const data = JSON.parse(scriptMatch[1]);
      const entities = data?.props?.pageProps?.state?.data?.entity;

      if (entities?.trackList) {
        for (const track of entities.trackList) {
          tracks.push({
            id: crypto.randomUUID(),
            title: `${track.artists?.[0]?.name || 'Unknown'} - ${track.title || 'Unknown Track'}`,
            duration: formatDuration(track.duration || 0)
          });
        }
      }
    }

    // Alternative: look for resource data
    if (tracks.length === 0) {
      const resourceMatch = html.match(/Spotify\.Entity\s*=\s*({.+?});/s);
      if (resourceMatch) {
        const data = JSON.parse(resourceMatch[1]);
        if (data?.tracks?.items) {
          for (const item of data.tracks.items) {
            const track = item.track || item;
            tracks.push({
              id: crypto.randomUUID(),
              title: `${track.artists?.[0]?.name || 'Unknown'} - ${track.name || 'Unknown Track'}`,
              duration: formatDuration(track.duration_ms || 0)
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing Spotify embed HTML:', error);
  }

  return tracks;
}

/**
 * Format milliseconds to MM:SS
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Validate if a URL is a valid Spotify playlist URL
 */
export function isSpotifyPlaylistUrl(url: string): boolean {
  return extractSpotifyPlaylistId(url) !== null;
}

/**
 * Get the Spotify embed URL for a playlist
 */
export function getSpotifyEmbedUrl(playlistUrl: string): string | null {
  const playlistId = extractSpotifyPlaylistId(playlistUrl);
  if (!playlistId) return null;
  return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
}
