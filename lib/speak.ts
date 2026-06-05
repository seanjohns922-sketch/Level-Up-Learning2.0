"use client";

import { useSyncExternalStore } from "react";

type SpeakState = {
  currentText: string | null;
  isSpeaking: boolean;
  autoReadEnabled: boolean;
  interactionUnlocked: boolean;
};

const AUTO_READ_STORAGE_KEY = "levelup:autoReadEnabled";
const LEGACY_AUTO_READ_STORAGE_KEY = "lul:auto_read_questions";

const speakListeners = new Set<() => void>();
let speakState: SpeakState = {
  currentText: null,
  isSpeaking: false,
  autoReadEnabled: false,
  interactionUnlocked: false,
};

let interactionTrackingInstalled = false;

const CARDINALS_UNDER_TWENTY = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const TENS_WORDS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

function numberToWords(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  if (value < 0) return `negative ${numberToWords(Math.abs(value))}`;
  if (value < 20) return CARDINALS_UNDER_TWENTY[value] ?? String(value);
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return ones === 0 ? TENS_WORDS[tens] ?? String(value) : `${TENS_WORDS[tens]} ${numberToWords(ones)}`;
  }
  if (value < 1000) {
    const hundreds = Math.floor(value / 100);
    const remainder = value % 100;
    return remainder === 0
      ? `${numberToWords(hundreds)} hundred`
      : `${numberToWords(hundreds)} hundred and ${numberToWords(remainder)}`;
  }
  if (value < 10000) {
    const thousands = Math.floor(value / 1000);
    const remainder = value % 1000;
    return remainder === 0
      ? `${numberToWords(thousands)} thousand`
      : `${numberToWords(thousands)} thousand ${numberToWords(remainder)}`;
  }
  return String(value);
}

function ordinalDenominatorWord(denominator: number, plural: boolean) {
  const map: Record<number, { singular: string; plural: string }> = {
    2: { singular: "half", plural: "halves" },
    3: { singular: "third", plural: "thirds" },
    4: { singular: "quarter", plural: "quarters" },
    5: { singular: "fifth", plural: "fifths" },
    6: { singular: "sixth", plural: "sixths" },
    7: { singular: "seventh", plural: "sevenths" },
    8: { singular: "eighth", plural: "eighths" },
    9: { singular: "ninth", plural: "ninths" },
    10: { singular: "tenth", plural: "tenths" },
    11: { singular: "eleventh", plural: "elevenths" },
    12: { singular: "twelfth", plural: "twelfths" },
    20: { singular: "twentieth", plural: "twentieths" },
    100: { singular: "hundredth", plural: "hundredths" },
  };

  const known = map[denominator];
  if (known) return plural ? known.plural : known.singular;

  const base = numberToWords(denominator);
  if (base.endsWith("y")) {
    return `${base.slice(0, -1)}ieth${plural ? "s" : ""}`;
  }
  return `${base}${base.endsWith("th") ? "" : "th"}${plural ? "s" : ""}`;
}

function fractionToSpeech(numeratorText: string, denominatorText: string) {
  const numerator = Number(numeratorText);
  const denominator = Number(denominatorText);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return `${numeratorText} over ${denominatorText}`;
  }

  const numeratorWords = numberToWords(numerator);
  const denominatorWords = ordinalDenominatorWord(denominator, Math.abs(numerator) !== 1);
  return `${numeratorWords} ${denominatorWords}`;
}

function normalizeMathText(text: string) {
  let normalized = text;

  normalized = normalized.replace(/(\d+)\s*\/\s*(\d+)/g, (_, numerator, denominator) =>
    fractionToSpeech(numerator, denominator)
  );

  normalized = normalized.replace(/(\d+(?:\.\d+)?)%/g, (_, value) => `${numberToWords(Number(value))} percent`);

  normalized = normalized.replace(
    /([.?!])\s+/g,
    (_match, punctuation: string) => `${punctuation} ... `
  );

  normalized = normalized.replace(/ of /gi, " ... of ");
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

function normalizeText(text: string) {
  return normalizeMathText(text.replace(/\s+/g, " ").trim());
}

function emitSpeakState() {
  speakListeners.forEach((listener) => listener());
}

function setSpeakState(next: Partial<SpeakState>) {
  speakState = { ...speakState, ...next };
  emitSpeakState();
}

function markSpeechInteractionUnlocked() {
  if (speakState.interactionUnlocked) return;
  setSpeakState({ interactionUnlocked: true });
}

function ensureSpeechInteractionTracking() {
  if (typeof window === "undefined" || interactionTrackingInstalled) return;
  interactionTrackingInstalled = true;

  const unlock = () => {
    markSpeechInteractionUnlocked();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };

  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock, { passive: true });
}

function readAutoReadPreference() {
  if (typeof window === "undefined") return false;
  const current = window.localStorage.getItem(AUTO_READ_STORAGE_KEY);
  if (current !== null) return current === "1";

  const legacy = window.localStorage.getItem(LEGACY_AUTO_READ_STORAGE_KEY);
  if (legacy !== null) {
    window.localStorage.setItem(AUTO_READ_STORAGE_KEY, legacy === "1" ? "1" : "0");
    return legacy === "1";
  }

  return false;
}

function getSpeakStateSnapshot() {
  if (typeof window !== "undefined") {
    ensureSpeechInteractionTracking();
    if (speakState.autoReadEnabled !== readAutoReadPreference()) {
      speakState = { ...speakState, autoReadEnabled: readAutoReadPreference() };
    }
  }
  return speakState;
}

