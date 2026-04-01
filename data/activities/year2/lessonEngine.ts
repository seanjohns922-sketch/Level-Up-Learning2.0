import type { Lesson } from "@/data/programs/year1";
import type { ActivityType, LessonActivity } from "@/data/programs/types";

export type PlaceValueName =
  | "hundred_thousands"
  | "ten_thousands"
  | "thousands"
  | "hundreds"
  | "tens"
  | "ones";

export type MABVisualData = {
  type: "mab";
  placeValues: PlaceValueName[];
  hundredThousands: number | null;
  tenThousands: number | null;
  thousands: number | null;
  hundreds: number | null;
  tens: number | null;
  ones: number | null;
};

export type DecimalVisualData =
  | {
      type: "decimal_model";
      model: "tenths_bar";
      numerator: number;
      denominator: 10;
    }
  | {
      type: "decimal_model";
      model: "hundredths_grid";
      numerator: number;
      denominator: 100;
    }
  | {
      type: "decimal_model";
      model: "place_value_chart";
      ones: number;
      tenths: number;
      hundredths: number;
    };

export type PlaceValueBuilderQuestion = {
  kind: "place_value_builder";
  prompt: string;
  hundredThousands: number | null;
  tenThousands: number | null;
  thousands: number | null;
  hundreds: number | null;
  tens: number | null;
  ones: number | null;
  targetNumber: number;
  answer: number;
  mode: "identify_number" | "identify_place" | "missing_mab_part";
  place?: PlaceValueName;
  visualMode: "mab";
  placeValues: PlaceValueName[];
};

export type NumberOrderQuestion = {
  kind: "number_order";
  prompt: string;
  numbers: number[];
  ascending: boolean;
};

export type PartitionExpandQuestion = {
  kind: "partition_expand";
  prompt: string;
  target: number;
  mode: "partition" | "expand" | "flexible_partition";
  standard: {
    thousands?: number;
    hundreds: number;
    tens: number;
    ones: number;
  };
};

export type NumberLineQuestion = {
  kind: "number_line";
  prompt: string;
  helper: string;
  expected: number;
  min: number;
  max: number;
  step: number;
  mode: "placement" | "rounding" | "estimate";
};

export type FractionModel = {
  id: string;
  numerator: number;
  denominator: number;
  shadedParts?: number[];
};

export type AreaModelSelectQuestion = {
  kind: "area_model_select";
  prompt: string;
  fractionLabel: string;
  denominator: number;
  numerator: number;
  mode: "shade_fraction" | "pick_model" | "match_model" | "match_equivalent";
  models?: FractionModel[];
  correctModelId?: string;
};

export type SetModelSelectQuestion = {
  kind: "set_model_select";
  prompt: string;
  fractionLabel: string;
  denominator: number;
  numerator: number;
  totalObjects: number;
  mode: "tap_fraction" | "pick_set" | "complete_sentence" | "label_shared_group";
  highlightedIndices?: number[];
  groupCount?: number;
  groupSize?: number;
  options?: Array<{
    id: string;
    highlightedCount: number;
  }>;
  correctOptionId?: string;
  answer?: number;
  labelOptions?: string[];
  correctLabel?: string;
};

export type BuildTheWholeQuestion = {
  kind: "build_the_whole";
  prompt: string;
  fractionLabel: string;
  denominator: number;
  unitValue?: number;
  mode: "build_whole" | "fill_total" | "pick_whole";
  options?: Array<{
    id: string;
    parts: number;
    total?: number;
  }>;
  correctOptionId?: string;
  answer?: number;
};

export type NumberLinePlaceQuestion = {
  kind: "number_line_place";
  prompt: string;
  mode: "place_fraction" | "pick_point" | "order_fractions";
  denominator?: number;
  targetFraction?: string;
  options?: string[];
  answer?: string;
  fractions?: string[];
};

export type FractionCompareQuestion = {
  kind: "fraction_compare";
  prompt: string;
  mode: "symbol_compare" | "visual_compare" | "true_false";
  leftFraction: string;
  rightFraction: string;
  answer: string;
  statement?: string;
};

export type EquivalentFractionChoice = {
  id: string;
  numerator: number;
  denominator: number;
};

export type EquivalentFractionMatchQuestion = {
  kind: "equivalent_fraction_match";
  prompt: string;
  targetFraction: string;
  target: EquivalentFractionChoice;
  choices: EquivalentFractionChoice[];
  correctChoiceId: string;
};

export type EquivalentFractionBuildQuestion = {
  kind: "equivalent_fraction_build";
  prompt: string;
  sourceFraction: string;
  source: EquivalentFractionChoice;
  options: EquivalentFractionChoice[];
  correctOptionId: string;
};

export type EquivalentFractionYesNoQuestion = {
  kind: "equivalent_fraction_yes_no";
  prompt: string;
  left: EquivalentFractionChoice;
  right: EquivalentFractionChoice;
  answer: "yes" | "no";
};

export type AdditionStrategyQuestion = {
  kind: "addition_strategy";
  prompt: string;
  hint: string;
  a: number;
  b: number;
  answer: number;
  options: number[];
  mode: "jump" | "split" | "friendly_numbers" | "doubles" | "near_doubles";
};

export type EqualGroupsQuestion = {
  kind: "equal_groups";
  prompt: string;
  groups: number;
  itemsPerGroup: number;
  answer: number;
  options: number[];
  mode: "equal_groups";
};

export type ArraysQuestion = {
  kind: "arrays";
  prompt: string;
  rows: number;
  columns: number;
  answer: number;
  options: (number | string)[];
  mode: "arrays" | "repeated_addition";
  repeatedAddition?: string;
};

export type DivisionGroupsQuestion = {
  kind: "division_groups";
  prompt: string;
  total: number;
  groups: number;
  groupSize: number;
  answer: number;
  options: number[];
  mode: "sharing" | "grouping" | "inverse_link";
  inverseFact?: string;
};

export type MixedWordProblemQuestion = {
  kind: "mixed_word_problem";
  prompt: string;
  answer: number;
  options: number[];
  operationLabel: string;
  correctOperation?: "+" | "-" | "x" | "/";
  operationChoices?: Array<"+" | "-" | "x" | "/">;
  helper: string;
  mode: "choose_operation" | "two_step_add_sub" | "mult_div_problems";
  showStrategyClue?: boolean;
};

export type ReviewQuizInnerQuestion =
  | PlaceValueBuilderQuestion
  | NumberOrderQuestion
  | PartitionExpandQuestion
  | NumberLineQuestion
  | AreaModelSelectQuestion
  | SetModelSelectQuestion
  | BuildTheWholeQuestion
  | NumberLinePlaceQuestion
  | FractionCompareQuestion
  | EquivalentFractionMatchQuestion
  | EquivalentFractionBuildQuestion
  | EquivalentFractionYesNoQuestion
  | AdditionStrategyQuestion
  | EqualGroupsQuestion
  | ArraysQuestion
  | DivisionGroupsQuestion
  | MixedWordProblemQuestion
  | SubtractionStrategyQuestion
  | FactFamilyQuestion
  | OddEvenSortQuestion
  | SkipCountQuestion
  | MultipleChoiceQuestion
  | TypedResponseQuestion;

export type ReviewQuizQuestion = {
  kind: "review_quiz";
  prompt: string;
  activityType: ActivityType;
  question: ReviewQuizInnerQuestion;
  mode: "revision_stations" | "team_challenges" | "final_quiz";
};

export type SubtractionStrategyQuestion = {
  kind: "subtraction_strategy";
  prompt: string;
  hint: string;
  total: number;
  remove: number;
  answer: number;
  options: number[];
  mode: "jump" | "split" | "fact_strategy";
  strategyLabel?: string;
  strategySteps?: string[];
};

export type FactFamilyQuestion = {
  kind: "fact_family";
  prompt: string;
  family: [number, number, number];
  options: string[];
  answers: string[];
  mode: "recognise" | "write_sentences" | "word_problems";
  familyType?: "add_sub" | "mult_div";
  visual?: {
    type: "array";
    rows: number;
    columns: number;
  };
};

function normalizeFactSentence(value: string) {
  return value
    .replace(/\s+/g, "")
    .replace(/\*/g, "×")
    .replace(/x/gi, "×")
    .replace(/\//g, "÷")
    .toLowerCase();
}

function fractionLabel(numerator: number, denominator: number) {
  return `${numerator}/${denominator}`;
}

function buildShadedParts(numerator: number) {
  return Array.from({ length: numerator }, (_, index) => index);
}

const YEAR3_ALLOWED_FRACTION_DENOMINATORS = [2, 3, 4, 5, 10] as const;

function randomUnitDenominator() {
  return YEAR3_ALLOWED_FRACTION_DENOMINATORS[
    randInt(0, YEAR3_ALLOWED_FRACTION_DENOMINATORS.length - 1)
  ] ?? 2;
}

function pickFractionPair() {
  const pairs: Array<[number, number]> = [
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 4],
    [2, 6],
    [3, 6],
    [3, 4],
  ];
  return pairs[randInt(0, pairs.length - 1)] ?? [1, 2];
}

function fractionPartsForNumberLine() {
  return [
    { label: "1/10", value: 1 / 10 },
    { label: "1/5", value: 1 / 5 },
    { label: "1/4", value: 1 / 4 },
    { label: "1/2", value: 1 / 2 },
    { label: "3/5", value: 3 / 5 },
    { label: "7/10", value: 7 / 10 },
    { label: "3/4", value: 3 / 4 },
    { label: "4/5", value: 4 / 5 },
  ];
}

function year3FractionOrderSets() {
  return [
    ["1/5", "1/2", "4/5"],
    ["1/4", "1/2", "3/4"],
    ["1/10", "1/2", "7/10"],
    ["1/5", "3/5", "4/5"],
  ];
}

function year3EquivalentFractionPairs() {
  return [
    {
      source: { numerator: 1, denominator: 2 },
      equivalent: { numerator: 2, denominator: 4 },
    },
    {
      source: { numerator: 1, denominator: 2 },
      equivalent: { numerator: 5, denominator: 10 },
    },
    {
      source: { numerator: 1, denominator: 5 },
      equivalent: { numerator: 2, denominator: 10 },
    },
    {
      source: { numerator: 2, denominator: 5 },
      equivalent: { numerator: 4, denominator: 10 },
    },
    {
      source: { numerator: 3, denominator: 5 },
      equivalent: { numerator: 6, denominator: 10 },
    },
  ];
}

export type OddEvenSortQuestion = {
  kind: "odd_even_sort";
  prompt: string;
  numbers: number[];
  labels?: string[];
  answer: {
    odd: number[];
    even: number[];
  };
  mode: "identify" | "pattern" | "odd_even_sums";
  patternOptions?: string[];
  patternAnswer?: string;
};

export type SkipCountQuestion = {
  kind: "skip_count";
  prompt: string;
  sequence: number[];
  answer: number;
  options: number[];
  step: number;
  mode: "forward";
  visualGroups?: number[];
};

export type MultipleChoiceQuestion = {
  kind: "multiple_choice";
  prompt: string;
  options: string[];
  answer: string;
  helper?: string;
  visual?:
    | {
        type: "array";
        rows: number;
        columns: number;
      }
    | MABVisualData
    | DecimalVisualData;
};

export type WrittenMethodLayout = {
  title: string;
  operation: "+" | "-";
  top: string[];
  bottom: string[];
  answerLength: number;
  placeValueLabels: string[];
  carryRow?: string[];
  borrowRow?: string[];
  crossedTop?: boolean[];
};

export type TypedResponseQuestion = {
  kind: "typed_response";
  prompt: string;
  answer: string;
  helper?: string;
  placeholder?: string;
  writtenMethod?: WrittenMethodLayout;
  visual?: MABVisualData | DecimalVisualData;
};

export type SpeedRoundQuestion = {
  kind: "speed_round";
  prompt: string;
  durationSeconds: number;
};

export type Year2QuestionData =
  | PlaceValueBuilderQuestion
  | NumberOrderQuestion
  | PartitionExpandQuestion
  | NumberLineQuestion
  | AreaModelSelectQuestion
  | SetModelSelectQuestion
  | BuildTheWholeQuestion
  | NumberLinePlaceQuestion
  | FractionCompareQuestion
  | EquivalentFractionMatchQuestion
  | EquivalentFractionBuildQuestion
  | EquivalentFractionYesNoQuestion
  | AdditionStrategyQuestion
  | EqualGroupsQuestion
  | ArraysQuestion
  | DivisionGroupsQuestion
  | MixedWordProblemQuestion
  | ReviewQuizQuestion
  | SubtractionStrategyQuestion
  | FactFamilyQuestion
  | OddEvenSortQuestion
  | SkipCountQuestion
  | MultipleChoiceQuestion
  | TypedResponseQuestion
  | SpeedRoundQuestion;

type GenericConfig = Record<string, unknown> & {
  min?: number;
  max?: number;
  step?: number;
  count?: number;
  mode?: string;
  ascending?: boolean;
  hideOnePlaceValue?: boolean;
  placeValues?: PlaceValueName[];
  targets?: number[];
  operations?: string[];
  sourceActivityType?: ActivityType;
  reviewActivities?: ActivityType[];
  visualMode?: string;
  showMAB?: boolean;
  minGroups?: number;
  maxGroups?: number;
  minItemsPerGroup?: number;
  maxItemsPerGroup?: number;
  minRows?: number;
  maxRows?: number;
  minColumns?: number;
  maxColumns?: number;
  minTotal?: number;
  maxTotal?: number;
  allowGenericFallback?: boolean;
  allowedGroupSizes?: number[];
};

type ValidationReason = "alignment" | "difficulty" | "visual_missing" | "mode_blocked";

export type Year2PolicyViolation = {
  reason: ValidationReason;
  message: string;
  activityType: ActivityType;
  lessonWeek: number;
  lessonTitle: string;
};

export type Year2PolicyValidation = {
  valid: boolean;
  violations: Year2PolicyViolation[];
};

export type SupportedMathLevel = 2 | 3;

type DifficultyContract = {
  weekMin: number;
  weekMax: number;
  addSubMax: number;
  addSubExtensionMax: number;
  groupsMax: number;
  itemsMax: number;
  divisionTotalMax: number;
  factFamilyMax: number;
  skipCountMax: number;
  skipCountExtraSteps: number[];
  wordProblemMax: number;
};

type ActivityPolicy = {
  allowedModes?: string[];
  requiresVisual?: boolean;
  maxByContract?: Partial<
    Record<
      | "max"
      | "maxGroups"
      | "maxItemsPerGroup"
      | "maxRows"
      | "maxColumns"
      | "maxTotal",
      keyof Omit<
        DifficultyContract,
        "weekMin" | "weekMax" | "skipCountExtraSteps"
      >
    >
  >;
  maxFactValue?: number;
  maxByWeek?: number;
  blockedFocusKeywords?: string[];
};

export type DifficultyProfile = Omit<DifficultyContract, "weekMin" | "weekMax">;

const YEAR_LEVEL_DIFFICULTY_CONTRACTS: Record<SupportedMathLevel, DifficultyContract[]> = {
  2: [
  {
    weekMin: 1,
    weekMax: 2,
    addSubMax: 50,
    addSubExtensionMax: 80,
    groupsMax: 5,
    itemsMax: 6,
    divisionTotalMax: 24,
    factFamilyMax: 20,
    skipCountMax: 1000,
    skipCountExtraSteps: [2, 5, 10, 100, 1000],
    wordProblemMax: 40,
  },
  {
    weekMin: 3,
    weekMax: 5,
    addSubMax: 100,
    addSubExtensionMax: 120,
    groupsMax: 6,
    itemsMax: 8,
    divisionTotalMax: 36,
    factFamilyMax: 30,
    skipCountMax: 1000,
    skipCountExtraSteps: [2, 3, 4, 5, 10, 100, 1000],
    wordProblemMax: 70,
  },
  {
    weekMin: 6,
    weekMax: 8,
    addSubMax: 140,
    addSubExtensionMax: 170,
    groupsMax: 8,
    itemsMax: 9,
    divisionTotalMax: 48,
    factFamilyMax: 40,
    skipCountMax: 1000,
    skipCountExtraSteps: [2, 3, 4, 5, 10, 100, 1000],
    wordProblemMax: 100,
  },
  {
    weekMin: 9,
    weekMax: 12,
    addSubMax: 180,
    addSubExtensionMax: 220,
    groupsMax: 10,
    itemsMax: 10,
    divisionTotalMax: 60,
    factFamilyMax: 50,
    skipCountMax: 1000,
    skipCountExtraSteps: [2, 3, 4, 5, 10, 100, 1000],
    wordProblemMax: 140,
  },
  ],
  3: [
    {
      weekMin: 1,
      weekMax: 12,
      addSubMax: 300,
      addSubExtensionMax: 500,
      groupsMax: 12,
      itemsMax: 12,
      divisionTotalMax: 144,
      factFamilyMax: 100,
      skipCountMax: 100000,
      skipCountExtraSteps: [2, 3, 4, 5, 10, 100, 1000],
      wordProblemMax: 500,
    },
  ],
};

