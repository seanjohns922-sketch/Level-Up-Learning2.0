import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground Level · Week 3 · Lesson 2 — "Ordering Containers" ──
// Foundation Measurement: order familiar containers by capacity using
// "smallest", "larger", "largest", "holds more", and "holds less".
// Reuses the shared measurementCompare scenes:
//   A — Smallest → Largest (order 4)
//   B — Which Comes Next?  (sequence)
//   C — Sort Into Order    (order 4)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastSetId: string | null;
};

type ContainerThing = {
  id: string;
  label: string;
  icon: string;
  capacityRank: number;
};

type ContainerSet = {
  setId: string;
  items: ContainerThing[];
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];
const ACCENTS: Accent[] = ["rose", "gold", "teal", "sky", "violet", "leaf"];

const CONTAINERS: Record<string, ContainerThing> = {
  cup: { id: "cup", label: "Cup", icon: "🥤", capacityRank: 1 },
  mug: { id: "mug", label: "Mug", icon: "☕", capacityRank: 2 },
  bottle: { id: "bottle", label: "Bottle", icon: "🍼", capacityRank: 3 },
  jug: { id: "jug", label: "Jug", icon: "🍶", capacityRank: 5 },
  kettle: { id: "kettle", label: "Kettle", icon: "🫖", capacityRank: 6 },
  wateringCan: { id: "watering-can", label: "Watering Can", icon: "🪴", capacityRank: 7 },
  bucket: { id: "bucket", label: "Bucket", icon: "🪣", capacityRank: 8 },
  bathtub: { id: "bathtub", label: "Bathtub", icon: "🛁", capacityRank: 10 },
};