export function subscribeSpeakState(listener: () => void) {
  speakListeners.add(listener);
  return () => {
    speakListeners.delete(listener);
  };
}

export function useSpeakState() {
  return useSyncExternalStore(subscribeSpeakState, getSpeakStateSnapshot, getSpeakStateSnapshot);
}

export function useAutoReadSetting() {
  const state = useSpeakState();
  return {
    autoReadEnabled: state.autoReadEnabled,
    setAutoReadEnabled,
  };
}

function isLovablePreviewHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return (
    host.includes("lovable") ||
    /(^|\.)lovable\.dev$/i.test(host) ||
    /(^|\.)lovable\.app$/i.test(host) ||
    /(^|\.)lovableproject\.com$/i.test(host)
  );
}

export function useSpeechInteractionReady() {
  const interactionUnlocked = useSpeakState().interactionUnlocked;
  if (isLovablePreviewHost()) return false;
  return interactionUnlocked;
}

export function setAutoReadEnabled(enabled: boolean) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTO_READ_STORAGE_KEY, enabled ? "1" : "0");
    window.localStorage.removeItem(LEGACY_AUTO_READ_STORAGE_KEY);
  }
  setSpeakState({ autoReadEnabled: enabled });
}

export function prepareSpeechText(text: string) {
  return normalizeText(text);
}

function selectBrowserVoice(synth: SpeechSynthesis) {
  const voices = synth.getVoices();
  if (!voices.length) return null;

  // Only ever read the (English) question text with an English voice. Picking an
  // arbitrary voices[0] could be any language installed on the device, which is
  // why some students heard the questions read in a different language.
  const isEnglish = (voice: SpeechSynthesisVoice) =>
    (voice.lang ?? "").toLowerCase().startsWith("en") || /english/i.test(voice.name ?? "");

  // Skip the robotic / novelty voices (mostly macOS) so it doesn't sound "AI".
  const robotic =
    /albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|deranged|good news|jester|organ|superstar|trinoids|whisper|zarvox|fred|junior|ralph|kathy|princess|bruce|agnes|grandma|grandpa|reed|rocko|sandy|shelley|flo|eddy|grandstand|espeak|e-speak/i;

  const englishVoices = voices.filter((v) => isEnglish(v) && !robotic.test(v.name ?? ""));
  if (englishVoices.length === 0) return null; // fall back to lang="en-AU" only

  // Most natural / human-sounding first: neural & flagship voices, then nice
  // named voices, then locale preferences.
  const preferred = [
    /Google US English/i,
    /Google UK English Female/i,
    /Google UK English/i,
    /Google Australian/i,
    /Google/i,
    /Natural/i,
    /Neural/i,
    /Premium/i,
    /Enhanced/i,
    /Siri/i,
    /Samantha/i,
    /Karen/i,
    /Catherine/i,
    /Matilda/i,
    /Aria/i,
    /Jenny/i,
    /Libby/i,
    /Sonia/i,
    /Ava/i,
    /Allison/i,
    /Daniel/i,
    /Arthur/i,
    /en-AU/i,
    /Australian/i,
    /en-GB/i,
    /en[-_]US/i,
  ];

  for (const pattern of preferred) {
    const found = englishVoices.find((voice) => pattern.test(voice.lang) || pattern.test(voice.name));
    if (found) return found;
  }

  return englishVoices[0];
}

function speakWithBrowser(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  synth.cancel();
  setSpeakState({ currentText: text, isSpeaking: true });

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = selectBrowserVoice(synth);

  utterance.lang = voice?.lang ?? "en-AU";
  if (voice) utterance.voice = voice;
  utterance.rate = 0.95; // natural pace, not dragging
  utterance.pitch = 1.05; // slightly warmer
  utterance.volume = 1.0;
  utterance.onend = () => {
    setSpeakState({ currentText: null, isSpeaking: false });
  };
  utterance.onerror = () => {
    setSpeakState({ currentText: null, isSpeaking: false });
  };

  // Voices can be empty on first call (Safari/Chrome load them async). If so,
  // pick the English voice once they arrive, then speak.
  if (!voice && synth.getVoices().length === 0) {
    const onVoices = () => {
      synth.removeEventListener("voiceschanged", onVoices);
      const ready = selectBrowserVoice(synth);
      if (ready) {
        utterance.voice = ready;
        utterance.lang = ready.lang;
      }
      synth.speak(utterance);
    };
    synth.addEventListener("voiceschanged", onVoices);
    // Safety: if voiceschanged never fires, speak anyway shortly.
    window.setTimeout(() => {
      synth.removeEventListener("voiceschanged", onVoices);
      if (speakState.currentText === text && !speakState.isSpeaking) return;
      if (!synth.speaking) synth.speak(utterance);
    }, 250);
    return;
  }

  synth.speak(utterance);
}

/**
 * Speak text using the device's built-in (Web Speech API) voice.
 * Free, instant, offline-capable, no API keys — and always English.
 */
export async function speak(
  text: string,
  _speechKey?: string,
  source: "manual" | "auto" = "manual"
) {
  if (typeof window === "undefined") return;

  ensureSpeechInteractionTracking();
  if (source === "manual") markSpeechInteractionUnlocked();

  const normalized = normalizeText(text);
  if (!normalized) return;

  stopSpeaking();
  speakWithBrowser(normalized);
}

export function stopSpeaking() {
  if (typeof window !== "undefined") {
    window.speechSynthesis?.cancel();
  }

  setSpeakState({ currentText: null, isSpeaking: false });
}
