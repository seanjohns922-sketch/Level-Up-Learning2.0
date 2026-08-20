import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

// ── Statistica Level 1 (Year 1) — playable activities on the blueprint ───────
// Covers AC9M1ST01 (acquire & record data) and AC9M1ST02 (represent categorical
// data with one-to-one displays and picture graphs, compare frequencies, discuss).
// Three task kinds carry the level: statisticaSort, statisticaTally, statisticaGraph.

type Cat = { id: string; label: string; color: string };

const C = { red: "#ef4444", amber: "#f59e0b", orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", pink: "#ec4899" };

// Survey topics for tally / graph tasks (favourite X, weather, travel…).
type Survey = { id: string; title: string; question: string; unit: string; cats: Cat[] };
const SURVEYS: Survey[] = [
  { id: "fruit", title: "Favourite Fruit", question: "What is your favourite fruit?", unit: "children", cats: [{ id: "apple", label: "Apple", color: C.red }, { id: "banana", label: "Banana", color: C.amber }, { id: "orange", label: "Orange", color: C.orange }] },
  { id: "pet", title: "Favourite Pet", question: "What is your favourite pet?", unit: "children", cats: [{ id: "dog", label: "Dog", color: C.orange }, { id: "cat", label: "Cat", color: C.purple }, { id: "fish", label: "Fish", color: C.blue }] },
  { id: "colour", title: "Favourite Colour", question: "What is your favourite colour?", unit: "children", cats: [{ id: "red", label: "Red", color: C.red }, { id: "blue", label: "Blue", color: C.blue }, { id: "green", label: "Green", color: C.green }] },
  { id: "weather", title: "Our Weather", question: "What was the weather each day?", unit: "days", cats: [{ id: "sunny", label: "Sunny", color: C.amber }, { id: "cloudy", label: "Cloudy", color: C.teal }, { id: "rainy", label: "Rainy", color: C.blue }] },
  { id: "sport", title: "Favourite Sport", question: "What is your favourite sport?", unit: "children", cats: [{ id: "soccer", label: "Soccer", color: C.green }, { id: "swim", label: "Swimming", color: C.blue }, { id: "run", label: "Running", color: C.pink }] },
  { id: "travel", title: "Getting to School", question: "How do you get to school?", unit: "children", cats: [{ id: "car", label: "Car", color: C.red }, { id: "bus", label: "Bus", color: C.amber }, { id: "walk", label: "Walk", color: C.green }] },
];

// Sorting topics (each item clearly belongs to one category).
type SortSet = { id: string; prompt: string; cats: Cat[]; items: Array<{ label: string; category: string }> };
// Items are interleaved by category so any prefix stays balanced: the first 6
// give 2-per-group (easy) and the full 10 give 4/3/3 (hard).
const SORT_SETS: SortSet[] = [
  { id: "animals", prompt: "Sort each animal into its group.", cats: [{ id: "pet", label: "Pets", color: C.orange }, { id: "farm", label: "Farm", color: C.green }, { id: "wild", label: "Wild", color: C.purple }], items: [{ label: "Dog", category: "pet" }, { label: "Cow", category: "farm" }, { label: "Lion", category: "wild" }, { label: "Cat", category: "pet" }, { label: "Sheep", category: "farm" }, { label: "Zebra", category: "wild" }, { label: "Rabbit", category: "pet" }, { label: "Horse", category: "farm" }, { label: "Tiger", category: "wild" }, { label: "Hamster", category: "pet" }] },
  { id: "food", prompt: "Sort each one: fruit, vegetable or drink?", cats: [{ id: "fruit", label: "Fruit", color: C.red }, { id: "veg", label: "Vegetable", color: C.green }, { id: "drink", label: "Drink", color: C.blue }], items: [{ label: "Apple", category: "fruit" }, { label: "Carrot", category: "veg" }, { label: "Milk", category: "drink" }, { label: "Banana", category: "fruit" }, { label: "Peas", category: "veg" }, { label: "Juice", category: "drink" }, { label: "Grapes", category: "fruit" }, { label: "Corn", category: "veg" }, { label: "Water", category: "drink" }, { label: "Pear", category: "fruit" }] },
  { id: "things", prompt: "Sort each thing into its group.", cats: [{ id: "toy", label: "Toys", color: C.pink }, { id: "clothes", label: "Clothes", color: C.teal }, { id: "food", label: "Food", color: C.amber }], items: [{ label: "Ball", category: "toy" }, { label: "Hat", category: "clothes" }, { label: "Bread", category: "food" }, { label: "Teddy", category: "toy" }, { label: "Sock", category: "clothes" }, { label: "Cheese", category: "food" }, { label: "Kite", category: "toy" }, { label: "Shoe", category: "clothes" }, { label: "Egg", category: "food" }, { label: "Blocks", category: "toy" }] },
  { id: "transport", prompt: "Sort each vehicle by where it travels.", cats: [{ id: "land", label: "Land", color: C.green }, { id: "water", label: "Water", color: C.blue }, { id: "air", label: "Air", color: C.purple }], items: [{ label: "Car", category: "land" }, { label: "Boat", category: "water" }, { label: "Plane", category: "air" }, { label: "Bus", category: "land" }, { label: "Ferry", category: "water" }, { label: "Helicopter", category: "air" }, { label: "Bike", category: "land" }, { label: "Canoe", category: "water" }, { label: "Glider", category: "air" }, { label: "Train", category: "land" }] },
  { id: "rooms", prompt: "Sort each object into the room where it belongs.", cats: [{ id: "kitchen", label: "Kitchen", color: C.amber }, { id: "bedroom", label: "Bedroom", color: C.purple }, { id: "bathroom", label: "Bathroom", color: C.blue }], items: [{ label: "Spoon", category: "kitchen" }, { label: "Pillow", category: "bedroom" }, { label: "Soap", category: "bathroom" }, { label: "Plate", category: "kitchen" }, { label: "Bed", category: "bedroom" }, { label: "Toothbrush", category: "bathroom" }, { label: "Pot", category: "kitchen" }, { label: "Blanket", category: "bedroom" }, { label: "Shampoo", category: "bathroom" }, { label: "Cup", category: "kitchen" }] },
  { id: "garden", prompt: "Sort each garden item into its group.", cats: [{ id: "flower", label: "Flowers", color: C.pink }, { id: "insect", label: "Insects", color: C.orange }, { id: "tool", label: "Tools", color: C.green }], items: [{ label: "Rose", category: "flower" }, { label: "Bee", category: "insect" }, { label: "Spade", category: "tool" }, { label: "Daisy", category: "flower" }, { label: "Ant", category: "insect" }, { label: "Rake", category: "tool" }, { label: "Tulip", category: "flower" }, { label: "Butterfly", category: "insect" }, { label: "Trowel", category: "tool" }, { label: "Sunflower", category: "flower" }] },
];

const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);

