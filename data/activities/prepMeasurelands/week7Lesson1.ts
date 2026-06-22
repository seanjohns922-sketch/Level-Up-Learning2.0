import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { WEEK7_CALENDAR, CALENDAR_BY_ID, type CalendarCard } from "@/data/activities/prepMeasurelands/week7Calendar";
import { ACTIVITY_BY_ID, type DayActivity } from "@/data/activities/prepMeasurelands/week6TimesOfDay";

// ── Measurelands · Ground Level · Week 7 · Lesson 1 — "Today" ──
// Foundation calendar concepts (AC9MFM02): identify and talk about TODAY using
// classroom-calendar language. "Today" is the secure anchor (yesterday/tomorrow
// come in L2). Broadened to a full lesson by tying it to the calendar + the day:
// find today, sort today vs another day, and build today's routine (reuses
// Week 6 scenes). Non-reader first: the starred/glowing TODAY card carries the
// answer; label + speaker support. Reuses measurementCompare:
//   A — Find Today          (trio — tap the today card)
//   B — Today or Another Day? (sort — today vs another-day bins)
//   C — Build My Day         (order — today's routine)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "B", "C"];
const ACCENTS: Accent[] = ["sky", "teal", "violet", "gold", "rose", "leaf"];

// Today's routine (one event per time of day) — reuses the Week 6 scenes.
const ROUTINE: DayActivity[] = [
  ACTIVITY_BY_ID.breakfast!,
  ACTIVITY_BY_ID.lunch!,
  ACTIVITY_BY_ID.dinner!,
  ACTIVITY_BY_ID.sleeping!,
];

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

function toCalObj(card: CalendarCard, accent: Accent, suffix = ""): MObj {
  return {
    id: `${card.id}${suffix}`,
    label: card.label,
    icon: "",
    imageSrc: card.imageSrc,
    compareValue: 0,
    axis: "calendar",
    accent,
  };
}

function toRoutineObj(act: DayActivity, accent: Accent, suffix = ""): MObj {
  return {
    id: `${act.id}${suffix}`,
    label: act.label,
    icon: "",
    imageSrc: act.imageSrc,
    compareValue: ROUTINE.findIndex((a) => a.id === act.id),
    axis: "timeofday",
    accent,
  };
}

const TODAY_BINS: NonNullable<CompareTask["bins"]> = [
  { id: "today", label: "Today", icon: "today" },
  { id: "another-day", label: "Another Day", icon: "another-day" },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's talk about today!",
    speakText:
      "Professor Gauge says today is the day we are in right now. On the calendar, today has a star. We can find today, and think about what we do today.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "Today is the day we are in right now.",
      "On the calendar, today has a star.",
      "Let's find today and build our day!",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's begin!", wrong: "Let's get ready." },
  };
}

// ── Activity A — Find Today (trio) ──────────────────────────────────────────
function buildFindTodayTask(): CompareTask {
  const accents = shuffle(ACCENTS);
  const objects = shuffle(WEEK7_CALENDAR.map((c, i) => toCalObj(c, accents[i]!, "-c")));
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: "Tap today.",
    speakText: "Tap today.",
    badgeLabel: "Find Today",
    objects,
    correctOptionId: "today-c",
    feedback: { correct: "Yes! Today has the star.", wrong: "Today is the one with the star." },
  };
}

// ── Activity B — Today or Another Day? (sort) ───────────────────────────────
function buildTodayOrNotTask(memory: LessonMemory): CompareTask {
  let card = choose(WEEK7_CALENDAR);
  let guard = 0;
  while (card.id === memory.lastId && guard++ < 10) card = choose(WEEK7_CALENDAR);
  memory.lastId = card.id;
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "Is this today?",
    speakText: `Is this today, or another day?`,
    badgeLabel: "Today or Another Day?",
    objects: [toCalObj(card, choose(ACCENTS))],
    bins: TODAY_BINS,
    correctOptionId: card.isToday ? "today" : "another-day",
    feedback: {
      correct: card.isToday ? "Yes! That is today." : "Yes! That is another day.",
      wrong: "Today is the one with the star.",
    },
  };
}

// ── Activity C — Build My Day (order today's routine) ───────────────────────
function buildMyDayTask(memory: LessonMemory): CompareTask {
  memory.lastId = null;
  const accents = shuffle(ACCENTS);
  const ordered = ROUTINE.map((act, i) => toRoutineObj(act, accents[i]!, `-${i}`));
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Build my day. Put it in order.",
    speakText: "Build my day. Put what we do today in order, from first to last.",
    badgeLabel: "Build My Day",
    objects: shuffle(ordered),
    orderedIds: ordered.map((o) => o.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Perfect — that's my day!", wrong: "Start with what we do first today." },
  };
}

export function buildMeasurelandsWeek7Lesson1QuizTasks(): PracticeTask[] {
  const c = CALENDAR_BY_ID;
  const findToday = (tag: string): CompareTask => {
    const accents = shuffle(ACCENTS);
    return {
      kind: "measurementCompare", scene: "trio",
      prompt: "Tap today.", speakText: "Tap today.", badgeLabel: "Find Today",
      objects: shuffle(WEEK7_CALENDAR.map((card, i) => toCalObj(card, accents[i]!, `-${tag}`))),
      correctOptionId: `today-${tag}`,
      feedback: { correct: "Yes!", wrong: "Today has the star." },
    };
  };
  const sortQ = (card: CalendarCard, tag: string): CompareTask => ({
    kind: "measurementCompare", scene: "sort",
    prompt: "Is this today?", speakText: "Is this today, or another day?", badgeLabel: "Today or Another Day?",
    objects: [toCalObj(card, "gold", `-${tag}`)],
    bins: TODAY_BINS,
    correctOptionId: card.isToday ? "today" : "another-day",
    feedback: { correct: "Yes!", wrong: "Today has the star." },
  });
  const accents = shuffle(ACCENTS);
  const orderObjs = ROUTINE.map((act, i) => toRoutineObj(act, accents[i]!, `-q5-${i}`));

  return [
    findToday("q1"),
    sortQ(c.today!, "q2"),
    sortQ(c.yesterday!, "q3"),
    sortQ(c.tomorrow!, "q4"),
    {
      kind: "measurementCompare", scene: "order",
      prompt: "Build my day. Put it in order.", speakText: "Build my day, from first to last.", badgeLabel: "Build My Day",
      objects: shuffle(orderObjs),
      orderedIds: orderObjs.map((o) => o.id),
      correctOptionId: orderObjs[orderObjs.length - 1]!.id,
      feedback: { correct: "Perfect order!", wrong: "Start with breakfast." },
    },
  ];
}

export function generatePrepMeasurelandsWeek7Lesson1Task(
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

  if (rotation === "A") return buildFindTodayTask();
  if (rotation === "B") return buildTodayOrNotTask(memory);
  return buildMyDayTask(memory);
}

export function resetPrepMeasurelandsWeek7Lesson1TaskSessionState() {
  lessonMemory.clear();
}
