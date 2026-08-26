import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

// ── Statistica Level 3 (Year 3) — AC9M3ST01 (categorical AND discrete NUMERICAL
// data; frequency tables) + AC9M3ST02 (create/compare graphs, interpret) +
// AC9M3ST03 (guided investigation). Year 3 assumes the Year 1-2 basics, so this
// level drops collecting/sorting and leads with its genuinely new content:
// classifying data type, discrete NUMERICAL distributions, frequency tables and
// drawing conclusions (inference). Self-contained with its own Year-3 themes.

type Cat = { id: string; label: string; color: string };
type CatN = Cat & { count: number };
type Gen = (round: number, target: number) => PracticeTask;

const C = { red: "#ef4444", amber: "#f59e0b", orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", pink: "#ec4899", indigo: "#6366f1" };
const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(arr: T[], round: number) => (round % 2 ? [...arr].reverse() : arr);
function numOptions(correct: number, round: number, spread = 1) {
  const set = new Set<number>([correct]);
  let d = 1;
  while (set.size < 3) { set.add(Math.max(1, correct + (d % 2 ? d : -d) * spread)); d += 1; }
  return order([...set].map((n) => ({ id: `n${n}`, label: String(n) })), round);
}

// ── Categorical data (5 categories, Year-3 themes, larger counts) ────────────
type CatSurvey = { id: string; q: string; unit: string; cats: Cat[] };
const CAT_SURVEYS: CatSurvey[] = [
  { id: "lunch", q: "What did the class order for lunch?", unit: "students", cats: [{ id: "pizza", label: "Pizza", color: C.red }, { id: "pasta", label: "Pasta", color: C.amber }, { id: "salad", label: "Salad", color: C.green }, { id: "wrap", label: "Wrap", color: C.teal }, { id: "sushi", label: "Sushi", color: C.purple }] },
  { id: "travel", q: "How do students travel to school?", unit: "students", cats: [{ id: "car", label: "Car", color: C.red }, { id: "bus", label: "Bus", color: C.amber }, { id: "bike", label: "Bike", color: C.green }, { id: "walk", label: "Walk", color: C.blue }, { id: "train", label: "Train", color: C.purple }] },
  { id: "music", q: "What is the class's favourite music?", unit: "students", cats: [{ id: "pop", label: "Pop", color: C.pink }, { id: "rock", label: "Rock", color: C.red }, { id: "hiphop", label: "Hip-hop", color: C.indigo }, { id: "country", label: "Country", color: C.amber }, { id: "jazz", label: "Jazz", color: C.teal }] },
  { id: "weekend", q: "Favourite weekend activity?", unit: "students", cats: [{ id: "sport", label: "Sport", color: C.green }, { id: "reading", label: "Reading", color: C.blue }, { id: "gaming", label: "Gaming", color: C.purple }, { id: "art", label: "Art", color: C.pink }, { id: "cooking", label: "Cooking", color: C.orange }] },
];
const CAT_COUNTS = [[8, 12, 5, 10, 7], [11, 6, 14, 9, 4], [7, 13, 10, 5, 12], [15, 8, 11, 6, 9], [10, 14, 7, 12, 5], [6, 9, 13, 8, 11]];
const CAT_COUNTS_SMALL = [[4, 6, 3, 5, 2], [6, 3, 7, 4, 2], [3, 7, 5, 2, 6], [7, 4, 6, 3, 5], [5, 7, 3, 6, 2], [2, 5, 7, 4, 6]];
// Weeks 3-4 step the class-survey data up into the 30-40s so students read a
// scale that counts by 10s (each row has a distinct max and min, no ties).
const CAT_COUNTS_LARGE = [[24, 38, 15, 31, 27], [36, 21, 40, 30, 13], [18, 39, 33, 16, 28], [40, 25, 34, 19, 31], [33, 37, 22, 14, 29], [17, 30, 38, 26, 35]];

function catCats(round: number, opts: { build?: boolean; forceTie?: boolean; large?: boolean } = {}): { survey: CatSurvey; categories: CatN[] } {
  const survey = pick(CAT_SURVEYS, round);
  const source = opts.build ? CAT_COUNTS_SMALL : opts.large ? CAT_COUNTS_LARGE : CAT_COUNTS;
  const counts = [...pick(source, round)];
  if (opts.forceTie) counts[1] = counts[0];
  return { survey, categories: survey.cats.map((c, i) => ({ ...c, count: counts[i]! })) };
}

// ── Discrete NUMERICAL data (values 0-4 with frequencies; single variable) ───
const NUM_SURVEYS = [
  { id: "pets", q: "How many pets does each family have?", color: C.orange },
  { id: "siblings", q: "How many brothers and sisters?", color: C.purple },
  { id: "books", q: "How many books read this month?", color: C.blue },
  { id: "goals", q: "How many goals scored each game?", color: C.green },
  { id: "screens", q: "How many hours of screen time?", color: C.teal },
];
const NUM_FREQ = [[3, 7, 12, 9, 5], [5, 11, 8, 14, 6], [8, 4, 13, 10, 7], [2, 9, 15, 11, 6], [6, 12, 9, 7, 13], [4, 8, 14, 10, 5]];
const NUM_FREQ_SMALL = [[3, 5, 7, 4, 2], [5, 7, 3, 6, 2], [6, 3, 7, 4, 5], [2, 6, 4, 7, 3], [7, 4, 6, 2, 5], [4, 7, 5, 3, 6]];
// Weeks 3-4 numerical distributions scaled into the 30-40s (distinct max per row).
const NUM_FREQ_LARGE = [[13, 27, 40, 34, 18], [20, 38, 30, 39, 22], [31, 16, 40, 36, 26], [12, 33, 39, 35, 21], [24, 37, 31, 28, 40], [17, 30, 38, 32, 19]];

function numCats(round: number, small = false, large = false) {
  const survey = pick(NUM_SURVEYS, round);
  const freqs = pick(small ? NUM_FREQ_SMALL : large ? NUM_FREQ_LARGE : NUM_FREQ, round);
  const categories = ["0", "1", "2", "3", "4"].map((v, i) => ({ id: `v${v}`, label: v, color: survey.color, count: freqs[i]! }));
  return { survey, categories };
}

// ── Classify data as categorical or numerical (Year 3 concept) ───────────────
const CLASSIFY = [
  { v: "Favourite lunch", ex: "pizza, pasta, salad", type: "categorical" },
  { v: "Number of pets at home", ex: "0, 1, 2, 3", type: "numerical" },
  { v: "How you travel to school", ex: "car, bus, bike, walk", type: "categorical" },
  { v: "Number of brothers and sisters", ex: "0, 1, 2, 3, 4", type: "numerical" },
  { v: "Favourite music", ex: "pop, rock, jazz", type: "categorical" },
  { v: "Goals scored in a game", ex: "0, 1, 2, 3", type: "numerical" },
  { v: "Weekend activity", ex: "sport, reading, art", type: "categorical" },
  { v: "Books read this month", ex: "0, 1, 2, 3, 4", type: "numerical" },
];
export function classifyTask(round: number, target: number): PracticeTask {
  const item = pick(CLASSIFY, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Is this data categorical or numerical?",
    speakText: "Categorical data sorts into named groups. Numerical data is counted with numbers.",
    variable: item.v, examples: item.ex,
    options: order([{ id: "categorical", label: "Categorical (groups)" }, { id: "numerical", label: "Numerical (numbers)" }], round),
    correctOptionIds: [item.type],
    feedback: { correct: item.type === "categorical" ? "Yes — named groups, so it's categorical." : "Yes — numbers we count, so it's numerical.", wrong: "Look at the example answers: named groups, or numbers?" },
  };
}

// ── Numerical-data column graphs (the Year 3 star) ───────────────────────────
export function numColumnBuildTask(round: number, target: number): PracticeTask {
  const { survey, categories } = numCats(round, true);
  return {
    kind: "statisticaGraph", mode: "build", target, display: "columns", categories,
    prompt: `${survey.q} Build the column graph to match the frequencies.`,
    speakText: "The numbers along the bottom are the data values. Make each bar as tall as its frequency.",
    feedback: { correct: "Your column graph matches the numerical data.", wrong: "Check each bar against its number." },
  };
}
export function numColumnReadTask(round: number, target: number, large = false): PracticeTask {
  const { survey, categories } = numCats(round + 1, false, large);
  const top = [...categories].sort((a, b) => b.count - a.count)[0]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: `${survey.q} Which value is the MOST common?`,
    speakText: "Find the tallest bar — that value happened most often.",
    options: order(categories.map((c) => ({ id: c.id, label: c.label })), round), correctOptionIds: [top.id],
    feedback: { correct: `Yes — ${top.label} is the most common.`, wrong: "The most common value has the tallest bar." },
  };
}
export function numColumnFrequencyTask(round: number, target: number): PracticeTask {
  const { survey, categories } = numCats(round + 2);
  const cat = pick(categories, round);
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: `${survey.q} How many had exactly ${cat.label}?`,
    speakText: `Read up the ${cat.label} column to its frequency.`,
    options: numOptions(cat.count, round), correctOptionIds: [`n${cat.count}`],
    feedback: { correct: `Right — ${cat.count} had ${cat.label}.`, wrong: `Follow the ${cat.label} bar to the scale.` },
  };
}

