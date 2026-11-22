"use client";

/**
 * Tiny synthesised sound effects: no audio files. They follow the device sounds setting the streak
 * sounds use, so they stay silent unless the learner has turned sounds on (important in a classroom).
 */
import { streakSoundsEnabled } from "./streak-sfx";

let ctx: AudioContext | null = null;
const lastPlayed = new Map<string, number>();

function context(): AudioContext | null {
  if (typeof window === "undefined" || !streakSoundsEnabled()) return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Plays at most once per `gap` seconds, so a learner standing at a fence doesn't get a wall of noise. */
export function playSynth(name: string, gap: number, voice: (audio: AudioContext, at: number) => void) {
  const audio = context();
  if (!audio) return;
  const now = audio.currentTime;
  if (now - (lastPlayed.get(name) ?? -Infinity) < gap) return;
  lastPlayed.set(name, now);
  voice(audio, now);
}

export function synthTone(audio: AudioContext, at: number, { type, from, to, length, volume }: { type: OscillatorType; from: number; to: number; length: number; volume: number }) {
  const osc = audio.createOscillator(), gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), at + length);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}
