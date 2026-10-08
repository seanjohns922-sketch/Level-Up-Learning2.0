import type { Algebra8Visual } from "./algebra-visual";
import {
  fraction,
  random,
  rounded,
  table,
  type LessonFactory,
  type QuestionDraft,
} from "./shared";

// Year 8 Algebra (AC9M8A01–A04), modelled on the Year 8 textbook coverage of
// expanding, factorising, equations, inequalities and linear relationships.
type R = (min: number, max: number) => number;
type Form = (r: R) => QuestionDraft;
const pick = <T,>(r: R, xs: readonly T[]) => xs[r(0, xs.length - 1)];
/** Use true minus signs, write 1x as x, and "+ −3" as "− 3", in prompts and working. */
const tidy = (t: string) => t.replace(/(^|[\s(=,])-(\d)/g, "$1−$2").replace(/(?<![\d.])1([a-z])\b/g, "$1").replace(/\+ −/g, "− ").replace(/− −/g, "+ ");
const forms = (seed: number, list: Form[]) => {
  const r = random(seed), q = list[r(0, list.length - 1)](r);
  return { ...q, prompt: tidy(q.prompt), steps: q.steps.map(tidy) };
};
const nz = (r: R, min: number, max: number) => {
  let v = 0;
  while (v === 0) v = r(min, max);
  return v;
};
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** Signed number for display, using a true minus sign. */
const n = (v: number) => (v < 0 ? `−${-v}` : String(v));
/** Join terms such as [[3,"x"],[-4,""]] into "3x − 4". Zero terms are dropped. */
function poly(...parts: [number, string][]): string {
  const terms = parts.filter(([c]) => c !== 0);
  if (!terms.length) return "0";
  return terms
    .map(([c, v], i) => {
      const size = Math.abs(c),
        body = v ? (size === 1 ? v : `${size}${v}`) : String(size);
      return i === 0 ? (c < 0 ? `−${body}` : body) : c < 0 ? ` − ${body}` : ` + ${body}`;
    })
    .join("");
}
const expr = (prompt: string, answer: string, steps: string[], more: Partial<QuestionDraft> = {}): QuestionDraft => ({
  prompt,
  answer,
  steps,
  input: "expression",
  ...more,
});
const expanded = (prompt: string, answer: string, steps: string[], more: Partial<QuestionDraft> = {}) =>
  expr(prompt, answer, steps, { format: "expanded", ...more });
const yesNo = (prompt: string, yes: boolean, steps: string[], more: Partial<QuestionDraft> = {}): QuestionDraft => ({
  prompt,
  answer: yes ? "Yes" : "No",
  steps,
  ...more,
});
const LETTERS = ["a", "b", "k", "m", "p", "t", "w", "x", "y"] as const;
const graph = (title: string, lines: Extract<Algebra8Visual, { kind: "graph" }>["lines"], more: Partial<Extract<Algebra8Visual, { kind: "graph" }>> = {}): Algebra8Visual => ({
  kind: "graph",
  title,
  xMin: -5,
  xMax: 5,
  yMin: -6,
  yMax: 8,
  lines,
  ...more,
});
const rule = (m: number, c: number) => `y = ${poly([m, "x"], [c, ""])}`;
const balance = (left: string, right: string) => ({ kind: "balance" as const, title: "Keep both sides balanced", left, right });

/* ---------- Week 1: build and simplify expressions ---------- */
const writeExpression: Form[] = [
  (r) => {
    const fee = 5 * r(6, 16), rate = 5 * r(8, 19);
    return expr(`A plumber charges a $${fee} call-out fee plus $${rate} per hour. Write an expression for the total cost, in dollars, for n hours.`, poly([rate, "n"], [fee, ""]), [`Each hour costs $${rate}, so n hours cost ${rate}n.`, `Add the one-off call-out fee: ${poly([rate, "n"], [fee, ""])}.`]);
  },
  (r) => {
    const k = r(2, 9), m = r(2, 5);
    return expr(`A number t has ${k} added to it and the result is multiplied by ${m}. Write an expression for the result.`, `${m}(t + ${k})`, [`First add: t + ${k}.`, `Brackets keep the sum together before multiplying: ${m}(t + ${k}), which is ${poly([m, "t"], [m * k, ""])}.`]);
  },
  (r) => {
    const k = r(2, 9);
    return expanded(`A rectangle is x cm wide and its length is ${k} cm more than its width. Write an expression for its perimeter in simplest form.`, poly([4, "x"], [2 * k, ""]), [`Length = x + ${k}.`, `Perimeter = 2 × width + 2 × length = 2x + 2x + ${2 * k} = ${poly([4, "x"], [2 * k, ""])}.`]);
  },
  (r) => {
    const a = r(2, 6), b = r(2, 7), d = r(1, 5);
    return expanded(`Towels cost $c each. Ana buys ${a} towels, Ben buys ${b} and Cai buys ${d}. Write a simplified expression for the total amount spent.`, `${a + b + d}c`, [`The costs are ${a}c, ${b}c and ${d}c.`, `They are like terms: ${a}c + ${b}c + ${d}c = ${a + b + d}c.`]);
  },
  (r) => {
    const fee = 5 * r(4, 10), rate = 5 * r(12, 20);
    const answer = poly([fee, ""], [rate, "x"]);
    return {
      prompt: `An electrician charges a $${fee} call-out fee and $${rate} per hour. Which expression gives the total cost, in dollars, for x hours?`,
      answer,
      choices: [answer, poly([fee, "x"], [rate, ""]), `${fee + rate}x`, poly([rate, "x"], [-fee, ""])],
      steps: [`The hourly charge multiplies x: ${rate}x.`, `The call-out fee is paid once, so add ${fee}.`],
    };
  },
  (r) => {
    const a = r(2, 5), b = r(2, 9), tripled = r(0, 1) === 1;
    return tripled
      ? expr(`A number x is multiplied by ${a}, then ${b} is subtracted. Write an expression for the result.`, poly([a, "x"], [-b, ""]), [`Multiply first: ${a}x.`, `Then subtract ${b}: ${poly([a, "x"], [-b, ""])}.`])
      : expr(`${b} is subtracted from a number x and the result is multiplied by ${a}. Write an expression for the result.`, `${a}(x − ${b})`, [`Subtract first, so the subtraction goes in brackets: x − ${b}.`, `Multiply the whole bracket by ${a}: ${a}(x − ${b}).`]);
  },
];
const collectLikeTerms: Form[] = [
  (r) => {
    const v = pick(r, LETTERS);
    let a = 0, b = 0, c = 0;
    while (a + b + c === 0) [a, b, c] = [r(2, 15), r(2, 12), -r(1, 9)];
    return expanded(`Simplify ${poly([a, v], [b, v], [c, v])}.`, poly([a + b + c, v]), [`All three terms are like terms in ${v}.`, `Add the coefficients: ${a} + ${b} − ${-c} = ${a + b + c}.`]);
  },
  (r) => {
    let a = 0, b = 0, c = 0, d = 0;
    while (a + c === 0 || b + d === 0) [a, b, c, d] = [r(2, 12), r(2, 9), nz(r, -8, 8), nz(r, -8, 8)];
    return expanded(`Simplify ${poly([a, "a"], [b, "b"], [c, "a"], [d, "b"])}.`, poly([a + c, "a"], [b + d, "b"]), [`Group like terms: (${a}a ${c < 0 ? "−" : "+"} ${Math.abs(c)}a) and (${b}b ${d < 0 ? "−" : "+"} ${Math.abs(d)}b).`, `Combine each group: ${poly([a + c, "a"], [b + d, "b"])}.`]);
  },
  (r) => {
    let a = 0, b = 0;
    const p = r(2, 12), q = r(1, 9);
    while (a + b === 0) [a, b] = [r(2, 9), -r(2, 11)];
    return expanded(`Simplify ${poly([p, ""], [a, "x"], [q, ""], [b, "x"])}.`, poly([a + b, "x"], [p + q, ""]), [`x terms: ${a}x − ${-b}x = ${poly([a + b, "x"])}.`, `Constants: ${p} + ${q} = ${p + q}.`]);
  },
  (r) => {
    const a = r(6, 14), b = r(1, 5), c = r(2, 7);
    return expanded(`Simplify ${a}xy − ${b}yx + ${c}xy.`, poly([a - b + c, "xy"]), [`yx and xy are like terms because multiplication can happen in any order.`, `${a} − ${b} + ${c} = ${a - b + c}, so the answer is ${poly([a - b + c, "xy"])}.`]);
  },
  (r) => {
    const a = r(8, 14), want = r(2, 6), b = r(3, 8), c = r(1, 5);
    return {
      prompt: `What number goes in the box? ${a}x + ${b}y − □x + ${poly([c, "y"])} = ${want}x + ${b + c}y`,
      answer: a - want,
      steps: [`The y terms already match: ${b}y + ${c}y = ${b + c}y.`, `${a} − □ = ${want}, so □ = ${a - want}.`],
    };
  },
  (r) => {
    let g: { x: number; units: number }[] = [];
    while (!g.length || g[0].x + g[1].x === 0 || g[0].units + g[1].units === 0) g = [{ x: r(1, 4), units: r(1, 4) }, { x: -r(1, 3), units: -r(1, 5) }];
    const x = g[0].x + g[1].x, u = g[0].units + g[1].units;
    return expanded("Write the simplified expression shown by these algebra tiles. Red tiles are negative.", poly([x, "x"], [u, ""]), [`Each x tile cancels with a −x tile, leaving ${n(x)} x tile${Math.abs(x) === 1 ? "" : "s"}.`, `Each unit tile cancels with a negative unit tile, leaving ${n(u)}.`, `So the expression is ${poly([x, "x"], [u, ""])}.`], { algebraVisual: { kind: "tiles", title: "Algebra tiles", groups: g } });
  },
  (r) => {
    const s = [[r(2, 5), r(1, 6)], [r(1, 4), -r(1, 4)], [r(1, 3), r(2, 8)]];
    const a = s.reduce((t, [c]) => t + c, 0), b = s.reduce((t, [, k]) => t + k, 0);
    return expanded(`A triangle has sides ${s.map(([c, k]) => poly([c, "x"], [k, ""])).join(", ")}. Write its perimeter in simplest form.`, poly([a, "x"], [b, ""]), ["Add all three sides.", `x terms: ${s.map(([c]) => c).join(" + ")} = ${a}. Constants: ${poly(...s.map(([, k]): [number, string] => [k, ""])).replace(/(\d) ([+−]) (\d)/g, "$1 $2 $3")} = ${b}.`]);
  },
];
const equivalence: Form[] = [
  (r) => {
    const a = r(3, 8), b = r(2, 9), same = r(0, 1) === 1;
    const wrong = pick(r, [poly([a - 1, "x"], [-b, ""]), poly([a + 1, "x"], [b, ""]), poly([2 * a + 2, "x"], [-b, ""])]);
    const other = same ? poly([a + 1, "x"], [-b, ""]) : wrong;
    return yesNo(`Are ${poly([a, "x"], [-b, ""])} + x and ${other} equivalent?`, same, [`Simplify the first: ${a}x + x = ${a + 1}x, so it is ${poly([a + 1, "x"], [-b, ""])}.`, same ? "The two expressions match for every x." : `${other} is different, so they are not equivalent.`]);
  },
  (r) => {
    const p = r(2, 6), q = r(2, 6), a = r(2, 5), b = a + r(1, 3);
    return {
      prompt: `Test whether ${p}a + ${q}b is equivalent to ${p + q}ab. Find both values when a = ${a} and b = ${b}.`,
      answer: `${p * a + q * b}, ${(p + q) * a * b}`,
      input: "list",
      labels: [`${p}a + ${q}b`, `${p + q}ab`],
      steps: [`${p} × ${a} + ${q} × ${b} = ${p * a + q * b}.`, `${p + q} × ${a} × ${b} = ${(p + q) * a * b}. Different values, so they are not equivalent.`],
    };
  },
  (r) => {
    const a = r(2, 6), b = r(2, 7), c = r(2, 9);
    return {
      prompt: `What number goes in the box? ${a}x + □ + ${b}x = ${a + b}x + ${c}`,
      answer: c,
      steps: [`The x terms already give ${a + b}x.`, `The only constant on the right is ${c}, so □ = ${c}.`],
    };
  },
  (r) => {
    const a = r(2, 9), b = r(2, 9);
    const options = [
      { text: `${a}x + ${b} = ${b} + ${a}x`, law: "Commutative law" },
      { text: `(${a}x + ${b}) + 1 = ${a}x + (${b} + 1)`, law: "Associative law" },
      { text: `${a}(x + ${b}) = ${a}x + ${a * b}`, law: "Distributive law" },
      { text: `x × ${a} = ${a} × x`, law: "Commutative law" },
    ];
    const o = pick(r, options);
    return {
      prompt: `Which law shows that ${o.text}?`,
      answer: o.law,
      choices: ["Commutative law", "Associative law", "Distributive law"],
      steps: ["Commutative: order changes. Associative: grouping changes. Distributive: a factor multiplies each term in a bracket.", `Here the ${o.law.toLowerCase()} applies.`],
    };
  },
  (r) => {
    const a = r(2, 6), b = r(2, 9), c = r(1, 4), d = r(3, 12);
    return expanded(`Simplify ${a}x − ${b} + ${c}x + ${d} − x.`, poly([a + c - 1, "x"], [d - b, ""]), [`Rearrange so like terms sit together: ${a}x + ${c}x − x − ${b} + ${d}.`, `Combine: ${poly([a + c - 1, "x"], [d - b, ""])}.`]);
  },
  (r) => {
    const a = r(2, 5), b = r(1, 6), x = r(2, 9);
    return {
      prompt: `Substitute x = ${x} into ${a}(x + ${b}) and into ${a}x + ${a * b}. What value do both give?`,
      answer: a * (x + b),
      steps: [`${a}(${x} + ${b}) = ${a} × ${x + b} = ${a * (x + b)}.`, `${a} × ${x} + ${a * b} = ${a * (x + b)}. The same value supports that they are equivalent.`],
    };
  },
];

/* ---------- Week 2: expand ---------- */
const expandSingle: Form[] = [
  (r) => {
    const a = r(2, 9), b = r(2, 6), c = r(1, 9), v = pick(r, ["x", "a", "m", "t"]);
    return expanded(`Expand ${a}(${poly([b, v], [c, ""])}).`, poly([a * b, v], [a * c, ""]), [`Multiply each term inside by ${a}.`, `${a} × ${b}${v} = ${a * b}${v} and ${a} × ${c} = ${a * c}.`]);
  },
  (r) => {
    const a = r(2, 8), b = r(2, 5), c = r(2, 9), v = pick(r, ["j", "k", "p", "x"]);
    return expanded(`Expand ${a}(${c} − ${b}${v}).`, poly([a * c, ""], [-a * b, v]), [`Multiply both terms by ${a}; the subtraction stays.`, `${a} × ${c} = ${a * c}, ${a} × ${b}${v} = ${a * b}${v}: ${poly([a * c, ""], [-a * b, v])}.`]);
  },
  (r) => {
    const a = r(2, 8), b = r(2, 5), c = r(2, 6);
    return expanded(`Expand ${a}u(${b}r − ${c}q).`, poly([a * b, "ru"], [-a * c, "qu"]), [`Multiply each term by ${a}u.`, `${a}u × ${b}r = ${a * b}ru and ${a}u × ${c}q = ${a * c}qu.`]);
  },
  (r) => {
    const a = r(2, 9), b = r(2, 6), c = r(2, 9);
    return expanded(`The area model shows ${a}(${b}x + ${c}). Write the expanded expression.`, poly([a * b, "x"], [a * c, ""]), [`Each part's area is ${a} × its width.`, `${a} × ${b}x = ${a * b}x and ${a} × ${c} = ${a * c}, so ${poly([a * b, "x"], [a * c, ""])}.`], { algebraVisual: { kind: "area", title: "Area model", outer: String(a), parts: [`${b}x`, `+${c}`], cells: ["?", "?"] } });
  },
  (r) => {
    const a = r(2, 6), b = r(2, 9), c = r(2, 9);
    return expanded(`Expand ${a}(${b}x + ${c}y + ${a + b}z).`, poly([a * b, "x"], [a * c, "y"], [a * (a + b), "z"]), [`The ${a} multiplies all three terms.`, `${poly([a * b, "x"], [a * c, "y"], [a * (a + b), "z"])}.`]);
  },
  (r) => {
    const a = r(3, 9), b = r(2, 9);
    return expanded(`A rectangle is ${a} cm wide and (x + ${b}) cm long. Write an expanded expression for its area.`, poly([a, "x"], [a * b, ""]), [`Area = width × length = ${a}(x + ${b}).`, `Expand: ${poly([a, "x"], [a * b, ""])}.`]);
  },
];
const expandNegative: Form[] = [
  (r) => {
    const a = r(2, 9), b = r(2, 9), v = pick(r, ["g", "x", "b"]);
    return expanded(`Expand −${a}(${v} + ${b}).`, poly([-a, v], [-a * b, ""]), [`Multiply each term by −${a}.`, `−${a} × ${v} = −${a}${v} and −${a} × ${b} = −${a * b}.`]);
  },
  (r) => {
    const a = r(2, 8), b = r(2, 5), c = r(2, 9);
    return expanded(`Expand −${a}(${b}x − ${c}).`, poly([-a * b, "x"], [a * c, ""]), [`−${a} × ${b}x = −${a * b}x.`, `−${a} × (−${c}) = +${a * c}, because a negative times a negative is positive.`]);
  },
  (r) => {
    const b = r(2, 12);
    return expanded(`Expand −(x − ${b}).`, poly([-1, "x"], [b, ""]), ["A minus sign in front of a bracket multiplies each term by −1.", `−1 × x = −x and −1 × (−${b}) = +${b}.`]);
  },
  (r) => {
    const a = r(2, 9), b = r(2, 9);
    return {
      prompt: `Sam expanded −${a}(x − ${b}) and wrote −${a}x − ${a * b}. What should the constant term be?`,
      answer: a * b,
      steps: [`−${a} × (−${b}) is a negative times a negative.`, `So the constant is +${a * b}; the correct expansion is −${a}x + ${a * b}.`],
    };
  },
  (r) => {
    const a = r(12, 39), b = 100 - r(1, 4);
    return {
      prompt: `Use the distributive law to calculate ${a} × ${b}. Hint: ${a} × ${b} = ${a} × (100 − ${100 - b}).`,
      answer: a * b,
      steps: [`${a} × 100 = ${a * 100} and ${a} × ${100 - b} = ${a * (100 - b)}.`, `${a * 100} − ${a * (100 - b)} = ${a * b}.`],
    };
  },
  (r) => {
    const a = r(2, 7), b = r(2, 6), c = r(2, 5);
    return expanded(`Expand −${a}(1 + ${b}q − ${c}r).`, poly([-a, ""], [-a * b, "q"], [a * c, "r"]), [`Multiply all three terms by −${a}.`, `−${a}, −${a * b}q and +${a * c}r.`]);
  },
  (r) => {
    const a = r(2, 6), b = r(2, 5), c = r(2, 9);
    return expanded(`The area model shows −${a}(${b}x − ${c}). Write the expanded expression.`, poly([-a * b, "x"], [a * c, ""]), [`−${a} × ${b}x = −${a * b}x.`, `−${a} × (−${c}) = +${a * c}.`], { algebraVisual: { kind: "area", title: "Area model with a negative factor", outer: `−${a}`, parts: [`${b}x`, `−${c}`], cells: ["?", "?"] } });
  },
];
const expandCollect: Form[] = [
  (r) => {
    const a = r(2, 9), b = r(2, 9), c = r(2, 10), d = r(2, 8);
    return expanded(`Expand and simplify ${a}(${b}f + ${c}) + ${d}f.`, poly([a * b + d, "f"], [a * c, ""]), [`Expand: ${a * b}f + ${a * c} + ${d}f.`, `Collect the f terms: ${poly([a * b + d, "f"], [a * c, ""])}.`]);
  },
  (r) => {
    const a = r(2, 7), b = r(2, 9), c = r(2, 7), d = r(2, 9);
    return expanded(`Expand and simplify ${a}(x + ${b}) + ${c}(x + ${d}).`, poly([a + c, "x"], [a * b + c * d, ""]), [`${a}x + ${a * b} + ${c}x + ${c * d}.`, `Collect: ${poly([a + c, "x"], [a * b + c * d, ""])}.`]);
  },
  (r) => {
    let a = 0, c = 0;
    while (a === c) [a, c] = [r(3, 9), r(2, 7)];
    const b = r(2, 8), d = r(2, 8);
    return expanded(`Expand and simplify ${a}(x + ${b}) − ${c}(x − ${d}).`, poly([a - c, "x"], [a * b + c * d, ""]), [`${a}(x + ${b}) = ${a}x + ${a * b}. −${c}(x − ${d}) = −${c}x + ${c * d}.`, `Collect: ${poly([a - c, "x"], [a * b + c * d, ""])}.`]);
  },
  (r) => {
    const k = r(2, 6), m = r(2, 5), j = r(1, 6);
    return expanded(`Expand and simplify ${k}a(${m} + b) + ${j}ab.`, poly([k * m, "a"], [k + j, "ab"]), [`${k}a × ${m} = ${k * m}a and ${k}a × b = ${k}ab.`, `${k}ab + ${j}ab = ${k + j}ab.`]);
  },
  (r) => {
    const p = r(3, 6), q = r(2, 4), c = r(2, 4);
    return expanded(`Each student has ${p} pencils and each teacher has ${q}. Pencils cost $${c} each. Write and expand an expression for the cost of pencils for s students and t teachers.`, poly([c * p, "s"], [c * q, "t"]), [`Number of pencils: ${p}s + ${q}t.`, `Cost: ${c}(${p}s + ${q}t) = ${poly([c * p, "s"], [c * q, "t"])}.`]);
  },
  (r) => {
    const a = r(2, 7), b = r(2, 8), want = a + r(1, 5);
    return {
      prompt: `What is the value of k? k(x + ${b}) + ${want - a}x = ${want}x + ${a * b}`,
      answer: a,
      steps: [`Expanding gives kx + ${b}k + ${want - a}x.`, `The constant ${b}k must equal ${a * b}, so k = ${a}. Check: ${a}x + ${want - a}x = ${want}x.`],
    };
  },
];

/* ---------- Week 3: factorise ---------- */
const commonFactor: Form[] = [
  (r) => {
    const g = r(2, 9), [a, b] = pick(r, [[2, 3], [3, 4], [4, 5], [3, 5], [2, 5], [5, 6]]);
    return { prompt: `Find the highest common factor of ${a * g} and ${b * g}.`, answer: g, steps: [`${a * g} = ${g} × ${a} and ${b * g} = ${g} × ${b}.`, `${a} and ${b} share no other factor, so the HCF is ${g}.`] };
  },
  (r) => {
    const g = r(2, 7), [a, b] = pick(r, [[3, 2], [2, 5], [4, 3], [5, 2], [3, 4]]);
    return { prompt: `Find the highest common factor of ${a * g} and ${b * g}x.`, answer: g, steps: [`The number ${a * g} has no x, so x cannot be in the HCF.`, `HCF of ${a * g} and ${b * g} is ${g}.`] };
  },
  (r) => {
    const g = r(2, 7), [a, b] = pick(r, [[1, 2], [2, 3], [3, 2], [1, 3], [3, 4]]);
    return expr(`Find the highest common factor of ${a * g === 1 ? "" : a * g}xy and ${b * g}x.`, `${g}x`, [`Both terms contain x; only the first contains y.`, `HCF of the numbers is ${g}, so the HCF is ${g}x.`]);
  },
  (r) => {
    const g = r(2, 5), [a, b, c] = pick(r, [[2, 3, 4], [3, 4, 5], [2, 5, 3], [4, 3, 2]]);
    return expr(`Find the highest common factor of ${a * g}x, ${b * g}x and ${c * g}x.`, `${g}x`, [`Every term has x.`, `HCF of ${a * g}, ${b * g} and ${c * g} is ${g}, so the HCF is ${g}x.`]);
  },
  (r) => {
    const g = r(2, 6), [a, b] = pick(r, [[1, 2], [1, 3], [2, 3], [3, 4]]);
    return expr(`Find the highest common factor of ${a * g}a and ${b * g}ab.`, `${g}a`, [`Both terms contain a; only one contains b.`, `HCF of ${a * g} and ${b * g} is ${g}, so the HCF is ${g}a.`]);
  },
];
const factorise: Form[] = [
  (r) => {
    const a = r(2, 9), b = r(2, 9), v = pick(r, ["x", "v", "z"]);
    return expr(`Factorise ${a}${v} + ${a * b} fully.`, `${a}(${v} + ${b})`, [`HCF of ${a}${v} and ${a * b} is ${a}.`, `Divide each term by ${a}: ${a}(${v} + ${b}). Check: expanding gives ${a}${v} + ${a * b}.`], { format: "factorised" });
  },
  (r) => {
    const g = r(2, 6), [a, b] = pick(r, [[3, 4], [2, 3], [5, 2], [3, 2], [5, 4]]);
    return expr(`Factorise ${a * g} − ${b * g}f fully.`, `${g}(${a} − ${b}f)`, [`HCF of ${a * g} and ${b * g}f is ${g}.`, `${a * g} ÷ ${g} = ${a} and ${b * g}f ÷ ${g} = ${b}f, keeping the subtraction.`], { format: "factorised" });
  },
  (r) => {
    const g = r(2, 4), [a, b] = pick(r, [[5, 6], [3, 5], [7, 4], [2, 9], [5, 3]]);
    return expr(`Factorise ${a * g}cn + ${b * g}n fully.`, `${g}n(${a}c + ${b})`, [`Both terms contain n, and HCF of ${a * g} and ${b * g} is ${g}. The HCF is ${g}n.`, `Divide each term by ${g}n: ${g}n(${a}c + ${b}).`], { format: "factorised" });
  },
  (r) => {
    const g = r(2, 9), [a, b] = pick(r, [[3, 2], [2, 3], [4, 3], [5, 2], [3, 4]]);
    return expr(`Factorise ${a * g}x − ${b * g}y fully.`, `${g}(${a}x − ${b}y)`, [`HCF of ${a * g}x and ${b * g}y is ${g}.`, `${g}(${a}x − ${b}y).`], { format: "factorised" });
  },
  (r) => {
    const rows = r(3, 8), extra = rows * r(2, 5);
    return expr(`A photo has ${rows} rows of x students. Then ${extra} more students join, so there are ${rows}x + ${extra} students. Factorise ${rows}x + ${extra} fully.`, `${rows}(x + ${extra / rows})`, [`HCF of ${rows}x and ${extra} is ${rows}.`, `${rows}(x + ${extra / rows}): each of the ${rows} rows now has x + ${extra / rows} students.`], { format: "factorised" });
  },
  (r) => {
    const g = r(2, 7), a = r(2, 5), b = r(1, 6);
    return expr(`A rectangle has area ${a * g}a + ${b * g} and one side is ${g}. Write an expression for the other side.`, poly([a, "a"], [b, ""]), [`Area = ${g} × other side, so divide each term by ${g}.`, `${a * g}a ÷ ${g} = ${a}a and ${b * g} ÷ ${g} = ${b}.`], { algebraVisual: { kind: "area", title: "Rectangle area", outer: String(g), parts: ["?", "?"], cells: [`${a * g}a`, String(b * g)] } });
  },
  (r) => {
    const k = r(2, 4), u = r(1, 3);
    return expr("The tiles show equal groups. Write the expression they make in factorised form.", `${k}(x + ${u})`, [`There are ${k} identical groups, each with one x tile and ${u} unit tile${u === 1 ? "" : "s"}.`, `So the tiles show ${k}(x + ${u}), which expands to ${poly([k, "x"], [k * u, ""])}.`], { format: "factorised", algebraVisual: { kind: "tiles", title: "Tiles in equal groups", groups: Array.from({ length: k }, () => ({ x: 1, units: u })) } });
  },
];
const factoriseCheck: Form[] = [
  (r) => {
    const a = r(2, 6), b = r(2, 5), c = r(1, 7);
    return expanded(`Ari factorised ${a * b}x + ${a * c} as ${a}(${b}x + ${c}). Expand ${a}(${b}x + ${c}) to check.`, poly([a * b, "x"], [a * c, ""]), [`${a} × ${b}x = ${a * b}x and ${a} × ${c} = ${a * c}.`, "It matches the original, so the factorisation is correct."]);
  },
  (r) => {
    const g = r(2, 5) * 2, [a, b] = pick(r, [[2, 3], [3, 2], [2, 5], [5, 3]]);
    return expr(`Mia factorised ${a * g}x + ${b * g} as 2(${(a * g) / 2}x + ${(b * g) / 2}). It expands correctly but is not fully factorised. Factorise ${a * g}x + ${b * g} fully.`, `${g}(${a}x + ${b})`, [`${(a * g) / 2} and ${(b * g) / 2} still share a factor.`, `The HCF of ${a * g} and ${b * g} is ${g}: ${g}(${a}x + ${b}).`], { format: "factorised" });
  },
  (r) => {
    const a = r(2, 7), b = r(2, 5), c = pick(r, [1, 2, 3, 4, 5, 6, 7].filter((k) => gcd(b, k) === 1)), right = r(0, 1) === 1;
    const shown = right ? a * c : c;
    return yesNo(`Is ${a}(${b}x + ${c}) the factorised form of ${a * b}x + ${shown}?`, right, [`Expand: ${a}(${b}x + ${c}) = ${a * b}x + ${a * c}.`, right ? "That matches." : `That gives ${a * c}, not ${shown}; the ${a} must multiply both terms.`]);
  },
  (r) => {
    const g = r(2, 6), a = r(2, 5), b = r(2, 7);
    return expr(`What goes in the box? ${g * a}x + ${g * b} = ${g}(□ + ${b})`, `${a}x`, [`${g} × □ must give ${g * a}x.`, `${g * a}x ÷ ${g} = ${a}x.`]);
  },
  (r) => {
    const a = r(2, 5), b = r(2, 6), k = r(1, 4);
    return expr(`Expand and simplify ${a}(x + ${k}) + ${b}(x + ${k}), then factorise your answer fully.`, `${a + b}(x + ${k})`, [`${a}x + ${a * k} + ${b}x + ${b * k} = ${poly([a + b, "x"], [(a + b) * k, ""])}.`, `HCF is ${a + b}: ${a + b}(x + ${k}).`], { format: "factorised" });
  },
  (r) => {
    const g = r(2, 6), [a, b] = pick(r, [[3, 2], [5, 2], [2, 3], [5, 4]]);
    return expr(`Write a fully factorised expression that expands to ${a * g}a − ${b * g}b.`, `${g}(${a}a − ${b}b)`, [`HCF of ${a * g}a and ${b * g}b is ${g}.`, `${g}(${a}a − ${b}b) expands back to ${a * g}a − ${b * g}b.`], { format: "factorised" });
  },
];

/* ---------- Week 4: solve linear equations ---------- */
const inverseOps: Form[] = [
  (r) => {
    const a = r(2, 9), b = r(1, 15), x = r(1, 12);
    return { prompt: `Solve ${a}x + ${b} = ${a * x + b}.`, answer: x, steps: [`Subtract ${b} from both sides: ${a}x = ${a * x}.`, `Divide both sides by ${a}: x = ${x}.`], visual: balance(`${a}x + ${b}`, String(a * x + b)) };
  },
  (r) => {
    const a = r(2, 9), b = r(2, 12), x = r(2, 12);
    return { prompt: `Solve ${a}u − ${b} = ${n(a * x - b)}.`, answer: x, steps: [`Add ${b} to both sides: ${a}u = ${a * x}.`, `Divide by ${a}: u = ${x}.`] };
  },
  (r) => {
    const a = r(2, 7), x = r(1, 8), c = a * x + r(1, 20), b = c - a * x;
    return { prompt: `Solve ${c} − ${a}d = ${b}.`, answer: x, steps: [`Subtract ${c} from both sides: −${a}d = ${b - c}.`, `Divide both sides by −${a}: d = ${x}.`, `Check: ${c} − ${a} × ${x} = ${b}.`] };
  },
  (r) => {
    const a = r(2, 6), q = r(1, 9), b = r(1, 9);
    return { prompt: `Solve p ÷ ${a} + ${b} = ${q + b}.`, answer: a * q, steps: [`Subtract ${b}: p ÷ ${a} = ${q}.`, `Multiply by ${a}: p = ${a * q}.`] };
  },
  (r) => {
    const m = r(2, 5), b = r(2, 9), x = r(2, 15);
    return { prompt: `When r is multiplied by ${m} and ${b} is added, the result is ${m * x + b}. Write and solve an equation to find r.`, answer: x, steps: [`Equation: ${m}r + ${b} = ${m * x + b}.`, `Subtract ${b}, then divide by ${m}: r = ${x}.`] };
  },
  (r) => {
    const a = r(2, 9), b = r(1, 12), x = -r(1, 9);
    return { prompt: `Solve ${a}y + ${b} = ${n(a * x + b)}.`, answer: x, steps: [`Subtract ${b}: ${a}y = ${n(a * x)}.`, `Divide by ${a}: y = ${n(x)}.`], visual: balance(`${a}y + ${b}`, n(a * x + b)) };
  },
];
const rationalSolutions: Form[] = [
  (r) => {
    let a = 0, b = 0, c = 0;
    while (!a || (c - b) % a === 0) [a, b, c] = [r(2, 9), r(1, 12), r(1, 25)];
    return { prompt: `Solve ${a}x + ${b} = ${c}. Give your answer as a fraction.`, answer: fraction(c - b, a), steps: [`Subtract ${b}: ${a}x = ${c - b}.`, `Divide by ${a}: x = ${fraction(c - b, a)}.`] };
  },
  (r) => {
    const k = r(2, 7), d = r(3, 9), q = r(1, 6);
    return { prompt: `Solve ${k}m ÷ ${d} = ${k * q}.`, answer: d * q, steps: [`Multiply both sides by ${d}: ${k}m = ${k * q * d}.`, `Divide by ${k}: m = ${d * q}.`] };
  },
  (r) => {
    const a = r(2, 5), b = r(1, 9), c = r(2, 10);
    return { prompt: `Solve (x + ${b}) ÷ ${a} = ${c}.`, answer: a * c - b, steps: [`Multiply both sides by ${a}: x + ${b} = ${a * c}.`, `Subtract ${b}: x = ${a * c - b}.`] };
  },
  (r) => {
    const a = r(2, 5), x = r(1, 8), d = pick(r, [2, 3, 5]), q = Math.ceil((a * x + 1) / d) + r(0, 3), b = d * q - a * x;
    return { prompt: `Solve (${a}y + ${b}) ÷ ${d} = ${(a * x + b) / d}.`, answer: x, steps: [`Multiply by ${d}: ${a}y + ${b} = ${a * x + b}.`, `Subtract ${b}, then divide by ${a}: y = ${x}.`] };
  },
  (r) => {
    const k = r(1, 9), mean = r(k + 2, 25);
    return { prompt: `The average of x and ${k} is ${mean}. Write and solve an equation to find x.`, answer: 2 * mean - k, steps: [`(x + ${k}) ÷ 2 = ${mean}.`, `Multiply by 2: x + ${k} = ${2 * mean}. Subtract ${k}: x = ${2 * mean - k}.`] };
  },
  (r) => {
    const cups = r(3, 6), price = rounded(r(28, 55) / 10, 1);
    return { prompt: `Jo buys ${cups} cups of coffee for $${(cups * price).toFixed(2)}. Solve ${cups}c = ${rounded(cups * price, 2)} to find the cost of one cup.`, answer: price, unit: "$", steps: [`Divide both sides by ${cups}.`, `c = ${(cups * price).toFixed(2)} ÷ ${cups} = ${price.toFixed(2)}.`] };
  },
];
const verify: Form[] = [
  (r) => {
    let a = 0, c = 0;
    while (a === c) [a, c] = [r(2, 6), r(2, 6)];
    const x = r(1, 9), b = r(1, 12), d = (a - c) * x + b, tried = r(0, 1) ? x : x + pick(r, [-1, 1, 2]);
    return yesNo(`Is x = ${tried} a solution of ${a}x + ${b} = ${poly([c, "x"], [d, ""])}?`, tried === x, [`Left: ${a} × ${tried} + ${b} = ${a * tried + b}. Right: ${c} × ${tried} ${d < 0 ? "−" : "+"} ${Math.abs(d)} = ${c * tried + d}.`, tried === x ? "Both sides are equal." : "The sides differ, so it is not a solution."]);
  },
  (r) => {
    const a = r(2, 6), b = r(1, 7), x = r(1, 9);
    return { prompt: `Check x = ${x} in ${a}(x + ${b}) = ${a * (x + b)}. What does the left-hand side equal?`, answer: a * (x + b), steps: [`${a}(${x} + ${b}) = ${a} × ${x + b}.`, `= ${a * (x + b)}, which matches the right-hand side.`] };
  },
  (r) => {
    const m = r(3, 9), c = r(1, 9), a = r(2, 12);
    return { prompt: `Use the rule U = ${m}a + ${c}. Find a when U = ${m * a + c}.`, answer: a, steps: [`${m}a + ${c} = ${m * a + c}.`, `Subtract ${c}, then divide by ${m}: a = ${a}.`] };
  },
  (r) => {
    const a = r(2, 6), b = r(2, 9), x = r(2, 9), c = a * x + b, bad = r(1, 2);
    const rows = [{ left: `${a}x + ${b}`, right: String(c) }, { left: `${a}x`, right: bad === 1 ? String(c + b) : String(c - b) }, { left: "x", right: bad === 1 ? fraction(c + b, a) : String((c - b) * a) }];
    return { prompt: `This solution of ${a}x + ${b} = ${c} contains one error. Which line is the first wrong line?`, answer: bad === 1 ? 2 : 3, steps: bad === 1 ? [`Line 2 adds ${b} instead of subtracting it.`, `It should be ${a}x = ${c - b}, giving x = ${x}.`] : [`Line 3 multiplies by ${a} instead of dividing.`, `It should be x = ${c - b} ÷ ${a} = ${x}.`], algebraVisual: { kind: "steps", title: "A student's working", rows } };
  },
  (r) => {
    const w = r(3, 9), l = r(w + 1, 15);
    return { prompt: `Use P = 2l + 2w to find l when P = ${2 * (l + w)} and w = ${w}.`, answer: l, steps: [`${2 * (l + w)} = 2l + ${2 * w}.`, `Subtract ${2 * w}: 2l = ${2 * l}, so l = ${l}.`] };
  },
  (r) => {
    const a = r(2, 9), b = r(1, 9);
    return { prompt: `Solve ${a}x + ${b} = ${a}x + ${b + r(1, 6)}. How many solutions does it have?`, answer: 0, steps: [`Subtract ${a}x from both sides: ${b} = a different number.`, "That is never true, so there are 0 solutions."] };
  },
];

/* ---------- Week 5: equations with variables on both sides ---------- */
const bothSides: Form[] = [
  (r) => {
    const c = r(2, 6), a = c + r(1, 5), x = r(1, 10), b = r(1, 12), d = (a - c) * x + b;
    return { prompt: `Solve ${a}s + ${b} = ${c}s + ${d}.`, answer: x, steps: [`Subtract ${c}s from both sides: ${a - c}s + ${b} = ${d}.`, `Subtract ${b}: ${a - c}s = ${d - b}. Divide by ${a - c}: s = ${x}.`], visual: balance(`${a}s + ${b}`, `${c}s + ${d}`) };
  },
  (r) => {
    const c = r(2, 6), a = c + r(1, 4), x = -r(1, 6), b = r(5, 20), d = (a - c) * x + b;
    return { prompt: `Solve ${a}n + ${b} = ${poly([c, "n"], [d, ""])}.`, answer: x, steps: [`Subtract ${c}n: ${a - c}n + ${b} = ${n(d)}.`, `Subtract ${b}: ${a - c}n = ${n(d - b)}, so n = ${n(x)}.`] };
  },
  (r) => {
    const a = r(2, 4), c = a + r(2, 6), x = r(1, 8), b = r(5, 30), d = b + (a - c) * x;
    return { prompt: `Solve ${a}t + ${b} = ${c}t ${d < 0 ? "−" : "+"} ${Math.abs(d)}.`, answer: x, steps: [`Subtract ${a}t from both sides so the t term stays positive: ${b} = ${c - a}t ${d < 0 ? "−" : "+"} ${Math.abs(d)}.`, `${b - d} = ${c - a}t, so t = ${x}.`] };
  },
  (r) => {
    const a = r(2, 3), c = a + 1, x = r(2, 12), b = r(1, 9);
    return { prompt: `Multiplying a number by ${a} and adding ${b + x} gives the same result as multiplying it by ${c} and adding ${b}. Find the number.`, answer: x, steps: [`${a}x + ${b + x} = ${c}x + ${b}.`, `Subtract ${a}x and ${b} from both sides: ${x} = x.`, `Check: ${a * x + b + x} = ${c * x + b}.`] };
  },
  (r) => {
    const p = rounded(r(8, 30) / 10, 1), a = r(4, 6), b = r(1, 3), extra = rounded(r(10, 25) / 10, 1);
    const other = rounded((a - b) * p + extra, 2);
    return { prompt: `Kim bought ${a} pens and a $${extra.toFixed(2)} newspaper. Lee bought ${b} pens and a $${other.toFixed(2)} magazine. They paid the same. How much is one pen?`, answer: p, unit: "$", steps: [`${a}p + ${extra} = ${b}p + ${other}.`, `${a - b}p = ${rounded(other - extra, 2)}, so p = ${p.toFixed(2)}.`] };
  },
  (r) => {
    const c = r(2, 5), a = c + r(1, 3), x = r(4, 12), b = r(2, 15), d = (a - c) * x - b;
    return { prompt: `Opposite sides of a rectangle are (${a}x − ${b}) cm and (${poly([c, "x"], [d, ""])}) cm. Find x.`, answer: x, steps: [`Opposite sides are equal: ${a}x − ${b} = ${poly([c, "x"], [d, ""])}.`, `${a - c}x = ${d + b}, so x = ${x}.`] };
  },
  (r) => {
    const c = r(2, 5), a = c + r(1, 4), x = r(5, 25), b = r(1, 10), d = (a - c) * x - b;
    return { prompt: `Two vertically opposite angles are (${a}x − ${b})° and (${poly([c, "x"], [d, ""])})°. Find x.`, answer: x, steps: [`Vertically opposite angles are equal.`, `${a}x − ${b} = ${poly([c, "x"], [d, ""])}, so ${a - c}x = ${d + b} and x = ${x}.`] };
  },
];
const bracketEquations: Form[] = [
  (r) => {
    const a = r(2, 6), b = r(1, 8), x = r(1, 10);
    return { prompt: `Solve ${a}(p + ${b}) = ${a * (x + b)}.`, answer: x, steps: [`Expand: ${a}p + ${a * b} = ${a * (x + b)}, or divide both sides by ${a}: p + ${b} = ${x + b}.`, `p = ${x}.`] };
  },
  (r) => {
    const a = r(2, 5), b = r(2, 4), c = r(1, 6), x = r(2, 8);
    return { prompt: `Solve ${a}(${b}j − ${c}) = ${a * (b * x - c)}.`, answer: x, steps: [`Expand: ${a * b}j − ${a * c} = ${a * (b * x - c)}.`, `Add ${a * c}: ${a * b}j = ${a * b * x}, so j = ${x}.`] };
  },
  (r) => {
    const a = r(2, 6), b = r(2, 4), c = r(1, 6), x = r(-6, -1);
    return { prompt: `Solve −${a}(${b}u + ${c}) = ${n(-a * (b * x + c))}.`, answer: x, steps: [`Expand: −${a * b}u − ${a * c} = ${n(-a * (b * x + c))}.`, `Add ${a * c}: −${a * b}u = ${n(-a * b * x)}. Divide by −${a * b}: u = ${n(x)}.`] };
  },
  (r) => {
    const a = r(2, 5), b = r(1, 6), c = r(1, 5), x = r(1, 8);
    return { prompt: `Solve ${a}(y + ${b}) + ${c}y = ${a * (x + b) + c * x}.`, answer: x, steps: [`Expand: ${a}y + ${a * b} + ${c}y = ${a * (x + b) + c * x}.`, `${a + c}y + ${a * b} = ${a * (x + b) + c * x}, so ${a + c}y = ${(a + c) * x} and y = ${x}.`] };
  },
  (r) => {
    const c = r(2, 4), a = c + r(1, 3), x = r(2, 9), b = r(1, 6), d = (a * (x + b)) / c - x;
    if (!Number.isInteger(d) || d <= 0) return { prompt: `Solve ${a}(k + ${b}) = ${a * (x + b)}.`, answer: x, steps: [`Divide both sides by ${a}: k + ${b} = ${x + b}.`, `k = ${x}.`] };
    return { prompt: `Solve ${a}(k + ${b}) = ${c}(k + ${d}).`, answer: x, steps: [`Expand both sides: ${a}k + ${a * b} = ${c}k + ${c * d}.`, `${a - c}k = ${c * d - a * b}, so k = ${x}.`] };
  },
  (r) => {
    const k = r(2, 6), age = r(9, 16);
    return { prompt: `In ${k} years' time, double Dev's age will be ${2 * (age + k)}. Write and solve an equation to find Dev's age now.`, answer: age, unit: "years", steps: [`Let d be Dev's age now: 2(d + ${k}) = ${2 * (age + k)}.`, `Divide by 2: d + ${k} = ${age + k}, so d = ${age}.`] };
  },
  (r) => {
    const w = r(18, 30), h1 = r(4, 6), h2 = r(2, 3), up = r(3, 6), total = h1 * w + h2 * (w + up);
    return { prompt: `Rahda earns $w per hour for ${h1} hours, then $(w + ${up}) per hour for ${h2} more hours. She earns $${total}. Find w.`, answer: w, unit: "$", steps: [`${h1}w + ${h2}(w + ${up}) = ${total}.`, `${h1 + h2}w + ${h2 * up} = ${total}, so ${h1 + h2}w = ${total - h2 * up} and w = ${w}.`] };
  },
];
const fixErrors: Form[] = [
  (r) => {
    const c = r(2, 4), a = c + r(1, 4), x = r(2, 8), b = r(1, 9), d = (a - c) * x + b;
    const rows = [{ left: `${a}x + ${b}`, right: `${c}x + ${d}` }, { left: `${a - c}x + ${b}`, right: String(d) }, { left: `${a - c}x`, right: String(d + b) }, { left: "x", right: fraction(d + b, a - c) }];
    return { prompt: `Find the first wrong line in this solution of ${a}x + ${b} = ${c}x + ${d}.`, answer: 3, steps: [`Line 3 adds ${b} to the right instead of subtracting it.`, `It should be ${a - c}x = ${d - b}, so x = ${x}.`], algebraVisual: { kind: "steps", title: "A student's working", rows } };
  },
  (r) => {
    const a = r(2, 5), b = r(2, 7), x = r(1, 8), c = a * (x + b);
    const rows = [{ left: `${a}(x + ${b})`, right: String(c) }, { left: `${a}x + ${b}`, right: String(c) }, { left: `${a}x`, right: String(c - b) }];
    return { prompt: `This working for ${a}(x + ${b}) = ${c} has an error. What is the correct solution?`, answer: x, steps: [`Line 2 only multiplied x by ${a}. It should be ${a}x + ${a * b} = ${c}.`, `${a}x = ${c - a * b}, so x = ${x}.`], algebraVisual: { kind: "steps", title: "A student's working", rows } };
  },
  (r) => {
    const a = r(2, 6), b = r(1, 9), same = r(0, 1) === 1;
    return {
      prompt: same ? `How many solutions does ${a}(x + ${b}) = ${a}x + ${a * b} have?` : `How many solutions does ${a}x + ${b} = ${b + r(1, 6)} + ${a}x have?`,
      answer: same ? "Infinitely many" : "No solutions",
      choices: ["No solutions", "One solution", "Infinitely many"],
      steps: same ? ["Expanding the left gives exactly the right side.", "It is true for every x."] : [`Subtracting ${a}x leaves two different numbers.`, "That is never true, so there are no solutions."],
    };
  },
  (r) => {
    const c = r(2, 5), a = c + r(1, 4), b = r(2, 9), d = r(10, 30), right = r(0, 1) === 1;
    const shown = right ? `${a - c}x − ${b} = ${d}` : `${a + c}x − ${b} = ${d}`;
    return yesNo(`Kai's first step for ${a}x − ${b} = ${c}x + ${d} was ${shown}. Is that step correct?`, right, [`Subtract ${c}x from both sides.`, right ? `${a}x − ${c}x = ${a - c}x, so the step is correct.` : `It should be ${a - c}x − ${b} = ${d}; Kai added the x terms instead.`]);
  },
  (r) => {
    const a = r(2, 5), x = r(2, 7), c = r(a * x + 1, a * x + 12), k = c - a * x;
    return { prompt: `Lee solved ${k} − ${a}x = ${c} and wrote −${a}x = ${c - k}, so x = ${(c - k) / a}. What should x be?`, answer: -x, steps: [`−${a}x = ${c - k}. Dividing by −${a} makes the answer negative.`, `x = ${n(-x)}.`] };
  },
];

/* ---------- Week 6: inequalities ---------- */
type Sym = ">" | "≥" | "<" | "≤";
const SYMS: Sym[] = [">", "≥", "<", "≤"];
const line = (sym: Sym, v: number, span = 5): Algebra8Visual => ({
  kind: "inequality",
  title: "Number line",
  min: v - span,
  max: v + span,
  ...(sym === ">" || sym === "≥" ? { from: { value: v, closed: sym === "≥" } } : { to: { value: v, closed: sym === "≤" } }),
});
const readInequality: Form[] = [
  (r) => {
    const v = r(-6, 8), sym = pick(r, SYMS);
    return { prompt: "Which inequality does the number line show?", answer: `x ${sym} ${n(v)}`, choices: SYMS.map((s) => `x ${s} ${n(v)}`), steps: ["A closed dot includes the number; an open circle excludes it.", `The arrow points ${sym === ">" || sym === "≥" ? "right (greater)" : "left (less)"}, so x ${sym} ${n(v)}.`], algebraVisual: line(sym, v) };
  },
  (r) => {
    const a = r(-5, 2), b = a + r(3, 6), lc = r(0, 1) === 1, rc = r(0, 1) === 1;
    const lo = lc ? a : a + 1, hi = rc ? b : b - 1;
    return { prompt: "The number line shows the values of x. What are the smallest and largest whole numbers included?", answer: `${lo}, ${hi}`, input: "list", labels: ["Smallest", "Largest"], steps: [`Left end at ${n(a)} is ${lc ? "closed, so included" : "open, so excluded"}: smallest is ${n(lo)}.`, `Right end at ${n(b)} is ${rc ? "closed, so included" : "open, so excluded"}: largest is ${n(hi)}.`], algebraVisual: { kind: "inequality", title: "Number line", min: a - 2, max: b + 2, from: { value: a, closed: lc }, to: { value: b, closed: rc } } };
  },
  (r) => {
    const v = r(-9, 15), strict = r(0, 1) === 1;
    return { prompt: `What is the smallest integer that satisfies x ${strict ? ">" : "≥"} ${n(v)}?`, answer: strict ? v + 1 : v, steps: [strict ? `${n(v)} itself is excluded.` : `${n(v)} is included.`, `Smallest integer: ${n(strict ? v + 1 : v)}.`] };
  },
  (r) => {
    const a = r(-6, 3), b = a + r(3, 9);
    return { prompt: `How many integers satisfy ${n(a)} < x ≤ ${n(b)}?`, answer: b - a, steps: [`${n(a)} is excluded and ${n(b)} is included.`, `The integers run from ${n(a + 1)} to ${n(b)}: ${b - a} of them.`] };
  },
  (r) => {
    const age = r(3, 16), strict = r(0, 1) === 1;
    return { prompt: strict ? `Children younger than ${age} travel free. What is the oldest whole-number age that travels free?` : `Riders must be at least ${age} years old. What is the youngest whole-number age allowed?`, answer: strict ? age - 1 : age, unit: "years", steps: [strict ? `Younger than ${age} means a < ${age}.` : `At least ${age} means a ≥ ${age}.`, `So the answer is ${strict ? age - 1 : age}.`] };
  },
  (r) => {
    const score = pick(r, [15, 39, 40, 59, 60, 79, 80, 95, r(0, 100)]);
    const grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";
    return { prompt: `Use the grade table. What grade does a score of ${score} earn?`, answer: grade, input: "text", steps: [`Find the row whose inequality ${score} satisfies.`, `${score} gives grade ${grade}.`], visual: table("Grades", ["Score x", "Grade"], [["x ≥ 80", "A"], ["60 ≤ x < 80", "B"], ["40 ≤ x < 60", "C"], ["x < 40", "D"]]) };
  },
  (r) => {
    const v = r(-8, 10), x = v + pick(r, [-1, 0, 0, 1]), sym = pick(r, SYMS);
    const ok = sym === ">" ? x > v : sym === "≥" ? x >= v : sym === "<" ? x < v : x <= v;
    return yesNo(`Does x = ${n(x)} satisfy x ${sym} ${n(v)}?`, ok, [x === v ? `The endpoint ${n(v)} is ${sym === "≥" || sym === "≤" ? "included" : "excluded"}.` : `Compare ${n(x)} with ${n(v)}.`, ok ? "Yes, it satisfies the inequality." : "No, it does not."]);
  },
];
const solveInequality: Form[] = [
  (r) => {
    const a = r(2, 9), b = r(1, 12), x = r(1, 12), sym = pick(r, SYMS);
    return { prompt: `Solve ${a}x + ${b} ${sym} ${a * x + b}. Complete: x ${sym} ?`, answer: x, steps: [`Subtract ${b}: ${a}x ${sym} ${a * x}.`, `Divide by ${a} (positive, so the sign stays): x ${sym} ${x}.`] };
  },
  (r) => {
    const a = r(2, 9), b = r(2, 12), x = r(1, 12), sym = pick(r, SYMS);
    return { prompt: `Solve ${a}g − ${b} ${sym} ${n(a * x - b)}. Complete: g ${sym} ?`, answer: x, steps: [`Add ${b}: ${a}g ${sym} ${a * x}.`, `Divide by ${a}: g ${sym} ${x}.`] };
  },
  (r) => {
    const a = r(2, 5), b = r(1, 9), c = r(2, 10), sym = pick(r, SYMS);
    return { prompt: `Solve (y + ${b}) ÷ ${a} ${sym} ${c}. Complete: y ${sym} ?`, answer: a * c - b, steps: [`Multiply by ${a}: y + ${b} ${sym} ${a * c}.`, `Subtract ${b}: y ${sym} ${a * c - b}.`] };
  },
  (r) => {
    const a = r(2, 6), b = r(1, 6), x = r(1, 9), sym = pick(r, SYMS);
    return { prompt: `Solve ${a}(x + ${b}) ${sym} ${a * (x + b)}. Complete: x ${sym} ?`, answer: x, steps: [`Divide by ${a}: x + ${b} ${sym} ${x + b}.`, `Subtract ${b}: x ${sym} ${x}.`] };
  },
  (r) => {
    const k = r(3, 6), card = 5 * r(2, 6), price = r(6, 16) / 4, spent = rounded(card + k * price, 2);
    return { prompt: `Ella buys ${k} cartons of milk at $c each and a $${card} phone card. She spends more than $${spent}. Solve ${k}c + ${card} > ${spent}. Complete: c > ?`, answer: price, steps: [`Subtract ${card}: ${k}c > ${rounded(spent - card, 2)}.`, `Divide by ${k}: c > ${price}.`] };
  },
  (r) => {
    const b = r(1, 8), cap = r(25, 60), g = Math.floor((cap - b) / 6);
    return { prompt: `An AFL score is 6g + b (g goals, b behinds). A team kicked ${b} behinds and scored at most ${cap} points. What is the greatest number of goals they could have kicked?`, answer: g, steps: [`6g + ${b} ≤ ${cap}, so 6g ≤ ${cap - b}.`, `g ≤ ${rounded((cap - b) / 6, 2)}. Goals are whole numbers, so g = ${g}.`] };
  },
  (r) => {
    let a = 0, b = 0, c = 0;
    while (!a || (c - b) % a === 0) [a, b, c] = [r(2, 7), r(1, 9), r(10, 30)];
    const sym = pick(r, SYMS);
    return { prompt: `Solve ${a}x + ${b} ${sym} ${c}. Complete: x ${sym} ? (Give a fraction.)`, answer: fraction(c - b, a), steps: [`Subtract ${b}: ${a}x ${sym} ${c - b}.`, `Divide by ${a}: x ${sym} ${fraction(c - b, a)}.`] };
  },
];
const checkInequality: Form[] = [
  (r) => {
    const a = r(2, 6), b = r(1, 9), x = r(1, 8), c = a * x + b, sym = pick(r, SYMS), t = x + pick(r, [-1, 0, 1, 2]);
    const v = a * t + b, ok = sym === ">" ? v > c : sym === "≥" ? v >= c : sym === "<" ? v < c : v <= c;
    return yesNo(`Is x = ${t} a solution of ${a}x + ${b} ${sym} ${c}?`, ok, [`Substitute: ${a} × ${t} + ${b} = ${v}.`, `${v} ${sym} ${c} is ${ok ? "true" : "false"}.`]);
  },
  (r) => {
    const a = r(2, 5), b = r(1, 9), c = r(15, 40);
    return { prompt: `What is the largest integer that satisfies ${a}x + ${b} ≤ ${c}?`, answer: Math.floor((c - b) / a), steps: [`${a}x ≤ ${c - b}, so x ≤ ${fraction(c - b, a)}.`, `The largest integer is ${Math.floor((c - b) / a)}.`] };
  },
  (r) => {
    const fee = 10 * r(3, 8), per = r(6, 15), target = 50 * r(4, 8);
    return { prompt: `Hall hire costs $${fee} plus $${per} per guest. A discount applies when the total is at least $${target}. What is the smallest number of guests for the discount?`, answer: Math.ceil((target - fee) / per), steps: [`${per}g + ${fee} ≥ ${target}, so g ≥ ${rounded((target - fee) / per, 2)}.`, `Guests are whole people, so round up: ${Math.ceil((target - fee) / per)}.`] };
  },
  (r) => {
    const a = r(2, 6), b = a + r(2, 6), greater = r(0, 1) === 1;
    return greater
      ? { prompt: `x > ${b} and x ≥ ${a}. Write this as one inequality. Complete: x > ?`, answer: b, steps: [`Any x greater than ${b} is also at least ${a}.`, `So both are true exactly when x > ${b}.`] }
      : { prompt: `x < ${b} and x < ${a}. Write this as one inequality. Complete: x < ?`, answer: a, steps: [`Any x less than ${a} is also less than ${b}.`, `So both are true exactly when x < ${a}.`] };
  },
  (r) => {
    const t = r(15, 22), n1 = t + r(2, 4), tw = r(3, 5), nw = r(3, 5);
    return { prompt: `Tia's age satisfies ${t} ≤ a ≤ ${t + tw}. Nell's age satisfies ${n1} ≤ a ≤ ${n1 + nw}. They are twins. What are the youngest and oldest possible ages?`, answer: `${n1}, ${Math.min(t + tw, n1 + nw)}`, input: "list", labels: ["Youngest", "Oldest"], steps: ["Twins share an age, so it must satisfy both inequalities.", `The overlap is ${n1} ≤ a ≤ ${Math.min(t + tw, n1 + nw)}.`] };
  },
  (r) => {
    const a = r(2, 5), x = r(1, 6), b = r(1, 9), sym = pick(r, SYMS), c = a * x + b;
    const fault = r(0, 3);
    const shownSym: Sym = fault === 1 ? (sym === ">" ? "≥" : sym === "≥" ? ">" : sym === "<" ? "≤" : "<") : fault === 2 ? (sym === ">" ? "<" : sym === "<" ? ">" : sym === "≥" ? "≤" : "≥") : sym;
    const shownValue = fault === 3 ? x + 1 : x;
    return yesNo(`Does the number line show the solution of ${a}x + ${b} ${sym} ${c}?`, fault === 0, [`Solving gives x ${sym} ${x}.`, fault === 0 ? "The dot, the direction and the value all match." : fault === 1 ? "The dot is the wrong type (open versus closed)." : fault === 2 ? "The arrow points the wrong way." : `The boundary should be ${x}, not ${shownValue}.`], { algebraVisual: line(shownSym, shownValue) });
  },
];

/* ---------- Week 7: tables and linear graphs ---------- */
const linearTable = (m: number, c: number, xs = [0, 1, 2, 3, 4]) => table("Table of values", ["x", ...xs.map(String)], [["y", ...xs.map((x) => n(m * x + c))]]);
const differences: Form[] = [
  (r) => {
    const m = nz(r, -4, 5), c = r(-5, 8), linear = r(0, 1) === 1, xs = [0, 1, 2, 3, 4];
    const ys = xs.map((x) => m * x + c + (!linear && x >= 3 ? x - 2 : 0));
    return yesNo("Is the relationship in this table linear?", linear, [`First differences: ${ys.slice(1).map((y, i) => n(y - ys[i])).join(", ")}.`, linear ? "They are constant, so it is linear." : "They are not constant, so it is not linear."], { visual: table("Table of values", ["x", ...xs.map(String)], [["y", ...ys.map(n)]]) });
  },
  (r) => {
    const m = nz(r, -6, 7), c = r(-5, 10);
    return { prompt: "What is the constant first difference in this table?", answer: m, steps: [`Subtract consecutive y-values: ${n(m + c)} − ${n(c)} = ${n(m)}.`, `It is ${n(m)} every time.`], visual: linearTable(m, c) };
  },
  (r) => {
    const m = r(2, 5), c = r(-3, 6), xs = [-2, -1, 0, 1, 2, 3], wrong = r(1, 4), ys = xs.map((x) => m * x + c);
    const shown = ys.map((y, i) => (i === wrong ? y + pick(r, [-2, -1, 1, 2]) : y));
    return { prompt: "One y-value in this linear table was calculated incorrectly. What should that value be?", answer: ys[wrong], steps: [`Most first differences are ${m}.`, `The value at x = ${n(xs[wrong])} breaks the pattern; it should be ${n(ys[wrong])}.`], visual: table("Table of values", ["x", ...xs.map(n)], [["y", ...shown.map(n)]]) };
  },
  (r) => {
    const m = nz(r, -4, 5), c = r(-6, 8);
    return expr("Find the rule for this table. y = ?", poly([m, "x"], [c, ""]), [`y changes by ${n(m)} each time x increases by 1, so the coefficient of x is ${n(m)}.`, `At x = 0, y = ${n(c)}. Rule: ${rule(m, c)}.`], { visual: linearTable(m, c, [-2, -1, 0, 1, 2]) });
  },
  (r) => {
    const per = r(2, 5), extra = r(1, 3), k = r(10, 30);
    return { prompt: `This table shows a matchstick pattern. How many matchsticks are in shape ${k}?`, answer: per * k + extra, steps: [`Each new shape adds ${per} matchsticks; shape 1 has ${per + extra}.`, `Rule: m = ${per}s + ${extra}. Shape ${k}: ${per} × ${k} + ${extra} = ${per * k + extra}.`], visual: table("Matchstick pattern", ["Shape", "1", "2", "3", "4"], [["Matchsticks", ...[1, 2, 3, 4].map((s) => String(per * s + extra))]]) };
  },
  (r) => {
    const m = nz(r, -5, 6), c = r(-4, 9), x = r(6, 10);
    return { prompt: `The table is linear. What is y when x = ${x}?`, answer: m * x + c, steps: [`y changes by ${n(m)} for each step of 1.`, `From x = 4 to ${x} is ${x - 4} steps: ${n(m * 4 + c)} + ${x - 4} × ${n(m)} = ${n(m * x + c)}.`], visual: linearTable(m, c) };
  },
];
const plotLinear: Form[] = [
  (r) => {
    const m = nz(r, -3, 4), c = r(-3, 5), x = r(-3, 6), on = r(0, 1) === 1, y = m * x + c + (on ? 0 : pick(r, [-2, -1, 1, 2]));
    return yesNo(`Does the point (${n(x)}, ${n(y)}) lie on ${rule(m, c)}?`, on, [`Substitute x = ${n(x)}: y = ${n(m * x + c)}.`, on ? "That matches, so the point is on the line." : `${n(y)} ≠ ${n(m * x + c)}, so it is not on the line.`]);
  },
  (r) => {
    const m = nz(r, -4, 5), c = r(-6, 6), x = r(-3, 3);
    return { prompt: `For ${rule(m, c)}, complete the table entry: what is y when x = ${n(x)}?`, answer: m * x + c, steps: [`Substitute: ${n(m)} × ${x < 0 ? `(${n(x)})` : x} ${c < 0 ? "−" : "+"} ${Math.abs(c)}.`, `y = ${n(m * x + c)}.`] };
  },
  (r) => {
    const m = pick(r, [1, 2, 3, -1, -2]), xi = r(-3, 4), c = -m * xi;
    return { prompt: `Where does ${rule(m, c)} cross the x-axis? Give the coordinates.`, answer: `${xi}, 0`, input: "list", labels: ["x", "y"], steps: ["On the x-axis, y = 0.", `0 = ${poly([m, "x"], [c, ""])} gives x = ${n(xi)}, so the point is (${n(xi)}, 0).`] };
  },
  (r) => {
    const m = nz(r, -5, 5), c = r(-9, 9);
    return { prompt: `What is the y-intercept of ${rule(m, c)}? Complete: (0, ?)`, answer: c, steps: ["At the y-axis, x = 0.", `y = ${n(m)} × 0 ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${n(c)}.`] };
  },
  (r) => {
    const m = pick(r, [1, 2, -1, -2]), c = r(-2, 3), xs = [-2, 0, 2], bad = r(0, 2), name = ["A", "B", "C"];
    const points = xs.map((x, i) => ({ x, y: m * x + c + (i === bad ? pick(r, [-2, 2]) : 0), label: name[i] }));
    return { prompt: `Which point is NOT on the line ${rule(m, c)}? Type its letter.`, answer: name[bad], input: "text", steps: ["Substitute each point's x-value into the rule.", `Point ${name[bad]} has y = ${n(points[bad].y)}, but the rule gives ${n(m * xs[bad] + c)}.`], algebraVisual: graph("Points and a line", [{ m, c, label: rule(m, c) }], { points }) };
  },
];
const horizontalVertical: Form[] = [
  (r) => {
    const k = nz(r, -5, 7);
    return { prompt: "The graph shows a horizontal line. What is its rule? Complete: y = ?", answer: k, steps: ["Every point on a horizontal line has the same y-value.", `It crosses the y-axis at ${n(k)}, so y = ${n(k)}.`], algebraVisual: graph("Horizontal line", [{ m: 0, c: k, label: "Line A" }]) };
  },
  (r) => {
    const k = nz(r, -4, 4);
    return { prompt: "The graph shows a vertical line. What is its rule? Complete: x = ?", answer: k, steps: ["Every point on a vertical line has the same x-value.", `It crosses the x-axis at ${n(k)}, so x = ${n(k)}.`], algebraVisual: graph("Vertical line", [{ x: k, label: "Line B" }]) };
  },
  (r) => {
    const px = r(-4, 5), py = r(-4, 6), kind = pick(r, ["x", "y"] as const), k = kind === "x" ? px + pick(r, [0, 0, 1, -1]) : py + pick(r, [0, 0, 1, -1]);
    const on = kind === "x" ? px === k : py === k;
    return yesNo(`Does the point (${n(px)}, ${n(py)}) lie on the line ${kind} = ${n(k)}?`, on, [`On ${kind} = ${n(k)}, every point has ${kind}-coordinate ${n(k)}.`, `This point has ${kind} = ${n(kind === "x" ? px : py)}, so ${on ? "it lies on the line" : "it does not"}.`]);
  },
  (r) => {
    const x1 = r(-4, 1), x2 = x1 + r(2, 4), y1 = r(-4, 1), y2 = y1 + r(2, 5);
    return { prompt: `Find the area of the rectangle enclosed by x = ${n(x1)}, x = ${n(x2)}, y = ${n(y1)} and y = ${n(y2)}.`, answer: (x2 - x1) * (y2 - y1), unit: "square units", steps: [`Width: ${n(x2)} − ${x1 < 0 ? `(${n(x1)})` : x1} = ${x2 - x1}. Height: ${n(y2)} − ${y1 < 0 ? `(${n(y1)})` : y1} = ${y2 - y1}.`, `Area = ${x2 - x1} × ${y2 - y1} = ${(x2 - x1) * (y2 - y1)}.`], algebraVisual: graph("Four lines", [{ x: x1, label: `x = ${n(x1)}` }, { x: x2, label: `x = ${n(x2)}` }, { m: 0, c: y1, label: `y = ${n(y1)}` }, { m: 0, c: y2, label: `y = ${n(y2)}` }]) };
  },
  (r) => {
    const px = nz(r, -6, 6), py = nz(r, -6, 6), vertical = r(0, 1) === 1;
    return { prompt: `A ${vertical ? "vertical" : "horizontal"} line passes through (${n(px)}, ${n(py)}). Complete its rule: ${vertical ? "x" : "y"} = ?`, answer: vertical ? px : py, steps: [vertical ? "A vertical line keeps x fixed." : "A horizontal line keeps y fixed.", `So ${vertical ? "x" : "y"} = ${n(vertical ? px : py)}.`] };
  },
];

/* ---------- Week 8: investigate linear functions ---------- */
const startingValue: Form[] = [
  (r) => {
    const m = pick(r, [1, 2, -1]), c1 = r(-2, 2), c2 = c1 + nz(r, -4, 4);
    return { prompt: `Line A is ${rule(m, c1)}. Line B is parallel to it: y = ${m === 1 ? "" : m === -1 ? "−" : m}x + c. Use the graph to find c.`, answer: c2, steps: ["Parallel lines have the same coefficient of x.", `Line B crosses the y-axis at ${n(c2)}, so c = ${n(c2)}.`], algebraVisual: graph("Two parallel lines", [{ m, c: c1, label: "A" }, { m, c: c2, label: "B" }]) };
  },
  (r) => {
    const m = nz(r, -6, 6), c = nz(r, -12, 12);
    return { prompt: `At what value does ${rule(m, c)} cross the y-axis?`, answer: c, steps: ["Substitute x = 0.", `The ${n(m)}x term becomes 0, leaving y = ${n(c)}.`] };
  },
  (r) => {
    const m = nz(r, -5, 5), c = r(-6, 6), up = nz(r, -5, 6);
    return expr(`The graph of ${rule(m, c)} is moved ${up > 0 ? "up" : "down"} ${Math.abs(up)} unit${Math.abs(up) === 1 ? "" : "s"}. Write the new rule. y = ?`, poly([m, "x"], [c + up, ""]), ["Moving up or down changes only the starting value.", `${n(c)} ${up > 0 ? "+" : "−"} ${Math.abs(up)} = ${n(c + up)}, so ${rule(m, c + up)}.`]);
  },
  (r) => {
    const a = r(-5, 6), m = nz(r, -4, 5);
    return expr(`A straight line passes through (0, ${n(a)}) and (1, ${n(a + m)}). Write its rule. y = ?`, poly([m, "x"], [a, ""]), [`Starting value at x = 0: ${n(a)}.`, `y changes by ${n(m)} from x = 0 to x = 1. Rule: ${rule(m, a)}.`]);
  },
  (r) => {
    const rate = r(2, 5), start = rate * r(5, 12);
    return { prompt: `The height of water in a tub is H = −${rate}t + ${start} cm after t seconds. What was the height at the start?`, answer: start, unit: "cm", steps: ["The start is t = 0.", `H = −${rate} × 0 + ${start} = ${start}.`] };
  },
  (r) => {
    const m = nz(r, -5, 5), c = nz(r, -8, 8), m2 = m + nz(r, -3, 3);
    return expr(`Write the rule of a line with the same y-intercept as ${rule(m, c)} but with x-coefficient ${n(m2)}. y = ?`, poly([m2, "x"], [c, ""]), [`Keep the starting value ${n(c)}.`, `Change the rate to ${n(m2)}: ${rule(m2, c)}.`]);
  },
];
const rateDirection: Form[] = [
  (r) => {
    const m = pick(r, [-4, -3, -2, -1, 1, 2, 3, 4, 0]), c = r(-5, 5);
    const answer = m > 0 ? "Up" : m < 0 ? "Down" : "Flat";
    return { prompt: `Reading from left to right, does the graph of ${m === 0 ? `y = ${n(c)}` : rule(m, c)} slope up or down, or is it flat?`, answer, choices: ["Up", "Down", "Flat"], steps: ["The sign of the x-coefficient sets the direction.", m > 0 ? "Positive: y increases, so it slopes up." : m < 0 ? "Negative: y decreases, so it slopes down." : "Zero: y stays the same, so it is flat."] };
  },
  (r) => {
    const m = -r(1, 6), c = r(5, 20);
    return { prompt: "By how much does y change each time x increases by 1? (Use a negative number for a decrease.)", answer: m, steps: [`${n(m + c)} − ${c} = ${n(m)}.`, `y decreases by ${-m}, so the change is ${n(m)}.`], visual: linearTable(m, c) };
  },
  (r) => {
    const m = nz(r, -4, 5), c = r(-4, 6), x2 = r(2, 4);
    return { prompt: `A line passes through (0, ${n(c)}) and (${x2}, ${n(c + m * x2)}). By how much does y change when x increases by 1?`, answer: m, steps: [`Over ${x2} steps, y changes by ${n(m * x2)}.`, `Per step: ${n(m * x2)} ÷ ${x2} = ${n(m)}.`] };
  },
  (r) => {
    let a = 0, b = 0;
    while (Math.abs(a) === Math.abs(b)) [a, b] = [nz(r, -6, 6), nz(r, -6, 6)];
    const ra = rule(a, r(-5, 5)), rb = rule(b, r(-5, 5));
    return { prompt: `Which line is steeper?`, answer: Math.abs(a) > Math.abs(b) ? ra : rb, choices: [ra, rb], steps: ["Steepness depends on the size of the x-coefficient, ignoring its sign.", `|${n(a)}| = ${Math.abs(a)} and |${n(b)}| = ${Math.abs(b)}.`] };
  },
  (r) => {
    const m = -r(1, 5), c = r(2, 12);
    return expr("Find the rule for this table. y = ?", poly([m, "x"], [c, ""]), [`y decreases by ${-m} each step, so the coefficient is ${n(m)}.`, `At x = 0, y = ${c}: ${rule(m, c)}.`], { visual: linearTable(m, c) });
  },
  (r) => {
    const m = pick(r, [-3, -2, -1, 1, 2, 3]), c = r(-2, 3);
    return { prompt: "Use the graph. By how much does y change each time x increases by 1?", answer: m, steps: ["Pick two grid points on the line one unit apart in x.", `y changes by ${n(m)} each time.`], algebraVisual: graph("Straight-line graph", [{ m, c, label: "" }], { points: [{ x: 0, y: c }, { x: 1, y: m + c }] }) };
  },
];
const conjecture: Form[] = [
  (r) => {
    const m = -r(1, 4), c = r(2, 9);
    return { prompt: `Conjecture: lines with a negative x-coefficient slope down. Test ${rule(m, c)} by finding y at x = 0 and at x = 2.`, answer: `${c}, ${c + 2 * m}`, input: "list", labels: ["y at x = 0", "y at x = 2"], steps: [`x = 0 gives ${c}; x = 2 gives ${n(c + 2 * m)}.`, "y decreased, which supports the conjecture."] };
  },
  (r) => {
    const ms = [pick(r, [1, 2]), pick(r, [3, 4]), -pick(r, [1, 2, 3])];
    return { prompt: `The lines ${ms.map((m) => rule(m, 0)).join(", ")} all pass through one point. What point is it?`, answer: "0, 0", input: "list", labels: ["x", "y"], steps: ["None of the rules has a constant term.", "When x = 0, every rule gives y = 0, so all pass through (0, 0)."] };
  },
  (r) => {
    const a = pick(r, [2, 3, 4]), b = pick(r, [3, 5]), y = r(1, 10), x = r(1, 10);
    return { prompt: `Find the whole-number solution of ${a}x + ${b}y = ${a * x + b * y} when x = ${x}. What is y?`, answer: y, steps: [`${a} × ${x} + ${b}y = ${a * x + b * y}, so ${b}y = ${b * y}.`, `y = ${y}.`] };
  },
  (r) => {
    const a = pick(r, [2, 3]), b = pick(r, [3, 4, 5]), total = a * b * r(1, 3);
    let count = 0;
    for (let x = 0; a * x <= total; x++) if ((total - a * x) % b === 0) count++;
    return { prompt: `How many pairs of whole numbers (x, y), with x ≥ 0 and y ≥ 0, satisfy ${a}x + ${b}y = ${total}?`, answer: count, steps: [`Try x = 0, 1, 2, … while ${a}x ≤ ${total}.`, `Keep the cases where ${total} − ${a}x divides exactly by ${b}: ${count} pairs.`] };
  },
  (r) => {
    const m = pick(r, [2, 3, 4, -2, -3]), x = r(1, 3);
    return { prompt: `Ravi claims every line through (0, 0) has the rule y = x. The line through (0, 0) and (${x}, ${n(m * x)}) has rule y = mx. Find m.`, answer: m, steps: [`y = mx at (${x}, ${n(m * x)}): ${n(m * x)} = m × ${x}.`, `m = ${n(m)}, so Ravi's claim is false.`] };
  },
  (r) => {
    const m = pick(r, [2, -2]), x = nz(r, -3, 3), y = r(-5, 5), strict = r(0, 1) === 1, sym = strict ? "<" : "≤";
    const ok = strict ? y < m * x : y <= m * x;
    return yesNo(`Is the point (${n(x)}, ${n(y)}) in the region y ${sym} ${m === 2 ? "2x" : "−2x"}?`, ok, [`At x = ${n(x)}, the boundary has y = ${n(m * x)}.`, `${n(y)} ${sym} ${n(m * x)} is ${ok ? "true" : "false"}.`]);
  },
];

/* ---------- Week 9: connect equations, graphs and solutions ---------- */
const readSolution: Form[] = [
  (r) => {
    const m = pick(r, [1, 2, -1, -2]), c = r(-2, 3), x = r(-2, 3), k = m * x + c;
    return { prompt: `Use the graph of ${rule(m, c)} to solve ${poly([m, "x"], [c, ""])} = ${n(k)}.`, answer: x, steps: [`Find y = ${n(k)} on the line.`, `Read down to the x-axis: x = ${n(x)}.`], algebraVisual: graph("Read the graph", [{ m, c, label: rule(m, c) }]) };
  },
  (r) => {
    const speed = pick(r, [6, 8, 10, 12, 15]), t = r(2, 5);
    return { prompt: `A cyclist travels at a constant speed. Use the graph to find how long it takes to travel ${speed * t} km.`, answer: t, unit: "hours", steps: [`Find ${speed * t} km on the distance axis.`, `Read across to the line and down: ${t} hours.`], algebraVisual: graph("Distance–time graph", [{ m: speed, c: 0, label: `d = ${speed}t` }], { xMin: 0, xMax: 6, yMin: 0, yMax: speed * 6, xLabel: "t (h)", yLabel: "d (km)", yStep: speed }) };
  },
  (r) => {
    const m = pick(r, [1, 2, 3, -1, -2]), x = nz(r, -3, 3), c = -m * x;
    return { prompt: `Use the graph to solve ${poly([m, "x"], [c, ""])} = 0.`, answer: x, steps: ["The solution is where the line meets the x-axis (y = 0).", `That is at x = ${n(x)}.`], algebraVisual: graph("Read the graph", [{ m, c, label: rule(m, c) }]) };
  },
  (r) => {
    const m = pick(r, [1, 2, -1, -2]), c = r(-2, 3), x = nz(r, -2, 3);
    return { prompt: `Point P on the graph shows the solution x = ${n(x)} of ${poly([m, "x"], [c, ""])} = k. What is k?`, answer: m * x + c, steps: ["Follow the dashed line from P across to the y-axis.", `k = ${n(m * x + c)}. Check: ${n(m)} × ${x < 0 ? `(${n(x)})` : x} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${n(m * x + c)}.`], algebraVisual: graph("Read the graph", [{ m, c, label: rule(m, c) }], { points: [{ x, y: m * x + c, label: "P", guide: true }] }) };
  },
  (r) => {
    const rate = pick(r, [2, 3, 4, 5]), t = r(1, 4), start = rate * r(5, 6), target = start - rate * t;
    return { prompt: `A tank holds ${start} L and drains at ${rate} L per minute. Use the graph to find when it holds ${target} L.`, answer: t, unit: "min", steps: [`Find ${target} L on the vertical axis.`, `Read across and down: t = ${t} minutes. Check: ${start} − ${rate} × ${t} = ${target}.`], algebraVisual: graph("Volume over time", [{ m: -rate, c: start, label: `V = ${start} − ${rate}t` }], { xMin: 0, xMax: 6, yMin: 0, yMax: start, xLabel: "t (min)", yLabel: "V (L)", yStep: rate }) };
  },
];
const intersections: Form[] = [
  (r) => {
    let m1 = 0, m2 = 0;
    while (m1 === m2) [m1, m2] = [pick(r, [1, 2, -1]), pick(r, [-2, -1, 1, 3])];
    const x = r(-2, 2), y = r(-1, 4), c1 = y - m1 * x, c2 = y - m2 * x;
    return { prompt: "Use the graph. At what point do the two lines intersect?", answer: `${x}, ${y}`, input: "list", labels: ["x", "y"], steps: ["Find where the lines cross.", `They meet at (${n(x)}, ${n(y)}). Check in both rules.`], algebraVisual: graph("Two lines", [{ m: m1, c: c1, label: rule(m1, c1) }, { m: m2, c: c2, label: rule(m2, c2) }]) };
  },
  (r) => {
    const m = nz(r, -4, 4), c1 = r(-5, 5), c2 = c1 + nz(r, -5, 5), same = r(0, 1) === 1, m2 = same ? m : m + nz(r, -2, 2);
    return yesNo(`Do the lines ${rule(m, c1)} and ${rule(m2, c2)} intersect?`, !same, [same ? "Both have the same x-coefficient, so they are parallel." : "Their x-coefficients differ, so they must cross.", same ? "Parallel lines with different starting values never meet." : "So they intersect at exactly one point."]);
  },
  (r) => {
    const a = r(2, 4), b = a + r(1, 3), t = r(3, 9), sb = r(5, 15), sa = sb + (b - a) * t;
    return { prompt: `Ana has saved $${sa} and earns $${a} per hour. Ben has saved $${sb} and earns $${b} per hour. After how many hours worked will their savings be equal?`, answer: t, unit: "hours", steps: [`${sa} + ${a}n = ${sb} + ${b}n.`, `${sa - sb} = ${b - a}n, so n = ${t}.`] };
  },
  (r) => {
    const fast = r(5, 8), slow = fast - r(1, 3), t = r(3, 8), head = (fast - slow) * t;
    return { prompt: `Max runs at ${fast} m/s. Jess gets a ${head} m head start and runs at ${slow} m/s. After how many seconds does Max catch Jess?`, answer: t, unit: "s", steps: [`${fast}t = ${head} + ${slow}t.`, `${fast - slow}t = ${head}, so t = ${t}.`] };
  },
  (r) => {
    const m = nz(r, -5, 5), c = r(-6, 6), c2 = c + nz(r, -5, 5);
    return expr(`Write the rule of the line parallel to ${rule(m, c)} that passes through (0, ${n(c2)}). y = ?`, poly([m, "x"], [c2, ""]), ["Parallel lines share the x-coefficient.", `Starting value ${n(c2)}: ${rule(m, c2)}.`]);
  },
  (r) => {
    let m1 = 0, m2 = 0;
    while (m1 === m2) [m1, m2] = [r(2, 5), r(-2, 1)];
    const x = r(-3, 6), c1 = r(-6, 6), c2 = (m1 - m2) * x + c1;
    return { prompt: `${rule(m1, c1)} and ${rule(m2, c2)} meet where x = ?`, answer: x, steps: [`Set them equal: ${poly([m1, "x"], [c1, ""])} = ${poly([m2, "x"], [c2, ""])}.`, `${m1 - m2}x = ${n(c2 - c1)}, so x = ${n(x)}.`] };
  },
];
const graphInequality: Form[] = [
  (r) => {
    const k = nz(r, -3, 4), sym = pick(r, SYMS), vertical = r(0, 1) === 1, v = vertical ? "x" : "y";
    const side = vertical ? (sym === ">" || sym === "≥" ? "right" : "left") : sym === ">" || sym === "≥" ? "above" : "below";
    return { prompt: "Which inequality describes the shaded region? A dashed boundary is not included.", answer: `${v} ${sym} ${n(k)}`, choices: SYMS.map((s) => `${v} ${s} ${n(k)}`), steps: [`The boundary is ${v} = ${n(k)}; it is ${sym === ">" || sym === "<" ? "dashed, so not included" : "solid, so included"}.`, `The shading is ${side} it: ${v} ${sym} ${n(k)}.`], algebraVisual: graph("Shaded region", [vertical ? { x: k, label: `x = ${n(k)}` } : { m: 0, c: k, label: `y = ${n(k)}` }], { shade: { line: 0, side, strict: sym === ">" || sym === "<" } }) };
  },
  (r) => {
    const px = r(-4, 4), py = r(-4, 7), vertical = r(0, 1) === 1, k = (vertical ? px : py) + pick(r, [-1, 0, 1, 2]), sym = pick(r, SYMS), val = vertical ? px : py;
    const ok = sym === ">" ? val > k : sym === "≥" ? val >= k : sym === "<" ? val < k : val <= k;
    return yesNo(`Is the point (${n(px)}, ${n(py)}) in the region ${vertical ? "x" : "y"} ${sym} ${n(k)}?`, ok, [`Only the ${vertical ? "x" : "y"}-coordinate matters: ${n(val)}.`, `${n(val)} ${sym} ${n(k)} is ${ok ? "true" : "false"}.`]);
  },
  (r) => {
    const m = pick(r, [1, 2, 3]), c = r(-2, 2), x = r(-1, 2), k = m * x + c, sym = pick(r, SYMS);
    return { prompt: `Use the graph of ${rule(m, c)} to solve ${poly([m, "x"], [c, ""])} ${sym} ${n(k)}. Complete: x ${sym} ?`, answer: x, steps: [`The line reaches y = ${n(k)} at x = ${n(x)}.`, `The line rises, so y ${sym} ${n(k)} where x ${sym} ${n(x)}.`], algebraVisual: graph("Use the graph", [{ m, c, label: rule(m, c) }, { m: 0, c: k, label: `y = ${n(k)}` }]) };
  },
  (r) => {
    const m = pick(r, [-1, -2]), c = r(1, 3), x = r(-1, 2), k = m * x + c, sym = pick(r, ["≥", "≤"] as const), flip = sym === "≥" ? "≤" : "≥";
    return { prompt: `Use the graph of ${rule(m, c)} to solve ${poly([m, "x"], [c, ""])} ${sym} ${n(k)}. Complete: x ${flip} ?`, answer: x, steps: [`The line meets y = ${n(k)} at x = ${n(x)}.`, `The line falls, so y ${sym} ${n(k)} happens for x ${flip} ${n(x)}.`], algebraVisual: graph("Use the graph", [{ m, c, label: rule(m, c) }, { m: 0, c: k, label: `y = ${n(k)}` }]) };
  },
  (r) => {
    const m = pick(r, [1, 2, -1]), c = r(-2, 3), x = r(-3, 3), y = m * x + c + nz(r, -3, 3);
    return yesNo(`Is the point (${n(x)}, ${n(y)}) above the line ${rule(m, c)}?`, y > m * x + c, [`On the line at x = ${n(x)}, y = ${n(m * x + c)}.`, `${n(y)} is ${y > m * x + c ? "greater, so the point is above" : "smaller, so the point is below"}.`]);
  },
  (r) => {
    const m = pick(r, [1, 2, -1]), c = r(-1, 2), above = r(0, 1) === 1, strict = r(0, 1) === 1, x = r(-3, 3), y = m * x + c + pick(r, [-2, -1, 0, 1, 2]);
    const ok = above ? (strict ? y > m * x + c : y >= m * x + c) : strict ? y < m * x + c : y <= m * x + c;
    return yesNo(`Is the point (${n(x)}, ${n(y)}) in the shaded region? A dashed boundary is not included.`, ok, [`On the boundary at x = ${n(x)}, y = ${n(m * x + c)}.`, y === m * x + c ? `The point is on the boundary, which is ${strict ? "dashed, so excluded" : "solid, so included"}.` : `The point is ${y > m * x + c ? "above" : "below"} the line and the shading is ${above ? "above" : "below"}.`], { algebraVisual: graph("Shaded region", [{ m, c, label: rule(m, c) }], { shade: { line: 0, side: above ? "above" : "below", strict }, points: [{ x, y, label: "P" }] }) });
  },
];

/* ---------- Week 10: model a rate and a starting amount ---------- */
const writeModel: Form[] = [
  (r) => {
    const flag = rounded(r(35, 55) / 10, 1), per = rounded(r(15, 25) / 10, 1);
    return expr(`A taxi charges $${flag.toFixed(2)} flagfall plus $${per.toFixed(2)} per km. Write a rule for the cost C, in dollars, of a d km trip. C = ?`, `${flag} + ${per}d`, [`The rate multiplies distance: ${per}d.`, `Add the flagfall: C = ${flag} + ${per}d.`]);
  },
  (r) => {
    const rate = 10 * r(2, 6), start = rate * r(5, 12);
    return expr(`A tank holds ${start} L and leaks ${rate} L per hour. Write a rule for the volume V, in litres, after t hours. V = ?`, poly([start, ""], [-rate, "t"]), [`Starting amount: ${start} L.`, `It loses ${rate} L each hour, so V = ${start} − ${rate}t.`]);
  },
  (r) => {
    const fee = 10 * r(5, 12), rate = 5 * r(12, 20);
    return expr(`An electrician quotes a $${fee} call-out fee plus $${rate} per hour. Write a rule for the cost C, in dollars, of an h-hour job. C = ?`, poly([fee, ""], [rate, "h"]), ["The call-out fee is the starting value.", `C = ${fee} + ${rate}h.`]);
  },
  (r) => {
    const speed = pick(r, [4, 5, 6, 12, 15, 60, 80]);
    return expr(`A ${speed < 20 ? "jogger" : "car"} travels at a constant ${speed} km/h. Write a rule for the distance d, in km, after t hours. d = ?`, `${speed}t`, ["Distance = speed × time.", `d = ${speed}t (starting value 0).`]);
  },
  (r) => {
    const h = 100 * r(3, 8), rate = 25 * r(3, 6);
    return expr(`A weather balloon at ${h} m descends at ${rate} m per minute. Write a rule for its height h, in metres, after t minutes. h = ?`, poly([h, ""], [-rate, "t"]), [`Start: ${h} m.`, `Descending ${rate} m each minute: h = ${h} − ${rate}t.`]);
  },
  (r) => {
    const perKg = 5 * r(6, 10), rest = 5 * r(2, 4);
    return expr(`A roast cooks for ${perKg} minutes per kg, then rests for ${rest} minutes. Write a rule for the total time T, in minutes, for a roast of mass m kg. T = ?`, poly([perKg, "m"], [rest, ""]), [`Cooking: ${perKg}m minutes.`, `Add the resting time: T = ${perKg}m + ${rest}.`]);
  },
  (r) => {
    const rate = r(20, 32), base = 5 * r(2, 6);
    return expr("The table shows pay P, in dollars, for h hours, including a fixed allowance. Write a rule. P = ?", poly([rate, "h"], [base, ""]), [`Pay rises by $${rate} for each extra hour.`, `At 0 hours the pay would be $${base}: P = ${rate}h + ${base}.`], { visual: table("Pay table", ["Hours h", "1", "2", "3", "4"], [["Pay P ($)", ...[1, 2, 3, 4].map((h) => String(rate * h + base))]]) });
  },
];
const useModel: Form[] = [
  (r) => {
    const fee = 10 * r(4, 8), rate = 10 * r(5, 9), h = r(2, 6);
    return { prompt: `A plumber charges C = ${fee} + ${rate}h dollars for h hours. Find the cost of a ${h}-hour job.`, answer: fee + rate * h, unit: "$", steps: [`Substitute h = ${h}.`, `${fee} + ${rate} × ${h} = ${fee + rate * h}.`] };
  },
  (r) => {
    const fee = 10 * r(4, 8), rate = 20 * r(2, 4), h = pick(r, [1.5, 2, 2.5, 3, 3.5]), budget = fee + rate * h;
    return { prompt: `Hiring a plumber costs C = ${fee} + ${rate}h dollars. You have $${budget}. How many hours can you hire the plumber for?`, answer: h, unit: "hours", steps: [`${fee} + ${rate}h = ${budget}.`, `${rate}h = ${budget - fee}, so h = ${h}.`] };
  },
  (r) => {
    const c = 5 * r(-2, 8), inverse = r(0, 1) === 1;
    return inverse
      ? { prompt: `Use F = 1.8C + 32. Find C when F = ${rounded(1.8 * c + 32, 1)}.`, answer: c, unit: "°C", steps: [`${rounded(1.8 * c + 32, 1)} − 32 = ${rounded(1.8 * c, 1)}.`, `${rounded(1.8 * c, 1)} ÷ 1.8 = ${c}.`] }
      : { prompt: `Use F = 1.8C + 32 to convert ${n(c)}°C to Fahrenheit.`, answer: rounded(1.8 * c + 32, 1), unit: "°F", steps: [`1.8 × ${c} = ${rounded(1.8 * c, 1)}.`, `Add 32: ${rounded(1.8 * c + 32, 1)}.`] };
  },
  (r) => {
    const rate = r(2, 5), t = r(2, 5), start = rate * (t + r(1, 4));
    return { prompt: `A sink holds ${start} L. After the plug is pulled, V = ${start} − ${rate}t. After how many seconds does it hold ${start - rate * t} L?`, answer: t, unit: "s", steps: [`${start} − ${rate}t = ${start - rate * t}.`, `${rate}t = ${rate * t}, so t = ${t}.`] };
  },
  (r) => {
    const rate = r(20, 32), h = pick(r, [4.5, 6.5, 7.5, 8, 9.5]);
    return { prompt: `Pay is P = ${rate}h dollars for h hours. How much is earned for ${h} hours?`, answer: rounded(rate * h, 2), unit: "$", steps: [`Substitute h = ${h}.`, `${rate} × ${h} = ${rounded(rate * h, 2)}.`] };
  },
  (r) => {
    const perKg = 5 * r(6, 10), rest = 5 * r(2, 4), m = pick(r, [1.5, 2, 2.5, 3]);
    return { prompt: `Cooking time is T = ${perKg}m + ${rest} minutes for a roast of m kg. How long for a ${m} kg roast?`, answer: perKg * m + rest, unit: "min", steps: [`${perKg} × ${m} = ${perKg * m}.`, `Add ${rest}: ${perKg * m + rest} minutes.`] };
  },
];
const modelLimits: Form[] = [
  (r) => {
    const rate = pick(r, [0.25, 0.5, 0.75]), t = r(4, 10), start = rate * t;
    return { prompt: `A gas bottle holds ${start} kg and the barbecue uses ${rate} kg per hour, so M = ${start} − ${rate}t. After how many hours is the bottle empty?`, answer: t, unit: "hours", steps: [`Set M = 0: ${rate}t = ${start}.`, `t = ${t}. The model stops here; mass cannot be negative.`] };
  },
  (r) => {
    const rate = 10 * r(3, 6), empty = r(4, 8), start = rate * empty, t = r(2, 10);
    return yesNo(`A tank's volume is V = ${start} − ${rate}t litres. Does the model give a sensible volume at t = ${t}?`, rate * t <= start, [`V = ${start} − ${rate} × ${t} = ${start - rate * t}.`, rate * t <= start ? "That is not negative, so it is sensible." : "A negative volume is impossible; the tank emptied earlier."]);
  },
  (r) => {
    const rate = 5 * r(3, 8), start = r(60, 200);
    return { prompt: `V = ${start} − ${rate}t litres. What is the largest whole number of minutes t for which V is not negative?`, answer: Math.floor(start / rate), unit: "min", steps: [`${start} − ${rate}t ≥ 0 gives t ≤ ${rounded(start / rate, 2)}.`, `Largest whole number: ${Math.floor(start / rate)}.`] };
  },
  (r) => {
    const speed = pick(r, [12, 15, 18, 24]), minutes = pick(r, [10, 20, 30, 40, 50]), hours = r(1, 4), d = (speed * (hours * 60 + minutes)) / 60;
    return { prompt: `A cyclist rides ${d} km at ${speed} km/h. How long does it take? Give hours and minutes.`, answer: `${hours}, ${minutes}`, input: "list", labels: ["Hours", "Minutes"], steps: [`t = ${d} ÷ ${speed} = ${rounded(d / speed, 4)} hours.`, `${rounded(d / speed - hours, 4)} h × 60 = ${minutes} min, so ${hours} h ${minutes} min.`] };
  },
  (r) => {
    const rate = r(2, 5), t = r(5, 15);
    return { prompt: `Water height is H = −${rate}t + ${rate * t} cm after t seconds. How many seconds until the tub is empty?`, answer: t, unit: "s", steps: [`Set H = 0: ${rate}t = ${rate * t}.`, `t = ${t}. After this the model would give a negative height, which is not possible.`] };
  },
  (r) => {
    const per = pick(r, [40, 45, 48, 52, 57]), students = per * r(2, 5) + r(1, per - 1);
    return { prompt: `${students} students need buses that seat ${per} each. A model gives ${students} ÷ ${per} ≈ ${rounded(students / per, 2)}. How many buses should be booked?`, answer: Math.ceil(students / per), unit: "buses", steps: [`${rounded(students / per, 2)} buses is not possible; round up so everyone has a seat.`, `${Math.ceil(students / per)} buses.`] };
  },
];

/* ---------- Week 11: compare and refine models ---------- */
const comparePlans: Form[] = [
  (r) => {
    const b = r(2, 6), a = b + r(2, 5), n0 = r(3, 12), fee = (a - b) * n0;
    return { prompt: `Plan A costs $${a} per visit. Plan B costs $${fee} to join plus $${b} per visit. After how many visits do they cost the same?`, answer: n0, unit: "visits", steps: [`${a}n = ${fee} + ${b}n.`, `${a - b}n = ${fee}, so n = ${n0}.`] };
  },
  (r) => {
    const f1 = 10, r1 = r(3, 5), f2 = 20 + 5 * r(0, 2), r2 = r(1, 2), rides = r(2, 15);
    const c1 = f1 + r1 * rides, c2 = f2 + r2 * rides;
    return { prompt: `Deal 1: $${f1} entry, then $${r1} per ride. Deal 2: $${f2} entry, then $${r2} per ride. Which deal is cheaper for ${rides} rides?`, answer: c1 < c2 ? "Deal 1" : c2 < c1 ? "Deal 2" : "Same cost", choices: ["Deal 1", "Deal 2", "Same cost"], steps: [`Deal 1: ${f1} + ${r1} × ${rides} = $${c1}. Deal 2: ${f2} + ${r2} × ${rides} = $${c2}.`, c1 === c2 ? "They are equal." : `Deal ${c1 < c2 ? 1 : 2} is cheaper.`] };
  },
  (r) => {
    const a = r(6, 12), fee = 5 * r(4, 10), b = r(2, a - 2);
    let k = r(2, 15);
    if (a * k === fee + b * k) k++;
    return { prompt: `Gym A: $${a} per visit. Gym B: $${fee} per month plus $${b} per visit. For ${k} visits in a month, how much more does the dearer gym cost?`, answer: Math.abs(a * k - (fee + b * k)), unit: "$", steps: [`A: ${a} × ${k} = $${a * k}. B: ${fee} + ${b} × ${k} = $${fee + b * k}.`, `Difference: $${Math.abs(a * k - (fee + b * k))}.`] };
  },
  (r) => {
    const a = 5 * r(4, 8), ra = r(10, 20), b = 5 * r(1, 3), rb = ra + r(5, 15), gb = r(2, 6);
    return { prompt: `Use the table of phone plans. What is the cheaper monthly cost for ${gb} GB of data?`, answer: Math.min(a + ra * gb, b + rb * gb), unit: "$", steps: [`Plan X: ${a} + ${ra} × ${gb} = $${a + ra * gb}. Plan Y: ${b} + ${rb} × ${gb} = $${b + rb * gb}.`, `The cheaper is $${Math.min(a + ra * gb, b + rb * gb)}.`], visual: table("Phone plans", ["Plan", "Monthly fee", "Per GB"], [["X", `$${a}`, `$${ra}`], ["Y", `$${b}`, `$${rb}`]]) };
  },
  (r) => {
    const entry = 5 * r(1, 3), per = r(3, 6), flat = entry + per * r(3, 7) + r(1, per - 1);
    return { prompt: `Deal 1 costs $${entry} plus $${per} per ride. Deal 3 costs $${flat} with free rides. What is the largest number of rides for which Deal 1 is cheaper?`, answer: Math.floor((flat - entry - 1e-9) / per), unit: "rides", steps: [`${entry} + ${per}n < ${flat}, so n < ${rounded((flat - entry) / per, 2)}.`, `Largest whole number: ${Math.floor((flat - entry - 1e-9) / per)}.`] };
  },
];
const budgetTarget: Form[] = [
  (r) => {
    const fee = 5 * r(3, 10), rate = r(12, 30), budget = 10 * r(15, 40);
    return { prompt: `Kayak hire is $${fee} plus $${rate} per hour. With a budget of $${budget}, what is the greatest whole number of hours you can hire?`, answer: Math.floor((budget - fee) / rate), unit: "hours", steps: [`${fee} + ${rate}h ≤ ${budget}, so h ≤ ${rounded((budget - fee) / rate, 2)}.`, `Round down: ${Math.floor((budget - fee) / rate)} hours.`] };
  },
  (r) => {
    const rate = r(16, 28), target = 50 * r(6, 16);
    return { prompt: `Sam earns $${rate} per hour and needs at least $${target}. What is the smallest whole number of hours Sam must work?`, answer: Math.ceil(target / rate), unit: "hours", steps: [`${rate}h ≥ ${target}, so h ≥ ${rounded(target / rate, 2)}.`, `Round up: ${Math.ceil(target / rate)} hours.`] };
  },
  (r) => {
    const speed = pick(r, [60, 75, 80, 90, 100]), mins = pick(r, [12, 18, 24, 30, 36, 48]);
    return { prompt: `A car travels at ${speed} km/h. How many minutes does it take to travel ${(speed * mins) / 60} km?`, answer: mins, unit: "min", steps: [`${speed} km/h is ${speed / 60} km per minute.`, `${(speed * mins) / 60} ÷ ${speed / 60} = ${mins} minutes.`] };
  },
  (r) => {
    const use = r(6, 9), tank = use * r(5, 8);
    return { prompt: `A car uses ${use} L of fuel per 100 km. How far can it travel on ${tank} L?`, answer: (tank / use) * 100, unit: "km", steps: [`${tank} ÷ ${use} = ${tank / use} lots of 100 km.`, `${tank / use} × 100 = ${(tank / use) * 100} km.`] };
  },
  (r) => {
    const has = 5 * r(4, 20), weekly = 5 * r(3, 8), target = has + 5 * r(15, 60);
    return { prompt: `Lia has $${has} and saves $${weekly} per week. After how many whole weeks will she first have at least $${target}?`, answer: Math.ceil((target - has) / weekly), unit: "weeks", steps: [`${has} + ${weekly}w ≥ ${target}, so w ≥ ${rounded((target - has) / weekly, 2)}.`, `Round up: ${Math.ceil((target - has) / weekly)} weeks.`] };
  },
];
const unitsAssumptions: Form[] = [
  (r) => {
    const rate = r(6, 20), h = pick(r, [1.5, 2, 2.5, 3]);
    return { prompt: `A tap fills a tank at ${rate} L per minute. How many litres flow in ${h} hours?`, answer: rate * h * 60, unit: "L", steps: [`${h} hours = ${h * 60} minutes.`, `${rate} × ${h * 60} = ${rate * h * 60} L.`] };
  },
  (r) => {
    const cents = pick(r, [10, 12, 15, 20, 25]), mins = 10 * r(2, 9);
    return { prompt: `Calls cost ${cents} cents per minute. What does a ${mins}-minute call cost, in dollars?`, answer: rounded((cents * mins) / 100, 2), unit: "$", steps: [`${cents} × ${mins} = ${cents * mins} cents.`, `÷ 100 = $${((cents * mins) / 100).toFixed(2)}.`] };
  },
  (r) => {
    const ms = pick(r, [5, 10, 15, 20, 25]);
    return { prompt: `Convert ${ms} m/s to km/h.`, answer: rounded(ms * 3.6, 2), unit: "km/h", steps: [`In one hour: ${ms} × 3600 = ${ms * 3600} m.`, `÷ 1000 = ${ms * 3.6} km/h.`] };
  },
  (r) => {
    const rate = 10 * r(2, 5), start = rate * r(4, 7), t = r(2, 10), v = start - rate * t;
    return yesNo(`A model V = ${start} − ${rate}t gives V = ${n(v)} L at t = ${t} minutes. Is this value sensible?`, v >= 0, [`V = ${n(v)}.`, v >= 0 ? "A volume of zero or more is possible." : "A negative volume is impossible; the model only works until the tank is empty."]);
  },
  (r) => {
    const k = r(2, 9), x = r(2, 9);
    const options = [`${k}x = ${k * x}`, `${k}x = ${k * x - 1}`, `${k + x} + x = ${k}`];
    return { prompt: "Which equation could give a sensible number of people in a room?", answer: options[0], choices: options, steps: [`${options[0]} gives x = ${x}, a whole positive number.`, "The others give a fraction or a negative number of people."] };
  },
];

const W: Form[][] = [
  writeExpression, collectLikeTerms, equivalence,
  expandSingle, expandNegative, expandCollect,
  commonFactor, factorise, factoriseCheck,
  inverseOps, rationalSolutions, verify,
  bothSides, bracketEquations, fixErrors,
  readInequality, solveInequality, checkInequality,
  differences, plotLinear, horizontalVertical,
  startingValue, rateDirection, conjecture,
  readSolution, intersections, graphInequality,
  writeModel, useModel, modelLimits,
  comparePlans, budgetTarget, unitsAssumptions,
];
/** Week 12 reviews earlier lessons: expressions and equations, practical models, then graphs. */
const review = (range: Form[][]): LessonFactory => (seed) => {
  const r = random(seed ^ 0x5bd1e995);
  return forms(seed, range[r(0, range.length - 1)]);
};
export const patternLessons: LessonFactory[] = [
  ...W.map((list): LessonFactory => (seed) => forms(seed, list)),
  review(W.slice(0, 15)),
  review(W.slice(27, 33)),
  review(W.slice(18, 27)),
];
