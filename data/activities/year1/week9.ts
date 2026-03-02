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

function makeOptions(answer: number, min = 1, max = 10) {
  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(randInt(min, max));
  return shuffle(Array.from(set)).map(String);
}

export function generateWeek9Task(lessonId: string, d: Difficulty = "easy"): PracticeTask {
  const [gLo, gHi] = diffRange(d, [2, 3], [2, 4], [2, 5]);
  const [pLo, pHi] = diffRange(d, [2, 3], [2, 4], [2, 5]);

  if (lessonId === "y1-w9-l1") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const groups = randInt(gLo, gHi);
      const perChild = randInt(pLo, pHi);
      const total = Math.min(20, groups * perChild);
      return { kind: "shareDrag", total, groups, difficulty: d };
    }
    if (mode === 1) {
      const groups = randInt(gLo, gHi);
      const perChild = randInt(pLo, pHi);
      const total = Math.min(20, groups * perChild);
      return { kind: "shareDeal", total, groups, difficulty: d };
    }
    const total = d === "easy" ? 6 : 10;
    const groups = 3;
    const distribution = d === "easy" ? [2, 2, 2] : [4, 3, 3];
    return { kind: "shareFair", total, groups, distribution, isFair: d === "easy", difficulty: d };
  }

  if (lessonId === "y1-w9-l2") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const groups = randInt(gLo, gHi);
      const perGroup = randInt(pLo, pHi);
      const remainder = d === "easy" ? 0 : Math.random() < 0.5 ? 0 : randInt(1, groups - 1);
      const total = groups * perGroup + remainder;
      return { kind: "groupBoxesInput", total, groups, difficulty: d };
    }
    if (mode === 1) {
      const groups = randInt(gLo, gHi);
      const perGroup = randInt(pLo, pHi);
      const remainder = d === "easy" ? 0 : Math.random() < 0.5 ? 0 : randInt(1, groups - 1);
      const total = groups * perGroup + remainder;
      return { kind: "groupBoxesTap", total, groups, difficulty: d };
    }
    const groups = randInt(gLo, gHi);
    const perGroup = randInt(pLo, pHi);
    const total = groups * perGroup;
    return { kind: "missingGroupSize", total, groups, options: makeOptions(perGroup, 1, 10), answer: perGroup, difficulty: d };
  }

  if (lessonId === "y1-w9-l3") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const perBox = randInt(pLo, pHi);
      const groups = randInt(gLo, gHi);
      return { kind: "packBoxes", total: perBox * groups, perBox, difficulty: d };
    }
    if (mode === 1) {
      const size = randInt(pLo, pHi);
      const groups = randInt(gLo, gHi + 1);
      return { kind: "groupGrabBags", total: size * groups, size, difficulty: d };
    }
    const size = randInt(pLo, pHi);
    const groups = randInt(gLo, gHi + 1);
    return { kind: "howManyGroups", total: size * groups, size, difficulty: d };
  }

  return generateWeek9Task("y1-w9-l1", d);
}
