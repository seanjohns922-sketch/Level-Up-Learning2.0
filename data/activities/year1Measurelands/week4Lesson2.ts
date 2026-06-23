import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  DURATION_ACTIVITIES,
  DURATION_BY_UNIT,
  DURATION_RANK,
  type DurationActivity,
  type DurationUnit,
} from "@/data/activities/year1Measurelands/week4Lesson1";

// ── Measurelands · Level 1 · Week 4 · Lesson 2 — "Compare Durations" ──
// AC9M1M03: compare familiar events using hour/day/week. Lesson 1 taught the
// units; here students compare and order events by them. Reuses the durationUnit
// card and the Lesson 1 scene library — no new art.
//   A — Which Lasts Longer?  (scene "compare", two events, tap the longer)
//   B — Which Lasts Shorter? (scene "compare", two events, tap the shorter)
//   C — Duration Ladder      (scene "compare", three events, tap longest/shortest)

type DurationTask = Extract<PracticeTask, { kind: "durationUnit" }>;
type Unit = DurationUnit;

type LessonMemory = { introShown: boolean; cursor: number; lastId: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastId: null };
  lessonMemory.set(lessonId, created);
  return created;
}

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}
function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

const toItem = (a: DurationActivity) => ({ id: a.id, imageSrc: a.image, label: a.label, unit: a.unit });

function buildIntroTask(): DurationTask {
  const movie = DURATION_ACTIVITIES.find((a) => a.id === "movie")!;
  const school = DURATION_ACTIVITIES.find((a) => a.id === "school-day")!;
  return {
    kind: "durationUnit",
    scene: "intro",
    prompt: "Now we can compare how long events last.",
    speakText:
      "Professor Gauge says: now that we know about hours, days and weeks, we can compare events. A school day lasts longer than a movie. Remember — think about how long it takes, not how big the picture is!",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: movie.image, label: "Movie Night", unit: "hour", caption: "A movie is about an hour." },
      { imageSrc: school.image, label: "School Day", unit: "day", caption: "A school day is longer — it lasts about a day." },
    ],
    feedback: { correct: "Let's compare!", wrong: "Let's get ready." },
  };
}

// Two events from different units; tap the longer (A) or shorter (B).
function buildCompareTask(memory: LessonMemory, longer: boolean): DurationTask {
  const units = shuffle(["hour", "day", "week"] as Unit[]).slice(0, 2) as [Unit, Unit];
  const a = choose(DURATION_BY_UNIT[units[0]]);
  const b = choose(DURATION_BY_UNIT[units[1]]);
  memory.lastId = b.id;
  const winner = longer
    ? (DURATION_RANK[a.unit] > DURATION_RANK[b.unit] ? a : b)
    : (DURATION_RANK[a.unit] < DURATION_RANK[b.unit] ? a : b);
  return {
    kind: "durationUnit",
    scene: "compare",
    prompt: longer ? "Which lasts longer?" : "Which lasts a shorter time?",
    speakText: longer ? "Which activity lasts longer?" : "Which activity lasts a shorter time?",
    badgeLabel: longer ? "Which Lasts Longer?" : "Which Lasts Shorter?",
    items: shuffle([toItem(a), toItem(b)]),
    compareMode: longer ? "longer" : "shorter",
    correctOptionId: winner.id,
    feedback: { correct: "Great time thinking!", wrong: "Think about how long each one takes, not the picture." },
  };
}

// Activity C — Duration Ladder: three events (one per unit), tap longest/shortest.
function buildLadderTask(memory: LessonMemory, longest: boolean): DurationTask {
  const hour = choose(DURATION_BY_UNIT.hour);
  const day = choose(DURATION_BY_UNIT.day);
  const week = choose(DURATION_BY_UNIT.week);
  memory.lastId = week.id;
  const target = longest ? week : hour;
  return {
    kind: "durationUnit",
    scene: "compare",
    prompt: longest ? "Which lasts the longest?" : "Which lasts the shortest?",
    speakText: longest ? "Which activity lasts the longest?" : "Which activity lasts the shortest?",
    badgeLabel: "Duration Ladder",
    items: shuffle([toItem(hour), toItem(day), toItem(week)]),
    correctOptionId: target.id,
    feedback: { correct: "Excellent comparing!", wrong: "Think about how long each one takes." },
  };
}

// Quiz helper — "which activity takes about a <unit>?" (one per unit shown).
function buildPickByUnit(target: Unit): DurationTask {
  const hour = choose(DURATION_BY_UNIT.hour);
  const day = choose(DURATION_BY_UNIT.day);
  const week = choose(DURATION_BY_UNIT.week);
  const byUnit: Record<Unit, DurationActivity> = { hour, day, week };
  return {
    kind: "durationUnit",
    scene: "compare",
    prompt: `Which activity takes about a ${target}?`,
    speakText: `Which activity takes about a ${target}?`,
    badgeLabel: "Which Takes About...",
    items: shuffle([toItem(hour), toItem(day), toItem(week)]),
    correctOptionId: byUnit[target].id,
    feedback: { correct: "Yes — that's about right!", wrong: `Find the one that takes about a ${target}.` },
  };
}

export function generateY1MeasurelandsWeek4Lesson2Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (rotation === "A") return buildCompareTask(memory, true);
  if (rotation === "B") return buildCompareTask(memory, false);
  return buildLadderTask(memory, randInt(2) === 0);
}

export function resetY1MeasurelandsWeek4Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 4 weekly quiz (Lesson 2's contribution):
// longer, shorter, about a week, about an hour, greatest duration.
export function buildY1MeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  return [
    buildCompareTask(seed, true),
    buildCompareTask(seed, false),
    buildPickByUnit("week"),
    buildPickByUnit("hour"),
    buildLadderTask(seed, true),
  ];
}
