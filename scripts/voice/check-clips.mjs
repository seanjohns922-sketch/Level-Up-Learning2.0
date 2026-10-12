// Check generated narration by transcribing each clip with VoiceStudio's speech
// recogniser and comparing it with the text it should say. Writes a report of the
// clips worth a listen, worst first, so a person reviews only the likely problems.
//
//   npm run voice:check -- --realm measurement --level 4
//   npm run voice:check -- --redo        # also delete flagged clips so voice:clips remakes them
//   npm run voice:check -- --realm fixed --sample 80   # spot-check a random sample
import fs from "node:fs";
import path from "node:path";
import { expandUnits } from "./voice-text.mjs";

const VOICESTUDIO = process.env.VOICESTUDIO_URL ?? "http://127.0.0.1:3900";
const OUT_DIR = path.join(process.cwd(), "public/audio/voice/miranda");
const MANIFEST = path.join(OUT_DIR, "manifest.json");
const LINES = path.join(process.cwd(), "data/audio/voice-lines.json");
const REPORT = path.join(process.cwd(), "data/audio/voice-check.json");
const THRESHOLD = 0.85;

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const realm = opt("realm"), level = opt("level"), redo = args.includes("--redo"), sample = Number(opt("sample") ?? 0);

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function words(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : "");
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${words(n % 100)}` : ""}`;
  if (n < 1e6) return `${words(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${n % 1000 < 100 ? "and " : ""}${words(n % 1000)}` : ""}`;
  return String(n);
}
/** Lower-case words with numbers spelt out, so "14" and "fourteen" compare equal. */
const tokens = (text) => text.toLowerCase()
  .replace(/(\d+)\.(\d+)/g, (_, a, b) => `${words(Number(a))} point ${[...b].map((d) => ONES[d]).join(" ")}`)
  .replace(/\d+/g, (d) => words(Number(d)))
  .replace(/[^a-z' ]+/g, " ").split(/\s+/).filter((w) => w && w !== "and");

/** Share of the expected words heard, in order (longest common subsequence). */
function match(expected, heard) {
  const a = tokens(expected), b = tokens(heard);
  if (!a.length) return 1;
  let prev = new Array(b.length + 1).fill(0);
  for (const x of a) {
    const row = [0];
    for (let j = 0; j < b.length; j++) row.push(x === b[j] ? prev[j] + 1 : Math.max(prev[j + 1], row[j]));
    prev = row;
  }
  return prev[b.length] / Math.max(a.length, b.length * 0.9);
}

async function transcribe(file) {
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(file)], { type: "audio/mp4" }), path.basename(file));
  form.append("language", "en");
  form.append("response_format", "json");
  const res = await fetch(`${VOICESTUDIO}/v1/audio/transcriptions`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`VoiceStudio ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).text ?? "";
}

const lines = JSON.parse(fs.readFileSync(LINES, "utf8"));
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
let selected = Object.entries(lines).filter(([, l]) => (!realm || l.source.startsWith(`${realm} `)) && (!level || l.source.includes(` L${level} `)));
if (sample) selected = selected.sort(() => Math.random() - 0.5).slice(0, sample);
const results = [];
for (const [i, [key, line]] of selected.entries()) {
  const file = path.join(OUT_DIR, manifest.clips[key] ?? "");
  if (!manifest.clips[key] || !fs.existsSync(file)) continue;
  try {
    const heard = await transcribe(file);
    results.push({ key, score: Math.round(match(line.spoken, expandUnits(heard.replace(/(\d)([A-Za-z]+)\b/g, (_, d, u) => `${d} ${u === "M" ? "m" : u}`))) * 100) / 100, source: line.source, expected: line.spoken, heard });
  } catch (error) {
    results.push({ key, score: 0, source: line.source, expected: line.spoken, heard: `ERROR ${error.message}` });
  }
  if ((i + 1) % 20 === 0) console.log(`  checked ${i + 1}/${selected.length}`);
}
results.sort((a, b) => a.score - b.score);
const flagged = results.filter((r) => r.score < THRESHOLD);
fs.writeFileSync(REPORT, JSON.stringify({ checked: results.length, flagged: flagged.length, threshold: THRESHOLD, results }, null, 1));
console.log(`${results.length} clips checked; ${flagged.length} below ${THRESHOLD * 100}% match.`);
for (const r of flagged.slice(0, 15)) console.log(`  ${r.score}  ${r.source}\n     said:  ${r.expected}\n     heard: ${r.heard}`);
if (redo && flagged.length) {
  for (const r of flagged) { fs.rmSync(path.join(OUT_DIR, manifest.clips[r.key]), { force: true }); delete manifest.clips[r.key]; }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest));
  console.log(`Removed ${flagged.length} flagged clips; run voice:clips again to remake them.`);
}
