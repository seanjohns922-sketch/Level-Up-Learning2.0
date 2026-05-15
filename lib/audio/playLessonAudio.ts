"use client";

type SpeechResponse = {
  url: string;
  cached: boolean;
  source: "preset" | "generated";
};

const speechUrlCache = new Map<string, string>();

function makeClientCacheKey(text: string, speechKey?: string) {
  return `${speechKey ?? ""}::${text}`;
}

export async function resolveLessonAudioUrl(text: string, speechKey?: string, signal?: AbortSignal) {
  const cacheKey = makeClientCacheKey(text, speechKey);
  const cached = speechUrlCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch("/api/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, speechKey }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Speech request failed: ${response.status}`);
  }

  const payload = (await response.json()) as SpeechResponse;
  if (!payload.url) {
    throw new Error("Speech response did not include a URL.");
  }

  speechUrlCache.set(cacheKey, payload.url);
  return payload.url;
}

export async function playLessonAudio(text: string, speechKey?: string, signal?: AbortSignal) {
  const url = await resolveLessonAudioUrl(text, speechKey, signal);
  return new Audio(url);
}
