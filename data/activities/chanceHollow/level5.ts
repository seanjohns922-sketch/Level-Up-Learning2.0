import type { ChanceVisual, PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

type Gen = () => PracticeTask;
type LessonSpec = {
  teaching: Gen;
  activities: readonly [Gen, Gen, Gen, ...Gen[]];
};

const RED = "#ef5b62";
const BLUE = "#3b82f6";
const CYAN = "#22d3ee";
const PINK = "#d946ef";
const GOLD = "#f5b942";
const GREEN = "#22c55e";
const COLOURS = [RED, BLUE, CYAN, PINK, GOLD, GREEN] as const;
const NAMES: Record<string, string> = {
  [RED]: "red", [BLUE]: "blue", [CYAN]: "cyan", [PINK]: "pink", [GOLD]: "gold", [GREEN]: "green",
};

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function shuffle<T>(items: readonly T[]): T[] {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [output[index], output[swap]] = [output[swap]!, output[index]!];
  }
  return output;
}

function options(answer: string, distractors: readonly string[]): string[] {
  const distinct = distractors.filter((value, index) => value !== answer && distractors.indexOf(value) === index).slice(0, 3);
  return shuffle([answer, ...distinct]);
}

function mcq(prompt: string, answer: string, distractors: readonly string[], correct: string, wrong: string, visual?: ChanceVisual): PracticeTask {
  return {
    kind: "mcq",
    prompt,
    answer,
    options: options(answer, distractors),
    feedback: { correct, wrong },
    ...(visual ? { visual } : {}),
  };
}

function taskFingerprint(task: PracticeTask) {
  // For mcqs, de-dup on what the child actually reads — the prompt, answer and
  // option set — ignoring the shuffled apparatus so a same-reading question with
  // a differently arranged bag/spinner still counts as a repeat.
  if (task.kind !== "mcq") return JSON.stringify(task);
  return `${task.prompt}${task.answer}${[...task.options].sort().join("")}`;
}

// Each generator remembers recent payloads and rebuilds collisions. The lesson
// engine therefore receives fresh values and arrangements instead of replaying
// authored question instances.
function fresh(build: () => PracticeTask): Gen {
  const recent: string[] = [];
  return () => {
    let task = build();
    let fingerprint = taskFingerprint(task);
    for (let guard = 0; recent.includes(fingerprint) && guard < 30; guard += 1) {
      task = build();
      fingerprint = taskFingerprint(task);
    }
    recent.push(fingerprint);
    if (recent.length > 8) recent.shift();
    return task;
  };
}

function colourPair() {
  return shuffle(COLOURS).slice(0, 2) as [string, string];
}

function spinner(target: number, total: number, targetColour = RED, otherColour = BLUE): ChanceVisual {
  return { type: "spinner", wedges: shuffle([...Array(target).fill(targetColour), ...Array(total - target).fill(otherColour)] as string[]) };
}

function frequency(labels: string[], counts: number[]): ChanceVisual {
  return { type: "frequency", labels, counts, total: counts.reduce((sum, count) => sum + count, 0) };
}

function spreadTotal(total: number, buckets: number): number[] {
  const base = Math.floor(total / buckets);
  const remainder = total % buckets;
  return shuffle([
    ...Array(remainder).fill(base + 1),
    ...Array(buckets - remainder).fill(base),
  ] as number[]);
}

// Week 1: the outcome set depends on what the investigation records. Concrete
// bag example (matches the lesson's concept intro): recording the colour gives
// fewer outcomes than recording the exact counter.
const bagLens = fresh(() => {
  const chosen = shuffle(COLOURS).slice(0, randInt(2, 3));
  const counts = chosen.map((_, i) => (i === 0 ? randInt(2, 3) : randInt(1, 3)));
  const counters = shuffle(chosen.flatMap((colour, i) => Array(counts[i]).fill(colour)) as string[]);
  const total = counters.length;
  const colourList = chosen.map((colour) => NAMES[colour]).sort().join(", ");
  if (Math.random() < 0.5) {
    return mcq("A counter is drawn from this bag and we record only its colour. What is the complete outcome set?", colourList,
      [`all ${total} counters, one by one`, "heads and tails", chosen.map((colour) => NAMES[colour]).sort().slice(0, -1).join(", ")],
      `Correct. Recording colour lists each different colour once — ${chosen.length} outcomes.`, "List each different colour once, not every counter.", { type: "bag", counters });
  }
  return mcq("A counter is drawn from this bag and we record which exact counter it is. How many outcomes are there?", `${total} outcomes, one per counter`,
    [`${chosen.length} outcomes, one per colour`, "2 outcomes", `${total + 1} outcomes`],
    `Correct. Every counter is its own outcome, so there are ${total}.`, "Each counter is a separate outcome, even when colours repeat.", { type: "bag", counters });
});

