import type { Track, AudioState, AudioController } from '../types/index';

export function createHTML5Controller(
  tracks: Track[],
  onStateChange: (state: AudioState) => void
): AudioController {
  const audio = new Audio();
  let currentTrackIndex = 0;
  let animationFrameId: number | null = null;

  const getState = (): AudioState => ({
    isPlaying: !audio.paused && !audio.ended,
    currentTrackIndex,
    progress: audio.duration ? audio.currentTime / audio.duration : 0,
    duration: audio.duration || 0,
    currentTime: audio.currentTime || 0,
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
    // Auto-advance to next track
    if (currentTrackIndex < tracks.length - 1) {
      loadTrack(currentTrackIndex + 1);
      audio.play();
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
