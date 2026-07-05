import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { ALL_ACTIVITIES, type DurActivity, type DurUnit } from "@/data/activities/year3Measurelands/durationActivities";

// ── Measurelands · L3 · Week 5 · Lesson 2 — "Estimate a Duration" (Estimate) ──
// AC9M3M03: make a sensible estimate of how long a familiar activity takes.
// THREE rotating activities: estimate · bestEstimate · challenge (choose unit + estimate).

type DurTask = Extract<PracticeTask, { kind: "duration" }>;

const VALUE_SET: Record<DurUnit, number[]> = {
  s: [1, 2, 5, 10, 20, 30, 45],
  min: [1, 2, 3, 5, 10, 20, 30, 45, 60, 90],
  hr: [1, 2, 3, 4, 5, 6, 8, 10, 12],
};

// Real-world "complete the estimation" cloze scenarios (mixed-unit distractors,
// including days/weeks) — concrete contexts that match classroom assessment.
const SCENARIOS: Array<{ emoji: string; sentence: string; correct: string; distractors: string[] }> = [
  { emoji: "✈️", sentence: "It takes about ___ to fly from Sydney to London.", correct: "24 hours", distractors: ["8 hours", "4 days", "2 weeks"] },
  { emoji: "🚗", sentence: "It takes about ___ to drive from Adelaide to Melbourne.", correct: "8 hours", distractors: ["90 minutes", "8 minutes", "8 days"] },
  { emoji: "🍿", sentence: "A movie is about ___ long.", correct: "2 hours", distractors: ["240 seconds", "2 minutes", "24 minutes"] },
  { emoji: "🥪", sentence: "A jam sandwich takes about ___ to make.", correct: "2 minutes", distractors: ["2 seconds", "20 seconds", "2 hours"] },
  { emoji: "🩺", sentence: "A doctor's appointment is usually about ___ long.", correct: "10 minutes", distractors: ["60 seconds", "100 minutes", "1 day"] },
  { emoji: "🏫", sentence: "A school day is about ___ long.", correct: "6 hours", distractors: ["6 minutes", "6 days", "60 minutes"] },
  { emoji: "😴", sentence: "You sleep for about ___ each night.", correct: "8 hours", distractors: ["8 minutes", "8 days", "80 minutes"] },
  { emoji: "🪥", sentence: "You should brush your teeth for about ___.", correct: "2 minutes", distractors: ["2 seconds", "2 hours", "20 minutes"] },
  { emoji: "⚽", sentence: "A football game lasts about ___.", correct: "90 minutes", distractors: ["90 seconds", "9 hours", "9 days"] },
  { emoji: "🏊", sentence: "A swimming lesson is about ___ long.", correct: "45 minutes", distractors: ["45 seconds", "45 hours", "4 days"] },
];

type Mem = { introShown: boolean; cursor: number; recent: string[] };
const mem = new Map<string, Mem>();
const ROTATION: Array<"estimate" | "contextEstimate" | "challenge"> = ["estimate", "contextEstimate", "challenge", "contextEstimate", "estimate", "challenge"];

function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0, recent: [] }; mem.set(id, c); return c; }
function randInt(n: number) { return Math.floor(Math.random() * n); }
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }
function pick(m: Mem): DurActivity { for (let k = 0; k < 30; k++) { const o = ALL_ACTIVITIES[randInt(ALL_ACTIVITIES.length)]!; if (!m.recent.includes(o.label)) { m.recent.push(o.label); if (m.recent.length > 6) m.recent.shift(); return o; } } return ALL_ACTIVITIES[randInt(ALL_ACTIVITIES.length)]!; }

function estimateOptions(a: DurActivity): number[] {
  const others = shuffle(VALUE_SET[a.unit].filter((v) => v !== a.value)).slice(0, 2);
  return shuffle([a.value, ...others]);
}

function buildIntro(): DurTask {
  return { kind: "duration", scene: "intro", prompt: "Estimate how long things take.", speakText: "Professor Gauge says: good measurers make sensible estimates before checking. Think about how long each activity really takes.", badgeLabel: "Meazurex Mission", feedback: { correct: "Let's estimate!", wrong: "Let's estimate!" } };
}

function buildEstimate(m: Mem, challenge = false): DurTask {
  const a = pick(m);
  return {
    kind: "duration", scene: "estimate",
    prompt: challenge ? `Estimate Challenge: ${a.label}` : `How long does it take to ${a.label}?`,
    speakText: challenge ? `Estimate challenge. Choose the unit for ${a.label}, then estimate how long it takes.` : `How long does it take to ${a.label}? Make a sensible estimate.`,
    badgeLabel: challenge ? "Estimate Challenge" : "Make Your Estimate",
    activity: { label: a.label, emoji: a.emoji },
    estimateValue: a.value, estimateUnit: a.unit,
    estimateOptions: estimateOptions(a),
    chooseUnitFirst: challenge,
    feedback: { correct: "Nice estimating!", wrong: "Choose the sensible unit first." },
  };
}

function buildContextEstimate(m: Mem): DurTask {
  let s = SCENARIOS[randInt(SCENARIOS.length)]!;
  for (let k = 0; k < 20 && m.recent.includes(s.sentence); k++) s = SCENARIOS[randInt(SCENARIOS.length)]!;
  m.recent.push(s.sentence); if (m.recent.length > 5) m.recent.shift();
  return {
    kind: "duration", scene: "contextEstimate",
    prompt: "Complete the time estimation.",
    speakText: s.sentence.replace("___", "how long"),
    badgeLabel: "Complete the Estimation",
    activity: { label: "", emoji: s.emoji },
    sentence: s.sentence,
    options: shuffle([s.correct, ...s.distractors]),
    correctOption: s.correct,
    feedback: { correct: `Yes — ${s.sentence.replace("___", s.correct)}`, wrong: `Think about it — ${s.sentence.replace("___", s.correct)}` },
  };
}

export function generateY3MeasurelandsWeek5Lesson2Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro(); }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "contextEstimate") return buildContextEstimate(m);
  if (a === "challenge") return buildEstimate(m, true);
  return buildEstimate(m, false);
}
export function resetY3MeasurelandsWeek5Lesson2TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek5Lesson2QuizTasks(): PracticeTask[] {
  const s: Mem = { introShown: true, cursor: 0, recent: [] };
  return [buildContextEstimate(s), buildContextEstimate(s), buildContextEstimate(s), buildContextEstimate(s), buildContextEstimate(s)];
}
