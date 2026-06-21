import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  WEEK6_TIMES,
  WEEK6_ACTIVITIES,
  TIME_BY_ID,
  ACTIVITY_BY_ID,
  type TimeOfDay,
  type DayActivity,
} from "@/data/activities/prepMeasurelands/week6TimesOfDay";

// ── Measurelands · Ground Level · Week 6 · Lesson 2 ──
// "Match Activities to Time of Day" (AC9MFM02): match familiar activities to
// morning / afternoon / evening / night. Builds on L1 with more activities and
// both directions (activity→time and time→activity). The SCENE carries the
// answer (each activity has a time-window cue); routines framed as "usually".
// Reuses measurementCompare (axis "timeofday"):
//   A — When Does This Happen?  (sort, activity → 4 time bins)
//   B — Which Happens in the …? (trio, time → tap the activity)
//   C — Morning or Night?       (sort, activity → 2 bins)

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
const MORNING_NIGHT_BINS = ["morning", "night"].map((id) => {
  const t = TIME_BY_ID[id]!;
  return { id: t.id, label: t.label, icon: t.id };
});

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's match what we do to the time of day!",
    speakText:
      "Professor Gauge says we do different things at different times. We usually eat breakfast in the morning, eat lunch in the afternoon, eat dinner in the evening, and sleep at night. Let's match them.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "We do different things at different times.",
      "We usually eat breakfast in the morning.",
      "We usually eat dinner in the evening.",
      "We usually sleep at night.",
      "Let's match what we do to the time of day!",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's match!", wrong: "Let's get ready." },
  };
}

// ── Activity A — When Does This Happen? (sort, 4 time bins) ──────────────────
function buildMatchTask(memory: LessonMemory): CompareTask {
  let act = choose(WEEK6_ACTIVITIES);
  let guard = 0;
  while (act.id === memory.lastId && guard++ < 10) act = choose(WEEK6_ACTIVITIES);
  memory.lastId = act.id;
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "When does this happen?",
    speakText: `When do we usually do this — ${act.label.toLowerCase()}?`,
    badgeLabel: "Match the Time",
    objects: [toActivityObj(act, choose(ACCENTS))],
    bins: TIME_BINS,
    correctOptionId: act.timeId,
    feedback: {
      correct: `Yes! Usually in the ${TIME_BY_ID[act.timeId]!.label.toLowerCase()}.`,
      wrong: "Look at what is happening and pick the time.",
    },
  };
}

// ── Activity B — Which Happens in the …? (trio, time → activity) ────────────
function buildWhichActivityTask(memory: LessonMemory): CompareTask {
  const time = choose(WEEK6_TIMES);
  const matches = WEEK6_ACTIVITIES.filter((a) => a.timeId === time.id);
  const target = choose(matches);
  const distractors = shuffle(WEEK6_ACTIVITIES.filter((a) => a.timeId !== time.id)).slice(0, 2);
  memory.lastId = target.id;
  const accents = shuffle(ACCENTS);
  const objects = shuffle([
    toActivityObj(target, accents[0]!, "-t"),
    toActivityObj(distractors[0]!, accents[1]!, "-a"),
    toActivityObj(distractors[1]!, accents[2]!, "-b"),
  ]);
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: `Which one happens in the ${time.label.toLowerCase()}?`,
    speakText: `Which one happens in the ${time.label.toLowerCase()}?`,
    badgeLabel: "What Happens When?",
    objects,
    correctOptionId: `${target.id}-t`,
    feedback: {
      correct: `Yes! We usually ${target.label.toLowerCase()} in the ${time.label.toLowerCase()}.`,
      wrong: `Look for what we usually do in the ${time.label.toLowerCase()}.`,
    },
  };
}

// ── Activity C — Morning or Night? (sort, 2 bins) ───────────────────────────
function buildMorningNightTask(memory: LessonMemory): CompareTask {
  const pool = WEEK6_ACTIVITIES.filter((a) => a.timeId === "morning" || a.timeId === "night");
  let act = choose(pool);
  let guard = 0;
  while (act.id === memory.lastId && guard++ < 10) act = choose(pool);
  memory.lastId = act.id;
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "Morning or night?",
    speakText: `Do we usually do this in the morning or at night — ${act.label.toLowerCase()}?`,
    badgeLabel: "Breakfast or Bedtime?",
    objects: [toActivityObj(act, choose(ACCENTS))],
    bins: MORNING_NIGHT_BINS,
    correctOptionId: act.timeId,
    feedback: {
      correct: act.timeId === "morning" ? "Yes! In the morning." : "Yes! At night.",
      wrong: "Look at the sky in the window.",
    },
  };
}

export function buildMeasurelandsWeek6Lesson2QuizTasks(): PracticeTask[] {
  const a = ACTIVITY_BY_ID;
  const sortQ = (act: DayActivity, bins: CompareTask["bins"], badge: string, tag: string): CompareTask => ({
    kind: "measurementCompare", scene: "sort",
    prompt: bins!.length === 2 ? "Morning or night?" : "When does this happen?",
    speakText: `When do we usually do this — ${act.label.toLowerCase()}?`,
    badgeLabel: badge,
    objects: [toActivityObj(act, "gold", `-${tag}`)],
    bins,
    correctOptionId: act.timeId,
    feedback: { correct: "Yes!", wrong: "Pick the time we usually do this." },
  });
  const whichQ = (time: TimeOfDay, target: DayActivity, d1: DayActivity, d2: DayActivity, tag: string): CompareTask => ({
    kind: "measurementCompare", scene: "trio",
    prompt: `Which one happens in the ${time.label.toLowerCase()}?`,
    speakText: `Which one happens in the ${time.label.toLowerCase()}?`,
    badgeLabel: "What Happens When?",
    objects: shuffle([toActivityObj(target, "sky", `-${tag}t`), toActivityObj(d1, "rose", `-${tag}a`), toActivityObj(d2, "leaf", `-${tag}b`)]),
    correctOptionId: `${target.id}-${tag}t`,
    feedback: { correct: "Yes!", wrong: "Look for what we usually do then." },
  });

  return [
    sortQ(a.breakfast!, TIME_BINS, "Match the Time", "q1"),
    sortQ(a.dinner!, TIME_BINS, "Match the Time", "q2"),
    whichQ(TIME_BY_ID.morning!, a.breakfast!, a.lunch!, a.sleeping!, "q3"),
    whichQ(TIME_BY_ID.night!, a.sleeping!, a.breakfast!, a.lunch!, "q4"),
    sortQ(a.sleeping!, MORNING_NIGHT_BINS, "Breakfast or Bedtime?", "q5"),
  ];
}

export function generatePrepMeasurelandsWeek6Lesson2Task(
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

  if (rotation === "A") return buildMatchTask(memory);
  if (rotation === "B") return buildWhichActivityTask(memory);
  return buildMorningNightTask(memory);
}

export function resetPrepMeasurelandsWeek6Lesson2TaskSessionState() {
  lessonMemory.clear();
}
