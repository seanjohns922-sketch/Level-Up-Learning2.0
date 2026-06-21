import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  WEEK4_ACTIVITIES,
  type DurationActivity,
} from "@/data/activities/prepMeasurelands/week4Activities";

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastSetId: string | null;
};

type RoutineSet = {
  setId: string;
  items: DurationActivity[];
};

type ScenarioSet = {
  setId: string;
  prompt: string;
  speakText: string;
  options: DurationActivity[];
  correctId: string;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];
const ACCENTS: Accent[] = ["sky", "teal", "violet", "gold", "rose", "leaf"];

const A = WEEK4_ACTIVITIES;

const QUICK_SLOW_POOL: DurationActivity[] = [
  A.washHands,
  A.shoes,
  A.brushTeeth,
  A.sandcastle,
  A.movie,
  A.sleeping,
];

const ROUTINE_SETS: RoutineSet[] = [
  {
    setId: "brush-shoes-travel",
    items: [A.brushTeeth, A.shoes, A.travel],
  },
  {
    setId: "wash-lunch-movie",
    items: [A.washHands, A.lunch, A.movie],
  },
  {
    setId: "drawing-lunch-sleep",
    items: [A.drawing, A.lunch, A.sleeping],
  },
];

const SCENARIO_SETS: ScenarioSet[] = [
  {
    setId: "short-before-school",
    prompt: "You only have a short time before school. Which activity is best?",
    speakText: "You only have a short time before school. Which activity is best?",
    options: [A.movie, A.washHands, A.sleeping],
    correctId: A.washHands.id,
  },
  {
    setId: "lots-of-free-time",
    prompt: "You have lots of free time. Which activity is best?",
    speakText: "You have lots of free time. Which activity is best?",
    options: [A.movie, A.shoes, A.washHands],
    correctId: A.movie.id,
  },
  {
    setId: "quick-before-dinner",
    prompt: "You need something quick before dinner. Which activity is best?",
    speakText: "You need something quick before dinner. Which activity is best?",
    options: [A.sleeping, A.brushTeeth, A.movie],
    correctId: A.brushTeeth.id,
  },
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastSetId: null };
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

function chooseWithoutRepeat<T extends { setId: string }>(pool: T[], memory: LessonMemory): T {
  let picked = choose(pool);
  let guard = 0;
  while (picked.setId === memory.lastSetId && guard++ < 20) {
    picked = choose(pool);
  }
  memory.lastSetId = picked.setId;
  return picked;
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

function toTeachingObj(activity: DurationActivity, accent: Accent) {
  return {
    label: activity.label,
    icon: "",
    imageSrc: activity.imageSrc,
    compareValue: activity.durationValue,
    axis: "duration" as const,
    accent,
  };
}

const TEACHING_MOMENTS: NonNullable<CompareTask["teachingMoments"]> = [
  {
    id: "wash-brush-sleep",
    title: "Quick and Slow",
    objects: [
      toTeachingObj(A.washHands, "sky"),
      toTeachingObj(A.brushTeeth, "teal"),
      toTeachingObj(A.sleeping, "gold"),
    ],
    left: toTeachingObj(A.washHands, "sky"),
    right: toTeachingObj(A.sleeping, "gold"),
    narration: "Washing hands is quick. Sleeping is slow.",
  },
  {
    id: "wash-lunch-movie",
    title: "Put the Activities in Order",
    objects: [
      toTeachingObj(A.washHands, "leaf"),
      toTeachingObj(A.lunch, "violet"),
      toTeachingObj(A.movie, "rose"),
    ],
    left: toTeachingObj(A.washHands, "leaf"),
    right: toTeachingObj(A.movie, "rose"),
    narration: "Start with the activity that takes the shortest time. End with the one that takes the longest time.",
  },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let’s talk about quick and slow activities!",
    speakText:
      "Professor Gauge says some activities are quick. Some activities are slow. We can think about which activities take a short time and which activities take a long time.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "Some activities are quick.",
      "Some activities are slow.",
      "We can think about which activities take a short time and which activities take a long time.",
    ],
    objects: [],
    teachingMoments: TEACHING_MOMENTS,
    correctOptionId: "continue",
    feedback: { correct: "Let's begin!", wrong: "Let's get ready." },
  };
}

