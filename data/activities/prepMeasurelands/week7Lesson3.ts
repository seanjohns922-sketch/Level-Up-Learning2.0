import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { WEEK5_DAYS, nextDay, type DayOfWeek } from "@/data/activities/prepMeasurelands/week5Days";

// ── Measurelands · Ground Level · Week 7 · Lesson 3 — "What Day Comes Next?" ──
// Foundation calendar concepts (AC9MFM02): identify the next and previous day in
// the weekly cycle. This APPLIES the Week 5 day sequence — same Monday→Sunday
// cards — so it's a deliberate spiral (Week 5 learn → Week 7 apply). Non-reader
// first: the day cards carry colour + position-dot cues; label + speaker support.
// Reuses measurementCompare (axis "day"):
//   A — What Comes Next?   (trio)
//   B — What Came Before?  (trio)
//   C — Day Detective      (order — put the days in order)

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

function pickDay(memory: LessonMemory): DayOfWeek {
  let day = choose(WEEK5_DAYS);
  let guard = 0;
  while (day.id === memory.lastId && guard++ < 20) day = choose(WEEK5_DAYS);
  memory.lastId = day.id;
  return day;
}

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's find what day comes next!",
    speakText:
      "Professor Gauge says the days always go in the same order. Every day has a day that comes next, and a day that came before. After Sunday, it starts again at Monday. Let's be day detectives.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "The days always go in the same order.",
      "Every day has a day that comes next.",
      "And a day that came before.",
      "After Sunday, it starts again at Monday!",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's investigate!", wrong: "Let's get ready." },
  };
}

// ── Activity A — What Comes Next? (trio) ────────────────────────────────────
function buildNextTask(memory: LessonMemory): CompareTask {
  const current = pickDay(memory);
  const answer = nextDay(current.dayIndex);
  const distractors = shuffle(WEEK5_DAYS.filter((d) => d.id !== current.id && d.id !== answer.id)).slice(0, 2);
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
    badgeLabel: "What Comes Next?",
    objects,
    correctOptionId: `${answer.id}-n`,
    feedback: {
      correct: `Yes! ${answer.label} comes after ${current.label}.`,
      wrong: current.dayIndex === 6 ? "After Sunday it starts again at Monday." : "Remember the order of the days.",
    },
  };
}

// ── Activity B — What Came Before? (trio) ───────────────────────────────────
function buildBeforeTask(memory: LessonMemory): CompareTask {
  const current = pickDay(memory);
  const answer = prevDay(current.dayIndex);
  const distractors = shuffle(WEEK5_DAYS.filter((d) => d.id !== current.id && d.id !== answer.id)).slice(0, 2);
  const accents = shuffle(ACCENTS);
  const objects = shuffle([
    toDayObj(answer, accents[0]!, "-p"),
    toDayObj(distractors[0]!, accents[1]!, "-a"),
    toDayObj(distractors[1]!, accents[2]!, "-b"),
  ]);
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: `What day came before ${current.label}?`,
    speakText: `What day came before ${current.label}?`,
    badgeLabel: "What Came Before?",
    objects,
    correctOptionId: `${answer.id}-p`,
    feedback: {
      correct: `Yes! ${answer.label} came before ${current.label}.`,
      wrong: current.dayIndex === 0 ? "Before Monday is Sunday." : "Think about the day just before it.",
    },
  };
}

// ── Activity C — Day Detective (order a 4-day window) ───────────────────────
function buildOrderTask(memory: LessonMemory): CompareTask {
  const start = randInt(4); // 0..3 → Mon-Thu … Thu-Sun
  const window = WEEK5_DAYS.slice(start, start + 4);
  memory.lastId = null;
  const accents = shuffle(ACCENTS);
  const ordered = window.map((d, i) => toDayObj(d, accents[i]!, `-${i}`));
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the days in order.",
    speakText: "Put the days in order, from first to last.",
    badgeLabel: "Day Detective",
    objects: shuffle(ordered),
    orderedIds: ordered.map((o) => o.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Case solved — perfect order!", wrong: "Start with the earliest day." },
  };
}

export function buildMeasurelandsWeek7Lesson3QuizTasks(): PracticeTask[] {
  const byId = (id: string) => WEEK5_DAYS.find((d) => d.id === id)!;
  const mon = byId("monday"), tue = byId("tuesday"), wed = byId("wednesday"), thu = byId("thursday");
  const fri = byId("friday"), sat = byId("saturday"), sun = byId("sunday");

  const trio = (answer: DayOfWeek, d1: DayOfWeek, d2: DayOfWeek, tag: string) =>
    shuffle([
      toDayObj(answer, "sky", `-${tag}t`),
      toDayObj(d1, "rose", `-${tag}a`),
      toDayObj(d2, "leaf", `-${tag}b`),
    ]);
  const orderObjs = [mon, tue, wed, thu].map((d, i) => toDayObj(d, ACCENTS[i]!, `-q5-${i}`));

  return [
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day comes after Monday?", speakText: "What day comes after Monday?", badgeLabel: "What Comes Next?",
      objects: trio(tue, thu, sun, "q1"), correctOptionId: "tuesday-q1t",
      feedback: { correct: "Yes! Tuesday.", wrong: "After Monday comes Tuesday." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day comes after Sunday?", speakText: "What day comes after Sunday?", badgeLabel: "What Comes Next?",
      objects: trio(mon, wed, sat, "q2"), correctOptionId: "monday-q2t",
      feedback: { correct: "Yes! It starts again at Monday.", wrong: "After Sunday the week starts again at Monday." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day came before Thursday?", speakText: "What day came before Thursday?", badgeLabel: "What Came Before?",
      objects: trio(wed, fri, mon, "q3"), correctOptionId: "wednesday-q3t",
      feedback: { correct: "Yes! Wednesday.", wrong: "Before Thursday comes Wednesday." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day came before Saturday?", speakText: "What day came before Saturday?", badgeLabel: "What Came Before?",
      objects: trio(fri, sun, tue, "q4"), correctOptionId: "friday-q4t",
      feedback: { correct: "Yes! Friday.", wrong: "Before Saturday comes Friday." },
    },
    {
      kind: "measurementCompare", scene: "order",
      prompt: "Put the days in order.", speakText: "Put the days in order, from first to last.", badgeLabel: "Day Detective",
      objects: shuffle(orderObjs), orderedIds: orderObjs.map((o) => o.id),
      correctOptionId: orderObjs[orderObjs.length - 1]!.id,
      feedback: { correct: "Case solved!", wrong: "Start with Monday." },
    },
  ];
}

export function generatePrepMeasurelandsWeek7Lesson3Task(
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

  if (rotation === "A") return buildNextTask(memory);
  if (rotation === "B") return buildBeforeTask(memory);
  return buildOrderTask(memory);
}

export function resetPrepMeasurelandsWeek7Lesson3TaskSessionState() {
  lessonMemory.clear();
}
