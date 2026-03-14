import { useRef, useCallback, useEffect } from 'react';

// Using Web Audio API to synthesize a mechanical "click-clack" sound.
// This avoids relying on external MP3 assets and guarantees zero latency.
export function useSoundEffects() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize ctx on first user interaction to bypass autoplay restrictions
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playClick = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Quick metallic click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Low frequency to simulate physical resonance
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);

    // Sharp attack and quick decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }, []);

  return { playClick };
}
