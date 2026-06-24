import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 6 · Lesson 1 — "Find the Date" ──
// AC9M1M03: use a calendar to find/read dates and connect events to dates.
// The date is the NUMBER in the cell (not the day of the week). Highly visual:
// a non-reader can locate numbers, spot a highlighted date, and read event icons.
//   A — Find the Date    (tap the given number on the calendar)
//   B — What Date Is It?  (read the highlighted date, MCQ)
//   C — Find the Event    (tap the date an event is on)

type CalendarTask = Extract<PracticeTask, { kind: "calendarFind" }>;

// A few simple month layouts (days, and the weekday day-1 falls on: 0=Mon..6=Sun).
const MONTHS = [
  { days: 30, start: 0 },
  { days: 31, start: 2 },
  { days: 28, start: 5 },
  { days: 30, start: 3 },
  { days: 31, start: 1 },
];

const EVENTS = [
  { label: "Birthday", icon: "cake" },
  { label: "Sports Day", icon: "trophy" },
  { label: "Party", icon: "gift" },
  { label: "Festival", icon: "music" },
  { label: "Library Day", icon: "star" },
];

type LessonMemory = { introShown: boolean; cursor: number; lastDate: number | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastDate: null };
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
function pickMonth() {
  return choose(MONTHS);
}
function pickDate(memory: LessonMemory, days: number): number {
  let d = 1 + randInt(days);
  if (d === memory.lastDate) d = 1 + ((d % days));
  memory.lastDate = d;
  return d;
}

// MCQ distractors for reading a date (e.g. 18 → 8, 28).
function readOptions(marked: number): number[] {
  const candidates = [marked + 1, marked - 1, marked + 10, marked - 10, marked % 10 || 9].filter(
    (n) => n >= 1 && n <= 31 && n !== marked,
  );
  return shuffle([marked, ...shuffle([...new Set(candidates)]).slice(0, 2)]);
}

// Place n distinct events on distinct dates within the month.
function placeEvents(days: number, n: number) {
  const dates = shuffle(Array.from({ length: days }, (_, i) => i + 1)).slice(0, n);
  const picks = shuffle(EVENTS).slice(0, n);
  return picks.map((e, i) => ({ date: dates[i]!, label: e.label, icon: e.icon }));
}

function buildIntroTask(): CalendarTask {
  const m = pickMonth();
  return {
    kind: "calendarFind",
    scene: "intro",
    prompt: "A calendar shows the dates.",
    speakText:
      "Professor Gauge has reached Calendar Quest! A calendar helps us organise days and dates. The date is the number inside the calendar. Let's find some dates!",
    badgeLabel: "Meazurex Mission",
    days: m.days,
    startWeekday: m.start,
    highlightDate: 15,
    feedback: { correct: "Let's find some dates!", wrong: "Let's get ready." },
  };
}

// Activity A — find (tap) the date.
function buildFindTask(memory: LessonMemory): CalendarTask {
  const m = pickMonth();
  const target = pickDate(memory, m.days);
  return {
    kind: "calendarFind",
    scene: "find",
    prompt: `Find ${target}.`,
    speakText: `Find the date ${target}. Tap it on the calendar.`,
    badgeLabel: "Find the Date",
    days: m.days,
    startWeekday: m.start,
    targetDate: target,
    feedback: { correct: "You found the date!", wrong: "Look for that number on the calendar." },
  };
}

// Activity B — read the highlighted date.
function buildReadTask(memory: LessonMemory): CalendarTask {
  const m = pickMonth();
  const marked = pickDate(memory, m.days);
  return {
    kind: "calendarFind",
    scene: "read",
    prompt: "What date is highlighted?",
    speakText: "Professor Gauge is standing on the purple date. What date is it?",
    badgeLabel: "What Date Is It?",
    days: m.days,
    startWeekday: m.start,
    markedDate: marked,
    options: readOptions(marked),
    correctAnswer: marked,
    feedback: { correct: "That's the date!", wrong: "Read the number in the purple square." },
  };
}

// Activity C — find the event's date (tap).
function buildEventTask(memory: LessonMemory): CalendarTask {
  const m = pickMonth();
  const events = placeEvents(m.days, 3);
  const ask = choose(events);
  memory.lastDate = ask.date;
  return {
    kind: "calendarFind",
    scene: "event",
    prompt: `When is ${ask.label}?`,
    speakText: `Find ${ask.label} on the calendar. Tap the date it is on.`,
    badgeLabel: "Find the Event",
    days: m.days,
    startWeekday: m.start,
    events,
    askEventLabel: ask.label,
    feedback: { correct: `Yes — that's when ${ask.label} is!`, wrong: "Look for the matching picture, then tap its date." },
  };
}

// Quiz — match a date to its event.
function buildMatchTask(): CalendarTask {
  const m = pickMonth();
  const events = placeEvents(m.days, 3);
  const target = choose(events);
  return {
    kind: "calendarFind",
    scene: "match",
    prompt: `What is on the ${target.date}?`,
    speakText: `Look at the date ${target.date}. What is happening on that day?`,
    badgeLabel: "What's On?",
    days: m.days,
    startWeekday: m.start,
    events,
    markedDate: target.date,
    textOptions: shuffle(events.map((e) => e.label)),
    correctTextOption: target.label,
    feedback: { correct: "That's what's on that day!", wrong: "Look at the picture on that date." },
  };
}

export function generateY1MeasurelandsWeek6Lesson1Task(
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
  if (rotation === "A") return buildFindTask(memory);
  if (rotation === "B") return buildReadTask(memory);
  return buildEventTask(memory);
}

export function resetY1MeasurelandsWeek6Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 6 weekly quiz (Lesson 1's contribution):
// find, find, read, find an event, match a date to an event.
export function buildY1MeasurelandsWeek6Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastDate: null };
  return [
    buildFindTask(seed),
    buildFindTask(seed),
    buildReadTask(seed),
    buildEventTask(seed),
    buildMatchTask(),
  ];
}