const dieLens = fresh(() => {
  const lens = pick([
    { question: "whether the roll is odd or even", answer: "odd and even", count: 2 },
    { question: "the exact number rolled", answer: "1, 2, 3, 4, 5 and 6", count: 6 },
    { question: "whether the roll is below 4 or at least 4", answer: "below 4 and at least 4", count: 2 },
  ] as const);
  return mcq(`A normal die is rolled and we record ${lens.question}. What are the possible outcomes?`, lens.answer,
    ["heads and tails", "red and black", `${lens.count + 2} identical outcomes`],
    "Yes. Those outcomes answer the investigation question.", "Do not list extra detail that the investigation is not recording.", { type: "die", face: randInt(1, 6) });
});

const spinnerLens = fresh(() => {
  const [a, b] = colourPair();
  const countA = randInt(2, 4);
  const countB = randInt(1, 3);
  const visual = { type: "spinner", wedges: shuffle([...Array(countA).fill(a), ...Array(countB).fill(b)] as string[]) } as const;
  return mcq(`This spinner is used and only the colour is recorded. What is the complete outcome set?`, `${cap(NAMES[a]!)} and ${NAMES[b]}`,
    [`${countA + countB} numbered regions`, `${cap(NAMES[a]!)} only`, "heads and tails"],
    "Right. Repeated regions change likelihood, not the list of distinct colour outcomes.", "List each different colour once.", visual);
});

const listCoinOutcomes = fresh(() => mcq("Which list contains every possible outcome for one coin toss?", "heads, tails",
  ["heads", "tails", "heads, tails, edge"], "Correct. A standard classroom coin has two recorded outcomes.", "A complete list includes both faces once.", { type: "coin", face: pick(["heads", "tails"] as const) }));

const listDieOutcomes = fresh(() => {
  const threshold = randInt(2, 5);
  const values = Array.from({ length: threshold }, (_, index) => index + 1);
  const answer = values.join(", ");
  return mcq(`Which list contains every roll of ${threshold} or less on a normal die?`, answer,
    [values.slice(0, -1).join(", "), `${answer}, ${threshold + 1}`, `${threshold}, ${threshold + 1}, 6`],
    `Yes. The possible numbers are ${answer}.`, `Start at 1 and include every die face up to ${threshold}.`, { type: "die", face: threshold });
});

const listBagOutcomes = fresh(() => {
  const chosen = shuffle(COLOURS).slice(0, randInt(3, 4));
  const counters = shuffle(chosen.flatMap((colour) => Array(randInt(1, 3)).fill(colour)) as string[]);
  const answer = chosen.map((colour) => NAMES[colour]).sort().join(", ");
  return mcq("Which list names every possible colour that could be drawn?", answer,
    [chosen.slice(0, -1).map((colour) => NAMES[colour]).sort().join(", "), "heads, tails", `${answer}, orange`],
    "Correct. Every visible colour is listed once.", "Look for every different counter colour, not every counter.", { type: "bag", counters });
});

const equalNormalDie = fresh(() => {
  const [a, b] = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 2);
  return mcq(`Are rolling ${a} and rolling ${b} equally likely on a normal die?`, "Yes, each number appears on one face",
    ["No, the larger number is more likely", "No, the first roll controls the next", "Yes, because both numbers are even"],
    "Correct. Each exact number occupies one of six equal faces.", "Compare how many equal faces show each number.", { type: "dicePair", left: a!, right: b! });
});

const equalBagCheck = fresh(() => {
  const [a, b] = colourPair();
  const countA = randInt(1, 4);
  const equal = Math.random() < 0.5;
  const countB = equal ? countA : countA === 1 ? 2 : countA + pick([-1, 1] as const);
  const answer = equal ? "Yes, the counts are equal" : "No, the counts are unequal";
  return mcq(`Are ${NAMES[a]} and ${NAMES[b]} equally likely to be drawn?`, answer,
    ["Yes, every bag is fair", `${cap(NAMES[a]!)} must be more likely`, `${cap(NAMES[b]!)} is impossible`],
    equal ? "Yes. Equal counts give equal chances." : "Correct. Unequal counts give unequal chances.",
    "Count how many counters there are of each colour.", { type: "bag", counters: shuffle([...Array(countA).fill(a), ...Array(countB).fill(b)] as string[]) });
});

const equalSpinnerCheck = fresh(() => {
  const [a, b] = colourPair();
  const total = pick([4, 6, 8] as const);
  const aCount = randInt(1, total - 1);
  const equal = aCount * 2 === total;
  const answer = equal ? "Yes, both colours cover half" : "No, the colours cover different amounts";
  return mcq(`Are ${NAMES[a]} and ${NAMES[b]} equally likely on this spinner?`, answer,
    ["Yes, all colours are always equal", `${cap(NAMES[a]!)} is impossible`, "The pointer decides before it spins"],
    equal ? "Correct. Both colours cover the same number of equal regions." : "Correct. One colour covers more equal regions.",
    "Compare the number of equal regions covered by each colour.", spinner(aCount, total, a, b));
});

