// Collects every sentence the app can read aloud, for recording narration.
// Only active in a capture build (NEXT_PUBLIC_VOICE_CAPTURE=1), never for students.
// scripts/voice/crawl-fixed-text.mjs reads window.__voiceCapture while crawling.

type Captured = { text: string; kind: string; path: string };
const enabled = process.env.NEXT_PUBLIC_VOICE_CAPTURE === "1";

export function captureSpeech(normalizedText: string, kind: string) {
  if (!enabled || typeof window === "undefined" || !normalizedText) return;
  const w = window as unknown as { __voiceCapture?: Record<string, Captured> };
  w.__voiceCapture ??= {};
  w.__voiceCapture[normalizedText] ??= { text: normalizedText, kind, path: window.location.pathname + window.location.search };
}
