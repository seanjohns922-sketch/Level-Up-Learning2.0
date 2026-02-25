import type { PracticeTask } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeAddends(sumMax: number, maxDots: number) {
  const target = randInt(0, sumMax);
  for (let i = 0; i < 20; i += 1) {
    const a = randInt(0, Math.min(target, maxDots));
    const b = target - a;
    if (b <= maxDots) return { a, b };
  }
  // fallback
  const a = Math.min(maxDots, target);
  return { a, b: target - a };
}

function makeParts(): { a: number; b: number; whole: number } {
  const r = Math.random();
  if (r < 0.2) {
    const a = randInt(1, 9);
    const b = 10 - a;
    return { a, b, whole: 10 };
  }
  if (r < 0.35) {
    const n = randInt(1, 10);
    return { a: n, b: n, whole: n + n };
  }
  let a = 0;
  let b = 0;
  let whole = 0;
  for (let i = 0; i < 30; i += 1) {
    a = randInt(0, 10);
    b = randInt(0, 10);
    whole = a + b;
    if (whole <= 20 && !(a === 0 && b === 0)) break;
  }
  return { a, b, whole };
}

function makeMentalAddTask(): {
  equation: string;
  answer: number;
  options: number[];
  prompt: string;
  strategy: "make10" | "double" | "nearDouble";
  a: number;
  b: number;
} {
  const r = Math.random();
  let equation = "";
  let answer = 0;
  let prompt = "";
  let strategy: "make10" | "double" | "nearDouble" = "make10";
  let a = 0;
  let b = 0;

  if (r < 0.4) {
    // Make-10 strategy with mid-teen totals (e.g., 8 + 7)
    for (let i = 0; i < 20; i += 1) {
      a = randInt(6, 9);
      const need = 10 - a;
      b = randInt(Math.max(6, need), 9);
      if (b >= need) break;
    }
    equation = `${a} + ${b}`;
    answer = a + b;
    prompt = "Make 10 fast!";
    strategy = "make10";
  } else if (r < 0.7) {
    const n = randInt(1, 10);
    a = n;
    b = n;
    equation = `${a} + ${b}`;
    answer = a + b;
    prompt = "Doubles!";
    strategy = "double";
  } else {
    const n = randInt(2, 9);
    const plusOne = Math.random() < 0.5;
    a = n;
    b = plusOne ? n + 1 : n - 1;
    const swap = Math.random() < 0.5;
    equation = swap ? `${b} + ${a}` : `${a} + ${b}`;
    answer = a + b;
    prompt = "Near doubles!";
    strategy = "nearDouble";
  }

  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const candidate = Math.max(0, answer + randInt(-3, 3));
    set.add(candidate);
  }
  const options = Array.from(set).sort(() => Math.random() - 0.5);
  return { equation, answer, options, prompt, strategy, a, b };
}

export function generateWeek5Task(
  lessonId: string,
  ctx?: { secondsLeft: number; totalSeconds: number }
): PracticeTask {
  if (lessonId === "y1-w5-l1") {
    const elapsed = ctx ? ctx.totalSeconds - ctx.secondsLeft : 0;
    const sumMax = elapsed >= 6 * 60 ? 30 : elapsed >= 3 * 60 ? 20 : 10;
    const maxDots = sumMax > 20 ? 15 : 10;
    const { a, b } = makeAddends(sumMax, maxDots);
    return {
      kind: "addDots",
      prompt: "Show each addend with dots.",
      a,
      b,
      maxDots,
    };
  }
  if (lessonId === "y1-w5-l2") {
    const { a, b, whole } = makeParts();
    const modePick = randInt(0, 2);
    if (modePick === 0) {
      return {
        kind: "ppw",
        prompt: "What is the WHOLE?",
        mode: "missingWhole",
        a,
        b,
        whole,
      };
    }
    if (modePick === 1) {
      const missing = Math.random() < 0.5 ? "a" : "b";
      return {
        kind: "ppw",
        prompt: "What is the missing PART?",
        mode: "missingPart",
        a,
        b,
        whole,
        missing,
      };
    }
    return {
      kind: "ppw",
      prompt: "Build the two parts with dots.",
      mode: "build",
      a,
      b,
      whole,
    };
  }
  if (lessonId === "y1-w5-l3") {
    const mental = makeMentalAddTask();
    return {
      kind: "mentalAdd",
      prompt: mental.prompt,
      equation: mental.equation,
      strategy: mental.strategy,
      a: mental.a,
      b: mental.b,
      options: mental.options,
      answer: mental.answer,
    };
  }

  const { a, b } = makeParts();
  return {
    kind: "addDots",
    prompt: "Show each addend with dots.",
    a,
    b,
    maxDots: 10,
  };
}
