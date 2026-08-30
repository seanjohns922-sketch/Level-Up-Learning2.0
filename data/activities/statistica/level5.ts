import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  shapeConcentratedTask,
  shapeSpreadTask,
  investigationTask,
} from "@/data/activities/statistica/level4";

// ── Statistica Level 5 (Year 5) — AC9M5ST01 (nominal/ordinal categorical +
// discrete numerical data; validate data; describe distributions by MODE and
// shape), AC9M5ST02 (LINE GRAPHS of change over time), AC9M5ST03 (plan and
// conduct an unbiased statistical investigation).
// Year 5's genuinely new content is the LINE GRAPH (change over time), the MODE
// (highest frequency), and the nominal-vs-ordinal categorical distinction —
// none of which exist in Levels 1-4. This level leads with those; it spirals
// distribution shape and the investigation cycle from Level 4.

type Gen = (round: number, target: number) => PracticeTask;

const C = { red: "#ef4444", amber: "#f59e0b", orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", pink: "#ec4899", indigo: "#6366f1" };
const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(arr: T[], round: number) => (round % 2 ? [...arr].reverse() : arr);

// ── W1 Data types: nominal / ordinal / discrete numerical (AC9M5ST01) ────────
type DataTypeItem = { v: string; ex: string; type: "nominal" | "ordinal" | "numerical" };
const DATA_TYPES: DataTypeItem[] = [
  { v: "Favourite colour", ex: "Red, Blue, Green, Yellow", type: "nominal" },
  { v: "Type of pet", ex: "Dog, Cat, Fish, Bird", type: "nominal" },
  { v: "Way students travel to school", ex: "Walk, Car, Bus, Bike", type: "nominal" },
  { v: "Eye colour", ex: "Brown, Blue, Green, Hazel", type: "nominal" },
  { v: "Country of birth", ex: "Australia, India, Japan", type: "nominal" },
  { v: "Star rating", ex: "1★, 2★, 3★, 4★, 5★", type: "ordinal" },
  { v: "T-shirt size", ex: "Small, Medium, Large", type: "ordinal" },
  { v: "Race finish", ex: "1st, 2nd, 3rd, 4th", type: "ordinal" },
  { v: "Spice level", ex: "Mild, Medium, Hot", type: "ordinal" },
  { v: "Skill level", ex: "Beginner, Intermediate, Expert", type: "ordinal" },
  { v: "Number of siblings", ex: "0, 1, 2, 3", type: "numerical" },
  { v: "Goals scored each game", ex: "0, 1, 2, 3, 4", type: "numerical" },
  { v: "Books read this month", ex: "2, 5, 7, 10", type: "numerical" },
  { v: "Pets owned", ex: "0, 1, 2, 3", type: "numerical" },
];
export function dataTypeTask(round: number, target: number): PracticeTask {
  const item = pick(DATA_TYPES, round);
  const why = item.type === "nominal" ? "Named groups with no order — that's nominal."
    : item.type === "ordinal" ? "Named groups with a clear order — that's ordinal."
    : "Numbers we count — that's numerical.";
  return {
    kind: "statisticaClassify", target,
    prompt: "What type of data is this?",
    speakText: "Nominal is named groups with no order. Ordinal is groups with an order. Numerical is counts.",
    variable: item.v, examples: item.ex,
    options: order([
      { id: "nominal", label: "Nominal (named groups)" },
      { id: "ordinal", label: "Ordinal (ordered groups)" },
      { id: "numerical", label: "Numerical (counts)" },
    ], round),
    correctOptionIds: [item.type],
    feedback: { correct: `Yes — ${why}`, wrong: "Do the answers sort into named groups (and is there an order?), or are they counts?" },
  };
}

// Sort survey cards into their data-type bin — a hands-on way to contrast all
// three types at once (far livelier than picking a type from a list).
const TYPE_BINS = [
  { id: "nominal", label: "Nominal", color: C.indigo },
  { id: "ordinal", label: "Ordinal", color: C.amber },
  { id: "numerical", label: "Numerical", color: C.teal },
];
// Pool sizes are co-prime (7, 8, 7) so the six-card mix has a long period and
// rarely repeats across a session.
const SORT_ITEMS: Record<"nominal" | "ordinal" | "numerical", string[]> = {
  nominal: ["Favourite colour", "Pet type", "Eye colour", "Way to school", "Favourite fruit", "Football team", "Music genre"],
  ordinal: ["Star rating", "T-shirt size", "Race place", "Spice level", "Skill level", "Medal won", "Year level", "Satisfaction"],
  numerical: ["Number of siblings", "Goals scored", "Books read", "Pets owned", "Cousins", "Cars in car park", "Apps opened"],
};
export function dataTypeSortTask(round: number, target: number): PracticeTask {
  // Two of each type so the three bins stay balanced; the pair chosen per type
  // rotates so the mix rarely repeats.
  const chosen: Array<{ label: string; category: "nominal" | "ordinal" | "numerical" }> = [];
  (["nominal", "ordinal", "numerical"] as const).forEach((type, k) => {
    const pool = SORT_ITEMS[type];
    chosen.push({ label: pick(pool, round + k), category: type });
    chosen.push({ label: pick(pool, round + k + 3), category: type });
  });
  const items = order(chosen, round).map((it, i) => ({ id: `it${i}`, label: it.label, category: it.category }));
  return {
    kind: "statisticaSort", target,
    prompt: "Sort each survey into its data type.",
    speakText: "Nominal is named groups with no order. Ordinal is groups with an order. Numerical is counts. Tap a card, then tap its bin.",
    items,
    categories: TYPE_BINS,
    feedback: { correct: "Sorted! Named groups are nominal, ordered groups are ordinal, counts are numerical.", wrong: "Check the red cards: named group, ordered group, or a count?" },
  };
}

// Week 1 uses a deliberate progression. Each lesson teaches one data type in
// depth before the mixed three-way sort appears as the final consolidation.
const NOMINAL_SURVEYS = [
  { question: "Which pet would you most like?", good: "Dog / Cat / Fish / Bird", ordered: "Small / Medium / Large", count: "0 / 1 / 2 / 3" },
  { question: "What is your favourite fruit?", good: "Apple / Banana / Mango / Pear", ordered: "Not ripe / Ripe / Very ripe", count: "1 / 2 / 3 / 4" },
  { question: "How do you travel to school?", good: "Walk / Bike / Bus / Car", ordered: "Near / Medium / Far", count: "0 / 1 / 2 / 3" },
  { question: "Which music style do you prefer?", good: "Pop / Rock / Jazz / Classical", ordered: "Quiet / Medium / Loud", count: "1 / 2 / 3 / 4" },
];

export function nominalTeachingTask(round: number, target: number): PracticeTask {
  const item = pick(NOMINAL_SURVEYS, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "What makes these responses NOMINAL data?",
    speakText: "Nominal data uses names or labels. The groups do not have a natural first-to-last order.",
    variable: item.question, examples: item.good,
    options: order([
      { id: "names", label: "They are named groups with no order" },
      { id: "ordered", label: "They can be ranked from low to high" },
      { id: "counts", label: "They are whole-number counts" },
    ], round),
    correctOptionIds: ["names"],
    feedback: { correct: "Exactly — the answers are names, and none comes before another.", wrong: "Ask whether the response groups have a natural order. Nominal groups do not." },
  };
}

export function nominalResponseTask(round: number, target: number): PracticeTask {
  const item = pick(NOMINAL_SURVEYS, round + 1);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which response set would collect NOMINAL data?",
    speakText: "Choose named groups that do not have a natural order.",
    variable: item.question, examples: "Choose the best set of possible answers.",
    options: order([
      { id: "nominal", label: item.good },
      { id: "ordinal", label: item.ordered },
      { id: "count", label: item.count },
    ], round),
    correctOptionIds: ["nominal"],
    feedback: { correct: "Yes — those are separate named groups with no ranking.", wrong: "Nominal responses are labels, not ratings and not counts." },
  };
}

