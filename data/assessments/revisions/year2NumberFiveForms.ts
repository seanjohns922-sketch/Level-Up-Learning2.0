/**
 * Number Level 2: five matched review forms (Pre-Test, Post-Test, Start, Mid, End).
 * Built from the audited v2 pair; see docs/assessment-blueprints/year2-number-existing-pair-audit.md.
 * Every slot keeps one descriptor, subskill, response format and visual type across the five forms,
 * with a different, independently solved example in each. These review items do not replace
 * student banks until owner review and versioned activation.
 */
import { YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS as benchmark } from "../year2NumberNexusIndependentBanks";
import { createUncalibratedItemStatistics } from "../assessmentItemStandard";

export const NUMBER_LEVEL2_FORMS = ["pretest", "posttest", "start", "mid", "end"] as const;
export type NumberLevel2Form = typeof NUMBER_LEVEL2_FORMS[number];
export const NUMBER_LEVEL2_FORM_LABELS: Record<NumberLevel2Form, string> = {
  pretest: "Pre-Test", posttest: "Post-Test", start: "Start", mid: "Mid", end: "End",
};
export type NumberLevel2ReviewItem = Omit<typeof benchmark[number], "form" | "sourcePool"> & {
  form: NumberLevel2Form;
  sourcePool: "assessment_review";
  benchmarkQuestionId: string;
  slotId: string;
};

type Partition = "valid" | "nonstandard" | "shifted";
type FractionName = "one-half" | "one-quarter" | "one-eighth";
type Compensation = "correct" | "oneOnly" | "dropOnes";
type Grouping = "correct" | "size" | "total";
type Sentence = "correct" | "add" | "reverse";

type Profile = {
  mab: readonly [number, number, number];
  order: readonly number[];
  zero: readonly [number, number];
  partition: { hundreds: number; ones: number; order: readonly Partition[] };
  fraction: { parts: 4 | 8; order: readonly FractionName[] };
  halvingWhole: string;
  add: readonly [number, number];
  subtract: readonly [number, number];
  compensate: { a: number; b: number; order: readonly Compensation[] };
  array: readonly [number, number];
  share: readonly [number, number];
  grouping: { total: number; size: number; order: readonly Grouping[] };
  total: { prices: readonly [number, number]; items: readonly [string, string] };
  change: number;
  sentence: { name: string; item: string; price: number; order: readonly Sentence[] };
  up: number;
  down: number;
  inverse: readonly [number, number];
  derive: readonly [number, number];
  halve: number;
};

