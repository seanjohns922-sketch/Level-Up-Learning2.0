import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { WEEK5_DAYS, type DayOfWeek } from "@/data/activities/prepMeasurelands/week5Days";

// ── Measurelands · Level 1 · Week 5 · Lesson 2 — "Weeks and Months" ──
// AC9M1M03: recognise that weeks fit inside months. Ground Level named days;
// Lesson 1 established that 7 days make a week; Lesson 2 now connects one week
// row to a bigger calendar month made of several week rows.
//   A — Week or Month?    (compare a single week strip with a calendar page)
//   B — Find the Weeks    (count obvious week rows inside a month page)
//   C — Which Is Bigger?  (reason that month > week, and day < week < month)

type WeekTask = Extract<PracticeTask, { kind: "weekCycle" }>;

const toCard = (d: DayOfWeek) => ({ id: d.id, imageSrc: d.imageSrc, label: d.label });
const WEEK_STRIP = WEEK5_DAYS.map(toCard);

type LessonMemory = { introShown: boolean; cursor: number; lastRows: number | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastRows: null };
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

function chooseRows(memory: LessonMemory, pool: number[]): number {
  const options = pool.filter((value) => value !== memory.lastRows);
  const picked = options[randInt(options.length)] ?? pool[0]!;
  memory.lastRows = picked;
  return picked;
}

function buildIntroTask(): WeekTask {
  return {
    kind: "weekCycle",
    scene: "intro",
    prompt: "Weeks fit inside months.",
    speakText:
      "Professor Gauge says a week is made of seven days. A month is made of several weeks. On a calendar, one week is one row, and a month has many week rows. Months are bigger than weeks.",
    badgeLabel: "Meazurex Mission",
    introTitle: "Calendar Grove",
    introBody: [
      "A week is made of seven days.",
      "A month is made of several weeks.",
      "Months are bigger than weeks.",
    ],
    introVisual: "weekToMonth",
    teachingDays: WEEK_STRIP,
    weekRows: 4,
    highlightRow: 0,
    feedback: { correct: "Let's explore weeks and months!", wrong: "Let's get ready." },
  };
}

function buildWeekOrMonthTask(memory: LessonMemory): WeekTask {
  const showMonth = randInt(2) === 0;
  const rows = chooseRows(memory, [4, 5]);
  return {
    kind: "weekCycle",
    scene: "weekOrMonth",
    prompt: showMonth ? "Is this a week or a month?" : "What does this show?",
    speakText: showMonth ? "Look carefully. Is this showing a week or a month?" : "Does this picture show one week or one month?",
    badgeLabel: "Week or Month?",
    visualMode: showMonth ? "month" : "week",
    items: showMonth ? undefined : WEEK_STRIP,
    weekRows: rows,
    visualLabel: showMonth ? "Many weeks together" : "One row of seven days",
    textOptions: ["Week", "Month"],
    correctTextOption: showMonth ? "Month" : "Week",
    feedback: { correct: "Yes — one row is a week, many rows make a month!", wrong: "Remember: a month has several week rows." },
  };
}

function buildFindWeeksTask(memory: LessonMemory): WeekTask {
  const rows = chooseRows(memory, [4, 5]);
  const options = rows === 4 ? [3, 4, 5] : [4, 5, 6];
  return {
    kind: "weekCycle",
    scene: "findWeeks",
    prompt: "How many weeks can you see in this month?",
    speakText: "Count the week rows. How many weeks can you see in this month?",
    badgeLabel: "Find the Weeks",
    weekRows: rows,
    options: shuffle(options),
    correctAnswer: rows,
    visualLabel: "Each row is one week",
    feedback: { correct: "Great counting — those rows are the weeks!", wrong: "Count the rows. Each row is one week." },
  };
}