// Week 2: equal and unequal chance machines.
const equalRegions = fresh(() => {
  const [a, b] = colourPair();
  const each = randInt(2, 4);
  return mcq(`Why are ${NAMES[a]} and ${NAMES[b]} equally likely?`, `Each colour has ${each} equal regions`,
    ["The colours are equally bright", "The pointer takes turns", `${cap(NAMES[a]!)} was placed first`],
    "Exactly. Equal regions give equal chances.", "Chance comes from the equal region counts, not the colour names.", spinner(each, each * 2, a, b));
});

const equalCounters = fresh(() => {
  const chosen = shuffle(COLOURS).slice(0, 3);
  const each = randInt(1, 3);
  const counters = shuffle(chosen.flatMap((colour) => Array(each).fill(colour)) as string[]);
  return mcq("Which statement is supported by this bag?", "Every colour is equally likely",
    [`${cap(NAMES[chosen[0]!]!)} is most likely`, `${cap(NAMES[chosen[1]!]!)} is impossible`, "The first colour drawn is certain"],
    "Correct. Every colour has the same number of counters.", "Compare the count for each colour.", { type: "bag", counters });
});

const equalSingleFaces = fresh(() => {
  const target = randInt(1, 6);
  return mcq(`What is the chance structure for rolling ${target} on a normal die?`, "1 equally likely face out of 6",
    ["2 faces out of 6", "The number is certain", "The number is impossible"],
    "Right. Each exact number appears once on six equal faces.", "Count the faces showing the target number.", { type: "die", face: target });
});

const unequalSpinner = fresh(() => {
  const [a, b] = colourPair();
  const big = randInt(3, 5);
  const small = randInt(1, big - 1);
  return mcq(`Which colour is more likely, and why?`, `${cap(NAMES[a]!)} because it has ${big} regions`,
    [`${cap(NAMES[b]!)} because it is brighter`, "They are equally likely", `${cap(NAMES[b]!)} because it has ${small} regions`],
    "Correct. More equal regions create more winning outcomes.", "Count the equal regions for each colour.", spinner(big, big + small, a, b));
});

const repeatedFaceDie = fresh(() => {
  const repeated = randInt(1, 5);
  const single = repeated === 6 ? 5 : repeated + 1;
  return mcq(`A modified die shows ${repeated} on 2 faces and ${single} on 1 face. Which is more likely?`, `${repeated} is more likely`,
    [`${single} is more likely`, "They are equally likely", "Neither can occur"],
    `Correct. ${repeated} has twice as many winning faces.`, "Compare how many faces display each number.", { type: "dicePair", left: repeated, right: single });
});

const unequalBag = fresh(() => {
  const [a, b] = colourPair();
  const big = randInt(4, 7);
  const small = randInt(1, 3);
  return mcq(`A bag has ${big} ${NAMES[a]} and ${small} ${NAMES[b]} counters. Which draw is less likely?`, cap(NAMES[b]!),
    [cap(NAMES[a]!), "They have the same chance", "Both are impossible"],
    `Yes. Only ${small} of the counters are ${NAMES[b]}.`, "The colour with fewer counters is less likely.", { type: "bag", counters: shuffle([...Array(big).fill(a), ...Array(small).fill(b)] as string[]) });
});

const promotionBias = fresh(() => {
  const rare = pick(["dragon", "crystal", "crown", "portal"] as const);
  const common = pick(["coin", "key", "torch", "map"] as const);
  const rareCount = randInt(1, 3);
  const commonCount = randInt(6, 10);
  return mcq(`A promotion prints ${commonCount} ${common} tokens and ${rareCount} ${rare} tokens in every batch. What is the hidden advantage?`, `${cap(common)} is easier to collect`,
    [`${cap(rare)} is easier to collect`, "Both are equally likely", "Neither token can be collected"],
    "Correct. The more common token has more possible winning items.", "Compare how many copies of each token exist.", frequency([common, rare], [commonCount, rareCount]));
});

const spinnerBias = fresh(() => unequalSpinner());
const dieBias = fresh(() => repeatedFaceDie());

// Week 3: all 36 ordered pairs reveal the hidden odds in a two-dice race.
const differenceCounts = [6, 10, 8, 6, 4, 2] as const;
function sumCount(sum: number) { return sum <= 7 ? sum - 1 : 13 - sum; }

const totalDicePairs = fresh(() => mcq("How many ordered outcomes are possible when two six-sided dice are rolled?", "36",
  ["12", "6", "18"], "Correct. Each of 6 first-die results pairs with 6 second-die results.", "Use 6 × 6 to count every ordered pair.", { type: "diceGrid", mode: "sum", highlight: randInt(2, 12) }));

const countSumPairs = fresh(() => {
  const sum = randInt(3, 11);
  const count = sumCount(sum);
  return mcq(`How many ordered dice pairs have a sum of ${sum}?`, String(count),
    [String(Math.max(1, count - 1)), String(count + 1), String(count + 2)],
    `Correct. ${count} of the 36 cells have a sum of ${sum}.`, "Trace the highlighted diagonal and count every ordered pair.", { type: "diceGrid", mode: "sum", highlight: sum });
});

