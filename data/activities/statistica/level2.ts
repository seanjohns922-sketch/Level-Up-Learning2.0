import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

// ── Statistica Level 2 (Year 2) — AC9M2ST01 (acquire, sort, record; lists,
// tables, picture graphs) + AC9M2ST02 (create/compare picture AND column graphs,
// interpret). Self-contained on FOUR-category surveys with larger frequencies so
// every lesson is a genuine step up from the Year 1 (3-category) level, and adds
// column/bar graphs + tables as the defining Year 2 representations.

type Cat = { id: string; label: string; color: string };
type CatN = Cat & { count: number };
type Gen = (round: number, target: number) => PracticeTask;

const C = { red: "#ef4444", amber: "#f59e0b", orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", pink: "#ec4899" };
const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(arr: T[], round: number) => (round % 2 ? [...arr].reverse() : arr);
function numOptions(correct: number, round: number) {
  const set = new Set<number>([correct]);
  let d = 1;
  while (set.size < 3) { set.add(Math.max(1, correct + (d % 2 ? d : -d))); d += 1; }
  return order([...set].map((n) => ({ id: `n${n}`, label: String(n) })), round);
}

// Four-category surveys (labels chosen so DataIcon draws them in collect / picture graphs).
type Survey = { id: string; question: string; cats: Cat[] };
const L2_SURVEYS: Survey[] = [
  { id: "pet", question: "Which pet do children keep?", cats: [{ id: "dog", label: "Dog", color: C.orange }, { id: "cat", label: "Cat", color: C.purple }, { id: "fish", label: "Fish", color: C.blue }, { id: "rabbit", label: "Rabbit", color: C.pink }] },
  { id: "fruit", question: "Which fruit did the class choose?", cats: [{ id: "apple", label: "Apple", color: C.red }, { id: "banana", label: "Banana", color: C.amber }, { id: "orange", label: "Orange", color: C.orange }, { id: "grapes", label: "Grapes", color: C.purple }] },
  { id: "zoo", question: "Which zoo animal is the favourite?", cats: [{ id: "lion", label: "Lion", color: C.amber }, { id: "zebra", label: "Zebra", color: C.teal }, { id: "tiger", label: "Tiger", color: C.orange }, { id: "rabbit", label: "Rabbit", color: C.pink }] },
  { id: "snack", question: "Which snack is most popular?", cats: [{ id: "apple", label: "Apple", color: C.red }, { id: "cheese", label: "Cheese", color: C.amber }, { id: "egg", label: "Egg", color: C.orange }, { id: "bread", label: "Bread", color: C.green }] },
  { id: "toy", question: "Which toy do children like best?", cats: [{ id: "ball", label: "Ball", color: C.red }, { id: "kite", label: "Kite", color: C.purple }, { id: "teddy", label: "Teddy", color: C.orange }, { id: "blocks", label: "Blocks", color: C.blue }] },
];

// Four-group sorting sets (12 items each) — harder than Year 1's 3 groups.
type SortSet = { id: string; prompt: string; cats: Cat[]; items: Array<{ label: string; category: string }> };
const L2_SORT_SETS: SortSet[] = [
  { id: "things", prompt: "Sort each thing into its group.", cats: [{ id: "fruit", label: "Fruit", color: C.red }, { id: "animal", label: "Animals", color: C.orange }, { id: "toy", label: "Toys", color: C.purple }, { id: "food", label: "Food", color: C.amber }],
    items: [{ label: "Apple", category: "fruit" }, { label: "Dog", category: "animal" }, { label: "Ball", category: "toy" }, { label: "Bread", category: "food" }, { label: "Banana", category: "fruit" }, { label: "Cat", category: "animal" }, { label: "Kite", category: "toy" }, { label: "Cheese", category: "food" }, { label: "Grapes", category: "fruit" }, { label: "Fish", category: "animal" }, { label: "Teddy", category: "toy" }, { label: "Egg", category: "food" }] },
  { id: "day", prompt: "Sort each one into its group.", cats: [{ id: "weather", label: "Weather", color: C.amber }, { id: "travel", label: "Travel", color: C.green }, { id: "sport", label: "Sport", color: C.blue }, { id: "clothes", label: "Clothes", color: C.teal }],
    items: [{ label: "Sunny", category: "weather" }, { label: "Car", category: "travel" }, { label: "Soccer", category: "sport" }, { label: "Hat", category: "clothes" }, { label: "Cloudy", category: "weather" }, { label: "Bus", category: "travel" }, { label: "Swimming", category: "sport" }, { label: "Sock", category: "clothes" }, { label: "Rainy", category: "weather" }, { label: "Walk", category: "travel" }, { label: "Running", category: "sport" }, { label: "Shoe", category: "clothes" }] },
  { id: "kitchen", prompt: "Sort each one: fruit, vegetable, drink or food?", cats: [{ id: "fruit", label: "Fruit", color: C.red }, { id: "veg", label: "Vegetable", color: C.green }, { id: "drink", label: "Drink", color: C.blue }, { id: "food", label: "Food", color: C.amber }],
    items: [{ label: "Apple", category: "fruit" }, { label: "Carrot", category: "veg" }, { label: "Milk", category: "drink" }, { label: "Bread", category: "food" }, { label: "Orange", category: "fruit" }, { label: "Peas", category: "veg" }, { label: "Juice", category: "drink" }, { label: "Cheese", category: "food" }, { label: "Pear", category: "fruit" }, { label: "Corn", category: "veg" }, { label: "Water", category: "drink" }, { label: "Egg", category: "food" }] },
];

// Frequency pools — four distinct values with a clear tallest/shortest. Reads use
// the larger pool (up to 12); builds use a smaller pool so there aren't too many taps.
const READ_COUNTS = [[8, 5, 10, 3], [6, 11, 4, 9], [10, 7, 5, 12], [5, 9, 12, 7], [11, 6, 9, 4], [7, 12, 8, 5]];
const BUILD_COUNTS = [[4, 2, 6, 3], [3, 6, 2, 5], [6, 3, 7, 4], [2, 7, 4, 5], [7, 4, 3, 2], [3, 7, 5, 4]];

function cats(round: number, opts: { forceTie?: boolean; build?: boolean } = {}): { survey: Survey; categories: CatN[] } {
  const survey = pick(L2_SURVEYS, round);
  const counts = [...pick(opts.build ? BUILD_COUNTS : READ_COUNTS, round)];
  if (opts.forceTie) counts[1] = counts[0];
  return { survey, categories: survey.cats.map((c, i) => ({ ...c, count: counts[i]! })) };
}
const bare = (categories: CatN[]): Cat[] => categories.map(({ id, label, color }) => ({ id, label, color }));

// ── Generators (all four-category / Year 2 sized) ────────────────────────────
export function l2CollectTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round, { build: true });
  const items = categories.flatMap((c, ci) => Array.from({ length: c.count }, (_, k) => ({ id: `c${ci}_${k}`, label: c.label, category: c.id })));
  const ask = round % 2 ? "fewest" : "most";
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const answer = ask === "most" ? sorted[0]! : sorted[sorted.length - 1]!;
  return {
    kind: "statisticaCollect", target, prompt: `Collect the data — tap each one to count it. ${survey.question}`,
    speakText: "Gather every answer into its group across the four counters, then read the counters.",
    items, categories: bare(categories),
    question: ask === "most" ? "Which did you count the MOST of?" : "Which did you count the FEWEST of?",
    correctOptionIds: [answer.id],
    feedback: { correct: `Yes — the ${ask} was ${answer.label}.`, wrong: `Look at the four counters — which number is the ${ask === "most" ? "biggest" : "smallest"}?` },
  };
}

