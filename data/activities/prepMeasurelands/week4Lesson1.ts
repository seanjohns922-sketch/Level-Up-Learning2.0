import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  WEEK4_ACTIVITIES,
  WEEK4_ACTIVITY_LIST,
  type DurationActivity,
} from "@/data/activities/prepMeasurelands/week4Activities";

// ── Measurelands · Ground Level · Week 4 · Lesson 1 — "Which Takes Longer?" ──
// Foundation Measurement (AC9MFM01): compare the duration of familiar events
// using everyday language — longer / shorter / takes more time / takes less
// time / quick / slow. Duration is experienced, not measured (no clocks/timers).
// Reuses the shared measurementCompare scenes (axis "duration", image-only):
//   A — Which Takes Longer?   (pair)
//   B — Which Takes Less Time? (pair)
//   C — Quick or Slow?        (sort, two bins)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

// Compare pairs must differ by at least this much so the answer is obvious.
const MIN_GAP = 4;
// Quick = clearly short, Slow = clearly long. The murky middle is never sorted.
const QUICK_MAX = 3;
const SLOW_MIN = 7;

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastPairId: string | null;
  lastSortId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "B", "C"];
const ACCENTS: Accent[] = ["sky", "teal", "violet", "gold", "rose", "leaf"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastPairId: null, lastSortId: null };
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

function toActObj(activity: DurationActivity, accent: Accent, suffix = ""): MObj {
  return {
    id: `${activity.id}${suffix}`,
    label: activity.label,
    icon: "",
    imageSrc: activity.imageSrc,
    compareValue: activity.durationValue,
    axis: "duration",
    accent,
  };
}

function pairId(a: DurationActivity, b: DurationActivity) {
  return [a.id, b.id].sort().join("+");
}

// Pick two activities whose duration ranks differ by at least MIN_GAP.
function pickComparePair(memory: LessonMemory): [DurationActivity, DurationActivity] {
  let a = choose(WEEK4_ACTIVITY_LIST);
  let b = choose(WEEK4_ACTIVITY_LIST);
  let guard = 0;
  while (
    (Math.abs(a.durationValue - b.durationValue) < MIN_GAP || pairId(a, b) === memory.lastPairId) &&
    guard++ < 80
  ) {
    a = choose(WEEK4_ACTIVITY_LIST);
    b = choose(WEEK4_ACTIVITY_LIST);
  }
  memory.lastPairId = pairId(a, b);
  return [a, b];
}

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's find which things take longer!",
    speakText:
      "Professor Gauge says some things take a short time, and some things take a long time. Watching a movie takes longer than tying your shoes. Let's compare how long things take in the Duration Dunes.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "Some things take a short time.",
      "Some things take a long time.",
      "Watching a movie takes longer than putting on shoes.",
      "Let's compare how long things take!",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's start comparing!", wrong: "Let's get ready." },
  };
}

// ── Activity A — Which Takes Longer? (pair) ─────────────────────────────────
function buildLongerTask(memory: LessonMemory): CompareTask {
  const [a, b] = pickComparePair(memory);
  const longer = a.durationValue > b.durationValue ? a : b;
  const accents = shuffle(ACCENTS);
  return {
    kind: "measurementCompare",
    scene: "pair",
    prompt: "Which takes longer?",
    speakText: "Which one takes longer?",
    badgeLabel: "Takes Longer?",
    objects: shuffle([toActObj(a, accents[0]!), toActObj(b, accents[1]!)]),
    correctOptionId: longer.id,
    feedback: {
      correct: `Yes! ${longer.label} takes longer.`,
      wrong: "Think about which one takes more time.",
    },
  };
}

// ── Activity B — Which Takes Less Time? (pair) ──────────────────────────────
function buildLessTimeTask(memory: LessonMemory): CompareTask {
  const [a, b] = pickComparePair(memory);
  const shorter = a.durationValue < b.durationValue ? a : b;
  const accents = shuffle(ACCENTS);
  return {
    kind: "measurementCompare",
    scene: "pair",
    prompt: "Which takes less time?",
    speakText: "Which one takes less time?",
    badgeLabel: "Takes Less Time?",
    objects: shuffle([toActObj(a, accents[0]!), toActObj(b, accents[1]!)]),
    correctOptionId: shorter.id,
    feedback: {
      correct: `Yes! ${shorter.label} takes less time.`,
      wrong: "Think about which one is quicker.",
    },
  };
}