const countDifferencePairs = fresh(() => {
  const difference = randInt(0, 5);
  const count = differenceCounts[difference]!;
  return mcq(`How many ordered dice pairs have a difference of ${difference}?`, String(count),
    [String(Math.max(1, count - 2)), String(count + 2), String(36 - count)],
    `Yes. Difference ${difference} appears in ${count} of 36 ordered pairs.`, "Count every highlighted pair in the grid.", { type: "diceGrid", mode: "difference", highlight: difference });
});

const compareDifferences = fresh(() => {
  const [a, b] = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 2) as [number, number];
  const answer = differenceCounts[a] === differenceCounts[b]
    ? "They are equally likely"
    : differenceCounts[a] > differenceCounts[b] ? `Difference ${a}` : `Difference ${b}`;
  const highlight = answer === "They are equally likely" ? a : Number(answer.split(" ")[1]);
  return mcq(`Which result is more likely: a difference of ${a} or ${b}?`, answer,
    [`Difference ${a}`, `Difference ${b}`, "They are equally likely", "Neither difference is possible"],
    `Correct. The grid gives ${differenceCounts[a]} pairs for ${a} and ${differenceCounts[b]} pairs for ${b}.`, "Compare the number of ordered pairs that make each difference.", { type: "diceGrid", mode: "difference", highlight });
});

const mostLikelyDifference = fresh(() => {
  // Ask most OR least likely, over candidates with distinct pair-counts, so the
  // correct answer genuinely varies instead of always being "Difference 1".
  let candidates: number[];
  do { candidates = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3); }
  while (new Set(candidates.map((d) => differenceCounts[d])).size !== 3);
  const askMost = Math.random() < 0.5;
  const chosen = [...candidates].sort((a, b) => askMost ? differenceCounts[b]! - differenceCounts[a]! : differenceCounts[a]! - differenceCounts[b]!)[0]!;
  return mcq(`Among differences ${candidates.join(", ")}, which is ${askMost ? "most" : "least"} likely?`, `Difference ${chosen}`,
    [...candidates.map((difference) => `Difference ${difference}`), "They are equally likely"],
    `Correct. Difference ${chosen} appears in ${differenceCounts[chosen]} of the 36 ordered pairs.`, "Count the ordered pairs for each listed difference.", { type: "diceGrid", mode: "difference", highlight: chosen });
});

const explainDifferenceOdds = fresh(() => {
  const difference = randInt(0, 5);
  return mcq(`Why is a difference of ${difference} not automatically a 1-out-of-6 chance?`, "Different differences are made by different numbers of dice pairs",
    ["One die controls both dice", "Larger differences are always certain", "The dice stop being random together"],
    "Exactly. Grouped outcomes can contain different numbers of equally likely pairs.", "The six difference labels do not each contain the same number of dice pairs.", { type: "diceGrid", mode: "difference", highlight: difference });
});

function raceTask(): PracticeTask {
  const fairA = pick([
    { player: [0, 2, 4], chanzia: [1, 3, 5] },
    { player: [0, 1, 5], chanzia: [2, 3, 4] },
  ] as const);
  const choices = shuffle([
    { id: "fair", label: `You: ${fairA.player.join(", ")} · Roller: ${fairA.chanzia.join(", ")}`, playerDifferences: [...fairA.player], chanziaDifferences: [...fairA.chanzia] },
    { id: "loaded-a", label: "You: 0, 3, 4 · Roller: 1, 2, 5", playerDifferences: [0, 3, 4], chanziaDifferences: [1, 2, 5] },
    { id: "loaded-b", label: "You: 4, 5 · Roller: 0, 1, 2, 3", playerDifferences: [4, 5], chanziaDifferences: [0, 1, 2, 3] },
  ]);
  return {
    kind: "chanceDiceRace",
    prompt: pick(["Repair the two-dice race, then test it against Chanzia Roller.", "Choose equal-chance rules, then race Chanzia Roller.", "Balance the 36 dice pairs before Roller starts the race."]),
    choices,
    answerId: "fair",
    opponentName: "Roller",
    opponentImage: "/images/chanzia-roller-cutout.png",
    winningScore: 3,
  };
}
const repairRaceA = fresh(raceTask);
const repairRaceB = fresh(raceTask);
const repairRaceC = fresh(raceTask);

