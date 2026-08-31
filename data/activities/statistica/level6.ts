import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  shapeConcentratedTask,
  shapeSpreadTask,
  shapeCompareTask,
  shapeVariationTask,
  investigationTask,
} from "@/data/activities/statistica/level4";
import { modeReadTask } from "@/data/activities/statistica/level5";

// ── Statistica Level 6 (Year 6) — AC9M6ST01 (compare data sets by mode, RANGE
// and shape using side-by-side displays; nominal/ordinal + discrete/continuous
// data), AC9M6ST02 (CRITIQUE statistics in the media — misleading graphs and
// unfair claims), AC9M6ST03 (pose, refine and conduct an investigation).
// Year 6's genuinely new content is the RANGE (highest - lowest), SIDE-BY-SIDE
// comparison of two data sets, the discrete-vs-continuous distinction, and
// CRITIQUING misleading representations — none of which exist in Levels 1-5.

type Gen = (round: number, target: number) => PracticeTask;

const C = { red: "#ef4444", amber: "#f59e0b", orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", pink: "#ec4899", indigo: "#6366f1" };
const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(arr: T[], round: number) => (round % 2 ? [...arr].reverse() : arr);
const range = (v: number[]) => Math.max(...v) - Math.min(...v);

// ── W1 Data types: nominal vs ordinal, discrete vs continuous (AC9M6ST01) ────
type CatItem = { v: string; ex: string; type: "nominal" | "ordinal" };
const NOMINAL_ORDINAL: CatItem[] = [
  { v: "Favourite colour", ex: "Red, Blue, Green", type: "nominal" },
  { v: "Type of pet", ex: "Dog, Cat, Fish", type: "nominal" },
  { v: "Eye colour", ex: "Brown, Blue, Green", type: "nominal" },
  { v: "Country of birth", ex: "Australia, India, Japan", type: "nominal" },
  { v: "Way to school", ex: "Walk, Car, Bus", type: "nominal" },
  { v: "Favourite fruit", ex: "Apple, Banana, Mango", type: "nominal" },
  { v: "Football team", ex: "Tigers, Swans, Blues", type: "nominal" },
  { v: "Star rating", ex: "1★, 2★, 3★, 4★, 5★", type: "ordinal" },
  { v: "T-shirt size", ex: "Small, Medium, Large", type: "ordinal" },
  { v: "Race finish", ex: "1st, 2nd, 3rd", type: "ordinal" },
  { v: "Spice level", ex: "Mild, Medium, Hot", type: "ordinal" },
  { v: "Skill level", ex: "Beginner, Intermediate, Expert", type: "ordinal" },
  { v: "Medal won", ex: "Bronze, Silver, Gold", type: "ordinal" },
  { v: "Satisfaction", ex: "Poor, OK, Great", type: "ordinal" },
];
export function nominalOrdinalTask(round: number, target: number): PracticeTask {
  const item = pick(NOMINAL_ORDINAL, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Is this categorical data nominal or ordinal?",
    speakText: "Nominal groups have no order. Ordinal groups have a clear order, like small to large.",
    variable: item.v, examples: item.ex,
    options: order([
      { id: "nominal", label: "Nominal (no order)" },
      { id: "ordinal", label: "Ordinal (ordered)" },
    ], round),
    correctOptionIds: [item.type],
    feedback: { correct: item.type === "ordinal" ? "Yes — these groups have a natural order, so it's ordinal." : "Yes — these groups have no order, so it's nominal.", wrong: "Is there a natural order to the groups (ordinal) or not (nominal)?" },
  };
}
type NumItem = { v: string; ex: string; type: "discrete" | "continuous" };
const DISCRETE_CONTINUOUS: NumItem[] = [
  { v: "Number of siblings", ex: "0, 1, 2, 3", type: "discrete" },
  { v: "Goals scored", ex: "0, 1, 2, 3", type: "discrete" },
  { v: "Books read", ex: "2, 5, 7, 10", type: "discrete" },
  { v: "Cars in the car park", ex: "12, 18, 25", type: "discrete" },
  { v: "Students in a class", ex: "24, 28, 30", type: "discrete" },
  { v: "Pets owned", ex: "0, 1, 2", type: "discrete" },
  { v: "Coins in a jar", ex: "40, 55, 63", type: "discrete" },
  { v: "Height", ex: "142.5 cm, 138 cm", type: "continuous" },
  { v: "Weight", ex: "35.2 kg, 41.8 kg", type: "continuous" },
  { v: "Temperature", ex: "18.4°C, 21.9°C", type: "continuous" },
  { v: "Time to run 100 m", ex: "14.3 s, 15.1 s", type: "continuous" },
  { v: "Length of a leaf", ex: "6.2 cm, 8.7 cm", type: "continuous" },
  { v: "Water in a bottle", ex: "0.75 L, 1.2 L", type: "continuous" },
  { v: "Distance to school", ex: "1.4 km, 2.8 km", type: "continuous" },
];
export function discreteContinuousTask(round: number, target: number): PracticeTask {
  const item = pick(DISCRETE_CONTINUOUS, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Is this numerical data discrete or continuous?",
    speakText: "Discrete data is counted in whole steps. Continuous data is measured and can fall between values.",
    variable: item.v, examples: item.ex,
    options: order([
      { id: "discrete", label: "Discrete (counted)" },
      { id: "continuous", label: "Continuous (measured)" },
    ], round),
    correctOptionIds: [item.type],
    feedback: { correct: item.type === "discrete" ? "Yes — counted in whole numbers, so it's discrete." : "Yes — measured and can fall between values, so it's continuous.", wrong: "Is it counted in whole steps (discrete) or measured (continuous)?" },
  };
}

type MeasureItem = {
  variable: string;
  examples: string;
  low: string;
  high: string;
  between: string;
  tool: string;
  unit: string;
  wrongTool: string;
};
const CONTINUOUS_MEASURES: MeasureItem[] = [
  { variable: "A student's height", examples: "142.4 cm, 142.45 cm, 142.5 cm", low: "142.4", high: "142.6", between: "142.5", tool: "Use a height measure and record centimetres", unit: "cm", wrongTool: "Count students and record people" },
  { variable: "Time to run 100 metres", examples: "14.2 s, 14.25 s, 14.3 s", low: "14.2", high: "14.4", between: "14.3", tool: "Use a stopwatch and record seconds", unit: "s", wrongTool: "Count runners and record runners" },
  { variable: "Water temperature", examples: "18.5°C, 18.55°C, 18.6°C", low: "18.5", high: "18.7", between: "18.6", tool: "Use a thermometer and record degrees Celsius", unit: "°C", wrongTool: "Use a ruler and record centimetres" },
  { variable: "Water in a bottle", examples: "0.7 L, 0.75 L, 0.8 L", low: "0.7", high: "0.9", between: "0.8", tool: "Use a measuring jug and record litres", unit: "L", wrongTool: "Count bottles and record bottles" },
  { variable: "Length of a leaf", examples: "6.2 cm, 6.25 cm, 6.3 cm", low: "6.2", high: "6.4", between: "6.3", tool: "Use a ruler and record centimetres", unit: "cm", wrongTool: "Use scales and record kilograms" },
  { variable: "Mass of a school bag", examples: "2.4 kg, 2.45 kg, 2.5 kg", low: "2.4", high: "2.6", between: "2.5", tool: "Use scales and record kilograms", unit: "kg", wrongTool: "Count the bags and record bags" },
];

export function continuousTeachingTask(round: number, target: number): PracticeTask {
  const item = pick(CONTINUOUS_MEASURES, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "What makes this CONTINUOUS numerical data?",
    speakText: "Continuous data is measured. A measurement can fall anywhere between two values, depending on the precision of the tool.",
    variable: item.variable, examples: item.examples,
    options: order([
      { id: "measured", label: "It is measured and can fall between values" },
      { id: "counted", label: "It is counted only in whole-number steps" },
      { id: "category", label: "It sorts responses into named groups" },
    ], round),
    correctOptionIds: ["measured"],
    feedback: { correct: "Correct — measurements can take values between the marked numbers.", wrong: "Ask whether the variable is counted in whole steps or measured along a scale." },
  };
}

export function valueBetweenTask(round: number, target: number): PracticeTask {
  const item = pick(CONTINUOUS_MEASURES, round + 1);
  return {
    kind: "statisticaClassify", target,
    prompt: `Which measurement could lie between ${item.low} and ${item.high} ${item.unit}?`,
    speakText: "Continuous measurements can take a value between two other measurements.",
    variable: item.variable, examples: `The tool measures in ${item.unit}.`,
    options: order([
      { id: "between", label: `${item.between} ${item.unit}` },
      { id: "low", label: `${item.low} ${item.unit}` },
      { id: "words", label: "About three objects" },
    ], round),
    correctOptionIds: ["between"],
    feedback: { correct: `Yes — ${item.between} lies between ${item.low} and ${item.high}.`, wrong: "Choose a measured value greater than the lower measurement and less than the higher measurement." },
  };
}

export function measurementPlanTask(round: number, target: number): PracticeTask {
  const item = pick(CONTINUOUS_MEASURES, round + 2);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which collection plan will produce useful continuous data?",
    speakText: "Choose a suitable measuring tool and record every result with the same unit.",
    variable: item.variable, examples: "Select the tool and unit that match the variable.",
    options: order([
      { id: "valid", label: item.tool },
      { id: "wrong", label: item.wrongTool },
      { id: "label", label: "Record each result as low, medium or high" },
    ], round),
    correctOptionIds: ["valid"],
    feedback: { correct: "Yes — the tool measures the variable and the shared unit makes results comparable.", wrong: "The plan needs a measuring tool and a numerical unit suited to the variable." },
  };
}

