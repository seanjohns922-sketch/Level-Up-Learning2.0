// Rex the maths T-rex: a teacher or parent sends him (or he wakes after 15 minutes in the hub without a
// lesson), he chases the explorer, five easy questions at their level tame him for 50 XP, and he only
// leaves once they finish a lesson. The server sets the XP and keeps the visits (see the rex_visits
// migration); this file holds the rules the screens show and the question maker. Pure, so it can be tested.

/** Right answers that tame Rex. */
export const REX_QUESTIONS = 5;
/** XP for taming him (set by the server; shown here). */
export const REX_XP = 50;
/** Paid at most this many times a day (set by the server). */
export const REX_XP_VISITS_PER_DAY = 3;
/** Minutes in the hub without a lesson before Rex wakes by himself (the server holds the same gap). */
export const REX_WAKE_MINUTES = 15;

export type RexQuestion = { prompt: string; answer: number; help: string };

/** A level number from a route or year label: Ground/Prep/Foundation is 0, "Year 3" or "Level 3" is 3. */
export function rexLevelFrom(...labels: Array<string | null | undefined>): number {
  for (const raw of labels) {
    if (!raw) continue;
    const text = decodeURIComponent(raw.includes("level=") ? raw.split("level=")[1].split("&")[0] : raw).replace(/\+/g, " ");
    if (/ground|prep|foundation|kinder/i.test(text)) return 0;
    const n = /(\d+)/.exec(text);
    if (n) return Math.max(0, Math.min(8, Number(n[1])));
  }
  return 3;
}

/** A small seeded random generator, so a visit's questions can be replayed and tested. */
export function rexRandom(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const pick = (rnd: () => number, lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));

/** One easy question at a level: quick recall the explorer has already learnt, answered by typing a number. */
export function rexQuestion(level: number, rnd: () => number): RexQuestion {
  const kind = pick(rnd, 0, 1);
  switch (Math.max(0, Math.min(8, Math.round(level)))) {
    case 0: {
      const a = pick(rnd, 1, 4), b = pick(rnd, 1, 5 - a);
      return { prompt: `${a} + ${b} = ?`, answer: a + b, help: `Start at ${a} and count on ${b}: that's ${a + b}.` };
    }
    case 1: {
      if (kind) { const a = pick(rnd, 3, 9), b = pick(rnd, 1, a - 1); return { prompt: `${a} − ${b} = ?`, answer: a - b, help: `Start at ${a} and count back ${b}: that's ${a - b}.` }; }
      const a = pick(rnd, 1, 6), b = pick(rnd, 1, 10 - a);
      return { prompt: `${a} + ${b} = ?`, answer: a + b, help: `Start at the bigger number and count on: ${a} + ${b} = ${a + b}.` };
    }
    case 2: {
      if (kind) { const a = pick(rnd, 2, 10); return { prompt: `Double ${a} = ?`, answer: a * 2, help: `Double means two lots: ${a} + ${a} = ${a * 2}.` }; }
      const a = pick(rnd, 6, 12), b = pick(rnd, 2, 8);
      return { prompt: `${a} + ${b} = ?`, answer: a + b, help: `Make a ten first: ${a} + ${b} = ${a + b}.` };
    }
    case 3: {
      if (kind) { const t = [2, 5, 10][pick(rnd, 0, 2)], n = pick(rnd, 2, 10); return { prompt: `${n} × ${t} = ?`, answer: n * t, help: `Count by ${t}s, ${n} times: ${n} × ${t} = ${n * t}.` }; }
      const a = pick(rnd, 2, 8) * 10 + pick(rnd, 1, 4), b = pick(rnd, 1, 5);
      return { prompt: `${a} + ${b} = ?`, answer: a + b, help: `Add the ones: ${a % 10} + ${b} = ${(a % 10) + b}, so ${a} + ${b} = ${a + b}.` };
    }
    case 4: {
      const t = pick(rnd, 2, 6), n = pick(rnd, 2, 9);
      if (kind) return { prompt: `${n * t} ÷ ${t} = ?`, answer: n, help: `How many ${t}s make ${n * t}? ${n} × ${t} = ${n * t}, so the answer is ${n}.` };
      return { prompt: `${n} × ${t} = ?`, answer: n * t, help: `${n} lots of ${t}: ${n} × ${t} = ${n * t}.` };
    }
    case 5: {
      if (kind) { const n = pick(rnd, 3, 45); return { prompt: `${n} × 10 = ?`, answer: n * 10, help: `Times 10 moves every digit one place bigger: ${n} × 10 = ${n * 10}.` }; }
      const a = pick(rnd, 3, 9), b = pick(rnd, 3, 9);
      return { prompt: `${a} × ${b} = ?`, answer: a * b, help: `Use a fact you know: ${a} × ${b} = ${a * b}.` };
    }
    case 6: {
      if (kind) { const n = pick(rnd, 2, 12) * 4; return { prompt: `Half of ${n} = ?`, answer: n / 2, help: `Half means share into 2 equal parts: ${n} ÷ 2 = ${n / 2}.` }; }
      const a = pick(rnd, 6, 12), b = pick(rnd, 3, 9);
      return { prompt: `${a * b} ÷ ${b} = ?`, answer: a, help: `Think of the times fact: ${a} × ${b} = ${a * b}, so ${a * b} ÷ ${b} = ${a}.` };
    }
    case 7: {
      if (kind) { const n = pick(rnd, 2, 12) * 10; return { prompt: `10% of ${n} = ?`, answer: n / 10, help: `10% is one tenth: ${n} ÷ 10 = ${n / 10}.` }; }
      const a = pick(rnd, 2, 9), b = pick(rnd, a + 1, a + 8);
      return { prompt: `−${a} + ${b} = ?`, answer: b - a, help: `Start at −${a} on the number line and move ${b} to the right: you land on ${b - a}.` };
    }
    default: {
      if (kind) { const n = pick(rnd, 2, 12); return { prompt: `${n}² = ?`, answer: n * n, help: `Squared means times itself: ${n} × ${n} = ${n * n}.` }; }
      const x = pick(rnd, 2, 15), b = pick(rnd, 2, 12);
      return { prompt: `x + ${b} = ${x + b}. x = ?`, answer: x, help: `Take ${b} from both sides: x = ${x + b} − ${b} = ${x}.` };
    }
  }
}

/** Reads a typed answer: a whole number or decimal, with a normal or maths minus sign. */
export function readRexAnswer(text: string): number | null {
  const cleaned = text.trim().replace(/[−–]/g, "-").replace(/\s+/g, "");
  return /^-?\d+(\.\d+)?$/.test(cleaned) ? Number(cleaned) : null;
}
