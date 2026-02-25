import type { PracticeTask } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const lessonBags = new Map<string, number[]>();

function pickFromBag(lessonId: string, count: number) {
  let bag = lessonBags.get(lessonId);
  if (!bag || bag.length === 0) {
    bag = shuffle(Array.from({ length: count }, (_, i) => i));
    lessonBags.set(lessonId, bag);
  }
  return bag.pop() as number;
}

function uniqueInts(n: number, min: number, max: number, avoid: number[] = []) {
  const set = new Set<number>();
  const avoidSet = new Set(avoid);
  while (set.size < n) {
    const x = randInt(min, max);
    if (!avoidSet.has(x)) set.add(x);
  }
  return Array.from(set);
}

function genTensOnesMcq(min = 10, max = 99): PracticeTask {
  return {
    kind: "tensOnesMcq",
    prompt: "Tens & Ones",
    min,
    max,
  };
}

function genMabBuild(min = 10, max = 99): PracticeTask {
  const target = randInt(min, max);
  return {
    kind: "mabBuild",
    prompt: "Build it with tens and ones.",
    target,
    maxTens: 10,
    maxOnes: 10,
  };
}

function genPartitionTwoWays(min = 20, max = 99): PracticeTask {
  return {
    kind: "partitionTwoWays",
    prompt: "Partition the number.",
    min,
    max,
  };
}

function genSplitStepper(min = 20, max = 99): PracticeTask {
  const target = randInt(min, max);
  return {
    kind: "splitStepper",
    prompt: `Split to make ${target}.`,
    target,
    max: target,
  };
}

function genPlaceValueDice(): PracticeTask {
  return {
    kind: "placeValueDice",
    prompt: "Roll and build the number.",
  };
}

function genMatchRepresentation(min = 10, max = 99): PracticeTask {
  const target = randInt(min, max);
  const tens = Math.floor(target / 10);
  const ones = target % 10;
  const distractors = uniqueInts(3, min, max, [target]);
  const options = shuffle([target, ...distractors]).map(String);
  return {
    kind: "mcq",
    prompt: `${tens} tens and ${ones} ones is:`,
    options,
    answer: String(target),
  };
}

export function generateWeek3Task(lessonId: string): PracticeTask {
  if (lessonId === "y1-w3-l1") {
    const kinds = [
      () => genTensOnesMcq(10, 99),
      () => genMabBuild(10, 99),
    ];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  if (lessonId === "y1-w3-l2") {
    const kinds = [
      () => genPlaceValueDice(),
      () => genPartitionTwoWays(20, 99),
      () => genSplitStepper(20, 99),
    ];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  const kinds = [
    () => genMabBuild(10, 99),
    () => genMatchRepresentation(10, 99),
  ];
  return kinds[pickFromBag(lessonId, kinds.length)]();
}
