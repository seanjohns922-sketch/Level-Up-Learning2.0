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

// Curated bank: walks its cases without repeating (each shown once before any
// repeat, never twice in a row).
function pool(cases: readonly ChanceCase[]): Gen {
  let bag: number[] = [];
  let last = -1;
  let seed = 0;
  return () => {
    if (bag.length === 0) {
      bag = shuffle(cases.map((_, index) => index));
      if (cases.length > 1 && bag[bag.length - 1] === last) {
        [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1]!, bag[0]!];
      }
    }
    const index = bag.pop()!;
    last = index;
    seed += 1;
    return task(cases[index]!, seed);
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
const fairCases = pool([
  {
    prompt: "This spinner has 2 red parts and 2 blue parts. Is red just as likely as blue?",
    answer: "Yes, they are equally likely",
    options: ["Yes, they are equally likely", "No, red is more likely", "No, blue is more likely", "No, red is impossible"],
    correct: "Yes. Red and blue each have 2 parts, so they have the same chance.",
    wrong: "Count the parts. Red has 2 and blue has 2, so they are equally likely.",
    visual: { type: "spinner", wedges: [RED, BLUE, RED, BLUE] },
  },
  {
    prompt: "A bag has 3 yellow counters and 1 green counter. Is the draw fair between yellow and green?",
    answer: "No, yellow is more likely",
    options: ["No, yellow is more likely", "Yes, it is fair", "No, green is more likely", "No, yellow is impossible"],
    correct: "Correct. Yellow has more counters, so yellow is more likely.",
    wrong: "A fair draw needs equal counts. Yellow has 3 and green has 1.",
    visual: { type: "bag", counters: [YELLOW, YELLOW, YELLOW, GREEN] },
  },
  {
    prompt: "A coin can land heads or tails. Are heads and tails equally likely?",
    answer: "Yes, each side has the same chance",
    options: ["Yes, each side has the same chance", "No, heads is certain", "No, tails is impossible", "No, heads is more likely"],
    correct: "Yes. A fair coin has two sides with the same chance.",
    wrong: "A fair coin has heads and tails. Neither side has more chance before the toss.",
    visual: { type: "coin", face: "heads" },
  },
  {
    prompt: "This spinner has 3 green parts and 1 yellow part. Is green just as likely as yellow?",
    answer: "No, green is more likely",
    options: ["No, green is more likely", "Yes, they are equally likely", "No, yellow is more likely", "No, green is impossible"],
    correct: "Correct. Green has 3 parts and yellow has 1, so green is more likely.",
    wrong: "Equal chance needs equal parts. Green has 3 and yellow has 1.",
    visual: { type: "spinner", wedges: [GREEN, GREEN, GREEN, YELLOW] },
  },
]);

const equalChanceCases = pool([
  {
    prompt: "Which pair of outcomes is equally likely on a normal die?",
    answer: "Rolling a 2 and rolling a 5",
    options: ["Rolling a 2 and rolling a 5", "Rolling an even number and rolling a 6", "Rolling less than 5 and rolling a 1", "Rolling a 7 and rolling a 3"],
    correct: "Right. Each single face on a normal die has 1 chance out of 6.",
    wrong: "Single die faces are equally likely. A 2 and a 5 each have one face.",
    visual: { type: "die", face: 5 },
  },
  {
    prompt: "Which spinner makes red and blue equally likely?",
    answer: "2 red parts and 2 blue parts",
    options: ["2 red parts and 2 blue parts", "3 red parts and 1 blue part", "1 red part and 3 blue parts", "4 red parts and 0 blue parts"],
    correct: "Yes. Equal parts means equal chance.",
    wrong: "Red and blue need the same number of parts to be equally likely.",
    visual: { type: "spinner", wedges: [RED, BLUE, RED, BLUE] },
  },
  {
    prompt: "A bag has 4 red counters and 4 blue counters. Which statement is true?",
    answer: "Red and blue are equally likely",
    options: ["Red and blue are equally likely", "Red is more likely", "Blue is more likely", "Blue is impossible"],
    correct: "Correct. Both colours have 4 counters.",
    wrong: "Count the counters. Red and blue have the same count.",
    visual: { type: "bag", counters: [RED, RED, RED, RED, BLUE, BLUE, BLUE, BLUE] },
  },
  {
    prompt: "A bag has 2 red, 2 blue and 2 green counters. Which is true?",
    answer: "All three colours are equally likely",
    options: ["All three colours are equally likely", "Red is most likely", "Green is impossible", "Blue is certain"],
    correct: "Right. Each colour has 2 counters, so they share the chance evenly.",
    wrong: "Equal counts means equal chance — every colour has 2 counters.",
    visual: { type: "bag", counters: [RED, RED, BLUE, BLUE, GREEN, GREEN] },
  },
]);

const explainEqualCases = pool([
  {
    prompt: "Why is rolling a 1 just as likely as rolling a 6?",
    answer: "Each number is on one face",
    options: ["Each number is on one face", "Six is the biggest number", "One comes first", "The die likes both numbers"],
    correct: "Yes. Each number appears on one face of the die.",
    wrong: "Use the die faces as evidence. Each number appears once.",
    visual: { type: "die", face: 6 },
  },
  {
    prompt: "Why is this red-blue spinner fair?",
    answer: "It has the same number of red and blue parts",
    options: ["It has the same number of red and blue parts", "Red is brighter", "Blue is darker", "The spinner has four parts"],
    correct: "Right. Equal colour counts make the two outcomes equally likely.",
    wrong: "Fairness comes from equal chances, not the colour brightness.",
    visual: { type: "spinner", wedges: [RED, BLUE, RED, BLUE] },
  },
  {
    prompt: "Why are heads and tails equally likely on a fair coin?",
    answer: "The coin has one head side and one tail side",
    options: ["The coin has one head side and one tail side", "The coin is shiny", "Heads is heavier", "Tails always comes first"],
    correct: "Yes. Two equal sides means an equal chance either way.",
    wrong: "A fair coin has two matching sides, so neither is more likely.",
    visual: { type: "coin", face: "tails" },
  },
  {
    prompt: "A bag has 3 red and 3 blue counters. Why are the colours equally likely?",
    answer: "There is the same number of each colour",
    options: ["There is the same number of each colour", "Red is a warm colour", "The bag is small", "Blue counters are lighter"],
    correct: "Right. Equal counts of each colour give an equal chance.",
    wrong: "The reason is the counts: 3 red and 3 blue is the same number of each.",
    visual: { type: "bag", counters: [RED, RED, RED, BLUE, BLUE, BLUE] },
  },
]);

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

const matchToolCases = pool([
  {
    prompt: "Which tool best matches a 1 out of 6 chance?",
    answer: "A normal die, rolling one chosen number",
    options: ["A normal die, rolling one chosen number", "A fair coin, choosing heads", "A spinner with 1 red and 1 blue", "A bag with 3 red and 3 blue"],
    correct: "Correct. One chosen die face is 1 out of 6.",
    wrong: "Look for the tool with six equally likely outcomes.",
    visual: { type: "die", face: 1 },
  },
  {
    prompt: "Which tool best matches a 1 out of 2 chance?",
    answer: "A fair coin",
    options: ["A fair coin", "A normal die", "A five-colour spinner", "A bag with only red counters"],
    correct: "Yes. A fair coin has two equally likely outcomes.",
    wrong: "A 1 out of 2 chance means one winning outcome from two equal outcomes.",
    visual: { type: "coin", face: "tails" },
  },
  {
    prompt: "Which tool best matches a 1 out of 4 chance?",
    answer: "A spinner with 4 equal parts, choosing one",
    options: ["A spinner with 4 equal parts, choosing one", "A fair coin", "A normal die, choosing one number", "A bag with 2 red and 2 blue"],
    correct: "Yes. One part of four equal parts is 1 out of 4.",
    wrong: "A 1 out of 4 chance needs four equally likely outcomes.",
    visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] },
  },
  {
    prompt: "Which tool best matches a 1 out of 3 chance?",
    answer: "A spinner with 3 equal parts, choosing one",
    options: ["A spinner with 3 equal parts, choosing one", "A fair coin", "A normal die", "A bag with 5 counters"],
    correct: "Yes. One part of three equal parts is 1 out of 3.",
    wrong: "A 1 out of 3 chance needs three equally likely outcomes.",
    visual: { type: "spinner", wedges: [RED, BLUE, GREEN] },
  },
]);

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
const fairGameCases = pool([
  {
    prompt: "Game rule: you win on heads, I win on tails. Is the game fair?",
    answer: "Yes, both players have one outcome",
    options: ["Yes, both players have one outcome", "No, heads always wins", "No, tails is impossible", "No, one player has more outcomes"],
    correct: "Yes. Heads and tails are equally likely on a fair coin.",
    wrong: "Each player has one equally likely coin outcome.",
    visual: { type: "coin", face: "heads" },
  },
  {
    prompt: "Game rule: you win on 1 or 2, I win on 3, 4, 5 or 6. Is the game fair?",
    answer: "No, one player has more winning outcomes",
    options: ["No, one player has more winning outcomes", "Yes, both players use a die", "Yes, all dice games are fair", "No, 1 and 2 are impossible"],
    correct: "Correct. One player has 2 outcomes and the other has 4.",
    wrong: "Count the winning outcomes for each player.",
    visual: { type: "die", face: 4 },
  },
  {
    prompt: "Game rule: you win on red, I win on green, on a spinner with 2 red and 2 green parts. Is it fair?",
    answer: "Yes, both colours have equal parts",
    options: ["Yes, both colours have equal parts", "No, red always wins", "No, green is impossible", "No, red has more parts"],
    correct: "Yes. Two red and two green parts give each player the same chance.",
    wrong: "Fair means equal parts — here red and green each have 2.",
    visual: { type: "spinner", wedges: [RED, GREEN, RED, GREEN] },
  },
  {
    prompt: "Game rule: you win on an even number, I win on an odd number, on a normal die. Is it fair?",
    answer: "Yes, there are three evens and three odds",
    options: ["Yes, there are three evens and three odds", "No, even numbers are bigger", "No, odds win more often", "No, 6 is impossible"],
    correct: "Yes. 2, 4, 6 are even and 1, 3, 5 are odd — three each.",
    wrong: "Count them: three even faces and three odd faces is equal.",
    visual: { type: "die", face: 4 },
  },
]);