type CountPool = readonly number[];

const BASE_COUNTS = [2, 3, 4, 5, 6] as const;
const WEEK_6_COUNTS = [9, 10, 11, 12] as const;
const WEEK_7_COUNTS = [15, 16, 17, 18, 19, 20] as const;

// Distinct one-to-one frequencies from the requested lesson range. Repeated
// attempts cycle ordered combinations while preserving the lesson's demand.
function countsFor(round: number, forceTie = false, values: CountPool = BASE_COUNTS): number[] {
  const combinations = values.length * (values.length - 1) * (values.length - 2);
  let index = ((round % combinations) + combinations) % combinations;
  const firstIndex = index % values.length;
  const first = values[firstIndex]!;
  index = Math.floor(index / values.length);
  const afterFirst = values.filter((value) => value !== first);
  const secondIndex = index % afterFirst.length;
  const second = afterFirst[secondIndex]!;
  index = Math.floor(index / afterFirst.length);
  const afterSecond = afterFirst.filter((value) => value !== second);
  const third = afterSecond[index % afterSecond.length]!;
  return forceTie ? [first, first, third] : [first, second, third];
}

function tallyCountFor(round: number): number {
  return pick([15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], round);
}

const numOptions = (correct: number, round: number) => {
  const set = new Set<number>([correct]);
  let d = 1;
  while (set.size < 3) { set.add(Math.max(1, correct + (d % 2 ? d : -d))); d += 1; }
  return order([...set].map((n) => ({ id: `n${n}`, label: String(n) })), round);
};

