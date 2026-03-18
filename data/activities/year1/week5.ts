import type { PracticeTask, Difficulty } from "./practice-task";
import { diffRange } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeAddends(d: Difficulty) {
  const [lo, hi] = diffRange(d, [0, 10], [0, 15], [10, 99]);
  const maxDots = d === "hard" ? 20 : 10;
  const target = randInt(lo, hi);
  if (d === "hard") {
    const a = randInt(10, Math.min(target, 99));
    const b = target - a;
    if (b >= 10 && b <= 99) return { a, b, maxDots };
    const safeA = randInt(10, 50);
    const safeB = randInt(10, 49);
    return { a: safeA, b: safeB, maxDots };
  }
  for (let i = 0; i < 20; i += 1) {
    const a = randInt(0, Math.min(target, maxDots));
    const b = target - a;
    if (b <= maxDots) return { a, b, maxDots };
  }
  const a = Math.min(maxDots, target);
  return { a, b: target - a, maxDots };
}

function makeParts(d: Difficulty): { a: number; b: number; whole: number } {
  const maxWhole = d === "easy" ? 10 : d === "medium" ? 15 : 20;
  const r = Math.random();
  if (r < 0.2) {
    const a = randInt(1, Math.min(9, maxWhole - 1));
    const b = Math.min(maxWhole, 10) - a;
    return { a, b, whole: a + b };
  }
  if (r < 0.35 && d !== "easy") {
    const n = randInt(1, Math.floor(maxWhole / 2));
    return { a: n, b: n, whole: n + n };
  }
  let a = 0, b = 0, whole = 0;
  for (let i = 0; i < 30; i += 1) {
    a = randInt(0, Math.min(10, maxWhole));
    b = randInt(0, Math.min(10, maxWhole));
    whole = a + b;
    if (whole <= maxWhole && !(a === 0 && b === 0)) break;
  }
  return { a, b, whole };
}

function makeMentalAddTask(d: Difficulty) {
  let equation = "";
  let answer = 0;
  let prompt = "";
  let strategy: "make10" | "double" | "nearDouble" = "make10";
  let a = 0, b = 0;

  const maxA = d === "easy" ? 5 : d === "medium" ? 7 : 9;
  const r = Math.random();

  if (r < 0.4) {
    for (let i = 0; i < 20; i += 1) {
      a = randInt(d === "easy" ? 2 : 6, maxA);
      const need = 10 - a;
      b = randInt(Math.max(d === "easy" ? 1 : 6, need), maxA);
      if (b >= need) break;
    }
    equation = `${a} + ${b}`;
    answer = a + b;
    prompt = "Make 10 fast!";
    strategy = "make10";
  } else if (r < 0.7) {
    const n = randInt(1, d === "easy" ? 5 : 10);
    a = n; b = n;
    equation = `${a} + ${b}`;
    answer = a + b;
    prompt = "Doubles!";
    strategy = "double";
  } else {
    const n = randInt(2, d === "easy" ? 5 : 9);
    const plusOne = Math.random() < 0.5;
    a = n; b = plusOne ? n + 1 : n - 1;
    equation = `${a} + ${b}`;
    answer = a + b;
    prompt = "Near doubles!";
    strategy = "nearDouble";
  }

  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(Math.max(0, answer + randInt(-3, 3)));
  const options = Array.from(set).sort(() => Math.random() - 0.5);
  return { equation, answer, options, prompt, strategy, a, b };
}

export function generateWeek5Task(
  lessonId: string,
  ctx?: { secondsLeft: number; totalSeconds: number },
  d: Difficulty = "easy"
): PracticeTask {
  if (lessonId === "y1-w5-l1") {
    const { a, b, maxDots } = makeAddends(d);
    return { kind: "addDots", prompt: "Show each addend with dots.", a, b, maxDots, difficulty: d };
  }
  if (lessonId === "y1-w5-l2") {
    const { a, b, whole } = makeParts(d);
    const modePick = randInt(0, 2);
    if (modePick === 0) return { kind: "ppw", prompt: "What is the WHOLE?", mode: "missingWhole", a, b, whole, difficulty: d };
    if (modePick === 1) {
      const missing = Math.random() < 0.5 ? "a" : "b";
      return { kind: "ppw", prompt: "What is the missing PART?", mode: "missingPart", a, b, whole, missing, difficulty: d };
    }
    return { kind: "ppw", prompt: "Build the two parts with dots.", mode: "build", a, b, whole, difficulty: d };
  }
  if (lessonId === "y1-w5-l3") {
    const mental = makeMentalAddTask(d);
    return { kind: "mentalAdd", prompt: mental.prompt, equation: mental.equation, strategy: mental.strategy, a: mental.a, b: mental.b, options: mental.options, answer: mental.answer, difficulty: d };
  }

  const { a, b } = makeParts(d);
  return { kind: "addDots", prompt: "Show each addend with dots.", a, b, maxDots: 10, difficulty: d };
}
