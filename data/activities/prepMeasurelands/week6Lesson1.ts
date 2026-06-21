import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  WEEK6_TIMES,
  WEEK6_ACTIVITIES,
  TIME_BY_ID,
  ACTIVITY_BY_ID,
  type TimeOfDay,
  type DayActivity,
} from "@/data/activities/prepMeasurelands/week6TimesOfDay";

// ── Measurelands · Ground Level · Week 6 · Lesson 1 ──
// "Morning, Afternoon, Evening, Night" (AC9MFM02): name the times of day and
// match familiar activities to them. The SCENE carries the answer (sky / sun /
// moon, and a time-window cue on each activity); label + speaker support.
// Routines are framed as "usually". Reuses measurementCompare (axis "timeofday"):
//   A — Which Time of Day?   (pair — tap the named time scene)
//   B — When Does This Happen? (sort — activity → 3 time bins)
//   C — Sort the Day          (sort — activity → 4 time bins)

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

function toTimeObj(time: TimeOfDay, accent: Accent, suffix = ""): MObj {
  return {
    id: `${time.id}${suffix}`,
    label: time.label,
    icon: "",
    imageSrc: time.imageSrc,
    compareValue: time.partIndex,
    axis: "timeofday",
    accent,
  };
}

function toActivityObj(act: DayActivity, accent: Accent, suffix = ""): MObj {
  return {
    id: `${act.id}${suffix}`,
    label: act.label,
    icon: "",
    imageSrc: act.imageSrc,
    compareValue: 0,
    axis: "timeofday",
    accent,
  };
}

const TIME_BINS = WEEK6_TIMES.map((t) => ({ id: t.id, label: t.label, icon: t.id }));
const TIME_BINS_3 = ["morning", "afternoon", "night"].map((id) => {
  const t = TIME_BY_ID[id]!;
  return { id: t.id, label: t.label, icon: t.id };
});

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's learn the times of the day!",
    speakText:
      "Professor Gauge says the day has four times. In the morning the sun rises. In the afternoon the sun is high. In the evening the sun sets. At night we see the moon. We usually eat breakfast in the morning and sleep at night.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "In the morning, the sun rises.",
      "In the afternoon, the sun is high.",
      "In the evening, the sun sets.",
      "At night, we see the moon.",
      "We usually eat breakfast in the morning and sleep at night.",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's begin!", wrong: "Let's get ready." },
  };
}

// ── Activity A — Which Time of Day? (pair of time scenes) ───────────────────
function buildWhichTask(memory: LessonMemory): CompareTask {
  let target = choose(WEEK6_TIMES);
  let guard = 0;
  while (target.id === memory.lastId && guard++ < 10) target = choose(WEEK6_TIMES);
  memory.lastId = target.id;
  const other = choose(WEEK6_TIMES.filter((t) => t.id !== target.id));
  const accents = shuffle(ACCENTS);
  return {
    kind: "measurementCompare",
    scene: "pair",
    prompt: `Which is ${target.label}?`,
    speakText: `Which one is ${target.label}?`,
    badgeLabel: "Which Time of Day?",
    objects: shuffle([toTimeObj(target, accents[0]!, "-t"), toTimeObj(other, accents[1]!, "-o")]),
    correctOptionId: `${target.id}-t`,
    feedback: { correct: `Yes! That is ${target.label.toLowerCase()}.`, wrong: "Look at the sky and the sun." },
  };
}

// ── Activity B — When Does This Happen? (sort, 3 time bins) ──────────────────
function buildMatchTask(memory: LessonMemory): CompareTask {
  // Activities whose time is one of the 3 bins (morning/afternoon/night).
  const pool = WEEK6_ACTIVITIES.filter((a) => a.timeId !== "evening");
  let act = choose(pool);
  let guard = 0;
  while (act.id === memory.lastId && guard++ < 10) act = choose(pool);
  memory.lastId = act.id;
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "When does this happen?",
    speakText: `When do we usually do this — ${act.label.toLowerCase()}?`,
    badgeLabel: "Match the Time",
    objects: [toActivityObj(act, choose(ACCENTS))],
    bins: TIME_BINS_3,
    correctOptionId: act.timeId,
    feedback: {
      correct: `Yes! We usually ${act.label.toLowerCase()} in the ${TIME_BY_ID[act.timeId]!.label.toLowerCase()}.`,
      wrong: "Look for the time we usually do this.",
    },
  };
}

// ── Activity C — Sort the Day (sort, 4 time bins) ───────────────────────────
function buildSortTask(memory: LessonMemory): CompareTask {
  let act = choose(WEEK6_ACTIVITIES);
  let guard = 0;
  while (act.id === memory.lastId && guard++ < 10) act = choose(WEEK6_ACTIVITIES);
  memory.lastId = act.id;
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "When does this happen?",
    speakText: `When do we usually do this — ${act.label.toLowerCase()}?`,
    badgeLabel: "Sort the Day",
    objects: [toActivityObj(act, choose(ACCENTS))],
    bins: TIME_BINS,
    correctOptionId: act.timeId,
    feedback: {
      correct: `Yes! Usually in the ${TIME_BY_ID[act.timeId]!.label.toLowerCase()}.`,
      wrong: "Look at what is happening and pick the time.",
    },
  };
}

export function buildMeasurelandsWeek6Lesson1QuizTasks(): PracticeTask[] {
  const t = TIME_BY_ID;
  const a = ACTIVITY_BY_ID;
  const pair = (target: TimeOfDay, other: TimeOfDay, tag: string) =>
    shuffle([toTimeObj(target, "sky", `-${tag}t`), toTimeObj(other, "violet", `-${tag}o`)]);
  const sortQ = (act: DayActivity, tag: string): CompareTask => ({
    kind: "measurementCompare", scene: "sort",
    prompt: "When does this happen?", speakText: `When do we usually do this — ${act.label.toLowerCase()}?`,
    badgeLabel: "Sort the Day",
    objects: [toActivityObj(act, "gold", `-${tag}`)],
    bins: TIME_BINS,
    correctOptionId: act.timeId,
    feedback: { correct: "Yes!", wrong: "Pick the time we usually do this." },
  });

  return [
    {
      kind: "measurementCompare", scene: "pair",
      prompt: "Which is Morning?", speakText: "Which one is morning?", badgeLabel: "Which Time of Day?",
      objects: pair(t.morning!, t.night!, "q1"),
      correctOptionId: "morning-q1t",
      feedback: { correct: "Yes! The sun is rising.", wrong: "Morning is when the sun rises." },
    },
    {
      kind: "measurementCompare", scene: "pair",
      prompt: "Which is Night?", speakText: "Which one is night?", badgeLabel: "Which Time of Day?",
      objects: pair(t.night!, t.afternoon!, "q2"),
      correctOptionId: "night-q2t",
      feedback: { correct: "Yes! The moon is out.", wrong: "Night is when we see the moon." },
    },
    sortQ(a.breakfast!, "q3"),
    sortQ(a.dinner!, "q4"),
    sortQ(a.sleeping!, "q5"),
  ];
}

export function generatePrepMeasurelandsWeek6Lesson1Task(
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

  if (rotation === "A") return buildWhichTask(memory);
  if (rotation === "B") return buildMatchTask(memory);
  return buildSortTask(memory);
}

export function resetPrepMeasurelandsWeek6Lesson1TaskSessionState() {
  lessonMemory.clear();
}