// ── Task generators ─────────────────────────────────────────────────────────
// Collect the data: gather scattered items into live counters, then answer a
// question about the counts. Built from a survey so the counts vary by round.
function makeCollectTask(round: number, target: number, ask: "most" | "fewest"): PracticeTask {
  const { survey, categories } = surveyCats(round);
  const items = categories.flatMap((c, ci) => Array.from({ length: c.count }, (_, k) => ({ id: `c${ci}_${k}`, label: c.label, category: c.id })));
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const answer = ask === "most" ? sorted[0]! : sorted[sorted.length - 1]!;
  return {
    kind: "statisticaCollect", target,
    prompt: `Collect the data — tap each one to count it. ${survey.question}`,
    speakText: "Collecting data means gathering and counting every answer. Tap each picture to count it into its group, then read the counters.",
    items, categories: categories.map(({ id, label, color }) => ({ id, label, color })),
    question: ask === "most" ? "Which did you count the MOST of?" : "Which did you count the FEWEST of?",
    correctOptionIds: [answer.id],
    feedback: { correct: `Yes — you counted the ${ask} ${answer.label}.`, wrong: `Look at the counters — which number is the ${ask === "most" ? "biggest" : "smallest"}?` },
  };
}
export function collectTask(round: number, target: number): PracticeTask {
  return makeCollectTask(round, target, round % 2 === 0 ? "most" : "fewest");
}

function makeSortTask(round: number, target: number, size: number): PracticeTask {
  const set = pick(SORT_SETS, round);
  const items = set.items.slice(0, size).map((it, i) => ({ id: `i${i}`, label: it.label, category: it.category }));
  const hard = size >= 10;
  return {
    kind: "statisticaSort", target, prompt: hard ? `${set.prompt} There are ${items.length} to sort!` : set.prompt,
    speakText: "Data can be sorted into groups called categories. Tap a card, then tap the group it belongs to.",
    items, categories: set.cats,
    feedback: { correct: "Sorted! Every card is in the right group.", wrong: "Look again — each card belongs to just one group." },
  };
}

// Easy sort (6 cards, 2 per group) — the default for intro lessons.
export function sortTask(round: number, target: number): PracticeTask {
  return makeSortTask(round, target, 6);
}

// Harder sort (all 10 cards, uneven groups) — for a step-up sorting lesson.
export function sortTaskHard(round: number, target: number): PracticeTask {
  return makeSortTask(round, target, 10);
}

export function tallyRecordTask(round: number, target: number): PracticeTask {
  const survey = pick(SURVEYS, round);
  const cat = pick(survey.cats, round + 1);
  const count = tallyCountFor(round);
  return {
    kind: "statisticaTally", mode: "record", target, count, label: cat.label.toLowerCase(),
    prompt: `Make a tally to record ${count} for "${cat.label}".`,
    speakText: "A tally records data with marks. Every fifth mark goes across the bundle so the marks are easy to count in fives.",
    feedback: { correct: "Great tally — you recorded the data.", wrong: `Add or remove marks until there are ${count}.` },
  };
}

export function tallyReadTask(round: number, target: number): PracticeTask {
  const count = tallyCountFor(round + 4);
  return {
    kind: "statisticaTally", mode: "read", target, count, label: "votes",
    prompt: "How many does this tally show?",
    speakText: "Count the tally in fives, then add on the extra marks.",
    options: numOptions(count, round), correctOptionIds: [`n${count}`],
    feedback: { correct: "Right — count the fives, then the extras.", wrong: "Count each bundle as five, then add the leftover marks." },
  };
}

function surveyCats(round: number, forceTie = false, countPool: CountPool = BASE_COUNTS) {
  const survey = pick(SURVEYS, round);
  const counts = countsFor(round, forceTie, countPool);
  const categories = survey.cats.map((c, i) => ({ ...c, count: counts[i]! }));
  return { survey, categories };
}

function makeTapGraphTask(round: number, target: number, display: "objects" | "pictures", countPool: CountPool = BASE_COUNTS): PracticeTask {
  const { survey, categories } = surveyCats(round + 2, false, countPool);
  const ask = round % 2 === 0 ? "most" : "fewest";
  const ordered = [...categories].sort((a, b) => ask === "most" ? b.count - a.count : a.count - b.count);
  const answer = ordered[0]!;
  return {
    kind: "statisticaTapGraph", target, ask,
    display,
    categories,
    correctCategoryId: answer.id,
    prompt: `Tap the column with the ${ask === "most" ? "MOST" : "FEWEST"} ${survey.unit}.`,
    speakText: `Read the display. Tap the ${ask === "most" ? "tallest" : "shortest"} column, then check your answer.`,
    feedback: { correct: `Yes — ${answer.label} has the ${ask}.`, wrong: `Compare the column heights and find the ${ask === "most" ? "tallest" : "shortest"}.` },
  };
}