export function l2SortTask(round: number, target: number): PracticeTask {
  const set = pick(L2_SORT_SETS, round);
  const n = set.items.length;
  // Rotate the tray order by round so repeated visits shuffle the cards.
  const items = Array.from({ length: n }, (_, i) => set.items[(i + round) % n]!).map((it, i) => ({ id: `i${i}`, label: it.label, category: it.category }));
  return {
    kind: "statisticaSort", target, prompt: `${set.prompt} There are 12 to sort into 4 groups.`,
    speakText: "Year 2 data has more groups. Tap a card, then tap the group it belongs in.",
    items, categories: set.cats,
    feedback: { correct: "Sorted! Every card is in the right group.", wrong: "The cards marked with a red cross are in the wrong group — move each one to where it belongs." },
  };
}

export function l2TallyRecordTask(round: number, target: number): PracticeTask {
  const count = 8 + (round % 8); // 8..15
  const { survey } = cats(round);
  const cat = pick(survey.cats, round + 1);
  return {
    kind: "statisticaTally", mode: "record", target, count, label: cat.label.toLowerCase(),
    prompt: `Make a tally to record ${count} for "${cat.label}".`,
    speakText: "Record the count with tally marks. Every fifth mark goes across the bundle.",
    feedback: { correct: "Great tally — the marks bundle in fives.", wrong: `Add or remove marks until there are ${count}.` },
  };
}

