// Recorded narration (Miranda's cloned voice, generated offline with VoiceStudio).
// Each clip is keyed by a hash of the exact speech text the app would otherwise
// send to the device voice, so a recording plays only for a sentence it matches.
// scripts/voice/generate-clips.mjs writes the manifest and audio files.

export const VOICE_CLIP_BASE = "/audio/voice/miranda";
const MANIFEST_URL = `${VOICE_CLIP_BASE}/manifest.json`;

type Manifest = { version: number; clips: Record<string, string> };

/** cyrb53: a small, fast 53-bit string hash, shared by the app and the generator script. */
export function voiceClipKey(normalizedText: string): string {
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < normalizedText.length; i++) {
    const ch = normalizedText.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

let manifest: Manifest | null = null;
let loading: Promise<Manifest | null> | null = null;

/** Fetch the manifest once per session; a missing manifest simply means no recordings. */
export function loadVoiceClips(): Promise<Manifest | null> {
  if (manifest) return Promise.resolve(manifest);
  if (!loading && typeof window !== "undefined") {
    loading = fetch(MANIFEST_URL, { cache: "force-cache" })
      .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null))
      .then((m) => (manifest = m && typeof m.clips === "object" ? m : null))
      .catch(() => null);
  }
  return loading ?? Promise.resolve(null);
}

/** URL of the recording for this normalised text, if one exists. */
export async function voiceClipUrl(normalizedText: string): Promise<string | null> {
  const m = await Promise.race([loadVoiceClips(), new Promise<null>((r) => setTimeout(() => r(null), 1500))]);
  const file = m?.clips[voiceClipKey(normalizedText)];
  return file ? `${VOICE_CLIP_BASE}/${file}` : null;
}