export function tapGraphTask(round: number, target: number): PracticeTask {
  return makeTapGraphTask(round, target, round % 3 === 0 ? "objects" : "pictures");
}

export function tapObjectGraphTask(round: number, target: number): PracticeTask {
  return makeTapGraphTask(round, target, "objects");
}

export function tapPictureGraphTask(round: number, target: number): PracticeTask {
  return makeTapGraphTask(round, target, "pictures");
}

function makeRankTask(round: number, target: number, countPool: CountPool = BASE_COUNTS): PracticeTask {
  const { categories } = surveyCats(round + 3, false, countPool);
  const direction = round % 2 === 0 ? "most-to-least" : "least-to-most";
  const correctOrderIds = [...categories]
    .sort((a, b) => direction === "most-to-least" ? b.count - a.count : a.count - b.count)
    .map((category) => category.id);
  return {
    kind: "statisticaRank", target, direction, categories, correctOrderIds,
    prompt: direction === "most-to-least" ? "Rank the categories from MOST to LEAST." : "Rank the categories from LEAST to MOST.",
    speakText: "Compare all three columns. Tap the category names in the requested order. You can remove one and change your order before checking.",
    feedback: { correct: "Correct — your ranking follows the data from one end to the other.", wrong: "Compare the column heights again, starting with the first rank slot." },
  };
}

export function rankTask(round: number, target: number): PracticeTask {
  return makeRankTask(round, target);
}

function makeGapTask(round: number, target: number, countPool: CountPool = BASE_COUNTS): PracticeTask {
  const { categories } = surveyCats(round + 1, false, countPool);
  const pair = categories.slice(0, 2);
  const larger = pair[0]!.count > pair[1]!.count ? pair[0]! : pair[1]!;
  const difference = Math.abs(pair[0]!.count - pair[1]!.count);
  return {
    kind: "statisticaGap", target, categories: pair,
    largerCategoryId: larger.id, difference,
    prompt: `How many MORE chose ${larger.label}? Tap the extra marks.`,
    speakText: "Line up the two displays. The unmatched marks show how many more. Tap each extra mark, then check your count.",
    feedback: { correct: `Right — there are ${difference} more ${larger.label} votes.`, wrong: "Only count the marks that do not have a matching mark in the other column." },
  };
}

export function gapTask(round: number, target: number): PracticeTask {
  return makeGapTask(round, target);
}

function makeTableFrequencyTask(round: number, target: number, countPool: CountPool = BASE_COUNTS): PracticeTask {
  const { survey, categories } = surveyCats(round + 4, false, countPool);
  const row = pick(categories, round + 1);
  return {
    kind: "statisticaTable", mode: "count", target, rows: categories,
    answerCount: row.count,
    prompt: `Use the table. How many chose ${row.label}?`,
    speakText: `${survey.question} Find the ${row.label} row and enter its frequency.`,
    feedback: { correct: `Correct — the table shows ${row.count} for ${row.label}.`, wrong: `Find ${row.label} in the first column, then read the number beside it.` },
  };
}

export function tableFrequencyTask(round: number, target: number): PracticeTask {
  return makeTableFrequencyTask(round, target);
}

function makeTableSelectTask(round: number, target: number, countPool: CountPool = BASE_COUNTS): PracticeTask {
  const { survey, categories } = surveyCats(round + 5, false, countPool);
  const askMost = round % 2 === 0;
  const answer = [...categories].sort((a, b) => askMost ? b.count - a.count : a.count - b.count)[0]!;
  return {
    kind: "statisticaTable", mode: "select", target, rows: categories,
    correctRowId: answer.id,
    prompt: `Use the table. Select the row with the ${askMost ? "MOST" : "FEWEST"}.`,
    speakText: `${survey.question} Compare the frequencies in the table and tap the row with the ${askMost ? "largest" : "smallest"} number.`,
    feedback: { correct: `Yes — ${answer.label} has the ${askMost ? "largest" : "smallest"} frequency.`, wrong: `Compare the numbers in the frequency column and choose the ${askMost ? "largest" : "smallest"}.` },
  };
}

