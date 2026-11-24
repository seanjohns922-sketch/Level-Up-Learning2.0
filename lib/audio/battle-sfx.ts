"use client";

/**
 * The Battle Arena's sounds, all made on the fly: the crowd, the countdown, the launch, the crackle of a
 * beam surging, POWER UP, the crash when a top is blasted out, and a fanfare for the winner. Like Rex
 * they're on unless muted on this device (the speaker in the arena), since a battle is meant to be loud.
 */
import { makeSoundSwitch } from "./sound-switch";
import { noiseSource, playSynth, synthTone } from "./synth";

const battleSwitch = makeSoundSwitch("reliq:battle:muted");
export const battleSoundsOn = battleSwitch.on, setBattleMuted = battleSwitch.setMuted, subscribeBattleMute = battleSwitch.subscribe;

/** Noise through a filter with a rise and a fall: a crowd, a whoosh, a rumble. */
function filteredNoise(audio: AudioContext, at: number, { type, from, to = from, q = 0.8, rise, hold = 0, fall, volume }: { type: BiquadFilterType; from: number; to?: number; q?: number; rise: number; hold?: number; fall: number; volume: number }) {
  const length = rise + hold + fall;
  const filter = audio.createBiquadFilter(), gain = audio.createGain();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, at);
  filter.frequency.exponentialRampToValueAtTime(Math.max(20, to), at + length);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + rise);
  gain.gain.setValueAtTime(volume, at + rise + hold);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  noiseSource(audio, at, length).connect(filter).connect(gain).connect(audio.destination);
}

function crowdVoice(audio: AudioContext, at: number, loud: number) {
  // A wide band of voices, with a brighter "woo" over the top.
  filteredNoise(audio, at, { type: "bandpass", from: 700, to: 900, q: 0.5, rise: 0.35, hold: 0.6, fall: 1.6, volume: 0.32 * loud });
  filteredNoise(audio, at + 0.1, { type: "bandpass", from: 1800, to: 2400, q: 1.2, rise: 0.3, hold: 0.3, fall: 1, volume: 0.12 * loud });
}

function launchVoice(audio: AudioContext, at: number) {
  filteredNoise(audio, at, { type: "bandpass", from: 300, to: 3200, q: 1.4, rise: 0.08, fall: 0.6, volume: 0.5 });
  synthTone(audio, at, { type: "sine", from: 120, to: 40, length: 0.4, volume: 0.5 });
}

function surgeVoice(audio: AudioContext, at: number, pitch: number) {
  synthTone(audio, at, { type: "sawtooth", from: 220 * pitch, to: 880 * pitch, length: 0.18, volume: 0.12 });
  for (const offset of [0, 0.05, 0.11]) filteredNoise(audio, at + offset, { type: "highpass", from: 2600, rise: 0.004, fall: 0.05, volume: 0.22 });
}

function crashVoice(audio: AudioContext, at: number) {
  synthTone(audio, at, { type: "sine", from: 95, to: 28, length: 0.9, volume: 0.8 });
  filteredNoise(audio, at, { type: "lowpass", from: 2400, to: 160, rise: 0.01, fall: 1.3, volume: 0.6 });
  // Bits of the top clattering away.
  for (const offset of [0.25, 0.42, 0.55]) filteredNoise(audio, at + offset, { type: "bandpass", from: 3000, q: 3, rise: 0.003, fall: 0.06, volume: 0.25 });
}

function notes(audio: AudioContext, at: number, type: OscillatorType, pitches: number[], step: number, length: number, volume: number) {
  pitches.forEach((pitch, i) => synthTone(audio, at + i * step, { type, from: pitch, to: pitch, length, volume }));
}

export const battleSounds = {
  /** The crowd going up: louder for the launch and the win. */
  cheer: (loud = 0.7) => playSynth("battle-crowd", 0.8, (a, t) => crowdVoice(a, t, loud), battleSoundsOn),
  /** 3, 2, 1 (`go` for LAUNCH). */
  count: (go = false) => playSynth(go ? "battle-go" : "battle-count", 0.5, (a, t) => synthTone(a, t, { type: "square", from: go ? 988 : 659, to: go ? 988 : 659, length: go ? 0.45 : 0.16, volume: 0.14 }), battleSoundsOn),
  launch: () => playSynth("battle-launch", 1, launchVoice, battleSoundsOn),
  /** A right answer: my beam crackles forward. The friend's surge is a little lower. */
  surge: (mine = true) => playSynth(mine ? "battle-surge" : "battle-friend-surge", 0.12, (a, t) => surgeVoice(a, t, mine ? 1 : 0.75), battleSoundsOn),
  miss: () => playSynth("battle-miss", 0.2, (a, t) => synthTone(a, t, { type: "sine", from: 320, to: 170, length: 0.22, volume: 0.12 }), battleSoundsOn),
  powerUp: () => playSynth("battle-power", 1, (a, t) => notes(a, t, "square", [523, 659, 784, 1047], 0.07, 0.14, 0.1), battleSoundsOn),
  /** The last ten seconds. */
  tick: () => playSynth("battle-tick", 0.6, (a, t) => synthTone(a, t, { type: "triangle", from: 1400, to: 1300, length: 0.05, volume: 0.08 }), battleSoundsOn),
  crash: () => playSynth("battle-crash", 1, crashVoice, battleSoundsOn),
  fanfare: () => playSynth("battle-fanfare", 2, (a, t) => { notes(a, t, "triangle", [523, 659, 784], 0.12, 0.2, 0.16); notes(a, t + 0.36, "triangle", [523, 659, 784, 1047], 0, 0.9, 0.1); }, battleSoundsOn),
};