// ── Categorical column graphs (larger Year-3 data) ───────────────────────────
export function catColumnReadTask(round: number, target: number, large = false): PracticeTask {
  const { survey, categories } = catCats(round + 1, { large });
  const askMost = round % 2 === 0;
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const answer = askMost ? sorted[0]! : sorted[sorted.length - 1]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: askMost ? `${survey.q} Which was chosen MOST?` : `${survey.q} Which was chosen LEAST?`,
    speakText: `Read the column graph and find the ${askMost ? "tallest" : "shortest"} bar.`,
    options: order(categories.map((c) => ({ id: c.id, label: c.label })), round), correctOptionIds: [answer.id],
    feedback: { correct: `Yes — ${answer.label}.`, wrong: `Compare all the bars and find the ${askMost ? "tallest" : "shortest"}.` },
  };
}
export function catColumnFrequencyTask(round: number, target: number, large = false): PracticeTask {
  const { survey, categories } = catCats(round + 2, { large });
  const cat = pick(categories, round);
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: `${survey.q} How many chose ${cat.label}?`,
    speakText: `Read up the ${cat.label} column to the scale.`,
    options: numOptions(cat.count, round, large ? 10 : 1), correctOptionIds: [`n${cat.count}`],
    feedback: { correct: `Right — ${cat.count} chose ${cat.label}.`, wrong: `Follow the ${cat.label} bar across to the numbers.` },
  };
}
export function catColumnBuildTask(round: number, target: number): PracticeTask {
  const { survey, categories } = catCats(round, { build: true });
  return {
    kind: "statisticaGraph", mode: "build", target, display: "columns", categories,
    prompt: `${survey.q} Build the column graph.`,
    speakText: "Make each bar reach the frequency in the table.",
    feedback: { correct: "Your column graph matches the data.", wrong: "Check each bar against the scale." },
  };
}
export function catCompareTask(round: number, target: number, large = false): PracticeTask {
  const forceTie = round % 3 === 2;
  const { survey, categories } = catCats(round + 2, { forceTie, large });
  const a = categories[0]!, b = categories[1]!;
  const correct = a.count > b.count ? "a" : a.count < b.count ? "b" : "eq";
  return {
    kind: "statisticaGraph", mode: "compare", target, display: "columns", categories,
    prompt: `${survey.q} Compare ${a.label} and ${b.label}.`,
    speakText: `Which column is taller, or are they equal?`,
    options: order([{ id: "a", label: `More chose ${a.label}` }, { id: "b", label: `More chose ${b.label}` }, { id: "eq", label: "They are equal" }], round),
    correctOptionIds: [correct],
    feedback: { correct: "Correct — the taller bar has more.", wrong: "Line the two bars up and compare their heights." },
  };
}
export function catClaimTask(round: number, target: number): PracticeTask {
  const { survey, categories } = catCats(round + 1);
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const most = sorted[0]!, least = sorted[sorted.length - 1]!;
  const stateTrue = round % 2 === 0;
  const subject = stateTrue ? most : least;
  const isTrue = subject.id === most.id;
  return {
    kind: "statisticaGraph", mode: "claim", target, display: "columns", categories,
    prompt: `${survey.q} "${subject.label} was chosen the most." True or false?`,
    speakText: "Look at the bars and decide if the statement is true.",
    options: [{ id: "t", label: "True" }, { id: "f", label: "False" }], correctOptionIds: [isTrue ? "t" : "f"],
    feedback: { correct: "Right — you checked the bars.", wrong: "Compare the bar heights again." },
  };
}