export function tableSelectTask(round: number, target: number): PracticeTask {
  return makeTableSelectTask(round, target);
}

export function buildTask(round: number, target: number, display: "objects" | "pictures"): PracticeTask {
  const { survey, categories } = surveyCats(round);
  return {
    kind: "statisticaGraph", mode: "build", target, display, categories,
    prompt: display === "objects" ? "Build the display: one object for each vote." : "Build the picture graph: one picture for each vote.",
    speakText: `${survey.question} Add one ${display === "objects" ? "object" : "picture"} for every vote so each column matches its number.`,
    feedback: { correct: "Your display matches the data exactly.", wrong: "Check each column — one symbol stands for one vote." },
  };
}

function makeReadGraphTask(round: number, target: number, display: "objects" | "pictures"): PracticeTask {
  const { survey, categories } = surveyCats(round + 1);
  const askMost = round % 2 === 0;
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const answer = askMost ? sorted[0]! : sorted[sorted.length - 1]!;
  const options = order(categories.map((c) => ({ id: c.id, label: c.label })), round);
  return {
    kind: "statisticaGraph", mode: "read", target, display, categories,
    prompt: askMost ? "Which had the MOST votes?" : "Which had the FEWEST votes?",
    speakText: `${survey.question} Read the picture graph and find the ${askMost ? "tallest" : "shortest"} column.`,
    options, correctOptionIds: [answer.id],
    feedback: { correct: `Yes — ${answer.label} is the ${askMost ? "tallest" : "shortest"}.`, wrong: `Compare the columns and find the ${askMost ? "tallest" : "shortest"} one.` },
  };
}


export function readGraphTask(round: number, target: number): PracticeTask {
  return makeReadGraphTask(round, target, "pictures");
}

export function readObjectGraphTask(round: number, target: number): PracticeTask {
  return makeReadGraphTask(round, target, "objects");
}

function makeFrequencyTask(round: number, target: number, display: "objects" | "pictures", countPool: CountPool = BASE_COUNTS): PracticeTask {
  const { survey, categories } = surveyCats(round + 3, false, countPool);
  const cat = pick(categories, round);
  return {
    kind: "statisticaGraph", mode: "read", target, display, categories,
    prompt: `How many chose ${cat.label}?`,
    speakText: `${survey.question} Count the pictures in the ${cat.label} column.`,
    options: numOptions(cat.count, round), correctOptionIds: [`n${cat.count}`],
    feedback: { correct: `Right — ${cat.count} chose ${cat.label}.`, wrong: `Count the pictures in the ${cat.label} column.` },
  };
}


export function frequencyTask(round: number, target: number): PracticeTask {
  return makeFrequencyTask(round, target, "pictures");
}

export function objectFrequencyTask(round: number, target: number): PracticeTask {
  return makeFrequencyTask(round, target, "objects");
}

function makeCompareTask(round: number, target: number, countPool: CountPool = BASE_COUNTS): PracticeTask {
  const forceTie = round % 3 === 2;
  const { survey, categories } = surveyCats(round + 2, forceTie, countPool);
  const a = categories[0]!, b = categories[1]!;
  const correct = a.count > b.count ? "a" : a.count < b.count ? "b" : "eq";
  const options = order([
    { id: "a", label: `More chose ${a.label}` },
    { id: "b", label: `More chose ${b.label}` },
    { id: "eq", label: "They are equal" },
  ], round);
  return {
    kind: "statisticaGraph", mode: "compare", target, display: "pictures", categories,
    prompt: `Compare ${a.label} and ${b.label}. What does the data show?`,
    speakText: `${survey.question} Compare the ${a.label} and ${b.label} columns — which is taller, or are they equal?`,
    options, correctOptionIds: [correct],
    feedback: { correct: "Correct — the taller column has more.", wrong: "Line the two columns up and compare their heights." },
  };
}

export function compareTask(round: number, target: number): PracticeTask {
  return makeCompareTask(round, target);
}

