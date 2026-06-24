import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 7 · Lesson 3 — "Tomorrow" ──
// AC9M1M03: describe and sequence events in time. Tomorrow = the day after today;
// it has not happened yet. Same Yesterday -> Today -> TOMORROW timeline, with a
// glowing future "?" tile for prediction. Plan the future.
//   A — What Happens Tomorrow?  (3-event timeline; pick tomorrow's event)
//   B — What Comes Next?        (yesterday/today shown; predict tomorrow)
//   C — Plan Tomorrow           (today shown; choose what happens tomorrow)
// + meaning (quiz): "what does tomorrow mean?"

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
// which, next-predict, plan, which, next-predict, plan
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
    prompt: "Tomorrow comes after today.",
    speakText:
      "Tomorrow has not happened yet. We can think about what we might do tomorrow. Tomorrow is the day after today. Yesterday, today, tomorrow!",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's plan tomorrow!", wrong: "Let's get ready." },
  };
}

// Activity A — which event happens tomorrow? (3-event timeline)
function buildWhichTask(askWhen: When = "tomorrow"): TimeTask {
  const items = dayItems();
  const slots: TimeTask["slots"] = items.map((it) => ({ when: it.when, label: it.label, icon: it.icon }));
  const answer = slots.find((s) => s.when === askWhen)!;
  const word = askWhen === "yesterday" ? "yesterday" : askWhen === "today" ? "today" : "tomorrow";
  return {
    kind: "timeSequence",
    scene: "which",
    prompt: `Which event happens ${word}?`,
    speakText: `Look at the timeline. Which event happens ${word}?`,
    badgeLabel: "What Happens Tomorrow?",
    slots,
    askWhen,
    textOptions: shuffle(slots.map((s) => s.label)),
    correctTextOption: answer.label,
    feedback: { correct: `Yes — ${answer.label} happens ${word}!`, wrong: "Tomorrow is after today — the last spot on the timeline." },
  };
}

// Activities B & C — predict tomorrow. "predict": show yesterday + today.
// "plan": show today only. Options are 3 events not on the timeline; correct is
// the one that happens tomorrow.
function buildNextTask(mode: "predict" | "plan"): TimeTask {
  const shownCount = mode === "predict" ? 2 : 1;
  const all = pickEvents(shownCount + 3);
  const shown = all.slice(0, shownCount);
  const optionEvents = all.slice(shownCount); // 3 distinct, not on the timeline
  const slots: TimeTask["slots"] =
    mode === "predict"
      ? [
          { when: "yesterday", label: shown[0]!.label, icon: shown[0]!.icon },
          { when: "today", label: shown[1]!.label, icon: shown[1]!.icon },
        ]
      : [{ when: "today", label: shown[0]!.label, icon: shown[0]!.icon }];
  const answer = optionEvents[0]!; // the tomorrow event
  const buildItems = optionEvents.map((e, i) => ({ label: e.label, icon: e.icon, when: (i === 0 ? "tomorrow" : "today") as When }));
  return {
    kind: "timeSequence",
    scene: "next",
    prompt: mode === "predict" ? "What comes next?" : "Choose what happens tomorrow.",
    speakText: mode === "predict" ? "Yesterday, then today. What comes next, tomorrow?" : "Today is shown. Choose what happens tomorrow.",
    badgeLabel: mode === "predict" ? "What Comes Next?" : "Plan Tomorrow",
    slots,
    buildItems: shuffle(buildItems),
    textOptions: shuffle(optionEvents.map((e) => e.label)),
    correctTextOption: answer.label,
    feedback: { correct: `Yes — ${answer.label} comes next, tomorrow!`, wrong: "Tomorrow comes after today. Pick the next event." },
  };
}

// Activity C2 — build the timeline (for the quiz; tap into chronological order)
function buildBuildTask(): TimeTask {
  return {
    kind: "timeSequence",
    scene: "build",
    prompt: "Build the timeline in order.",
    speakText: "Put the events in order. Tap yesterday first, then today, then tomorrow.",
    badgeLabel: "Build the Timeline",
    buildItems: shuffle(dayItems()),
    orderedWhen: WHENS,
    feedback: { correct: "Perfect — yesterday, today, then tomorrow!", wrong: "Start with yesterday, then today, then tomorrow." },
  };
}

// Meaning (quiz): what does tomorrow mean?
function buildMeaningTask(): TimeTask {
  return {
    kind: "timeSequence",
    scene: "meaning",
    prompt: "What does tomorrow mean?",
    speakText: "What does tomorrow mean?",
    badgeLabel: "What Does It Mean?",
    textOptions: shuffle(["The day after today", "The day before today", "A week ago"]),
    correctTextOption: "The day after today",
    feedback: { correct: "Yes — tomorrow is the day after today!", wrong: "Tomorrow is the day after today." },
  };
}

export function generateY1MeasurelandsWeek7Lesson3Task(
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
  if (rotation === "A") return buildWhichTask("tomorrow");
  if (rotation === "B") return buildNextTask("predict");
  return buildNextTask("plan");
}

export function resetY1MeasurelandsWeek7Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 7 weekly quiz (Lesson 3's contribution):
// which (tomorrow), meaning, what comes next, build, identify tomorrow.
export function buildY1MeasurelandsWeek7Lesson3QuizTasks(): PracticeTask[] {
  return [
    buildWhichTask("tomorrow"),
    buildMeaningTask(),
    buildNextTask("predict"),
    buildBuildTask(),
    buildWhichTask("tomorrow"),
  ];
}
