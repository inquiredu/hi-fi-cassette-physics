import React, { useEffect, useRef, useState } from 'react';
import { extractSpotifyPlaylistId } from '../utils/spotifyUtils';

interface SpotifyPlayerProps {
  playlistUrl: string;
  isPlaying: boolean;
  onReady?: () => void;
}

/**
 * Embedded Spotify player component
 * Uses Spotify's iframe embed which allows playback of full tracks (with Spotify account)
 */
export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  playlistUrl,
  isPlaying,
  onReady
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const playlistId = extractSpotifyPlaylistId(playlistUrl);

  if (!playlistId) {
    return null;
  }

  // Spotify embed URL with theme settings
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

  return (
    <div className="w-full">
      <iframe
        src={embedUrl}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-xl"
        onLoad={() => {
          setIsLoaded(true);
          onReady?.();
        }}
      />
      {!isLoaded && (
        <div className="h-[352px] bg-gray-800 rounded-xl flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading Spotify...</div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact Spotify player that shows in the cassette deck area
 */
export const SpotifyCompactPlayer: React.FC<{
  playlistUrl: string;
  className?: string;
}> = ({ playlistUrl, className = '' }) => {
  const playlistId = extractSpotifyPlaylistId(playlistUrl);

  if (!playlistId) {
    return null;
  }

  // Compact embed URL
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

  return (
    <div className={`w-full ${className}`}>
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-xl"
      />
    </div>
  );
};
