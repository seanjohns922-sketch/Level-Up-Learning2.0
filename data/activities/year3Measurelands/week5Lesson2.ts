import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { ALL_ACTIVITIES, UNIT_WORD, type DurActivity, type DurUnit } from "@/data/activities/year3Measurelands/durationActivities";

// ── Measurelands · L3 · Week 5 · Lesson 2 — "Estimate a Duration" (Estimate) ──
// AC9M3M03: make a sensible estimate of how long a familiar activity takes.
// THREE rotating activities: estimate · bestEstimate · challenge (choose unit + estimate).

type DurTask = Extract<PracticeTask, { kind: "duration" }>;

const VALUE_SET: Record<DurUnit, number[]> = {
  s: [1, 2, 5, 10, 20, 30, 45],
  min: [1, 2, 3, 5, 10, 20, 30, 45, 60, 90],
  hr: [1, 2, 3, 4, 5, 6, 8, 10, 12],
};

type Mem = { introShown: boolean; cursor: number; recent: string[] };
const mem = new Map<string, Mem>();
const ROTATION: Array<"estimate" | "bestEstimate" | "challenge"> = ["estimate", "bestEstimate", "challenge", "bestEstimate", "estimate", "challenge"];

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

function buildBestEstimate(m: Mem): DurTask {
  const a = pick(m);
  const correct = `${a.value} ${UNIT_WORD[a.unit]}`;
  const others: DurUnit[] = (["s", "min", "hr"] as DurUnit[]).filter((u) => u !== a.unit);
  const distractors = others.map((u) => `${a.value} ${UNIT_WORD[u]}`);
  return {
    kind: "duration", scene: "bestEstimate",
    prompt: `Which is the best estimate for "${a.label}"?`,
    speakText: `Which is the best estimate for how long it takes to ${a.label}?`,
    badgeLabel: "Choose the Best Estimate",
    activity: { label: a.label, emoji: a.emoji },
    options: shuffle([correct, ...distractors]),
    correctOption: correct,
    feedback: { correct: `Yes — ${a.label} takes about ${correct}.`, wrong: `Think about it — ${a.label} takes about ${correct}.` },
  };
}

export function generateY3MeasurelandsWeek5Lesson2Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro(); }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "bestEstimate") return buildBestEstimate(m);
  if (a === "challenge") return buildEstimate(m, true);
  return buildEstimate(m, false);
}
export function resetY3MeasurelandsWeek5Lesson2TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek5Lesson2QuizTasks(): PracticeTask[] {
  const s: Mem = { introShown: true, cursor: 0, recent: [] };
  return [buildBestEstimate(s), buildBestEstimate(s), buildBestEstimate(s), buildBestEstimate(s), buildBestEstimate(s)];
}
