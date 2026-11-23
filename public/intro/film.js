/*
 * RELIQ intro film, shown once on a student's first sign-in by app/onboarding/intro.
 *
 * Every animation is paused and driven from one clock (t, in seconds), so the film
 * renders identically whether it plays, pauses or jumps. Sound effects are made live
 * with Web Audio; Miranda's narration clips are scheduled on the same clock.
 *
 * Inputs (URL fragment, all optional): name, code, year — shown on the explorer pass
 * as plain text. A fragment keeps them out of server logs.
 * Outputs (postMessage to the same-origin parent):
 *   { source: "reliq-intro", type: "ended" }   the film reached its last frame
 *   { source: "reliq-intro", type: "finish" }  the student pressed "Start my adventure"
 */
"use strict";
const DUR = 72;
const ART = "art/";
// [id, name, colour, card art, character cut-out]
const REALMS = [
  ["number-nexus", "Number Nexus", "#2EC4B6", ART + "card-number-nexus.jpg", ART + "numbot.png"],
  ["measurelands", "Measurelands", "#E0A43A", ART + "card-measurelands.jpg", ART + "hero-measurelands.webp"],
  ["starpath", "Starpath", "#9B7BFF", ART + "card-starpath.jpg", ART + "hero-starpath.webp"],
  ["statistica", "Statistica", "#7FD3FF", ART + "card-statistica.jpg", ART + "hero-statistica.webp"],
  ["pattern-peaks", "Pattern Peaks", "#B26BFF", ART + "card-pattern-peaks.jpg", ART + "hero-pattern-peaks.webp"],
  ["chance-hollow", "Chance Hollow", "#E05BD0", ART + "card-chance-hollow.jpg", ART + "hero-chance-hollow.webp"],
];
// Narration: [start, end, caption, hideCaption]. Clip i is narration/lineNN.m4a.
const LINES = [
  [0.8, 7.4, "At the heart of the realms stands the Tower of Knowledge."],
  [8.2, 13.8, "Its light kept six realms of maths alive, each one guarded by a RELIQ."],
  [14.6, 22.8, "Then the Fog of Forgetfulness rolled in, and scattered the RELIQS across the realms."],
  [24.2, 30.4, "Now they wait, faded and asleep, for an explorer to wake them."],
  [31.6, 36.6, "That explorer is you."],
  [37.6, 42.6, "Every lesson, quiz and brain break powers up your realm."],
  [41.7, 45.6, "Master your level, and a RELIQ awakens."],
  [48.8, 55.4, "Learn a little every day to earn Chrono Crystals and awaken Chronorok."],
  [56.6, 62.6, "Keep every RELIQ in your Explorer Treehouse, and build your own world."],
  [68.6, 71.9, "Explore. Learn. Collect. Your adventure starts now.", true],
];
const NARRATION = LINES.map((_, i) => `narration/line${String(i + 1).padStart(2, "0")}.m4a`);

/* Explorer pass: the student's own details, as text only. */
(() => {
  const q = new URLSearchParams(location.hash.slice(1));
  const clean = (v, max) => (v || "").replace(/\s+/g, " ").trim().slice(0, max);
  const name = clean(q.get("name"), 40).split(" ")[0] || "Explorer";
  const code = clean(q.get("code"), 16);
  const year = clean(q.get("year"), 20);
  const who = document.getElementById("passName");
  who.textContent = name;
  if (name.length > 8) who.style.fontSize = `${Math.max(2.6, 5 * 8 / name.length)}cqw`;
  document.getElementById("passCode").textContent = code;
  document.getElementById("passCodeRow").hidden = !code;
  document.getElementById("passYear").textContent = year;
})();

const $ = id => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const anims = [], hooks = [];
function A(el, frames, start, dur, easing = "ease-in-out", fill = "forwards") {
  const a = el.animate(frames, { duration: dur * 1000, delay: start * 1000, fill, easing });
  a.pause(); anims.push(a); return a;
}
function loop(el, frames, dur) { const a = el.animate(frames, { duration: dur * 1000, iterations: Infinity }); a.pause(); anims.push(a); }
function scene(id, start, end, fi = .6, fo = .6) {
  A($(id), [{ opacity: 0 }, { opacity: 1 }], start, fi, "ease-out", "both");
  A($(id), [{ opacity: 1 }, { opacity: 0 }], end - fo, fo, "ease-in");
}
const FLASHES = [];   // [t, strength, colour]
const IMPACTS = [];   // [t, strength]
const WAVES = [];     // [t, x, y, colour, size]
const EMIT = [];      // particle bursts
function flash(t, s = 1, c = "#fff") { FLASHES.push([t, s, c]); }
function impact(t, s = 1) { IMPACTS.push([t, s]); }

const CHAIN = "url(\"data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="20" viewBox="0 0 44 20"><defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f3f6"/><stop offset=".5" stop-color="#9aa1ab"/><stop offset="1" stop-color="#4b5058"/></linearGradient></defs><rect x="2" y="3" width="24" height="14" rx="7" fill="none" stroke="url(#m)" stroke-width="4"/><rect x="22" y="7.5" width="20" height="5" rx="2.5" fill="url(#m)"/></svg>') + "\")";
document.documentElement.style.setProperty("--chain", CHAIN);
const LOCK = '<svg class="lockpad" viewBox="0 0 24 24"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9edf2"/><stop offset="1" stop-color="#6b717b"/></linearGradient></defs><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="url(#g)" stroke-width="2.6"/><rect x="4" y="10" width="16" height="12" rx="2.5" fill="url(#g)"/><circle cx="12" cy="15.5" r="1.8" fill="#2a2d33"/></svg>';
function chainCard(card, t0, t1, broken) {
  // Two crossing chains and a padlock. t0: wrap; t1: break (or null).
  const parts = [];
  [[-34, 0], [34, .12]].forEach(([deg, d]) => {
    const c = document.createElement("div"); c.className = "chain"; card.appendChild(c);
    c.style.transformOrigin = "50% 50%";
    A(c, [{ opacity: 0, transform: `rotate(${deg}deg) scaleX(0)` }, { opacity: 1, transform: `rotate(${deg}deg) scaleX(1)` }], t0 + d, .35, "cubic-bezier(.3,1.4,.5,1)", t0 < 0 ? "both" : "forwards");
    if (t1) A(c, [{ opacity: 1, transform: `rotate(${deg}deg) scaleX(1)` }, { opacity: 0, transform: `rotate(${deg + (deg > 0 ? 14 : -14)}deg) scaleX(1.25) translateY(${deg > 0 ? 4 : -4}cqw)` }], t1, .35, "ease-out");
    parts.push(c);
  });
  card.insertAdjacentHTML("beforeend", LOCK);
  const lk = card.lastElementChild;
  A(lk, [{ opacity: 0, transform: "translate(-50%,-50%) scale(1.6)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1)" }], t0 + .3, .25, "ease-in", t0 < 0 ? "both" : "forwards");
  if (t1) A(lk, [{ opacity: 1, transform: "translate(-50%,-50%) scale(1)" }, { opacity: 0, transform: "translate(-50%, 60%) scale(.8) rotate(40deg)" }], t1, .5, "ease-in");
}

