import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 6 · Lesson 2 — "Calendar Navigation" ──
// AC9M1M03: move through a calendar — find the next/previous date and jump one
// week later/earlier. Dates move in a predictable pattern; a week is +7 / -7
// (one row down/up on the grid). Stays within a single month (no transitions).
//   A — What Comes Next?   (MCQ: the next date, +1)
//   B — What Came Before?  (MCQ: the previous date, -1)
//   C — Calendar Explorer  (tap the date one week later/earlier, ±7)

type NavTask = Extract<PracticeTask, { kind: "calendarNavigate" }>;

// Real named months (days, and the weekday day-1 falls on: 0=Mon..6=Sun).
const MONTHS = [
  { name: "January", days: 31, start: 2 },
  { name: "February", days: 28, start: 5 },
  { name: "March", days: 31, start: 5 },
  { name: "April", days: 30, start: 1 },
  { name: "May", days: 31, start: 3 },
  { name: "June", days: 30, start: 6 },
  { name: "July", days: 31, start: 1 },
  { name: "August", days: 31, start: 4 },
  { name: "September", days: 30, start: 0 },
  { name: "October", days: 31, start: 2 },
  { name: "November", days: 30, start: 5 },
  { name: "December", days: 31, start: 0 },
];

type LessonMemory = { introShown: boolean; cursor: number; lastFrom: number | null };
const lessonMemory = new Map<string, LessonMemory>();
// next, before, explore-later, next, explore-earlier, before
const ROTATION: Array<"A" | "B" | "Clater" | "Cearlier"> = ["A", "B", "Clater", "A", "Cearlier", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastFrom: null };
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
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}
function pickMonth() {
  return choose(MONTHS);
}
// A start date within [lo, hi] that differs from the last one used.
function pickFrom(memory: LessonMemory, lo: number, hi: number): number {
  const span = hi - lo + 1;
  let d = lo + randInt(span);
  if (d === memory.lastFrom) d = lo + ((d - lo + 1) % span);
  memory.lastFrom = d;
  return d;
}

// Two wrong number options in [1, days], distinct, != correct — one "near"
// (off-by-one the wrong way) and one "far" (a digit-swap style distractor).
function stepOptions(correct: number, near: number, days: number): number[] {
  const far = [correct + 10, correct - 10, (correct % 10) || 9, correct + 11].find(
    (n) => n >= 1 && n <= days && n !== correct && n !== near,
  );
  const wrongs = [near, far].filter((n): n is number => n != null && n >= 1 && n <= days && n !== correct);
  // Guarantee two distinct distractors even on tight months.
  for (let n = 1; wrongs.length < 2 && n <= days; n += 1) {
    if (n !== correct && !wrongs.includes(n)) wrongs.push(n);
  }
  return shuffle([correct, ...wrongs.slice(0, 2)]);
}

function buildIntroTask(): NavTask {
  const m = pickMonth();
  return {
    kind: "calendarNavigate",
    scene: "intro",
    prompt: "Dates move in order.",
    speakText:
      "Calendars help us move through time. If today is the tenth, what comes next? The next date is eleven. Let's move around the calendar!",
    badgeLabel: "Meazurex Mission",
    days: m.days,
    startWeekday: m.start,
    monthLabel: m.name,
    feedback: { correct: "Let's move around the calendar!", wrong: "Let's get ready." },
  };
}

// Activity A — what comes next? (+1)
function buildNextTask(memory: LessonMemory): NavTask {
  const m = pickMonth();
  const from = pickFrom(memory, 1, m.days - 1);
  const correct = from + 1;
  return {
    kind: "calendarNavigate",
    scene: "next",
    prompt: `Today is the ${ordinal(from)}. What is the next date?`,
    speakText: `Today is the ${ordinal(from)}. What is the next date?`,
    badgeLabel: "What Comes Next?",
    days: m.days,
    startWeekday: m.start,
    monthLabel: m.name,
    fromDate: from,
    direction: "next",
    stepDays: 1,
    options: stepOptions(correct, from - 1, m.days),
    correctAnswer: correct,
    feedback: { correct: "Yes — the next date!", wrong: "The next date is one more. Count forward by 1." },
  };
}

// Activity B — what came before? (-1)
function buildBeforeTask(memory: LessonMemory): NavTask {
  const m = pickMonth();
  const from = pickFrom(memory, 2, m.days);
  const correct = from - 1;
  return {
    kind: "calendarNavigate",
    scene: "before",
    prompt: `Today is the ${ordinal(from)}. What was the date before?`,
    speakText: `Today is the ${ordinal(from)}. What was the date before?`,
    badgeLabel: "What Came Before?",
    days: m.days,
    startWeekday: m.start,
    monthLabel: m.name,
    fromDate: from,
    direction: "before",
    stepDays: 1,
    options: stepOptions(correct, from + 1, m.days),
    correctAnswer: correct,
    feedback: { correct: "Yes — the date before!", wrong: "The date before is one less. Count back by 1." },
  };
}

// Activity C — calendar explorer: one week later (+7) or earlier (-7), tap it.
function buildExploreTask(memory: LessonMemory, dir: "later" | "earlier"): NavTask {
  const m = pickMonth();
  const from = dir === "later" ? pickFrom(memory, 1, m.days - 7) : pickFrom(memory, 8, m.days);
  const target = dir === "later" ? from + 7 : from - 7;
  return {
    kind: "calendarNavigate",
    scene: "explore",
    prompt: `Professor Gauge is on the ${ordinal(from)}. Tap the date one week ${dir}.`,
    speakText: `Professor Gauge is on the ${ordinal(from)}. Tap the date one week ${dir}.`,
    badgeLabel: "Calendar Explorer",
    days: m.days,
    startWeekday: m.start,
    monthLabel: m.name,
    fromDate: from,
    direction: dir,
    stepDays: 7,
    targetDate: target,
    feedback: {
      correct: `Yes — one week ${dir} is the ${ordinal(target)}!`,
      wrong: `A week is 7 days — move one row ${dir === "later" ? "down" : "up"}.`,
    },
  };
}

export function generateY1MeasurelandsWeek6Lesson2Task(
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
  if (rotation === "Clater") return buildExploreTask(memory, "later");
  return buildExploreTask(memory, "earlier");
}

export function resetY1MeasurelandsWeek6Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 6 weekly quiz (Lesson 2's contribution):
// next, before, one week later, one week earlier, navigate (one week later).
export function buildY1MeasurelandsWeek6Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastFrom: null };
  return [
    buildNextTask(seed),
    buildBeforeTask(seed),
    buildExploreTask(seed, "later"),
    buildExploreTask(seed, "earlier"),
    buildExploreTask(seed, "later"),
  ];
}
