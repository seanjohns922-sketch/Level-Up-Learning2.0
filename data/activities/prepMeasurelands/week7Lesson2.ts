import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { WEEK7_CALENDAR, CALENDAR_BY_ID, type CalendarCard } from "@/data/activities/prepMeasurelands/week7Calendar";

// ── Measurelands · Ground Level · Week 7 · Lesson 2 — "Yesterday and Tomorrow" ──
// Foundation calendar concepts (AC9MFM02): use yesterday / today / tomorrow to
// describe time around the current day. This is the harder step (yesterday and
// tomorrow are easily confused), so the cards lean on direction cues — yesterday
// = faded, back arrow; tomorrow = forward arrow; today = star — plus read-aloud.
// Reuses measurementCompare (axis "calendar"):
//   A — Find Yesterday / Tomorrow (trio)
//   B — Calendar Sort            (sort → yesterday/today/tomorrow bins)
//   C — Before or After Today    (trio — what comes before/after today)

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

const CALENDAR_BINS: NonNullable<CompareTask["bins"]> = [
  { id: "yesterday", label: "Yesterday", icon: "yesterday" },
  { id: "today", label: "Today", icon: "today" },
  { id: "tomorrow", label: "Tomorrow", icon: "tomorrow" },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's learn yesterday and tomorrow!",
    speakText:
      "Professor Gauge says the day before today is yesterday. The day after today is tomorrow. Yesterday already happened. Tomorrow has not happened yet.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "Today is the day we are in now.",
      "The day before today is yesterday.",
      "The day after today is tomorrow.",
      "Let's find yesterday and tomorrow!",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's begin!", wrong: "Let's get ready." },
  };
}

// ── Activity A — Find Yesterday / Tomorrow (trio) ───────────────────────────
function buildFindTask(memory: LessonMemory): CompareTask {
  // Ask for yesterday or tomorrow (today was Lesson 1).
  let target = choose([CALENDAR_BY_ID.yesterday!, CALENDAR_BY_ID.tomorrow!]);
  let guard = 0;
  while (target.id === memory.lastId && guard++ < 6) {
    target = choose([CALENDAR_BY_ID.yesterday!, CALENDAR_BY_ID.tomorrow!]);
  }
  memory.lastId = target.id;
  const accents = shuffle(ACCENTS);
  const objects = shuffle(WEEK7_CALENDAR.map((c, i) => toCalObj(c, accents[i]!, "-c")));
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: `Tap ${target.label.toLowerCase()}.`,
    speakText: `Tap ${target.label.toLowerCase()}.`,
    badgeLabel: "Find the Day",
    objects,
    correctOptionId: `${target.id}-c`,
    feedback: {
      correct: `Yes! That is ${target.label.toLowerCase()}.`,
      wrong: target.id === "yesterday" ? "Yesterday is the day that already happened." : "Tomorrow is the day that comes next.",
    },
  };
}

// ── Activity B — Calendar Sort (sort → yesterday/today/tomorrow) ────────────
function buildSortTask(memory: LessonMemory): CompareTask {
  let card = choose(WEEK7_CALENDAR);
  let guard = 0;
  while (card.id === memory.lastId && guard++ < 10) card = choose(WEEK7_CALENDAR);
  memory.lastId = card.id;
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "Which day is this?",
    speakText: "Is this yesterday, today, or tomorrow?",
    badgeLabel: "Calendar Sort",
    objects: [toCalObj(card, choose(ACCENTS))],
    bins: CALENDAR_BINS,
    correctOptionId: card.id,
    feedback: {
      correct: `Yes! That is ${card.label.toLowerCase()}.`,
      wrong: "Look at the calendar card — the star is today.",
    },
  };
}

// ── Activity C — Before or After Today (trio) ───────────────────────────────
function buildBeforeAfterTask(memory: LessonMemory): CompareTask {
  const askBefore = Math.random() < 0.5;
  const answer = askBefore ? CALENDAR_BY_ID.yesterday! : CALENDAR_BY_ID.tomorrow!;
  memory.lastId = answer.id;
  const accents = shuffle(ACCENTS);
  const objects = shuffle(WEEK7_CALENDAR.map((c, i) => toCalObj(c, accents[i]!, "-c")));
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: askBefore ? "What comes before today?" : "What comes after today?",
    speakText: askBefore ? "What day comes before today?" : "What day comes after today?",
    badgeLabel: "Before or After?",
    objects,
    correctOptionId: `${answer.id}-c`,
    feedback: {
      correct: askBefore ? "Yes! Yesterday comes before today." : "Yes! Tomorrow comes after today.",
      wrong: askBefore ? "The day before today is yesterday." : "The day after today is tomorrow.",
    },
  };
}

export function buildMeasurelandsWeek7Lesson2QuizTasks(): PracticeTask[] {
  const c = CALENDAR_BY_ID;
  const trio = (targetId: string, prompt: string, speak: string, badge: string, tag: string): CompareTask => {
    const accents = shuffle(ACCENTS);
    return {
      kind: "measurementCompare", scene: "trio",
      prompt, speakText: speak, badgeLabel: badge,
      objects: shuffle(WEEK7_CALENDAR.map((card, i) => toCalObj(card, accents[i]!, `-${tag}`))),
      correctOptionId: `${targetId}-${tag}`,
      feedback: { correct: "Yes!", wrong: "Look at the calendar cards." },
    };
  };
  return [
    trio("yesterday", "Tap yesterday.", "Tap yesterday.", "Find the Day", "q1"),
    trio("tomorrow", "Tap tomorrow.", "Tap tomorrow.", "Find the Day", "q2"),
    trio("yesterday", "What comes before today?", "What day comes before today?", "Before or After?", "q3"),
    trio("tomorrow", "What comes after today?", "What day comes after today?", "Before or After?", "q4"),
    {
      kind: "measurementCompare", scene: "sort",
      prompt: "Which day is this?", speakText: "Is this yesterday, today, or tomorrow?", badgeLabel: "Calendar Sort",
      objects: [toCalObj(c.tomorrow!, "gold", "-q5")],
      bins: CALENDAR_BINS,
      correctOptionId: "tomorrow",
      feedback: { correct: "Yes! Tomorrow.", wrong: "Tomorrow comes after today." },
    },
  ];
}

export function generatePrepMeasurelandsWeek7Lesson2Task(
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

  if (rotation === "A") return buildFindTask(memory);
  if (rotation === "B") return buildSortTask(memory);
  return buildBeforeAfterTask(memory);
}

export function resetPrepMeasurelandsWeek7Lesson2TaskSessionState() {
  lessonMemory.clear();
}