// Judge whether a statement about the data is TRUE or FALSE — active reasoning,
// not just spotting the tallest column. The statement is generated from the real
// counts and flipped on some rounds so the answer isn't always the same.
function makeClaimTask(round: number, target: number, display: "objects" | "pictures", countPool: CountPool = BASE_COUNTS): PracticeTask {
  const { survey, categories } = surveyCats(round + 1, false, countPool);
  const top = [...categories].sort((a, b) => b.count - a.count);
  const most = top[0]!, least = top[top.length - 1]!;
  // Three claim shapes; pick one, then decide whether to state it truly or falsely.
  const shape = round % 3;
  const stateTrue = round % 2 === 0;
  let statement: string;
  let isActuallyTrue: boolean;
  if (shape === 0) {
    // "X got the most votes."
    const subject = stateTrue ? most : least;
    statement = `${survey.title}: ${subject.label} got the MOST votes.`;
    isActuallyTrue = subject.id === most.id;
  } else if (shape === 1) {
    // "X got the fewest votes."
    const subject = stateTrue ? least : most;
    statement = `${survey.title}: ${subject.label} got the FEWEST votes.`;
    isActuallyTrue = subject.id === least.id;
  } else {
    // "More chose A than B."
    const a = categories[0]!, b = categories[1]!;
    const [x, y] = stateTrue === a.count > b.count ? [a, b] : [b, a];
    statement = `${survey.title}: more chose ${x.label} than ${y.label}.`;
    isActuallyTrue = x.count > y.count;
  }
  return {
    kind: "statisticaGraph", mode: "claim", target, display, categories,
    prompt: `${statement} Is that true or false?`,
    speakText: "Read the graph, then decide: does the picture graph show that this is true, or false?",
    options: [{ id: "t", label: "True" }, { id: "f", label: "False" }],
    correctOptionIds: [isActuallyTrue ? "t" : "f"],
    feedback: { correct: "Right — you checked the graph to judge the statement.", wrong: "Read the columns again and check what the data really shows." },
  };
}


export function claimTask(round: number, target: number): PracticeTask {
  return makeClaimTask(round, target, "pictures");
}

export function objectClaimTask(round: number, target: number): PracticeTask {
  return makeClaimTask(round, target, "objects");
}

export function interpretTask(round: number, target: number): PracticeTask {
  const { survey, categories } = surveyCats(round + 4);
  const top = [...categories].sort((x, y) => y.count - x.count)[0]!;
  const options = order(categories.map((c) => ({ id: c.id, label: c.label })), round);
  return {
    kind: "statisticaGraph", mode: "read", target, display: "pictures", categories,
    prompt: `${survey.question} Which is the most popular answer?`,
    speakText: "Use the data as evidence. The most popular answer is the one with the tallest column.",
    options, correctOptionIds: [top.id],
    feedback: { correct: `Yes — the data shows ${top.label} is most popular.`, wrong: "The most popular answer has the most votes — the tallest column." },
  };
}

// ── Teaching cards (shown first) — one per skill so the opening matches the lesson.
// Graph lessons open by reading the tallest column; sort lessons open by grouping;
// tally lessons open by reading marks. The right teach card is chosen per lesson.
function teachGraphTask(round: number, target: number, display: "objects" | "pictures" | "columns" = "pictures"): PracticeTask {
  const { survey, categories } = surveyCats(round);
  const top = [...categories].sort((x, y) => y.count - x.count)[0]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display, categories,
    prompt: `Let's read the graph. ${survey.question} Which column is the tallest?`,
    speakText: `This is a one-to-one ${display === "objects" ? "object display" : "picture graph"}. Each ${display === "objects" ? "object" : "picture"} stands for one vote. The tallest column had the most votes. Tap it.`,
    options: order(categories.map((c) => ({ id: c.id, label: c.label })), round), correctOptionIds: [top.id],
    feedback: { correct: "That's the tallest column — the most votes.", wrong: "The tallest column is the one with the most pictures." },
  };
}

function teachSortTask(round: number, target: number): PracticeTask {
  // Use a different sort set from the activities so the teach card isn't a repeat.
  const set = pick(SORT_SETS, round + 2);
  const items = set.items.slice(0, 6).map((it, i) => ({ id: `i${i}`, label: it.label, category: it.category }));
  return {
    kind: "statisticaSort", target, prompt: `Let's start by sorting. ${set.prompt}`,
    speakText: "Data is information we collect. We can put it into groups called categories. Tap a card, then tap the group it belongs in.",
    items, categories: set.cats,
    feedback: { correct: "Nice — sorting data into categories is the first step.", wrong: "Each card belongs in just one group. Try again." },
  };
}

