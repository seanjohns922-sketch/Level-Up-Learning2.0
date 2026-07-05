import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { SEC_ACTIVITIES, MIN_ACTIVITIES, HR_ACTIVITIES, ALL_ACTIVITIES, UNIT_WORD, toSeconds, type DurActivity, type DurUnit } from "@/data/activities/year3Measurelands/durationActivities";

// ── Measurelands · L3 · Week 5 · Lesson 3 — "Compare Duration" (Compare) ──
// AC9M3M03: compare and reason about how long activities take.
// THREE rotating activities: compareLonger · order · howMuchLonger (typed).

type DurTask = Extract<PracticeTask, { kind: "duration" }>;
type Item = { label: string; emoji: string; value: number; unit: DurUnit };

type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"compareLonger" | "order" | "howMuchLonger"> = ["compareLonger", "order", "howMuchLonger", "compareLonger", "howMuchLonger", "order"];

function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }
function randInt(n: number) { return Math.floor(Math.random() * n); }
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }

/** n distinct activities at their REAL durations; comparable values all distinct. */
function pickItems(n: number, forceUnit?: DurUnit): Item[] {
  const pool = forceUnit === "s" ? SEC_ACTIVITIES : forceUnit === "min" ? MIN_ACTIVITIES : forceUnit === "hr" ? HR_ACTIVITIES : ALL_ACTIVITIES;
  for (let attempt = 0; attempt < 60; attempt++) {
    const objs = shuffle(pool).slice(0, n);
    const items = objs.map((a: DurActivity) => ({ label: a.label, emoji: a.emoji, unit: a.unit, value: a.value }));
    const comps = items.map((i) => toSeconds(i.value, i.unit));
    if (new Set(comps).size === n && new Set(items.map((i) => i.label)).size === n) return items;
  }
  return pool.slice(0, n).map((a: DurActivity) => ({ label: a.label, emoji: a.emoji, unit: a.unit, value: a.value }));
}

function buildIntro(): DurTask {
  return { kind: "duration", scene: "intro", prompt: "Compare how long activities take!", speakText: "Professor Gauge says: some activities take longer than others. Let's compare them.", badgeLabel: "Meazurex Mission", feedback: { correct: "Let's compare!", wrong: "Let's compare!" } };
}

function buildCompareLonger(_m: Mem): DurTask {
  const items = pickItems(2);
  const longer = toSeconds(items[0]!.value, items[0]!.unit) > toSeconds(items[1]!.value, items[1]!.unit) ? items[0]! : items[1]!;
  return { kind: "duration", scene: "compareLonger", prompt: "Which takes longer?", speakText: `Which takes longer, ${items[0]!.label} or ${items[1]!.label}?`, badgeLabel: "Which Takes Longer?", compareItems: items, correctLabel: longer.label, options: shuffle(items.map((i) => i.label)), correctOption: longer.label, feedback: { correct: `Yes — ${longer.label} takes longer.`, wrong: `Compare both — ${longer.label} takes longer.` } };
}

function buildOrder(_m: Mem): DurTask {
  const items = pickItems(4);
  const ordered = [...items].sort((a, b) => toSeconds(a.value, a.unit) - toSeconds(b.value, b.unit));
  return { kind: "duration", scene: "order", prompt: "Order the activities from shortest to longest.", speakText: "Tap the activities in order, from the shortest time to the longest.", badgeLabel: "Order by Duration", compareItems: shuffle(items), orderedLabels: ordered.map((i) => i.label), feedback: { correct: "Good ordering — shortest to longest!", wrong: "Start with the shortest — tap the quickest first." } };
}

function buildHowMuchLonger(_m: Mem): DurTask {
  const unit: DurUnit = (["s", "min", "hr"] as DurUnit[])[randInt(3)]!;
  const items = pickItems(2, unit);
  const hi = items[0]!.value > items[1]!.value ? items[0]! : items[1]!;
  const lo = hi === items[0]! ? items[1]! : items[0]!;
  const diff = hi.value - lo.value;
  const step = unit === "s" ? 5 : unit === "min" ? 5 : 1;
  const opts = new Set<number>([diff, Math.max(1, diff - step), diff + step]);
  return { kind: "duration", scene: "howMuchLonger", prompt: `How much longer does "${hi.label}" take than "${lo.label}"?`, speakText: `How much longer does ${hi.label} take than ${lo.label}? Type your answer in ${UNIT_WORD[unit]}.`, badgeLabel: "How Much Longer?", compareItems: [hi, lo], answerValue: diff, answerUnit: unit, options: shuffle([...opts]).map((n) => `${n} ${UNIT_WORD[unit]}`), correctOption: `${diff} ${UNIT_WORD[unit]}`, feedback: { correct: `Yes — ${hi.value} − ${lo.value} = ${diff} ${UNIT_WORD[unit]}.`, wrong: `Take away: ${hi.value} − ${lo.value} = ${diff} ${UNIT_WORD[unit]}.` } };
}

export function generateY3MeasurelandsWeek5Lesson3Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro(); }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "order") return buildOrder(m);
  if (a === "howMuchLonger") return buildHowMuchLonger(m);
  return buildCompareLonger(m);
}
export function resetY3MeasurelandsWeek5Lesson3TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek5Lesson3QuizTasks(): PracticeTask[] {
  const s: Mem = { introShown: true, cursor: 0 };
  return [buildCompareLonger(s), buildHowMuchLonger(s), buildCompareLonger(s), buildHowMuchLonger(s), buildCompareLonger(s)];
}
