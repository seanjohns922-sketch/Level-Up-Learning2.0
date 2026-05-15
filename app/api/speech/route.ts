import { NextResponse } from "next/server";
import { speechMap } from "@/data/audio/speechMap";
import {
  buildSpeechCacheKey,
  generateElevenLabsSpeech,
  getCachedGeneratedSpeechUrl,
  normalizeSpeechText,
  writeGeneratedSpeech,
} from "@/lib/audio/elevenlabs";

export const runtime = "nodejs";

type SpeechRequestBody = {
  text?: string;
  speechKey?: string;
};

export async function POST(request: Request) {
  let body: SpeechRequestBody;
  try {
    body = (await request.json()) as SpeechRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = normalizeSpeechText(String(body.text ?? ""));
  const speechKey = typeof body.speechKey === "string" ? body.speechKey.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  if (text.length > 600) {
    return NextResponse.json({ error: "Text is too long for a single speech request." }, { status: 400 });
  }

  if (speechKey && speechMap[speechKey]) {
    return NextResponse.json({
      url: speechMap[speechKey],
      cached: true,
      source: "preset",
    });
  }

  try {
    const cacheKey = buildSpeechCacheKey(text, speechKey || undefined);
    const cachedUrl = await getCachedGeneratedSpeechUrl(cacheKey);
    if (cachedUrl) {
      return NextResponse.json({
        url: cachedUrl,
        cached: true,
        source: "generated",
      });
    }

    const audioBuffer = await generateElevenLabsSpeech(text);
    const url = await writeGeneratedSpeech(cacheKey, audioBuffer);

    return NextResponse.json({
      url,
      cached: false,
      source: "generated",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Speech generation failed.",
        detail: error instanceof Error ? error.message : "Unknown error.",
      },
      { status: 502 }
    );
  }
}
