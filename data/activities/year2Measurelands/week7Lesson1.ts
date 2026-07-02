import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 7 · Lesson 1 — "Count the Days" ──
// AC9M2M03: months of the year + days in each month, and the number of days
// BETWEEN two dates. Days between = count the JUMPS (exclusive of the start):
// the 3rd to the 7th is 4 days, not 5. Everything stays within one month.
// THREE rotating activities:
//   1. between    — tap each day from the start+1 to the finish; count the jumps.
//   2. whichCount  — Professor vs Pebble: pick the correct between-count.
//   3. months      — days in a month / which month comes next (the months beat).

type NavTask = Extract<PracticeTask, { kind: "calendarNavigate" }>;

const MONTHS: Array<{ name: string; days: number }> = [
  { name: "January", days: 31 }, { name: "February", days: 28 }, { name: "March", days: 31 },
  { name: "April", days: 30 }, { name: "May", days: 31 }, { name: "June", days: 30 },
  { name: "July", days: 31 }, { name: "August", days: 31 }, { name: "September", days: 30 },
  { name: "October", days: 31 }, { name: "November", days: 30 }, { name: "December", days: 31 },
];

// A single practice month for the counting grids (30 days, starts on Monday).
const GRID = { days: 30, startWeekday: 0, monthLabel: "Meazurex Month" };

type LessonMemory = { introShown: boolean; cursor: number; lastPair: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"between" | "whichCount" | "months"> = [
  "between", "whichCount", "months", "between", "months", "whichCount",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastPair: null };
  lessonMemory.set(lessonId, created);
  return created;
}

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}
function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

// A start/finish pair within the practice month: gap 2–6 days, no repeat.
function pickPair(memory: LessonMemory): { from: number; to: number } {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const from = 1 + randInt(18);
    const gap = 2 + randInt(5); // 2–6
    const to = from + gap;
    const key = `${from}-${to}`;
    if (to <= GRID.days && key !== memory.lastPair) {
      memory.lastPair = key;
      return { from, to };
    }
  }
  memory.lastPair = "3-7";
  return { from: 3, to: 7 };
}

function buildIntroTask(): NavTask {
  return {
    kind: "calendarNavigate",
    scene: "intro",
    prompt: "Counting the days between.",
    speakText:
      "Professor Gauge says: to count the days between two dates, start on the first date and count each jump forward. Count the jumps, not the start day. From the 3rd to the 7th is 4 days.",
    badgeLabel: "Meazurex Mission",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    feedback: { correct: "Let's count the days!", wrong: "Let's get ready." },
  };
}

// Activity 1 — tap each day from start+1 to finish; count the jumps.
function buildBetweenTask(memory: LessonMemory): NavTask {
  const { from, to } = pickPair(memory);
  return {
    kind: "calendarNavigate",
    scene: "between",
    prompt: `How many days are between the ${from} and the ${to}?`,
    speakText: `Count the jumps from the ${from} to the ${to}. Tap each day after the ${from}.`,
    badgeLabel: "Count the Days Between",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    fromDate: from,
    toDate: to,
    correctAnswer: to - from,
    feedback: { correct: `${to - from} days between — you counted the jumps!`, wrong: "Count one jump at a time — don't count the start day." },
  };
}

// Activity 2 — Professor vs Pebble: pick the correct between-count.
function buildWhichCountTask(memory: LessonMemory): NavTask {
  const { from, to } = pickPair(memory);
  const answer = to - from;
  return {
    kind: "calendarNavigate",
    scene: "whichCount",
    prompt: `Professor Gauge counted ${answer + 1}. Pebble counted ${answer}. How many days are between the ${from} and the ${to}?`,
    speakText: `Professor Gauge counted ${answer + 1}. Pebble counted ${answer}. How many days are really between the ${from} and the ${to}?`,
    badgeLabel: "Which Count Is Correct?",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    fromDate: from,
    toDate: to,
    options: shuffle([answer, answer + 1]),
    correctAnswer: answer,
    feedback: { correct: `Yes — ${answer}! Count the jumps, not the start day.`, wrong: `It's ${answer}. Counting the start day gives one too many.` },
  };
}

// Activity 3 — months of the year / days in each month.
function buildMonthsTask(_memory: LessonMemory): NavTask {
  const nextMode = randInt(2) === 0;
  if (nextMode) {
    const i = randInt(MONTHS.length);
    const month = MONTHS[i]!;
    const next = MONTHS[(i + 1) % MONTHS.length]!;
    const distractors = shuffle(MONTHS.filter((m) => m.name !== next.name && m.name !== month.name)).slice(0, 2);
    // A short strip around the gap: …[prev, THIS (highlight), ? (answer), +2, +3]…
    const monthStrip = [-1, 0, 1, 2, 3].map((off) => {
      const m = MONTHS[(i + off + MONTHS.length) % MONTHS.length]!;
      return { label: m.name.slice(0, 3), blank: m.name === next.name, highlight: m.name === month.name };
    });
    return {
      kind: "calendarNavigate",
      scene: "months",
      prompt: `Which month fills the gap after ${month.name}?`,
      speakText: `Look at the months in order. Which month fills the gap straight after ${month.name}?`,
      badgeLabel: "Months of the Year",
      days: GRID.days,
      startWeekday: GRID.startWeekday,
      monthName: month.name,
      monthStrip,
      textOptions: shuffle([next.name, ...distractors.map((m) => m.name)]),
      correctTextOption: next.name,
      feedback: { correct: `Yes — ${next.name} comes after ${month.name}.`, wrong: `${next.name} comes straight after ${month.name}.` },
    };
  }
  const month = choose(MONTHS);
  const distractors = shuffle([28, 30, 31].filter((d) => d !== month.days));
  return {
    kind: "calendarNavigate",
    scene: "months",
    prompt: `How many days are in ${month.name}?`,
    speakText: `How many days are in ${month.name}?`,
    badgeLabel: "Days in the Month",
    days: month.days,
    startWeekday: GRID.startWeekday,
    monthName: month.name,
    options: shuffle([month.days, ...distractors].slice(0, 3)),
    correctAnswer: month.days,
    feedback: { correct: `Yes — ${month.name} has ${month.days} days.`, wrong: `${month.name} has ${month.days} days.` },
  };
}

export function generateY2MeasurelandsWeek7Lesson1Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "whichCount") return buildWhichCountTask(memory);
  if (activity === "months") return buildMonthsTask(memory);
  return buildBetweenTask(memory);
}

export function resetY2MeasurelandsWeek7Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek7Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastPair: null };
  return [
    buildBetweenTask(seed),
    buildWhichCountTask(seed),
    buildMonthsTask(seed),
    buildBetweenTask(seed),
    buildWhichCountTask(seed),
  ];
}
