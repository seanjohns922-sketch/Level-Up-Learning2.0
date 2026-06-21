import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { WEEK5_DAYS, nextDay, type DayOfWeek } from "@/data/activities/prepMeasurelands/week5Days";

// ── Measurelands · Ground Level · Week 5 · Lesson 2 — "Put the Days in Order" ──
// Foundation time (AC9MFM02): sequence the days using before / after / next, and
// build the weekly order. Builds on L1 (naming) → ordering + neighbours. Days are
// symbolic, so cards carry the week-trail dot + colour + scene; label + speaker
// support. Reuses the shared measurementCompare scenes (axis "day"):
//   A — Build the Week Trail (order)
//   B — What Comes After?    (trio)
//   C — What Comes Before?   (trio)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastTargetId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "B", "C"];
const ACCENTS: Accent[] = ["sky", "teal", "violet", "gold", "rose", "leaf"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastTargetId: null };
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

/** The day before a given index, wrapping Monday → Sunday (the cycle). */
function prevDay(dayIndex: number): DayOfWeek {
  return WEEK5_DAYS[(dayIndex + 6) % 7]!;
}

function toDayObj(day: DayOfWeek, accent: Accent, suffix = ""): MObj {
  return {
    id: `${day.id}${suffix}`,
    label: day.label,
    icon: "",
    imageSrc: day.imageSrc,
    compareValue: day.dayIndex,
    axis: "day",
    accent,
  };
}

function pickTarget(memory: LessonMemory): DayOfWeek {
  let day = choose(WEEK5_DAYS);
  let guard = 0;
  while (day.id === memory.lastTargetId && guard++ < 20) day = choose(WEEK5_DAYS);
  memory.lastTargetId = day.id;
  return day;
}

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's put the days in order!",
    speakText:
      "Professor Gauge says the days always go in the same order. Each day has a day before it and a day after it. Let's find what comes before and after, and put the whole week in order.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "The days always go in the same order.",
      "Each day has a day before it.",
      "And a day after it.",
      "Let's put the week in order!",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's get ordering!", wrong: "Let's get ready." },
  };
}

// ── Activity A — Build the Week Trail (order four days) ──────────────────────
function buildTrailTask(memory: LessonMemory): CompareTask {
  const start = randInt(4); // 0..3 → Mon-Thu … Thu-Sun (no wrap)
  const window = WEEK5_DAYS.slice(start, start + 4);
  memory.lastTargetId = null;
  const accents = shuffle(ACCENTS);
  const ordered = window.map((d, i) => toDayObj(d, accents[i]!, `-${i}`));
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the days in order.",
    speakText: "Put the days in order, from first to last.",
    badgeLabel: "Build the Week Trail",
    objects: shuffle(ordered),
    orderedIds: ordered.map((o) => o.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Perfect — that's the right order!", wrong: "Start with the earliest day." },
  };
}

// ── Activity B — What Comes After? (trio) ───────────────────────────────────
function buildAfterTask(memory: LessonMemory): CompareTask {
  const current = pickTarget(memory);
  const answer = nextDay(current.dayIndex);
  const distractors = shuffle(
    WEEK5_DAYS.filter((d) => d.id !== current.id && d.id !== answer.id),
  ).slice(0, 2);
  const accents = shuffle(ACCENTS);
  const objects = shuffle([
    toDayObj(answer, accents[0]!, "-n"),
    toDayObj(distractors[0]!, accents[1]!, "-a"),
    toDayObj(distractors[1]!, accents[2]!, "-b"),
  ]);
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: `What day comes after ${current.label}?`,
    speakText: `What day comes after ${current.label}?`,
    badgeLabel: "What Comes After?",
    objects,
    correctOptionId: `${answer.id}-n`,
    feedback: { correct: `Yes! ${answer.label} comes after ${current.label}.`, wrong: "Remember the order of the days." },
  };
}

