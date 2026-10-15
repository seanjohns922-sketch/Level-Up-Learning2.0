"use client";

/**
 * Synthesised streak sounds, one voice per realm, scaled by streak power.
 * No audio files: everything is generated with Web Audio. Sounds are OFF by
 * default and only play once a student turns them on with the streak-counter
 * toggle (that tap also unlocks audio on iPad). The choice is kept per device.
 */

export type StreakStyle = "nexus" | "measure" | "star" | "pattern" | "data" | "chance";

const STORAGE_KEY = "reliq:streak-sounds:v1";
/** Output level before the limiter; voices peak around 0.5–0.7 of full scale. */
const MASTER_GAIN = 0.85;
const CHANGE_EVENT = "reliq:streak-sounds-change";

export function streakSoundsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export function setStreakSoundsEnabled(on: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* storage blocked: the toggle still works for this page */
  }
  if (on) void getContext()?.resume();
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeStreakSounds(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.ratio.value = 4;
  master = ctx.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(compressor);
  compressor.connect(ctx.destination);
  return ctx;
}

type Voice = { c: BaseAudioContext; out: AudioNode; t0: number };

/** One enveloped oscillator note. */
function note(v: Voice, freq: number, at: number, dur: number, type: OscillatorType, gain = 0.4, attack = 0.005, glideTo?: number) {
  const osc = v.c.createOscillator();
  const g = v.c.createGain();
  const t = v.t0 + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(v.out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** A bell: inharmonic sine partials with a long decay. */
function bell(v: Voice, freq: number, at: number, gain = 0.3, dur = 1.4) {
  note(v, freq, at, dur, "sine", gain);
  note(v, freq * 2.76, at, dur * 0.6, "sine", gain * 0.35);
  note(v, freq * 5.4, at, dur * 0.3, "sine", gain * 0.15);
}

/** Filtered noise: whooshes, clicks and ratchets. */
function noise(v: Voice, at: number, dur: number, gain: number, from: number, to: number, q = 1.2) {
  const len = Math.max(1, Math.floor(v.c.sampleRate * dur));
  const buffer = v.c.createBuffer(1, len, v.c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  const src = v.c.createBufferSource();
  src.buffer = buffer;
  const filter = v.c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = q;
  const t = v.t0 + at;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = v.c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.03, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(v.out);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** A short echo send so Starpath can shimmer. */
function echo(v: Voice, time = 0.18, feedback = 0.35): AudioNode {
  const delay = v.c.createDelay(1);
  delay.delayTime.value = time;
  const fb = v.c.createGain();
  fb.gain.value = feedback;
  const input = v.c.createGain();
  input.connect(v.out);
  input.connect(delay);
  delay.connect(fb).connect(delay);
  delay.connect(v.out);
  return input;
}

const hz = (semitonesFromA4: number) => 440 * 2 ** (semitonesFromA4 / 12);
// C major pentatonic run from C5, enough notes for every power level.
const PENTA = [3, 5, 7, 10, 12, 15, 17, 19, 22, 24].map(hz);
const MAJOR_CHORD = [3, 7, 10, 15].map(hz);

const VOICES: Record<StreakStyle, (v: Voice, power: number) => void> = {
  // Sci-fi power-up: a zap, then a fast square-wave arpeggio.
  nexus(v, power) {
    note(v, 880, 0, 0.25, "sawtooth", 0.4, 0.002, 110);
    const steps = 2 + power * 2;
    for (let i = 0; i < steps; i += 1) note(v, PENTA[i % PENTA.length]!, 0.08 + i * 0.055, 0.12, "square", 0.26);
    if (power >= 4) MAJOR_CHORD.forEach((f) => note(v, f * 2, 0.08 + steps * 0.055, 0.7, "sawtooth", 0.14));
  },
  // Clockwork ticks winding up, then glockenspiel bells.
  measure(v, power) {
    const ticks = 2 + power;
    for (let i = 0; i < ticks; i += 1) noise(v, i * 0.07, 0.03, 0.3, 3200, 2400, 8);
    const start = ticks * 0.07;
    for (let i = 0; i < 2 + power; i += 1) bell(v, PENTA[i * 2 % PENTA.length]!, start + i * 0.11, 0.22);
    if (power >= 4) MAJOR_CHORD.forEach((f) => bell(v, f, start + (2 + power) * 0.11, 0.16, 2));
  },
  // Rising shimmering pings through an echo.
  star(v, power) {
    const out = echo(v, 0.16, 0.42);
    const shimmer = { ...v, out };
    noise(v, 0, 0.5, 0.12, 400, 6000, 0.8);
    for (let i = 0; i < 3 + power; i += 1) note(shimmer, PENTA[(i + 3) % PENTA.length]! * 2, 0.12 + i * 0.09, 0.4, "sine", 0.16);
    if (power >= 4) MAJOR_CHORD.forEach((f) => note(shimmer, f * 2, 0.6, 1.2, "triangle", 0.08));
  },
  // A marimba motif that repeats one step higher each time: a pattern.
  pattern(v, power) {
    const motif = [0, 2, 4];
    for (let r = 0; r < Math.min(power + 1, 4); r += 1) {
      motif.forEach((m, i) => {
        const f = PENTA[(m + r) % PENTA.length]!;
        note(v, f, r * 0.2 + i * 0.06, 0.22, "triangle", 0.28, 0.003);
        note(v, f * 4, r * 0.2 + i * 0.06, 0.05, "sine", 0.06, 0.002);
      });
    }
    if (power >= 4) MAJOR_CHORD.forEach((f) => note(v, f, 0.85, 0.8, "triangle", 0.12));
  },
  // Data blips climbing like bars, then a clean success ding.
  data(v, power) {
    const bars = 3 + power;
    for (let i = 0; i < bars; i += 1) note(v, 330 * 1.12 ** (i * 2), i * 0.06, 0.06, "square", 0.1);
    bell(v, hz(15), bars * 0.06 + 0.04, 0.26, 1);
    if (power >= 4) MAJOR_CHORD.forEach((f) => note(v, f * 2, bars * 0.06 + 0.1, 0.8, "sine", 0.1));
  },
  // A wheel ratchet slowing down, then a jackpot bell and coins.
  chance(v, power) {
    let t = 0;
    const clicks = 6 + power * 3;
    for (let i = 0; i < clicks; i += 1) {
      noise(v, t, 0.025, 0.28, 2600, 1800, 6);
      t += 0.03 + i * 0.006;
    }
    bell(v, hz(15), t, 0.28, 1.2);
    bell(v, hz(19), t + 0.12, 0.24, 1.2);
    for (let i = 0; i < power * 2; i += 1) note(v, 2400 + (i % 3) * 400, t + 0.2 + i * 0.05, 0.08, "triangle", 0.08);
  },
};

/** Play the realm's streak sound at the given power (1 to 4), if sounds are on. */
export function playStreakSound(style: StreakStyle, power: number) {
  if (!streakSoundsEnabled()) return;
  const c = getContext();
  if (!c || !master) return;
  if (c.state === "suspended") void c.resume();
  try {
    VOICES[style]({ c, out: master, t0: c.currentTime + 0.03 }, power);
  } catch {
    /* audio is a bonus; never interrupt the lesson */
  }
}

/** Renders a streak sound offline (no playback), for review tooling and checks. */
export async function renderStreakSound(style: StreakStyle, power: number, seconds = 2.5): Promise<AudioBuffer> {
  const offline = new OfflineAudioContext(1, Math.ceil(44100 * seconds), 44100);
  const gain = offline.createGain();
  gain.gain.value = MASTER_GAIN;
  gain.connect(offline.destination);
  VOICES[style]({ c: offline, out: gain, t0: 0.02 }, power);
  return offline.startRendering();
}
