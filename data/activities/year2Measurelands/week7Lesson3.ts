import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 7 · Lesson 3 — "Calendar Challenge" ──
// AC9M2M03: apply calendar knowledge to real-world date problems.

type NavTask = Extract<PracticeTask, { kind: "calendarNavigate" }>;

const GRID = { days: 30, startWeekday: 0, monthLabel: "July" };

const EVENTS = [
  { label: "Birthday", icon: "birthday" },
  { label: "Sport", icon: "sport" },
  { label: "Library", icon: "library" },
  { label: "Swimming", icon: "swimming" },
  { label: "Excursion", icon: "excursion" },
  { label: "Assembly", icon: "assembly" },
  { label: "Book Fair", icon: "bookfair" },
  { label: "Music", icon: "music" },
  { label: "Holiday", icon: "holiday" },
  { label: "Grandparent Visit", icon: "grandparent" },
] as const;

type EventTemplate = (typeof EVENTS)[number];
type CalendarEvent = { date: number; label: string; icon: string };
type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"mystery" | "dateLabel" | "missingDate" | "busyWeek"> = [
  "mystery",
  "dateLabel",
  "missingDate",
  "busyWeek",
  "mystery",
  "busyWeek",
  "dateLabel",
  "missingDate",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastKey: null };
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

function chooseEvents(count: number): EventTemplate[] {
  return shuffle([...EVENTS]).slice(0, count);
}

function makeEvents(dates: number[], templates: EventTemplate[]): CalendarEvent[] {
  return dates.map((date, index) => ({
    date,
    label: templates[index]!.label,
    icon: templates[index]!.icon,
  }));
}

function uniqueStart(memory: LessonMemory, min = 4, max = 14): number {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const value = min + randInt(max - min + 1);
    const key = `start-${value}`;
    if (key !== memory.lastKey) {
      memory.lastKey = key;
      return value;
    }
  }
  return min;
}

function buildIntroTask(): NavTask {
  return {
    kind: "calendarNavigate",
    scene: "intro",
    prompt: "Calendar Detective!",
    speakText:
      "Professor Gauge says: look for clues. Use the calendar. Read the dates carefully, then solve the mystery.",
    badgeLabel: "Calendar Challenge",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    fromDate: 10,
    events: makeEvents([12, 15, 18], [
      { label: "Birthday", icon: "birthday" },
      { label: "Library", icon: "library" },
      { label: "Sport", icon: "sport" },
    ]),
    feedback: { correct: "Read the dates carefully.", wrong: "Read the dates carefully." },
  };
}

function buildCalendarMysteryTask(memory: LessonMemory): NavTask {
  const first = uniqueStart(memory, 6, 12);
  const dates = [first, first + 3, first + 6];
  const events = makeEvents(dates, chooseEvents(3));
  const mode = randInt(3);
  let prompt = "Which event happens first?";
  let answer = events[0]!;
  if (mode === 1) {
    prompt = "Which event happens last?";
    answer = events[2]!;
  } else if (mode === 2) {
    const target = events[1]!;
    const daysAway = target.date - first;
    prompt = `Which event is exactly ${daysAway} days after ${events[0]!.label}?`;
    answer = target;
  }
  return {
    kind: "calendarNavigate",
    scene: "eventPlan",
    prompt,
    speakText: `${prompt} Read the dates on the calendar before choosing.`,
    badgeLabel: "Calendar Mystery",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    events,
    textOptions: shuffle(events.map((event) => event.label)),
    correctTextOption: answer.label,
    feedback: {
      correct: `${answer.label} is correct. You used the dates to solve the mystery.`,
      wrong: `${answer.label} is correct. Read the dates, then compare them carefully.`,
    },
  };
}