// ── Activity C — What Comes Before? (trio) ──────────────────────────────────
function buildBeforeTask(memory: LessonMemory): CompareTask {
  const current = pickTarget(memory);
  const answer = prevDay(current.dayIndex);
  const distractors = shuffle(
    WEEK5_DAYS.filter((d) => d.id !== current.id && d.id !== answer.id),
  ).slice(0, 2);
  const accents = shuffle(ACCENTS);
  const objects = shuffle([
    toDayObj(answer, accents[0]!, "-p"),
    toDayObj(distractors[0]!, accents[1]!, "-a"),
    toDayObj(distractors[1]!, accents[2]!, "-b"),
  ]);
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: `What day comes before ${current.label}?`,
    speakText: `What day comes before ${current.label}?`,
    badgeLabel: "What Comes Before?",
    objects,
    correctOptionId: `${answer.id}-p`,
    feedback: { correct: `Yes! ${answer.label} comes before ${current.label}.`, wrong: "Think about the day just before it." },
  };
}

export function buildMeasurelandsWeek5Lesson2QuizTasks(): PracticeTask[] {
  const byId = (id: string) => WEEK5_DAYS.find((d) => d.id === id)!;
  const mon = byId("monday"), tue = byId("tuesday"), wed = byId("wednesday"), thu = byId("thursday");
  const fri = byId("friday"), sat = byId("saturday"), sun = byId("sunday");

  const trio = (answer: DayOfWeek, d1: DayOfWeek, d2: DayOfWeek, tag: string) =>
    shuffle([
      toDayObj(answer, "sky", `-${tag}t`),
      toDayObj(d1, "rose", `-${tag}a`),
      toDayObj(d2, "leaf", `-${tag}b`),
    ]);

  const trail = [mon, tue, wed, thu].map((d, i) => toDayObj(d, ACCENTS[i]!, `-q1-${i}`));

  return [
    {
      kind: "measurementCompare", scene: "order",
      prompt: "Put the days in order.", speakText: "Put the days in order, from first to last.", badgeLabel: "Build the Week Trail",
      objects: shuffle(trail),
      orderedIds: trail.map((o) => o.id),
      correctOptionId: trail[trail.length - 1]!.id,
      feedback: { correct: "Perfect order!", wrong: "Start with Monday." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day comes after Thursday?", speakText: "What day comes after Thursday?", badgeLabel: "What Comes After?",
      objects: trio(fri, mon, sun, "q2"),
      correctOptionId: "friday-q2t",
      feedback: { correct: "Yes! Friday.", wrong: "After Thursday comes Friday." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day comes before Wednesday?", speakText: "What day comes before Wednesday?", badgeLabel: "What Comes Before?",
      objects: trio(tue, fri, sun, "q3"),
      correctOptionId: "tuesday-q3t",
      feedback: { correct: "Yes! Tuesday.", wrong: "Before Wednesday comes Tuesday." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day comes after Sunday?", speakText: "What day comes after Sunday?", badgeLabel: "What Comes After?",
      objects: trio(mon, wed, sat, "q4"),
      correctOptionId: "monday-q4t",
      feedback: { correct: "Yes! It starts again at Monday.", wrong: "After Sunday the week starts again at Monday." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day comes before Saturday?", speakText: "What day comes before Saturday?", badgeLabel: "What Comes Before?",
      objects: trio(fri, tue, sun, "q5"),
      correctOptionId: "friday-q5t",
      feedback: { correct: "Yes! Friday.", wrong: "Before Saturday comes Friday." },
    },
  ];
}

export function generatePrepMeasurelandsWeek5Lesson2Task(
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

  if (rotation === "A") return buildTrailTask(memory);
  if (rotation === "B") return buildAfterTask(memory);
  return buildBeforeTask(memory);
}

export function resetPrepMeasurelandsWeek5Lesson2TaskSessionState() {
  lessonMemory.clear();
}
