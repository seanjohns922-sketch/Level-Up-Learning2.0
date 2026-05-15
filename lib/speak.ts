"use client";

import { useSyncExternalStore } from "react";
import { playLessonAudio } from "@/lib/audio/playLessonAudio";

type SpeakState = {
  currentText: string | null;
  isSpeaking: boolean;
  autoReadEnabled: boolean;
};

const AUTO_READ_STORAGE_KEY = "levelup:autoReadEnabled";
const LEGACY_AUTO_READ_STORAGE_KEY = "lul:auto_read_questions";

let currentAudio: HTMLAudioElement | null = null;
let currentRequest: AbortController | null = null;
let activeSpeakToken: symbol | null = null;
const speakListeners = new Set<() => void>();
let speakState: SpeakState = {
  currentText: null,
  isSpeaking: false,
  autoReadEnabled: false,
};

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
  if (typeof window !== "undefined" && speakState.autoReadEnabled !== readAutoReadPreference()) {
    speakState = { ...speakState, autoReadEnabled: readAutoReadPreference() };
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

  const preferred = [
    /en-AU/i,
    /Australian/i,
    /Karen/i,
    /Samantha/i,
    /Daniel/i,
    /en-GB/i,
    /en-US/i,
  ];

  for (const pattern of preferred) {
    const found = voices.find((voice) => pattern.test(voice.lang) || pattern.test(voice.name));
    if (found) return found;
  }

  return voices[0] ?? null;
}

function fallbackSpeak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  synth.cancel();
  setSpeakState({ currentText: text, isSpeaking: true });

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = selectBrowserVoice(synth);

  utterance.lang = voice?.lang ?? "en-AU";
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  utterance.onend = () => {
    setSpeakState({ currentText: null, isSpeaking: false });
  };
  utterance.onerror = () => {
    setSpeakState({ currentText: null, isSpeaking: false });
  };

  synth.speak(utterance);
}

export async function speak(text: string, speechKey?: string) {
  if (typeof window === "undefined") return;

  const normalized = normalizeText(text);
  if (!normalized) return;

  stopSpeaking();
  const speakToken = Symbol("speak");
  const controller = new AbortController();
  currentRequest = controller;
  activeSpeakToken = speakToken;
  setSpeakState({ currentText: normalized, isSpeaking: true });

  try {
    window.speechSynthesis?.cancel();

    const audio = await playLessonAudio(normalized, speechKey, controller.signal);
    if (activeSpeakToken !== speakToken || controller.signal.aborted) return;

    window.speechSynthesis?.cancel();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    currentAudio = audio;
    audio.onended = () => {
      if (currentAudio === audio) {
        currentAudio = null;
        if (currentRequest === controller) currentRequest = null;
        setSpeakState({ currentText: null, isSpeaking: false });
      }
    };
    audio.onerror = () => {
      if (currentAudio === audio) {
        currentAudio = null;
        if (currentRequest === controller) currentRequest = null;
        setSpeakState({ currentText: null, isSpeaking: false });
      }
    };

    await audio.play();
  } catch (error) {
    const errorName = (error as Error)?.name;

    if (errorName === "AbortError" || activeSpeakToken !== speakToken || controller.signal.aborted) {
      return;
    }

    if (currentRequest === controller) currentRequest = null;

    // Browser autoplay blocks should not trigger the robotic fallback voice.
    if (errorName === "NotAllowedError") {
      setSpeakState({ currentText: null, isSpeaking: false });
      return;
    }

    fallbackSpeak(normalized);
  }
}

export function stopSpeaking() {
  activeSpeakToken = null;
  currentRequest?.abort();
  currentRequest = null;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (typeof window !== "undefined") {
    window.speechSynthesis?.cancel();
  }

  setSpeakState({ currentText: null, isSpeaking: false });
}