const NOMINAL_CHECK_ITEMS = [
  { label: "Favourite colour", category: "nominal" }, { label: "Eye colour", category: "nominal" }, { label: "Football team", category: "nominal" },
  { label: "Star rating", category: "other" }, { label: "Books read", category: "other" }, { label: "T-shirt size", category: "other" },
  { label: "Music genre", category: "nominal" }, { label: "Race place", category: "other" },
];
export function nominalSortTask(round: number, target: number): PracticeTask {
  const start = (round * 2) % NOMINAL_CHECK_ITEMS.length;
  const chosen = Array.from({ length: 6 }, (_, index) => NOMINAL_CHECK_ITEMS[(start + index) % NOMINAL_CHECK_ITEMS.length]!);
  return {
    kind: "statisticaSort", target,
    prompt: "Sort the surveys: nominal data or not nominal?",
    speakText: "Nominal data is named groups with no natural order. Put ratings and counts in not nominal.",
    items: order(chosen, round).map((item, index) => ({ id: `nom${index}`, ...item })),
    categories: [{ id: "nominal", label: "Nominal data", color: C.indigo }, { id: "other", label: "Not nominal", color: C.orange }],
    feedback: { correct: "Correct — every nominal survey uses unordered names or labels.", wrong: "Check whether each survey uses unordered names, an ordered rating, or a count." },
  };
}

const NOMINAL_CATEGORY_SETS = [
  { q: "Favourite school lunch", good: "Sandwich / Salad / Pasta / Other", overlap: "Hot food / Pasta / Other", ordered: "Dislike / Okay / Love" },
  { q: "Main way to school", good: "Walk / Bike / Bus / Car / Other", overlap: "Wheels / Bike / Car", ordered: "Near / Medium / Far" },
  { q: "Favourite book genre", good: "Fantasy / Sport / Mystery / Other", overlap: "Fiction / Fantasy / Mystery", ordered: "Good / Better / Best" },
];
export function nominalCategoryDesignTask(round: number, target: number): PracticeTask {
  const item = pick(NOMINAL_CATEGORY_SETS, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which set gives clear, non-overlapping nominal categories?",
    speakText: "Good survey categories are clear and separate. Each answer should fit one group.",
    variable: item.q, examples: "Choose the clearest response categories.",
    options: order([{ id: "good", label: item.good }, { id: "overlap", label: item.overlap }, { id: "ordered", label: item.ordered }], round),
    correctOptionIds: ["good"],
    feedback: { correct: "Yes — each response has one clear named group, with Other available.", wrong: "Avoid overlapping groups and rating scales. Each response should fit one named category." },
  };
}

const ORDINAL_SCALES = [
  { variable: "Spice level", low: "Mild", middle: "Medium", high: "Hot" },
  { variable: "T-shirt size", low: "Small", middle: "Medium", high: "Large" },
  { variable: "Skill level", low: "Beginner", middle: "Developing", high: "Expert" },
  { variable: "Satisfaction", low: "Unhappy", middle: "Okay", high: "Very happy" },
  { variable: "Medal", low: "Bronze", middle: "Silver", high: "Gold" },
];

export function ordinalTeachingTask(round: number, target: number): PracticeTask {
  const item = pick(ORDINAL_SCALES, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Why is this ORDINAL data?",
    speakText: "Ordinal data uses named groups that have a meaningful order.",
    variable: item.variable, examples: `${item.low}, ${item.middle}, ${item.high}`,
    options: order([
      { id: "ordered", label: "The named groups have a clear order" },
      { id: "nominal", label: "The names have no order" },
      { id: "count", label: "The answers are counts" },
    ], round),
    correctOptionIds: ["ordered"],
    feedback: { correct: "Yes — the categories can be placed in a meaningful order.", wrong: "Ordinal categories are names, but unlike nominal categories they can be ranked." },
  };
}

export function ordinalOrderTask(round: number, target: number): PracticeTask {
  const item = pick(ORDINAL_SCALES, round + 1);
  const values = [{ label: item.low, category: "low" }, { label: item.middle, category: "middle" }, { label: item.high, category: "high" }];
  return {
    kind: "statisticaSort", target,
    prompt: `Put the ${item.variable.toLowerCase()} categories in order.`,
    speakText: "Place the lowest category first, then the middle category, then the highest category.",
    items: order(values, round).map((value, index) => ({ id: `ord${index}`, ...value })),
    categories: [{ id: "low", label: "Lowest", color: C.blue }, { id: "middle", label: "Middle", color: C.amber }, { id: "high", label: "Highest", color: C.pink }],
    feedback: { correct: "Ordered correctly — that meaningful ranking makes the data ordinal.", wrong: "Think about which category is lowest, in the middle and highest." },
  };
}