const BASE_ACTIVITY_POLICY: Record<ActivityType, ActivityPolicy> = {
  place_value_builder: {
    allowedModes: ["identify_number", "identify_place", "missing_mab_part"],
    requiresVisual: true,
  },
  number_order: {
  },
  partition_expand: {
    allowedModes: ["partition", "expand", "flexible_partition"],
  },
  number_line: {
    allowedModes: ["placement", "rounding", "estimate"],
    requiresVisual: true,
  },
  area_model_select: {
    allowedModes: ["shade_fraction", "pick_model", "match_model", "match_equivalent"],
    requiresVisual: true,
  },
  set_model_select: {
    allowedModes: ["tap_fraction", "pick_set", "complete_sentence", "label_shared_group"],
    requiresVisual: true,
  },
  build_the_whole: {
    allowedModes: ["build_whole", "fill_total", "pick_whole"],
    requiresVisual: true,
  },
  number_line_place: {
    allowedModes: ["place_fraction", "pick_point", "order_fractions"],
    requiresVisual: true,
  },
  fraction_compare: {
    allowedModes: ["symbol_compare", "visual_compare", "true_false"],
    requiresVisual: true,
  },
  equivalent_fraction_match: {
    requiresVisual: true,
  },
  equivalent_fraction_build: {
    requiresVisual: true,
  },
  equivalent_fraction_yes_no: {
    requiresVisual: true,
  },
  odd_even_sort: {
    allowedModes: ["identify", "pattern", "odd_even_sums"],
    blockedFocusKeywords: ["addition", "subtraction", "division"],
  },
  addition_strategy: {
    allowedModes: ["jump", "split", "friendly_numbers", "doubles", "near_doubles"],
    maxByContract: { max: "addSubExtensionMax" },
    blockedFocusKeywords: ["odd & even", "division"],
  },
  subtraction_strategy: {
    allowedModes: ["jump", "split", "fact_strategy"],
    maxByContract: { max: "addSubExtensionMax" },
    blockedFocusKeywords: ["odd & even"],
  },
  fact_family: {
    allowedModes: ["recognise", "write_sentences", "word_problems"],
    maxFactValue: 25,
  },
  equal_groups: {
    allowedModes: ["equal_groups"],
    requiresVisual: true,
    maxByContract: {
      maxGroups: "groupsMax",
      maxItemsPerGroup: "itemsMax",
    },
  },
  arrays: {
    allowedModes: ["arrays", "repeated_addition"],
    requiresVisual: true,
    maxByContract: {
      maxRows: "groupsMax",
      maxColumns: "itemsMax",
    },
  },
  skip_count: {
    allowedModes: ["forward"],
    blockedFocusKeywords: ["division - equal groups"],
  },
  division_groups: {
    allowedModes: ["sharing", "grouping", "inverse_link"],
    requiresVisual: true,
    maxByContract: { maxTotal: "divisionTotalMax" },
  },
  mixed_word_problem: {
    allowedModes: ["choose_operation", "two_step_add_sub", "mult_div_problems"],
    maxByContract: { max: "wordProblemMax" },
  },
  review_quiz: {},
  multiple_choice: {},
  typed_response: {},
  speed_round: {},
};

const LEVEL2_ACTIVITY_POLICY: Record<ActivityType, ActivityPolicy> = {
  ...BASE_ACTIVITY_POLICY,
  addition_strategy: {
    ...BASE_ACTIVITY_POLICY.addition_strategy,
    allowedModes: ["jump", "split", "friendly_numbers"],
  },
};

const LEVEL3_ACTIVITY_POLICY: Record<ActivityType, ActivityPolicy> = {
  ...BASE_ACTIVITY_POLICY,
  addition_strategy: {
    ...BASE_ACTIVITY_POLICY.addition_strategy,
    allowedModes: ["jump", "split", "friendly_numbers", "doubles", "near_doubles"],
  },
  fact_family: {
    ...BASE_ACTIVITY_POLICY.fact_family,
    maxFactValue: 50,
  },
};

const LEVEL_ACTIVITY_POLICY: Record<SupportedMathLevel, Record<ActivityType, ActivityPolicy>> = {
  2: LEVEL2_ACTIVITY_POLICY,
  3: LEVEL3_ACTIVITY_POLICY,
};

const LEVEL2_WEEK8_TO_10_FACTORS = [2, 5, 10] as const;
const LEVEL3_MULT_DIV_FACTORS = [2, 3, 4, 5, 10] as const;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const NUMBER_WORD_ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
] as const;