function buildQuickSlowTask(memory: LessonMemory): CompareTask {
  let activity = choose(QUICK_SLOW_POOL);
  let guard = 0;
  while (activity.id === memory.lastSetId && guard++ < 20) {
    activity = choose(QUICK_SLOW_POOL);
  }
  memory.lastSetId = activity.id;
  const isQuick = activity.durationValue <= 3;
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "Quick or slow?",
    speakText: `Is ${activity.label.toLowerCase()} quick or slow?`,
    badgeLabel: "Quick or Slow?",
    objects: [toActObj(activity, choose(ACCENTS))],
    bins: [
      { id: "quick", label: "Quick", icon: "quick" },
      { id: "slow", label: "Slow", icon: "slow" },
    ],
    correctOptionId: isQuick ? "quick" : "slow",
    feedback: {
      correct: isQuick ? "Yes! That is quick." : "Yes! That is slow.",
      wrong: "Think about how long it usually takes.",
    },
  };
}

function buildRoutineOrderTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(ROUTINE_SETS, memory);
  const accents = shuffle(ACCENTS).slice(0, set.items.length);
  const ordered = set.items
    .slice()
    .sort((a, b) => a.durationValue - b.durationValue)
    .map((item, index) => toActObj(item, accents[index]!, `-routine-${index}`));
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the routine in order.",
    speakText: "Put the routine in order. What happens first, next, and last?",
    badgeLabel: "What Happens First?",
    objects: shuffle(ordered),
    orderedIds: ordered.map((item) => item.id),
    orderLabels: ["First", "Next", "Last"],
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: {
      correct: "Great ordering!",
      wrong: "Think about what would happen first, then next, then last.",
    },
  };
}

function buildBestActivityTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(SCENARIO_SETS, memory);
  const accents = shuffle(ACCENTS).slice(0, set.options.length);
  const objects = set.options.map((item, index) => toActObj(item, accents[index]!, `-scenario-${index}`));
  const correct = objects.find((item) => item.id.startsWith(set.correctId)) ?? objects[0]!;
  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: set.prompt,
    speakText: set.speakText,
    badgeLabel: "Choose the Best Activity",
    objects: shuffle(objects),
    correctOptionId: correct.id,
    feedback: {
      correct: "Good choice!",
      wrong: "Think about which activity matches the time you have.",
    },
  };
}

export function buildMeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  const q1 = [
    toActObj(A.washHands, "sky", "-q1a"),
    toActObj(A.movie, "gold", "-q1b"),
    toActObj(A.sleeping, "violet", "-q1c"),
  ];
  const q2 = [
    toActObj(A.brushTeeth, "teal", "-q2a"),
    toActObj(A.sandcastle, "rose", "-q2b"),
    toActObj(A.sleeping, "gold", "-q2c"),
  ];
  const q3 = [
    toActObj(A.brushTeeth, "leaf", "-q3a"),
    toActObj(A.shoes, "sky", "-q3b"),
    toActObj(A.travel, "violet", "-q3c"),
  ];
  const q4 = [
    toActObj(A.washHands, "sky", "-q4a"),
    toActObj(A.lunch, "teal", "-q4b"),
    toActObj(A.movie, "gold", "-q4c"),
  ];
  const q5 = [
    toActObj(A.movie, "rose", "-q5a"),
    toActObj(A.washHands, "leaf", "-q5b"),
    toActObj(A.sleeping, "violet", "-q5c"),
  ];

  return [
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which activity is quick?",
      speakText: "Which activity is quick?",
      badgeLabel: "Duration Quiz",
      objects: shuffle(q1),
      correctOptionId: "wash-hands-q1a",
      feedback: { correct: "Yes!", wrong: "Look for the quickest activity." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which activity is slow?",
      speakText: "Which activity is slow?",
      badgeLabel: "Duration Quiz",
      objects: shuffle(q2),
      correctOptionId: "sleeping-q2c",
      feedback: { correct: "Yes!", wrong: "Look for the activity that takes the longest time." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "What happens first?",
      speakText: "What happens first?",
      badgeLabel: "Duration Quiz",
      objects: shuffle(q3),
      correctOptionId: "shoes-q3b",
      feedback: { correct: "Yes!", wrong: "Look for the activity that would happen first." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "What happens last?",
      speakText: "What happens last?",
      badgeLabel: "Duration Quiz",
      objects: shuffle(q4),
      correctOptionId: "movie-q4c",
      feedback: { correct: "Yes!", wrong: "Look for the activity that would happen last." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "You only have a short time. Which activity is best?",
      speakText: "You only have a short time. Which activity is best?",
      badgeLabel: "Duration Quiz",
      objects: shuffle(q5),
      correctOptionId: "wash-hands-q5b",
      feedback: { correct: "Good choice!", wrong: "Pick the activity that takes the least time." },
    },
  ];
}

export function generatePrepMeasurelandsWeek4Lesson3Task(
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

  if (rotation === "A") return buildQuickSlowTask(memory);
  if (rotation === "B") return buildRoutineOrderTask(memory);
  return buildBestActivityTask(memory);
}

export function resetPrepMeasurelandsWeek4Lesson3TaskSessionState() {
  lessonMemory.clear();
}
