import '@testing-library/jest-dom';

// Mock window.Audio for useAudio tests
class AudioMock {
  src = '';
  paused = true;
  currentTime = 0;
  duration = 100; // default duration mock
  
  // Event listeners map
  _listeners: Record<string, Function[]> = {};

  play() {
    this.paused = false;
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }

  load() {
    // Stub for HTMLMediaElement.load()
    this.dispatchEvent(new Event('canplaythrough'));
  }
  
  addEventListener(event: string, cb: Function) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  removeEventListener(event: string, cb: Function) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(l => l !== cb);
  }

  dispatchEvent(event: any) {
    const listeners = this._listeners[event.type] || [];
    listeners.forEach(cb => cb(event));
    return true;
  }
  
  // Helper to simulate timeupdate or ending
  simulateEnded() {
    this.dispatchEvent(new Event('ended'));
  }
}

global.Audio = AudioMock as any;
