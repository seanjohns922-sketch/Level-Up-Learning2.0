import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { WEEK5_DAYS, nextDay, type DayOfWeek } from "@/data/activities/prepMeasurelands/week5Days";

// ── Measurelands · Level 1 · Week 5 · Lesson 1 — "Days Make a Week" ──
// AC9M1M03: 7 days make a week, and weeks repeat. Ground Level named/ordered the
// days; Level 1 learns the WEEK STRUCTURE and the repeating cycle. Reuses the
// Ground Level day cards (no new art).
//   A — Build the Week     (scene "build", order the 7 days Mon→Sun)
//   B — How Many Days?     (scene "count", MCQ: 7)
//   C — What Comes Next?   (scene "next",  the cycle wraps Sunday→Monday)

type WeekTask = Extract<PracticeTask, { kind: "weekCycle" }>;

const toCard = (d: DayOfWeek) => ({ id: d.id, imageSrc: d.imageSrc, label: d.label });
const ORDERED_IDS = WEEK5_DAYS.map((d) => d.id);

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
    prompt: "Seven days make a week.",
    speakText:
      "Professor Gauge has reached Calendar Grove! A week is made of seven days, from Monday to Sunday. After Sunday, a new week begins — weeks repeat over and over.",
    badgeLabel: "Meazurex Mission",
    teachingDays: WEEK5_DAYS.map(toCard),
    feedback: { correct: "Let's build a week!", wrong: "Let's get ready." },
  };
}

// Activity A — build the week (order Monday → Sunday).
function buildBuildTask(): WeekTask {
  return {
    kind: "weekCycle",
    scene: "build",
    prompt: "Build one complete week.",
    speakText: "Tap the days in order to build a week, starting with Monday.",
    badgeLabel: "Build the Week",
    items: shuffle(WEEK5_DAYS.map(toCard)),
    orderedIds: ORDERED_IDS,
    feedback: { correct: "Monday to Sunday — a whole week!", wrong: "Start with Monday, then go in order." },
  };
}

// Activity B — how many days in a week?
function buildCountTask(): WeekTask {
  return {
    kind: "weekCycle",
    scene: "count",
    prompt: "How many days are in one week?",
    speakText: "How many days are in one week?",
    badgeLabel: "How Many Days?",
    items: WEEK5_DAYS.map(toCard),
    options: shuffle([5, 7, 10]),
    correctAnswer: 7,
    feedback: { correct: "Yes — seven days make a week!", wrong: "Count the days: there are seven." },
  };
}

// Activity C — what comes next? (cycle wraps Sunday → Monday).
function buildNextTask(forceIndex?: number): WeekTask {
  const i = forceIndex ?? randInt(7);
  const prev = WEEK5_DAYS[(i + 6) % 7]!;
  const cur = WEEK5_DAYS[i]!;
  const answer = nextDay(i);
  const distractors = shuffle(WEEK5_DAYS.filter((d) => d.id !== answer.id && d.id !== cur.id)).slice(0, 2);
  return {
    kind: "weekCycle",
    scene: "next",
    prompt: i === 6 ? "What comes after Sunday?" : "What comes next?",
    speakText: i === 6 ? "What day comes after Sunday?" : "Which day comes next?",
    badgeLabel: "What Comes Next?",
    sequence: [toCard(prev), toCard(cur)],
    choices: shuffle([toCard(answer), ...distractors.map(toCard)]),
    correctOptionId: answer.id,
    feedback: { correct: "Yes — the week keeps going!", wrong: "Remember the order. After Sunday, Monday begins again." },
  };
}

// Quiz — which day is missing from the week strip?
function buildMissingTask(): WeekTask {
  const m = randInt(7);
  const missing = WEEK5_DAYS[m]!;
  const strip = WEEK5_DAYS.map((d) => (d.id === missing.id ? null : toCard(d)));
  const distractors = shuffle(WEEK5_DAYS.filter((d) => d.id !== missing.id)).slice(0, 2);
  return {
    kind: "weekCycle",
    scene: "missing",
    prompt: "Which day is missing?",
    speakText: "Look at the week. Which day is missing?",
    badgeLabel: "Missing Day",
    strip,
    choices: shuffle([toCard(missing), ...distractors.map(toCard)]),
    correctOptionId: missing.id,
    feedback: { correct: "You found the missing day!", wrong: "Say the days in order to find the gap." },
  };
}

// Quiz — which group shows one full week?
function buildWhichWeekTask(): WeekTask {
  const full = { id: "full", days: WEEK5_DAYS.map(toCard) };
  const weekdaysOnly = { id: "weekdays", days: WEEK5_DAYS.filter((d) => !d.isWeekend).map(toCard) };
  const dropId = WEEK5_DAYS[randInt(7)]!.id;
  const missingOne = { id: "missing", days: WEEK5_DAYS.filter((d) => d.id !== dropId).map(toCard) };
  return {
    kind: "weekCycle",
    scene: "whichWeek",
    prompt: "Which group shows one full week?",
    speakText: "A full week has all seven days. Which group shows one full week?",
    badgeLabel: "Find a Full Week",
    groups: shuffle([full, weekdaysOnly, missingOne]),
    correctOptionId: "full",
    feedback: { correct: "That's a full week — all seven days!", wrong: "A full week has all seven days, Monday to Sunday." },
  };
}

export function generateY1MeasurelandsWeek5Lesson1Task(
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
  if (rotation === "A") return buildBuildTask();
  if (rotation === "B") return buildCountTask();
  return buildNextTask();
}

export function resetY1MeasurelandsWeek5Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 5 weekly quiz (Lesson 1's contribution):
// how many days, build a week, after Sunday, full week, missing day.
export function buildY1MeasurelandsWeek5Lesson1QuizTasks(): PracticeTask[] {
  return [
    buildCountTask(),
    buildBuildTask(),
    buildNextTask(6), // after Sunday → Monday
    buildWhichWeekTask(),
    buildMissingTask(),
  ];
}
