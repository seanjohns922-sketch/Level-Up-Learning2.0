import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  DURATION_BY_UNIT,
  type DurationActivity,
  type DurationUnit,
} from "@/data/activities/year1Measurelands/week4Lesson1";

// ── Measurelands · Level 1 · Week 4 · Lesson 3 — "Sort by Duration" ──
// AC9M1M03: apply hour/day/week by CLASSIFYING events into duration groups
// (not just comparing). Reuses the durationUnit card + Lesson 1 scene library.
//   A — Sort the Activities  (scene "sort",     place each into Hour/Day/Week)
//   B — Choose the Best Unit (scene "classify", one activity → tap the unit)
//   C — Duration Ladder      (scene "order",    shortest → longest)

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
// One activity from each unit (the building block for sort/order).
function onePerUnit(): { hour: DurationActivity; day: DurationActivity; week: DurationActivity } {
  return {
    hour: choose(DURATION_BY_UNIT.hour),
    day: choose(DURATION_BY_UNIT.day),
    week: choose(DURATION_BY_UNIT.week),
  };
}

function buildIntroTask(): DurationTask {
  const { hour, day, week } = onePerUnit();
  return {
    kind: "durationUnit",
    scene: "intro",
    prompt: "We can sort activities into duration groups.",
    speakText:
      "Professor Gauge says: we can use hours, days and weeks to organise activities. Different activities belong in different groups. Remember — think about how long it takes, not how exciting it is!",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: hour.image, label: hour.label, unit: "hour", caption: "This belongs in the Hour group." },
      { imageSrc: day.image, label: day.label, unit: "day", caption: "This belongs in the Day group." },
      { imageSrc: week.image, label: week.label, unit: "week", caption: "This belongs in the Week group." },
    ],
    feedback: { correct: "Let's sort!", wrong: "Let's get ready." },
  };
}

// Activity A — sort one activity per group into Hour/Day/Week bins.
function buildSortTask(memory: LessonMemory): DurationTask {
  const { hour, day, week } = onePerUnit();
  memory.lastId = week.id;
  return {
    kind: "durationUnit",
    scene: "sort",
    prompt: "Sort each activity into its group.",
    speakText: "Tap an activity, then tap the group it belongs in: hour, day or week.",
    badgeLabel: "Sort the Activities",
    items: shuffle([toItem(hour), toItem(day), toItem(week)]),
    feedback: { correct: "All sorted correctly!", wrong: "Think about how long each one takes." },
  };
}

// Activity B — choose the best duration unit for one activity.
function buildClassifyTask(memory: LessonMemory): DurationTask {
  const all = [...DURATION_BY_UNIT.hour, ...DURATION_BY_UNIT.day, ...DURATION_BY_UNIT.week];
  const a = choose(all.filter((o) => o.id !== memory.lastId));
  memory.lastId = a.id;
  return {
    kind: "durationUnit",
    scene: "classify",
    prompt: `Which duration fits ${a.label.toLowerCase()} best?`,
    speakText: `Which duration fits ${a.label.toLowerCase()} best? An hour, a day, or a week?`,
    badgeLabel: "Choose the Best Duration",
    activity: { imageSrc: a.image, label: a.label, unit: a.unit },
    feedback: { correct: "That's the best fit!", wrong: "Think about how long it usually takes." },
  };
}

// Activity C — order shortest → longest.
function buildOrderTask(memory: LessonMemory): DurationTask {
  const { hour, day, week } = onePerUnit();
  memory.lastId = week.id;
  return {
    kind: "durationUnit",
    scene: "order",
    prompt: "Build the duration ladder: shortest to longest.",
    speakText: "Tap the activities in order, from the shortest time to the longest time.",
    badgeLabel: "Duration Ladder",
    items: shuffle([toItem(hour), toItem(day), toItem(week)]),
    orderedIds: [hour.id, day.id, week.id],
    feedback: { correct: "Hour, day, week — perfect!", wrong: "Shortest first: hour, then day, then week." },
  };
}

// Quiz helper — "which activity belongs in the <unit> group?" (one per unit).
function buildPickByUnit(target: Unit): DurationTask {
  const { hour, day, week } = onePerUnit();
  const byUnit: Record<Unit, DurationActivity> = { hour, day, week };
  return {
    kind: "durationUnit",
    scene: "compare",
    prompt: `Which activity belongs in the ${target} group?`,
    speakText: `Which activity belongs in the ${target} group?`,
    badgeLabel: "Which Group?",
    items: shuffle([toItem(hour), toItem(day), toItem(week)]),
    correctOptionId: byUnit[target].id,
    feedback: { correct: "Yes — that's the right group!", wrong: `Find the one that takes about a ${target}.` },
  };
}

export function generateY1MeasurelandsWeek4Lesson3Task(
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
  if (rotation === "A") return buildSortTask(memory);
  if (rotation === "B") return buildClassifyTask(memory);
  return buildOrderTask(memory);
}

export function resetY1MeasurelandsWeek4Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 4 weekly quiz (Lesson 3's contribution):
// hour group, day group, week group, sort three, choose best unit.
export function buildY1MeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  return [
    buildPickByUnit("hour"),
    buildPickByUnit("day"),
    buildPickByUnit("week"),
    buildSortTask(seed),
    buildClassifyTask(seed),
  ];
}
