import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { SEC_ACTIVITIES, MIN_ACTIVITIES, HR_ACTIVITIES, ALL_ACTIVITIES, UNIT_WORD, type DurActivity, type DurUnit } from "@/data/activities/year3Measurelands/durationActivities";

// ── Measurelands · L3 · Week 5 · Lesson 1 — "Minutes and Seconds" (Understand) ──
// AC9M3M03: recognise which unit (seconds/minutes/hours) describes an activity.
// THREE rotating activities: chooseUnit · sort · spotMistake.

type DurTask = Extract<PracticeTask, { kind: "duration" }>;

type Mem = { introShown: boolean; cursor: number; recent: string[] };
const mem = new Map<string, Mem>();
const ROTATION: Array<"chooseUnit" | "sort" | "spotMistake"> = ["chooseUnit", "sort", "spotMistake", "chooseUnit", "spotMistake", "sort"];

function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0, recent: [] }; mem.set(id, c); return c; }
function randInt(n: number) { return Math.floor(Math.random() * n); }
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function pick(m: Mem): DurActivity { for (let k = 0; k < 30; k++) { const o = ALL_ACTIVITIES[randInt(ALL_ACTIVITIES.length)]!; if (!m.recent.includes(o.label)) { m.recent.push(o.label); if (m.recent.length > 6) m.recent.shift(); return o; } } return ALL_ACTIVITIES[randInt(ALL_ACTIVITIES.length)]!; }

function buildIntro(): DurTask {
  return { kind: "duration", scene: "intro", prompt: "Not every activity takes the same time!", speakText: "Professor Gauge says: not every activity takes the same amount of time. A blink takes seconds, brushing your teeth takes minutes, and a school day takes hours.", badgeLabel: "Meazurex Mission", feedback: { correct: "Let's go!", wrong: "Let's go!" } };
}

function buildChooseUnit(m: Mem): DurTask {
  const a = pick(m);
  return {
    kind: "duration", scene: "chooseUnit",
    prompt: `Would you measure "${a.label}" in seconds, minutes or hours?`,
    speakText: `Would you measure ${a.label} in seconds, minutes or hours?`,
    badgeLabel: "Which Unit?",
    activity: { label: a.label, emoji: a.emoji },
    options: ["Seconds", "Minutes", "Hours"],
    correctOption: cap(UNIT_WORD[a.unit]),
    feedback: { correct: `Yes — ${a.label} takes ${UNIT_WORD[a.unit]}.`, wrong: `Think how quickly it finishes — ${a.label} takes ${UNIT_WORD[a.unit]}.` },
  };
}

function buildSort(m: Mem): DurTask {
  const items = shuffle([...shuffle(SEC_ACTIVITIES).slice(0, 2), ...shuffle(MIN_ACTIVITIES).slice(0, 2), ...shuffle(HR_ACTIVITIES).slice(0, 2)]).map((a) => ({ label: a.label, emoji: a.emoji, unit: a.unit }));
  m.recent = items.map((i) => i.label).slice(-6);
  return { kind: "duration", scene: "sort", prompt: "Sort each activity into seconds, minutes or hours.", speakText: "Sort each activity. Tap an activity, then tap the seconds, minutes or hours bin.", badgeLabel: "Sort the Activities", items, feedback: { correct: "All sorted — great time sense!", wrong: "Not that bin — think how long it takes." } };
}

function buildSpotMistake(m: Mem): DurTask {
  const a = pick(m);
  const correctClaim = randInt(2) === 0;
  if (correctClaim) {
    return { kind: "duration", scene: "spotMistake", prompt: "Does that make sense?", speakText: `Professor Gauge says ${a.label} takes about ${a.value} ${UNIT_WORD[a.unit]}. Does that make sense?`, badgeLabel: "Does That Make Sense?", activity: { label: a.label, emoji: a.emoji }, statement: cap(`${a.label} takes about ${a.value} ${UNIT_WORD[a.unit]}.`), options: ["Yes, that makes sense", "No, that's not sensible"], correctOption: "Yes, that makes sense", feedback: { correct: `Right — ${a.label} takes about ${a.value} ${UNIT_WORD[a.unit]}.`, wrong: `That one is fine — ${a.label} really takes about ${a.value} ${UNIT_WORD[a.unit]}.` } };
  }
  const others: DurUnit[] = (["s", "min", "hr"] as DurUnit[]).filter((u) => u !== a.unit);
  const sillyUnit = others[randInt(others.length)]!;
  const sillyVal = 2 + randInt(28);
  return { kind: "duration", scene: "spotMistake", prompt: "Does that make sense?", speakText: `Professor Gauge says ${a.label} takes ${sillyVal} ${UNIT_WORD[sillyUnit]}. Does that make sense?`, badgeLabel: "Does That Make Sense?", activity: { label: a.label, emoji: a.emoji }, statement: cap(`${a.label} takes ${sillyVal} ${UNIT_WORD[sillyUnit]}.`), options: ["No, that's not sensible", "Yes, that makes sense"], correctOption: "No, that's not sensible", feedback: { correct: `Yes — ${a.label} takes about ${a.value} ${UNIT_WORD[a.unit]}, not ${sillyVal} ${UNIT_WORD[sillyUnit]}.`, wrong: `Look again — ${sillyVal} ${UNIT_WORD[sillyUnit]} is silly. ${cap(a.label)} takes about ${a.value} ${UNIT_WORD[a.unit]}.` } };
}

export function generateY3MeasurelandsWeek5Lesson1Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro(); }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "sort") return buildSort(m);
  if (a === "spotMistake") return buildSpotMistake(m);
  return buildChooseUnit(m);
}
export function resetY3MeasurelandsWeek5Lesson1TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek5Lesson1QuizTasks(): PracticeTask[] {
  const s: Mem = { introShown: true, cursor: 0, recent: [] };
  return [buildChooseUnit(s), buildSpotMistake(s), buildChooseUnit(s), buildSpotMistake(s), buildChooseUnit(s)];
}