export function l2TallyReadTask(round: number, target: number): PracticeTask {
  const count = 11 + (round % 9); // 11..19
  return {
    kind: "statisticaTally", mode: "read", target, count, label: "votes",
    prompt: "How many does this tally show?",
    speakText: "Count the bundles of five, then add on the extra marks.",
    options: numOptions(count, round), correctOptionIds: [`n${count}`],
    feedback: { correct: "Right — count the fives, then the extras.", wrong: "Count each bundle as five, then add the leftover marks." },
  };
}

export function l2TapPictureGraphTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round);
  const ask = round % 2 ? "fewest" : "most";
  const sorted = [...categories].sort((a, b) => ask === "most" ? b.count - a.count : a.count - b.count);
  return {
    kind: "statisticaTapGraph", target, ask, display: "pictures", categories,
    correctCategoryId: sorted[0]!.id,
    prompt: ask === "most" ? "Tap the tallest column." : "Tap the shortest column.",
    speakText: `${survey.question} Tap the ${ask === "most" ? "tallest" : "shortest"} column on the picture graph.`,
    feedback: { correct: `Yes — ${sorted[0]!.label}.`, wrong: `Find the ${ask === "most" ? "tallest" : "shortest"} column and tap it.` },
  };
}

export function l2ReadGraphTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round + 1);
  const askMost = round % 2 === 0;
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const answer = askMost ? sorted[0]! : sorted[sorted.length - 1]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "pictures", categories,
    prompt: askMost ? "Which had the MOST votes?" : "Which had the FEWEST votes?",
    speakText: `${survey.question} Read the picture graph and find the ${askMost ? "tallest" : "shortest"} column.`,
    options: order(categories.map((c) => ({ id: c.id, label: c.label })), round), correctOptionIds: [answer.id],
    feedback: { correct: `Yes — ${answer.label}.`, wrong: `Compare all four columns and find the ${askMost ? "tallest" : "shortest"}.` },
  };
}

export function l2FrequencyTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round + 2);
  const cat = pick(categories, round);
  return {
    kind: "statisticaGraph", mode: "read", target, display: "pictures", categories,
    prompt: `How many chose ${cat.label}?`,
    speakText: `${survey.question} Count the pictures in the ${cat.label} column.`,
    options: numOptions(cat.count, round), correctOptionIds: [`n${cat.count}`],
    feedback: { correct: `Right — ${cat.count} chose ${cat.label}.`, wrong: `Count the pictures in the ${cat.label} column.` },
  };
}

