// Crawl a capture build of the app and collect the fixed sentences it reads aloud.
//
// Needs: the app built with NEXT_PUBLIC_VOICE_CAPTURE=1 (and admin/demo access)
// running at APP_URL, and headless Chrome with --remote-debugging-port=9333.
// Each screen is visited twice. A sentence counts as fixed text when it is
// identical on both visits (random questions change), so it can be recorded.
//
//   npm run voice:crawl -- --realm number --realm measurement
import fs from "node:fs";
import path from "node:path";
import { buildLessonRoute } from "../../lib/lesson-routing.ts";
import { getProgramWeekCount } from "../../lib/program-weeks.ts";

const APP = process.env.APP_URL ?? "http://localhost:3200";
const CDP = process.env.CDP_URL ?? "http://127.0.0.1:9333";
const OUT = path.join(process.cwd(), "data/audio/voice-fixed-lines.json");
const TABS = Number(process.env.CRAWL_TABS ?? 6);
const PROGRESS = path.join(process.cwd(), "data/audio/.voice-crawl-progress.json"); // resume point
const args = process.argv.slice(2);
const realms = args.flatMap((a, i) => (args[i - 1] === "--realm" ? [a] : []));
const YEARS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

const routes = ["/login", "/world", "/legends", "/home"];
for (const realm of realms.length ? realms : ["number", "measurement"]) {
  for (const year of YEARS) {
    const weeks = getProgramWeekCount(realm, year);
    routes.push(`/program?year=${encodeURIComponent(year)}&week=1${realm === "number" ? "" : `&realm_id=${realm}`}&legacy=1&teacher_preview=1`);
    for (let week = 1; week <= weeks; week++) for (let lesson = 1; lesson <= 3; lesson++) {
      const route = buildLessonRoute({ yearLabel: year, week, lessonNumber: lesson, realmId: realm });
      routes.push(`${route}${route.includes("?") ? "&" : "?"}teacher_preview=1`);
    }
  }
}

async function tab() {
  const t = await (await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  // Every call times out, so a frozen page is skipped instead of stalling the crawl.
  const send = (method, params = {}, ms = 20000) => new Promise((resolve, reject) => {
    const i = ++id;
    const timer = setTimeout(() => { pending.delete(i); reject(new Error(`${method} timed out`)); }, ms);
    pending.set(i, (m) => { clearTimeout(timer); resolve(m); });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 860, deviceScaleFactor: 1, mobile: false });
  return { send, evaluate, close: () => { ws.close(); fetch(`${CDP}/json/close/${t.id}`).catch(() => {}); } };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Load a screen, click through to the first activity, and return everything it could read aloud. */
async function visit(t, route) {
  await t.send("Page.navigate", { url: APP + route });
  await wait(3500);
  // Click through the lesson home, the guide and any intro to reach the first activity.
  for (let step = 0; step < 3; step++) {
    const clicked = await t.evaluate(`(() => { const b = [...document.querySelectorAll('button,a')].find(b => /^(let.s practise|start|begin|start lesson|continue|let.s go|next)\\b/i.test(b.textContent.trim())); b?.click(); return !!b; })()`);
    if (!clicked) break;
    await wait(2000);
  }
  return (await t.evaluate("window.__voiceCapture ?? {}")) ?? {};
}

// Progress is saved after every screen so a stopped crawl resumes where it left off.
const saved = (() => { try { return JSON.parse(fs.readFileSync(PROGRESS, "utf8")); } catch { return { runs: [{}, {}], done: [[], []] }; } })();
const runs = saved.runs.map((r) => new Map(Object.entries(r).map(([k, v]) => [k, { kind: v.kind, paths: new Set(v.paths) }])));
const save = () => fs.writeFileSync(PROGRESS, JSON.stringify({
  runs: runs.map((r) => Object.fromEntries([...r].map(([k, v]) => [k, { kind: v.kind, paths: [...v.paths] }]))),
  done: saved.done,
}));
async function crawl(run) {
  const finished = new Set(saved.done[run]);
  const queue = routes.filter((r) => !finished.has(r));
  if (!queue.length) return;
  const first = await tab();
  // Demo preview mode unlocks every level for review.
  await first.send("Page.navigate", { url: `${APP}/login` });
  await wait(2500);
  await first.evaluate(`localStorage.setItem("lul_demo_preview_mode_v1", "1")`);
  const tabs = [first, ...(await Promise.all(Array.from({ length: TABS - 1 }, tab)))];
  await Promise.all(tabs.map(async (t) => {
    for (let route; (route = queue.shift()); ) {
      try {
        for (const item of Object.values(await visit(t, route))) {
          const seen = runs[run].get(item.text) ?? { kind: item.kind, paths: new Set() };
          seen.paths.add(route);
          runs[run].set(item.text, seen);
        }
      } catch (error) {
        console.error(`  skipped ${route}: ${error.message}`);
        t.close();
        t = await tab(); // the frozen page is abandoned; carry on in a fresh tab
      }
      saved.done[run].push(route);
      save();
      if (saved.done[run].length % 25 === 0) console.log(`  run ${run + 1}: ${saved.done[run].length}/${routes.length} screens`);
    }
    t.close();
  }));
}

console.log(`${routes.length} screens, visited twice.`);
await crawl(0);
await crawl(1);
const fixed = {};
for (const [text, a] of runs[0]) {
  const b = runs[1].get(text);
  // Same sentence on the same screen in both visits, or shared across several screens.
  const stable = b && ([...a.paths].some((p) => b.paths.has(p)) || a.paths.size + b.paths.size > 2);
  if (stable) fixed[text] = { kind: a.kind, paths: [...new Set([...a.paths, ...b.paths])].slice(0, 5) };
}
const existing = (() => { try { return JSON.parse(fs.readFileSync(OUT, "utf8")); } catch { return {}; } })();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ ...existing, ...fixed }, null, 1));
fs.rmSync(PROGRESS, { force: true });
console.log(`${runs[0].size} sentences seen; ${Object.keys(fixed).length} fixed. Saved to ${path.relative(process.cwd(), OUT)}.`);
