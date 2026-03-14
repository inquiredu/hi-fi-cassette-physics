import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudio } from './useAudio';
import type { Track } from '../types';

const mockTracks: Track[] = [
  { id: '1', title: 'Track One', artist: 'Artist', side: 'A', duration: 100, source: { type: 'url', url: '1.mp3' } },
  { id: '2', title: 'Track Two', artist: 'Artist', side: 'B', duration: 200, source: { type: 'url', url: '2.mp3' } },
];

describe('useAudio', () => {
  it('initializes with paused state and track 0', () => {
    const { result } = renderHook(() => useAudio(mockTracks));
    
    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.currentTrackIndex).toBe(0);
    expect(result.current.currentTrack?.id).toBe('1');
  });

  it('can toggle play/pause state', async () => {
    const { result } = renderHook(() => useAudio(mockTracks));

    // Initially paused
    expect(result.current.state.isPlaying).toBe(false);

    // Call play
    act(() => {
      result.current.play();
    });
    
    expect(result.current.state.isPlaying).toBe(true);

    // Call pause
    act(() => {
      result.current.pause();
    });

    expect(result.current.state.isPlaying).toBe(false);
  });

  it('can navigate to next and prev tracks', () => {
    const { result } = renderHook(() => useAudio(mockTracks));

    // Next track
    act(() => {
      result.current.next();
    });
    expect(result.current.state.currentTrackIndex).toBe(1);
    expect(result.current.currentTrack?.id).toBe('2');

    // Prev track
    act(() => {
      result.current.prev();
    });
    expect(result.current.state.currentTrackIndex).toBe(0);
  });
  
  it('can go to a specific track index directly', () => {
    const { result } = renderHook(() => useAudio(mockTracks));

    act(() => {
      result.current.goToTrack(1);
    });
    expect(result.current.state.currentTrackIndex).toBe(1);
  });
});
