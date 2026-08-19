import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  collectTask, sortTask, sortTaskHard, tallyRecordTask, tallyReadTask,
  tapPictureGraphTask, rankTask, gapTask,
  tableFrequencyTask, tableSelectTask, readGraphTask, frequencyTask,
  compareTask, claimTask, interpretTask, buildTask,
} from "@/data/activities/statistica/level1";

// ── Statistica Level 2 (Year 2) — AC9M2ST01 (acquire, sort, record; lists,
// tables, picture graphs) + AC9M2ST02 (create/compare picture AND column graphs,
// interpret). Reuses the Level 1 interaction toolkit and adds column/bar graphs,
// which are the defining new Year 2 representation.

type Cat = { id: string; label: string; color: string };
type Gen = (round: number, target: number) => PracticeTask;

const C = { red: "#ef4444", amber: "#f59e0b", orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", pink: "#ec4899" };

const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(arr: T[], round: number) => (round % 2 ? [...arr].reverse() : arr);

// ── Column-graph data (Year 2 themes) ───────────────────────────────────────
type Survey = { id: string; question: string; cats: Cat[] };
const L2_SURVEYS: Survey[] = [
  { id: "sport", question: "What is our class's favourite sport?", cats: [{ id: "soccer", label: "Soccer", color: C.green }, { id: "swim", label: "Swimming", color: C.blue }, { id: "run", label: "Running", color: C.pink }] },
  { id: "pet", question: "Which pet do children have at home?", cats: [{ id: "dog", label: "Dog", color: C.orange }, { id: "cat", label: "Cat", color: C.purple }, { id: "fish", label: "Fish", color: C.blue }] },
  { id: "weather", question: "What was the weather this fortnight?", cats: [{ id: "sunny", label: "Sunny", color: C.amber }, { id: "cloudy", label: "Cloudy", color: C.teal }, { id: "rainy", label: "Rainy", color: C.blue }] },
  { id: "travel", question: "How do we travel to school?", cats: [{ id: "car", label: "Car", color: C.red }, { id: "bus", label: "Bus", color: C.amber }, { id: "walk", label: "Walk", color: C.green }] },
  { id: "fruit", question: "Which fruit did the class choose?", cats: [{ id: "apple", label: "Apple", color: C.red }, { id: "banana", label: "Banana", color: C.amber }, { id: "orange", label: "Orange", color: C.orange }] },
];

// Distinct counts with a clear tallest/shortest. Read graphs use the larger pool
// (up to 11); builds use a smaller pool so there aren't too many taps.
const READ_COUNTS = [[8, 5, 6], [6, 9, 4], [10, 7, 5], [5, 8, 11], [9, 6, 10], [7, 11, 8]];
const BUILD_COUNTS = [[4, 2, 5], [3, 5, 2], [5, 3, 6], [2, 6, 4], [6, 4, 3], [3, 6, 5]];

function colCats(round: number, opts: { forceTie?: boolean; build?: boolean } = {}) {
  const survey = pick(L2_SURVEYS, round);
  const counts = [...pick(opts.build ? BUILD_COUNTS : READ_COUNTS, round)];
  if (opts.forceTie) counts[1] = counts[0];
  return { survey, categories: survey.cats.map((c, i) => ({ ...c, count: counts[i]! })) };
}

function numOptions(correct: number, round: number) {
  const set = new Set<number>([correct]);
  let d = 1;
  while (set.size < 3) { set.add(Math.max(1, correct + (d % 2 ? d : -d))); d += 1; }
  return order([...set].map((n) => ({ id: `n${n}`, label: String(n) })), round);
}

// ── Column-graph generators (new for Year 2) ─────────────────────────────────
export function buildColumnsTask(round: number, target: number): PracticeTask {
  const { survey, categories } = colCats(round, { build: true });
  return {
    kind: "statisticaGraph", mode: "build", target, display: "columns", categories,
    prompt: "Build the column graph — make each bar reach its number.",
    speakText: `${survey.question} Use plus and minus to make each column the right height.`,
    feedback: { correct: "Your column graph matches the data.", wrong: "Check each bar against the scale on the side." },
  };
}

export function readColumnsTask(round: number, target: number): PracticeTask {
  const { survey, categories } = colCats(round + 1);
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
  const { survey, categories } = colCats(round + 2);
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
  const { survey, categories } = colCats(round + 2, { forceTie });
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
  const { survey, categories } = colCats(round + 1);
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

// W6 "Which display works best?" — reinforce that different displays of the SAME
// data give the same answer. Shown as a column graph, asked like a picture graph.
export function sameDataDisplayTask(round: number, target: number): PracticeTask {
  const { survey, categories } = colCats(round + 3);
  const top = [...categories].sort((a, b) => b.count - a.count)[0]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: "A picture graph and this column graph show the SAME data. Which had the MOST?",
    speakText: `${survey.question} Different displays can show the same data — read the column graph to find the most.`,
    options: order(categories.map((c) => ({ id: c.id, label: c.label })), round), correctOptionIds: [top.id],
    feedback: { correct: `Yes — ${top.label}. Both displays give the same answer.`, wrong: "Find the tallest bar." },
  };
}

const buildPics: Gen = (r, t) => buildTask(r, t, "pictures");

// ── Lesson map (24 lessons) — each week has a signature representation ────────
// W1 sort/collect · W2 collect(surveys) · W3 TABLES · W4 picture graphs ·
// W5 COLUMN GRAPHS (new) · W6 different displays · W7 interpret · W8 investigation.
const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W1 Questions & Categories
  "y2-statistics-w1-l1": [collectTask, sortTask, tapPictureGraphTask],
  "y2-statistics-w1-l2": [sortTask, sortTaskHard, collectTask],
  "y2-statistics-w1-l3": [sortTaskHard, collectTask, tableSelectTask],
  // W2 Collecting Data
  "y2-statistics-w2-l1": [collectTask, tallyRecordTask, tapPictureGraphTask],
  "y2-statistics-w2-l2": [collectTask, tallyReadTask, frequencyTask],
  "y2-statistics-w2-l3": [collectTask, tableFrequencyTask, compareTask],
  // W3 Recording Data — TABLES
  "y2-statistics-w3-l1": [tallyRecordTask, sortTask, tallyReadTask],
  "y2-statistics-w3-l2": [tableFrequencyTask, tableSelectTask, tableFrequencyTask],
  "y2-statistics-w3-l3": [tableSelectTask, tableFrequencyTask, frequencyTask],
  // W4 Picture Graphs
  "y2-statistics-w4-l1": [buildPics, buildPics, tapPictureGraphTask],
  "y2-statistics-w4-l2": [tapPictureGraphTask, frequencyTask, readGraphTask],
  "y2-statistics-w4-l3": [frequencyTask, compareTask, rankTask],
  // W5 Column Graphs — NEW
  "y2-statistics-w5-l1": [readColumnsTask, buildColumnsTask, readColumnsTask],
  "y2-statistics-w5-l2": [buildColumnsTask, readColumnsTask, buildColumnsTask],
  "y2-statistics-w5-l3": [readColumnsTask, columnFrequencyTask, compareColumnsTask],
  // W6 Different Displays
  "y2-statistics-w6-l1": [buildColumnsTask, buildPics, readColumnsTask],
  "y2-statistics-w6-l2": [sameDataDisplayTask, compareColumnsTask, columnClaimTask],
  "y2-statistics-w6-l3": [sameDataDisplayTask, rankTask, columnClaimTask],
  // W7 Interpreting Displays
  "y2-statistics-w7-l1": [rankTask, tapPictureGraphTask, columnFrequencyTask],
  "y2-statistics-w7-l2": [gapTask, compareTask, compareColumnsTask],
  "y2-statistics-w7-l3": [interpretTask, claimTask, rankTask],
  // W8 Statistical Investigation
  "y2-statistics-w8-l1": [collectTask, tallyRecordTask, tableFrequencyTask],
  "y2-statistics-w8-l2": [buildPics, buildColumnsTask, tapPictureGraphTask],
  "y2-statistics-w8-l3": [compareColumnsTask, rankTask, interpretTask],
};

function taskSet(gens: [Gen, Gen, Gen], seed: number): RealmLessonTaskSet {
  let t = 10;
  const rounds = [seed, seed + 1, seed + 2];
  return {
    // The teaching card is a gentle example of the lesson's lead activity.
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