function teachTallyReadTask(round: number, target: number): PracticeTask {
  const count = tallyCountFor(round);
  return {
    kind: "statisticaTally", mode: "read", target, count, label: "votes",
    prompt: "Let's read a tally. How many marks are there?",
    speakText: "A tally uses one mark for each thing we count. Count the marks one at a time to read the total.",
    options: numOptions(count, round), correctOptionIds: [`n${count}`],
    feedback: { correct: "Yes — one mark for each, counted up.", wrong: "Count each mark one at a time." },
  };
}

function teachTallyRecordTask(round: number, target: number): PracticeTask {
  const count = tallyCountFor(round + 2);
  return {
    kind: "statisticaTally", mode: "record", target, count, label: "votes",
    prompt: `Let's make a tally. Add marks until there are ${count}.`,
    speakText: "To record data we make one tally mark for each thing we count. The fifth mark goes across the bundle. Add marks to match the number.",
    feedback: { correct: "Great — one mark for each, bundled in fives.", wrong: `Add or remove marks until there are ${count}.` },
  };
}

function teachCollectTask(round: number, target: number): PracticeTask {
  // A gentle collect (small survey) framed as the intro to gathering data.
  const base = makeCollectTask(round, target, "most");
  if (base.kind === "statisticaCollect") base.speakText = "Let's collect some data. Tap each picture to count it into its group, then read the counters to answer.";
  return base;
}

// Choose the teaching card that matches the lesson's lead skill (and mode).
function teachFor(gens: [Gen, Gen, Gen], seed: number, target: number): PracticeTask {
  const probe = gens[0](0, 0);
  if (probe.kind === "statisticaCollect") return teachCollectTask(seed, target);
  if (probe.kind === "statisticaSort") return teachSortTask(seed, target);
  if (probe.kind === "statisticaTally") {
    return probe.mode === "record" ? teachTallyRecordTask(seed, target) : teachTallyReadTask(seed, target);
  }
  if (probe.kind === "statisticaGraph") return teachGraphTask(seed, target, probe.display);
  if (["statisticaRank", "statisticaGap", "statisticaTapGraph", "statisticaTable"].includes(probe.kind)) {
    return gens[0](seed + 17, target);
  }
  return teachGraphTask(seed, target);
}

// ── Lesson content map (24 lessons) ─────────────────────────────────────────
type Gen = (round: number, target: number) => PracticeTask;
// `seed` shifts which survey / sort set each lesson pulls, so the same task type
// shows different subject matter from week to week (W1 fruit/pets vs W2 weather…).
function taskSet(gens: [Gen, Gen, Gen], seed: number): RealmLessonTaskSet {
  let t = 10;
  const rounds = [seed, seed + 1, seed + 2];
  return {
    teaching: () => teachFor(gens, seed, ++t),
    activities: [
      () => gens[0](rounds[0]++, ++t),
      () => gens[1](rounds[1]++, ++t),
      () => gens[2](rounds[2]++, ++t),
    ],
  };
}
const buildObjects: Gen = (r, t) => buildTask(r, t, "objects");
const buildPics: Gen = (r, t) => buildTask(r, t, "pictures");
const week6TapGraph: Gen = (r, t) => makeTapGraphTask(r, t, r % 3 === 0 ? "objects" : "pictures", WEEK_6_COUNTS);
const week6Rank: Gen = (r, t) => makeRankTask(r, t, WEEK_6_COUNTS);
const week6Gap: Gen = (r, t) => makeGapTask(r, t, WEEK_6_COUNTS);
const week6Compare: Gen = (r, t) => makeCompareTask(r, t, WEEK_6_COUNTS);
const week7TableFrequency: Gen = (r, t) => makeTableFrequencyTask(r, t, WEEK_7_COUNTS);
const week7TableSelect: Gen = (r, t) => makeTableSelectTask(r, t, WEEK_7_COUNTS);
const week7TapGraph: Gen = (r, t) => makeTapGraphTask(r, t, r % 3 === 0 ? "objects" : "pictures", WEEK_7_COUNTS);
const week7Frequency: Gen = (r, t) => makeFrequencyTask(r, t, "pictures", WEEK_7_COUNTS);
const week7Claim: Gen = (r, t) => makeClaimTask(r, t, "pictures", WEEK_7_COUNTS);
const week7Rank: Gen = (r, t) => makeRankTask(r, t, WEEK_7_COUNTS);

