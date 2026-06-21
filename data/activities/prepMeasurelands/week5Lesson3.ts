import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { WEEK5_DAYS, nextDay, type DayOfWeek } from "@/data/activities/prepMeasurelands/week5Days";

// ── Measurelands · Ground Level · Week 5 · Lesson 3 — "Weekdays and Weekends" ──
// Foundation time (AC9MFM02): identify weekdays vs the weekend and the repeating
// weekly cycle. Builds on L1 (naming) + L2 (ordering). The day cards already
// encode the split visually — weekdays share a school scene, the weekend is
// sport/park — so a non-reader sorts by the scene. Reuses measurementCompare:
//   A — Weekday or Weekend?  (sort, two bins)
//   B — Find a School/Weekend Day (trio)
//   C — The Week Goes Round  (trio — after Sunday → Monday)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastDayId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "B", "C"];
const ACCENTS: Accent[] = ["sky", "teal", "violet", "gold", "rose", "leaf"];

const WEEKDAYS = WEEK5_DAYS.filter((d) => !d.isWeekend);
const WEEKENDS = WEEK5_DAYS.filter((d) => d.isWeekend);

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastDayId: null };
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

const WEEKDAY_WEEKEND_BINS: NonNullable<CompareTask["bins"]> = [
  { id: "weekday", label: "Weekday", icon: "weekday" },
  { id: "weekend", label: "Weekend", icon: "weekend" },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's learn weekdays and weekends!",
    speakText:
      "Professor Gauge says Monday to Friday are weekdays — they are school days. Saturday and Sunday are the weekend. After the weekend, the week starts again at Monday. Round and round it goes!",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "Monday to Friday are weekdays — school days.",
      "Saturday and Sunday are the weekend.",
      "After Sunday, the week starts again at Monday.",
      "The week goes round and round!",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's sort the days!", wrong: "Let's get ready." },
  };
}

// ── Activity A — Weekday or Weekend? (sort) ─────────────────────────────────
function buildSortTask(memory: LessonMemory): CompareTask {
  let day = choose(WEEK5_DAYS);
  let guard = 0;
  while (day.id === memory.lastDayId && guard++ < 20) day = choose(WEEK5_DAYS);
  memory.lastDayId = day.id;
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "Is this a weekday or a weekend day?",
    speakText: `Is ${day.label} a weekday or a weekend day?`,
    badgeLabel: "Weekday or Weekend?",
    objects: [toDayObj(day, choose(ACCENTS))],
    bins: WEEKDAY_WEEKEND_BINS,
    correctOptionId: day.isWeekend ? "weekend" : "weekday",
    feedback: {
      correct: day.isWeekend ? `Yes! ${day.label} is the weekend.` : `Yes! ${day.label} is a school day.`,
      wrong: "School days are weekdays. Saturday and Sunday are the weekend.",
    },
  };
}

// ── Activity B — Find a School / Weekend Day (trio) ─────────────────────────
function buildFindTask(memory: LessonMemory): CompareTask {
  const askWeekend = Math.random() < 0.5;
  let target: DayOfWeek;
  let distractors: DayOfWeek[];
  if (askWeekend) {
    target = choose(WEEKENDS); // Sat or Sun
    distractors = shuffle(WEEKDAYS).slice(0, 2);
  } else {
    target = choose(WEEKDAYS);
    distractors = shuffle(WEEKENDS).slice(0, 2); // Sat + Sun
  }
  memory.lastDayId = target.id;
  const accents = shuffle(ACCENTS);
  const objects = shuffle([
    toDayObj(target, accents[0]!, "-t"),
    toDayObj(distractors[0]!, accents[1]!, "-a"),
    toDayObj(distractors[1]!, accents[2]!, "-b"),
  ]);
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: askWeekend ? "Tap a weekend day." : "Tap a school day.",
    speakText: askWeekend ? "Tap a weekend day." : "Tap a school day.",
    badgeLabel: askWeekend ? "Find the Weekend" : "Find a School Day",
    objects,
    correctOptionId: `${target.id}-t`,
    feedback: {
      correct: askWeekend ? "Yes! That's a weekend day." : "Yes! That's a school day.",
      wrong: askWeekend ? "Weekend days are Saturday and Sunday." : "School days are Monday to Friday.",
    },
  };
}