const ORDER_SETS: ContainerSet[] = [
  {
    setId: "mug-bottle-jug-bucket",
    items: [CONTAINERS.mug, CONTAINERS.bottle, CONTAINERS.jug, CONTAINERS.bucket],
  },
  {
    setId: "cup-kettle-watering-bathtub",
    items: [CONTAINERS.cup, CONTAINERS.kettle, CONTAINERS.wateringCan, CONTAINERS.bathtub],
  },
  {
    setId: "cup-bottle-bucket-bathtub",
    items: [CONTAINERS.cup, CONTAINERS.bottle, CONTAINERS.bucket, CONTAINERS.bathtub],
  },
  {
    setId: "mug-jug-kettle-bucket",
    items: [CONTAINERS.mug, CONTAINERS.jug, CONTAINERS.kettle, CONTAINERS.bucket],
  },
  {
    setId: "cup-bottle-jug-watering",
    items: [CONTAINERS.cup, CONTAINERS.bottle, CONTAINERS.jug, CONTAINERS.wateringCan],
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

function toObj(thing: ContainerThing, accent: Accent, suffix = ""): MObj {
  return {
    id: `${thing.id}${suffix}`,
    label: thing.label,
    icon: thing.icon,
    compareValue: thing.capacityRank,
    axis: "capacity",
    accent,
  };
}

function buildAscendingObjects(set: ContainerSet, suffix = ""): MObj[] {
  const accents = shuffle(ACCENTS).slice(0, set.items.length);
  return set.items
    .slice()
    .sort((a, b) => a.capacityRank - b.capacityRank)
    .map((item, index) => toObj(item, accents[index]!, `${suffix}-${index}`));
}

const TEACHING_MOMENTS: NonNullable<CompareTask["teachingMoments"]> = [
  {
    id: "cup-bottle-kettle-bucket",
    title: "Smallest to Largest",
    objects: [
      { label: "Cup", icon: "🥤", compareValue: 1, axis: "capacity", accent: "sky" },
      { label: "Bottle", icon: "🍼", compareValue: 3, axis: "capacity", accent: "rose" },
      { label: "Kettle", icon: "🫖", compareValue: 6, axis: "capacity", accent: "violet" },
      { label: "Bucket", icon: "🪣", compareValue: 8, axis: "capacity", accent: "gold" },
    ],
    left: { label: "Cup", icon: "🥤", compareValue: 1, axis: "capacity", accent: "sky" },
    right: { label: "Bucket", icon: "🪣", compareValue: 8, axis: "capacity", accent: "gold" },
    narration: "The cup is smallest. The bucket is largest.",
  },
  {
    id: "mug-bottle-jug-bucket",
    title: "Holds Less to Holds More",
    objects: [
      { label: "Mug", icon: "☕", compareValue: 2, axis: "capacity", accent: "leaf" },
      { label: "Bottle", icon: "🍼", compareValue: 3, axis: "capacity", accent: "teal" },
      { label: "Jug", icon: "🍶", compareValue: 5, axis: "capacity", accent: "rose" },
      { label: "Bucket", icon: "🪣", compareValue: 8, axis: "capacity", accent: "gold" },
    ],
    left: { label: "Mug", icon: "☕", compareValue: 2, axis: "capacity", accent: "leaf" },
    right: { label: "Bucket", icon: "🪣", compareValue: 8, axis: "capacity", accent: "gold" },
    narration: "We start with the container that holds less. Then we move to the one that holds more.",
  },
  {
    id: "cup-bottle-jug-bathtub",
    title: "Largest Holds the Most",
    objects: [
      { label: "Cup", icon: "🥤", compareValue: 1, axis: "capacity", accent: "sky" },
      { label: "Bottle", icon: "🍼", compareValue: 3, axis: "capacity", accent: "violet" },
      { label: "Jug", icon: "🍶", compareValue: 5, axis: "capacity", accent: "teal" },
      { label: "Bathtub", icon: "🛁", compareValue: 10, axis: "capacity", accent: "gold" },
    ],
    left: { label: "Cup", icon: "🥤", compareValue: 1, axis: "capacity", accent: "sky" },
    right: { label: "Bathtub", icon: "🛁", compareValue: 10, axis: "capacity", accent: "gold" },
    narration: "The bathtub holds the most, so it goes last.",
  },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let’s put containers in order!",
    speakText:
      "Professor Gauge says sometimes we need to put containers in order. We start with the container that holds the least. Then we move to containers that hold more. Finally we find the one that holds the most.",
    badgeLabel: "Professor Gauge",
    introIcon: "🫖",
    introBody: [
      "Start with the container that holds the least.",
      "Then move to containers that hold more.",
      "Finish with the one that holds the most.",
    ],
    objects: [],
    teachingMoments: TEACHING_MOMENTS,
    correctOptionId: "continue",
    feedback: { correct: "Let's start ordering!", wrong: "Let's get ready." },
  };
}

function buildSmallestToLargestTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(ORDER_SETS, memory);
  const ordered = buildAscendingObjects(set);
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the containers in order: smallest to largest.",
    speakText: "Put the containers in order from smallest to largest.",
    badgeLabel: "Smallest to Largest",
    objects: shuffle(ordered),
    orderedIds: ordered.map((item) => item.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Great ordering!", wrong: "Start with the smallest container." },
  };
}

function buildWhichComesNextTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(ORDER_SETS, memory);
  const ordered = buildAscendingObjects(set, "-seq");
  const prefix = [ordered[0]!, ordered[1]!];
  const correct = ordered[2]!;
  const distractorA = { ...ordered[0]!, id: `${ordered[0]!.id}-dA` };
  const distractorB = { ...ordered[1]!, id: `${ordered[1]!.id}-dB` };
  return {
    kind: "measurementCompare",
    scene: "sequence",
    prompt: "Which container comes next?",
    speakText: "Look at the order. Which container comes next?",
    badgeLabel: "Which Comes Next?",
    sequencePrefix: prefix,
    objects: shuffle([correct, distractorA, distractorB]),
    correctOptionId: correct.id,
    feedback: { correct: "Nice pattern!", wrong: "Look for the next larger container." },
  };
}

function buildSortIntoOrderTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(ORDER_SETS, memory);
  const ordered = buildAscendingObjects(set, "-sort");
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the containers in order: smallest to largest.",
    speakText: "Put the containers in order from smallest to largest.",
    badgeLabel: "Sort Into Order",
    objects: shuffle(ordered),
    orderedIds: ordered.map((item) => item.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Excellent sorting!", wrong: "Try the smallest container first." },
  };
}

export function buildMeasurelandsWeek3Lesson2QuizTasks(): PracticeTask[] {
  const q1Set = buildAscendingObjects(ORDER_SETS[0]!, "-q1");
  const q2Set = buildAscendingObjects(ORDER_SETS[1]!, "-q2");
  const q3Set = buildAscendingObjects(ORDER_SETS[2]!, "-q3");
  const q4Set = buildAscendingObjects(ORDER_SETS[3]!, "-q4");
  const q5Set = buildAscendingObjects(ORDER_SETS[4]!, "-q5");

  const q4Correct = q4Set[2]!;
  const q4DistractorA = { ...q4Set[0]!, id: `${q4Set[0]!.id}-dA` };
  const q4DistractorB = { ...q4Set[1]!, id: `${q4Set[1]!.id}-dB` };

  return [
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which container is the smallest?",
      speakText: "Which container is the smallest?",
      badgeLabel: "Capacity Quiz",
      objects: shuffle([q1Set[0]!, q1Set[1]!, q1Set[2]!]),
      correctOptionId: q1Set[0]!.id,
      feedback: { correct: "Yes!", wrong: "Look for the smallest container." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which container is the largest?",
      speakText: "Which container is the largest?",
      badgeLabel: "Capacity Quiz",
      objects: shuffle([q2Set[1]!, q2Set[2]!, q2Set[3]!]),
      correctOptionId: q2Set[3]!.id,
      feedback: { correct: "Yes!", wrong: "Look for the largest container." },
    },
    {
      kind: "measurementCompare",
      scene: "order",
      prompt: "Put the containers in order: smallest to largest.",
      speakText: "Put the containers in order from smallest to largest.",
      badgeLabel: "Capacity Quiz",
      objects: shuffle([q3Set[0]!, q3Set[1]!, q3Set[2]!]),
      orderedIds: [q3Set[0]!.id, q3Set[1]!.id, q3Set[2]!.id],
      correctOptionId: q3Set[2]!.id,
      feedback: { correct: "Great ordering!", wrong: "Start with the smallest container." },
    },
    {
      kind: "measurementCompare",
      scene: "sequence",
      prompt: "Which container comes next?",
      speakText: "Which container comes next?",
      badgeLabel: "Capacity Quiz",
      sequencePrefix: [q4Set[0]!, q4Set[1]!],
      objects: shuffle([q4Correct, q4DistractorA, q4DistractorB]),
      correctOptionId: q4Correct.id,
      feedback: { correct: "Nice pattern!", wrong: "Look for the next larger container." },
    },
    {
      kind: "measurementCompare",
      scene: "order",
      prompt: "Put the containers in order: smallest to largest.",
      speakText: "Put the containers in order from smallest to largest.",
      badgeLabel: "Capacity Quiz",
      objects: shuffle(q5Set),
      orderedIds: q5Set.map((item) => item.id),
      correctOptionId: q5Set[3]!.id,
      feedback: { correct: "Excellent ordering!", wrong: "Try the smallest one first." },
    },
  ];
}

export function generatePrepMeasurelandsWeek3Lesson2Task(
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

  if (rotation === "A") return buildSmallestToLargestTask(memory);
  if (rotation === "B") return buildWhichComesNextTask(memory);
  return buildSortIntoOrderTask(memory);
}

export function resetPrepMeasurelandsWeek3Lesson2TaskSessionState() {
  lessonMemory.clear();
}
