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

function makeOptions(answer: number, min = 0, max = 20) {
  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(randInt(min, max));
  return shuffle(Array.from(set)).map(String);
}

const NAMES = ["Liam", "Ava", "Ben", "Mia", "Tom", "Ella"];
let week8Toggle = 0;
function nextIsAdd() { week8Toggle += 1; return week8Toggle % 2 === 0; }

function makeAddStory(d: Difficulty) {
  const [lo, hi] = diffRange(d, [2, 6], [3, 10], [3, 12]);
  const [bLo, bHi] = diffRange(d, [1, 4], [3, 6], [3, 8]);
  const a = randInt(lo, hi); const b = randInt(bLo, bHi);
  const name = NAMES[randInt(0, NAMES.length - 1)];
  return { story: `${name} has ${a} apples. ${name} gets ${b} more. How many now?`, a, b, answer: a + b };
}

function makeSubStory(d: Difficulty) {
  const [lo, hi] = diffRange(d, [5, 10], [8, 13], [8, 15]);
  let a = randInt(lo, hi); let b = randInt(2, Math.min(8, a - 1));
  const name = NAMES[randInt(0, NAMES.length - 1)];
  return { story: `${name} has ${a} apples. ${name} eats ${b}. How many left?`, a, b, answer: a - b };
}

export function generateWeek8Task(lessonId: string, d: Difficulty = "easy"): PracticeTask {
  if (lessonId === "y1-w8-l1") {
    const modePick = randInt(0, 2);
    if (modePick === 0) {
      const isAdd = nextIsAdd();
      const s = isAdd ? makeAddStory(d) : makeSubStory(d);
      return { kind: "buildStory", story: s.story, mode: isAdd ? "add" : "subtract", start: s.a, change: s.b, options: makeOptions(s.answer, 0, 20), answer: s.answer, difficulty: d };
    }
    if (modePick === 1) {
      const isAdd = nextIsAdd();
      if (isAdd) {
        const [lo, hi] = diffRange(d, [2, 6], [3, 10], [3, 12]);
        let a = randInt(lo, hi); let b = randInt(lo, Math.min(10, 20 - a));
        const name = NAMES[randInt(0, NAMES.length - 1)];
        return { kind: "twoMats", story: `${name} has ${a} counters. ${name} gets ${b} more.`, mode: "add", a, b, options: makeOptions(a + b, 6, 20), answer: a + b, difficulty: d };
      }
      const [lo, hi] = diffRange(d, [6, 10], [10, 13], [10, 15]);
      const a = randInt(lo, hi); const b = randInt(2, Math.min(9, a - 1));
      const name = NAMES[randInt(0, NAMES.length - 1)];
      return { kind: "twoMats", story: `${name} has ${a} counters. ${name} takes away ${b}.`, mode: "subtract", a, b, options: makeOptions(a - b, 0, 20), answer: a - b, difficulty: d };
    }
    const isAdd = nextIsAdd();
    const [lo, hi] = diffRange(d, [3, 8], [3, 10], [3, 12]);
    let before = randInt(lo, hi); let after = isAdd ? randInt(before + 1, Math.min(20, before + 8)) : randInt(Math.max(1, before - 6), before - 1);
    return { kind: "whatHappened", before, after, answerOp: isAdd ? "add" : "subtract", options: makeOptions(after, 0, 20), answer: after, difficulty: d };
  }

  if (lessonId === "y1-w8-l2") {
    const modePick = randInt(0, 2);
    if (modePick === 0) {
      const [lo, hi] = diffRange(d, [3, 6], [5, 10], [5, 12]);
      const a = randInt(lo, hi); const b = randInt(lo, Math.min(10, 20 - a));
      return { kind: "ppw", prompt: "Fill the missing whole", mode: "missingWhole", a, b, whole: a + b, difficulty: d };
    }
    if (modePick === 1) {
      const [lo, hi] = diffRange(d, [8, 14], [12, 18], [12, 20]);
      const whole = randInt(lo, hi); const part = randInt(3, Math.min(10, whole - 3));
      const missing = whole - part;
      return { kind: "barModel", total: whole, part, missing, options: makeOptions(missing, 0, 20), answer: missing, difficulty: d };
    }
    const [lo, hi] = diffRange(d, [6, 12], [10, 16], [10, 18]);
    const a = randInt(lo, hi); const b = randInt(4, Math.min(12, a - 1));
    return { kind: "compareBars", story: `Tom has ${a} stickers. Mia has ${b}. How many more does Tom have?`, a, b, options: makeOptions(a - b, 0, 12), answer: a - b, difficulty: d };
  }

  if (lessonId === "y1-w8-l3") {
    const modePick = randInt(0, 2);
    if (modePick === 0) {
      const [lo, hi] = diffRange(d, [2, 5], [4, 8], [4, 10]);
      let priceA = randInt(lo, hi); let priceB = randInt(lo, hi);
      for (let i = 0; i < 10; i++) { if (priceA + priceB <= 20) break; priceA = randInt(lo, hi); priceB = randInt(lo, hi); }
      const items = [["Juice", "Chips"], ["Apple", "Sandwich"], ["Milk", "Biscuit"]][randInt(0, 2)];
      const total = priceA + priceB;
      return { kind: "moneyAddPrices", itemA: items[0], itemB: items[1], priceA, priceB, options: makeOptions(total, 6, 20), answer: total, difficulty: d };
    }
    if (modePick === 1) {
      const [lo, hi] = diffRange(d, [5, 10], [9, 14], [9, 16]);
      const have = randInt(lo, hi); const cost = randInt(have + 2, 20);
      const diff = cost - have;
      return { kind: "moneyHowMuchMore", have, cost, options: makeOptions(diff, 1, 10), answer: diff, difficulty: d };
    }
    const paid = 20;
    const [lo, hi] = diffRange(d, [14, 18], [12, 18], [10, 18]);
    const cost = randInt(lo, hi);
    return { kind: "moneyChangeUp", paid, cost, options: makeOptions(paid - cost, 1, 10), answer: paid - cost, difficulty: d };
  }

  return generateWeek8Task("y1-w8-l1", d);
}