const NUMBER_WORD_TEENS = [
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const NUMBER_WORD_TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

function numberToWordsUnder100(n: number): string {
  if (n < 10) return NUMBER_WORD_ONES[n] ?? "zero";
  if (n < 20) return NUMBER_WORD_TEENS[n - 10] ?? "ten";
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0
    ? NUMBER_WORD_TENS[tens] ?? ""
    : `${NUMBER_WORD_TENS[tens] ?? ""}-${NUMBER_WORD_ONES[ones] ?? ""}`;
}

function numberToWordsUnder1000(n: number): string {
  if (n < 100) return numberToWordsUnder100(n);
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const hundredsText = `${NUMBER_WORD_ONES[hundreds] ?? "zero"} hundred`;
  return remainder === 0
    ? hundredsText
    : `${hundredsText} and ${numberToWordsUnder100(remainder)}`;
}

function numberToWords(n: number): string {
  if (n === 0) return "zero";
  if (n < 1000) return numberToWordsUnder1000(n);

  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;
  const thousandsText = `${numberToWordsUnder1000(thousands)} thousand`;
  if (remainder === 0) return thousandsText;

  return remainder < 100
    ? `${thousandsText} and ${numberToWordsUnder1000(remainder)}`
    : `${thousandsText} ${numberToWordsUnder1000(remainder)}`;
}

function formatNumeral(value: number): string {
  return value.toLocaleString();
}

function formatDecimal(value: number) {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function decimalTenthsOptions(answer: string) {
  const answerValue = Number(answer);
  const values = new Set<number>([answerValue]);
  while (values.size < 4) {
    values.add(randInt(1, 9) / 10);
  }
  return shuffle(Array.from(values).map((value) => formatDecimal(value)));
}

function decimalHundredthsOptions(answer: string) {
  const answerValue = Number(answer);
  const values = new Set<number>([answerValue]);
  while (values.size < 4) {
    values.add(randInt(1, 99) / 100);
  }
  return shuffle(Array.from(values).map((value) => formatDecimal(value)));
}

function buildLargeNumberOptions(target: number, min: number, max: number): string[] {
  const options = new Set<number>([target]);
  const steps = [100000, 10000, 1000, 100, 10, 1];

  for (const step of steps) {
    if (options.size >= 4) break;
    const lower = target - step;
    const upper = target + step;
    if (lower >= min) options.add(lower);
    if (options.size >= 4) break;
    if (upper <= max) options.add(upper);
  }

  while (options.size < 4) {
    const candidate = randInt(min, max);
    if (candidate !== target) options.add(candidate);
  }

  return shuffle(Array.from(options).map(formatNumeral));
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function getRestrictedFactors(
  level: SupportedMathLevel,
  week: number
): number[] | null {
  if (level === 3 && (week === 7 || week === 8 || week === 10)) {
    return [...LEVEL3_MULT_DIV_FACTORS];
  }

  return level === 2 && week >= 8 && week <= 10
    ? [...LEVEL2_WEEK8_TO_10_FACTORS]
    : null;
}

function isYear3Week3Lesson3AdditionOnly(
  level: SupportedMathLevel,
  lesson: Lesson
): boolean {
  return level === 3 && lesson.week === 3 && lesson.lesson === 3;
}

function isYear3Week4SubtractionLesson(
  level: SupportedMathLevel,
  lesson: Lesson
): boolean {
  return level === 3 && lesson.week === 4;
}

function isYear3Week5Lesson(
  level: SupportedMathLevel,
  lesson: Lesson
): boolean {
  return level === 3 && lesson.week === 5;
}

function isYear3Week6TwoStepOnly(
  level: SupportedMathLevel,
  lesson: Lesson
): boolean {
  return level === 3 && lesson.week === 6;
}

function isYear3Week8(
  level: SupportedMathLevel,
  lesson: Lesson
): boolean {
  return level === 3 && lesson.week === 8;
}

function toDigitCells(value: number, width: number): string[] {
  return String(value).padStart(width, " ").split("").map((digit) => (digit === " " ? "" : digit));
}

function buildAdditionCarryRow(a: number, b: number, width: number): string[] | undefined {
  const top = toDigitCells(a, width);
  const bottom = toDigitCells(b, width);
  const carryRow = Array.from({ length: width }, () => "");
  let carry = 0;
  for (let index = width - 1; index >= 0; index -= 1) {
    const sum = Number(top[index] || 0) + Number(bottom[index] || 0) + carry;
    carry = sum >= 10 ? 1 : 0;
    if (carry && index > 0) {
      carryRow[index - 1] = "1";
    }
  }
  return carryRow.some(Boolean) ? carryRow : undefined;
}

function placeValueLabelsForWidth(width: number): string[] {
  if (width <= 1) return ["O"];
  if (width === 2) return ["T", "O"];
  if (width === 3) return ["H", "T", "O"];
  if (width === 4) return ["Th", "H", "T", "O"];
  const generic = Array.from({ length: width }, () => "");
  generic[width - 1] = "O";
  generic[width - 2] = "T";
  generic[width - 3] = "H";
  return generic;
}

function buildSubtractionBorrowData(
  topValue: number,
  bottomValue: number,
  width: number
): { borrowRow?: string[]; crossedTop?: boolean[] } {
  const topDigits = String(topValue).padStart(width, "0").split("").map(Number);
  const bottomDigits = String(bottomValue).padStart(width, "0").split("").map(Number);
  const working = [...topDigits];
  const borrowRow = Array.from({ length: width }, () => "");
  const crossedTop = Array.from({ length: width }, () => false);

  for (let index = width - 1; index >= 0; index -= 1) {
    if (working[index] >= bottomDigits[index]) continue;

    let lender = index - 1;
    while (lender >= 0 && working[lender] === 0) {
      lender -= 1;
    }
    if (lender < 0) continue;

    working[lender] -= 1;
    crossedTop[lender] = true;
    borrowRow[lender] = String(working[lender]);

    for (let cascade = lender + 1; cascade < index; cascade += 1) {
      working[cascade] = 9;
      crossedTop[cascade] = true;
      borrowRow[cascade] = "9";
    }

    working[index] += 10;
    crossedTop[index] = true;
    borrowRow[index] = String(working[index]);
  }

  return {
    borrowRow: borrowRow.some(Boolean) ? borrowRow : undefined,
    crossedTop: crossedTop.some(Boolean) ? crossedTop : undefined,
  };
}

function buildWrittenMethodLayout(
  title: string,
  operation: "+" | "-",
  topValue: number,
  bottomValue: number,
  answer: number
): WrittenMethodLayout {
  const width = Math.max(String(topValue).length, String(bottomValue).length, String(answer).length);
  return {
    title,
    operation,
    top: toDigitCells(topValue, width),
    bottom: toDigitCells(bottomValue, width),
    answerLength: width,
    placeValueLabels: placeValueLabelsForWidth(width),
    carryRow: operation === "+" ? buildAdditionCarryRow(topValue, bottomValue, width) : undefined,
    ...(operation === "-"
      ? buildSubtractionBorrowData(topValue, bottomValue, width)
      : {}),
  };
}

function generateLongAdditionOperands(config: GenericConfig): { a: number; b: number } {
  const configuredMax = typeof config.max === "number" ? config.max : 999;
  const requireCarry = randInt(0, 99) < 55;
  const useThreeDigits = configuredMax >= 100 && randInt(0, 99) < 45;

  if (useThreeDigits) {
    while (true) {
      const a = randInt(120, Math.min(699, configuredMax));
      const b = randInt(110, Math.min(299, configuredMax));
      const onesCarry = (a % 10) + (b % 10) >= 10;
      const tensCarry = (Math.floor((a % 100) / 10) + Math.floor((b % 100) / 10)) >= 10;
      const hasCarry = onesCarry || tensCarry;
      if (hasCarry === requireCarry) {
        return { a, b };
      }
    }
  }

  while (true) {
    const a = randInt(24, 78);
    const b = randInt(11, 69);
    const hasCarry = (a % 10) + (b % 10) >= 10;
    if (hasCarry === requireCarry) {
      return { a, b };
    }
  }
}

function generateRegroupingSubtractionOperands(
  config: GenericConfig,
  preferHarder: boolean
): { total: number; remove: number } {
  const configuredMax = typeof config.max === "number" ? config.max : 999;
  const useThreeDigits = configuredMax >= 100 && randInt(0, 99) < (preferHarder ? 65 : 45);

  if (useThreeDigits) {
    while (true) {
      const total = randInt(preferHarder ? 240 : 140, Math.min(preferHarder ? 899 : 720, configuredMax));
      const remove = randInt(120, Math.min(399, total - 12));
      const topOnes = total % 10;
      const bottomOnes = remove % 10;
      const topTens = Math.floor((total % 100) / 10);
      const bottomTens = Math.floor((remove % 100) / 10);
      if (topOnes < bottomOnes || topTens < bottomTens) {
        return { total, remove };
      }
    }
  }

  while (true) {
    const total = randInt(preferHarder ? 62 : 52, 98);
    const remove = randInt(18, total - 11);
    if (total % 10 < remove % 10) {
      return { total, remove };
    }
  }
}

function buildYear3Week5AdditionQuestion(config: GenericConfig): AdditionStrategyQuestion {
  const { a, b } = generateLongAdditionOperands(config);
  return {
    kind: "addition_strategy",
    prompt: `Complete the long addition for ${a} + ${b}.`,
    hint: "Use long addition. Add the ones first, carry if needed, then add the tens and hundreds.",
    a,
    b,
    answer: a + b,
    options: uniqueNumberOptions(a + b, 18).map(Number),
    mode: "split",
  };
}

function buildYear3Week6TwoStepWordProblem(
  lesson: Lesson
): MixedWordProblemQuestion {
  if (lesson.lesson === 2) {
    const addThenSubtract = randInt(0, 1) === 0;

    const structuredPrompts = addThenSubtract
      ? [
          () => {
            const start = randInt(180, 360);
            const add = randInt(36, 78);
            const remove = randInt(24, 58);
            return {
              prompt: `A shop had ${start} apples. They received ${add} more in the morning, then sold ${remove} in the afternoon. How many apples do they have now?`,
              answer: start + add - remove,
            };
          },
          () => {
            const start = randInt(210, 390);
            const add = randInt(42, 84);
            const remove = randInt(25, 47);
            return {
              prompt: `A school collected ${start} cans for charity. They collected ${add} more the next day, but ${remove} were damaged and thrown away. How many cans are left?`,
              answer: start + add - remove,
            };
          },
          () => {
            const start = randInt(260, 540);
            const add = randInt(34, 76);
            const remove = randInt(22, 54);
            return {
              prompt: `A library had ${start} books. ${add} new books were added, and then ${remove} old books were removed. How many books are in the library now?`,
              answer: start + add - remove,
            };
          },
        ]
      : [
          () => {
            const start = randInt(220, 460);
            const remove = randInt(48, 96);
            const add = randInt(34, 74);
            return {
              prompt: `A farmer had ${start} eggs. He sold ${remove} at the market, then collected ${add} more from his chickens. How many eggs does he have now?`,
              answer: start - remove + add,
            };
          },
          () => {
            const start = randInt(240, 520);
            const remove = randInt(56, 104);
            const add = randInt(28, 68);
            return {
              prompt: `A library had ${start} books. ${remove} were borrowed, and then ${add} new books were added. How many books are in the library now?`,
              answer: start - remove + add,
            };
          },
          () => {
            const start = randInt(180, 380);
            const remove = randInt(39, 82);
            const add = randInt(24, 63);
            return {
              prompt: `A class had ${start} craft sticks. They used ${remove} for a project, then found ${add} more in a cupboard. How many craft sticks do they have now?`,
              answer: start - remove + add,
            };
          },
        ];

    const chosen = structuredPrompts[randInt(0, structuredPrompts.length - 1)]?.() ?? {
      prompt: "A shop had 186 apples. They received 48 more in the morning, then sold 36 in the afternoon. How many apples do they have now?",
      answer: 198,
    };

    return {
      kind: "mixed_word_problem",
      prompt: chosen.prompt,
      answer: chosen.answer,
      options: uniqueNumberOptions(chosen.answer, 28).map(Number),
      operationLabel: "Two-step problem",
      helper: "Start with the first amount, track the change, then apply the second change in the correct order.",
      mode: "two_step_add_sub",
      showStrategyClue: false,
    };
  }

  const useStretch = randInt(0, 99) < 70;
  const templateType = randInt(0, 3);

  const addAdd = () => {
    if (useStretch) {
      const year3 = randInt(120, 230);
      const year4 = randInt(135, 240);
      const newStudents = randInt(24, 58);
      const answer = year3 + year4 + newStudents;
      return {
        prompt: `A school has ${year3} students in Year 3 and ${year4} in Year 4. Then ${newStudents} new students join. How many students are there now?`,
        answer,
      };
    }
    const classA = randInt(42, 78);
    const classB = randInt(36, 72);
    const helpers = randInt(12, 28);
    const answer = classA + classB + helpers;
    return {
      prompt: `A sports day team has ${classA} runners from one class and ${classB} from another. Then ${helpers} helpers join the team. How many people are there altogether?`,
      answer,
    };
  };

  const addSub = () => {
    if (useStretch) {
      const total = randInt(320, 540);
      const morning = randInt(118, 210);
      const afternoon = randInt(62, 145);
      const answer = total - (morning + afternoon);
      return {
        prompt: `There were ${total} tickets available. ${morning} were sold in the morning and ${afternoon} in the afternoon. How many tickets are left?`,
        answer,
      };
    }
    const total = randInt(120, 210);
    const red = randInt(26, 58);
    const blue = randInt(19, 44);
    const answer = total - (red + blue);
    return {
      prompt: `A shop had ${total} balloons. It sold ${red} red balloons and ${blue} blue balloons. How many balloons are left?`,
      answer,
    };
  };

  const subAdd = () => {
    if (useStretch) {
      const start = randInt(360, 560);
      const sold = randInt(128, 235);
      const picked = randInt(65, 150);
      const answer = start - sold + picked;
      return {
        prompt: `A farmer had ${start} apples. He sold ${sold}, then picked ${picked} more. How many apples does he have now?`,
        answer,
      };
    }
    const start = randInt(130, 220);
    const used = randInt(38, 84);
    const found = randInt(16, 42);
    const answer = start - used + found;
    return {
      prompt: `A class had ${start} pencils. They used ${used}, then found ${found} more in a cupboard. How many pencils do they have now?`,
      answer,
    };
  };

  const subSub = () => {
    if (useStretch) {
      const start = randInt(420, 620);
      const first = randInt(115, 188);
      const second = randInt(72, 145);
      const answer = start - first - second;
      return {
        prompt: `There were ${start} books in a library. ${first} were borrowed in the morning, and then ${second} more were borrowed later. How many books are left?`,
        answer,
      };
    }
    const start = randInt(150, 240);
    const morning = randInt(32, 67);
    const afternoon = randInt(18, 46);
    const answer = start - morning - afternoon;
    return {
      prompt: `A canteen made ${start} sandwiches. It sold ${morning} at recess and ${afternoon} at lunch. How many sandwiches are left?`,
      answer,
    };
  };

  const chosen =
    [addAdd, addSub, subAdd, subSub][templateType]?.() ?? {
      prompt: "There were 320 tickets available. 185 were sold in the morning and 74 in the afternoon. How many tickets are left?",
      answer: 61,
    };

  const helper =
    lesson.lesson === 1
      ? "Work out what happens first, then decide the second operation before solving."
      : lesson.lesson === 2
      ? "This problem takes 2 steps. Plan the order carefully before you calculate."
      : "Estimate first, then solve both steps and check whether your answer makes sense.";

  return {
    kind: "mixed_word_problem",
    prompt: chosen.prompt,
    answer: chosen.answer,
    options: uniqueNumberOptions(chosen.answer, useStretch ? 32 : 18).map(Number),
    operationLabel: "Two-step problem",
    helper,
    mode: "two_step_add_sub",
    showStrategyClue: false,
  };
}

function buildYear3Week8MixedWordProblem(
  lesson: Lesson
): MixedWordProblemQuestion {
  const weightedFactors = [3, 4, 3, 4, 2, 5, 10];
  const factorA = weightedFactors[randInt(0, weightedFactors.length - 1)] ?? 3;
  const factorB = weightedFactors[randInt(0, weightedFactors.length - 1)] ?? 4;

  if (lesson.lesson === 3 && randInt(0, 99) < 40) {
    if (randInt(0, 1) === 0) {
      const groups = factorA;
      const inEach = factorB + randInt(1, 3);
      const extraEach = randInt(1, 3);
      const answer = groups * inEach + groups * extraEach;
      return {
        kind: "mixed_word_problem",
        prompt: `${groups * inEach} apples are shared into ${groups} groups. Then ${extraEach} more apples are added to each group. How many apples are there altogether now?`,
        answer,
        options: uniqueNumberOptions(answer, 12).map(Number),
        operationLabel: "Two-step multiplication/division",
        helper: "First work out how many are in each group, then apply the second change.",
        mode: "mult_div_problems",
        showStrategyClue: false,
      };
    }

    const groups = factorA;
    const inEach = factorB + randInt(1, 2);
    const total = groups * inEach;
    const extraGroups = randInt(1, 3);
    const answer = total + extraGroups * inEach;
    return {
      kind: "mixed_word_problem",
      prompt: `There are ${groups} bags with ${inEach} apples in each bag. Then ${extraGroups} more bags are added with the same number of apples. How many apples are there altogether?`,
      answer,
      options: uniqueNumberOptions(answer, 12).map(Number),
      operationLabel: "Two-step multiplication/division",
      helper: "Work out the first total, then add the amount from the extra bags.",
      mode: "mult_div_problems",
      showStrategyClue: false,
    };
  }

  if (randInt(0, 1) === 0) {
    const groups = factorA;
    const perGroup = factorB;
    const answer = groups * perGroup;
    return {
      kind: "mixed_word_problem",
      prompt: `There are ${groups} bags with ${perGroup} apples in each bag. How many apples are there altogether?`,
      answer,
      options: uniqueNumberOptions(answer, 8).map(Number),
      operationLabel: "Multiply",
      helper: "Think about equal groups. Which multiplication fact matches the story?",
      mode: "mult_div_problems",
      showStrategyClue: false,
    };
  }

  const groups = factorA;
  const perGroup = factorB;
  const total = groups * perGroup;
  return {
    kind: "mixed_word_problem",
    prompt: `${total} apples are shared into ${groups} equal groups. How many apples are in each group?`,
    answer: perGroup,
    options: uniqueNumberOptions(perGroup, 6).map(Number),
    operationLabel: "Divide",
    helper: "Use the related multiplication fact to help you divide.",
    mode: "mult_div_problems",
    showStrategyClue: false,
  };
}

function isYear3Week9Lesson1SkipCount(
  level: SupportedMathLevel,
  lesson: Lesson,
  step: number
): boolean {
  return level === 3 && lesson.week === 9 && lesson.lesson === 1 && (step === 100 || step === 1000);
}

function isYear3Week9Lesson3Estimation(
  level: SupportedMathLevel,
  lesson: Lesson
): boolean {
  return level === 3 && lesson.week === 9 && lesson.lesson === 3;
}

function isYear3Week11Lesson2FractionsOfSets(
  level: SupportedMathLevel,
  lesson: Lesson
): boolean {
  return level === 3 && lesson.week === 11 && lesson.lesson === 2;
}

function buildYear3Week9SkipCountSequence(step: number) {
  const friendly = randInt(0, 9) < 6;
  const useLargeNumber = randInt(0, 9) < 4;
  const baseUnits =
    step === 1000
      ? useLargeNumber
        ? randInt(12, 90)
        : randInt(3, 35)
      : useLargeNumber
      ? randInt(12, 260)
      : randInt(8, 95);
  const trailing =
    friendly
      ? 0
      : step === 1000
      ? ([120, 250, 340, 480, 670][randInt(0, 4)] ?? 250)
      : ([40, 50, 60, 70, 80][randInt(0, 4)] ?? 50);
  const start = baseUnits * step + trailing;
  const sequence = [start, start + step, start + step * 2, start + step * 3];
  const reverse = randInt(0, 9) === 0;
  const orderedSequence = reverse ? [...sequence].reverse() : sequence;
  const gapModeRoll = randInt(0, 9);
  const gapIndex = gapModeRoll < 3 ? 1 : gapModeRoll < 6 ? 2 : 3;
  const answer = orderedSequence[gapIndex] ?? orderedSequence[orderedSequence.length - 1] ?? start;
  const displaySequence = orderedSequence.map((value, index) => (index === gapIndex ? -1 : value));
  const promptPrefix = reverse
    ? `Fill in the missing number. Skip count backwards by ${step}.`
    : `Fill in the missing number. Skip count by ${step}.`;
  const promptText = displaySequence.map((value) => (value === -1 ? "__" : String(value))).join(", ");

  return {
    answer,
    displaySequence,
    promptPrefix,
    promptText,
    step,
  };
}

function buildYear3Week9SkipCountQuestion(step: number): SkipCountQuestion {
  const { answer, displaySequence, promptPrefix } = buildYear3Week9SkipCountSequence(step);

  return {
    kind: "skip_count",
    prompt: promptPrefix,
    sequence: displaySequence,
    answer,
    options: uniqueNumberOptions(answer, step * 3).map(Number),
    step,
    mode: "forward",
  };
}

function buildYear3Week9SkipCountWrapper(
  step: number,
  asMultipleChoice: boolean
): MultipleChoiceQuestion | TypedResponseQuestion {
  const { answer, promptPrefix, promptText } = buildYear3Week9SkipCountSequence(step);

  if (!asMultipleChoice) {
    return {
      kind: "typed_response",
      prompt: `${promptPrefix} ${promptText}`,
      answer: String(answer),
      placeholder: "Type the missing number",
    };
  }

  return {
    kind: "multiple_choice",
    prompt: `${promptPrefix} ${promptText}`,
    answer: String(answer),
    options: uniqueNumberOptions(answer, step * 3),
  };
}

function buildYear3Week9EstimationQuestion(): MixedWordProblemQuestion {
  const fmt = (value: number) => value.toLocaleString();
  const useThousands = randInt(0, 9) < 6;
  const contexts = [
    { noun: "stickers", place: "class" },
    { noun: "people", place: "stadium" },
    { noun: "tickets", place: "school fair" },
    { noun: "books", place: "library" },
  ];
  const context = contexts[randInt(0, contexts.length - 1)] ?? contexts[0];

  if (useThousands) {
    const first = randInt(1800, 4800);
    const second = randInt(1400, 4200);
    const roundedFirst = roundToNearest(first, 100);
    const roundedSecond = roundToNearest(second, 100);
    const estimatedRaw = roundedFirst + roundedSecond;
    const answer = roundToNearest(estimatedRaw, 1000);
    const options = [Math.max(0, answer - 1000), answer, answer + 1000];

    return {
      kind: "mixed_word_problem",
      prompt: `A ${context.place} had ${fmt(first)} ${context.noun} on Friday and ${fmt(second)} on Saturday. About how many ${context.noun} was that altogether?`,
      answer,
      options,
      operationLabel: "Estimate by rounding",
      helper: `${fmt(first)} ≈ ${fmt(roundedFirst)} and ${fmt(second)} ≈ ${fmt(roundedSecond)}. ${fmt(roundedFirst)} + ${fmt(roundedSecond)} ≈ ${fmt(estimatedRaw)}. Which answer is closest?`,
      mode: "choose_operation",
      showStrategyClue: false,
    };
  }

  const first = randInt(140, 480);
  const second = randInt(120, 390);
  const roundedFirst = roundToNearest(first, 100);
  const roundedSecond = roundToNearest(second, 100);
  const answer = roundedFirst + roundedSecond;
  const options = [Math.max(0, answer - 100), answer, answer + 100];

  return {
    kind: "mixed_word_problem",
    prompt: `A ${context.place} collected ${fmt(first)} ${context.noun} and then ${fmt(second)} more. About how many ${context.noun} is that altogether?`,
    answer,
    options,
    operationLabel: "Estimate by rounding",
    helper: `${fmt(first)} ≈ ${fmt(roundedFirst)} and ${fmt(second)} ≈ ${fmt(roundedSecond)}. ${fmt(roundedFirst)} + ${fmt(roundedSecond)} ≈ ${fmt(answer)}. Which answer is closest?`,
    mode: "choose_operation",
    showStrategyClue: false,
  };
}

function buildYear3Week5SubtractionQuestion(
  lesson: Lesson,
  config: GenericConfig
): SubtractionStrategyQuestion {
  const { total, remove } = generateRegroupingSubtractionOperands(config, lesson.lesson === 3);
  const answer = total - remove;
  return {
    kind: "subtraction_strategy",
    prompt: `Complete the long subtraction for ${total} - ${remove}.`,
    hint: "Use long subtraction. Start with the ones column and regroup when the top digit is too small.",
    total,
    remove,
    answer,
    options: uniqueNumberOptions(answer, 18).map(Number),
    mode: "split",
    strategyLabel: "Long subtraction",
    strategySteps: [
      "Line up the digits by place value.",
      "Subtract the ones first and regroup if needed.",
      "Then subtract the tens and hundreds.",
    ],
  };
}

function buildYear3Week4SubtractionQuestion(
  lesson: Lesson,
  mode: SubtractionStrategyQuestion["mode"]
): SubtractionStrategyQuestion {
  if (lesson.lesson === 1) {
    const useCountUp = randInt(0, 1) === 0;
    if (useCountUp) {
      const answer = randInt(3, 18);
      const remove = randInt(90, 205);
      const total = remove + answer;
      const bridgeToTen = Math.ceil(remove / 10) * 10;
      const steps =
        bridgeToTen < total
          ? [`${remove} -> ${bridgeToTen} (+${bridgeToTen - remove})`, `${bridgeToTen} -> ${total} (+${total - bridgeToTen})`]
          : [`${remove} -> ${total} (+${answer})`];
      return {
        kind: "subtraction_strategy",
        prompt: `Solve ${total} - ${remove}. Which is better here: count back or count up?`,
        hint: "Count up when the two numbers are close together. Think about the small gap between them.",
        total,
        remove,
        answer,
        options: uniqueNumberOptions(answer, 10).map(Number),
        mode,
        strategyLabel: "Count up strategy",
        strategySteps: steps,
      };
    }

    const total = randInt(130, 220);
    const remove = randInt(24, Math.min(89, total - 25));
    const answer = total - remove;
    const tens = Math.floor(remove / 10) * 10;
    const ones = remove % 10;
    const afterTens = total - tens;
    const steps = tens > 0
      ? [`${total} -> ${afterTens} (-${tens})`, `${afterTens} -> ${answer} (-${ones})`]
      : [`${total} -> ${answer} (-${ones})`];
    return {
      kind: "subtraction_strategy",
      prompt: `Solve ${total} - ${remove}. Which is better here: count back or count up?`,
      hint: "Count back when the number taken away is small enough to jump back in parts.",
      total,
      remove,
      answer,
      options: uniqueNumberOptions(answer, 14).map(Number),
      mode,
      strategyLabel: "Count back strategy",
      strategySteps: steps,
    };
  }

  if (lesson.lesson === 2) {
    const compareMode = randInt(0, 1) === 0;
    const remove = randInt(78, 168);
    const answer = randInt(18, 67);
    const total = remove + answer;
    return {
      kind: "subtraction_strategy",
      prompt: compareMode
        ? `Find the difference between ${remove} and ${total}.`
        : `How much more is ${total} than ${remove}?`,
      hint: "Think about the gap between the two numbers. Difference tells you how far apart they are.",
      total,
      remove,
      answer,
      options: uniqueNumberOptions(answer, 12).map(Number),
      mode,
      strategyLabel: compareMode ? "Difference strategy" : "Compare the gap",
      strategySteps: [`Start at ${remove}.`, `Count on to ${total}.`, `The total jump is ${answer}.`],
    };
  }

  const answer = randInt(24, 68);
  const remove = randInt(26, 89);
  const total = remove + answer;
  return {
    kind: "subtraction_strategy",
    prompt:
      randInt(0, 1) === 0
        ? `Use a related fact to solve ${total} - ${remove}.`
        : `If ${remove} + ${answer} = ${total}, what is ${total} - ${remove}?`,
    hint: "Use a known fact or inverse fact to help. Addition and subtraction are linked.",
    total,
    remove,
    answer,
    options: uniqueNumberOptions(answer, 12).map(Number),
    mode,
    strategyLabel: "Inverse fact strategy",
    strategySteps: [`Think of ${remove} + ? = ${total}.`, `The missing part is ${answer}.`, `So ${total} - ${remove} = ${answer}.`],
  };
}

function restrictFactors(candidates: number[] | undefined, fallback: number[]): number[] {
  const filtered = (candidates ?? fallback).filter((value) => fallback.includes(value));
  return filtered.length > 0 ? filtered : fallback;
}

function requiresVisualMultiplicativeSupport(level: SupportedMathLevel, week: number): boolean {
  return level === 2 && week >= 8 && week <= 10;
}

function uniqueNumberOptions(answer: number, spread = 12) {
  const values = new Set<number>([answer]);
  let attempts = 0;
  while (values.size < 4 && attempts < 100) {
    attempts++;
    const offset = randInt(-spread, spread);
    const candidate = Math.max(0, answer + offset);
    if (candidate !== answer || values.size === 0) values.add(candidate);
  }
  // Fallback: if spread is too small, widen it
  while (values.size < 4) {
    values.add(answer + values.size);
  }
  return shuffle(Array.from(values)).map(String);
}

function digitForPlace(value: number, place: PlaceValueName) {
  if (place === "hundred_thousands") return Math.floor(value / 100000) % 10;
  if (place === "ten_thousands") return Math.floor(value / 10000) % 10;
  if (place === "thousands") return Math.floor(value / 1000) % 10;
  if (place === "hundreds") return Math.floor(value / 100) % 10;
  if (place === "tens") return Math.floor(value / 10) % 10;
  return value % 10;
}

function placeLabel(place: PlaceValueName) {
  if (place === "hundred_thousands") return "hundred thousands";
  if (place === "ten_thousands") return "ten thousands";
  if (place === "thousands") return "thousands";
  if (place === "hundreds") return "hundreds";
  if (place === "tens") return "tens";
  return "ones";
}

function partitionNumber(value: number) {
  return {
    ...(value >= 1000 ? { thousands: Math.floor(value / 1000) * 1000 } : {}),
    hundreds: Math.floor((value % 1000) / 100) * 100,
    tens: Math.floor((value % 100) / 10) * 10,
    ones: value % 10,
  };
}

function roundToNearest(value: number, unit: number) {
  return Math.round(value / unit) * unit;
}

/* ── 3 contextual rounding word-problem styles ── */
function roundingWordProblem(
  value: number,
  targetUnit: number,
  rounded: number
): { prompt: string; helper: string } {
  const fmt = (n: number) => n.toLocaleString();
  const unitLabel =
    targetUnit >= 1000
      ? `${fmt(targetUnit)}`
      : targetUnit.toString();

  // Style pools by context
  const style1Templates = [
    {
      prompt: `A school is ordering pencils. They need ${fmt(value)} pencils. Pencils come in boxes of ${fmt(targetUnit)}. How many pencils should they order (rounded to the nearest ${unitLabel})?`,
      helper: `Round ${fmt(value)} to the nearest ${unitLabel}.`,
    },
    {
      prompt: `A factory made ${fmt(value)} toys. They pack them in crates of ${fmt(targetUnit)}. How many toys should they report (rounded to the nearest ${unitLabel})?`,
      helper: `Round ${fmt(value)} to the nearest ${unitLabel}.`,
    },
    {
      prompt: `The school library has ${fmt(value)} books. For the catalogue, they round to the nearest ${unitLabel}. How many books go in the catalogue?`,
      helper: `Round ${fmt(value)} to the nearest ${unitLabel}.`,
    },
    {
      prompt: `A stadium holds ${fmt(value)} people. The newspaper rounds attendance to the nearest ${unitLabel}. What number do they print?`,
      helper: `Round ${fmt(value)} to the nearest ${unitLabel}.`,
    },
  ];

  const style2Templates = [
    {
      prompt: `A school fundraiser raised $${fmt(value)}. The teacher says, "That's about $${fmt(rounded - targetUnit)}." Do you agree? What should it be rounded to the nearest ${unitLabel}?`,
      helper: `Think carefully — is $${fmt(rounded - targetUnit)} the best estimate?`,
    },
    {
      prompt: `${fmt(value)} students signed up for sports day. The principal says, "That's roughly ${fmt(rounded + targetUnit)}." Is that right? Round to the nearest ${unitLabel}.`,
      helper: `Check — is ${fmt(rounded + targetUnit)} the closest multiple of ${unitLabel}?`,
    },
    {
      prompt: `A baker made ${fmt(value)} cupcakes. She told her boss, "I made about ${fmt(rounded - targetUnit)}." Is she correct? Round to the nearest ${unitLabel}.`,
      helper: `Is ${fmt(rounded - targetUnit)} the nearest multiple of ${unitLabel}?`,
    },
  ];

  const style3Templates = [
    {
      prompt: `You're buying tickets for a school event. ${fmt(value)} tickets have been sold. The organiser says: "We've sold about ${fmt(rounded - targetUnit)} tickets." 🎯 Is that a good estimate? Round to the nearest ${unitLabel}.`,
      helper: `Think about whether ${fmt(rounded - targetUnit)} or ${fmt(rounded)} is closer.`,
    },
    {
      prompt: `A charity walk had ${fmt(value)} participants. The news report says "about ${fmt(rounded + targetUnit)} people joined." 🎯 Is that the best estimate? Round to the nearest ${unitLabel}.`,
      helper: `Is ${fmt(rounded + targetUnit)} really the closest?`,
    },
    {
      prompt: `The school tuckshop sold ${fmt(value)} sausage rolls this term. The report says "approximately ${fmt(rounded - targetUnit)}." 🎯 Is that right? What should it say, rounded to the nearest ${unitLabel}?`,
      helper: `Check which multiple of ${unitLabel} is closest to ${fmt(value)}.`,
    },
  ];

  const style = randInt(1, 3);
  if (style === 1) return style1Templates[randInt(0, style1Templates.length - 1)];
  if (style === 2) return style2Templates[randInt(0, style2Templates.length - 1)];
  return style3Templates[randInt(0, style3Templates.length - 1)];
}

function supportedPlaces(config: GenericConfig) {
  const candidates = config.placeValues?.filter(
    (value): value is PlaceValueName =>
      value === "hundred_thousands" ||
      value === "ten_thousands" ||
      value === "thousands" ||
      value === "hundreds" ||
      value === "tens" ||
      value === "ones"
  );
  return candidates && candidates.length > 0
    ? candidates
    : (["hundreds", "tens", "ones"] as PlaceValueName[]);
}

export function getDifficultyProfile(level: SupportedMathLevel, week: number): DifficultyProfile {
  const contract =
    YEAR_LEVEL_DIFFICULTY_CONTRACTS[level].find(
      (candidate) => week >= candidate.weekMin && week <= candidate.weekMax
    ) ?? YEAR_LEVEL_DIFFICULTY_CONTRACTS[level][YEAR_LEVEL_DIFFICULTY_CONTRACTS[level].length - 1];

  return {
    addSubMax: contract.addSubMax,
    addSubExtensionMax: contract.addSubExtensionMax,
    groupsMax: contract.groupsMax,
    itemsMax: contract.itemsMax,
    divisionTotalMax: contract.divisionTotalMax,
    factFamilyMax: contract.factFamilyMax,
    skipCountMax: contract.skipCountMax,
    skipCountExtraSteps: contract.skipCountExtraSteps,
    wordProblemMax: contract.wordProblemMax,
  };
}

export function getLevelForLesson(lesson: Lesson): SupportedMathLevel {
  const yearMatch = lesson.id.match(/^y(\d+)-/);
  const yearNumber = yearMatch ? Number(yearMatch[1]) : 2;
  return yearNumber >= 3 ? 3 : 2;
}

export function getAllowedModes(
  level: SupportedMathLevel,
  activityType: ActivityType
): string[] | undefined {
  return LEVEL_ACTIVITY_POLICY[level][activityType]?.allowedModes;
}

function getActivityPolicy(level: SupportedMathLevel, activityType: ActivityType) {
  return LEVEL_ACTIVITY_POLICY[level][activityType];
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeFocus(focus: string) {
  return focus.trim().toLowerCase();
}

function randomFromList<T>(items: T[]): T {
  return items[randInt(0, items.length - 1)] ?? items[0];
}

function generateAdditionStrategyQuestion(
  config: GenericConfig,
  level: SupportedMathLevel,
  lesson: Lesson
): AdditionStrategyQuestion {
  if (isYear3Week5Lesson(level, lesson) && lesson.lesson === 1) {
    return buildYear3Week5AdditionQuestion(config);
  }

  const profile = getDifficultyProfile(level, lesson.week);
  const min = typeof config.min === "number" ? config.min : 0;
  const max = typeof config.max === "number" ? config.max : profile.addSubMax;
  const mode =
    config.mode === "split" ||
    config.mode === "friendly_numbers" ||
    config.mode === "doubles" ||
    config.mode === "near_doubles"
      ? config.mode
      : "jump";

  let a = randInt(min, Math.max(min, max - 10));
  let b = randInt(2, 18);
  let prompt = "";
  let hint = `Start at ${a} and jump ${b} more.`;

  if (mode === "doubles") {
    const lower = Math.max(10, min, 2);
    const upper = Math.max(lower, Math.min(100, max, Math.floor(profile.addSubExtensionMax / 2)));
    const n = randInt(lower, upper);
    a = n;
    b = n;
    prompt = `Solve ${a} + ${b}.`;
    const tens = Math.floor(a / 10) * 10;
    const ones = a % 10;
    hint = ones === 0
      ? `Use a doubles fact: double ${a}.`
      : `Split and double: double ${tens} = ${tens * 2}, double ${ones} = ${ones * 2}, then add them.`;
  } else if (mode === "near_doubles") {
    const lower = Math.max(20, min, 2);
    const upper = Math.max(lower + 2, Math.min(100, max, profile.addSubExtensionMax - 1));
    const difference = Math.random() < 0.7 ? 1 : 2;
    const nearTenCandidates = Array.from(
      { length: Math.max(0, upper - lower - difference + 1) },
      (_, offset) => lower + offset
    ).filter((value) => value % 10 === 8 || value % 10 === 9);
    const base =
      Math.random() < 0.35 && nearTenCandidates.length > 0
        ? randomFromList(nearTenCandidates)
        : randInt(lower, upper - difference);
    a = base;
    b = base + difference;
    if (Math.random() < 0.3) {
      const mistaken = a + a;
      prompt = `A student says "${a} + ${b} = ${mistaken}" because ${a} + ${a} = ${mistaken}. What should the answer be?`;
    } else {
      prompt = `Solve ${a} + ${b}.`;
    }
    hint =
      difference === 1
        ? `Use a near double: double ${a}, then add 1.`
        : `Use a near double: double ${a}, then add 2.`;
  } else if (mode === "split") {
    a = randInt(18, Math.max(30, Math.min(99, max)));
    b = randInt(12, Math.min(39, Math.max(12, profile.addSubMax / 3)));
    hint = `Split ${b} into tens and ones.`;
  } else if (mode === "friendly_numbers") {
    a = randInt(20, Math.max(29, Math.min(profile.addSubExtensionMax, 189)));
    const bridge = 10 - (a % 10 || 10);
    b = bridge + randInt(2, 12);
    hint = "Make a friendly ten first, then add the rest.";
  }

  if (!prompt) prompt = `Solve ${a} + ${b}.`;
  const answer = a + b;
  return {
    kind: "addition_strategy",
    prompt,
    hint,
    a,
    b,
    answer,
    options: uniqueNumberOptions(answer).map(Number),
    mode,
  };
}

function buildViolation(
  reason: ValidationReason,
  lesson: Lesson,
  activityType: ActivityType,
  message: string
): Year2PolicyViolation {
  return {
    reason,
    activityType,
    lessonWeek: lesson.week,
    lessonTitle: lesson.title,
    message,
  };
}

function addViolation(
  list: Year2PolicyViolation[],
  reason: ValidationReason,
  lesson: Lesson,
  activityType: ActivityType,
  message: string
) {
  list.push(buildViolation(reason, lesson, activityType, message));
}

function validateConfigAgainstPolicy(
  lesson: Lesson,
  activity: LessonActivity,
  policy: ActivityPolicy,
  profile: DifficultyProfile,
  violations: Year2PolicyViolation[]
) {
  const config = (activity.config ?? {}) as GenericConfig;
  const mode = typeof config.mode === "string" ? config.mode : undefined;
  const level = getLevelForLesson(lesson);
  const restrictedFactors = getRestrictedFactors(level, lesson.week);

  if (policy.allowedModes && mode && !policy.allowedModes.includes(mode)) {
    addViolation(
      violations,
      "mode_blocked",
      lesson,
      activity.activityType,
      `Mode "${mode}" is not allowed for ${activity.activityType}.`
    );
  }

  if (policy.requiresVisual && activity.activityType === "place_value_builder") {
    const visualMode = typeof config.visualMode === "string" ? config.visualMode : "mab";
    if (visualMode !== "mab") {
      addViolation(
        violations,
        "visual_missing",
        lesson,
        activity.activityType,
        "Place value builder requires MAB visual mode."
      );
    }
  }

  if (policy.maxByContract) {
    for (const [configField, contractField] of Object.entries(policy.maxByContract)) {
      const configured = asNumber(config[configField as keyof GenericConfig]);
      if (configured !== null && configured > profile[contractField]) {
        addViolation(
          violations,
          "difficulty",
          lesson,
          activity.activityType,
          `Config "${configField}" exceeds allowed ${profile[contractField]} for week ${lesson.week}.`
        );
      }
    }
  }

  if (activity.activityType === "skip_count") {
    const step = asNumber(config.step);
    if (step !== null && !profile.skipCountExtraSteps.includes(step)) {
      addViolation(
        violations,
        "difficulty",
        lesson,
        activity.activityType,
        `Skip count step ${step} is outside allowed steps for week ${lesson.week}.`
      );
    }
    if (restrictedFactors && step !== null && !restrictedFactors.includes(step)) {
      addViolation(
        violations,
        "difficulty",
        lesson,
        activity.activityType,
        `Weeks 8-10 only allow skip counting by 2, 5, or 10.`
      );
    }
  }

  if (
    restrictedFactors &&
    (activity.activityType === "equal_groups" ||
      activity.activityType === "arrays" ||
      activity.activityType === "division_groups")
  ) {
    const configuredSizes = Array.isArray(config.allowedGroupSizes)
      ? config.allowedGroupSizes.filter((value): value is number => typeof value === "number")
      : [];
    if (configuredSizes.some((value) => !restrictedFactors.includes(value))) {
      addViolation(
        violations,
        "difficulty",
        lesson,
        activity.activityType,
        `Weeks 8-10 only allow factors/group sizes 2, 5, and 10.`
      );
    }
  }

  if (
    restrictedFactors &&
    requiresVisualMultiplicativeSupport(level, lesson.week) &&
    (activity.activityType === "multiple_choice" || activity.activityType === "typed_response")
  ) {
    const sourceType = config.sourceActivityType;
    if (
      sourceType === "skip_count" ||
      sourceType === "equal_groups" ||
      sourceType === "arrays" ||
      sourceType === "division_groups" ||
      sourceType === "fact_family"
    ) {
      addViolation(
        violations,
        "alignment",
        lesson,
        activity.activityType,
        `Weeks 8-10 require visual-first multiplicative activities, not generic ${activity.activityType} wrappers.`
      );
    }
  }

  if (activity.activityType === "mixed_word_problem" && Array.isArray(config.operations)) {
    const operations = config.operations.filter((value): value is string => typeof value === "string");
    const mode = typeof config.mode === "string" ? config.mode : "choose_operation";
    if (mode === "mult_div_problems" && operations.some((operation) => operation === "+" || operation === "-")) {
      addViolation(
        violations,
        "alignment",
        lesson,
        activity.activityType,
        "mult_div_problems mode must not include + or - operations."
      );
    }
    if (mode === "two_step_add_sub" && operations.some((operation) => operation === "x" || operation === "/")) {
      addViolation(
        violations,
        "alignment",
        lesson,
        activity.activityType,
        "two_step_add_sub mode must not include x or / operations."
      );
    }
  }

  if (activity.activityType === "fact_family" && policy.maxFactValue) {
    const configuredMax = asNumber(config.max);
    if (configuredMax !== null && configuredMax > policy.maxFactValue * 4) {
      addViolation(
        violations,
        "difficulty",
        lesson,
        activity.activityType,
        `Fact family max is too high for Year 2 expectations.`
      );
    }
  }
}

function validateQuestionAgainstPolicy(
  lesson: Lesson,
  activity: LessonActivity,
  policy: ActivityPolicy,
  question: Year2QuestionData,
  profile: DifficultyProfile,
  violations: Year2PolicyViolation[]
) {
  const level = getLevelForLesson(lesson);
  if (question.kind !== activity.activityType && activity.activityType !== "review_quiz") {
    addViolation(
      violations,
      "alignment",
      lesson,
      activity.activityType,
      `Generated question kind "${question.kind}" does not match activity type "${activity.activityType}".`
    );
  }

  if (policy.allowedModes && "mode" in question && typeof question.mode === "string") {
    if (!policy.allowedModes.includes(question.mode)) {
      addViolation(
        violations,
        "mode_blocked",
        lesson,
        activity.activityType,
        `Question mode "${question.mode}" is not allowed for ${activity.activityType}.`
      );
    }
  }

  if (policy.requiresVisual && question.kind === "place_value_builder" && question.visualMode !== "mab") {
    addViolation(
      violations,
      "visual_missing",
      lesson,
      activity.activityType,
      "Generated place value question is missing required MAB visual mode."
    );
  }

  if (question.kind === "addition_strategy" && question.answer > profile.addSubExtensionMax) {
    addViolation(
      violations,
      "difficulty",
      lesson,
      activity.activityType,
      `Addition result ${question.answer} exceeds week difficulty contract.`
    );
  }

  if (question.kind === "subtraction_strategy" && question.total > profile.addSubExtensionMax) {
    addViolation(
      violations,
      "difficulty",
      lesson,
      activity.activityType,
      `Subtraction total ${question.total} exceeds week difficulty contract.`
    );
  }

  if (
    level === 3 &&
    lesson.week === 5 &&
    question.kind === "typed_response" &&
    !question.writtenMethod
  ) {
    addViolation(
      violations,
      "alignment",
      lesson,
      activity.activityType,
      "Year 3 Week 5 typed-response tasks must include an on-screen written method."
    );
  }

  if (question.kind === "division_groups" && question.total > profile.divisionTotalMax) {
    addViolation(
      violations,
      "difficulty",
      lesson,
      activity.activityType,
      `Division total ${question.total} exceeds week difficulty contract.`
    );
  }

  if (question.kind === "fact_family" && Math.max(...question.family) > profile.factFamilyMax) {
    addViolation(
      violations,
      "difficulty",
      lesson,
      activity.activityType,
      `Fact family values exceed week difficulty contract.`
    );
  }

  if (question.kind === "skip_count" && !profile.skipCountExtraSteps.includes(question.step)) {
    addViolation(
      violations,
      "difficulty",
      lesson,
      activity.activityType,
      `Skip count step ${question.step} is outside allowed steps for week ${lesson.week}.`
    );
  }

  if (requiresVisualMultiplicativeSupport(level, lesson.week)) {
    if (question.kind === "skip_count" && (!question.visualGroups || question.visualGroups.length === 0)) {
      addViolation(
        violations,
        "visual_missing",
        lesson,
        activity.activityType,
        "Weeks 8-10 skip counting requires visual bundles."
      );
    }

    if (question.kind === "fact_family" && !question.visual) {
      addViolation(
        violations,
        "visual_missing",
        lesson,
        activity.activityType,
        "Weeks 8-10 fact families require a visual array model."
      );
    }
  }
}

export function validateLessonActivityIntentForLevel(
  level: SupportedMathLevel,
  lesson: Lesson,
  activity: LessonActivity,
  question?: Year2QuestionData
): Year2PolicyValidation {
  const profile = getDifficultyProfile(level, lesson.week);
  const policy = getActivityPolicy(level, activity.activityType);
  const violations: Year2PolicyViolation[] = [];
  const focus = normalizeFocus(lesson.focus);
  const config = (activity.config ?? {}) as GenericConfig;
  const sourceActivityType = config.sourceActivityType;

  if (!policy) {
    addViolation(
      violations,
      "alignment",
      lesson,
      activity.activityType,
      `No activity policy is defined for ${activity.activityType}.`
    );
    return { valid: false, violations };
  }

  validateConfigAgainstPolicy(lesson, activity, policy, profile, violations);

  if (focus.includes("odd & even") && (activity.activityType === "addition_strategy" || activity.activityType === "subtraction_strategy")) {
    addViolation(
      violations,
      "alignment",
      lesson,
      activity.activityType,
      "Odd & even lessons must not include standalone addition/subtraction strategy activities."
    );
  }

  if (
    focus.includes("odd & even") &&
    (activity.activityType === "number_line" || activity.activityType === "number_order")
  ) {
    addViolation(
      violations,
      "alignment",
      lesson,
      activity.activityType,
      "Odd & even lessons must not include number line/order activities."
    );
  }

  if (focus.includes("division - equal groups") && activity.activityType === "skip_count") {
    addViolation(
      violations,
      "alignment",
      lesson,
      activity.activityType,
      "Division lessons must not include skip count as an instructional activity."
    );
  }

  if (policy.blockedFocusKeywords && policy.blockedFocusKeywords.some((keyword) => focus.includes(keyword))) {
    addViolation(
      violations,
      "alignment",
      lesson,
      activity.activityType,
      `${activity.activityType} is blocked for focus "${lesson.focus}".`
    );
  }

  if (isYear3Week3Lesson3AdditionOnly(level, lesson)) {
    const isAlignedAdditionActivity =
      activity.activityType === "addition_strategy" ||
      ((activity.activityType === "multiple_choice" || activity.activityType === "typed_response") &&
        sourceActivityType === "addition_strategy");

    if (!isAlignedAdditionActivity) {
      addViolation(
        violations,
        "alignment",
        lesson,
        activity.activityType,
        "Year 3 Week 3 Lesson 3 must only use addition strategy activities or aligned addition-only wrappers."
      );
    }
  }

  if (isYear3Week4SubtractionLesson(level, lesson)) {
    const isAlignedSubtractionActivity =
      activity.activityType === "subtraction_strategy" ||
      ((activity.activityType === "multiple_choice" || activity.activityType === "typed_response") &&
        sourceActivityType === "subtraction_strategy");

    if (!isAlignedSubtractionActivity) {
      addViolation(
        violations,
        "alignment",
        lesson,
        activity.activityType,
        "Year 3 Week 4 lessons must only use subtraction strategy activities or aligned subtraction-only wrappers."
      );
    }
  }

  if (isYear3Week5Lesson(level, lesson)) {
    if (lesson.lesson === 1) {
      const isWrittenAdditionActivity =
        activity.activityType === "typed_response" && sourceActivityType === "addition_strategy";
      if (!isWrittenAdditionActivity) {
        addViolation(
          violations,
          "alignment",
          lesson,
          activity.activityType,
          "Year 3 Week 5 Lesson 1 must use long-addition written method activities only."
        );
      }
    } else {
      const isWrittenSubtractionActivity =
        activity.activityType === "typed_response" && sourceActivityType === "subtraction_strategy";
      if (!isWrittenSubtractionActivity) {
        addViolation(
          violations,
          "alignment",
          lesson,
          activity.activityType,
          "Year 3 Week 5 Lessons 2 and 3 must use long-subtraction written method activities only."
        );
      }
    }
  }

  if (isYear3Week6TwoStepOnly(level, lesson)) {
    const isAlignedWordProblemActivity = activity.activityType === "mixed_word_problem";

    if (!isAlignedWordProblemActivity) {
      addViolation(
        violations,
        "alignment",
        lesson,
        activity.activityType,
        "Year 3 Week 6 must only use 2-step mixed word problems."
      );
    }
  }

  if (question) {
    validateQuestionAgainstPolicy(lesson, activity, policy, question, profile, violations);
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

export function validateLessonActivityIntent(
  lesson: Lesson,
  activity: LessonActivity,
  question?: Year2QuestionData
): Year2PolicyValidation {
  return validateLessonActivityIntentForLevel(getLevelForLesson(lesson), lesson, activity, question);
}

function assertPolicyValidation(
  validation: Year2PolicyValidation,
  context: string
) {
  if (validation.valid) return;
  const summary = validation.violations
    .map((violation) => `${violation.reason}: ${violation.message}`)
    .join(" | ");

  if (process.env.NODE_ENV !== "production") {
    throw new Error(`[Year2Policy:${context}] ${summary}`);
  }

  console.error(`[Year2Policy:${context}] ${summary}`);
}

function generateInteractiveQuestion(
  level: SupportedMathLevel,
  activityType: ActivityType,
  config: GenericConfig,
  lesson: Lesson
): Year2QuestionData | null {
  const profile = getDifficultyProfile(level, lesson.week);

  if (activityType === "place_value_builder") {
    const min = typeof config.min === "number" ? config.min : 100;
    const max = typeof config.max === "number" ? config.max : 999;
    const target = randInt(min, max);
    const places = supportedPlaces(config);
    const hundredThousands = digitForPlace(target, "hundred_thousands");
    const tenThousands = digitForPlace(target, "ten_thousands");
    const thousands = digitForPlace(target, "thousands");
    const hundreds = digitForPlace(target, "hundreds");
    const tens = digitForPlace(target, "tens");
    const ones = digitForPlace(target, "ones");
    const place =
      places[randInt(0, places.length - 1)] ?? "ones";
    const mode =
      config.hideOnePlaceValue === true
        ? "missing_mab_part"
        : config.mode === "identify_place"
        ? "identify_place"
        : "identify_number";

    if (mode === "identify_place") {
      return {
        kind: "place_value_builder",
        prompt: `How many ${placeLabel(place)} are shown?`,
        hundredThousands,
        tenThousands,
        thousands,
        hundreds,
        tens,
        ones,
        targetNumber: target,
        answer: digitForPlace(target, place),
        mode,
        place,
        visualMode: "mab",
        placeValues: places,
      };
    }

    if (mode === "missing_mab_part") {
      return {
        kind: "place_value_builder",
        prompt: "What is the missing value?",
        hundredThousands: place === "hundred_thousands" ? null : hundredThousands,
        tenThousands: place === "ten_thousands" ? null : tenThousands,
        thousands: place === "thousands" ? null : thousands,
        hundreds: place === "hundreds" ? null : hundreds,
        tens: place === "tens" ? null : tens,
        ones: place === "ones" ? null : ones,
        targetNumber: target,
        answer:
          place === "hundred_thousands"
            ? hundredThousands * 100000
            : place === "ten_thousands"
            ? tenThousands * 10000
            : place === "thousands"
            ? thousands * 1000
            : place === "hundreds"
            ? hundreds * 100
            : place === "tens"
            ? tens * 10
            : ones,
        mode,
        place,
        visualMode: "mab",
        placeValues: places,
      };
    }

    return {
      kind: "place_value_builder",
      prompt: "What number is shown by the MAB blocks?",
      hundredThousands,
      tenThousands,
      thousands,
      hundreds,
      tens,
      ones,
      targetNumber: target,
      answer: target,
      mode: "identify_number",
      visualMode: "mab",
      placeValues: places,
    };
  }

  if (activityType === "number_order") {
    const min = typeof config.min === "number" ? config.min : 100;
    const max = typeof config.max === "number" ? config.max : 1000;
    const count = typeof config.count === "number" ? config.count : 4;
    const ascending = config.ascending !== false;
    const values = new Set<number>();
    while (values.size < count) {
      values.add(randInt(min, max));
    }
    return {
      kind: "number_order",
      prompt: ascending
        ? "Order the numbers from smallest to largest."
        : "Order the numbers from largest to smallest.",
      numbers: shuffle(Array.from(values)),
      ascending,
    };
  }

  if (activityType === "partition_expand") {
    const min = typeof config.min === "number" ? config.min : 100;
    const max = typeof config.max === "number" ? config.max : 999;
    const target = randInt(min, max);
    const mode =
      config.mode === "expand" || config.mode === "flexible_partition"
        ? config.mode
        : "partition";
    const placeLabel = target >= 1000
      ? "thousands, hundreds, tens, and ones"
      : "hundreds, tens, and ones";
    return {
      kind: "partition_expand",
      prompt:
        mode === "partition"
          ? `Partition ${target.toLocaleString()} into ${placeLabel}.`
          : mode === "expand"
          ? `Write ${target.toLocaleString()} in expanded form.`
          : `Partition ${target.toLocaleString()} in a different valid way.`,
      target,
      mode,
      standard: partitionNumber(target),
    };
  }

  if (activityType === "number_line") {
    const min = typeof config.min === "number" ? config.min : 0;
    const max = typeof config.max === "number" ? config.max : 1000;
    const step = typeof config.step === "number" ? config.step : 10;
    const mode =
      config.mode === "rounding" || config.mode === "estimate"
        ? config.mode
        : "placement";

    if (mode === "rounding") {
      const targets =
        config.targets?.filter((value): value is number => typeof value === "number") ?? [10];
      const targetUnit = targets[randInt(0, targets.length - 1)];
      const value = randInt(min, max);
      const rounded = roundToNearest(value, targetUnit);
      const { prompt, helper } = roundingWordProblem(value, targetUnit, rounded);
      return {
        kind: "number_line",
        prompt,
        helper,
        expected: rounded,
        min,
        max,
        step,
        mode,
      };
    }

    const value = randInt(min, max);
    return {
      kind: "number_line",
      prompt:
        mode === "estimate"
          ? `Estimate where ${value} belongs on the number line.`
          : `Place ${value} on the number line.`,
      helper:
        mode === "estimate"
          ? `Markers show every ${step}. Close estimates count.`
          : `Markers show every ${step}.`,
      expected: value,
      min,
      max,
      step,
      mode,
    };
  }

  if (activityType === "area_model_select") {
    const mode =
      config.mode === "pick_model" ||
      config.mode === "match_model" ||
      config.mode === "match_equivalent"
        ? config.mode
        : "shade_fraction";

    if (mode === "match_equivalent") {
      const equivalentSets = [
        {
          target: [1, 2],
          options: [
            { id: "a", numerator: 2, denominator: 4 },
            { id: "b", numerator: 3, denominator: 4 },
            { id: "c", numerator: 3, denominator: 5 },
          ],
          correctId: "a",
        },
        {
          target: [1, 5],
          options: [
            { id: "a", numerator: 2, denominator: 10 },
            { id: "b", numerator: 3, denominator: 10 },
            { id: "c", numerator: 4, denominator: 10 },
          ],
          correctId: "a",
        },
        {
          target: [2, 5],
          options: [
            { id: "a", numerator: 4, denominator: 10 },
            { id: "b", numerator: 3, denominator: 10 },
            { id: "c", numerator: 1, denominator: 2 },
          ],
          correctId: "a",
        },
      ];
      const chosen = equivalentSets[randInt(0, equivalentSets.length - 1)] ?? equivalentSets[0];
      const [numerator, denominator] = chosen.target;
      return {
        kind: "area_model_select",
        prompt: `Which model is equivalent to ${fractionLabel(numerator, denominator)}?`,
        fractionLabel: fractionLabel(numerator, denominator),
        numerator,
        denominator,
        mode,
        models: chosen.options.map((option) => ({
          ...option,
          shadedParts: buildShadedParts(option.numerator),
        })),
        correctModelId: chosen.correctId,
      };
    }

    const denominator = randomUnitDenominator();
    const numerator = mode === "shade_fraction" || mode === "pick_model" || mode === "match_model" ? 1 : 1;

    if (mode === "pick_model" || mode === "match_model") {
      const distractors = shuffle(
        [
          { id: "a", numerator: 1, denominator, shadedParts: buildShadedParts(1) },
          {
            id: "b",
            numerator: Math.min(denominator - 1, 2),
            denominator,
            shadedParts: buildShadedParts(Math.min(denominator - 1, 2)),
          },
          {
            id: "c",
            numerator: 1,
            denominator: denominator === 4 ? 3 : 4,
            shadedParts: buildShadedParts(1),
          },
          { id: "d", numerator: 0, denominator, shadedParts: [] },
        ].slice(0, 4)
      );
      const correctModel = distractors.find((model) => model.numerator === 1 && model.denominator === denominator)
        ?? distractors[0];
      return {
        kind: "area_model_select",
        prompt:
          mode === "pick_model"
            ? `Which shows ${fractionLabel(1, denominator)}?`
            : `Match ${fractionLabel(1, denominator)} to the correct picture.`,
        fractionLabel: fractionLabel(1, denominator),
        numerator: 1,
        denominator,
        mode,
        models: distractors,
        correctModelId: correctModel.id,
      };
    }

    return {
      kind: "area_model_select",
      prompt: `Shade ${fractionLabel(1, denominator)} of this shape.`,
      fractionLabel: fractionLabel(1, denominator),
      numerator: 1,
      denominator,
      mode,
    };
  }

  if (activityType === "set_model_select") {
    const mode =
      config.mode === "pick_set" || config.mode === "complete_sentence" || config.mode === "label_shared_group"
        ? config.mode
        : "tap_fraction";
    const denominator = isYear3Week11Lesson2FractionsOfSets(level, lesson)
      ? ([2, 3, 4, 5] as const)[randInt(0, 3)] ?? 2
      : randomUnitDenominator();
    const multiplier = randInt(2, 4);
    const totalObjects = denominator * multiplier;
    const answer = totalObjects / denominator;

    if (isYear3Week11Lesson2FractionsOfSets(level, lesson)) {
      if (mode === "label_shared_group") {
        const labelChoices = shuffle([
          fractionLabel(1, denominator),
          fractionLabel(1, Math.max(2, denominator - 1)),
          fractionLabel(1, denominator + 1),
        ]).filter((value, index, all) => all.indexOf(value) === index);
        return {
          kind: "set_model_select",
          prompt: `Share ${totalObjects} counters between ${denominator} people. Each person gets one equal group. Which label matches one group?`,
          fractionLabel: fractionLabel(1, denominator),
          numerator: 1,
          denominator,
          totalObjects,
          groupCount: denominator,
          groupSize: answer,
          mode,
          highlightedIndices: buildShadedParts(answer),
          labelOptions: labelChoices,
          correctLabel: fractionLabel(1, denominator),
        };
      }

      if (mode === "pick_set") {
        const options = shuffle([
          { id: "a", highlightedCount: answer },
          { id: "b", highlightedCount: Math.max(1, answer - 1) },
          { id: "c", highlightedCount: answer + 1 },
        ]);
        const correctOption = options.find((option) => option.highlightedCount === answer) ?? options[0];
        return {
          kind: "set_model_select",
          prompt: `Share ${totalObjects} counters between ${denominator} people. Which picture shows one equal group, or ${fractionLabel(1, denominator)}?`,
          fractionLabel: fractionLabel(1, denominator),
          numerator: 1,
          denominator,
          totalObjects,
          groupCount: denominator,
          groupSize: answer,
          mode,
          options,
          correctOptionId: correctOption.id,
        };
      }

      return {
        kind: "set_model_select",
        prompt: `Share ${totalObjects} counters between ${denominator} people. Tap the counters one person gets.`,
        fractionLabel: fractionLabel(1, denominator),
        numerator: 1,
        denominator,
        totalObjects,
        groupCount: denominator,
        groupSize: answer,
        mode: "tap_fraction",
        answer,
      };
    }

    if (mode === "pick_set") {
      const options = shuffle([
        { id: "a", highlightedCount: answer },
        { id: "b", highlightedCount: Math.max(1, answer - 1) },
        { id: "c", highlightedCount: answer + 1 },
      ]);
      const correctOption = options.find((option) => option.highlightedCount === answer) ?? options[0];
      return {
        kind: "set_model_select",
        prompt: `Which shows ${fractionLabel(1, denominator)} of ${totalObjects}?`,
        fractionLabel: fractionLabel(1, denominator),
        numerator: 1,
        denominator,
        totalObjects,
        mode,
        options,
        correctOptionId: correctOption.id,
      };
    }

    if (mode === "complete_sentence") {
      return {
        kind: "set_model_select",
        prompt: `${fractionLabel(1, denominator)} of ${totalObjects} = ?`,
        fractionLabel: fractionLabel(1, denominator),
        numerator: 1,
        denominator,
        totalObjects,
        mode,
        highlightedIndices: buildShadedParts(answer),
        answer,
      };
    }

    return {
      kind: "set_model_select",
      prompt: `Tap ${fractionLabel(1, denominator)} of ${totalObjects} counters.`,
      fractionLabel: fractionLabel(1, denominator),
      numerator: 1,
      denominator,
      totalObjects,
      mode,
      answer,
    };
  }

  if (activityType === "build_the_whole") {
    const mode =
      config.mode === "fill_total" || config.mode === "pick_whole"
        ? config.mode
        : "build_whole";
    const denominator = randomUnitDenominator();
    const unitValue = randInt(2, 5);
    const total = denominator * unitValue;

    if (mode === "fill_total") {
      return {
        kind: "build_the_whole",
        prompt: `If ${fractionLabel(1, denominator)} = ${unitValue}, the whole is ___`,
        fractionLabel: fractionLabel(1, denominator),
        denominator,
        unitValue,
        mode,
        answer: total,
        options: shuffle([
          { id: "a", parts: denominator, total },
          { id: "b", parts: denominator - 1, total: Math.max(1, total - unitValue) },
          { id: "c", parts: denominator + 1, total: total + unitValue },
        ]),
      };
    }

    if (mode === "pick_whole") {
      const options = shuffle([
        { id: "a", parts: denominator },
        { id: "b", parts: denominator - 1 },
        { id: "c", parts: denominator + 1 },
      ]);
      const correctOption = options.find((option) => option.parts === denominator) ?? options[0];
      return {
        kind: "build_the_whole",
        prompt: `Which whole is correct if this one part is ${fractionLabel(1, denominator)}?`,
        fractionLabel: fractionLabel(1, denominator),
        denominator,
        unitValue,
        mode,
        options,
        correctOptionId: correctOption.id,
      };
    }

    return {
      kind: "build_the_whole",
      prompt: `This is ${fractionLabel(1, denominator)}. How many make a whole?`,
      fractionLabel: fractionLabel(1, denominator),
      denominator,
      unitValue,
      mode,
      answer: denominator,
    };
  }

  if (activityType === "number_line_place") {
    const mode =
      config.mode === "pick_point" || config.mode === "order_fractions"
        ? config.mode
        : "place_fraction";

    if (mode === "order_fractions") {
      const orderedSet =
        year3FractionOrderSets()[randInt(0, year3FractionOrderSets().length - 1)] ??
        year3FractionOrderSets()[0] ??
        ["1/5", "1/2", "4/5"];
      return {
        kind: "number_line_place",
        prompt: "Put the fractions in order from smallest to largest.",
        mode,
        fractions: shuffle([...orderedSet]),
        answer: orderedSet.join(","),
      };
    }

    const availableFractions = fractionPartsForNumberLine();
    const target =
      availableFractions[randInt(0, availableFractions.length - 1)] ?? availableFractions[0];
    return {
      kind: "number_line_place",
      prompt:
        mode === "pick_point"
          ? `Place ${target.label} on the number line using the model.`
          : `Place ${target.label} on the number line using the model.`,
      mode,
      denominator: Number(target.label.split("/")[1] ?? 2),
      targetFraction: target.label,
      options: availableFractions.map((fraction) => fraction.label),
      answer: target.label,
    };
  }

  if (activityType === "fraction_compare") {
    const mode =
      config.mode === "visual_compare" || config.mode === "true_false"
        ? config.mode
        : "symbol_compare";
    const pairs = [
      ["1/2", "1/4", ">"],
      ["1/3", "1/2", "<"],
      ["2/4", "1/2", "="],
      ["4/5", "7/10", ">"],
      ["3/5", "2/5", ">"],
    ] as const;
    const chosen = pairs[randInt(0, pairs.length - 1)] ?? pairs[0];
    const [leftFraction, rightFraction, answer] = chosen;

    return {
      kind: "fraction_compare",
      prompt:
        mode === "symbol_compare"
          ? `${leftFraction} ☐ ${rightFraction}`
          : mode === "visual_compare"
          ? `Which fraction is bigger?`
          : `True or false: ${leftFraction} > ${rightFraction}`,
      mode,
      leftFraction,
      rightFraction,
      answer: mode === "true_false" ? (answer === ">" ? "true" : "false") : answer,
      statement: mode === "true_false" ? `${leftFraction} > ${rightFraction}` : undefined,
    };
  }

  if (activityType === "equivalent_fraction_match") {
    const pairs = year3EquivalentFractionPairs();
    const chosen = pairs[randInt(0, pairs.length - 1)] ?? pairs[0];
    const distractors = shuffle(
      pairs
        .flatMap((pair) => [pair.source, pair.equivalent])
        .filter(
          (option) =>
            !(option.numerator === chosen.equivalent.numerator && option.denominator === chosen.equivalent.denominator) &&
            !(option.numerator === chosen.source.numerator && option.denominator === chosen.source.denominator)
        )
    ).slice(0, 2);
    const correctChoice = { id: "correct", ...chosen.equivalent };
    const choices = shuffle([
      correctChoice,
      ...distractors.map((option, index) => ({ id: `wrong-${index}`, ...option })),
    ]);
    return {
      kind: "equivalent_fraction_match",
      prompt: `Which bar model is equivalent to ${fractionLabel(chosen.source.numerator, chosen.source.denominator)}?`,
      targetFraction: fractionLabel(chosen.source.numerator, chosen.source.denominator),
      target: { id: "target", ...chosen.source },
      choices,
      correctChoiceId: "correct",
    };
  }

  if (activityType === "equivalent_fraction_build") {
    const pairs = year3EquivalentFractionPairs();
    const chosen = pairs[randInt(0, pairs.length - 1)] ?? pairs[0];
    const distractors = shuffle(
      pairs
        .map((pair) => pair.equivalent)
        .filter(
          (option) =>
            !(option.numerator === chosen.equivalent.numerator && option.denominator === chosen.equivalent.denominator)
        )
    ).slice(0, 2);
    const options = shuffle([
      { id: "correct", ...chosen.equivalent },
      ...distractors.map((option, index) => ({ id: `wrong-${index}`, ...option })),
    ]);
    return {
      kind: "equivalent_fraction_build",
      prompt: `Make ${fractionLabel(chosen.source.numerator, chosen.source.denominator)} using more equal parts.`,
      sourceFraction: fractionLabel(chosen.source.numerator, chosen.source.denominator),
      source: { id: "source", ...chosen.source },
      options,
      correctOptionId: "correct",
    };
  }

  if (activityType === "equivalent_fraction_yes_no") {
    const pairs = year3EquivalentFractionPairs();
    const chosen = pairs[randInt(0, pairs.length - 1)] ?? pairs[0];
    const askEquivalent = randInt(0, 1) === 0;
    const right = askEquivalent
      ? chosen.equivalent
      : (shuffle(
          pairs
            .map((pair) => pair.equivalent)
            .filter(
              (option) =>
                !(option.numerator === chosen.equivalent.numerator && option.denominator === chosen.equivalent.denominator)
            )
        )[0] ?? { numerator: 3, denominator: 10 });
    return {
      kind: "equivalent_fraction_yes_no",
      prompt: "Are these bar models equivalent?",
      left: { id: "left", ...chosen.source },
      right: { id: "right", ...right },
      answer: askEquivalent ? "yes" : "no",
    };
  }

  if (activityType === "addition_strategy") {
    return generateAdditionStrategyQuestion(config, level, lesson);
  }

  if (activityType === "equal_groups") {
    const restrictedFactors = getRestrictedFactors(level, lesson.week);
    const allowed = restrictedFactors
      ? restrictFactors(config.allowedGroupSizes, restrictedFactors)
      : config.allowedGroupSizes;
    let groups: number;
    let itemsPerGroup: number;
    if (allowed && allowed.length > 0) {
      // Both groups count and items-per-group picked from allowed sizes
      groups = allowed[randInt(0, allowed.length - 1)];
      itemsPerGroup = allowed[randInt(0, allowed.length - 1)];
    } else {
      const minGroups = typeof config.minGroups === "number" ? config.minGroups : 2;
      const maxGroups =
        typeof config.maxGroups === "number"
          ? Math.max(config.maxGroups, Math.min(config.maxGroups + 2, profile.groupsMax))
          : profile.groupsMax;
      const minItemsPerGroup =
        typeof config.minItemsPerGroup === "number" ? config.minItemsPerGroup : 2;
      const maxItemsPerGroup =
        typeof config.maxItemsPerGroup === "number"
          ? Math.max(config.maxItemsPerGroup, Math.min(config.maxItemsPerGroup + 2, profile.itemsMax))
          : profile.itemsMax;
      groups = randInt(minGroups, maxGroups);
      itemsPerGroup = randInt(minItemsPerGroup, maxItemsPerGroup);
    }
    const answer = groups * itemsPerGroup;

    return {
      kind: "equal_groups",
      prompt: "How many objects are in all the equal groups?",
      groups,
      itemsPerGroup,
      answer,
      options: uniqueNumberOptions(answer, 6).map(Number),
      mode: "equal_groups",
    };
  }

  if (activityType === "arrays") {
    const restrictedFactors = getRestrictedFactors(level, lesson.week);
    const allowed = restrictedFactors
      ? restrictFactors(config.allowedGroupSizes, restrictedFactors)
      : config.allowedGroupSizes;
    let rows: number;
    let columns: number;
    if (allowed && allowed.length > 0) {
      rows = allowed[randInt(0, allowed.length - 1)];
      columns = allowed[randInt(0, allowed.length - 1)];
    } else {
      const minRows = typeof config.minRows === "number" ? config.minRows : 2;
      const maxRows =
        typeof config.maxRows === "number"
          ? Math.max(config.maxRows, Math.min(config.maxRows + 2, profile.groupsMax))
          : Math.min(8, profile.groupsMax);
      const minColumns =
        typeof config.minColumns === "number" ? config.minColumns : 2;
      const maxColumns =
        typeof config.maxColumns === "number"
          ? Math.max(config.maxColumns, Math.min(config.maxColumns + 2, profile.itemsMax))
          : Math.min(10, profile.itemsMax);
      rows = randInt(minRows, maxRows);
      columns = randInt(minColumns, maxColumns);
    }
    const answer = rows * columns;
    const mode = config.mode === "repeated_addition" ? "repeated_addition" : "arrays";
    const repeatedAddition = Array.from({ length: rows }, () => columns).join(" + ");
    const repeatedAdditionOptions = shuffle(
      Array.from(
        new Set([
          repeatedAddition,
          Array.from({ length: columns }, () => rows).join(" + "),
          `${answer} + ${columns}`,
          Array.from({ length: rows }, () => Math.max(1, columns - 1)).join(" + "),
        ])
      )
    ).slice(0, 4);

    return {
      kind: "arrays",
      prompt:
        mode === "repeated_addition"
          ? "Which repeated addition sentence matches the array?"
          : "How many dots are in the array?",
      rows,
      columns,
      answer,
      options:
        mode === "repeated_addition"
          ? repeatedAdditionOptions
          : uniqueNumberOptions(answer, Math.max(rows, columns) * 2).map(Number),
      mode,
      repeatedAddition,
    };
  }

  if (activityType === "division_groups") {
    const minTotal = typeof config.minTotal === "number" ? config.minTotal : 6;
    const maxTotal =
      typeof config.maxTotal === "number"
        ? Math.max(config.maxTotal, profile.divisionTotalMax)
        : profile.divisionTotalMax;
    const mode =
      config.mode === "grouping" || config.mode === "inverse_link" || config.mode === "sharing"
        ? config.mode
        : "sharing";
    const restrictedFactors = getRestrictedFactors(level, lesson.week);
    const allowedSizes = restrictedFactors
      ? restrictFactors(config.allowedGroupSizes, restrictedFactors)
      : (config.allowedGroupSizes && config.allowedGroupSizes.length > 0
          ? config.allowedGroupSizes
          : [2, 3, 4, 5, 6, 8, 10]);
    const candidatePairs: Array<{ groups: number; groupSize: number; total: number }> = [];
    for (const groups of allowedSizes) {
      for (const groupSize of allowedSizes) {
        const total = groups * groupSize;
        if (total >= minTotal && total <= maxTotal) {
          candidatePairs.push({ groups, groupSize, total });
        }
      }
    }
    const pair =
      candidatePairs[randInt(0, candidatePairs.length - 1)] ??
      { groups: 2, groupSize: 2, total: 4 };
    const { groups, groupSize, total } = pair;

    return {
      kind: "division_groups",
      prompt:
        mode === "grouping"
          ? `${total} objects are put into groups of ${groupSize}. How many groups are there?`
          : mode === "inverse_link"
          ? `${total} divided into groups of ${groupSize} gives how many groups? Which multiplication fact checks it?`
          : `${total} objects are shared equally into ${groups} groups. How many are in each group?`,
      total,
      groups,
      groupSize,
      answer: mode === "sharing" ? groupSize : groups,
      options: uniqueNumberOptions(mode === "sharing" ? groupSize : groups, 4).map(Number),
      mode,
      inverseFact: `${groups} × ${groupSize} = ${total}`,
    };
  }

  if (activityType === "mixed_word_problem") {
    if (isYear3Week6TwoStepOnly(level, lesson)) {
      return buildYear3Week6TwoStepWordProblem(lesson);
    }
    if (isYear3Week9Lesson3Estimation(level, lesson)) {
      return buildYear3Week9EstimationQuestion();
    }
    if (isYear3Week8(level, lesson) && lesson.lesson === 3) {
      return buildYear3Week8MixedWordProblem(lesson);
    }

    const min = typeof config.min === "number" ? config.min : 0;
    const max = typeof config.max === "number" ? config.max : profile.wordProblemMax;
    const mode =
      config.mode === "two_step_add_sub" || config.mode === "mult_div_problems"
        ? config.mode
        : "choose_operation";
    const configuredOperations = Array.isArray(config.operations)
      ? config.operations.filter(
          (value): value is "+" | "-" | "x" | "/" =>
            value === "+" || value === "-" || value === "x" || value === "/"
        )
      : [];

    if (mode === "two_step_add_sub") {
      const start = randInt(Math.max(10, min), Math.max(20, max));
      const add = randInt(4, 18);
      const remove = randInt(2, 12);
      const answer = start + add - remove;
      return {
        kind: "mixed_word_problem",
        prompt: `Mia had ${start} stickers. She got ${add} more, then gave ${remove} away. How many stickers does she have now?`,
        answer,
        options: uniqueNumberOptions(answer, 8).map(Number),
        operationLabel: "Two-step add/subtract",
        helper: "Work through the story in order: add first, then subtract.",
        mode,
        showStrategyClue: true,
      };
    }

    if (mode === "mult_div_problems") {
      const restrictedFactors = getRestrictedFactors(level, lesson.week);
      const factors = restrictedFactors ?? [3, 4, 5, 6, 8, 10];
      if (randInt(0, 1) === 0) {
        const groups = factors[randInt(0, factors.length - 1)] ?? 2;
        const perGroup = factors[randInt(0, factors.length - 1)] ?? 2;
        const answer = groups * perGroup;
        return {
          kind: "mixed_word_problem",
          prompt: `Tom has ${groups} bags with ${perGroup} apples in each bag. How many apples does he have altogether?`,
          answer,
          options: uniqueNumberOptions(answer, 8).map(Number),
          operationLabel: "Multiply",
          helper: "Think of equal groups or repeated addition.",
          mode,
          showStrategyClue: true,
        };
      }

      const groups = factors[randInt(0, factors.length - 1)] ?? 2;
      const perGroup = factors[randInt(0, factors.length - 1)] ?? 2;
      const total = groups * perGroup;
      return {
        kind: "mixed_word_problem",
        prompt: `${total} apples are packed into bags of ${perGroup}. How many bags are needed?`,
        answer: groups,
        options: uniqueNumberOptions(groups, 4).map(Number),
        operationLabel: "Divide",
        helper: "Ask how many equal groups fit into the total.",
        mode,
        showStrategyClue: true,
      };
    }

    const operationPool =
      configuredOperations.length > 0 ? configuredOperations : ["+", "-", "x", "/"];
    const operation = shuffle(operationPool)[0] ?? "+";
    if (operation === "+") {
      const start = randInt(Math.max(5, min), Math.max(12, max - 10));
      const extra = randInt(4, 18);
      const answer = start + extra;
      return {
        kind: "mixed_word_problem",
        prompt: `A class had ${start} pencils and found ${extra} more. How many pencils are there now?`,
        answer,
        options: uniqueNumberOptions(answer, 8).map(Number),
        operationLabel: "Addition",
        correctOperation: "+",
        operationChoices: configuredOperations.length > 0 ? configuredOperations : ["+", "-", "x", "/"],
        helper: "Read the whole story first. Decide whether the amount is growing, shrinking, grouped, or shared.",
        mode,
        showStrategyClue: false,
      };
    }

    if (operation === "-") {
      const start = randInt(Math.max(12, min), Math.max(20, max));
      const used = randInt(3, Math.min(18, start - 1));
      const answer = start - used;
      return {
        kind: "mixed_word_problem",
        prompt: `A jar had ${start} marbles. ${used} were taken out. How many marbles are left?`,
        answer,
        options: uniqueNumberOptions(answer, 8).map(Number),
        operationLabel: "Subtraction",
        correctOperation: "-",
        operationChoices: configuredOperations.length > 0 ? configuredOperations : ["+", "-", "x", "/"],
        helper: "Read the whole story first. Decide whether the amount is growing, shrinking, grouped, or shared.",
        mode,
        showStrategyClue: false,
      };
    }

    if (operation === "x") {
      const restrictedFactors = getRestrictedFactors(level, lesson.week);
      const factors = restrictedFactors ?? [3, 4, 5, 6, 8, 10];
      const groups = factors[randInt(0, factors.length - 1)] ?? 2;
      const perGroup = factors[randInt(0, factors.length - 1)] ?? 2;
      const answer = groups * perGroup;
      return {
        kind: "mixed_word_problem",
        prompt: `There are ${groups} trays with ${perGroup} cupcakes on each tray. How many cupcakes are there?`,
        answer,
        options: uniqueNumberOptions(answer, 8).map(Number),
        operationLabel: "Multiplication",
        correctOperation: "x",
        operationChoices: configuredOperations.length > 0 ? configuredOperations : ["+", "-", "x", "/"],
        helper: "Read the whole story first. Decide whether the amount is growing, shrinking, grouped, or shared.",
        mode,
        showStrategyClue: false,
      };
    }

    const restrictedFactors = getRestrictedFactors(level, lesson.week);
    const factors = restrictedFactors ?? [3, 4, 5, 6, 8, 10];
    const groupSize = factors[randInt(0, factors.length - 1)] ?? 2;
    const groups = factors[randInt(0, factors.length - 1)] ?? 2;
    const total = groupSize * groups;
    return {
      kind: "mixed_word_problem",
      prompt: `${total} toy cars are packed into boxes of ${groupSize}. How many boxes are needed?`,
      answer: groups,
      options: uniqueNumberOptions(groups, 4).map(Number),
      operationLabel: "Division",
      correctOperation: "/",
      operationChoices: configuredOperations.length > 0 ? configuredOperations : ["+", "-", "x", "/"],
      helper: "Read the whole story first. Decide whether the amount is growing, shrinking, grouped, or shared.",
      mode,
      showStrategyClue: false,
    };
  }

  if (activityType === "subtraction_strategy") {
    const min = typeof config.min === "number" ? config.min : 0;
    const max = typeof config.max === "number" ? config.max : profile.addSubMax;
    const mode =
      config.mode === "split" || config.mode === "fact_strategy"
        ? config.mode
        : "jump";

    if (isYear3Week4SubtractionLesson(level, lesson)) {
      return buildYear3Week4SubtractionQuestion(lesson, mode);
    }

    if (isYear3Week5Lesson(level, lesson) && lesson.lesson >= 2) {
      return buildYear3Week5SubtractionQuestion(lesson, config);
    }

    let total = randInt(Math.max(12, min), Math.max(20, max));
    let remove = randInt(2, Math.min(18, total - 1));

    if (mode === "split") {
      total = randInt(34, Math.max(48, max));
      remove = randInt(12, Math.min(39, total - 1));
    }

    if (mode === "fact_strategy") {
      total = randInt(20, Math.max(30, max));
      remove = randInt(3, 12);
    }

    const answer = total - remove;
    return {
      kind: "subtraction_strategy",
      prompt: `Solve ${total} - ${remove}.`,
      hint:
        mode === "jump"
          ? `Start at ${total} and jump back ${remove}.`
          : mode === "split"
          ? `Split ${remove} into tens and ones, then subtract each part.`
          : "Use a known fact or inverse addition fact.",
      total,
      remove,
      answer,
      options: uniqueNumberOptions(answer, 10).map(Number),
      mode,
    };
  }

  if (activityType === "fact_family") {
    const restrictedFactors = getRestrictedFactors(level, lesson.week);
    const configuredMin = typeof config.min === "number" ? Math.max(0, config.min) : 0;
    const configuredMax =
      typeof config.max === "number"
        ? Math.min(config.max, profile.factFamilyMax)
        : profile.factFamilyMax;
    const mode =
      config.mode === "write_sentences" || config.mode === "word_problems"
        ? config.mode
        : "recognise";

    if (restrictedFactors) {
      const a = restrictedFactors[randInt(0, restrictedFactors.length - 1)] ?? 2;
      const distinctFactors = restrictedFactors.filter((factor) => factor !== a);
      const b =
        (distinctFactors.length > 0
          ? distinctFactors[randInt(0, distinctFactors.length - 1)]
          : restrictedFactors[randInt(0, restrictedFactors.length - 1)]) ?? 2;
      const total = a * b;
      const family: [number, number, number] = [a, b, total];
      const allCorrect = [
        `${a} × ${b} = ${total}`,
        `${b} × ${a} = ${total}`,
        `${total} ÷ ${a} = ${b}`,
        `${total} ÷ ${b} = ${a}`,
      ];
      const correctSet = Array.from(new Set(allCorrect));

      if (mode === "write_sentences") {
        return {
          kind: "fact_family",
          prompt: "Write 4 number sentences for this multiplication and division fact family.",
          family,
          options: [],
          answers: correctSet,
          mode,
          familyType: "mult_div",
          visual: { type: "array", rows: a, columns: b },
        };
      }

      if (mode === "word_problems") {
        const prompts = [
          {
            story: `There are ${a} rows with ${b} counters in each row. Which multiplication and division sentences match this array?`,
            answer: `${a} × ${b} = ${total}`,
          },
          {
            story: `${total} counters are shared into groups of ${a}. Which sentence matches?`,
            answer: `${total} ÷ ${a} = ${b}`,
          },
          {
            story: `${total} counters are shared into groups of ${b}. Which sentence matches?`,
            answer: `${total} ÷ ${b} = ${a}`,
          },
        ];
        const chosen = prompts[randInt(0, prompts.length - 1)];
        const wrongSentences = allCorrect
          .filter((value) => value !== chosen.answer)
          .concat([`${total} + ${a} = ${b}`, `${a} + ${b} = ${total}`]);
        const options = shuffle([chosen.answer, ...shuffle(wrongSentences).slice(0, 3)]);
        return {
          kind: "fact_family",
          prompt: chosen.story,
          family,
          options,
          answers: [chosen.answer],
          mode,
          familyType: "mult_div",
          visual: { type: "array", rows: a, columns: b },
        };
      }

      const distractors = [
        `${total} + ${a} = ${b}`,
        `${a} + ${b} = ${total}`,
        `${total} ÷ ${a} = ${a}`,
        `${b} × ${b} = ${total}`,
      ].filter((value) => !correctSet.includes(value));
      const options = shuffle([...correctSet, ...distractors.slice(0, 2)]);
      return {
        kind: "fact_family",
        prompt: "Which multiplication and division sentences match this array?",
        family,
        options,
        answers: correctSet,
        mode,
        familyType: "mult_div",
        visual: { type: "array", rows: a, columns: b },
      };
    }

    const aMax = Math.max(3, Math.min(50, Math.floor(configuredMax / 2)));
    const aMinBase =
      mode === "recognise"
        ? Math.max(2, Math.floor(configuredMin / 4))
        : Math.max(4, Math.floor(configuredMin / 3));
    const aMin = Math.min(aMax, aMinBase);
    const a = randInt(aMin, aMax);
    const bMax = Math.max(2, Math.min(50, configuredMax - a));
    const bMin = Math.min(bMax, aMinBase);
    const b = randInt(bMin, bMax);
    const total = a + b;
    const family: [number, number, number] = [a, b, total];

    // All 4 valid fact family sentences
    const allCorrect = [
      `${a} + ${b} = ${total}`,
      `${b} + ${a} = ${total}`,
      `${total} - ${a} = ${b}`,
      `${total} - ${b} = ${a}`,
    ];
    // Remove duplicates (when a === b)
    const correctSet = Array.from(new Set(allCorrect));

    if (mode === "write_sentences") {
      return {
        kind: "fact_family",
        prompt: "Write 4 number sentences for this fact family.",
        family,
        options: [],
        answers: correctSet,
        mode,
        familyType: "add_sub",
      };
    }

    if (mode === "word_problems") {
      const wordTemplates = [
        {
          story: `There are ${a} red apples and ${b} green apples on a table. How many apples are there altogether?`,
          answer: `${a} + ${b} = ${total}`,
        },
        {
          story: `A baker made ${total} cupcakes. ${a} were chocolate. How many were vanilla?`,
          answer: `${total} - ${a} = ${b}`,
        },
        {
          story: `${b} birds were sitting on a fence. More birds joined them. Now there are ${total} birds. How many birds joined?`,
          answer: `${total} - ${b} = ${a}`,
        },
        {
          story: `Sam has ${b} toy cars and ${a} toy trucks. How many toys does Sam have in total?`,
          answer: `${b} + ${a} = ${total}`,
        },
        {
          story: `There were ${total} children in the playground. ${b} went inside. How many are still outside?`,
          answer: `${total} - ${b} = ${a}`,
        },
      ];
      const chosen = wordTemplates[randInt(0, wordTemplates.length - 1)];
      const wrongSentences = allCorrect
        .filter((s) => s !== chosen.answer)
        .concat([
          `${total} + ${a} = ${b}`,
          `${a} - ${b} = ${total}`,
        ]);
      const distractorPicks = shuffle(wrongSentences).slice(0, 3);
      const options = shuffle([chosen.answer, ...distractorPicks]);

      return {
        kind: "fact_family",
        prompt: chosen.story,
        family,
        options,
        answers: [chosen.answer],
        mode,
        familyType: "add_sub",
      };
    }

    const distractors = shuffle([
      `${total} + ${a} = ${b}`,
      `${a} - ${b} = ${total}`,
      `${total} - ${b} = ${a + randInt(1, 3)}`,
      `${a} + ${b + randInt(1, 3)} = ${total}`,
    ]).filter((d) => !correctSet.includes(d));

    // Pick 2 correct + 2 distractors so students must find the right ones
    const pickedCorrect = shuffle(correctSet).slice(0, 2);
    const pickedDistractors = distractors.slice(0, 2);
    const options = shuffle([...pickedCorrect, ...pickedDistractors]);

    return {
      kind: "fact_family",
      prompt: "Select all sentences that belong to this fact family.",
      family,
      options,
      answers: pickedCorrect,
      mode,
      familyType: "add_sub",
    };
  }

  if (activityType === "odd_even_sort") {
    const min = typeof config.min === "number" ? config.min : 0;
    const max = typeof config.max === "number" ? config.max : Math.min(80, profile.addSubMax);
    const count = typeof config.count === "number" ? config.count : 6;
    const mode =
      config.mode === "pattern" || config.mode === "odd_even_sums"
        ? config.mode
        : "identify";
    const labels: string[] = [];
    let numbers: number[] = [];

    if (mode === "odd_even_sums") {
      const expressions = new Map<string, number>();
      while (expressions.size < count) {
        const a = randInt(1, Math.max(9, Math.floor(max / 2)));
        const b = randInt(1, Math.max(9, Math.floor(max / 2)));
        expressions.set(`${a} + ${b}`, a + b);
      }
      const paired = shuffle(Array.from(expressions.entries()));
      labels.push(...paired.map(([expression]) => expression));
      numbers = paired.map(([, value]) => value);
    } else {
      const values = new Set<number>();
      if (mode === "pattern") {
        const start = randInt(min, Math.max(min + 6, max - 6));
        for (let offset = 0; offset < count; offset += 1) {
          values.add(start + offset);
        }
      } else {
        while (values.size < count) {
          values.add(randInt(min, max));
        }
      }
      numbers = shuffle(Array.from(values));
      labels.push(...numbers.map(String));
    }

    const patternOptions =
      mode === "pattern"
        ? shuffle([
            "Odd and even numbers alternate one after the other.",
            "All even numbers are bigger than odd numbers.",
            "Odd numbers always end in 0 or 5.",
            "Even numbers cannot be next to each other.",
          ])
        : undefined;

    return {
      kind: "odd_even_sort",
      prompt:
        mode === "pattern"
          ? "Sort the numbers into odd and even, then choose the pattern you notice."
          : mode === "odd_even_sums"
          ? "Work out each sum, then sort the results into odd and even."
          : "Sort the numbers into odd and even.",
      numbers,
      labels,
      answer: {
        odd: numbers.filter((value) => value % 2 !== 0),
        even: numbers.filter((value) => value % 2 === 0),
      },
      mode,
      patternOptions,
      patternAnswer:
        mode === "pattern"
          ? "Odd and even numbers alternate one after the other."
          : undefined,
    };
  }

  if (activityType === "skip_count") {
    const restrictedFactors = getRestrictedFactors(level, lesson.week);
    const step =
      restrictedFactors
        ? (typeof config.step === "number" && restrictedFactors.includes(config.step)
            ? config.step
            : restrictedFactors[randInt(0, restrictedFactors.length - 1)] ?? 2)
        : typeof config.step === "number"
        ? config.step
        : profile.skipCountExtraSteps[randInt(0, profile.skipCountExtraSteps.length - 1)] ?? 2;

    if (isYear3Week9Lesson1SkipCount(level, lesson, step)) {
      return buildYear3Week9SkipCountQuestion(step);
    }

    const configMax = typeof config.max === "number" ? config.max : 100;
    const maxStart = Math.max(0, Math.floor(configMax / step) - 6);
    const startMultiplier = randInt(0, maxStart);
    const start = startMultiplier * step;
    const sequence = [start, start + step, start + step * 2, start + step * 3];
    const answer = start + step * 4;

    // Occasionally present a missing-in-middle challenge
    const missingMiddle = randInt(0, 3) === 0 && sequence.length >= 4;
    if (missingMiddle) {
      const gapIndex = randInt(1, 2); // remove 2nd or 3rd element
      const missingValue = sequence[gapIndex];
      const displaySeq = [...sequence, answer];
      displaySeq[gapIndex] = -1; // sentinel for "?"
      return {
        kind: "skip_count" as const,
        prompt: `Fill in the missing number. Skip count by ${step}.`,
        sequence: displaySeq,
        answer: missingValue,
        options: uniqueNumberOptions(missingValue, step * 3).map(Number),
        step,
        mode: "forward" as const,
        visualGroups: restrictedFactors ? [step, step, step, step, step] : undefined,
      };
    }

    return {
      kind: "skip_count",
      prompt: `Keep skip counting by ${step}.`,
      sequence,
      answer,
      options: uniqueNumberOptions(answer, step * 3).map(Number),
      step,
      mode: "forward",
      visualGroups: restrictedFactors ? [step, step, step, step, step] : undefined,
    };
  }

  return null;
}

function randomReviewConfig(
  activityType: ActivityType,
  level: SupportedMathLevel
): GenericConfig {
  switch (activityType) {
    case "skip_count":
      return {
        min: 0,
        max: 100,
        step: [2, 3, 4, 5, 10][randInt(0, 4)],
        mode: "forward",
      };
    case "arrays":
      return {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: randInt(0, 1) === 0 ? "arrays" : "repeated_addition",
      };
    case "fact_family":
      return {
        min: 0,
        max: 100,
        mode: (["recognise", "write_sentences", "word_problems"] as const)[
          randInt(0, 2)
        ],
      };
    case "number_line":
      return {
        min: 0,
        max: 1000,
        step: [10, 50][randInt(0, 1)],
        mode: (["placement", "rounding", "estimate"] as const)[randInt(0, 2)],
        targets: [10, 100],
      };
    case "addition_strategy":
      return {
        min: 0,
        max: 100,
        mode:
          level >= 3
            ? (["jump", "split", "friendly_numbers", "doubles", "near_doubles"] as const)[
                randInt(0, 4)
              ]
            : (["jump", "split", "friendly_numbers"] as const)[randInt(0, 2)],
      };
    case "equal_groups":
      return {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 2,
        maxItemsPerGroup: 5,
        mode: "equal_groups",
      };
    case "subtraction_strategy":
      return {
        min: 0,
        max: 100,
        mode: (["jump", "split", "fact_strategy"] as const)[randInt(0, 2)],
      };
    case "division_groups":
      return {
        minTotal: 6,
        maxTotal: 24,
        mode: (["sharing", "grouping", "inverse_link"] as const)[randInt(0, 2)],
      };
    case "odd_even_sort":
      return {
        min: 0,
        max: 40,
        count: 6,
        mode: (["identify", "pattern", "odd_even_sums"] as const)[randInt(0, 2)],
      };
    case "mixed_word_problem":
      return {
        min: 0,
        max: 60,
        mode: (["choose_operation", "two_step_add_sub", "mult_div_problems"] as const)[
          randInt(0, 2)
        ],
        operations: ["+", "-", "x", "/"],
      };
    case "place_value_builder":
      return {
        min: 100,
        max: 999,
        placeValues: ["hundreds", "tens", "ones"],
      };
    case "number_order":
      return {
        min: 100,
        max: 999,
        count: 4,
        ascending: randInt(0, 1) === 0,
      };
    case "partition_expand":
      return {
        min: 100,
        max: 999,
        mode: (["partition", "expand", "flexible_partition"] as const)[randInt(0, 2)],
      };
    default:
      return {};
  }
}

function generateGenericQuestion(
  level: SupportedMathLevel,
  activityType: "multiple_choice" | "typed_response",
  sourceActivityType: ActivityType,
  config: GenericConfig,
  lesson: Lesson
): MultipleChoiceQuestion | TypedResponseQuestion {
  const profile = getDifficultyProfile(level, lesson.week);
  const min = typeof config.min === "number" ? config.min : 0;
  const max = typeof config.max === "number" ? config.max : profile.addSubMax;
  const step = typeof config.step === "number" ? config.step : 10;

  const asMultipleChoice = activityType === "multiple_choice";
  const explicitMode = typeof config.mode === "string" ? config.mode : undefined;

  if (explicitMode === "word_form_match" || explicitMode === "write_numeral") {
    const lowerBound = Math.max(10000, min || 10000);
    const upperBound = Math.max(lowerBound + 1000, max || 999999);
    const target = randInt(lowerBound, upperBound);
    const words = numberToWords(target);
    const numeral = formatNumeral(target);

    if (explicitMode === "word_form_match") {
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: `Which numeral matches ${words}?`,
            options: buildLargeNumberOptions(target, lowerBound, upperBound),
            answer: numeral,
          }
        : {
            kind: "typed_response",
            prompt: `Write this number in numerals: ${words}.`,
            answer: numeral,
            placeholder: "Type the numeral",
          };
    }

    return {
      kind: "typed_response",
      prompt: `Write this number in numerals: ${words}.`,
      answer: numeral,
      placeholder: "Type the numeral",
    };
  }

  if (explicitMode === "tenths_place_value") {
    const numerator = randInt(1, 9);
    const decimal = formatDecimal(numerator / 10);
    const visual: DecimalVisualData = {
      type: "decimal_model",
      model: "tenths_bar",
      numerator,
      denominator: 10,
    };

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: "What decimal is shaded?",
          options: decimalTenthsOptions(decimal),
          answer: decimal,
          helper: "Ten equal parts make one whole.",
          visual,
        }
      : {
          kind: "typed_response",
          prompt: "How many tenths are shaded?",
          answer: String(numerator),
          helper: "Count the shaded tenths.",
          placeholder: "Type the number of tenths",
          visual,
        };
  }

  if (explicitMode === "hundredths_place_value") {
    const numerator = randInt(1, 95);
    const decimal = formatDecimal(numerator / 100);
    const visual: DecimalVisualData = {
      type: "decimal_model",
      model: "hundredths_grid",
      numerator,
      denominator: 100,
    };

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: "What decimal is shaded?",
          options: decimalHundredthsOptions(decimal),
          answer: decimal,
          helper: "One whole is split into 100 equal parts.",
          visual,
        }
      : {
          kind: "typed_response",
          prompt: "How many hundredths are shaded?",
          answer: String(numerator),
          helper: "Count the shaded hundredths squares.",
          placeholder: "Type the number of hundredths",
          visual,
        };
  }

  if (explicitMode === "represent_decimals") {
    const ones = randInt(0, 1);
    const tenths = randInt(0, 9);
    const hundredths = randInt(0, 9);
    const decimal = formatDecimal(ones + tenths / 10 + hundredths / 100);
    const visual: DecimalVisualData = {
      type: "decimal_model",
      model: "place_value_chart",
      ones,
      tenths,
      hundredths,
    };

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: "What decimal does this place value chart show?",
          options: decimalHundredthsOptions(decimal),
          answer: decimal,
          helper: "Read the ones, tenths, and hundredths columns.",
          visual,
        }
      : {
          kind: "typed_response",
          prompt: "Write the decimal shown by this place value chart.",
          answer: decimal,
          helper: "Use the tenths and hundredths columns to build the decimal.",
          placeholder: "Type the decimal",
          visual,
        };
  }

  if (sourceActivityType === "place_value_builder") {
    const target = randInt(Math.max(100, min || 100), Math.max(200, max || 999));
    const places = supportedPlaces(config);
    const place = places[randInt(0, places.length - 1)] ?? "ones";
    const partition = partitionNumber(target);
    const mode =
      config.mode === "identify_place" || config.mode === "missing_mab_part"
        ? config.mode
        : "identify_number";
    const hundredThousands = digitForPlace(target, "hundred_thousands");
    const tenThousands = digitForPlace(target, "ten_thousands");
    const thousands = digitForPlace(target, "thousands");
    const hundreds = digitForPlace(target, "hundreds");
    const tens = digitForPlace(target, "tens");
    const ones = digitForPlace(target, "ones");
    const includeHundredThousands = places.includes("hundred_thousands") || hundredThousands > 0;
    const mabSummary = [
      includeHundredThousands ? `${hundredThousands} hundred thousands` : null,
      `${tenThousands} ten thousands`,
      `${thousands} thousands`,
      `${hundreds} hundreds`,
      `${tens} tens`,
      `${ones} ones`,
    ]
      .filter(Boolean)
      .join(", ");
    const mabVisual: MABVisualData = {
      type: "mab",
      placeValues: includeHundredThousands
        ? ["hundred_thousands", "ten_thousands", "thousands", "hundreds", "tens", "ones"]
        : ["ten_thousands", "thousands", "hundreds", "tens", "ones"],
      hundredThousands: includeHundredThousands ? hundredThousands : 0,
      tenThousands,
      thousands,
      hundreds,
      tens,
      ones,
    };

    if (mode === "missing_mab_part") {
      const hiddenValue =
        place === "hundred_thousands"
          ? hundredThousands * 100000
          : place === "ten_thousands"
          ? tenThousands * 10000
          : place === "thousands"
          ? thousands * 1000
          : place === "hundreds"
          ? partition.hundreds
          : place === "tens"
          ? partition.tens
          : partition.ones;
      const visibleSummary = [
        place === "hundred_thousands"
          ? "? hundred thousands"
          : includeHundredThousands
          ? `${hundredThousands} hundred thousands`
          : null,
        place === "ten_thousands" ? "? ten thousands" : `${tenThousands} ten thousands`,
        place === "thousands" ? "? thousands" : `${thousands} thousands`,
        place === "hundreds" ? "? hundreds" : `${partition.hundreds / 100} hundreds`,
        place === "tens" ? "? tens" : `${partition.tens / 10} tens`,
        place === "ones" ? "? ones" : `${partition.ones} ones`,
      ]
        .filter(Boolean)
        .join(", ");
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: `The number is ${target}. The MAB shows ${visibleSummary}. What is the missing value?`,
            options: uniqueNumberOptions(hiddenValue, Math.max(4, hiddenValue || 4)),
            answer: String(hiddenValue),
            visual: mabVisual,
          }
        : {
            kind: "typed_response",
            prompt: `The number is ${target}. The MAB shows ${visibleSummary}. What is the missing value?`,
            answer: String(hiddenValue),
            placeholder: "Type the missing value",
            visual: mabVisual,
          };
    }

    if (mode === "identify_place") {
      const answer = String(digitForPlace(target, place));
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: `The MAB shows ${mabSummary}. How many ${placeLabel(place).toLowerCase()} are shown?`,
            options: uniqueNumberOptions(Number(answer), 4),
            answer,
            visual: mabVisual,
          }
        : {
            kind: "typed_response",
            prompt: `The MAB shows ${mabSummary}. How many ${placeLabel(place).toLowerCase()} are shown?`,
            answer,
            placeholder: "Type the count",
            visual: mabVisual,
          };
    }

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `The MAB shows ${mabSummary}. What number is shown?`,
          options: uniqueNumberOptions(target, 80),
          answer: String(target),
          visual: mabVisual,
        }
      : {
          kind: "typed_response",
          prompt: `The MAB shows ${mabSummary}. What number is shown?`,
          answer: String(target),
          placeholder: "Type the number",
          visual: mabVisual,
        };
  }

  if (sourceActivityType === "number_order") {
    const count = typeof config.count === "number" ? config.count : 4;
    const values = new Set<number>();
    while (values.size < count) {
      values.add(randInt(Math.max(10, min), Math.max(40, max)));
    }
    const numbers = Array.from(values);
    const smallest = Math.min(...numbers);
    const largest = Math.max(...numbers);
    const prompt =
      randInt(0, 1) === 0
        ? `Which number is the smallest: ${numbers.join(", ")}?`
        : `Which number is the largest: ${numbers.join(", ")}?`;
    const answer = prompt.includes("smallest") ? String(smallest) : String(largest);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt,
          options: shuffle(numbers.map(String)),
          answer,
        }
      : {
          kind: "typed_response",
          prompt,
          answer,
          placeholder: "Type the number",
        };
  }

  if (sourceActivityType === "partition_expand") {
    const target = randInt(Math.max(100, min), Math.max(150, max || 999));
    const standard = partitionNumber(target);
    const answerText = `${standard.hundreds} + ${standard.tens} + ${standard.ones}`;
    const altText =
      standard.hundreds >= 100
        ? `${standard.hundreds - 100} + ${standard.tens + 100} + ${standard.ones}`
        : `${standard.hundreds} + ${Math.max(0, standard.tens - 10)} + ${standard.ones + 10}`;

    if (config.mode === "flexible_partition") {
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: `Which is a different way to partition ${target}?`,
            options: shuffle([
              altText,
              answerText,
              `${standard.hundreds + 100} + ${Math.max(0, standard.tens - 100)} + ${standard.ones}`,
              `${target - 1} + 0 + 1`,
            ]),
            answer: altText,
          }
        : {
            kind: "typed_response",
            prompt: `${target} = ${standard.hundreds} + ${standard.tens} + ${standard.ones}. If 1 hundred is regrouped into 10 tens, how many tens are there now?`,
            answer: String(standard.tens / 10 + 10),
            placeholder: "Type the number of tens",
          };
    }

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which expanded form matches ${target}?`,
          options: shuffle([
            answerText,
            `${standard.hundreds} + ${standard.tens + 10} + ${Math.max(0, standard.ones - 10)}`,
            `${standard.hundreds - 100} + ${standard.tens + 100} + ${standard.ones}`,
            `${target - 10} + 10 + 0`,
          ]),
          answer: answerText,
        }
      : {
          kind: "typed_response",
          prompt: `How many tens are in ${target}?`,
          answer: String(Math.floor((target % 100) / 10)),
          placeholder: "Type a number",
        };
  }

  if (sourceActivityType === "number_line") {
    const mode = config.mode;
    const value = randInt(min, Math.max(min + step, max));
    if (mode === "rounding") {
      const targets =
        config.targets?.filter((target): target is number => typeof target === "number") ?? [10];
      const targetUnit = targets[randInt(0, targets.length - 1)];
      const rounded = roundToNearest(value, targetUnit);
      const answer = String(rounded);
      const { prompt } = roundingWordProblem(value, targetUnit, rounded);
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt,
            options: uniqueNumberOptions(Number(answer), targetUnit),
            answer,
          }
        : {
            kind: "typed_response",
            prompt,
            answer,
            placeholder: "Type the rounded number",
          };
    }

    const answer = String(value);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which value belongs between ${Math.max(min, value - step)} and ${Math.min(
            max,
            value + step
          )}?`,
          options: uniqueNumberOptions(value, step),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: `Type the number that would sit at this point on the line: ${value}.`,
          answer,
          placeholder: "Type the number",
        };
  }

  if (sourceActivityType === "addition_strategy") {
    const sourceQuestion = generateAdditionStrategyQuestion(config, level, lesson);
    const answer = String(sourceQuestion.answer);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: sourceQuestion.prompt,
          options: uniqueNumberOptions(Number(answer), 8),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: sourceQuestion.prompt,
          answer,
          helper: sourceQuestion.hint,
          placeholder: "Type the sum",
          writtenMethod:
            isYear3Week5Lesson(level, lesson) && lesson.lesson === 1
              ? buildWrittenMethodLayout("Long Addition", "+", sourceQuestion.a, sourceQuestion.b, sourceQuestion.answer)
              : undefined,
        };
  }

  if (sourceActivityType === "odd_even_sort") {
    const value = randInt(min, Math.max(min + 10, max));
    const answer = value % 2 === 0 ? "even" : "odd";
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Is ${value} odd or even?`,
          options: ["odd", "even"],
          answer,
        }
      : {
          kind: "typed_response",
          prompt: `Type "odd" or "even" for ${value}.`,
          answer,
          placeholder: "odd or even",
        };
  }

  if (sourceActivityType === "subtraction_strategy") {
    const sourceQuestion = generateInteractiveQuestion(level, "subtraction_strategy", config, lesson);
    if (!sourceQuestion || sourceQuestion.kind !== "subtraction_strategy") {
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: "Solve the subtraction question.",
            options: ["0", "1", "2", "3"],
            answer: "0",
          }
        : {
            kind: "typed_response",
            prompt: "Solve the subtraction question.",
            answer: "0",
            placeholder: "Type the answer",
          };
    }
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: sourceQuestion.prompt,
          options: sourceQuestion.options.map(String),
          answer: String(sourceQuestion.answer),
          helper: sourceQuestion.hint,
        }
      : {
          kind: "typed_response",
          prompt: sourceQuestion.prompt,
          answer: String(sourceQuestion.answer),
          helper: sourceQuestion.hint,
          placeholder: "Type the answer",
          writtenMethod:
            isYear3Week5Lesson(level, lesson) && lesson.lesson >= 2
              ? buildWrittenMethodLayout(
                  "Long Subtraction",
                  "-",
                  sourceQuestion.total,
                  sourceQuestion.remove,
                  sourceQuestion.answer
                )
              : undefined,
        };
  }

  if (sourceActivityType === "fact_family") {
    const restrictedFactors = getRestrictedFactors(level, lesson.week);
    if (restrictedFactors && isYear3Week8(level, lesson)) {
      const a = restrictedFactors[randInt(0, restrictedFactors.length - 1)] ?? 2;
      const b = restrictedFactors[randInt(0, restrictedFactors.length - 1)] ?? 2;
      const total = a * b;
      const askDivision = randInt(0, 1) === 0;
      const answer = askDivision ? String(b) : String(a);
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: askDivision
              ? `${total} ÷ ${a} = ?`
              : `${b} × ? = ${total}`,
            options: shuffle([answer, String(total), String(a + 1), String(Math.max(2, b - 1))]),
            answer,
          }
        : {
            kind: "typed_response",
            prompt: askDivision
              ? `${total} ÷ ${a} = ?`
              : `${b} × ? = ${total}`,
            answer,
            helper: "Use the related multiplication and division facts to find the missing number.",
            placeholder: "Type the missing number",
          };
    }

    const configuredMin = typeof config.min === "number" ? Math.max(0, config.min) : 0;
    const configuredMax =
      typeof config.max === "number"
        ? Math.min(config.max, profile.factFamilyMax)
        : profile.factFamilyMax;
    const aMax = Math.max(3, Math.min(18, Math.floor(configuredMax / 2)));
    const aMin = Math.min(aMax, Math.max(2, Math.floor(configuredMin / 3)));
    const a = randInt(aMin, aMax);
    const bMax = Math.max(2, Math.min(18, configuredMax - a));
    const bMin = Math.min(bMax, Math.max(2, Math.floor(configuredMin / 4)));
    const b = randInt(bMin, bMax);
    const total = a + b;
    const answer = String(total - a);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `If ${a} + ? = ${total}, what is the missing number?`,
          options: shuffle([answer, String(a), String(b + 1), String(total)]),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: `Complete the fact family: ${a} + ? = ${total}.`,
          answer,
          placeholder: "Type the missing number",
        };
  }

  if (sourceActivityType === "equal_groups" || sourceActivityType === "arrays") {
    const allowed = config.allowedGroupSizes as number[] | undefined;
    let groups: number;
    let perGroup: number;
    if (allowed && allowed.length > 0) {
      groups = allowed[randInt(0, allowed.length - 1)];
      perGroup = allowed[randInt(0, allowed.length - 1)];
    } else {
      groups = randInt(3, Math.min(8, profile.groupsMax));
      perGroup = randInt(2, Math.min(10, profile.itemsMax));
    }
    const answer = String(groups * perGroup);
    const visual = { type: "array" as const, rows: groups, columns: perGroup };
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `${groups} groups of ${perGroup} makes how many?`,
          options: uniqueNumberOptions(Number(answer), 6),
          answer,
          visual,
        }
      : {
          kind: "typed_response",
          prompt: `How many objects are in ${groups} groups of ${perGroup}?`,
          answer,
          placeholder: "Type the total",
        };
  }

  if (sourceActivityType === "skip_count") {
    const by =
      typeof config.step === "number"
        ? config.step
        : profile.skipCountExtraSteps[randInt(0, profile.skipCountExtraSteps.length - 1)] ?? 2;

    if (isYear3Week9Lesson1SkipCount(level, lesson, by)) {
      return buildYear3Week9SkipCountWrapper(by, asMultipleChoice);
    }

    const start = randInt(0, 5) * by;
    const answer = String(start + by * 3);
    const prompt = `${start}, ${start + by}, ${start + by * 2}, ?`;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Keep skip counting by ${by}: ${prompt}`,
          options: uniqueNumberOptions(Number(answer), by * 3),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: `Keep skip counting by ${by}: ${prompt}`,
          answer,
          placeholder: "Type the next number",
        };
  }

  if (sourceActivityType === "division_groups") {
    const perGroup = randInt(2, Math.min(10, profile.itemsMax));
    const groups = randInt(3, Math.min(8, profile.groupsMax));
    const total = perGroup * groups;
    const answer = String(groups);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `${total} shared into groups of ${perGroup} makes how many groups?`,
          options: uniqueNumberOptions(Number(answer), 4),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: `How many groups of ${perGroup} are in ${total}?`,
          answer,
          placeholder: "Type the number of groups",
        };
  }

  if (sourceActivityType === "mixed_word_problem") {
    const sourceQuestion = generateInteractiveQuestion(level, "mixed_word_problem", config, lesson);
    if (!sourceQuestion || sourceQuestion.kind !== "mixed_word_problem") {
      return {
        kind: "typed_response",
        prompt: `Solve the mixed word problem.`,
        answer: "0",
        placeholder: "Type the answer",
      };
    }
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: sourceQuestion.prompt,
          options: sourceQuestion.options.map(String),
          answer: String(sourceQuestion.answer),
          helper: sourceQuestion.showStrategyClue === false ? sourceQuestion.helper : undefined,
        }
      : {
          kind: "typed_response",
          prompt: sourceQuestion.prompt,
          answer: String(sourceQuestion.answer),
          helper: sourceQuestion.helper,
          placeholder: "Type the answer",
        };
  }

  if (sourceActivityType === "review_quiz") {
    const reviewActivities =
      config.reviewActivities?.filter((value): value is ActivityType => value !== "review_quiz") ?? [
        "skip_count",
        "arrays",
        "fact_family",
        "number_line",
        "addition_strategy",
        "subtraction_strategy",
        "division_groups",
        "odd_even_sort",
      ];
    const selectedType = reviewActivities[randInt(0, reviewActivities.length - 1)] ?? "skip_count";
    return generateGenericQuestion(
      getLevelForLesson(lesson),
      activityType,
      selectedType,
      randomReviewConfig(selectedType, getLevelForLesson(lesson)),
      lesson
    );
  }

  const quizPrompt = `Quick review for ${lesson.title}.`;
  const reviewAnswer = String(randInt(10, 40));
  return asMultipleChoice
    ? {
        kind: "multiple_choice",
        prompt: `${quizPrompt} Pick the matching number.`,
        options: uniqueNumberOptions(Number(reviewAnswer), 10),
        answer: reviewAnswer,
      }
    : {
        kind: "typed_response",
        prompt: `${quizPrompt} Type ${reviewAnswer}.`,
        answer: reviewAnswer,
        placeholder: "Type the number",
      };
}

