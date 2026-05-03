import { NextResponse } from "next/server";

const OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech";
const DEFAULT_MODEL = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
const DEFAULT_VOICE = process.env.OPENAI_TTS_VOICE ?? "cedar";
const DEFAULT_FORMAT = process.env.OPENAI_TTS_FORMAT ?? "wav";
const DEFAULT_INSTRUCTIONS =
  process.env.OPENAI_TTS_INSTRUCTIONS ??
  "Speak clearly, slightly slower than normal, with a warm and encouraging teacher tone. Emphasise key numbers and mathematical words.";

type TtsRequestBody = {
  text?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 501 }
    );
  }

  let body: TtsRequestBody;
  try {
    body = (await request.json()) as TtsRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = String(body.text ?? "").replace(/\s+/g, " ").trim();
  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  if (text.length > 600) {
    return NextResponse.json(
      { error: "Text is too long for a single TTS request." },
      { status: 400 }
    );
  }

  const upstream = await fetch(OPENAI_TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      voice: DEFAULT_VOICE,
      input: text,
      response_format: DEFAULT_FORMAT,
      ...(DEFAULT_MODEL.startsWith("gpt-4o-mini-tts")
        ? { instructions: DEFAULT_INSTRUCTIONS }
        : {}),
    }),
  });

  if (!upstream.ok) {
    const errorText = await upstream.text();
    return NextResponse.json(
      {
        error: "OpenAI TTS request failed.",
        status: upstream.status,
        detail: errorText,
      },
      { status: 502 }
    );
  }

  const audioBuffer = await upstream.arrayBuffer();
  const contentType =
    upstream.headers.get("content-type") ??
    (DEFAULT_FORMAT === "wav" ? "audio/wav" : "audio/mpeg");

  return new Response(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
