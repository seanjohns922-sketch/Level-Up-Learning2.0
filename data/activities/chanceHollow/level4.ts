import type { ChanceVisual, PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

type Gen = () => PracticeTask;

type ChanceCase = {
  prompt: string;
  answer: string;
  options: readonly string[];
  correct: string;
  wrong: string;
  visual?: ChanceVisual;
};

const RED = "#e5484d";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const YELLOW = "#eab308";
const PURPLE = "#8b5cf6";

const choice = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Paint = { k: string; n: string };
const PAL: readonly Paint[] = [
  { k: RED, n: "red" },
  { k: BLUE, n: "blue" },
  { k: GREEN, n: "green" },
  { k: YELLOW, n: "yellow" },
  { k: PURPLE, n: "purple" },
];
const plural = (n: number) => (n === 1 ? "" : "s");

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function rotate<T>(items: readonly T[], amount: number) {
  const offset = ((amount % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

// Pick up to `count` distinct distractors (not equal to answer or each other).
function distinctOptions(answer: string, candidates: readonly string[], count = 3): string[] {
  const picked: string[] = [];
  for (const c of shuffle(candidates)) {
    if (c !== answer && !picked.includes(c) && picked.length < count) picked.push(c);
  }
  return shuffle([answer, ...picked]);
}

function task(c: ChanceCase, seed: number): PracticeTask {
  return {
    kind: "mcq",
    prompt: c.prompt,
    options: rotate([...c.options], seed),
    answer: c.answer,
    feedback: { correct: c.correct, wrong: c.wrong },
    ...(c.visual ? { visual: c.visual } : {}),
  };
}

// Parametric: builds a freshly randomised case each call.
function generated(makers: readonly (() => ChanceCase)[]): Gen {
  let lastPrompt = "";
  let seed = 0;
  return () => {
    let c = choice(makers)();
    for (let guard = 0; c.prompt === lastPrompt && guard < 8; guard += 1) c = choice(makers)();
    lastPrompt = c.prompt;
    seed += 1;
    return task(c, seed);
  };
}

// ───────────────────────── Week 1: Equally Likely Outcomes ───────────────────
// L1 "Fair or Not Fair?" — two colours with random counts (sometimes equal).
function fairMaker(): ChanceCase {
  if (Math.random() < 0.25) {
    return { prompt: "A coin can land heads or tails. Are heads and tails equally likely?", answer: "Yes, each side has the same chance", options: ["Yes, each side has the same chance", "No, heads is more likely", "No, tails is impossible", "No, heads is certain"], correct: "Yes. A fair coin has two sides with the same chance.", wrong: "A fair coin has heads and tails; neither side has more chance.", visual: { type: "coin", face: "heads" } };
  }
  const isSpinner = Math.random() < 0.5;
  const [c1, c2] = shuffle(PAL).slice(0, 2) as [Paint, Paint];
  const a = randInt(1, 4);
  const b = Math.random() < 0.4 ? a : (() => { let x = randInt(1, 4); while (x === a) x = randInt(1, 4); return x; })();
  const items = shuffle([...Array(a).fill(c1.k), ...Array(b).fill(c2.k)] as string[]);
  const equal = a === b;
  const bigger = a > b ? c1 : c2;
  const answer = equal ? "Yes, they are equally likely" : `No, ${bigger.n} is more likely`;
  const prompt = isSpinner
    ? `This spinner has ${a} ${c1.n} part${plural(a)} and ${b} ${c2.n} part${plural(b)}. Is ${c1.n} just as likely as ${c2.n}?`
    : `A bag has ${a} ${c1.n} and ${b} ${c2.n} counter${plural(b)}. Is ${c1.n} just as likely as ${c2.n}?`;
  return {
    prompt,
    answer,
    options: [`Yes, they are equally likely`, `No, ${c1.n} is more likely`, `No, ${c2.n} is more likely`, `No, ${c1.n} is impossible`],
    correct: equal ? `Yes. Both have ${a}, so they are equally likely.` : `Correct. ${cap(bigger.n)} has more, so ${bigger.n} is more likely.`,
    wrong: equal ? `Equal counts (${a} and ${b}) mean an equal chance.` : `Compare the counts: ${a} vs ${b}. The bigger one is more likely.`,
    visual: isSpinner ? { type: "spinner", wedges: items } : { type: "bag", counters: items },
  };
}

// L2 "Equal Chance Outcomes" — spot the equally-likely case.
function equalChanceMaker(): ChanceCase {
  if (Math.random() < 0.4) {
    const [x, y] = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 2).sort((p, q) => p - q) as [number, number];
    const answer = `Rolling a ${x} and rolling a ${y}`;
    return {
      prompt: "Which pair of outcomes is equally likely on a normal die?",
      answer,
      options: distinctOptions(answer, ["Rolling an even number and rolling a 6", "Rolling less than 5 and rolling a 1", "Rolling a 7 and rolling a 3", "Rolling a number over 4 and rolling a 2"]),
      correct: "Right. Each single face on a normal die has 1 chance out of 6.",
      wrong: "Single die faces are equally likely — each number sits on one face.",
      visual: { type: "die", face: x },
    };
  }
  const each = randInt(2, 3);
  const cols = shuffle(PAL).slice(0, choice([2, 3] as const)) as Paint[];
  const items = shuffle(cols.flatMap((c) => Array(each).fill(c.k)) as string[]);
  const answer = cols.length === 2 ? `${cap(cols[0]!.n)} and ${cols[1]!.n} are equally likely` : "All the colours are equally likely";
  return {
    prompt: `This tool has ${each} of each colour. Which statement is true?`,
    answer,
    options: distinctOptions(answer, [`${cap(cols[0]!.n)} is most likely`, `${cap(cols[1]!.n)} is impossible`, `${cap(cols[0]!.n)} is certain`, `${cap(cols[cols.length - 1]!.n)} is least likely`]),
    correct: "Correct. Equal counts give every colour the same chance.",
    wrong: "Every colour has the same count, so they are equally likely.",
    visual: Math.random() < 0.5 ? { type: "spinner", wedges: items } : { type: "bag", counters: items },
  };
}

// L3 "Explain Equal Chance" — pick the reason it is fair.
function explainMaker(): ChanceCase {
  const kind = choice(["coin", "die", "spinner", "bag"] as const);
  if (kind === "coin") {
    return { prompt: "Why are heads and tails equally likely on a fair coin?", answer: "The coin has one head side and one tail side", options: ["The coin has one head side and one tail side", "The coin is shiny", "Heads is heavier", "Tails always comes first"], correct: "Yes. Two equal sides means an equal chance either way.", wrong: "A fair coin has two matching sides, so neither is more likely.", visual: { type: "coin", face: choice(["heads", "tails"] as const) } };
  }
  if (kind === "die") {
    const [x, y] = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 2) as [number, number];
    return { prompt: `Why is rolling a ${x} just as likely as rolling a ${y}?`, answer: "Each number is on one face", options: ["Each number is on one face", "Six is the biggest number", "Smaller numbers come first", "The die likes both numbers"], correct: "Yes. Each number appears on exactly one face.", wrong: "Use the die faces: each number appears once.", visual: { type: "die", face: x } };
  }
  const each = randInt(2, 3);
  const [c1, c2] = shuffle(PAL).slice(0, 2) as [Paint, Paint];
  const items = shuffle([...Array(each).fill(c1.k), ...Array(each).fill(c2.k)] as string[]);
  if (kind === "spinner") {
    return { prompt: `Why is this ${c1.n}-${c2.n} spinner fair?`, answer: "It has the same number of each colour part", options: ["It has the same number of each colour part", `${cap(c1.n)} is brighter`, `${cap(c2.n)} is darker`, "The spinner is round"], correct: "Right. Equal colour counts make the outcomes equally likely.", wrong: "Fairness comes from equal counts, not the colours themselves.", visual: { type: "spinner", wedges: items } };
  }
  return { prompt: `A bag has ${each} ${c1.n} and ${each} ${c2.n} counters. Why are the colours equally likely?`, answer: "There is the same number of each colour", options: ["There is the same number of each colour", `${cap(c1.n)} is a nicer colour`, "The bag is small", `${cap(c2.n)} counters are lighter`], correct: "Right. Equal counts of each colour give an equal chance.", wrong: `The reason is the counts: ${each} and ${each} is the same number of each.`, visual: { type: "bag", counters: items } };
}

// ───────────────────────────── Week 2: Chance Tools ─────────────────────────
// L1 "Read the Chance Tool" — identify what a tool can land on.
function readToolMaker(): ChanceCase {
  const tool = choice(["coin", "die", "spinner", "bag"] as const);
  if (tool === "coin") {
    return { prompt: "What can this coin land on?", answer: "Heads or tails", options: ["Heads or tails", "Any number 1 to 6", "Red or blue", "Only heads"], correct: "Yes. A coin lands heads or tails.", wrong: "A coin has two faces: heads or tails.", visual: { type: "coin", face: "heads" } };
  }
  if (tool === "die") {
    return { prompt: "What can this die land on?", answer: "Any number from 1 to 6", options: ["Any number from 1 to 6", "Heads or tails", "Any number from 1 to 10", "Red or blue"], correct: "Yes. A die shows the numbers 1 to 6.", wrong: "A normal die has faces numbered 1 to 6.", visual: { type: "die", face: randInt(1, 6) } };
  }
  if (tool === "spinner") {
    return { prompt: "What can this spinner land on?", answer: "Red, blue or yellow", options: ["Red, blue or yellow", "Heads or tails", "Any number 1 to 6", "Only red"], correct: "Yes. Those are the three colours on the spinner.", wrong: "Read the colours on the spinner: red, blue and yellow.", visual: { type: "spinner", wedges: [RED, BLUE, YELLOW] } };
  }
  return { prompt: "What can you draw from this bag?", answer: "Red, blue or purple", options: ["Red, blue or purple", "Heads or tails", "Any number 1 to 6", "Only red"], correct: "Yes. The bag holds red, blue and purple counters.", wrong: "List the colours in the bag: red, blue and purple.", visual: { type: "bag", counters: [RED, BLUE, PURPLE, RED, BLUE] } };
}

// L2 "Count the Outcomes" — how many possible outcomes.
function countOutcomesMaker(): ChanceCase {
  const tool = choice(["coin", "die", "spinner", "bag"] as const);
  if (tool === "coin") {
    return { prompt: "How many possible outcomes are there for one fair coin toss?", answer: "2", options: ["2", "1", "4", "6"], correct: "Yes. The outcomes are heads and tails.", wrong: "A coin has two possible outcomes: heads or tails.", visual: { type: "coin", face: "tails" } };
  }
  if (tool === "die") {
    return { prompt: "How many possible outcomes are there for one roll of a normal die?", answer: "6", options: ["6", "2", "4", "8"], correct: "Yes. The outcomes are 1, 2, 3, 4, 5 and 6.", wrong: "A normal die has six numbered faces.", visual: { type: "die", face: randInt(1, 6) } };
  }
  if (tool === "spinner") {
    return { prompt: "This spinner has red, blue, green and yellow. How many colour outcomes are possible?", answer: "4", options: ["4", "2", "3", "6"], correct: "Correct. Four colours can happen.", wrong: "List the colours: red, blue, green and yellow.", visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } };
  }
  return { prompt: "This bag has red, blue and purple counters. How many colour outcomes are possible?", answer: "3", options: ["3", "2", "5", "6"], correct: "Yes. Red, blue and purple are the possible colour outcomes.", wrong: "Count the different colours, not every counter.", visual: { type: "bag", counters: [RED, BLUE, PURPLE, RED, BLUE] } };
}

// (W2 L3 "Match Tool to Chance" is now the visual compareOutcomesTask below.)

// ─────────────────────── Week 3: Probability as Fractions ────────────────────
// L1 "One Out Of" — a single target part; the chance is always 1/total.
function oneOutOfMaker(): ChanceCase {
  const total = choice([3, 4, 5, 6] as const);
  const wedges = shuffle([RED, ...Array(total - 1).fill(BLUE)] as string[]);
  const answer = `1/${total}`;
  return {
    prompt: "One part of this spinner is red. What is the chance of landing on red?",
    answer,
    options: distinctOptions(answer, [`1/${total - 1}`, `${total}/${total}`, `2/${total}`, `1/${total + 1}`]),
    correct: `Yes. There is 1 red part out of ${total} equal parts, so the chance is 1/${total}.`,
    wrong: `One red part out of ${total} equal parts is 1/${total}.`,
    visual: { type: "spinner", wedges },
  };
}

// L2 "Fraction Chance" — count the red parts out of the total (no duplicate options).
function fractionChanceMaker(): ChanceCase {
  const total = choice([4, 6, 8] as const);
  const redCount = randInt(1, total - 1);
  const wedges = shuffle([...Array(redCount).fill(RED), ...Array(total - redCount).fill(BLUE)] as string[]);
  const answer = `${redCount}/${total}`;
  const candidates = [
    `${total - redCount}/${total}`,
    `${Math.min(redCount + 1, total)}/${total}`,
    `${Math.max(redCount - 1, 1)}/${total}`,
    `1/${total}`,
    `${total}/${total}`,
  ];
  return {
    prompt: "What fraction of this spinner is red?",
    answer,
    options: distinctOptions(answer, candidates),
    correct: `Yes. ${redCount} out of ${total} equal parts are red.`,
    wrong: `Count red parts first, then total parts: ${redCount} out of ${total}.`,
    visual: { type: "spinner", wedges },
  };
}

// L3 "Compare Fraction Chances" — which fraction is bigger.
function compareFractionMaker(): ChanceCase {
  const pairs: ReadonlyArray<readonly [string, string, string]> = [
    ["1/2", "1/4", "1/2"],
    ["1/3", "2/3", "2/3"],
    ["1/4", "3/4", "3/4"],
    ["2/6", "1/2", "1/2"],
    ["3/8", "1/2", "1/2"],
    ["5/8", "1/2", "5/8"],
    ["1/4", "2/6", "2/6"],
    ["3/6", "1/4", "3/6"],
  ];
  const [a, b, answer] = choice(pairs);
  return {
    prompt: `Which chance is greater: ${a} or ${b}?`,
    answer,
    options: [a, b, "They are equal", "Neither can happen"],
    correct: "Correct. Compare each fraction to see which takes more of the whole.",
    wrong: "Use the size of the fraction, not just the top number.",
    visual: { type: "scale" },
  };
}

// ───────────────────────────── Week 4: Fair Games ───────────────────────────
// L1 "Is the Game Fair?" — one maker per object (coin, die, spinner, bag), each
// varying its setup and fairness, so the lesson rotates through many games.
function fairCoinGameMaker(): ChanceCase {
  if (Math.random() < 0.5) {
    const answer = "Yes, each player wins on one side";
    return { prompt: "Coin game: Player A wins on heads, Player B wins on tails. Is it fair?", answer, options: distinctOptions(answer, ["No, one player has more winning sides", "No, heads is impossible", "No, coins are never fair", "No, tails wins more often"]), correct: "Yes. Heads and tails are equally likely, and each player has one.", wrong: "Each player wins on one of the two equal sides, so it is fair.", visual: { type: "coin", face: "heads" } };
  }
  const answer = "No, one player has more winning sides";
  return { prompt: "Coin game: Player A wins on heads or tails, Player B wins on tails only. Is it fair?", answer, options: distinctOptions(answer, ["Yes, both use the same coin", "Yes, each player wins on one side", "No, tails is impossible", "No, coins are never fair"]), correct: "Correct. Player A wins on both sides, Player B on just one.", wrong: "Count each player's winning sides — A has two, B has one.", visual: { type: "coin", face: "tails" } };
}

function fairDieGameMaker(): ChanceCase {
  const v = choice(["evenodd", "highlow", "split", "single"] as const);
  if (v === "evenodd") {
    const answer = "Yes, three even and three odd numbers";
    return { prompt: "Die game: you win on an even number, I win on an odd number. Is it fair?", answer, options: distinctOptions(answer, ["No, even numbers are bigger", "No, odds win more often", "No, 6 is impossible", "No, evens win more often"]), correct: "Yes. 2, 4, 6 are even and 1, 3, 5 are odd — three each.", wrong: "Three even and three odd faces is equal.", visual: { type: "die", face: choice([2, 4, 6] as const) } };
  }
  if (v === "highlow") {
    const answer = "Yes, three low and three high numbers";
    return { prompt: "Die game: you win on 1, 2 or 3, I win on 4, 5 or 6. Is it fair?", answer, options: distinctOptions(answer, ["No, the high numbers win more", "No, the low numbers win more", "No, 6 is impossible", "No, the numbers are not equal"]), correct: "Yes. 1-3 and 4-6 are three numbers each.", wrong: "Each player wins on three of the six numbers.", visual: { type: "die", face: choice([1, 2, 3] as const) } };
  }
  if (v === "split") {
    const k = randInt(2, 4);
    const fair = k === 3;
    const answer = fair ? "Yes, each player wins on three numbers" : `No, one player wins on ${Math.max(k, 6 - k)} numbers`;
    return { prompt: `Die game: you win on 1 to ${k}, I win on the rest. Is it fair?`, answer, options: distinctOptions(answer, ["Yes, all dice games are fair", `No, one player wins on ${Math.min(k, 6 - k)} numbers`, "No, some numbers are impossible", "No, the bigger numbers win more"]), correct: fair ? "Yes. 1-3 and 4-6 is three numbers each." : `One player wins on ${Math.max(k, 6 - k)} numbers and the other on ${Math.min(k, 6 - k)}.`, wrong: "Count how many numbers each player wins on.", visual: { type: "die", face: k } };
  }
  const target = randInt(1, 6);
  const answer = "No, one player wins on five numbers";
  return { prompt: `Die game: you win only on ${target}, I win on the other five numbers. Is it fair?`, answer, options: distinctOptions(answer, ["Yes, both use the same die", `Yes, ${target} is a lucky number`, "No, both win on three numbers", `No, ${target} is impossible`]), correct: "Correct. You win on 1 number and I win on 5 — not fair.", wrong: "One number versus five numbers is not equal.", visual: { type: "die", face: target } };
}

function fairSpinnerGameMaker(): ChanceCase {
  const [c1, c2] = shuffle(PAL).slice(0, 2) as [Paint, Paint];
  const a = randInt(1, 3);
  const b = Math.random() < 0.5 ? a : (() => { let x = randInt(1, 3); while (x === a) x = randInt(1, 3); return x; })();
  const items = shuffle([...Array(a).fill(c1.k), ...Array(b).fill(c2.k)] as string[]);
  const fair = a === b;
  const bigger = a > b ? c1 : c2;
  const answer = fair ? "Yes, both colours have equal parts" : `No, ${bigger.n} has more parts`;
  return { prompt: `Spinner game: you win on ${c1.n}, I win on ${c2.n}, with ${a} ${c1.n} and ${b} ${c2.n} part${plural(b)}. Is it fair?`, answer, options: [`Yes, both colours have equal parts`, `No, ${c1.n} has more parts`, `No, ${c2.n} has more parts`, `No, ${c2.n} is impossible`], correct: fair ? "Yes. Equal parts give each player the same chance." : `Correct. ${cap(bigger.n)} has more parts, so it is not fair.`, wrong: fair ? "Equal parts means the game is fair." : "Count the winning parts for each player.", visual: { type: "spinner", wedges: items } };
}

function fairBagGameMaker(): ChanceCase {
  const [c1, c2] = shuffle(PAL).slice(0, 2) as [Paint, Paint];
  const a = randInt(1, 4);
  const b = Math.random() < 0.5 ? a : (() => { let x = randInt(1, 4); while (x === a) x = randInt(1, 4); return x; })();
  const items = shuffle([...Array(a).fill(c1.k), ...Array(b).fill(c2.k)] as string[]);
  const fair = a === b;
  const bigger = a > b ? c1 : c2;
  const answer = fair ? "Yes, both colours have equal counts" : `No, ${bigger.n} has more counters`;
  return { prompt: `Bag game: you win on ${c1.n}, I win on ${c2.n}, from a bag of ${a} ${c1.n} and ${b} ${c2.n} counter${plural(b)}. Is it fair?`, answer, options: [`Yes, both colours have equal counts`, `No, ${c1.n} has more counters`, `No, ${c2.n} has more counters`, `No, ${c2.n} is impossible`], correct: fair ? "Yes. Equal counts give each player the same chance." : `Correct. ${cap(bigger.n)} has more counters, so it is not fair.`, wrong: fair ? "Equal counts means the game is fair." : "Count the winning counters for each player.", visual: { type: "bag", counters: items } };
}

// L2 "Fix the Game" — how to make an unfair setup fair.
function fixGameMaker(): ChanceCase {
  const kind = choice(["spinner", "bag", "die"] as const);
  if (kind === "spinner") {
    const [c1, c2] = shuffle(PAL).slice(0, 2) as [Paint, Paint];
    const big = randInt(3, 4);
    const answer = `Use ${big - 1} ${c1.n} parts and ${big - 1} ${c2.n} parts`;
    return { prompt: `A spinner game has ${big} ${c1.n} parts for A and 1 ${c2.n} part for B. What makes it fair?`, answer, options: distinctOptions(answer, [`Use ${big + 1} ${c1.n} parts`, `Use ${big} ${c1.n} parts and 2 ${c2.n} parts`, `Make the ${c2.n} part smaller`, `Add another ${c1.n} part`]), correct: "Correct. Equal parts give equal chance.", wrong: "To make it fair, both colours need the same number of equal parts.", visual: { type: "spinner", wedges: shuffle([...Array(big).fill(c1.k), c2.k] as string[]) } };
  }
  if (kind === "bag") {
    const [c1, c2] = shuffle(PAL).slice(0, 2) as [Paint, Paint];
    const big = randInt(3, 4);
    const answer = `Use ${big - 1} ${c1.n} and ${big - 1} ${c2.n} counters`;
    return { prompt: `A bag game has Player A winning on ${big} ${c1.n} and Player B winning on 1 ${c2.n}. What makes it fair?`, answer, options: distinctOptions(answer, [`Add more ${c1.n} counters`, `Use ${big} ${c1.n} and 1 ${c2.n}`, `Remove the ${c2.n} counter`, `Use only ${c1.n} counters`]), correct: "Correct. Equal counts give each player the same chance.", wrong: "To be fair, both colours need the same number of counters.", visual: { type: "bag", counters: shuffle([...Array(big).fill(c1.k), c2.k] as string[]) } };
  }
  return { prompt: "A die game has Player A winning on 1, 2, 3 and Player B winning on 4, 5. What fixes it best?", answer: "Add 6 to Player B's winning numbers", options: ["Add 6 to Player B's winning numbers", "Remove 1 from the die", "Let Player A also win on 6", "Use only odd numbers"], correct: "Yes. Then each player wins on three numbers.", wrong: "A fair fix gives each player the same number of outcomes.", visual: { type: "die", face: 6 } };
}

// ─────────────────────────── Week 5: Compare Chances ────────────────────────
// L1 "More Chance or Less Chance?" and L2 "Same Chance" are now the visual
// side-by-side compare tasks (compareChanceTask / compareSameTask) below.

// L3 "Best Prediction" — the colour with the most parts.
function bestPredictionMaker(): ChanceCase {
  const colours = [
    { name: "red", colour: RED },
    { name: "blue", colour: BLUE },
    { name: "green", colour: GREEN },
  ];
  const winner = choice(colours);
  const wedges = shuffle([winner.colour, winner.colour, winner.colour, choice(colours.filter((c) => c !== winner)).colour]);
  return {
    prompt: "Which colour is the best prediction for this spinner?",
    answer: winner.name,
    options: distinctOptions(winner.name, ["red", "blue", "green", "yellow"]),
    correct: `Yes. ${winner.name} appears on the most parts.`,
    wrong: "The best prediction is the colour with the most spinner parts.",
    visual: { type: "spinner", wedges },
  };
}

// ───────────────────── Week 6: Chance Investigation ─────────────────────────
// L1 "Predict From the Tool" — interactive: predict the most likely colour, then
// run the spinner and see if you were right.
function makePredictMostTask(): PracticeTask {
  const palette = shuffle([
    { key: RED, name: "Red" },
    { key: BLUE, name: "Blue" },
    { key: GREEN, name: "Green" },
    { key: YELLOW, name: "Yellow" },
  ]).slice(0, 3);
  const maj = palette[0]!;
  const wedges = shuffle([maj.key, maj.key, maj.key, palette[1]!.key, palette[2]!.key]);
  return {
    kind: "chanceAutoTally",
    prompt: "Predict which colour will come up most, then run the spinner to see if you were right.",
    tool: "spinner",
    draw: wedges,
    spins: 14,
    labels: palette.map((p) => ({ key: p.key, name: p.name, colour: p.key })),
    mode: "predictMost",
  };
}

// L3 "Compare Expected and Actual" — parametric (numbers vary each time).
function expectedActualMaker(): ChanceCase {
  const tosses = choice([10, 20, 20, 30] as const);
  const expected = tosses / 2;
  const actual = expected + choice([-3, -2, -1, 1, 2, 3] as const);
  return {
    prompt: `A fair coin was tossed ${tosses} times. Expected heads is about ${expected}, and heads came up ${actual}. What does this show?`,
    answer: "Actual results can be close but not exact",
    options: ["Actual results can be close but not exact", "The coin is unfair for sure", "Heads is certain", "Tails is impossible"],
    correct: "Yes. Chance results often vary around the expected result.",
    wrong: "Expected is about what should happen; actual results can vary a little.",
    visual: { type: "coin", face: "heads" },
  };
}

// L4 W4-3 "Design a Fair Game" — repair an unfair spinner, then play Chanzia.
function makeBuildFairTask(): PracticeTask {
  const pair = choice([
    [{ key: RED, name: "Red" }, { key: BLUE, name: "Blue" }],
    [{ key: GREEN, name: "Green" }, { key: YELLOW, name: "Yellow" }],
    [{ key: RED, name: "Red" }, { key: GREEN, name: "Green" }],
  ] as const);
  return {
    kind: "chanceBuildFair",
    prompt: "Fix the unfair spinner so both players have an equal chance, then challenge Chanzia to see who wins.",
    colours: pair.map((c) => ({ key: c.key, name: c.name, colour: c.key })),
    maxParts: 6,
  };
}

// ── Side-by-side compare tasks (chanceCompare) ───────────────────────────────
// Each call returns a fresh compare task; the visuals change every time even
// though the question wording stays constant, so it never truly repeats.
function randTask(makers: readonly (() => PracticeTask)[]): Gen {
  return () => choice(makers)();
}

function spinnerWedges(red: number, total: number): string[] {
  return shuffle([...Array(red).fill(RED), ...Array(total - red).fill(BLUE)] as string[]);
}

// W2 L3 "Match Tool to Chance" — which tool has more possible outcomes.
function randTool(): { visual: ChanceVisual; count: number } {
  const t = choice(["coin", "die", "spinner", "bag"] as const);
  if (t === "coin") return { visual: { type: "coin", face: "heads" }, count: 2 };
  if (t === "die") return { visual: { type: "die", face: randInt(1, 6) }, count: 6 };
  if (t === "spinner") {
    const k = randInt(3, 4);
    return { visual: { type: "spinner", wedges: shuffle(PAL).slice(0, k).map((p) => p.k) }, count: k };
  }
  const cols = shuffle(PAL).slice(0, choice([2, 3] as const));
  const counters = shuffle(cols.flatMap((c) => Array(randInt(1, 2)).fill(c.k)) as string[]);
  return { visual: { type: "bag", counters }, count: cols.length };
}
function compareOutcomesTask(): PracticeTask {
  const A = randTool();
  let B = randTool();
  for (let g = 0; A.count === B.count && g < 12; g += 1) B = randTool();
  const answer = A.count > B.count ? "Tool A" : "Tool B";
  return {
    kind: "chanceCompare",
    prompt: "Which tool has more possible outcomes?",
    tools: [{ label: "Tool A", visual: A.visual }, { label: "Tool B", visual: B.visual }],
    options: shuffle(["Tool A", "Tool B", "They have the same number", "Neither has outcomes"]),
    answer,
    feedback: { correct: `Yes. Tool ${answer === "Tool A" ? "A" : "B"} can land on more different outcomes.`, wrong: "Count how many different results each tool can land on." },
  };
}

// W5 L1 "More Chance or Less Chance?" — two spinners, which has a better chance of red.
function compareChanceTask(): PracticeTask {
  const total = choice([4, 6] as const);
  const a = randInt(1, total - 1);
  let b = randInt(1, total - 1);
  for (let g = 0; a === b && g < 12; g += 1) b = randInt(1, total - 1);
  const answer = a > b ? "Spinner A" : "Spinner B";
  return {
    kind: "chanceCompare",
    prompt: "Which spinner gives a better chance of landing on red?",
    tools: [{ label: "Spinner A", visual: { type: "spinner", wedges: spinnerWedges(a, total) } }, { label: "Spinner B", visual: { type: "spinner", wedges: spinnerWedges(b, total) } }],
    options: shuffle(["Spinner A", "Spinner B", "They are the same", "Red is impossible"]),
    answer,
    feedback: { correct: `Yes. ${answer} has more red parts, so red is more likely on it.`, wrong: "Look at how much of each spinner is red — more red means a better chance." },
  };
}

// W5 L2 "Same Chance" — two spinners that sometimes have equal chance (equivalent
// fractions like 1/2 and 2/4 that look different but are the same).
function compareSameTask(): PracticeTask {
  const same = Math.random() < 0.5;
  let redA: number, totalA: number, redB: number, totalB: number;
  if (same) {
    redA = choice([1, 2] as const); totalA = redA * 2;
    redB = choice([1, 2, 3] as const); totalB = redB * 2; // both exactly one half
  } else {
    totalA = choice([4, 6] as const); redA = randInt(1, totalA - 1);
    totalB = choice([4, 6] as const); redB = randInt(1, totalB - 1);
    for (let g = 0; redA / totalA === redB / totalB && g < 12; g += 1) redB = randInt(1, totalB - 1);
  }
  const answer = same ? "They are the same" : redA / totalA > redB / totalB ? "Spinner A" : "Spinner B";
  return {
    kind: "chanceCompare",
    prompt: "Which spinner gives a better chance of red — or are they the same?",
    tools: [{ label: "Spinner A", visual: { type: "spinner", wedges: spinnerWedges(redA, totalA) } }, { label: "Spinner B", visual: { type: "spinner", wedges: spinnerWedges(redB, totalB) } }],
    options: shuffle(["Spinner A", "Spinner B", "They are the same", "Red is impossible"]),
    answer,
    feedback: { correct: same ? "Right. Both spinners are half red, so the chance is the same even though they look different." : `Yes. ${answer} has the bigger share of red.`, wrong: "Compare the share of red on each — an equal share means the same chance." },
  };
}

const lessonGens: Record<string, Gen> = {
  "1-1": generated([fairMaker]),
  "1-2": generated([equalChanceMaker]),
  "1-3": generated([explainMaker]),
  "2-1": generated([readToolMaker]),
  "2-2": generated([countOutcomesMaker]),
  "2-3": randTask([compareOutcomesTask]),
  "3-1": generated([oneOutOfMaker]),
  "3-2": generated([fractionChanceMaker]),
  "3-3": generated([compareFractionMaker]),
  "4-1": generated([fairCoinGameMaker, fairDieGameMaker, fairSpinnerGameMaker, fairBagGameMaker]),
  "4-2": generated([fixGameMaker]),
  "4-3": makeBuildFairTask,
  "5-1": randTask([compareChanceTask]),
  "5-2": randTask([compareSameTask]),
  "5-3": generated([bestPredictionMaker]),
  "6-1": makePredictMostTask,
  "6-2": () => ({
    kind: "chanceAutoTally",
    prompt: "Run the chance tool many times, then read the tally to find which colour came up most.",
    tool: "spinner",
    draw: [RED, RED, RED, BLUE],
    spins: 12,
    labels: [
      { key: RED, name: "Red", colour: RED },
      { key: BLUE, name: "Blue", colour: BLUE },
    ],
    mode: "most",
  }),
  "6-3": generated([expectedActualMaker]),
};

export function getChanceHollowLevel4TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const match = /y4-chance-w(\d+)-l(\d+)/.exec(lessonId);
  if (!match) return null;
  const gen = lessonGens[`${Number(match[1])}-${Number(match[2])}`];
  if (!gen) return null;
  return {
    teaching: () => gen(),
    activities: [() => gen(), () => gen(), () => gen()],
  };
}
