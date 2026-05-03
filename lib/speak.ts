"use client";

type SpeakRequestPayload = {
  text: string;
};

const audioCache = new Map<string, string>();

let currentAudio: HTMLAudioElement | null = null;
let currentRequest: AbortController | null = null;
let activeSpeakToken: symbol | null = null;

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
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

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = selectBrowserVoice(synth);

  utterance.lang = voice?.lang ?? "en-AU";
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  synth.speak(utterance);
}

async function fetchTtsAudio(text: string) {
  const cached = audioCache.get(text);
  if (cached) return cached;

  currentRequest?.abort();
  const controller = new AbortController();
  currentRequest = controller;

  const response = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text } satisfies SpeakRequestPayload),
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`TTS request failed: ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  audioCache.set(text, objectUrl);
  return objectUrl;
}

export async function speak(text: string) {
  if (typeof window === "undefined") return;

  const normalized = normalizeText(text);
  if (!normalized) return;

  stopSpeaking();
  const speakToken = Symbol("speak");
  activeSpeakToken = speakToken;

  try {
    const audioUrl = await fetchTtsAudio(normalized);
    if (activeSpeakToken !== speakToken) return;

    const audio = new Audio(audioUrl);
    currentAudio = audio;
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
    };
    await audio.play();
  } catch (error) {
    if ((error as Error)?.name === "AbortError" || activeSpeakToken !== speakToken) {
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
}