export function measurementPrecisionTask(round: number, target: number): PracticeTask {
  const item = pick(CONTINUOUS_MEASURES, round + 3);
  return {
    kind: "statisticaClassify", target,
    prompt: "Why can careful measurements contain different numbers of decimal places?",
    speakText: "A more precise tool can measure smaller intervals. Continuous data can be recorded to different levels of precision.",
    variable: item.variable, examples: item.examples,
    options: order([
      { id: "precision", label: "The tools may measure to different levels of precision" },
      { id: "invalid", label: "Any measurement with a decimal must be wrong" },
      { id: "category", label: "Decimals turn the measurement into categorical data" },
    ], round),
    correctOptionIds: ["precision"],
    feedback: { correct: "Correct — precision describes how finely a measuring tool records a value.", wrong: "Decimals can be valid measurements. Think about the smallest interval each tool can measure." },
  };
}

const COUNT_VARIABLES = ["Number of siblings", "Goals scored", "Books borrowed", "Students absent", "Cars in the car park", "Pets owned"];
const MEASURE_VARIABLES = ["Height", "Running time", "Water temperature", "Leaf length", "Bottle volume", "School bag mass"];

export function countMeasureTeachingTask(round: number, target: number): PracticeTask {
  const measured = round % 2 === 0;
  const variable = measured ? pick(MEASURE_VARIABLES, round) : pick(COUNT_VARIABLES, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Should this variable be counted or measured?",
    speakText: "Count separate objects or events in whole steps. Measure attributes such as length, time, temperature, volume or mass.",
    variable, examples: "Choose how the class should collect the numerical data.",
    options: order([
      { id: "count", label: "Count it — discrete data" },
      { id: "measure", label: "Measure it — continuous data" },
    ], round),
    correctOptionIds: [measured ? "measure" : "count"],
    feedback: { correct: measured ? "Yes — use a tool to measure this attribute." : "Yes — count each separate object or event.", wrong: "Can the result fall between values, or only move in separate whole-number steps?" },
  };
}

export function countMeasureSortTask(round: number, target: number): PracticeTask {
  const items = [0, 1, 2].flatMap((offset) => [
    { label: pick(COUNT_VARIABLES, round + offset), category: "count" },
    { label: pick(MEASURE_VARIABLES, round + offset + 2), category: "measure" },
  ]);
  return {
    kind: "statisticaSort", target,
    prompt: "Sort each variable by how its data should be collected.",
    speakText: "Put whole-number counts under count. Put attributes collected with a measuring tool under measure.",
    items: order(items, round).map((item, index) => ({ id: `collect-${index}`, ...item })),
    categories: [
      { id: "count", label: "Count — discrete", color: C.indigo },
      { id: "measure", label: "Measure — continuous", color: C.teal },
    ],
    feedback: { correct: "Correct — counts use whole steps, while measurements can fall between values.", wrong: "Ask whether each variable needs counting or a measuring tool." },
  };
}

type CollectionPlan = { variable: string; good: string; wrongType: string; wrongUnit: string };
const COLLECTION_PLANS: CollectionPlan[] = [
  { variable: "Number of goals in each game", good: "Count the goals and record a whole number", wrongType: "Measure the goals with a ruler", wrongUnit: "Record each answer in kilograms" },
  { variable: "Time for each student to sprint 50 metres", good: "Use one stopwatch and record seconds", wrongType: "Count how many students run", wrongUnit: "Record each time in centimetres" },
  { variable: "Mass of each lunch box", good: "Use the same scales and record grams", wrongType: "Count the lunch boxes only", wrongUnit: "Record each mass in seconds" },
  { variable: "Number of books borrowed by each student", good: "Count the books and record a whole number", wrongType: "Measure the height of the book stack", wrongUnit: "Record each answer in litres" },
  { variable: "Temperature of water samples", good: "Use one thermometer and record degrees Celsius", wrongType: "Count the water samples only", wrongUnit: "Record each temperature in metres" },
  { variable: "Volume of water in each bottle", good: "Use a measuring jug and record millilitres", wrongType: "Count the bottles only", wrongUnit: "Record each volume in seconds" },
];

export function collectionMethodTask(round: number, target: number): PracticeTask {
  const item = pick(COLLECTION_PLANS, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which method will collect comparable data?",
    speakText: "Use the same suitable method and unit for every member of the data set.",
    variable: item.variable, examples: "Choose the collection instruction for the whole class.",
    options: order([
      { id: "good", label: item.good },
      { id: "type", label: item.wrongType },
      { id: "unit", label: item.wrongUnit },
    ], round),
    correctOptionIds: ["good"],
    feedback: { correct: "Yes — that method matches the variable and records every result consistently.", wrong: "Check whether the method and unit actually measure or count the named variable." },
  };
}

export function validCollectionResponseTask(round: number, target: number): PracticeTask {
  const measured = pick(CONTINUOUS_MEASURES, round + 1);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which response is ready to add to this measured data set?",
    speakText: "A useful measurement includes a numerical value and the agreed unit.",
    variable: measured.variable, examples: `The class agreed to record every result in ${measured.unit}.`,
    options: order([
      { id: "valid", label: `${measured.between} ${measured.unit}` },
      { id: "missing", label: measured.between },
      { id: "category", label: "Medium" },
    ], round),
    correctOptionIds: ["valid"],
    feedback: { correct: "Correct — the response has a value and the agreed measurement unit.", wrong: "The data set needs a numerical measurement recorded with the agreed unit." },
  };
}