/* ===== 1. Tower 0\u201324 ===== */
scene("L-tower", 0, 24.2, .01, .9);
A($("towerArt"), [{ transform: "scale(1.0)" }, { transform: "scale(1.12) translateY(2%)" }], 0, 14, "linear", "both");
A($("towerArt"), [{ filter: "brightness(1) saturate(1)" }, { filter: "brightness(.55) saturate(.9)" }], 8, 2);
A($("towerArt"), [{ filter: "brightness(.55) saturate(.9)" }, { filter: "brightness(.36) saturate(.35) hue-rotate(-10deg)" }], 14, 3);
A($("rays0"), [{ opacity: 0, transform: "rotate(0deg)" }, { opacity: .9, transform: "rotate(10deg)", offset: .5 }, { opacity: .6, transform: "rotate(20deg)" }], 0.5, 13, "ease-out");
A($("rays0"), [{ opacity: .6 }, { opacity: 0 }], 14, 1.2);
A($("beam"), [{ opacity: 0, transform: "scaleY(.2)" }, { opacity: 1, transform: "scaleY(1)" }], 6.6, 1.4, "ease-out");
A($("beam"), [{ opacity: 1 }, { opacity: 0 }], 14.6, .6);
flash(8.2, .45, "#ffe7a8");

/* Rune halo \u2014 orbiting ring of maths symbols, like the original tower */
const RUNES = "+ \u2212 \u00d7 \u00f7 = \u00bd \u03c0 % \u25b3 \u25cb \u221a \u2220 \u00be 7 3 9 2 8 5 \u221e".split(" ");
const runeEls = RUNES.map(s => { const e = document.createElement("span"); e.className = "rune"; e.textContent = s; $("halo").appendChild(e); return { e, fall: { vx: (rnd() - .5) * 40, vy: -10 - rnd() * 20, spin: (rnd() - .5) * 720 } }; });
const SHATTER = 18.6;
hooks.push(t => {
  const W = $("stage").clientWidth, H = W * 9 / 16;
  const vis = t < 23 ? ramp(t, 0.6, 2.4) * (1 - ramp(t, 21, 23)) : t >= 63 && t < 67.8 ? ramp(t, 63.2, 64.6) * (1 - ramp(t, 67, 67.8)) : 0;
  $("halo").style.display = vis > 0 ? "" : "none";
  if (!vis) return;
  const cx = .5 * W, cy = (t < 30 ? .3 : .28) * H, rx = .2 * W, ry = .045 * W;
  runeEls.forEach((r, i) => {
    const a = i / runeEls.length * Math.PI * 2 + t * .45;
    let x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry + Math.sin(t * 1.3 + i) * .006 * W;
    const front = Math.sin(a) > 0;
    let s = front ? 1.1 : .7, o = (front ? 1 : .45) * vis, rot = 0;
    if (t < 30 && t > SHATTER) {
      const d = t - SHATTER; x += r.fall.vx * d * W / 1000 * 3; y += (r.fall.vy * d + 60 * d * d) * W / 1000; rot = r.fall.spin * d; o *= clamp(1 - d / 2.4);
    }
    if (t < 30 && t > 14) o *= 1 - .5 * ramp(t, 14, 16);
    r.e.style.opacity = o.toFixed(3);
    r.e.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%) scale(${s}) rotate(${rot}deg)`;
  });
});
impact(SHATTER, 1.6); flash(SHATTER, .6, "#ffd36b");

/* ===== 2\u20133. Six RELIQS rise, then the fog chains and scatters them ===== */
scene("L-fan", 8, 24, .01, .3);
REALMS.forEach(([id, name, col, img, hero], i) => {
  const w = document.createElement("div"); w.className = "hero";
  w.innerHTML = `<img src="${hero}" alt="">`; $("L-fan").appendChild(w);
  const im = w.firstChild, glow = `drop-shadow(0 0 1.2cqw ${col}) drop-shadow(0 0 .2cqw ${col})`;
  im.style.filter = glow;
  const k = i - 2.5, x = k * 13.6, y = -1 + Math.abs(k) * 1.4, r = k * 3;
  if (i === 0) w.style.width = "16.5cqw";
  const home = `translate(-50%, -50%) translate(${x}cqw, ${y}cqw) scale(1) rotate(${r}deg)`;
  A(w, [{ opacity: 0, transform: "translate(-50%, -50%) translate(0, -18cqw) scale(.1)" }, { opacity: 1, transform: home }], 8.5 + i * .3, 1.2, "cubic-bezier(.2,.9,.3,1.2)");
  loop(im, [{ transform: "translateY(0)" }, { transform: "translateY(-.9cqw)" }, { transform: "translateY(0)" }], 2.2 + i * .17);
  EMIT.push({ t: 9.4 + i * .3, n: 26, x: .5 + x / 100, y: .5 + y / 56.25, sp: [.05, .22], g: .05, life: 1.4, size: [.15, .45], col: [col, "#fff"], kind: "spark" });
  chainCard(w, 17.8 + i * .12, null);
  A(im, [{ filter: `${glow} grayscale(0) brightness(1)` }, { filter: "drop-shadow(0 0 0 transparent) drop-shadow(0 0 0 transparent) grayscale(1) brightness(.42)" }], 18.4 + i * .1, 1.4);
  const ang = (k / 2.5) * 1.3 + (rnd() - .5) * .4;
  A(w, [{ transform: home }, { opacity: 0, transform: `translate(-50%, -50%) translate(${Math.sin(ang) * 95}cqw, ${-Math.cos(ang) * 40 + 12}cqw) scale(.4) rotate(${r * 10 + (rnd() - .5) * 240}deg)` }], 21.6 + rnd() * .9, 1.8, "cubic-bezier(.55,0,.85,.55)");
});
impact(17.9, .5);

/* ===== 4. The realms, locked and waiting 24\u201331 ===== */
scene("L-tour", 24, 31.2, .7, .6);
REALMS.forEach(([id, name, col, img]) => {
  const it = document.createElement("div"); it.className = "tour-item";
  it.innerHTML = `<div class="card" style="background-image:url(${img})"><div class="art"></div></div><b>${name}</b>`;
  $("strip").appendChild(it);
  chainCard(it.firstChild, -1, null);
});
A($("strip"), [{ transform: "translate(70cqw, -55%)" }, { transform: "translate(-118cqw, -55%)" }], 24, 7.2, "linear", "both");

/* ===== 5. That explorer is you 31\u201337 ===== */
scene("L-you", 31, 37.2, .5, .6);
EMIT.push({ t: 31.4, n: 60, x: .5, y: .5, sp: [.01, .06], g: -.01, life: 1.2, size: [.1, .3], col: ["#ffd36b", "#fff"], kind: "spark", stream: 1.0 });
A($("raysYou"), [{ opacity: 0, transform: "rotate(0deg) scale(.5)" }, { opacity: 1, transform: "rotate(50deg) scale(1)" }], 32.3, 4.8, "ease-out", "both");
A($("pass"), [{ opacity: 0, transform: "scale(.6)", filter: "brightness(3)" }, { opacity: 1, transform: "scale(1.04)", filter: "brightness(1.4)", offset: .55 }, { opacity: 1, transform: "scale(1)", filter: "brightness(1)" }], 32.4, 1.1, "cubic-bezier(.2,.9,.3,1)", "both");
A($("sheen"), [{ transform: "translateX(-120%)" }, { transform: "translateX(120%)" }], 33.8, 1, "ease-in-out", "both");
flash(32.4, .9, "#ffe7a8"); impact(32.4, .8);
WAVES.push([32.4, .5, .5, "255,210,120", 1]);
EMIT.push({ t: 32.45, n: 90, x: .5, y: .5, sp: [.15, .55], g: .1, life: 2.2, size: [.12, .4], col: ["#ffd36b", "#ffe9b0", "#C94DF2"], kind: "spark" });
EMIT.push({ t: 33, n: 40, x: .5, y: .62, sp: [.01, .05], g: -.04, life: 4, size: [.1, .25], col: ["#ffd36b"], kind: "ember", stream: 4 });

/* ===== 6. Power up and break the chains 37\u201348 ===== */
scene("L-power", 37, 48.4, .6, .6);
chainCard($("powerCard"), -1, 44);
A($("powerCard"), [{ transform: "scale(.88)" }, { transform: "scale(1)" }], 37, 1, "ease-out", "both");
A($("ringFill"), [{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], 38.2, 5.4, "cubic-bezier(.3,.1,.3,1)", "both");
const CHIPS = [["+40 XP", "Lesson", -34, -14], ["+60 XP", "Quiz", 31, -10], ["+10 XP", "Brain break", -31, 12], ["+40 XP", "Lesson", 33, 14], ["+60 XP", "Quiz", -36, 0], ["+40 XP", "Lesson", 36, 0]];
CHIPS.forEach(([xp, what, x, y], i) => {
  const c = document.createElement("div"); c.className = "chip"; c.innerHTML = `${xp}<small>${what}</small>`;
  $("chips").appendChild(c);
  const st = 38 + i * .75, hit = st + 1.3;
  A(c, [{ opacity: 0, transform: `translate(calc(${x}cqw - 50%), ${y}cqw) scale(.5)` }, { opacity: 1, transform: `translate(calc(${x}cqw - 50%), ${y}cqw) scale(1)`, offset: .3 }, { opacity: 1, transform: `translate(calc(${x * .9}cqw - 50%), ${y * .9}cqw) scale(1)`, offset: .6 }, { opacity: 0, transform: "translate(-50%, 0) scale(.3)" }], st, 1.3, "ease-in");
  impact(hit, .35);
  EMIT.push({ t: hit, n: 18, x: .5, y: .5, sp: [.08, .25], g: .2, life: .7, size: [.1, .3], col: ["#C94DF2", "#fff", "#2EC4B6"], kind: "spark" });
});
const BREAK = 44;
A($("powerArt"), [{ filter: "grayscale(1) brightness(.55)" }, { filter: "grayscale(0) brightness(1.1)" }], BREAK, .5, "ease-out");
A($("powerCard"), [{ transform: "scale(1)", boxShadow: "0 1.2cqw 3cqw rgba(0,0,0,.6)" }, { transform: "scale(1.14)", boxShadow: "0 0 6cqw #2EC4B6, 0 0 0 .3cqw #2EC4B6", offset: .4 }, { transform: "scale(1.06)", boxShadow: "0 0 5cqw #2EC4B6, 0 0 0 .3cqw #2EC4B6" }], BREAK, 1, "ease-out");
A($("raysPow"), [{ opacity: 0, transform: "rotate(0deg) scale(.6)" }, { opacity: 1, transform: "rotate(30deg) scale(1)" }], BREAK, 4, "ease-out");
A($("numbot"), [{ opacity: 0, transform: "translate(-30cqw, -8cqw) scale(.25)" }, { opacity: 1, transform: "translate(-8cqw, -6cqw) scale(1.05)", offset: .6 }, { opacity: 1, transform: "translate(0,0) scale(1)" }], BREAK + .5, .9, "cubic-bezier(.3,.7,.4,1)");
loop($("numbot"), [{ translate: "0 0" }, { translate: "0 -.8cqw" }, { translate: "0 0" }], 2.3);
A($("awake"), [{ opacity: 0, letterSpacing: ".6em" }, { opacity: 1, letterSpacing: ".2em" }], BREAK + .4, .9, "ease-out");
flash(BREAK, 1, "#fff"); impact(BREAK, 2.2);
WAVES.push([BREAK, .5, .5, "46,196,182", 1.3]);
EMIT.push({ t: BREAK, n: 46, x: .5, y: .5, sp: [.2, .6], g: .5, life: 1.6, size: [.3, .8], col: ["#cfd3da", "#8d939c", "#ffffff"], kind: "shard" });
EMIT.push({ t: BREAK, n: 110, x: .5, y: .5, sp: [.15, .7], g: .15, life: 2, size: [.12, .4], col: ["#2EC4B6", "#9ff7ea", "#fff"], kind: "spark" });
EMIT.push({ t: BREAK + .3, n: 50, x: .5, y: .75, sp: [.01, .05], g: -.05, life: 3.4, size: [.1, .25], col: ["#9ff7ea"], kind: "ember", stream: 3.5 });

/* ===== 7. Chronorok 48\u201356 ===== */
scene("L-spire", 48, 56.4, .7, .7);
A($("spireArt"), [{ transform: "scale(1.18) translateY(5%)" }, { transform: "scale(1.02) translateY(0)" }], 48, 8.4, "ease-out", "both");
for (let i = 0; i < 10; i++) $("gems").appendChild(document.createElement("i"));
hooks.push(t => {
  const p = ramp(t, 49.2, 52.4);
  const d = Math.min(100, Math.round(100 * (1 - Math.pow(1 - p, 1.6))));
  $("dayCount").firstChild.nodeValue = `Day ${d}`;
  [...$("gems").children].forEach((g, i) => g.classList.toggle("on", d >= (i + 1) * 10));
});
for (let i = 1; i <= 10; i++) {
  const tt = 49.2 + 3.2 * (1 - Math.pow(1 - i / 10, 1 / 1.6));
  EMIT.push({ t: tt, n: 6, x: .07 + i * .022, y: .31, sp: [.05, .12], g: -.1, life: .9, size: [.12, .3], col: ["#e9a8ff", "#fff"], kind: "spark" });
}
A($("spireBeam"), [{ opacity: 0, transform: "scaleY(0)" }, { opacity: 1, transform: "scaleY(1)" }], 52.4, .5, "ease-out");
A($("chronorok"), [{ opacity: 0, transform: "translateY(14cqw) scale(.9)", filter: "drop-shadow(0 0 0 #C94DF2) brightness(.2)" }, { opacity: 1, transform: "translateY(0) scale(1)", filter: "drop-shadow(0 0 3.5cqw #C94DF2) brightness(1)" }], 52.6, 1.3, "cubic-bezier(.2,.9,.3,1.1)");
flash(52.5, .7, "#e7b6ff"); impact(52.6, 1.6);
WAVES.push([52.6, .72, .95, "201,77,242", 1.2]);
EMIT.push({ t: 52.6, n: 70, x: .72, y: .95, sp: [.1, .45], g: .3, life: 1.8, size: [.2, .6], col: ["#c9a46a", "#8a6a3e", "#e9a8ff"], kind: "shard" });

/* ===== 8. Treehouse 56\u201363 ===== */
scene("L-tree", 56, 63.4, .7, .7);
A($("auroraArt"), [{ transform: "scale(1) translateX(2%)" }, { transform: "scale(1.14) translateX(-2%)" }], 56, 7.4, "linear", "both");
EMIT.push({ t: 56, n: 60, x: .5, y: .5, sp: [.002, .01], g: -.002, life: 7, size: [.06, .16], col: ["#ffe9c4"], kind: "dust", spread: [1, .9], stream: 1 });
["number-nexus", "measurelands", "starpath"].forEach((id, i) => {
  const r = REALMS.find(x => x[0] === id);
  const c = document.createElement("div"); c.className = "card"; c.style.backgroundImage = `url(${r[3]})`;
  c.style.left = (56 + i * 12.7) + "cqw"; c.style.boxShadow = `0 1cqw 2cqw rgba(0,0,0,.6), 0 0 2.4cqw ${r[2]}88`;
  $("L-tree").appendChild(c);
  const tt = 57.2 + i * .55;
  A(c, [{ opacity: 0, transform: "translateY(-6cqw) rotate(-8deg) scale(1.1)" }, { opacity: 1, transform: "translateY(0) rotate(0deg) scale(1)" }], tt, .6, "cubic-bezier(.2,.9,.3,1.35)");
  EMIT.push({ t: tt + .5, n: 16, x: (61.5 + i * 12.7) / 100, y: .69, sp: [.05, .15], g: .1, life: .8, size: [.1, .25], col: [r[2], "#fff"], kind: "spark" });
});

/* ===== 9. Tower restored + logo 63\u201372 ===== */
scene("L-final", 63, 72.5, .8, .01);
A($("finalArt"), [{ transform: "scale(1.12)", filter: "brightness(1.15) saturate(1.2)" }, { transform: "scale(1.02)", filter: "brightness(1.15) saturate(1.2)" }], 63, 5, "ease-out", "both");
A($("raysFinal"), [{ opacity: 0, transform: "rotate(0deg)" }, { opacity: 1, transform: "rotate(25deg)" }], 63, 4.5, "ease-out");
const LINEUP = [[-38, 21, 4], [-24, 24, 2], [-8.5, 25, 0], [8.5, 26, 1], [25, 21, 3], [39, 22, 5]]; // x, height, entrance order
REALMS.forEach(([id, name, col, img, hero], i) => {
  const [x, ht, ord] = LINEUP[i];
  const w = document.createElement("div"); w.className = "hero"; w.style.left = `calc(50% + ${x}cqw)`; w.style.setProperty("--h", ht + "cqw");
  w.innerHTML = `<img src="${hero}" alt="" style="filter: drop-shadow(0 0 1.4cqw ${col}) drop-shadow(0 .6cqw 1cqw rgba(0,0,0,.5))">`;
  $("L-final").insertBefore(w, $("violet"));
  A(w, [{ opacity: 0, transform: "translate(-50%, 30cqw) scale(.9)" }, { opacity: 1, transform: "translate(-50%, -1.5cqw) scale(1.03)", offset: .7 }, { opacity: 1, transform: "translate(-50%, 0) scale(1)" }], 63.5 + ord * .16, .9, "cubic-bezier(.2,.9,.3,1)");
  loop(w.firstChild, [{ transform: "translateY(0)" }, { transform: "translateY(-1cqw)" }, { transform: "translateY(0)" }], 1.9 + i * .13);
  EMIT.push({ t: 64.2 + ord * .16, n: 18, x: .5 + x / 100, y: .85, sp: [.05, .2], g: .1, life: 1, size: [.12, .3], col: [col, "#fff"], kind: "spark" });
});
EMIT.push({ t: 63.4, n: 120, x: .5, y: -.05, sp: [.0, .02], g: .25, life: 3.2, size: [.5, .9], col: ["#ffd36b"], kind: "coin", spread: [1.1, .02], stream: 3.4 });
EMIT.push({ t: 64.4, n: 80, x: .5, y: .4, sp: [.1, .45], g: .25, life: 2.2, size: [.12, .35], col: ["#ffd36b", "#fff", "#C94DF2"], kind: "spark" });
A($("violet"), [{ opacity: 0 }, { opacity: 1 }], 67, .8, "ease-in-out");
A($("logoWrap"), [{ opacity: 0, transform: "translate(-50%, -50%) scale(2.4)" }, { opacity: 1, transform: "translate(-50%, -50%) scale(.96)", offset: .7 }, { opacity: 1, transform: "translate(-50%, -50%) scale(1)" }], 67.3, .55, "cubic-bezier(.6,0,.9,.5)");
impact(67.7, 1.8); flash(67.68, .55, "#e7b6ff");
WAVES.push([67.7, .5, .42, "201,77,242", 1.6]);
EMIT.push({ t: 67.7, n: 90, x: .5, y: .42, sp: [.1, .5], g: .1, life: 2, size: [.12, .35], col: ["#C94DF2", "#f3c8ff", "#fff"], kind: "spark" });
A($("shine"), [{ backgroundPosition: "120% 0" }, { backgroundPosition: "-20% 0" }], 68.6, 1.1, "ease-in-out", "both");
[...$("tag3").children].forEach((s, i) => A(s, [{ opacity: 0, transform: "translateY(1cqw)" }, { opacity: 1, transform: "none" }], 69 + i * .4, .5, "ease-out", "both"));
A($("go"), [{ opacity: 0, transform: "translate(-50%, 1cqw)" }, { opacity: 1, transform: "translate(-50%, 0)" }], 70.5, .7, "ease-out", "both");
$("shine").style.setProperty("--logo", "url(art/logo.png)");

/* Letterbox opens for the finale */
hooks.push(t => { $("bars").style.setProperty("--bar", (6.2 * (1 - ramp(t, 67, 68.2))).toFixed(2) + "cqw"); });

/* ===== Camera: slow pushes + impact shake ===== */
const CAMK = [[0, 1], [13.6, 1.1], [14.4, 1.02], [23.6, 1.12], [24.4, 1], [31, 1.05], [31.6, 1], [37, 1.04], [37.5, 1], [43.8, 1.06], [44.6, 1], [48, 1.04], [48.6, 1], [56, 1.06], [56.6, 1], [63, 1.04], [63.6, 1], [72, 1.05]];
function camAt(t) { for (let i = 1; i < CAMK.length; i++) if (t <= CAMK[i][0]) { const [a, sa] = CAMK[i - 1], [b, sb] = CAMK[i]; return sa + (sb - sa) * ((t - a) / (b - a)); } return 1.05; }
hooks.push(t => {
  let dx = 0, dy = 0;
  IMPACTS.forEach(([ti, s], i) => { const d = t - ti; if (d < 0 || d > 1.2) return; const e = s * Math.exp(-d * 5); dx += e * Math.sin(d * 52 + i) * .7; dy += e * Math.cos(d * 47 + i * 2) * .5; });
  $("cam").style.transform = `scale(${camAt(t).toFixed(4)})`;
  $("shake").style.transform = `translate(${dx.toFixed(3)}cqw, ${dy.toFixed(3)}cqw)`;
  let f = 0, col = "#fff";
  FLASHES.forEach(([ti, s, c]) => { const d = t - ti; if (d < -.05 || d > .9) return; const v = d < 0 ? s * (1 + d / .05) : s * Math.exp(-d * 5); if (v > f) { f = v; col = c; } });
  $("flash").style.opacity = f.toFixed(3); $("flash").style.background = col;
});

/* ===== FX canvas: fog, shadow creatures, lightning, cracks, particles, shockwaves ===== */
const fx = $("fx"), fogc = $("fogc"); let g = fx.getContext("2d"); const gTop = g, gFog = fogc.getContext("2d");
const blobs = Array.from({ length: 26 }, () => ({ x: rnd(), y: .1 + rnd() * 1, r: .16 + rnd() * .26, s: .2 + rnd() * .6, ph: rnd() * 6 }));
const CREATURES = [[14.8, 22.6, -.15, .2, .3, .32, 1.2], [15.6, 22.8, 1.15, .25, .7, .3, 1], [16.4, 22.4, .5, -.25, .5, .18, 1.5], [17.2, 23, -.2, .7, .22, .6, .9], [17.6, 23, 1.2, .72, .78, .62, .9], [24.4, 31, .2, .3, .25, .32, .7], [25.5, 31, .82, .28, .78, .3, .7]]
  .map(([t0, t1, x0, y0, x1, y1, s]) => ({ t0, t1, x0, y0, x1, y1, s, ph: rnd() * 9 }));
const BOLTS = [14.9, 17.3, 19.7, 21.5].map(t0 => { const pts = []; let x = .3 + rnd() * .4, y = -.05; const tx = .5 + (rnd() - .5) * .06, ty = .28; while (y < ty) { y += .04 + rnd() * .04; x += (tx - x) * .25 + (rnd() - .5) * .07; pts.push([x, Math.min(y, ty)]); } return { t0, pts: [[pts[0][0], -.05], ...pts] }; });
BOLTS.forEach(b => { flash(b.t0, .75, "#d9d4ff"); impact(b.t0, 1.1); });
const CRACKS = Array.from({ length: 7 }, (_, i) => { const pts = [[.5 + (rnd() - .5) * .05, .14 + rnd() * .3]]; for (let k = 0; k < 4; k++) { const [x, y] = pts[pts.length - 1]; pts.push([x + (rnd() - .5) * .05, y + .025 + rnd() * .035]); } return { t0: SHATTER + i * .16, pts }; });
function fogK(t) { return ramp(t, 13.6, 16.5) * (1 - ramp(t, 23.4, 24.6)) + .45 * ramp(t, 24, 25) * (1 - ramp(t, 30.4, 31.2)); }

// Particles: each burst precomputes its particles; position is a pure function of time.
EMIT.forEach(e => {
  e.ps = Array.from({ length: e.n }, () => {
    const a = rnd() * Math.PI * 2, v = e.sp[0] + rnd() * (e.sp[1] - e.sp[0]);
    const off = e.stream ? rnd() * e.stream : 0;
    const sx = e.spread ? (rnd() - .5) * e.spread[0] : 0, sy = e.spread ? (rnd() - .5) * e.spread[1] : 0;
    return { a, v, off, sx, sy, size: e.size[0] + rnd() * (e.size[1] - e.size[0]), col: e.col[Math.floor(rnd() * e.col.length)], spin: (rnd() - .5) * 12, ph: rnd() * 6, life: e.life * (.6 + rnd() * .4) };
  });
});
function drawParticles(t, W, H) {
  for (const e of EMIT) {
    if (t < e.t || t > e.t + e.life + (e.stream || 0)) continue;
    for (const p of e.ps) {
      const d = t - e.t - p.off; if (d < 0 || d > p.life) continue;
      const k = d / p.life, fade = Math.min(1, d * 8) * (1 - k * k);
      let x = (e.x + p.sx + Math.cos(p.a) * p.v * d) * W;
      let y = (e.y + p.sy) * H + (Math.sin(p.a) * p.v * d + .5 * e.g * d * d) * W;
      const sz = p.size * W / 100;
      g.globalAlpha = fade;
      if (e.kind === "spark") { g.fillStyle = p.col; g.shadowColor = p.col; g.shadowBlur = sz * 4; g.beginPath(); g.arc(x, y, sz * (1 - k * .5), 0, 7); g.fill(); }
      else if (e.kind === "ember" || e.kind === "dust") { x += Math.sin(d * 2 + p.ph) * W * .01; g.fillStyle = p.col; g.shadowColor = p.col; g.shadowBlur = sz * 5; g.globalAlpha = fade * (e.kind === "dust" ? .5 : .9) * (.6 + .4 * Math.sin(d * 5 + p.ph)); g.beginPath(); g.arc(x, y, sz, 0, 7); g.fill(); }
      else if (e.kind === "shard") { g.save(); g.translate(x, y); g.rotate(p.spin * d); g.fillStyle = p.col; g.shadowBlur = 0; g.beginPath(); g.moveTo(-sz, -sz * .4); g.lineTo(sz * .8, -sz * .6); g.lineTo(sz * .3, sz * .7); g.closePath(); g.fill(); g.restore(); }
      else if (e.kind === "coin") { g.save(); g.translate(x, y); const sq = Math.abs(Math.cos(d * 6 + p.ph)); g.scale(Math.max(.15, sq), 1); g.shadowColor = "#ffb52e"; g.shadowBlur = sz * 2; const gr = g.createRadialGradient(-sz * .3, -sz * .3, 0, 0, 0, sz); gr.addColorStop(0, "#fff6c9"); gr.addColorStop(.5, "#ffd36b"); gr.addColorStop(1, "#c98a12"); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, sz, 0, 7); g.fill(); g.restore(); }
    }
  }
  g.globalAlpha = 1; g.shadowBlur = 0;
}
function drawCreature(c, t, W, H, k) {
  const p = ramp(t, c.t0, c.t0 + 3.2), ease = 1 - Math.pow(1 - p, 3);
  const x = (c.x0 + (c.x1 - c.x0) * ease + Math.sin(t * 1.4 + c.ph) * .015) * W, y = (c.y0 + (c.y1 - c.y0) * ease + Math.cos(t * 1.1 + c.ph) * .02) * H;
  const a = clamp((t - c.t0) / .6) * clamp((c.t1 - t) / .8) * k; if (a <= 0) return;
  const s = c.s * W * .07;
  g.globalAlpha = a;
  for (let i = 0; i < 9; i++) { // smoky body
    const ang = i / 9 * 7 + t * .8 + c.ph, rr = s * (.55 + .2 * Math.sin(t * 3 + i));
    const gx = x + Math.cos(ang) * s * .45, gy = y + Math.sin(ang) * s * .35 + s * .15;
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, rr); gr.addColorStop(0, "rgba(8,4,12,.95)"); gr.addColorStop(1, "rgba(8,4,12,0)");
    g.fillStyle = gr; g.fillRect(gx - rr, gy - rr, rr * 2, rr * 2);
  }
  g.fillStyle = "rgba(6,3,10,.96)"; // horns + claws
  [[-1], [1]].forEach(([sd]) => { g.beginPath(); g.moveTo(x + sd * s * .22, y - s * .28); g.quadraticCurveTo(x + sd * s * .5, y - s * .7, x + sd * s * .62, y - s * .78); g.lineTo(x + sd * s * .32, y - s * .2); g.fill();
    const arm = Math.sin(t * 2.4 + c.ph + sd) * .3; g.strokeStyle = "rgba(6,3,10,.9)"; g.lineWidth = s * .09; g.lineCap = "round"; g.beginPath(); g.moveTo(x + sd * s * .3, y + s * .05); g.quadraticCurveTo(x + sd * s * .9, y - s * (.1 + arm), x + sd * s * 1.15, y + s * (.25 - arm)); g.stroke(); });
  const blink = Math.abs(Math.sin(t * 1.1 + c.ph)) > .985 ? .15 : 1;
  g.fillStyle = "#ff3b5c"; g.shadowColor = "#ff1744"; g.shadowBlur = s * .35;
  [-1, 1].forEach(sd => { g.beginPath(); g.ellipse(x + sd * s * .17, y - s * .05, s * .1, s * .065 * blink, sd * .35, 0, 7); g.fill(); });
  g.shadowBlur = s * .2; g.fillStyle = "#ff8a3d"; g.beginPath(); // grin
  g.moveTo(x - s * .2, y + s * .14); for (let i = 0; i <= 6; i++) g.lineTo(x - s * .2 + i * s * .4 / 6, y + s * (i % 2 ? .24 : .16)); g.quadraticCurveTo(x, y + s * .34, x - s * .2, y + s * .14); g.fill();
  g.shadowBlur = 0; g.globalAlpha = 1;
}
function render_fx(t) {
  const W = fx.width = fogc.width = Math.round(fx.clientWidth * devicePixelRatio), H = fx.height = fogc.height = Math.round(fx.clientHeight * devicePixelRatio);
  g = gFog;
  const k = fogK(t) * .85;
  if (k > 0.001) {
    g.globalAlpha = k;
    for (const b of blobs) {
      const x = (b.x + Math.sin(t * .3 * b.s + b.ph) * .08) * W, y = b.y * H, r = b.r * W;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(20,10,28,.72)"); gr.addColorStop(1, "rgba(20,10,28,0)");
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.globalAlpha = 1;
    CREATURES.forEach(c => { if (t > c.t0 && t < c.t1) drawCreature(c, t, W, H, Math.min(1, k * 1.6)); });
  }
  if (t > SHATTER && t < 24.4) { // golden cracks in the tower
    g.strokeStyle = "#ffcf6b"; g.shadowColor = "#ffae2b"; g.shadowBlur = W * .01; g.lineWidth = W * .0025; g.lineCap = "round";
    g.globalAlpha = 1 - ramp(t, 23.4, 24.4);
    CRACKS.forEach(c => { const p = ramp(t, c.t0, c.t0 + .5); const n = Math.max(1, Math.floor(p * (c.pts.length - 1))); g.beginPath(); g.moveTo(c.pts[0][0] * W, c.pts[0][1] * H); for (let i = 1; i <= n; i++) g.lineTo(c.pts[i][0] * W, c.pts[i][1] * H); g.stroke(); });
    g.shadowBlur = 0; g.globalAlpha = 1;
  }
  g = gTop;
  BOLTS.forEach(b => { const d = t - b.t0; if (d < 0 || d > .45) return; g.globalAlpha = d < .08 ? 1 : (d < .16 ? .3 : (d < .24 ? .9 : 1 - ramp(d, .24, .45))); g.strokeStyle = "#f1eeff"; g.shadowColor = "#a99bff"; g.shadowBlur = W * .02; g.lineWidth = W * .004; g.beginPath(); b.pts.forEach(([x, y], i) => i ? g.lineTo(x * W, y * H) : g.moveTo(x * W, y * H)); g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1; });
  WAVES.forEach(([ti, x, y, rgb, s]) => { const d = t - ti; if (d < 0 || d > 1) return; const r = (.05 + d * .55 * s) * W; g.strokeStyle = `rgba(${rgb},${(1 - d) * .9})`; g.lineWidth = W * .012 * (1 - d); g.shadowColor = `rgb(${rgb})`; g.shadowBlur = W * .02; g.beginPath(); g.ellipse(x * W, y * H, r, r * .55, 0, 0, 7); g.stroke(); g.shadowBlur = 0; });
  drawParticles(t, W, H);
}

/* Film grain: four pre-made noise tiles, cycled */
const grainTiles = Array.from({ length: 4 }, () => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), d = x.createImageData(128, 128); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return `url(${c.toDataURL()})`; });
hooks.push(t => { $("grain").style.backgroundImage = grainTiles[Math.floor(t * 24) % 4]; });
/* ===== Sound effects, made live with Web Audio ===== */
const C = (n) => 440 * Math.pow(2, (n - 69) / 12); // midi to Hz
const SFX = [
  ["shimmer", .5, 7], ["riser", 6.6, 1.8], ["boom", 8.3, .5],
  ...REALMS.map((_, i) => ["chime", 8.9 + i * .3, [72, 74, 76, 79, 81, 84][i], .12]),
  ["rumble", 13.6, 10.8],
  ...BOLTS.map(b => ["thunder", b.t0]),
  ...CREATURES.slice(0, 5).map(c => ["whoosh", c.t0, 1.4]),
  ...REALMS.map((_, i) => ["clank", 17.85 + i * .12]),
  ["boom", SHATTER, 1], ["shatter", SHATTER], ["whoosh", 21.6, 1.8],
  ...[0, 1, 2, 3, 4].map(i => ["boom", 24.8 + i * 1.3, .3]),
  ["riser", 31.3, 1.1], ["boom", 32.4, .9], ["chord", 32.45, [60, 64, 67, 72], .1], ...CHIPS.map((_, i) => ["hit", 39.3 + i * .75]), ["riser", 42.6, 1.4],
  ["boom", BREAK, 1.2], ["shatter", BREAK], ["chord", BREAK + .05, [62, 66, 69, 74, 78], .12], ...Array.from({ length: 10 }, (_, i) => ["chime", 49.2 + 3.2 * (1 - Math.pow(1 - (i + 1) / 10, 1 / 1.6)), 72 + [0, 2, 4, 7, 9, 12, 14, 16, 19, 21][i], .06]), ["riser", 51.4, 1.1], ["boom", 52.6, 1.2], ["chord", 52.65, [57, 64, 69, 72], .09],
  ["chime", 57.7, 79, .08], ["chime", 58.25, 83, .08], ["chime", 58.8, 86, .08],
  ...Array.from({ length: 16 }, (_, i) => ["chime", 63.4 + i * .2, [72, 76, 79, 84][i % 4] + (i > 7 ? 12 : 0), .05]), ["riser", 66.3, 1.4], ["boom", 67.7, 1.4], ["chord", 67.75, [60, 64, 67, 72, 76, 79], .12], ["shimmer", 68, 4],
];
function env(gn, t0, a, peak, hold, r) { gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(peak, t0 + a); gn.gain.setValueAtTime(peak, t0 + a + hold); gn.gain.exponentialRampToValueAtTime(.0001, t0 + a + hold + r); }
function osc(type, f, t0, dur, dest, detune = 0) { const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t0); o.detune.value = detune; o.connect(dest); o.start(t0); o.stop(t0 + dur + .1); return o; }
function noise(t0, dur, dest) { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.connect(dest); s.start(t0); s.stop(t0 + dur + .1); return s; }
function filt(type, f, q = 1) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
function play(ev, at, skip) {
  const [kind] = ev; const out = master;
  if (kind === "chime" || kind === "chord") { const [, , n, vol] = ev; (Array.isArray(n) ? n : [n]).forEach((m, i) => { const gn = ac.createGain(); gn.connect(out); env(gn, at + i * (kind === "chord" ? .03 : 0), .005, vol, 0, kind === "chord" ? 3 : 1.6); osc("sine", C(m), at, 3.2, gn); const g2 = ac.createGain(); g2.gain.value = .35; g2.connect(gn); osc("sine", C(m) * 2.01, at, 3.2, g2); }); }
  else if (kind === "boom") { const [, , s] = ev; const gn = ac.createGain(); gn.connect(out); env(gn, at, .005, .5 * s, .05, 1.2); const o = osc("sine", 110, at, 1.4, gn); o.frequency.exponentialRampToValueAtTime(32, at + .9); const lp = filt("lowpass", 260); const g2 = ac.createGain(); lp.connect(g2); g2.connect(out); env(g2, at, .005, .35 * s, 0, .5); noise(at, .6, lp); }
  else if (kind === "thunder") { const lp = filt("lowpass", 900); const gn = ac.createGain(); lp.connect(gn); gn.connect(out); env(gn, at, .01, .55, .15, 2.4); lp.frequency.exponentialRampToValueAtTime(120, at + 2.2); noise(at, 2.8, lp); play(["boom", 0, .8], at, 0); }
  else if (kind === "rumble") { const [, t0, dur] = ev; const len = dur - skip; if (len <= .2) return; const lp = filt("lowpass", 140); const gn = ac.createGain(); lp.connect(gn); gn.connect(out); env(gn, at, 1, .22, Math.max(0, len - 2.2), 1.2); noise(at, len, lp); }
  else if (kind === "whoosh") { const [, , dur] = ev; const bp = filt("bandpass", 300, 1.2); const gn = ac.createGain(); bp.connect(gn); gn.connect(out); env(gn, at, dur * .45, .3, 0, dur * .55); bp.frequency.setValueAtTime(250, at); bp.frequency.exponentialRampToValueAtTime(2200, at + dur * .5); bp.frequency.exponentialRampToValueAtTime(300, at + dur); noise(at, dur, bp); }
  else if (kind === "riser") { const [, , dur] = ev; const bp = filt("bandpass", 300, 2); const gn = ac.createGain(); bp.connect(gn); gn.connect(out); gn.gain.setValueAtTime(.0001, at); gn.gain.exponentialRampToValueAtTime(.28, at + dur); gn.gain.linearRampToValueAtTime(0, at + dur + .05); bp.frequency.setValueAtTime(200, at); bp.frequency.exponentialRampToValueAtTime(5000, at + dur); noise(at, dur, bp); }
  else if (kind === "clank") { [523, 1187, 1853, 2741].forEach((f, i) => { const gn = ac.createGain(); gn.connect(out); env(gn, at, .002, .08 / (i + 1), 0, .35); osc(i % 2 ? "square" : "triangle", f, at, .5, gn); }); const hp = filt("highpass", 3000); const g2 = ac.createGain(); hp.connect(g2); g2.connect(out); env(g2, at, .001, .15, 0, .06); noise(at, .1, hp); }
  else if (kind === "hit") { const gn = ac.createGain(); gn.connect(out); env(gn, at, .003, .14, 0, .5); const o = osc("triangle", 880, at, .6, gn); o.frequency.exponentialRampToValueAtTime(1760, at + .08); play(["clank"], at + .02, 0); }
  else if (kind === "shatter") { const hp = filt("highpass", 2500); const gn = ac.createGain(); hp.connect(gn); gn.connect(out); env(gn, at, .002, .35, .05, .7); noise(at, .9, hp); for (let i = 0; i < 9; i++) { const g3 = ac.createGain(); g3.connect(out); const tt = at + Math.random() * .4; env(g3, tt, .002, .05, 0, .5); osc("sine", 2000 + Math.random() * 4000, tt, .6, g3); } }
  else if (kind === "shimmer") { const [, , dur] = ev; const len = dur - skip; if (len <= .2) return; const hp = filt("bandpass", 6000, 3); const gn = ac.createGain(); hp.connect(gn); gn.connect(out); env(gn, at, 1, .06, Math.max(0, len - 2), 1); noise(at, len, hp); }
}
let ac = null, master = null, noiseBuf = null, reverb = null;
function ensureAudio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ac = new AC();
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ac.state === "suspended") ac.resume();
  return true;
}
function makeReverb() {
  const len = ac.sampleRate * 2.6, buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  const cv = ac.createConvolver(); cv.buffer = buf; return cv;
}
function startAudio(fromT) {
  if (!ensureAudio()) return;
  stopAudio();
  master = ac.createGain(); master.gain.value = .8;
  const comp = ac.createDynamicsCompressor(); master.connect(comp); comp.connect(ac.destination);
  const now = ac.currentTime + .05;
  SFX.forEach(ev => {
    const t0 = ev[1];
    const sustained = ev[0] === "rumble" || ev[0] === "shimmer";
    const end = sustained ? t0 + ev[2] : t0 + 3;
    if (end <= fromT) return;
    if (t0 >= fromT - .02) play(ev, now + Math.max(0, t0 - fromT), 0);
    else if (sustained) play(ev, now, fromT - t0);
  });
  scheduleNarration(fromT);
}
function stopAudio() {
  audioSession++;
  if (master) { try { master.disconnect(); } catch (e) { /* already disconnected */ } master = null; }
}

/* Narration: fetched as soon as the page loads, decoded once audio is allowed. */
let audioSession = 0, narrBufs = null, narrDecoding = null;
const narrBytes = Promise.all(NARRATION.map(url => fetch(url).then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null)));
function decodeNarration() {
  if (!narrDecoding) narrDecoding = narrBytes.then(list => Promise.all(list.map(b => (b ? new Promise(res => ac.decodeAudioData(b, res, () => res(null))) : null)))).then(b => (narrBufs = b));
  return narrDecoding;
}
// Light cinematic treatment: a little warmth and air, gentle compression, a short hall.
function voiceInto(out) {
  const low = ac.createBiquadFilter(); low.type = "lowshelf"; low.frequency.value = 180; low.gain.value = 3;
  const air = ac.createBiquadFilter(); air.type = "highshelf"; air.frequency.value = 6000; air.gain.value = 2;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -22; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .2;
  if (!reverb) reverb = makeReverb();
  const hall = ac.createConvolver(); hall.buffer = reverb.buffer; const wet = ac.createGain(); wet.gain.value = .2;
  const lift = ac.createGain(); lift.gain.value = 1.5;
  low.connect(air); air.connect(comp); comp.connect(lift); lift.connect(out); lift.connect(hall); hall.connect(wet); wet.connect(out);
  return low;
}
function scheduleNarration(fromT) {
  const session = audioSession;
  decodeNarration().then(bufs => {
    if (!playing || !master || session !== audioSession) return;
    const now = ac.currentTime + .02, at = t, input = voiceInto(master);
    bufs.forEach((buf, i) => {
      if (!buf) return;
      const s = LINES[i][0]; if (s + buf.duration <= at) return;
      const src = ac.createBufferSource(); src.buffer = buf; src.connect(input);
      if (s >= at) src.start(now + (s - at)); else src.start(now, at - s);
    });
  });
}

/* ===== Captions ===== */
const cap = $("caption"); let lastLine = -2;
hooks.push(t => {
  const i = LINES.findIndex(([s, e]) => t >= s && t < e);
  if (i !== lastLine) { lastLine = i; cap.textContent = i >= 0 && !LINES[i][3] ? LINES[i][2] : ""; }
});

/* ===== Parent page ===== */
const tell = type => { if (parent !== window) parent.postMessage({ source: "reliq-intro", type }, location.origin); };
const GO_AT = 70.5;
hooks.push(t => { $("go").classList.toggle("live", t >= GO_AT); $("go").tabIndex = t >= GO_AT ? 0 : -1; });
$("go").onclick = () => tell("finish");

/* ===== Clock ===== */
let t = 0, playing = false, started = false, last = 0;
function render() {
  const ms = t * 1000;
  for (const a of anims) a.currentTime = ms;
  for (const h of hooks) h(t);
  render_fx(t);
}
function frame(now) {
  if (!playing) return;
  t += Math.min(.1, (now - last) / 1000); last = now;
  if (t >= DUR) { t = DUR; render(); setPlaying(false); tell("ended"); return; }
  render();
  requestAnimationFrame(frame);
}
function setPlaying(p) {
  playing = p;
  const done = t >= DUR;
  $("bigplay").hidden = p || done;
  $("bigplayLabel").textContent = started ? "Tap to keep watching" : "Tap to play. Sound on!";
  if (p) { last = performance.now(); startAudio(t); requestAnimationFrame(frame); }
  else stopAudio();
}
$("bigplay").onclick = () => { if (!started) { started = true; t = 0; } setPlaying(true); };
$("stage").addEventListener("click", e => { if (playing && !e.target.closest("button")) setPlaying(false); });
document.addEventListener("visibilitychange", () => { if (document.hidden && playing) setPlaying(false); });
addEventListener("resize", () => render());

// Poster frame: the glowing tower with its ring of runes. #t30 opens at 30 seconds (for checks).
const jump = /^#t(\d+(\.\d+)?)$/.exec(location.hash);
t = jump ? Math.min(DUR, +jump[1]) : 7.6; render();
if (jump) $("bigplay").hidden = true;
