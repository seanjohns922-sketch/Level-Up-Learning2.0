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

function makeOptions(answer: number, min = 1, max = 20) {
  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(randInt(min, max));
  return shuffle(Array.from(set)).map(String);
}

function pick<T>(items: T[]) {
  return items[randInt(0, items.length - 1)];
}

export function generateWeek10Task(lessonId: string): PracticeTask {
  if (lessonId === "y1-w10-l1") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const groups = randInt(2, 4);
      const perGroup = randInt(2, 5);
      const total = groups * perGroup;
      return {
        kind: "tapGroupsSkipCount",
        groups,
        perGroup,
        options: makeOptions(total, 4, 20),
        answer: String(total),
      };
    }
    if (mode === 1) {
      const perGroup = randInt(3, 5);
      const groups = randInt(2, 4);
      const total = perGroup * groups;
      return {
        kind: "buildGroupsSkipCount",
        total,
        perGroup,
        options: makeOptions(total, 4, 20),
        answer: String(total),
      };
    }
    const perGroup = pick([2, 5, 10]);
    const groups = perGroup === 10 ? 2 : randInt(2, 4);
    const options = ["Count by 2s", "Count by 5s", "Count by 10s"];
    const answer =
      perGroup === 2 ? "Count by 2s" : perGroup === 5 ? "Count by 5s" : "Count by 10s";
    return {
      kind: "chooseSkipCount",
      groups,
      perGroup,
      options,
      answer,
    };
  }

  if (lessonId === "y1-w10-l2") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      let rows = randInt(2, 4);
      let cols = randInt(2, 5);
      while (rows * cols > 20) {
        rows = randInt(2, 4);
        cols = randInt(2, 5);
      }
      const total = rows * cols;
      return {
        kind: "arrayBuilder",
        rows,
        cols,
        options: makeOptions(total, 4, 20),
        answer: String(total),
      };
    }
    if (mode === 1) {
      const groups = randInt(2, 4);
      const perGroup = randInt(3, 5);
      const total = groups * perGroup;
      return {
        kind: "barGroupModel",
        groups,
        perGroup,
        options: makeOptions(total, 4, 20),
        answer: String(total),
      };
    }
    const perGroup = randInt(2, 4);
    const groups = randInt(2, 5);
    const total = perGroup * groups;
    return {
      kind: "missingGroupCount",
      perGroup,
      total,
      options: makeOptions(groups, 2, 6),
      answer: String(groups),
    };
  }

  if (lessonId === "y1-w10-l3") {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const groups = randInt(3, 5);
      const perGroup = randInt(2, 4);
      const total = groups * perGroup;
      const itemLabel = "apples";
      const containerLabel = "baskets";
      return {
        kind: "groupStory",
        groups,
        perGroup,
        itemLabel,
        containerLabel,
        options: makeOptions(total, 4, 20),
        answer: String(total),
      };
    }
    if (mode === 1) {
      const perGroup = randInt(2, 4);
      const groups = randInt(3, 5);
      const total = perGroup * groups;
      return {
        kind: "howManyGroupsStory",
        total,
        perGroup,
        itemLabel: "cookies",
        containerLabel: "bags",
        options: makeOptions(groups, 2, 6),
        answer: String(groups),
      };
    }
    const groups = randInt(4, 5);
    const perGroup = randInt(2, 3);
    const total = groups * perGroup;
    const broken = randInt(1, Math.min(4, total - 1));
    const answer = total - broken;
    return {
      kind: "twoStepGrouping",
      groups,
      perGroup,
      broken,
      itemLabel: "toys",
      containerLabel: "boxes",
      options: makeOptions(answer, 2, 20),
      answer: String(answer),
    };
  }

  return generateWeek10Task("y1-w10-l1");
}