const FOUR_TYPE_ITEMS: Record<"nominal" | "ordinal" | "discrete" | "continuous", string[]> = {
  nominal: ["Favourite music", "Eye colour", "Travel method", "Pet type"],
  ordinal: ["Satisfaction level", "T-shirt size", "Race place", "Spice level"],
  discrete: ["Goals scored", "Siblings", "Books borrowed", "Students absent"],
  continuous: ["Height", "Running time", "Temperature", "Water volume"],
};

export function comparisonTeachingTask(round: number, target: number): PracticeTask {
  return {
    kind: "statisticaClassify", target,
    prompt: "What must be checked before two data sets are compared?",
    speakText: "A fair comparison needs the same variable, compatible units and collection rules that measure or count in the same way.",
    variable: "Two Year 6 classes collected data", examples: "Decide what makes their results comparable.",
    options: order([
      { id: "match", label: "Same variable, compatible units and collection method" },
      { id: "size", label: "Both tables use the same font size" },
      { id: "colour", label: "Both graphs use the same favourite colour" },
    ], round),
    correctOptionIds: ["match"],
    feedback: { correct: "Correct — comparable data must represent the same variable on compatible terms.", wrong: "Visual styling does not make data comparable. Check the variable, units and collection method." },
  };
}

export function fourTypeSortTask(round: number, target: number): PracticeTask {
  const types = ["nominal", "ordinal", "discrete", "continuous"] as const;
  const chosen = types.flatMap((type, typeIndex) => [0, 2].map((offset) => ({
    label: pick(FOUR_TYPE_ITEMS[type], round + typeIndex + offset),
    category: type,
  })));
  return {
    kind: "statisticaSort", target,
    prompt: "Sort the variables before choosing how to compare them.",
    speakText: "Nominal is unordered categories. Ordinal is ordered categories. Discrete is counted. Continuous is measured.",
    items: order(chosen, round).map((item, index) => ({ id: `type-${index}`, ...item })),
    categories: [
      { id: "nominal", label: "Nominal", color: C.indigo },
      { id: "ordinal", label: "Ordinal", color: C.amber },
      { id: "discrete", label: "Discrete", color: C.teal },
      { id: "continuous", label: "Continuous", color: C.pink },
    ],
    feedback: { correct: "Correct — now the data type can guide how the sets are represented and compared.", wrong: "Check whether each variable is an unordered category, ordered category, count or measurement." },
  };
}

const COMPARISON_PAIRS = [
  { focus: "Compare running performance", good: "Class A and Class B 100 m times, both recorded in seconds", wrongVariable: "Class A running times and Class B favourite sports", wrongUnit: "Class A times in seconds and Class B heights in centimetres" },
  { focus: "Compare plant growth", good: "Plant A and Plant B heights, both measured weekly in centimetres", wrongVariable: "Plant A height and Plant B number of leaves", wrongUnit: "Plant A height in centimetres and Plant B mass in grams" },
  { focus: "Compare reading activity", good: "Class A and Class B books read, both counted over the same month", wrongVariable: "Class A books read and Class B reading enjoyment", wrongUnit: "Class A books per month and Class B minutes per day" },
  { focus: "Compare water temperature", good: "Tank A and Tank B temperatures, measured at the same times in degrees Celsius", wrongVariable: "Tank A temperature and Tank B water volume", wrongUnit: "Tank A temperature in Celsius and Tank B depth in centimetres" },
];

export function comparablePairTask(round: number, target: number): PracticeTask {
  const item = pick(COMPARISON_PAIRS, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which pair of data sets can be compared meaningfully?",
    speakText: "Choose two sets that record the same variable with compatible units and collection periods.",
    variable: item.focus, examples: "Select the fair comparison.",
    options: order([
      { id: "good", label: item.good },
      { id: "variable", label: item.wrongVariable },
      { id: "unit", label: item.wrongUnit },
    ], round),
    correctOptionIds: ["good"],
    feedback: { correct: "Yes — those sets measure the same variable on compatible terms.", wrong: "A meaningful comparison needs the same variable, compatible units and matching collection conditions." },
  };
}

