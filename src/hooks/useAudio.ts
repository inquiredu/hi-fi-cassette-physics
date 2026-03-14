import { useState, useEffect, useRef, useCallback } from 'react';
import type { Track, AudioState, AudioController } from '../types/index';
import { createHTML5Controller } from '../audio/html5';

const initialState: AudioState = {
  isPlaying: false,
  currentTrackIndex: 0,
  progress: 0,
  duration: 0,
  currentTime: 0,
  needsFlip: false,
};

export function useAudio(tracks: Track[]) {
  const [state, setState] = useState<AudioState>(initialState);
  const controllerRef = useRef<AudioController | null>(null);

  useEffect(() => {
    if (tracks.length === 0) return;

    // Create the audio controller
    const controller = createHTML5Controller(tracks, setState);
    controllerRef.current = controller;

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [tracks]);

  const play = useCallback(() => {
    controllerRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    controllerRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    controllerRef.current?.toggle();
  }, []);

  const seek = useCallback((seconds: number) => {
    controllerRef.current?.seek(seconds);
  }, []);

  const seekToPercent = useCallback((percent: number) => {
    controllerRef.current?.seekToPercent(percent);
  }, []);

  const next = useCallback(() => {
    controllerRef.current?.next();
  }, []);

  const prev = useCallback(() => {
    controllerRef.current?.prev();
  }, []);

  const goToTrack = useCallback((index: number) => {
    controllerRef.current?.goToTrack(index);
  }, []);

  const flipTape = useCallback(() => {
    controllerRef.current?.flipTape();
  }, []);

  return {
    state,
    currentTrack: tracks[state.currentTrackIndex] || null,
    play,
    pause,
    toggle,
    seek,
    seekToPercent,
    next,
    prev,
    goToTrack,
    flipTape,
  };
}