// ── Activity C — The Week Goes Round (trio: after Sunday → Monday) ───────────
function buildCycleTask(memory: LessonMemory): CompareTask {
  // Emphasise the cycle: weight toward Sunday → Monday, but vary.
  const current = Math.random() < 0.5 ? WEEK5_DAYS[6]! : choose(WEEK5_DAYS);
  const answer = nextDay(current.dayIndex);
  memory.lastDayId = current.id;
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
    badgeLabel: "The Week Goes Round",
    objects,
    correctOptionId: `${answer.id}-n`,
    feedback: {
      correct: current.dayIndex === 6 ? "Yes! After Sunday it starts again at Monday." : `Yes! ${answer.label}.`,
      wrong: "After Sunday the week starts again at Monday.",
    },
  };
}

export function buildMeasurelandsWeek5Lesson3QuizTasks(): PracticeTask[] {
  const byId = (id: string) => WEEK5_DAYS.find((d) => d.id === id)!;
  const mon = byId("monday"), wed = byId("wednesday");
  const sat = byId("saturday"), sun = byId("sunday");

  const trio = (answer: DayOfWeek, d1: DayOfWeek, d2: DayOfWeek, tag: string) =>
    shuffle([
      toDayObj(answer, "sky", `-${tag}t`),
      toDayObj(d1, "rose", `-${tag}a`),
      toDayObj(d2, "leaf", `-${tag}b`),
    ]);

  return [
    {
      kind: "measurementCompare", scene: "sort",
      prompt: "Is this a weekday or a weekend day?", speakText: "Is Monday a weekday or a weekend day?",
      badgeLabel: "Weekday or Weekend?",
      objects: [toDayObj(mon, "sky", "-q1")],
      bins: WEEKDAY_WEEKEND_BINS,
      correctOptionId: "weekday",
      feedback: { correct: "Yes! A school day.", wrong: "Monday is a school day." },
    },
    {
      kind: "measurementCompare", scene: "sort",
      prompt: "Is this a weekday or a weekend day?", speakText: "Is Saturday a weekday or a weekend day?",
      badgeLabel: "Weekday or Weekend?",
      objects: [toDayObj(sat, "violet", "-q2")],
      bins: WEEKDAY_WEEKEND_BINS,
      correctOptionId: "weekend",
      feedback: { correct: "Yes! The weekend.", wrong: "Saturday is the weekend." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "Tap a weekend day.", speakText: "Tap a weekend day.", badgeLabel: "Find the Weekend",
      objects: trio(sat, mon, wed, "q3"),
      correctOptionId: "saturday-q3t",
      feedback: { correct: "Yes! Saturday is the weekend.", wrong: "Saturday and Sunday are the weekend." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "Tap a school day.", speakText: "Tap a school day.", badgeLabel: "Find a School Day",
      objects: trio(wed, sat, sun, "q4"),
      correctOptionId: "wednesday-q4t",
      feedback: { correct: "Yes! Wednesday is a school day.", wrong: "School days are Monday to Friday." },
    },
    {
      kind: "measurementCompare", scene: "trio",
      prompt: "What day comes after Sunday?", speakText: "What day comes after Sunday?", badgeLabel: "The Week Goes Round",
      objects: trio(mon, wed, sat, "q5"),
      correctOptionId: "monday-q5t",
      feedback: { correct: "Yes! It starts again at Monday.", wrong: "After Sunday the week starts again at Monday." },
    },
  ];
}

export function generatePrepMeasurelandsWeek5Lesson3Task(
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
  if (rotation === "B") return buildFindTask(memory);
  return buildCycleTask(memory);
}

export function resetPrepMeasurelandsWeek5Lesson3TaskSessionState() {
  lessonMemory.clear();
}