function buildWhichBiggerTask(memory: LessonMemory): WeekTask {
  const compareMode = randInt(2) === 0 ? "unit" : "sequence";
  if (compareMode === "sequence") {
    return {
      kind: "weekCycle",
      scene: "whichBigger",
      prompt: "Which is the longest?",
      speakText: "A day, a week, or a month — which is the longest?",
      badgeLabel: "Longest Time",
      items: WEEK_STRIP,
      weekRows: 4,
      textOptions: ["Day", "Week", "Month"],
      correctTextOption: "Month",
      feedback: { correct: "Yes — a day is short, a week is longer, a month is the longest.", wrong: "A day is short, a week is longer, a month is the longest." },
    };
  }

  const askLonger = randInt(2) === 0;
  return {
    kind: "weekCycle",
    scene: "whichBigger",
    prompt: askLonger ? "Which lasts longer?" : "Which is bigger?",
    speakText: askLonger ? "Which lasts longer, a week or a month?" : "Which is bigger, a week or a month?",
    badgeLabel: askLonger ? "Which Lasts Longer?" : "Which Is Bigger?",
    items: WEEK_STRIP,
    weekRows: 4,
    textOptions: ["Week", "Month"],
    correctTextOption: "Month",
    feedback: { correct: "Correct — a month is bigger than a week.", wrong: "A month is made of several weeks, so it is bigger." },
  };
}

function buildSevenDaysVsMonthTask(): WeekTask {
  return {
    kind: "weekCycle",
    scene: "whichBigger",
    prompt: "Which lasts longer: 7 days or a month?",
    speakText: "Which lasts longer, 7 days or a month?",
    badgeLabel: "Longer Time",
    items: WEEK_STRIP,
    weekRows: 4,
    textOptions: ["7 Days", "Month"],
    correctTextOption: "Month",
    feedback: { correct: "Yes — 7 days is one week, and a month is longer.", wrong: "Seven days make one week. A month is longer than one week." },
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
  if (rotation === "A") return buildWeekOrMonthTask(memory);
  if (rotation === "B") return buildFindWeeksTask(memory);
  return buildWhichBiggerTask(memory);
}

export function resetY1MeasurelandsWeek5Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 5 weekly quiz (Lesson 2's contribution):
// week or month, count rows, which is bigger, 7 days vs month, day → week → month.
export function buildY1MeasurelandsWeek5Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastRows: null };
  return [
    {
      kind: "weekCycle",
      scene: "weekOrMonth",
      prompt: "What does this show?",
      speakText: "What does this picture show, a week or a month?",
      badgeLabel: "Week or Month?",
      visualMode: "week",
      items: WEEK_STRIP,
      textOptions: ["Week", "Month"],
      correctTextOption: "Week",
      feedback: { correct: "One row shows a week.", wrong: "A single row of seven days is a week." },
    },
    {
      kind: "weekCycle",
      scene: "findWeeks",
      prompt: "How many weeks can you see in this month?",
      speakText: "How many weeks can you see in this month?",
      badgeLabel: "Find the Weeks",
      weekRows: 4,
      options: shuffle([3, 4, 5]),
      correctAnswer: 4,
      visualLabel: "Each row is one week",
      feedback: { correct: "Four week rows!", wrong: "Count the rows. There are four weeks shown." },
    },
    {
      kind: "weekCycle",
      scene: "whichBigger",
      prompt: "Which is bigger?",
      speakText: "Which is bigger, a week or a month?",
      badgeLabel: "Which Is Bigger?",
      items: WEEK_STRIP,
      weekRows: 4,
      textOptions: ["Week", "Month"],
      correctTextOption: "Month",
      feedback: { correct: "A month is bigger than a week.", wrong: "A month is made of several weeks." },
    },
    buildSevenDaysVsMonthTask(),
    {
      kind: "weekCycle",
      scene: "whichBigger",
      prompt: "Which is the longest?",
      speakText: "A day, a week, or a month — which is the longest?",
      badgeLabel: "Longest Time",
      items: WEEK_STRIP,
      weekRows: 4,
      textOptions: ["Month", "Day", "Week"],
      correctTextOption: "Month",
      feedback: { correct: "A month is the longest — day, week, month!", wrong: "A day is short, a week is longer, a month is the longest." },
    },
  ];
}