export function l2CompareTask(round: number, target: number): PracticeTask {
  const forceTie = round % 3 === 2;
  const { survey, categories } = cats(round + 2, { forceTie });
  const a = categories[0]!, b = categories[1]!;
  const correct = a.count > b.count ? "a" : a.count < b.count ? "b" : "eq";
  return {
    kind: "statisticaGraph", mode: "compare", target, display: "pictures", categories,
    prompt: `Compare ${a.label} and ${b.label}. What does the data show?`,
    speakText: `${survey.question} Compare the ${a.label} and ${b.label} columns.`,
    options: order([{ id: "a", label: `More chose ${a.label}` }, { id: "b", label: `More chose ${b.label}` }, { id: "eq", label: "They are equal" }], round),
    correctOptionIds: [correct],
    feedback: { correct: "Correct — the taller column has more.", wrong: "Line the two columns up and compare their heights." },
  };
}

export function l2ClaimTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round + 1);
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const most = sorted[0]!, least = sorted[sorted.length - 1]!;
  const stateTrue = round % 2 === 0;
  const subject = stateTrue ? most : least;
  const isTrue = subject.id === most.id;
  return {
    kind: "statisticaGraph", mode: "claim", target, display: "pictures", categories,
    prompt: `${subject.label} had the most votes. Is that true or false?`,
    speakText: `${survey.question} Look at the four columns and decide if the statement is true.`,
    options: [{ id: "t", label: "True" }, { id: "f", label: "False" }], correctOptionIds: [isTrue ? "t" : "f"],
    feedback: { correct: "Right — you checked the columns.", wrong: "Compare the column heights again." },
  };
}

export function l2RankTask(round: number, target: number): PracticeTask {
  // Rank three of the four categories (distinct counts) most-to-least / least-to-most.
  const { survey, categories } = cats(round);
  const three = categories.slice(0, 3);
  const direction = round % 2 ? "least-to-most" : "most-to-least";
  const ordered = [...three].sort((a, b) => direction === "most-to-least" ? b.count - a.count : a.count - b.count);
  return {
    kind: "statisticaRank", target, direction, categories: three, correctOrderIds: ordered.map((c) => c.id),
    prompt: direction === "most-to-least" ? "Put them in order from MOST to LEAST." : "Put them in order from LEAST to MOST.",
    speakText: `${survey.question} Tap the columns in order, ${direction === "most-to-least" ? "tallest first" : "shortest first"}.`,
    feedback: { correct: "Perfect order — you ranked them by frequency.", wrong: "Compare the heights and order them again." },
  };
}

export function l2GapTask(round: number, target: number): PracticeTask {
  // The first two categories always have distinct counts (see READ_COUNTS).
  const { survey, categories } = cats(round + 3);
  const two = [categories[0]!, categories[1]!];
  const larger = two[0].count > two[1].count ? two[0] : two[1];
  const difference = Math.abs(two[0].count - two[1].count);
  return {
    kind: "statisticaGap", target, categories: two, largerCategoryId: larger.id, difference,
    prompt: `How many MORE chose ${larger.label}?`,
    speakText: `${survey.question} Count how many more ${larger.label} has than the other column.`,
    feedback: { correct: "Yes — that's the difference between the two columns.", wrong: "Count the extra squares the taller column has." },
  };
}

export function l2TableFrequencyTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round + 2);
  const row = pick(categories, round);
  return {
    kind: "statisticaTable", mode: "count", target, rows: categories,
    prompt: `Read the table. How many chose ${row.label}?`,
    speakText: `${survey.question} Find the ${row.label} row and read its number.`,
    answerCount: row.count,
    feedback: { correct: `Right — the table shows ${row.count} for ${row.label}.`, wrong: `Find the ${row.label} row and read across to its number.` },
  };
}

export function l2TableSelectTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round + 1);
  const askMost = round % 2 === 0;
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const answer = askMost ? sorted[0]! : sorted[sorted.length - 1]!;
  return {
    kind: "statisticaTable", mode: "select", target, rows: categories, correctRowId: answer.id,
    prompt: askMost ? "Which row has the MOST?" : "Which row has the FEWEST?",
    speakText: `${survey.question} Read the table and choose the row with the ${askMost ? "biggest" : "smallest"} number.`,
    feedback: { correct: `Yes — ${answer.label} has the ${askMost ? "most" : "fewest"}.`, wrong: "Compare the numbers in each row." },
  };
}

