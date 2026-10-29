// Level 8 weekly lesson content audit: checks the words and working students
// read, beyond the marking tests. Samples every lesson's question generator and
// every skill guide, then reports (does not fail on) suspected problems.
//   node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/level8-content-audit.mjs
import { LEVEL8_FACTORIES, level8Question } from "../data/activities/level8/questions.ts";
import { LEVEL8_PROGRAMS } from "../data/activities/level8/program.ts";
import { LEVEL8_TEACHING, level8TeachingGuide } from "../data/activities/level8/teaching/index.ts";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { LEVEL8_WEEK_COUNTS } from "../lib/level8-config.ts";

const SEEDS = 40;
const findings = [];
const add = (where, kind, detail) => findings.push({ where, kind, detail: detail.slice(0, 220) });

// Whole calculation chains such as "8 + 4 + 1 = 13" or "4 + 4 = 4 × 2 = 8",
// evaluated with normal order of operations. Chains touching letters, brackets,
// powers or fractions are skipped (they can't be checked as plain numbers).
const N = String.raw`[−-]?\$?\d+(?:\.\d+)?`;
const EXPR = String.raw`${N}(?:\s*[×÷+−*]\s*${N})*`;
const CHAIN = new RegExp(String.raw`(?<![\w.^/²³⁰-⁹(×÷+−*=$√?-]\s*)(?<!\b(?:of|by)\s)(${EXPR}(?:\s*=\s*${EXPR})+)(?![\w(^/²³⁰-⁹.]\w|[\w(^/²³⁰-⁹]|\s*[×÷+−*]\s*[\d(]|\s\d+\/\d)`, "g");
function evaluate(expr) {
  const js = expr.replace(/\$/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  if (!/^[\d.\s*/+-]+$/.test(js)) return NaN;
  try { return Function(`"use strict";return (${js});`)(); } catch { return NaN; }
}
function checkArithmetic(where, text) {
  const clean = text.replace(/(\d) (\d{3})(?!\d)/g, "$1$2").replace(/(\d),(\d{3})(?!\d)/g, "$1$2");
  for (const m of clean.matchAll(CHAIN)) {
    const parts = m[1].split("=").map((part) => part.trim());
    const values = parts.map(evaluate);
    if (!values.every(Number.isFinite)) continue;
    for (let i = 1; i < values.length; i += 1) {
      const tolerance = Math.max(0.006, Math.abs(values[i]) * 0.005);
      if (Math.abs(values[i] - values[i - 1]) > tolerance) {
        add(where, "arithmetic", `"${parts[i - 1]} = ${parts[i]}" (${+values[i - 1].toFixed(4)} ≠ ${+values[i].toFixed(4)}) in: ${text}`);
        break;
      }
    }
  }
}

const WORDING = [
  [/ {2,}/, "double space"],
  [/\.\./, "double full stop"],
  [/[a-z][.!?][A-Z][a-z]/, "missing space after sentence"],
  [/(?<![A-Za-z/])a (?:[aeio][a-z]|8\b|8\d|11\b|18\b|80)/, "'a' before vowel sound"],
  [/\bundefined\b|\bnull\b|NaN|\[object/, "broken value"],
  [/(?<![\d.])-0(?![.\d])/, "negative zero"],
  [/(?<![\d.\/])1 (metres|centimetres|kilometres|units|squares|hours|minutes|seconds|days|people|students|marbles|counters|outcomes|weeks|years|times|cards|balls)\b/, "singular/plural"],
  [/\b(color|center|meter|liter|favorite|behavior|gray|neighbor|organize|realize|analyze|traveled|labeled|modeled)\b/i, "US spelling"],
  [/[A-Za-z]\s[,.;](?!\d)/, "space before punctuation"],
  [/\(\s|\s\)/, "space inside brackets"],
  [/\b([A-Za-z]{2,}) \1\b/i, "repeated word"],
  [/\d\.\d*(?:0000000|9999999)\d/, "floating-point leftovers"],
];
function checkWording(where, text) {
  for (const [re, label] of WORDING) if (re.test(text)) add(where, "wording", `${label}: ${text}`);
}

// Real-world sense: would anyone actually write it this way?
const COUNT_NOUNS = "people|persons|students|children|kids|players|teams|cars|buses|books|eggs|apples|tickets|chairs|tables|boxes|bags|cards|marbles|counters|coins|houses|dogs|cats|trees|plants|pizzas sold|visitors|members|households|days|weeks|games|matches|goals|questions|pages";
const REALISM = [
  [/(?<![\d.])\d+(?: \d+)?\/\d+ ?(?:°C|°F|mm|cm|km|m|mL|L|kg|g|t)\b/, "fraction with a metric unit or temperature"],
  [/\$\d+ \d+\/\d+|\$\d+\/\d+|\d+\/\d+ (?:dollars|cents)/, "fraction of money"],
  [/\$\d+\.\d(?!\d)|\$\d+\.\d{3,}/, "money not to 2 decimal places"],
  [/-?\d+\.\d+ ?\$/, "money unit after the number"],
  [new RegExp(String.raw`(?<![\d.])\d+\.\d+ (?:${COUNT_NOUNS})\b`), "decimal count of whole things"],
  [new RegExp(String.raw`(?<![\d.])\d+ \d+\/\d+ (?:${COUNT_NOUNS})\b`), "fractional count of whole things"],
  [/(?<![\d.])\d+\.\d+ (?:hours?|minutes?) (?:late|early|after|before)\b/, "decimal time where clock time is expected"],
  [/−?\d{3,}(?:\.\d+)?°C|[−-](?:[6-9]\d|\d{3,})(?:\.\d+)?°C|(?<![\d.])(?:[6-9]\d|\d{3,})(?:\.\d+)?°C/, "implausible air temperature"],
  [/(?<![\d.])(?:1[2-9]\d|[2-9]\d\d)(?:\.\d+)? years old/, "implausible age"],
];
function checkRealism(where, text) {
  for (const [re, label] of REALISM) if (re.test(text)) add(where, "real-world sense", `${label}: ${text}`);
}

let questions = 0, guides = 0;
for (const realm of Object.keys(LEVEL8_FACTORIES)) {
  for (let week = 1; week <= LEVEL8_WEEK_COUNTS[realm]; week++) {
    for (let lesson = 1; lesson <= 3; lesson++) {
      const title = LEVEL8_PROGRAMS[realm][week - 1].lessons[lesson - 1].title;
      const where = `${realm} W${week} L${lesson} "${title}"`;
      const prompts = new Set();
      for (let s = 0; s < SEEDS; s++) {
        const q = level8Question(realm, week, lesson, s * 7919 + 101);
        questions++;
        // a question differs when its wording or its data (table, plot, diagram) differs
        prompts.add(JSON.stringify([q.prompt, q.cave7Visual, q.space8Visual, q.measurement8Visual, q.number8Visual, q.algebra8Visual, q.chance8Visual]));
        const answer = String(q.answer);
        const all = [q.prompt, ...q.steps].join(" ");
        checkWording(where, q.prompt);
        checkRealism(where, q.prompt);
        q.steps.forEach((step) => { checkWording(where, step); checkArithmetic(where, step); });
        // the working should reach the answer
        const core = answer.replace(/^\$/, "").replace(/[a-z ²³]+$/i, "").trim();
        if (core.length >= 1 && !q.steps.join(" ").replace(/−/g, "-").replace(/,(?=\d{3})/g, "").includes(core.replace(/,(?=\d{3})/g, "")) && !(q.options?.length > 1))
          add(where, "answer not in working", `answer ${answer} | prompt: ${q.prompt} | last step: ${q.steps.at(-1)}`);
        // answer given away by the question (numbers only, long enough to matter)
        if (/^\$?[−-]?\d[\d.,]*$/.test(answer) && answer.replace(/\D/g, "").length >= 3 && new RegExp(`(?<![\\d.])${answer.replace(/[$.]/g, "\\$&")}(?![\\d.])`).test(q.prompt))
          add(where, "answer in question", `answer ${answer} | ${q.prompt}`);
        if (q.steps.length < 2) add(where, "thin working", `only ${q.steps.length} step: ${all}`);
      }
      if (prompts.size < 8) add(where, "low variety", `${prompts.size} different questions in ${SEEDS} tries`);
      // skill guide
      const guide = LEVEL8_TEACHING[realm][week - 1]?.[lesson - 1];
      if (!guide) { add(where, "missing guide", "no skill guide"); continue; }
      guides++;
      for (const text of [guide.idea, ...guide.steps, guide.check, guide.example?.prompt ?? ""]) { checkWording(`${where} (guide)`, text); checkArithmetic(`${where} (guide)`, text); }
      if (guide.steps.length < 2) add(`${where} (guide)`, "thin guide", guide.steps.join(" | "));
    }
  }
}

// Guide worked examples without a fixed example come from the generator (seed 7007),
// and their steps are hand-written for that question. If a generator change alters the
// example, the steps must be rewritten: fail until the snapshot is updated deliberately.
const SNAP = new URL("../data/activities/level8/teaching/example-snapshot.json", import.meta.url);
const current = {};
for (const realm of Object.keys(LEVEL8_TEACHING)) LEVEL8_TEACHING[realm].forEach((ls, w) => ls.forEach((g, l) => {
  if (g.example) return;
  const ex = level8TeachingGuide(realm, w + 1, l + 1).example;
  current[`${realm} W${w + 1}L${l + 1}`] = `${ex.prompt} → ${ex.answer}`;
}));
let drift = 0;
if (process.argv.includes("--update-guide-snapshot") || !existsSync(SNAP)) writeFileSync(SNAP, JSON.stringify(current, null, 1) + "\n");
else {
  const saved = JSON.parse(readFileSync(SNAP, "utf8"));
  for (const [k, v] of Object.entries(current)) if (saved[k] !== v) { drift++; add(k + " (guide)", "guide example changed", `steps were written for "${saved[k]}" but the example is now "${v}". Rewrite the steps, then run with --update-guide-snapshot.`); }
}

const byKind = {};
for (const f of findings) (byKind[f.kind] ??= []).push(f);
console.log(`Checked ${questions} generated questions and ${guides} skill guides.`);
for (const [kind, list] of Object.entries(byKind)) {
  // collapse repeats from the same lesson
  const seen = new Map();
  for (const f of list) { const k = `${f.where}|${f.detail.slice(0, 60)}`; if (!seen.has(k)) seen.set(k, f); }
  console.log(`\n== ${kind}: ${list.length} hits, ${seen.size} distinct`);
  for (const f of [...seen.values()].slice(0, 60)) console.log(`- ${f.where}: ${f.detail}`);
}
if (!findings.length) console.log("No content problems found.");
if (drift) { console.error(`\n${drift} guide example(s) changed without updating their steps.`); process.exit(1); }
