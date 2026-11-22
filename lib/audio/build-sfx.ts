"use client";

/** Building sounds: a soft thock when something goes down, a low buzz when it can't. */
import { playSynth, synthTone } from "./synth";

export const buildSounds = {
  place: () => playSynth("build-place", 0.08, (a, t) => {
    synthTone(a, t, { type: "triangle", from: 240, to: 95, length: 0.16, volume: 0.22 });
    synthTone(a, t + 0.02, { type: "sine", from: 900, to: 1500, length: 0.12, volume: 0.06 });
  }),
  blocked: () => playSynth("build-blocked", 0.4, (a, t) => synthTone(a, t, { type: "square", from: 150, to: 120, length: 0.16, volume: 0.06 })),
  pick: () => playSynth("build-pick", 0.08, (a, t) => synthTone(a, t, { type: "sine", from: 700, to: 1100, length: 0.07, volume: 0.07 })),
};
