import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { ACTIVITY_BY_ID, type DayActivity } from "@/data/activities/prepMeasurelands/week6TimesOfDay";

// ── Measurelands · Ground Level · Week 6 · Lesson 3 — "My Daily Routine" ──
// Foundation time (AC9MFM02): sequence daily events using first / next / last.
// Connects back to Week 5 sequencing. Uses ONE clear event per time of day
// (breakfast=morning, lunch=afternoon, dinner=evening, sleeping=night) so every
// ordering is unambiguous from the scene's time-window cue. Reuses
// measurementCompare (axis "timeofday"):
//   A — Put the Day in Order  (order)
//   B — What Happens First/Last? (trio)
//   C — What Comes Next?       (trio)

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

// The daily routine order (one event per time of day).
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

function routineIndex(act: DayActivity) {
  return ROUTINE.findIndex((a) => a.id === act.id);
}

function toActivityObj(act: DayActivity, accent: Accent, suffix = ""): MObj {
  return {
    id: `${act.id}${suffix}`,
    label: act.label,
    icon: "",
    imageSrc: act.imageSrc,
    compareValue: routineIndex(act),
    axis: "timeofday",
    accent,
  };
}

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's put our day in order!",
    speakText:
      "Professor Gauge says our day has an order. First we eat breakfast, next we eat lunch, then dinner, and last we go to sleep. Let's put the day in order using first, next, and last.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "Our day happens in an order.",
      "First we eat breakfast.",
      "Next lunch, then dinner.",
      "Last, we go to sleep.",
      "Let's put the day in order!",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's begin!", wrong: "Let's get ready." },
  };
}

// ── Activity A — Put the Day in Order (order) ───────────────────────────────
function buildOrderTask(memory: LessonMemory): CompareTask {
  memory.lastId = null;
  const accents = shuffle(ACCENTS);
  const ordered = ROUTINE.map((act, i) => toActivityObj(act, accents[i]!, `-${i}`));
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the day in order.",
    speakText: "Put the day in order, from first to last.",
    badgeLabel: "My Daily Routine",
    objects: shuffle(ordered),
    orderedIds: ordered.map((o) => o.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Perfect — that's the right order!", wrong: "Start with what we do first." },
  };
}

// ── Activity B — What Happens First / Last? (trio) ──────────────────────────
function buildFirstLastTask(memory: LessonMemory): CompareTask {
  const askFirst = Math.random() < 0.5;
  const three = shuffle(ROUTINE).slice(0, 3);
  const sorted = [...three].sort((a, b) => routineIndex(a) - routineIndex(b));
  const target = askFirst ? sorted[0]! : sorted[sorted.length - 1]!;
  memory.lastId = target.id;
  const accents = shuffle(ACCENTS);
  const objects = three.map((act, i) =>
    toActivityObj(act, accents[i]!, act.id === target.id ? "-t" : `-${i}`),
  );
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: askFirst ? "What happens first?" : "What happens last?",
    speakText: askFirst ? "What do we do first?" : "What do we do last?",
    badgeLabel: askFirst ? "What Happens First?" : "What Happens Last?",
    objects: shuffle(objects),
    correctOptionId: `${target.id}-t`,
    feedback: {
      correct: askFirst ? `Yes! ${target.label} is first.` : `Yes! ${target.label} is last.`,
      wrong: askFirst ? "Look for what we do earliest." : "Look for what we do at the end of the day.",
    },
  };
}

// ── Activity C — What Comes Next? (trio) ────────────────────────────────────
function buildNextTask(memory: LessonMemory): CompareTask {
  const i = randInt(ROUTINE.length - 1); // 0..2 (has a next)
  const current = ROUTINE[i]!;
  const answer = ROUTINE[i + 1]!;
  memory.lastId = current.id;
  const distractors = shuffle(ROUTINE.filter((a) => a.id !== current.id && a.id !== answer.id)).slice(0, 2);
  const accents = shuffle(ACCENTS);
  const objects = shuffle([
    toActivityObj(answer, accents[0]!, "-t"),
    toActivityObj(distractors[0]!, accents[1]!, "-a"),
    toActivityObj(distractors[1]!, accents[2]!, "-b"),
  ]);
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: `What do we do after ${current.label.toLowerCase()}?`,
    speakText: `What do we do after ${current.label.toLowerCase()}?`,
    badgeLabel: "What Comes Next?",
    objects,
    correctOptionId: `${answer.id}-t`,
    feedback: { correct: `Yes! ${answer.label} comes next.`, wrong: "Think about what we do next in the day." },
  };
}

export function buildMeasurelandsWeek6Lesson3QuizTasks(): PracticeTask[] {
  const a = ACTIVITY_BY_ID;
  const accents = shuffle(ACCENTS);
  const orderObjs = ROUTINE.map((act, i) => toActivityObj(act, accents[i]!, `-q1-${i}`));
  const trio = (target: DayActivity, d1: DayActivity, d2: DayActivity, tag: string) =>
    shuffle([
      toActivityObj(target, "sky", `-${tag}t`),
      toActivityObj(d1, "rose", `-${tag}a`),
      toActivityObj(d2, "leaf", `-${tag}b`),
    ]);

  return [
    {
      kind: "measurementCompare", scene: "order",
      prompt: "Put the day in order.", speakText: "Put the day in order, from first to last.", badgeLabel: "My Daily Routine",
      objects: shuffle(orderObjs),
      orderedIds: orderObjs.map((o) => o.id),
      correctOptionId: orderObjs[orderObjs.length - 1]!.id,
      feedback: { correct: "Perfect order!", wrong: "Start with breakfast." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What happens first?", speakText: "What do we do first?", badgeLabel: "What Happens First?",
      objects: trio(a.breakfast!, a.lunch!, a.sleeping!, "q2"),
      correctOptionId: "breakfast-q2t",
      feedback: { correct: "Yes! Breakfast is first.", wrong: "We eat breakfast first." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What happens last?", speakText: "What do we do last?", badgeLabel: "What Happens Last?",
      objects: trio(a.sleeping!, a.breakfast!, a.lunch!, "q3"),
      correctOptionId: "sleeping-q3t",
      feedback: { correct: "Yes! Sleeping is last.", wrong: "We go to sleep last." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What do we do after breakfast?", speakText: "What do we do after breakfast?", badgeLabel: "What Comes Next?",
      objects: trio(a.lunch!, a.dinner!, a.sleeping!, "q4"),
      correctOptionId: "lunch-q4t",
      feedback: { correct: "Yes! Lunch comes next.", wrong: "After breakfast we eat lunch." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What do we do after dinner?", speakText: "What do we do after dinner?", badgeLabel: "What Comes Next?",
      objects: trio(a.sleeping!, a.breakfast!, a.lunch!, "q5"),
      correctOptionId: "sleeping-q5t",
      feedback: { correct: "Yes! We go to sleep.", wrong: "After dinner we go to sleep." },
    },
  ];
}

export function generatePrepMeasurelandsWeek6Lesson3Task(
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

  if (rotation === "A") return buildOrderTask(memory);
  if (rotation === "B") return buildFirstLastTask(memory);
  return buildNextTask(memory);
}

export function resetPrepMeasurelandsWeek6Lesson3TaskSessionState() {
  lessonMemory.clear();
}
