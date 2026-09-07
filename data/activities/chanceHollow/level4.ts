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

function generated(makers: readonly (() => ChanceCase)[]): Gen {
  let lastPrompt = "";
  let seed = 0;
  return () => {
    let c = choice(makers)();
    for (let guard = 0; c.prompt === lastPrompt && guard < 5; guard += 1) c = choice(makers)();
    lastPrompt = c.prompt;
    seed += 1;
    return task(c, seed);
  };
}

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
]);

function countOutcomesMaker(): ChanceCase {
  const tool = choice(["coin", "die", "spinner", "bag"] as const);
  if (tool === "coin") {
    return {
      prompt: "How many possible outcomes are there for one fair coin toss?",
      answer: "2",
      options: ["2", "1", "4", "6"],
      correct: "Yes. The outcomes are heads and tails.",
      wrong: "A coin has two possible outcomes: heads or tails.",
      visual: { type: "coin", face: "tails" },
    };
  }
  if (tool === "die") {
    return {
      prompt: "How many possible outcomes are there for one roll of a normal die?",
      answer: "6",
      options: ["6", "2", "4", "8"],
      correct: "Yes. The outcomes are 1, 2, 3, 4, 5 and 6.",
      wrong: "A normal die has six numbered faces.",
      visual: { type: "die", face: randInt(1, 6) },
    };
  }
  if (tool === "spinner") {
    return {
      prompt: "This spinner has red, blue, green and yellow. How many colour outcomes are possible?",
      answer: "4",
      options: ["4", "2", "3", "6"],
      correct: "Correct. Four colours can happen.",
      wrong: "List the colours: red, blue, green and yellow.",
      visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] },
    };
  }
  return {
    prompt: "This bag has red, blue and purple counters. How many colour outcomes are possible?",
    answer: "3",
    options: ["3", "2", "5", "6"],
    correct: "Yes. Red, blue and purple are the possible colour outcomes.",
    wrong: "Count the different colours, not every counter.",
    visual: { type: "bag", counters: [RED, BLUE, PURPLE, RED, BLUE] },
  };
}

function fractionChanceMaker(): ChanceCase {
  const total = choice([4, 6, 8] as const);
  const redCount = total === 4 ? choice([1, 2] as const) : choice([1, 2, 3] as const);
  const wedges = shuffle([...Array(redCount).fill(RED), ...Array(total - redCount).fill(BLUE)] as string[]);
  const answer = `${redCount}/${total}`;
  return {
    prompt: "What fraction of this spinner is red?",
    answer,
    options: shuffle([answer, `${total - redCount}/${total}`, `1/${total}`, `${redCount}/${redCount + 1}`]).slice(0, 4),
    correct: `Yes. ${redCount} out of ${total} equal parts are red.`,
    wrong: `Count red parts first, then total parts: ${redCount} out of ${total}.`,
    visual: { type: "spinner", wedges },
  };
}

function compareFractionMaker(): ChanceCase {
  const examples = [
    { eventA: "1/4", eventB: "3/6", answer: "3/6" },
    { eventA: "2/6", eventB: "1/4", answer: "2/6" },
    { eventA: "3/8", eventB: "1/2", answer: "1/2" },
    { eventA: "5/8", eventB: "2/4", answer: "5/8" },
  ] as const;
  const { eventA, eventB, answer } = choice(examples);
  return {
    prompt: `Which chance is greater: ${eventA} or ${eventB}?`,
    answer,
    options: [eventA, eventB, "They are equal", "Neither can happen"],
    correct: "Correct. Compare each fraction to see which takes more of the whole.",
    wrong: "Use the size of the fraction, not just the top number.",
    visual: { type: "scale" },
  };
}

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
]);

function compareChanceMaker(): ChanceCase {
  const redA = choice([1, 2, 3] as const);
  const redB = choice([4, 5] as const);
  return {
    prompt: `Which spinner gives a better chance of red: Spinner A has ${redA}/6 red, Spinner B has ${redB}/6 red?`,
    answer: "Spinner B",
    options: ["Spinner B", "Spinner A", "They are the same", "Red is impossible"],
    correct: "Yes. Spinner B has more red parts out of the same total.",
    wrong: "Both totals are 6, so compare the red parts.",
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
]);

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
    options: shuffle(colours.map((c) => c.name).concat("yellow")).slice(0, 4),
    correct: `Yes. ${winner.name} appears on the most parts.`,
    wrong: "The best prediction is the colour with the most spinner parts.",
    visual: { type: "spinner", wedges },
  };
}

function expectedActualMaker(): ChanceCase {
  return {
    prompt: "A fair coin was tossed 20 times. Expected heads is about 10, but heads came up 12. What does this show?",
    answer: "Actual results can be close but not exact",
    options: ["Actual results can be close but not exact", "The coin is unfair for sure", "Heads is certain", "Tails is impossible"],
    correct: "Yes. Chance results often vary around the expected result.",
    wrong: "Expected is what should happen about often; actual results can vary.",
    visual: { type: "coin", face: "heads" },
  };
}

const lessonGens: Record<string, Gen> = {
  "1-1": fairCases,
  "1-2": equalChanceCases,
  "1-3": explainEqualCases,
  "2-1": generated([countOutcomesMaker]),
  "2-2": generated([countOutcomesMaker]),
  "2-3": pool([
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
  ]),
  "3-1": generated([fractionChanceMaker]),
  "3-2": generated([fractionChanceMaker]),
  "3-3": generated([compareFractionMaker]),
  "4-1": fairGameCases,
  "4-2": fixGameCases,
  "4-3": pool([
    {
      prompt: "Which game design is fair?",
      answer: "A wins on red, B wins on blue, with 2 red and 2 blue parts",
      options: ["A wins on red, B wins on blue, with 2 red and 2 blue parts", "A wins on 1, B wins on 2 to 6", "A wins on 3 red parts, B wins on 1 blue part", "A wins on heads, B wins on heads"],
      correct: "Correct. Each player has the same chance to win.",
      wrong: "A fair design gives each player equal winning outcomes.",
      visual: { type: "spinner", wedges: [RED, BLUE, RED, BLUE] },
    },
  ]),
  "5-1": generated([compareChanceMaker]),
  "5-2": sameChanceCases,
  "5-3": generated([bestPredictionMaker]),
  "6-1": generated([bestPredictionMaker, fractionChanceMaker]),
  "6-2": () => ({
    kind: "chanceAutoTally",
    prompt: "Run the chance tool and compare what happened with the best prediction.",
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
