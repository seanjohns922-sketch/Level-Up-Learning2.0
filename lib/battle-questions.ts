// Battle questions: quick-fire maths for friend battles, made on the spot for each realm at each level
// (0 = Prep/Ground .. 8). Every answer is a whole number typed in, so battles are fast and marked on the
// spot. Each explorer gets questions at their own level, so two friends on different levels battle fairly.
// Pure and seeded, so a battle can be replayed and tested.
import { rexRandom } from "./rex";

export const BATTLE_REALMS = ["number", "measurement", "pattern", "statistics", "space", "chance"] as const;
export type BattleRealm = (typeof BATTLE_REALMS)[number];
export type BattleQuestion = { prompt: string; answer: number };

/** Questions in a battle, and how long it lasts. */
export const BATTLE_QUESTIONS = 20;
export const BATTLE_SECONDS = 300;

type Rnd = () => number;
const int = (rnd: Rnd, lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = <T,>(rnd: Rnd, list: readonly T[]) => list[Math.floor(rnd() * list.length)];
const q = (prompt: string, answer: number): BattleQuestion => ({ prompt, answer });
const clampLevel = (level: number) => Math.max(0, Math.min(8, Math.round(level)));

function number(level: number, rnd: Rnd): BattleQuestion {
  const k = int(rnd, 0, 2);
  switch (level) {
    case 0: { const a = int(rnd, 1, 6), b = int(rnd, 1, 10 - a); return k ? q(`${a} + ${b} = ?`, a + b) : q(`What comes after ${a + b}?`, a + b + 1); }
    case 1: { const a = int(rnd, 4, 15), b = int(rnd, 1, Math.min(9, a)); return k ? q(`${a} − ${b} = ?`, a - b) : q(`${a} + ${b} = ?`, a + b); }
    case 2: { if (k === 0) { const a = int(rnd, 2, 9) * 10, b = int(rnd, 1, 9) * 10; return q(`${a} + ${b} = ?`, a + b); } if (k === 1) { const a = int(rnd, 2, 25); return q(`Double ${a} = ?`, a * 2); } const a = int(rnd, 11, 60), b = int(rnd, 2, 9); return q(`${a} + ${b} = ?`, a + b); }
    case 3: { if (k === 0) { const t = pick(rnd, [2, 3, 5, 10]), n = int(rnd, 2, 10); return q(`${n} × ${t} = ?`, n * t); } if (k === 1) { const a = int(rnd, 25, 95), b = int(rnd, 11, Math.min(40, a - 1)); return q(`${a} − ${b} = ?`, a - b); } const t = pick(rnd, [2, 5, 10]), n = int(rnd, 2, 10); return q(`${n * t} ÷ ${t} = ?`, n); }
    case 4: { if (k === 0) { const a = int(rnd, 2, 10), b = int(rnd, 2, 10); return q(`${a} × ${b} = ?`, a * b); } if (k === 1) { const a = int(rnd, 2, 9), b = int(rnd, 2, 10); return q(`${a * b} ÷ ${a} = ?`, b); } const a = int(rnd, 120, 890), b = int(rnd, 1, 9) * 10; return q(`${a} + ${b} = ?`, a + b); }
    case 5: { if (k === 0) { const a = int(rnd, 3, 12), b = int(rnd, 3, 12); return q(`${a} × ${b} = ?`, a * b); } if (k === 1) { const a = int(rnd, 12, 48), b = int(rnd, 2, 6); return q(`${a} × ${b} = ?`, a * b); } const a = int(rnd, 4, 99); return q(`${a} × 100 = ?`, a * 100); }
    case 6: { if (k === 0) { const d = pick(rnd, [2, 3, 4, 5, 10]), n = int(rnd, 2, 12) * d; return q(`1/${d} of ${n} = ?`, n / d); } if (k === 1) { const p = pick(rnd, [10, 25, 50]), base = int(rnd, 2, 20) * (p === 10 ? 10 : p === 25 ? 4 : 2); return q(`${p}% of ${base} = ?`, (base * p) / 100); } const a = int(rnd, 6, 12), b = int(rnd, 6, 12); return q(`${a * b} ÷ ${b} = ?`, a); }
    case 7: { if (k === 0) { const a = int(rnd, 2, 15), b = int(rnd, a + 1, a + 20); return q(`−${a} + ${b} = ?`, b - a); } if (k === 1) { const n = int(rnd, 2, 15); return q(`${n}² = ?`, n * n); } const p = pick(rnd, [10, 20, 25, 50]), base = int(rnd, 2, 30) * (p === 25 ? 4 : p === 50 ? 2 : 10); return q(`${p}% of ${base} = ?`, (base * p) / 100); }
    default: { if (k === 0) { const x = int(rnd, 2, 15), m = int(rnd, 2, 6), c = int(rnd, 1, 15); return q(`${m}x + ${c} = ${m * x + c}. x = ?`, x); } if (k === 1) { const b = pick(rnd, [2, 3, 5, 10]), e = b === 10 ? int(rnd, 2, 4) : int(rnd, 2, b === 2 ? 6 : 3); return q(`${b}^${e} = ?`, b ** e); } const n = int(rnd, 4, 15); return q(`√${n * n} = ?`, n); }
  }
}

function measurement(level: number, rnd: Rnd): BattleQuestion {
  const k = int(rnd, 0, 2);
  switch (level) {
    case 0: { const a = int(rnd, 4, 9), b = int(rnd, 1, a - 1); return k ? q(`A snake is ${a} blocks long. A worm is ${b} blocks. How many blocks longer is the snake?`, a - b) : q("How many days are in a week?", 7); }
    case 1: { const h = int(rnd, 1, 10); return k === 0 ? q(`What time is 1 hour after ${h} o'clock? (type the hour)`, h + 1) : k === 1 ? q("How many minutes are in an hour?", 60) : q("How many hours are in a day?", 24); }
    case 2: { const n = int(rnd, 2, 9); return k === 0 ? q("How many centimetres are in a metre?", 100) : k === 1 ? q(`How many 10c coins make ${n * 10}c?`, n) : q(`How many days are in ${n} weeks?`, n * 7); }
    case 3: { const m = int(rnd, 2, 9), w = int(rnd, 2, 9), h = int(rnd, 2, 9); return k === 0 ? q(`${m} m = ? cm`, m * 100) : k === 1 ? q(`A rectangle is ${w} cm by ${h} cm. Perimeter = ? cm`, 2 * (w + h)) : q(`${m} hours = ? minutes`, m * 60); }
    case 4: { const w = int(rnd, 2, 12), h = int(rnd, 2, 9), kg = int(rnd, 2, 9); return k === 0 ? q(`A rectangle is ${w} cm by ${h} cm. Area = ? cm²`, w * h) : k === 1 ? q(`${kg} kg = ? g`, kg * 1000) : q(`${kg} minutes = ? seconds`, kg * 60); }
    case 5: { const cm = int(rnd, 2, 30), l = int(rnd, 2, 9), w = int(rnd, 3, 15); return k === 0 ? q(`${cm} cm = ? mm`, cm * 10) : k === 1 ? q(`${l} L = ? mL`, l * 1000) : q(`A square has sides of ${w} m. Perimeter = ? m`, 4 * w); }
    case 6: { const b = int(rnd, 2, 10) * 2, h = int(rnd, 2, 10), x = int(rnd, 2, 6), y = int(rnd, 2, 6), z = int(rnd, 2, 5); return k === 0 ? q(`A triangle has base ${b} cm and height ${h} cm. Area = ? cm²`, (b * h) / 2) : k === 1 ? q(`A box is ${x} × ${y} × ${z} cm. Volume = ? cm³`, x * y * z) : q(`${x} km = ? m`, x * 1000); }
    case 7: { const b = int(rnd, 3, 15), h = int(rnd, 2, 12), a = int(rnd, 4, 20), l = int(rnd, 2, 10); return k === 0 ? q(`A parallelogram has base ${b} m and height ${h} m. Area = ? m²`, b * h) : k === 1 ? q(`A prism has a base area of ${a} cm² and length ${l} cm. Volume = ? cm³`, a * l) : q(`${a * 100} cm = ? m`, a); }
    default: { const s = int(rnd, 1, 4), a = int(rnd, 3, 12), b = a + int(rnd, 2, 8), h = int(rnd, 1, 6) * 2; return k === 0 ? q(`A right triangle has short sides ${3 * s} and ${4 * s}. Longest side = ?`, 5 * s) : k === 1 ? q(`A trapezium has parallel sides ${a} and ${b} and height ${h}. Area = ?`, ((a + b) * h) / 2) : q(`A right triangle has short sides ${5 * s} and ${12 * s}. Longest side = ?`, 13 * s); }
  }
}

function pattern(level: number, rnd: Rnd): BattleQuestion {
  const seq = (start: number, step: number, len = 4) => Array.from({ length: len }, (_, i) => start + step * i);
  switch (level) {
    case 0: { const s = int(rnd, 1, 6), list = seq(s, 1); return q(`What comes next? ${list.join(", ")}, ?`, s + 4); }
    case 1: { const s = int(rnd, 0, 10) * 2, list = seq(s, 2); return q(`Count by 2s. What comes next? ${list.join(", ")}, ?`, s + 8); }
    case 2: { const step = pick(rnd, [5, 10]), s = int(rnd, 0, 8) * step, list = seq(s, step); const gap = int(rnd, 1, 2); return q(`What's the missing number? ${list.map((n, i) => (i === gap ? "?" : n)).join(", ")}`, list[gap]); }
    case 3: { const step = pick(rnd, [3, 4, 6, -2, -3]), s = int(rnd, 20, 40), list = seq(s, step); return q(`What comes next? ${list.join(", ")}, ?`, s + step * 4); }
    case 4: { const s = int(rnd, 1, 4), list = Array.from({ length: 4 }, (_, i) => s * 2 ** i); return q(`Each number doubles. What comes next? ${list.join(", ")}, ?`, s * 16); }
    case 5: { const m = int(rnd, 2, 5), c = int(rnd, 1, 9), inp = int(rnd, 3, 9); return q(`The rule is ×${m} then +${c}. Input ${inp} → output ?`, inp * m + c); }
    case 6: { const a = int(rnd, 2, 5), list = Array.from({ length: 4 }, (_, i) => a + i * (i + 1) / 2 * 2); return q(`The gaps grow by 2 each time. What comes next? ${list.join(", ")}, ?`, a + 20); }
    case 7: { const m = int(rnd, 2, 7), c = int(rnd, 1, 12), n = int(rnd, 2, 10); return q(`What is ${m}n + ${c} when n = ${n}?`, m * n + c); }
    default: { const m = int(rnd, 2, 9), c = int(rnd, -5, 9), n = int(rnd, 10, 30); return q(`The nth term is ${m}n ${c < 0 ? "−" : "+"} ${Math.abs(c)}. What is the ${n}th term?`, m * n + c); }
  }
}

function statistics(level: number, rnd: Rnd): BattleQuestion {
  const list = (n: number, lo: number, hi: number) => Array.from({ length: n }, () => int(rnd, lo, hi));
  switch (level) {
    case 0: { const n = int(rnd, 2, 9), thing = pick(rnd, ["🍎", "⭐", "🐟", "🌸"]); return q(`How many? ${thing.repeat(n)}`, n); }
    case 1: { const a = int(rnd, 2, 9), b = int(rnd, 2, 9); return q(`There are ${a} red and ${b} blue counters. How many altogether?`, a + b); }
    case 2: { const mode = int(rnd, 1, 9), others = list(3, 1, 9).filter((x) => x !== mode); const data = [mode, mode, mode, ...others].sort(() => rnd() - 0.5); return q(`Which number appears most? ${data.join(", ")}`, mode); }
    case 3: { const data = list(4, 2, 15); return int(rnd, 0, 1) ? q(`Add up the votes: ${data.join(", ")}. Total = ?`, data.reduce((s, x) => s + x, 0)) : q(`Cats got ${data[0] + 10} votes and dogs got ${data[1]}. How many more votes for cats?`, data[0] + 10 - data[1]); }
    case 4: { const data = list(5, 1, 30); return q(`What is the range? ${data.join(", ")}`, Math.max(...data) - Math.min(...data)); }
    case 5: { const n = int(rnd, 3, 4), mean = int(rnd, 3, 15), data = list(n - 1, 1, mean * 2); const last = mean * n - data.reduce((s, x) => s + x, 0); if (last < 0) return q(`What is the range? ${data.join(", ")}`, Math.max(...data) - Math.min(...data)); return q(`What is the mean? ${[...data, last].join(", ")}`, mean); }
    case 6: { const data = list(5, 1, 40); const sorted = [...data].sort((a, b) => a - b); return q(`What is the median? ${data.join(", ")}`, sorted[2]); }
    case 7: { const mean = int(rnd, 5, 30), data = list(4, 1, mean * 2); const last = mean * 5 - data.reduce((s, x) => s + x, 0); if (last < 0) return q(`What is the median? ${[...data, 3].join(", ")}`, [...data, 3].sort((a, b) => a - b)[2]); return q(`What is the mean? ${[...data, last].join(", ")}`, mean); }
    default: { const data = list(7, 10, 99); const sorted = [...data].sort((a, b) => a - b); return int(rnd, 0, 1) ? q(`What is the median? ${data.join(", ")}`, sorted[3]) : q(`What is the range? ${data.join(", ")}`, sorted[6] - sorted[0]); }
  }
}

const SHAPES: Array<[string, number]> = [["triangle", 3], ["square", 4], ["rectangle", 4], ["pentagon", 5], ["hexagon", 6], ["octagon", 8]];
function space(level: number, rnd: Rnd): BattleQuestion {
  switch (level) {
    case 0: { const [name, sides] = pick(rnd, SHAPES.slice(0, 3)); return q(`How many corners does a ${name} have?`, sides); }
    case 1: { const [name, sides] = pick(rnd, SHAPES); return q(`How many sides does a ${name} have?`, sides); }
    case 2: return pick(rnd, [q("How many faces does a cube have?", 6), q("How many corners does a cube have?", 8), q("How many edges does a cube have?", 12), q("How many faces does a square pyramid have?", 5)]);
    case 3: return pick(rnd, [q("How many quarter turns make a full turn?", 4), q("How many lines of symmetry does a square have?", 4), q("How many half turns make a full turn?", 2), q("How many lines of symmetry does a rectangle have?", 2)]);
    case 4: { const a = int(rnd, 20, 160); return int(rnd, 0, 1) ? q(`Angles on a straight line add to 180°. One is ${a}°. The other = ?°`, 180 - a) : q("How many degrees in a right angle?", 90); }
    case 5: { const a = int(rnd, 30, 90), b = int(rnd, 20, 150 - a); return q(`A triangle has angles of ${a}° and ${b}°. The third angle = ?°`, 180 - a - b); }
    case 6: { const a = int(rnd, 60, 150), b = int(rnd, 40, 300 - a - 20); return int(rnd, 0, 1) ? q(`Angles round a point: ${a}°, ${b}° and ?°`, 360 - a - b) : q(`A quadrilateral has angles 90°, 90°, ${a}° and ?°`, 180 - a); }
    case 7: { const [name, n] = pick(rnd, SHAPES.slice(3)); return q(`The angles inside a ${name} add up to ?°`, (n - 2) * 180); }
    default: { const n = pick(rnd, [5, 6, 8, 10, 12]); return int(rnd, 0, 1) ? q(`A regular polygon has ${n} sides. Each exterior angle = ?°`, 360 / n) : q(`A regular polygon has ${n} sides. Each interior angle = ?°`, 180 - 360 / n); }
  }
}

function chance(level: number, rnd: Rnd): BattleQuestion {
  switch (level) {
    case 0: return pick(rnd, [q("How many sides does a coin have?", 2), q("How many dots are on the top of a dice showing three?", 3), q("A bag has 4 red balls. How many balls are in the bag?", 4)]);
    case 1: return pick(rnd, [q("How many faces does a dice have?", 6), q("How many even numbers are on a dice?", 3), q("How many odd numbers are on a dice?", 3)]);
    case 2: { const parts = pick(rnd, [4, 6, 8]), red = int(rnd, 1, parts - 1); return q(`A spinner has ${parts} equal parts. ${red} are red. How many are not red?`, parts - red); }
    case 3: { const total = int(rnd, 6, 15), blue = int(rnd, 1, total - 1); return q(`There are ${total} marbles and ${blue} are blue. How many are not blue?`, total - blue); }
    case 4: { const x = int(rnd, 1, 5); return q(`A dice is rolled. How many of its numbers are greater than ${x}?`, 6 - x); }
    case 5: return pick(rnd, [q("What is the chance of heads, as a percentage?", 50), q("A 1 in 4 chance is what percentage?", 25), q("A 1 in 10 chance is what percentage?", 10), q("A 3 in 4 chance is what percentage?", 75)]);
    case 6: { const n = pick(rnd, [6, 12, 30, 60, 120]); return q(`A dice is rolled ${n} times. About how many times would you expect a 6?`, n / 6); }
    case 7: { const p = int(rnd, 1, 9) * 10; return q(`The chance of rain is ${p}%. The chance of no rain = ?%`, 100 - p); }
    default: return pick(rnd, [q("Two coins are tossed. How many possible outcomes are there?", 4), q("Two coins are tossed. Chance of two heads = ?%", 25), q("Two dice are rolled. How many ways can they add to 7?", 6), q("Two dice are rolled. How many possible outcomes are there?", 36)]);
  }
}

const MAKERS: Record<BattleRealm, (level: number, rnd: Rnd) => BattleQuestion> = { number, measurement, pattern, statistics, space, chance };

/**
 * A battle's 20 questions for one explorer: their realm and level, from a seed. No question repeats while
 * there are fresh ones to be had (a few small Prep sets have fewer than 20, so those may come round
 * again, but never twice in a row).
 */
export function battleQuestions(realm: BattleRealm, level: number, seed: number, count = BATTLE_QUESTIONS): BattleQuestion[] {
  const rnd = rexRandom(seed), make = MAKERS[realm], at = clampLevel(level), out: BattleQuestion[] = [], used = new Set<string>();
  for (let tries = 0; out.length < count && tries < count * 60; tries++) {
    const next = make(at, rnd);
    const fresh = !used.has(next.prompt), notLast = !out.length || out[out.length - 1].prompt !== next.prompt;
    // Insist on fresh questions for most of the tries, then settle for "not the same as last time".
    if (tries < count * 40 ? !fresh : !notLast) continue;
    used.add(next.prompt);
    out.push(next);
  }
  return out;
}
