import type { PracticeTask, Difficulty } from "./practice-task";
import { diffRange } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeSubtractPair(d: Difficulty): { total: number; remove: number; answer: number } {
  if (d === "hard") {
    const total = randInt(30, 99);
    const remove = randInt(10, total - 1);
    return { total, remove, answer: total - remove };
  }
  const maxTotal = d === "easy" ? 12 : 16;
  const r = Math.random();
  let total = 10, remove = 5;

  if (r < 0.4) {
    total = randInt(d === "easy" ? 6 : 11, maxTotal);
    const minRemove = Math.max(1, total - 9);
    remove = randInt(minRemove, Math.min(d === "easy" ? 5 : 9, total - 1));
  } else if (r < 0.6) {
    const n = randInt(3, Math.floor(maxTotal / 2));
    total = n + n; remove = n;
  } else if (r < 0.8) {
    const n = randInt(3, Math.min(9, Math.floor(maxTotal / 2)));
    total = n + (Math.random() < 0.5 ? n + 1 : n - 1); remove = n;
  } else {
    total = randInt(6, maxTotal);
    remove = randInt(1, Math.min(10, total - 1));
  }
  return { total, remove, answer: total - remove };
}

function makeOptions(answer: number, min = 0, max = 20) {
  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(randInt(min, max));
  return Array.from(set).sort(() => Math.random() - 0.5).map(String);
}

export function generateWeek6Task(
  lessonId: string,
  ctx?: { secondsLeft: number; totalSeconds: number },
  d: Difficulty = "easy"
): PracticeTask {
  if (lessonId === "y1-w6-l1") {
    const pair = makeSubtractPair(d);
    const modePick = randInt(0, 2);
    const mode = modePick === 0 ? "equation" : modePick === 1 ? "takeAway" : "startWith";
    return { kind: "subtractTakeAway", total: pair.total, remove: pair.remove, mode, difficulty: d };
  }

  if (lessonId === "y1-w6-l2") {
    const { total, remove } = makeSubtractPair(d);
    const modePick = randInt(0, 2);
    if (modePick === 0) return { kind: "subtractMissingPart", total, part: remove, options: makeOptions(total - remove), difficulty: d };
    if (modePick === 1) return { kind: "subtractMoveToTaken", total, remove, difficulty: d };
    return { kind: "subtractBar", total, remove, options: makeOptions(total - remove), difficulty: d };
  }

  if (lessonId === "y1-w6-l3") {
    const pick = randInt(0, 2);
    if (pick === 0) {
      const maxTotal = d === "easy" ? 14 : 20;
      const total = randInt(11, maxTotal);
      const jumpToTen = total - 10;
      const remove = randInt(Math.max(2, jumpToTen), Math.min(9, total - 1));
      return { kind: "mentalSubtract", strategy: "make10", total, remove, options: makeOptions(total - remove), answer: total - remove, difficulty: d };
    }
    if (pick === 1) {
      const { total, remove } = makeSubtractPair(d);
      return { kind: "mentalSubtract", strategy: "factFamily", total, remove, options: makeOptions(total - remove), answer: total - remove, difficulty: d };
    }
    const maxTotal = d === "easy" ? 14 : 20;
    const total = randInt(10, maxTotal);
    const remove = randInt(4, Math.min(10, total - 1));
    const answer = total - remove;
    return { kind: "mentalSubtract", strategy: "countUp", total, remove, options: makeOptions(answer), answer, difficulty: d };
  }

  return generateWeek6Task("y1-w6-l1", ctx, d);
}
