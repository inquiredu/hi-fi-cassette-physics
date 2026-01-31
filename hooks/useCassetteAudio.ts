import { useRef, useEffect, useCallback } from 'react';
import { TransportMode } from '../types';

export const useCassetteAudio = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const motorOscillator = useRef<OscillatorNode | null>(null);
  const motorGain = useRef<GainNode | null>(null);
  const whirSource = useRef<AudioBufferSourceNode | null>(null);
  const whirGain = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const getContext = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
    return audioContext.current;
  }, []);

  // Helper to create noise buffer
  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const playClick = useCallback(() => {
    const ctx = getContext();
    const t = ctx.currentTime;

    // Hard click (solenoid)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.start(t);
    osc.stop(t + 0.05);

    // Mechanical thud
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(150, t);
    osc2.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    gain2.gain.setValueAtTime(0.5, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc2.start(t);
    osc2.stop(t + 0.15);
  }, [getContext]);

  const playThunk = useCallback(() => {
    const ctx = getContext();
    const t = ctx.currentTime;

    // Heavy mechanical stop sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.start(t);
    osc.stop(t + 0.2);
  }, [getContext]);

  const startMotor = useCallback((mode: TransportMode) => {
    const ctx = getContext();
    const t = ctx.currentTime;

    // Stop existing motor sounds
    if (motorOscillator.current) {
      motorOscillator.current.stop();
      motorOscillator.current.disconnect();
    }
    if (whirSource.current) {
        whirSource.current.stop();
        whirSource.current.disconnect();
    }

    // 1. Base Motor Hum (Low frequency)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine'; // Smooth motor
    osc.frequency.setValueAtTime(60, t); // 60Hz hum

    // Different motor speeds/sounds for modes
    if (mode === 'playing') {
        osc.frequency.setValueAtTime(60, t);
        gain.gain.setValueAtTime(0.05, t); // Quiet hum
    } else if (mode === 'rewinding' || mode === 'fast_forwarding') {
        osc.frequency.setValueAtTime(120, t); // Faster motor
        gain.gain.setValueAtTime(0.1, t); // Louder hum

        // Add high-speed whir (noise)
        const noiseBuffer = createNoiseBuffer(ctx);
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const noiseGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        source.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t);
        filter.Q.value = 5;

        noiseGain.gain.setValueAtTime(0.1, t);

        source.start(t);
        whirSource.current = source;
        whirGain.current = noiseGain;
    } else {
        return; // Stopped/Paused
    }

    osc.start(t);
    motorOscillator.current = osc;
    motorGain.current = gain;

  }, [getContext]);

  const stopMotor = useCallback(() => {
    const t = getContext().currentTime;

    if (motorOscillator.current && motorGain.current) {
        motorGain.current.gain.setTargetAtTime(0, t, 0.1);
        motorOscillator.current.stop(t + 0.2);
        motorOscillator.current = null;
        motorGain.current = null;
    }

    if (whirSource.current && whirGain.current) {
        whirGain.current.gain.setTargetAtTime(0, t, 0.1);
        whirSource.current.stop(t + 0.2);
        whirSource.current = null;
        whirGain.current = null;
    }
  }, [getContext]);

  return { playClick, playThunk, startMotor, stopMotor };
};