// ── W2/W3 Range: highest minus lowest value in a set (AC9M6ST01) ─────────────
const RANGE_CTX = [
  { q: "Goals scored each game", labels: ["G1", "G2", "G3", "G4", "G5"] },
  { q: "Books read each week", labels: ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"] },
  { q: "Laps run each day", labels: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { q: "Points scored each round", labels: ["R1", "R2", "R3", "R4", "R5"] },
  { q: "Cans collected each day", labels: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { q: "Minutes read each night", labels: ["Sun", "Mon", "Tue", "Wed", "Thu"] },
];
const RANGE_SETS = [
  [8, 3, 12, 6, 9], [15, 7, 20, 11, 4], [10, 22, 6, 14, 18], [5, 9, 3, 12, 7],
  [18, 11, 25, 14, 8], [6, 13, 9, 4, 11], [20, 12, 26, 16, 9], [7, 15, 4, 11, 9],
];
type RangeCat = { id: string; label: string; color: string; count: number };
function rangeCats(labels: string[], vals: number[], color: string): RangeCat[] {
  return labels.map((label, i) => ({ id: `c${i}`, label, color, count: vals[i]! }));
}
function rangeNumOptions(correct: number, hi: number, round: number): Array<{ id: string; label: string }> {
  // hi (the highest value) is the classic "read the top, not the spread" trap.
  const cands = [hi, correct + 3, correct - 3, correct + 6].filter((n) => n > 0 && n !== correct);
  const seen = new Set<number>();
  const wrongs = cands.filter((n) => (seen.has(n) ? false : (seen.add(n), true))).slice(0, 2);
  return order([correct, ...wrongs].map((n) => ({ id: `n${n}`, label: String(n) })), round);
}
export function rangeIntroductionTask(round: number, target: number): PracticeTask {
  const vals = pick(RANGE_SETS, round * 3 + 1);
  const hi = Math.max(...vals), lo = Math.min(...vals), result = hi - lo;
  return {
    kind: "statisticaConcept", scene: "intro", target,
    title: "What is the range?",
    definition: "The range tells us how far the data spreads from its lowest value to its highest value.",
    speakText: `First find the lowest value, ${lo}. Then find the highest value, ${hi}. Subtract the lowest from the highest. ${hi} take away ${lo} equals ${result}, so the range is ${result}.`,
    exampleLabel: "Find the two endpoints",
    exampleValues: vals.map(String),
    highlightValue: String(hi),
    secondaryHighlightValue: String(lo),
    explanation: `Highest ${hi} − lowest ${lo} = range ${result}. The range is not the highest value; it is the distance between the highest and lowest values.`,
    continueLabel: "Calculate the range",
    feedback: { correct: "Now find the highest and lowest values, then subtract.", wrong: "Range equals the highest value minus the lowest value." },
  };
}
export function rangeTask(round: number, target: number): PracticeTask {
  const ctx = pick(RANGE_CTX, round);
  const vals = pick(RANGE_SETS, round * 3 + 1);
  const categories = rangeCats(ctx.labels, vals, C.indigo);
  const hi = Math.max(...vals), lo = Math.min(...vals), r = hi - lo;
  return {
    kind: "statisticaInference", target, display: "columns", categories,
    prompt: `${ctx.q}: what is the RANGE (highest − lowest)?`,
    speakText: "The range is the highest value take away the lowest value.",
    options: rangeNumOptions(r, hi, round),
    correctOptionIds: [`n${r}`],
    feedback: { correct: `Yes — ${hi} − ${lo} = ${r}.`, wrong: `Find the highest (${hi}) and lowest (${lo}) columns, then subtract.` },
  };
}
// Compare the range of two side-by-side data sets.
export function rangeCompareTask(round: number, target: number): PracticeTask {
  const ctx = pick(RANGE_CTX, round + 1);
  const a = pick(RANGE_SETS, round);
  let b = pick(RANGE_SETS, round * 3 + 2);
  let guard = 0;
  while (range(b) === range(a) && guard < RANGE_SETS.length) { b = pick(RANGE_SETS, round * 3 + 2 + ++guard); }
  const answer = range(a) > range(b) ? "a" : "b";
  return {
    kind: "statisticaShape", mode: "compare", target, display: "columns",
    categories: rangeCats(ctx.labels, a, C.teal), categoriesB: rangeCats(ctx.labels, b, C.pink),
    setLabelA: "Group A", setLabelB: "Group B",
    prompt: `${ctx.q}: which group has the BIGGER range (most spread out)?`,
    speakText: "Work out the range of each group — highest minus lowest — and compare them.",
    options: order([{ id: "a", label: "Group A has the bigger range" }, { id: "b", label: "Group B has the bigger range" }], round),
    correctOptionIds: [answer],
    feedback: { correct: `Yes — its highest and lowest values are furthest apart (range ${range(answer === "a" ? a : b)}).`, wrong: "Find the highest and lowest bar in each group; the bigger gap is the bigger range." },
  };
}

// ── W4 Statistics in the media: is the claim fair? (AC9M6ST02) ───────────────
type ClaimItem = {
  claim: string;
  result: string;
  sample: string;
  collection: string;
  verdict: "fair" | "misleading" | "insufficient";
  reason: string;
};
const CLAIMS: ClaimItem[] = [
  { claim: "9 out of 10 dentists recommend it!", result: "9 of the 10 dentists asked recommended the product.", sample: "10 dentists selected by the manufacturer.", collection: "The manufacturer paid for and ran the product trial.", verdict: "misleading", reason: "the result describes 9 of 10 sponsor-selected dentists, not dentists generally" },
  { claim: "Most students love maths.", result: "18 of 20 students said they love maths.", sample: "20 members of the school maths club.", collection: "A voluntary poll was taken during a maths club meeting.", verdict: "misleading", reason: "maths club members are a biased sample of all students" },
  { claim: "Sales doubled this year!", result: "Sales increased from 100 units last year to 200 units this year.", sample: "Every recorded sale from both full calendar years.", collection: "The totals came from the same sales system and used the same dates.", verdict: "fair", reason: "200 is exactly double 100 and the two complete years are comparable" },
  { claim: "60% of students chose pizza.", result: "120 of 200 surveyed students chose pizza.", sample: "200 students randomly selected across all year levels.", collection: "Each student chose one lunch option in the same anonymous survey.", verdict: "fair", reason: "120 out of 200 equals 60% and the sample covers the school" },
  { claim: "Our team is the most popular.", result: "The team has 4,200 online followers.", sample: "Follower totals are given for this team only.", collection: "No popularity results for any other team were collected.", verdict: "insufficient", reason: "a comparison claim needs information about the other teams" },
  { claim: "Crime is falling fast.", result: "Reports fell from 42 in June to 31 in July.", sample: "Two months of reports from one police district.", collection: "No earlier months or seasonal comparison were supplied.", verdict: "insufficient", reason: "two months are not enough to establish a fast downward trend" },
  { claim: "Everyone prefers our brand.", result: "18 of 25 people preferred the brand; 7 chose another brand.", sample: "25 existing customers approached inside the brand's store.", collection: "The brand's own staff asked the questions.", verdict: "misleading", reason: "18 out of 25 is not everyone, and the store sample is biased" },
  { claim: "Half the class walks to school.", result: "15 of the class's 30 students walk to school.", sample: "All 30 students in the class responded.", collection: "The teacher recorded one travel method for every student.", verdict: "fair", reason: "15 is exactly half of 30 and the whole class was included" },
  { claim: "This town is the sunniest.", result: "The town had 6 sunny days during one week.", sample: "One week of weather from this town only.", collection: "No other towns or longer time periods were measured.", verdict: "insufficient", reason: "the claim needs comparable weather data from other towns over more time" },
  { claim: "Most people agree with the plan.", result: "82 of 100 respondents supported the plan.", sample: "100 subscribers to the campaign's supporter newsletter.", collection: "The survey link was sent only to existing supporters.", verdict: "misleading", reason: "the high result comes from a sample already likely to support the plan" },
  { claim: "The new bus is always on time.", result: "The bus was on time for 96 of 100 recorded trips.", sample: "Every trip made by the bus during one month.", collection: "Arrival times were taken from the complete trip log.", verdict: "misleading", reason: "96% is strong, but four late trips mean it was not always on time" },
  { claim: "Reading scores jumped up.", result: "This year's average reading score is 74 points.", sample: "All current Year 6 students completed the same test.", collection: "No earlier score or comparison year was provided.", verdict: "insufficient", reason: "an increase cannot be calculated without an earlier result" },
];
export function mediaClaimTask(round: number, target: number): PracticeTask {
  const item = pick(CLAIMS, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Does the evidence support the claim?",
    speakText: `Claim: ${item.claim} Result: ${item.result} Sample: ${item.sample} How it was collected: ${item.collection} Decide whether the evidence really supports the claim.`,
    variable: `“${item.claim}”`, examples: item.result,
    variableLabel: "Claim",
    examplesLabel: "Survey result",
    supportingDetails: [
      { label: "Who was included", value: item.sample },
      { label: "How it was collected", value: item.collection },
    ],
    options: order([
      { id: "fair", label: "Yes — the claim is fair" },
      { id: "misleading", label: "No — it's misleading" },
      { id: "insufficient", label: "Not enough data to tell" },
    ], round),
    correctOptionIds: [item.verdict],
    feedback: { correct: `Right — ${item.reason}.`, wrong: "Check the result, who was included and how the information was collected. Does that evidence justify every word in the claim?" },
  };
}

type MediaDataCase = {
  title: string;
  labels: string[];
  values: number[];
  unit: string;
  claim: string;
  sample: string;
  method: string;
};
const MEDIA_DATA_CASES: MediaDataCase[] = [
  { title: "Preferred lunch", labels: ["Pizza", "Pasta", "Salad"], values: [45, 30, 25], unit: "students", claim: "Nearly everyone chose pizza.", sample: "100 students selected across all year levels.", method: "Each student selected one option in the same anonymous survey." },
  { title: "Travel to school", labels: ["Active", "Car"], values: [36, 24], unit: "students", claim: "Three quarters of students use active travel.", sample: "60 students randomly selected from the school roll.", method: "Travel method was recorded on the same school day." },
  { title: "Device choice", labels: ["Tablet", "Laptop"], values: [48, 32], unit: "students", claim: "Twice as many students chose tablets.", sample: "80 students completed the technology survey.", method: "Every participant selected exactly one device." },
  { title: "After-school activity", labels: ["Sport", "Music", "Reading"], values: [21, 9, 5], unit: "students", claim: "Sport was chosen by 60% of students.", sample: "All 35 students in two Year 6 classes responded.", method: "Students nominated their main activity for the same week." },
  { title: "Library borrowing", labels: ["Fiction", "Non-fiction", "Graphic"], values: [27, 12, 6], unit: "books", claim: "Fiction borrowing was greater than the other categories combined.", sample: "All 45 books borrowed by Year 6 during one week.", method: "Each loan was exported once from the library system." },
  { title: "Park preference", labels: ["Adventure", "Nature", "Sports"], values: [44, 36, 20], unit: "responses", claim: "A majority preferred the adventure park.", sample: "100 residents randomly selected from the council register.", method: "Residents selected one preferred park design." },
];

function mediaTaskBase(item: MediaDataCase, round: number, target: number) {
  return {
    kind: "statisticaMediaAnalysis" as const,
    target,
    claim: item.claim,
    data: { title: item.title, labels: item.labels, values: item.values, unit: item.unit },
    display: (round % 2 === 0 ? "columns" : "table") as "columns" | "table",
    sample: item.sample,
    method: item.method,
  };
}

export function mediaCalculateTask(round: number, target: number): PracticeTask {
  const item = pick(MEDIA_DATA_CASES, round);
  const total = item.values.reduce((sum, value) => sum + value, 0);
  const largest = Math.max(...item.values);
  const leader = item.labels[item.values.indexOf(largest)]!;
  const percent = Math.round((largest / total) * 100);
  return {
    ...mediaTaskBase(item, round, target), mode: "calculate",
    prompt: `Calculate the share who chose ${leader}.`,
    speakText: `Add the frequencies to find the total, then divide ${largest} by that total and convert the result to a percentage.`,
    evidenceNote: `${largest} chose ${leader}. First calculate the total number represented.`,
    options: order([
      { id: "correct", label: `${percent}% — ${largest} out of ${total}` },
      { id: "largest", label: `${largest}% — use the largest frequency as the percent` },
      { id: "remainder", label: `${100 - percent}% — use everyone outside the leading group` },
      { id: "double", label: `${Math.min(100, percent + 20)}% — estimate from the tallest display` },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: `Correct — ${largest} ÷ ${total} = ${percent}%.`, wrong: `Find the total first, then calculate ${largest} out of that total.` },
  };
}

export function mediaCompareTask(round: number, target: number): PracticeTask {
  const item = pick(MEDIA_DATA_CASES, round + 1);
  const sorted = item.values.map((value, index) => ({ value, label: item.labels[index]! })).sort((a, b) => b.value - a.value);
  const difference = sorted[0]!.value - sorted[1]!.value;
  return {
    ...mediaTaskBase(item, round, target), mode: "compare",
    prompt: "What does a calculation show about the two leading categories?",
    speakText: `Identify the two greatest frequencies and subtract. Do not judge only by the visual height of the columns.`,
    evidenceNote: `Compare ${sorted[0]!.label} with ${sorted[1]!.label}.`,
    options: order([
      { id: "correct", label: `${sorted[0]!.label} leads ${sorted[1]!.label} by ${difference} ${item.unit}.` },
      { id: "sum", label: `The difference is ${sorted[0]!.value + sorted[1]!.value} ${item.unit}.` },
      { id: "reverse", label: `${sorted[1]!.label} leads by ${difference} ${item.unit}.` },
      { id: "equal", label: "The two leading categories are equal." },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: `Yes — ${sorted[0]!.value} − ${sorted[1]!.value} = ${difference}.`, wrong: "Read the two greatest frequencies and subtract the second from the first." },
  };
}

export function mediaSupportedConclusionTask(round: number, target: number): PracticeTask {
  const item = pick(MEDIA_DATA_CASES, round + 2);
  const total = item.values.reduce((sum, value) => sum + value, 0);
  const largest = Math.max(...item.values);
  const leader = item.labels[item.values.indexOf(largest)]!;
  const percent = Math.round((largest / total) * 100);
  return {
    ...mediaTaskBase(item, round, target), mode: "conclusion",
    prompt: "Which conclusion is fully supported by the evidence?",
    speakText: "Choose the conclusion that reports the exact result without exaggerating it or claiming a cause the data did not test.",
    evidenceNote: "Use a calculation and check every word in the conclusion.",
    options: order([
      { id: "correct", label: `${leader} was the largest category: ${largest} of ${total}, or ${percent}%.` },
      { id: "everyone", label: `Everyone preferred ${leader}.` },
      { id: "cause", label: `${leader} was largest because it is objectively the best choice.` },
      { id: "majority", label: `${leader} had a majority, regardless of whether ${percent}% exceeds 50%.` },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: "Correct — that conclusion states the result precisely and does not go beyond the evidence.", wrong: "Reject absolute, causal or majority claims unless the displayed data actually establishes them." },
  };
}

type MethodCase = MediaDataCase & { flaw: string; repair: string; cautious: string };
const METHOD_CASES: MethodCase[] = [
  { ...MEDIA_DATA_CASES[0]!, claim: "Most Australian students choose pizza.", sample: "20 customers leaving one pizza shop.", method: "The shop owner asked customers at Friday dinner time.", flaw: "The convenience sample already favours pizza customers.", repair: "Randomly sample students from different schools, regions and year levels.", cautious: "In this pizza-shop sample, 45% selected pizza." },
  { ...MEDIA_DATA_CASES[1]!, claim: "Students never want to travel by car.", sample: "Members of the school's cycling club.", method: "Students answered by raising their hands during a cycling meeting.", flaw: "Cycling club members are unlikely to represent all students.", repair: "Randomly select students from the full school roll and survey them privately.", cautious: "In the cycling-club sample, active travel was more common than car travel." },
  { ...MEDIA_DATA_CASES[2]!, claim: "Tablets are the best device for learning.", sample: "80 students who had just received free tablets.", method: "The tablet supplier asked, 'How much do you love your new tablet?'", flaw: "The leading question and supplier-selected context can influence responses.", repair: "Use a neutral question and randomly sample students with experience using both devices.", cautious: "In this sample, 48 of 80 students selected tablets." },
  { ...MEDIA_DATA_CASES[3]!, claim: "Year 6 students spend all their free time playing sport.", sample: "35 students attending an interschool sports day.", method: "Students named one activity while waiting for their event.", flaw: "The event-based sample over-represents students interested in sport.", repair: "Survey all Year 6 classes on an ordinary day using the same neutral question.", cautious: "Sport was the most common response in this sports-day sample." },
  { ...MEDIA_DATA_CASES[4]!, claim: "Children only want fiction books.", sample: "Loans recorded from the fiction floor display.", method: "The report omitted loans from classrooms and the digital library.", flaw: "Part of the relevant borrowing data was omitted.", repair: "Combine fiction, non-fiction, graphic, classroom and digital loans for the same period.", cautious: "Fiction was largest among the three loan categories shown." },
  { ...MEDIA_DATA_CASES[5]!, claim: "The whole town demands an adventure park.", sample: "100 responses to a link posted in an adventure-sports group.", method: "People chose whether to open the link and complete the survey.", flaw: "The voluntary online sample is likely to over-represent adventure-sports supporters.", repair: "Randomly contact residents from the council register and follow up non-responses.", cautious: "Adventure was the largest choice among people who answered this link." },
];

export function mediaMethodTask(round: number, target: number): PracticeTask {
  const item = pick(METHOD_CASES, round);
  return {
    ...mediaTaskBase(item, round, target), mode: "method",
    prompt: "What is the strongest problem with this investigation?",
    speakText: "Inspect who was included and how responses were collected. Choose the flaw that could systematically influence the result.",
    options: order([
      { id: "correct", label: item.flaw },
      { id: "colour", label: "The display does not use enough different colours." },
      { id: "whole", label: "Every survey must ask the entire population." },
      { id: "size", label: "The category names contain different numbers of letters." },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: `Correct — ${item.flaw}`, wrong: "Look for a sampling or collection choice that could push the results in one direction." },
  };
}

export function mediaRedesignTask(round: number, target: number): PracticeTask {
  const item = pick(METHOD_CASES, round + 1);
  return {
    ...mediaTaskBase(item, round, target), mode: "method",
    prompt: "Which redesign would produce stronger evidence?",
    speakText: "Improve both representation and consistency. The best redesign reduces selection or response bias.",
    options: order([
      { id: "correct", label: item.repair },
      { id: "more", label: "Ask more people from exactly the same biased group." },
      { id: "headline", label: "Keep the method but make the headline less specific." },
      { id: "public", label: "Show every respondent the current result before they answer." },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: "Yes — that redesign makes the sample and collection process more representative.", wrong: "A stronger design changes how participants are selected or how the question is asked." },
  };
}

export function mediaMethodConclusionTask(round: number, target: number): PracticeTask {
  const item = pick(METHOD_CASES, round + 2);
  return {
    ...mediaTaskBase(item, round, target), mode: "conclusion",
    prompt: "Which conclusion respects the limits of this investigation?",
    speakText: "A defensible conclusion names the sample and does not generalise beyond the people or data actually included.",
    options: order([
      { id: "correct", label: item.cautious },
      { id: "claim", label: item.claim },
      { id: "proof", label: "The result proves the same pattern applies everywhere." },
      { id: "none", label: "Biased sampling means none of the recorded results can be described." },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: "Correct — it reports what happened in this sample without pretending the sample represents everyone.", wrong: "Keep the conclusion tied to the people and categories that were actually measured." },
  };
}

type DistortionCase = {
  title: string;
  labels: string[];
  values: number[];
  unit: string;
  display: "columns" | "pictograph" | "selected" | "parts";
  axisMin?: number;
  visualMultipliers?: number[];
  source?: { labels: string[]; values: number[] };
  claim: string;
  note: string;
  flaw: string;
  repair: string;
  defence: string;
};
const AXIS_DISTORTION_CASES: DistortionCase[] = [
  { display: "columns", title: "Approval rating", labels: ["Before", "After"], values: [92, 98], unit: "%", axisMin: 90, claim: "Approval exploded after the campaign!", note: "The columns begin at 90%, so their visible heights represent 2 and 8 points rather than 92 and 98.", flaw: "The cut-off axis makes a 6-point rise look four times as large.", repair: "Redraw the columns from 0% to 100% and report the rise from 92% to 98%.", defence: "Approval rose 6 percentage points, but the cut-off axis makes the visible columns look four times different." },
  { display: "columns", title: "Weekly sales", labels: ["Week 1", "Week 2"], values: [480, 520], unit: "sales", axisMin: 450, claim: "Sales have gone through the roof!", note: "The columns begin at 450, so the visible heights are 30 and 70 although the totals are 480 and 520.", flaw: "The cut-off axis makes a 40-sale rise look much larger than it is.", repair: "Begin the columns at zero and report the increase from 480 to 520 sales.", defence: "Sales rose by 40, about 8%, but the 450 baseline greatly exaggerates the visual change." },
  { display: "columns", title: "Average score", labels: ["Class A", "Class B"], values: [74, 78], unit: "points", axisMin: 72, claim: "Class B completely outperformed Class A!", note: "The visible columns represent only the 2 and 6 points above a baseline of 72.", flaw: "The cut-off axis makes a 4-point difference look like one score is three times the other.", repair: "Use the full assessment scale and state that the averages differ by 4 points.", defence: "Class B averaged 4 points more, but the baseline of 72 turns the visible heights into a misleading 2-to-6 comparison." },
  { display: "columns", title: "Water use", labels: ["Old", "New"], values: [310, 290], unit: "litres", axisMin: 280, claim: "The new system almost eliminated water use!", note: "The columns begin at 280 litres, leaving visible heights of 30 and 10.", flaw: "The cut-off axis makes a 20-litre reduction look like use fell by two thirds.", repair: "Begin at zero and report the reduction from 310 to 290 litres.", defence: "Use fell by 20 litres, about 6%, not by the two thirds suggested by the visible column heights." },
  { display: "columns", title: "Downloads", labels: ["April", "May"], values: [995, 1005], unit: "downloads", axisMin: 990, claim: "Downloads doubled in May!", note: "The baseline of 990 makes the visible heights 5 and 15, even though the totals are 995 and 1005.", flaw: "The cut-off axis makes a 10-download rise look like the result tripled.", repair: "Begin at zero and replace 'doubled' with the increase from 995 to 1005 downloads.", defence: "Downloads rose by 10, about 1%, while the cut-off axis makes the visible height triple." },
  { display: "columns", title: "Race time", labels: ["Earlier", "Current"], values: [65, 62], unit: "seconds", axisMin: 60, claim: "The runner is now unbelievably faster!", note: "Lower times are better. The baseline of 60 leaves visible column heights of 5 and 2 seconds.", flaw: "The cut-off axis exaggerates a reduction of only 3 seconds.", repair: "Use a zero baseline and state that the race time improved from 65 to 62 seconds.", defence: "The time improved by 3 seconds, about 5%; the cut-off axis makes the reduction look much larger." },
];

const GRAPHIC_DISTORTION_CASES: DistortionCase[] = [
  { display: "pictograph", title: "Game downloads", labels: ["April", "May"], values: [100, 200], unit: "downloads", visualMultipliers: [1, 2], claim: "May downloads were four times April's!", note: "The May square is twice as wide and twice as tall as April's square.", flaw: "Doubling both dimensions creates four times the area for only twice the value.", repair: "Use equal-sized symbols, with one symbol representing 100 downloads, or use columns with a zero baseline.", defence: "Downloads doubled from 100 to 200, but the May picture has four times the area." },
  { display: "pictograph", title: "Team supporters", labels: ["Blue", "Gold"], values: [40, 60], unit: "supporters", visualMultipliers: [1, 1.5], claim: "Gold has more than twice the support!", note: "The Gold square is 1.5 times as wide and tall as the Blue square.", flaw: "The area grows to 2.25 times even though 60 is only 1.5 times 40.", repair: "Keep every supporter icon the same size and vary only the number of icons.", defence: "Gold has 20 more supporters, or 1.5 times as many, but its picture covers 2.25 times the area." },
  { display: "pictograph", title: "Trees planted", labels: ["Last year", "This year"], values: [50, 100], unit: "trees", visualMultipliers: [1, 2], claim: "The planting program grew fourfold!", note: "The second tree symbol is twice as wide and twice as tall as the first.", flaw: "The four-times area overstates a result that only doubled from 50 to 100.", repair: "Use equal-sized tree symbols with a fixed key, or columns beginning at zero.", defence: "The number of trees doubled, but doubling both picture dimensions creates four times the area." },
  { display: "selected", title: "Quarterly sales", labels: ["Q1", "Q2", "Q3"], values: [120, 135, 140], unit: "sales", source: { labels: ["Q1", "Q2", "Q3", "Q4"], values: [120, 135, 140, 80] }, claim: "Sales rose throughout the year!", note: "The published graph stops at Q3. The full record includes Q4 sales of 80.", flaw: "Leaving out Q4 hides the large fall at the end of the year.", repair: "Plot all four quarters on the same scale and describe the rise to Q3 followed by the Q4 fall.", defence: "Sales rose from Q1 to Q3 but then fell to 80 in Q4, which the published selection omits." },
  { display: "selected", title: "Daily visitors", labels: ["Mon", "Tue", "Wed"], values: [210, 230, 250], unit: "visitors", source: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri"], values: [210, 230, 250, 160, 150] }, claim: "Visitor numbers climbed all week!", note: "Only Monday to Wednesday are graphed; Thursday and Friday are present in the full record.", flaw: "Selecting only the first three days hides the fall on Thursday and Friday.", repair: "Graph all five days in order and describe both the rise and the later fall.", defence: "Visitors rose to 250 on Wednesday, then fell to 160 and 150; the headline omits those days." },
  { display: "selected", title: "Monthly rainfall", labels: ["Jan", "Feb", "Mar"], values: [42, 51, 63], unit: "mm", source: { labels: ["Jan", "Feb", "Mar", "Apr", "May"], values: [42, 51, 63, 38, 31] }, claim: "Rainfall kept increasing this year!", note: "The published selection ends in March, but the source record continues through May.", flaw: "Omitting April and May hides that rainfall fell after March.", repair: "Show every available month in time order and describe the rise followed by the fall.", defence: "Rainfall peaked at 63 mm in March, then fell to 38 and 31 mm; those months were omitted." },
  { display: "parts", title: "How students travel", labels: ["Walk", "Car", "Bus"], values: [55, 40, 20], unit: "%", claim: "This chart represents every student's travel method.", note: "The three labelled percentages are presented as parts of one whole.", flaw: "The parts total 115%, so they cannot describe one response from every student.", repair: "Check the categories and data, then redraw only after the mutually exclusive parts total 100%.", defence: "55% + 40% + 20% = 115%, so the displayed parts cannot form one whole." },
  { display: "parts", title: "School budget", labels: ["Learning", "Sport", "Arts"], values: [48, 37, 25], unit: "%", claim: "The full budget is divided among these areas.", note: "The chart labels all three figures as percentages of the same total budget.", flaw: "The labelled budget shares add to 110%, which is impossible for one whole budget.", repair: "Correct the figures or categories so they are non-overlapping and sum to exactly 100%.", defence: "48% + 37% + 25% = 110%, so this cannot be a valid division of one budget." },
  { display: "parts", title: "Favourite activities", labels: ["Sport", "Gaming", "Music"], values: [52, 33, 24], unit: "%", claim: "Every student selected one favourite activity.", note: "The categories are presented as non-overlapping percentages of one group.", flaw: "The percentages total 109%, so they cannot represent one choice from every student.", repair: "Verify the counts and denominator, then recalculate non-overlapping percentages that sum to 100%.", defence: "52% + 33% + 24% = 109%, so the claimed one-choice survey is internally inconsistent." },
];

const ALL_DISTORTION_CASES = [...AXIS_DISTORTION_CASES, ...GRAPHIC_DISTORTION_CASES];
const PICTURE_DISTORTION_CASES = GRAPHIC_DISTORTION_CASES.filter((item) => item.display === "pictograph");
const OMITTED_DISTORTION_CASES = GRAPHIC_DISTORTION_CASES.filter((item) => item.display === "selected");
const WHOLE_DISTORTION_CASES = GRAPHIC_DISTORTION_CASES.filter((item) => item.display === "parts");

function distortionBase(item: DistortionCase, target: number) {
  return {
    kind: "statisticaMediaAnalysis" as const,
    target,
    claim: item.claim,
    data: { title: item.title, labels: item.labels, values: item.values, unit: item.unit, visualMultipliers: item.visualMultipliers, source: item.source },
    display: item.display,
    axisMin: item.axisMin,
    evidenceNote: item.note,
  };
}

export function mediaDistortionTask(round: number, target: number): PracticeTask {
  const item = pick(AXIS_DISTORTION_CASES, round);
  return {
    ...distortionBase(item, target), mode: "distortion",
    prompt: "What makes the representation misleading?",
    speakText: "Read the exact values, calculate their difference and inspect where the vertical axis begins.",
    options: order([
      { id: "correct", label: item.flaw },
      { id: "difference", label: "The subtraction is wrong because the two values are different." },
      { id: "labels", label: "The category labels should be written vertically." },
      { id: "colour", label: "Each column needs a completely different colour." },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: `Correct — ${item.flaw}`, wrong: "Compare the exact values with the visual impression created by the axis." },
  };
}

export function mediaQuantifyDistortionTask(round: number, target: number): PracticeTask {
  const item = pick(AXIS_DISTORTION_CASES, round + 1);
  const difference = Math.abs(item.values[1]! - item.values[0]!);
  const percent = Math.round(difference / item.values[0]! * 100);
  return {
    ...distortionBase(item, target), mode: "quantify",
    prompt: "Which calculation describes the real change?",
    speakText: "Subtract the exact values, then compare the difference with the earlier value. Do not use the visible column heights as the totals.",
    options: order([
      { id: "correct", label: `${difference} ${item.unit}, about ${percent}% of the earlier value` },
      { id: "sum", label: `${item.values[0]! + item.values[1]!} ${item.unit}` },
      { id: "axis", label: `${Math.abs(item.values[1]! - item.axisMin!)} ${item.unit}, using the axis baseline as the earlier value` },
      { id: "double", label: `${difference * 2} ${item.unit}, because two columns are shown` },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: `Correct — the actual change is ${difference} ${item.unit}.`, wrong: "Subtract one displayed value from the other; do not subtract the axis minimum." },
  };
}

export function mediaRepairTask(round: number, target: number): PracticeTask {
  const item = pick(GRAPHIC_DISTORTION_CASES, round);
  return repairDistortionTask(item, round, target);
}

function repairDistortionTask(item: DistortionCase, round: number, target: number): PracticeTask {
  return {
    ...distortionBase(item, target), mode: "repair",
    prompt: "Which change would repair both the display and its message?",
    speakText: "Choose a repair that gives the graph an honest scale and rewrites the claim to match the calculated change.",
    options: order([
      { id: "correct", label: item.repair },
      { id: "hide", label: "Remove the values so readers focus only on the column heights." },
      { id: "narrow", label: "Start the axis even closer to the smaller value." },
      { id: "decorate", label: "Keep the scale and add brighter colours and larger labels." },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: "Yes — that repair corrects the scale and makes the conclusion proportional to the data.", wrong: "A genuine repair changes the misleading scale or missing context, not its decoration." },
  };
}

function defendDistortionTask(item: DistortionCase, round: number, target: number): PracticeTask {
  return {
    ...distortionBase(item, target), mode: "defend",
    prompt: "Which critique uses the numbers and identifies the distortion?",
    speakText: "A strong critique states the real change, names the visual flaw and explains how the claim should be limited.",
    options: order([
      { id: "correct", label: item.defence },
      { id: "feeling", label: "It is misleading because it looks dramatic." },
      { id: "reject", label: "Both recorded values must therefore be false." },
      { id: "style", label: "Different column colours would make it accurate." },
    ], round),
    correctOptionIds: ["correct"],
    feedback: { correct: "Correct — the critique connects the calculation, the representation and the conclusion.", wrong: "Choose the critique that cites the values and explains exactly how the graph changes their impression." },
  };
}

export function mediaDefendDistortionTask(round: number, target: number): PracticeTask {
  return defendDistortionTask(pick(ALL_DISTORTION_CASES, round), round, target);
}

function mediaDefendAxisTask(round: number, target: number): PracticeTask {
  return defendDistortionTask(pick(AXIS_DISTORTION_CASES, round), round, target);
}

const mediaRepairPictureTask = (round: number, target: number) => repairDistortionTask(pick(PICTURE_DISTORTION_CASES, round), round, target);
const mediaRepairOmittedTask = (round: number, target: number) => repairDistortionTask(pick(OMITTED_DISTORTION_CASES, round), round, target);
const mediaRepairWholeTask = (round: number, target: number) => repairDistortionTask(pick(WHOLE_DISTORTION_CASES, round), round, target);
const mediaDefendPictureTask = (round: number, target: number) => defendDistortionTask(pick(PICTURE_DISTORTION_CASES, round), round, target);
const mediaDefendOmittedOrWholeTask = (round: number, target: number) => defendDistortionTask(pick([...OMITTED_DISTORTION_CASES, ...WHOLE_DISTORTION_CASES], round), round, target);

// ── W5 Misleading statistics: name the flaw in the representation (ST02) ──────
type FlawItem = { desc: string; detail: string; flaw: "axis" | "scale" | "cherry" | "total" };
const FLAW_LABEL: Record<FlawItem["flaw"], string> = {
  axis: "Truncated axis (doesn't start at 0)",
  scale: "Pictures not drawn to scale",
  cherry: "Cherry-picked data (some left out)",
  total: "Parts don't add to the whole",
};
const FLAWS: FlawItem[] = [
  { desc: "A column graph's y-axis starts at 80, not 0", detail: "so a tiny difference looks huge", flaw: "axis" },
  { desc: "The 'more sales' picture is drawn twice as wide AND twice as tall", detail: "for only double the value", flaw: "scale" },
  { desc: "A line graph only shows Mon–Wed", detail: "hiding the big drop on Thursday", flaw: "cherry" },
  { desc: "A pie chart's slices add up to 130%", detail: "more than a whole", flaw: "total" },
  { desc: "A bar chart's scale jumps 0, 10, 50, 100", detail: "with uneven gaps", flaw: "axis" },
  { desc: "Only the 3 best months are shown", detail: "the poor months are removed", flaw: "cherry" },
  { desc: "The 'winner' symbol is a giant trophy", detail: "much bigger than its true value", flaw: "scale" },
  { desc: "A survey graph's slices total only 85%", detail: "some people are missing", flaw: "total" },
  { desc: "The temperature graph starts at 20°C, not 0", detail: "exaggerating the rise", flaw: "axis" },
  { desc: "A pictograph doubles the icon size for double value", detail: "so it looks four times bigger", flaw: "scale" },
  { desc: "Only weekends are graphed", detail: "the quiet weekdays are dropped", flaw: "cherry" },
  { desc: "A budget pie chart's parts sum to 110%", detail: "over a full whole", flaw: "total" },
];
export function misleadingTask(round: number, target: number): PracticeTask {
  const item = pick(FLAWS, round);
  const all: FlawItem["flaw"][] = ["axis", "scale", "cherry", "total"];
  const distractors = all.filter((f) => f !== item.flaw);
  const wrong2 = [pick(distractors, round), pick(distractors, round + 1)];
  const uniqueWrong = wrong2[0] === wrong2[1] ? [distractors[0]!, distractors[1]!] : wrong2;
  const opts = order([item.flaw, ...uniqueWrong].map((f) => ({ id: f, label: FLAW_LABEL[f] })), round);
  return {
    kind: "statisticaClassify", target,
    prompt: "What makes this representation misleading?",
    speakText: "Read what the graph does, then choose the trick that misleads the reader.",
    variable: item.desc, examples: item.detail,
    options: opts,
    correctOptionIds: [item.flaw],
    feedback: { correct: `Yes — ${FLAW_LABEL[item.flaw].toLowerCase()}.`, wrong: "Look at what the graph changes: the axis, the picture sizes, the data shown, or the totals." },
  };
}

const AXIS_FLAW_ROUNDS = [0, 4, 8];
const GRAPHIC_FLAW_ROUNDS = [1, 2, 3, 5, 6, 7, 9, 10, 11];
const brokenAxisTeachingTask = (round: number, target: number) => misleadingTask(pick(AXIS_FLAW_ROUNDS, round), target);
const misleadingGraphicsTeachingTask = (round: number, target: number) => misleadingTask(pick(GRAPHIC_FLAW_ROUNDS, round), target);

function critiqueTeachingTask(round: number, target: number): PracticeTask {
  return {
    kind: "statisticaClassify", target,
    prompt: "What makes a statistical critique convincing?",
    speakText: "A strong critique uses the actual numbers, identifies the feature that distorts them, and explains how the conclusion should change.",
    variable: "A graph looks dramatic, but you suspect it is misleading.",
    examples: "Choose the strongest way to justify your judgement.",
    options: order([
      { id: "evidence", label: "Calculate the real result, name the distortion, then explain its effect" },
      { id: "feeling", label: "Say the graph feels wrong without referring to any values" },
      { id: "style", label: "Change the colours and assume that makes the conclusion accurate" },
    ], round),
    correctOptionIds: ["evidence"],
    feedback: { correct: "Correct — a defensible critique connects the numbers, the visual choice and the conclusion.", wrong: "A critique needs numerical evidence and a precise explanation of how the representation affects interpretation." },
  };
}

// ── Lesson map (18 lessons, 6 weeks) ─────────────────────────────────────────
const FOCUSED_GENS: Record<string, [Gen, Gen, Gen, Gen]> = {
  "y6-statistics-w1-l1": [continuousTeachingTask, valueBetweenTask, measurementPlanTask, measurementPrecisionTask],
  "y6-statistics-w1-l2": [countMeasureTeachingTask, countMeasureSortTask, collectionMethodTask, validCollectionResponseTask],
  "y6-statistics-w1-l3": [comparisonTeachingTask, fourTypeSortTask, comparablePairTask, shapeCompareTask],
  "y6-statistics-w2-l2": [rangeIntroductionTask, rangeTask, modeReadTask, shapeConcentratedTask],
  "y6-statistics-w4-l1": [mediaClaimTask, mediaCalculateTask, mediaCompareTask, mediaSupportedConclusionTask],
  "y6-statistics-w4-l2": [mediaClaimTask, mediaMethodTask, mediaRedesignTask, mediaMethodConclusionTask],
  "y6-statistics-w4-l3": [mediaClaimTask, mediaSupportedConclusionTask, mediaMethodConclusionTask, mediaMethodTask],
  "y6-statistics-w5-l1": [brokenAxisTeachingTask, mediaDistortionTask, mediaQuantifyDistortionTask, mediaDefendAxisTask],
  "y6-statistics-w5-l2": [misleadingGraphicsTeachingTask, mediaRepairPictureTask, mediaRepairOmittedTask, mediaRepairWholeTask],
  "y6-statistics-w5-l3": [critiqueTeachingTask, mediaDefendAxisTask, mediaDefendPictureTask, mediaDefendOmittedOrWholeTask],
};

const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W2 Mode, Range & Shape
  "y6-statistics-w2-l1": [modeReadTask, rangeTask, modeReadTask],
  "y6-statistics-w2-l3": [shapeConcentratedTask, shapeSpreadTask, rangeTask],
  // W3 Comparative Displays — side-by-side, compare groups, conclude
  "y6-statistics-w3-l1": [rangeCompareTask, shapeCompareTask, rangeTask],
  "y6-statistics-w3-l2": [shapeCompareTask, rangeCompareTask, shapeVariationTask],
  "y6-statistics-w3-l3": [rangeCompareTask, rangeTask, shapeCompareTask],
  // W6 Investigation — L1 & L2 run the full investigation; L3 is quick review
  "y6-statistics-w6-l1": [investigationTask, investigationTask, investigationTask],
  "y6-statistics-w6-l2": [investigationTask, investigationTask, investigationTask],
  "y6-statistics-w6-l3": [rangeTask, modeReadTask, misleadingTask],
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

export function getStatisticaLevel6TaskSet(lessonId: string): RealmLessonTaskSet | null {
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

export const STATISTICA_LEVEL6_LESSON_IDS = [...Object.keys(FOCUSED_GENS), ...Object.keys(LESSON_GENS)];
