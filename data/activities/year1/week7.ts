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

const ADD_WORDS = ["got more", "bought", "joined", "got"];
const SUB_WORDS = ["gave away", "lost", "ate"];
const NAMES = ["Tom", "Mia", "Ava", "Leo", "Noah", "Zoe"];

function makeStory(op: "add" | "subtract", d: Difficulty) {
  const [aLo, aHi] = diffRange(d, [2, 8], [3, 12], [3, 15]);
  const [bLo, bHi] = diffRange(d, [1, 5], [1, 7], [1, 9]);
  let a = randInt(aLo, aHi);
  let b = randInt(bLo, Math.min(bHi, 20 - a));
  if (op === "subtract") {
    for (let i = 0; i < 20; i += 1) {
      a = randInt(aLo, aHi); b = randInt(bLo, bHi);
      if (a - b >= 0) break;
    }
  }
  const name = NAMES[randInt(0, NAMES.length - 1)];
  if (op === "add") {
    const word = ADD_WORDS[randInt(0, ADD_WORDS.length - 1)];
    const verb = word === "joined" ? `${b} friends joined` : `got ${b} more`;
    const story = word === "joined"
      ? `${name} had ${a} stickers. ${b} friends joined. How many altogether?`
      : `${name} had ${a} stickers. ${name} ${verb}. How many altogether?`;
    return { story, a, b, op, answer: a + b };
  }
  const word = SUB_WORDS[randInt(0, SUB_WORDS.length - 1)];
  const verb = word === "gave away" ? `gave away ${b}` : word === "lost" ? `lost ${b}` : `ate ${b}`;
  return { story: `${name} had ${a} stickers. ${name} ${verb}. How many left?`, a, b, op, answer: a - b };
}

function makeStoryOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(randInt(0, 20));
  return shuffle(Array.from(set)).map(String);
}

export function generateWeek7Task(
  lessonId: string,
  ctx?: { secondsLeft: number; totalSeconds: number; elapsedSeconds: number },
  d: Difficulty = "easy"
): PracticeTask {
  if (lessonId === "y1-w7-l1") {
    const op: "add" | "subtract" = Math.random() < 0.5 ? "add" : "subtract";
    const story = makeStory(op, d);
    const modePick = randInt(0, 2);
    if (modePick === 2) {
      const isAdd = Math.random() < 0.5;
      const s = makeStory(isAdd ? "add" : "subtract", d);
      return { kind: "missingOperation", story: s.story, a: s.a, b: s.b, result: s.answer, answer: isAdd ? "+" : "-", difficulty: d };
    }
    return { kind: "storyOpChoice", story: story.story, answer: op, variant: modePick === 0 ? "choice" : "sort", difficulty: d };
  }

  if (lessonId === "y1-w7-l2") {
    const modePick = randInt(0, 2);
    if (modePick === 0) {
      const [lo, hi] = diffRange(d, [1, 5], [1, 7], [1, 9]);
      const a = randInt(lo, hi); const b = randInt(lo, hi);
      const story = `You buy an apple ($${a}) and a banana ($${b}). How much altogether?`;
      const answer = a + b;
      return { kind: "storySolve", story, a, b, op: "add", answer, options: makeStoryOptions(answer), hideEquation: true, allowEquationInput: true, difficulty: d };
    }
    if (modePick === 1) {
      if (Math.random() < 0.5) {
        const [lo, hi] = diffRange(d, [3, 8], [5, 10], [5, 12]);
        const a = randInt(lo, hi); const b = randInt(1, Math.min(hi, 20 - a));
        const story = `There were ${a} kids on the playground. ${b} more came. How many altogether?`;
        return { kind: "storySolve", story, a, b, op: "add", answer: a + b, options: makeStoryOptions(a + b), hideEquation: true, allowEquationInput: true, difficulty: d };
      }
      const [lo, hi] = diffRange(d, [5, 10], [8, 13], [8, 15]);
      const a = randInt(lo, hi); const b = randInt(1, Math.min(8, a));
      const story = `There were ${a} birds in a tree. ${b} flew away. How many left?`;
      return { kind: "storySolve", story, a, b, op: "subtract", answer: a - b, options: makeStoryOptions(a - b), hideEquation: true, allowEquationInput: true, difficulty: d };
    }
    const op2: "add" | "subtract" = Math.random() < 0.5 ? "add" : "subtract";
    const s = makeStory(op2, d);
    return { kind: "storySolve", story: s.story, a: s.a, b: s.b, op: s.op, answer: s.answer, options: makeStoryOptions(s.answer), requireOpChoice: true, hideEquation: true, allowEquationInput: true, difficulty: d };
  }

  if (lessonId === "y1-w7-l3") {
    const modePick = randInt(0, 1);
    if (modePick === 0) {
      const allowTen = d !== "easy";
      const maxTarget = allowTen ? 20 : 9;
      return { kind: "moneyMakeAmount", target: randInt(5, maxTarget), allowTen, difficulty: d };
    }
    const [hLo, hHi] = diffRange(d, [3, 6], [4, 8], [4, 10]);
    const [cLo, cHi] = diffRange(d, [4, 7], [5, 9], [5, 11]);
    const have = randInt(hLo, hHi); const cost = randInt(cLo, cHi);
    return { kind: "moneyEnough", have, cost, answer: have >= cost ? "YES" : "NO", difficulty: d };
  }

  return generateWeek7Task("y1-w7-l1", undefined, d);
}
