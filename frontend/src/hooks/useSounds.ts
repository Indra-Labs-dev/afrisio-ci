import { useCallback, useRef } from "react";

// Simple sounds using the Web Audio API — no external files needed
function createAudioContext() {
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  try {
    const ctx = createAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Silently ignore if audio not available
  }
}

function playCorrectSound() {
  // Ascending "ding ding" — feels like success
  playTone(523.25, 0.15, "sine", 0.12); // C5
  setTimeout(() => playTone(659.25, 0.15, "sine", 0.12), 100); // E5
  setTimeout(() => playTone(783.99, 0.2, "sine", 0.12), 200);  // G5
}

function playWrongSound() {
  // Low descending blip — feels like an error
  playTone(300, 0.1, "square", 0.08);
  setTimeout(() => playTone(220, 0.18, "square", 0.08), 100);
}

function playWinSound() {
  // Victory fanfare
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, "sine", 0.12), i * 120);
  });
}

function playClickSound() {
  playTone(800, 0.05, "sine", 0.05);
}

interface SoundOptions {
  enabled: boolean;
}

export function useSounds() {
  const enabledRef = useRef<boolean>(() => {
    const saved = localStorage.getItem("afrisio-sounds");
    return saved !== "false";
  });

  const isSoundEnabled = useCallback(() => {
    const saved = localStorage.getItem("afrisio-sounds");
    return saved !== "false";
  }, []);

  const correct = useCallback(() => {
    if (isSoundEnabled()) playCorrectSound();
  }, [isSoundEnabled]);

  const wrong = useCallback(() => {
    if (isSoundEnabled()) playWrongSound();
  }, [isSoundEnabled]);

  const win = useCallback(() => {
    if (isSoundEnabled()) playWinSound();
  }, [isSoundEnabled]);

  const click = useCallback(() => {
    if (isSoundEnabled()) playClickSound();
  }, [isSoundEnabled]);

  const toggleSounds = useCallback(() => {
    const current = isSoundEnabled();
    localStorage.setItem("afrisio-sounds", String(!current));
    return !current;
  }, [isSoundEnabled]);

  return { correct, wrong, win, click, toggleSounds, isSoundEnabled };
}
