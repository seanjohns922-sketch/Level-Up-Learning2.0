import type { PracticeTask } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeSubtractPair(): { total: number; remove: number; answer: number } {
  const r = Math.random();
  let total = 10;
  let remove = 5;

  if (r < 0.4) {
    // crossing 10
    total = randInt(11, 20);
    const minRemove = Math.max(2, total - 9);
    remove = randInt(minRemove, 9);
  } else if (r < 0.6) {
    // doubles
    const n = randInt(3, 10);
    total = n + n;
    remove = n;
  } else if (r < 0.8) {
    // near doubles
    const n = randInt(3, 9);
    const plusOne = Math.random() < 0.5;
    total = n + (plusOne ? n + 1 : n - 1);
    remove = n;
  } else {
    total = randInt(6, 20);
    remove = randInt(1, Math.min(10, total - 1));
  }

  return { total, remove, answer: total - remove };
}

function makeMentalMake10Pair() {
  const total = randInt(11, 20);
  const jumpToTen = total - 10;
  const remove = randInt(Math.max(2, jumpToTen), 9);
  return { total, remove, answer: total - remove };
}

function makeCountUpPair() {
  const total = randInt(10, 20);
  const remove = randInt(4, 10);
  const answer = total - remove;
  if (answer >= 2 && answer <= 7) return { total, remove, answer };
  return { total, remove: Math.min(10, total - 3), answer: total - Math.min(10, total - 3) };
}

function makeOptions(answer: number, min = 0, max = 20) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = randInt(min, max);
    set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5).map(String);
}

export function generateWeek6Task(
  lessonId: string,
  ctx?: { secondsLeft: number; totalSeconds: number }
): PracticeTask {
  if (lessonId === "y1-w6-l1") {
    const elapsed = ctx ? ctx.totalSeconds - ctx.secondsLeft : 0;
    const easyMode = elapsed < 4 * 60;
    const pair = easyMode
      ? (() => {
          const total = randInt(6, 12);
          const remove = randInt(1, Math.min(5, total - 1));
          return { total, remove, answer: total - remove };
        })()
      : makeSubtractPair();
    const { total, remove } = pair;
    const modePick = randInt(0, 2);
    const mode =
      modePick === 0 ? "equation" : modePick === 1 ? "takeAway" : "startWith";
    return {
      kind: "subtractTakeAway",
      total,
      remove,
      mode,
    };
  }

  if (lessonId === "y1-w6-l2") {
    const { total, remove } = makeSubtractPair();
    const modePick = randInt(0, 2);
    if (modePick === 0) {
      return {
        kind: "subtractMissingPart",
        total,
        part: remove,
        options: makeOptions(total - remove),
      };
    }
    if (modePick === 1) {
      return {
        kind: "subtractMoveToTaken",
        total,
        remove,
      };
    }
    return {
      kind: "subtractBar",
      total,
      remove,
      options: makeOptions(total - remove),
    };
  }

  if (lessonId === "y1-w6-l3") {
    const pick = randInt(0, 2);
    if (pick === 0) {
      const { total, remove } = makeMentalMake10Pair();
      return {
        kind: "mentalSubtract",
        strategy: "make10",
        total,
        remove,
        options: makeOptions(total - remove),
        answer: total - remove,
      };
    }
    if (pick === 1) {
      const { total, remove } = makeSubtractPair();
      return {
        kind: "mentalSubtract",
        strategy: "factFamily",
        total,
        remove,
        options: makeOptions(total - remove),
        answer: total - remove,
      };
    }
    const { total, remove, answer } = makeCountUpPair();
    return {
      kind: "mentalSubtract",
      strategy: "countUp",
      total,
      remove,
      options: makeOptions(answer),
      answer,
    };
  }

  return generateWeek6Task("y1-w6-l1", ctx);
}
