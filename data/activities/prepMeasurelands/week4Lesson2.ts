import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  WEEK4_ACTIVITIES,
  type DurationActivity,
} from "@/data/activities/prepMeasurelands/week4Activities";

// ── Measurelands · Ground Level · Week 4 · Lesson 2 — "Order the Activities" ──
// Foundation Measurement: order familiar activities by duration using quickest,
// longest, holds more/less time, and shorter/longer duration language.
// Reuses shared duration scenes (axis "duration", illustration-first):
//   A — Quickest to Longest (order 3)
//   B — What Comes Next?    (sequence)
//   C — Build the Time Trail (order 4)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastSetId: string | null;
};

type ActivitySet = {
  setId: string;
  items: DurationActivity[];
};

type SequenceSet = {
  setId: string;
  prefix: DurationActivity[];
  correct: DurationActivity;
  distractors: DurationActivity[];
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];
const ACCENTS: Accent[] = ["sky", "teal", "violet", "gold", "rose", "leaf"];

const A = WEEK4_ACTIVITIES;

// Only use obvious duration gaps. Avoid direct ambiguous pairs like
// washing hands vs brushing teeth, drawing vs reading, and reading vs lunch.
const ORDER3_SETS: ActivitySet[] = [
  {
    setId: "wash-lunch-sleep",
    items: [A.washHands, A.lunch, A.sleeping],
  },
  {
    setId: "shoes-drawing-movie",
    items: [A.shoes, A.drawing, A.movie],
  },
  {
    setId: "brush-sandcastle-sleep",
    items: [A.brushTeeth, A.sandcastle, A.sleeping],
  },
  {
    setId: "wash-drawing-sleep",
    items: [A.washHands, A.drawing, A.sleeping],
  },
];

const ORDER4_SETS: ActivitySet[] = [
  {
    setId: "shoes-drawing-travel-sleep",
    items: [A.shoes, A.drawing, A.travel, A.sleeping],
  },
  {
    setId: "wash-lunch-movie-sleep",
    items: [A.washHands, A.lunch, A.movie, A.sleeping],
  },
  {
    setId: "wash-drawing-sandcastle-sleep",
    items: [A.washHands, A.drawing, A.sandcastle, A.sleeping],
  },
  {
    setId: "shoes-lunch-movie-sleep",
    items: [A.shoes, A.lunch, A.movie, A.sleeping],
  },
];

const SEQUENCE_SETS: SequenceSet[] = [
  {
    setId: "wash-lunch-movie",
    prefix: [A.washHands, A.lunch],
    correct: A.movie,
    distractors: [A.brushTeeth, A.sleeping],
  },
  {
    setId: "shoes-drawing-travel",
    prefix: [A.shoes, A.drawing],
    correct: A.travel,
    distractors: [A.washHands, A.sleeping],
  },
  {
    setId: "brush-sandcastle-sleep",
    prefix: [A.brushTeeth, A.sandcastle],
    correct: A.sleeping,
    distractors: [A.shoes, A.movie],
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

function buildAscendingObjects(set: ActivitySet, suffix = ""): MObj[] {
  const accents = shuffle(ACCENTS).slice(0, set.items.length);
  return set.items
    .slice()
    .sort((a, b) => a.durationValue - b.durationValue)
    .map((item, index) => toActObj(item, accents[index]!, `${suffix}-${index}`));
}

const TEACHING_MOMENTS: NonNullable<CompareTask["teachingMoments"]> = [
  {
    id: "wash-lunch-sleep",
    title: "Quickest to Longest",
    objects: [
      toTeachingObj(A.washHands, "sky"),
      toTeachingObj(A.lunch, "teal"),
      toTeachingObj(A.sleeping, "gold"),
    ],
    left: toTeachingObj(A.washHands, "sky"),
    right: toTeachingObj(A.sleeping, "gold"),
    narration: "Washing hands is quickest. Sleeping is longest.",
  },
  {
    id: "shoes-drawing-movie",
    title: "Keep Comparing the Time",
    objects: [
      toTeachingObj(A.shoes, "leaf"),
      toTeachingObj(A.drawing, "violet"),
      toTeachingObj(A.movie, "rose"),
    ],
    left: toTeachingObj(A.shoes, "leaf"),
    right: toTeachingObj(A.movie, "rose"),
    narration: "Putting on shoes is quicker than drawing. Watching a movie takes longer than both.",
  },
  {
    id: "brush-sandcastle-sleep",
    title: "Find the Longest Activity",
    objects: [
      toTeachingObj(A.brushTeeth, "teal"),
      toTeachingObj(A.sandcastle, "sky"),
      toTeachingObj(A.sleeping, "gold"),
    ],
    left: toTeachingObj(A.brushTeeth, "teal"),
    right: toTeachingObj(A.sleeping, "gold"),
    narration: "Brushing teeth is quick. Sleeping takes the longest time.",
  },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let’s order activities by time!",
    speakText:
      "Professor Gauge says some activities take a short time. Some activities take a long time. We can put them in order from quickest to longest.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "Some activities take a short time.",
      "Some activities take a long time.",
      "We can put them in order from quickest to longest.",
    ],
    objects: [],
    teachingMoments: TEACHING_MOMENTS,
    correctOptionId: "continue",
    feedback: { correct: "Let's start ordering!", wrong: "Let's get ready." },
  };
}

function buildQuickestToLongestTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(ORDER3_SETS, memory);
  const ordered = buildAscendingObjects(set);
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the activities in order: quickest to longest.",
    speakText: "Put the activities in order from quickest to longest.",
    badgeLabel: "Quickest to Longest",
    objects: shuffle(ordered),
    orderedIds: ordered.map((item) => item.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Great ordering!", wrong: "Start with the quickest activity." },
  };
}

function buildWhatComesNextTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(SEQUENCE_SETS, memory);
  const prefixAccents = shuffle(ACCENTS).slice(0, set.prefix.length);
  const prefix = set.prefix.map((item, index) => toActObj(item, prefixAccents[index]!, `-prefix-${index}`));
  const optionAccents = shuffle(ACCENTS).slice(0, 3);
  const correct = toActObj(set.correct, optionAccents[0]!, "-correct");
  const distractorA = toActObj(set.distractors[0]!, optionAccents[1]!, "-dA");
  const distractorB = toActObj(set.distractors[1]!, optionAccents[2]!, "-dB");
  return {
    kind: "measurementCompare",
    scene: "sequence",
    prompt: "Which activity comes next?",
    speakText: "Look at the order. Which activity comes next?",
    badgeLabel: "What Comes Next?",
    sequencePrefix: prefix,
    objects: shuffle([correct, distractorA, distractorB]),
    correctOptionId: correct.id,
    feedback: { correct: "Nice pattern!", wrong: "Look for the next longer activity." },
  };
}

function buildTimeTrailTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(ORDER4_SETS, memory);
  const ordered = buildAscendingObjects(set, "-trail");
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the activities in order: quickest to longest.",
    speakText: "Put the activities in order from quickest to longest.",
    badgeLabel: "Build the Time Trail",
    objects: shuffle(ordered),
    orderedIds: ordered.map((item) => item.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Excellent ordering!", wrong: "Try the quickest activity first." },
  };
}

export function buildMeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  const q1Set = buildAscendingObjects(ORDER3_SETS[0]!, "-q1");
  const q2Set = buildAscendingObjects(ORDER3_SETS[1]!, "-q2");
  const q3Set = buildAscendingObjects(ORDER3_SETS[2]!, "-q3");
  const q4Sequence = SEQUENCE_SETS[0]!;
  const q4Prefix = [
    toActObj(q4Sequence.prefix[0]!, "sky", "-q4p0"),
    toActObj(q4Sequence.prefix[1]!, "teal", "-q4p1"),
  ];
  const q4Correct = toActObj(q4Sequence.correct, "gold", "-q4c");
  const q4DistractorA = toActObj(q4Sequence.distractors[0]!, "rose", "-q4a");
  const q4DistractorB = toActObj(q4Sequence.distractors[1]!, "leaf", "-q4b");
  const q5Set = buildAscendingObjects(ORDER4_SETS[0]!, "-q5");

  return [
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which activity is quickest?",
      speakText: "Which activity is quickest?",
      badgeLabel: "Duration Quiz",
      objects: shuffle([q1Set[0]!, q1Set[1]!, q1Set[2]!]),
      correctOptionId: q1Set[0]!.id,
      feedback: { correct: "Yes!", wrong: "Look for the quickest activity." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which activity is longest?",
      speakText: "Which activity is longest?",
      badgeLabel: "Duration Quiz",
      objects: shuffle([q2Set[0]!, q2Set[1]!, q2Set[2]!]),
      correctOptionId: q2Set[2]!.id,
      feedback: { correct: "Yes!", wrong: "Look for the activity that takes the longest time." },
    },
    {
      kind: "measurementCompare",
      scene: "order",
      prompt: "Put the activities in order: quickest to longest.",
      speakText: "Put the activities in order from quickest to longest.",
      badgeLabel: "Duration Quiz",
      objects: shuffle([q3Set[0]!, q3Set[1]!, q3Set[2]!]),
      orderedIds: [q3Set[0]!.id, q3Set[1]!.id, q3Set[2]!.id],
      correctOptionId: q3Set[2]!.id,
      feedback: { correct: "Great ordering!", wrong: "Start with the quickest activity." },
    },
    {
      kind: "measurementCompare",
      scene: "sequence",
      prompt: "Which activity comes next?",
      speakText: "Which activity comes next?",
      badgeLabel: "Duration Quiz",
      sequencePrefix: q4Prefix,
      objects: shuffle([q4Correct, q4DistractorA, q4DistractorB]),
      correctOptionId: q4Correct.id,
      feedback: { correct: "Nice pattern!", wrong: "Look for the next longer activity." },
    },
    {
      kind: "measurementCompare",
      scene: "order",
      prompt: "Put the activities in order: quickest to longest.",
      speakText: "Put the activities in order from quickest to longest.",
      badgeLabel: "Duration Quiz",
      objects: shuffle(q5Set),
      orderedIds: q5Set.map((item) => item.id),
      correctOptionId: q5Set[3]!.id,
      feedback: { correct: "Excellent ordering!", wrong: "Try the quickest one first." },
    },
  ];
}

export function generatePrepMeasurelandsWeek4Lesson2Task(
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

  if (rotation === "A") return buildQuickestToLongestTask(memory);
  if (rotation === "B") return buildWhatComesNextTask(memory);
  return buildTimeTrailTask(memory);
}

export function resetPrepMeasurelandsWeek4Lesson2TaskSessionState() {
  lessonMemory.clear();
}