// Examples avoid the exact facts, prices and patterns practised in the Year 2 weekly quizzes.
const PROFILES: Record<NumberLevel2Form, Profile> = {
  pretest: {
    mab: [3, 2, 6], order: [1000, 907, 970], zero: [5, 4],
    partition: { hundreds: 6, ones: 3, order: ["valid", "nonstandard", "shifted"] },
    fraction: { parts: 8, order: ["one-half", "one-quarter", "one-eighth"] }, halvingWhole: "ribbon",
    add: [38, 25], subtract: [82, 37], compensate: { a: 48, b: 27, order: ["oneOnly", "correct", "dropOnes"] },
    array: [3, 8], share: [24, 4], grouping: { total: 20, size: 4, order: ["size", "correct", "total"] },
    total: { prices: [8, 5], items: ["puzzle", "ball"] }, change: 14,
    sentence: { name: "Sam", item: "kite", price: 18, order: ["correct", "add", "reverse"] },
    up: 7, down: 87, inverse: [13, 7], derive: [8, 7], halve: 14,
  },
  posttest: {
    mab: [5, 4, 2], order: [909, 1000, 990], zero: [7, 8],
    partition: { hundreds: 4, ones: 5, order: ["shifted", "valid", "nonstandard"] },
    fraction: { parts: 4, order: ["one-quarter", "one-eighth", "one-half"] }, halvingWhole: "paper strip",
    add: [46, 37], subtract: [94, 58], compensate: { a: 58, b: 26, order: ["correct", "oneOnly", "dropOnes"] },
    array: [4, 6], share: [21, 3], grouping: { total: 18, size: 3, order: ["correct", "total", "size"] },
    total: { prices: [9, 6], items: ["book", "game"] }, change: 12,
    sentence: { name: "Ava", item: "book", price: 16, order: ["reverse", "correct", "add"] },
    up: 13, down: 94, inverse: [11, 8], derive: [7, 6], halve: 18,
  },
  start: {
    mab: [4, 3, 5], order: [860, 1000, 806], zero: [6, 9],
    partition: { hundreds: 7, ones: 2, order: ["valid", "shifted", "nonstandard"] },
    fraction: { parts: 8, order: ["one-half", "one-eighth", "one-quarter"] }, halvingWhole: "chocolate bar",
    add: [27, 45], subtract: [73, 48], compensate: { a: 39, b: 46, order: ["dropOnes", "oneOnly", "correct"] },
    array: [3, 7], share: [28, 4], grouping: { total: 24, size: 4, order: ["total", "size", "correct"] },
    total: { prices: [7, 6], items: ["kite", "hat"] }, change: 11,
    sentence: { name: "Leo", item: "ball", price: 14, order: ["add", "reverse", "correct"] },
    up: 4, down: 76, inverse: [14, 5], derive: [9, 6], halve: 12,
  },
  mid: {
    mab: [2, 6, 3], order: [780, 708, 1000], zero: [4, 3],
    partition: { hundreds: 8, ones: 9, order: ["nonstandard", "valid", "shifted"] },
    fraction: { parts: 4, order: ["one-eighth", "one-quarter", "one-half"] }, halvingWhole: "garden bed",
    add: [57, 28], subtract: [61, 24], compensate: { a: 67, b: 28, order: ["correct", "dropOnes", "oneOnly"] },
    array: [4, 7], share: [18, 3], grouping: { total: 21, size: 3, order: ["size", "total", "correct"] },
    total: { prices: [8, 4], items: ["car", "card"] }, change: 16,
    sentence: { name: "Mia", item: "puzzle", price: 12, order: ["correct", "reverse", "add"] },
    // 16 is the week 10 quiz double; the halving example space (12–20) allows it in one form only.
    up: 21, down: 65, inverse: [13, 6], derive: [8, 5], halve: 16,
  },
  end: {
    mab: [6, 1, 7], order: [1000, 650, 605], zero: [8, 6],
    partition: { hundreds: 5, ones: 6, order: ["shifted", "nonstandard", "valid"] },
    fraction: { parts: 8, order: ["one-eighth", "one-half", "one-quarter"] }, halvingWhole: "banner",
    add: [39, 17], subtract: [85, 39], compensate: { a: 29, b: 57, order: ["oneOnly", "dropOnes", "correct"] },
    array: [3, 6], share: [32, 4], grouping: { total: 28, size: 4, order: ["correct", "size", "total"] },
    total: { prices: [9, 3], items: ["cap", "pen"] }, change: 17,
    sentence: { name: "Zoe", item: "hat", price: 19, order: ["add", "correct", "reverse"] },
    up: 16, down: 98, inverse: [11, 9], derive: [9, 7], halve: 20,
  },
};

type SlotContent = { prompt: string; correctAnswer: string; visual: Record<string, unknown>; options?: string[] };

const article = (price: number) => (price === 8 || price === 11 || price === 18 ? "an" : "a");
const decade = (value: number) => Math.ceil(value / 10) * 10;