// Week 4: repeated experiments and relative frequency.
function spinnerTrial(): PracticeTask {
  const [a, b] = colourPair();
  const total = pick([4, 5, 6] as const);
  const countA = randInt(1, total - 1);
  return { kind: "chanceSpinTally", prompt: `Run ${total + 6} spins and record every result.`, tool: "spinner", draw: (spinner(countA, total, a, b) as Extract<ChanceVisual, { type: "spinner" }>).wedges, spins: total + 6, labels: [{ key: a, name: cap(NAMES[a]!), colour: a }, { key: b, name: cap(NAMES[b]!), colour: b }] };
}
function coinTrial(): PracticeTask {
  const spins = randInt(10, 20);
  return { kind: "chanceSpinTally", prompt: `Toss the coin ${spins} times and record every outcome.`, tool: "coin", draw: ["heads", "tails"], spins, labels: [{ key: "heads", name: "Heads" }, { key: "tails", name: "Tails" }] };
}
function dieTrial(): PracticeTask {
  const spins = randInt(12, 24);
  return { kind: "chanceSpinTally", prompt: `Roll the die ${spins} times and record every number.`, tool: "die", draw: ["1", "2", "3", "4", "5", "6"], spins, labels: [1, 2, 3, 4, 5, 6].map((value) => ({ key: String(value), name: String(value) })) };
}
const runSpinner = fresh(spinnerTrial);
const runCoin = fresh(coinTrial);
const runDie = fresh(dieTrial);

const writeFrequency = fresh(() => {
  const total = pick([12, 16, 20, 24, 30] as const);
  const target = randInt(2, total - 2);
  return mcq(`A target outcome occurred ${target} times in ${total} trials. What is its relative frequency?`, `${target}/${total}`,
    [`${total}/${target}`, `${target}/${total - target}`, `${target + 1}/${total}`],
    "Correct. Frequency is the outcome count over the total number of trials.", "Put the target count above the total trial count.", frequency(["Target", "Other"], [target, total - target]));
});

const readFrequency = fresh(() => {
  const total = pick([20, 24, 30] as const);
  const first = randInt(4, total - 5);
  const second = total - first;
  const winner = first > second ? "A" : "B";
  return mcq(`Outcome A occurred ${first} times and B occurred ${second} times. Which had the greater relative frequency?`, `Outcome ${winner}`,
    [`Outcome ${winner === "A" ? "B" : "A"}`, "They had equal frequency", "There were no trials"],
    `Correct. Outcome ${winner} occurred more often out of the same ${total} trials.`, "Compare the two counts because they share the same total.", frequency(["A", "B"], [first, second]));
});

const completeFrequency = fresh(() => {
  const total = pick([20, 30, 40] as const);
  const target = randInt(5, total - 5);
  return mcq(`The relative frequency of cyan was ${target}/${total}. How many cyan results were recorded?`, String(target),
    [String(total), String(target + 1), String(Math.max(1, target - 1))],
    "Yes. The numerator is the recorded cyan frequency.", "Read the numerator as the number of target outcomes.", frequency(["Cyan", "Other"], [target, total - target]));
});

const compareRuns = fresh(() => {
  const total = pick([20, 30] as const);
  const first = randInt(Math.floor(total * 0.3), Math.floor(total * 0.7));
  let second = randInt(Math.floor(total * 0.3), Math.floor(total * 0.7));
  if (second === first) second = Math.min(total - 1, second + 1);
  return mcq(`Trial A recorded ${first} heads out of ${total}; Trial B recorded ${second} heads out of ${total}. What is the best conclusion?`, "Repeated fair trials can have different frequencies",
    ["The coin must change between trials", "Both trials must always match", "Heads is now impossible"],
    "Correct. Chance creates variation between repeated trials.", "Different short-run frequencies can both come from a fair coin.", frequency(["Trial A heads", "Trial B heads"], [first, second]));
});

const compareTrialsInteractive = fresh(() => {
  const spins = randInt(12, 30);
  return { kind: "chanceAutoTally", prompt: `Run two ${spins}-trial experiments, compare their relative frequencies and explain the variation.`, tool: "coin", draw: ["heads", "tails"], spins, labels: [{ key: "heads", name: "Heads" }, { key: "tails", name: "Tails" }], mode: "compareFrequencies" };
});

const variationReason = fresh(() => {
  const total = pick([20, 30, 40] as const);
  const a = randInt(Math.floor(total * 0.35), Math.floor(total * 0.65));
  const b = randInt(Math.floor(total * 0.35), Math.floor(total * 0.65));
  return mcq(`Two groups used the same fair spinner. Their target frequencies were ${a}/${total} and ${b}/${total}. Why can both be valid?`, "Chance results can vary between repeated experiments",
    ["One group ignored the spinner", "Fair tools always give exact halves", "The target became certain"],
    "Right. Repeated random experiments do not have to match exactly.", "Fairness describes the chance structure, not an identical short-run result.", frequency(["Group A", "Group B"], [a, b]));
});

// Week 5: compare designed likelihood with frequency evidence.
function compareSpinnerDesign(): PracticeTask {
  const total = pick([6, 8] as const);
  const a = randInt(1, total - 1);
  let b = randInt(1, total - 1);
  if (a === b) b = a === total - 1 ? a - 1 : a + 1;
  const answer = a > b ? "Machine A" : "Machine B";
  return { kind: "chanceCompare", prompt: "Which machine should produce red more often?", tools: [{ label: "Machine A", visual: spinner(a, total) }, { label: "Machine B", visual: spinner(b, total) }], options: options(answer, [answer === "Machine A" ? "Machine B" : "Machine A", "They have the same chance", "Red is impossible"]), answer, feedback: { correct: `Correct. ${answer} gives red a larger share of equal regions.`, wrong: "Compare the fraction of each machine that is red." } };
}