export function l2BuildPicsTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round, { build: true });
  return {
    kind: "statisticaGraph", mode: "build", target, display: "pictures", categories,
    prompt: "Build the picture graph — one picture for each vote.",
    speakText: `${survey.question} Add one picture per vote so each column matches its number.`,
    feedback: { correct: "Your picture graph matches the data exactly.", wrong: "Check each column — one picture stands for one vote." },
  };
}

// ── Column-graph generators (the defining Year 2 representation) ──────────────
export function buildColumnsTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round, { build: true });
  return {
    kind: "statisticaGraph", mode: "build", target, display: "columns", categories,
    prompt: "Build the column graph — make each bar reach its number.",
    speakText: `${survey.question} Use plus and minus to make each column the right height.`,
    feedback: { correct: "Your column graph matches the data.", wrong: "Check each bar against the scale on the side." },
  };
}
export function readColumnsTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round + 1);
  const askMost = round % 2 === 0;
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const answer = askMost ? sorted[0]! : sorted[sorted.length - 1]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: askMost ? "Which column is the TALLEST?" : "Which column is the SHORTEST?",
    speakText: `${survey.question} Read the column graph and find the ${askMost ? "tallest" : "shortest"} bar.`,
    options: order(categories.map((c) => ({ id: c.id, label: c.label })), round), correctOptionIds: [answer.id],
    feedback: { correct: `Yes — ${answer.label} is the ${askMost ? "tallest" : "shortest"}.`, wrong: "Compare the heights of the bars." },
  };
}
export function columnFrequencyTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round + 2);
  const cat = pick(categories, round);
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: `How many chose ${cat.label}?`,
    speakText: `${survey.question} Read up the ${cat.label} column to the scale.`,
    options: numOptions(cat.count, round), correctOptionIds: [`n${cat.count}`],
    feedback: { correct: `Right — ${cat.count} chose ${cat.label}.`, wrong: `Follow the ${cat.label} bar across to the numbers.` },
  };
}
export function compareColumnsTask(round: number, target: number): PracticeTask {
  const forceTie = round % 3 === 2;
  const { survey, categories } = cats(round + 2, { forceTie });
  const a = categories[0]!, b = categories[1]!;
  const correct = a.count > b.count ? "a" : a.count < b.count ? "b" : "eq";
  return {
    kind: "statisticaGraph", mode: "compare", target, display: "columns", categories,
    prompt: `Compare ${a.label} and ${b.label}.`,
    speakText: `${survey.question} Which column is taller, or are they equal?`,
    options: order([{ id: "a", label: `More chose ${a.label}` }, { id: "b", label: `More chose ${b.label}` }, { id: "eq", label: "They are equal" }], round),
    correctOptionIds: [correct],
    feedback: { correct: "Correct — the taller bar has more.", wrong: "Line the two bars up and compare their heights." },
  };
}
export function columnClaimTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round + 1);
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const most = sorted[0]!, least = sorted[sorted.length - 1]!;
  const stateTrue = round % 2 === 0;
  const subject = stateTrue ? most : least;
  const isTrue = subject.id === most.id;
  return {
    kind: "statisticaGraph", mode: "claim", target, display: "columns", categories,
    prompt: `${subject.label} has the tallest column. Is that true or false?`,
    speakText: `${survey.question} Look at the bars and decide if the statement is true.`,
    options: [{ id: "t", label: "True" }, { id: "f", label: "False" }], correctOptionIds: [isTrue ? "t" : "f"],
    feedback: { correct: "Right — you checked the bars.", wrong: "Compare the bar heights again." },
  };
}
export function sameDataDisplayTask(round: number, target: number): PracticeTask {
  const { survey, categories } = cats(round + 3);
  const top = [...categories].sort((a, b) => b.count - a.count)[0]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: "A picture graph and this column graph show the SAME data. Which had the MOST?",
    speakText: `${survey.question} Different displays can show the same data — read the column graph to find the most.`,
    options: order(categories.map((c) => ({ id: c.id, label: c.label })), round), correctOptionIds: [top.id],
    feedback: { correct: `Yes — ${top.label}. Both displays give the same answer.`, wrong: "Find the tallest bar." },
  };
}