function slotContents(form: NumberLevel2Form): SlotContent[] {
  const p = PROFILES[form];
  const [h1, t1, o1] = p.mab;
  const partitionOption: Record<Partition, string> = {
    valid: `${p.partition.hundreds * 100} + ${p.partition.ones}`,
    nonstandard: `${(p.partition.hundreds - 1) * 100} + ${100 + p.partition.ones}`,
    shifted: `${p.partition.hundreds * 100} + ${p.partition.ones * 10}`,
  };
  const partitionPairs: Record<Partition, [number, number]> = {
    valid: [p.partition.hundreds * 100, p.partition.ones],
    nonstandard: [(p.partition.hundreds - 1) * 100, 100 + p.partition.ones],
    shifted: [p.partition.hundreds * 100, p.partition.ones * 10],
  };
  const { a, b } = p.compensate;
  const compensation: Record<Compensation, string> = {
    correct: `${decade(a)} + ${b - (decade(a) - a)}`,
    oneOnly: `${decade(a)} + ${b}`,
    dropOnes: `${a} + ${b - (b % 10)}`,
  };
  const groupingOption: Record<Grouping, string> = {
    correct: `There are ${p.grouping.total / p.grouping.size} groups.`,
    size: `There are ${p.grouping.size} groups.`,
    total: `There are ${p.grouping.total} groups.`,
  };
  const sentenceOption: Record<Sentence, string> = {
    correct: `20 − ${p.sentence.price}`,
    add: `20 + ${p.sentence.price}`,
    reverse: `${p.sentence.price} − 20`,
  };
  const [addA, addB] = p.add;
  const [subA, subB] = p.subtract;
  const [rows, columns] = p.array;
  const [shareTotal, shareGroups] = p.share;
  const [priceA, priceB] = p.total.prices;
  const [invA, invB] = p.inverse;
  const [derA, derB] = p.derive;
  const capitalise = (word: string) => `${word[0]!.toUpperCase()}${word.slice(1)}`;
  return [
    { prompt: "Write the number the blocks show.", correctAnswer: String(h1 * 100 + t1 * 10 + o1), visual: { type: "number_y2_place_value", hundreds: h1, tens: t1, ones: o1 } },
    { prompt: "Put these numbers in order. Smallest first.", correctAnswer: [...p.order].sort((x, y) => x - y).join("||"), visual: { type: "number_y2_number_cards", values: [...p.order] }, options: p.order.map(String) },
    { prompt: `What number do ${p.zero[0]} hundreds, 0 tens and ${p.zero[1]} ones make?`, correctAnswer: String(p.zero[0] * 100 + p.zero[1]), visual: { type: "number_y2_place_value", hundreds: p.zero[0], tens: 0, ones: p.zero[1] } },
    { prompt: `Which partition does NOT make ${p.partition.hundreds * 100 + p.partition.ones}?`, correctAnswer: partitionOption.shifted, visual: { type: "number_y2_partition_choices", whole: p.partition.hundreds * 100 + p.partition.ones, choices: p.partition.order.map((kind) => partitionPairs[kind]) }, options: p.partition.order.map((kind) => partitionOption[kind]) },
    { prompt: "The shape has equal parts. What is the shaded part called?", correctAnswer: p.fraction.parts === 8 ? "one-eighth" : "one-quarter", visual: { type: "number_y2_fraction", parts: p.fraction.parts, selected: 1 }, options: [...p.fraction.order] },
    { prompt: `This ${p.halvingWhole} is cut into quarters. Cut each quarter in half. How many equal parts?`, correctAnswer: "8", visual: { type: "number_y2_fraction_halving", before: 4, after: null, whole: p.halvingWhole } },
    { prompt: `What is ${addA} + ${addB}?`, correctAnswer: String(addA + addB), visual: { type: "number_y2_equation", expression: `${addA} + ${addB} = ?` } },
    { prompt: `Find ${subA} − ${subB}.`, correctAnswer: String(subA - subB), visual: { type: "number_y2_equation", expression: `${subA} − ${subB} = ?` } },
    { prompt: `Which strategy correctly solves ${a} + ${b}?`, correctAnswer: compensation.correct, visual: { type: "number_y2_equation", expression: `${a} + ${b}` }, options: p.compensate.order.map((kind) => compensation[kind]) },
    { prompt: "How many counters are in this array?", correctAnswer: String(rows * columns), visual: { type: "number_y2_array", rows, columns } },
    { prompt: `Share ${shareTotal} equally among ${shareGroups} teams. How many does each team get?`, correctAnswer: String(shareTotal / shareGroups), visual: { type: "number_y2_share", total: shareTotal, groups: shareGroups } },
    { prompt: `${p.grouping.total} counters are put into groups of ${p.grouping.size}. Which statement is correct?`, correctAnswer: groupingOption.correct, visual: { type: "number_y2_groups", total: p.grouping.total, groupSize: p.grouping.size, loose: true }, options: p.grouping.order.map((kind) => groupingOption[kind]) },
    { prompt: `A ${p.total.items[0]} costs $${priceA}. A ${p.total.items[1]} costs $${priceB}. Enter the total in dollars.`, correctAnswer: String(priceA + priceB), visual: { type: "number_y2_money", amounts: [priceA, priceB], labels: p.total.items.map(capitalise) } },
    { prompt: `You pay $20 for ${article(p.change)} $${p.change} item. Enter the change in dollars.`, correctAnswer: String(20 - p.change), visual: { type: "number_y2_money", amounts: [20, p.change], labels: ["Paid", "Cost"] } },
    { prompt: `${p.sentence.name} pays $20 for ${article(p.sentence.price)} $${p.sentence.price} ${p.sentence.item}. Which number sentence finds the change?`, correctAnswer: sentenceOption.correct, visual: { type: "number_y2_money", amounts: [20, p.sentence.price], labels: ["Paid", "Cost"] }, options: p.sentence.order.map((kind) => sentenceOption[kind]) },
    { prompt: "What number comes next in this pattern?", correctAnswer: String(p.up + 20), visual: { type: "number_y2_sequence", values: [p.up, p.up + 5, p.up + 10, p.up + 15, null], rule: "+5" } },
    { prompt: "Fill the gap in this pattern.", correctAnswer: String(p.down - 20), visual: { type: "number_y2_sequence", values: [p.down, p.down - 10, null, p.down - 30, p.down - 40], rule: "-10" } },
    { prompt: `${invA} + ${invB} = ${invA + invB}. What is ${invA + invB} − ${invA}?`, correctAnswer: String(invB), visual: { type: "number_y2_fact_family", family: [invA, invB, invA + invB], missing: "difference" } },
    { prompt: `Use ${derA} + ${derB} = ${derA + derB}. Find ${derA + derB} − ${derB}.`, correctAnswer: String(derA), visual: { type: "number_y2_fact_family", family: [derA, derB, derA + derB], missing: "part" } },
    { prompt: `Halve ${p.halve}. How many are in each half?`, correctAnswer: String(p.halve / 2), visual: { type: "number_y2_double_halve", total: p.halve, split: false } },
  ];
}