export function ordinalReasonTask(round: number, target: number): PracticeTask {
  const item = pick(ORDINAL_SCALES, round + 2);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which statement about this data is true?",
    speakText: "Ordinal groups have an order, but the gap between neighbouring groups is not a measured amount.",
    variable: item.variable, examples: `${item.low} → ${item.middle} → ${item.high}`,
    options: order([
      { id: "rank", label: `${item.high} ranks above ${item.middle}` },
      { id: "amount", label: `${item.high} is exactly twice ${item.middle}` },
      { id: "none", label: "The groups have no order" },
    ], round),
    correctOptionIds: ["rank"],
    feedback: { correct: "Correct — ordinal categories tell us rank, not an exact numerical gap.", wrong: "The order is meaningful, but ordinal labels do not tell us an exact amount between levels." },
  };
}

export function ordinalScaleFixTask(round: number, target: number): PracticeTask {
  const item = pick(ORDINAL_SCALES, round + 3);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which response scale is ordered clearly from low to high?",
    speakText: "Look for a scale whose labels move in one clear direction from low to high.",
    variable: item.variable, examples: "Choose the correctly ordered scale.",
    options: order([
      { id: "good", label: `${item.low} → ${item.middle} → ${item.high}` },
      { id: "mixed", label: `${item.high} → ${item.low} → ${item.middle}` },
      { id: "nominal", label: "Red → Blue → Green" },
    ], round),
    correctOptionIds: ["good"],
    feedback: { correct: "Yes — the labels move consistently from the lowest to the highest category.", wrong: "Find the scale that moves in one direction from low to middle to high." },
  };
}

const DISCRETE_COUNTS = [
  { variable: "Number of siblings", question: "How many siblings do you have?", examples: "0, 1, 2, 3", impossible: "2.5" },
  { variable: "Goals scored in a game", question: "How many goals were scored in the game?", examples: "0, 1, 2, 3, 4", impossible: "1.5" },
  { variable: "Books borrowed", question: "How many books did you borrow?", examples: "0, 1, 2, 3", impossible: "2.7" },
  { variable: "Pets owned", question: "How many pets do you own?", examples: "0, 1, 2, 3", impossible: "1.5" },
  { variable: "Students absent", question: "How many students are absent?", examples: "0, 1, 2, 3", impossible: "0.5" },
];

export function discreteTeachingTask(round: number, target: number): PracticeTask {
  const item = pick(DISCRETE_COUNTS, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Why is this DISCRETE NUMERICAL data?",
    speakText: "Discrete numerical data is counted in separate whole-number steps.",
    variable: item.variable, examples: item.examples,
    options: order([
      { id: "count", label: "It records whole-number counts" },
      { id: "names", label: "It records unordered names" },
      { id: "rank", label: "It records ordered labels" },
    ], round),
    correctOptionIds: ["count"],
    feedback: { correct: "Yes — these answers are counts in whole-number steps.", wrong: "Discrete numerical data answers how many and is recorded as whole-number counts." },
  };
}

export function discreteQuestionTask(round: number, target: number): PracticeTask {
  const item = pick(DISCRETE_COUNTS, round + 1);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which question collects discrete numerical data?",
    speakText: "Choose the question answered by counting how many.",
    variable: "Planning a class survey", examples: "Which question should the class ask?",
    options: order([
      { id: "count", label: item.question },
      { id: "name", label: "What is your favourite colour?" },
      { id: "rank", label: "How satisfied are you: low, medium or high?" },
    ], round),
    correctOptionIds: ["count"],
    feedback: { correct: "Correct — how many produces a whole-number count.", wrong: "Look for the question answered with a number you can count." },
  };
}

export function discreteValidResponseTask(round: number, target: number): PracticeTask {
  const item = pick(DISCRETE_COUNTS, round + 2);
  const valid = String((round % 4) + 1);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which could be a valid response to this count question?",
    speakText: "A count uses a whole number. You cannot have part of one counted object or person.",
    variable: item.variable, examples: "Choose a possible whole-number count.",
    options: order([{ id: "valid", label: valid }, { id: "decimal", label: item.impossible }, { id: "category", label: "Blue" }], round),
    correctOptionIds: ["valid"],
    feedback: { correct: `Yes — ${valid} is a possible whole-number count.`, wrong: "A discrete count must be a whole number that answers how many." },
  };
}

// ── W2 Valid data: identify and responsibly fix mixed data errors ────────────
type SpotItem = {
  vals: string[];
  rule: string;
  badIndex: number;
  issue: "missing" | "category" | "range" | "type" | "units" | "multiple";
  fix: string;
  unsafeFix: string;
};
const SPOT_ERRORS: SpotItem[] = [
  { rule: "Star ratings must be whole numbers from 1 to 5", vals: ["4", "2", "5", "8", "3"], badIndex: 3, issue: "range", fix: "Ask the student to give a rating from 1 to 5", unsafeFix: "Change 8 to 5 without asking" },
  { rule: "Every student must record one pet choice", vals: ["Dog", "Cat", "—", "Fish", "Dog"], badIndex: 2, issue: "missing", fix: "Ask the student for the missing response", unsafeFix: "Fill the blank with Dog because it is common" },
  { rule: "Travel choices are Walk, Bike, Bus or Car", vals: ["Walk", "Bus", "Buss", "Bike", "Car"], badIndex: 2, issue: "category", fix: "Check that Buss was meant to be Bus", unsafeFix: "Create a new category called Buss" },
  { rule: "Number of pets must be a whole-number count", vals: ["2", "0", "many", "1", "3"], badIndex: 2, issue: "type", fix: "Ask for the actual whole-number count", unsafeFix: "Treat many as 10" },
  { rule: "All heights must be recorded in centimetres", vals: ["142 cm", "135 cm", "1.48 m", "151 cm"], badIndex: 2, issue: "units", fix: "Convert 1.48 m to 148 cm", unsafeFix: "Remove the units from every height" },
  { rule: "Choose one main way of travelling to school", vals: ["Walk", "Bus", "Bike and car", "Car"], badIndex: 2, issue: "multiple", fix: "Ask the student to choose their main way", unsafeFix: "Count the response in both categories" },
  { rule: "Favourite fruit choices are Apple, Banana, Mango or Pear", vals: ["Apple", "Mango", "7", "Pear"], badIndex: 2, issue: "type", fix: "Ask the student to choose one listed fruit", unsafeFix: "Add 7 as a fruit category" },
  { rule: "Sport names must use the agreed category labels", vals: ["Soccer", "Netball", "soccer", "Tennis"], badIndex: 2, issue: "category", fix: "Standardise soccer to the Soccer category", unsafeFix: "Count soccer as a different sport" },
];