const fixGameCases = pool([
  {
    prompt: "A die game has Player A winning on 1, 2, 3 and Player B winning on 4, 5. What fixes it best?",
    answer: "Add 6 to Player B's winning numbers",
    options: ["Add 6 to Player B's winning numbers", "Remove 1 from the die", "Let Player A also win on 6", "Use only odd numbers"],
    correct: "Yes. Then each player has 3 winning outcomes.",
    wrong: "A fair fix gives each player the same number of outcomes.",
    visual: { type: "die", face: 6 },
  },
  {
    prompt: "A spinner game has 3 red parts for A and 1 blue part for B. What makes it fair?",
    answer: "Use 2 red parts and 2 blue parts",
    options: ["Use 2 red parts and 2 blue parts", "Use 4 red parts", "Use 3 red parts and 2 blue parts", "Make blue smaller"],
    correct: "Correct. Equal parts give equal chance.",
    wrong: "To make it fair, both colours need the same number of equal parts.",
    visual: { type: "spinner", wedges: [RED, RED, RED, BLUE] },
  },
  {
    prompt: "A coin game gives Player A both heads and tails, and Player B nothing. What fixes it?",
    answer: "Give Player B tails",
    options: ["Give Player B tails", "Add a second coin", "Remove tails", "Toss the coin twice"],
    correct: "Yes. Then A wins on heads and B wins on tails — one outcome each.",
    wrong: "A fair fix gives each player one of the two coin outcomes.",
    visual: { type: "coin", face: "heads" },
  },
  {
    prompt: "A bag game has Player A winning on 4 red and Player B winning on 1 blue. What makes it fair?",
    answer: "Use 2 red and 2 blue counters",
    options: ["Use 2 red and 2 blue counters", "Add more red counters", "Use 3 red and 1 blue", "Remove the blue counter"],
    correct: "Correct. Equal counts give each player the same chance.",
    wrong: "To be fair, both colours need the same number of counters.",
    visual: { type: "bag", counters: [RED, RED, RED, RED, BLUE] },
  },
]);

