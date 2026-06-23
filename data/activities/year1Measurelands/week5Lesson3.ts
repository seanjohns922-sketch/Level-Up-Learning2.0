import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 5 · Lesson 3 — "Month Explorer" ──
// AC9M1M03: months form a year, repeat in the same order, and sequence around
// from December back to January.
//   A — What Comes Next?      (next month)
//   B — Build the Year Trail  (order 4 connected months)
//   C — Find the Missing Month (fill the gap in a month sequence)

type WeekTask = Extract<PracticeTask, { kind: "weekCycle" }>;
type MonthCard = { id: string; label: string };

export const YEAR1_MEASURELANDS_MONTHS: MonthCard[] = [
  { id: "jan", label: "January" },
  { id: "feb", label: "February" },
  { id: "mar", label: "March" },
  { id: "apr", label: "April" },
  { id: "may", label: "May" },
  { id: "jun", label: "June" },
  { id: "jul", label: "July" },
  { id: "aug", label: "August" },
  { id: "sep", label: "September" },
  { id: "oct", label: "October" },
  { id: "nov", label: "November" },
  { id: "dec", label: "December" },
];

const MONTH_IDS = YEAR1_MEASURELANDS_MONTHS.map((month) => month.id);

type LessonMemory = { introShown: boolean; cursor: number; lastStart: number | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastStart: null };
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

function monthAt(index: number): MonthCard {
  return YEAR1_MEASURELANDS_MONTHS[((index % 12) + 12) % 12]!;
}

const toCard = (month: MonthCard) => ({ id: month.id, label: month.label });

function chooseStart(memory: LessonMemory, maxStart: number) {
  const pool = Array.from({ length: maxStart + 1 }, (_, index) => index).filter((value) => value !== memory.lastStart);
  const picked = pool[randInt(pool.length)] ?? 0;
  memory.lastStart = picked;
  return picked;
}

function buildIntroTask(): WeekTask {
  return {
    kind: "weekCycle",
    scene: "intro",
    prompt: "Months make a year.",
    speakText:
      "Professor Gauge says there are 12 months in every year. The months always repeat in the same order. When December ends, a new year begins with January again.",
    badgeLabel: "Meazurex Mission",
    introTitle: "Month Explorer",
    introBody: [
      "There are 12 months in every year.",
      "Months repeat in the same order every year.",
      "After December, January begins a new year.",
    ],
    introVisual: "monthCycle",
    teachingDays: [monthAt(0), monthAt(1), monthAt(2), monthAt(11)].map(toCard),
    feedback: { correct: "Let's explore the months!", wrong: "Let's get ready." },
  };
}

function buildNextMonthTask(memory: LessonMemory, forceIndex?: number): WeekTask {
  const index = typeof forceIndex === "number" ? forceIndex : chooseStart(memory, 11);
  const current = monthAt(index);
  const answer = monthAt(index + 1);
  const distractorPool = YEAR1_MEASURELANDS_MONTHS.filter((month) => month.id !== current.id && month.id !== answer.id);
  const distractors = shuffle(distractorPool).slice(0, 2);
  return {
    kind: "weekCycle",
    scene: "next",
    prompt: "What comes next?",
    speakText: `What month comes after ${current.label}?`,
    badgeLabel: "What Comes Next?",
    sequence: [toCard(current)],
    choices: shuffle([toCard(answer), ...distractors.map(toCard)]),
    correctOptionId: answer.id,
    feedback: { correct: "Yes — the months keep going in the same order.", wrong: "Say the months in order to find what comes next." },
  };
}

function buildYearTrailTask(memory: LessonMemory): WeekTask {
  const start = chooseStart(memory, 8);
  const months = [monthAt(start), monthAt(start + 1), monthAt(start + 2), monthAt(start + 3)];
  return {
    kind: "weekCycle",
    scene: "build",
    prompt: "Build the year trail in order.",
    speakText: "Tap the months in order to build the year trail.",
    badgeLabel: "Build the Year Trail",
    items: shuffle(months.map(toCard)),
    orderedIds: months.map((month) => month.id),
    feedback: { correct: "Great sequencing — the months stay in that order every year!", wrong: "Try the months in order from first to last." },
  };
}

function buildMissingMonthTask(memory: LessonMemory, forceStart?: number, forceGap?: number): WeekTask {
  const start = typeof forceStart === "number" ? forceStart : chooseStart(memory, 8);
  const sequence = [monthAt(start), monthAt(start + 1), monthAt(start + 2), monthAt(start + 3)];
  const gap = typeof forceGap === "number" ? forceGap : randInt(4);
  const missing = sequence[gap]!;
  const strip = sequence.map((month, index) => (index === gap ? null : toCard(month)));
  const distractors = shuffle(YEAR1_MEASURELANDS_MONTHS.filter((month) => month.id !== missing.id)).slice(0, 2);
  return {
    kind: "weekCycle",
    scene: "missing",
    prompt: "Find the missing month.",
    speakText: "Look at the months. Which month is missing?",
    badgeLabel: "Missing Month",
    strip,
    choices: shuffle([toCard(missing), ...distractors.map(toCard)]),
    correctOptionId: missing.id,
    feedback: { correct: "You found the missing month!", wrong: "Say the months in order to find the gap." },
  };
}

export function generateY1MeasurelandsWeek5Lesson3Task(
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
  if (rotation === "A") return buildNextMonthTask(memory);
  if (rotation === "B") return buildYearTrailTask(memory);
  return buildMissingMonthTask(memory);
}

export function resetY1MeasurelandsWeek5Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY1MeasurelandsWeek5Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastStart: null };
  return [
    buildNextMonthTask(seed, 0), // January -> February
    buildNextMonthTask(seed, 10), // November -> December
    buildMissingMonthTask(seed, 0, 2), // Jan Feb ? Apr
    {
      kind: "weekCycle",
      scene: "build",
      prompt: "Put the months in order.",
      speakText: "Put the months in order.",
      badgeLabel: "Build the Year Trail",
      items: shuffle([monthAt(0), monthAt(1), monthAt(2), monthAt(3)].map(toCard)),
      orderedIds: [monthAt(0), monthAt(1), monthAt(2), monthAt(3)].map((month) => month.id),
      feedback: { correct: "January, February, March, April!", wrong: "Put the months in their usual order." },
    },
    buildNextMonthTask(seed, 11), // December -> January
  ];
}

