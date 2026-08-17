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
];

const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);

// Three small, mostly-distinct counts (2..6) for a survey's categories.
function countsFor(round: number, forceTie = false): number[] {
  const base = [
    [4, 2, 5], [3, 5, 2], [5, 3, 4], [2, 6, 3], [6, 4, 2], [3, 4, 6],
  ];
  const c = [...pick(base, round)];
  if (forceTie) c[1] = c[0]; // make first two equal for "equal" questions
  return c;
}

const numOptions = (correct: number, round: number) => {
  const set = new Set<number>([correct]);
  let d = 1;
  while (set.size < 3) { set.add(Math.max(1, correct + (d % 2 ? d : -d))); d += 1; }
  return order([...set].map((n) => ({ id: `n${n}`, label: String(n) })), round);
};

// ── Task generators ─────────────────────────────────────────────────────────
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
  const count = countsFor(round)[0]!;
  return {
    kind: "statisticaTally", mode: "record", target, count, label: cat.label.toLowerCase(),
    prompt: `Make a tally to record ${count} for "${cat.label}".`,
    speakText: "A tally records data with marks. Every fifth mark goes across the bundle so the marks are easy to count in fives.",
    feedback: { correct: "Great tally — you recorded the data.", wrong: `Add or remove marks until there are ${count}.` },
  };
}

export function tallyReadTask(round: number, target: number): PracticeTask {
  const count = countsFor(round + 2)[1]! + 3; // 5..9 so a bundle shows
  return {
    kind: "statisticaTally", mode: "read", target, count, label: "votes",
    prompt: "How many does this tally show?",
    speakText: "Count the tally in fives, then add on the extra marks.",
    options: numOptions(count, round), correctOptionIds: [`n${count}`],
    feedback: { correct: "Right — count the fives, then the extras.", wrong: "Count each bundle as five, then add the leftover marks." },
  };
}

