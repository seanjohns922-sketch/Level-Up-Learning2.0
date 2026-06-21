import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type MeasurelandsTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MeasurelandsObject = MeasurelandsTask["objects"][number];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];
const WEEK1_BASE = "/images/measurelands/week1-3d";
const WEEK1_IMAGES = {
  bridge: `${WEEK1_BASE}/bridge.png`,
  building: `${WEEK1_BASE}/building.png`,
  carrot: `${WEEK1_BASE}/carrot.png`,
  castle: `${WEEK1_BASE}/castle.png`,
  crayon: `${WEEK1_BASE}/crayon.png`,
  cucumber: `${WEEK1_BASE}/cucumber.png`,
  dinosaur: `${WEEK1_BASE}/dinosaur.png`,
  house: `${WEEK1_BASE}/house.png`,
  ladder: `${WEEK1_BASE}/ladder.png`,
  littleDino: `${WEEK1_BASE}/little-dino.png`,
  miniRobot: `${WEEK1_BASE}/mini-robot.png`,
  pencil: `${WEEK1_BASE}/pencil.png`,
  plank: `${WEEK1_BASE}/plank.png`,
  road: `${WEEK1_BASE}/road.png`,
  robot: `${WEEK1_BASE}/robot.png`,
  rocket: `${WEEK1_BASE}/rocket.png`,
  sapling: `${WEEK1_BASE}/sapling.png`,
  snake: `${WEEK1_BASE}/snake.png`,
  tower: `${WEEK1_BASE}/tower.png`,
  tree: `${WEEK1_BASE}/tree.png`,
  vine: `${WEEK1_BASE}/vine.png`,
  worm: `${WEEK1_BASE}/worm.png`,
} as const;

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

function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

const TEACHING_MOMENTS: NonNullable<MeasurelandsTask["teachingMoments"]> = [
  {
    id: "pencil-crayon",
    title: "Longer and Shorter",
    left: { label: "Pencil", icon: "✏️", imageSrc: WEEK1_IMAGES.pencil, compareValue: 9, axis: "length", accent: "gold" },
    right: { label: "Crayon", icon: "🖍️", imageSrc: WEEK1_IMAGES.crayon, compareValue: 5, axis: "length", accent: "rose" },
    narration: "This pencil is longer. This crayon is shorter.",
  },
  {
    id: "snake-worm",
    title: "Look Carefully",
    left: { label: "Snake", icon: "🐍", imageSrc: WEEK1_IMAGES.snake, compareValue: 10, axis: "length", accent: "leaf" },
    right: { label: "Worm", icon: "🪱", imageSrc: WEEK1_IMAGES.worm, compareValue: 4, axis: "length", accent: "violet" },
    narration: "The snake is longer. The worm is shorter.",
  },
  {
    id: "tree-height",
    title: "Taller and Shorter",
    left: { label: "Tall Tree", icon: "🌳", imageSrc: WEEK1_IMAGES.tree, compareValue: 10, axis: "height", accent: "leaf" },
    right: { label: "Small Tree", icon: "🌱", imageSrc: WEEK1_IMAGES.sapling, compareValue: 5, axis: "height", accent: "sky" },
    narration: "The tree is taller.",
  },
];

const LENGTH_PAIRS: Array<[MeasurelandsObject, MeasurelandsObject]> = [
  [
    { id: "worm", label: "Worm", icon: "🪱", imageSrc: WEEK1_IMAGES.worm, compareValue: 4, axis: "length", accent: "violet" },
    { id: "snake", label: "Snake", icon: "🐍", imageSrc: WEEK1_IMAGES.snake, compareValue: 10, axis: "length", accent: "leaf" },
  ],
  [
    { id: "pencil", label: "Pencil", icon: "✏️", imageSrc: WEEK1_IMAGES.pencil, compareValue: 9, axis: "length", accent: "gold" },
    { id: "crayon", label: "Crayon", icon: "🖍️", imageSrc: WEEK1_IMAGES.crayon, compareValue: 5, axis: "length", accent: "rose" },
  ],
  [
    { id: "carrot", label: "Carrot", icon: "🥕", imageSrc: WEEK1_IMAGES.carrot, compareValue: 6, axis: "length", accent: "gold" },
    { id: "cucumber", label: "Cucumber", icon: "🥒", imageSrc: WEEK1_IMAGES.cucumber, compareValue: 9, axis: "length", accent: "leaf" },
  ],
  [
    { id: "toy-rocket", label: "Toy Rocket", icon: "🚀", imageSrc: WEEK1_IMAGES.rocket, compareValue: 5, axis: "length", accent: "sky" },
    { id: "rocket", label: "Rocket", icon: "🚀", imageSrc: WEEK1_IMAGES.rocket, compareValue: 9, axis: "length", accent: "violet" },
  ],
  [
    { id: "bridge", label: "Bridge", icon: "🌉", imageSrc: WEEK1_IMAGES.bridge, compareValue: 10, axis: "length", accent: "teal" },
    { id: "plank", label: "Plank", icon: "🪵", imageSrc: WEEK1_IMAGES.plank, compareValue: 6, axis: "length", accent: "gold" },
  ],
  [
    { id: "vine", label: "Vine", icon: "🌿", imageSrc: WEEK1_IMAGES.vine, compareValue: 8, axis: "length", accent: "leaf" },
    { id: "stick", label: "Stick", icon: "🪵", compareValue: 4, axis: "length", accent: "gold" },
  ],
];