// ── Activity C — Quick or Slow? (sort) ──────────────────────────────────────
function buildQuickSlowTask(memory: LessonMemory): CompareTask {
  const clear = WEEK4_ACTIVITY_LIST.filter(
    (v) => v.durationValue <= QUICK_MAX || v.durationValue >= SLOW_MIN,
  );
  let activity = choose(clear);
  let guard = 0;
  while (activity.id === memory.lastSortId && guard++ < 20) {
    activity = choose(clear);
  }
  memory.lastSortId = activity.id;
  const isQuick = activity.durationValue <= QUICK_MAX;
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "Quick or slow?",
    speakText: `Does ${activity.label.toLowerCase()} take a quick time or a slow time?`,
    badgeLabel: "Quick or Slow?",
    objects: [toActObj(activity, choose(ACCENTS))],
    bins: [
      { id: "quick", label: "Quick", icon: "quick" },
      { id: "slow", label: "Slow", icon: "slow" },
    ],
    correctOptionId: isQuick ? "quick" : "slow",
    feedback: {
      correct: isQuick ? "Yes! That is quick." : "Yes! That is slow.",
      wrong: "Think about how long it takes.",
    },
  };
}

export function buildMeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  const A = WEEK4_ACTIVITIES;
  return [
    // 1 — which takes longer (pair)
    {
      kind: "measurementCompare",
      scene: "pair",
      prompt: "Which takes longer?",
      speakText: "Which one takes longer?",
      badgeLabel: "Takes Longer?",
      objects: shuffle([toActObj(A.washHands, "sky", "-q1a"), toActObj(A.movie, "gold", "-q1b")]),
      correctOptionId: "movie-q1b",
      feedback: { correct: "Yes!", wrong: "Think about which takes more time." },
    },
    // 2 — which takes less time (pair)
    {
      kind: "measurementCompare",
      scene: "pair",
      prompt: "Which takes less time?",
      speakText: "Which one takes less time?",
      badgeLabel: "Takes Less Time?",
      objects: shuffle([toActObj(A.lunch, "violet", "-q2a"), toActObj(A.washHands, "teal", "-q2b")]),
      correctOptionId: "wash-hands-q2b",
      feedback: { correct: "Yes!", wrong: "Think about which is quicker." },
    },
    // 3 — longest of three (trio)
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which takes the longest?",
      speakText: "Which one takes the longest?",
      badgeLabel: "Takes Longest?",
      objects: shuffle([
        toActObj(A.shoes, "rose", "-q3a"),
        toActObj(A.reading, "leaf", "-q3b"),
        toActObj(A.sleeping, "gold", "-q3c"),
      ]),
      correctOptionId: "sleeping-q3c",
      feedback: { correct: "Great!", wrong: "Look for the one that takes the most time." },
    },
    // 4 — shortest of three (trio)
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which takes the shortest time?",
      speakText: "Which one takes the shortest time?",
      badgeLabel: "Takes Shortest?",
      objects: shuffle([
        toActObj(A.washHands, "sky", "-q4a"),
        toActObj(A.lunch, "violet", "-q4b"),
        toActObj(A.movie, "gold", "-q4c"),
      ]),
      correctOptionId: "wash-hands-q4a",
      feedback: { correct: "Great!", wrong: "Look for the quickest one." },
    },
    // 5 — longer pair (pair)
    {
      kind: "measurementCompare",
      scene: "pair",
      prompt: "Which takes longer?",
      speakText: "Which one takes longer?",
      badgeLabel: "Takes Longer?",
      objects: shuffle([toActObj(A.brushTeeth, "teal", "-q5a"), toActObj(A.sandcastle, "gold", "-q5b")]),
      correctOptionId: "sandcastle-q5b",
      feedback: { correct: "Yes!", wrong: "Think about which takes more time." },
    },
  ];
}

export function generatePrepMeasurelandsWeek4Lesson1Task(
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

  if (rotation === "A") return buildLongerTask(memory);
  if (rotation === "B") return buildLessTimeTask(memory);
  return buildQuickSlowTask(memory);
}

export function resetPrepMeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}
