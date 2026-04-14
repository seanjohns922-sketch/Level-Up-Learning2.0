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
      thousandths?: number;
    };

export type MoneyVisualData =
  | {
      type: "shopping_list";
      title: string;
      budget?: number;
      boardLabel?: string;
      items: Array<{
        label: string;
        detail?: string;
        price: number;
        quantity?: number;
      }>;
    }
  | {
      type: "australian_money";
      title: string;
      boardLabel?: string;
      itemLabel?: string;
      itemDetail?: string;
      itemPrice?: number;
      quantity?: number;
      pieces: Array<{
        label: string;
        kind: "coin" | "note";
        value: number;
      }>;
    }
  | {
      type: "receipt";
      title: string;
      boardLabel?: string;
      lines: Array<{
        label: string;
        detail?: string;
        price: number;
        quantity?: number;
      }>;
      payment?: number;
    };

export type ColumnMultiplicationVisualData = {
  type: "column_multiplication";
  topValue: number;
  bottomValue: number;
  showWorkedExample?: boolean;
};

export type BoxMethodVisualData = {
  type: "box_method";
  leftValue: number;
  topValue: number;
  showWorkedExample?: boolean;
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

function decimalPlacesForStep(step: number) {
  if (step >= 1) return 0;
  const text = step.toString();
  if (!text.includes(".")) return 0;
  return text.split(".")[1]?.length ?? 0;
}

function randomStepValue(min: number, max: number, step: number) {
  if (step >= 1) return randInt(min, max);

  const precision = decimalPlacesForStep(step);
  const factor = 10 ** precision;
  const scaledStep = Math.round(step * factor);
  const scaledMin = Math.ceil(min * factor);
  const scaledMax = Math.floor(max * factor);
  const first = Math.ceil(scaledMin / scaledStep) * scaledStep;
  const count = Math.max(0, Math.floor((scaledMax - first) / scaledStep));
  const chosen = first + randInt(0, count) * scaledStep;
  return Number((chosen / factor).toFixed(precision));
}

function formatMathNumber(value: number) {
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

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
  partitionDenominator?: number;
  targetFraction?: string;
  options?: string[];
  answer?: string;
  fractions?: string[];
  maxWhole?: number;
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
  mode:
    | "choose_operation"
    | "two_step_add_sub"
    | "mult_div_problems"
    | "budgeting"
    | "shop_transactions"
    | "two_step_problem";
  showStrategyClue?: boolean;
  visual?:
    | MoneyVisualData
    | {
        type: "array";
        rows: number;
        columns: number;
        highlightedRows?: number[];
      };
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

function fractionPartsForNumberLine(allowedDenominators?: number[]) {
  const parts = [
    { label: "1/8", value: 1 / 8 },
    { label: "1/10", value: 1 / 10 },
    { label: "1/5", value: 1 / 5 },
    { label: "1/4", value: 1 / 4 },
    { label: "3/8", value: 3 / 8 },
    { label: "1/2", value: 1 / 2 },
    { label: "5/8", value: 5 / 8 },
    { label: "3/5", value: 3 / 5 },
    { label: "7/10", value: 7 / 10 },
    { label: "3/4", value: 3 / 4 },
    { label: "7/8", value: 7 / 8 },
    { label: "4/5", value: 4 / 5 },
    { label: "9/10", value: 9 / 10 },
  ];

  if (!allowedDenominators || allowedDenominators.length === 0) {
    return parts;
  }

  return parts.filter((part) => {
    const denominator = Number(part.label.split("/")[1] ?? 0);
    return allowedDenominators.includes(denominator);
  });
}

function year3FractionOrderSets() {
  return [
    ["1/5", "1/2", "4/5"],
    ["1/4", "1/2", "3/4"],
    ["1/10", "1/2", "7/10"],
    ["1/5", "3/5", "4/5"],
    ["1/8", "1/4", "1/2"],
    ["1/8", "3/8", "5/8"],
    ["1/4", "3/8", "1/2"],
    ["3/8", "1/2", "5/8"],
    ["1/2", "5/8", "3/4"],
    ["1/4", "3/4", "7/8"],
    ["1/10", "1/5", "7/10"],
    ["1/10", "3/5", "9/10"],
    ["1/4", "3/4", "9/10"],
  ];
}

function mixedNumeralLabel(whole: number, numerator: number, denominator: number) {
  if (numerator === 0) return String(whole);
  if (whole === 0) return `${numerator}/${denominator}`;
  return `${whole} ${numerator}/${denominator}`;
}

function buildYear4Week11DivisionInverseQuestion(asMultipleChoice: boolean) {
  const templates = [
    { prompt: "? × 4 = 24", answer: 6, distractors: [4, 8, 24] },
    { prompt: "30 ÷ ? = 5", answer: 6, distractors: [5, 10, 30] },
    { prompt: "6 × ? = 42", answer: 7, distractors: [6, 8, 42] },
    { prompt: "? groups of 8 make 40", answer: 5, distractors: [4, 8, 40] },
    { prompt: "24 ÷ 4 = ?", answer: 6, distractors: [4, 8, 24] },
    { prompt: "18 ÷ 3 = ?", answer: 6, distractors: [3, 9, 18] },
    { prompt: "32 ÷ 8 = ?", answer: 4, distractors: [8, 6, 32] },
    { prompt: "35 ÷ 5 = ?", answer: 7, distractors: [5, 6, 35] },
    { prompt: "42 ÷ 6 = ?", answer: 7, distractors: [6, 8, 42] },
    { prompt: "56 ÷ 7 = ?", answer: 8, distractors: [7, 6, 56] },
  ];
  const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
  const answer = String(chosen.answer);
  return asMultipleChoice
    ? {
        kind: "multiple_choice" as const,
        prompt: chosen.prompt,
        options: shuffle([answer, ...chosen.distractors.map(String)]),
        answer,
      }
    : {
        kind: "typed_response" as const,
        prompt: chosen.prompt,
        answer,
        helper: "Use the related multiplication and division fact to find the missing number.",
        placeholder: "Type the answer",
      };
}

function buildYear4Week11FractionOfQuantityQuestion(asMultipleChoice: boolean) {
  const templates = [
    { prompt: "What is 1/2 of 20?", answer: 10, denominator: 2, total: 20 },
    { prompt: "What is 1/4 of 16?", answer: 4, denominator: 4, total: 16 },
    { prompt: "What is 1/3 of 12?", answer: 4, denominator: 3, total: 12 },
    { prompt: "What is 1/5 of 25?", answer: 5, denominator: 5, total: 25 },
    { prompt: "What is 1/6 of 24?", answer: 4, denominator: 6, total: 24 },
    { prompt: "Sam has 18 stickers. He gives away 1/2. How many is that?", answer: 9, denominator: 2, total: 18 },
    { prompt: "There are 28 pencils. What is 1/4 of 28?", answer: 7, denominator: 4, total: 28 },
    { prompt: "There are 24 cupcakes. What is 1/6 of 24?", answer: 4, denominator: 6, total: 24 },
    { prompt: "A box holds 20 sports balls. What is 1/5 of 20?", answer: 4, denominator: 5, total: 20 },
    { prompt: "There are 20 books on a shelf. What is 1/4 of 20?", answer: 5, denominator: 4, total: 20 },
  ];
  const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
  const answer = String(chosen.answer);
  const visual =
    Math.random() < 0.78
      ? {
          type: "array" as const,
          rows: chosen.denominator,
          columns: chosen.answer,
          highlightedRows: [0],
        }
      : undefined;
  const distractors = [
    Math.max(1, chosen.answer - 1),
    chosen.answer + 1,
    Math.max(1, chosen.total / chosen.denominator),
    chosen.denominator,
  ];
  return asMultipleChoice
    ? {
        kind: "multiple_choice" as const,
        prompt: chosen.prompt,
        options: shuffle(
          Array.from(new Set([answer, ...distractors.map(String)])).slice(0, 4)
        ),
        answer,
        helper: "Split the quantity into equal groups, then count one part.",
        visual,
      }
    : {
        kind: "typed_response" as const,
        prompt: chosen.prompt,
        answer,
        helper: "Find one equal part of the total first.",
        placeholder: "Type the number",
        visual,
      };
}

function buildYear4Week11DivisionFractionMultiStepQuestion() {
  const templates = [
    {
      prompt:
        "24 apples are shared equally between 4 children. Each child eats 1/2 of their apples. How many apples are left altogether?",
      answer: 12,
      visual: { type: "array" as const, rows: 4, columns: 6, highlightedRows: [0] },
    },
    {
      prompt: "20 muffins are packed equally into 5 boxes. What is 1/2 of the muffins in one box?",
      answer: 2,
      visual: { type: "array" as const, rows: 5, columns: 4, highlightedRows: [0] },
    },
    {
      prompt:
        "18 stickers are shared equally between 3 students. One student gives away 1/3 of their stickers. How many do they have left?",
      answer: 4,
      visual: { type: "array" as const, rows: 3, columns: 6, highlightedRows: [0] },
    },
    {
      prompt: "16 pencils are split equally into 4 groups. What is 1/2 of one group?",
      answer: 2,
      visual: { type: "array" as const, rows: 4, columns: 4, highlightedRows: [0] },
    },
    {
      prompt:
        "24 lollies are shared equally between 6 children. Each child eats 1/2 of their share. How many lollies are eaten altogether?",
      answer: 12,
      visual: { type: "array" as const, rows: 6, columns: 4, highlightedRows: [0] },
    },
    {
      prompt:
        "30 cards are shared equally between 5 teams. Each team loses 1/3 of its cards. How many cards remain altogether?",
      answer: 20,
      visual: { type: "array" as const, rows: 5, columns: 6, highlightedRows: [0] },
    },
  ];
  const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
  return {
    kind: "mixed_word_problem" as const,
    prompt: chosen.prompt,
    answer: chosen.answer,
    options: uniqueNumberOptions(chosen.answer, 8).map(Number),
    operationLabel: "Multi-step",
    helper: "Work through the steps in order: divide first, then find the fraction.",
    mode: "two_step_problem" as const,
    showStrategyClue: false,
    visual: Math.random() < 0.75 ? chosen.visual : undefined,
  };
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
  mode: "identify" | "pattern" | "odd_even_sums" | "odd_even_products";
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
        highlightedRows?: number[];
      }
    | MABVisualData
    | DecimalVisualData
    | MoneyVisualData;
};

export type WrittenMethodLayout = {
  title: string;
  operation: "+" | "-" | "×";
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
  fixedDenominator?: number;
  writtenMethod?: WrittenMethodLayout;
  visual?:
    | {
        type: "array";
        rows: number;
        columns: number;
        highlightedRows?: number[];
      }
    | MABVisualData
    | DecimalVisualData
    | ColumnMultiplicationVisualData
    | BoxMethodVisualData
    | MoneyVisualData;
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
  boardIndex?: number;
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

export type SupportedMathLevel = 2 | 3 | 4 | 5;

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
  4: [
    {
      weekMin: 1,
      weekMax: 12,
      addSubMax: 100000,
      addSubExtensionMax: 999999,
      groupsMax: 12,
      itemsMax: 12,
      divisionTotalMax: 144,
      factFamilyMax: 100,
      skipCountMax: 1000000,
      skipCountExtraSteps: [2, 3, 4, 5, 10, 100, 1000],
      wordProblemMax: 999999,
    },
  ],
  5: [
    {
      weekMin: 1,
      weekMax: 12,
      addSubMax: 100000,
      addSubExtensionMax: 999999,
      groupsMax: 12,
      itemsMax: 12,
      divisionTotalMax: 144,
      factFamilyMax: 100,
      skipCountMax: 1000000,
      skipCountExtraSteps: [2, 3, 4, 5, 10, 100, 1000],
      wordProblemMax: 999999,
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
    allowedModes: ["shade_fraction", "pick_model", "match_model", "match_equivalent", "skip_count_fraction"],
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
    allowedModes: ["place_fraction", "pick_point", "order_fractions", "skip_count_fraction", "mixed_numerals"],
    requiresVisual: true,
  },
  fraction_compare: {
    allowedModes: ["symbol_compare", "visual_compare", "true_false", "same_denominator_combine"],
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
    allowedModes: ["identify", "pattern", "odd_even_sums", "odd_even_products"],
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
    allowedModes: ["choose_operation", "two_step_add_sub", "two_step_problem", "mult_div_problems", "division_fraction_multistep"],
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

const LEVEL4_ACTIVITY_POLICY: Record<ActivityType, ActivityPolicy> = {
  ...BASE_ACTIVITY_POLICY,
  fact_family: {
    ...BASE_ACTIVITY_POLICY.fact_family,
    maxFactValue: 100,
  },
};

const LEVEL_ACTIVITY_POLICY: Record<SupportedMathLevel, Record<ActivityType, ActivityPolicy>> = {
  2: LEVEL2_ACTIVITY_POLICY,
  3: LEVEL3_ACTIVITY_POLICY,
  4: LEVEL4_ACTIVITY_POLICY,
  5: LEVEL4_ACTIVITY_POLICY,
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

function uniqueStringOptions(answer: string, distractors: string[]) {
  const options = [answer, ...distractors].filter((value, index, list) => list.indexOf(value) === index);

  for (const fallback of ["1", "1/2", "2/3", "3/4", "5/5", "2 1/2", "1 1/3", "3/6"]) {
    if (options.length >= 4) break;
    if (!options.includes(fallback)) options.push(fallback);
  }

  return shuffle(options.slice(0, 4));
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
  operation: "+" | "-" | "×",
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

function isYear4Week8(level: SupportedMathLevel, lesson: Lesson) {
  return level === 4 && lesson.week === 8;
}

type Week8Board = {
  id: string;
  title: string;
  type: "cinema" | "canteen" | "sports_store" | "book_fair" | "stationery";
  items: Array<{
    label: string;
    detail?: string;
    price: number;
  }>;
};

function year4Week8Boards(): Week8Board[] {
  return [
    {
      id: "cinema",
      title: "Cinema Menu",
      type: "cinema",
      items: [
        { label: "Child Ticket", detail: "Standard", price: 12 },
        { label: "Adult Ticket", detail: "Standard", price: 18 },
        { label: "Popcorn", detail: "Small", price: 6 },
        { label: "Popcorn", detail: "Large", price: 9 },
        { label: "Drink", detail: "Small", price: 4 },
        { label: "Drink", detail: "Large", price: 6 },
        { label: "Choc Top", detail: "Ice cream", price: 5 },
        { label: "Combo", detail: "Popcorn + Drink", price: 13 },
        { label: "Family Pack", detail: "2 adults + 2 children", price: 54 },
        { label: "Lollies", detail: "Bag", price: 4 },
      ],
    },
    {
      id: "canteen",
      title: "School Canteen",
      type: "canteen",
      items: [
        { label: "Sandwich", detail: "Ham", price: 6 },
        { label: "Wrap", detail: "Chicken", price: 7 },
        { label: "Fruit Cup", detail: "Fresh", price: 4 },
        { label: "Muffin", detail: "Chocolate", price: 3 },
        { label: "Juice", detail: "250 mL", price: 2 },
        { label: "Water", detail: "Bottle", price: 3 },
        { label: "Yoghurt", detail: "Tub", price: 4 },
        { label: "Pizza Slice", detail: "Cheese", price: 5 },
        { label: "Lunch Combo", detail: "Sandwich + Juice", price: 8 },
        { label: "Snack Pack", detail: "Fruit + Muffin", price: 6 },
      ],
    },
    {
      id: "sports",
      title: "Sports Store",
      type: "sports_store",
      items: [
        { label: "Soccer Ball", detail: "Size 4", price: 24 },
        { label: "Tennis Ball Pack", detail: "3 pack", price: 8 },
        { label: "Drink Bottle", detail: "750 mL", price: 12 },
        { label: "Cap", detail: "Team", price: 15 },
        { label: "Shin Pads", detail: "Junior", price: 18 },
        { label: "Sports Socks", detail: "Pair", price: 9 },
        { label: "Bib Set", detail: "Training", price: 20 },
        { label: "Cone Set", detail: "10 cones", price: 14 },
        { label: "Team Pack", detail: "5 bibs", price: 45 },
        { label: "Whistle", detail: "Coach", price: 7 },
      ],
    },
    {
      id: "books",
      title: "Book Fair",
      type: "book_fair",
      items: [
        { label: "Picture Book", detail: "Softcover", price: 10 },
        { label: "Novel", detail: "Junior fiction", price: 14 },
        { label: "Puzzle Book", detail: "Activities", price: 8 },
        { label: "Bookmark", detail: "Magnetic", price: 3 },
        { label: "Poster", detail: "A2", price: 6 },
        { label: "Author Pack", detail: "2 books", price: 22 },
        { label: "Sticker Sheet", detail: "Book themed", price: 4 },
        { label: "Diary", detail: "Reading log", price: 9 },
        { label: "Comic", detail: "Issue", price: 7 },
        { label: "Mystery Bundle", detail: "3 books", price: 30 },
      ],
    },
    {
      id: "stationery",
      title: "Stationery Shop",
      type: "stationery",
      items: [
        { label: "Notebook", detail: "A4", price: 5 },
        { label: "Pencil Case", detail: "Zip", price: 9 },
        { label: "Marker Pack", detail: "6 pack", price: 7 },
        { label: "Glue Stick", detail: "Large", price: 3 },
        { label: "Highlighter", detail: "Single", price: 4 },
        { label: "Scissors", detail: "Student", price: 8 },
        { label: "Coloured Pencils", detail: "12 pack", price: 11 },
        { label: "Eraser", detail: "Soft", price: 2 },
        { label: "Ruler", detail: "30 cm", price: 3 },
        { label: "Class Pack", detail: "4 notebooks", price: 18 },
      ],
    },
  ];
}

function getWeek8Board(config: GenericConfig) {
  const boards = year4Week8Boards();
  const boardIndex =
    typeof config.boardIndex === "number"
      ? Math.max(0, Math.min(config.boardIndex, boards.length - 1))
      : randInt(0, boards.length - 1);
  return boards[boardIndex] ?? boards[0];
}

function formatWeek8ItemLabel(
  item: Week8Board["items"][number],
  quantity: number,
) {
  const label = item.label.toLowerCase();
  const detail = item.detail?.trim();
  const plural = quantity === 1 ? "" : "s";

  if (!detail || detail.toLowerCase() === "standard") {
    return `${quantity} ${label}${plural}`;
  }

  const detailLower = detail.toLowerCase();
  const isSimplePrefix =
    ["small", "large", "junior", "child", "adult"].includes(detailLower);

  if (isSimplePrefix) {
    return `${quantity} ${detailLower} ${label}${plural}`;
  }

  return `${quantity} ${label}${plural} (${detailLower})`;
}

function buildAustralianMoneyPieces(amount: number) {
  const denominations = [100, 50, 20, 10, 5, 2, 1] as const;
  const pieces: Array<{
    label: string;
    kind: "coin" | "note";
    value: number;
  }> = [];
  let remaining = amount;

  for (const value of denominations) {
    while (remaining >= value) {
      pieces.push({
        label: `$${value}`,
        kind: value >= 5 ? "note" : "coin",
        value,
      });
      remaining -= value;
    }
  }

  return pieces;
}

function buildYear4Week8BudgetingQuestion(config: GenericConfig): MixedWordProblemQuestion {
  const board = getWeek8Board(config);
  const items = board.items;
  const variants = [
    (() => {
      const a = items[0];
      const b = items[1];
      const quantityA = 4;
      const quantityB = 3;
      const answer = a.price * quantityA + b.price * quantityB;
      return {
        prompt: `Use the ${board.title}. What is the total cost of ${formatWeek8ItemLabel(a, quantityA)} and ${formatWeek8ItemLabel(b, quantityB)}?`,
        answer,
        helper: "Multiply each price by the quantity, then add the totals.",
        budget: undefined,
      };
    })(),
    (() => {
      const a = items[2];
      const b = items[3];
      const quantityA = 5;
      const quantityB = 2;
      const answer = a.price * quantityA + b.price * quantityB;
      return {
        prompt: `Use the ${board.title}. A student buys ${formatWeek8ItemLabel(a, quantityA)} and ${formatWeek8ItemLabel(b, quantityB)}. How much is spent?`,
        answer,
        helper: "Work out each item total first, then combine them.",
        budget: undefined,
      };
    })(),
    (() => {
      const a = items[4];
      const b = items[5];
      const quantityA = 3;
      const quantityB = 4;
      const spend = a.price * quantityA + b.price * quantityB;
      const budget = Math.ceil(spend / 10) * 10 + 10;
      return {
        prompt: `Use the ${board.title}. A student has $${budget}. They buy ${formatWeek8ItemLabel(a, quantityA)} and ${formatWeek8ItemLabel(b, quantityB)}. How much money is left?`,
        answer: budget - spend,
        helper: "Multiply the costs, add the total spent, then compare it with the budget.",
        budget,
      };
    })(),
  ];
  const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
  return {
    kind: "mixed_word_problem",
    prompt: picked.prompt,
    answer: picked.answer,
    options: uniqueNumberOptions(picked.answer, Math.max(8, picked.answer + 10)).map(Number),
    operationLabel: "Multiply and add costs",
    helper: picked.helper,
    mode: "budgeting",
    showStrategyClue: false,
    visual: {
      type: "shopping_list",
      title: board.title,
      boardLabel: board.id,
      budget: picked.budget,
      items: board.items.map((item) => ({ ...item })),
    },
  };
}

function buildYear4Week8ShopQuestion(config: GenericConfig): MixedWordProblemQuestion {
  const board = getWeek8Board(config);
  const variants = [
    (() => {
      const item = board.items[0];
      const quantity = 3;
      const total = item.price * quantity;
      const payment = Math.ceil(total / 10) * 10;
      return {
        prompt: `Use the ${board.title}. A student buys ${formatWeek8ItemLabel(item, quantity)}. How much change do they get from $${payment}?`,
        answer: payment - total,
        helper: "Multiply the item price by the quantity, then subtract from the money shown.",
        visual: {
          type: "australian_money" as const,
          title: board.title,
          boardLabel: board.id,
          itemLabel: item.label,
          itemDetail: item.detail,
          itemPrice: item.price,
          quantity,
          pieces: buildAustralianMoneyPieces(payment),
        },
      };
    })(),
    (() => {
      const item = board.items[1];
      const quantity = 4;
      const total = item.price * quantity;
      const payment = total + 5;
      return {
        prompt: `Use the ${board.title}. A student buys ${formatWeek8ItemLabel(item, quantity)}. How much change do they get from the money shown?`,
        answer: payment - total,
        helper: "Find the total cost first, then compare it with the money shown.",
        visual: {
          type: "australian_money" as const,
          title: board.title,
          boardLabel: board.id,
          itemLabel: item.label,
          itemDetail: item.detail,
          itemPrice: item.price,
          quantity,
          pieces: buildAustralianMoneyPieces(payment),
        },
      };
    })(),
    (() => {
      const item = board.items[2];
      const quantity = 5;
      const total = item.price * quantity;
      const payment = total;
      return {
        prompt: `Use the ${board.title}. A student buys ${formatWeek8ItemLabel(item, quantity)}. What is the total cost?`,
        answer: total,
        helper: "Multiply the price by the quantity to find the basket total.",
        visual: {
          type: "australian_money" as const,
          title: board.title,
          boardLabel: board.id,
          itemLabel: item.label,
          itemDetail: item.detail,
          itemPrice: item.price,
          quantity,
          pieces: buildAustralianMoneyPieces(payment),
        },
      };
    })(),
  ] as const;
  const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
  return {
    kind: "mixed_word_problem",
    prompt: picked.prompt,
    answer: picked.answer,
    options: uniqueNumberOptions(picked.answer, Math.max(8, picked.answer + 10)).map(Number),
    operationLabel: "Multiply in a shopping context",
    helper: picked.helper,
    mode: "shop_transactions",
    showStrategyClue: false,
    visual: {
      ...picked.visual,
      pieces: picked.visual.pieces.map((piece) => ({ ...piece })),
    },
  };
}

function buildYear4Week8TwoStepQuestion(config: GenericConfig): MixedWordProblemQuestion {
  const board = getWeek8Board(config);
  const variants = [
    (() => {
      const a = board.items[0];
      const b = board.items[3];
      return {
        prompt: `Use the receipt from the ${board.title}. What is the total cost of ${formatWeek8ItemLabel(a, 4)} and ${formatWeek8ItemLabel(b, 2)}?`,
        answer: a.price * 4 + b.price * 2,
        helper: "Multiply each item cost first, then add the totals.",
        lines: [
          { label: a.label, detail: a.detail, price: a.price, quantity: 4 },
          { label: b.label, detail: b.detail, price: b.price, quantity: 2 },
        ],
      };
    })(),
    (() => {
      const a = board.items[1];
      const b = board.items[4];
      const spend = a.price * 3 + b.price * 4;
      const payment = Math.ceil(spend / 10) * 10 + 10;
      return {
        prompt: `Use the receipt from the ${board.title}. A family pays with $${payment}. How much change do they get after buying ${formatWeek8ItemLabel(a, 3)} and ${formatWeek8ItemLabel(b, 4)}?`,
        answer: payment - spend,
        helper: "Multiply first, add the costs, then subtract from the payment.",
        lines: [
          { label: a.label, detail: a.detail, price: a.price, quantity: 3 },
          { label: b.label, detail: b.detail, price: b.price, quantity: 4 },
        ],
        payment,
      };
    })(),
    (() => {
      const a = board.items[2];
      const b = board.items[5];
      return {
        prompt: `Use the receipt from the ${board.title}. What is the total cost of ${formatWeek8ItemLabel(a, 5)} and ${formatWeek8ItemLabel(b, 2)}?`,
        answer: a.price * 5 + b.price * 2,
        helper: "Multiply each line, then combine the totals.",
        lines: [
          { label: a.label, detail: a.detail, price: a.price, quantity: 5 },
          { label: b.label, detail: b.detail, price: b.price, quantity: 2 },
        ],
      };
    })(),
  ] as const;
  const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
  return {
    kind: "mixed_word_problem",
    prompt: picked.prompt,
    answer: picked.answer,
    options: uniqueNumberOptions(picked.answer, Math.max(8, picked.answer + 12)).map(Number),
    operationLabel: "Multiply, then combine totals",
    helper: picked.helper,
    mode: "two_step_problem",
    showStrategyClue: false,
    visual: {
      type: "receipt",
      title: board.title,
      boardLabel: board.id,
      lines: picked.lines.map((line) => ({ ...line })),
      payment: "payment" in picked ? picked.payment : undefined,
    },
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
  if (yearNumber >= 5) return 5;
  if (yearNumber >= 4) return 4;
  if (yearNumber >= 3) return 3;
  return 2;
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
    const mode = typeof config.mode === "string" ? config.mode : undefined;
    const decimalStep =
      typeof config.step === "number"
        ? config.step
        : level >= 5
          ? 0.001
          : 0.1;
    while (values.size < count) {
      values.add(
        mode === "decimal_order"
          ? randomStepValue(min, max, decimalStep)
          : randInt(min, max)
      );
    }
    return {
      kind: "number_order",
      prompt: ascending
        ? `Order the ${mode === "decimal_order" ? "decimals" : "numbers"} from smallest to largest.`
        : `Order the ${mode === "decimal_order" ? "decimals" : "numbers"} from largest to smallest.`,
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

    const value = randomStepValue(min, max, step);
    return {
      kind: "number_line",
      prompt:
        mode === "estimate"
          ? `Estimate where ${formatMathNumber(value)} belongs on the number line.`
          : `Place ${formatMathNumber(value)} on the number line.`,
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

    const allowedDenominators =
      Array.isArray(config.denominators) && config.denominators.every((value) => typeof value === "number")
        ? (config.denominators as number[])
        : undefined;

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

    const denominator =
      allowedDenominators && allowedDenominators.length > 0
        ? allowedDenominators[randInt(0, allowedDenominators.length - 1)] ?? allowedDenominators[0] ?? randomUnitDenominator()
        : randomUnitDenominator();
    const numerator = 1;

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
    const explicitMode = typeof config.mode === "string" ? config.mode : undefined;
    const mode =
      explicitMode === "pick_point" || explicitMode === "order_fractions"
        ? explicitMode
        : "place_fraction";

    const allowedDenominators =
      Array.isArray(config.denominators) && config.denominators.every((value) => typeof value === "number")
        ? (config.denominators as number[])
        : undefined;

    if (explicitMode === "skip_count_fraction") {
      const denominators = allowedDenominators?.length ? allowedDenominators : [2, 3, 4, 5, 6, 8];
      const denominator = denominators[randInt(0, denominators.length - 1)] ?? denominators[0] ?? 4;
      const targetStep = randInt(1, Math.max(1, denominator - 1));
      const targetLabel = `${targetStep}/${denominator}`;
      const fractionAnswer = `${targetStep}/${denominator}`;
      return {
        kind: "number_line_place",
        prompt: `Count by 1/${denominator}. Place ${targetLabel} on the number line.`,
        mode: "place_fraction",
        denominator,
        partitionDenominator: denominator,
        targetFraction: targetLabel,
        options: Array.from({ length: denominator }, (_, index) =>
          index + 1 === denominator ? "1" : `${index + 1}/${denominator}`
        ),
        answer: fractionAnswer,
      };
    }

    if (explicitMode === "mixed_numerals") {
      const denominators = allowedDenominators?.length ? allowedDenominators : [2, 3, 4, 5, 6, 8];
      const denominator = denominators[randInt(0, denominators.length - 1)] ?? denominators[0] ?? 2;
      const whole = 1;
      const numerator = randInt(1, denominator - 1);
      const targetLabel = mixedNumeralLabel(whole, numerator, denominator);
      return {
        kind: "number_line_place",
        prompt: `Place ${targetLabel} on the number line.`,
        mode: "place_fraction",
        denominator,
        partitionDenominator: denominator,
        targetFraction: targetLabel,
        answer: targetLabel,
        maxWhole: 2,
      };
    }

    if (mode === "order_fractions") {
      const candidateSets = year3FractionOrderSets().filter((set) =>
        !allowedDenominators || set.every((value) => allowedDenominators.includes(Number(value.split("/")[1] ?? 0)))
      );
      const orderedSet =
        candidateSets[randInt(0, candidateSets.length - 1)] ??
        candidateSets[0] ??
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

    const availableFractions = fractionPartsForNumberLine(allowedDenominators);
    const target =
      availableFractions[randInt(0, availableFractions.length - 1)] ?? availableFractions[0];
    const placePrompts = [
      `Place ${target.label} on the number line.`,
      `Show where ${target.label} belongs on the number line.`,
      `Find the position of ${target.label} on the number line.`,
    ];
    const pickPrompts = [
      `Which point shows ${target.label}?`,
      `Pick the point that matches ${target.label}.`,
      `Tap the point for ${target.label} on the number line.`,
    ];
    return {
      kind: "number_line_place",
      prompt:
        mode === "pick_point"
          ? pickPrompts[randInt(0, pickPrompts.length - 1)] ?? pickPrompts[0]
          : placePrompts[randInt(0, placePrompts.length - 1)] ?? placePrompts[0],
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
    if (isYear4Week8(level, lesson)) {
      const explicitMode = typeof config.mode === "string" ? config.mode : "";
      if (explicitMode === "budgeting") {
        return buildYear4Week8BudgetingQuestion(config);
      }
      if (explicitMode === "shop_transactions") {
        return buildYear4Week8ShopQuestion(config);
      }
      if (explicitMode === "two_step_problem") {
        return buildYear4Week8TwoStepQuestion(config);
      }
    }
    if (typeof config.mode === "string" && config.mode === "division_fraction_multistep") {
      return buildYear4Week11DivisionFractionMultiStepQuestion();
    }
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
    const configuredFamilyType =
      config.familyType === "mult_div" || config.familyType === "add_sub" ? config.familyType : undefined;
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

    if (configuredFamilyType === "mult_div") {
      const factors =
        Array.isArray(config.allowedGroupSizes) && config.allowedGroupSizes.every((value) => typeof value === "number")
          ? (config.allowedGroupSizes as number[])
          : [3, 4, 5, 6, 7, 8];
      const a = factors[randInt(0, factors.length - 1)] ?? 3;
      const distinctFactors = factors.filter((factor) => factor !== a);
      const b =
        (distinctFactors.length > 0
          ? distinctFactors[randInt(0, distinctFactors.length - 1)]
          : factors[randInt(0, factors.length - 1)]) ?? 4;
      const total = a * b;
      const family: [number, number, number] = [a, b, total];
      const allCorrect = [
        `${a} × ${b} = ${total}`,
        `${b} × ${a} = ${total}`,
        `${total} ÷ ${a} = ${b}`,
        `${total} ÷ ${b} = ${a}`,
      ];
      const correctSet = Array.from(new Set(allCorrect));

      if (mode === "word_problems") {
        const prompts = [
          {
            story: `${total} objects are shared equally into ${a} groups. Which sentence matches?`,
            answer: `${total} ÷ ${a} = ${b}`,
          },
          {
            story: `${total} objects are put into groups of ${b}. Which sentence matches?`,
            answer: `${total} ÷ ${b} = ${a}`,
          },
          {
            story: `There are ${a} rows with ${b} counters in each row. Which multiplication sentence matches?`,
            answer: `${a} × ${b} = ${total}`,
          },
        ];
        const chosen = prompts[randInt(0, prompts.length - 1)] ?? prompts[0]!;
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
      config.mode === "pattern" ||
      config.mode === "odd_even_sums" ||
      config.mode === "odd_even_products"
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
    } else if (mode === "odd_even_products") {
      const expressions = new Map<string, number>();
      while (expressions.size < count) {
        const a = randInt(1, Math.max(3, Math.min(12, max)));
        const b = randInt(1, Math.max(3, Math.min(12, max)));
        expressions.set(`${a} × ${b}`, a * b);
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
        : mode === "odd_even_sums"
        ? shuffle([
            "Even + even = even, odd + odd = even, and odd + even = odd.",
            "Odd + odd is always odd.",
            "Even + odd is always odd.",
            "Adding any two odd numbers gives an odd answer.",
          ])
        : mode === "odd_even_products"
        ? shuffle([
            "Even × any number = even, and odd × odd = odd.",
            "Odd × odd is always even.",
            "Even × odd is always odd.",
            "A product is odd whenever one factor is even.",
          ])
        : undefined;

    return {
      kind: "odd_even_sort",
      prompt:
        mode === "pattern"
          ? "Sort the numbers into odd and even, then choose the pattern you notice."
          : mode === "odd_even_sums"
          ? "Work out each sum, then sort the results into odd and even."
          : mode === "odd_even_products"
          ? "Work out each product, then sort the results into odd and even."
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
          : mode === "odd_even_sums"
          ? "Even + even = even, odd + odd = even, and odd + even = odd."
          : mode === "odd_even_products"
          ? "Even × any number = even, and odd × odd = odd."
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
        mode: (["identify", "pattern", "odd_even_sums", "odd_even_products"] as const)[randInt(0, 3)],
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

  if (explicitMode === "division_inverse") {
    return buildYear4Week11DivisionInverseQuestion(asMultipleChoice);
  }

  if (explicitMode === "fraction_of_quantity") {
    return buildYear4Week11FractionOfQuantityQuestion(asMultipleChoice);
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

  if (explicitMode === "decimal_compare") {
    const precision =
      level >= 5
        ? (([0.1, 0.01, 0.001] as const)[randInt(0, 2)] ?? 0.001)
        : randInt(0, 1) === 0
          ? 0.1
          : 0.01;
    const minDecimal = level >= 5 ? 0.001 : 0.1;
    const maxDecimal = level >= 5 ? 12.999 : 9.99;
    const left = randomStepValue(minDecimal, maxDecimal, precision);
    let right = randomStepValue(minDecimal, maxDecimal, precision);
    while (right === left) {
      right = randomStepValue(minDecimal, maxDecimal, precision);
    }
    const answer = left > right ? formatMathNumber(left) : formatMathNumber(right);

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which decimal is greater: ${formatMathNumber(left)} or ${formatMathNumber(right)}?`,
          options: shuffle([formatMathNumber(left), formatMathNumber(right)]),
          answer,
          helper: "Compare the ones, then the tenths, then the hundredths.",
        }
      : {
          kind: "typed_response",
          prompt: `Type the greater decimal: ${formatMathNumber(left)} or ${formatMathNumber(right)}.`,
          answer,
          helper: "Compare the ones, then the tenths, then the hundredths.",
          placeholder: "Type the greater decimal",
        };
  }

  if (explicitMode === "fraction_decimal_match") {
    const allowedPairs =
      Array.isArray(config.allowedPairs) &&
      config.allowedPairs.every(
        (pair) => Array.isArray(pair) && pair.length === 2 && pair.every((value) => typeof value === "string")
      )
        ? (config.allowedPairs as [string, string][])
        : ([
            ["1/10", "0.1"],
            ["2/10", "0.2"],
            ["3/10", "0.3"],
            ["4/10", "0.4"],
            ["5/10", "0.5"],
            ["6/10", "0.6"],
            ["7/10", "0.7"],
            ["8/10", "0.8"],
            ["9/10", "0.9"],
          ] as [string, string][]);

    const chosen = allowedPairs[randInt(0, allowedPairs.length - 1)] ?? allowedPairs[0] ?? ["1/10", "0.1"];
    const [fraction, decimal] = chosen;
    const numerator = Number(fraction.split("/")[0] ?? 1);
    const denominator = Number(fraction.split("/")[1] ?? 10);
    const visual: DecimalVisualData = {
      type: "decimal_model",
      model: "tenths_bar",
      numerator,
      denominator: 10,
    };
    const distractors = shuffle(
      allowedPairs
        .map((pair) => pair[1])
        .filter((value) => value !== decimal)
    ).slice(0, 3);

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which decimal matches ${fraction}?`,
          options: shuffle([decimal, ...distractors]),
          answer: decimal,
          helper: "Tenths can be written as decimals.",
          visual,
        }
      : {
          kind: "typed_response",
          prompt: `Write the decimal that matches ${fraction}.`,
          answer: decimal,
          helper: "Use the tenths model to help you connect the fraction to the decimal.",
          placeholder: "Type the decimal",
          visual,
      };
  }

  if (explicitMode === "skip_count_fraction") {
    const denominators =
      Array.isArray(config.denominators) && config.denominators.every((value) => typeof value === "number")
        ? (config.denominators as number[])
        : [2, 3, 4, 5, 6, 8];
    const denominator = denominators[randInt(0, denominators.length - 1)] ?? denominators[0] ?? 4;
    const missingIndex = Math.max(2, Math.min(denominator - 1, randInt(2, denominator - 1)));
    const sequenceLength = Math.min(5, denominator);
    const sequence = Array.from({ length: sequenceLength }, (_, index) => {
      const stepIndex = index + 1;
      if (stepIndex === missingIndex) return "__";
      return stepIndex === denominator ? "1" : `${stepIndex}/${denominator}`;
    });
    const missingLabel = missingIndex === denominator ? "1" : `${missingIndex}/${denominator}`;
    const askMissing = randInt(0, 1) === 0;
    const nextStep = randInt(2, denominator);
    const nextAnswer = `${nextStep}/${denominator}`;
    const nextSequence = Array.from({ length: nextStep - 1 }, (_, index) => {
      const stepIndex = index + 1;
      return stepIndex === denominator ? "1" : `${stepIndex}/${denominator}`;
    });
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Fill the missing fraction when you count by 1/${denominator}: ${sequence.join(", ")}`,
          options: uniqueStringOptions(missingLabel, [
            `${Math.max(1, missingIndex - 1)}/${denominator}`,
            `${Math.min(denominator - 1, missingIndex + 1)}/${denominator}`,
            nextAnswer,
            "1",
          ]),
          answer: missingLabel,
          helper: `Keep adding another 1/${denominator} each time.`,
        }
      : {
          kind: "typed_response",
          prompt: askMissing
            ? `Fill the missing fraction when counting by 1/${denominator}: ${sequence.join(", ")}`
            : `What comes next when you count by 1/${denominator}? ${nextSequence.join(", ")}, __`,
          answer: askMissing ? missingLabel : nextAnswer,
          helper: `Fractions with the same denominator count in equal steps.`,
          placeholder: "Type the fraction",
          fixedDenominator: denominator,
        };
  }

  if (explicitMode === "mixed_numerals") {
    const denominators =
      Array.isArray(config.denominators) && config.denominators.every((value) => typeof value === "number")
        ? (config.denominators as number[])
        : [2, 3, 4, 5, 6, 8];
    const denominator = denominators[randInt(0, denominators.length - 1)] ?? denominators[0] ?? 2;
    const whole = randInt(1, 2);
    const numerator = randInt(1, denominator - 1);
    const mixed = mixedNumeralLabel(whole, numerator, denominator);
    const improper = `${whole * denominator + numerator}/${denominator}`;

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which mixed numeral matches ${improper}?`,
          options: uniqueStringOptions(mixed, [
            mixedNumeralLabel(whole, Math.max(1, numerator - 1), denominator),
            mixedNumeralLabel(whole + 1, numerator, denominator),
            mixedNumeralLabel(Math.max(0, whole - 1), numerator, denominator),
            `${whole + numerator}/${denominator}`,
          ]),
          answer: mixed,
          helper: "Work out the whole number first, then the extra fraction part.",
        }
      : {
          kind: "typed_response",
          prompt: `Write ${improper} as a mixed numeral.`,
          answer: mixed,
          helper: "Think about how many whole groups fit, then what fraction is left.",
          placeholder: "Type the mixed numeral",
        };
  }

  if (explicitMode === "same_denominator_combine") {
    const denominators =
      Array.isArray(config.denominators) && config.denominators.every((value) => typeof value === "number")
        ? (config.denominators as number[])
        : [2, 3, 4, 5, 6, 8];
    const denominator = denominators[randInt(0, denominators.length - 1)] ?? denominators[0] ?? 4;
    const count = randInt(2, Math.min(denominator, 4));
    const answer = `${count}/${denominator}`;
    const expression = Array.from({ length: count }, () => `1/${denominator}`).join(" + ");

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `${expression} = ?`,
          options: uniqueStringOptions(answer, [
            `${Math.max(1, count - 1)}/${denominator}`,
            `${Math.min(denominator - 1, count + 1)}/${denominator}`,
            `${count}/${Math.max(denominator + 1, 2)}`,
            "1",
          ]),
          answer,
          helper: "Keep the denominator the same and count the unit fractions.",
        }
      : {
          kind: "typed_response",
          prompt: `Combine the fractions: ${expression}`,
          answer,
          helper: "Count how many equal parts you have altogether.",
          placeholder: "Type the total fraction",
          fixedDenominator: denominator,
        };
  }

  if (explicitMode === "read_write_rename_decimals") {
    function decimalFromParts(parts: {
      ones: number;
      tenths: number;
      hundredths: number;
      thousandths: number;
    }, decimals?: 0 | 1 | 2 | 3): string {
      const value =
        parts.ones +
        parts.tenths / 10 +
        parts.hundredths / 100 +
        parts.thousandths / 1000;

      if (decimals === undefined) {
        return value.toFixed(3).replace(/\.?0+$/, "");
      }

      return value.toFixed(decimals);
    }

    function buildVisualRenameDistractors(answer: string, parts: {
      ones: number;
      tenths: number;
      hundredths: number;
      thousandths: number;
    }): string[] {
      const swapHundredthsThousandths = decimalFromParts({
        ...parts,
        hundredths: parts.thousandths,
        thousandths: parts.hundredths,
      });
      const shiftTenths = decimalFromParts({
        ones: parts.ones,
        tenths: 0,
        hundredths: parts.tenths,
        thousandths: parts.hundredths,
      });
      const mergedWhole = `${parts.ones}${parts.tenths}.${parts.hundredths}${parts.thousandths}`.replace(/\.?0+$/, "");
      const paddedWrong = decimalFromParts(parts, 2);

      return Array.from(
        new Set([swapHundredthsThousandths, shiftTenths, mergedWhole, paddedWrong].filter((value) => value !== answer))
      );
    }

    const templates = [
      { ones: 2, tenths: 3, hundredths: 0, thousandths: 0, renameTo: 3 as const },
      { ones: 0, tenths: 8, hundredths: 0, thousandths: 0, renameTo: 3 as const },
      { ones: 2, tenths: 3, hundredths: 5, thousandths: 0, renameTo: 3 as const },
      { ones: 2, tenths: 3, hundredths: 3, thousandths: 6, renameTo: 3 as const },
      { ones: 4, tenths: 2, hundredths: 0, thousandths: 4, renameTo: 3 as const },
    ];

    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    const baseText = decimalFromParts(chosen);
    const renamedText = decimalFromParts(chosen, chosen.renameTo);
    const visual: DecimalVisualData = {
      type: "decimal_model",
      model: "place_value_chart",
      ones: chosen.ones,
      tenths: chosen.tenths,
      hundredths: chosen.hundredths,
      thousandths: chosen.thousandths,
    };

    if (asMultipleChoice) {
      const answer = randInt(0, 1) === 0 ? baseText : renamedText;
      const prompt =
        answer === baseText
          ? "What decimal is shown on the place value chart?"
          : `The chart shows ${baseText}. Which decimal is another way to write the same value?`;

      return {
        kind: "multiple_choice",
        prompt,
        options: uniqueStringOptions(answer, buildVisualRenameDistractors(answer, chosen)),
        answer,
        helper:
          answer === baseText
            ? "Read the ones, tenths, hundredths, and thousandths columns."
            : "Adding zeros to the right of a decimal does not change its value.",
        visual,
      };
    }

    const renameQuestion = randInt(0, 1) === 0;
    return renameQuestion
      ? {
          kind: "typed_response",
          prompt: `The place value chart shows ${baseText}. Write the same value to thousandths.`,
          answer: renamedText,
          helper: "Rename the decimal without changing its value.",
          placeholder: "Type the renamed decimal",
          visual,
        }
      : {
          kind: "typed_response",
          prompt: "What decimal is shown on the place value chart?",
          answer: baseText,
          helper: "Read the ones, tenths, hundredths, and thousandths columns.",
          placeholder: "Type the decimal shown",
          visual,
        };
  }

  if (explicitMode === "decimals_between_benchmarks") {
    const value = level >= 5 ? randomStepValue(0.001, 5.999, 0.001) : randomStepValue(0.01, 1.99, 0.01);
    const lower = Math.floor(value * 10) / 10;
    const upper = Number((lower + 0.1).toFixed(1));
    const answer = `${formatMathNumber(lower)} and ${formatMathNumber(upper)}`;
    return {
      kind: "multiple_choice",
      prompt: `Between which two tenths does ${formatMathNumber(value)} belong?`,
      options: shuffle(
        Array.from(
          new Set([
            answer,
            `${formatMathNumber(Math.max(0, lower - 0.1))} and ${formatMathNumber(lower)}`,
            `${formatMathNumber(upper)} and ${formatMathNumber(Number((upper + 0.1).toFixed(1)))}`,
            `${formatMathNumber(Math.floor(value))} and ${formatMathNumber(Math.ceil(value))}`,
          ])
        ).slice(0, 4)
      ),
      answer,
      helper: "Use the tenths just before and just after the decimal.",
    };
  }

  if (explicitMode === "decimal_context") {
    const templates = [
      {
        prompt: "A ribbon is 1.25 m long. Another ribbon is 1.2 m long. Which is longer?",
        answer: "1.25 m",
        options: ["1.25 m", "1.2 m", "They are equal", "Not enough information"],
      },
      {
        prompt: "A book costs $4.75 and a pen costs $2.40. What is the total cost?",
        answer: "7.15",
      },
      {
        prompt: "Which is greater: 2.5 L or 2.45 L?",
        answer: "2.5 L",
        options: ["2.5 L", "2.45 L", "They are equal", "Cannot compare"],
      },
      {
        prompt: "A student ran 3.6 km on Monday and 2.4 km on Tuesday. How far did they run altogether?",
        answer: "6.0",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && chosen.options
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle(chosen.options),
          answer: chosen.answer,
          helper: "Compare or combine the decimals carefully.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Line up the decimal places.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "decimal_rounding_estimation") {
    const value = randomStepValue(0.11, 9.99, 0.01);
    const roundToTenths = randInt(0, 1) === 0;
    const answerNumber = roundToTenths ? Number(value.toFixed(1)) : Number(value.toFixed(2));
    const answer = formatMathNumber(answerNumber);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Round ${formatMathNumber(value)} to the nearest ${roundToTenths ? "tenth" : "hundredth"}.`,
          options: shuffle(
            Array.from(
              new Set([
                answer,
                formatMathNumber(Number((answerNumber + (roundToTenths ? 0.1 : 0.01)).toFixed(roundToTenths ? 1 : 2))),
                formatMathNumber(Number((Math.max(0, answerNumber - (roundToTenths ? 0.1 : 0.01))).toFixed(roundToTenths ? 1 : 2))),
                formatMathNumber(value),
              ])
            ).slice(0, 4)
          ),
          answer,
          helper: "Look at the digit to the right of the place you are rounding to.",
        }
      : {
          kind: "typed_response",
          prompt: `Round ${formatMathNumber(value)} to the nearest ${roundToTenths ? "tenth" : "hundredth"}.`,
          answer,
          helper: "Check the next decimal place to decide whether to round up.",
          placeholder: "Type the rounded decimal",
        };
  }

  if (explicitMode === "decimal_reasonableness") {
    const templates = [
      {
        prompt: "Ella says 3.48 rounded to the nearest tenth is 3.4. Is she correct?",
        answer: "No",
      },
      {
        prompt: "Noah says 5.04 is greater than 5.4 because 04 is bigger than 4. Is he correct?",
        answer: "No",
      },
      {
        prompt: "A total of 2.6 + 0.4 is 3.0. Does that make sense?",
        answer: "Yes",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: ["Yes", "No", "Maybe", "Not sure"],
          answer: chosen.answer,
          helper: "Check whether the decimal places and size make sense.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Decide whether the statement is reasonable.",
          placeholder: "Type Yes or No",
        };
  }

  if (explicitMode === "factors_multiples") {
    const templates = [
      { prompt: "Which number is a factor of 24?", answer: "6", options: ["6", "7", "9", "11"] },
      { prompt: "Which number is a multiple of 8?", answer: "32", options: ["30", "32", "34", "36"] },
      { prompt: "Type the next multiple of 7 after 28.", answer: "35" },
      { prompt: "Type one factor of 36 greater than 5.", answer: "6" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && chosen.options
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle(chosen.options),
          answer: chosen.answer,
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          placeholder: "Type the number",
        };
  }

  if (explicitMode === "divisibility_rules") {
    const templates = [
      { prompt: "Is 135 divisible by 5?", answer: "Yes" },
      { prompt: "Is 246 divisible by 2?", answer: "Yes" },
      { prompt: "Is 128 divisible by 3?", answer: "No" },
      { prompt: "Type the divisor that makes this true: 420 is divisible by __ and ends in 0.", answer: "10" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && chosen.answer !== "10"
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: ["Yes", "No", "Sometimes", "Not sure"],
          answer: chosen.answer,
          helper: "Use the divisibility rule, not long division.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Think about the last digit or the digit sum.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "prime_composite_hcf") {
    const templates = [
      { prompt: "Is 17 prime or composite?", answer: "Prime", options: ["Prime", "Composite", "Both", "Neither"] },
      { prompt: "Is 21 prime or composite?", answer: "Composite", options: ["Prime", "Composite", "Both", "Neither"] },
      { prompt: "What is the highest common factor of 12 and 18?", answer: "6" },
      { prompt: "What is the highest common factor of 20 and 30?", answer: "10" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && chosen.options
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle(chosen.options),
          answer: chosen.answer,
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "factor_multiple_algorithm") {
    const templates = [
      {
        prompt: "A rule says if a number ends in 0, it is divisible by 10. Is 420 divisible by 10?",
        answer: "Yes",
        options: ["Yes", "No", "Sometimes", "Not sure"],
      },
      {
        prompt: "A divisibility flowchart checks the last digit. Is 135 divisible by 5?",
        answer: "Yes",
        options: ["Yes", "No", "Sometimes", "Not sure"],
      },
      {
        prompt: "Use a factor rule: 6 is a factor of which number?",
        answer: "24",
        options: ["22", "23", "24", "25"],
      },
      {
        prompt: "Use the divisibility rule for 3. Is 89472 divisible by 3?",
        answer: "Yes",
        options: ["Yes", "No", "Cannot tell", "Only if it is even"],
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle(chosen.options),
          answer: chosen.answer,
          helper: "Follow the factor or divisibility rule step by step.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Use a factor, multiple, or divisibility rule.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "factor_multiple_pattern") {
    const templates = [
      {
        prompt: "Look at the multiples of 6: 6, 12, 18, 24, __. What comes next?",
        answer: "30",
      },
      {
        prompt: "Which number is a common multiple of 3 and 4?",
        answer: "12",
        options: ["10", "12", "14", "16"],
      },
      {
        prompt: "Complete the pattern of multiples of 7: 7, 14, 21, __, 35",
        answer: "28",
      },
      {
        prompt: "Which pair shows one number as a factor of the other?",
        answer: "5 and 20",
        options: ["5 and 20", "6 and 25", "7 and 20", "9 and 25"],
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && chosen.options
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle(chosen.options),
          answer: chosen.answer,
          helper: "Look for the emerging factor or multiple pattern.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "pattern_sequence") {
    const multiplicative = randInt(0, 1) === 0;
    if (multiplicative) {
      const start = randInt(2, 6);
      const factor = [2, 3, 4][randInt(0, 2)] ?? 2;
      const sequence = [start, start * factor, start * factor * factor];
      const answer = String(sequence[2]! * factor);
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: `What comes next? ${sequence.join(", ")}, __`,
            options: uniqueNumberOptions(Number(answer), Number(answer)),
            answer,
            helper: "Look for a multiplicative pattern.",
          }
        : {
            kind: "typed_response",
            prompt: `What comes next? ${sequence.join(", ")}, __`,
            answer,
            helper: "Look for the rule between each pair of numbers.",
            placeholder: "Type the next number",
          };
    }
    const start = randInt(5, 20);
    const step = [4, 6, 9, 12][randInt(0, 3)] ?? 4;
    const sequence = [start, start + step, start + step * 2];
    const answer = String(sequence[2]! + step);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `What comes next? ${sequence.join(", ")}, __`,
          options: uniqueNumberOptions(Number(answer), step * 2),
          answer,
          helper: "Look for an additive pattern.",
        }
      : {
          kind: "typed_response",
          prompt: `What comes next? ${sequence.join(", ")}, __`,
          answer,
          helper: "Find the amount added each time.",
          placeholder: "Type the next number",
        };
  }

  if (explicitMode === "input_output_rules") {
    const ruleType = randInt(0, 1) === 0 ? "add" : "multiply";
    const input = randInt(2, 12);
    const ruleValue = ruleType === "add" ? randInt(3, 9) : randInt(2, 5);
    const output = ruleType === "add" ? input + ruleValue : input * ruleValue;
    const ruleText = ruleType === "add" ? `add ${ruleValue}` : `multiply by ${ruleValue}`;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Input ${input} becomes output ${output}. Which rule matches?`,
          options: shuffle([
            ruleText,
            ruleType === "add" ? `multiply by ${ruleValue}` : `add ${ruleValue}`,
            `add ${ruleValue + 1}`,
            `multiply by ${Math.max(2, ruleValue + 1)}`,
          ]),
          answer: ruleText,
        }
      : {
          kind: "typed_response",
          prompt: `A machine ${ruleText}. What is the output for ${input}?`,
          answer: String(output),
          placeholder: "Type the output",
        };
  }

  if (explicitMode === "pattern_investigation") {
    const start = randInt(2, 15);
    const step = [3, 4, 6, 8][randInt(0, 3)] ?? 3;
    const sequence = [start, start + step, start + step * 2];
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which rule matches this pattern: ${sequence.join(", ")}, ... ?`,
          options: shuffle([`add ${step}`, `add ${step + 1}`, `multiply by 2`, `subtract ${step}`]),
          answer: `add ${step}`,
        }
      : {
          kind: "typed_response",
          prompt: `The pattern is ${sequence.join(", ")}, ... Type the next term.`,
          answer: String(sequence[2]! + step),
          placeholder: "Type the next term",
        };
  }

  if (explicitMode === "multiplication_estimation_check") {
    const a = randInt(18, 89);
    const b = randInt(3, 28);
    const estimate = Math.round(a / 10) * 10 * Math.round(b / 10);
    const reasonable = estimate + randInt(-30, 30);
    const unreasonable = estimate * 10;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which answer is most reasonable for ${a} × ${b}?`,
          options: shuffle([
            String(Math.max(1, reasonable)),
            String(Math.max(1, unreasonable)),
            String(Math.max(1, estimate + 200)),
            String(Math.max(1, Math.floor(estimate / 10))),
          ]),
          answer: String(Math.max(1, reasonable)),
          helper: "Round first, then decide which option is closest to the estimate.",
        }
      : {
          kind: "typed_response",
          prompt: `Estimate ${a} × ${b} by rounding first.`,
          answer: String(Math.max(1, estimate)),
          helper: "Round the numbers to friendly values first.",
          placeholder: "Type an estimate",
        };
  }

  if (explicitMode === "division_remainders") {
    const divisor = [3, 4, 5, 6, 7, 8][randInt(0, 5)] ?? 4;
    const quotient = randInt(3, 12);
    const remainder = randInt(1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `What is ${dividend} ÷ ${divisor}?`,
          options: shuffle([
            `${quotient} r ${remainder}`,
            `${quotient + 1} r ${remainder}`,
            `${quotient} r ${Math.max(0, remainder - 1)}`,
            `${quotient - 1} r ${remainder}`,
          ]),
          answer: `${quotient} r ${remainder}`,
        }
      : {
          kind: "typed_response",
          prompt: `What is the remainder when ${dividend} ÷ ${divisor}?`,
          answer: String(remainder),
          helper: "Find what is left after making equal groups.",
          placeholder: "Type the remainder",
        };
  }

  if (explicitMode === "interpreting_remainders") {
    const templates = [
      { prompt: "24 students travel in cars that seat 5. How many cars are needed?", answer: "5" },
      { prompt: "27 cupcakes are packed into boxes of 6. How many full boxes can be packed?", answer: "4" },
      { prompt: "35 players are put into teams of 8. How many teams are needed?", answer: "5" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: uniqueNumberOptions(Number(chosen.answer), 3),
          answer: chosen.answer,
          helper: "Think about whether the remainder means one more group is needed.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Decide whether to round up or use only full groups.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "division_estimate_check") {
    const divisor = [4, 5, 6, 8, 10][randInt(0, 4)] ?? 5;
    const quotient = randInt(8, 30);
    const dividend = quotient * divisor + randInt(0, divisor - 1);
    const estimate = Math.round(dividend / divisor);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which answer is most reasonable for ${dividend} ÷ ${divisor}?`,
          options: shuffle([
            String(estimate),
            String(estimate + divisor),
            String(Math.max(1, estimate - divisor)),
            String(dividend),
          ]),
          answer: String(estimate),
          helper: "Use compatible numbers to estimate the quotient.",
        }
      : {
          kind: "typed_response",
          prompt: `Estimate ${dividend} ÷ ${divisor}.`,
          answer: String(estimate),
          placeholder: "Type an estimate",
        };
  }

  if (explicitMode === "related_denominator_fractions") {
    const templates = [
      { prompt: "Add the fractions: 1/2 + 1/4", answer: "3/4", fixedDenominator: 4 },
      { prompt: "Add the fractions: 1/3 + 1/6", answer: "3/6", fixedDenominator: 6 },
      { prompt: "Add the fractions: 3/4 + 1/4", answer: "4/4", fixedDenominator: 4 },
      { prompt: "Subtract the fractions: 3/4 - 1/4", answer: "2/4", fixedDenominator: 4 },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: uniqueStringOptions(chosen.answer, [
            `1/${chosen.fixedDenominator}`,
            `${Math.max(1, Number(chosen.answer.split("/")[0]) - 1)}/${chosen.fixedDenominator}`,
            `${Math.min(chosen.fixedDenominator, Number(chosen.answer.split("/")[0]) + 1)}/${chosen.fixedDenominator}`,
            "1",
          ]),
          answer: chosen.answer,
          helper: "Rename one fraction so the denominators match first.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          fixedDenominator: chosen.fixedDenominator,
          helper: "Use a common denominator, then combine the numerators.",
          placeholder: "Type the fraction",
        };
  }

  if (explicitMode === "fraction_word_problems") {
    const templates = [
      { prompt: "Lina walked 1/4 km in the morning and 2/4 km in the afternoon. How far did she walk altogether?", answer: "3/4", fixedDenominator: 4 },
      { prompt: "A pizza had 5/8 left. Then 2/8 was eaten. How much is left now?", answer: "3/8", fixedDenominator: 8 },
      { prompt: "A tank was filled by 1/3 and then another 1/3. How full is it now?", answer: "2/3", fixedDenominator: 3 },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: uniqueStringOptions(chosen.answer, ["1/2", "1", `1/${chosen.fixedDenominator}`]),
          answer: chosen.answer,
          helper: "Only the numerators change when the denominator stays the same.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          fixedDenominator: chosen.fixedDenominator,
          placeholder: "Type the fraction",
        };
  }

  if (explicitMode === "fraction_decimal_percent") {
    const templates = [
      { prompt: "What percent matches 1/2?", answer: "50%" },
      { prompt: "What decimal matches 25%?", answer: "0.25" },
      { prompt: "What fraction matches 0.75?", answer: "3/4", fixedDenominator: 4 },
      { prompt: "What percent matches 0.1?", answer: "10%" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: uniqueStringOptions(chosen.answer, ["25%", "0.5", "1/4", "75%"]),
          answer: chosen.answer,
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          fixedDenominator: chosen.fixedDenominator,
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "benchmark_fraction_percent") {
    const templates = [
      { prompt: "Which value is the same as one half?", answer: "50%", options: ["50%", "25%", "0.25", "75%"] },
      { prompt: "Which value is the same as one quarter?", answer: "0.25", options: ["0.25", "0.5", "25", "3/4"] },
      { prompt: "Which value is the same as three quarters?", answer: "75%", options: ["75%", "50%", "0.25", "25%"] },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle(chosen.options),
          answer: chosen.answer,
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          placeholder: "Type the matching value",
        };
  }

  if (explicitMode === "compare_fraction_decimal_percent") {
    const templates = [
      { prompt: "Which is largest: 1/2, 0.4, or 35%?", answer: "1/2", options: ["1/2", "0.4", "35%", "They are equal"] },
      { prompt: "Which is smallest: 0.75, 3/4, or 70%?", answer: "70%", options: ["0.75", "3/4", "70%", "They are equal"] },
      { prompt: "Type the largest value: 25%, 0.3, 1/4.", answer: "0.3" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && chosen.options
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle(chosen.options),
          answer: chosen.answer,
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          placeholder: "Type the value",
        };
  }

  if (explicitMode === "percent_of_amount") {
    const templates = [
      { prompt: "What is 10% of 240?", answer: "24" },
      { prompt: "What is 5% of 60?", answer: "3" },
      { prompt: "What is 1% of 300?", answer: "3" },
      { prompt: "What is 10% of 85?", answer: "8.5" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: uniqueStringOptions(chosen.answer, ["6", "12", "30", "2.4"]),
          answer: chosen.answer,
          helper: "Use 10%, 5%, or 1% as a friendly fraction of the whole.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Find 10%, 5%, or 1% first if that helps.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "percentage_discount") {
    const templates = [
      { prompt: "A $40 item has a 25% discount. What is the sale price?", answer: "30" },
      { prompt: "A $60 item is reduced by 10%. How much is the discount?", answer: "6" },
      { prompt: "A $80 item has a 50% discount. What is the sale price?", answer: "40" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: uniqueStringOptions(chosen.answer, ["4", "8", "20", "50"]),
          answer: chosen.answer,
          helper: "Work out the percentage amount first, then subtract if needed.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "percent_multistep") {
    const templates = [
      { prompt: "A $50 jumper has 20% off. Then $5 shipping is added. What is the final cost?", answer: "45" },
      { prompt: "A class has 40 students. 25% are absent. How many students are at school?", answer: "30" },
      { prompt: "A $120 bike is reduced by 10%. How much do you pay?", answer: "108" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: uniqueNumberOptions(Number(chosen.answer), 12),
          answer: chosen.answer,
          helper: "Find the percentage first, then complete the second step.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "strategy_selection") {
    const templates = [
      {
        prompt: "Which strategy is best for 199 + 38?",
        answer: "Compensation",
        options: ["Compensation", "Repeated subtraction", "Long division", "Guess and check"],
      },
      {
        prompt: "Which method is most efficient for 48 × 25?",
        answer: "Use a friendly factor strategy",
        options: ["Use a friendly factor strategy", "Count by ones", "Repeated subtraction", "Draw a tally"],
      },
      {
        prompt: "Type the best operation to start with: A tray holds 8 muffins. There are 6 trays. How many muffins altogether?",
        answer: "×",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && chosen.options
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle(chosen.options),
          answer: chosen.answer,
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          placeholder: "Type the operation",
        };
  }

  if (explicitMode === "problem_reasonableness") {
    const templates = [
      { prompt: "A student says 398 + 204 = 9,602. Does that make sense?", answer: "No" },
      { prompt: "A student estimates 51 × 19 is about 1,000. Is that reasonable?", answer: "Yes" },
      { prompt: "A student says 84 ÷ 4 is about 200. Does that make sense?", answer: "No" },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: ["Yes", "No", "Maybe", "Not sure"],
          answer: chosen.answer,
          helper: "Estimate mentally first, then decide whether the result fits.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          placeholder: "Type Yes or No",
        };
  }

  if (explicitMode === "compare_symbols") {
    const minValue = typeof config.min === "number" ? config.min : 1000;
    const maxValue = typeof config.max === "number" ? config.max : 999999;
    let left = randInt(minValue, maxValue);
    let right = randInt(minValue, maxValue);

    if (randInt(0, 4) === 0) {
      right = left;
    } else {
      while (right === left) {
        right = randInt(minValue, maxValue);
      }
    }

    const answer = left === right ? "=" : left > right ? ">" : "<";
    const leftText = formatMathNumber(left);
    const rightText = formatMathNumber(right);

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which symbol makes this true: ${leftText} ___ ${rightText}?`,
          options: shuffle(["<", ">", "="]),
          answer,
          helper: "Compare the digits from left to right.",
        }
      : {
          kind: "typed_response",
          prompt: `Type <, >, or = between ${leftText} and ${rightText}.`,
          answer,
          helper: "Compare the digits from left to right.",
          placeholder: "Type <, >, or =",
        };
  }

  if (explicitMode === "multiply_by_powers_recall" || explicitMode === "multiply_by_10_recall") {
    const factor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 10;
    const maxBase = factor === 10 ? 999 : factor === 100 ? 99 : 9;
    const base = randInt(2, maxBase);
    const answer = String(base * factor);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `What is ${formatMathNumber(base)} × ${factor}?`,
          options: uniqueNumberOptions(base * factor, Math.max(20, factor)),
          answer,
          helper: `Think about every digit shifting ${String(factor).length - 1} place${factor === 10 ? "" : "s"} left.`,
        }
      : {
          kind: "typed_response",
          prompt: `${formatMathNumber(base)} × ${factor} = ?`,
          answer,
          helper: `Think about every digit shifting ${String(factor).length - 1} place${factor === 10 ? "" : "s"} left.`,
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "multiply_by_powers_shift" || explicitMode === "multiply_by_10_shift") {
    const factor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 10;
    const maxBase = factor === 10 ? 999 : factor === 100 ? 99 : 9;
    const base = randInt(2, maxBase);
    const shifted = base * factor;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `After multiplying by ${factor}, ${formatMathNumber(base)} becomes which number?`,
          options: shuffle([
            formatMathNumber(shifted),
            formatMathNumber(base * factor * 10),
            formatMathNumber(base + factor),
            formatMathNumber(base),
          ]),
          answer: formatMathNumber(shifted),
          helper: `Multiplying by ${factor} moves every digit ${String(factor).length - 1} place${factor === 10 ? "" : "s"} to the left.`,
        }
      : {
          kind: "typed_response",
          prompt: `${formatMathNumber(base)} → ? after ×${factor}`,
          answer: formatMathNumber(shifted),
          helper: `Multiplying by ${factor} moves every digit ${String(factor).length - 1} place${factor === 10 ? "" : "s"} to the left.`,
          placeholder: "Type the new number",
        };
  }

  if (explicitMode === "multiply_by_powers_error" || explicitMode === "multiply_by_10_error") {
    const factor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 10;
    const maxBase = factor === 10 ? 999 : factor === 100 ? 99 : 9;
    const base = randInt(2, maxBase);
    const correct = randInt(0, 1) === 0;
    const shown = correct ? base * factor : base * factor * 10;
    return {
      kind: "multiple_choice",
      prompt: `${formatMathNumber(base)} × ${factor} = ${formatMathNumber(shown)}`,
      options: ["Correct", "Incorrect"],
      answer: correct ? "Correct" : "Incorrect",
      helper: `Check whether the digits have shifted ${String(factor).length - 1} place${factor === 10 ? "" : "s"}, not too far.`,
    };
  }

  if (explicitMode === "multiply_by_powers_missing") {
    const factor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 10;
    const maxBase = factor === 10 ? 999 : factor === 100 ? 99 : 9;
    const base = randInt(2, maxBase);
    const product = base * factor;
    const missingOnLeft = randInt(0, 1) === 0;
    return {
      kind: "typed_response",
      prompt: missingOnLeft
        ? `___ × ${factor} = ${formatMathNumber(product)}`
        : `${formatMathNumber(base)} × ${factor} = ___`,
      answer: formatMathNumber(missingOnLeft ? base : product),
      helper: `Use the place value shift for ×${factor}.`,
      placeholder: "Type the missing number",
    };
  }

  if (explicitMode === "divide_by_powers_recall" || explicitMode === "divide_by_10_recall") {
    const factor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 10;
    const answerValue = randInt(2, 999);
    const dividend = answerValue * factor;
    const answer = String(answerValue);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `What is ${formatMathNumber(dividend)} ÷ ${factor}?`,
          options: uniqueNumberOptions(answerValue, Math.max(20, Math.floor(dividend / 5))),
          answer,
          helper: `Think about every digit shifting ${String(factor).length - 1} place${factor === 10 ? "" : "s"} right.`,
        }
      : {
          kind: "typed_response",
          prompt: `${formatMathNumber(dividend)} ÷ ${factor} = ?`,
          answer,
          helper: `Think about every digit shifting ${String(factor).length - 1} place${factor === 10 ? "" : "s"} right.`,
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "divide_by_powers_shift" || explicitMode === "divide_by_10_shift") {
    const factor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 10;
    const answerValue = randInt(2, 999);
    const dividend = answerValue * factor;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `After dividing by ${factor}, ${formatMathNumber(dividend)} becomes which number?`,
          options: shuffle([
            formatMathNumber(answerValue),
            formatMathNumber(dividend),
            formatMathNumber(Math.max(1, Math.floor(answerValue / factor))),
            formatMathNumber(answerValue * factor),
          ]),
          answer: formatMathNumber(answerValue),
          helper: `Dividing by ${factor} moves every digit ${String(factor).length - 1} place${factor === 10 ? "" : "s"} to the right.`,
        }
      : {
          kind: "typed_response",
          prompt: `${formatMathNumber(dividend)} → ? after ÷${factor}`,
          answer: formatMathNumber(answerValue),
          helper: `Dividing by ${factor} moves every digit ${String(factor).length - 1} place${factor === 10 ? "" : "s"} to the right.`,
          placeholder: "Type the new number",
        };
  }

  if (explicitMode === "divide_by_powers_missing" || explicitMode === "divide_by_10_missing") {
    const factor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 10;
    const answerValue = randInt(2, 999);
    const quotient = randInt(0, 1) === 0 ? answerValue : answerValue * factor;
    const dividend = quotient * factor;
    const missingOnLeft = randInt(0, 1) === 0;
    return {
      kind: "typed_response",
      prompt: missingOnLeft
        ? `___ ÷ ${factor} = ${formatMathNumber(quotient)}`
        : `${formatMathNumber(dividend)} ÷ ${factor} = ___`,
      answer: formatMathNumber(missingOnLeft ? dividend : quotient),
      helper: `Use the place value shift for ÷${factor} to find the missing number.`,
      placeholder: "Type the missing number",
    };
  }

  if (explicitMode === "powers_of_ten_mixed") {
    const factor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 10;
    const multiply = randInt(0, 1) === 0;
    const base = multiply
      ? randInt(2, factor === 10 ? 999 : factor === 100 ? 99 : 9)
      : randInt(2, 999);
    const promptValue = multiply ? base : base * factor;
    const answerValue = multiply ? base * factor : base;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: multiply
            ? `${formatMathNumber(promptValue)} × ${factor} = ?`
            : `${formatMathNumber(promptValue)} ÷ ${factor} = ?`,
          options: uniqueNumberOptions(answerValue, Math.max(factor, 20)),
          answer: String(answerValue),
        }
      : {
          kind: "typed_response",
          prompt: multiply
            ? `${formatMathNumber(promptValue)} × ${factor} = ?`
            : `${formatMathNumber(promptValue)} ÷ ${factor} = ?`,
          answer: formatMathNumber(answerValue),
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "powers_of_ten_compare") {
    const base = randInt(2, 90);
    const leftFactor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 10;
    const rightFactor = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 100;
    const divide = randInt(0, 1) === 0;
    const dividendBase = base * 1000;
    const leftValue = divide ? dividendBase : base;
    const rightValue = divide ? dividendBase : base;
    const leftPrompt = divide
      ? `${formatMathNumber(leftValue)} ÷ ${leftFactor}`
      : `${formatMathNumber(base)} × ${leftFactor}`;
    const rightPrompt = divide
      ? `${formatMathNumber(rightValue)} ÷ ${rightFactor}`
      : `${formatMathNumber(base)} × ${rightFactor}`;
    const leftAnswer = divide ? leftValue / leftFactor : base * leftFactor;
    const rightAnswer = divide ? rightValue / rightFactor : base * rightFactor;
    const answer = leftAnswer > rightAnswer ? leftPrompt : rightAnswer > leftAnswer ? rightPrompt : "They are equal";
    return {
      kind: "multiple_choice",
      prompt: `Which is greater: ${leftPrompt} or ${rightPrompt}?`,
      options: shuffle([leftPrompt, rightPrompt, "They are equal"]),
      answer,
    };
  }

  if (explicitMode === "powers_of_ten_word") {
    const variants = [
      (() => {
        const original = randInt(2, 99) * 10;
        return {
          prompt: `A number becomes ${formatMathNumber(original)} after ×10. What was the number?`,
          answer: formatMathNumber(original / 10),
        };
      })(),
      (() => {
        const total = ([10, 100, 1000] as const)[randInt(0, 2)] ?? 100;
        const base = randInt(2, 90) * total;
        return {
          prompt: `Divide ${formatMathNumber(base)} by ${total}.`,
          answer: formatMathNumber(base / total),
        };
      })(),
    ];
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "typed_response",
      prompt: selected.prompt,
      answer: selected.answer,
      placeholder: "Type the answer",
    };
  }

  if (explicitMode === "column_add_sub_solve") {
    const useAddition = randInt(0, 1) === 0;
    if (useAddition) {
      const difficultyRoll = randInt(0, 99);
      const max = difficultyRoll < 30 ? 999 : 9999;
      const a = randInt(max >= 9999 ? 1200 : 120, max >= 9999 ? 7999 : 699);
      const b = randInt(max >= 9999 ? 1100 : 110, max >= 9999 ? 2899 : 299);
      const answer = a + b;
      return {
        kind: "typed_response",
        prompt: `${formatMathNumber(a)} + ${formatMathNumber(b)} = ?`,
        answer: formatMathNumber(answer),
        placeholder: "Type the answer",
        writtenMethod: buildWrittenMethodLayout("Column Addition", "+", a, b, answer),
      };
    }

    const borrowAcrossZero = randInt(0, 99) < 35;
    let total: number;
    let remove: number;
    if (borrowAcrossZero) {
      const options = [
        [6203, 1875],
        [8000, 3468],
        [7004, 1857],
        [9002, 4765],
      ];
      const picked = options[randInt(0, options.length - 1)] ?? options[0];
      total = picked[0];
      remove = picked[1];
    } else {
      const max = randInt(0, 99) < 35 ? 999 : 9999;
      total = randInt(max >= 9999 ? 3000 : 300, max >= 9999 ? 9000 : 900);
      remove = randInt(max >= 9999 ? 1200 : 120, Math.max(max >= 9999 ? 4500 : 450, total - 100));
    }
    const answer = total - remove;
    return {
      kind: "typed_response",
      prompt: `${formatMathNumber(total)} - ${formatMathNumber(remove)} = ?`,
      answer: formatMathNumber(answer),
      placeholder: "Type the answer",
      writtenMethod: buildWrittenMethodLayout("Column Subtraction", "-", total, remove, answer),
    };
  }

  if (explicitMode === "column_add_sub_missing") {
    const useAddition = randInt(0, 1) === 0;
    if (useAddition) {
      const a = randInt(120, 4999);
      const b = randInt(110, 2999);
      const answer = a + b;
      const digits = String(answer).split("");
      const index = randInt(0, digits.length - 1);
      const missing = digits[index] ?? "0";
      digits[index] = "?";
      return {
        kind: "multiple_choice",
        prompt: `Fill the missing digit: ${formatMathNumber(a)} + ${formatMathNumber(b)} = ${digits.join("")}`,
        options: shuffle([missing, String((Number(missing) + 1) % 10), String((Number(missing) + 2) % 10), String((Number(missing) + 9) % 10)]),
        answer: missing,
        helper: "Use the column method to work out the missing digit.",
      };
    }
    const total = randInt(3000, 9000);
    const remove = randInt(1200, Math.max(1500, total - 200));
    const answer = total - remove;
    const digits = String(answer).split("");
    const index = randInt(0, digits.length - 1);
    const missing = digits[index] ?? "0";
    digits[index] = "?";
    return {
      kind: "multiple_choice",
      prompt: `Fill the missing digit: ${formatMathNumber(total)} - ${formatMathNumber(remove)} = ${digits.join("")}`,
      options: shuffle([missing, String((Number(missing) + 1) % 10), String((Number(missing) + 2) % 10), String((Number(missing) + 9) % 10)]),
      answer: missing,
      helper: "Use the column method to work out the missing digit.",
    };
  }

  if (explicitMode === "column_add_sub_error") {
    const useAddition = randInt(0, 1) === 0;
    if (useAddition) {
      const a = randInt(120, 4999);
      const b = randInt(110, 2999);
      const correctAnswer = a + b;
      const correct = randInt(0, 1) === 0;
      const shown = correct ? correctAnswer : correctAnswer + (randInt(0, 1) === 0 ? 10 : 100);
      return {
        kind: "multiple_choice",
        prompt: `${formatMathNumber(a)} + ${formatMathNumber(b)} = ${formatMathNumber(shown)}`,
        options: ["Correct", "Incorrect"],
        answer: correct ? "Correct" : "Incorrect",
        helper: "Check the regrouping carefully.",
      };
    }
    const total = randInt(3000, 9000);
    const remove = randInt(1200, Math.max(1500, total - 200));
    const correctAnswer = total - remove;
    const correct = randInt(0, 1) === 0;
    const shown = correct ? correctAnswer : Math.max(0, correctAnswer + (randInt(0, 1) === 0 ? 10 : -100));
    return {
      kind: "multiple_choice",
      prompt: `${formatMathNumber(total)} - ${formatMathNumber(remove)} = ${formatMathNumber(shown)}`,
      options: ["Correct", "Incorrect"],
      answer: correct ? "Correct" : "Incorrect",
      helper: "Check the regrouping and borrowing carefully.",
    };
  }

  if (explicitMode === "column_add_sub_mixed") {
    const variants = [
      {
        prompt: `Which sum needs carrying in more than one column?`,
        answer: "3,482 + 1,759",
        options: ["3,482 + 1,759", "4,200 + 1,300", "5,110 + 2,200", "6,400 + 1,500"],
      },
      {
        prompt: `Which subtraction needs borrowing across a zero?`,
        answer: "8,000 - 3,468",
        options: ["8,000 - 3,468", "7,654 - 2,111", "6,542 - 1,230", "9,321 - 4,210"],
      },
    ];
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "multiple_choice",
      prompt: selected.prompt,
      options: selected.options,
      answer: selected.answer,
      helper: "Look for carrying or borrowing before you calculate.",
    };
  }

  if (explicitMode === "column_multiplication_solve") {
    const variants = [
      [23, 4],
      [23, 14],
      [34, 27],
      [18, 16],
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
    const answer = picked[0] * picked[1];
    return {
      kind: "typed_response",
      prompt: `Complete the column multiplication chart for ${formatMathNumber(
        picked[0]
      )} × ${formatMathNumber(picked[1])}.`,
      answer: formatMathNumber(answer),
      helper: "Use column multiplication.",
      placeholder: "Type the answer",
      writtenMethod: buildWrittenMethodLayout("Column Multiplication", "×", picked[0], picked[1], answer),
      visual: {
        type: "column_multiplication",
        topValue: picked[0],
        bottomValue: picked[1],
        showWorkedExample: true,
      },
    };
  }

  if (explicitMode === "column_multiplication_partial") {
    const variants = [
      {
        topValue: 23,
        bottomValue: 4,
      },
      {
        topValue: 18,
        bottomValue: 16,
      },
      {
        topValue: 23,
        bottomValue: 14,
      },
    ] as const;
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "typed_response",
      prompt: `Complete the column multiplication chart for ${formatMathNumber(
        selected.topValue
      )} × ${formatMathNumber(selected.bottomValue)}.`,
      answer: formatMathNumber(selected.topValue * selected.bottomValue),
      helper: "Work out the ones row first, then the tens row.",
      placeholder: "Complete the chart",
      writtenMethod: buildWrittenMethodLayout(
        "Column Multiplication",
        "×",
        selected.topValue,
        selected.bottomValue,
        selected.topValue * selected.bottomValue
      ),
      visual: {
        type: "column_multiplication",
        topValue: selected.topValue,
        bottomValue: selected.bottomValue,
        showWorkedExample: true,
      },
    };
  }

  if (explicitMode === "column_multiplication_missing_row") {
    const variants = [
      {
        prompt: "In 23 × 14, what is the ones row partial product?",
        answer: "92",
        options: ["92", "230", "14", "322"],
      },
      {
        prompt: "In 23 × 14, what is the tens row value before adding?",
        answer: "230",
        options: ["230", "23", "140", "92"],
      },
      {
        prompt: "In 34 × 27, what is the ones row partial product?",
        answer: "238",
        options: ["238", "680", "61", "918"],
      },
    ];
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "multiple_choice",
      prompt: selected.prompt,
      options: selected.options,
      answer: selected.answer,
      helper: "Work out one row at a time using place value.",
    };
  }

  if (explicitMode === "column_multiplication_error") {
    const variants = [
      {
        prompt: "A student says 23 × 14 = 322. Is that correct?",
        answer: "Correct",
        options: ["Correct", "Incorrect"],
      },
      {
        prompt: "A student says 34 × 27 = 818. Is that correct?",
        answer: "Incorrect",
        options: ["Correct", "Incorrect"],
      },
      {
        prompt: "A student says 23 × 4 = 82. Is that correct?",
        answer: "Incorrect",
        options: ["Correct", "Incorrect"],
      },
    ];
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "multiple_choice",
      prompt: selected.prompt,
      options: selected.options,
      answer: selected.answer,
      helper: "Check each partial product and the final total.",
    };
  }

  if (explicitMode === "column_multiplication_step") {
    const variants = [
      {
        prompt: "What is the first multiplication step in 23 × 4?",
        answer: "3 × 4 = 12",
      },
      {
        prompt: "What is the first multiplication step in 34 × 27?",
        answer: "7 × 4 = 28",
      },
      {
        prompt: "What is the tens-row value in 23 × 14?",
        answer: "230",
      },
    ];
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "typed_response",
      prompt: selected.prompt,
      answer: selected.answer,
      helper: "Think about one place-value step at a time.",
      placeholder: "Type the step",
    };
  }

  if (explicitMode === "box_method_partial") {
    const variants = [
      {
        prompt: "Using the box method for 23 × 45, what is 20 × 40?",
        answer: "800",
        options: ["800", "80", "200", "900"],
      },
      {
        prompt: "Using the box method for 12 × 13, what is 10 × 3?",
        answer: "30",
        options: ["30", "13", "3", "120"],
      },
      {
        prompt: "Using the box method for 3 × 24, what is 3 × 20?",
        answer: "60",
        options: ["60", "6", "80", "12"],
      },
    ];
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "multiple_choice",
      prompt: selected.prompt,
      options: selected.options,
      answer: selected.answer,
      helper: "Break each number into tens and ones first.",
    };
  }

  if (explicitMode === "box_method_total") {
    const variants = [
      [3, 24],
      [12, 13],
      [23, 45],
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
    const answer = picked[0] * picked[1];
    return {
      kind: "typed_response",
      prompt: `Use the box method idea to work out ${picked[0]} × ${picked[1]}.`,
      answer: formatMathNumber(answer),
      helper: "Find the partial products, then add them together.",
      placeholder: "Type the total",
      visual: {
        type: "box_method",
        leftValue: picked[0],
        topValue: picked[1],
        showWorkedExample: true,
      },
    };
  }

  if (explicitMode === "box_method_partial_typed") {
    const variants = [
      {
        leftValue: 23,
        topValue: 45,
        prompt: "In the box method for 23 × 45, what is 20 × 40?",
        answer: "800",
      },
      {
        leftValue: 12,
        topValue: 13,
        prompt: "In the box method for 12 × 13, what is 10 × 3?",
        answer: "30",
      },
      {
        leftValue: 3,
        topValue: 24,
        prompt: "In the box method for 3 × 24, what is 3 × 20?",
        answer: "60",
      },
    ] as const;
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "typed_response",
      prompt: selected.prompt,
      answer: selected.answer,
      helper: "Split the numbers into tens and ones, then find one box at a time.",
      placeholder: "Type the box value",
      visual: {
        type: "box_method",
        leftValue: selected.leftValue,
        topValue: selected.topValue,
        showWorkedExample: true,
      },
    };
  }

  if (explicitMode === "box_method_match") {
    const variants = [
      {
        prompt: "Which expression matches the box method for 12 × 13?",
        answer: "(10 × 10) + (10 × 3) + (2 × 10) + (2 × 3)",
        options: [
          "(10 × 10) + (10 × 3) + (2 × 10) + (2 × 3)",
          "(12 × 10) + (12 × 3)",
          "(1 × 10) + (2 × 3)",
          "(10 × 13) + (2 × 13) + (2 × 3)",
        ],
      },
      {
        prompt: "Which multiplication could be broken into 20 + 3 and 40 + 5?",
        answer: "23 × 45",
        options: ["23 × 45", "24 × 35", "32 × 54", "12 × 13"],
      },
    ];
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "multiple_choice",
      prompt: selected.prompt,
      options: selected.options,
      answer: selected.answer,
      helper: "Match the tens and ones parts to the numbers.",
    };
  }

  if (explicitMode === "box_method_compare") {
    const variants = [
      {
        prompt: "Which statement is true?",
        answer: "The box method and column method give the same answer.",
        options: [
          "The box method and column method give the same answer.",
          "The box method only works for one-digit multiplication.",
          "The column method always gives a different answer.",
          "The box method ignores place value.",
        ],
      },
      {
        prompt: "Why can the box method help with 23 × 45?",
        answer: "It breaks the numbers into tens and ones.",
        options: [
          "It breaks the numbers into tens and ones.",
          "It removes the need to multiply.",
          "It changes 23 × 45 into addition only.",
          "It works without place value.",
        ],
      },
    ];
    const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "multiple_choice",
      prompt: selected.prompt,
      options: selected.options,
      answer: selected.answer,
      helper: "Both methods work because they use the same place-value parts.",
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
    if (explicitMode === "decimal_order") {
      const count = typeof config.count === "number" ? config.count : 4;
      const ascending = config.ascending !== false;
      const values = new Set<number>();
      while (values.size < count) {
        values.add(randomStepValue(0.1, 9.99, randInt(0, 1) === 0 ? 0.1 : 0.01));
      }
      const ordered = [...values].sort((a, b) => (ascending ? a - b : b - a));
      const prompt = ascending
        ? `Type the smallest decimal from this set: ${[...values].map(formatMathNumber).join(", ")}.`
        : `Type the largest decimal from this set: ${[...values].map(formatMathNumber).join(", ")}.`;
      const answer = formatMathNumber(ordered[0]);
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: ascending
              ? `Which decimal is the smallest: ${[...values].map(formatMathNumber).join(", ")}?`
              : `Which decimal is the largest: ${[...values].map(formatMathNumber).join(", ")}?`,
            options: shuffle([...values].map(formatMathNumber)),
            answer,
          }
        : {
            kind: "typed_response",
            prompt,
            answer,
            placeholder: "Type the decimal",
          };
    }

    const count = typeof config.count === "number" ? config.count : 4;
    const ascending = config.ascending !== false;
    const values = new Set<number>();
    while (values.size < count) {
      values.add(randInt(Math.max(10, min), Math.max(40, max)));
    }
    const numbers = Array.from(values);
    const smallest = Math.min(...numbers);
    const largest = Math.max(...numbers);
    const ordered = [...numbers].sort((a, b) => (ascending ? a - b : b - a));
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: ascending
            ? `Which number is the smallest: ${numbers.map(formatMathNumber).join(", ")}?`
            : `Which number is the largest: ${numbers.map(formatMathNumber).join(", ")}?`,
          options: shuffle(numbers.map(formatMathNumber)),
          answer: formatMathNumber(ascending ? smallest : largest),
        }
      : {
          kind: "typed_response",
          prompt: ascending
            ? `Type the numbers from smallest to largest: ${numbers
                .map(formatMathNumber)
                .join(", ")}.`
            : `Type the numbers from largest to smallest: ${numbers
                .map(formatMathNumber)
                .join(", ")}.`,
          answer: ordered.map(formatMathNumber).join(", "),
          placeholder: "Type the ordered numbers",
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
    const value = randomStepValue(min, Math.max(min + step, max), step);
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
          prompt:
            step < 1
              ? `Which decimal belongs between ${formatMathNumber(
                  Math.max(min, value - step)
                )} and ${formatMathNumber(Math.min(max, value + step))}?`
              : `Which number belongs between ${formatMathNumber(
                  Math.max(min, value - step)
                )} and ${formatMathNumber(Math.min(max, value + step))}?`,
          options:
            step < 1
              ? shuffle([
                  formatMathNumber(value),
                  formatMathNumber(Math.max(min, Number((value - step).toFixed(decimalPlacesForStep(step))))),
                  formatMathNumber(Math.min(max, Number((value + step).toFixed(decimalPlacesForStep(step))))),
                  formatMathNumber(
                    Math.min(max, Number((value + step * 2).toFixed(decimalPlacesForStep(step))))
                  ),
                ])
              : uniqueNumberOptions(value, step),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: `Type the decimal that would sit at this point on the line: ${formatMathNumber(value)}.`,
          answer: formatMathNumber(value),
          placeholder: "Type the decimal",
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
    if (config.mode === "sum_rule") {
      const variants = [
        {
          prompt: "True or false: odd + odd is odd.",
          answer: "false",
          options: ["true", "false"],
        },
        {
          prompt: "Which sum will be even?",
          answer: "7 + 5",
          options: ["7 + 5", "7 + 4", "8 + 5", "9 + 2"],
        },
        {
          prompt: "Is 7 + 5 odd or even?",
          answer: "even",
          options: ["odd", "even"],
        },
      ];
      const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: selected.prompt,
            options: selected.options,
            answer: selected.answer,
            helper: "Even + even = even. Odd + odd = even. Even + odd = odd.",
          }
        : {
            kind: "typed_response",
            prompt: selected.prompt.replace("True or false", "Type true or false"),
            answer: selected.answer,
            helper: "Even + even = even. Odd + odd = even. Even + odd = odd.",
            placeholder: selected.answer === "even" || selected.answer === "odd" ? "odd or even" : "true or false",
          };
    }

    if (config.mode === "product_rule") {
      const variants = [
        {
          prompt: "True or false: odd × odd is odd.",
          answer: "true",
          options: ["true", "false"],
        },
        {
          prompt: "Which product will be odd?",
          answer: "3 × 5",
          options: ["6 × 3", "8 × 7", "3 × 5", "4 × 9"],
        },
        {
          prompt: "Is 8 × 7 odd or even?",
          answer: "even",
          options: ["odd", "even"],
        },
      ];
      const selected = variants[randInt(0, variants.length - 1)] ?? variants[0];
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: selected.prompt,
            options: selected.options,
            answer: selected.answer,
            helper: "Even × any number = even. Odd × odd = odd. Odd × even = even.",
          }
        : {
            kind: "typed_response",
            prompt: selected.prompt.replace("True or false", "Type true or false"),
            answer: selected.answer,
            helper: "Even × any number = even. Odd × odd = odd. Odd × even = even.",
            placeholder: selected.answer === "even" || selected.answer === "odd" ? "odd or even" : "true or false",
          };
    }

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
          visual: sourceQuestion.visual,
        }
      : {
          kind: "typed_response",
          prompt: sourceQuestion.prompt,
          answer: String(sourceQuestion.answer),
          helper: sourceQuestion.helper,
          placeholder: "Type the answer",
          visual: sourceQuestion.visual,
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
