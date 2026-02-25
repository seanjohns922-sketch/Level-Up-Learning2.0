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

const ADD_WORDS = [
  "got more",
  "bought",
  "joined",
  "got",
];

const SUB_WORDS = ["gave away", "lost", "ate"];

const NAMES = ["Tom", "Mia", "Ava", "Leo", "Noah", "Zoe"];

function makeStory(op: "add" | "subtract") {
  let a = randInt(3, 15);
  let b = randInt(1, Math.min(9, 20 - a));
  if (op === "subtract") {
    for (let i = 0; i < 20; i += 1) {
      a = randInt(3, 15);
      b = randInt(1, 9);
      if (a - b >= 0) break;
    }
  }
  const name = NAMES[randInt(0, NAMES.length - 1)];
  if (op === "add") {
    const word = ADD_WORDS[randInt(0, ADD_WORDS.length - 1)];
    const verb =
      word === "bought"
        ? `bought ${b} more`
        : word === "joined"
        ? `${b} friends joined`
        : word === "got"
        ? `got ${b} more`
        : `got ${b} more`;
    const story =
      word === "joined"
        ? `${name} had ${a} stickers. ${b} friends joined. How many altogether?`
        : `${name} had ${a} stickers. ${name} ${verb}. How many altogether?`;
    return {
      story,
      a,
      b,
      op,
      answer: a + b,
    };
  }
  const word = SUB_WORDS[randInt(0, SUB_WORDS.length - 1)];
  const verb =
    word === "gave away"
      ? `gave away ${b}`
      : word === "lost"
      ? `lost ${b}`
      : `ate ${b}`;
  return {
    story: `${name} had ${a} stickers. ${name} ${verb}. How many left?`,
    a,
    b,
    op,
    answer: a - b,
  };
}

function makeStoryOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    set.add(randInt(0, 20));
  }
  return shuffle(Array.from(set)).map(String);
}

export function generateWeek7Task(
  lessonId: string,
  ctx?: { secondsLeft: number; totalSeconds: number; elapsedSeconds: number }
): PracticeTask {
  if (lessonId === "y1-w7-l1") {
    const op: "add" | "subtract" = Math.random() < 0.5 ? "add" : "subtract";
    const story = makeStory(op);
    const modePick = randInt(0, 2);
    if (modePick === 2) {
      const isAdd = Math.random() < 0.5;
      const s = makeStory(isAdd ? "add" : "subtract");
      const a = s.a;
      const b = s.b;
      const result = isAdd ? a + b : a - b;
      return {
        kind: "missingOperation",
        story: s.story,
        a,
        b,
        result,
        answer: isAdd ? "+" : "-",
      };
    }
    return {
      kind: "storyOpChoice",
      story: story.story,
      answer: op,
      variant: modePick === 0 ? "choice" : "sort",
    };
  }

  if (lessonId === "y1-w7-l2") {
    const modePick = randInt(0, 2);
    if (modePick === 0) {
      const a = randInt(1, 9);
      const b = randInt(1, 9);
      const story = `You buy an apple ($${a}) and a banana ($${b}). How much altogether?`;
      const answer = a + b;
      return {
        kind: "storySolve",
        story,
        a,
        b,
        op: "add",
        answer,
        options: makeStoryOptions(answer),
        hideEquation: true,
        allowEquationInput: true,
      };
    }
    if (modePick === 1) {
      if (Math.random() < 0.5) {
        const a = randInt(5, 12);
        const b = randInt(1, 9);
        const story = `There were ${a} kids on the playground. ${b} more came. How many altogether?`;
        const answer = a + b;
        return {
          kind: "storySolve",
          story,
          a,
          b,
          op: "add",
          answer,
          options: makeStoryOptions(answer),
          hideEquation: true,
          allowEquationInput: true,
        };
      }
      const a = randInt(8, 15);
      const b = randInt(1, Math.min(8, a));
      const story = `There were ${a} birds in a tree. ${b} flew away. How many left?`;
      const answer = a - b;
      return {
        kind: "storySolve",
        story,
        a,
        b,
        op: "subtract",
        answer,
        options: makeStoryOptions(answer),
        hideEquation: true,
        allowEquationInput: true,
      };
    }
    const op: "add" | "subtract" = Math.random() < 0.5 ? "add" : "subtract";
    const s = makeStory(op);
    return {
      kind: "storySolve",
      story: s.story,
      a: s.a,
      b: s.b,
      op: s.op,
      answer: s.answer,
      options: makeStoryOptions(s.answer),
      requireOpChoice: true,
      hideEquation: true,
      allowEquationInput: true,
    };
  }

  if (lessonId === "y1-w7-l3") {
    const modePick = randInt(0, 1);
    if (modePick === 0) {
      const elapsedSeconds = ctx?.elapsedSeconds ?? 0;
      const allowTen = elapsedSeconds >= 240;
      const maxTarget = allowTen ? 20 : 9;
      return {
        kind: "moneyMakeAmount",
        target: randInt(5, maxTarget),
        allowTen,
      };
    }
    const have = randInt(4, 10);
    const cost = randInt(5, 11);
    return {
      kind: "moneyEnough",
      have,
      cost,
      answer: have >= cost ? "YES" : "NO",
    };
  }

  return generateWeek7Task("y1-w7-l1");
}