// ─────────────────────────── Week 5: Compare Chances ────────────────────────
// L1 "More Chance or Less Chance?" — winner side varies (not always B).
function compareChanceMaker(): ChanceCase {
  const total = 6;
  const a = randInt(1, 4);
  let b = randInt(1, 4);
  while (a === b) b = randInt(1, 4);
  const answer = a > b ? "Spinner A" : "Spinner B";
  return {
    prompt: `Which spinner gives a better chance of red: Spinner A has ${a}/${total} red, Spinner B has ${b}/${total} red?`,
    answer,
    options: ["Spinner A", "Spinner B", "They are the same", "Red is impossible"],
    correct: `Yes. ${answer} has more red parts out of the same total of ${total}.`,
    wrong: `Both totals are ${total}, so the one with more red parts wins.`,
    visual: { type: "scale" },
  };
}

const sameChanceCases = pool([
  {
    prompt: "Which two chances are the same?",
    answer: "2 out of 4 and 3 out of 6",
    options: ["2 out of 4 and 3 out of 6", "1 out of 4 and 3 out of 6", "1 out of 6 and 2 out of 4", "3 out of 4 and 1 out of 6"],
    correct: "Right. Both are one half of the outcomes.",
    wrong: "Look for two chances that cover the same part of the whole.",
    visual: { type: "scale" },
  },
  {
    prompt: "A coin lands heads and a red-blue fair spinner lands red. How do the chances compare?",
    answer: "They are the same chance",
    options: ["They are the same chance", "Heads is certain", "Red is impossible", "The spinner has more chance"],
    correct: "Yes. Each event has 1 out of 2 chance.",
    wrong: "A fair coin and a two-colour fair spinner both have one winning outcome out of two.",
    visual: { type: "spinner", wedges: [RED, BLUE] },
  },
  {
    prompt: "Which two chances are the same?",
    answer: "1 out of 2 and 3 out of 6",
    options: ["1 out of 2 and 3 out of 6", "1 out of 3 and 2 out of 6", "2 out of 4 and 1 out of 6", "3 out of 4 and 2 out of 6"],
    correct: "Right. 1 out of 2 and 3 out of 6 are both one half.",
    wrong: "Find two chances that each cover half of the whole.",
    visual: { type: "scale" },
  },
  {
    prompt: "Rolling an even number on a die, and a fair coin landing heads. How do the chances compare?",
    answer: "They are the same chance",
    options: ["They are the same chance", "The die has more chance", "Heads is certain", "Even numbers are impossible"],
    correct: "Yes. Even numbers are 3 out of 6, which is one half — the same as heads.",
    wrong: "Even numbers are 3 of 6 (one half), the same as a coin's one out of two.",
    visual: { type: "die", face: 4 },
  },
]);

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

