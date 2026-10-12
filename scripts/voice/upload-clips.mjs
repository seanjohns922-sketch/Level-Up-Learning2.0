// Upload narration clips to Supabase Storage (public bucket "voice").
//
// Needs .env.voice.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (a secret
// key; never committed). Each clip is stored under a name that includes a hash of
// its audio, so browsers can cache it forever and a re-recorded clip gets a new
// name. Only new or changed clips are uploaded; the manifest is uploaded last.
//
//   npm run voice:upload
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  fs.readFileSync(path.join(process.cwd(), ".env.voice.local"), "utf8").split("\n")
    .filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_BASE = env.SUPABASE_URL, KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.voice.local");
const BUCKET = "voice", PREFIX = "miranda";
const LOCAL = path.join(process.cwd(), "public/audio/voice/miranda");
const STATE = path.join(process.cwd(), "data/audio/.voice-uploaded.json"); // local record of what is already uploaded
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function put(objectPath, body, contentType, cacheSeconds) {
  const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": contentType, "Cache-Control": `max-age=${cacheSeconds}`, "x-upsert": "true" },
    body,
  });
  if (!res.ok) throw new Error(`${objectPath}: ${res.status} ${(await res.text()).slice(0, 160)}`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(LOCAL, "manifest.json"), "utf8"));
const state = (() => { try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return {}; } })();
const remote = { version: 1, clips: {} };
const todo = [];
for (const [key, file] of Object.entries(manifest.clips)) {
  const local = path.join(LOCAL, file);
  if (!fs.existsSync(local)) continue;
  const audio = fs.readFileSync(local);
  const hash = crypto.createHash("sha1").update(audio).digest("hex").slice(0, 8);
  const name = `${key}-${hash}.m4a`;
  remote.clips[key] = name;
  if (state[key] !== name) todo.push({ key, name, audio });
}
console.log(`${Object.keys(remote.clips).length} clips; ${todo.length} to upload.`);

let done = 0, failed = 0;
const queue = [...todo];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let item; (item = queue.shift()); ) {
    try {
      await put(`${PREFIX}/${item.name}`, item.audio, "audio/mp4", 31536000);
      state[item.key] = item.name;
    } catch (error) {
      failed++;
      delete remote.clips[item.key]; // never list a clip that is not uploaded
      console.error(`  ${error.message}`);
    }
    if (++done % 250 === 0) { console.log(`  ${done}/${todo.length}`); fs.writeFileSync(STATE, JSON.stringify(state)); }
  }
}));
fs.writeFileSync(STATE, JSON.stringify(state));
// Short cache so new recordings are picked up within a minute of uploading.
await put(`${PREFIX}/manifest.json`, JSON.stringify(remote), "application/json", 60);
console.log(`Uploaded ${done - failed}; ${failed} failed. Manifest lists ${Object.keys(remote.clips).length} clips.`);