function compareBagDesign(): PracticeTask {
  const [a, b] = colourPair();
  const first = randInt(2, 6);
  const second = randInt(2, 6);
  const totalA = first + 2;
  const totalB = second + 5;
  const ratioA = first / totalA;
  const ratioB = second / totalB;
  const answer = ratioA > ratioB ? "Bag A" : ratioA < ratioB ? "Bag B" : "They have the same chance";
  return { kind: "chanceCompare", prompt: `Which bag gives a better chance of drawing ${NAMES[a]}?`, tools: [{ label: "Bag A", visual: { type: "bag", counters: shuffle([...Array(first).fill(a), ...Array(2).fill(b)] as string[]) }, caption: `${first}/${totalA} ${NAMES[a]}` }, { label: "Bag B", visual: { type: "bag", counters: shuffle([...Array(second).fill(a), ...Array(5).fill(b)] as string[]) }, caption: `${second}/${totalB} ${NAMES[a]}` }], options: options(answer, ["Bag A", "Bag B", "They have the same chance", `${cap(NAMES[a]!)} is impossible`]), answer, feedback: { correct: "Correct. You compared the target share, not just the target count.", wrong: "Compare target counters out of all counters in each bag." } };
}
const predictSpinnerDesign = fresh(compareSpinnerDesign);
const predictBagDesign = fresh(compareBagDesign);
const predictCount = fresh(() => {
  const total = pick([5, 6, 8] as const);
  const red = randInt(1, total - 1);
  return { kind: "chancePredictCount", prompt: `Predict how often red will appear in ${total * 3} spins, then test your estimate against Roller.`, wedges: (spinner(red, total) as Extract<ChanceVisual, { type: "spinner" }>).wedges, targetKey: RED, targetName: "red", spins: total * 3 };
});

const estimateFromFrequency = fresh(() => {
  const total = pick([30, 40, 50] as const);
  const a = randInt(Math.ceil(total * 0.5), total - 8);
  const b = total - a;
  return mcq(`After ${total} trials, outcome A occurred ${a} times and B occurred ${b} times. Which outcome is estimated to be more likely?`, "Outcome A",
    ["Outcome B", "They are equally likely", "Neither outcome is possible"],
    "Correct. A has the greater observed relative frequency.", "Use the recorded frequency as evidence for the estimate.", frequency(["A", "B"], [a, b]));
});

const compareFrequencyEvidence = fresh(() => {
  const totalA = pick([20, 30, 40] as const);
  const totalB = pick([20, 30, 40] as const);
  const targetA = Math.round(totalA * pick([0.25, 0.4, 0.6, 0.75] as const));
  let targetB = Math.round(totalB * pick([0.25, 0.4, 0.6, 0.75] as const));
  if (targetA / totalA === targetB / totalB) targetB = Math.min(totalB - 1, targetB + 1);
  const answer = targetA / totalA > targetB / totalB ? "Experiment A" : "Experiment B";
  return mcq(`Target appeared ${targetA}/${totalA} in Experiment A and ${targetB}/${totalB} in Experiment B. Which estimated likelihood is greater?`, answer,
    [answer === "Experiment A" ? "Experiment B" : "Experiment A", "They are equal", "The totals cannot be compared"],
    "Correct. You compared each frequency as a share of its own total.", "Different totals require comparing relative frequency, not only numerators.", frequency(["A target", "A other", "B target", "B other"], [targetA, totalA - targetA, targetB, totalB - targetB]));
});
const estimateSpinnerRun = fresh(() => {
  const [major, minorA, minorB] = shuffle(COLOURS).slice(0, 3) as [string, string, string];
  const majorCount = randInt(3, 5);
  return { kind: "chanceAutoTally", prompt: "Run the uneven spinner and use its recorded frequencies to estimate the most likely outcome.", tool: "spinner", draw: shuffle([...Array(majorCount).fill(major), minorA, minorB] as string[]), spins: randInt(18, 32), labels: [{ key: major, name: cap(NAMES[major]!), colour: major }, { key: minorA, name: cap(NAMES[minorA]!), colour: minorA }, { key: minorB, name: cap(NAMES[minorB]!), colour: minorB }], mode: "most" };
});

