import { createHash } from "crypto";
import { access, mkdir, writeFile } from "fs/promises";
import path from "path";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";
const AUDIO_OUTPUT_DIR = path.join(process.cwd(), "public", "audio", "generated");
const AUDIO_PUBLIC_PREFIX = "/audio/generated";

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function sanitizeSpeechKey(speechKey: string) {
  return speechKey.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "speech";
}

export function normalizeSpeechText(text: string) {
  return normalizeWhitespace(text);
}

export function hashSpeechText(text: string) {
  return createHash("sha256").update(normalizeSpeechText(text)).digest("hex");
}

export function buildSpeechCacheKey(text: string, speechKey?: string) {
  const hash = hashSpeechText(text).slice(0, 16);
  if (!speechKey) return hash;
  return `${sanitizeSpeechKey(speechKey)}-${hash}`;
}

export function getGeneratedSpeechPublicUrl(cacheKey: string) {
  return `${AUDIO_PUBLIC_PREFIX}/${cacheKey}.mp3`;
}

function getGeneratedSpeechFilePath(cacheKey: string) {
  return path.join(AUDIO_OUTPUT_DIR, `${cacheKey}.mp3`);
}

export async function getCachedGeneratedSpeechUrl(cacheKey: string) {
  const filePath = getGeneratedSpeechFilePath(cacheKey);
  try {
    await access(filePath);
    return getGeneratedSpeechPublicUrl(cacheKey);
  } catch {
    return null;
  }
}

export async function generateElevenLabsSpeech(text: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  if (!voiceId) {
    throw new Error("ELEVENLABS_VOICE_ID is not configured.");
  }

  const upstream = await fetch(`${ELEVENLABS_BASE_URL}/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS_MODEL_ID,
      voice_settings: {
        stability: 0.8,
        similarity_boost: 0.95,
        style: 0.03,
        use_speaker_boost: false,
      },
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text();
    throw new Error(`ElevenLabs request failed (${upstream.status}): ${detail}`);
  }

  return Buffer.from(await upstream.arrayBuffer());
}

export async function writeGeneratedSpeech(cacheKey: string, audioBuffer: Uint8Array) {
  await mkdir(AUDIO_OUTPUT_DIR, { recursive: true });
  const filePath = getGeneratedSpeechFilePath(cacheKey);
  await writeFile(filePath, audioBuffer);
  return getGeneratedSpeechPublicUrl(cacheKey);
}
