import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 6 · Lesson 3 — "Event Planner" ──
// AC9M1M03: use a calendar to plan and organise events. Calendars are tools —
// people put birthdays, sports days and excursions on them. Dates decide the
// order events happen in. Heavy event icons, minimal reading: "plan my week".
//   A — When Is the Event?  (read an event's date, number MCQ)
//   B — Place the Event     (tap the date to drop an event on)
//   C — Which Comes First?  (compare event dates — first / last)

type EventTask = Extract<PracticeTask, { kind: "calendarEvent" }>;

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

const EVENTS = [
  { label: "Birthday", icon: "cake" },
  { label: "Sports Day", icon: "trophy" },
  { label: "Excursion", icon: "bus" },
  { label: "Celebration", icon: "party" },
  { label: "Library Visit", icon: "book" },
  { label: "Art Day", icon: "palette" },
  { label: "Fun Run", icon: "run" },
];

type LessonMemory = { introShown: boolean; cursor: number; lastDate: number | null };
const lessonMemory = new Map<string, LessonMemory>();
// when, place, compare-first, when, compare-last, place
const ROTATION: Array<"A" | "B" | "Cfirst" | "Clast"> = ["A", "B", "Cfirst", "A", "Clast", "B"];

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
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}
function pickMonth() {
  return choose(MONTHS);
}

// Place n distinct events on n distinct dates within the month.
function placeEvents(days: number, n: number) {
  const dates = shuffle(Array.from({ length: days }, (_, i) => i + 1)).slice(0, n);
  const picks = shuffle(EVENTS).slice(0, n);
  return picks.map((e, i) => ({ date: dates[i]!, label: e.label, icon: e.icon }));
}

function buildIntroTask(): EventTask {
  const m = pickMonth();
  return {
    kind: "calendarEvent",
    scene: "intro",
    prompt: "Calendars help us plan events.",
    speakText:
      "I use my calendar to remember important events — birthdays, sports days, excursions. Calendars help us know when things happen. Let's plan some events!",
    badgeLabel: "Meazurex Mission",
    days: m.days,
    startWeekday: m.start,
    monthLabel: m.name,
    events: [
      { date: 12, label: "Birthday", icon: "cake" },
      { date: 18, label: "Sports Day", icon: "trophy" },
      { date: 25, label: "Excursion", icon: "bus" },
    ].filter((e) => e.date <= m.days),
    feedback: { correct: "Let's plan some events!", wrong: "Let's get ready." },
  };
}

// Activity A — when is the event? (read an event's date; options are the event dates)
function buildWhenTask(memory: LessonMemory): EventTask {
  const m = pickMonth();
  const events = placeEvents(m.days, 3);
  const ask = choose(events);
  memory.lastDate = ask.date;
  return {
    kind: "calendarEvent",
    scene: "when",
    prompt: `When is ${ask.label}?`,
    speakText: `Look at the calendar. When is ${ask.label}?`,
    badgeLabel: "When Is the Event?",
    days: m.days,
    startWeekday: m.start,
    monthLabel: m.name,
    events,
    askEventLabel: ask.label,
    options: shuffle(events.map((e) => e.date)),
    correctAnswer: ask.date,
    feedback: { correct: `Yes — ${ask.label} is on the ${ordinal(ask.date)}!`, wrong: "Find the matching picture, then read its date." },
  };
}

// Activity B — place the event (tap the date to drop it on an empty calendar)
function buildPlaceTask(memory: LessonMemory): EventTask {
  const m = pickMonth();
  const ev = choose(EVENTS);
  let target = 1 + randInt(m.days);
  if (target === memory.lastDate) target = 1 + (target % m.days);
  memory.lastDate = target;
  return {
    kind: "calendarEvent",
    scene: "place",
    prompt: `Place ${ev.label} on the ${ordinal(target)}.`,
    speakText: `Place ${ev.label} on the ${ordinal(target)}. Tap the date on the calendar.`,
    badgeLabel: "Place the Event",
    days: m.days,
    startWeekday: m.start,
    monthLabel: m.name,
    placeLabel: ev.label,
    placeIcon: ev.icon,
    targetDate: target,
    feedback: { correct: `Done — ${ev.label} is on the ${ordinal(target)}!`, wrong: "Find that date number on the calendar and tap it." },
  };
}

// Activity C — which comes first / last? (compare event dates)
function buildCompareTask(memory: LessonMemory, mode: "first" | "last"): EventTask {
  const m = pickMonth();
  const events = placeEvents(m.days, 3);
  const sorted = [...events].sort((a, b) => a.date - b.date);
  const answer = mode === "first" ? sorted[0]! : sorted[sorted.length - 1]!;
  memory.lastDate = answer.date;
  return {
    kind: "calendarEvent",
    scene: "compare",
    prompt: mode === "first" ? "Which event happens first?" : "Which event happens last?",
    speakText: mode === "first" ? "Look at the dates. Which event happens first?" : "Look at the dates. Which event happens last?",
    badgeLabel: mode === "first" ? "Which Comes First?" : "Which Comes Last?",
    days: m.days,
    startWeekday: m.start,
    monthLabel: m.name,
    events,
    compareMode: mode,
    textOptions: shuffle(events.map((e) => e.label)),
    correctTextOption: answer.label,
    feedback: {
      correct: `Yes — ${answer.label} on the ${ordinal(answer.date)} is ${mode === "first" ? "the earliest" : "the latest"} date!`,
      wrong: mode === "first" ? "The first event has the smallest date." : "The last event has the biggest date.",
    },
  };
}

export function generateY1MeasurelandsWeek6Lesson3Task(
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
  if (rotation === "A") return buildWhenTask(memory);
  if (rotation === "B") return buildPlaceTask(memory);
  if (rotation === "Cfirst") return buildCompareTask(memory, "first");
  return buildCompareTask(memory, "last");
}

export function resetY1MeasurelandsWeek6Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 6 weekly quiz (Lesson 3's contribution):
// when, place, which-first, which-last, compare (which-first again).
export function buildY1MeasurelandsWeek6Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastDate: null };
  return [
    buildWhenTask(seed),
    buildPlaceTask(seed),
    buildCompareTask(seed, "first"),
    buildCompareTask(seed, "last"),
    buildCompareTask(seed, "first"),
  ];
}