function buildDateLabelTask(memory: LessonMemory): NavTask {
  const date = uniqueStart(memory, 9, 24);
  const event = chooseEvents(1)[0]!;
  const near = shuffle([date - 2, date - 1, date + 1, date + 2].filter((value) => value >= 1 && value <= GRID.days));
  const options = shuffle([date, ...near.slice(0, 2)]);
  return {
    kind: "calendarNavigate",
    scene: "dateLabel",
    prompt: `${event.label} is on ${GRID.monthLabel} __.`,
    speakText: `${event.label} is on ${GRID.monthLabel} blank. Look at the event marker and choose the date number.`,
    badgeLabel: "Label the Date",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    events: [{ date, label: event.label, icon: event.icon }],
    options,
    correctAnswer: date,
    feedback: {
      correct: `${event.label} is on ${GRID.monthLabel} ${date}.`,
      wrong: `${event.label} is on ${GRID.monthLabel} ${date}. Find the event marker, then read the date number.`,
    },
  };
}

function buildMissingDateTask(memory: LessonMemory): NavTask {
  const libraryDate = uniqueStart(memory, 7, 18);
  const afterMode = randInt(2) === 0;
  const offset = afterMode ? 2 + randInt(4) : -(2 + randInt(3));
  const targetDate = libraryDate + offset;
  const known = afterMode ? "Library" : "Book Fair";
  const target = afterMode ? "Sports Day" : "Swimming";
  return {
    kind: "calendarNavigate",
    scene: "missingDate",
    prompt: `${target} is ${Math.abs(offset)} days ${afterMode ? "after" : "before"} ${known}. ${known} is on the ${libraryDate}. Tap ${target}'s date.`,
    speakText: `${target} is ${Math.abs(offset)} days ${afterMode ? "after" : "before"} ${known}. ${known} is on the ${libraryDate}. Tap ${target}'s date.`,
    badgeLabel: "Missing Date",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    fromDate: libraryDate,
    targetDate,
    events: [{ date: libraryDate, label: known, icon: afterMode ? "library" : "bookfair" }],
    feedback: {
      correct: `${target} is on the ${targetDate}.`,
      wrong: `${target} is on the ${targetDate}. Count ${afterMode ? "forward" : "back"} from the ${libraryDate}.`,
    },
  };
}

function buildBusyWeekTask(memory: LessonMemory): NavTask {
  const monday = uniqueStart(memory, 8, 15);
  const events = makeEvents([monday, monday + 2, monday + 4], [
    { label: "Sport", icon: "sport" },
    { label: "Birthday", icon: "birthday" },
    { label: "Library", icon: "library" },
  ]);
  const mode = randInt(3);
  let prompt = "Which event happens next?";
  let answer = events[0]!;
  if (mode === 1) {
    prompt = `How many days between ${events[0]!.label} and ${events[1]!.label}?`;
    return {
      kind: "calendarNavigate",
      scene: "whichCount",
      prompt,
      speakText: `${prompt} Count the jumps between the two event dates.`,
      badgeLabel: "My Busy Week",
      days: GRID.days,
      startWeekday: GRID.startWeekday,
      monthLabel: GRID.monthLabel,
      fromDate: events[0]!.date,
      toDate: events[1]!.date,
      events,
      options: shuffle([2, 3, 4]),
      correctAnswer: 2,
      feedback: {
        correct: "2 days between those events.",
        wrong: "There are 2 days between those events. Count the jumps, not the start day.",
      },
    };
  }
  if (mode === 2) {
    prompt = "Which event is last?";
    answer = events[2]!;
  }
  return {
    kind: "calendarNavigate",
    scene: "eventPlan",
    prompt,
    speakText: `${prompt} Read the event dates on the calendar.`,
    badgeLabel: "My Busy Week",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    events,
    textOptions: shuffle(events.map((event) => event.label)),
    correctTextOption: answer.label,
    feedback: {
      correct: `${answer.label} is correct. You used the dates.`,
      wrong: `${answer.label} is correct. Compare the event dates carefully.`,
    },
  };
}

export function generateY2MeasurelandsWeek7Lesson3Task(
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
  if (activity === "dateLabel") return buildDateLabelTask(memory);
  if (activity === "missingDate") return buildMissingDateTask(memory);
  if (activity === "busyWeek") return buildBusyWeekTask(memory);
  return buildCalendarMysteryTask(memory);
}

export function resetY2MeasurelandsWeek7Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek7Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastKey: null };
  return [
    buildCalendarMysteryTask(seed),
    buildDateLabelTask(seed),
    buildMissingDateTask(seed),
    buildBusyWeekTask(seed),
    buildBusyWeekTask(seed),
  ];
}