// Week 1 remains the shipped introduction. Weeks 2-8 deliberately mix three
// interaction families per lesson while preserving each week's curricular identity.
const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W1 What is Data? — meet data by COLLECTING and SORTING it (no tally/build yet).
  // l1 Data All Around Us: collect the data around us (the new gather mini-game).
  "y1-statistics-w1-l1": [collectTask, sortTask, collectTask],
  // l2 Sort Into Categories: pure sorting mastery across all three sort sets.
  "y1-statistics-w1-l2": [sortTask, sortTask, sortTask],
  // l3 What Does the Data Tell Us?: interpret — spot the most, judge a true/false
  // claim, and compare two categories.
  "y1-statistics-w1-l3": [readGraphTask, claimTask, compareTask],
  // W2 Question + categories + collection.
  "y1-statistics-w2-l1": [collectTask, sortTask, readGraphTask],
  "y1-statistics-w2-l2": [sortTaskHard, collectTask, tapGraphTask],
  "y1-statistics-w2-l3": [collectTask, sortTaskHard, tapGraphTask],
  // W3 List + tally + record.
  "y1-statistics-w3-l1": [tallyRecordTask, sortTask, tableFrequencyTask],
  "y1-statistics-w3-l2": [tallyRecordTask, tableFrequencyTask, tallyReadTask],
  "y1-statistics-w3-l3": [tallyReadTask, tableFrequencyTask, tapGraphTask],
  // W4 One-to-one OBJECT displays: construct, read an exact frequency, then
  // judge a claim from the finished display. Every object represents one vote.
  "y1-statistics-w4-l1": [buildObjects, tapObjectGraphTask, objectFrequencyTask],
  "y1-statistics-w4-l2": [objectFrequencyTask, buildObjects, tapObjectGraphTask],
  "y1-statistics-w4-l3": [tapObjectGraphTask, objectClaimTask, buildObjects],
  // W5 One-to-one PICTURE displays: translate the same data into pictures,
  // compare frequencies and use the graph as evidence. No many-to-one key.
  "y1-statistics-w5-l1": [frequencyTask, tapPictureGraphTask, readGraphTask],
  "y1-statistics-w5-l2": [buildPics, frequencyTask, tapPictureGraphTask],
  "y1-statistics-w5-l3": [compareTask, claimTask, readGraphTask],
  // W6 Rank + compare + count the difference gap.
  "y1-statistics-w6-l1": [week6TapGraph, week6Rank, week6Gap],
  "y1-statistics-w6-l2": [week6Rank, week6Gap, week6Compare],
  "y1-statistics-w6-l3": [week6Gap, week6Rank, week6TapGraph],
  // W7 Table + graph + interpretation.
  "y1-statistics-w7-l1": [week7TableFrequency, week7TapGraph, week7Frequency],
  "y1-statistics-w7-l2": [week7TableSelect, week7Claim, week7TapGraph],
  "y1-statistics-w7-l3": [week7TableSelect, week7Rank, week7Claim],
  // W8 cumulative investigation: collect -> represent -> interpret.
  "y1-statistics-w8-l1": [collectTask, sortTask, tallyRecordTask],
  "y1-statistics-w8-l2": [buildPics, tableFrequencyTask, tapGraphTask],
  "y1-statistics-w8-l3": [rankTask, gapTask, claimTask],
};

export function getStatisticaLevel1TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const gens = LESSON_GENS[lessonId];
  if (!gens) return null;
  const m = /-w(\d+)-l(\d+)$/.exec(lessonId);
  const week = m ? Number(m[1]) : 1;
  const lesson = m ? Number(m[2]) : 1;
  // Spread topics across weeks/lessons so the same task type varies its subject.
  const seed = (week - 1) * 2 + (lesson - 1);
  return taskSet(gens, seed);
}

export const STATISTICA_LEVEL1_LESSON_IDS = Object.keys(LESSON_GENS);
