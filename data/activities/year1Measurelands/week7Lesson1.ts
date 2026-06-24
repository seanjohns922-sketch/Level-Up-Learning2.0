import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 7 · Lesson 1 — "Yesterday" ──
// AC9M1M03: describe and sequence events in time. Time LANGUAGE, not calendar
// dates: yesterday = the day before today. Events sit on a simple
// Yesterday -> Today -> Tomorrow timeline (no dates, no month navigation).
//   A — Did It Happen Yesterday?  (timeline + pick the event for a day)
//   B — What Came Before?         (two events; which happened first)
//   C — Build the Timeline        (tap events into yesterday->today->tomorrow)
// + meaning (quiz): "what does yesterday mean?"

type TimeTask = Extract<PracticeTask, { kind: "timeSequence" }>;
type When = "yesterday" | "today" | "tomorrow";

const EVENTS = [
  { label: "Soccer", icon: "soccer" },
  { label: "School", icon: "school" },
  { label: "Birthday", icon: "birthday" },
  { label: "Swimming", icon: "swimming" },
  { label: "Art Day", icon: "art" },
  { label: "Excursion", icon: "excursion" },
  { label: "Celebration", icon: "celebration" },
];
const WHEN_ORDER: Record<When, number> = { yesterday: 0, today: 1, tomorrow: 2 };

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
// which, before, build, which, before, build
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "B", "C"];

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
function pickEvents(n: number) {
  return shuffle(EVENTS).slice(0, n);
}

function buildIntroTask(): TimeTask {
  return {
    kind: "timeSequence",
    scene: "intro",
    prompt: "Yesterday is the day before today.",
    speakText:
      "Professor Gauge is on a time journey! Yesterday means the day before today. If today is Wednesday, yesterday was Tuesday. Yesterday happened before today.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's explore time!", wrong: "Let's get ready." },
  };
}

// Activity A — which event happened yesterday (or today)?
function buildWhichTask(forceWhen?: "yesterday" | "today"): TimeTask {
  const [a, b] = pickEvents(2);
  const slots: TimeTask["slots"] = [
    { when: "yesterday", label: a!.label, icon: a!.icon },
    { when: "today", label: b!.label, icon: b!.icon },
  ];
  const askWhen: When = forceWhen ?? (Math.random() < 0.6 ? "yesterday" : "today");
  const answer = slots.find((s) => s.when === askWhen)!;
  const word = askWhen === "yesterday" ? "yesterday" : "today";
  return {
    kind: "timeSequence",
    scene: "which",
    prompt: `Which event happened ${word}?`,
    speakText: `Look at the timeline. Which event happened ${word}?`,
    badgeLabel: "Did It Happen Yesterday?",
    slots,
    askWhen,
    textOptions: shuffle(slots.map((s) => s.label)),
    correctTextOption: answer.label,
    feedback: {
      correct: `Yes — ${answer.label} happened ${word}!`,
      wrong: askWhen === "yesterday" ? "Yesterday is before today. Look at the left of the timeline." : "Today is now. Look at the highlighted day.",
    },
  };
}

// Activity B — which event came first? (two events on different days)
function buildBeforeTask(): TimeTask {
  const [a, b] = pickEvents(2);
  // two distinct day slots, in time order
  const pairs: Array<[When, When]> = [["yesterday", "today"], ["yesterday", "tomorrow"], ["today", "tomorrow"]];
  const [w1, w2] = pairs[randInt(pairs.length)]!;
  const slots: TimeTask["slots"] = [
    { when: w1, label: a!.label, icon: a!.icon },
    { when: w2, label: b!.label, icon: b!.icon },
  ];
  const first = [...slots].sort((x, y) => WHEN_ORDER[x.when] - WHEN_ORDER[y.when])[0]!;
  return {
    kind: "timeSequence",
    scene: "before",
    prompt: "Which event happened first?",
    speakText: "Look at the timeline. Which event happened first?",
    badgeLabel: "What Came First?",
    slots,
    textOptions: shuffle(slots.map((s) => s.label)),
    correctTextOption: first.label,
    feedback: { correct: `Yes — ${first.label} came first!`, wrong: "The first event is earlier in time — further to the left." },
  };
}

// Activity C — build the timeline (yesterday -> today -> tomorrow)
function buildBuildTask(): TimeTask {
  const [a, b, c] = pickEvents(3);
  const buildItems = [
    { label: a!.label, icon: a!.icon, when: "yesterday" as When },
    { label: b!.label, icon: b!.icon, when: "today" as When },
    { label: c!.label, icon: c!.icon, when: "tomorrow" as When },
  ];
  return {
    kind: "timeSequence",
    scene: "build",
    prompt: "Build the timeline in order.",
    speakText: "Put the events in order. Tap yesterday first, then today, then tomorrow.",
    badgeLabel: "Build the Timeline",
    buildItems: shuffle(buildItems),
    orderedWhen: ["yesterday", "today", "tomorrow"],
    feedback: { correct: "Perfect — yesterday, today, then tomorrow!", wrong: "Start with yesterday, then today, then tomorrow." },
  };
}

// Meaning (quiz): what does yesterday mean?
function buildMeaningTask(): TimeTask {
  return {
    kind: "timeSequence",
    scene: "meaning",
    prompt: "What does yesterday mean?",
    speakText: "What does yesterday mean?",
    badgeLabel: "What Does It Mean?",
    textOptions: shuffle(["The day before today", "The day after today", "A week ago"]),
    correctTextOption: "The day before today",
    feedback: { correct: "Yes — yesterday is the day before today!", wrong: "Yesterday is the day before today." },
  };
}

export function generateY1MeasurelandsWeek7Lesson1Task(
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
  if (rotation === "A") return buildWhichTask();
  if (rotation === "B") return buildBeforeTask();
  return buildBuildTask();
}

export function resetY1MeasurelandsWeek7Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 7 weekly quiz (Lesson 1's contribution):
// which (yesterday), meaning, which-first, build, identify yesterday.
export function buildY1MeasurelandsWeek7Lesson1QuizTasks(): PracticeTask[] {
  return [
    buildWhichTask("yesterday"),
    buildMeaningTask(),
    buildBeforeTask(),
    buildBuildTask(),
    buildWhichTask("yesterday"),
  ];
}