// Judge a die-results chart: the correct verdict depends on the data, so the
// answer varies between "looks fair" and "may be loaded".
const judgeDieEvidence = fresh(() => {
  const total = pick([30, 36, 42] as const);
  const loaded = Math.random() < 0.5;
  let counts: number[];
  if (loaded) {
    const heavy = Math.round(total * pick([0.42, 0.48, 0.55] as const));
    const rest = spreadTotal(total - heavy, 5);
    const face = randInt(0, 5);
    counts = [...rest.slice(0, face), heavy, ...rest.slice(face)];
  } else {
    counts = spreadTotal(total, 6);
  }
  const fairText = "The numbers are fairly evenly spread, so the die looks fair";
  const loadedText = "One number appears far more often, so the die may be loaded";
  const answer = loaded ? loadedText : fairText;
  return mcq("What do these die results suggest?", answer,
    [loaded ? fairText : loadedText, "Every future roll is now certain", "The die is broken forever"],
    loaded ? "Right. One face stands out far above the rest — that is evidence to test more." : "Right. A broad, even spread is what a fair die usually gives.",
    "Look at whether one number sticks out far above the others.", frequency(["1", "2", "3", "4", "5", "6"], counts));
});
const compareFairLoaded2 = fresh(() => {
  const total = pick([30, 36, 42] as const);
  const loaded = Math.random() < 0.5;
  let counts: number[];
  if (loaded) {
    const heavy = Math.round(total * pick([0.45, 0.5, 0.55] as const));
    const rest = spreadTotal(total - heavy, 5);
    const face = randInt(0, 5);
    counts = [...rest.slice(0, face), heavy, ...rest.slice(face)];
  } else {
    counts = spreadTotal(total, 6);
  }
  const balancedText = "Run more trials — the spread is close, so keep the fair verdict for now";
  const suspectText = "Suspect a loaded die and gather more evidence to be sure";
  const answer = loaded ? suspectText : balancedText;
  return mcq("Based only on this chart, what is the fairest next step?", answer,
    [loaded ? balancedText : suspectText, "Declare the result certain after one run", "Ignore the recorded frequencies"],
    loaded ? "Correct. A strong spike is evidence worth testing, not proof yet." : "Correct. A close spread is what a fair die gives — no reason to cry foul yet.",
    "Let the chart's spread decide whether to suspect bias.", frequency(["1", "2", "3", "4", "5", "6"], counts));
});
const compareFairLoaded = fresh(() => {
  const fair = frequency(["1", "2", "3", "4", "5", "6"], [6, 5, 7, 6, 5, 7]);
  const loaded = frequency(["1", "2", "3", "4", "5", "6"], [3, 3, 4, 3, 3, 20]);
  const flip = Math.random() < 0.5;
  return { kind: "chanceCompare", prompt: "Which result chart gives stronger evidence of a loaded die?", tools: flip ? [{ label: "Chart A", visual: loaded }, { label: "Chart B", visual: fair }] : [{ label: "Chart A", visual: fair }, { label: "Chart B", visual: loaded }], options: options(flip ? "Chart A" : "Chart B", [flip ? "Chart B" : "Chart A", "Both charts prove fairness", "Neither chart contains evidence"]), answer: flip ? "Chart A" : "Chart B", feedback: { correct: "Correct. One face dominates that chart far beyond the others.", wrong: "Look for the chart where one face appears far more often." } };
});

// Week 6: plan, run and defend a complete investigation.
const planQuestion = fresh(() => {
  const tool = pick(["coin", "spinner", "die", "bag"] as const);
  const trials = pick([20, 30, 40] as const);
  const testable = [
    `Which ${tool} outcome occurs most often in ${trials} trials?`,
    `How often does each ${tool} outcome appear in ${trials} trials?`,
    `Which ${tool} outcome is least common in ${trials} trials?`,
  ];
  const notTestable = [
    `Which ${tool} looks nicest?`,
    `Who invented the ${tool}?`,
    `How heavy is the ${tool} without weighing it?`,
    `What is the best colour for the ${tool}?`,
  ];
  // Flip which kind of question is the answer so it is not always the testable one.
  if (Math.random() < 0.5) {
    return mcq("Which question CAN be tested with repeated trials?", pick(testable),
      shuffle(notTestable).slice(0, 3),
      "Correct. It names outcomes we can count across repeated trials.", "Pick the question that repeated chance trials can actually answer.");
  }
  return mcq("Which question can NOT be answered by repeated trials?", pick(notTestable),
    shuffle(testable).slice(0, 3),
    "Correct. That question is not about counting outcomes across trials.", "Pick the question that counting outcomes cannot answer.");
});
const planMethod = fresh(() => {
  const trials = pick([20, 30, 40] as const);
  const tool = pick(["coin", "spinner", "die", "counter bag"] as const);
  return mcq(`Which method makes a ${trials}-trial ${tool} investigation trustworthy?`, "Use the same tool and rule, record every result, and replace drawn items",
    ["Change the tool after every result", "Record only favourite outcomes", "Stop when the prediction is winning"],
    "Correct. A consistent method makes the frequencies comparable.", "Keep the procedure unchanged and record every outcome.");
});
const planTable = fresh(() => {
  const outcomes = pick(["heads and tails", "die faces 1 to 6", "red, blue and gold"] as const);
  const trials = pick([20, 30, 40] as const);
  return mcq(`A ${trials}-trial investigation records ${outcomes}. What must the results table include?`, "One labelled frequency row for every possible outcome",
    ["Only the predicted winner", "A different total for every row", "Unrecorded extra outcomes"],
    "Correct. Every possible outcome needs a place to be recorded.", "The recording table must match the complete outcome set.");
});

