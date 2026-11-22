"use client";

/** Car sounds: a friendly two-tone horn. Silent unless the learner has turned sounds on. */
import { playSynth, synthTone } from "./synth";

export const carSounds = {
  horn: () => playSynth("car-horn", 0.35, (a, t) => {
    synthTone(a, t, { type: "square", from: 415, to: 415, length: 0.32, volume: 0.07 });
    synthTone(a, t, { type: "square", from: 523, to: 523, length: 0.32, volume: 0.05 });
  }),
};