export function buildYear2QuizActivityPool(
  lesson: Lesson,
  options?: {
    allowGenericFallback?: boolean;
  }
): {
  activities: LessonActivity[];
  violations: Year2PolicyViolation[];
} {
  return buildQuizActivityPool(getLevelForLesson(lesson), lesson, options);
}

export function buildQuizActivityPool(
  level: SupportedMathLevel,
  lesson: Lesson,
  options?: {
    allowGenericFallback?: boolean;
  }
): {
  activities: LessonActivity[];
  violations: Year2PolicyViolation[];
} {
  const allowGenericFallback = options?.allowGenericFallback === true;
  const activities = lesson.activities ?? [];
  const pool: LessonActivity[] = [];
  const violations: Year2PolicyViolation[] = [];
  const instructional = activities.filter(
    (activity) =>
      activity.activityType !== "multiple_choice" &&
      activity.activityType !== "typed_response" &&
      activity.activityType !== "review_quiz"
  );

  if (instructional.length > 0) {
    for (const activity of instructional) {
      const validation = validateLessonActivityIntentForLevel(level, lesson, activity);
      if (validation.valid) {
        pool.push(activity);
      } else {
        violations.push(...validation.violations);
      }
    }
  }

  const reviewActivity = activities.find((activity) => activity.activityType === "review_quiz");
  const reviewTypes =
    ((reviewActivity?.config ?? {}) as GenericConfig).reviewActivities?.filter(
      (value): value is ActivityType => value !== "review_quiz"
    ) ?? [];

  for (const type of reviewTypes) {
    const existing = activities.find((activity) => activity.activityType === type);
    const candidate: LessonActivity =
      existing ??
      ({
        activityType: type,
        weight: 1,
        config: randomReviewConfig(type, level),
      } as LessonActivity);
    const validation = validateLessonActivityIntentForLevel(level, lesson, candidate);
    if (validation.valid) {
      pool.push(candidate);
    } else {
      violations.push(...validation.violations);
    }
  }

  if (pool.length === 0 && allowGenericFallback) {
    const generic = activities.filter(
      (activity) =>
        activity.activityType === "multiple_choice" ||
        activity.activityType === "typed_response"
    );
    pool.push(...generic);
  }

  return { activities: pool, violations };
}

