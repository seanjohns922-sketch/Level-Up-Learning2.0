import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 7 · Lesson 2 — "Today" ──
// AC9M1M03: describe and sequence events in time. Today = the day happening now,
// between yesterday (already happened) and tomorrow (not yet). Time language on a
// Yesterday -> TODAY -> Tomorrow timeline; Today is always highlighted.
//   A — What Happens Today?  (3-event timeline; pick today's event)
//   B — Sort the Events      (drop events into yesterday/today/tomorrow columns)
//   C — Build My Timeline    (tap events into chronological order)
// + meaning (quiz): "what does today mean?"

type TimeTask = Extract<PracticeTask, { kind: "timeSequence" }>;
type When = "yesterday" | "today" | "tomorrow";
const WHENS: When[] = ["yesterday", "today", "tomorrow"];

const EVENTS = [
  { label: "School", icon: "school" },
  { label: "Soccer", icon: "soccer" },
  { label: "Swimming", icon: "swimming" },
  { label: "Birthday", icon: "birthday" },
  { label: "Art Day", icon: "art" },
  { label: "Excursion", icon: "excursion" },
  { label: "Celebration", icon: "celebration" },
  { label: "Family Visit", icon: "family" },
];

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
// which, sort, build, which, sort, build
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "B", "C"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
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
// Three distinct events, one per day (yesterday/today/tomorrow).
function dayItems() {
  const [a, b, c] = pickEvents(3);
  return [
    { label: a!.label, icon: a!.icon, when: "yesterday" as When },
    { label: b!.label, icon: b!.icon, when: "today" as When },
    { label: c!.label, icon: c!.icon, when: "tomorrow" as When },
  ];
}

function buildIntroTask(): TimeTask {
  return {
    kind: "timeSequence",
    scene: "intro",
    prompt: "Today is happening right now.",
    speakText:
      "Today is happening right now. Yesterday already happened. Tomorrow has not happened yet. We go to school today. We learn today. We play today.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's find today!", wrong: "Let's get ready." },
  };
}

// Activity A — which event happens today? (3-event timeline)
function buildWhichTask(askWhen: When = "today"): TimeTask {
  const items = dayItems();
  const slots: TimeTask["slots"] = items.map((it) => ({ when: it.when, label: it.label, icon: it.icon }));
  const answer = slots.find((s) => s.when === askWhen)!;
  const word = askWhen === "yesterday" ? "yesterday" : askWhen === "tomorrow" ? "tomorrow" : "today";
  return {
    kind: "timeSequence",
    scene: "which",
    prompt: `Which event happens ${word}?`,
    speakText: `Look at the timeline. Which event happens ${word}?`,
    badgeLabel: "What Happens Today?",
    slots,
    askWhen,
    textOptions: shuffle(slots.map((s) => s.label)),
    correctTextOption: answer.label,
    feedback: { correct: `Yes — ${answer.label} happens ${word}!`, wrong: "Today is the day happening now — the highlighted middle of the timeline." },
  };
}

// Activity B — sort events into yesterday/today/tomorrow columns
function buildSortTask(): TimeTask {
  return {
    kind: "timeSequence",
    scene: "sort",
    prompt: "Sort each event into the right day.",
    speakText: "Sort the events. Put each one into yesterday, today, or tomorrow.",
    badgeLabel: "Sort the Events",
    buildItems: shuffle(dayItems()),
    orderedWhen: WHENS,
    feedback: { correct: "All sorted — yesterday, today and tomorrow!", wrong: "Look at when each event happens, then tap its day." },
  };
}

// Activity C — build my timeline (yesterday -> today -> tomorrow)
function buildBuildTask(): TimeTask {
  return {
    kind: "timeSequence",
    scene: "build",
    prompt: "Build the timeline in order.",
    speakText: "Put the events in order. Tap yesterday first, then today, then tomorrow.",
    badgeLabel: "Build My Timeline",
    buildItems: shuffle(dayItems()),
    orderedWhen: WHENS,
    feedback: { correct: "Perfect — yesterday, today, then tomorrow!", wrong: "Start with yesterday, then today, then tomorrow." },
  };
}

// Meaning (quiz): what does today mean?
function buildMeaningTask(): TimeTask {
  return {
    kind: "timeSequence",
    scene: "meaning",
    prompt: "What does today mean?",
    speakText: "What does today mean?",
    badgeLabel: "What Does It Mean?",
    textOptions: shuffle(["Happening right now", "Happened yesterday", "Happens tomorrow"]),
    correctTextOption: "Happening right now",
    feedback: { correct: "Yes — today is happening right now!", wrong: "Today is the day happening right now." },
  };
}

export function generateY1MeasurelandsWeek7Lesson2Task(
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
  if (rotation === "A") return buildWhichTask("today");
  if (rotation === "B") return buildSortTask();
  return buildBuildTask();
}

export function resetY1MeasurelandsWeek7Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 7 weekly quiz (Lesson 2's contribution):
// which (today), meaning, sort, which (today), build.
export function buildY1MeasurelandsWeek7Lesson2QuizTasks(): PracticeTask[] {
  return [
    buildWhichTask("today"),
    buildMeaningTask(),
    buildSortTask(),
    buildWhichTask("today"),
    buildBuildTask(),
  ];
}
