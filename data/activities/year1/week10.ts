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

function makeOptions(answer: number, min = 1, max = 20) {
  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(randInt(min, max));
  return shuffle(Array.from(set)).map(String);
}

function pick<T>(items: T[]) {
  return items[randInt(0, items.length - 1)];
}

export function generateWeek10Task(lessonId: string, d: Difficulty = "easy"): PracticeTask {
  const [gLo, gHi] = diffRange(d, [2, 3], [2, 4], [2, 5]);
  const [pLo, pHi] = diffRange(d, [2, 3], [2, 4], [2, 5]);

  if (lessonId === "y1-w10-l1") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const groups = randInt(gLo, gHi); const perGroup = randInt(pLo, pHi);
      const total = groups * perGroup;
      return { kind: "tapGroupsSkipCount", groups, perGroup, options: makeOptions(total, 4, 20), answer: String(total), difficulty: d };
    }
    if (mode === 1) {
      const perGroup = randInt(pLo, pHi); const groups = randInt(gLo, gHi);
      const total = perGroup * groups;
      return { kind: "buildGroupsSkipCount", total, perGroup, options: makeOptions(total, 4, 20), answer: String(total), difficulty: d };
    }
    const perGroup = pick([2, 5, 10]);
    const groups = perGroup === 10 ? 2 : randInt(gLo, gHi);
    const options = ["Count by 2s", "Count by 5s", "Count by 10s"];
    const answer = perGroup === 2 ? "Count by 2s" : perGroup === 5 ? "Count by 5s" : "Count by 10s";
    return { kind: "chooseSkipCount", groups, perGroup, options, answer, difficulty: d };
  }

  if (lessonId === "y1-w10-l2") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      let rows = randInt(gLo, gHi); let cols = randInt(pLo, pHi + 1);
      while (rows * cols > 20) { rows = randInt(2, 4); cols = randInt(2, 5); }
      const total = rows * cols;
      return { kind: "arrayBuilder", rows, cols, options: makeOptions(total, 4, 20), answer: String(total), difficulty: d };
    }
    if (mode === 1) {
      const groups = randInt(gLo, gHi); const perGroup = randInt(pLo, pHi);
      const total = groups * perGroup;
      return { kind: "barGroupModel", groups, perGroup, options: makeOptions(total, 4, 20), answer: String(total), difficulty: d };
    }
    const perGroup = randInt(pLo, pHi); const groups = randInt(gLo, gHi + 1);
    const total = perGroup * groups;
    return { kind: "missingGroupCount", perGroup, total, options: makeOptions(groups, 2, 6), answer: String(groups), difficulty: d };
  }

  if (lessonId === "y1-w10-l3") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const groups = randInt(gLo + 1, gHi + 1); const perGroup = randInt(pLo, pHi);
      const total = groups * perGroup;
      return { kind: "groupStory", groups, perGroup, itemLabel: "apples", containerLabel: "baskets", options: makeOptions(total, 4, 20), answer: String(total), difficulty: d };
    }
    if (mode === 1) {
      const perGroup = randInt(pLo, pHi); const groups = randInt(gLo + 1, gHi + 1);
      const total = perGroup * groups;
      return { kind: "howManyGroupsStory", total, perGroup, itemLabel: "cookies", containerLabel: "bags", options: makeOptions(groups, 2, 6), answer: String(groups), difficulty: d };
    }
    const groups = randInt(gLo + 1, gHi + 1); const perGroup = randInt(pLo, pHi);
    const total = groups * perGroup;
    const broken = randInt(1, Math.min(4, total - 1));
    const answer = total - broken;
    return { kind: "twoStepGrouping", groups, perGroup, broken, itemLabel: "toys", containerLabel: "boxes", options: makeOptions(answer, 2, 20), answer: String(answer), difficulty: d };
  }

  return generateWeek10Task("y1-w10-l1", d);
}