export function buildYear2LessonActivityPool(
  lesson: Lesson
): {
  activities: LessonActivity[];
  violations: Year2PolicyViolation[];
} {
  return buildLessonActivityPool(getLevelForLesson(lesson), lesson);
}
export function buildLessonActivityPool(
  level: SupportedMathLevel,
  lesson: Lesson
): {
  activities: LessonActivity[];
  violations: Year2PolicyViolation[];
} {
  const activities = lesson.activities ?? [];
  const pool: LessonActivity[] = [];
  const violations: Year2PolicyViolation[] = [];

  for (const activity of activities) {
    const validation = validateLessonActivityIntentForLevel(level, lesson, activity);
    if (validation.valid) {
      pool.push(activity);
    } else {
      violations.push(...validation.violations);
    }
  }

  return { activities: pool, violations };
}

export function generateYear2Question(
  lesson: Lesson,
  activity: LessonActivity
): Year2QuestionData {
  return generateQuestion(getLevelForLesson(lesson), lesson, activity);
}

export function generateQuestion(
  level: SupportedMathLevel,
  lesson: Lesson,
  activity: LessonActivity
): Year2QuestionData {
  const config = (activity.config ?? {}) as GenericConfig;
  const preValidation = validateLessonActivityIntentForLevel(level, lesson, activity);
  assertPolicyValidation(preValidation, "pre_generate");

  let question: Year2QuestionData;
  if (activity.activityType === "speed_round") {
    const dur = typeof config.durationSeconds === "number" ? config.durationSeconds : 30;
    question = {
      kind: "speed_round",
      prompt: "Speed Round",
      durationSeconds: dur,
    };
  } else if (
    activity.activityType === "place_value_builder" ||
    activity.activityType === "number_order" ||
    activity.activityType === "partition_expand" ||
    activity.activityType === "number_line" ||
    activity.activityType === "area_model_select" ||
    activity.activityType === "set_model_select" ||
    activity.activityType === "build_the_whole" ||
    activity.activityType === "number_line_place" ||
    activity.activityType === "fraction_compare" ||
    activity.activityType === "equivalent_fraction_match" ||
    activity.activityType === "equivalent_fraction_build" ||
    activity.activityType === "equivalent_fraction_yes_no" ||
    activity.activityType === "addition_strategy" ||
    activity.activityType === "equal_groups" ||
    activity.activityType === "arrays" ||
    activity.activityType === "division_groups" ||
    activity.activityType === "mixed_word_problem" ||
    activity.activityType === "subtraction_strategy" ||
    activity.activityType === "fact_family" ||
    activity.activityType === "odd_even_sort" ||
    activity.activityType === "skip_count"
  ) {
    question = generateInteractiveQuestion(level, activity.activityType, config, lesson) as Year2QuestionData;
  } else if (
    activity.activityType === "multiple_choice" ||
    activity.activityType === "typed_response"
  ) {
    const sourceActivityType = config.sourceActivityType ?? "place_value_builder";
    question = generateGenericQuestion(
      level,
      activity.activityType,
      sourceActivityType,
      config,
      lesson
    );
  } else if (activity.activityType === "review_quiz") {
    const reviewActivities =
      config.reviewActivities?.filter(
        (value): value is ActivityType => value !== "review_quiz"
      ) ?? [
        "skip_count",
        "arrays",
        "fact_family",
        "number_line",
        "addition_strategy",
        "subtraction_strategy",
        "division_groups",
        "odd_even_sort",
      ];
    const selectedType =
      reviewActivities[randInt(0, reviewActivities.length - 1)] ?? "skip_count";
    const mode =
      config.mode === "team_challenges" || config.mode === "final_quiz"
        ? config.mode
        : "revision_stations";
    const questionForReview = generateQuestionForLessonActivity(
      lesson,
      {
        activityType: selectedType,
        weight: 1,
        config: randomReviewConfig(selectedType, level),
      }
    ) as ReviewQuizInnerQuestion;

    question = {
      kind: "review_quiz",
      prompt: "Review challenge",
      activityType: selectedType,
      question: questionForReview,
      mode,
    };
  } else if (config.allowGenericFallback === true) {
    question = generateGenericQuestion(
      level,
      "multiple_choice",
      activity.activityType,
      config,
      lesson
    );
  } else {
    const unknownValidation: Year2PolicyValidation = {
      valid: false,
      violations: [
        buildViolation(
          "alignment",
          lesson,
          activity.activityType,
          `No generation path exists for activity type "${activity.activityType}".`
        ),
      ],
    };
    assertPolicyValidation(unknownValidation, "missing_generator");
    question = {
      kind: "typed_response",
      prompt: "This activity configuration is invalid.",
      answer: "0",
      placeholder: "Policy blocked",
    };
  }

  const postValidation = validateLessonActivityIntentForLevel(level, lesson, activity, question);
  assertPolicyValidation(postValidation, "post_generate");
  return question;
}

export function generateQuestionForActivity(
  activity: LessonActivity,
  lessonTitle: string
): Year2QuestionData {
  return generateQuestionForLessonActivity(
    {
      id: "year2-fallback",
      week: 0,
      lesson: 0,
      title: lessonTitle,
      focus: lessonTitle,
      activityIdeas: [],
      curriculum: ["ALL"],
      activities: [activity],
    },
    activity
  );
}

export function generateQuestionForLessonActivity(
  lesson: Lesson,
  activity: LessonActivity
): Year2QuestionData {
  return generateQuestionForLevelLessonActivity(getLevelForLesson(lesson), lesson, activity);
}

export function generateQuestionForLevelLessonActivity(
  level: SupportedMathLevel,
  lesson: Lesson,
  activity: LessonActivity
): Year2QuestionData {
  return generateQuestion(level, lesson, activity);
}

export const generateYear2QuestionFromActivity = generateQuestionForActivity;
