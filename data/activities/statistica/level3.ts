import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  l2CollectTask, l2SortTask, l2TallyRecordTask, l2TallyReadTask,
  l2TapPictureGraphTask, l2FrequencyTask, l2ClaimTask, l2RankTask, l2GapTask,
  l2TableFrequencyTask, l2TableSelectTask,
  buildColumnsTask, compareColumnsTask, columnClaimTask, columnFrequencyTask,
  sameDataDisplayTask,
} from "@/data/activities/statistica/level2";

// ── Statistica Level 3 (Year 3) — AC9M3ST01 (categorical AND discrete NUMERICAL
// data; frequency tables) + AC9M3ST02 (create/compare graphs) + AC9M3ST03 (guided
// investigation). Builds on the Year 2 toolkit and adds the two Year 3 novelties:
// classifying data as categorical/numerical, and NUMERICAL data distributions.

type Gen = (round: number, target: number) => PracticeTask;
const C = { orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6" };
const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(arr: T[], round: number) => (round % 2 ? [...arr].reverse() : arr);
function numOptions(correct: number, round: number) {
  const set = new Set<number>([correct]);
  let d = 1;
  while (set.size < 3) { set.add(Math.max(1, correct + (d % 2 ? d : -d))); d += 1; }
  return order([...set].map((n) => ({ id: `n${n}`, label: String(n) })), round);
}

// ── Classify data as categorical or numerical (the Year 3 concept) ───────────
const CLASSIFY = [
  { v: "Favourite colour", ex: "red, blue, green", type: "categorical" },
  { v: "Number of pets at home", ex: "0, 1, 2, 3", type: "numerical" },
  { v: "How you travel to school", ex: "car, bus, walk", type: "categorical" },
  { v: "Number of brothers and sisters", ex: "0, 1, 2, 3, 4", type: "numerical" },
  { v: "Favourite sport", ex: "soccer, swimming, running", type: "categorical" },
  { v: "Goals scored in a game", ex: "0, 1, 2, 3", type: "numerical" },
  { v: "Eye colour", ex: "brown, blue, green", type: "categorical" },
  { v: "Books read this week", ex: "0, 1, 2, 3, 4, 5", type: "numerical" },
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
    feedback: {
      correct: item.type === "categorical" ? "Yes — named groups, so it's categorical." : "Yes — numbers we count, so it's numerical.",
      wrong: "Look at the example answers: are they named groups, or numbers?",
    },
  };
}

// ── Discrete NUMERICAL data distributions (values 0..3 with frequencies) ─────
const NUM_SURVEYS = [
  { id: "pets", q: "How many pets does each family have?", color: C.orange },
  { id: "siblings", q: "How many brothers or sisters?", color: C.purple },
  { id: "books", q: "How many books read this week?", color: C.blue },
  { id: "goals", q: "How many goals scored each game?", color: C.green },
  { id: "apps", q: "How many games on each tablet?", color: C.teal },
];
const NUM_FREQ = [[2, 5, 7, 3], [6, 4, 8, 2], [3, 7, 5, 9], [8, 3, 6, 4], [5, 9, 4, 7], [4, 6, 9, 3]];
const NUM_FREQ_SMALL = [[2, 4, 5, 3], [3, 5, 2, 6], [5, 3, 6, 2], [2, 6, 4, 3], [6, 2, 5, 3], [3, 6, 4, 2]];

function numCats(round: number, small = false) {
  const survey = pick(NUM_SURVEYS, round);
  const freqs = pick(small ? NUM_FREQ_SMALL : NUM_FREQ, round);
  // One variable => one colour for all bars (visually marks it as numerical).
  const categories = ["0", "1", "2", "3"].map((v, i) => ({ id: `v${v}`, label: v, color: survey.color, count: freqs[i]! }));
  return { survey, categories };
}

export function numColumnBuildTask(round: number, target: number): PracticeTask {
  const { survey, categories } = numCats(round, true);
  return {
    kind: "statisticaGraph", mode: "build", target, display: "columns", categories,
    prompt: `${survey.q} Build the column graph to match the table.`,
    speakText: "The numbers along the bottom are the data values. Make each bar as tall as its frequency.",
    feedback: { correct: "Your column graph matches the numerical data.", wrong: "Check each bar against its number." },
  };
}
export function numColumnReadTask(round: number, target: number): PracticeTask {
  const { survey, categories } = numCats(round + 1);
  const top = [...categories].sort((a, b) => b.count - a.count)[0]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: `${survey.q} Which value is the MOST common?`,
    speakText: "Find the tallest bar — that value happened the most often.",
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

// ── Lesson map (18 lessons, 6 weeks) ─────────────────────────────────────────
// W1 types of data · W2 questions · W3 frequency tables · W4 representing ·
// W5 interpreting · W6 guided investigation.
const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W1 Types of Data — categorical vs numerical, classify
  "y3-statistics-w1-l1": [l2CollectTask, l2SortTask, classifyTask],
  "y3-statistics-w1-l2": [numColumnBuildTask, numColumnReadTask, classifyTask],
  "y3-statistics-w1-l3": [classifyTask, l2SortTask, numColumnReadTask],
  // W2 Statistical Questions — pose, decide what data, collect
  "y3-statistics-w2-l1": [l2CollectTask, classifyTask, numColumnReadTask],
  "y3-statistics-w2-l2": [classifyTask, l2FrequencyTask, numColumnReadTask],
  "y3-statistics-w2-l3": [l2CollectTask, l2TallyRecordTask, numTableTask],
  // W3 Frequency Tables
  "y3-statistics-w3-l1": [l2TallyRecordTask, l2SortTask, l2TallyReadTask],
  "y3-statistics-w3-l2": [l2TableFrequencyTask, numTableTask, l2TableSelectTask],
  "y3-statistics-w3-l3": [numTableTask, l2TableSelectTask, l2FrequencyTask],
  // W4 Representing Data — choose, create, compare graphs
  "y3-statistics-w4-l1": [numColumnReadTask, l2TapPictureGraphTask, numColumnFrequencyTask],
  "y3-statistics-w4-l2": [buildColumnsTask, numColumnBuildTask, numColumnReadTask],
  "y3-statistics-w4-l3": [sameDataDisplayTask, compareColumnsTask, numColumnFrequencyTask],
  // W5 Interpreting Data — evidence, inferences, answers
  "y3-statistics-w5-l1": [numColumnFrequencyTask, l2RankTask, columnFrequencyTask],
  "y3-statistics-w5-l2": [l2ClaimTask, columnClaimTask, l2RankTask],
  "y3-statistics-w5-l3": [l2GapTask, compareColumnsTask, l2ClaimTask],
  // W6 Guided Investigation — plan/collect -> represent/interpret -> report
  "y3-statistics-w6-l1": [l2CollectTask, l2TallyRecordTask, numTableTask],
  "y3-statistics-w6-l2": [numColumnBuildTask, buildColumnsTask, numColumnFrequencyTask],
  "y3-statistics-w6-l3": [compareColumnsTask, l2RankTask, l2ClaimTask],
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
