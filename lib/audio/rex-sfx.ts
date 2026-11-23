"use client";

/**
 * Rex's sounds. His voice is real recordings ("T-rex calls", CC0, OpenGameArt; see /credits), cut into
 * public/audio/rex: a big arrival roar, two growls, a tamed roar, a huff and a snarl. His footsteps and
 * jaw clacks are made on the fly. Unlike the other game sounds they're on unless Rex is muted on this
 * device (the speaker on his panel). `near` (0 far .. 1 beside you) sets the volume.
 */
import { playSynth } from "./synth";

const CLIPS = ["roar", "growl-1", "growl-2", "tamed", "huff", "snarl"] as const;
type RexClip = (typeof CLIPS)[number];
const buffers = new Map<RexClip, AudioBuffer>();
let loading = false;

/** Fetches and decodes his recordings once (about 180 KB). A clip that fails to load just stays silent. */
export function loadRexSounds() {
  if (loading || typeof window === "undefined" || typeof OfflineAudioContext === "undefined") return;
  loading = true;
  // Decoded off to the side: an AudioBuffer plays in any audio context, so this needs no tap first.
  const decoder = new OfflineAudioContext(1, 1, 48000);
  for (const clip of CLIPS) {
    void fetch(`/audio/rex/${clip}.m4a`)
      .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error(response.statusText))))
      .then((data) => decoder.decodeAudioData(data))
      .then((buffer) => { buffers.set(clip, buffer); })
      .catch(() => { /* that sound stays silent */ });
  }
}

function clipVoice(audio: AudioContext, at: number, buffer: AudioBuffer, loud: number) {
  const source = audio.createBufferSource(), level = audio.createGain();
  source.buffer = buffer;
  level.gain.value = loud;
  source.connect(level).connect(audio.destination);
  source.start(at);
}

/**
 * His voice is one channel, so he never talks over himself: each call waits `gap` seconds after the last
 * thing he said. True once it has actually played (false while the clip loads or the browser holds audio).
 */
function speak(gap: number, clip: RexClip, loud: number) {
  const buffer = buffers.get(clip);
  if (!buffer) { loadRexSounds(); return false; }
  return playSynth("rex-voice", gap, (audio, at) => clipVoice(audio, at, buffer, loud), rexSoundsOn);
}

let noise: AudioBuffer | null = null;
/** Two seconds of white noise, made once and shared. */
function noiseBuffer(audio: AudioContext) {
  if (noise && noise.sampleRate === audio.sampleRate) return noise;
  noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return noise;
}
function noiseSource(audio: AudioContext, at: number, length: number) {
  const source = audio.createBufferSource();
  source.buffer = noiseBuffer(audio);
  source.start(at, Math.random());
  source.stop(at + length + 0.05);
  return source;
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
  const snarl = buffers.get("snarl");
  if (snarl) clipVoice(audio, at + 0.12, snarl, 0.6);
}

const loudness = (near: number) => Math.max(0.08, Math.min(1, near));

const MUTE_KEY = "reliq:rex:muted";
const MUTE_EVENT = "reliq:rex-mute-change";
/** Rex is heard unless he's been muted on this device. */
export function rexSoundsOn() {
  try { return window.localStorage.getItem(MUTE_KEY) !== "1"; } catch { return true; }
}
export function setRexMuted(muted: boolean) {
  try { window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch { /* the choice just isn't remembered */ }
  window.dispatchEvent(new Event(MUTE_EVENT));
}
export function subscribeRexMute(onChange: () => void) {
  window.addEventListener(MUTE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => { window.removeEventListener(MUTE_EVENT, onChange); window.removeEventListener("storage", onChange); };
}

/** Seconds between his growls while he's near (chasing or being answered), and his huffs once tamed. */
export const REX_GROWL_GAP = 20, REX_HUFF_GAP = 30;

export const rexSounds = {
  /** His big entrance. False until it has played, so the caller tries again next frame. */
  arrive: () => speak(0, "roar", 1),
  growl: (near = 1) => speak(REX_GROWL_GAP, Math.random() < 0.5 ? "growl-1" : "growl-2", loudness(near) * 0.8),
  huff: (near = 1) => speak(REX_HUFF_GAP, "huff", loudness(near) * 0.5),
  /** Five right: he roars, won over. */
  tamed: () => speak(0, "tamed", 0.9),
  /** Turning him back on: a growl so you know he's heard. */
  hello: () => speak(0, "growl-1", 1),
  stomp: (near = 1) => playSynth("rex-stomp", 0.3, (a, t) => stompVoice(a, t, loudness(near)), rexSoundsOn),
  snap: () => playSynth("rex-snap", 0.6, snapVoice, rexSoundsOn),
};