// L4 W4-3 "Design a Fair Game" — interactive: build a spinner with equal parts.
function makeBuildFairTask(): PracticeTask {
  const pair = choice([
    [{ key: RED, name: "Red" }, { key: BLUE, name: "Blue" }],
    [{ key: GREEN, name: "Green" }, { key: YELLOW, name: "Yellow" }],
    [{ key: RED, name: "Red" }, { key: GREEN, name: "Green" }],
  ] as const);
  return {
    kind: "chanceBuildFair",
    prompt: "Design a fair game: give both colours the same number of parts so each player has an equal chance.",
    colours: pair.map((c) => ({ key: c.key, name: c.name, colour: c.key })),
    maxParts: 6,
  };
}

const lessonGens: Record<string, Gen> = {
  "1-1": fairCases,
  "1-2": equalChanceCases,
  "1-3": explainEqualCases,
  "2-1": generated([readToolMaker]),
  "2-2": generated([countOutcomesMaker]),
  "2-3": matchToolCases,
  "3-1": generated([oneOutOfMaker]),
  "3-2": generated([fractionChanceMaker]),
  "3-3": generated([compareFractionMaker]),
  "4-1": fairGameCases,
  "4-2": fixGameCases,
  "4-3": makeBuildFairTask,
  "5-1": generated([compareChanceMaker]),
  "5-2": sameChanceCases,
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