// ── Frequency tables ─────────────────────────────────────────────────────────
export function numTableTask(round: number, target: number): PracticeTask {
  const { survey, categories } = numCats(round + 3);
  const row = pick(categories, round);
  return {
    kind: "statisticaTable", mode: "count", target, rows: categories,
    prompt: `${survey.q} Read the frequency table: how many had ${row.label}?`,
    speakText: `Find the ${row.label} row and read its frequency.`,
    answerCount: row.count,
    feedback: { correct: `Right — the table shows ${row.count} for ${row.label}.`, wrong: `Find the ${row.label} row and read across.` },
  };
}
export function tableSelectTask(round: number, target: number): PracticeTask {
  const { survey, categories } = catCats(round + 1);
  const askMost = round % 2 === 0;
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const answer = askMost ? sorted[0]! : sorted[sorted.length - 1]!;
  return {
    kind: "statisticaTable", mode: "select", target, rows: categories, correctRowId: answer.id,
    prompt: `${survey.q} Which row has the ${askMost ? "MOST" : "FEWEST"}?`,
    speakText: `Read the frequency table and choose the row with the ${askMost ? "biggest" : "smallest"} number.`,
    feedback: { correct: `Yes — ${answer.label} has the ${askMost ? "most" : "fewest"}.`, wrong: "Compare the numbers in each row." },
  };
}