// ── Lesson map (18 lessons, 6 weeks) — Year 2 signatures ─────────────────────
// W1 questions/categories · W2 tables · W3 picture & column graphs ·
// W4 different displays · W5 interpret · W6 investigation.
const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W1 Questions & Categories
  "y2-statistics-w1-l1": [l2CollectTask, l2SortTask, l2TapPictureGraphTask],
  "y2-statistics-w1-l2": [l2SortTask, l2CollectTask, l2TableSelectTask],
  "y2-statistics-w1-l3": [l2SortTask, l2TapPictureGraphTask, l2CollectTask],
  // W2 Recording Data — TABLES
  "y2-statistics-w2-l1": [l2SortTask, l2TallyRecordTask, l2TableFrequencyTask],
  "y2-statistics-w2-l2": [l2TableFrequencyTask, l2TableSelectTask, l2TableFrequencyTask],
  "y2-statistics-w2-l3": [l2TableSelectTask, l2TableFrequencyTask, l2FrequencyTask],
  // W3 Picture & Column Graphs — build both, read both
  "y2-statistics-w3-l1": [l2BuildPicsTask, l2TapPictureGraphTask, l2BuildPicsTask],
  "y2-statistics-w3-l2": [buildColumnsTask, readColumnsTask, buildColumnsTask],
  "y2-statistics-w3-l3": [readColumnsTask, columnFrequencyTask, l2TapPictureGraphTask],
  // W4 Different Displays — same data as picture vs column, which works best
  "y2-statistics-w4-l1": [buildColumnsTask, l2BuildPicsTask, readColumnsTask],
  "y2-statistics-w4-l2": [sameDataDisplayTask, compareColumnsTask, columnClaimTask],
  "y2-statistics-w4-l3": [sameDataDisplayTask, l2RankTask, columnClaimTask],
  // W5 Interpreting Displays — most/least, compare, conclude
  "y2-statistics-w5-l1": [l2RankTask, l2TapPictureGraphTask, columnFrequencyTask],
  "y2-statistics-w5-l2": [l2GapTask, l2CompareTask, compareColumnsTask],
  "y2-statistics-w5-l3": [l2ClaimTask, l2RankTask, l2ReadGraphTask],
  // W6 Statistical Investigation — collect -> display -> compare & report
  "y2-statistics-w6-l1": [l2CollectTask, l2TallyRecordTask, l2TableFrequencyTask],
  "y2-statistics-w6-l2": [l2BuildPicsTask, buildColumnsTask, l2TapPictureGraphTask],
  "y2-statistics-w6-l3": [compareColumnsTask, l2RankTask, l2ClaimTask],
};

function taskSet(gens: [Gen, Gen, Gen], seed: number): RealmLessonTaskSet {
  let t = 10;
  const rounds = [seed, seed + 1, seed + 2];
  return {
    teaching: () => gens[0](seed, ++t),
    activities: [
      () => gens[0](rounds[0]++, ++t),
      () => gens[1](rounds[1]++, ++t),
      () => gens[2](rounds[2]++, ++t),
    ],
  };
}

export function getStatisticaLevel2TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const gens = LESSON_GENS[lessonId];
  if (!gens) return null;
  const m = /-w(\d+)-l(\d+)$/.exec(lessonId);
  const week = m ? Number(m[1]) : 1;
  const lesson = m ? Number(m[2]) : 1;
  const seed = (week - 1) * 2 + (lesson - 1);
  return taskSet(gens, seed);
}

export const STATISTICA_LEVEL2_LESSON_IDS = Object.keys(LESSON_GENS);
