import type { Track, AudioState, AudioController } from '../types/index';

export function createHTML5Controller(
  tracks: Track[],
  onStateChange: (state: AudioState) => void
): AudioController {
  const audio = new Audio();
  let currentTrackIndex = 0;
  let animationFrameId: number | null = null;
  let isPendingFlip = false;

  const getState = (): AudioState => ({
    isPlaying: !audio.paused && !audio.ended && !isPendingFlip,
    currentTrackIndex,
    progress: audio.duration ? audio.currentTime / audio.duration : 0,
    duration: audio.duration || 0,
    currentTime: audio.currentTime || 0,
    needsFlip: isPendingFlip,
  });

  const emitState = () => {
    onStateChange(getState());
  };

  // Animation loop for smooth progress updates
  const startProgressLoop = () => {
    const tick = () => {
      emitState();
      animationFrameId = requestAnimationFrame(tick);
    };
    tick();
  };

  const stopProgressLoop = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  const loadTrack = (index: number) => {
    if (index < 0 || index >= tracks.length) return;
    
    currentTrackIndex = index;
    isPendingFlip = false; // Using direct load clears flip state
    const track = tracks[index];

    // Get the actual URL based on source type
    let url: string;
    if (track.source.type === 'url') {
      url = track.source.url;
    } else if (track.source.type === 'dropbox') {
      // Convert Dropbox share link to direct download
      url = track.source.shareLink.replace('dl=0', 'dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    } else {
      // SoundCloud requires different handling (widget API)
      console.warn('SoundCloud sources not yet supported in HTML5 controller');
      return;
    }

    audio.src = url;
    audio.load();
    emitState();
  };

  // Event listeners
  audio.addEventListener('play', () => {
    startProgressLoop();
    emitState();
  });

  audio.addEventListener('pause', () => {
    stopProgressLoop();
    emitState();
  });

  audio.addEventListener('ended', () => {
    stopProgressLoop();
    // Auto-advance to next track unless it hits a side boundary
    if (currentTrackIndex < tracks.length - 1) {
      const currentSide = tracks[currentTrackIndex]?.side;
      const nextSide = tracks[currentTrackIndex + 1]?.side;
      
      if (currentSide !== nextSide && currentSide !== undefined) {
        // Hit the end of a side! Pause and require manual flip.
        isPendingFlip = true;
        emitState();
      } else {
        loadTrack(currentTrackIndex + 1);
        audio.play().catch(console.error);
      }
    } else {
      emitState();
    }
  });

  audio.addEventListener('loadedmetadata', emitState);
  audio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    stopProgressLoop();
    emitState();
  });

  // Load first track
  if (tracks.length > 0) {
    loadTrack(0);
  }

  return {
    play: () => {
      audio.play().catch(console.error);
    },

    pause: () => {
      audio.pause();
    },

    toggle: () => {
      if (audio.paused) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    },

    seek: (seconds: number) => {
      audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
      emitState();
    },

    seekToPercent: (percent: number) => {
      if (audio.duration) {
        audio.currentTime = percent * audio.duration;
        emitState();
      }
    },

    next: () => {
      if (currentTrackIndex < tracks.length - 1) {
        const wasPlaying = !audio.paused;
        const currentSide = tracks[currentTrackIndex]?.side;
        const nextSide = tracks[currentTrackIndex + 1]?.side;
        
        if (currentSide !== nextSide && currentSide !== undefined && !isPendingFlip) {
          audio.pause();
          isPendingFlip = true;
          emitState();
          return;
        }

        loadTrack(currentTrackIndex + 1);
        if (wasPlaying) audio.play().catch(console.error);
      }
    },

    prev: () => {
      // If more than 3 seconds in, restart current track
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        emitState();
      } else if (currentTrackIndex > 0) {
        const wasPlaying = !audio.paused;
        loadTrack(currentTrackIndex - 1);
        if (wasPlaying) audio.play().catch(console.error);
      }
    },

    goToTrack: (index: number) => {
      if (index >= 0 && index < tracks.length) {
        const wasPlaying = !audio.paused;
        loadTrack(index);
        if (wasPlaying) audio.play().catch(console.error);
      }
    },

    flipTape: () => {
      if (isPendingFlip && currentTrackIndex < tracks.length - 1) {
        loadTrack(currentTrackIndex + 1);
        audio.play().catch(console.error);
      } else if (tracks.length > 0) {
        // Manual flip resets to beginning of other side if they just clicked the button
        const currentSide = tracks[currentTrackIndex]?.side;
        const otherSide = currentSide === 'A' ? 'B' : 'A';
        const otherSideFirstIndex = tracks.findIndex(t => t.side === otherSide);
        if (otherSideFirstIndex !== -1) {
          loadTrack(otherSideFirstIndex);
          audio.play().catch(console.error);
        }
      }
    },

    get state() {
      return getState();
    },

    destroy: () => {
      stopProgressLoop();
      audio.pause();
      audio.src = '';
    },
  };
}