type SlotMetadata = {
  skillId?: string;
  skillLabel: string;
  type?: "mcq" | "numeric" | "number_order";
  responseMode?: "selected_response" | "constructed_response" | "manipulated_response";
  week?: number;
  lesson?: number;
  misconceptionTags?: readonly string[];
  misconceptionDiagnosis?: boolean;
};

// Difficulty and cognitive demand stay as audited in the v2 pre-test (8/9/3 and 3/6/7/4).
const SLOT_METADATA: readonly SlotMetadata[] = [
  { skillLabel: "Represent Numbers" },
  { skillLabel: "Order Numbers" },
  { skillLabel: "Partition Numbers" },
  { skillLabel: "Check a Partition" },
  { skillId: "name_unit_fraction", skillLabel: "Name a Unit Fraction", type: "mcq", responseMode: "selected_response", week: 12, lesson: 3, misconceptionTags: ["denominator-size"], misconceptionDiagnosis: false },
  { skillLabel: "Halves, Quarters and Eighths" },
  { skillLabel: "Add Two-Digit Numbers" },
  { skillLabel: "Subtract Two-Digit Numbers" },
  { skillLabel: "Check an Addition Strategy" },
  { skillLabel: "Read an Array" },
  { skillId: "equal_sharing", skillLabel: "Share Equally", week: 10, lesson: 1 },
  { skillId: "grouping_check", skillLabel: "Check Equal Groups", week: 10, lesson: 2 },
  { skillLabel: "Find a Money Total" },
  { skillLabel: "Calculate Change" },
  { skillLabel: "Choose a Money Number Sentence" },
  { skillLabel: "Continue an Additive Pattern" },
  { skillLabel: "Find a Missing Pattern Term" },
  { skillLabel: "Related Addition and Subtraction" },
  { skillLabel: "Derive a Related Fact" },
  { skillLabel: "Derive a Twos Division Fact" },
];