const ISSUE_LABELS: Record<SpotItem["issue"], string> = {
  missing: "A response is missing",
  category: "A category label is inconsistent",
  range: "A number is outside the allowed range",
  type: "The response is the wrong type",
  units: "The measurement uses different units",
  multiple: "More than one answer was recorded",
};

export function mixedErrorTeachingTask(round: number, target: number): PracticeTask {
  return {
    kind: "statisticaClassify", target,
    prompt: "What should we check before using collected data?",
    speakText: "Data errors are not only unusual numbers. Check for missing answers, inconsistent categories, wrong response types, mixed units and answers that break the collection rule.",
    variable: "A class survey is ready to analyse", examples: "Think about every way a response could break the survey rule.",
    options: order([
      { id: "mixed", label: "Missing, inconsistent or impossible entries" },
      { id: "numbers", label: "Only numbers that look too large" },
      { id: "none", label: "Nothing if the table looks neat" },
    ], round),
    correctOptionIds: ["mixed"],
    feedback: { correct: "Correct — valid data also needs complete, consistent responses that follow the collection rule.", wrong: "Look beyond large numbers. Text categories, blanks, units and multiple answers can also create errors." },
  };
}

export function spotErrorTask(round: number, target: number): PracticeTask {
  const item = pick(SPOT_ERRORS, round);
  const bad = item.vals[item.badIndex]!;
  return {
    kind: "statisticaClassify", target,
    prompt: "Which entry needs checking?",
    speakText: "One entry breaks the data collection rule. It could be a number, a word, a blank, a unit or more than one answer.",
    variable: item.vals.join(",  "), examples: item.rule,
    options: order(item.vals.map((value, index) => ({ id: `entry-${index}`, label: value })), round),
    correctOptionIds: [`entry-${item.badIndex}`],
    feedback: { correct: `Yes — ${bad} needs checking because ${ISSUE_LABELS[item.issue].toLowerCase()}.`, wrong: `Check every entry against this rule: ${item.rule.toLowerCase()}.` },
  };
}

export function errorReasonTask(round: number, target: number): PracticeTask {
  const item = pick(SPOT_ERRORS, round + 1);
  const issueIds = Object.keys(ISSUE_LABELS) as SpotItem["issue"][];
  const alternatives = issueIds.filter((issue) => issue !== item.issue);
  const options = [item.issue, alternatives[round % alternatives.length]!, alternatives[(round + 2) % alternatives.length]!];
  return {
    kind: "statisticaClassify", target,
    prompt: `Why does “${item.vals[item.badIndex]}” need checking?`,
    speakText: "Use the survey rule to explain the type of data error.",
    variable: item.vals.join(",  "), examples: item.rule,
    options: order(options.map((issue) => ({ id: issue, label: ISSUE_LABELS[issue] })), round),
    correctOptionIds: [item.issue],
    feedback: { correct: `Correct — ${ISSUE_LABELS[item.issue].toLowerCase()}.`, wrong: "Compare the entry with the collection rule, then name exactly what does not match." },
  };
}

export function cleanErrorTask(round: number, target: number): PracticeTask {
  const item = pick(SPOT_ERRORS, round + 2);
  return {
    kind: "statisticaClassify", target,
    prompt: "What is the most responsible way to clean this entry?",
    speakText: "Cleaning data should preserve the truth. Correct an obvious format only when it is certain. Otherwise, ask the person who supplied the response.",
    variable: `${item.vals[item.badIndex]} needs checking`, examples: item.rule,
    options: order([
      { id: "fix", label: item.fix },
      { id: "guess", label: item.unsafeFix },
      { id: "ignore", label: "Ignore the rule and keep it unchanged" },
    ], round),
    correctOptionIds: ["fix"],
    feedback: { correct: "Yes — that fixes or verifies the entry without inventing data.", wrong: "Do not guess or hide the problem. Make a certain correction or check with the person who gave the response." },
  };
}

// ── W3 Mode: the most frequent value (AC9M5ST01) ─────────────────────────────
const MODE_CTX = [
  { q: "Goals scored each game", color: C.green },
  { q: "Books read each week", color: C.blue },
  { q: "Pets per family", color: C.orange },
  { q: "Siblings per student", color: C.pink },
  { q: "Apps opened each day", color: C.teal },
  { q: "Trophies won each season", color: C.amber },
];
const MODE_VALS = ["0", "1", "2", "3", "4"];
// Single clear mode (one tallest column).
const MODE_SINGLE = [
  [2, 5, 10, 4, 2], [1, 3, 8, 5, 2], [3, 9, 4, 2, 1], [1, 2, 5, 11, 4],
  [2, 4, 6, 10, 3], [8, 5, 3, 2, 1], [1, 2, 4, 7, 11], [2, 6, 11, 5, 2],
];
// Two equal tallest columns (bimodal).
const MODE_BI = [
  [2, 8, 3, 8, 2], [1, 6, 2, 6, 3], [7, 3, 2, 3, 7], [2, 9, 4, 9, 1],
  [1, 5, 8, 5, 8], [6, 2, 6, 3, 1],
];
const MODE_LISTS = [
  { values: ["2", "3", "3", "4", "5"], mode: "3" },
  { values: ["1", "4", "2", "4", "3", "4"], mode: "4" },
  { values: ["0", "2", "1", "2", "3", "2"], mode: "2" },
  { values: ["5", "3", "5", "2", "5", "4"], mode: "5" },
];
type ModeCat = { id: string; label: string; color: string; count: number };
function modeCats(freq: number[], color: string): ModeCat[] {
  return MODE_VALS.map((v, i) => ({ id: `v${i}`, label: v, color, count: freq[i]! }));
}
function argmax(freq: number[]) { return freq.reduce((best, v, i) => (v > freq[best]! ? i : best), 0); }

