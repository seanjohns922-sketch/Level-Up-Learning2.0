import type { PracticeTask, Difficulty } from "./practice-task";
import { diffRange } from "./practice-task";

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

function genTensOnesMcq(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [10, 49], [10, 69], [10, 99]);
  return { kind: "tensOnesMcq", prompt: "Tens & Ones", min: lo, max: hi, difficulty: d };
}

function genMabBuild(d: Difficulty, min = 10, max = 99): PracticeTask {
  const [lo, hi] = diffRange(d, [10, 49], [min, 69], [min, max]);
  const target = randInt(lo, hi);
  return { kind: "mabBuild", prompt: "Build it with tens and ones.", target, maxTens: 10, maxOnes: 10, difficulty: d };
}

function genPartitionTwoWays(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [20, 49], [20, 69], [20, 99]);
  return { kind: "partitionTwoWays", prompt: "Partition the number.", min: lo, max: hi, difficulty: d };
}

function genSplitStepper(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [20, 49], [20, 69], [20, 99]);
  const target = randInt(lo, hi);
  return { kind: "splitStepper", prompt: `Split to make ${target}.`, target, max: target, difficulty: d };
}

function genPlaceValueDice(d: Difficulty): PracticeTask {
  return { kind: "placeValueDice", prompt: "Roll and build the number.", difficulty: d };
}

function genMatchRepresentation(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [10, 49], [10, 69], [10, 99]);
  const target = randInt(lo, hi);
  const tens = Math.floor(target / 10);
  const ones = target % 10;
  const distractors = uniqueInts(3, lo, hi, [target]);
  const options = shuffle([target, ...distractors]).map(String);
  return { kind: "mcq", prompt: `${tens} tens and ${ones} ones is:`, options, answer: String(target), difficulty: d };
}

export function generateWeek3Task(lessonId: string, d: Difficulty = "easy"): PracticeTask {
  if (lessonId === "y1-w3-l1") {
    const kinds = [() => genTensOnesMcq(d), () => genMabBuild(d)];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  if (lessonId === "y1-w3-l2") {
    const kinds = [() => genPlaceValueDice(d), () => genPartitionTwoWays(d), () => genSplitStepper(d)];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  const kinds = [() => genMabBuild(d), () => genMatchRepresentation(d)];
  return kinds[pickFromBag(lessonId, kinds.length)]();
}