function makeForm(form: NumberLevel2Form): NumberLevel2ReviewItem[] {
  const contents = slotContents(form);
  return benchmark.map((base, index) => {
    const content = contents[index]!;
    const meta = SLOT_METADATA[index]!;
    const type = meta.type ?? base.type;
    const options = [...(content.options ?? [])];
    const week = meta.week ?? base.curriculumLessonMapping[0]!.week;
    const lesson = meta.lesson ?? base.curriculumLessonMapping[0]!.lesson;
    const slot = String(index + 1).padStart(2, "0");
    return {
      ...base,
      id: `y2-number-review-${form}-${slot}-v3`,
      version: "3.0.0-review.1",
      form,
      sourcePool: "assessment_review",
      bankId: `number-nexus-level-2-${form}-v3-review`,
      benchmarkQuestionId: base.id,
      slotId: `number-level-2-slot-${slot}`,
      contextKey: `y2-number-review-${form}-${index + 1}-v3`,
      structureKey: `y2-number-reviewed-slot-${index + 1}-v3`,
      prompt: content.prompt,
      correctAnswer: content.correctAnswer,
      answer: content.correctAnswer,
      visual: content.visual,
      options: options.length ? options : undefined,
      type,
      skillId: meta.skillId ?? base.skillId,
      skillLabel: meta.skillLabel,
      responseMode: meta.responseMode ?? base.responseMode,
      misconceptionTags: meta.misconceptionTags ?? base.misconceptionTags,
      misconceptionDiagnosis: meta.misconceptionDiagnosis ?? base.misconceptionDiagnosis,
      curriculumLessonMapping: [{ week, lesson }],
      linkedWeeks: [week],
      linkedLessons: [lesson],
      inputMode: type === "numeric" ? "decimal" : undefined,
      statistics: createUncalibratedItemStatistics(base.difficulty),
      selectedAnswerPosition: type === "mcq" ? options.indexOf(content.correctAnswer) + 1 : undefined,
      renderer: {
        type: type === "mcq" ? "selected_response" : type === "numeric" ? "numeric_entry" : type,
        payload: { prompt: content.prompt, correctAnswer: content.correctAnswer, visual: content.visual, ...(options.length ? { options } : {}) },
      },
      scoring: type === "numeric"
        ? { kind: "numeric_tolerance", correctResponse: content.correctAnswer, tolerance: 0 }
        : { kind: "exact", correctResponse: content.correctAnswer },
    } as NumberLevel2ReviewItem;
  });
}

export const NUMBER_LEVEL2_FIVE_FORMS: Record<NumberLevel2Form, NumberLevel2ReviewItem[]> = {
  pretest: makeForm("pretest"),
  posttest: makeForm("posttest"),
  start: makeForm("start"),
  mid: makeForm("mid"),
  end: makeForm("end"),
};