export function modeIntroductionTask(round: number, target: number): PracticeTask {
  const item = pick(MODE_LISTS, round);
  const count = item.values.filter((value) => value === item.mode).length;
  return {
    kind: "statisticaConcept", scene: "intro", target,
    title: "What is the mode?",
    definition: "The mode is the value that appears most often in a set of data.",
    speakText: `The mode is the value that appears most often. In this example, ${item.mode} is the mode because it appears ${count} times, more than any other value.`,
    exampleLabel: "Look at this data set",
    exampleValues: item.values,
    highlightValue: item.mode,
    explanation: `${item.mode} appears ${count} times. Every other value appears fewer times, so the mode is ${item.mode}.`,
    continueLabel: "Find the mode",
    feedback: { correct: "Now use that idea to find the mode.", wrong: "The mode is the value that appears most often." },
  };
}

export function modeFromListTask(round: number, target: number): PracticeTask {
  const item = pick(MODE_LISTS, round + 1);
  const choices = [...new Set(item.values)];
  return {
    kind: "statisticaClassify", target,
    prompt: "Which value is the mode?",
    speakText: "Count how often each value appears. The value that appears most often is the mode.",
    variable: item.values.join(",  "), examples: "Find the value that occurs more often than the others.",
    options: order(choices.map((value) => ({ id: `value-${value}`, label: value })), round),
    correctOptionIds: [`value-${item.mode}`],
    feedback: { correct: `Correct — ${item.mode} appears most often, so it is the mode.`, wrong: "Count each value carefully. The mode has the greatest frequency." },
  };
}

// Read the mode off a distribution — the value with the tallest column.
export function modeReadTask(round: number, target: number): PracticeTask {
  const ctx = pick(MODE_CTX, round);
  const freq = pick(MODE_SINGLE, round);
  const categories = modeCats(freq, ctx.color);
  const top = categories[argmax(freq)]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: `${ctx.q}: what is the MODE (most common value)?`,
    speakText: "The mode is the value with the tallest column — it happened most often.",
    options: order(categories.map((c) => ({ id: c.id, label: c.label })), round),
    correctOptionIds: [top.id],
    feedback: { correct: `Yes — ${top.label} is the mode; it has the tallest column.`, wrong: "The mode is the value that happened most — the tallest column." },
  };
}
// Judge how many modes a distribution has (one vs two).
export function modeCountTask(round: number, target: number): PracticeTask {
  const ctx = pick(MODE_CTX, round + 1);
  const bimodal = round % 2 === 1;
  // Step the freq pool by half-round so consecutive same-parity rounds land on
  // consecutive (distinct) sets instead of repeating a stride.
  const freq = bimodal ? pick(MODE_BI, Math.floor(round / 2)) : pick(MODE_SINGLE, Math.floor(round / 2));
  const categories = modeCats(freq, ctx.color);
  return {
    kind: "statisticaInference", target, display: "columns", categories,
    prompt: `${ctx.q}: how many modes does this data have?`,
    speakText: "Count how many values share the tallest column. One tallest is one mode; two equal tallest is two modes.",
    options: order([
      { id: "one", label: "One mode" },
      { id: "two", label: "Two modes" },
      { id: "none", label: "No clear mode" },
    ], round),
    correctOptionIds: [bimodal ? "two" : "one"],
    feedback: { correct: bimodal ? "Yes — two values are equally the tallest, so there are two modes." : "Yes — one value stands tallest, so there is one mode.", wrong: "Look for how many columns share the greatest height." },
  };
}

