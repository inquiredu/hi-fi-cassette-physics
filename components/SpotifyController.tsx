import React, { useEffect, useRef, useState, useCallback } from 'react';
import { extractSpotifyPlaylistId } from '../utils/spotifyUtils';

interface SpotifyControllerProps {
  playlistUrl: string;
  isPlaying: boolean;
  onPlaybackChange?: (isPlaying: boolean) => void;
  onTrackChange?: (trackName: string, position: number, duration: number) => void;
  onReady?: () => void;
}

/**
 * Hidden Spotify embed controller
 *
 * This component renders a visually hidden Spotify embed and provides
 * programmatic control via postMessage API.
 *
 * Known working commands:
 * - { command: 'toggle' } - toggles play/pause
 * - { command: 'pause' } - pauses playback
 *
 * The iFrame API with full control (play, seek, etc.) is officially
 * only supported for podcasts, but we use what's available for playlists.
 */
export const SpotifyController: React.FC<SpotifyControllerProps> = ({
  playlistUrl,
  isPlaying,
  onPlaybackChange,
  onTrackChange,
  onReady,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controllerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [internalPlaying, setInternalPlaying] = useState(false);
  const lastCommandRef = useRef<'play' | 'pause' | null>(null);

  const playlistId = extractSpotifyPlaylistId(playlistUrl);

  // Send postMessage command to iframe
  const sendCommand = useCallback((command: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ command }, '*');
    }
  }, []);

  // Sync with external isPlaying prop
  useEffect(() => {
    if (!isLoaded) return;

    if (isPlaying && !internalPlaying) {
      // Need to play - use toggle
      sendCommand('toggle');
      setInternalPlaying(true);
      lastCommandRef.current = 'play';
    } else if (!isPlaying && internalPlaying) {
      // Need to pause
      sendCommand('pause');
      setInternalPlaying(false);
      lastCommandRef.current = 'pause';
    }
  }, [isPlaying, internalPlaying, isLoaded, sendCommand]);

  // Try to use the official iFrame API (works better for some content)
  useEffect(() => {
    if (!playlistId) return;

    // Load the Spotify iFrame API script
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    document.body.appendChild(script);

    // Global callback when API is ready
    (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
      const element = document.getElementById('spotify-embed-controller');
      if (!element) return;

      const options = {
        uri: `spotify:playlist:${playlistId}`,
        width: '100%',
        height: '80',
      };

      const callback = (controller: any) => {
        controllerRef.current = controller;

        // Listen for playback updates
        controller.addListener('playback_update', (e: any) => {
          const { isPaused, position, duration } = e.data;
          setInternalPlaying(!isPaused);
          onPlaybackChange?.(!isPaused);

          if (duration > 0) {
            onTrackChange?.('', position, duration);
          }
        });

        controller.addListener('ready', () => {
          setIsLoaded(true);
          onReady?.();
        });
      };

      IFrameAPI.createController(element, options, callback);
    };

    return () => {
      document.body.removeChild(script);
      delete (window as any).onSpotifyIframeApiReady;
    };
  }, [playlistId, onPlaybackChange, onTrackChange, onReady]);

  // Fallback: Simple iframe load detection
  const handleIframeLoad = () => {
    setIsLoaded(true);
    onReady?.();
  };

  if (!playlistId) return null;

  // Use standard embed URL - the iFrame API will try to upgrade it
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

  return (
    <div
      id="spotify-embed-controller"
      className="fixed -bottom-96 left-0 right-0 opacity-0 pointer-events-none"
      aria-hidden="true"
    >
      {/* Fallback iframe if iFrame API doesn't work */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="eager"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

/**
 * Hook for controlling Spotify playback
 */
export const useSpotifyControl = () => {
  const sendToSpotify = useCallback((command: 'toggle' | 'pause') => {
    const iframe = document.querySelector('iframe[src*="spotify.com/embed"]') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ command }, '*');
    }
  }, []);

  return {
    toggle: () => sendToSpotify('toggle'),
    pause: () => sendToSpotify('pause'),
  };
};
