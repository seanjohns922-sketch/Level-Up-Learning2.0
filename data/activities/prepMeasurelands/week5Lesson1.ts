import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { WEEK5_DAYS, nextDay, type DayOfWeek } from "@/data/activities/prepMeasurelands/week5Days";

// ── Measurelands · Ground Level · Week 5 · Lesson 1 — "Name the Days" ──
// Foundation time (AC9MFM02): name and sequence the days of the week; know the
// order is fixed and cyclical. Days are symbolic, so the cards carry non-reader
// cues (week-trail dot + colour + routine scene); label + speaker support.
// Reuses the shared measurementCompare scenes (axis "day", image cards):
//   A — Find the Day        (trio — tap the named day)
//   B — What Comes Next?    (trio — tap the next day)
//   C — Build the Week Trail (order — arrange days in order)

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
    prompt: "Let's learn the days of the week!",
    speakText:
      "Professor Gauge says there are seven days in every week. The days always follow the same order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Then it starts again at Monday.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "There are seven days in every week.",
      "The days always follow the same order.",
      "Monday, Tuesday, Wednesday, Thursday, Friday.",
      "Then Saturday and Sunday — the weekend!",
      "After Sunday it starts again at Monday.",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's name the days!", wrong: "Let's get ready." },
  };
}

// ── Activity A — Find the Day (trio: tap the named day) ─────────────────────
function buildFindDayTask(memory: LessonMemory): CompareTask {
  const target = pickTarget(memory);
  const others = shuffle(WEEK5_DAYS.filter((d) => d.id !== target.id)).slice(0, 2);
  const accents = shuffle(ACCENTS);
  const objects = shuffle([
    toDayObj(target, accents[0]!, "-t"),
    toDayObj(others[0]!, accents[1]!, "-a"),
    toDayObj(others[1]!, accents[2]!, "-b"),
  ]);
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: `Tap ${target.label}.`,
    speakText: `Tap ${target.label}.`,
    badgeLabel: "Find the Day",
    objects,
    correctOptionId: `${target.id}-t`,
    feedback: { correct: `Yes! That is ${target.label}.`, wrong: "Look at the day trail at the bottom." },
  };
}

// ── Activity B — What Comes Next? (trio: tap the next day) ───────────────────
function buildNextDayTask(memory: LessonMemory): CompareTask {
  const current = pickTarget(memory);
  const next = nextDay(current.dayIndex);
  const distractors = shuffle(
    WEEK5_DAYS.filter((d) => d.id !== current.id && d.id !== next.id),
  ).slice(0, 2);
  const accents = shuffle(ACCENTS);
  const objects = shuffle([
    toDayObj(next, accents[0]!, "-n"),
    toDayObj(distractors[0]!, accents[1]!, "-a"),
    toDayObj(distractors[1]!, accents[2]!, "-b"),
  ]);
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: `What day comes after ${current.label}?`,
    speakText: `What day comes after ${current.label}?`,
    badgeLabel: "What Comes Next?",
    objects,
    correctOptionId: `${next.id}-n`,
    feedback: { correct: `Yes! ${next.label} comes after ${current.label}.`, wrong: "Remember the order of the days." },
  };
}

// ── Activity C — Build the Week Trail (order four days) ──────────────────────
function buildTrailTask(memory: LessonMemory): CompareTask {
  // A consecutive 4-day window within the week (no wrap): Mon-Thu … Thu-Sun.
  const start = randInt(4); // 0..3
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

export function buildMeasurelandsWeek5Lesson1QuizTasks(): PracticeTask[] {
  const byId = (id: string) => WEEK5_DAYS.find((d) => d.id === id)!;
  const mon = byId("monday"), tue = byId("tuesday"), wed = byId("wednesday");
  const fri = byId("friday"), sat = byId("saturday"), sun = byId("sunday"), thu = byId("thursday");

  const findTrio = (target: DayOfWeek, d1: DayOfWeek, d2: DayOfWeek, tag: string) =>
    shuffle([
      toDayObj(target, "sky", `-${tag}t`),
      toDayObj(d1, "rose", `-${tag}a`),
      toDayObj(d2, "leaf", `-${tag}b`),
    ]);

  const trail = [mon, tue, wed, thu].map((d, i) => toDayObj(d, ACCENTS[i]!, `-q5-${i}`));

  return [
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "Tap Monday.", speakText: "Tap Monday.", badgeLabel: "Find the Day",
      objects: findTrio(mon, wed, sat, "q1"),
      correctOptionId: "monday-q1t",
      feedback: { correct: "Yes!", wrong: "Monday is the first day." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "Tap Friday.", speakText: "Tap Friday.", badgeLabel: "Find the Day",
      objects: findTrio(fri, tue, sun, "q2"),
      correctOptionId: "friday-q2t",
      feedback: { correct: "Yes!", wrong: "Friday is the last school day." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day comes after Tuesday?", speakText: "What day comes after Tuesday?", badgeLabel: "What Comes Next?",
      objects: findTrio(wed, fri, sun, "q3"),
      correctOptionId: "wednesday-q3t",
      feedback: { correct: "Yes! Wednesday.", wrong: "After Tuesday comes Wednesday." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day comes after Saturday?", speakText: "What day comes after Saturday?", badgeLabel: "What Comes Next?",
      objects: findTrio(sun, mon, thu, "q4"),
      correctOptionId: "sunday-q4t",
      feedback: { correct: "Yes! Sunday.", wrong: "After Saturday comes Sunday." },
    },
    {
      kind: "measurementCompare", scene: "order",
      prompt: "Put the days in order.", speakText: "Put the days in order, from first to last.", badgeLabel: "Build the Week Trail",
      objects: shuffle(trail),
      orderedIds: trail.map((o) => o.id),
      correctOptionId: trail[trail.length - 1]!.id,
      feedback: { correct: "Perfect order!", wrong: "Start with Monday." },
    },
  ];
}

export function generatePrepMeasurelandsWeek5Lesson1Task(
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

  if (rotation === "A") return buildFindDayTask(memory);
  if (rotation === "B") return buildNextDayTask(memory);
  return buildTrailTask(memory);
}

export function resetPrepMeasurelandsWeek5Lesson1TaskSessionState() {
  lessonMemory.clear();
}
