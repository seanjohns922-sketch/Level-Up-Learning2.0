// Generate recorded narration for Learn the Skill guides in Miranda's cloned voice.
//
// Needs VoiceStudio running locally (http://127.0.0.1:3900) with the voice profile
// below. Resumable: clips already in the manifest are skipped, and the manifest is
// saved after every clip, so the run can be stopped and restarted at any time.
//
//   npm run voice:clips -- --realm measurement --level 4     # one realm and level
//   npm run voice:clips -- --realm measurement               # one realm, every level
//   npm run voice:clips                                      # every guide
//   npm run voice:clips -- --dry                             # count lines, generate nothing
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { LESSON_GUIDES } from "../../data/lesson-guides/lower-level.ts";
import { lowerGuideSpeech } from "../../data/lesson-guides/guide-speech.ts";
import { prepareSpeechText } from "../../lib/speak.ts";
import { voiceClipKey } from "../../lib/voice-clips.ts";
import { forVoice } from "./voice-text.mjs";

const VOICESTUDIO = process.env.VOICESTUDIO_URL ?? "http://127.0.0.1:3900";
const VOICE_ID = process.env.VOICE_PROFILE_ID ?? "49f8ebd2"; // "Miranda RELIQ"
// 16 unmasking steps is about twice as fast as the model's 32-step preset and transcribes the same.
const STEPS = Number(process.env.VOICE_STEPS ?? 16);
const OUT_DIR = path.join(process.cwd(), "public/audio/voice/miranda");
const MANIFEST = path.join(OUT_DIR, "manifest.json");
const LINES = path.join(process.cwd(), "data/audio/voice-lines.json"); // text of each clip, for review

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const realmFilter = opt("realm"), levelFilter = opt("level") ? Number(opt("level")) : undefined, dry = args.includes("--dry");

/** Every sentence the selected guides can read aloud, keyed as the app keys them. */
function collectLines() {
  const lines = new Map();
  const add = (text, source) => {
    const normalized = prepareSpeechText(text);
    if (!normalized) return;
    const key = voiceClipKey(normalized);
    if (!lines.has(key)) lines.set(key, { normalized, source });
  };
  for (const [realm, levels] of Object.entries(LESSON_GUIDES)) {
    if (realmFilter && realm !== realmFilter) continue;
    for (const [level, guides] of Object.entries(levels ?? {})) {
      if (levelFilter && Number(level) !== levelFilter) continue;
      for (const [slot, guide] of Object.entries(guides)) {
        const source = `${realm} L${level} ${slot}`;
        for (const review of [false, true]) {
          const said = lowerGuideSpeech(guide, review);
          for (const part of said.whole) add(part, source);
        }
      }
    }
  }
  return lines;
}

async function generate(text, wavPath) {
  const res = await fetch(`${VOICESTUDIO}/v1/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "omnivoice", input: text, voice: VOICE_ID, response_format: "wav", language: "English", seed: 7, num_step: STEPS }),
  });
  if (!res.ok) throw new Error(`VoiceStudio ${res.status}: ${(await res.text()).slice(0, 200)}`);
  fs.writeFileSync(wavPath, Buffer.from(await res.arrayBuffer()));
}

const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } };

const lines = collectLines();
const manifest = readJson(MANIFEST, { version: 1, clips: {} });
const record = readJson(LINES, {});
// Remake a clip when the text sent to the voice has changed since it was recorded.
const todo = [...lines].filter(([key, l]) => !manifest.clips[key] || (record[key] && record[key].spoken !== forVoice(l.normalized)));
const words = todo.reduce((n, [, l]) => n + l.normalized.split(" ").length, 0);
console.log(`${lines.size} lines selected; ${lines.size - todo.length} already recorded and current; ${todo.length} to generate (~${words} words, ~${Math.round(words / 150)} min of audio).`);
if (dry) process.exit(0);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(LINES), { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "reliq-voice-"));
const started = Date.now();
for (const [i, [key, line]] of todo.entries()) {
  const text = forVoice(line.normalized), wav = path.join(tmp, `${key}.wav`), file = `${key}.m4a`;
  try {
    await generate(text, wav);
    // AAC in an .m4a container plays in every current browser and is ~10x smaller than WAV.
    execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "48000", wav, path.join(OUT_DIR, file)]);
    fs.rmSync(wav);
  } catch (error) {
    console.error(`  skipped ${line.source}: ${error.message}`);
    continue;
  }
  manifest.clips[key] = file;
  record[key] = { text: line.normalized, spoken: text, source: line.source };
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest));
  fs.writeFileSync(LINES, JSON.stringify(record, null, 1));
  const done = i + 1, per = (Date.now() - started) / done / 1000;
  if (done % 10 === 0 || done === todo.length) console.log(`  ${done}/${todo.length} · ~${Math.round(((todo.length - done) * per) / 60)} min left`);
}
console.log("Done.");