const HEIGHT_PAIRS: Array<[MeasurelandsObject, MeasurelandsObject]> = [
  [
    { id: "tower", label: "Tower", icon: "🗼", imageSrc: WEEK1_IMAGES.tower, compareValue: 10, axis: "height", accent: "gold" },
    { id: "castle", label: "Castle", icon: "🏰", imageSrc: WEEK1_IMAGES.castle, compareValue: 6, axis: "height", accent: "violet" },
  ],
  [
    { id: "tree", label: "Tree", icon: "🌳", imageSrc: WEEK1_IMAGES.tree, compareValue: 9, axis: "height", accent: "leaf" },
    { id: "sapling", label: "Sapling", icon: "🌱", imageSrc: WEEK1_IMAGES.sapling, compareValue: 5, axis: "height", accent: "sky" },
  ],
  [
    { id: "robot", label: "Robot", icon: "🤖", imageSrc: WEEK1_IMAGES.robot, compareValue: 9, axis: "height", accent: "teal" },
    { id: "mini-robot", label: "Mini Robot", icon: "🤖", imageSrc: WEEK1_IMAGES.miniRobot, compareValue: 5, axis: "height", accent: "rose" },
  ],
  [
    { id: "building", label: "Building", icon: "🏢", imageSrc: WEEK1_IMAGES.building, compareValue: 10, axis: "height", accent: "sky" },
    { id: "house", label: "House", icon: "🏠", imageSrc: WEEK1_IMAGES.house, compareValue: 5, axis: "height", accent: "gold" },
  ],
  [
    { id: "dino", label: "Dinosaur", icon: "🦕", imageSrc: WEEK1_IMAGES.dinosaur, compareValue: 10, axis: "height", accent: "leaf" },
    { id: "raptor", label: "Little Dino", icon: "🦖", imageSrc: WEEK1_IMAGES.littleDino, compareValue: 6, axis: "height", accent: "rose" },
  ],
];

const TRIO_SETS: Array<Array<MeasurelandsObject>> = [
  [
    { id: "pencil-short", label: "Pencil", icon: "✏️", imageSrc: WEEK1_IMAGES.pencil, compareValue: 4, axis: "length", accent: "rose" },
    { id: "pencil-mid", label: "Pencil", icon: "✏️", imageSrc: WEEK1_IMAGES.pencil, compareValue: 7, axis: "length", accent: "gold" },
    { id: "pencil-long", label: "Pencil", icon: "✏️", imageSrc: WEEK1_IMAGES.pencil, compareValue: 10, axis: "length", accent: "teal" },
  ],
  [
    { id: "snake-short", label: "Snake", icon: "🐍", imageSrc: WEEK1_IMAGES.snake, compareValue: 5, axis: "length", accent: "sky" },
    { id: "snake-mid", label: "Snake", icon: "🐍", imageSrc: WEEK1_IMAGES.snake, compareValue: 8, axis: "length", accent: "leaf" },
    { id: "snake-long", label: "Snake", icon: "🐍", imageSrc: WEEK1_IMAGES.snake, compareValue: 10, axis: "length", accent: "violet" },
  ],
  [
    { id: "road-short", label: "Road", icon: "🛣️", imageSrc: WEEK1_IMAGES.road, compareValue: 4, axis: "length", accent: "gold" },
    { id: "road-mid", label: "Road", icon: "🛣️", imageSrc: WEEK1_IMAGES.road, compareValue: 7, axis: "length", accent: "teal" },
    { id: "road-long", label: "Road", icon: "🛣️", imageSrc: WEEK1_IMAGES.road, compareValue: 10, axis: "length", accent: "rose" },
  ],
  [
    { id: "rocket-short", label: "Rocket", icon: "🚀", imageSrc: WEEK1_IMAGES.rocket, compareValue: 5, axis: "length", accent: "gold" },
    { id: "rocket-mid", label: "Rocket", icon: "🚀", imageSrc: WEEK1_IMAGES.rocket, compareValue: 7, axis: "length", accent: "sky" },
    { id: "rocket-long", label: "Rocket", icon: "🚀", imageSrc: WEEK1_IMAGES.rocket, compareValue: 10, axis: "length", accent: "violet" },
  ],
  [
    { id: "ladder-short", label: "Ladder", icon: "🪜", imageSrc: WEEK1_IMAGES.ladder, compareValue: 4, axis: "length", accent: "rose" },
    { id: "ladder-mid", label: "Ladder", icon: "🪜", imageSrc: WEEK1_IMAGES.ladder, compareValue: 8, axis: "length", accent: "gold" },
    { id: "ladder-long", label: "Ladder", icon: "🪜", imageSrc: WEEK1_IMAGES.ladder, compareValue: 10, axis: "length", accent: "teal" },
  ],
  [
    { id: "vine-short", label: "Vine", icon: "🌿", imageSrc: WEEK1_IMAGES.vine, compareValue: 4, axis: "length", accent: "sky" },
    { id: "vine-mid", label: "Vine", icon: "🌿", imageSrc: WEEK1_IMAGES.vine, compareValue: 7, axis: "length", accent: "gold" },
    { id: "vine-long", label: "Vine", icon: "🌿", imageSrc: WEEK1_IMAGES.vine, compareValue: 9, axis: "length", accent: "leaf" },
  ],
];