// ── W4 Line graphs: change over time (AC9M5ST02) ─────────────────────────────
type LineCtx = { y: string; unit: string; x: string[]; color: string; series: number[][] };
const LINE_CTX: LineCtx[] = [
  { y: "Temperature", unit: "°C", x: ["6am", "9am", "12pm", "3pm", "6pm"], color: C.red,
    series: [[12, 18, 24, 22, 15], [10, 15, 21, 25, 18], [14, 19, 28, 23, 16]] },
  { y: "Visitors", unit: "people", x: ["9am", "10am", "11am", "12pm", "1pm"], color: C.indigo,
    series: [[10, 25, 40, 35, 20], [15, 30, 45, 50, 25], [20, 35, 30, 45, 15]] },
  { y: "Rainfall", unit: "mm", x: ["Mon", "Tue", "Wed", "Thu", "Fri"], color: C.teal,
    series: [[5, 12, 20, 8, 3], [8, 4, 15, 22, 10], [12, 18, 6, 2, 14]] },
  { y: "Plant height", unit: "cm", x: ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"], color: C.green,
    series: [[2, 5, 9, 14, 20], [3, 6, 10, 13, 18], [1, 4, 8, 15, 22]] },
  { y: "Website visits", unit: "hits", x: ["Jan", "Feb", "Mar", "Apr", "May"], color: C.pink,
    series: [[20, 35, 30, 45, 50], [40, 30, 25, 35, 20], [15, 25, 40, 30, 45]] },
  { y: "Temperature", unit: "°C", x: ["Mon", "Tue", "Wed", "Thu", "Fri"], color: C.amber,
    series: [[22, 25, 28, 24, 20], [18, 21, 16, 23, 26], [24, 22, 19, 25, 27]] },
];
// Flatten every context's series into one pool so consecutive rounds land on
// distinct (context, data) pairs — nesting made the series index repeat.
const LINE_SERIES = LINE_CTX.flatMap((ctx) => ctx.series.map((values) => ({ ctx, values })));
function lineData(round: number): { ctx: LineCtx; points: Array<{ label: string; value: number }> } {
  const { ctx, values } = pick(LINE_SERIES, round);
  return { ctx, points: ctx.x.map((label, i) => ({ label, value: values[i]! })) };
}
function lineNumOptions(correct: number, round: number, step: number): Array<{ id: string; label: string }> {
  const cands = [correct + step, correct - step, correct + 2 * step].filter((n) => n > 0 && n !== correct);
  const seen = new Set<number>();
  const wrongs = cands.filter((n) => (seen.has(n) ? false : (seen.add(n), true))).slice(0, 2);
  return order([correct, ...wrongs].map((n) => ({ id: `n${n}`, label: String(n) })), round);
}
function lineTask(mode: "read" | "trend" | "infer", ctx: LineCtx, points: Array<{ label: string; value: number }>, extra: Partial<PracticeTask> & { prompt: string; speakText: string; options: Array<{ id: string; label: string }>; correctOptionIds: string[]; feedback: { correct: string; wrong: string } }): PracticeTask {
  return {
    kind: "statisticaLineGraph", mode, target: 0, unit: ctx.unit, yLabel: ctx.y, color: ctx.color, points,
    ...extra,
  } as PracticeTask;
}
// Read one value off the line at a point in time.
export function lineReadTask(round: number, target: number): PracticeTask {
  const { ctx, points } = lineData(round);
  const i = round % points.length;
  const p = points[i]!;
  const step = ctx.unit === "°C" ? 2 : 5;
  return lineTask("read", ctx, points, {
    target,
    prompt: `${ctx.y}: what was the ${ctx.y.toLowerCase()} at ${p.label}?`,
    speakText: `Find ${p.label} on the bottom, go up to the line, then across to the scale.`,
    options: lineNumOptions(p.value, round, step),
    correctOptionIds: [`n${p.value}`],
    feedback: { correct: `Yes — at ${p.label} it was ${p.value} ${ctx.unit}.`, wrong: `Go up from ${p.label} to the line, then read across to the scale.` },
  });
}
// Describe the trend between two points — rose, fell or stayed the same.
export function lineTrendTask(round: number, target: number): PracticeTask {
  const { ctx, points } = lineData(round);
  const i = round % (points.length - 1);
  const a = points[i]!, b = points[i + 1]!;
  const dir = b.value > a.value ? "up" : b.value < a.value ? "down" : "same";
  return lineTask("trend", ctx, points, {
    target,
    prompt: `${ctx.y}: what happened between ${a.label} and ${b.label}?`,
    speakText: "Compare the two points. If the line goes up it rose, down it fell, flat it stayed the same.",
    options: order([
      { id: "up", label: "It went up" },
      { id: "down", label: "It went down" },
      { id: "same", label: "It stayed the same" },
    ], round),
    correctOptionIds: [dir],
    feedback: { correct: dir === "up" ? `Yes — it rose from ${a.value} to ${b.value}.` : dir === "down" ? `Yes — it fell from ${a.value} to ${b.value}.` : "Yes — it stayed the same.", wrong: `Compare ${a.label} (${a.value}) with ${b.label} (${b.value}).` },
  });
}
// Infer when the value peaked or bottomed out.
export function lineInferTask(round: number, target: number): PracticeTask {
  const { ctx, points } = lineData(round);
  const askHigh = round % 2 === 0;
  const idx = points.reduce((best, p, i) => (askHigh ? (p.value > points[best]!.value ? i : best) : (p.value < points[best]!.value ? i : best)), 0);
  const ans = points[idx]!;
  return lineTask("infer", ctx, points, {
    target,
    prompt: `${ctx.y}: when was the ${ctx.y.toLowerCase()} ${askHigh ? "HIGHEST" : "LOWEST"}?`,
    speakText: askHigh ? "Find the highest point on the line, then read the time below it." : "Find the lowest point on the line, then read the time below it.",
    options: order(points.map((p) => ({ id: p.label, label: p.label })), round),
    correctOptionIds: [ans.label],
    feedback: { correct: `Yes — the ${askHigh ? "highest" : "lowest"} point (${ans.value} ${ctx.unit}) was at ${ans.label}.`, wrong: `Look for the ${askHigh ? "highest" : "lowest"} point on the line.` },
  });
}

// ── W5 Choosing displays: which display suits the data (AC9M5ST01) ───────────
type DisplayItem = { v: string; ex: string; best: "line" | "column" };
const DISPLAYS: DisplayItem[] = [
  { v: "Temperature every hour today", ex: "6am, 9am, 12pm, 3pm, 6pm", best: "line" },
  { v: "How a plant grew each week", ex: "Week 1 to Week 8", best: "line" },
  { v: "Website visits each month", ex: "Jan, Feb, Mar, Apr", best: "line" },
  { v: "A swimmer's time each race", ex: "Race 1 to Race 6", best: "line" },
  { v: "Rainfall each day this week", ex: "Mon to Sun", best: "line" },
  { v: "Your height on each birthday", ex: "age 5, 6, 7, 8", best: "line" },
  { v: "Favourite sport of the class", ex: "Soccer, Netball, Cricket", best: "column" },
  { v: "Number of each type of pet", ex: "Dog, Cat, Fish, Bird", best: "column" },
  { v: "Votes for class captain", ex: "Ana, Ben, Chloe", best: "column" },
  { v: "Favourite ice-cream flavour", ex: "Vanilla, Choc, Mango", best: "column" },
  { v: "How students travel to school", ex: "Walk, Car, Bus, Bike", best: "column" },
  { v: "Books borrowed by genre", ex: "Fantasy, Sport, History", best: "column" },
];
export function displayChoiceTask(round: number, target: number): PracticeTask {
  const item = pick(DISPLAYS, round);
  const why = item.best === "line" ? "It changes over time, so a line graph shows the trend best." : "It compares separate groups, so a column graph compares them best.";
  return {
    kind: "statisticaClassify", target,
    prompt: "Which display best shows this data?",
    speakText: "Data that changes over time suits a line graph. Data that compares groups suits a column graph.",
    variable: item.v, examples: item.ex,
    options: order([
      { id: "line", label: "Line graph" },
      { id: "column", label: "Column graph" },
      { id: "picto", label: "Pictograph" },
    ], round),
    correctOptionIds: [item.best],
    feedback: { correct: `Yes — ${why}`, wrong: "Does the data change over time (line graph) or compare groups (column graph)?" },
  };
}

