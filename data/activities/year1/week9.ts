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

function makeOptions(answer: number, min = 1, max = 10) {
  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(randInt(min, max));
  return shuffle(Array.from(set)).map(String);
}

export function generateWeek9Task(lessonId: string): PracticeTask {
  if (lessonId === "y1-w9-l1") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const groups = randInt(2, 5);
      const perChild = randInt(2, 5);
      const total = Math.min(20, groups * perChild);
      return { kind: "shareDrag", total, groups };
    }
    if (mode === 1) {
      const groups = randInt(2, 5);
      const perChild = randInt(2, 5);
      const total = Math.min(20, groups * perChild);
      return { kind: "shareDeal", total, groups };
    }
    const total = 10;
    const groups = 3;
    const distribution = [4, 3, 3];
    return {
      kind: "shareFair",
      total,
      groups,
      distribution,
      isFair: false,
    };
  }

  if (lessonId === "y1-w9-l2") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const groups = randInt(2, 5);
      const perGroup = randInt(2, 5);
      const remainder = Math.random() < 0.5 ? 0 : randInt(1, groups - 1);
      const total = groups * perGroup + remainder;
      return { kind: "groupBoxesInput", total, groups };
    }
    if (mode === 1) {
      const groups = randInt(2, 5);
      const perGroup = randInt(2, 5);
      const remainder = Math.random() < 0.5 ? 0 : randInt(1, groups - 1);
      const total = groups * perGroup + remainder;
      return { kind: "groupBoxesTap", total, groups };
    }
    const groups = randInt(2, 5);
    const perGroup = randInt(2, 5);
    const total = groups * perGroup;
    const answer = perGroup;
    return {
      kind: "missingGroupSize",
      total,
      groups,
      options: makeOptions(answer, 1, 10),
      answer,
    };
  }

  if (lessonId === "y1-w9-l3") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const perBox = randInt(2, 5);
      const groups = randInt(2, 5);
      const total = perBox * groups;
      return { kind: "packBoxes", total, perBox };
    }
    if (mode === 1) {
      const size = randInt(2, 4);
      const groups = randInt(3, 6);
      const total = size * groups;
      return { kind: "groupGrabBags", total, size };
    }
    const size = randInt(2, 5);
    const groups = randInt(3, 6);
    const total = size * groups;
    return { kind: "howManyGroups", total, size };
  }

  return generateWeek9Task("y1-w9-l1");
}