function surveyCats(round: number, forceTie = false) {
  const survey = pick(SURVEYS, round);
  const counts = countsFor(round, forceTie);
  const categories = survey.cats.map((c, i) => ({ ...c, count: counts[i]! }));
  return { survey, categories };
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

export function readGraphTask(round: number, target: number): PracticeTask {
  const { survey, categories } = surveyCats(round + 1);
  const askMost = round % 2 === 0;
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const answer = askMost ? sorted[0]! : sorted[sorted.length - 1]!;
  const options = order(categories.map((c) => ({ id: c.id, label: c.label })), round);
  return {
    kind: "statisticaGraph", mode: "read", target, display: "pictures", categories,
    prompt: askMost ? "Which had the MOST votes?" : "Which had the FEWEST votes?",
    speakText: `${survey.question} Read the picture graph and find the ${askMost ? "tallest" : "shortest"} column.`,
    options, correctOptionIds: [answer.id],
    feedback: { correct: `Yes — ${answer.label} is the ${askMost ? "tallest" : "shortest"}.`, wrong: `Compare the columns and find the ${askMost ? "tallest" : "shortest"} one.` },
  };
}

export function frequencyTask(round: number, target: number): PracticeTask {
  const { survey, categories } = surveyCats(round + 3);
  const cat = pick(categories, round);
  return {
    kind: "statisticaGraph", mode: "read", target, display: "pictures", categories,
    prompt: `How many chose ${cat.label}?`,
    speakText: `${survey.question} Count the pictures in the ${cat.label} column.`,
    options: numOptions(cat.count, round), correctOptionIds: [`n${cat.count}`],
    feedback: { correct: `Right — ${cat.count} chose ${cat.label}.`, wrong: `Count the pictures in the ${cat.label} column.` },
  };
}

export function compareTask(round: number, target: number): PracticeTask {
  const forceTie = round % 3 === 2;
  const { survey, categories } = surveyCats(round + 2, forceTie);
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

// Judge whether a statement about the data is TRUE or FALSE — active reasoning,
// not just spotting the tallest column. The statement is generated from the real
// counts and flipped on some rounds so the answer isn't always the same.
export function claimTask(round: number, target: number): PracticeTask {
  const { survey, categories } = surveyCats(round + 1);
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
    kind: "statisticaGraph", mode: "claim", target, display: "pictures", categories,
    prompt: `${statement} Is that true or false?`,
    speakText: "Read the graph, then decide: does the picture graph show that this is true, or false?",
    options: [{ id: "t", label: "True" }, { id: "f", label: "False" }],
    correctOptionIds: [isActuallyTrue ? "t" : "f"],
    feedback: { correct: "Right — you checked the graph to judge the statement.", wrong: "Read the columns again and check what the data really shows." },
  };
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
function teachGraphTask(round: number, target: number): PracticeTask {
  const { survey, categories } = surveyCats(round);
  const top = [...categories].sort((x, y) => y.count - x.count)[0]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "pictures", categories,
    prompt: `Let's read the graph. ${survey.question} Which column is the tallest?`,
    speakText: "This is a picture graph. Each picture stands for one vote. The tallest column had the most votes — tap it.",
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
  const count = 3 + (round % 3); // 3..5 marks
  return {
    kind: "statisticaTally", mode: "read", target, count, label: "votes",
    prompt: "Let's read a tally. How many marks are there?",
    speakText: "A tally uses one mark for each thing we count. Count the marks one at a time to read the total.",
    options: numOptions(count, round), correctOptionIds: [`n${count}`],
    feedback: { correct: "Yes — one mark for each, counted up.", wrong: "Count each mark one at a time." },
  };
}

function teachTallyRecordTask(round: number, target: number): PracticeTask {
  const count = 3 + (round % 3); // 3..5 marks
  return {
    kind: "statisticaTally", mode: "record", target, count, label: "votes",
    prompt: `Let's make a tally. Add marks until there are ${count}.`,
    speakText: "To record data we make one tally mark for each thing we count. The fifth mark goes across the bundle. Add marks to match the number.",
    feedback: { correct: "Great — one mark for each, bundled in fives.", wrong: `Add or remove marks until there are ${count}.` },
  };
}

// Choose the teaching card that matches the lesson's lead skill (and mode).
function teachFor(gens: [Gen, Gen, Gen], seed: number, target: number): PracticeTask {
  const probe = gens[0](0, 0);
  if (probe.kind === "statisticaSort") return teachSortTask(seed, target);
  if (probe.kind === "statisticaTally") {
    return probe.mode === "record" ? teachTallyRecordTask(seed, target) : teachTallyReadTask(seed, target);
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

const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W1 What is Data? — vary the interaction from the very first lesson so kids
  // record, sort AND read within week one (not the same card twice).
  // l1 Data All Around Us: count/record the data around us (tally-led).
  "y1-statistics-w1-l1": [tallyRecordTask, sortTask, tallyReadTask],
  // l2 Sort Into Categories: pure sorting mastery across all three sort sets.
  "y1-statistics-w1-l2": [sortTask, sortTask, sortTask],
  // l3 What Does the Data Tell Us?: three DIFFERENT interpretations — spot the most,
  // judge a true/false claim, and compare two categories (not three passive reads).
  "y1-statistics-w1-l3": [readGraphTask, claimTask, compareTask],
  // W2 Asking Questions — introduces BUILDING a display early: l1 builds a display
  // to answer a question, l2 sorts categories, l3 collects answers with tallies.
  "y1-statistics-w2-l1": [buildObjects, readGraphTask, buildObjects],
  // l2 Choose the Categories: harder 10-card sort (a step up from W1's 6-card sort).
  "y1-statistics-w2-l2": [sortTaskHard, sortTaskHard, sortTaskHard],
  // l3 Collect the Answers: distinct from W1-l1's basic tally lesson — read the
  // collected tally, record more, then BUILD a display to represent the answers
  // (teach card is read, not record; adds the represent step).
  "y1-statistics-w2-l3": [tallyReadTask, tallyRecordTask, buildObjects],
  // W3 Recording Data — l1 Lists: make a list (sort) then record it; l2 pure recording;
  // l3 reading tallies.
  "y1-statistics-w3-l1": [sortTask, tallyRecordTask, tallyReadTask],
  "y1-statistics-w3-l2": [tallyRecordTask, tallyRecordTask, tallyRecordTask],
  "y1-statistics-w3-l3": [tallyReadTask, tallyReadTask, frequencyTask],
  // W4 One-to-One Displays (concrete objects) — l1 build & count what you built,
  // l2 pure building, l3 reading the object display.
  "y1-statistics-w4-l1": [buildObjects, frequencyTask, buildObjects],
  "y1-statistics-w4-l2": [buildObjects, buildObjects, buildObjects],
  "y1-statistics-w4-l3": [readGraphTask, frequencyTask, compareTask],
  // W5 Picture Graphs (pictures / digital)
  "y1-statistics-w5-l1": [readGraphTask, frequencyTask, readGraphTask],
  "y1-statistics-w5-l2": [buildPics, buildPics, buildPics],
  "y1-statistics-w5-l3": [readGraphTask, frequencyTask, compareTask],
  // W6 Comparing Frequencies
  "y1-statistics-w6-l1": [readGraphTask, readGraphTask, frequencyTask],
  "y1-statistics-w6-l2": [compareTask, compareTask, compareTask],
  "y1-statistics-w6-l3": [compareTask, readGraphTask, compareTask],
  // W7 Interpreting Data
  "y1-statistics-w7-l1": [frequencyTask, frequencyTask, compareTask],
  "y1-statistics-w7-l2": [interpretTask, readGraphTask, interpretTask],
  "y1-statistics-w7-l3": [interpretTask, compareTask, interpretTask],
  // W8 Mini Investigation
  "y1-statistics-w8-l1": [sortTask, tallyRecordTask, tallyReadTask],
  "y1-statistics-w8-l2": [buildPics, buildObjects, buildPics],
  "y1-statistics-w8-l3": [readGraphTask, compareTask, interpretTask],
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
