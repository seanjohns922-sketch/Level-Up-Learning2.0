"use client";

/**
 * Synthesised sounds for the Protect the Tower items: a laser zap, an alarm, a robot bark, a sentry beep
 * and a scanner lock-on. No audio files; silent unless the learner has turned sounds on.
 */
import { playSynth, synthTone } from "./synth";

export const defenceSounds = {
  zap: () => playSynth("zap", 0.6, (a, t) => { synthTone(a, t, { type: "sawtooth", from: 1400, to: 90, length: 0.22, volume: 0.18 }); synthTone(a, t + 0.03, { type: "square", from: 2200, to: 400, length: 0.12, volume: 0.06 }); }),
  alarm: () => playSynth("alarm", 2.4, (a, t) => { for (let i = 0; i < 4; i++) synthTone(a, t + i * 0.5, { type: "square", from: 660, to: 990, length: 0.45, volume: 0.07 }); }),
  bark: () => playSynth("bark", 1.5, (a, t) => { synthTone(a, t, { type: "square", from: 520, to: 260, length: 0.12, volume: 0.12 }); synthTone(a, t + 0.18, { type: "square", from: 560, to: 280, length: 0.12, volume: 0.12 }); }),
  beep: () => playSynth("beep", 1.5, (a, t) => { synthTone(a, t, { type: "sine", from: 880, to: 880, length: 0.1, volume: 0.1 }); synthTone(a, t + 0.13, { type: "sine", from: 1320, to: 1320, length: 0.14, volume: 0.1 }); }),
  lock: () => playSynth("lock", 2, (a, t) => synthTone(a, t, { type: "triangle", from: 300, to: 1600, length: 0.35, volume: 0.09 })),
};