function buildIntroTask(): MeasurelandsTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let’s become Length Explorers.",
    speakText:
      "The Fog of Forgetfulness has mixed up all the lengths in Length Lands. Some things are longer. Some things are shorter. Some things are taller. Let's become Length Explorers.",
    badgeLabel: "Meazurex Mission",
    objects: [],
    teachingMoments: TEACHING_MOMENTS,
    correctOptionId: "continue",
    feedback: {
      correct: "You are ready to compare!",
      wrong: "Let's get ready.",
    },
  };
}

function buildLengthPairTask(_difficulty: Difficulty): MeasurelandsTask {
  const pair = shuffle(choose(LENGTH_PAIRS));
  const correctOptionId = pair.reduce((best, current) =>
    current.compareValue > best.compareValue ? current : best
  ).id;
  return {
    kind: "measurementCompare",
    scene: "pair",
    prompt: "Which is longer?",
    speakText: "Which is longer?",
    badgeLabel: "Longest Explorer",
    targetMode: "longer",
    objects: pair,
    correctOptionId,
    feedback: {
      correct: "Great comparing!",
      wrong: "Let's look again.",
    },
  };
}

function buildHeightPairTask(_difficulty: Difficulty): MeasurelandsTask {
  const pair = shuffle(choose(HEIGHT_PAIRS));
  const correctOptionId = pair.reduce((best, current) =>
    current.compareValue > best.compareValue ? current : best
  ).id;
  return {
    kind: "measurementCompare",
    scene: "pair",
    prompt: "Which is taller?",
    speakText: "Which is taller?",
    badgeLabel: "Tallest Tower",
    targetMode: "taller",
    objects: pair,
    correctOptionId,
    feedback: {
      correct: "Towering work!",
      wrong: "Let's compare the heights again.",
    },
  };
}

function buildSortingTask(difficulty: Difficulty): MeasurelandsTask {
  const set = shuffle(choose(TRIO_SETS));
  const targetMode = choose(["longest", "shortest"] as const);
  const sorted = [...set].sort((left, right) => left.compareValue - right.compareValue);
  const correctOptionId =
    targetMode === "longest" ? sorted[sorted.length - 1]!.id : sorted[0]!.id;

  if (difficulty === "hard") {
    const middle = set.find((item) => item.compareValue === 7 || item.compareValue === 8);
    if (middle) {
      middle.compareValue = middle.compareValue === 7 ? 8 : middle.compareValue;
    }
  }

  return {
    kind: "measurementCompare",
    scene: "trio",
    prompt: targetMode === "longest" ? "Tap the longest." : "Tap the shortest.",
    speakText: targetMode === "longest" ? "Tap the longest." : "Tap the shortest.",
    badgeLabel: "Meazurex's Sorting Machine",
    targetMode,
    objects: set,
    correctOptionId,
    feedback: {
      correct: "Wonderful sorting!",
      wrong: "Let's compare all three again.",
    },
  };
}

export function generatePrepMeasurelandsWeek1Task(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }

  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;

  if (rotation === "A") return buildLengthPairTask(difficulty);
  if (rotation === "B") return buildHeightPairTask(difficulty);
  return buildSortingTask(difficulty);
}

export function resetPrepMeasurelandsWeek1TaskSessionState() {
  lessonMemory.clear();
}
