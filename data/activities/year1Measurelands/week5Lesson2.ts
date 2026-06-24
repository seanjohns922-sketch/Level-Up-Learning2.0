import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { WEEK5_DAYS, type DayOfWeek } from "@/data/activities/prepMeasurelands/week5Days";

// ── Measurelands · Level 1 · Week 5 · Lesson 2 — "Weeks and Months" ──
// AC9M1M03: weeks fit inside months. Hero fact: about 4 weeks make a month —
// taught the way Lesson 1 taught "7 days make a week": by BUILDING it. A month
// is shown as a numbered calendar (week 1 = days 1–7, week 2 = 8–14 …).
//   A — Build the Month   (stack 4 week-rows in order to fill a month)
//   B — Which Is Longest? (order day < week < month)
//   C — Weeks in a Month  (about 4 weeks make a month)

type WeekTask = Extract<PracticeTask, { kind: "weekCycle" }>;

const toCard = (d: DayOfWeek) => ({ id: d.id, imageSrc: d.imageSrc, label: d.label });
const WEEK_STRIP = WEEK5_DAYS.map(toCard);

// The four week-rows of a (simplified) 28-day month.
const MONTH_WEEKS = [
  { id: "w1", label: "Week 1", dates: [1, 2, 3, 4, 5, 6, 7] },
  { id: "w2", label: "Week 2", dates: [8, 9, 10, 11, 12, 13, 14] },
  { id: "w3", label: "Week 3", dates: [15, 16, 17, 18, 19, 20, 21] },
  { id: "w4", label: "Week 4", dates: [22, 23, 24, 25, 26, 27, 28] },
];
const MONTH_ORDER = MONTH_WEEKS.map((w) => w.id);

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
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

function buildIntroTask(): WeekTask {
  return {
    kind: "weekCycle",
    scene: "intro",
    prompt: "About four weeks make a month.",
    speakText:
      "Professor Gauge says: seven days make a week, and about four weeks make a month. On a calendar, each row is one week — week one is days one to seven, week two is eight to fourteen, and so on. A month is bigger than a week.",
    badgeLabel: "Meazurex Mission",
    introTitle: "Calendar Grove",
    introBody: [
      "Seven days make a week.",
      "About four weeks make a month.",
      "On a calendar, each row is one week.",
    ],
    introVisual: "weekToMonth",
    teachingDays: WEEK_STRIP,
    weekRows: 4,
    highlightRow: 0,
    numbered: true,
    feedback: { correct: "Let's build a month!", wrong: "Let's get ready." },
  };
}

// Activity A — build the month by stacking the 4 week-rows in order.
function buildMonthTask(): WeekTask {
  return {
    kind: "weekCycle",
    scene: "buildMonth",
    prompt: "Build the month. Add the weeks in order.",
    speakText: "A month is made of four weeks. Tap the weeks in order to fill the month, starting with week one.",
    badgeLabel: "Build the Month",
    monthWeeks: shuffle(MONTH_WEEKS),
    orderedIds: MONTH_ORDER,
    numbered: true,
    feedback: { correct: "Four weeks — that's a whole month!", wrong: "Start with days 1 to 7, then keep going in order." },
  };
}

// Activity B — order day < week < month.
function buildWhichLongestTask(): WeekTask {
  return {
    kind: "weekCycle",
    scene: "whichBigger",
    prompt: "Which is the longest?",
    speakText: "A day, a week, or a month — which is the longest?",
    badgeLabel: "Longest Time",
    weekRows: 4,
    numbered: true,
    textOptions: ["Day", "Week", "Month"],
    correctTextOption: "Month",
    feedback: { correct: "Yes — a day is short, a week is longer, a month is the longest.", wrong: "A day is short, a week is longer, a month is the longest." },
  };
}

// Activity C — about how many weeks make a month? (fixed: 4)
function buildWeeksInMonthTask(): WeekTask {
  return {
    kind: "weekCycle",
    scene: "findWeeks",
    prompt: "About how many weeks make a month?",
    speakText: "About how many weeks make a month?",
    badgeLabel: "Weeks in a Month",
    weekRows: 4,
    numbered: true,
    options: shuffle([2, 4, 7]),
    correctAnswer: 4,
    visualLabel: "Count the week rows",
    feedback: { correct: "About four weeks make a month!", wrong: "Count the rows — there are about four weeks." },
  };
}

// Comparison helper for the quiz (week vs month).
function buildWeekVsMonthTask(shorter: boolean): WeekTask {
  return {
    kind: "weekCycle",
    scene: "whichBigger",
    prompt: shorter ? "Which is shorter?" : "Which is longer?",
    speakText: shorter ? "Which is shorter, a week or a month?" : "Which is longer, a week or a month?",
    badgeLabel: shorter ? "Which Is Shorter?" : "Which Is Longer?",
    weekRows: 4,
    numbered: true,
    textOptions: ["Week", "Month"],
    correctTextOption: shorter ? "Week" : "Month",
    feedback: {
      correct: shorter ? "Yes — a week is shorter than a month." : "Yes — a month is longer than a week.",
      wrong: "A month is made of about four weeks, so it is longer.",
    },
  };
}

export function generateY1MeasurelandsWeek5Lesson2Task(
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
  if (rotation === "A") return buildMonthTask();
  if (rotation === "B") return buildWhichLongestTask();
  return buildWeeksInMonthTask();
}

export function resetY1MeasurelandsWeek5Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 5 weekly quiz (Lesson 2's contribution):
// build a month, weeks in a month, which is longest, longer, shorter.
export function buildY1MeasurelandsWeek5Lesson2QuizTasks(): PracticeTask[] {
  return [
    buildMonthTask(),
    buildWeeksInMonthTask(),
    buildWhichLongestTask(),
    buildWeekVsMonthTask(false),
    buildWeekVsMonthTask(true),
  ];
}