const investigationSpinner = fresh(() => {
  const [major, second, third] = shuffle(COLOURS).slice(0, 3) as [string, string, string];
  const majorCount = randInt(3, 5);
  const secondCount = randInt(1, majorCount - 1);
  return { kind: "chanceAutoTally", prompt: "Predict, run and record the uneven spinner investigation.", tool: "spinner", draw: shuffle([...Array(majorCount).fill(major), ...Array(secondCount).fill(second), third] as string[]), spins: randInt(24, 40), labels: [{ key: major, name: cap(NAMES[major]!), colour: major }, { key: second, name: cap(NAMES[second]!), colour: second }, { key: third, name: cap(NAMES[third]!), colour: third }], mode: "predictMost" };
});
const investigationCoin = fresh(() => ({ kind: "chanceAutoTally", prompt: "Run and compare two fair-coin investigations, then defend what the relative frequencies show.", tool: "coin", draw: ["heads", "tails"], spins: randInt(20, 40), labels: [{ key: "heads", name: "Heads" }, { key: "tails", name: "Tails" }], mode: "compareFrequencies" }));
const investigationDie = fresh(() => ({ kind: "chanceSpinTally", prompt: "Run the die investigation and record every result before judging the frequencies.", tool: "die", draw: ["1", "2", "3", "4", "5", "6"], spins: randInt(18, 36), labels: [1, 2, 3, 4, 5, 6].map((value) => ({ key: String(value), name: String(value) })) }));

const defendFrequency = fresh(() => {
  const total = pick([24, 30, 36] as const);
  const target = randInt(Math.ceil(total * 0.45), Math.ceil(total * 0.7));
  return mcq(`The target occurred ${target}/${total} times. Which verdict uses the evidence correctly?`, "The target had the greatest observed relative frequency in this investigation",
    ["The target is now certain forever", "Every future trial must match", "The other outcomes are impossible"],
    "Correct. The verdict describes the recorded evidence without overclaiming.", "A sound conclusion stays tied to this investigation and its frequencies.", frequency(["Target", "Other"], [target, total - target]));
});
const defendVariation = fresh(() => variationReason());
const grandRace = fresh(raceTask);

const LESSONS: Record<string, LessonSpec> = {
  "1-1": { teaching: bagLens, activities: [bagLens, dieLens, spinnerLens] },
  "1-2": { teaching: listCoinOutcomes, activities: [listCoinOutcomes, listDieOutcomes, listBagOutcomes] },
  "1-3": { teaching: equalNormalDie, activities: [equalNormalDie, equalBagCheck, equalSpinnerCheck] },
  "2-1": { teaching: equalRegions, activities: [equalRegions, equalCounters, equalSingleFaces] },
  "2-2": { teaching: unequalSpinner, activities: [unequalSpinner, repeatedFaceDie, unequalBag] },
  "2-3": { teaching: promotionBias, activities: [promotionBias, spinnerBias, dieBias] },
  "3-1": { teaching: totalDicePairs, activities: [totalDicePairs, countSumPairs, countDifferencePairs] },
  "3-2": { teaching: compareDifferences, activities: [compareDifferences, mostLikelyDifference, explainDifferenceOdds] },
  "3-3": { teaching: explainDifferenceOdds, activities: [repairRaceA, repairRaceB, repairRaceC] },
  "4-1": { teaching: runCoin, activities: [runSpinner, runCoin, runDie] },
  "4-2": { teaching: writeFrequency, activities: [writeFrequency, readFrequency, completeFrequency] },
  "4-3": { teaching: compareRuns, activities: [compareRuns, compareTrialsInteractive, variationReason] },
  "5-1": { teaching: predictSpinnerDesign, activities: [predictSpinnerDesign, predictBagDesign, predictCount] },
  "5-2": { teaching: estimateFromFrequency, activities: [estimateFromFrequency, compareFrequencyEvidence, estimateSpinnerRun] },
  "5-3": { teaching: judgeDieEvidence, activities: [judgeDieEvidence, compareFairLoaded2, compareFairLoaded] },
  "6-1": { teaching: planQuestion, activities: [planQuestion, planMethod, planTable] },
  "6-2": { teaching: investigationSpinner, activities: [investigationSpinner, investigationCoin, investigationDie] },
  "6-3": { teaching: defendFrequency, activities: [defendFrequency, defendVariation, grandRace] },
};

export function getChanceHollowLevel5TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const match = /y5-chance-w(\d+)-l(\d+)/.exec(lessonId);
  if (!match) return null;
  const spec = LESSONS[`${Number(match[1])}-${Number(match[2])}`];
  if (!spec) return null;
  return {
    teaching: () => spec.teaching(),
    activities: spec.activities,
  };
}