// ── Rank & Gap (interpret) ───────────────────────────────────────────────────
export function rankTask(round: number, target: number): PracticeTask {
  const { survey, categories } = catCats(round);
  const three = categories.slice(0, 3);
  const direction = round % 2 ? "least-to-most" : "most-to-least";
  const ordered = [...three].sort((a, b) => direction === "most-to-least" ? b.count - a.count : a.count - b.count);
  return {
    kind: "statisticaRank", target, direction, categories: three, correctOrderIds: ordered.map((c) => c.id),
    prompt: direction === "most-to-least" ? `${survey.q} Order them MOST to LEAST.` : `${survey.q} Order them LEAST to MOST.`,
    speakText: `Tap the bars in order, ${direction === "most-to-least" ? "tallest first" : "shortest first"}.`,
    feedback: { correct: "Perfect order — ranked by frequency.", wrong: "Compare the heights and order them again." },
  };
}
const GAP_PAIRS = [[9, 6], [7, 10], [11, 8], [5, 8], [10, 12], [8, 6]];
export function gapTask(round: number, target: number): PracticeTask {
  const survey = pick(CAT_SURVEYS, round + 3);
  const pair = pick(GAP_PAIRS, round);
  const two: CatN[] = [{ ...survey.cats[0]!, count: pair[0]! }, { ...survey.cats[1]!, count: pair[1]! }];
  const larger = two[0].count > two[1].count ? two[0] : two[1];
  const difference = Math.abs(two[0].count - two[1].count);
  return {
    kind: "statisticaGap", target, categories: two, largerCategoryId: larger.id, difference,
    prompt: `${survey.q} How many MORE chose ${larger.label}?`,
    speakText: `Count how many more ${larger.label} has than the other column.`,
    feedback: { correct: "Yes — that's the difference between the two columns.", wrong: "Count the extra squares the taller column has." },
  };
}