type StudioDisplay = "line" | "column" | "table";
type StudioItem = {
  question: string;
  purpose: string;
  labels: string[];
  values: number[];
  unit: string;
  best: StudioDisplay;
  title: string;
};

const STUDIO_ITEMS: StudioItem[] = [
  { question: "How did the temperature change during the day?", purpose: "Make the rise, peak and fall easy to see.", labels: ["6am", "9am", "12pm", "3pm", "6pm"], values: [12, 17, 24, 22, 16], unit: "°C", best: "line", title: "Temperature through the day" },
  { question: "How did the bean plant grow over five weeks?", purpose: "Show how one measurement changed in time order.", labels: ["W1", "W2", "W3", "W4", "W5"], values: [3, 7, 11, 16, 22], unit: "cm", best: "line", title: "Bean plant growth by week" },
  { question: "Which class sport received the most votes?", purpose: "Compare the frequencies of separate categories.", labels: ["Soccer", "Netball", "Cricket", "Tennis"], values: [12, 9, 6, 4], unit: "votes", best: "column", title: "Class votes for favourite sport" },
  { question: "Which type of pet is most common?", purpose: "Make differences between pet categories easy to compare.", labels: ["Dog", "Cat", "Fish", "Bird"], values: [11, 8, 5, 3], unit: "pets", best: "column", title: "Pets owned by the class" },
  { question: "What was the exact rainfall on Wednesday?", purpose: "Look up one precise value quickly.", labels: ["Mon", "Tue", "Wed", "Thu", "Fri"], values: [4, 9, 13, 7, 5], unit: "mm", best: "table", title: "Daily rainfall this week" },
  { question: "Exactly how many books were borrowed from each genre?", purpose: "Read and report every exact frequency.", labels: ["Fantasy", "Sport", "History", "Science"], values: [18, 11, 7, 14], unit: "books", best: "table", title: "Library books borrowed by genre" },
  { question: "How did website visits change from January to May?", purpose: "Show the overall trend across ordered months.", labels: ["Jan", "Feb", "Mar", "Apr", "May"], values: [20, 28, 25, 39, 47], unit: "visits", best: "line", title: "Website visits from January to May" },
  { question: "Which way of travelling to school is least common?", purpose: "Compare separate travel categories.", labels: ["Walk", "Bike", "Bus", "Car"], values: [8, 4, 10, 13], unit: "students", best: "column", title: "How students travel to school" },
];

function studioData(item: StudioItem) {
  return { labels: item.labels, values: item.values, unit: item.unit };
}

export function displayMatchGuideTask(round: number, target: number): PracticeTask {
  const item = pick(STUDIO_ITEMS, round);
  return {
    kind: "statisticaDisplayStudio", mode: "guide", scene: "intro", target,
    prompt: "Choose the display that serves the question",
    speakText: "Use a line graph for change over time, a column graph to compare categories, and a table when exact values matter most.",
    question: "What does the reader need to discover?", purpose: "The best display depends on the question, not just the data.",
    data: studioData(item), displayOptions: ["line", "column", "table"], correctDisplay: item.best,
    guideItems: [
      { title: "Line graph", body: "See change and trends over time.", display: "line" },
      { title: "Column graph", body: "Compare separate categories.", display: "column" },
      { title: "Table", body: "Look up exact values quickly.", display: "table" },
    ],
    feedback: { correct: "Ready to match questions to displays.", wrong: "Choose a display by thinking about what the reader needs to discover." },
  };
}

export function displayMatchStudioTask(round: number, target: number): PracticeTask {
  const item = pick(STUDIO_ITEMS, round);
  return {
    kind: "statisticaDisplayStudio", mode: "match", target,
    prompt: "Match the question to its best display",
    speakText: `${item.question} ${item.purpose} Choose the display that makes that job easiest.`,
    question: item.question, purpose: item.purpose, data: studioData(item),
    displayOptions: ["line", "column", "table"], correctDisplay: item.best,
    feedback: { correct: `Correct — a ${item.best} display best serves this question.`, wrong: "Think about the purpose: trend over time, category comparison, or exact lookup." },
  };
}

export function displayCompareGuideTask(round: number, target: number): PracticeTask {
  const item = pick(STUDIO_ITEMS, round + 2);
  return {
    kind: "statisticaDisplayStudio", mode: "guide", scene: "intro", target,
    prompt: "The same data can tell different stories",
    speakText: "Two displays can both be accurate, but one may answer a particular question faster and more clearly. Compare what each display makes easy to notice.",
    question: item.question, purpose: "Compare displays by how clearly they answer the question.",
    data: studioData(item), displayOptions: ["line", "column", "table"], correctDisplay: item.best,
    guideItems: [
      { title: "Look", body: "What feature stands out first?", display: "column" },
      { title: "Ask", body: "What question must the display answer?", display: "table" },
      { title: "Decide", body: "Which view communicates it most clearly?", display: "line" },
    ],
    feedback: { correct: "Ready to compare displays.", wrong: "Compare each display against the question it needs to answer." },
  };
}

export function displayCompareStudioTask(round: number, target: number): PracticeTask {
  const item = pick(STUDIO_ITEMS, round + 1);
  const challenger: StudioDisplay = item.best === "table" ? "column" : "table";
  return {
    kind: "statisticaDisplayStudio", mode: "compare", target,
    prompt: "Which display answers the question more clearly?",
    speakText: `Both displays use the same data. ${item.question} Compare the views and choose the one that answers this purpose most clearly.`,
    question: item.question, purpose: item.purpose, data: studioData(item),
    displayOptions: round % 2 ? [challenger, item.best] : [item.best, challenger], correctDisplay: item.best,
    feedback: { correct: "Yes — both may be accurate, but that display communicates the required information more clearly.", wrong: "Do not choose only by appearance. Choose the display that answers the stated question most directly." },
  };
}

