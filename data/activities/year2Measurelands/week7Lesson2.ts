import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 7 · Lesson 2 — "How Many Days Until?" ──
// AC9M2M03: use a monthly calendar to count forward to familiar events.
// Core rule: start at today, count the next date as 1, and keep moving forward.

type NavTask = Extract<PracticeTask, { kind: "calendarNavigate" }>;

const GRID = { days: 30, startWeekday: 0, monthLabel: "Calendar Keep Month" };

const EVENTS = [
  { label: "Birthday", icon: "birthday" },
  { label: "Library Day", icon: "library" },
  { label: "Swimming", icon: "swimming" },
  { label: "Sports Day", icon: "sport" },
  { label: "Excursion", icon: "excursion" },
  { label: "Assembly", icon: "assembly" },
  { label: "Music", icon: "music" },
  { label: "Holiday", icon: "holiday" },
  { label: "Grandparent Visit", icon: "grandparent" },
  { label: "School Disco", icon: "disco" },
  { label: "Soccer Training", icon: "soccer" },
  { label: "Book Fair", icon: "bookfair" },
] as const;

type EventTemplate = (typeof EVENTS)[number];
type CalendarEvent = { date: number; label: string; icon: string };
type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"until" | "eventCompare" | "eventPlan"> = [
  "until",
  "eventCompare",
  "eventPlan",
  "until",
  "eventCompare",
  "eventPlan",
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

function pickToday(memory: LessonMemory, maxGap = 8): number {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const today = 3 + randInt(GRID.days - maxGap - 4);
    const key = `today-${today}`;
    if (key !== memory.lastKey) {
      memory.lastKey = key;
      return today;
    }
  }
  return 8;
}

function withEventDates(today: number, gaps: number[], templates: EventTemplate[]): CalendarEvent[] {
  return gaps.map((gap, index) => ({
    date: today + gap,
    label: templates[index]!.label,
    icon: templates[index]!.icon,
  }));
}

function buildIntroTask(): NavTask {
  return {
    kind: "calendarNavigate",
    scene: "intro",
    prompt: "How many days until an event?",
    speakText:
      "Professor Gauge says: start at today. Then count forward one day at a time until you reach the event. Do not count today as day one.",
    badgeLabel: "Calendar Keep",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    fromDate: 8,
    toDate: 13,
    events: [{ date: 13, label: "Birthday", icon: "birthday" }],
    askEventLabel: "Birthday",
    feedback: { correct: "Start at today, then count forward.", wrong: "Start at today, then count forward." },
  };
}

function buildUntilTask(memory: LessonMemory): NavTask {
  const today = pickToday(memory);
  const gap = 3 + randInt(5); // 3-7 days away: enough path to count, still one screen.
  const event = chooseEvents(1)[0]!;
  const targetDate = today + gap;
  return {
    kind: "calendarNavigate",
    scene: "until",
    prompt: `Today is the ${today}. How many days until ${event.label}?`,
    speakText: `Today is the ${today}. ${event.label} is on the ${targetDate}. Count forward to find how many days until ${event.label}.`,
    badgeLabel: "Count the Days Until",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    fromDate: today,
    toDate: targetDate,
    events: [{ date: targetDate, label: event.label, icon: event.icon }],
    askEventLabel: event.label,
    correctAnswer: gap,
    feedback: {
      correct: `${gap} days until ${event.label}. You counted forward from today.`,
      wrong: `It is ${gap} days. Start after today and count to the event.`,
    },
  };
}

function buildEventCompareTask(memory: LessonMemory): NavTask {
  const today = pickToday(memory, 10);
  const [near, far] = shuffle([3 + randInt(3), 7 + randInt(4)]); // clear separation.
  const events = withEventDates(today, [near, far], chooseEvents(2));
  const answer = events.reduce((earliest, event) => (event.date < earliest.date ? event : earliest), events[0]!);
  return {
    kind: "calendarNavigate",
    scene: "eventCompare",
    prompt: "Which event happens first?",
    speakText: `Today is the ${today}. Look at the event dates. Which event happens first?`,
    badgeLabel: "Which Happens First?",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    fromDate: today,
    events,
    textOptions: shuffle(events.map((event) => event.label)),
    correctTextOption: answer.label,
    feedback: {
      correct: `${answer.label} happens first because it is closest to today.`,
      wrong: `${answer.label} happens first. Count forward from today and stop at the first event.`,
    },
  };
}

function buildEventPlanTask(memory: LessonMemory): NavTask {
  const today = pickToday(memory, 12);
  const mode = randInt(3);
  const gaps = shuffle([2 + randInt(2), 5 + randInt(2), 9 + randInt(3)]).sort((a, b) => a - b);
  const events = withEventDates(today, gaps, chooseEvents(3));
  let prompt = "Which event happens next?";
  let answer = events[0]!;
  let speakText = `Today is the ${today}. Which event happens next?`;
  if (mode === 1) {
    const targetGap = gaps[1]!;
    answer = events.find((event) => event.date - today === targetGap)!;
    prompt = `Which event is in ${targetGap} days?`;
    speakText = `Today is the ${today}. Which event is in ${targetGap} days?`;
  } else if (mode === 2) {
    answer = events[events.length - 1]!;
    prompt = "Which event is furthest away?";
    speakText = `Today is the ${today}. Which event is furthest away?`;
  }
  return {
    kind: "calendarNavigate",
    scene: "eventPlan",
    prompt,
    speakText,
    badgeLabel: "Plan My Week",
    days: GRID.days,
    startWeekday: GRID.startWeekday,
    monthLabel: GRID.monthLabel,
    fromDate: today,
    events,
    textOptions: shuffle(events.map((event) => event.label)),
    correctTextOption: answer.label,
    feedback: {
      correct: `${answer.label} is the right event. You used the calendar dates.`,
      wrong: `${answer.label} is correct. Start at today and compare how far away each event is.`,
    },
  };
}

export function generateY2MeasurelandsWeek7Lesson2Task(
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
  if (activity === "eventCompare") return buildEventCompareTask(memory);
  if (activity === "eventPlan") return buildEventPlanTask(memory);
  return buildUntilTask(memory);
}

export function resetY2MeasurelandsWeek7Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek7Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastKey: null };
  return [
    buildUntilTask(seed),
    buildUntilTask(seed),
    buildEventCompareTask(seed),
    buildEventPlanTask(seed),
    buildEventPlanTask(seed),
  ];
}
