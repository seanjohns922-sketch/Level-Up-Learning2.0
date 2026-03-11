"use client";

/**
 * Shared speak utility — Australian English, child-friendly settings.
 * Import this everywhere instead of duplicating the function.
 */
export function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-AU";
  u.rate = 0.85;
  u.pitch = 1.1;
  u.volume = 1.0;
  synth.speak(u);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}