export function displayDesignGuideTask(round: number, target: number): PracticeTask {
  const item = pick(STUDIO_ITEMS, round + 4);
  return {
    kind: "statisticaDisplayStudio", mode: "guide", scene: "intro", target,
    prompt: "Plan a display that communicates clearly",
    speakText: "A strong display uses the right format, a title that says what the data shows, clear labels and a reason connected to the investigation question.",
    question: item.question, purpose: "Build for the reader: choose, label and justify.",
    data: studioData(item), displayOptions: ["line", "column", "table"], correctDisplay: item.best,
    guideItems: [
      { title: "1. Choose", body: "Match the display to the purpose." },
      { title: "2. Label", body: "Use a specific title and clear units." },
      { title: "3. Justify", body: "Explain why the display helps the reader." },
    ],
    feedback: { correct: "Ready to design a display.", wrong: "Choose, label and justify every display." },
  };
}

export function displayDesignStudioTask(round: number, target: number): PracticeTask {
  const item = pick(STUDIO_ITEMS, round + 2);
  const correctReason = item.best === "line" ? "It makes change over time easy to follow."
    : item.best === "column" ? "It makes category frequencies easy to compare."
    : "It makes exact values quick to find.";
  return {
    kind: "statisticaDisplayStudio", mode: "design", target,
    prompt: "Design the clearest display",
    speakText: `${item.question} Choose the display, then select a precise title and a justification connected to the question.`,
    question: item.question, purpose: item.purpose, data: studioData(item),
    displayOptions: ["line", "column", "table"], correctDisplay: item.best,
    titleOptions: order([
      { id: "clear", label: item.title },
      { id: "vague", label: "Our data" },
      { id: "wrong", label: "Class temperature results" },
    ], round),
    correctTitleId: "clear",
    reasonOptions: order([
      { id: "purpose", label: correctReason },
      { id: "colour", label: "It will look best in my favourite colour." },
      { id: "always", label: "This display is always the best for every data set." },
    ], round + 1),
    correctReasonId: "purpose",
    feedback: { correct: "Strong design — the display, title and justification all serve the investigation question.", wrong: "Check all three decisions: display purpose, specific title and evidence-based justification." },
  };
}

// ── Lesson map (18 lessons, 6 weeks) ─────────────────────────────────────────
const WEEK1_GENS: Record<string, [Gen, Gen, Gen, Gen]> = {
  // Teaching, fast recognition, reasoning/ordering, then application.
  "y5-statistics-w1-l1": [nominalTeachingTask, nominalResponseTask, nominalSortTask, nominalCategoryDesignTask],
  "y5-statistics-w1-l2": [ordinalTeachingTask, ordinalOrderTask, ordinalReasonTask, ordinalScaleFixTask],
  "y5-statistics-w1-l3": [discreteTeachingTask, discreteQuestionTask, discreteValidResponseTask, dataTypeSortTask],
};

const FOCUSED_GENS: Record<string, [Gen, Gen, Gen, Gen]> = {
  ...WEEK1_GENS,
  "y5-statistics-w2-l1": [mixedErrorTeachingTask, spotErrorTask, errorReasonTask, cleanErrorTask],
  "y5-statistics-w3-l1": [modeIntroductionTask, modeReadTask, modeFromListTask, modeReadTask],
  "y5-statistics-w5-l1": [displayMatchGuideTask, displayMatchStudioTask, displayMatchStudioTask, displayMatchStudioTask],
  "y5-statistics-w5-l2": [displayCompareGuideTask, displayCompareStudioTask, displayCompareStudioTask, displayCompareStudioTask],
  "y5-statistics-w5-l3": [displayDesignGuideTask, displayDesignStudioTask, displayDesignStudioTask, displayDesignStudioTask],
};

const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W2 Valid Data — Lessons 2 and 3 retain repeated validation practice.
  "y5-statistics-w2-l2": [spotErrorTask, spotErrorTask, spotErrorTask],
  "y5-statistics-w2-l3": [spotErrorTask, spotErrorTask, spotErrorTask],
  // W3 Mode & Shape — find the mode, more than one mode, describe the shape
  "y5-statistics-w3-l2": [modeCountTask, modeReadTask, shapeSpreadTask],
  "y5-statistics-w3-l3": [shapeConcentratedTask, shapeSpreadTask, modeReadTask],
  // W4 Line Graphs — read, change over time, make inferences (Year-5 star)
  "y5-statistics-w4-l1": [lineReadTask, lineReadTask, lineTrendTask],
  "y5-statistics-w4-l2": [lineTrendTask, lineReadTask, lineTrendTask],
  "y5-statistics-w4-l3": [lineInferTask, lineTrendTask, lineReadTask],
  // W6 Investigation — L1 & L2 run the full investigation; L3 is quick review
  "y5-statistics-w6-l1": [investigationTask, investigationTask, investigationTask],
  "y5-statistics-w6-l2": [investigationTask, investigationTask, investigationTask],
  "y5-statistics-w6-l3": [lineReadTask, modeReadTask, displayChoiceTask],
};

function focusedTaskSet(gens: [Gen, Gen, Gen, Gen], seed: number): RealmLessonTaskSet {
  let t = 10;
  const rounds = [seed + 3, seed + 7, seed + 11];
  return {
    teaching: () => gens[0](seed, ++t),
    activities: [
      () => gens[1](rounds[0]++, ++t),
      () => gens[2](rounds[1]++, ++t),
      () => gens[3](rounds[2]++, ++t),
    ],
  };
}

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

export function getStatisticaLevel5TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const m = /-w(\d+)-l(\d+)$/.exec(lessonId);
  const week = m ? Number(m[1]) : 1;
  const lesson = m ? Number(m[2]) : 1;
  const seed = (week - 1) * 2 + (lesson - 1);
  const focusedGens = FOCUSED_GENS[lessonId];
  if (focusedGens) return focusedTaskSet(focusedGens, seed);
  const gens = LESSON_GENS[lessonId];
  if (!gens) return null;
  return taskSet(gens, seed);
}

export const STATISTICA_LEVEL5_LESSON_IDS = [...Object.keys(FOCUSED_GENS), ...Object.keys(LESSON_GENS)];
