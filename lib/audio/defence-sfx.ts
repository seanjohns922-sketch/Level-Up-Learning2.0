"use client";

/**
 * Synthesised sounds for the Protect the Tower items: a laser zap, an alarm, a robot bark, a sentry beep
 * and a scanner lock-on. No audio files. They follow the same device sounds setting as the streak sounds,
 * so they stay silent unless the learner has turned sounds on (important in a classroom).
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
function play(name: string, gap: number, voice: (audio: AudioContext, at: number) => void) {
  const audio = context();
  if (!audio) return;
  const now = audio.currentTime;
  if (now - (lastPlayed.get(name) ?? -Infinity) < gap) return;
  lastPlayed.set(name, now);
  voice(audio, now);
}

function tone(audio: AudioContext, at: number, { type, from, to, length, volume }: { type: OscillatorType; from: number; to: number; length: number; volume: number }) {
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

export const defenceSounds = {
  zap: () => play("zap", 0.6, (a, t) => { tone(a, t, { type: "sawtooth", from: 1400, to: 90, length: 0.22, volume: 0.18 }); tone(a, t + 0.03, { type: "square", from: 2200, to: 400, length: 0.12, volume: 0.06 }); }),
  alarm: () => play("alarm", 2.4, (a, t) => { for (let i = 0; i < 4; i++) tone(a, t + i * 0.5, { type: "square", from: 660, to: 990, length: 0.45, volume: 0.07 }); }),
  bark: () => play("bark", 1.5, (a, t) => { tone(a, t, { type: "square", from: 520, to: 260, length: 0.12, volume: 0.12 }); tone(a, t + 0.18, { type: "square", from: 560, to: 280, length: 0.12, volume: 0.12 }); }),
  beep: () => play("beep", 1.5, (a, t) => { tone(a, t, { type: "sine", from: 880, to: 880, length: 0.1, volume: 0.1 }); tone(a, t + 0.13, { type: "sine", from: 1320, to: 1320, length: 0.14, volume: 0.1 }); }),
  lock: () => play("lock", 2, (a, t) => tone(a, t, { type: "triangle", from: 300, to: 1600, length: 0.35, volume: 0.09 })),
};
