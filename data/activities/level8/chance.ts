import type { Chance8Visual, VennRegion } from "./chance-visual";
import {
  fraction,
  random,
  rounded,
  table,
  type LessonFactory,
  type QuestionDraft,
} from "./shared";

// Year 8 Probability (AC9M8P01–P03): complements, two-event outcomes with arrays, two-way
// tables, trees and Venn diagrams, then simulations compared with theoretical predictions.
// Trees stay with equally likely outcomes counted along paths; multiplying branch
// probabilities and conditional probability belong to later years.
type R = (min: number, max: number) => number;
type Form = (r: R) => QuestionDraft;
const pick = <T,>(r: R, xs: readonly T[]) => xs[r(0, xs.length - 1)];
const forms = (seed: number, list: Form[]) => {
  const r = random(seed);
  return list[r(0, list.length - 1)](r);
};
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const listed = (xs: (string | number)[]) => (xs.length < 2 ? String(xs[0] ?? "none") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);
const orList = (xs: (string | number)[]) => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(", ")} or ${xs.at(-1)}`);
const dec = (x: number) => String(rounded(x, 2));
/** "n/d = simplified", or just "n/d" when it is already in simplest form. */
const pf = (n: number, d: number) => (fraction(n, d) === `${n}/${d}` ? `${n}/${d}` : `${n}/${d} = ${fraction(n, d)}`);
const are = (n: number, word = "") => `${n === 1 ? "is" : "are"} ${n}${word ? ` ${word}${n === 1 ? "" : "s"}` : ""}`;
const an = (n: number) => (/^(8|11|18)/.test(String(n)) ? "an" : "a");
const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
const yesNo = (prompt: string, yes: boolean, steps: string[], more: Partial<QuestionDraft> = {}): QuestionDraft => ({ prompt, answer: yes ? "Yes" : "No", steps, ...more });
const C = { red: "#fca5a5", blue: "#93c5fd", green: "#86efac", yellow: "#fde047", purple: "#d8b4fe", orange: "#fdba74" } as const;
type Colour = keyof typeof C;
const COLOURS = Object.keys(C) as Colour[];

/* ---------- Diagram builders ---------- */
const spinner = (title: string, parts: [string, number][], colours?: string[]): { chanceVisual: Chance8Visual } => ({
  chanceVisual: {
    kind: "spinner",
    title,
    sectors: parts.flatMap(([label, n], i) => Array.from({ length: n }, () => ({ label, color: colours?.[i] ?? C[COLOURS[i % COLOURS.length]] }))),
  },
});
const numberSpinner = (title: string, n: number) => spinner(title, range(1, n).map((k) => [String(k), 1]), range(1, n).map((k) => (k % 2 ? "#ede9fe" : "#e0f2fe")));
const bag = (title: string, groups: [Colour, number][]): { chanceVisual: Chance8Visual } => ({
  chanceVisual: { kind: "bag", title, groups: groups.map(([c, count]) => ({ label: c, color: C[c], count })) },
});
const grid = (title: string, rowLabel: string, colLabel: string, rows: (string | number)[], cols: (string | number)[], cell: "pair" | "sum" | "difference" | "product", more: Partial<Extract<Chance8Visual, { kind: "grid" }>> = {}): { chanceVisual: Chance8Visual } => ({
  chanceVisual: { kind: "grid", title, rowLabel, colLabel, rows: rows.map(String), cols: cols.map(String), cell, ...more },
});
const tree = (title: string, firstLabel: string, secondLabel: string, first: string[], second: string[], highlight?: string[]): { chanceVisual: Chance8Visual } => ({
  chanceVisual: { kind: "tree", title, firstLabel, secondLabel, first, second, highlight },
});
const venn = (title: string, labels: [string, string], counts: [number | string, number | string, number | string, number | string], shade?: VennRegion[]): { chanceVisual: Chance8Visual } => ({
  chanceVisual: { kind: "venn", title, labels, counts, shade },
});
const bar = (title: string, event: string, p: number, pText: string, notText: string, hideNot = true): { chanceVisual: Chance8Visual } => ({
  chanceVisual: { kind: "bar", title, event, p, pText, notText, hideNot },
});
const DICE = range(1, 6);
const diceCount = (test: (a: number, b: number) => boolean) => DICE.flatMap((a) => DICE.filter((b) => test(a, b))).length;

/* ---------- Events on one roll or one card ---------- */
type Event = { text: string; test: (n: number) => boolean };
const isPrime = (n: number) => n > 1 && range(2, n - 1).every((d) => n % d);
const events = (max: number, r: R): Event[] => {
  const k = r(2, max - 2), m = pick(r, [3, 4, 5].filter((x) => x <= max / 2));
  return [
    { text: "an even number", test: (n) => n % 2 === 0 },
    { text: "an odd number", test: (n) => n % 2 === 1 },
    { text: `a number greater than ${k}`, test: (n) => n > k },
    { text: `a number less than ${k + 1}`, test: (n) => n <= k },
    { text: `a multiple of ${m}`, test: (n) => n % m === 0 },
    { text: "a prime number", test: isPrime },
  ];
};
const outcomes = (max: number, e: Event) => range(1, max).filter(e.test);

/* ---------- Week 1: an event and its complement ---------- */
const identifyNotEvent: Form[] = [
  (r) => {
    const n = r(6, 12), e = pick(r, events(n, r)), a = outcomes(n, e), not = range(1, n).filter((x) => !e.test(x));
    return { prompt: `The spinner is spun once. Event A is “landing on ${e.text}”. How many sections are in “not A”?`, answer: not.length, steps: [`A = {${a.join(", ")}}.`, `“Not A” is every other section: {${not.join(", ")}}, so ${not.length} sections.`], ...numberSpinner("Spinner numbered 1 to " + n, n) };
  },
  (r) => {
    const k = r(2, 5), say = (xs: number[]) => (xs.length === 6 ? "Rolling any number from 1 to 6" : `Rolling ${orList(xs)}`);
    const answer = say(range(1, k));
    return { prompt: `A die is rolled. Event A is “rolling a number greater than ${k}”. Which describes “not A”?`, answer, choices: [answer, say(range(1, k - 1)), say(range(k + 1, 6)), say(range(1, k + 1))], steps: [`A = {${range(k + 1, 6).join(", ")}}.`, `“Not A” is every other outcome: ${orList(range(1, k))}.`] };
  },
  (r) => {
    const n = r(15, 30), m = r(3, 6), count = Math.floor(n / m);
    return { prompt: `Cards are numbered 1 to ${n}. Event A is “drawing a multiple of ${m}”. How many cards are in “not A”?`, answer: n - count, steps: [`Multiples of ${m}: ${range(1, count).map((i) => i * m).join(", ")} — ${count} cards.`, `Not A: ${n} − ${count} = ${n - count} cards.`] };
  },
  (r) => {
    const PAIRS: [string, (n: number) => boolean, string, (n: number) => boolean][] = [
      ["rolling an even number", (n) => n % 2 === 0, "rolling an odd number", (n) => n % 2 === 1],
      ["rolling a number less than 3", (n) => n < 3, "rolling a number greater than 3", (n) => n > 3],
      ["rolling a 6", (n) => n === 6, "rolling a number from 1 to 5", (n) => n <= 5],
      ["rolling an even number", (n) => n % 2 === 0, "rolling a number greater than 3", (n) => n > 3],
      ["rolling at most 2", (n) => n <= 2, "rolling at least 3", (n) => n >= 3],
      ["rolling a prime number", isPrime, "rolling an even number", (n) => n % 2 === 0],
      ["rolling a 1 or a 2", (n) => n <= 2, "rolling a number greater than 2", (n) => n > 2],
    ];
    const [ta, fa, tb, fb] = pick(r, PAIRS), a = DICE.filter(fa), b = DICE.filter(fb);
    const overlap = a.filter(fb), missed = DICE.filter((n) => !fa(n) && !fb(n)), yes = !overlap.length && !missed.length;
    return yesNo(`A die is rolled once. Are “${ta}” and “${tb}” complementary events?`, yes, [
      `First = {${a.join(", ")}}. Second = {${b.join(", ")}}.`,
      yes ? "No outcome is in both, and together they include all of 1 to 6, so they are complementary." : overlap.length ? `${listed(overlap)} ${overlap.length === 1 ? "is" : "are"} in both events, so they are not complementary.` : `${listed(missed)} ${missed.length === 1 ? "is" : "are"} in neither event, so they are not complementary.`,
    ]);
  },
  (r) => {
    const cs: Colour[] = ["red", "blue", "green"], counts = cs.map(() => r(2, 9)), e = pick(r, [0, 1, 2]), total = sum(counts);
    return { prompt: `One counter is taken from the bag. Event A is “taking a ${cs[e]} counter”. How many counters are in “not A”?`, answer: total - counts[e], steps: ["“Not A” is every counter that is not " + cs[e] + ".", `${total} − ${counts[e]} = ${total - counts[e]} counters.`], ...bag("Counters in the bag", cs.map((c, i) => [c, counts[i]])) };
  },
];
const complementFraction: Form[] = [
  (r) => {
    const d = r(3, 12), n = r(1, d - 1);
    return { prompt: `P(A) = ${n}/${d}. Find P(not A).`, answer: fraction(d - n, d), steps: ["P(A) + P(not A) = 1.", `P(not A) = ${d}/${d} − ${n}/${d} = ${fraction(d - n, d)}.`], ...bar("Probability bar", "A", n / d, `${n}/${d}`, fraction(d - n, d)) };
  },
  (r) => {
    const n = r(6, 10), red = r(1, n - 2), blue = r(1, n - red - 1), yellow = n - red - blue;
    return { prompt: "The spinner is spun once. What is the probability it does not land on red?", answer: fraction(n - red, n), steps: [`P(red) = ${red}/${n}.`, `P(not red) = 1 − ${red}/${n} = ${fraction(n - red, n)}.`], ...spinner("Equal sections", [["red", red], ["blue", blue], ["yellow", yellow]]) };
  },
  (r) => {
    const counts: [Colour, number][] = [["red", r(1, 8)], ["blue", r(1, 8)], ["green", r(1, 8)]], total = sum(counts.map((c) => c[1])), blue = counts[1][1];
    return { prompt: "One counter is taken at random. What is the probability it is not blue?", answer: fraction(total - blue, total), steps: [`P(blue) = ${blue}/${total}.`, `P(not blue) = 1 − ${blue}/${total} = ${fraction(total - blue, total)}.`], ...bag("Counters in the bag", counts) };
  },
  (r) => {
    const d = pick(r, [5, 8, 10, 12, 20]), n = r(1, d - 1), [event, not] = pick(r, [["it rains tomorrow", "it does not rain"], ["the bus is late", "the bus is not late"], ["a seed sprouts", "the seed does not sprout"], ["a shot goes in", "the shot misses"]] as const);
    return { prompt: `The probability that ${event} is ${fraction(n, d)}. What is the probability that ${not}?`, answer: fraction(d - n, d), steps: ["The two events are complementary, so their probabilities add to 1.", `1 − ${fraction(n, d)} = ${fraction(d - n, d)}.`] };
  },
  (r) => {
    const d = r(4, 15), n = r(1, d - 1);
    return { prompt: `P(not A) = ${n}/${d}. Find P(A).`, answer: fraction(d - n, d), steps: ["P(A) = 1 − P(not A).", `${d}/${d} − ${n}/${d} = ${fraction(d - n, d)}.`] };
  },
];
const complementDecimal: Form[] = [
  (r) => {
    const p = r(1, 99) / 100;
    return { prompt: `P(A) = ${p}. Find P(not A) as a decimal.`, answer: dec(1 - p), steps: ["P(not A) = 1 − P(A).", `1 − ${p} = ${dec(1 - p)}.`] };
  },
  (r) => {
    const c = r(5, 95);
    return { prompt: `The forecast gives ${an(c)} ${c}% chance of rain. What is the chance of no rain?`, answer: 100 - c, unit: "%", steps: ["As percentages, complementary events add to 100%.", `100% − ${c}% = ${100 - c}%.`] };
  },
  (r) => {
    const p = r(1, 20) / 100;
    return { prompt: `The probability of winning a prize is ${p}. What is the percentage chance of not winning?`, answer: 100 - Math.round(p * 100), unit: "%", steps: [`${p} = ${Math.round(p * 100)}%.`, `100% − ${Math.round(p * 100)}% = ${100 - Math.round(p * 100)}%.`] };
  },
  (r) => {
    const p = r(5, 95) / 100;
    return { prompt: "The bar shows P(A). What is P(not A)? Give a decimal.", answer: dec(1 - p), steps: ["The whole bar is 1.", `1 − ${p} = ${dec(1 - p)}.`], ...bar("Probability bar", "A", p, String(p), dec(1 - p)) };
  },
  (r) => {
    let a = r(11, 89);
    if (a === 50) a = 35;
    const p = a / 100, answer = `${p} and ${100 - a}%`;
    const wrong = [`${p} and ${a}%`, `${p} and ${dec(1.1 - p)}`, `${a}% and ${95 - a}%`];
    return { prompt: "Which pair could be the probabilities of an event and its complement?", answer, choices: [answer, ...wrong], steps: ["Write both in the same form, then check they add to 1 (or 100%).", `${p} = ${a}%, and ${a}% + ${100 - a}% = 100%.`] };
  },
];

/* ---------- Week 2: complements in context ---------- */
const missingProbability: Form[] = [
  (r) => {
    const p1 = r(10, 40), p2 = r(10, 40), p3 = 100 - p1 - p2;
    return { prompt: "A spinner can only land on red, blue or green. Find P(green) as a decimal.", answer: dec(p3 / 100), steps: ["The probabilities of all outcomes add to 1.", `1 − ${p1 / 100} − ${p2 / 100} = ${dec(p3 / 100)}.`], visual: table("Spinner probabilities", ["Colour", "Probability"], [["Red", p1 / 100], ["Blue", p2 / 100], ["Green", "?"]]) };
  },
  (r) => {
    const s = r(10, 50), c = r(10, 40);
    return { prompt: `Tomorrow will be sunny, cloudy or rainy. P(sunny) = ${s}% and P(cloudy) = ${c}%. What is P(rainy)?`, answer: 100 - s - c, unit: "%", steps: ["The three outcomes cover every possibility, so they add to 100%.", `100% − ${s}% − ${c}% = ${100 - s - c}%.`] };
  },
  (r) => {
    const t = pick(r, [20, 40, 60]), red = t / 4, blue = (t / 5) * r(1, 2), green = t - red - blue;
    return { prompt: `A bag of ${t} counters holds red, blue and green counters. P(red) = ${fraction(red, t)} and P(blue) = ${fraction(blue, t)}. How many counters are green?`, answer: green, steps: [`Red: ${fraction(red, t)} × ${t} = ${red}. Blue: ${fraction(blue, t)} × ${t} = ${blue}.`, `Green: ${t} − ${red} − ${blue} = ${green}.`] };
  },
  (r) => {
    const ps = range(1, 5).map(() => r(5, 17)), six = 100 - sum(ps);
    return { prompt: "A biased die has the probabilities shown. Find P(6) as a decimal.", answer: dec(six / 100), steps: [`P(1) to P(5) add to ${dec(sum(ps) / 100)}.`, `P(6) = 1 − ${dec(sum(ps) / 100)} = ${dec(six / 100)}.`], visual: table("Biased die", ["Number", "1", "2", "3", "4", "5", "6"], [["Probability", ...ps.map((p) => p / 100), "?"]]) };
  },
  (r) => {
    const p = r(5, 95) / 100;
    return { prompt: `P(not A) = ${p}. Find P(A).`, answer: dec(1 - p), steps: ["P(A) = 1 − P(not A).", `1 − ${p} = ${dec(1 - p)}.`] };
  },
];
const unequalOutcomes: Form[] = [
  (r) => {
    const red = r(1, 4), blue = r(1, 6 - red), yellow = 8 - red - blue;
    return { prompt: "The spinner has 8 equal sections. What is the probability it does not land on blue?", answer: fraction(8 - blue, 8), steps: [`Blue covers ${blue} of 8 sections, so P(blue) = ${fraction(blue, 8)}.`, `P(not blue) = 1 − ${fraction(blue, 8)} = ${fraction(8 - blue, 8)}.`], ...spinner("Unequal colours", [["red", red], ["blue", blue], ["yellow", yellow]]) };
  },
  (r) => {
    const p = r(15, 40) / 100;
    return { prompt: `A die is weighted so that P(6) = ${p}. What is P(not 6)?`, answer: dec(1 - p), steps: ["Weighting changes the probabilities, but complements still add to 1.", `1 − ${p} = ${dec(1 - p)}.`] };
  },
  (r) => {
    const counts: [Colour, number][] = [["red", r(2, 9)], ["blue", r(2, 9)], ["green", r(1, 4)]], total = sum(counts.map((c) => c[1])), g = counts[2][1];
    return { prompt: "One counter is taken at random. What is the probability it is not green?", answer: fraction(total - g, total), steps: [`P(green) = ${g}/${total}.`, `P(not green) = 1 − ${g}/${total} = ${fraction(total - g, total)}.`], ...bag("Counters in the bag", counts) };
  },
  (r) => {
    const [redText, red, blueText, blue] = pick(r, [["half", 1 / 2, "a quarter", 1 / 4], ["a third", 1 / 3, "a third", 1 / 3], ["half", 1 / 2, "a sixth", 1 / 6], ["a quarter", 1 / 4, "half", 1 / 2]] as const);
    const green = (1 - red - blue) / 2, d = Math.round(1 / green);
    return { prompt: `A spinner is ${redText} red and ${blueText} blue. The rest is split equally between green and yellow. What is P(not green)?`, answer: fraction(d - 1, d), steps: [`Green and yellow share 1 − ${fraction(Math.round(red * 12), 12)} − ${fraction(Math.round(blue * 12), 12)} = ${fraction(Math.round(2 * green * 12), 12)}, so P(green) = 1/${d}.`, `P(not green) = 1 − 1/${d} = ${fraction(d - 1, d)}.`] };
  },
  (r) => {
    const modes = ["Walk", "Car", "Bus", "Bike"], counts = modes.map(() => r(3, 12)), total = sum(counts), m = r(0, 3);
    return { prompt: `One student is chosen at random. What is the probability they do not travel by ${modes[m].toLowerCase()}?`, answer: fraction(total - counts[m], total), steps: [`${counts[m]} of ${total} students travel by ${modes[m].toLowerCase()}.`, `P(not ${modes[m].toLowerCase()}) = ${pf(total - counts[m], total)}.`], visual: table("How students travel to school", ["Mode", ...modes], [["Students", ...counts]]) };
  },
];
const chooseComplement: Form[] = [
  (r) => {
    const m = pick(r, [7, 8, 9, 10, 11]), n = m * r(4, 9) + r(0, m - 1), k = Math.floor(n / m);
    return { prompt: `A number from 1 to ${n} is chosen at random. What is the probability it is not a multiple of ${m}?`, answer: fraction(n - k, n), steps: [`Count the few multiples of ${m}: ${k} of them.`, `P(not a multiple) = 1 − ${k}/${n} = ${fraction(n - k, n)}.`] };
  },
  (r) => {
    const t = 50 * r(2, 10), k = r(2, 8);
    return { prompt: `${t} raffle tickets are sold for one prize. You buy ${k}. What is the probability you do not win?`, answer: fraction(t - k, t), steps: [`P(win) = ${k}/${t}.`, `P(not win) = 1 − ${k}/${t} = ${fraction(t - k, t)}.`] };
  },
  (r) => {
    const [text, ways] = pick(r, [["the two dice show a double", 6], ["the total is 12", 1], ["the total is 2 or 12", 2], ["the total is 11 or 12", 3]] as const);
    return { prompt: `Two dice are rolled. You lose only if ${text}. What is the probability you do not lose?`, answer: fraction(36 - ways, 36), steps: [`Losing outcomes: ${ways} of the 36.`, `P(not lose) = 1 − ${ways}/36 = ${fraction(36 - ways, 36)}.`], ...grid("Two dice", "First die", "Second die", DICE, DICE, text.includes("double") ? "pair" : "sum") };
  },
  (r) => {
    const m = pick(r, [10, 20, 25]), n = m * r(3, 6), k = n / m;
    const answer = `Count the ${k} multiples of ${m}, then subtract ${k}/${n} from 1`;
    return { prompt: `A number from 1 to ${n} is chosen. Which is the quickest way to find P(not a multiple of ${m})?`, answer, choices: [answer, `List all ${n - k} numbers that are not multiples of ${m}`, "Add the probability of every number one at a time", `Divide ${m} by ${n}`], steps: ["When the event is small, count it and use the complement.", `P = 1 − ${k}/${n} = ${fraction(n - k, n)}.`] };
  },
  (r) => {
    const t = 10 * r(4, 10), g = r(2, 9);
    return { prompt: `A jar holds ${t} lollies and ${g} are green. One is taken at random. What is the probability it is not green?`, answer: fraction(t - g, t), steps: [`P(green) = ${g}/${t}.`, `1 − ${g}/${t} = ${fraction(t - g, t)}.`] };
  },
];

/* ---------- Week 3: list two-event outcomes ---------- */
const orderedPairs: Form[] = [
  (r) => {
    const n = r(3, 6);
    return { prompt: `A coin is tossed and a spinner numbered 1 to ${n} is spun. How many outcomes are in the sample space?`, answer: 2 * n, steps: ["Each row of the grid is a coin result; each column is a spinner result.", `2 × ${n} = ${2 * n} outcomes.`], ...grid("Coin and spinner", "Coin", "Spinner", ["H", "T"], range(1, n), "pair", { hidden: true }) };
  },
  (r) => {
    const a = r(1, 6), b = r(1, 6);
    return { prompt: "The highlighted cell is one outcome. Write it as an ordered pair: first die, then second die.", answer: `${a}, ${b}`, input: "list", labels: ["First die", "Second die"], steps: ["The row gives the first die and the column gives the second die.", `Row ${a}, column ${b}: (${a}, ${b}).`], ...grid("Two dice", "First die", "Second die", DICE, DICE, "pair", { hidden: true, highlight: [[a - 1, b - 1]] }) };
  },
  (r) => {
    const a = r(1, 5), b = r(a + 1, 6);
    return pick(r, [
      yesNo(`A red die and a blue die are rolled. Is “red ${a}, blue ${b}” the same outcome as “red ${b}, blue ${a}”?`, false, ["The dice are different, so the order of the results matters.", `(${a}, ${b}) and (${b}, ${a}) are two different outcomes.`]),
      yesNo(`Two cards are dealt into your hand and only which cards you hold matters. Is getting card ${a} then card ${b} the same hand as card ${b} then card ${a}?`, true, ["A hand is a selection: order does not matter.", `Both give the hand {${a}, ${b}}.`]),
    ]);
  },
  (r) => {
    const a = r(2, 5), b = r(2, 4);
    return { prompt: `A café offers ${a} mains and ${b} drinks. A meal is one main and one drink. How many different meals are possible?`, answer: a * b, steps: [`Each main can be paired with each of the ${b} drinks.`, `${a} × ${b} = ${a * b} meals.`] };
  },
  (r) => {
    const n = r(2, 4), m = r(3, 6);
    return { prompt: `Spinner A has ${n} colours and spinner B is numbered 1 to ${m}. How many ordered pairs can the two spinners give?`, answer: n * m, steps: ["List spinner A's result first, then spinner B's.", `${n} × ${m} = ${n * m} ordered pairs.`] };
  },
];
const listAll: Form[] = [
  (r) => {
    const mains = ["Pasta", "Curry", "Salad"].slice(0, r(2, 3)), drinks = ["Water", "Juice", "Milk"].slice(0, r(2, 3));
    return { prompt: "How many different meals of one main and one drink does the tree show?", answer: mains.length * drinks.length, steps: [`Each of the ${mains.length} mains has ${drinks.length} drink branches.`, `${mains.length} × ${drinks.length} = ${mains.length * drinks.length} meals.`], ...tree("Meal choices", "Main", "Drink", mains, drinks) };
  },
  (r) => {
    const names = ["Ari", "Bea", "Cal", "Dev", "Eli", "Fay"].slice(0, r(3, 6)), n = names.length;
    return { prompt: `A captain and a vice-captain are chosen from ${n} students. One person cannot be both. How many ways are there?`, answer: n * (n - 1), steps: [`The grid has ${n} × ${n} = ${n * n} cells; cross out the ${n} where one person has both jobs.`, `${n * n} − ${n} = ${n * (n - 1)} ways.`], ...grid("Captain and vice-captain", "Captain", "Vice", names.map((s) => s[0]), names.map((s) => s[0]), "pair", { crossed: range(0, n - 1).map((i) => [i, i] as [number, number]) }) };
  },
  (r) => {
    const flavours = ["V", "C", "S", "M", "L", "B"].slice(0, r(4, 6)), n = flavours.length;
    return { prompt: `A double scoop uses two different flavours from ${n}. Order does not matter. How many different double scoops are there?`, answer: (n * (n - 1)) / 2, steps: [`Ordered pairs of different flavours: ${n} × ${n - 1} = ${n * (n - 1)}.`, `Each scoop appears twice (VC and CV), so ${n * (n - 1)} ÷ 2 = ${(n * (n - 1)) / 2}.`], ...grid("Flavour pairs", "First", "Second", flavours, flavours, "pair", { crossed: range(0, n - 1).map((i) => [i, i] as [number, number]) }) };
  },
  (r) => {
    const all = ["HH", "HT", "TH", "TT"], miss = r(0, 3), shown = all.filter((_, i) => i !== miss);
    return { prompt: `Mia lists the outcomes of tossing two coins as ${listed(shown)}. Which outcome is missing? Write it like HT.`, answer: all[miss], steps: ["Fix the first coin, then list every second coin: HH, HT, then TH, TT.", `Missing: ${all[miss]}.`] };
  },
  (r) => {
    const letters = r(2, 5), digits = pick(r, [4, 5, 10]);
    return { prompt: `A locker code is one letter from the first ${letters} letters of the alphabet, then one digit from ${digits === 10 ? "0 to 9" : `1 to ${digits}`}. How many codes are possible?`, answer: letters * digits, steps: [`Each of the ${letters} letters pairs with each of the ${digits} digits.`, `${letters} × ${digits} = ${letters * digits} codes.`] };
  },
];
const countCondition: Form[] = [
  (r) => {
    const s = r(3, 11), ways = diceCount((a, b) => a + b === s);
    return { prompt: `Two dice are rolled. How many of the 36 outcomes give a total of ${s}?`, answer: ways, steps: [`Find each cell in the grid showing ${s}.`, `There ${are(ways)}.`], ...grid("Totals of two dice", "First die", "Second die", DICE, DICE, "sum") };
  },
  (r) => {
    const d = r(0, 4), ways = diceCount((a, b) => Math.abs(a - b) === d);
    return { prompt: `Two dice are rolled. How many outcomes have a difference of ${d}?`, answer: ways, steps: [`Count the cells showing ${d}.`, `There ${are(ways)}.`], ...grid("Differences of two dice", "First die", "Second die", DICE, DICE, "difference") };
  },
  (r) => {
    const face = pick(r, ["H", "T"]), k = r(1, 4), word = face === "H" ? "a head" : "a tail", hits = DICE.filter((n) => n > k).length;
    return { prompt: `A coin is tossed and a die is rolled. How many outcomes show ${word} and a number greater than ${k}?`, answer: hits, steps: [`Use the ${face} row only.`, `Numbers greater than ${k}: ${DICE.filter((n) => n > k).join(", ")} — ${hits} outcomes.`], ...grid("Coin and die", "Coin", "Die", ["H", "T"], DICE, "pair") };
  },
  (r) => {
    const a = r(3, 5), b = r(3, 5), k = r(4, 10), ways = range(1, a).flatMap((x) => range(1, b).filter((y) => x * y > k)).length;
    return { prompt: `Spinner A (1 to ${a}) and spinner B (1 to ${b}) are spun and the numbers multiplied. How many outcomes give a product greater than ${k}?`, answer: ways, steps: [`Find cells greater than ${k}.`, `There ${are(ways)}.`], ...grid("Products", "Spinner A", "Spinner B", range(1, a), range(1, b), "product") };
  },
  (r) => {
    const [text, test] = pick(r, [["a double", (a: number, b: number) => a === b], ["two even numbers", (a: number, b: number) => a % 2 === 0 && b % 2 === 0], ["two odd numbers", (a: number, b: number) => a % 2 === 1 && b % 2 === 1], ["a first die larger than the second", (a: number, b: number) => a > b]] as const);
    const ways = diceCount(test);
    return { prompt: `Two dice are rolled. How many outcomes show ${text}?`, answer: ways, steps: ["Check each cell of the grid.", `${ways} outcomes.`], ...grid("Two dice", "First die", "Second die", DICE, DICE, "pair") };
  },
];

/* ---------- Week 4: two-way tables ---------- */
const TWO_WAY = [
  { row: ["Sport", "No sport"], col: ["Music", "No music"], rowSay: ["play sport", "do not play sport"], colSay: ["learn music", "do not learn music"] },
  { row: ["Dog", "No dog"], col: ["Cat", "No cat"], rowSay: ["own a dog", "do not own a dog"], colSay: ["own a cat", "do not own a cat"] },
  { row: ["Year 7", "Year 8"], col: ["Bus", "Not bus"], rowSay: ["are in Year 7", "are in Year 8"], colSay: ["catch the bus", "do not catch the bus"] },
  { row: ["Glasses", "No glasses"], col: ["Left-handed", "Right-handed"], rowSay: ["wear glasses", "do not wear glasses"], colSay: ["are left-handed", "are right-handed"] },
] as const;
function twoWayData(r: R) {
  const t = pick(r, TWO_WAY), a = r(3, 15), b = r(3, 15), c = r(3, 15), d = r(3, 15);
  const cells = [[a, b], [c, d]], total = a + b + c + d;
  const show = (hide: string[] = []) => {
    const v = (key: string, n: number) => (hide.includes(key) ? "?" : n);
    return table("Survey results", ["", t.col[0], t.col[1], "Total"], [
      [t.row[0], v("a", a), v("b", b), v("r0", a + b)],
      [t.row[1], v("c", c), v("d", d), v("r1", c + d)],
      ["Total", v("c0", a + c), v("c1", b + d), v("t", total)],
    ]);
  };
  return { t, a, b, c, d, cells, total, show };
}
const completeTable: Form[] = [
  (r) => {
    const g = twoWayData(r), key = pick(r, ["a", "b", "c", "d"] as const), val = { a: g.a, b: g.b, c: g.c, d: g.d }[key];
    const rowTotal = key === "a" || key === "b" ? g.a + g.b : g.c + g.d, other = rowTotal - val;
    return { prompt: "Find the missing number in the table.", answer: val, steps: ["Each row adds to its total.", `${rowTotal} − ${other} = ${val}.`], visual: g.show([key]) };
  },
  (r) => {
    const g = twoWayData(r), key = pick(r, ["r0", "r1", "c0", "c1"] as const);
    const val = { r0: g.a + g.b, r1: g.c + g.d, c0: g.a + g.c, c1: g.b + g.d }[key], parts = { r0: [g.a, g.b], r1: [g.c, g.d], c0: [g.a, g.c], c1: [g.b, g.d] }[key];
    return { prompt: "Find the missing total.", answer: val, steps: [`Add the ${key[0] === "r" ? "row" : "column"}: ${parts[0]} + ${parts[1]}.`, `= ${val}.`], visual: g.show([key]) };
  },
  (r) => {
    const g = twoWayData(r);
    return { prompt: `How many students ${g.t.rowSay[1]} and ${g.t.colSay[1]}?`, answer: g.d, steps: [`First column: ${g.a + g.c} − ${g.a} = ${g.c}.`, `Second row: ${g.c + g.d} − ${g.c} = ${g.d}.`], visual: g.show(["b", "c", "d"]) };
  },
  (r) => {
    const g = twoWayData(r), rowYes = g.a + g.b, colYes = g.a + g.c;
    return { prompt: `${g.total} students were surveyed. ${rowYes} ${g.t.rowSay[0]}, ${colYes} ${g.t.colSay[0]} and ${g.a} do both. How many students ${g.t.rowSay[1]} and ${g.t.colSay[1]}?`, answer: g.d, steps: [`Put ${g.a} in the “both” cell. Then ${rowYes} − ${g.a} = ${g.b} and ${colYes} − ${g.a} = ${g.c}.`, `${g.total} − ${g.a} − ${g.b} − ${g.c} = ${g.d}.`] };
  },
  (r) => {
    const g = twoWayData(r);
    return { prompt: "How many people were surveyed altogether?", answer: g.total, steps: ["Add the four inside cells (or the two row totals).", `${g.a} + ${g.b} + ${g.c} + ${g.d} = ${g.total}.`], visual: g.show(["r0", "r1", "c0", "c1", "t"]) };
  },
];
const readTable: Form[] = [
  (r) => {
    const g = twoWayData(r);
    return { prompt: `How many students ${g.t.rowSay[0]} and ${g.t.colSay[0]}?`, answer: g.a, steps: ["“And” means one cell: the row and the column must both match.", `Row ${g.t.row[0]}, column ${g.t.col[0]}: ${g.a}.`], visual: g.show() };
  },
  (r) => {
    const g = twoWayData(r), k = r(0, 1), val = k ? g.b + g.d : g.a + g.c;
    return { prompt: `How many students ${g.t.colSay[k]}?`, answer: val, steps: [`Use the ${g.t.col[k]} column total.`, `${k ? g.b : g.a} + ${k ? g.d : g.c} = ${val}.`], visual: g.show(["c0", "c1", "t"]) };
  },
  (r) => {
    const g = twoWayData(r);
    return { prompt: `How many students ${g.t.rowSay[0]} or ${g.t.colSay[0]} (or both)?`, answer: g.a + g.b + g.c, steps: [`Include every cell in the ${g.t.row[0]} row or the ${g.t.col[0]} column. Count the shared cell once.`, `${g.a} + ${g.b} + ${g.c} = ${g.a + g.b + g.c}.`], visual: g.show() };
  },
  (r) => {
    const g = twoWayData(r);
    return { prompt: `How many students ${g.t.rowSay[1]} and ${g.t.colSay[1]}?`, answer: g.d, steps: [`Row ${g.t.row[1]}, column ${g.t.col[1]}.`, `That cell is ${g.d}.`], visual: g.show() };
  },
  (r) => {
    const g = twoWayData(r), answer = `${g.b} students ${g.t.rowSay[0]} and ${g.t.colSay[1]}`;
    return { prompt: `What does the number ${g.b} in the table tell you?`, answer, choices: [answer, `${g.b} students ${g.t.rowSay[0]}`, `${g.b} students ${g.t.colSay[1]}`, `${g.b} students ${g.t.rowSay[0]} or ${g.t.colSay[1]}`], steps: ["An inside cell matches its row and its column at the same time.", answer + "."], visual: g.show() };
  },
];
const tableProbability: Form[] = [
  (r) => {
    const g = twoWayData(r);
    return { prompt: `One student is chosen at random. What is the probability they ${g.t.rowSay[0]} and ${g.t.colSay[0]}?`, answer: fraction(g.a, g.total), steps: [`Favourable: ${g.a}. Total: ${g.total}.`, `P = ${pf(g.a, g.total)}.`], visual: g.show() };
  },
  (r) => {
    const g = twoWayData(r), k = r(0, 1), val = k ? g.c + g.d : g.a + g.b;
    return { prompt: `One student is chosen at random. What is the probability they ${g.t.rowSay[k]}?`, answer: fraction(val, g.total), steps: [`Use the row total: ${val}.`, `P = ${pf(val, g.total)}.`], visual: g.show() };
  },
  (r) => {
    const g = twoWayData(r);
    return { prompt: `One student is chosen at random. What is P(they ${g.t.colSay[1]})?`, answer: fraction(g.b + g.d, g.total), steps: [`${g.t.col[1]} column: ${g.b} + ${g.d} = ${g.b + g.d}.`, `P = ${pf(g.b + g.d, g.total)}.`], visual: g.show() };
  },
  (r) => {
    const g = twoWayData(r), n = g.a + g.b + g.c;
    return { prompt: `One student is chosen at random. What is the probability they ${g.t.rowSay[0]} or ${g.t.colSay[0]}?`, answer: fraction(n, g.total), steps: [`“Or” includes both: ${g.a} + ${g.b} + ${g.c} = ${n}.`, `P = ${pf(n, g.total)}.`], visual: g.show() };
  },
  (r) => {
    const g = twoWayData(r);
    return { prompt: `What percentage of students ${g.t.rowSay[1]} and ${g.t.colSay[1]}? Round to one decimal place.`, answer: rounded((100 * g.d) / g.total, 1), unit: "%", steps: [`${g.d} of ${g.total} students.`, `${g.d} ÷ ${g.total} × 100 ≈ ${rounded((100 * g.d) / g.total, 1)}%.`], visual: g.show() };
  },
];

/* ---------- Week 5: tree diagrams ---------- */
const TREE_SETS: [string, string[]][] = [["Coin", ["H", "T"]], ["Colour", ["R", "B", "G"]], ["Letter", ["A", "B", "C"]], ["Number", ["1", "2", "3", "4"]], ["Drink", ["W", "J"]]];
const buildTree: Form[] = [
  (r) => {
    const [l1, f] = pick(r, TREE_SETS), [l2, s] = pick(r, TREE_SETS.filter(([l]) => l !== l1));
    return { prompt: "How many complete paths (outcomes) does this tree have?", answer: f.length * s.length, steps: [`${f.length} first branches, each with ${s.length} second branches.`, `${f.length} × ${s.length} = ${f.length * s.length} paths.`], ...tree("Two-stage tree", l1, l2, f, s) };
  },
  (r) => {
    const a = r(2, 4), b = r(2, 5);
    return { prompt: `The first stage of a tree has ${a} branches and there are ${a * b} complete paths. How many branches come from each first-stage branch?`, answer: b, steps: ["Paths = first-stage branches × second-stage branches.", `${a * b} ÷ ${a} = ${b}.`] };
  },
  (r) => {
    const n = r(2, 3);
    return { prompt: `A coin is tossed ${n === 2 ? "twice" : "three times"}. How many paths does the tree diagram have?`, answer: 2 ** n, steps: ["Each toss doubles the number of branches.", `${Array(n).fill(2).join(" × ")} = ${2 ** n}.`] };
  },
  (r) => {
    const k = r(4, 6), answer = `2 branches, then ${k} from each`;
    return { prompt: `Which tree matches “toss a coin, then spin a spinner with ${k} sections”?`, answer, choices: [answer, `${k} branches, then 2 from each`, `2 branches, then ${k} in total`, `${k + 2} branches`], steps: ["The first event gives the first branches.", `Coin first: 2 branches, each splitting into ${k}: ${2 * k} paths.`] };
  },
  (r) => {
    const n = r(3, 5), back = r(0, 1) === 1;
    return { prompt: `A bag holds ${n} different coloured counters. One is taken${back ? " and put back" : " and not put back"}, then a second is taken. How many paths does the tree have?`, answer: back ? n * n : n * (n - 1), steps: [back ? `The counter is replaced, so the second stage still has ${n} branches.` : `The counter is not replaced, so the second stage has only ${n - 1} branches.`, back ? `${n} × ${n} = ${n * n}.` : `${n} × ${n - 1} = ${n * (n - 1)}.`] };
  },
];
const readTree: Form[] = [
  (r) => {
    const s = ["R", "B", "G", "Y"].slice(0, r(2, 4));
    return { prompt: "A spinner is spun twice. How many outcomes show the same colour both times?", answer: s.length, steps: ["Same colour: RR, BB, … one path for each colour.", `${s.length} outcomes.`], ...tree("Spin twice", "First spin", "Second spin", s, s) };
  },
  (r) => {
    const s = ["R", "B", "G", "Y"].slice(0, r(3, 4)), x = pick(r, s);
    return { prompt: `A spinner is spun twice. How many outcomes have exactly one ${x}?`, answer: 2 * (s.length - 1), steps: [`${x} first then not ${x}: ${s.length - 1}. Not ${x} then ${x}: ${s.length - 1}.`, `${s.length - 1} + ${s.length - 1} = ${2 * (s.length - 1)}.`], ...tree("Spin twice", "First spin", "Second spin", s, s) };
  },
  (r) => {
    const f = range(1, r(2, 3)).map(String), s = range(1, 4).map(String), k = r(3, 5);
    const hits = f.flatMap((a) => s.filter((b) => Number(a) + Number(b) > k)).length;
    return { prompt: `How many outcomes on this tree have a total greater than ${k}?`, answer: hits, steps: ["Add the two numbers on each path.", `${hits} paths have a total greater than ${k}.`], ...tree("Two spinners", "Spinner A", "Spinner B", f, s) };
  },
  (r) => {
    const n = r(2, 3);
    return { prompt: `A coin is tossed ${n === 2 ? "twice" : "three times"}. How many outcomes include at least one head?`, answer: 2 ** n - 1, steps: [`There are ${2 ** n} outcomes and only one has no heads (${"T".repeat(n)}).`, `${2 ** n} − 1 = ${2 ** n - 1}.`] };
  },
  (r) => {
    const [l1, f] = pick(r, TREE_SETS), [l2, s] = pick(r, TREE_SETS.filter(([l]) => l !== l1 && l !== "Drink"));
    const swapped = `${s[0]}, ${f[0]}`, missing = f.includes(s[0]) && s.includes(f[0]) ? `${f[0]}, Z` : swapped;
    const paths = f.flatMap((a) => s.map((b) => `${a}, ${b}`)), real: string[] = [];
    while (real.length < 3) { const p = pick(r, paths); if (!real.includes(p)) real.push(p); }
    return { prompt: "Which outcome is NOT on this tree?", answer: missing, choices: [missing, ...real], steps: ["Every outcome is one first branch followed by one second branch.", `Each path lists the ${l1.toLowerCase()} first, then the ${l2.toLowerCase()}. (${missing}) does not follow a path.`], ...tree("Two-stage tree", l1, l2, f, s) };
  },
];
const treeProbability: Form[] = [
  (r) => {
    const [l1, f] = pick(r, TREE_SETS), [l2, s] = pick(r, TREE_SETS.filter(([l]) => l !== l1)), a = pick(r, f), b = pick(r, s);
    return { prompt: `All paths are equally likely. What is P(${a}, ${b})?`, answer: fraction(1, f.length * s.length), steps: [`There are ${f.length * s.length} equally likely paths.`, `One of them is (${a}, ${b}), so P = 1/${f.length * s.length}.`], ...tree("Two-stage tree", l1, l2, f, s) };
  },
  (r) => {
    const s = ["R", "B", "G", "Y"].slice(0, r(2, 4));
    return { prompt: "A fair spinner is spun twice. What is the probability of the same colour both times?", answer: fraction(s.length, s.length ** 2), steps: [`${s.length} of the ${s.length ** 2} paths have matching colours.`, `P = ${s.length}/${s.length ** 2} = ${fraction(1, s.length)}.`], ...tree("Spin twice", "First spin", "Second spin", s, s) };
  },
  (r) => {
    const n = r(2, 3), ways = n === 2 ? 2 : 3;
    return { prompt: `A fair coin is tossed ${n === 2 ? "twice" : "three times"}. What is the probability of exactly one head?`, answer: fraction(ways, 2 ** n), steps: [n === 2 ? "Outcomes with one head: HT, TH." : "Outcomes with one head: HTT, THT, TTH.", `P = ${ways}/${2 ** n}${fraction(ways, 2 ** n) === `${ways}/${2 ** n}` ? "" : ` = ${fraction(ways, 2 ** n)}`}.`] };
  },
  (r) => {
    const f = range(1, 3).map(String), s = range(1, r(3, 4)).map(String), k = r(3, 5);
    const hits = f.flatMap((a) => s.filter((b) => Number(a) + Number(b) > k)).length, n = f.length * s.length;
    return { prompt: `Both spinners are fair. What is the probability that the total is greater than ${k}?`, answer: fraction(hits, n), steps: [`${hits} of the ${n} paths have a total greater than ${k}.`, `P = ${pf(hits, n)}.`], ...tree("Two spinners", "Spinner A", "Spinner B", f, s) };
  },
  (r) => {
    const [text, ways] = pick(r, [["two girls", 1], ["one girl and one boy", 2], ["at least one boy", 3]] as const);
    return { prompt: `A family has two children. Assume each child is equally likely to be a girl (G) or a boy (B). What is P(${text})?`, answer: fraction(ways, 4), steps: ["Paths: GG, GB, BG, BB.", `${ways} of the 4 paths ${ways === 1 ? "matches" : "match"}, so P = ${fraction(ways, 4)}.`], ...tree("Two children", "First child", "Second child", ["G", "B"], ["G", "B"]) };
  },
];

/* ---------- Week 6: Venn diagrams ---------- */
const VENN_LABELS: [string, string][] = [["Netball", "Soccer"], ["Chess", "Drama"], ["Art", "Music"], ["Swimming", "Athletics"], ["Choir", "Band"]];
function vennData(r: R) {
  const labels = pick(r, VENN_LABELS), a = r(3, 15), both = r(1, 10), b = r(3, 15), neither = r(2, 12);
  return { labels, a, both, b, neither, total: a + both + b + neither, A: a + both, B: b + both };
}
const placeVenn: Form[] = [
  (r) => {
    const [p, q] = pick(r, [[2, 3], [2, 5], [3, 4], [3, 5]] as const), n = 10 * r(2, 4), both = Math.floor(n / (p * q));
    return { prompt: `Numbers 1 to ${n} are sorted into “multiples of ${p}” and “multiples of ${q}”. How many numbers go in the overlap?`, answer: both, steps: [`The overlap holds numbers that are multiples of both: multiples of ${p * q}.`, `${range(1, both).map((i) => i * p * q).join(", ")} — ${both} numbers.`], ...venn(`Numbers 1 to ${n}`, [`Multiples of ${p}`, `Multiples of ${q}`], ["?", "?", "?", "?"]) };
  },
  (r) => {
    const v = vennData(r);
    return { prompt: `${v.total} students were asked. ${v.A} do ${v.labels[0]}, ${v.B} do ${v.labels[1]} and ${v.both} ${v.both === 1 ? "does" : "do"} both. How many do ${v.labels[0]} only?`, answer: v.a, steps: [`Put ${v.both} in the overlap first.`, `${v.labels[0]} only: ${v.A} − ${v.both} = ${v.a}.`], ...venn("Club survey", v.labels, ["?", v.both, "?", "?"]) };
  },
  (r) => {
    const v = vennData(r);
    return { prompt: `${v.total} students were asked. ${v.A} do ${v.labels[0]}, ${v.B} do ${v.labels[1]} and ${v.both} ${v.both === 1 ? "does" : "do"} both. How many do neither?`, answer: v.neither, steps: [`Inside the circles: ${v.A} + ${v.B} − ${v.both} = ${v.a + v.both + v.b} (count the overlap once).`, `Neither: ${v.total} − ${v.a + v.both + v.b} = ${v.neither}.`], ...venn("Club survey", v.labels, ["?", v.both, "?", "?"]) };
  },
  (r) => {
    const v = vennData(r);
    return { prompt: `The table is redrawn as a Venn diagram. What number goes in the “${v.labels[1]} only” region?`, answer: v.b, steps: [`${v.labels[1]} only means ${v.labels[1]} and not ${v.labels[0]}.`, `That cell in the table is ${v.b}.`], visual: table("Survey results", ["", v.labels[1], `Not ${v.labels[1]}`], [[v.labels[0], v.both, v.a], [`Not ${v.labels[0]}`, v.b, v.neither]]) };
  },
  (r) => {
    const [x, y] = pick(r, VENN_LABELS), k = r(0, 3);
    const desc = [`does ${x} but not ${y}`, `does both ${x} and ${y}`, `does ${y} but not ${x}`, `does neither ${x} nor ${y}`][k];
    const regions = [`${x} only`, "The overlap", `${y} only`, "Outside both circles"];
    return { prompt: `Where does a student who ${desc} go on the Venn diagram?`, answer: regions[k], choices: regions, steps: ["Inside a circle means yes for that activity; outside means no.", `${regions[k]}.`], ...venn("Activities", [x, y], ["", "", "", ""]) };
  },
];
const vennCounts: Form[] = [
  (r) => { const v = vennData(r); return { prompt: `How many students do both ${v.labels[0]} and ${v.labels[1]}?`, answer: v.both, steps: ["Both means the overlap.", `${v.both}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
  (r) => { const v = vennData(r); return { prompt: `How many students do ${v.labels[0]} or ${v.labels[1]} (or both)?`, answer: v.a + v.both + v.b, steps: ["Add every region inside the circles.", `${v.a} + ${v.both} + ${v.b} = ${v.a + v.both + v.b}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
  (r) => { const v = vennData(r); return { prompt: "How many students do neither activity?", answer: v.neither, steps: ["Neither is outside both circles.", `${v.neither}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
  (r) => { const v = vennData(r); return { prompt: "How many students do exactly one of the activities?", answer: v.a + v.b, steps: ["Exactly one leaves out the overlap.", `${v.a} + ${v.b} = ${v.a + v.b}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
  (r) => { const v = vennData(r); return { prompt: `How many students do not do ${v.labels[0]}?`, answer: v.b + v.neither, steps: [`Everything outside the ${v.labels[0]} circle.`, `${v.b} + ${v.neither} = ${v.b + v.neither}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
];
const vennProbability: Form[] = [
  (r) => { const v = vennData(r); return { prompt: `One student is chosen at random. What is P(both ${v.labels[0]} and ${v.labels[1]})?`, answer: fraction(v.both, v.total), steps: [`Overlap ${v.both}, total ${v.total}.`, `P = ${pf(v.both, v.total)}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
  (r) => { const v = vennData(r), n = v.a + v.both + v.b; return { prompt: `One student is chosen at random. What is P(${v.labels[0]} or ${v.labels[1]})?`, answer: fraction(n, v.total), steps: [`Inside the circles: ${v.a} + ${v.both} + ${v.b} = ${n}. Total: ${v.total}.`, `P = ${pf(n, v.total)}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
  (r) => { const v = vennData(r); return { prompt: "One student is chosen at random. What is the probability they do neither activity?", answer: fraction(v.neither, v.total), steps: [`Neither: ${v.neither}. Total: ${v.total}.`, `P = ${fraction(v.neither, v.total)}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
  (r) => { const v = vennData(r), n = v.a + v.neither; return { prompt: `One student is chosen at random. What is P(not ${v.labels[1]})?`, answer: fraction(n, v.total), steps: [`Outside the ${v.labels[1]} circle: ${v.a} + ${v.neither} = ${n}.`, `P = ${pf(n, v.total)}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
  (r) => { const v = vennData(r); return { prompt: `What percentage of students do ${v.labels[0]} only? Round to one decimal place.`, answer: rounded((100 * v.a) / v.total, 1), unit: "%", steps: [`${v.labels[0]} only: ${v.a} of ${v.total}.`, `${v.a} ÷ ${v.total} × 100 ≈ ${rounded((100 * v.a) / v.total, 1)}%.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
];

/* ---------- Week 7: and, or, not, at least ---------- */
function twoEvents(r: R) {
  const n = pick(r, [6, 10, 12, 20]), es = events(n, r), A = pick(r, es), B = pick(r, es.filter((e) => e.text !== A.text && !(A.text.includes("even") && e.text.includes("odd")) && !(A.text.includes("odd") && e.text.includes("even"))));
  const where = n === 6 ? "A die is rolled" : `A card is drawn from cards numbered 1 to ${n}`;
  const a = outcomes(n, A), b = outcomes(n, B), and = a.filter(B.test), or = range(1, n).filter((x) => A.test(x) || B.test(x));
  return { n, A, B, where, a, b, and, or };
}
const andOr: Form[] = [
  (r) => { const e = twoEvents(r); return { prompt: `${e.where}. How many outcomes are ${e.A.text} and ${e.B.text}?`, answer: e.and.length, steps: [`${cap(e.A.text)}: {${e.a.join(", ")}}. ${cap(e.B.text)}: {${e.b.join(", ")}}.`, `In both: {${e.and.join(", ") || "none"}}, so ${e.and.length}.`] }; },
  (r) => { const e = twoEvents(r); return { prompt: `${e.where}. How many outcomes are ${e.A.text} or ${e.B.text} (or both)?`, answer: e.or.length, steps: [`${cap(e.A.text)}: {${e.a.join(", ")}}. ${cap(e.B.text)}: {${e.b.join(", ")}}.`, `Combine, counting shared outcomes once: {${e.or.join(", ")}}, so ${e.or.length}.`] }; },
  (r) => { const e = twoEvents(r); return { prompt: `${e.where}. What is P(${e.A.text} or ${e.B.text})?`, answer: fraction(e.or.length, e.n), steps: [`Either event: {${e.or.join(", ")}} — ${e.or.length} outcomes.`, `P = ${pf(e.or.length, e.n)}.`] }; },
  (r) => {
    const v = vennData(r), [x, y] = v.labels, opts: [string, VennRegion[]][] = [[`${x} and ${y}`, ["both"]], [`${x} or ${y}`, ["a", "both", "b"]], [`${x} only`, ["a"]], [`Neither ${x} nor ${y}`, ["neither"]]];
    const [answer, shade] = pick(r, opts);
    return { prompt: "Which event does the shaded region show?", answer, choices: opts.map((o) => o[0]), steps: ["“And” is only the overlap. “Or” is everything inside the circles.", `The shading shows ${answer}.`], ...venn("Shaded region", v.labels, [v.a, v.both, v.b, v.neither], shade) };
  },
  (r) => { const e = twoEvents(r); return { prompt: `${e.where}. What is P(${e.A.text} and ${e.B.text})?`, answer: fraction(e.and.length, e.n), steps: [`Both events: {${e.and.join(", ") || "none"}} — ${e.and.length} outcome${e.and.length === 1 ? "" : "s"}.`, `P = ${e.and.length ? pf(e.and.length, e.n) : `0/${e.n} = 0`}.`] }; },
];
const mutuallyExclusive: Form[] = [
  (r) => {
    const e = twoEvents(r), yes = e.and.length === 0;
    return yesNo(`${e.where}. Are “${e.A.text}” and “${e.B.text}” mutually exclusive?`, yes, [`${cap(e.A.text)}: {${e.a.join(", ")}}. ${cap(e.B.text)}: {${e.b.join(", ")}}.`, yes ? "No outcome is in both, so they cannot happen together: mutually exclusive." : `${listed(e.and)} ${e.and.length === 1 ? "is" : "are"} in both, so they are not mutually exclusive.`]);
  },
  (r) => {
    const p = r(10, 45), q = r(10, 45);
    return { prompt: `A spinner lands on red with probability ${p / 100} and on blue with probability ${q / 100}. It cannot land on both. What is P(red or blue)?`, answer: dec((p + q) / 100), steps: ["Mutually exclusive events have no overlap, so add their probabilities.", `${p / 100} + ${q / 100} = ${dec((p + q) / 100)}.`] };
  },
  (r) => { const v = vennData(r); return { prompt: `How many students do ${v.labels[0]} or ${v.labels[1]} but not both?`, answer: v.a + v.b, steps: ["“But not both” is exclusive or: leave out the overlap.", `${v.a} + ${v.b} = ${v.a + v.b}.`], ...venn("Activities", v.labels, [v.a, v.both, v.b, v.neither]) }; },
  (r) => {
    const v = { ...vennData(r), both: 0 }, t = v.a + v.b + v.neither;
    return { prompt: `No student does both activities. What is P(${v.labels[0]} or ${v.labels[1]})?`, answer: fraction(v.a + v.b, t), steps: ["The events are mutually exclusive, so the overlap is 0.", `P = (${v.a} + ${v.b})/${t} = ${fraction(v.a + v.b, t)}.`], ...venn("Activities", v.labels, [v.a, 0, v.b, v.neither]) };
  },
  (r) => {
    const exclusive = r(0, 1) === 1, answer = exclusive ? "A only and B only" : "A only, both and B only";
    return { prompt: `Which regions of a Venn diagram make up “A or B”${exclusive ? " in the exclusive sense (but not both)" : " in the inclusive sense (or both)"}?`, answer, choices: ["A only, both and B only", "A only and B only", "Only the overlap", "Everything outside the circles"], steps: ["Inclusive or keeps the overlap; exclusive or removes it.", answer + "."] };
  },
];
const atLeastOne: Form[] = [
  (r) => {
    const n = r(2, 3);
    return { prompt: `A fair coin is tossed ${n === 2 ? "twice" : "three times"}. What is P(at least one head)?`, answer: fraction(2 ** n - 1, 2 ** n), steps: [`The complement is “no heads”: only ${"T".repeat(n)}, so P = 1/${2 ** n}.`, `1 − 1/${2 ** n} = ${fraction(2 ** n - 1, 2 ** n)}.`] };
  },
  (r) => {
    const k = r(1, 6);
    return { prompt: `Two dice are rolled. What is the probability of at least one ${k}?`, answer: "11/36", steps: [`No ${k} on either die: 5 × 5 = 25 outcomes.`, "At least one: 36 − 25 = 11, so P = 11/36."], ...grid("Two dice", "First die", "Second die", DICE, DICE, "pair") };
  },
  (r) => {
    const a = r(3, 6), b = r(3, 6);
    return { prompt: `Two fair spinners have ${a} and ${b} equal sections. Each has one red section. What is P(at least one red)?`, answer: fraction(a * b - (a - 1) * (b - 1), a * b), steps: [`No red: ${a - 1} × ${b - 1} = ${(a - 1) * (b - 1)} of the ${a * b} outcomes.`, `At least one red: ${pf(a * b - (a - 1) * (b - 1), a * b)}.`] };
  },
  (r) => {
    const [ev, answer] = pick(r, [["at least one head", "No heads"], ["at least one six", "No sixes"], ["at least one red", "No reds"]] as const);
    const wrong = { "No heads": ["Exactly one head", "At most one head", "Two heads"], "No sixes": ["Exactly one six", "At most one six", "Two sixes"], "No reds": ["Exactly one red", "At most one red", "Two reds"] }[answer];
    return { prompt: `Two trials are done. What is the complement of “${ev}”?`, answer, choices: [answer, ...wrong], steps: ["The complement contains every outcome not in the event.", `If there is not at least one, there are none: “${answer}”.`] };
  },
  (r) => {
    const a = r(3, 5), b = r(3, 5), noEven = Math.ceil(a / 2) * Math.ceil(b / 2);
    return { prompt: `Spinner A (1 to ${a}) and spinner B (1 to ${b}) are spun. What is P(at least one even number)?`, answer: fraction(a * b - noEven, a * b), steps: [`No even means both odd: ${Math.ceil(a / 2)} × ${Math.ceil(b / 2)} = ${noEven} outcomes.`, `P = 1 − ${noEven}/${a * b} = ${fraction(a * b - noEven, a * b)}.`], ...grid("Two spinners", "Spinner A", "Spinner B", range(1, a), range(1, b), "pair") };
  },
];

/* ---------- Week 8: run compound-event experiments ---------- */
const designSimulation: Form[] = [
  (r) => {
    const n = r(3, 10);
    return { prompt: `A program simulates a fair ${n}-section spinner with random whole numbers from 1 to what?`, answer: n, steps: [`Each of the ${n} sections needs one equally likely number.`, `Use 1 to ${n} and generate a fresh number for every spin.`] };
  },
  (r) => {
    const p = 10 * r(1, 9);
    return { prompt: `Random digits 0 to 9 simulate a ${p}% chance of rain. How many of the ten digits should mean “rain”?`, answer: p / 10, steps: [`Each digit is 1/10 = 10% of the outcomes.`, `${p}% ÷ 10% = ${p / 10} digits.`] };
  },
  (r) => {
    const p = r(5, 95);
    return { prompt: `Random whole numbers from 1 to 100 simulate an event with probability ${p / 100}. A trial counts as a success when the number is at most what?`, answer: p, steps: [`${p / 100} = ${p} out of 100 equally likely numbers.`, `Use 1 to ${p} for a success.`] };
  },
  (r) => {
    const CASES: [string, boolean, string][] = [
      ["A die simulates a fair coin: 1, 2 or 3 is heads; 4, 5 or 6 is tails.", true, "Heads and tails each get 3 of 6 outcomes."],
      ["A die simulates a fair coin: 1 to 4 is heads; 5 or 6 is tails.", false, "Heads gets 4 of 6 outcomes, so it is more likely."],
      ["The total of two dice is simulated with one random whole number from 2 to 12.", false, "That makes all 11 totals equally likely, but a total of 7 is far more common than 2."],
      ["Two dice are simulated with two separate random whole numbers from 1 to 6, which are then added.", true, "Each die is modelled separately, so the totals have the right chances."],
      ["Two coins are simulated with one random number from 1 to 3: 1 = two heads, 2 = one head, 3 = no heads.", false, "One head has 2 outcomes (HT, TH) out of 4, so it should be twice as likely as two heads."],
    ];
    const [text, fair, why] = pick(r, CASES);
    return yesNo(`${text} Is this a fair model?`, fair, ["A fair model gives each real outcome its correct chance.", why]);
  },
  (r) => {
    const [per, item] = pick(r, [[2, "coin tosses"], [3, "coin tosses"], [2, "dice rolls"]] as const), n = 10 * r(3, 20);
    return { prompt: `Each trial of a simulation uses ${per} ${item}. How many ${item} are needed for ${n} trials?`, answer: per * n, steps: [`${per} per trial.`, `${per} × ${n} = ${per * n}.`] };
  },
];
function coinFreq(r: R, total?: number) {
  const hh = r(5, 30), ht = r(5, 30), th = r(5, 30), tt = total ? total - hh - ht - th : r(5, 30);
  return { hh, ht, th, tt, total: hh + ht + th + tt, visual: table("Two-coin experiment", ["Outcome", "HH", "HT", "TH", "TT"], [["Frequency", hh, ht, th, tt]]) };
}
function sumFreq(r: R) {
  const sums = range(2, 12), counts = sums.map((s) => Math.max(0, (6 - Math.abs(7 - s)) * 2 + r(-2, 2)));
  return { sums, counts, total: sum(counts), visual: table("Totals of two dice", ["Total", ...sums.map(String)], [["Frequency", ...counts]]) };
}
const recordTrials: Form[] = [
  (r) => { const f = coinFreq(r); return { prompt: "How many trials were recorded?", answer: f.total, steps: ["Each trial is one toss of both coins.", `${f.hh} + ${f.ht} + ${f.th} + ${f.tt} = ${f.total}.`], visual: f.visual }; },
  (r) => { const f = coinFreq(r); return { prompt: "How many trials gave at least one head?", answer: f.hh + f.ht + f.th, steps: ["At least one head: HH, HT or TH.", `${f.hh} + ${f.ht} + ${f.th} = ${f.hh + f.ht + f.th}.`], visual: f.visual }; },
  (r) => {
    const pairs = range(1, 20).map(() => [r(1, 6), r(1, 6)]), doubles = pairs.filter(([a, b]) => a === b).length;
    return { prompt: "A simulation rolled two dice 20 times. How many results were doubles?", answer: doubles, steps: ["A double has the same number on both dice.", `${doubles} of the 20 results are doubles.`], visual: table("Simulation results", ["Trials 1–5", "Trials 6–10", "Trials 11–15", "Trials 16–20"], range(0, 4).map((i) => range(0, 3).map((j) => pairs[j * 5 + i].join(", ")))) };
  },
  (r) => { const f = sumFreq(r), k = r(9, 11), hits = sum(f.counts.slice(k - 2)); return { prompt: `How many trials had a total of at least ${k}?`, answer: hits, steps: [`At least ${k}: totals ${range(k, 12).join(", ")}.`, `${f.counts.slice(k - 2).join(" + ")} = ${hits}.`], visual: f.visual }; },
  (r) => { const f = sumFreq(r), k = r(4, 6), hits = sum(f.counts.slice(0, k - 1)); return { prompt: `How many trials had a total less than ${k + 1}?`, answer: hits, steps: [`Less than ${k + 1}: totals ${range(2, k).join(", ")}.`, `${f.counts.slice(0, k - 1).join(" + ")} = ${hits}.`], visual: f.visual }; },
];
const experimentalProbability: Form[] = [
  (r) => { const f = coinFreq(r); return { prompt: "What is the experimental probability of exactly one head?", answer: fraction(f.ht + f.th, f.total), steps: [`Exactly one head: HT + TH = ${f.ht + f.th}.`, `${pf(f.ht + f.th, f.total)}.`], visual: f.visual }; },
  (r) => { const f = coinFreq(r, 100); return { prompt: "What is the experimental probability of two heads, as a decimal?", answer: dec(f.hh / 100), steps: [`HH happened ${f.hh} times in 100 trials.`, `${f.hh} ÷ 100 = ${dec(f.hh / 100)}.`], visual: f.visual }; },
  (r) => { const f = sumFreq(r); return { prompt: "What is the experimental probability of a total of 7?", answer: fraction(f.counts[5], f.total), steps: [`Total 7 occurred ${f.counts[5]} times in ${f.total} trials.`, `${pf(f.counts[5], f.total)}.`], visual: f.visual }; },
  (r) => {
    const n1 = 10 * r(3, 8), s1 = r(5, n1 - 5), n2 = 10 * r(3, 8), s2 = r(5, n2 - 5);
    return { prompt: `Group A had ${s1} successes in ${n1} trials. Group B had ${s2} successes in ${n2} trials. What is the experimental probability using all the results?`, answer: fraction(s1 + s2, n1 + n2), steps: ["Combine successes and combine trials; do not average the two fractions.", `(${s1} + ${s2})/(${n1} + ${n2}) = ${pf(s1 + s2, n1 + n2)}.`] };
  },
  (r) => { const f = coinFreq(r), n = f.hh + f.ht + f.th; return { prompt: "What percentage of trials gave at least one head? Round to one decimal place.", answer: rounded((100 * n) / f.total, 1), unit: "%", steps: [`At least one head: ${n} of ${f.total}.`, `${n} ÷ ${f.total} × 100 ≈ ${rounded((100 * n) / f.total, 1)}%.`], visual: f.visual }; },
];

/* ---------- Week 9: compare simulation and prediction ---------- */
const predict: Form[] = [
  (r) => { const n = 4 * r(10, 60); return { prompt: `Two fair coins are tossed ${n} times. How many times would you expect two heads?`, answer: n / 4, steps: ["P(HH) = 1/4.", `Expected = ${n} × 1/4 = ${n / 4}. This is a prediction, not a guarantee.`] }; },
  (r) => {
    const s = r(4, 10), ways = diceCount((a, b) => a + b === s), n = 36 * r(2, 10);
    return { prompt: `Two dice are rolled ${n} times. How many times would you expect a total of ${s}?`, answer: (n * ways) / 36, steps: [`${ways} of the 36 outcomes give ${s}, so P = ${fraction(ways, 36)}.`, `${n} × ${ways}/36 = ${(n * ways) / 36}.`], ...grid("Totals of two dice", "First die", "Second die", DICE, DICE, "sum") };
  },
  (r) => {
    const a = r(3, 5), b = r(3, 5), s = r(4, a + b - 1), ways = range(1, a).flatMap((x) => range(1, b).filter((y) => x + y === s)).length;
    return { prompt: `Spinner A (1 to ${a}) and spinner B (1 to ${b}) are spun. What is the theoretical probability of a total of ${s}?`, answer: fraction(ways, a * b), steps: [`${ways} of the ${a * b} cells show ${s}.`, `P = ${pf(ways, a * b)}.`], ...grid("Totals", "Spinner A", "Spinner B", range(1, a), range(1, b), "sum") };
  },
  (r) => { const n = r(30, 70); return { prompt: `A fair coin gave ${n} heads in 100 tosses. What is the theoretical probability of heads on the next toss?`, answer: "1/2", steps: ["The coin is still fair, and each toss is independent.", "Past results do not change the theoretical probability: 1/2."] }; },
  (r) => { const n = 6 * r(10, 40); return { prompt: `Two dice are rolled ${n} times. How many doubles would you expect?`, answer: n / 6, steps: ["6 of the 36 outcomes are doubles, so P = 1/6.", `${n} × 1/6 = ${n / 6}.`] }; },
];
const smallLarge: Form[] = [
  (r) => {
    const small = r(2, 8), large = r(42, 58), ds = Math.abs(small / 10 - 0.5), dl = Math.abs(large / 100 - 0.5);
    return { prompt: "The theoretical probability is 0.5. Which batch has an experimental probability closer to 0.5? Enter A, B or Equal.", answer: ds < dl ? "A" : ds > dl ? "B" : "Equal", steps: [`Batch A: ${small}/10 = ${small / 10}. Batch B: ${large}/100 = ${large / 100}.`, "Compare each distance from 0.5."], visual: table("Observed batches", ["Batch", "Successes", "Trials"], [["A", small, 10], ["B", large, 100]]) };
  },
  (r) => { const n = 4 * r(10, 30), k = n / 4 + r(-8, 8); return { prompt: `Two coins were tossed ${n} times and two heads came up ${k} times. By how many does this differ from the expected count?`, answer: Math.abs(k - n / 4), steps: [`Expected: ${n} × 1/4 = ${n / 4}.`, `Difference: |${k} − ${n / 4}| = ${Math.abs(k - n / 4)}.`] }; },
  (r) => {
    const CASES: [string, boolean, string][] = [
      ["With more trials, the experimental probability usually gets closer to the theoretical probability.", true, "Random variation evens out over many trials."],
      ["After five heads in a row, tails is more likely on the next toss of a fair coin.", false, "Each toss is independent; P(tails) is still 1/2."],
      ["Ten trials are enough to be sure a die is fair.", false, "Small samples vary a lot, so ten trials cannot show this."],
      ["Two groups using the same fair coin can get different results.", true, "Results vary by chance, even with the same coin."],
    ];
    const [text, yes, why] = pick(r, CASES);
    return yesNo(`Is this statement true? “${text}”`, yes, ["Think about random variation and the number of trials.", why]);
  },
  (r) => {
    // Spread shrinks with run size, as real results do; regenerate until one run is clearly closest.
    const runs = [10, 50, 200, 1000];
    let est: number[] = [], dist: number[] = [];
    for (let tries = 0; tries < 30; tries++) {
      est = runs.map((n) => Math.max(0, Math.round(n / 4 + (r(-10, 10) / 10) * Math.sqrt(n) * 0.6)));
      dist = est.map((k, i) => Math.abs(k / runs[i] - 0.25));
      if (dist.filter((d) => d === Math.min(...dist)).length === 1) break;
      est[3] = 250;
    }
    dist = est.map((k, i) => Math.abs(k / runs[i] - 0.25));
    const win = dist.indexOf(Math.min(...dist));
    return { prompt: "Two coins were tossed in runs of different sizes. Which number of trials gave an experimental P(two heads) closest to the theoretical 1/4? Enter the number of trials.", answer: runs[win], steps: ["Divide the two-heads count by the trials for each run.", `${runs.map((n, i) => `${est[i]}/${n} = ${rounded(est[i] / n, 3)}`).join("; ")}. Closest to 0.25: ${runs[win]} trials.`], visual: table("Runs of a two-coin experiment", ["Trials", ...runs.map(String)], [["Two heads", ...est]]) };
  },
  (r) => {
    const n = 10 * r(2, 4), m = 100 * r(4, 9), answer = `Group B, because it used ${m} trials`;
    return { prompt: `Group A ran ${n} trials of a simulation and Group B ran ${m}. Whose experimental probability is likely to be more reliable?`, answer, choices: [answer, "Group A, because smaller samples are more accurate", "They are equally reliable", "Group A, because it finished first"], steps: ["More trials reduce the effect of random variation.", answer + "."] };
  },
];
const explainVariation: Form[] = [
  (r) => {
    const big = r(0, 1) === 1, n = big ? 1000 : 20, k = big ? r(380, 420) : r(6, 8);
    const answer = big ? "The simulation model is probably wrong" : "Random variation in a small number of trials";
    return { prompt: `A simulation of two fair coins gives two heads in ${k} of ${n} trials (theory says 1/4). What is the most likely explanation?`, answer, choices: ["The simulation model is probably wrong", "Random variation in a small number of trials", "Theoretical probabilities are always wrong", "The coins remembered earlier results"], steps: [`${k}/${n} ≈ ${rounded(k / n, 2)}, compared with 0.25.`, big ? "With 1000 trials this gap is too big for chance, so check the model." : "With only 20 trials, a gap this size is normal random variation."] };
  },
  (r) => {
    const n = 600, k = r(85, 99);
    return { prompt: `A die is rolled ${n} times and a 6 appears ${k} times. How many fewer 6s is that than the expected number?`, answer: 100 - k, steps: [`Expected: ${n} × 1/6 = 100.`, `100 − ${k} = ${100 - k}. A small gap like this is normal variation.`] };
  },
  (r) => {
    const CASES: [string, boolean, string][] = [
      ["Getting 6 heads in 10 tosses proves the coin is biased.", false, "6 heads in 10 tosses happens often with a fair coin."],
      ["A 6 has come up three times in a row, so the next roll is less likely to be a 6.", false, "The die has no memory; P(6) stays 1/6."],
      ["Choosing a random whole number from 2 to 12 is a good model for the total of two dice.", false, "It makes every total equally likely, which is wrong."],
      ["If a simulation is far from the theory after thousands of trials, the model should be checked.", true, "Large runs should be close; a big gap suggests a faulty model."],
    ];
    const [text, yes, why] = pick(r, CASES);
    return yesNo(`Is this statement true? “${text}”`, yes, ["Compare the size of the gap with the number of trials.", why]);
  },
  () => {
    const answer = "Run many more trials";
    return { prompt: "Which change would make a simulation's estimate more reliable?", answer, choices: [answer, "Stop when the result looks right", "Keep only the first 10 trials", "Change the rule after each trial"], steps: ["More trials reduce random variation.", "Keep the model the same and increase the number of trials."] };
  },
  (r) => {
    const n = 4 * r(25, 100);
    return { prompt: `A fair two-coin simulation is run ${n} times. About how many trials should give exactly one head?`, answer: n / 2, steps: ["Exactly one head is HT or TH: 2 of 4 outcomes, so P = 1/2.", `${n} × 1/2 = ${n / 2}. The actual count will vary a little.`] };
  },
];

/* ---------- Week 10: apply and review ---------- */
const chooseRepresentation: Form = (r) => {
  const CASES: [string, string][] = [
    ["Two dice are rolled and the total is recorded.", "Outcome grid (array)"],
    ["A coin is tossed three times in a row.", "Tree diagram"],
    ["Students are asked if they play netball, soccer, both or neither.", "Venn diagram"],
    ["Survey counts are sorted by year level and by whether students catch the bus.", "Two-way table"],
    ["A spinner is spun, then a coin is tossed, then a card is drawn.", "Tree diagram"],
    ["Two spinners numbered 1 to 5 are spun and the numbers multiplied.", "Outcome grid (array)"],
    ["People are asked whether they own a cat and whether they own a dog, and the overlap matters.", "Venn diagram"],
  ];
  const [text, answer] = pick(r, CASES);
  return { prompt: `${text} Which representation shows the outcomes most clearly?`, answer, choices: ["Outcome grid (array)", "Tree diagram", "Venn diagram", "Two-way table"], steps: ["Grids suit two events with many outcomes; trees suit stages; Venn diagrams show overlap; two-way tables show counts for two categories.", `${answer}.`] };
};

const W: Form[][] = [
  identifyNotEvent, complementFraction, complementDecimal,
  missingProbability, unequalOutcomes, chooseComplement,
  orderedPairs, listAll, countCondition,
  completeTable, readTable, tableProbability,
  buildTree, readTree, treeProbability,
  placeVenn, vennCounts, vennProbability,
  andOr, mutuallyExclusive, atLeastOne,
  designSimulation, recordTrials, experimentalProbability,
  predict, smallLarge, explainVariation,
];
/** Week 10 reviews earlier lessons; Lesson 1 also asks students to choose a representation. */
const review = (range: Form[][], extra: Form[] = []): LessonFactory => (seed) => {
  const r = random(seed ^ 0x51ed2701);
  if (extra.length && r(0, 2) === 0) return forms(seed, extra);
  return forms(seed, range[r(0, range.length - 1)]);
};
export const chanceLessons: LessonFactory[] = [
  ...W.map((l): LessonFactory => (seed) => forms(seed, l)),
  review(W.slice(0, 6), [chooseRepresentation]),
  review(W.slice(6, 21)),
  review(W.slice(21, 27)),
];