// ── Inference — choose the conclusion the data supports (the Year 3 novelty) ─
export function inferenceTask(round: number, target: number, large = false): PracticeTask {
  const { survey, categories } = catCats(round + 2, { large });
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const most = sorted[0]!, least = sorted[sorted.length - 1]!;
  const shape = round % 3;
  let options: Array<{ id: string; label: string }>;
  if (shape === 0) {
    options = [{ id: "c", label: `The most popular was ${most.label}.` }, { id: "w1", label: `The most popular was ${least.label}.` }, { id: "w2", label: `${least.label} was chosen more than ${most.label}.` }];
  } else if (shape === 1) {
    options = [{ id: "c", label: `The least popular was ${least.label}.` }, { id: "w1", label: `The least popular was ${most.label}.` }, { id: "w2", label: `${most.label} and ${least.label} were chosen equally.` }];
  } else {
    const a = categories[0]!, b = categories[1]!;
    const [hi, lo] = a.count > b.count ? [a, b] : [b, a];
    options = [{ id: "c", label: `More chose ${hi.label} than ${lo.label}.` }, { id: "w1", label: `More chose ${lo.label} than ${hi.label}.` }, { id: "w2", label: `${hi.label} and ${lo.label} were chosen equally.` }];
  }
  return {
    kind: "statisticaInference", target, display: "columns", categories,
    prompt: `${survey.q} What can we conclude?`,
    speakText: "Read the column graph, then choose the sentence the data supports.",
    options: order(options, round), correctOptionIds: ["c"],
    feedback: { correct: "Yes — that conclusion matches the graph.", wrong: "Read the bar heights again and check which sentence is true." },
  };
}

// Large-scale reading variants used in Weeks 3-4: same graphs, but the data
// climbs into the 30-40s so the scale counts by 10s. Build tasks stay small.
const catColumnReadTaskLg: Gen = (r, t) => catColumnReadTask(r, t, true);
const catCompareTaskLg: Gen = (r, t) => catCompareTask(r, t, true);
const numColumnReadTaskLg: Gen = (r, t) => numColumnReadTask(r, t, true);
const inferenceTaskLg: Gen = (r, t) => inferenceTask(r, t, true);

// ── Lesson map (18 lessons, 6 weeks) — Year 3, no collect/sort ────────────────
const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W1 Types of Data — classify + first look at each data type
  "y3-statistics-w1-l1": [classifyTask, catColumnReadTask, catCompareTask],
  "y3-statistics-w1-l2": [classifyTask, numColumnReadTask, numColumnBuildTask],
  "y3-statistics-w1-l3": [classifyTask, numColumnFrequencyTask, catColumnReadTask],
  // W2 Statistical Questions — what data, then record it
  "y3-statistics-w2-l1": [classifyTask, catColumnReadTask, numTableTask],
  "y3-statistics-w2-l2": [classifyTask, numColumnReadTask, catCompareTask],
  "y3-statistics-w2-l3": [numTableTask, tableSelectTask, catColumnFrequencyTask],
  // W3 Frequency Tables — tally/table reading and completion (on-topic, no graphs)
  "y3-statistics-w3-l1": [numTableTask, tableSelectTask, numTableTask],
  "y3-statistics-w3-l2": [tableSelectTask, numTableTask, tableSelectTask],
  "y3-statistics-w3-l3": [numTableTask, tableSelectTask, numTableTask],
  // W4 Representing Data — choose, create, compare, conclude (larger data)
  "y3-statistics-w4-l1": [catColumnReadTaskLg, numColumnReadTaskLg, catCompareTaskLg],
  "y3-statistics-w4-l2": [catColumnBuildTask, numColumnBuildTask, numColumnReadTaskLg],
  "y3-statistics-w4-l3": [catCompareTaskLg, catColumnReadTaskLg, inferenceTaskLg],
  // W5 Interpreting Data — evidence, inferences, answers
  "y3-statistics-w5-l1": [numColumnFrequencyTask, rankTask, catColumnReadTask],
  "y3-statistics-w5-l2": [inferenceTask, catClaimTask, gapTask],
  "y3-statistics-w5-l3": [inferenceTask, catCompareTask, numColumnFrequencyTask],
  // W6 Guided Investigation — plan/record -> represent -> report
  "y3-statistics-w6-l1": [classifyTask, numTableTask, catColumnFrequencyTask],
  "y3-statistics-w6-l2": [numColumnBuildTask, catColumnBuildTask, inferenceTask],
  "y3-statistics-w6-l3": [inferenceTask, rankTask, catClaimTask],
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

export function getStatisticaLevel3TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const gens = LESSON_GENS[lessonId];
  if (!gens) return null;
  const m = /-w(\d+)-l(\d+)$/.exec(lessonId);
  const week = m ? Number(m[1]) : 1;
  const lesson = m ? Number(m[2]) : 1;
  const seed = (week - 1) * 2 + (lesson - 1);
  return taskSet(gens, seed);
}

export const STATISTICA_LEVEL3_LESSON_IDS = Object.keys(LESSON_GENS);
