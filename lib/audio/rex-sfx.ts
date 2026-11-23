"use client";

/**
 * Rex's sounds, made on the fly (no audio files): a deep growling roar, heavy footsteps, a jaw snap and
 * a low contented rumble. Like the other synthesised sounds they stay silent unless the learner has
 * turned sounds on. `near` (0 far .. 1 right beside you) sets how loud he is.
 */
import { playSynth } from "./synth";

let noise: AudioBuffer | null = null;
/** Two seconds of white noise, made once and shared. */
function noiseBuffer(audio: AudioContext) {
  if (noise && noise.sampleRate === audio.sampleRate) return noise;
  noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return noise;
}
/** A soft-clipping curve: grit for the roar. */
function grit(amount: number) {
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) { const x = (i / (curve.length - 1)) * 2 - 1; curve[i] = Math.tanh(x * amount); }
  return curve;
}
/** An envelope: up over `attack`, held, then down to silence by `length`. */
function envelope(gain: GainNode, at: number, peak: number, attack: number, length: number) {
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.setValueAtTime(peak, at + length * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
}
function noiseSource(audio: AudioContext, at: number, length: number) {
  const source = audio.createBufferSource();
  source.buffer = noiseBuffer(audio);
  source.start(at, Math.random());
  source.stop(at + length + 0.05);
  return source;
}

function roarVoice(audio: AudioContext, at: number, loud: number) {
  const length = 1.7 + Math.random() * 0.4, out = audio.createGain();
  envelope(out, at, 0.5 * loud, 0.18, length);
  const shaper = audio.createWaveShaper();
  shaper.curve = grit(3.2);
  shaper.connect(out).connect(audio.destination);
  // The breath: noise through a sweeping band, from a bright snarl down to a deep rumble.
  const band = audio.createBiquadFilter();
  band.type = "bandpass"; band.Q.value = 1.4;
  band.frequency.setValueAtTime(900, at);
  band.frequency.exponentialRampToValueAtTime(380, at + length * 0.4);
  band.frequency.exponentialRampToValueAtTime(160, at + length);
  const breath = audio.createGain(); breath.gain.value = 0.9;
  noiseSource(audio, at, length).connect(band).connect(breath).connect(shaper);
  // The throat: a growling saw that drops in pitch, wobbled fast for the rattle.
  const throat = audio.createOscillator(), wobble = audio.createOscillator(), depth = audio.createGain(), low = audio.createBiquadFilter(), throatGain = audio.createGain();
  throat.type = "sawtooth";
  throat.frequency.setValueAtTime(150, at);
  throat.frequency.exponentialRampToValueAtTime(95, at + length * 0.3);
  throat.frequency.exponentialRampToValueAtTime(52, at + length);
  wobble.frequency.value = 26; depth.gain.value = 18;
  wobble.connect(depth).connect(throat.frequency);
  low.type = "lowpass"; low.frequency.value = 1100;
  throatGain.gain.value = 0.35;
  throat.connect(low).connect(throatGain).connect(shaper);
  // The chest: a sub-bass you feel more than hear.
  const chest = audio.createOscillator(), chestGain = audio.createGain();
  chest.type = "sine";
  chest.frequency.setValueAtTime(60, at);
  chest.frequency.exponentialRampToValueAtTime(34, at + length);
  chestGain.gain.value = 0.5;
  chest.connect(chestGain).connect(out);
  for (const osc of [throat, wobble, chest]) { osc.start(at); osc.stop(at + length + 0.05); }
}

function stompVoice(audio: AudioContext, at: number, loud: number) {
  const thud = audio.createOscillator(), gain = audio.createGain();
  thud.type = "sine";
  thud.frequency.setValueAtTime(75, at);
  thud.frequency.exponentialRampToValueAtTime(32, at + 0.28);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.6 * loud, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
  thud.connect(gain).connect(audio.destination);
  thud.start(at); thud.stop(at + 0.35);
  // The ground crunching under the foot.
  const low = audio.createBiquadFilter(), crunch = audio.createGain();
  low.type = "lowpass"; low.frequency.value = 260;
  crunch.gain.setValueAtTime(0.0001, at);
  crunch.gain.exponentialRampToValueAtTime(0.35 * loud, at + 0.01);
  crunch.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
  noiseSource(audio, at, 0.2).connect(low).connect(crunch).connect(audio.destination);
}

function snapVoice(audio: AudioContext, at: number) {
  // Two hard clacks of teeth and a short snarl.
  for (const offset of [0, 0.09]) {
    const high = audio.createBiquadFilter(), clack = audio.createGain();
    high.type = "highpass"; high.frequency.value = 1400;
    clack.gain.setValueAtTime(0.0001, at + offset);
    clack.gain.exponentialRampToValueAtTime(0.5, at + offset + 0.004);
    clack.gain.exponentialRampToValueAtTime(0.0001, at + offset + 0.06);
    noiseSource(audio, at + offset, 0.07).connect(high).connect(clack).connect(audio.destination);
  }
  roarVoice(audio, at + 0.12, 0.35);
}

function rumbleVoice(audio: AudioContext, at: number, loud: number) {
  // A slow, contented purr: low noise swelling in and out.
  const low = audio.createBiquadFilter(), gain = audio.createGain();
  low.type = "lowpass"; low.frequency.value = 320;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.28 * loud, at + 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
  noiseSource(audio, at, 1.6).connect(low).connect(gain).connect(audio.destination);
}

const loudness = (near: number) => Math.max(0.08, Math.min(1, near));

/** The raw voices, for previewing them into any audio context (the game plays them through `rexSounds`). */
export const REX_VOICES = { roar: roarVoice, stomp: stompVoice, snap: snapVoice, rumble: rumbleVoice } as const;

export const rexSounds = {
  roar: (near = 1) => playSynth("rex-roar", 3, (a, t) => roarVoice(a, t, loudness(near))),
  stomp: (near = 1) => playSynth("rex-stomp", 0.3, (a, t) => stompVoice(a, t, loudness(near))),
  snap: () => playSynth("rex-snap", 0.6, snapVoice),
  rumble: (near = 1) => playSynth("rex-rumble", 5, (a, t) => rumbleVoice(a, t, loudness(near))),
};
