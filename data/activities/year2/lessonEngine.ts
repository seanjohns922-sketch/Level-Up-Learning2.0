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
      hideComputedTotals?: boolean;
      additionWorkspace?: {
        top: string;
        bottom: string;
      };
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

export type MultiplicationStrategyVisualData = {
  type: "multiplication_strategy";
  topValue: number;
  bottomValue: number;
  showWorkedExample?: boolean;
};

export type MultiplicationEstimateStrategyVisualData = {
  type: "multiplication_estimate_strategy";
  topValue: number;
  bottomValue: number;
  showWorkedExample?: boolean;
};

export type DivisionRemainderCheckVisualData = {
  type: "division_remainder_check";
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
};

export type DivisionBuildGroupsVisualData = {
  type: "division_build_groups";
  dividend: number;
  divisor: number;
  multiples: number[];
  remainder: number;
};

export type RuleBoxVisualData = {
  type: "rule_box";
  title: string;
  steps: string[];
  decisionLabel?: string;
};

export type DecimalShiftVisualData = {
  type: "decimal_shift";
  original: string;
  factor: 10 | 100 | 1000;
  result?: string;
  hideResult?: boolean;
};

export type IntegerNumberLineVisualData = {
  type: "integer_number_line";
  min?: number;
  max?: number;
  markerValue?: number;
  highlightedValues?: readonly number[];
  startValue?: number;
  movement?: number;
  interactive?: boolean;
  target?: number;
  highlights?: readonly number[];
  start?: number;
  end?: number;
  jump?: number;
  showArrow?: boolean;
  emphasis?: "position" | "compare" | "movement" | "distance";
};

export type IntegerContextVisualData = {
  type: "integer_context";
  context: "temperature" | "elevator" | "balance" | "score" | "elevation";
  title: string;
  currentValue: number;
  change: number;
  currentLabel?: string;
  changeLabel?: string;
  unitPrefix?: string;
  unitSuffix?: string;
  numberLine: IntegerNumberLineVisualData;
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
  helper?: string;
  visual?: IntegerNumberLineVisualData;
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
  displayStyle?: "auto" | "full_range";
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
    maximumFractionDigits: 3,
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
  pointOptions?: Array<{
    id: "A" | "B" | "C";
    fraction: string;
  }>;
  showPartitions?: boolean;
  showSupportModel?: boolean;
};

export type FractionCompareQuestion = {
  kind: "fraction_compare";
  prompt: string;
  mode: "symbol_compare" | "visual_compare" | "true_false" | "greater_less_visual" | "equivalent_to_compare";
  leftFraction: string;
  rightFraction: string;
  answer: string;
  statement?: string;
  helper?: string;
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

export type FractionDecimalPercentSet = {
  id: string;
  fraction: string;
  decimal: string;
  percent: string;
};

export type FractionDecimalPercentMatchQuestion = {
  kind: "fraction_decimal_percent_match";
  prompt: string;
  helper: string;
  sets: FractionDecimalPercentSet[];
};

export type BenchmarkSortQuestion = {
  kind: "benchmark_sort";
  prompt: string;
  helper: string;
  values: Array<{
    id: string;
    label: string;
    category: "less" | "equal" | "greater";
  }>;
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

function fractionNumericValue(label: string) {
  const [numerator, denominator] = label.split("/").map(Number);
  if (!denominator) return 0;
  return (numerator ?? 0) / denominator;
}

type SameDenominatorTemplate = {
  numeratorA: number;
  numeratorB: number;
  denominator: number;
  operation: "+" | "-";
};

function sameDenominatorResult(template: SameDenominatorTemplate) {
  return template.operation === "+"
    ? template.numeratorA + template.numeratorB
    : template.numeratorA - template.numeratorB;
}

function sameDenominatorExpression(template: SameDenominatorTemplate) {
  return `${template.numeratorA}/${template.denominator} ${template.operation} ${template.numeratorB}/${template.denominator}`;
}

function sameDenominatorAnswer(template: SameDenominatorTemplate) {
  return `${sameDenominatorResult(template)}/${template.denominator}`;
}

function year5SameDenominatorTemplates(): SameDenominatorTemplate[] {
  return [
    { numeratorA: 1, numeratorB: 2, denominator: 5, operation: "+" },
    { numeratorA: 3, numeratorB: 1, denominator: 5, operation: "+" },
    { numeratorA: 4, numeratorB: 2, denominator: 5, operation: "-" },
    { numeratorA: 2, numeratorB: 3, denominator: 6, operation: "+" },
    { numeratorA: 5, numeratorB: 1, denominator: 6, operation: "-" },
    { numeratorA: 4, numeratorB: 2, denominator: 7, operation: "+" },
    { numeratorA: 6, numeratorB: 3, denominator: 7, operation: "-" },
    { numeratorA: 3, numeratorB: 2, denominator: 8, operation: "+" },
    { numeratorA: 7, numeratorB: 4, denominator: 8, operation: "-" },
    { numeratorA: 4, numeratorB: 3, denominator: 9, operation: "+" },
    { numeratorA: 8, numeratorB: 2, denominator: 9, operation: "-" },
    { numeratorA: 5, numeratorB: 3, denominator: 10, operation: "+" },
    { numeratorA: 7, numeratorB: 4, denominator: 10, operation: "-" },
    { numeratorA: 6, numeratorB: 1, denominator: 8, operation: "-" },
    { numeratorA: 3, numeratorB: 3, denominator: 5, operation: "+" },
    { numeratorA: 4, numeratorB: 3, denominator: 6, operation: "+" },
    { numeratorA: 5, numeratorB: 4, denominator: 8, operation: "+" },
  ];
}

function sameDenominatorOptions(template: SameDenominatorTemplate) {
  const result = sameDenominatorResult(template);
  const denominator = template.denominator;
  const answer = `${result}/${denominator}`;
  const changedDenominator = `${result}/${Math.max(2, denominator + denominator)}`;
  const firstNumerator = `${template.numeratorA}/${denominator}`;
  const offByOne = `${Math.max(0, result + (template.operation === "+" ? -1 : 1))}/${denominator}`;
  const wrongOperation =
    template.operation === "+"
      ? `${Math.max(0, template.numeratorA - template.numeratorB)}/${denominator}`
      : `${template.numeratorA + template.numeratorB}/${denominator}`;
  return shuffle(uniqueStringOptions(answer, [changedDenominator, firstNumerator, offByOne, wrongOperation]));
}

type RelatedDenominatorTemplate = {
  numeratorA: number;
  denominatorA: number;
  numeratorB: number;
  denominatorB: number;
  operation: "+" | "-";
};

type RealWorldFractionTemplate = RelatedDenominatorTemplate & {
  context: string;
};

type RealWorldFdpChoiceTemplate = {
  id: string;
  prompt: string;
  answer: string;
  options: string[];
  helper: string;
};

type PercentAmountChoiceTemplate = {
  prompt: string;
  answer: string;
  options: string[];
  helper: string;
};

type PercentStructuredTemplate = {
  percent: number;
  amount: number;
  steps: PercentStructuredMethodVisualData["steps"];
  method?: PercentStructuredMethodVisualData["method"];
};

type DiscountQuestionTemplate = {
  item: string;
  price: number;
  percent: number;
  ask: "discount" | "final";
};

type DiscountStepTemplate = DiscountQuestionTemplate & {
  method: "strategy" | "decimal";
};

type PercentStepSelectionTemplate = {
  prompt: string;
  answer: string;
  options: string[];
  helper: string;
  visual: DiscountPriceVisualData;
};

type MultiStepChoiceTemplate = {
  prompt: string;
  answer: string;
  options: string[];
  helper: string;
  visual?: DiscountPriceVisualData;
};

type MultiStepMethodTemplate = {
  title: string;
  prompt: string;
  contextLabel: string;
  steps: MultiStepMethodVisualData["steps"];
  visual?: DiscountPriceVisualData;
};

type StrategyOwnershipTemplate = {
  prompt: string;
  answer: string;
  strategies: StrategyOwnershipVisualData["strategies"];
  reflectionPrompt: string;
  reflectionOptions: string[];
};

type ReasonablenessChoiceTemplate = {
  prompt: string;
  answer: string;
  options: string[];
  helper: string;
};

function greatestCommonFactor(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a || 1;
}

function lowestCommonMultiple(left: number, right: number): number {
  return Math.abs(left * right) / greatestCommonFactor(left, right);
}

function simplifyFractionString(numerator: number, denominator: number) {
  const divisor = greatestCommonFactor(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function simplifyFractionCandidate(value: string) {
  const [numerator, denominator] = value.split("/").map(Number);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return value;
  return simplifyFractionString(numerator, denominator);
}

function commonRelatedDenominator(template: RelatedDenominatorTemplate) {
  return lowestCommonMultiple(template.denominatorA, template.denominatorB);
}

function scaleToDenominator(numerator: number, denominator: number, targetDenominator: number) {
  return numerator * (targetDenominator / denominator);
}

function relatedDenominatorResult(template: RelatedDenominatorTemplate) {
  const denominator = commonRelatedDenominator(template);
  const numeratorA = scaleToDenominator(template.numeratorA, template.denominatorA, denominator);
  const numeratorB = scaleToDenominator(template.numeratorB, template.denominatorB, denominator);
  return {
    denominator,
    numeratorA,
    numeratorB,
    resultNumerator: template.operation === "+" ? numeratorA + numeratorB : numeratorA - numeratorB,
  };
}

function relatedDenominatorExpression(template: RelatedDenominatorTemplate) {
  return `${template.numeratorA}/${template.denominatorA} ${template.operation} ${template.numeratorB}/${template.denominatorB}`;
}

function relatedDenominatorAnswer(template: RelatedDenominatorTemplate) {
  const result = relatedDenominatorResult(template);
  return `${result.resultNumerator}/${result.denominator}`;
}

function year5RelatedDenominatorTemplates(): RelatedDenominatorTemplate[] {
  return [
    { numeratorA: 1, denominatorA: 2, numeratorB: 1, denominatorB: 4, operation: "+" },
    { numeratorA: 1, denominatorA: 3, numeratorB: 1, denominatorB: 6, operation: "+" },
    { numeratorA: 1, denominatorA: 2, numeratorB: 1, denominatorB: 4, operation: "-" },
    { numeratorA: 2, denominatorA: 3, numeratorB: 1, denominatorB: 6, operation: "+" },
    { numeratorA: 3, denominatorA: 4, numeratorB: 1, denominatorB: 8, operation: "+" },
    { numeratorA: 3, denominatorA: 4, numeratorB: 1, denominatorB: 8, operation: "-" },
    { numeratorA: 5, denominatorA: 6, numeratorB: 1, denominatorB: 3, operation: "-" },
    { numeratorA: 3, denominatorA: 5, numeratorB: 2, denominatorB: 10, operation: "+" },
    { numeratorA: 7, denominatorA: 8, numeratorB: 1, denominatorB: 4, operation: "-" },
    { numeratorA: 4, denominatorA: 6, numeratorB: 1, denominatorB: 3, operation: "+" },
    { numeratorA: 5, denominatorA: 10, numeratorB: 1, denominatorB: 5, operation: "+" },
    { numeratorA: 7, denominatorA: 10, numeratorB: 2, denominatorB: 5, operation: "-" },
    { numeratorA: 5, denominatorA: 6, numeratorB: 1, denominatorB: 12, operation: "+" },
    { numeratorA: 7, denominatorA: 12, numeratorB: 1, denominatorB: 6, operation: "-" },
  ];
}

function year5RealWorldFractionTemplates(): RealWorldFractionTemplate[] {
  return [
    {
      context: "The pool was 2/3 full. 1/6 drained away. How full is it now?",
      numeratorA: 2,
      denominatorA: 3,
      numeratorB: 1,
      denominatorB: 6,
      operation: "-",
    },
    {
      context: "Mia ate 3/5 of a chocolate bar. Sam ate another 1/10. How much was eaten altogether?",
      numeratorA: 3,
      denominatorA: 5,
      numeratorB: 1,
      denominatorB: 10,
      operation: "+",
    },
    {
      context: "A tank was 3/4 full. 1/8 leaked out. How full is it now?",
      numeratorA: 3,
      denominatorA: 4,
      numeratorB: 1,
      denominatorB: 8,
      operation: "-",
    },
    {
      context: "A ribbon was 3/4 m long. 1/3 m was cut off. How much is left?",
      numeratorA: 3,
      denominatorA: 4,
      numeratorB: 1,
      denominatorB: 3,
      operation: "-",
    },
    {
      context: "A jug had 2/5 L of juice. 1/2 L was added. How much juice is there now?",
      numeratorA: 2,
      denominatorA: 5,
      numeratorB: 1,
      denominatorB: 2,
      operation: "+",
    },
    {
      context: "Mia read 5/6 of a chapter. Noah read 1/4 of a chapter. How much more did Mia read?",
      numeratorA: 5,
      denominatorA: 6,
      numeratorB: 1,
      denominatorB: 4,
      operation: "-",
    },
    {
      context: "A recipe uses 1/2 cup of oats and 1/6 cup of seeds. How much is that altogether?",
      numeratorA: 1,
      denominatorA: 2,
      numeratorB: 1,
      denominatorB: 6,
      operation: "+",
    },
    {
      context: "A path is 7/8 km. 1/4 km has been painted. How much is not painted?",
      numeratorA: 7,
      denominatorA: 8,
      numeratorB: 1,
      denominatorB: 4,
      operation: "-",
    },
    {
      context: "A container is 2/3 full. Another 1/4 is added. How full is it now?",
      numeratorA: 2,
      denominatorA: 3,
      numeratorB: 1,
      denominatorB: 4,
      operation: "+",
    },
    {
      context: "A cake had 4/5 left. 3/10 was eaten. How much is left?",
      numeratorA: 4,
      denominatorA: 5,
      numeratorB: 3,
      denominatorB: 10,
      operation: "-",
    },
  ];
}

function relatedDenominatorVisual(template: RelatedDenominatorTemplate): SameDenominatorOperationVisualData {
  const result = relatedDenominatorResult(template);
  const conversionLabel =
    template.denominatorA === result.denominator
      ? `${template.numeratorB}/${template.denominatorB} = ${result.numeratorB}/${result.denominator}`
      : `${template.numeratorA}/${template.denominatorA} = ${result.numeratorA}/${result.denominator}`;
  return {
    type: "same_denominator_operation",
    numeratorA: result.numeratorA,
    numeratorB: result.numeratorB,
    denominator: result.denominator,
    operation: template.operation,
    resultNumerator: result.resultNumerator,
    originalNumeratorA: template.numeratorA,
    originalDenominatorA: template.denominatorA,
    originalNumeratorB: template.numeratorB,
    originalDenominatorB: template.denominatorB,
    conversionLabel,
  };
}

function relatedDenominatorOptions(template: RelatedDenominatorTemplate) {
  const result = relatedDenominatorResult(template);
  const answer = `${result.resultNumerator}/${result.denominator}`;
  const unchanged = `${Math.max(0, template.operation === "+" ? template.numeratorA + template.numeratorB : template.numeratorA - template.numeratorB)}/${template.denominatorA}`;
  const wrongDenominator = `${result.resultNumerator}/${template.denominatorA + template.denominatorB}`;
  const offByOne = `${Math.max(0, result.resultNumerator + (template.operation === "+" ? -1 : 1))}/${result.denominator}`;
  const noConvertSecond = `${Math.max(0, template.operation === "+" ? result.numeratorA + template.numeratorB : result.numeratorA - template.numeratorB)}/${result.denominator}`;
  const tooSmall = `${Math.max(0, result.resultNumerator - 2)}/${result.denominator}`;
  const tooLarge = `${Math.min(result.denominator, result.resultNumerator + 2)}/${result.denominator}`;
  const splitAgain = `${result.resultNumerator}/${result.denominator * 2}`;
  return shuffle(uniqueStringOptions(answer, [unchanged, wrongDenominator, offByOne, noConvertSecond, tooSmall, tooLarge, splitAgain]));
}

function fractionOperationDecisionOptions(template: RelatedDenominatorTemplate) {
  const result = relatedDenominatorResult(template);
  const answer = simplifyFractionString(result.resultNumerator, result.denominator);
  const candidates = [
    `${Math.max(0, template.operation === "+" ? template.numeratorA + template.numeratorB : template.numeratorA - template.numeratorB)}/${template.denominatorA + template.denominatorB}`,
    `${Math.max(0, template.operation === "+" ? template.numeratorA + template.numeratorB : template.numeratorA - template.numeratorB)}/${Math.max(template.denominatorA, template.denominatorB)}`,
    `${Math.max(0, result.resultNumerator - 1)}/${result.denominator}`,
    template.operation === "+"
      ? simplifyFractionString(Math.abs(result.numeratorA - result.numeratorB), result.denominator)
      : simplifyFractionString(result.numeratorA + result.numeratorB, result.denominator),
    `${Math.min(result.denominator, result.resultNumerator + 1)}/${result.denominator}`,
    "1",
    "1/2",
  ].filter((candidate) => simplifyFractionCandidate(candidate) !== answer);

  return uniqueStringOptions(answer, candidates);
}

function year5RealWorldFdpQuickApplyTemplates(): RealWorldFdpChoiceTemplate[] {
  return [
    {
      id: "tank-75-minus-quarter",
      prompt: "A tank is 75% full. It loses 1/4 of its full capacity. How much is left?",
      answer: "1/2",
      options: ["1/2", "3/4", "1/4", "100%"],
      helper: "Convert 75% to 3/4, then subtract 1/4.",
    },
    {
      id: "task-06-plus-fifth",
      prompt: "A student completes 0.6 of a task, then 1/5 more. Do they finish?",
      answer: "No, 4/5",
      options: ["No, 4/5", "Yes, exactly 1", "Yes, 6/5", "No, 3/5"],
      helper: "0.6 is 3/5. Add 1/5 and compare with 1 whole.",
    },
    {
      id: "game-two-thirds-plus-25",
      prompt: "A game is 2/3 complete. You gain 25% more. What fraction is complete now?",
      answer: "11/12",
      options: ["11/12", "3/8", "5/6", "1"],
      helper: "25% is 1/4. Use twelfths to combine the parts.",
    },
    {
      id: "race-three-quarters-minus-02",
      prompt: "A runner has 3/4 of a race completed. A 0.2 penalty is removed. How much still counts?",
      answer: "11/20",
      options: ["11/20", "1/2", "7/10", "3/5"],
      helper: "0.2 is 1/5. Convert to twentieths before subtracting.",
    },
    {
      id: "badge-50-plus-quarter",
      prompt: "A badge is 50% coloured. Another 1/4 is coloured. How much is coloured now?",
      answer: "3/4",
      options: ["3/4", "1/4", "1/2", "25%"],
      helper: "50% is 1/2. Then add 1/4.",
    },
    {
      id: "battery-08-minus-fifth",
      prompt: "A battery is at 0.8. It drops by 1/5. What level is left?",
      answer: "3/5",
      options: ["3/5", "0.7", "1", "4/10"],
      helper: "0.8 is 4/5. Subtract one fifth.",
    },
    {
      id: "goal-40-plus-half",
      prompt: "A team reaches 40% of a goal, then completes 1/2 more. What total is reached?",
      answer: "9/10",
      options: ["9/10", "4/5", "3/5", "1/10"],
      helper: "40% is 2/5. Add 1/2 using tenths.",
    },
    {
      id: "garden-third-plus-025",
      prompt: "A garden has 1/3 planted. Another 0.25 is planted. What total is planted?",
      answer: "7/12",
      options: ["7/12", "1/4", "4/8", "1/2"],
      helper: "0.25 is 1/4. Use twelfths to add.",
    },
    {
      id: "bottle-90-minus-two-fifths",
      prompt: "A bottle is 90% full. 2/5 is poured out. How much is left?",
      answer: "1/2",
      options: ["1/2", "3/10", "7/10", "2/5"],
      helper: "90% is 9/10 and 2/5 is 4/10.",
    },
    {
      id: "playlist-quarter-plus-two-fifths",
      prompt: "A playlist is 0.25 finished. You complete another 2/5. How much is done?",
      answer: "13/20",
      options: ["13/20", "0.45", "3/10", "7/20"],
      helper: "0.25 is 1/4. Convert to twentieths.",
    },
  ];
}

function year5RealWorldFdpStructuredTemplates(): RealWorldFractionTemplate[] {
  return [
    {
      context: "Convert and solve: 75% + 1/8",
      numeratorA: 3,
      denominatorA: 4,
      numeratorB: 1,
      denominatorB: 8,
      operation: "+",
    },
    {
      context: "Convert and solve: 0.75 - 1/2",
      numeratorA: 3,
      denominatorA: 4,
      numeratorB: 1,
      denominatorB: 2,
      operation: "-",
    },
    {
      context: "Convert and solve: 7/8 - 0.5",
      numeratorA: 7,
      denominatorA: 8,
      numeratorB: 1,
      denominatorB: 2,
      operation: "-",
    },
    {
      context: "Convert and solve: 30% + 1/2",
      numeratorA: 3,
      denominatorA: 10,
      numeratorB: 1,
      denominatorB: 2,
      operation: "+",
    },
    {
      context: "Convert and solve: 60% + 1/10",
      numeratorA: 3,
      denominatorA: 5,
      numeratorB: 1,
      denominatorB: 10,
      operation: "+",
    },
    {
      context: "Convert and solve: 80% - 1/10",
      numeratorA: 4,
      denominatorA: 5,
      numeratorB: 1,
      denominatorB: 10,
      operation: "-",
    },
    {
      context: "Convert and solve: 25% + 1/2",
      numeratorA: 1,
      denominatorA: 4,
      numeratorB: 1,
      denominatorB: 2,
      operation: "+",
    },
    {
      context: "Convert and solve: 50% + 1/8",
      numeratorA: 1,
      denominatorA: 2,
      numeratorB: 1,
      denominatorB: 8,
      operation: "+",
    },
    {
      context: "Convert and solve: 0.2 + 3/10",
      numeratorA: 1,
      denominatorA: 5,
      numeratorB: 3,
      denominatorB: 10,
      operation: "+",
    },
    {
      context: "Convert and solve: 90% - 1/5",
      numeratorA: 9,
      denominatorA: 10,
      numeratorB: 1,
      denominatorB: 5,
      operation: "-",
    },
    {
      context: "Convert and solve: 0.4 + 1/10",
      numeratorA: 2,
      denominatorA: 5,
      numeratorB: 1,
      denominatorB: 10,
      operation: "+",
    },
  ];
}

function year5RealWorldFdpChallengeTemplates(): RealWorldFdpChoiceTemplate[] {
  return [
    {
      id: "pool-three-fifths-plus-quarter",
      prompt: "A full pool loses 3/5 of its water. Heavy rain adds 1/4 of full capacity. How much is full?",
      answer: "13/20",
      options: ["13/20", "4/9", "7/20", "17/20"],
      helper: "Start from the amount left after the loss, then add 1/4.",
    },
    {
      id: "fundraiser-60-plus-35",
      prompt: "A fundraiser reaches 60% of its goal. On the final day, it raises 35% more. Does it reach the goal?",
      answer: "No, 95%",
      options: ["No, 95%", "Yes, 105%", "Yes, exactly 100%", "No, 25%"],
      helper: "Add the percentages and compare with 100%.",
    },
    {
      id: "container-seven-eighths-minus-quarter-plus-half",
      prompt: "A container is 7/8 full. Then 1/4 is removed and 0.5 is added. What is the final amount?",
      answer: "9/8",
      options: ["9/8", "5/8", "1", "6/8"],
      helper: "Convert 1/4 and 0.5 into eighths.",
    },
    {
      id: "homework-45-plus-third",
      prompt: "A student completes 45% of homework, then 1/3 more. About how much is complete?",
      answer: "47/60",
      options: ["47/60", "46/100", "4/5", "2/3"],
      helper: "45% is 9/20. Use sixtieths to add 1/3.",
    },
    {
      id: "water-08-minus-quarter",
      prompt: "A bottle is 0.8 full. You drink 1/4 of full capacity. How much is left?",
      answer: "11/20",
      options: ["11/20", "3/5", "0.75", "1/4"],
      helper: "0.8 is 4/5. Convert to twentieths before subtracting.",
    },
    {
      id: "project-two-thirds-plus-30",
      prompt: "A project is 2/3 complete. You finish another 30%. Is the project complete?",
      answer: "No, 29/30",
      options: ["No, 29/30", "Yes, 1", "Yes, 19/15", "No, 3/10"],
      helper: "30% is 3/10. Compare the total with 1 whole.",
    },
    {
      id: "tank-70-minus-fifth",
      prompt: "A tank is 70% full. It loses 1/5 of full capacity. What percent is left?",
      answer: "50%",
      options: ["50%", "60%", "90%", "1/5"],
      helper: "1/5 is 20%. Subtract from 70%.",
    },
    {
      id: "race-half-plus-40",
      prompt: "A race tracker shows 1/2 complete. Another 40% is completed. How much is complete?",
      answer: "9/10",
      options: ["9/10", "45%", "1/10", "5/6"],
      helper: "1/2 is 50%. Add 40%.",
    },
    {
      id: "recipe-three-quarters-minus-02",
      prompt: "A recipe uses 3/4 cup. You reduce it by 0.2 cup. How much is used now?",
      answer: "11/20",
      options: ["11/20", "1/2", "3/5", "7/10"],
      helper: "0.2 is 1/5. Convert to twentieths.",
    },
    {
      id: "map-two-fifths-plus-35",
      prompt: "A map route is 2/5 marked. Another 35% is marked. How much is marked now?",
      answer: "3/4",
      options: ["3/4", "37/100", "7/10", "1/4"],
      helper: "2/5 is 40%. Add 35%.",
    },
  ];
}

function year5PercentQuickFindTemplates(): PercentAmountChoiceTemplate[] {
  return [
    {
      prompt: "What is 10% of 80?",
      answer: "8",
      options: ["8", "80", "10", "18"],
      helper: "10% means one tenth.",
    },
    {
      prompt: "What is 50% of 36?",
      answer: "18",
      options: ["18", "12", "36", "16"],
      helper: "50% is half.",
    },
    {
      prompt: "What is 25% of 200?",
      answer: "50",
      options: ["50", "25", "100", "75"],
      helper: "25% is one quarter.",
    },
    {
      prompt: "What is 20% of 90?",
      answer: "18",
      options: ["18", "9", "20", "45"],
      helper: "20% is two lots of 10%.",
    },
    {
      prompt: "What is 5% of 60?",
      answer: "3",
      options: ["3", "6", "5", "30"],
      helper: "5% is half of 10%.",
    },
    {
      prompt: "What is 75% of 80?",
      answer: "60",
      options: ["60", "40", "75", "20"],
      helper: "75% is 50% plus 25%.",
    },
    {
      prompt: "What is 15% of 80?",
      answer: "12",
      options: ["12", "8", "15", "20"],
      helper: "15% is 10% plus 5%.",
    },
    {
      prompt: "What is 30% of 150?",
      answer: "45",
      options: ["45", "30", "15", "50"],
      helper: "30% is three lots of 10%.",
    },
    {
      prompt: "What is 12.5% of 64?",
      answer: "8",
      options: ["8", "6.4", "12.5", "16"],
      helper: "12.5% is one eighth.",
    },
    {
      prompt: "What is 40% of 120?",
      answer: "48",
      options: ["48", "40", "12", "60"],
      helper: "40% is four lots of 10%.",
    },
    {
      prompt: "What is 25% of 64?",
      answer: "16",
      options: ["16", "32", "25", "8"],
      helper: "25% is half, then half again.",
    },
    {
      prompt: "What is 5% of 200?",
      answer: "10",
      options: ["10", "20", "5", "100"],
      helper: "Find 10%, then halve it.",
    },
  ];
}

function year5PercentStructuredTemplates(): PercentStructuredTemplate[] {
  return [
    {
      percent: 30,
      amount: 70,
      steps: [
        { prompt: "What is 10% of 70?", answer: "7" },
        { prompt: "30% is how many groups of 10%?", answer: "3" },
        { prompt: "So what is 30% of 70?", answer: "21" },
      ],
    },
    {
      percent: 15,
      amount: 60,
      steps: [
        { prompt: "What is 10% of 60?", answer: "6" },
        { prompt: "What is 5% of 60?", answer: "3" },
        { prompt: "Add them. What is 15% of 60?", answer: "9" },
      ],
    },
    {
      percent: 25,
      amount: 120,
      steps: [
        { prompt: "What is 50% of 120?", answer: "60" },
        { prompt: "What is half of 60?", answer: "30" },
        { prompt: "So what is 25% of 120?", answer: "30" },
      ],
    },
    {
      percent: 35,
      amount: 80,
      steps: [
        { prompt: "What is 10% of 80?", answer: "8" },
        { prompt: "What is 30% of 80?", answer: "24" },
        { prompt: "What is 5% of 80?", answer: "4" },
        { prompt: "Add 30% and 5%. What is 35% of 80?", answer: "28" },
      ],
    },
    {
      percent: 75,
      amount: 200,
      steps: [
        { prompt: "What is 50% of 200?", answer: "100" },
        { prompt: "What is 25% of 200?", answer: "50" },
        { prompt: "Add them. What is 75% of 200?", answer: "150" },
      ],
    },
    {
      percent: 40,
      amount: 90,
      steps: [
        { prompt: "What is 10% of 90?", answer: "9" },
        { prompt: "40% is how many groups of 10%?", answer: "4" },
        { prompt: "So what is 40% of 90?", answer: "36" },
      ],
    },
    {
      percent: 20,
      amount: 150,
      steps: [
        { prompt: "What is 10% of 150?", answer: "15" },
        { prompt: "20% is how many groups of 10%?", answer: "2" },
        { prompt: "So what is 20% of 150?", answer: "30" },
      ],
    },
    {
      percent: 5,
      amount: 140,
      steps: [
        { prompt: "What is 10% of 140?", answer: "14" },
        { prompt: "What is half of 14?", answer: "7" },
        { prompt: "So what is 5% of 140?", answer: "7" },
      ],
    },
    {
      percent: 15,
      amount: 120,
      steps: [
        { prompt: "What is 10% of 120?", answer: "12" },
        { prompt: "What is 5% of 120?", answer: "6" },
        { prompt: "Add them. What is 15% of 120?", answer: "18" },
      ],
    },
    {
      percent: 30,
      amount: 240,
      steps: [
        { prompt: "What is 10% of 240?", answer: "24" },
        { prompt: "30% is how many groups of 10%?", answer: "3" },
        { prompt: "So what is 30% of 240?", answer: "72" },
      ],
    },
  ];
}

function year5PercentDecimalMethodTemplates(): PercentStructuredTemplate[] {
  return [
    {
      percent: 30,
      amount: 60,
      method: "decimal",
      steps: [
        { prompt: "Convert 30% to a decimal", answer: "0.3" },
        { prompt: "0.3 × 60 =", answer: "18" },
      ],
    },
    {
      percent: 15,
      amount: 200,
      method: "decimal",
      steps: [
        { prompt: "Convert 15% to a decimal", answer: "0.15" },
        { prompt: "0.15 × 200 =", answer: "30" },
      ],
    },
    {
      percent: 12,
      amount: 50,
      method: "decimal",
      steps: [
        { prompt: "Convert 12% to a decimal", answer: "0.12" },
        { prompt: "0.12 × 50 =", answer: "6" },
      ],
    },
    {
      percent: 35,
      amount: 80,
      method: "decimal",
      steps: [
        { prompt: "Convert 35% to a decimal", answer: "0.35" },
        { prompt: "0.35 × 80 =", answer: "28" },
      ],
    },
    {
      percent: 25,
      amount: 120,
      method: "decimal",
      steps: [
        { prompt: "Convert 25% to a decimal", answer: "0.25" },
        { prompt: "0.25 × 120 =", answer: "30" },
      ],
    },
  ];
}

function year5PercentRealWorldTemplates(): PercentAmountChoiceTemplate[] {
  return [
    {
      prompt: "A $50 item has 20% off. How much is the discount?",
      answer: "$10",
      options: ["$10", "$20", "$40", "$5"],
      helper: "Find 20% of 50. That is the discount amount.",
    },
    {
      prompt: "A student scores 80% on a test with 50 questions. How many are correct?",
      answer: "40",
      options: ["40", "30", "45", "80"],
      helper: "Find 80% of 50.",
    },
    {
      prompt: "A tank holds 200L. It is 25% full. How much water is inside?",
      answer: "50L",
      options: ["50L", "25L", "100L", "75L"],
      helper: "25% is one quarter of the total.",
    },
    {
      prompt: "A shop has 60 items. 30% are sold. How many are sold?",
      answer: "18",
      options: ["18", "30", "42", "6"],
      helper: "Find 30% of 60.",
    },
    {
      prompt: "A $120 bike has a 10% discount. How much is the discount?",
      answer: "$12",
      options: ["$12", "$10", "$108", "$24"],
      helper: "10% is one tenth.",
    },
    {
      prompt: "A class has 32 students. 50% bring lunch. How many bring lunch?",
      answer: "16",
      options: ["16", "32", "8", "50"],
      helper: "50% is half.",
    },
    {
      prompt: "A 80-page book is 75% finished. How many pages are finished?",
      answer: "60",
      options: ["60", "40", "20", "75"],
      helper: "75% is 50% plus 25%.",
    },
    {
      prompt: "A $90 jacket has 40% off. What is the discount?",
      answer: "$36",
      options: ["$36", "$40", "$54", "$9"],
      helper: "Find 10%, then multiply by 4.",
    },
    {
      prompt: "A box has 140 pencils. 5% are red. How many are red?",
      answer: "7",
      options: ["7", "14", "5", "70"],
      helper: "Find 10%, then halve it.",
    },
    {
      prompt: "A game has 150 points. Mia scores 20%. How many points is that?",
      answer: "30",
      options: ["30", "15", "20", "120"],
      helper: "20% is two lots of 10%.",
    },
  ];
}

function discountAmount(price: number, percent: number) {
  return (price * percent) / 100;
}

function discountFinalPrice(price: number, percent: number) {
  return price - discountAmount(price, percent);
}

function moneyAnswer(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

function discountVisual(
  template: DiscountQuestionTemplate,
  visualMode: DiscountPriceVisualData["visualMode"] = "price_tag",
  hideValues = false
): DiscountPriceVisualData {
  const discount = discountAmount(template.price, template.percent);
  return {
    type: "discount_price_tag",
    item: template.item,
    price: template.price,
    percent: template.percent,
    discount,
    finalPrice: template.price - discount,
    visualMode,
    hideValues,
  };
}

function discountOptions(template: DiscountQuestionTemplate) {
  const discount = discountAmount(template.price, template.percent);
  const finalPrice = template.price - discount;
  const answer = moneyAnswer(template.ask === "discount" ? discount : finalPrice);
  const candidates =
    template.ask === "discount"
      ? [
          moneyAnswer(finalPrice),
          moneyAnswer(template.price),
          moneyAnswer(template.percent),
          moneyAnswer(Math.max(1, discount / 2)),
          moneyAnswer(Math.min(template.price, discount * 2)),
        ]
      : [
          moneyAnswer(discount),
          moneyAnswer(template.price + discount),
          moneyAnswer(template.price),
          moneyAnswer(Math.max(0, finalPrice - discount)),
          moneyAnswer(template.price - template.percent),
        ];
  return uniqueStringOptions(answer, candidates);
}

function year5DiscountQuickFindTemplates(): DiscountQuestionTemplate[] {
  return [
    { item: "shirt", price: 50, percent: 10, ask: "discount" },
    { item: "game", price: 80, percent: 25, ask: "discount" },
    { item: "bag", price: 60, percent: 20, ask: "final" },
    { item: "book set", price: 40, percent: 50, ask: "final" },
    { item: "jacket", price: 90, percent: 10, ask: "discount" },
    { item: "headphones", price: 120, percent: 25, ask: "final" },
    { item: "trainers", price: 100, percent: 30, ask: "discount" },
    { item: "hoodie", price: 70, percent: 20, ask: "final" },
    { item: "backpack", price: 80, percent: 50, ask: "discount" },
    { item: "poster", price: 30, percent: 10, ask: "final" },
  ];
}

function year5DiscountStepTemplates(): DiscountStepTemplate[] {
  return [
    { item: "jacket", price: 80, percent: 25, ask: "final", method: "strategy" },
    { item: "game", price: 60, percent: 30, ask: "final", method: "decimal" },
    { item: "shoes", price: 120, percent: 20, ask: "final", method: "strategy" },
    { item: "headphones", price: 200, percent: 15, ask: "final", method: "decimal" },
    { item: "shirt", price: 50, percent: 10, ask: "final", method: "strategy" },
    { item: "watch", price: 160, percent: 25, ask: "final", method: "strategy" },
    { item: "bike helmet", price: 90, percent: 40, ask: "final", method: "strategy" },
    { item: "keyboard", price: 150, percent: 12, ask: "final", method: "decimal" },
    { item: "school bag", price: 70, percent: 30, ask: "final", method: "strategy" },
    { item: "lamp", price: 100, percent: 35, ask: "final", method: "decimal" },
  ];
}

function year5DiscountRealWorldTemplates(): DiscountQuestionTemplate[] {
  return [
    { item: "shoes", price: 120, percent: 20, ask: "final" },
    { item: "game", price: 60, percent: 25, ask: "final" },
    { item: "TV", price: 200, percent: 15, ask: "discount" },
    { item: "jacket", price: 80, percent: 30, ask: "final" },
    { item: "book bundle", price: 40, percent: 10, ask: "discount" },
    { item: "skateboard", price: 150, percent: 20, ask: "discount" },
    { item: "desk", price: 180, percent: 25, ask: "final" },
    { item: "football boots", price: 110, percent: 10, ask: "final" },
    { item: "tablet case", price: 50, percent: 40, ask: "discount" },
    { item: "speaker", price: 90, percent: 30, ask: "final" },
  ];
}

function year5PercentStepSelectionTemplates(): PercentStepSelectionTemplate[] {
  return [
    {
      prompt: "A $100 item has 20% off, then $5 shipping. What is the final cost?",
      answer: "$85",
      options: ["$85", "$80", "$75", "$125"],
      helper: "Find the discount, subtract it, then add shipping.",
      visual: discountVisual({ item: "item", price: 100, percent: 20, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "A $80 jacket has 25% off, then $10 more off. What is the final price?",
      answer: "$50",
      options: ["$50", "$60", "$70", "$45"],
      helper: "Calculate 25% of $80, then apply both discounts.",
      visual: discountVisual({ item: "jacket", price: 80, percent: 25, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "A $60 game has 50% off, then 10% tax is added. What is the final price?",
      answer: "$33",
      options: ["$33", "$30", "$36", "$27"],
      helper: "Find the sale price, then add 10% of that new price.",
      visual: discountVisual({ item: "game", price: 60, percent: 50, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "A $200 TV has 10% off, then another 10% off the new price. What is the final price?",
      answer: "$162",
      options: ["$162", "$160", "$180", "$170"],
      helper: "Apply the second discount to the new price.",
      visual: discountVisual({ item: "TV", price: 200, percent: 10, ask: "discount" }, "percent_bar", true),
    },
    {
      prompt: "A $120 item has 25% off, then $15 off. What is the final price?",
      answer: "$75",
      options: ["$75", "$90", "$105", "$65"],
      helper: "Find 25% of 120, subtract it, then subtract 15.",
      visual: discountVisual({ item: "item", price: 120, percent: 25, ask: "discount" }, "percent_bar", true),
    },
    {
      prompt: "A score is 80% of 50 questions, then 5 are removed. How many correct answers remain?",
      answer: "35",
      options: ["35", "40", "45", "30"],
      helper: "Find 80% of 50 first, then subtract 5.",
      visual: discountVisual({ item: "test score", price: 50, percent: 80, ask: "discount" }, "percent_bar", true),
    },
    {
      prompt: "A $120 item has 20% off, then $10 off. What is the final price?",
      answer: "$86",
      options: ["$86", "$96", "$90", "$110"],
      helper: "Find the percent discount, subtract it, then subtract $10.",
      visual: discountVisual({ item: "item", price: 120, percent: 20, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "A $200 item is reduced by 15%. Is it under a $175 budget?",
      answer: "Yes, by $5",
      options: ["Yes, by $5", "No, over by $5", "Yes, by $15", "No, over by $25"],
      helper: "Find the sale price, then compare it with the budget.",
      visual: discountVisual({ item: "shopping", price: 200, percent: 15, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "A $90 speaker has 30% off, then $5 shipping. What is the final cost?",
      answer: "$68",
      options: ["$68", "$63", "$72", "$58"],
      helper: "Discount first, then add shipping.",
      visual: discountVisual({ item: "speaker", price: 90, percent: 30, ask: "discount" }, "shop_item", true),
    },
    {
      prompt: "A student improves from 60% to 80%. What is the increase?",
      answer: "20%",
      options: ["20%", "40%", "80%", "140%"],
      helper: "Compare the two percentages.",
      visual: discountVisual({ item: "progress", price: 100, percent: 20, ask: "discount" }, "percent_bar", true),
    },
  ];
}

function year5PercentMultiStepTemplates(): DiscountStepMethodVisualData[] {
  return [
    {
      type: "discount_step_method",
      item: "jacket",
      price: 80,
      percent: 25,
      discount: 20,
      finalPrice: 50,
      visualMode: "before_after",
      method: "strategy",
      steps: [
        { prompt: "Find 25% of 80", answer: "20" },
        { prompt: "80 - 20 =", answer: "60" },
        { prompt: "60 - 10 =", answer: "50" },
      ],
    },
    {
      type: "discount_step_method",
      item: "game",
      price: 60,
      percent: 30,
      discount: 18,
      finalPrice: 42,
      visualMode: "percent_bar",
      method: "decimal",
      steps: [
        { prompt: "Convert 30% to a decimal", answer: "0.3" },
        { prompt: "0.3 × 60 =", answer: "18" },
        { prompt: "60 - 18 =", answer: "42" },
      ],
    },
    {
      type: "discount_step_method",
      item: "test score",
      price: 50,
      percent: 80,
      discount: 40,
      finalPrice: 35,
      visualMode: "percent_bar",
      method: "strategy",
      steps: [
        { prompt: "Find 80% of 50", answer: "40" },
        { prompt: "40 - 5 =", answer: "35" },
      ],
    },
    {
      type: "discount_step_method",
      item: "TV",
      price: 200,
      percent: 10,
      discount: 20,
      finalPrice: 162,
      visualMode: "before_after",
      method: "strategy",
      steps: [
        { prompt: "Find 10% of 200", answer: "20" },
        { prompt: "200 - 20 =", answer: "180" },
        { prompt: "Find 10% of 180", answer: "18" },
        { prompt: "180 - 18 =", answer: "162" },
      ],
    },
    {
      type: "discount_step_method",
      item: "shoes",
      price: 120,
      percent: 20,
      discount: 24,
      finalPrice: 86,
      visualMode: "shop_item",
      method: "strategy",
      steps: [
        { prompt: "Find 20% of 120", answer: "24" },
        { prompt: "120 - 24 =", answer: "96" },
        { prompt: "96 - 10 =", answer: "86" },
      ],
    },
    {
      type: "discount_step_method",
      item: "keyboard",
      price: 150,
      percent: 12,
      discount: 18,
      finalPrice: 132,
      visualMode: "percent_bar",
      method: "decimal",
      steps: [
        { prompt: "Convert 12% to a decimal", answer: "0.12" },
        { prompt: "0.12 × 150 =", answer: "18" },
        { prompt: "150 - 18 =", answer: "132" },
      ],
    },
    {
      type: "discount_step_method",
      item: "speaker",
      price: 90,
      percent: 30,
      discount: 27,
      finalPrice: 68,
      visualMode: "shop_item",
      method: "strategy",
      steps: [
        { prompt: "Find 30% of 90", answer: "27" },
        { prompt: "90 - 27 =", answer: "63" },
        { prompt: "63 + 5 =", answer: "68" },
      ],
    },
    {
      type: "discount_step_method",
      item: "course progress",
      price: 100,
      percent: 60,
      discount: 60,
      finalPrice: 20,
      visualMode: "percent_bar",
      method: "strategy",
      steps: [
        { prompt: "Start at 60%. Target is 80%.", answer: "60" },
        { prompt: "80 - 60 =", answer: "20" },
      ],
    },
    {
      type: "discount_step_method",
      item: "lamp",
      price: 100,
      percent: 35,
      discount: 35,
      finalPrice: 65,
      visualMode: "percent_bar",
      method: "decimal",
      steps: [
        { prompt: "Convert 35% to a decimal", answer: "0.35" },
        { prompt: "0.35 × 100 =", answer: "35" },
        { prompt: "100 - 35 =", answer: "65" },
      ],
    },
    {
      type: "discount_step_method",
      item: "book bundle",
      price: 75,
      percent: 20,
      discount: 15,
      finalPrice: 65,
      visualMode: "before_after",
      method: "strategy",
      steps: [
        { prompt: "Find 20% of 75", answer: "15" },
        { prompt: "75 - 15 =", answer: "60" },
        { prompt: "60 + 5 =", answer: "65" },
      ],
    },
  ];
}

function year5PercentRealWorldMultiTemplates(): PercentAmountChoiceTemplate[] {
  return [
    {
      prompt: "A $120 item has 20% off, then $10 off. What is the final price?",
      answer: "$86",
      options: ["$86", "$96", "$90", "$110"],
      helper: "Find the percent discount, subtract it, then subtract $10.",
    },
    {
      prompt: "A $60 game has 50% off, then 10% tax added. What is the final price?",
      answer: "$33",
      options: ["$33", "$30", "$36", "$27"],
      helper: "Find the sale price first, then add 10% of that new price.",
    },
    {
      prompt: "A student improves from 60% to 80%. How much is the increase?",
      answer: "20%",
      options: ["20%", "40%", "80%", "140%"],
      helper: "Compare the two percentages.",
    },
    {
      prompt: "A $90 speaker has 30% off, then $5 shipping. What is the final cost?",
      answer: "$68",
      options: ["$68", "$63", "$72", "$58"],
      helper: "Discount first, then add shipping.",
    },
    {
      prompt: "A $200 TV has 10% off, then another 10% off the new price. What is the final price?",
      answer: "$162",
      options: ["$162", "$160", "$180", "$170"],
      helper: "Apply the second discount to the new price.",
    },
    {
      prompt: "A $150 keyboard has 12% off. What is the final price?",
      answer: "$132",
      options: ["$132", "$138", "$18", "$162"],
      helper: "Use the decimal method if needed, then subtract.",
    },
    {
      prompt: "A $80 jacket has 25% off, then $10 more off. What is the final price?",
      answer: "$50",
      options: ["$50", "$60", "$70", "$45"],
      helper: "Find 25% first, then use both discounts.",
    },
    {
      prompt: "A test has 50 questions. 80% are correct, then 5 answers are removed. How many remain correct?",
      answer: "35",
      options: ["35", "40", "45", "30"],
      helper: "Find 80% of 50 first.",
    },
    {
      prompt: "A $75 bundle has 20% off, then $5 shipping. What is the final cost?",
      answer: "$65",
      options: ["$65", "$60", "$70", "$55"],
      helper: "Subtract the discount, then add shipping.",
    },
    {
      prompt: "A $100 lamp has 35% off. What is the final price?",
      answer: "$65",
      options: ["$65", "$35", "$75", "$135"],
      helper: "Find the discount, then subtract.",
    },
  ];
}

function year5MultiStepDecideTemplates(): MultiStepChoiceTemplate[] {
  return [
    {
      prompt: "A jacket costs $200. It is 15% off, then a $10 fee is added. Which quantity is needed before the fee?",
      answer: "$170 sale price",
      options: ["$170 sale price", "$30 final fee", "$210 starting cost", "$15 final price"],
      helper: "Find the discount and sale price before adding the fee.",
      visual: discountVisual({ item: "jacket", price: 200, percent: 15, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "A game costs $60. It is 20% off. You buy 3 games. What single-game price do you use?",
      answer: "$48",
      options: ["$48", "$12", "$180", "$36"],
      helper: "Find the discounted cost of one game before multiplying by 3.",
      visual: discountVisual({ item: "game", price: 60, percent: 20, ask: "discount" }, "shop_item", true),
    },
    {
      prompt: "Shop A gives 20% off $100. Shop B gives $25 off $100. Which final prices should be compared?",
      answer: "$80 and $75",
      options: ["$80 and $75", "$20 and $25", "$100 and $100", "$120 and $125"],
      helper: "Compare final prices, not discount amounts.",
      visual: discountVisual({ item: "shop offer", price: 100, percent: 20, ask: "discount" }, "percent_bar", true),
    },
    {
      prompt: "A $120 item is 25% off. You have a $100 budget. What final price decides affordability?",
      answer: "$90",
      options: ["$90", "$30", "$100", "$145"],
      helper: "Find the sale price before comparing with the budget.",
      visual: discountVisual({ item: "budget item", price: 120, percent: 25, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "A box holds 40 items. 25% are damaged, then 6 more are removed. How many good items remain?",
      answer: "24",
      options: ["24", "30", "10", "34"],
      helper: "Find the damaged amount, then remove 6 more.",
    },
    {
      prompt: "A recipe serves 4 people. You triple it, then remove 2 portions. How many portions are left?",
      answer: "10",
      options: ["10", "12", "6", "14"],
      helper: "Scale first, then subtract.",
    },
    {
      prompt: "A ticket costs $30. A family buys 4 tickets, then uses a $20 voucher. What is the amount paid?",
      answer: "$100",
      options: ["$100", "$120", "$50", "$80"],
      helper: "Multiply the ticket cost first, then subtract the voucher.",
    },
    {
      prompt: "A class has 32 students. They form groups of 4, then 2 groups leave. How many groups remain?",
      answer: "6",
      options: ["6", "8", "30", "4"],
      helper: "Divide into groups first, then subtract groups.",
    },
    {
      prompt: "A $75 bundle has $15 off, then 10% off the new price. What is the final price?",
      answer: "$54",
      options: ["$54", "$60", "$52.50", "$67.50"],
      helper: "Subtract the fixed discount before applying 10%.",
      visual: discountVisual({ item: "bundle", price: 75, percent: 10, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "After a 25% discount, an item costs $75. What was the original price?",
      answer: "$100",
      options: ["$100", "$75", "$25", "$93.75"],
      helper: "After 25% off, the final price is 75% of the original.",
    },
  ];
}

function year5MultiStepBuildTemplates(): MultiStepMethodTemplate[] {
  return [
    {
      title: "Bike final cost",
      prompt: "A bike costs $300. It is reduced by 20%, then a $15 service fee is added.",
      contextLabel: "Find the discount, subtract it, then add the fee.",
      visual: discountVisual({ item: "bike", price: 300, percent: 20, ask: "discount" }, "price_tag", true),
      steps: [
        { prompt: "Find 20% of 300", answer: "60" },
        { prompt: "300 - 60 =", answer: "240" },
        { prompt: "240 + 15 =", answer: "255" },
      ],
    },
    {
      title: "Three sale items",
      prompt: "A $50 item is 20% off. You buy 3 items.",
      contextLabel: "Find the sale price of one item, then multiply by 3.",
      visual: discountVisual({ item: "sale item", price: 50, percent: 20, ask: "discount" }, "shop_item", true),
      steps: [
        { prompt: "Find 20% of 50", answer: "10" },
        { prompt: "50 - 10 =", answer: "40" },
        { prompt: "40 × 3 =", answer: "120" },
      ],
    },
    {
      title: "Budget shortfall",
      prompt: "A game costs $80. It is 25% off. You have a $50 budget.",
      contextLabel: "Find the sale price, then compare with the budget.",
      visual: discountVisual({ item: "game", price: 80, percent: 25, ask: "discount" }, "price_tag", true),
      steps: [
        { prompt: "Find 25% of 80", answer: "20" },
        { prompt: "80 - 20 =", answer: "60" },
        { prompt: "60 - 50 =", answer: "10" },
      ],
    },
    {
      title: "Good items remain",
      prompt: "A box holds 40 items. 25% are damaged. Then 6 more are removed.",
      contextLabel: "Find damaged items, then remove 6 more from the good items.",
      steps: [
        { prompt: "Find 25% of 40", answer: "10" },
        { prompt: "40 - 10 =", answer: "30" },
        { prompt: "30 - 6 =", answer: "24" },
      ],
    },
    {
      title: "Shop comparison",
      prompt: "Shop A gives 20% off $100. Shop B gives $25 off $100.",
      contextLabel: "Calculate both final prices, then choose the cheaper one.",
      visual: discountVisual({ item: "shop comparison", price: 100, percent: 20, ask: "discount" }, "percent_bar", true),
      steps: [
        { prompt: "Shop A discount: 20% of 100", answer: "20" },
        { prompt: "Shop A final: 100 - 20", answer: "80" },
        { prompt: "Shop B final: 100 - 25", answer: "75" },
      ],
    },
    {
      title: "Ticket voucher",
      prompt: "A ticket costs $30. A family buys 4 tickets, then uses a $20 voucher.",
      contextLabel: "Find the total ticket cost, then subtract the voucher.",
      steps: [
        { prompt: "30 × 4 =", answer: "120" },
        { prompt: "120 - 20 =", answer: "100" },
      ],
    },
    {
      title: "Reverse price",
      prompt: "After a 25% discount, an item costs $75.",
      contextLabel: "The final price is 75% of the original.",
      steps: [
        { prompt: "75% of the original is 75. What is 25%?", answer: "25" },
        { prompt: "75 + 25 =", answer: "100" },
      ],
    },
    {
      title: "Groups remaining",
      prompt: "A class has 32 students. They form groups of 4, then 2 groups leave.",
      contextLabel: "Find the number of groups first, then subtract groups.",
      steps: [
        { prompt: "32 ÷ 4 =", answer: "8" },
        { prompt: "8 - 2 =", answer: "6" },
      ],
    },
    {
      title: "Fixed then percent discount",
      prompt: "A $75 bundle has $15 off, then 10% off the new price.",
      contextLabel: "Apply the fixed discount before the percentage discount.",
      visual: discountVisual({ item: "bundle", price: 75, percent: 10, ask: "discount" }, "price_tag", true),
      steps: [
        { prompt: "75 - 15 =", answer: "60" },
        { prompt: "Find 10% of 60", answer: "6" },
        { prompt: "60 - 6 =", answer: "54" },
      ],
    },
    {
      title: "Scale and subtract",
      prompt: "A recipe serves 4 people. You triple it, then remove 2 portions.",
      contextLabel: "Scale the amount, then subtract the removed portions.",
      steps: [
        { prompt: "4 × 3 =", answer: "12" },
        { prompt: "12 - 2 =", answer: "10" },
      ],
    },
  ];
}

function year5MultiStepSolveTemplates(): MultiStepChoiceTemplate[] {
  return [
    {
      prompt: "A $200 item has $30 taken off, then 20% off the new price. What is the final price?",
      answer: "$136",
      options: ["$136", "$130", "$160", "$150"],
      helper: "Subtract $30 first, then apply 20% to the new price.",
      visual: discountVisual({ item: "order matters", price: 200, percent: 20, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "A $50 item is 20% off. You buy 3 items. What is the total cost?",
      answer: "$120",
      options: ["$120", "$150", "$90", "$40"],
      helper: "Find one sale price, then multiply by 3.",
      visual: discountVisual({ item: "3 items", price: 50, percent: 20, ask: "discount" }, "shop_item", true),
    },
    {
      prompt: "Shop A gives 20% off $100. Shop B gives $25 off $100. Which is cheaper?",
      answer: "Shop B",
      options: ["Shop B", "Shop A", "They are equal", "Cannot tell"],
      helper: "Compare the final prices.",
      visual: discountVisual({ item: "shop offers", price: 100, percent: 20, ask: "discount" }, "percent_bar", true),
    },
    {
      prompt: "After a 25% discount, an item costs $75. What was the original price?",
      answer: "$100",
      options: ["$100", "$75", "$25", "$93.75"],
      helper: "75 is 75% of the original.",
    },
    {
      prompt: "A $120 item is 25% off. You have a $100 budget. Can you afford it?",
      answer: "Yes, $10 left",
      options: ["Yes, $10 left", "No, $10 short", "Yes, $30 left", "No, $20 short"],
      helper: "Find the final price, then compare with $100.",
      visual: discountVisual({ item: "budget check", price: 120, percent: 25, ask: "discount" }, "price_tag", true),
    },
    {
      prompt: "A box has 40 items. 25% are damaged, then 6 more are removed. How many good items remain?",
      answer: "24",
      options: ["24", "30", "34", "10"],
      helper: "Find damaged items, then subtract the extra removed items.",
    },
    {
      prompt: "A ticket costs $30. A family buys 4 tickets, then uses a $20 voucher. How much do they pay?",
      answer: "$100",
      options: ["$100", "$120", "$80", "$50"],
      helper: "Multiply first, then subtract the voucher.",
    },
    {
      prompt: "A $300 bike is 20% off, then a $15 fee is added. What is the final cost?",
      answer: "$255",
      options: ["$255", "$240", "$275", "$225"],
      helper: "Find the sale price, then add the fee.",
      visual: discountVisual({ item: "bike", price: 300, percent: 20, ask: "discount" }, "shop_item", true),
    },
    {
      prompt: "A class has 32 students. They form groups of 4, then 2 groups leave. How many groups remain?",
      answer: "6",
      options: ["6", "8", "4", "30"],
      helper: "Divide into groups, then subtract groups.",
    },
    {
      prompt: "A $75 bundle has $15 off, then 10% off the new price. What is the final price?",
      answer: "$54",
      options: ["$54", "$60", "$52.50", "$67.50"],
      helper: "The percent discount applies after the fixed discount.",
      visual: discountVisual({ item: "bundle", price: 75, percent: 10, ask: "discount" }, "price_tag", true),
    },
  ];
}

function strategyChoice(
  label: string,
  tag: StrategyOwnershipVisualData["strategies"][number]["tag"],
  feedback: string
): StrategyOwnershipVisualData["strategies"][number] {
  return { label, tag, feedback };
}

function year5ChooseYourStrategyTemplates(mode: string | undefined): StrategyOwnershipTemplate[] {
  const quick: StrategyOwnershipTemplate[] = [
    {
      prompt: "398 + 47",
      answer: "445",
      strategies: [
        strategyChoice("Round and adjust", "FAST", "Nice choice. Rounding 398 to 400 makes this quick, then adjust back."),
        strategyChoice("Split the number", "CLEAR", "That strategy works well. Split 47 into 40 and 7, then add in parts."),
        strategyChoice("Column method", "CLEAR", "That method is valid and clear, though another strategy may be faster here."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "Good ownership. Your own method is valid if your working stays accurate."),
      ],
      reflectionPrompt: "Was your method fast, clear, or both?",
      reflectionOptions: ["Fast", "Clear", "Both", "I want to try another way"],
    },
    {
      prompt: "602 - 198",
      answer: "404",
      strategies: [
        strategyChoice("Compensation", "FAST", "Smart choice. 602 - 200 + 2 is efficient for this problem."),
        strategyChoice("Round and adjust", "FAST", "That strategy matches the numbers well. Adjust carefully after rounding 198."),
        strategyChoice("Column method", "CLEAR", "That strategy can work. It is clear, but compensation may be quicker here."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "Your strategy can work. Check each adjustment carefully."),
      ],
      reflectionPrompt: "Would you use the same strategy next time?",
      reflectionOptions: ["Yes", "Maybe", "I would compare methods", "I would try another way"],
    },
    {
      prompt: "3.75 + 1.25",
      answer: "5",
      strategies: [
        strategyChoice("Mental maths", "FAST", "Nice choice. These decimals combine neatly to make a whole number."),
        strategyChoice("Use place value knowledge", "SMART CHOICE", "Good thinking. Hundredths and tenths line up cleanly here."),
        strategyChoice("Column method", "CLEAR", "That method is valid and clear. Make sure the decimal points line up."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "That can work. Keep the decimal places accurate."),
      ],
      reflectionPrompt: "Which strategy felt easiest for you?",
      reflectionOptions: ["Mental maths", "Place value", "Column method", "My own method"],
    },
  ];

  const build: StrategyOwnershipTemplate[] = [
    {
      prompt: "5.98 + 2.4",
      answer: "8.38",
      strategies: [
        strategyChoice("Round and adjust", "FAST", "Efficient choice. 5.98 is close to 6, then adjust by 0.02."),
        strategyChoice("Column method", "CLEAR", "Clear strategy. Line up the decimal points and include the zero in 2.40."),
        strategyChoice("Use place value knowledge", "SMART CHOICE", "Good choice. Think in tenths and hundredths to keep the decimal accurate."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "Your own strategy is valid if it keeps the decimal places clear."),
      ],
      reflectionPrompt: "Did your method keep the decimal places clear?",
      reflectionOptions: ["Yes", "Mostly", "I checked it another way", "I want to try another way"],
    },
    {
      prompt: "999 + 246",
      answer: "1245",
      strategies: [
        strategyChoice("Compensation", "FAST", "Smart choice. Add 1000, then subtract 1."),
        strategyChoice("Split the number", "CLEAR", "That works well. Split 246 into hundreds, tens, and ones."),
        strategyChoice("Column method", "CLEAR", "Valid and reliable. Another method may be faster because 999 is close to 1000."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "Good ownership. Check your adjustment so the final answer stays accurate."),
      ],
      reflectionPrompt: "Could another strategy also work?",
      reflectionOptions: ["Yes", "No", "I want to compare", "I used my own method"],
    },
    {
      prompt: "1200 - 375",
      answer: "825",
      strategies: [
        strategyChoice("Split the number", "CLEAR", "That strategy works. Subtract 300, then 75."),
        strategyChoice("Round and adjust", "SMART CHOICE", "Useful choice. Subtract 400, then add 25 back."),
        strategyChoice("Column method", "CLEAR", "That method is valid and careful. Watch the regrouping."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "Your method can work. Check the subtraction in parts."),
      ],
      reflectionPrompt: "Was your method clear enough to check?",
      reflectionOptions: ["Yes", "Mostly", "Not yet", "I would try another way"],
    },
    {
      prompt: "49 × 6",
      answer: "294",
      strategies: [
        strategyChoice("Round and adjust", "FAST", "Efficient choice. 50 × 6, then subtract one group of 6."),
        strategyChoice("Split the number", "CLEAR", "That works. Use 40 × 6 and 9 × 6, then combine."),
        strategyChoice("Use place value knowledge", "SMART CHOICE", "Good choice. Multiplying tens and ones separately keeps it organised."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "That can work. Check the final product carefully."),
      ],
      reflectionPrompt: "Was your strategy fast, clear, or both?",
      reflectionOptions: ["Fast", "Clear", "Both", "I want another method"],
    },
  ];

  const challenge: StrategyOwnershipTemplate[] = [
    {
      prompt: "24 × 15",
      answer: "360",
      strategies: [
        strategyChoice("Split the number", "CLEAR", "Good choice. 24 × 10 and 24 × 5 are useful parts."),
        strategyChoice("Mental maths", "FAST", "That can be efficient if you see 15 as 10 + 5."),
        strategyChoice("Column method", "CLEAR", "Valid and reliable. Make sure both partial products are included."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "Your method is valid if it accounts for all 15 groups."),
      ],
      reflectionPrompt: "Would you solve this the same way next time?",
      reflectionOptions: ["Yes", "Maybe", "I would compare methods", "No"],
    },
    {
      prompt: "7.5 + 2.75",
      answer: "10.25",
      strategies: [
        strategyChoice("Use place value knowledge", "SMART CHOICE", "Good thinking. Keep tenths and hundredths lined up."),
        strategyChoice("Column method", "CLEAR", "Clear strategy. Write 7.50 so both numbers have hundredths."),
        strategyChoice("Mental maths", "FAST", "This can work if you combine 7.5 + 2.5, then add 0.25."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "Your strategy can work. Check the decimal places."),
      ],
      reflectionPrompt: "Which part needed the most care?",
      reflectionOptions: ["Decimal places", "Adding parts", "Checking", "Choosing a method"],
    },
    {
      prompt: "450 ÷ 6 + 28",
      answer: "103",
      strategies: [
        strategyChoice("Use place value knowledge", "SMART CHOICE", "Good choice. Divide 450 by 6 first, then add 28."),
        strategyChoice("Split the number", "CLEAR", "That can work. Split 450 into parts that divide cleanly by 6."),
        strategyChoice("Mental maths", "FAST", "Efficient if you know 45 ÷ 6 = 7.5, so 450 ÷ 6 = 75."),
        strategyChoice("Another way / my own method", "SMART CHOICE", "Your method is valid if you do the division before adding."),
      ],
      reflectionPrompt: "Did the order of steps matter?",
      reflectionOptions: ["Yes", "No", "I checked it", "I want to compare"],
    },
  ];

  if (mode === "choose_strategy_apply") return challenge;
  if (mode === "choose_strategy_reflect") return build;
  return quick;
}

function year5StrategyFluencyTemplates(mode: string | undefined): StrategyOwnershipTemplate[] {
  const strategies: StrategyOwnershipTemplate["strategies"] = [
    strategyChoice("Mental maths", "FAST", "Nice if you can hold the parts in your head. Check the calculation carefully."),
    strategyChoice("Split numbers", "CLEAR", "That works well. Breaking the numbers into parts can make the thinking clear."),
    strategyChoice("Round & adjust", "SMART CHOICE", "Useful when a number is close to a benchmark. Remember to adjust back."),
    strategyChoice("Column method", "CLEAR", "That strategy is valid and reliable. It may be slower, but it keeps the work organised."),
  ];
  const reflectionPrompt = "Was your method fast, clear, or worth trying another way?";
  const reflectionOptions = ["Fast", "Clear", "Both", "Try another way"];

  const byMode: Record<string, StrategyOwnershipTemplate[]> = {
    strategy_fluency_addition: [
      { prompt: "398 + 47", answer: "445", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "999 + 246", answer: "1245", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "1,250 + 375", answer: "1625", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "2,499 + 518", answer: "3017", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "3,750 + 1,250", answer: "5000", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "1,998 + 307", answer: "2305", strategies, reflectionPrompt, reflectionOptions },
    ],
    strategy_fluency_subtraction: [
      { prompt: "602 - 198", answer: "404", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "1,000 - 376", answer: "624", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "1,204 - 399", answer: "805", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "3,005 - 998", answer: "2007", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "2,500 - 1,245", answer: "1255", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "4,010 - 1,999", answer: "2011", strategies, reflectionPrompt, reflectionOptions },
    ],
    strategy_fluency_decimal_addition: [
      { prompt: "5.98 + 2.4", answer: "8.38", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "3.75 + 1.25", answer: "5", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "12.5 + 0.75", answer: "13.25", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "4.099 + 0.901", answer: "5", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "7.6 + 2.45", answer: "10.05", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "18.375 + 1.625", answer: "20", strategies, reflectionPrompt, reflectionOptions },
    ],
    strategy_fluency_decimal_subtraction: [
      { prompt: "6.02 - 1.98", answer: "4.04", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "10.5 - 2.75", answer: "7.75", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "8.000 - 3.125", answer: "4.875", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "12.4 - 0.99", answer: "11.41", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "5.75 - 1.25", answer: "4.5", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "20.05 - 4.5", answer: "15.55", strategies, reflectionPrompt, reflectionOptions },
    ],
    strategy_fluency_multiplication: [
      { prompt: "49 × 6", answer: "294", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "25 × 16", answer: "400", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "50 × 18", answer: "900", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "125 × 8", answer: "1000", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "99 × 11", answer: "1089", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "24 × 15", answer: "360", strategies, reflectionPrompt, reflectionOptions },
    ],
    strategy_fluency_division: [
      { prompt: "450 ÷ 6", answer: "75", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "1,000 ÷ 8", answer: "125", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "900 ÷ 12", answer: "75", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "1,250 ÷ 5", answer: "250", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "864 ÷ 9", answer: "96", strategies, reflectionPrompt, reflectionOptions },
      { prompt: "2,400 ÷ 50", answer: "48", strategies, reflectionPrompt, reflectionOptions },
    ],
  };

  return byMode[mode ?? ""] ?? byMode.strategy_fluency_addition;
}

type MixedOperationsChallengeTemplate = {
  prompt: string;
  answer: string;
  operation: "addition" | "subtraction" | "multiplication" | "division";
};

function mixedOperationTemplate(
  operation: MixedOperationsChallengeTemplate["operation"],
  prompt: string,
  answer: string
): MixedOperationsChallengeTemplate {
  return { operation, prompt, answer };
}

function year5MixedOperationsChallengeTemplates(mode: string | undefined): MixedOperationsChallengeTemplate[] {
  const byMode: Record<string, MixedOperationsChallengeTemplate[]> = {
    mixed_ops_addition: [
      mixedOperationTemplate("addition", "398 + 47", "445"),
      mixedOperationTemplate("addition", "999 + 246", "1245"),
      mixedOperationTemplate("addition", "1,250 + 375", "1625"),
      mixedOperationTemplate("addition", "2,499 + 518", "3017"),
      mixedOperationTemplate("addition", "3,750 + 1,250", "5000"),
      mixedOperationTemplate("addition", "1,998 + 307", "2305"),
      mixedOperationTemplate("addition", "5.98 + 2.4", "8.38"),
      mixedOperationTemplate("addition", "3.75 + 1.25", "5"),
      mixedOperationTemplate("addition", "12.5 + 0.75", "13.25"),
      mixedOperationTemplate("addition", "4.099 + 0.901", "5"),
      mixedOperationTemplate("addition", "7.6 + 2.45", "10.05"),
      mixedOperationTemplate("addition", "18.375 + 1.625", "20"),
      mixedOperationTemplate("addition", "48.75 + 6.25", "55"),
    ],
    mixed_ops_subtraction: [
      mixedOperationTemplate("subtraction", "602 - 198", "404"),
      mixedOperationTemplate("subtraction", "1,000 - 376", "624"),
      mixedOperationTemplate("subtraction", "1,204 - 399", "805"),
      mixedOperationTemplate("subtraction", "3,005 - 998", "2007"),
      mixedOperationTemplate("subtraction", "2,500 - 1,245", "1255"),
      mixedOperationTemplate("subtraction", "4,010 - 1,999", "2011"),
      mixedOperationTemplate("subtraction", "6.02 - 1.98", "4.04"),
      mixedOperationTemplate("subtraction", "10.5 - 2.75", "7.75"),
      mixedOperationTemplate("subtraction", "8.000 - 3.125", "4.875"),
      mixedOperationTemplate("subtraction", "12.4 - 0.99", "11.41"),
      mixedOperationTemplate("subtraction", "20.05 - 4.5", "15.55"),
      mixedOperationTemplate("subtraction", "5.75 - 1.25", "4.5"),
      mixedOperationTemplate("subtraction", "18.375 - 0.875", "17.5"),
    ],
    mixed_ops_multiplication: [
      mixedOperationTemplate("multiplication", "49 × 6", "294"),
      mixedOperationTemplate("multiplication", "25 × 16", "400"),
      mixedOperationTemplate("multiplication", "50 × 18", "900"),
      mixedOperationTemplate("multiplication", "125 × 8", "1000"),
      mixedOperationTemplate("multiplication", "99 × 11", "1089"),
      mixedOperationTemplate("multiplication", "24 × 15", "360"),
      mixedOperationTemplate("multiplication", "48 × 25", "1200"),
      mixedOperationTemplate("multiplication", "32 × 125", "4000"),
      mixedOperationTemplate("multiplication", "75 × 12", "900"),
      mixedOperationTemplate("multiplication", "250 × 16", "4000"),
      mixedOperationTemplate("multiplication", "36 × 24", "864"),
      mixedOperationTemplate("multiplication", "84 × 11", "924"),
      mixedOperationTemplate("multiplication", "125 × 24", "3000"),
    ],
    mixed_ops_division: [
      mixedOperationTemplate("division", "1,200 ÷ 6", "200"),
      mixedOperationTemplate("division", "450 ÷ 6", "75"),
      mixedOperationTemplate("division", "1,000 ÷ 8", "125"),
      mixedOperationTemplate("division", "900 ÷ 12", "75"),
      mixedOperationTemplate("division", "1,250 ÷ 5", "250"),
      mixedOperationTemplate("division", "864 ÷ 9", "96"),
      mixedOperationTemplate("division", "2,400 ÷ 50", "48"),
      mixedOperationTemplate("division", "1,440 ÷ 12", "120"),
      mixedOperationTemplate("division", "3,600 ÷ 24", "150"),
      mixedOperationTemplate("division", "2,500 ÷ 25", "100"),
      mixedOperationTemplate("division", "4,096 ÷ 8", "512"),
      mixedOperationTemplate("division", "750 ÷ 15", "50"),
      mixedOperationTemplate("division", "1,728 ÷ 12", "144"),
    ],
  };

  return byMode[mode ?? ""] ?? [
    ...byMode.mixed_ops_addition,
    ...byMode.mixed_ops_subtraction,
    ...byMode.mixed_ops_multiplication,
    ...byMode.mixed_ops_division,
  ];
}

function year5MultiStepCalculationTemplates(mode: string | undefined): MixedOperationsChallengeTemplate[] {
  const byMode: Record<string, MixedOperationsChallengeTemplate[]> = {
    multi_step_calc_add_sub: [
      mixedOperationTemplate("addition", "250 + 375 - 125", "500"),
      mixedOperationTemplate("addition", "600 - 198 + 45", "447"),
      mixedOperationTemplate("addition", "900 + 246 - 100", "1046"),
      mixedOperationTemplate("addition", "1,250 + 480 - 275", "1455"),
      mixedOperationTemplate("addition", "999 + 367 - 200", "1166"),
      mixedOperationTemplate("addition", "602 - 398 + 75", "279"),
      mixedOperationTemplate("addition", "1,800 - 975 + 240", "1065"),
      mixedOperationTemplate("addition", "4,250 + 680 - 999", "3931"),
      mixedOperationTemplate("addition", "3.75 + 1.25 - 2.5", "2.5"),
      mixedOperationTemplate("addition", "5.98 - 2.49 + 1.2", "4.69"),
      mixedOperationTemplate("addition", "12.4 + 3.65 - 4.2", "11.85"),
      mixedOperationTemplate("addition", "18.75 - 9.5 + 2.25", "11.5"),
      mixedOperationTemplate("addition", "7.8 + 4.35 - 1.9", "10.25"),
      mixedOperationTemplate("addition", "20.05 - 8.75 + 1.2", "12.5"),
    ],
    multi_step_calc_mult_div: [
      mixedOperationTemplate("multiplication", "48 × 25 ÷ 5", "240"),
      mixedOperationTemplate("multiplication", "125 × 8 ÷ 4", "250"),
      mixedOperationTemplate("multiplication", "360 ÷ 9 × 5", "200"),
      mixedOperationTemplate("multiplication", "84 × 6 ÷ 7", "72"),
      mixedOperationTemplate("multiplication", "96 ÷ 12 × 25", "200"),
      mixedOperationTemplate("multiplication", "144 ÷ 8 × 15", "270"),
      mixedOperationTemplate("multiplication", "72 × 25 ÷ 6", "300"),
      mixedOperationTemplate("multiplication", "450 ÷ 15 × 8", "240"),
      mixedOperationTemplate("multiplication", "64 × 125 ÷ 8", "1000"),
      mixedOperationTemplate("multiplication", "240 ÷ 6 × 18", "720"),
      mixedOperationTemplate("multiplication", "1,200 ÷ 24 × 9", "450"),
      mixedOperationTemplate("multiplication", "225 × 12 ÷ 9", "300"),
      mixedOperationTemplate("multiplication", "560 ÷ 14 × 11", "440"),
      mixedOperationTemplate("multiplication", "1,500 ÷ 25 × 16", "960"),
    ],
    multi_step_calc_mixed: [
      mixedOperationTemplate("multiplication", "12 + 6 × 4", "36"),
      mixedOperationTemplate("multiplication", "20 - 4 × 3", "8"),
      mixedOperationTemplate("multiplication", "18 + 7 × 5", "53"),
      mixedOperationTemplate("multiplication", "90 - 8 × 9", "18"),
      mixedOperationTemplate("multiplication", "35 + 12 × 6", "107"),
      mixedOperationTemplate("multiplication", "150 - 11 × 12", "18"),
      mixedOperationTemplate("multiplication", "48 + 25 × 8", "248"),
      mixedOperationTemplate("multiplication", "400 - 24 × 15", "40"),
      mixedOperationTemplate("division", "144 ÷ 12 + 38", "50"),
      mixedOperationTemplate("division", "250 - 96 ÷ 8", "238"),
      mixedOperationTemplate("division", "1,200 ÷ 6 + 175", "375"),
      mixedOperationTemplate("division", "999 - 360 ÷ 9", "959"),
      mixedOperationTemplate("division", "84 + 540 ÷ 6", "174"),
      mixedOperationTemplate("division", "602 - 144 ÷ 12", "590"),
    ],
  };

  return byMode[mode ?? ""] ?? [
    ...byMode.multi_step_calc_add_sub,
    ...byMode.multi_step_calc_mult_div,
    ...byMode.multi_step_calc_mixed,
  ];
}

function year5EstimateReasonablenessTemplates(mode: string | undefined): ReasonablenessChoiceTemplate[] {
  const yesNo: ReasonablenessChoiceTemplate[] = [
    { prompt: "398 + 204 = 602. Does it make sense?", answer: "Yes", options: ["Yes", "No"], helper: "Nice — that makes sense." },
    { prompt: "999 + 246 = 1,145. Does it make sense?", answer: "No", options: ["Yes", "No"], helper: "Check your estimate — is that too big or too small?" },
    { prompt: "602 - 198 = 404. Does it make sense?", answer: "Yes", options: ["Yes", "No"], helper: "Nice — that makes sense." },
    { prompt: "6.02 - 1.98 = 5.04. Does it make sense?", answer: "No", options: ["Yes", "No"], helper: "Check your estimate — is that too big or too small?" },
    { prompt: "49 × 6 = 294. Does it make sense?", answer: "Yes", options: ["Yes", "No"], helper: "Nice — that makes sense." },
    { prompt: "25 × 48 = 2,400. Does it make sense?", answer: "No", options: ["Yes", "No"], helper: "Check your estimate — is that too big or too small?" },
    { prompt: "450 ÷ 6 = 75. Does it make sense?", answer: "Yes", options: ["Yes", "No"], helper: "Nice — that makes sense." },
    { prompt: "1,000 ÷ 8 = 80. Does it make sense?", answer: "No", options: ["Yes", "No"], helper: "Check your estimate — is that too big or too small?" },
    { prompt: "5.98 + 2.4 = 8.38. Does it make sense?", answer: "Yes", options: ["Yes", "No"], helper: "Nice — that makes sense." },
    { prompt: "12.4 - 0.99 = 10.41. Does it make sense?", answer: "No", options: ["Yes", "No"], helper: "Check your estimate — is that too big or too small?" },
  ];

  const closer: ReasonablenessChoiceTemplate[] = [
    { prompt: "Which estimate is closer for 398 + 47?", answer: "450", options: ["400", "450", "500"], helper: "Round 398 to 400, then add about 50." },
    { prompt: "Which estimate is closer for 602 - 198?", answer: "400", options: ["300", "400", "500"], helper: "Think 600 - 200." },
    { prompt: "Which estimate is closer for 5.98 + 2.4?", answer: "8.4", options: ["7.4", "8.4", "9.4"], helper: "Think 6 + 2.4." },
    { prompt: "Which estimate is closer for 10.5 - 2.75?", answer: "8", options: ["6", "8", "10"], helper: "Think about 10.5 - 3." },
    { prompt: "Which estimate is closer for 49 × 6?", answer: "300", options: ["200", "300", "400"], helper: "Think 50 × 6." },
    { prompt: "Which estimate is closer for 25 × 16?", answer: "400", options: ["250", "400", "800"], helper: "Think 25 × 4 × 4." },
    { prompt: "Which estimate is closer for 450 ÷ 6?", answer: "75", options: ["45", "75", "90"], helper: "Use 6 × 75 = 450." },
    { prompt: "Which estimate is closer for 1,000 ÷ 8?", answer: "125", options: ["80", "125", "180"], helper: "Think half, half, half." },
    { prompt: "Which estimate is closer for 999 + 246?", answer: "1,250", options: ["1,000", "1,250", "1,500"], helper: "Think 1,000 + 250." },
    { prompt: "Which estimate is closer for 6.02 - 1.98?", answer: "4", options: ["3", "4", "5"], helper: "Think 6 - 2." },
  ];

  const quick: ReasonablenessChoiceTemplate[] = [
    { prompt: "Quick estimate: 199 + 398", answer: "600", options: ["400", "600", "800"], helper: "Round to 200 + 400." },
    { prompt: "Quick estimate: 999 + 246", answer: "1,250", options: ["1,000", "1,250", "1,750"], helper: "Round to 1,000 + 250." },
    { prompt: "Quick estimate: 602 - 198", answer: "400", options: ["200", "400", "600"], helper: "Round to 600 - 200." },
    { prompt: "Quick estimate: 12.5 + 0.75", answer: "13", options: ["12", "13", "15"], helper: "Think about 12.5 + 0.5." },
    { prompt: "Quick estimate: 8.000 - 3.125", answer: "5", options: ["3", "5", "8"], helper: "Think 8 - 3." },
    { prompt: "Quick estimate: 50 × 18", answer: "900", options: ["500", "900", "1,800"], helper: "Think half of 100 × 18." },
    { prompt: "Quick estimate: 25 × 48", answer: "1,200", options: ["600", "1,200", "2,400"], helper: "25 is one quarter of 100." },
    { prompt: "Quick estimate: 864 ÷ 9", answer: "100", options: ["50", "100", "200"], helper: "9 × 100 is 900." },
    { prompt: "Quick estimate: 2,400 ÷ 50", answer: "50", options: ["25", "50", "100"], helper: "50 × 50 is 2,500." },
    { prompt: "Quick estimate: 7.6 + 2.45", answer: "10", options: ["8", "10", "12"], helper: "Think 7.5 + 2.5." },
  ];

  if (mode === "estimate_closer") return closer;
  if (mode === "quick_estimate") return quick;
  return yesNo;
}

function year5FinalTuneUpFluencyTemplates(): MixedOperationsChallengeTemplate[] {
  return [
    mixedOperationTemplate("addition", "4,398 + 587", "4985"),
    mixedOperationTemplate("addition", "6,975 + 1,248", "8223"),
    mixedOperationTemplate("addition", "9,996 + 1,275", "11271"),
    mixedOperationTemplate("subtraction", "8,402 - 1,998", "6404"),
    mixedOperationTemplate("subtraction", "12,005 - 5,998", "6007"),
    mixedOperationTemplate("subtraction", "6,700 - 2,485", "4215"),
    mixedOperationTemplate("addition", "19.75 + 8.26", "28.01"),
    mixedOperationTemplate("subtraction", "18.04 - 7.99", "10.05"),
    mixedOperationTemplate("multiplication", "96 × 25", "2400"),
    mixedOperationTemplate("multiplication", "125 × 24", "3000"),
    mixedOperationTemplate("division", "4,320 ÷ 12", "360"),
    mixedOperationTemplate("division", "8,064 ÷ 32", "252"),
  ];
}

function year5FinalTuneUpChallengeTemplates(): MixedOperationsChallengeTemplate[] {
  return [
    mixedOperationTemplate("addition", "250 + 375 - 125", "500"),
    mixedOperationTemplate("addition", "600 - 198 + 45", "447"),
    mixedOperationTemplate("addition", "4,250 + 680 - 999", "3931"),
    mixedOperationTemplate("addition", "3.75 + 1.25 - 2.5", "2.5"),
    mixedOperationTemplate("addition", "5.98 - 2.49 + 1.2", "4.69"),
    mixedOperationTemplate("addition", "20.05 - 8.75 + 1.2", "12.5"),
    mixedOperationTemplate("multiplication", "48 × 25 ÷ 5", "240"),
    mixedOperationTemplate("multiplication", "125 × 8 ÷ 4", "250"),
    mixedOperationTemplate("multiplication", "360 ÷ 9 × 5", "200"),
    mixedOperationTemplate("multiplication", "12 + 6 × 4", "36"),
    mixedOperationTemplate("division", "1,200 ÷ 6 + 175", "375"),
    mixedOperationTemplate("division", "999 - 360 ÷ 9", "959"),
  ];
}

function discountStepVisual(template: DiscountStepTemplate): DiscountStepMethodVisualData {
  const discount = discountAmount(template.price, template.percent);
  const finalPrice = template.price - discount;
  const decimal = template.percent / 100;
  const decimalText = Number.isInteger(decimal) ? String(decimal) : String(decimal).replace(/0+$/, "");
  const steps =
    template.method === "decimal"
      ? [
          { prompt: `Convert ${template.percent}% to a decimal`, answer: decimalText },
          { prompt: `${decimalText} × ${template.price} =`, answer: String(discount) },
          { prompt: `${template.price} - ${discount} =`, answer: String(finalPrice) },
        ]
      : [
          { prompt: `What is ${template.percent}% of ${template.price}?`, answer: String(discount) },
          { prompt: `${template.price} - ${discount} =`, answer: String(finalPrice) },
        ];

  return {
    type: "discount_step_method",
    item: template.item,
    price: template.price,
    percent: template.percent,
    discount,
    finalPrice,
    visualMode: template.method === "decimal" ? "percent_bar" : "before_after",
    method: template.method,
    steps,
  };
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

function year5FractionDecimalPercentSets(
  usage?: "match" | "convert" | "reasoning"
): FractionDecimalPercentSet[] {
  const sets: Array<FractionDecimalPercentSet & { usage: Array<"match" | "convert" | "reasoning"> }> = [
    { id: "half", fraction: "1/2", decimal: "0.5", percent: "50%", usage: ["match"] },
    { id: "quarter", fraction: "1/4", decimal: "0.25", percent: "25%", usage: ["match"] },
    { id: "three-quarters", fraction: "3/4", decimal: "0.75", percent: "75%", usage: ["match"] },
    { id: "fifth", fraction: "1/5", decimal: "0.2", percent: "20%", usage: ["match"] },
    { id: "three-fifths", fraction: "3/5", decimal: "0.6", percent: "60%", usage: ["match"] },
    { id: "tenth", fraction: "1/10", decimal: "0.1", percent: "10%", usage: ["match"] },
    { id: "two-fifths", fraction: "2/5", decimal: "0.4", percent: "40%", usage: ["convert"] },
    { id: "eighth", fraction: "1/8", decimal: "0.125", percent: "12.5%", usage: ["convert"] },
    { id: "three-tenths", fraction: "3/10", decimal: "0.3", percent: "30%", usage: ["convert"] },
    { id: "four-fifths", fraction: "4/5", decimal: "0.8", percent: "80%", usage: ["convert"] },
    { id: "three-eighths", fraction: "3/8", decimal: "0.375", percent: "37.5%", usage: ["convert"] },
    { id: "five-eighths", fraction: "5/8", decimal: "0.625", percent: "62.5%", usage: ["convert"] },
    { id: "seven-tenths", fraction: "7/10", decimal: "0.7", percent: "70%", usage: ["reasoning"] },
    { id: "nine-tenths", fraction: "9/10", decimal: "0.9", percent: "90%", usage: ["reasoning"] },
    { id: "twentieth", fraction: "1/20", decimal: "0.05", percent: "5%", usage: ["reasoning"] },
    { id: "three-twentieths", fraction: "3/20", decimal: "0.15", percent: "15%", usage: ["reasoning"] },
    { id: "hundredth", fraction: "1/100", decimal: "0.01", percent: "1%", usage: ["reasoning"] },
    { id: "fiftieth", fraction: "1/50", decimal: "0.02", percent: "2%", usage: ["reasoning"] },
  ];

  return sets
    .filter((set) => (usage ? set.usage.includes(usage) : true))
    .map((set) => ({
      id: set.id,
      fraction: set.fraction,
      decimal: set.decimal,
      percent: set.percent,
    }));
}

function parseFractionParts(fraction: string) {
  const [numerator, denominator] = fraction.split("/").map(Number);
  return { numerator, denominator };
}

function year5BenchmarkValues() {
  return [
    { id: "quarter", label: "1/4", category: "less" as const },
    { id: "three-eighths", label: "3/8", category: "less" as const },
    { id: "forty-percent", label: "40%", category: "less" as const },
    { id: "zero-point-four-five", label: "0.45", category: "less" as const },
    { id: "two-quarters", label: "2/4", category: "equal" as const },
    { id: "five-tenths", label: "5/10", category: "equal" as const },
    { id: "zero-point-five", label: "0.5", category: "equal" as const },
    { id: "fifty-percent", label: "50%", category: "equal" as const },
    { id: "three-quarters", label: "3/4", category: "greater" as const },
    { id: "seven-eighths", label: "7/8", category: "greater" as const },
    { id: "three-fifths", label: "3/5", category: "greater" as const },
    { id: "zero-point-six", label: "0.6", category: "greater" as const },
    { id: "sixty-five-percent", label: "65%", category: "greater" as const },
  ];
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

function year5EquivalentFractionPairs() {
  return [
    { source: { numerator: 1, denominator: 2 }, equivalent: { numerator: 2, denominator: 4 } },
    { source: { numerator: 1, denominator: 2 }, equivalent: { numerator: 3, denominator: 6 } },
    { source: { numerator: 1, denominator: 2 }, equivalent: { numerator: 4, denominator: 8 } },
    { source: { numerator: 1, denominator: 3 }, equivalent: { numerator: 2, denominator: 6 } },
    { source: { numerator: 1, denominator: 3 }, equivalent: { numerator: 3, denominator: 9 } },
    { source: { numerator: 2, denominator: 3 }, equivalent: { numerator: 4, denominator: 6 } },
    { source: { numerator: 2, denominator: 3 }, equivalent: { numerator: 6, denominator: 9 } },
    { source: { numerator: 1, denominator: 4 }, equivalent: { numerator: 2, denominator: 8 } },
    { source: { numerator: 1, denominator: 4 }, equivalent: { numerator: 3, denominator: 12 } },
    { source: { numerator: 3, denominator: 4 }, equivalent: { numerator: 6, denominator: 8 } },
    { source: { numerator: 3, denominator: 4 }, equivalent: { numerator: 9, denominator: 12 } },
    { source: { numerator: 2, denominator: 5 }, equivalent: { numerator: 4, denominator: 10 } },
    { source: { numerator: 2, denominator: 5 }, equivalent: { numerator: 6, denominator: 15 } },
    { source: { numerator: 3, denominator: 5 }, equivalent: { numerator: 6, denominator: 10 } },
    { source: { numerator: 3, denominator: 5 }, equivalent: { numerator: 9, denominator: 15 } },
    { source: { numerator: 3, denominator: 8 }, equivalent: { numerator: 6, denominator: 16 } },
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

export type SameDenominatorOperationVisualData = {
  type: "same_denominator_operation";
  numeratorA: number;
  numeratorB: number;
  denominator: number;
  operation: "+" | "-";
  resultNumerator: number;
  originalNumeratorA?: number;
  originalDenominatorA?: number;
  originalNumeratorB?: number;
  originalDenominatorB?: number;
  conversionLabel?: string;
};

export type FractionDecimalPercentConversionVisualData = {
  type: "fraction_decimal_percent_conversion";
  fraction: string;
  numerator: number;
  denominator: number;
  decimalAnswer: string;
  percentAnswer: string;
};

export type PercentStructuredMethodVisualData = {
  type: "percent_structured_method";
  percent: number;
  amount: number;
  method?: "strategy" | "decimal";
  steps: Array<{
    prompt: string;
    answer: string;
    suffix?: string;
  }>;
};

export type DiscountPriceVisualData = {
  type: "discount_price_tag";
  item: string;
  price: number;
  percent: number;
  discount: number;
  finalPrice: number;
  visualMode?: "price_tag" | "before_after" | "percent_bar" | "shop_item";
  hideValues?: boolean;
};

export type DiscountStepMethodVisualData = Omit<DiscountPriceVisualData, "type"> & {
  type: "discount_step_method";
  method: "strategy" | "decimal";
  steps: Array<{
    prompt: string;
    answer: string;
    suffix?: string;
  }>;
};

export type MultiStepMethodVisualData = {
  type: "multi_step_method";
  title: string;
  contextLabel: string;
  steps: Array<{
    prompt: string;
    answer: string;
    suffix?: string;
  }>;
  supportVisual?: DiscountPriceVisualData;
};

export type StrategyOwnershipVisualData = {
  type: "strategy_ownership";
  missionTitle: string;
  missionDescription: string;
  supportText: string;
  problemLabel: string;
  strategies: Array<{
    label: string;
    tag: "FAST" | "CLEAR" | "SMART CHOICE" | "TRY ANOTHER WAY";
    feedback: string;
  }>;
  reflectionPrompt?: string;
  reflectionOptions?: string[];
};

export type MultipleChoiceQuestion = {
  kind: "multiple_choice";
  prompt: string;
  options: string[];
  answer: string;
  helper?: string;
  instruction?: string;
  correctAnswers?: string[];
  selectionFeedback?: Record<string, string>;
  allCorrectFeedback?: string;
  partialFeedback?: string;
  incorrectFeedback?: string;
  visual?:
    | {
        type: "array";
        rows: number;
        columns: number;
        highlightedRows?: number[];
      }
    | MABVisualData
    | DecimalVisualData
    | DecimalShiftVisualData
    | IntegerNumberLineVisualData
    | IntegerContextVisualData
    | MoneyVisualData
    | SameDenominatorOperationVisualData
    | DiscountPriceVisualData
    | RuleBoxVisualData;
};

export type WrittenMethodLayout = {
  title: string;
  operation: "+" | "-" | "×";
  top: string[];
  bottom: string[];
  answerLength: number;
  placeValueLabels: string[];
  fixedAnswerCells?: string[];
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
    | DecimalShiftVisualData
    | IntegerNumberLineVisualData
    | IntegerContextVisualData
    | ColumnMultiplicationVisualData
    | BoxMethodVisualData
    | MultiplicationStrategyVisualData
    | MultiplicationEstimateStrategyVisualData
    | DivisionRemainderCheckVisualData
    | DivisionBuildGroupsVisualData
    | SameDenominatorOperationVisualData
    | FractionDecimalPercentConversionVisualData
    | PercentStructuredMethodVisualData
    | DiscountStepMethodVisualData
    | MultiStepMethodVisualData
    | StrategyOwnershipVisualData
    | {
        type: "numeric_input_only";
      }
    | {
        type: "equivalent_fraction_input";
        leftNumerator: number;
        leftDenominator: number;
        rightNumerator?: number;
        rightDenominator?: number;
        missing: "numerator" | "denominator";
      }
    | MoneyVisualData
    | RuleBoxVisualData;
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
  | FractionDecimalPercentMatchQuestion
  | BenchmarkSortQuestion
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
    allowedModes: [
      "place_fraction",
      "pick_point",
      "order_fractions",
      "order_compare_fractions",
      "place_fraction_number_line",
      "identify_fraction_point",
      "order_number_line_fractions",
      "skip_count_fraction",
      "mixed_numerals",
    ],
    requiresVisual: true,
  },
  fraction_compare: {
    allowedModes: [
      "symbol_compare",
      "visual_compare",
      "true_false",
      "same_denominator_combine",
      "greater_less_visual",
      "equivalent_to_compare",
    ],
    requiresVisual: true,
  },
  equivalent_fraction_match: {
    requiresVisual: true,
  },
  fraction_decimal_percent_match: {
    requiresVisual: true,
  },
  benchmark_sort: {
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

function formatReasoningDecimal(value: number) {
  return value.toFixed(3).replace(/\.?0+$/, "");
}

function buildDecimalReasoningSet(count = 4): number[] {
  const useLessThanOne = randInt(0, 1) === 0;
  const sharedWhole = useLessThanOne ? 0 : randInt(1, 9);
  const precision = 0.001;
  const factor = 1000;
  const baseFraction = randInt(120, 920);
  const values = new Set<number>();

  while (values.size < count) {
    const offset = randInt(-18, 18);
    const fractionPart = Math.min(999, Math.max(1, baseFraction + offset));
    const value = Number((sharedWhole + fractionPart / factor).toFixed(3));
    values.add(value);
  }

  return Array.from(values);
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

function buildGenericMultipleChoiceOptions(answer: string): string[] {
  const trimmed = answer.trim();

  if (/^(yes|no)$/i.test(trimmed)) {
    return shuffle(["Yes", "No", "Maybe", "Not sure"]);
  }

  if (/^-?\d+$/.test(trimmed)) {
    const answerValue = Number(trimmed);
    const step = Math.max(1, Math.abs(answerValue) >= 20 ? Math.round(Math.abs(answerValue) / 10) : 1);
    const options = new Set<string>([trimmed]);
    for (const candidate of [answerValue - step, answerValue + step, answerValue - 2 * step, answerValue + 2 * step]) {
      options.add(String(candidate));
      if (options.size >= 4) break;
    }
    return shuffle(Array.from(options).slice(0, 4));
  }

  if (/^-?\d+\.\d+$/.test(trimmed)) {
    const answerValue = Number(trimmed);
    const decimalPlaces = (trimmed.split(".")[1] ?? "").length;
    const step = decimalPlaces >= 3 ? 0.001 : decimalPlaces === 2 ? 0.01 : 0.1;
    const format = (value: number) => value.toFixed(decimalPlaces);
    const options = new Set<string>([format(answerValue)]);
    for (const candidate of [
      answerValue - step,
      answerValue + step,
      answerValue - 2 * step,
      answerValue + 2 * step,
    ]) {
      options.add(format(candidate));
      if (options.size >= 4) break;
    }
    return shuffle(Array.from(options).slice(0, 4));
  }

  return shuffle([trimmed, "Not this option", "Check another rule", "Use the rule box"]);
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

function toMoneyWrittenMethodCells(value: string): string[] {
  const [wholePart = "0", decimalPart = "00"] = value.split(".");
  const whole = wholePart.padStart(2, "0").slice(-2);
  const decimals = decimalPart.padEnd(2, "0").slice(0, 2);
  return [
    wholePart.length > 1 ? whole[0] ?? "" : "",
    whole[1] ?? "0",
    ".",
    decimals[0] ?? "0",
    decimals[1] ?? "0",
  ];
}

function buildMoneyAdditionCarryRow(top: string[], bottom: string[]): string[] | undefined {
  const carryRow = Array.from({ length: top.length }, () => "");
  let carry = 0;

  for (let index = top.length - 1; index >= 0; index -= 1) {
    if (top[index] === ".") continue;

    const sum = Number(top[index] || 0) + Number(bottom[index] || 0) + carry;
    carry = sum >= 10 ? 1 : 0;

    if (!carry) continue;

    let targetIndex = index - 1;
    while (targetIndex >= 0 && top[targetIndex] === ".") {
      targetIndex -= 1;
    }
    if (targetIndex >= 0) {
      carryRow[targetIndex] = "1";
    }
  }

  return carryRow.some(Boolean) ? carryRow : undefined;
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

function buildMoneyAdditionWrittenMethodLayout(
  title: string,
  topValue: string,
  bottomValue: string,
  answer: string
): WrittenMethodLayout {
  const top = toMoneyWrittenMethodCells(topValue);
  const bottom = toMoneyWrittenMethodCells(bottomValue);

  return {
    title,
    operation: "+",
    top,
    bottom,
    answerLength: top.length,
    placeValueLabels: ["T", "O", ".", "t", "h"],
    fixedAnswerCells: ["", "", ".", "", ""],
    carryRow: buildMoneyAdditionCarryRow(top, bottom),
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

function validateLessonRotationStructure(
  lesson: Lesson
): Year2PolicyViolation[] {
  const activities = lesson.activities ?? [];
  const violations: Year2PolicyViolation[] = [];

  if (activities.length !== 3) {
    violations.push(
      buildViolation(
        "alignment",
        lesson,
        activities[0]?.activityType ?? "multiple_choice",
        `Every lesson must define exactly 3 rotating activities, but this lesson has ${activities.length}.`
      )
    );
    return violations;
  }

  const requiredRoles = new Set(["fast_thinking", "reasoning", "apply_create"]);
  const seenRoles = new Set<string>();

  for (const activity of activities) {
    const config = (activity.config ?? {}) as GenericConfig & {
      rotationRole?: unknown;
      lessonStructure?: unknown;
    };
    const rotationRole =
      typeof config.rotationRole === "string" ? config.rotationRole : undefined;
    const lessonStructure =
      typeof config.lessonStructure === "string" ? config.lessonStructure : undefined;

    if (!rotationRole || !requiredRoles.has(rotationRole)) {
      violations.push(
        buildViolation(
          "alignment",
          lesson,
          activity.activityType,
          "Each lesson activity must declare one rotation role: fast_thinking, reasoning, or apply_create."
        )
      );
      continue;
    }

    if (seenRoles.has(rotationRole)) {
      violations.push(
        buildViolation(
          "alignment",
          lesson,
          activity.activityType,
          `Lesson activities must use distinct rotation roles, but ${rotationRole} appears more than once.`
        )
      );
    }
    seenRoles.add(rotationRole);

    if (lessonStructure !== "8_minute_rotation") {
      violations.push(
        buildViolation(
          "alignment",
          lesson,
          activity.activityType,
          'Lesson activities must declare lessonStructure: "8_minute_rotation".'
        )
      );
    }
  }

  for (const role of requiredRoles) {
    if (!seenRoles.has(role)) {
      violations.push(
        buildViolation(
          "alignment",
          lesson,
          activities[0]?.activityType ?? "multiple_choice",
          `Lesson is missing the required rotation role "${role}".`
        )
      );
    }
  }

  return violations;
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
    if (config.mode === "y6_integer_order_compare") {
      const templates = [
        {
          prompt: "Order from smallest to largest.",
          numbers: [0, -4, 3],
          helper: "Read the number line from left to right.",
          visual: {
            type: "integer_number_line" as const,
            min: -6,
            max: 6,
            highlightedValues: [-4, 0, 3],
            emphasis: "compare" as const,
          },
        },
        {
          prompt: "Order from smallest to largest.",
          numbers: [-2, 4, -5, 0],
          helper: "Read the number line from left to right.",
          visual: {
            type: "integer_number_line" as const,
            min: -6,
            max: 6,
            highlightedValues: [-5, -2, 0, 4],
            emphasis: "compare" as const,
          },
        },
        {
          prompt: "Order from smallest to largest.",
          numbers: [3, -1, -4, 2],
          helper: "Read the number line from left to right.",
          visual: {
            type: "integer_number_line" as const,
            min: -6,
            max: 6,
            highlightedValues: [-4, -1, 2, 3],
            emphasis: "compare" as const,
          },
        },
        {
          prompt: "Order from smallest to largest.",
          numbers: [-6, -2, -5, 1],
          helper: "Read the number line from left to right.",
          visual: {
            type: "integer_number_line" as const,
            min: -6,
            max: 6,
            highlightedValues: [-6, -5, -2, 1],
            emphasis: "compare" as const,
          },
        },
        {
          prompt: "Order from smallest to largest.",
          numbers: [0, -3, 5, -1],
          helper: "Read the number line from left to right.",
          visual: {
            type: "integer_number_line" as const,
            min: -6,
            max: 6,
            highlightedValues: [-3, -1, 0, 5],
            emphasis: "compare" as const,
          },
        },
        {
          prompt: "Order from smallest to largest.",
          numbers: [-7, 2, -1, 4],
          helper: "Read the number line from left to right.",
          visual: {
            type: "integer_number_line" as const,
            min: -8,
            max: 6,
            highlightedValues: [-7, -1, 2, 4],
            emphasis: "compare" as const,
          },
        },
        {
          prompt: "Order from smallest to largest.",
          numbers: [6, -2, 1, -5],
          helper: "Read the number line from left to right.",
          visual: {
            type: "integer_number_line" as const,
            min: -6,
            max: 6,
            highlightedValues: [-5, -2, 1, 6],
            emphasis: "compare" as const,
          },
        },
        {
          prompt: "Order from smallest to largest.",
          numbers: [-8, -3, 0, 5],
          helper: "Read the number line from left to right.",
          visual: {
            type: "integer_number_line" as const,
            min: -10,
            max: 6,
            highlightedValues: [-8, -3, 0, 5],
            emphasis: "compare" as const,
          },
        },
      ] as const;
      const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
      return {
        kind: "number_order",
        prompt: chosen.prompt,
        numbers: shuffle([...chosen.numbers]),
        ascending: true,
        helper: chosen.helper,
        visual: chosen.visual,
      };
    }

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
    const displayStyle = config.displayStyle === "full_range" ? "full_range" : "auto";
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
        displayStyle,
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
      displayStyle,
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
      explicitMode === "pick_point" || explicitMode === "identify_fraction_point"
        ? "pick_point"
        : explicitMode === "order_fractions" || explicitMode === "order_compare_fractions"
        || explicitMode === "order_number_line_fractions"
        ? "order_fractions"
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

    if (explicitMode === "place_fraction_number_line") {
      const placementBank = [
        { target: "1/4", denominator: 4, maxWhole: 1, showPartitions: true },
        { target: "2/5", denominator: 5, maxWhole: 1, showPartitions: true },
        { target: "3/6", denominator: 6, maxWhole: 1, showPartitions: true },
        { target: "2/3", denominator: 3, maxWhole: 1, showPartitions: true },
        { target: "3/4", denominator: 4, maxWhole: 1, showPartitions: true },
        { target: "5/8", denominator: 8, maxWhole: 1, showPartitions: true },
        { target: "3/5", denominator: 5, maxWhole: 1, showPartitions: false },
        { target: "7/10", denominator: 10, maxWhole: 1, showPartitions: false },
        { target: "5/4", denominator: 4, maxWhole: 2, showPartitions: true },
      ] as const;
      const chosen = placementBank[randInt(0, placementBank.length - 1)] ?? placementBank[0]!;
      return {
        kind: "number_line_place",
        prompt: `Place ${chosen.target} on the number line.`,
        mode: "place_fraction",
        denominator: chosen.denominator,
        partitionDenominator: chosen.denominator,
        targetFraction: chosen.target,
        answer: chosen.target,
        maxWhole: chosen.maxWhole,
        showPartitions: chosen.showPartitions,
        showSupportModel: false,
      };
    }

    if (explicitMode === "identify_fraction_point") {
      const pointBank = [
        { target: "1/2", denominator: 2, points: ["1/4", "1/2", "3/4"] },
        { target: "3/4", denominator: 4, points: ["1/4", "1/2", "3/4"] },
        { target: "2/3", denominator: 3, points: ["1/3", "2/3", "1"] },
        { target: "3/5", denominator: 5, points: ["2/5", "3/5", "4/5"] },
        { target: "5/8", denominator: 8, points: ["3/8", "5/8", "7/8"] },
        { target: "7/10", denominator: 10, points: ["3/10", "7/10", "9/10"] },
        { target: "2/3", denominator: 15, points: ["3/5", "2/3", "4/6"] },
      ] as const;
      const chosen = pointBank[randInt(0, pointBank.length - 1)] ?? pointBank[0]!;
      const ids = ["A", "B", "C"] as const;
      const answerIndex = chosen.points.findIndex((fraction) => fraction === chosen.target);
      return {
        kind: "number_line_place",
        prompt: `Which point shows ${chosen.target}?`,
        mode: "pick_point",
        denominator: chosen.denominator,
        partitionDenominator: chosen.denominator,
        targetFraction: chosen.target,
        pointOptions: chosen.points.map((fraction, index) => ({
          id: ids[index] ?? "A",
          fraction,
        })),
        answer: ids[answerIndex] ?? "A",
        maxWhole: 1,
        showPartitions: chosen.denominator <= 8,
        showSupportModel: false,
      };
    }

    if (mode === "order_fractions") {
      const candidateSets = (
        explicitMode === "order_number_line_fractions"
          ? [
              ["1/4", "2/4", "3/4"],
              ["2/6", "4/6", "5/6"],
              ["1/3", "1/2", "2/3"],
              ["1/3", "1/2", "1/4"],
              ["2/3", "3/5", "4/6"],
              ["3/10", "1/2", "7/10"],
              ["3/8", "5/8", "7/8"],
              ["1/4", "3/5", "2/3"],
            ]
          : explicitMode === "order_compare_fractions"
          ? [
              ["1/8", "3/8", "6/8"],
              ["2/8", "5/8", "7/8"],
              ["1/3", "1/2", "1/4"],
              ["2/3", "3/5", "4/6"],
              ["1/6", "1/3", "1/2"],
              ["2/5", "3/5", "4/10"],
              ["3/8", "1/2", "5/8"],
              ["3/4", "5/8", "6/10"],
              ["2/6", "1/2", "5/6"],
              ["1/4", "3/8", "2/3"],
            ]
          : year3FractionOrderSets()
      ).filter((set) =>
        !allowedDenominators || set.every((value) => allowedDenominators.includes(Number(value.split("/")[1] ?? 0)))
      );
      const chosenSet =
        candidateSets[randInt(0, candidateSets.length - 1)] ??
        candidateSets[0] ??
        year3FractionOrderSets()[0] ??
        ["1/5", "1/2", "4/5"];
      const orderedSet = [...chosenSet].sort((a, b) => fractionNumericValue(a) - fractionNumericValue(b));
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
      config.mode === "visual_compare" ||
      config.mode === "true_false" ||
      config.mode === "greater_less_visual" ||
      config.mode === "equivalent_to_compare"
        ? config.mode
        : "symbol_compare";
    if (mode === "greater_less_visual" || mode === "equivalent_to_compare") {
      const visualPairs = [
        ["2/6", "4/6"],
        ["3/8", "5/8"],
        ["2/8", "6/8"],
        ["3/5", "3/7"],
        ["2/3", "2/5"],
        ["4/9", "4/7"],
        ["2/3", "3/5"],
        ["4/6", "5/8"],
        ["3/4", "6/10"],
        ["5/8", "2/3"],
        ["6/9", "2/3"],
        ["4/10", "2/5"],
      ] as const;
      const eligiblePairs =
        mode === "greater_less_visual"
          ? visualPairs.filter(([left, right]) => fractionNumericValue(left) !== fractionNumericValue(right))
          : visualPairs;
      const chosen = eligiblePairs[randInt(0, eligiblePairs.length - 1)] ?? eligiblePairs[0] ?? visualPairs[0]!;
      const [leftFraction, rightFraction] = chosen;
      const leftValue = fractionNumericValue(leftFraction);
      const rightValue = fractionNumericValue(rightFraction);
      const greaterAnswer =
        leftValue === rightValue ? "They are equal" : leftValue > rightValue ? leftFraction : rightFraction;

      return {
        kind: "fraction_compare",
        prompt: mode === "greater_less_visual" ? "Tap the greater fraction." : "Which fraction is greater?",
        mode,
        leftFraction,
        rightFraction,
        answer:
          mode === "greater_less_visual"
            ? leftValue > rightValue
              ? "left"
              : "right"
            : greaterAnswer,
        helper:
          mode === "greater_less_visual"
            ? "Look at the shaded amount."
            : "Use the bars or equivalent fractions.",
      };
    }
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
    const mode = typeof config.mode === "string" ? config.mode : undefined;
    const pairs =
      mode === "equivalent_fraction_visual"
        ? year5EquivalentFractionPairs().filter((pair) => pair.equivalent.denominator <= 15)
        : year3EquivalentFractionPairs();
    const chosen = pairs[randInt(0, pairs.length - 1)] ?? pairs[0];
    const closeDistractors =
      mode === "equivalent_fraction_visual"
        ? [
            {
              numerator: Math.min(chosen.equivalent.denominator - 1, chosen.equivalent.numerator + 1),
              denominator: chosen.equivalent.denominator,
            },
            {
              numerator: chosen.source.numerator,
              denominator: chosen.equivalent.denominator,
            },
            {
              numerator: Math.min(chosen.equivalent.denominator - 1, chosen.equivalent.numerator),
              denominator: Math.max(chosen.source.denominator + 1, chosen.equivalent.denominator - 1),
            },
          ].filter(
            (option) =>
              option.numerator > 0 &&
              option.numerator < option.denominator &&
              !(option.numerator === chosen.equivalent.numerator && option.denominator === chosen.equivalent.denominator) &&
              !(option.numerator === chosen.source.numerator && option.denominator === chosen.source.denominator)
          )
        : [];
    const distractors = shuffle(
      [
        ...closeDistractors,
        ...pairs
          .flatMap((pair) => [pair.source, pair.equivalent])
          .filter(
            (option) =>
              !(option.numerator === chosen.equivalent.numerator && option.denominator === chosen.equivalent.denominator) &&
              !(option.numerator === chosen.source.numerator && option.denominator === chosen.source.denominator)
          ),
      ].filter(
        (option, index, all) =>
          all.findIndex(
            (candidate) =>
              candidate.numerator === option.numerator && candidate.denominator === option.denominator
          ) === index
      )
    ).slice(0, 2);
    const correctChoice = { id: "correct", ...chosen.equivalent };
    const choices = shuffle([
      correctChoice,
      ...distractors.map((option, index) => ({ id: `wrong-${index}`, ...option })),
    ]);
    const targetLabel = fractionLabel(chosen.source.numerator, chosen.source.denominator);
    const prompts =
      mode === "equivalent_fraction_visual"
        ? [
            `Which fraction is equal to ${targetLabel}?`,
            `Which bar model matches ${targetLabel}?`,
            `Which pair is equivalent to ${targetLabel}?`,
          ]
        : [`Which bar model is equivalent to ${targetLabel}?`];
    return {
      kind: "equivalent_fraction_match",
      prompt: prompts[randInt(0, prompts.length - 1)] ?? prompts[0],
      targetFraction: targetLabel,
      target: { id: "target", ...chosen.source },
      choices,
      correctChoiceId: "correct",
    };
  }

  if (activityType === "fraction_decimal_percent_match") {
    const sets = shuffle(year5FractionDecimalPercentSets("match")).slice(0, 3);
    return {
      kind: "fraction_decimal_percent_match",
      prompt: "Match each fraction, decimal and percentage.",
      helper: "Tap one fraction, one decimal and one percentage with the same value.",
      sets,
    };
  }

  if (activityType === "benchmark_sort") {
    const pool = year5BenchmarkValues();
    const less = shuffle(pool.filter((value) => value.category === "less")).slice(0, 2);
    const equal = shuffle(pool.filter((value) => value.category === "equal")).slice(0, 2);
    const greater = shuffle(pool.filter((value) => value.category === "greater")).slice(0, 2);

    return {
      kind: "benchmark_sort",
      prompt: "Where does each value belong?",
      helper: "Use 1/2 as your benchmark. Sort each card into the correct zone.",
      values: shuffle([...less, ...equal, ...greater]),
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

  if (explicitMode === "equivalent_fraction_reasoning") {
    const templates = [
      {
        prompt: "Which pair is equivalent?",
        answer: "1/2 and 3/6",
        options: ["1/2 and 3/6", "1/2 and 3/8", "1/2 and 2/6", "1/2 and 4/6"],
      },
      {
        prompt: "Which one does not match 3/4?",
        answer: "7/8",
        options: ["6/8", "9/12", "12/16", "7/8"],
      },
      {
        prompt: "Which pair is NOT equivalent?",
        answer: "3/5 and 5/10",
        options: ["1/2 and 2/4", "2/3 and 4/6", "3/5 and 5/10", "1/4 and 2/8"],
      },
      {
        prompt: "Choose the equivalent fraction for 2/5.",
        answer: "4/10",
        options: ["4/10", "5/10", "2/10", "3/5"],
      },
      {
        prompt: "Which fraction shows the same value as 2/3?",
        answer: "6/9",
        options: ["6/9", "2/9", "3/6", "5/9"],
      },
      {
        prompt: "Which pair is equivalent?",
        answer: "2/5 and 4/10",
        options: ["2/5 and 4/10", "2/5 and 5/10", "3/5 and 3/10", "1/5 and 3/10"],
      },
      {
        prompt: "Which fraction is equivalent to 1/4?",
        answer: "3/12",
        options: ["3/12", "3/8", "1/12", "4/12"],
      },
      {
        prompt: "Which pair shows the same value?",
        answer: "3/5 and 9/15",
        options: ["3/5 and 9/15", "3/5 and 3/15", "3/5 and 6/15", "3/5 and 5/15"],
      },
      {
        prompt: "Which fraction does not belong with 3/4?",
        answer: "7/8",
        options: ["6/8", "9/12", "12/16", "7/8"],
      },
      {
        prompt: "Which fraction matches 4/8?",
        answer: "1/2",
        options: ["1/2", "1/4", "4/6", "2/8"],
      },
      {
        prompt: "Which pair is NOT equivalent?",
        answer: "2/3 and 4/9",
        options: ["2/3 and 4/6", "2/3 and 6/9", "1/3 and 3/9", "2/3 and 4/9"],
      },
      {
        prompt: "Choose the equivalent fraction for 3/8.",
        answer: "6/16",
        options: ["6/16", "3/16", "6/8", "4/16"],
      },
      {
        prompt: "Which pair shows the same value?",
        answer: "1/3 and 3/9",
        options: ["1/3 and 3/9", "1/3 and 2/9", "2/3 and 3/9", "1/3 and 4/9"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Look for the same value, not just matching numbers.",
    };
  }

  if (explicitMode === "equivalent_fraction_build") {
    const templates = [
      { left: [1, 2], right: [undefined, 6], answer: "3", missing: "numerator", prompt: "Fill in the missing numerator" },
      { left: [3, 4], right: [undefined, 8], answer: "6", missing: "numerator", prompt: "Fill in the missing numerator" },
      { left: [2, 5], right: [undefined, 10], answer: "4", missing: "numerator", prompt: "Fill in the missing numerator" },
      { left: [4, 6], right: [2, undefined], answer: "3", missing: "denominator", prompt: "Fill in the missing denominator" },
      { left: [3, 8], right: [undefined, 16], answer: "6", missing: "numerator", prompt: "Fill in the missing numerator" },
      { left: [1, 3], right: [undefined, 9], answer: "3", missing: "numerator", prompt: "Complete the equivalent fraction" },
      { left: [2, 3], right: [undefined, 6], answer: "4", missing: "numerator", prompt: "Complete the equivalent fraction" },
      { left: [6, 10], right: [3, undefined], answer: "5", missing: "denominator", prompt: "Fill in the missing denominator" },
      { left: [1, 4], right: [undefined, 12], answer: "3", missing: "numerator", prompt: "Complete the equivalent fraction" },
      { left: [3, 5], right: [undefined, 15], answer: "9", missing: "numerator", prompt: "Fill in the missing numerator" },
      { left: [6, 8], right: [3, undefined], answer: "4", missing: "denominator", prompt: "Fill in the missing denominator" },
      { left: [2, 6], right: [1, undefined], answer: "3", missing: "denominator", prompt: "Complete the equivalent fraction" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Same value, different name.",
      placeholder: chosen.missing === "numerator" ? "Type numerator" : "Type denominator",
      visual: {
        type: "equivalent_fraction_input",
        leftNumerator: chosen.left[0],
        leftDenominator: chosen.left[1],
        rightNumerator: chosen.right[0],
        rightDenominator: chosen.right[1],
        missing: chosen.missing,
      },
    };
  }

  if (
    explicitMode === "same_denominator_visual" ||
    explicitMode === "same_denominator_true_false" ||
    explicitMode === "same_denominator_build"
  ) {
    const templates =
      explicitMode === "same_denominator_visual"
        ? year5SameDenominatorTemplates().filter((template) => sameDenominatorResult(template) <= template.denominator)
        : year5SameDenominatorTemplates();
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    const expression = sameDenominatorExpression(chosen);
    const answer = sameDenominatorAnswer(chosen);
    const resultNumerator = sameDenominatorResult(chosen);
    const visual: SameDenominatorOperationVisualData = {
      type: "same_denominator_operation",
      numeratorA: chosen.numeratorA,
      numeratorB: chosen.numeratorB,
      denominator: chosen.denominator,
      operation: chosen.operation,
      resultNumerator,
    };

    if (explicitMode === "same_denominator_true_false") {
      const makeTrue = randInt(0, 1) === 0;
      const wrongNumerator =
        chosen.operation === "+"
          ? resultNumerator + (randInt(0, 1) === 0 ? -1 : 1)
          : resultNumerator + (randInt(0, 1) === 0 ? 1 : chosen.numeratorB);
      const wrongDenominator = randInt(0, 2) === 0 ? chosen.denominator + chosen.denominator : chosen.denominator;
      const displayedAnswer = makeTrue
        ? answer
        : `${Math.max(0, wrongNumerator)}/${wrongDenominator}`;
      return {
        kind: "multiple_choice",
        prompt: `${expression} = ${displayedAnswer}`,
        options: ["True", "False"],
        answer: makeTrue ? "True" : "False",
        helper: "Keep the denominator the same.",
      };
    }

    if (explicitMode === "same_denominator_visual") {
      return {
        kind: "multiple_choice",
        prompt: `What is ${expression}?`,
        options: sameDenominatorOptions(chosen),
        answer,
        helper:
          chosen.operation === "+"
            ? "Add the shaded parts."
            : "Remove the shaded parts.",
        visual,
      };
    }

    return {
      kind: "typed_response",
      prompt: "Fill in the missing numerator",
      answer,
      helper:
        chosen.operation === "+"
          ? "Add the top numbers."
          : "Subtract the top numbers.",
      placeholder: "Type numerator",
      fixedDenominator: chosen.denominator,
      visual,
    };
  }

  if (
    explicitMode === "related_denominator_visual" ||
    explicitMode === "related_denominator_quick_apply" ||
    explicitMode === "related_denominator_build"
  ) {
    const templates = year5RelatedDenominatorTemplates();
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;

    const result = relatedDenominatorResult(chosen);
    const answer = relatedDenominatorAnswer(chosen);
    const visual = relatedDenominatorVisual(chosen);

    if (explicitMode === "related_denominator_visual") {
      return {
        kind: "multiple_choice",
        prompt: `What is ${relatedDenominatorExpression(chosen)}?`,
        options: relatedDenominatorOptions(chosen),
        answer,
        helper: "Make the pieces the same size.",
        visual,
      };
    }

    if (explicitMode === "related_denominator_quick_apply") {
      return {
        kind: "multiple_choice",
        prompt: `${relatedDenominatorExpression(chosen)} = ?`,
        options: relatedDenominatorOptions(chosen),
        answer,
        helper: "Convert one fraction, then solve.",
      };
    }

    return {
      kind: "typed_response",
      prompt: "Complete the working",
      answer,
      helper: "Match the denominators, then combine.",
      placeholder: "Type numerator",
      fixedDenominator: result.denominator,
      visual,
    };
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
    let left: number;
    let right: number;

    if (level >= 5) {
      const pair = shuffle(buildDecimalReasoningSet(2));
      left = pair[0] ?? 0.321;
      right = pair[1] ?? 0.329;
    } else {
      const precision = randInt(0, 1) === 0 ? 0.1 : 0.01;
      left = randomStepValue(0.1, 9.99, precision);
      right = randomStepValue(0.1, 9.99, precision);
      while (right === left) {
        right = randomStepValue(0.1, 9.99, precision);
      }
    }

    const leftText = level >= 5 ? formatReasoningDecimal(left) : formatMathNumber(left);
    const rightText = level >= 5 ? formatReasoningDecimal(right) : formatMathNumber(right);
    const answer = left > right ? leftText : rightText;

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Which decimal is greater: ${leftText} or ${rightText}?`,
          options: shuffle([leftText, rightText]),
          answer,
          helper: "Compare the ones, then the tenths, then the hundredths.",
        }
      : {
          kind: "typed_response",
          prompt: `Type the greater decimal: ${leftText} or ${rightText}.`,
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

  if (explicitMode === "y6_decimal_place_value_fluency") {
    const templates = [
      {
        prompt: "What is the value of the 6 in 3.264?",
        answer: "0.06",
        options: ["6", "0.6", "0.06", "0.006"],
      },
      {
        prompt: "Which digit is in the hundredths place in 7.483?",
        answer: "8",
        options: ["4", "8", "3", "7"],
      },
      {
        prompt: "Expand 4.506.",
        answer: "4 + 0.5 + 0.006",
        options: ["4 + 0.5 + 0.006", "4 + 0.05 + 0.006", "4 + 0.5 + 0.06", "4 + 5 + 0.006"],
      },
      {
        prompt: "0.05 = 5 tenths",
        answer: "False",
        options: ["True", "False"],
      },
      {
        prompt: "Write 0.809 in words.",
        answer: "eight hundred and nine thousandths",
        options: [
          "eight hundred and nine thousandths",
          "eight tenths and nine thousandths",
          "eight hundred and nine hundredths",
          "zero point eight zero nine tenths",
        ],
      },
      {
        prompt: "What is the value of the 2 in 5.207?",
        answer: "0.2",
        options: ["2", "0.2", "0.02", "0.002"],
      },
      {
        prompt: "Which digit is in the thousandths place in 9.046?",
        answer: "6",
        options: ["0", "4", "6", "9"],
      },
      {
        prompt: "Expand 2.034.",
        answer: "2 + 0.03 + 0.004",
        options: ["2 + 0.03 + 0.004", "2 + 0.3 + 0.04", "2 + 0.03 + 0.04", "2 + 3 + 0.004"],
      },
      {
        prompt: "3.020 has 2 hundredths.",
        answer: "True",
        options: ["True", "False"],
      },
      {
        prompt: "Write 5.007 in words.",
        answer: "five and seven thousandths",
        options: [
          "five and seven thousandths",
          "five and seven hundredths",
          "five and seventy thousandths",
          "five point zero zero seven tenths",
        ],
      },
      {
        prompt: "Which digit is in the tenths place in 6.314?",
        answer: "3",
        options: ["6", "3", "1", "4"],
      },
      {
        prompt: "What is the value of the 4 in 0.406?",
        answer: "0.4",
        options: ["4", "0.4", "0.04", "0.004"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Track tenths, hundredths, and thousandths carefully.",
    };
  }

  if (explicitMode === "y6_decimal_flexibility") {
    const templates = [
      {
        prompt: "3 ones, 4 tenths, 2 thousandths =",
        answer: "3.402",
        options: ["3.42", "3.402", "3.042", "34.002"],
      },
      {
        prompt: "7.08 = 7 + ___",
        answer: "0.08",
        options: ["0.8", "0.08", "0.008", "8"],
      },
      {
        prompt: "Which is equal to 0.7?",
        answer: "7/10",
        options: ["7/10", "7/100", "70/1000", "1/7"],
      },
      {
        prompt: "Which is the better way to think about 3.99?",
        answer: "4.00 - 0.01",
        options: ["4.00 - 0.01", "3 + 0.09", "3 + 0.9 + 0.09", "39/10"],
      },
      {
        prompt: "5.36 =",
        answer: "5 + 0.3 + 0.06",
        options: ["5 + 0.3 + 0.06", "5 + 0.03 + 0.6", "5 + 3 + 0.06", "5 + 0.36 + 0.6"],
      },
      {
        prompt: "4 ones, 6 hundredths, 5 thousandths =",
        answer: "4.065",
        options: ["4.65", "4.065", "4.605", "4.0065"],
      },
      {
        prompt: "6.304 = 6 + ___ + 0.004",
        answer: "0.3",
        options: ["0.03", "0.3", "3", "0.34"],
      },
      {
        prompt: "Which decimal is equal to 406 thousandths?",
        answer: "0.406",
        options: ["4.06", "0.46", "0.406", "0.0406"],
      },
      {
        prompt: "Which partition is correct for 8.125?",
        answer: "8 + 0.1 + 0.02 + 0.005",
        options: [
          "8 + 0.1 + 0.02 + 0.005",
          "8 + 0.12 + 0.5",
          "8 + 0.1 + 0.2 + 0.005",
          "8 + 1.25",
        ],
      },
      {
        prompt: "0.450 =",
        answer: "45 hundredths",
        options: ["45 tenths", "45 hundredths", "45 thousandths", "4.5 hundredths"],
      },
      {
        prompt: "2.507 = 2 + 0.5 + ___",
        answer: "0.007",
        options: ["0.07", "0.007", "0.0007", "0.7"],
      },
      {
        prompt: "Which is equal to 3.020?",
        answer: "3 + 0.02",
        options: ["3 + 0.2", "3 + 0.02", "3 + 0.002", "30 + 0.02"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Break the decimal into place-value parts.",
    };
  }

  if (explicitMode === "y6_decimal_reasoning_check") {
    const templates = [
      {
        prompt: "Which is greater?",
        answer: "0.5",
        options: ["0.5", "0.45", "They are equal", "Cannot tell"],
        helper: "Compare tenths before hundredths.",
      },
      {
        prompt: "0.307 > 0.35",
        answer: "False",
        options: ["True", "False"],
        helper: "Line up the decimal places before comparing.",
      },
      {
        prompt: "4.50 > 4.5",
        answer: "False",
        options: ["True", "False"],
        helper: "Trailing zeros do not change value.",
      },
      {
        prompt: "Which decimal is closest to 1?",
        answer: "0.99",
        options: ["0.9", "0.99", "0.909", "0.89"],
        helper: "Think about the smallest gap to 1.",
      },
      {
        prompt: "3.78 + 2.21 is about",
        answer: "6",
        options: ["5", "6", "7", "8"],
        helper: "Round each decimal and estimate quickly.",
      },
      {
        prompt: "2.506 = 2 + 0.5 + 0.06",
        answer: "Incorrect",
        options: ["Correct", "Incorrect"],
        helper: "Check the hundredths and thousandths places carefully.",
      },
      {
        prompt: "Which is smaller?",
        answer: "1.203",
        options: ["1.23", "1.203", "They are equal", "Cannot tell"],
        helper: "Use zero placeholders when comparing.",
      },
      {
        prompt: "0.406 < 0.46",
        answer: "True",
        options: ["True", "False"],
        helper: "Rewrite 0.46 as 0.460 to compare.",
      },
      {
        prompt: "Which decimal is closest to 0.5?",
        answer: "0.498",
        options: ["0.45", "0.498", "0.57", "0.401"],
        helper: "Look for the smallest difference.",
      },
      {
        prompt: "6.32 + 1.71 is about",
        answer: "8",
        options: ["7", "8", "9", "10"],
        helper: "Use whole-number estimates to judge the sum.",
      },
      {
        prompt: "3.020 and 3.02 have the same value.",
        answer: "True",
        options: ["True", "False"],
        helper: "Extra zeros at the end do not change the decimal.",
      },
      {
        prompt: "Which statement is correct?",
        answer: "0.125 < 0.205",
        options: ["0.125 > 0.205", "0.125 < 0.205", "0.125 = 0.205", "Cannot tell"],
        helper: "Compare tenths first, then hundredths.",
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: chosen.helper,
    };
  }

  if (explicitMode === "y6_decimal_direct_calculation") {
    const templates = [
      { prompt: "3.456 + 5.678 =", answer: "9.134" },
      { prompt: "7.82 - 3.47 =", answer: "4.35" },
      { prompt: "6.305 + 2.19 =", answer: "8.495" },
      { prompt: "9.5 - 4.275 =", answer: "5.225" },
      { prompt: "8.04 + 1.6 =", answer: "9.64" },
      { prompt: "5.000 - 2.386 =", answer: "2.614" },
      { prompt: "10 - 3.456 =", answer: "6.544" },
      { prompt: "7.005 + 6.78 =", answer: "13.785" },
      { prompt: "4.09 + 2.807 =", answer: "6.897" },
      { prompt: "12.4 - 7.056 =", answer: "5.344" },
      { prompt: "0.875 + 3.4 =", answer: "4.275" },
      { prompt: "15 - 8.945 =", answer: "6.055" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Line up the place values carefully.",
      placeholder: "Enter your answer",
      visual: {
        type: "numeric_input_only",
      },
    };
  }

  if (explicitMode === "y6_decimal_strategy_selection") {
    const strategyBank = [
      {
        prompt: "3.99 + 2.75",
        answer: "6.74",
        strategies: [
          strategyChoice("Round & adjust", "SMART CHOICE", "Nice strategy choice. Adjusting from 4 keeps the calculation clean."),
          strategyChoice("Split the decimals", "CLEAR", "That works well. Keep tenths, hundredths, and thousandths aligned."),
          strategyChoice("Column method", "CLEAR", "Valid method. Keep each decimal place in its column."),
          strategyChoice("Mental maths", "FAST", "Fast if you track the small adjustment accurately."),
        ],
        reflectionPrompt: "Did your strategy keep the decimal places clear?",
      },
      {
        prompt: "5.98 + 3.47",
        answer: "9.45",
        strategies: [
          strategyChoice("Round & adjust", "SMART CHOICE", "A near-whole adjustment works well here."),
          strategyChoice("Split the decimals", "CLEAR", "Good if you recombine each place value accurately."),
          strategyChoice("Column method", "CLEAR", "Reliable choice. Align the decimals first."),
          strategyChoice("Mental maths", "FAST", "Fast if you can hold the adjustment accurately."),
        ],
        reflectionPrompt: "Was your method fast, clear, or both?",
      },
      {
        prompt: "7.5 + 2.25",
        answer: "9.75",
        strategies: [
          strategyChoice("Split the decimals", "SMART CHOICE", "Nice choice. The decimal parts combine neatly here."),
          strategyChoice("Mental maths", "FAST", "Fast if you can combine the tenths and hundredths cleanly."),
          strategyChoice("Column method", "CLEAR", "Clear method. Add a zero placeholder if you need one."),
          strategyChoice("Round & adjust", "TRY ANOTHER WAY", "That can work, but another method may feel cleaner."),
        ],
        reflectionPrompt: "Would you use the same strategy next time?",
      },
      {
        prompt: "6.7 + 3.3",
        answer: "10",
        strategies: [
          strategyChoice("Make a whole number", "FAST", "Great spotting. These decimals complete a whole exactly."),
          strategyChoice("Mental maths", "FAST", "Quick and clean if you see the decimal complement."),
          strategyChoice("Column method", "CLEAR", "Still works well if you align the tenths."),
          strategyChoice("Split the decimals", "SMART CHOICE", "A good way to see the whole-number total."),
        ],
        reflectionPrompt: "Did your strategy help you see the whole number quickly?",
      },
      {
        prompt: "9.99 + 4.2",
        answer: "14.19",
        strategies: [
          strategyChoice("Round & adjust", "SMART CHOICE", "Strong choice. Thinking 10 + 4.2 - 0.01 is efficient."),
          strategyChoice("Column method", "CLEAR", "Reliable if you place the decimal points carefully."),
          strategyChoice("Split the decimals", "CLEAR", "Works well if you keep the place values separate."),
          strategyChoice("Mental maths", "FAST", "Fast if you keep track of the hundredth adjustment."),
        ],
        reflectionPrompt: "Could another strategy also work here?",
      },
      {
        prompt: "12.5 - 4.75",
        answer: "7.75",
        strategies: [
          strategyChoice("Column method", "CLEAR", "Good choice. This subtraction needs careful regrouping."),
          strategyChoice("Split the decimals", "SMART CHOICE", "Valid if you separate whole and decimal parts carefully."),
          strategyChoice("Round & adjust", "TRY ANOTHER WAY", "Possible, but another strategy may be cleaner."),
          strategyChoice("Mental maths", "TRY ANOTHER WAY", "Valid, but accuracy matters with mixed decimal lengths."),
        ],
        reflectionPrompt: "Was your strategy accurate under pressure?",
      },
      {
        prompt: "8.25 + 1.75",
        answer: "10",
        strategies: [
          strategyChoice("Make a whole number", "FAST", "Nice choice. These decimals complete a whole exactly."),
          strategyChoice("Mental maths", "FAST", "Quick if you spot the complement to 10."),
          strategyChoice("Column method", "CLEAR", "Still valid and accurate."),
          strategyChoice("Split the decimals", "SMART CHOICE", "Works well because the parts balance neatly."),
        ],
        reflectionPrompt: "Did your strategy make the total obvious?",
      },
      {
        prompt: "6.01 + 2.99",
        answer: "9",
        strategies: [
          strategyChoice("Make a whole number", "SMART CHOICE", "Strong choice. The decimal parts balance perfectly."),
          strategyChoice("Mental maths", "FAST", "Fast if you notice the complement."),
          strategyChoice("Column method", "CLEAR", "Reliable if you align hundredths."),
          strategyChoice("Round & adjust", "SMART CHOICE", "Also efficient because the numbers are close to easy totals."),
        ],
        reflectionPrompt: "Would you solve a similar decimal pair the same way?",
      },
      {
        prompt: "4.995 + 2.105",
        answer: "7.1",
        strategies: [
          strategyChoice("Round & adjust", "SMART CHOICE", "A neat strategy. The thousandths make a tidy adjustment."),
          strategyChoice("Column method", "CLEAR", "Reliable if you keep all three decimal places aligned."),
          strategyChoice("Split the decimals", "CLEAR", "Works if you combine each place carefully."),
          strategyChoice("Mental maths", "TRY ANOTHER WAY", "Possible, but another strategy may feel safer."),
        ],
        reflectionPrompt: "Did your method handle thousandths clearly?",
      },
      {
        prompt: "15 - 8.875",
        answer: "6.125",
        strategies: [
          strategyChoice("Column method", "CLEAR", "Good choice. Zero placeholders make this subtraction easier."),
          strategyChoice("Round & adjust", "SMART CHOICE", "This can work if you track the decimal adjustment carefully."),
          strategyChoice("Split the decimals", "CLEAR", "Works well if you subtract the whole and decimal parts accurately."),
          strategyChoice("Mental maths", "TRY ANOTHER WAY", "Possible, but precision matters here."),
        ],
        reflectionPrompt: "Did your strategy keep the zero placeholders clear?",
      },
    ] as const;
    const chosen = strategyBank[randInt(0, strategyBank.length - 1)] ?? strategyBank[0]!;

    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Choose a useful strategy, then solve exactly.",
      placeholder: "Enter your answer",
      visual: {
        type: "strategy_ownership",
        missionTitle: "Choose Your Strategy",
        missionDescription: "Pick a strategy that works for you, then solve.",
        supportText: "Good mathematicians choose a strategy that matches the numbers.",
        problemLabel: chosen.prompt,
        strategies: [...chosen.strategies],
      },
    };
  }

  if (explicitMode === "y6_decimal_precision_under_pressure") {
    const templates = [
      { prompt: "4.567 + 3.289 =", answer: "7.856" },
      { prompt: "8.904 - 2.678 =", answer: "6.226" },
      { prompt: "7.005 + 6.78 =", answer: "13.785" },
      { prompt: "10 - 3.456 =", answer: "6.544" },
      { prompt: "12.6 - 7.89 =", answer: "4.71" },
      { prompt: "15.004 - 8.276 =", answer: "6.728" },
      { prompt: "6.809 + 2.395 =", answer: "9.204" },
      { prompt: "20 - 11.875 =", answer: "8.125" },
      { prompt: "9.08 - 3.456 =", answer: "5.624" },
      { prompt: "13.75 + 6.089 =", answer: "19.839" },
      { prompt: "18.003 - 9.998 =", answer: "8.005" },
      { prompt: "5.607 + 8.908 =", answer: "14.515" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Check tenths, hundredths, and thousandths carefully.",
      placeholder: "Enter your answer",
      visual: {
        type: "numeric_input_only",
      },
    };
  }

  if (explicitMode === "y6_decimal_quick_estimate") {
    const templates = [
      { prompt: "3.456 + 5.678 ≈ ?", answer: "9", options: ["8", "9", "10"] },
      { prompt: "7.82 - 3.47 ≈ ?", answer: "4", options: ["3", "4", "5"] },
      { prompt: "6.3 + 2.9 ≈ ?", answer: "9", options: ["8", "9", "10"] },
      { prompt: "12.6 - 7.89 ≈ ?", answer: "5", options: ["4", "5", "6"] },
      { prompt: "8.904 - 2.678 ≈ ?", answer: "6", options: ["5", "6", "7"] },
      { prompt: "4.567 + 3.289 ≈ ?", answer: "8", options: ["7", "8", "9"] },
      { prompt: "10 - 3.456 ≈ ?", answer: "7", options: ["5", "6", "7"] },
      { prompt: "13.75 + 6.089 ≈ ?", answer: "20", options: ["19", "20", "21"] },
      { prompt: "5.004 + 2.991 ≈ ?", answer: "8", options: ["7", "8", "9"] },
      { prompt: "9.08 - 3.456 ≈ ?", answer: "6", options: ["5", "6", "7"] },
      { prompt: "15.004 - 8.276 ≈ ?", answer: "7", options: ["6", "7", "8"] },
      { prompt: "7.005 + 6.78 ≈ ?", answer: "14", options: ["13", "14", "15"] },
      { prompt: "18.3 - 9.7 ≈ ?", answer: "9", options: ["8", "9", "10"] },
      { prompt: "2.48 + 6.52 ≈ ?", answer: "9", options: ["8", "9", "10"] },
      { prompt: "11.09 - 4.88 ≈ ?", answer: "6", options: ["5", "6", "7"] },
      { prompt: "0.498 + 0.503 ≈ ?", answer: "1", options: ["0", "1", "2"] },
      { prompt: "19.95 + 4.08 ≈ ?", answer: "24", options: ["23", "24", "25"] },
      { prompt: "6.809 - 2.395 ≈ ?", answer: "4", options: ["3", "4", "5"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Round quickly, then judge the size of the answer.",
    };
  }

  if (explicitMode === "y6_decimal_is_it_right") {
    const templates = [
      { prompt: "3.456 + 5.678 = 9.134", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "7.2 + 3.8 = 10.9", answer: "Incorrect", options: ["Correct", "Incorrect"] },
      { prompt: "6.78 - 2.91 = 3.87", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "4.5 + 2.3 = 9.8", answer: "Too big", options: ["Too big", "Too small", "Correct"] },
      { prompt: "8.04 + 1.6 = 9.64", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "5.000 - 2.386 = 2.614", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "9.5 - 4.275 = 5.775", answer: "Incorrect", options: ["Correct", "Incorrect"] },
      { prompt: "6.305 + 2.19 = 8.495", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "10 - 3.456 = 7.544", answer: "Too big", options: ["Too big", "Too small", "Correct"] },
      { prompt: "7.005 + 6.78 = 13.785", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "12.6 - 7.89 = 3.71", answer: "Too small", options: ["Too big", "Too small", "Correct"] },
      { prompt: "4.567 + 3.289 = 7.856", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "13.75 + 6.089 = 18.839", answer: "Too small", options: ["Too big", "Too small", "Correct"] },
      { prompt: "8.904 - 2.678 = 6.226", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "3.09 + 0.91 = 4.1", answer: "Too big", options: ["Too big", "Too small", "Correct"] },
      { prompt: "15.004 - 8.276 = 6.728", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "0.406 + 0.54 = 0.946", answer: "Correct", options: ["Correct", "Incorrect"] },
      { prompt: "11.09 - 4.88 = 7.21", answer: "Too big", options: ["Too big", "Too small", "Correct"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Check the size of the result before trusting it.",
    };
  }

  if (explicitMode === "y6_decimal_spot_error") {
    const templates = [
      {
        prompt: "4.56 + 2.3 = 6.86",
        answer: "Decimal places not aligned",
        options: ["Decimal places not aligned", "Multiplied", "Nothing wrong"],
      },
      {
        prompt: "2.506 = 2 + 0.5 + 0.06",
        answer: "Thousandths misread",
        options: ["Thousandths misread", "Ones incorrect", "Nothing wrong"],
      },
      {
        prompt: "7.2 - 3.85 = 4.65",
        answer: "Regrouping error",
        options: ["Regrouping error", "Decimal ignored", "Nothing wrong"],
      },
      {
        prompt: "3.78 + 2.25 = 5.93",
        answer: "Addition error",
        options: ["Addition error", "Decimal missing", "Nothing wrong"],
      },
      {
        prompt: "8.04 + 1.6 = 8.20",
        answer: "Ones incorrect",
        options: ["Ones incorrect", "Hundredths ignored", "Nothing wrong"],
      },
      {
        prompt: "10 - 3.456 = 7.456",
        answer: "Subtraction error",
        options: ["Subtraction error", "Decimal moved", "Nothing wrong"],
      },
      {
        prompt: "5.007 = 5 + 0.07",
        answer: "Thousandths misread",
        options: ["Thousandths misread", "Tenths doubled", "Nothing wrong"],
      },
      {
        prompt: "6.305 + 2.19 = 8.305",
        answer: "Hundredths ignored",
        options: ["Hundredths ignored", "Subtraction error", "Nothing wrong"],
      },
      {
        prompt: "9.5 - 4.275 = 5.225",
        answer: "Nothing wrong",
        options: ["Regrouping error", "Decimal places not aligned", "Nothing wrong"],
      },
      {
        prompt: "13.75 + 6.089 = 19.839",
        answer: "Nothing wrong",
        options: ["Addition error", "Decimal missing", "Nothing wrong"],
      },
      {
        prompt: "0.406 = 4 tenths and 6 thousandths",
        answer: "Zero placeholder mistake",
        options: ["Zero placeholder mistake", "Ones incorrect", "Nothing wrong"],
      },
      {
        prompt: "4.90 and 4.9 are different values",
        answer: "Zero placeholder mistake",
        options: ["Zero placeholder mistake", "Decimal moved", "Nothing wrong"],
      },
      {
        prompt: "12.6 - 7.89 = 4.81",
        answer: "Regrouping error",
        options: ["Regrouping error", "Decimal ignored", "Nothing wrong"],
      },
      {
        prompt: "7.005 + 6.78 = 13.685",
        answer: "Place value addition error",
        options: ["Place value addition error", "Multiplied", "Nothing wrong"],
      },
      {
        prompt: "8.904 - 2.678 = 6.226",
        answer: "Nothing wrong",
        options: ["Regrouping error", "Ones incorrect", "Nothing wrong"],
      },
      {
        prompt: "3.020 = 3 + 0.2",
        answer: "Hundredths misread",
        options: ["Hundredths misread", "Tenths misread", "Nothing wrong"],
      },
      {
        prompt: "11.09 - 4.88 = 6.11",
        answer: "Subtraction error",
        options: ["Subtraction error", "Decimal moved", "Nothing wrong"],
      },
      {
        prompt: "0.498 is closer to 0.4 than 0.5",
        answer: "Benchmark judgement error",
        options: ["Benchmark judgement error", "Thousandths misread", "Nothing wrong"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Look at the decimal places before choosing.",
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
    const shoppingTemplates = [
      {
        prompt: "Use the price board. What is the total cost of the notebook and marker?",
        answer: "7.15",
        helper: "Add the dollars first, then add the cents.",
        visual: {
          type: "shopping_list" as const,
          title: "Stationery Shop",
          items: [
            { label: "Notebook", detail: "A5", price: 4.75 },
            { label: "Marker", detail: "Black", price: 2.4 },
            { label: "Glue Stick", detail: "Small", price: 1.85 },
            { label: "Pencil Pack", detail: "HB", price: 3.25 },
          ],
        },
      },
      {
        prompt: "Use the receipt. Work out the total cost.",
        answer: "37.24",
        helper: "Line up the decimal places and add the hundredths first.",
        visual: {
          type: "receipt" as const,
          title: "Campus Store",
          hideComputedTotals: true,
          lines: [
            { label: "Notebook Bundle", detail: "Study Pack", price: 12.56, quantity: 1 },
            { label: "Marker Set", detail: "Assorted", price: 24.68, quantity: 1 },
          ],
        },
        writtenMethodTop: "12.56",
        writtenMethodBottom: "24.68",
      },
      {
        prompt: "Use the receipt. Work out the total cost.",
        answer: "46.75",
        helper: "Add the hundredths, then the tenths, then the whole-number columns.",
        visual: {
          type: "receipt" as const,
          title: "Book Fair",
          hideComputedTotals: true,
          lines: [
            { label: "Hardcover Novel", detail: "Adventure", price: 18.95, quantity: 1 },
            { label: "Reference Guide", detail: "Study Skills", price: 27.8, quantity: 1 },
          ],
        },
        writtenMethodTop: "18.95",
        writtenMethodBottom: "27.80",
      },
      {
        prompt: "Use the shop board. A student buys 2 juice bottles. What is the total cost?",
        answer: "5.60",
        helper: "Add the same decimal amount twice or use doubling.",
        visual: {
          type: "shopping_list" as const,
          title: "School Canteen",
          items: [
            { label: "Juice Bottle", detail: "250 mL", price: 2.8 },
            { label: "Fruit Cup", detail: "Fresh", price: 3.45 },
            { label: "Yoghurt", detail: "Vanilla", price: 2.35 },
            { label: "Muffin", detail: "Blueberry", price: 4.1 },
          ],
        },
      },
      {
        prompt: "Use the receipt. Work out the total cost.",
        answer: "10.45",
        helper: "First work out 2 × $4.25, then line up the decimal places to add the totals.",
        visual: {
          type: "receipt" as const,
          title: "Book Fair",
          hideComputedTotals: true,
          lines: [
            { label: "Bookmark", detail: "Foil", price: 1.95, quantity: 1 },
            { label: "Mini Book", detail: "Mystery", price: 4.25, quantity: 2 },
          ],
        },
        writtenMethodTop: "1.95",
        writtenMethodBottom: "8.50",
      },
      {
        prompt: "Use the price board. Which item costs more: the sketch pad or the pen set?",
        answer: "$5.40",
        helper: "Compare the dollars first, then compare the tenths and hundredths.",
        options: ["$5.40", "$5.04", "They cost the same", "Cannot tell"],
        visual: {
          type: "shopping_list" as const,
          title: "Art Store",
          items: [
            { label: "Sketch Pad", detail: "A4", price: 5.4 },
            { label: "Pen Set", detail: "Fine-tip", price: 5.04 },
            { label: "Paint Brush", detail: "Round", price: 3.65 },
            { label: "Tape", detail: "Clear", price: 2.2 },
          ],
        },
      },
    ];
    const availableTemplates = asMultipleChoice
      ? shoppingTemplates.filter((template) => template.visual.type !== "receipt")
      : shoppingTemplates;
    const chosen =
      availableTemplates[randInt(0, availableTemplates.length - 1)] ??
      availableTemplates[0] ??
      shoppingTemplates[0]!;
    if (asMultipleChoice) {
      const decimalAnswer = Number.parseFloat(chosen.answer.replace("$", ""));
      const generatedOptions =
        Number.isFinite(decimalAnswer)
          ? shuffle(
              Array.from(
                new Set([
                  chosen.answer,
                  chosen.answer.startsWith("$")
                    ? `$${formatDecimal(Math.max(0, decimalAnswer + 0.1))}`
                    : formatDecimal(Math.max(0, decimalAnswer + 0.1)),
                  chosen.answer.startsWith("$")
                    ? `$${formatDecimal(Math.max(0, decimalAnswer - 0.1))}`
                    : formatDecimal(Math.max(0, decimalAnswer - 0.1)),
                  chosen.answer.startsWith("$")
                    ? `$${formatDecimal(Math.max(0, decimalAnswer + 1))}`
                    : formatDecimal(Math.max(0, decimalAnswer + 1)),
                ])
              ).slice(0, 4)
            )
          : undefined;

      return {
        kind: "multiple_choice",
        prompt: chosen.prompt,
        options: chosen.options ? shuffle(chosen.options) : generatedOptions ?? [chosen.answer],
        answer: chosen.answer,
        helper: chosen.helper,
        visual: chosen.visual,
      };
    }

    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: chosen.helper,
      placeholder: "Type the answer",
      visual: chosen.visual,
      writtenMethod:
        chosen.visual.type === "receipt" &&
        "writtenMethodTop" in chosen &&
        "writtenMethodBottom" in chosen &&
        typeof chosen.writtenMethodTop === "string" &&
        typeof chosen.writtenMethodBottom === "string"
          ? buildMoneyAdditionWrittenMethodLayout(
              "Long Addition",
              chosen.writtenMethodTop,
              chosen.writtenMethodBottom,
              chosen.answer
            )
          : undefined,
    };
  }

  if (explicitMode === "decimal_rounding_estimation") {
    const roundToThousandth = randInt(0, 1) === 0;
    const sourcePlaces = roundToThousandth ? 4 : 3;
    const targetPlaces = roundToThousandth ? 3 : 2;
    const step = roundToThousandth ? 0.0001 : 0.001;
    const value = randomStepValue(0.111, 9.9999, step);
    const promptValue = value.toFixed(sourcePlaces);
    const answerNumber = Number(value.toFixed(targetPlaces));
    const answer = answerNumber.toFixed(targetPlaces);
    const placeName = roundToThousandth ? "thousandth" : "hundredth";
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `Round ${promptValue} to the nearest ${placeName}.`,
          options: shuffle(
            Array.from(
              new Set([
                answer,
                (answerNumber + (roundToThousandth ? 0.001 : 0.01)).toFixed(targetPlaces),
                Math.max(0, answerNumber - (roundToThousandth ? 0.001 : 0.01)).toFixed(targetPlaces),
                promptValue,
              ])
            ).slice(0, 4)
          ),
          answer,
          helper: "Look at the digit to the right of the place you are rounding to.",
        }
      : {
          kind: "typed_response",
          prompt: `Round ${promptValue} to the nearest ${placeName}.`,
          answer,
          helper: "Check the next decimal place to decide whether to round up.",
          placeholder: "Type the rounded decimal",
        };
  }

  if (explicitMode === "decimal_reasonableness") {
    const templates = [
      {
        prompt: "Use the price board. About how much should the notebook and marker cost altogether?",
        answer: "$40",
        options: ["$30", "$40", "$60", "$80"],
        helper: "Round $14.56 to about $15 and $24.68 to about $25 first.",
        visual: {
          type: "shopping_list" as const,
          title: "Campus Store",
          items: [
            { label: "Notebook", detail: "A4", price: 14.56 },
            { label: "Marker", detail: "Fine-tip", price: 24.68 },
            { label: "Glue Pen", detail: "Clear", price: 3.45 },
            { label: "Folder", detail: "Plastic", price: 2.95 },
          ],
        },
      },
      {
        prompt: "Use the price board. A student says the notebook and marker cost $70. Is this reasonable?",
        answer: "No",
        options: ["Yes", "No", "Only if rounded", "Cannot tell"],
        helper: "Estimate first. A total near $40 makes sense here, not $70.",
        visual: {
          type: "shopping_list" as const,
          title: "Campus Store",
          items: [
            { label: "Notebook", detail: "A4", price: 14.56 },
            { label: "Marker", detail: "Fine-tip", price: 24.68 },
          ],
        },
      },
      {
        prompt: "Use the prices. Which amount is greater?",
        answer: "$5.40",
        options: ["$5.04", "$5.40", "They are the same", "Cannot tell"],
        helper: "Compare the money amounts as dollars and cents, not just the digits.",
        visual: {
          type: "shopping_list" as const,
          title: "Stationery Prices",
          items: [
            { label: "Pen Set", detail: "Colour", price: 5.04 },
            { label: "Sketch Pad", detail: "A4", price: 5.4 },
          ],
        },
      },
      {
        prompt: "Use the prices. Which estimate is best for the total of the ruler and calculator?",
        answer: "$20",
        options: ["$10", "$20", "$30", "$40"],
        helper: "Round $8.95 to about $9 and $11.35 to about $11 or $12.",
        visual: {
          type: "shopping_list" as const,
          title: "Maths Supplies",
          items: [
            { label: "Ruler Set", detail: "30 cm", price: 8.95 },
            { label: "Calculator", detail: "Basic", price: 11.35 },
            { label: "Compass", detail: "Metal", price: 6.75 },
          ],
        },
      },
      {
        prompt: "A student adds these prices and gets $38.124. Is this reasonable?",
        answer: "No",
        options: ["Yes", "No", "Only if rounded", "Not enough information"],
        helper: "Money totals should line up to dollars and cents only.",
        visual: {
          type: "receipt" as const,
          title: "Book Fair",
          hideComputedTotals: true,
          lines: [
            { label: "Notebook", detail: "A4", price: 14.56, quantity: 1 },
            { label: "Marker", detail: "Fine-tip", price: 24.68, quantity: 1 },
          ],
        },
      },
      {
        prompt: "A student says $18.95 + $7.80 is about $27. Is this a sensible estimate?",
        answer: "Yes",
        options: ["Yes", "No", "Only if exact", "Cannot tell"],
        helper: "Think of $19 + $8.",
      },
      {
        prompt: "A total of $2.60 + $0.40 is $3.00. Does that make sense?",
        answer: "Yes",
        options: ["Yes", "No", "Only if rounded", "Not sure"],
        helper: "Think about what happens when cents make a whole dollar.",
      },
      {
        prompt: "Use the ticket prices. Which cinema total is more reasonable for 2 adult tickets?",
        answer: "$27.50",
        options: ["$2.75", "$27.50", "$275.00", "$20.05"],
        helper: "Two tickets near $14 each should be close to $28.",
        visual: {
          type: "shopping_list" as const,
          title: "Cinema Tickets",
          items: [
            { label: "Adult Ticket", detail: "Standard", price: 13.75 },
            { label: "Child Ticket", detail: "Standard", price: 9.6 },
          ],
        },
      },
      {
        prompt: "A student claims $12.56 + $24.68 is about $20. Is that reasonable?",
        answer: "No",
        options: ["Yes", "No", "Only if rounded down", "Cannot tell"],
        helper: "Estimate with $13 + $25.",
      },
      {
        prompt: "Use the prices. Type the better estimate for the total of the diary and folder.",
        answer: "$17",
        helper: "Round $9.45 to about $9 or $10 and $7.35 to about $7.",
        visual: {
          type: "shopping_list" as const,
          title: "School Shop",
          items: [
            { label: "Diary", detail: "Hardcover", price: 9.45 },
            { label: "Folder", detail: "Expanding", price: 7.35 },
          ],
        },
      },
      {
        prompt: "A student says $6.75 + $3.25 = $10.00. Type Yes or No: is this reasonable?",
        answer: "Yes",
        helper: "Quarter-dollar amounts can combine to make whole dollars.",
      },
      {
        prompt: "Use the receipt. A student says the total should be about $50. Type Yes or No: is that reasonable?",
        answer: "No",
        helper: "Estimate the two prices before deciding.",
        visual: {
          type: "receipt" as const,
          title: "Museum Shop",
          hideComputedTotals: true,
          lines: [
            { label: "Guide Book", detail: "Pocket", price: 12.45, quantity: 1 },
            { label: "Postcards", detail: "Pack", price: 6.85, quantity: 1 },
          ],
        },
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: chosen.options ?? ["Yes", "No", "Maybe", "Not sure"],
          answer: chosen.answer,
          helper: chosen.helper ?? "Check whether the decimal places and size make sense.",
          visual: "visual" in chosen ? chosen.visual : undefined,
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: chosen.helper ?? "Decide whether the statement is reasonable.",
          placeholder:
            chosen.answer === "Yes" || chosen.answer === "No"
              ? "Type Yes or No"
              : "Type the answer",
          visual: "visual" in chosen ? chosen.visual : undefined,
        };
  }

  if (explicitMode === "factors_multiples") {
    const multipleChoiceTemplates: Array<{ prompt: string; answer: string; options: string[] }> = [
      {
        prompt: "Which list shows all the factors of 24?",
        answer: "1, 2, 3, 4, 6, 8, 12, 24",
        options: [
          "1, 2, 3, 4, 6, 8, 12, 24",
          "1, 2, 3, 4, 6, 8, 10, 12, 24",
          "2, 3, 4, 6, 8, 12",
          "1, 2, 4, 8, 12, 24",
        ],
      },
      {
        prompt: "Which number is a common multiple of 4 and 6?",
        answer: "24",
        options: ["16", "18", "20", "24"],
      },
      {
        prompt: "Which statement is correct?",
        answer: "6 is a factor of 42",
        options: [
          "6 is a factor of 42",
          "42 is a factor of 6",
          "7 is a multiple of 42",
          "42 is a factor of every even number",
        ],
      },
      {
        prompt: "Which number is not a factor of 36?",
        answer: "5",
        options: ["3", "4", "5", "6"],
      },
      {
        prompt: "Which pair are both factors of 30?",
        answer: "5 and 6",
        options: ["5 and 6", "4 and 6", "3 and 12", "8 and 10"],
      },
      {
        prompt: "Which number has exactly 3 as a factor and 27 as a multiple?",
        answer: "27",
        options: ["18", "24", "27", "30"],
      },
      {
        prompt: "Which set shows all the multiples of 6 below 40?",
        answer: "6, 12, 18, 24, 30, 36",
        options: [
          "6, 12, 18, 24, 30, 36",
          "6, 12, 18, 24, 30, 35",
          "3, 6, 12, 18, 24, 30",
          "6, 18, 24, 30, 36",
        ],
      },
      {
        prompt: "Which number belongs in the factors of 18 group?",
        answer: "9",
        options: ["8", "9", "10", "11"],
      },
      {
        prompt: "Which statement correctly compares factors and multiples?",
        answer: "4 is a factor of 20, and 20 is a multiple of 4",
        options: [
          "4 is a factor of 20, and 20 is a multiple of 4",
          "20 is a factor of 4, and 4 is a multiple of 20",
          "4 and 20 are both only factors",
          "4 and 20 are both only multiples",
        ],
      },
    ];
    const typedTemplates = [
      {
        prompt: "Type the missing number in this factor pair: 6 × __ = 48",
        answer: "8",
      },
      {
        prompt: "Type the next multiple of 9 after 45.",
        answer: "54",
      },
      {
        prompt: "Type the number that has factor pair 7 and 8.",
        answer: "56",
      },
      {
        prompt: "Type the missing multiple: 12, 24, 36, __, 60",
        answer: "48",
      },
      {
        prompt: "Type the missing factor in this pair for 42: 3 × __ = 42",
        answer: "14",
      },
      {
        prompt: "Type one common multiple of 3 and 5 that is greater than 10 and less than 20.",
        answer: "15",
      },
    ];
    if (asMultipleChoice) {
      const chosen =
        multipleChoiceTemplates[randInt(0, multipleChoiceTemplates.length - 1)] ??
        multipleChoiceTemplates[0]!;
      return {
        kind: "multiple_choice",
        prompt: chosen.prompt,
        options: shuffle(chosen.options),
        answer: chosen.answer,
        helper: "Check whether the number divides exactly or keeps appearing in the multiple pattern.",
      };
    }

    const chosen = typedTemplates[randInt(0, typedTemplates.length - 1)] ?? typedTemplates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Use factor pairs or multiple patterns to work it out.",
      placeholder: "Type the answer",
    };
  }

  if (explicitMode === "divisibility_rules") {
    const multipleChoiceTemplates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "Which larger number is divisible by 3?",
        answer: "372",
        options: ["372", "421", "514", "611"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 3",
          steps: ["Add the digits.", "If the total is divisible by 3, the number is divisible by 3."],
          decisionLabel: "Use the digit sum",
        },
      },
      {
        prompt: "Which number is divisible by both 2 and 5, so it is a multiple of 10?",
        answer: "430",
        options: ["425", "430", "432", "435"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 10",
          steps: ["Check if the number is even.", "Then check if it ends in 0."],
          decisionLabel: "Passes both tests",
        },
      },
      {
        prompt: "A student says 246 is not divisible by 3 because it is even. Is the student correct?",
        answer: "No",
        options: ["Yes", "No", "Only sometimes", "Not enough information"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 3",
          steps: ["Add the digits.", "Use the digit total, not whether the number is even."],
        },
      },
      {
        prompt: "Which divisibility test helps most to decide if 1,458 is divisible by 3?",
        answer: "Add the digits",
        options: ["Add the digits", "Check the last digit only", "Count factor pairs", "Double the number"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 3",
          steps: ["Add the digits.", "Test whether the total is divisible by 3."],
        },
      },
      {
        prompt: "Which number is a multiple of 10?",
        answer: "3,620",
        options: ["3,625", "3,620", "3,612", "3,618"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 10",
          steps: ["Check the last digit.", "If it ends in 0, it divides evenly by 10."],
        },
      },
      {
        prompt: "Which number is a multiple of both 3 and 5?",
        answer: "330",
        options: ["320", "330", "340", "350"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 3 and 5",
          steps: ["Add the digits to test divisibility by 3.", "Check whether the last digit is 0 or 5."],
          decisionLabel: "Pass both tests",
        },
      },
      {
        prompt: "Which statement is correct?",
        answer: "89,472 is divisible by 3 because 8 + 9 + 4 + 7 + 2 = 30",
        options: [
          "89,472 is divisible by 3 because 8 + 9 + 4 + 7 + 2 = 30",
          "89,472 is divisible by 3 because it ends in 2",
          "89,472 is not divisible by 3 because it is even",
          "89,472 is only divisible by 3 if the digits are all odd",
        ],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 3",
          steps: ["Add the digits.", "If the total is divisible by 3, the number is divisible by 3."],
          decisionLabel: "Use the digit sum",
        },
      },
      {
        prompt: "Which number is divisible by 5 but not by 10?",
        answer: "1,245",
        options: ["1,240", "1,242", "1,245", "1,248"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 5",
          steps: ["Check the last digit.", "If it ends in 0 or 5, it divides evenly by 5."],
        },
      },
      {
        prompt: "Which set shows only numbers divisible by 5?",
        answer: "115, 230, 945",
        options: [
          "115, 230, 945",
          "115, 232, 945",
          "110, 233, 940",
          "112, 230, 944",
        ],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 5",
          steps: ["Check the last digit.", "If it ends in 0 or 5, it divides evenly by 5."],
        },
      },
      {
        prompt: "A student says 245 is divisible by 10 because it ends in 5. Is that correct?",
        answer: "No",
        options: ["Yes", "No", "Only if 245 is even", "Cannot tell"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 10",
          steps: ["Check the last digit.", "A number is divisible by 10 only if it ends in 0."],
        },
      },
      {
        prompt: "Which rule helps most to test whether 9,315 is divisible by 5?",
        answer: "Check whether it ends in 0 or 5",
        options: [
          "Check whether it ends in 0 or 5",
          "Add all the digits",
          "Check whether it is even",
          "Find a factor pair",
        ],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 5",
          steps: ["Look at the last digit.", "If it ends in 0 or 5, the number passes the test."],
        },
      },
      {
        prompt: "Which number is divisible by 2?",
        answer: "4,572",
        options: ["4,571", "4,572", "4,575", "4,579"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 2",
          steps: ["Check the last digit.", "If it ends in 0, 2, 4, 6, or 8, it divides evenly by 2."],
        },
      },
      {
        prompt: "Which number is divisible by 4?",
        answer: "1,248",
        options: ["1,246", "1,248", "1,250", "1,254"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 4",
          steps: ["Look at the last two digits.", "If that two-digit number is divisible by 4, the whole number passes."],
        },
      },
      {
        prompt: "Which number is divisible by 6?",
        answer: "534",
        options: ["532", "534", "535", "538"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 6",
          steps: ["Check if the number is even.", "Add the digits and test divisibility by 3."],
        },
      },
      {
        prompt: "Which number is divisible by 8?",
        answer: "3,216",
        options: ["3,214", "3,216", "3,218", "3,222"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 8",
          steps: ["Look at the last three digits.", "If that three-digit number is divisible by 8, the whole number passes."],
        },
      },
      {
        prompt: "Which number is divisible by 9?",
        answer: "4,347",
        options: ["4,345", "4,347", "4,349", "4,351"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 9",
          steps: ["Add the digits.", "If the total is divisible by 9, the number is divisible by 9."],
        },
      },
      {
        prompt: "Which set shows only numbers divisible by 4?",
        answer: "124, 248, 316",
        options: [
          "124, 248, 316",
          "124, 250, 316",
          "126, 248, 318",
          "122, 246, 314",
        ],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 4",
          steps: ["Look at the last two digits.", "If those digits make a number divisible by 4, the whole number passes."],
        },
      },
      {
        prompt: "Which number is divisible by both 2 and 3, so it is divisible by 6?",
        answer: "1,158",
        options: ["1,152", "1,154", "1,156", "1,158"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 6",
          steps: ["Check if the number is even.", "Add the digits and test divisibility by 3."],
          decisionLabel: "Pass both tests",
        },
      },
      {
        prompt: "Which rule helps most to test whether 4,347 is divisible by 9?",
        answer: "Add the digits",
        options: ["Add the digits", "Check the last digit", "Look at the last two digits", "Find a factor pair"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 9",
          steps: ["Add the digits.", "If the total is divisible by 9, the number is divisible by 9."],
        },
      },
    ];
    const typedTemplates: Array<{
      prompt: string;
      answer: string;
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "Type Yes or No: Is 1,458 divisible by 3?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 3",
          steps: ["Add the digits.", "If the total is divisible by 3, the number is divisible by 3."],
        },
      },
      {
        prompt: "Type Yes or No: Is 2,431 divisible by 10?",
        answer: "No",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 10",
          steps: ["Check the last digit.", "If it ends in 0, it divides evenly by 10."],
        },
      },
      {
        prompt: "Type the divisor that fits this test: 645 ends in 5, so it is divisible by __.",
        answer: "5",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 5",
          steps: ["Check the last digit.", "If it ends in 0 or 5, it divides evenly by 5."],
        },
      },
      {
        prompt: "Type Yes or No: Is 4,572 divisible by 2?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 2",
          steps: ["Check the last digit.", "If it ends in 0, 2, 4, 6, or 8, it divides evenly by 2."],
        },
      },
      {
        prompt: "Type Yes or No: Is 89,472 a multiple of 3?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 3",
          steps: ["Add the digits.", "If the total is divisible by 3, the number is divisible by 3."],
        },
      },
      {
        prompt: "Type the one-digit number that makes this true: 56 is divisible by __ because 56 is an even number.",
        answer: "2",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 2",
          steps: ["Check the last digit.", "If it ends in 0, 2, 4, 6, or 8, the number is divisible by 2."],
        },
      },
      {
        prompt: "Type Yes or No: Is 3,615 divisible by 5?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 5",
          steps: ["Check the last digit.", "If it ends in 0 or 5, the number is divisible by 5."],
        },
      },
      {
        prompt: "Type the digit sum used to test 372 for divisibility by 3.",
        answer: "12",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 3",
          steps: ["Add the digits.", "Use the total to test divisibility by 3."],
        },
      },
      {
        prompt: "Type Yes or No: Is 1,248 divisible by 4?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 4",
          steps: ["Look at the last two digits.", "If that two-digit number is divisible by 4, the whole number passes."],
        },
      },
      {
        prompt: "Type Yes or No: Is 534 divisible by 6?",
        answer: "Yes",
      },
      {
        prompt: "Type Yes or No: Is 4,347 divisible by 9?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 9",
          steps: ["Add the digits.", "If the total is divisible by 9, the number is divisible by 9."],
        },
      },
      {
        prompt: "Type Yes or No: Is 3,216 divisible by 8?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 8",
          steps: ["Look at the last three digits.", "If those digits make a number divisible by 8, the whole number passes."],
        },
      },
      {
        prompt: "Type the last two digits you would check to test whether 1,248 is divisible by 4.",
        answer: "48",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 4",
          steps: ["Look at the last two digits.", "Use that two-digit number to test divisibility by 4."],
        },
      },
      {
        prompt: "Type the digit sum used to test 4,347 for divisibility by 9.",
        answer: "18",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 9",
          steps: ["Add the digits.", "Use the total to test divisibility by 9."],
        },
      },
    ];
    if (asMultipleChoice) {
      const chosen =
        multipleChoiceTemplates[randInt(0, multipleChoiceTemplates.length - 1)] ??
        multipleChoiceTemplates[0]!;
      return {
        kind: "multiple_choice",
        prompt: chosen.prompt,
        options: shuffle(chosen.options),
        answer: chosen.answer,
        helper: "Use the divisibility rule, not long division.",
        visual: chosen.visual,
      };
    }

    const chosen = typedTemplates[randInt(0, typedTemplates.length - 1)] ?? typedTemplates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Think about the last digit or the digit sum.",
      placeholder: "Type the answer",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "divisibility_quick_decision") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "Which number is divisible by both 3 and 5?",
        answer: "195",
        options: ["184", "190", "195", "198"],
        visual: {
          type: "rule_box",
          title: "Divisible by 3 and 5",
          steps: ["Check whether the digit sum is divisible by 3.", "Check whether the number ends in 0 or 5."],
          decisionLabel: "Both rules must work",
        },
      },
      {
        prompt: "Which number is NOT divisible by 6?",
        answer: "214",
        options: ["198", "204", "214", "222"],
        visual: {
          type: "rule_box",
          title: "Divisible by 6",
          steps: ["The number must be even.", "Its digit sum must be divisible by 3."],
          decisionLabel: "Pass both tests",
        },
      },
      {
        prompt: "Which group is correct for 'divisible by 4'?",
        answer: "128, 316, 524",
        options: [
          "128, 316, 524",
          "126, 316, 524",
          "128, 318, 524",
          "128, 316, 526",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 4",
          steps: ["Look at the last two digits.", "Those last two digits must make a multiple of 4."],
        },
      },
      {
        prompt: "Which number is divisible by both 2 and 3, so it is divisible by 6?",
        answer: "234",
        options: ["232", "234", "236", "238"],
        visual: {
          type: "rule_box",
          title: "Divisible by 6",
          steps: ["Check for an even last digit.", "Check that the digit sum is divisible by 3."],
          decisionLabel: "Both rules must work",
        },
      },
      {
        prompt: "Which number is NOT divisible by both 3 and 5?",
        answer: "245",
        options: ["135", "180", "225", "245"],
        visual: {
          type: "rule_box",
          title: "Divisible by 3 and 5",
          steps: ["A number must end in 0 or 5.", "Its digit sum must also be divisible by 3."],
        },
      },
      {
        prompt: "Which group shows only numbers divisible by 9?",
        answer: "144, 261, 333",
        options: [
          "144, 261, 333",
          "144, 262, 333",
          "145, 261, 333",
          "144, 261, 335",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 9",
          steps: ["Add the digits.", "The total must be divisible by 9."],
        },
      },
      {
        prompt: "Which number is divisible by 8?",
        answer: "1,224",
        options: ["1,220", "1,222", "1,224", "1,226"],
        visual: {
          type: "rule_box",
          title: "Divisible by 8",
          steps: ["Look at the last three digits.", "Those last three digits must make a multiple of 8."],
        },
      },
      {
        prompt: "Which group is correct for 'divisible by both 3 and 4'?",
        answer: "132, 216, 324",
        options: [
          "132, 216, 324",
          "132, 214, 324",
          "130, 216, 324",
          "132, 216, 326",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by both 3 and 4",
          steps: ["Use the digit sum to test divisibility by 3.", "Use the last two digits to test divisibility by 4."],
          decisionLabel: "Both rules must work",
        },
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: "Make the divisibility decision quickly, then confirm it with the rule.",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "divisibility_whos_right") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "A student says, '245 is divisible by 3 because it ends in 5.' Who is right?",
        answer: "The student is incorrect because divisibility by 3 depends on the digit sum, not the last digit",
        options: [
          "The student is incorrect because divisibility by 3 depends on the digit sum, not the last digit",
          "The student is correct because numbers ending in 5 are always divisible by 3",
          "The student is partly correct because 245 is divisible by both 3 and 5",
          "The student is incorrect because odd numbers are never divisible by 3",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 3",
          steps: ["Add the digits.", "Ignore whether the number ends in 5."],
        },
      },
      {
        prompt: "A student says, '312 is divisible by 4 because it is even.' Who is right?",
        answer: "The student is partly correct because 312 is divisible by 4, but being even is not enough proof",
        options: [
          "The student is partly correct because 312 is divisible by 4, but being even is not enough proof",
          "The student is correct because every even number is divisible by 4",
          "The student is incorrect because 312 is odd",
          "The student is incorrect because divisibility by 4 uses the digit sum",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 4",
          steps: ["Look at the last two digits.", "Use 12, not just the fact that the number is even."],
        },
      },
      {
        prompt: "A student says, '450 is divisible by both 3 and 5, so it works for both rules.' Who is right?",
        answer: "The student is correct because 4 + 5 + 0 = 9 and the number ends in 0",
        options: [
          "The student is correct because 4 + 5 + 0 = 9 and the number ends in 0",
          "The student is incorrect because numbers ending in 0 cannot be divisible by 3",
          "The student is partly correct because 450 is divisible by 5 but not by 3",
          "The student is incorrect because only 2-digit numbers can be divisible by both 3 and 5",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 3 and 5",
          steps: ["Check the digit sum for 3.", "Check the last digit for 5."],
          decisionLabel: "Both rules must work",
        },
      },
      {
        prompt: "A student says, '1,218 is not divisible by 6 because it is too big.' Who is right?",
        answer: "The student is incorrect because size does not matter; 1,218 is even and its digit sum is 12",
        options: [
          "The student is incorrect because size does not matter; 1,218 is even and its digit sum is 12",
          "The student is correct because only 2-digit numbers can be divisible by 6",
          "The student is partly correct because 1,218 is divisible by 3 but not by 2",
          "The student is correct because 1,218 ends in 8",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 6",
          steps: ["Check whether the number is even.", "Check whether the digit sum is divisible by 3."],
        },
      },
      {
        prompt: "A student says, '372 is divisible by 3 because 3 + 7 + 2 = 12.' Who is right?",
        answer: "The student is correct because 12 is divisible by 3",
        options: [
          "The student is correct because 12 is divisible by 3",
          "The student is incorrect because 372 is even",
          "The student is partly correct because 372 is only divisible by 2",
          "The student is incorrect because the last digit should be checked instead",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 3",
          steps: ["Add the digits.", "If the total is divisible by 3, the whole number is divisible by 3."],
        },
      },
      {
        prompt: "A student says, '630 is divisible by 10, so it must also be divisible by 5.' Who is right?",
        answer: "The student is correct because every number divisible by 10 ends in 0, so it is also divisible by 5",
        options: [
          "The student is correct because every number divisible by 10 ends in 0, so it is also divisible by 5",
          "The student is incorrect because divisibility by 10 and 5 are unrelated",
          "The student is partly correct because 630 is divisible by 10 but not by 5",
          "The student is incorrect because numbers divisible by 10 must be even, not multiples of 5",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 10 and 5",
          steps: ["Numbers divisible by 10 end in 0.", "Numbers ending in 0 also pass the rule for 5."],
        },
      },
      {
        prompt: "A student says, '248 is divisible by 8 because it ends in 8.' Who is right?",
        answer: "The student is partly correct because 248 is divisible by 8, but you must check the last three digits, not just the last digit",
        options: [
          "The student is partly correct because 248 is divisible by 8, but you must check the last three digits, not just the last digit",
          "The student is correct because any number ending in 8 is divisible by 8",
          "The student is incorrect because 248 is odd",
          "The student is incorrect because divisibility by 8 uses the digit sum",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 8",
          steps: ["Look at the last three digits.", "Do not use the last digit by itself."],
        },
      },
      {
        prompt: "A student says, '555 is divisible by both 3 and 5.' Who is right?",
        answer: "The student is correct because 5 + 5 + 5 = 15 and the number ends in 5",
        options: [
          "The student is correct because 5 + 5 + 5 = 15 and the number ends in 5",
          "The student is incorrect because odd numbers cannot be divisible by 3",
          "The student is partly correct because 555 is divisible by 5 but not by 3",
          "The student is incorrect because only numbers ending in 0 can be divisible by 5",
        ],
        visual: {
          type: "rule_box",
          title: "Divisible by 3 and 5",
          steps: ["Add the digits to test 3.", "Check whether the number ends in 0 or 5 for 5."],
        },
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: "Decide whether the student's reasoning is correct, partly correct, or incorrect.",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "divisibility_explain_create") {
    const templates: Array<{
      prompt: string;
      answer: string;
      helper: string;
      placeholder?: string;
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "Type one 3-digit number that is divisible by both 3 and 5.",
        answer: "135",
        helper: "A correct answer must end in 0 or 5 and have a digit sum divisible by 3.",
        placeholder: "Type a 3-digit number",
        visual: {
          type: "rule_box",
          title: "Create a Number",
          steps: ["Make it end in 0 or 5.", "Make the digit sum divisible by 3."],
        },
      },
      {
        prompt: "Type one 2-digit number that is divisible by 6 but not by 5.",
        answer: "42",
        helper: "A correct answer must be even, have a digit sum divisible by 3, and not end in 0 or 5.",
        placeholder: "Type a 2-digit number",
        visual: {
          type: "rule_box",
          title: "Create a Number",
          steps: ["Check divisibility by 6.", "Make sure the number does not also fit the rule for 5."],
        },
      },
      {
        prompt: "Type the missing word: 324 is divisible by 4 because its last two digits, 24, are divisible by __.",
        answer: "4",
        helper: "The last two digits test must match the same divisor.",
        placeholder: "Type the missing number",
        visual: {
          type: "rule_box",
          title: "Explain Why",
          steps: ["Look at the last two digits.", "Use the same divisor in the explanation."],
        },
      },
      {
        prompt: "Type one number greater than 200 that is divisible by 9.",
        answer: "216",
        helper: "A correct answer must have a digit sum that is a multiple of 9.",
        placeholder: "Type a number",
        visual: {
          type: "rule_box",
          title: "Create a Number",
          steps: ["Choose a number above 200.", "Make the digit sum equal 9, 18, 27, or another multiple of 9."],
        },
      },
      {
        prompt: "Type Yes or No: Is 1,125 divisible by both 3 and 5?",
        answer: "Yes",
        helper: "It ends in 5, and 1 + 1 + 2 + 5 = 9.",
        placeholder: "Type Yes or No",
        visual: {
          type: "rule_box",
          title: "Justify Divisibility",
          steps: ["Check the last digit for 5.", "Check the digit sum for 3."],
          decisionLabel: "Both rules must work",
        },
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: chosen.helper,
      placeholder: chosen.placeholder ?? "Type the answer",
      visual: chosen.visual,
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

  if (explicitMode === "y6_prime_quick_classify") {
    const templates = [
      { prompt: "Is 7 prime, composite, or neither?", answer: "Prime", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 12 prime, composite, or neither?", answer: "Composite", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 1 prime, composite, or neither?", answer: "Neither", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 29 prime, composite, or neither?", answer: "Prime", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 45 prime, composite, or neither?", answer: "Composite", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 37 prime, composite, or neither?", answer: "Prime", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 51 prime, composite, or neither?", answer: "Composite", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 2 prime, composite, or neither?", answer: "Prime", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 57 prime, composite, or neither?", answer: "Composite", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 97 prime, composite, or neither?", answer: "Prime", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 49 prime, composite, or neither?", answer: "Composite", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 83 prime, composite, or neither?", answer: "Prime", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 25 prime, composite, or neither?", answer: "Composite", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 73 prime, composite, or neither?", answer: "Prime", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 91 prime, composite, or neither?", answer: "Composite", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 41 prime, composite, or neither?", answer: "Prime", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 64 prime, composite, or neither?", answer: "Composite", options: ["Prime", "Composite", "Neither"] },
      { prompt: "Is 89 prime, composite, or neither?", answer: "Prime", options: ["Prime", "Composite", "Neither"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Use quick checks. Do not overthink it.",
    };
  }

  if (explicitMode === "y6_prime_structure_check") {
    const templates = [
      {
        prompt: "15\n1 × 15\n3 × 5\n\nWhat does this tell you?",
        answer: "Composite",
        options: ["Prime", "Composite"],
      },
      {
        prompt: "21 ÷ 2 ✗\n21 ÷ 3 ✓\n\nWhat does this tell you?",
        answer: "Composite",
        options: ["Prime", "Composite"],
      },
      {
        prompt: "Why is 17 prime?",
        answer: "Only divisible by 1 and 17",
        options: ["Only divisible by 1 and 17", "It is odd", "It ends in 7"],
      },
      {
        prompt: "How many factors does 13 have?",
        answer: "2",
        options: ["2", "3", "4"],
      },
      {
        prompt: "Which is prime?",
        answer: "31",
        options: ["27", "31", "39"],
      },
      {
        prompt: "9\n1 × 9\n3 × 3\n\nWhat does this tell you?",
        answer: "Composite",
        options: ["Prime", "Composite"],
      },
      {
        prompt: "Why is 23 prime?",
        answer: "Only divisible by 1 and 23",
        options: ["Only divisible by 1 and 23", "It is odd", "It is greater than 20"],
      },
      {
        prompt: "How many factors does 29 have?",
        answer: "2",
        options: ["2", "3", "5"],
      },
      {
        prompt: "27 ÷ 2 ✗\n27 ÷ 3 ✓\n\nWhat does this tell you?",
        answer: "Composite",
        options: ["Prime", "Composite"],
      },
      {
        prompt: "Which number has exactly two factors?",
        answer: "19",
        options: ["19", "21", "27"],
      },
      {
        prompt: "Why is 35 composite?",
        answer: "It has a factor pair other than 1 and 35",
        options: ["It has a factor pair other than 1 and 35", "It is odd", "It ends in 5"],
      },
      {
        prompt: "How many factors does 1 have?",
        answer: "1",
        options: ["0", "1", "2"],
      },
      {
        prompt: "Which is composite?",
        answer: "51",
        options: ["43", "47", "51"],
      },
      {
        prompt: "49\n1 × 49\n7 × 7\n\nWhat does this tell you?",
        answer: "Composite",
        options: ["Prime", "Composite"],
      },
      {
        prompt: "Why is 2 prime?",
        answer: "Only divisible by 1 and 2",
        options: ["Only divisible by 1 and 2", "It is even", "It is the smallest prime"],
      },
      {
        prompt: "Which quick check proves 39 is composite?",
        answer: "39 is divisible by 3",
        options: ["39 is divisible by 3", "39 is odd", "39 is greater than 30"],
      },
      {
        prompt: "How many factors does a prime number always have?",
        answer: "2",
        options: ["1", "2", "More than 2"],
      },
      {
        prompt: "Which number is prime?",
        answer: "59",
        options: ["55", "57", "59"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Look for a factor pair or a quick divisibility clue.",
    };
  }

  if (explicitMode === "y6_prime_eliminate_fast") {
    const templates = [
      { prompt: "Which cannot be prime?", answer: "21", options: ["21", "23", "29"] },
      { prompt: "All even numbers greater than 2 are:", answer: "Composite", options: ["Prime", "Composite", "Sometimes prime"] },
      { prompt: "Which number is NOT composite?", answer: "17", options: ["25", "17", "21"] },
      { prompt: "Which is prime?", answer: "53", options: ["49", "51", "53"] },
      { prompt: "Which number is neither prime nor composite?", answer: "1", options: ["1", "2", "3"] },
      { prompt: "Which cannot be prime?", answer: "33", options: ["31", "33", "37"] },
      { prompt: "Which is prime?", answer: "61", options: ["57", "61", "63"] },
      { prompt: "Which number is NOT composite?", answer: "71", options: ["71", "77", "81"] },
      { prompt: "Which cannot be prime?", answer: "55", options: ["53", "55", "59"] },
      { prompt: "True or false: Every prime number greater than 2 is odd.", answer: "True", options: ["True", "False"] },
      { prompt: "Which is prime?", answer: "67", options: ["65", "67", "69"] },
      { prompt: "Which number is composite?", answer: "87", options: ["83", "87", "89"] },
      { prompt: "Which cannot be prime?", answer: "91", options: ["79", "83", "91"] },
      { prompt: "Which is NOT composite?", answer: "43", options: ["39", "43", "45"] },
      { prompt: "True or false: 2 is the only even prime number.", answer: "True", options: ["True", "False"] },
      { prompt: "Which is prime?", answer: "79", options: ["77", "79", "81"] },
      { prompt: "Which number is neither prime nor composite?", answer: "1", options: ["0", "1", "2"] },
      { prompt: "Which cannot be prime?", answer: "39", options: ["37", "39", "41"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Eliminate fast. Look for obvious factors first.",
    };
  }

  if (explicitMode === "y6_factor_quick_recognition") {
    const templates = [
      { prompt: "Is 6 a factor of 42?", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "Is 7 a factor of 45?", answer: "No", options: ["Yes", "No"] },
      { prompt: "Which is a multiple of 8?", answer: "32", options: ["32", "30", "34"] },
      { prompt: "Which is NOT a multiple of 5?", answer: "42", options: ["25", "40", "42"] },
      { prompt: "Is 24 a multiple of 6?", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "Is 9 a factor of 54?", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "Which is a multiple of 9?", answer: "63", options: ["61", "63", "67"] },
      { prompt: "Is 11 a factor of 88?", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "Which is NOT a multiple of 4?", answer: "26", options: ["20", "24", "26"] },
      { prompt: "Is 8 a factor of 54?", answer: "No", options: ["Yes", "No"] },
      { prompt: "Which is a multiple of 12?", answer: "84", options: ["82", "84", "86"] },
      { prompt: "Is 15 a factor of 90?", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "Which is NOT a multiple of 3?", answer: "44", options: ["39", "42", "44"] },
      { prompt: "Is 14 a factor of 98?", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "Which is a multiple of 7?", answer: "56", options: ["54", "56", "58"] },
      { prompt: "Is 5 a factor of 62?", answer: "No", options: ["Yes", "No"] },
      { prompt: "Which is NOT a multiple of 6?", answer: "50", options: ["42", "48", "50"] },
      { prompt: "Is 13 a factor of 91?", answer: "Yes", options: ["Yes", "No"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Use a quick factor or multiple check.",
    };
  }

  if (explicitMode === "y6_factor_relationship_thinking") {
    const templates = [
      { prompt: "Which is a common multiple of 4 and 6?", answer: "12", options: ["12", "16", "18"] },
      { prompt: "Which is a common factor of 18 and 24?", answer: "3", options: ["3", "5", "7"] },
      { prompt: "___ is a multiple of both 3 and 5.", answer: "15", options: ["10", "15", "18"] },
      { prompt: "If 8 is a factor of a number, which could it be?", answer: "24", options: ["24", "26", "30"] },
      { prompt: "If a number is a multiple of 4, it is always even.", answer: "True", options: ["True", "False"] },
      { prompt: "Multiples of 7: 7, 14, 21, ___", answer: "28", options: ["27", "28", "29"] },
      { prompt: "Which is a common multiple of 5 and 6?", answer: "30", options: ["20", "25", "30"] },
      { prompt: "Which is a common factor of 20 and 30?", answer: "10", options: ["6", "10", "12"] },
      { prompt: "Which number has both 3 and 4 as factors?", answer: "24", options: ["18", "24", "28"] },
      { prompt: "If a number is divisible by 10, it must also be divisible by 5.", answer: "True", options: ["True", "False"] },
      { prompt: "Which is a common multiple of 8 and 3?", answer: "24", options: ["16", "18", "24"] },
      { prompt: "Which is a common factor of 27 and 36?", answer: "9", options: ["4", "9", "12"] },
      { prompt: "___ is a multiple of both 4 and 9.", answer: "36", options: ["28", "32", "36"] },
      { prompt: "If 6 is a factor of a number, that number must be even.", answer: "True", options: ["True", "False"] },
      { prompt: "Multiples of 9: 9, 18, 27, ___", answer: "36", options: ["35", "36", "37"] },
      { prompt: "Which number shares a common factor with both 14 and 21?", answer: "7", options: ["5", "6", "7"] },
      { prompt: "Which number is a multiple of both 2 and 7?", answer: "42", options: ["28", "35", "42"] },
      { prompt: "If a number is a multiple of 3 and 4, it must be a multiple of 12.", answer: "True", options: ["True", "False"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Look for the relationship between the numbers, not a long list.",
    };
  }

  if (explicitMode === "y6_factor_fast_application") {
    const templates = [
      { prompt: "24 students are put into equal groups of 6. How many groups?", answer: "4" },
      { prompt: "30 players are split into equal teams of 5. How many teams?", answer: "6" },
      { prompt: "Two lights flash every 4 seconds and 6 seconds. When will they flash together?", answer: "12" },
      { prompt: "48 counters are shared into equal groups of 8. How many groups?", answer: "6" },
      { prompt: "A class lines up in rows of 7. If there are 42 students, how many rows are there?", answer: "6" },
      { prompt: "60 stickers are packed in groups of 12. How many packs are made?", answer: "5" },
      { prompt: "Two alarms ring every 5 minutes and 10 minutes. After how many minutes will they ring together?", answer: "10" },
      { prompt: "36 marbles are split into equal groups of 9. How many groups?", answer: "4" },
      { prompt: "A number has both 3 and 5 as factors and is less than 20. Type one possible number.", answer: "15" },
      { prompt: "A number can be split into equal groups of 4 and 5. Type the smallest possible number greater than 10.", answer: "20" },
      { prompt: "54 books are arranged in equal stacks of 6. How many stacks?", answer: "9" },
      { prompt: "Two taps drip every 3 seconds and 8 seconds. When will they drip together?", answer: "24" },
      { prompt: "72 beads are sorted into equal groups of 9. How many groups?", answer: "8" },
      { prompt: "A number has both 2 and 7 as factors and is less than 30. Type one possible number.", answer: "14" },
      { prompt: "45 counters are shared into equal groups of 5. How many groups?", answer: "9" },
      { prompt: "Two timers beep every 4 minutes and 10 minutes. When will they beep together?", answer: "20" },
      { prompt: "63 pencils are packed into equal boxes of 7. How many boxes?", answer: "9" },
      { prompt: "A number has both 4 and 6 as factors and is less than 30. Type one possible number.", answer: "12" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Use factor and multiple relationships to solve it quickly.",
      placeholder: "Type the answer",
    };
  }

  if (explicitMode === "y6_integer_position_order") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      visual: IntegerNumberLineVisualData;
      helper: string;
    }> = [
      {
        prompt: "Which integer is marked on the number line?",
        answer: "-3",
        options: ["-5", "-3", "3", "5"],
        visual: { type: "integer_number_line", min: -6, max: 6, target: -3, emphasis: "position" },
        helper: "Check the tick mark.",
      },
      {
        prompt: "Which integer is marked on the number line?",
        answer: "3",
        options: ["-3", "2", "3", "4"],
        visual: { type: "integer_number_line", min: -6, max: 6, target: 3, emphasis: "position" },
        helper: "Count from zero carefully.",
      },
      {
        prompt: "Which integer is marked on the number line?",
        answer: "0",
        options: ["-1", "0", "1", "10"],
        visual: { type: "integer_number_line", min: -6, max: 6, target: 0, emphasis: "position" },
        helper: "Zero sits in the centre.",
      },
      {
        prompt: "Which integer is marked on the number line?",
        answer: "-6",
        options: ["-6", "-5", "5", "6"],
        visual: { type: "integer_number_line", min: -6, max: 6, target: -6, emphasis: "position" },
        helper: "Count from zero carefully.",
      },
      {
        prompt: "Which integer is marked on the number line?",
        answer: "5",
        options: ["-5", "4", "5", "6"],
        visual: { type: "integer_number_line", min: -6, max: 6, target: 5, emphasis: "position" },
        helper: "Check the tick mark.",
      },
      {
        prompt: "Which number is smallest?",
        answer: "-4",
        options: ["-4", "2", "-1"],
        visual: { type: "integer_number_line", min: -6, max: 6, highlights: [-4, 2, -1], emphasis: "compare" },
        helper: "Left is smaller, right is greater.",
      },
      {
        prompt: "Which number is greatest?",
        answer: "2",
        options: ["-3", "-1", "2"],
        visual: { type: "integer_number_line", min: -6, max: 6, highlights: [-3, -1, 2], emphasis: "compare" },
        helper: "Right is greater.",
      },
      {
        prompt: "Which comes between -4 and -2?",
        answer: "-3",
        options: ["-3", "3", "-1"],
        visual: { type: "integer_number_line", min: -6, max: 6, highlights: [-4, -2, -3], emphasis: "compare" },
        helper: "Count one space between the two ticks.",
      },
      {
        prompt: "Which is to the right of 0?",
        answer: "3",
        options: ["-2", "3", "-5"],
        visual: { type: "integer_number_line", min: -6, max: 6, highlights: [0, -2, 3, -5], emphasis: "compare" },
        helper: "Positives are to the right of zero.",
      },
      {
        prompt: "Which integer is furthest left?",
        answer: "-7",
        options: ["-7", "-2", "4"],
        visual: { type: "integer_number_line", min: -10, max: 10, highlights: [-7, -2, 4], emphasis: "compare" },
        helper: "Further left means smaller.",
      },
      {
        prompt: "Which integer is between -1 and 1?",
        answer: "0",
        options: ["-2", "0", "2"],
        visual: { type: "integer_number_line", min: -6, max: 6, highlights: [-1, 0, 1], emphasis: "compare" },
        helper: "Zero sits in the middle.",
      },
      {
        prompt: "Which number is greatest?",
        answer: "5",
        options: ["-6", "0", "5"],
        visual: { type: "integer_number_line", min: -6, max: 6, highlights: [-6, 0, 5], emphasis: "compare" },
        helper: "Choose the point furthest right.",
      },
      {
        prompt: "Which number is smallest?",
        answer: "-9",
        options: ["-9", "-3", "6"],
        visual: { type: "integer_number_line", min: -10, max: 10, highlights: [-9, -3, 6], emphasis: "compare" },
        helper: "The most negative number sits furthest left.",
      },
      {
        prompt: "Which integer is between 2 and 4?",
        answer: "3",
        options: ["2", "3", "5"],
        visual: { type: "integer_number_line", min: -2, max: 6, highlights: [2, 3, 4], emphasis: "compare" },
        helper: "Find the tick in the middle.",
      },
      {
        prompt: "Which number is to the left of -2?",
        answer: "-3",
        options: ["-3", "-1", "1"],
        visual: { type: "integer_number_line", min: -6, max: 4, highlights: [-3, -2, -1, 1], emphasis: "compare" },
        helper: "One space left is smaller.",
      },
      {
        prompt: "Which number is to the right of -1?",
        answer: "0",
        options: ["-2", "0", "-3"],
        visual: { type: "integer_number_line", min: -6, max: 4, highlights: [-3, -2, -1, 0], emphasis: "compare" },
        helper: "One space right is greater.",
      },
      {
        prompt: "Which is greatest?",
        answer: "0",
        options: ["-8", "-1", "0"],
        visual: { type: "integer_number_line", min: -10, max: 2, highlights: [-8, -1, 0], emphasis: "compare" },
        helper: "Zero is to the right of negatives.",
      },
      {
        prompt: "Which number belongs between -6 and -4?",
        answer: "-5",
        options: ["-7", "-5", "-3"],
        visual: { type: "integer_number_line", min: -8, max: 2, highlights: [-6, -5, -4], emphasis: "compare" },
        helper: "Find the tick directly between them.",
      },
      {
        prompt: "Which integer is smallest?",
        answer: "-12",
        options: ["-12", "-2", "10"],
        visual: { type: "integer_number_line", min: -12, max: 10, highlights: [-12, -2, 10], emphasis: "compare" },
        helper: "Check the point furthest left.",
      },
      {
        prompt: "Which number is greatest?",
        answer: "7",
        options: ["-7", "4", "7"],
        visual: { type: "integer_number_line", min: -8, max: 8, highlights: [-7, 4, 7], emphasis: "compare" },
        helper: "Right is greater.",
      },
      {
        prompt: "Where is the marked point?",
        answer: "-1",
        options: ["-2", "-1", "1", "2"],
        visual: { type: "integer_number_line", min: -6, max: 6, target: -1, emphasis: "position" },
        helper: "Use the tick, not the gap.",
      },
      {
        prompt: "Where is the marked point?",
        answer: "4",
        options: ["3", "4", "-4", "5"],
        visual: { type: "integer_number_line", min: -6, max: 6, target: 4, emphasis: "position" },
        helper: "Check the tick mark.",
      },
      {
        prompt: "Which integer is marked on the number line?",
        answer: "-8",
        options: ["-8", "-6", "6", "8"],
        visual: { type: "integer_number_line", min: -10, max: 10, target: -8, emphasis: "position" },
        helper: "Count left from zero carefully.",
      },
      {
        prompt: "Which integer is marked on the number line?",
        answer: "9",
        options: ["-9", "8", "9", "10"],
        visual: { type: "integer_number_line", min: -10, max: 10, target: 9, emphasis: "position" },
        helper: "Count right from zero carefully.",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.visual,
    };
  }

  if (explicitMode === "y6_integer_compare") {
    const templates = [
      { prompt: "Which is greater?", answer: "-2", options: ["-5", "-2"], helper: "Further right means greater.", visual: { type: "integer_number_line", min: -6, max: 2, highlights: [-5, -2], emphasis: "compare" } },
      { prompt: "Which is smaller?", answer: "-8", options: ["-8", "-3"], helper: "Further left means smaller.", visual: { type: "integer_number_line", min: -10, max: 2, highlights: [-8, -3], emphasis: "compare" } },
      { prompt: "Which number is further right?", answer: "2", options: ["-1", "2"], helper: "Further right means greater.", visual: { type: "integer_number_line", min: -4, max: 4, highlights: [-1, 2], emphasis: "compare" } },
      { prompt: "Which is closer to zero?", answer: "-2", options: ["-7", "-2"], helper: "Closer to zero means less distance.", visual: { type: "integer_number_line", min: -8, max: 2, highlights: [-7, -2, 0], emphasis: "distance" } },
      { prompt: "-8 is greater than -3.", answer: "False", options: ["True", "False"], helper: "Check which point is further right.", visual: { type: "integer_number_line", min: -10, max: 2, highlights: [-8, -3], emphasis: "compare" } },
      { prompt: "Which is greater?", answer: "0", options: ["-1", "0"], helper: "Zero is to the right of -1.", visual: { type: "integer_number_line", min: -4, max: 2, highlights: [-1, 0], emphasis: "compare" } },
      { prompt: "Which is greater?", answer: "-7", options: ["-10", "-7"], helper: "Among negatives, closer to zero is greater.", visual: { type: "integer_number_line", min: -10, max: 2, highlights: [-10, -7], emphasis: "compare" } },
      { prompt: "Which statement is correct?", answer: "-2 > -5", options: ["-2 > -5", "-5 > -2", "They are equal"], helper: "Use position, not the size of the digits.", visual: { type: "integer_number_line", min: -6, max: 2, highlights: [-5, -2], emphasis: "compare" } },
      { prompt: "Which is smaller?", answer: "-9", options: ["-9", "-4"], helper: "The number further left is smaller.", visual: { type: "integer_number_line", min: -10, max: 2, highlights: [-9, -4], emphasis: "compare" } },
      { prompt: "Which is greater?", answer: "4", options: ["-4", "4"], helper: "Positive numbers sit to the right of negatives.", visual: { type: "integer_number_line", min: -6, max: 6, highlights: [-4, 4], emphasis: "compare" } },
      { prompt: "-3 is less than 2.", answer: "True", options: ["True", "False"], helper: "Compare both positions to zero.", visual: { type: "integer_number_line", min: -4, max: 4, highlights: [-3, 2], emphasis: "compare" } },
      { prompt: "Which is greater?", answer: "-1", options: ["-1", "-6"], helper: "Closer to zero means greater here.", visual: { type: "integer_number_line", min: -6, max: 2, highlights: [-6, -1], emphasis: "compare" } },
      { prompt: "Which statement is correct?", answer: "5 > -2", options: ["-2 > 5", "5 > -2", "They are equal"], helper: "Positive numbers are to the right of negatives.", visual: { type: "integer_number_line", min: -4, max: 6, highlights: [-2, 5], emphasis: "compare" } },
      { prompt: "-4 is greater than -9.", answer: "True", options: ["True", "False"], helper: "Numbers closer to zero are greater.", visual: { type: "integer_number_line", min: -10, max: 2, highlights: [-9, -4], emphasis: "compare" } },
      { prompt: "Which is smaller?", answer: "0", options: ["3", "0"], helper: "Zero is left of 3.", visual: { type: "integer_number_line", min: -2, max: 4, highlights: [0, 3], emphasis: "compare" } },
      { prompt: "Which is greater?", answer: "-3", options: ["-7", "-3"], helper: "Choose the point further right.", visual: { type: "integer_number_line", min: -8, max: 2, highlights: [-7, -3], emphasis: "compare" } },
      { prompt: "Which statement is correct?", answer: "-6 < -1", options: ["-6 < -1", "-1 < -6", "They are equal"], helper: "Less means further left.", visual: { type: "integer_number_line", min: -6, max: 2, highlights: [-6, -1], emphasis: "compare" } },
      { prompt: "-12 is less than -5.", answer: "True", options: ["True", "False"], helper: "The more negative value is smaller.", visual: { type: "integer_number_line", min: -12, max: 2, highlights: [-12, -5], emphasis: "compare" } },
      { prompt: "Which is closer to zero?", answer: "1", options: ["1", "-4"], helper: "Compare the distance to zero.", visual: { type: "integer_number_line", min: -6, max: 4, highlights: [1, -4, 0], emphasis: "distance" } },
      { prompt: "Which number is further right?", answer: "5", options: ["-2", "5"], helper: "Right is greater.", visual: { type: "integer_number_line", min: -4, max: 6, highlights: [-2, 5], emphasis: "compare" } },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.visual,
    };
  }

  if (explicitMode === "y6_integer_apply_think") {
    const templates = [
      { prompt: "You start at 0 and move 4 spaces left. Where are you?", answer: "-4", visual: { type: "integer_number_line", min: -6, max: 6, start: 0, end: -4, jump: -4, showArrow: true, emphasis: "movement" } },
      { prompt: "You start at -2 and move 5 spaces right. Where are you?", answer: "3", visual: { type: "integer_number_line", min: -6, max: 6, start: -2, end: 3, jump: 5, showArrow: true, emphasis: "movement" } },
      { prompt: "You start at 4 and move 6 spaces left. Where are you?", answer: "-2", visual: { type: "integer_number_line", min: -6, max: 6, start: 4, end: -2, jump: -6, showArrow: true, emphasis: "movement" } },
      { prompt: "You start at -5 and move 3 spaces right. Where are you?", answer: "-2", visual: { type: "integer_number_line", min: -6, max: 6, start: -5, end: -2, jump: 3, showArrow: true, emphasis: "movement" } },
      { prompt: "You start at 1 and move 4 spaces left. Where are you?", answer: "-3", visual: { type: "integer_number_line", min: -6, max: 6, start: 1, end: -3, jump: -4, showArrow: true, emphasis: "movement" } },
      { prompt: "You start at -1 and move 7 spaces right. Where are you?", answer: "6", visual: { type: "integer_number_line", min: -6, max: 6, start: -1, end: 6, jump: 7, showArrow: true, emphasis: "movement" } },
      { prompt: "Which integer is further from zero: -7 or 4? Type the integer.", answer: "-7", visual: { type: "integer_number_line", min: -8, max: 6, highlights: [-7, 0, 4], emphasis: "distance" } },
      { prompt: "Which integer is closer to zero: -2 or -8? Type the integer.", answer: "-2", visual: { type: "integer_number_line", min: -8, max: 2, highlights: [-8, -2, 0], emphasis: "distance" } },
      { prompt: "Complete the pattern: -5, -4, __, -2, -1", answer: "-3", visual: { type: "integer_number_line", min: -6, max: 1, highlights: [-5, -4, -3, -2, -1], emphasis: "position" } },
      { prompt: "You start at 2 and move 6 spaces left. Where are you?", answer: "-4", visual: { type: "integer_number_line", min: -6, max: 6, start: 2, end: -4, jump: -6, showArrow: true, emphasis: "movement" } },
      { prompt: "You start at -6 and move 3 spaces right. Where are you?", answer: "-3", visual: { type: "integer_number_line", min: -6, max: 6, start: -6, end: -3, jump: 3, showArrow: true, emphasis: "movement" } },
      { prompt: "How far is -9 from zero?", answer: "9", visual: { type: "integer_number_line", min: -10, max: 2, highlights: [-9, 0], emphasis: "distance" } },
      { prompt: "Which integer is 5 spaces to the right of -2?", answer: "3", visual: { type: "integer_number_line", min: -6, max: 6, start: -2, end: 3, jump: 5, showArrow: true, emphasis: "movement" } },
      { prompt: "Which integer is 4 spaces to the left of 1?", answer: "-3", visual: { type: "integer_number_line", min: -6, max: 6, start: 1, end: -3, jump: -4, showArrow: true, emphasis: "movement" } },
      { prompt: "Complete the sequence: -1, 0, 1, __, 3", answer: "2", visual: { type: "integer_number_line", min: -2, max: 4, highlights: [-1, 0, 1, 2, 3], emphasis: "position" } },
      { prompt: "How far is 7 from zero?", answer: "7", visual: { type: "integer_number_line", min: -2, max: 8, highlights: [0, 7], emphasis: "distance" } },
      { prompt: "You start at -1 and move 4 spaces left. Where are you?", answer: "-5", visual: { type: "integer_number_line", min: -6, max: 4, start: -1, end: -5, jump: -4, showArrow: true, emphasis: "movement" } },
      { prompt: "You start at 5 and move 8 spaces left. Where are you?", answer: "-3", visual: { type: "integer_number_line", min: -6, max: 6, start: 5, end: -3, jump: -8, showArrow: true, emphasis: "movement" } },
      { prompt: "Which integer is greater, -3 or 1? Type the greater integer.", answer: "1", visual: { type: "integer_number_line", min: -4, max: 2, highlights: [-3, 1], emphasis: "compare" } },
      { prompt: "Which integer is smaller, -6 or -2? Type the smaller integer.", answer: "-6", visual: { type: "integer_number_line", min: -6, max: 2, highlights: [-6, -2], emphasis: "compare" } },
      { prompt: "What number is 3 spaces from zero on the left?", answer: "-3", visual: { type: "integer_number_line", min: -6, max: 6, start: 0, end: -3, jump: -3, showArrow: true, emphasis: "movement" } },
      { prompt: "Complete the pattern: 2, 1, 0, __, -2", answer: "-1", visual: { type: "integer_number_line", min: -3, max: 3, highlights: [2, 1, 0, -1, -2], emphasis: "position" } },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Think about left, right, and distance from zero.",
      placeholder: "Type the integer",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "y6_integer_follow_movement") {
    const templates = [
      { prompt: "Start at -3 and move 8 spaces right. Where do you land?", answer: "5", start: -3, movement: 8, min: -12, max: 12 },
      { prompt: "Start at 7 and move 12 spaces left. Where do you land?", answer: "-5", start: 7, movement: -12, min: -12, max: 12 },
      { prompt: "Start at -6 and move 9 spaces right. Where do you land?", answer: "3", start: -6, movement: 9, min: -12, max: 12 },
      { prompt: "Start at 4 and move 11 spaces left. Where do you land?", answer: "-7", start: 4, movement: -11, min: -12, max: 12 },
      { prompt: "Start at -8 and move 5 spaces right. Where do you land?", answer: "-3", start: -8, movement: 5, min: -12, max: 12 },
      { prompt: "Start at -2 and move 10 spaces left. Where do you land?", answer: "-12", start: -2, movement: -10, min: -12, max: 12 },
      { prompt: "Start at 9 and move 13 spaces left. Where do you land?", answer: "-4", start: 9, movement: -13, min: -15, max: 15 },
      { prompt: "Start at -10 and move 6 spaces right. Where do you land?", answer: "-4", start: -10, movement: 6, min: -12, max: 12 },
      { prompt: "Start at 2 and move 9 spaces left. Where do you land?", answer: "-7", start: 2, movement: -9, min: -12, max: 12 },
      { prompt: "Start at -7 and move 14 spaces right. Where do you land?", answer: "7", start: -7, movement: 14, min: -15, max: 15 },
      { prompt: "Start at 5 and move 8 spaces left. Where do you land?", answer: "-3", start: 5, movement: -8, min: -12, max: 12 },
      { prompt: "Start at -4 and move 12 spaces right. Where do you land?", answer: "8", start: -4, movement: 12, min: -12, max: 12 },
      { prompt: "Start at 1 and move 10 spaces left. Where do you land?", answer: "-9", start: 1, movement: -10, min: -12, max: 12 },
      { prompt: "Start at -9 and move 15 spaces right. Where do you land?", answer: "6", start: -9, movement: 15, min: -15, max: 15 },
      { prompt: "Start at 6 and move 14 spaces left. Where do you land?", answer: "-8", start: 6, movement: -14, min: -15, max: 15 },
      { prompt: "Start at -11 and move 4 spaces right. Where do you land?", answer: "-7", start: -11, movement: 4, min: -12, max: 12 },
      { prompt: "Start at 8 and move 6 spaces left. Where do you land?", answer: "2", start: 8, movement: -6, min: -12, max: 12 },
      { prompt: "Start at -5 and move 13 spaces right. Where do you land?", answer: "8", start: -5, movement: 13, min: -15, max: 15 },
      { prompt: "Start at 0 and move 11 spaces left. Where do you land?", answer: "-11", start: 0, movement: -11, min: -12, max: 12 },
      { prompt: "Start at -12 and move 12 spaces right. Where do you land?", answer: "0", start: -12, movement: 12, min: -12, max: 12 },
      { prompt: "Start at 10 and move 15 spaces left. Where do you land?", answer: "-5", start: 10, movement: -15, min: -15, max: 15 },
      { prompt: "Start at -1 and move 12 spaces right. Where do you land?", answer: "11", start: -1, movement: 12, min: -12, max: 12 },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Start at the first number, then count the movement.",
      placeholder: "Type the integer",
      visual: {
        type: "integer_number_line",
        min: chosen.min,
        max: chosen.max,
        startValue: chosen.start,
        movement: chosen.movement,
        interactive: false,
        showArrow: true,
        emphasis: "movement",
      },
    };
  }

  if (explicitMode === "y6_integer_equations_movement") {
    const templates = [
      { prompt: "-3 + 8 = ?", answer: "5", start: -3, movement: 8, min: -12, max: 12 },
      { prompt: "7 - 12 = ?", answer: "-5", start: 7, movement: -12, min: -12, max: 12 },
      { prompt: "-6 + 9 = ?", answer: "3", start: -6, movement: 9, min: -12, max: 12 },
      { prompt: "4 - 11 = ?", answer: "-7", start: 4, movement: -11, min: -12, max: 12 },
      { prompt: "-8 + 5 = ?", answer: "-3", start: -8, movement: 5, min: -12, max: 12 },
      { prompt: "-2 - 10 = ?", answer: "-12", start: -2, movement: -10, min: -12, max: 12 },
      { prompt: "9 - 13 = ?", answer: "-4", start: 9, movement: -13, min: -15, max: 15 },
      { prompt: "-10 + 6 = ?", answer: "-4", start: -10, movement: 6, min: -12, max: 12 },
      { prompt: "2 - 9 = ?", answer: "-7", start: 2, movement: -9, min: -12, max: 12 },
      { prompt: "-7 + 14 = ?", answer: "7", start: -7, movement: 14, min: -15, max: 15 },
      { prompt: "5 - 8 = ?", answer: "-3", start: 5, movement: -8, min: -12, max: 12 },
      { prompt: "-4 + 12 = ?", answer: "8", start: -4, movement: 12, min: -12, max: 12 },
      { prompt: "1 - 10 = ?", answer: "-9", start: 1, movement: -10, min: -12, max: 12 },
      { prompt: "-9 + 15 = ?", answer: "6", start: -9, movement: 15, min: -15, max: 15 },
      { prompt: "6 - 14 = ?", answer: "-8", start: 6, movement: -14, min: -15, max: 15 },
      { prompt: "-11 + 4 = ?", answer: "-7", start: -11, movement: 4, min: -12, max: 12 },
      { prompt: "8 - 6 = ?", answer: "2", start: 8, movement: -6, min: -12, max: 12 },
      { prompt: "-5 + 13 = ?", answer: "8", start: -5, movement: 13, min: -15, max: 15 },
      { prompt: "0 - 11 = ?", answer: "-11", start: 0, movement: -11, min: -12, max: 12 },
      { prompt: "-12 + 12 = ?", answer: "0", start: -12, movement: 12, min: -12, max: 12 },
      { prompt: "10 - 15 = ?", answer: "-5", start: 10, movement: -15, min: -15, max: 15 },
      { prompt: "-1 + 12 = ?", answer: "11", start: -1, movement: 12, min: -12, max: 12 },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Use the equation as movement on the number line.",
      placeholder: "Type the integer",
      visual: {
        type: "integer_number_line",
        min: chosen.min,
        max: chosen.max,
        startValue: chosen.start,
        movement: chosen.movement,
        interactive: false,
        showArrow: true,
        emphasis: "movement",
      },
    };
  }

  if (explicitMode === "y6_integer_contexts_apply") {
    const templates: ReadonlyArray<{
      prompt: string;
      answer: string;
      options: string[];
      helper: string;
      start: number;
      movement: number;
      min: number;
      max: number;
      context?: "temperature" | "elevator" | "balance" | "score" | "elevation";
      title?: string;
      currentLabel?: string;
      changeLabel?: string;
      unitPrefix?: string;
      unitSuffix?: string;
    }> = [
      { prompt: "The temperature is -2°C. It rises by 7°C. What is the new temperature?", answer: "5", options: ["-9", "-5", "5", "9"], helper: "Start at -2 and move 7 right.", start: -2, movement: 7, min: -12, max: 12, context: "temperature", title: "Temperature change", currentLabel: "Current temperature", changeLabel: "Rise", unitSuffix: "°C" },
      { prompt: "The temperature is 4°C. It drops by 9°C. What is the new temperature?", answer: "-5", options: ["-5", "-13", "5", "13"], helper: "A drop means move left.", start: 4, movement: -9, min: -12, max: 12, context: "temperature", title: "Temperature change", currentLabel: "Current temperature", changeLabel: "Drop", unitSuffix: "°C" },
      { prompt: "You are on floor -3. You go up 8 floors. Where are you?", answer: "5", options: ["-11", "-5", "5", "11"], helper: "Up means move right.", start: -3, movement: 8, min: -12, max: 12, context: "elevator", title: "Elevator movement", currentLabel: "Current floor", changeLabel: "Floors up" },
      { prompt: "You are on floor 6. You go down 11 floors. Where are you?", answer: "-5", options: ["-5", "-17", "5", "17"], helper: "Down means move left.", start: 6, movement: -11, min: -12, max: 12, context: "elevator", title: "Elevator movement", currentLabel: "Current floor", changeLabel: "Floors down" },
      { prompt: "A player has -4 points and gains 10. New score?", answer: "6", options: ["-14", "-6", "6", "14"], helper: "A gain means move right.", start: -4, movement: 10, min: -12, max: 12, context: "score", title: "Score change", currentLabel: "Current score", changeLabel: "Points gained" },
      { prompt: "A player has 3 points and loses 8. New score?", answer: "-5", options: ["-5", "-11", "5", "11"], helper: "A loss means move left.", start: 3, movement: -8, min: -12, max: 12, context: "score", title: "Score change", currentLabel: "Current score", changeLabel: "Points lost" },
      { prompt: "A diver is at -7 m and rises 4 m. New position?", answer: "-3", options: ["-11", "-3", "3", "11"], helper: "Rising means move right.", start: -7, movement: 4, min: -12, max: 12, context: "elevation", title: "Depth change", currentLabel: "Current depth", changeLabel: "Rise", unitSuffix: " m" },
      { prompt: "A drone is at 5 m and drops 12 m. New position?", answer: "-7", options: ["-7", "-17", "7", "17"], helper: "Dropping means move left.", start: 5, movement: -12, min: -12, max: 12, context: "elevation", title: "Height change", currentLabel: "Current height", changeLabel: "Drop", unitSuffix: " m" },
      { prompt: "Bank balance is -$6. You deposit $10. New balance?", answer: "4", options: ["-16", "-4", "4", "16"], helper: "Depositing means move right.", start: -6, movement: 10, min: -12, max: 12, context: "balance", title: "Bank balance", currentLabel: "Current balance", changeLabel: "Deposit", unitPrefix: "$" },
      { prompt: "Bank balance is $2. You spend $9. New balance?", answer: "-7", options: ["-7", "-11", "7", "11"], helper: "Spending means move left.", start: 2, movement: -9, min: -12, max: 12, context: "balance", title: "Bank balance", currentLabel: "Current balance", changeLabel: "Spending", unitPrefix: "$" },
      { prompt: "Temperature is -8°C and rises by 13°C. New temperature?", answer: "5", options: ["-5", "5", "13", "21"], helper: "Cross zero carefully.", start: -8, movement: 13, min: -15, max: 15, context: "temperature", title: "Temperature change", currentLabel: "Current temperature", changeLabel: "Rise", unitSuffix: "°C" },
      { prompt: "Elevator starts at -2 and goes down 6 floors. Where are you?", answer: "-8", options: ["-8", "-4", "4", "8"], helper: "Down means move left.", start: -2, movement: -6, min: -12, max: 12, context: "elevator", title: "Elevator movement", currentLabel: "Current floor", changeLabel: "Floors down" },
      { prompt: "Team score is -5 and they gain 12 points. New score?", answer: "7", options: ["-17", "-7", "7", "17"], helper: "A gain means move right.", start: -5, movement: 12, min: -15, max: 15, context: "score", title: "Score change", currentLabel: "Current score", changeLabel: "Points gained" },
      { prompt: "Elevation is 3 m and drops 10 m. New elevation?", answer: "-7", options: ["-7", "-13", "7", "13"], helper: "A drop means move left.", start: 3, movement: -10, min: -12, max: 12, context: "elevation", title: "Elevation change", currentLabel: "Current elevation", changeLabel: "Drop", unitSuffix: " m" },
      { prompt: "Submarine is at -9 m and rises 9 m. New position?", answer: "0", options: ["-18", "-9", "0", "9"], helper: "Rise back to zero.", start: -9, movement: 9, min: -12, max: 12, context: "elevation", title: "Depth change", currentLabel: "Current depth", changeLabel: "Rise", unitSuffix: " m" },
      { prompt: "You owe $12 and pay back $5. Balance?", answer: "-7", options: ["-17", "-7", "7", "17"], helper: "Paying back reduces the debt but stays negative.", start: -12, movement: 5, min: -15, max: 15, context: "balance", title: "Debt and balance", currentLabel: "Current balance", changeLabel: "Paid back", unitPrefix: "$" },
      { prompt: "Start at 8 m above sea level and descend 14 m. New position?", answer: "-6", options: ["-6", "-14", "6", "14"], helper: "Descend means move left.", start: 8, movement: -14, min: -15, max: 15, context: "elevation", title: "Sea level change", currentLabel: "Current elevation", changeLabel: "Descent", unitSuffix: " m" },
      { prompt: "Temperature is 1°C and drops by 8°C. New temperature?", answer: "-7", options: ["-7", "-9", "7", "9"], helper: "A drop moves left past zero.", start: 1, movement: -8, min: -12, max: 12, context: "temperature", title: "Temperature change", currentLabel: "Current temperature", changeLabel: "Drop", unitSuffix: "°C" },
      { prompt: "Floor -6, go up 6 floors. Where are you?", answer: "0", options: ["-12", "-6", "0", "6"], helper: "Up means move right.", start: -6, movement: 6, min: -12, max: 12, context: "elevator", title: "Elevator movement", currentLabel: "Current floor", changeLabel: "Floors up" },
      { prompt: "Score is -10 and you gain 15 points. New score?", answer: "5", options: ["-5", "5", "10", "15"], helper: "Count across zero carefully.", start: -10, movement: 15, min: -15, max: 15, context: "score", title: "Score change", currentLabel: "Current score", changeLabel: "Points gained" },
      { prompt: "Which movement matches -4 + 9?", answer: "Start at -4 and move 9 right", options: ["Start at -4 and move 9 right", "Start at -4 and move 9 left", "Start at 9 and move 4 left"], helper: "Adding a positive means move right.", start: -4, movement: 9, min: -12, max: 12 },
      { prompt: "Which movement matches 3 - 8?", answer: "Start at 3 and move 8 left", options: ["Start at 3 and move 8 left", "Start at 3 and move 8 right", "Start at -8 and move 3 right"], helper: "Subtracting a positive means move left.", start: 3, movement: -8, min: -12, max: 12 },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;

    const numberLineVisual: IntegerNumberLineVisualData = {
      type: "integer_number_line",
      min: chosen.min,
      max: chosen.max,
      startValue: chosen.start,
      movement: chosen.movement,
      interactive: false,
      showArrow: true,
      emphasis: "movement",
    };

    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.context
        ? {
            type: "integer_context",
            context: chosen.context as IntegerContextVisualData["context"],
            title: chosen.title ?? "Integer context",
            currentValue: chosen.start,
            change: chosen.movement,
            currentLabel: chosen.currentLabel,
            changeLabel: chosen.changeLabel,
            unitPrefix: chosen.unitPrefix,
            unitSuffix: chosen.unitSuffix,
            numberLine: numberLineVisual,
          }
        : numberLineVisual,
    };
  }

  if (explicitMode === "y6_square_recognition") {
    const templates = [
      { prompt: "Which is a square number?", answer: "36", options: ["36", "35", "38"] },
      { prompt: "Is 49 a square number?", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "Which is NOT a square number?", answer: "30", options: ["25", "30", "64"] },
      { prompt: "What is 9²?", answer: "81", options: ["72", "81", "90"] },
      { prompt: "What is √64?", answer: "8", options: ["6", "8", "10"] },
      { prompt: "Which is a square number?", answer: "121", options: ["118", "121", "124"] },
      { prompt: "Is 72 a square number?", answer: "No", options: ["Yes", "No"] },
      { prompt: "What is 12²?", answer: "144", options: ["124", "142", "144"] },
      { prompt: "Which is NOT a square number?", answer: "50", options: ["49", "50", "64"] },
      { prompt: "What is √81?", answer: "9", options: ["8", "9", "10"] },
      { prompt: "Which is a square number?", answer: "100", options: ["96", "100", "104"] },
      { prompt: "Is 1 a square number?", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "What is 6²?", answer: "36", options: ["30", "36", "42"] },
      { prompt: "Which is NOT a square number?", answer: "63", options: ["49", "63", "81"] },
      { prompt: "What is √121?", answer: "11", options: ["10", "11", "12"] },
      { prompt: "Which is a square number?", answer: "16", options: ["14", "15", "16"] },
      { prompt: "Is 144 a square number?", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "What is 5²?", answer: "25", options: ["20", "25", "30"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Recognise the square number pattern quickly.",
    };
  }

  if (explicitMode === "y6_square_pattern_building") {
    const templates = [
      { prompt: "1, 4, 9, 16, ___", answer: "25", options: ["20", "25", "27"] },
      { prompt: "Square numbers: 1, 4, 9, 16. How do they increase?", answer: "+3, +5, +7, +9", options: ["+3, +5, +7, +9", "+2 each time", "×2 each time"] },
      { prompt: "What is the next square after 121?", answer: "144", options: ["132", "144", "169"] },
      { prompt: "__² = 81", answer: "9", options: ["8", "9", "10"] },
      { prompt: "Which number is between 7² and 8²?", answer: "55", options: ["50", "55", "60"] },
      { prompt: "Which number comes next? 16, 25, 36, ___", answer: "49", options: ["45", "48", "49"] },
      { prompt: "How do the differences change in 25, 36, 49, 64?", answer: "+11, +13, +15", options: ["+10, +12, +14", "+11, +13, +15", "+9, +11, +13"] },
      { prompt: "What is the next square after 64?", answer: "81", options: ["72", "81", "100"] },
      { prompt: "__² = 100", answer: "10", options: ["9", "10", "11"] },
      { prompt: "Which number is between 10² and 11²?", answer: "110", options: ["105", "110", "121"] },
      { prompt: "1, 4, 9, 16, 25, ___", answer: "36", options: ["30", "35", "36"] },
      { prompt: "What is the next square after 36?", answer: "49", options: ["42", "48", "49"] },
      { prompt: "__² = 49", answer: "7", options: ["6", "7", "8"] },
      { prompt: "Which number is between 5² and 6²?", answer: "30", options: ["28", "30", "32"] },
      { prompt: "The square numbers increase by odd numbers.", answer: "True", options: ["True", "False"] },
      { prompt: "What is the next difference after +7 in the square pattern?", answer: "+9", options: ["+8", "+9", "+10"] },
      { prompt: "Which statement is true?", answer: "The next square after 81 is 100", options: ["The next square after 81 is 90", "The next square after 81 is 100", "The next square after 81 is 99"] },
      { prompt: "What is the next square after 9²?", answer: "100", options: ["90", "99", "100"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Look for how square numbers grow from one to the next.",
    };
  }

  if (explicitMode === "y6_square_apply_fast") {
    const templates = [
      { prompt: "Which square number is closest to 50?", answer: "49" },
      { prompt: "√70 is closest to which whole number?", answer: "8" },
      { prompt: "Which is larger: 9² or 10²? Type the larger value.", answer: "100" },
      { prompt: "If n² = 49, what is (n+1)²?", answer: "64" },
      { prompt: "A square garden has an area of 81m². What is the side length?", answer: "9" },
      { prompt: "Which square number is closest to 90?", answer: "81" },
      { prompt: "√130 is closest to which whole number?", answer: "11" },
      { prompt: "If n² = 64, what is (n+1)²?", answer: "81" },
      { prompt: "A square patio has an area of 49m². What is the side length?", answer: "7" },
      { prompt: "Which square number is closest to 110?", answer: "121" },
      { prompt: "√50 is closest to which whole number?", answer: "7" },
      { prompt: "If n² = 25, what is (n+1)²?", answer: "36" },
      { prompt: "A square room has an area of 144m². What is the side length?", answer: "12" },
      { prompt: "Which square number is closest to 30?", answer: "25" },
      { prompt: "√95 is closest to which whole number?", answer: "10" },
      { prompt: "If n² = 100, what is (n-1)²?", answer: "81" },
      { prompt: "A square tile has an area of 36cm². What is the side length?", answer: "6" },
      { prompt: "Which square number is closest to 140?", answer: "144" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Use nearby square numbers to think fast.",
      placeholder: "Type the answer",
    };
  }

  if (explicitMode === "y6_decimal_scale_quick") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      visual?: DecimalShiftVisualData;
    }> = [
      {
        prompt: "0.4 × 10 = ?",
        answer: "4",
        options: ["0.04", "4", "40"],
        visual: {
          type: "decimal_shift" as const,
          original: "0.4",
          factor: 10,
          result: "4",
        },
      },
      {
        prompt: "0.32 × 100 = ?",
        answer: "32",
        options: ["3.2", "32", "320"],
        visual: {
          type: "decimal_shift" as const,
          original: "0.32",
          factor: 100,
          result: "32",
        },
      },
      { prompt: "3.4 × 10 = ?", answer: "34", options: ["3.04", "34", "340"] },
      { prompt: "0.56 × 10 = ?", answer: "5.6", options: ["0.056", "5.6", "56"] },
      { prompt: "7.21 × 100 = ?", answer: "721", options: ["72.1", "721", "7210"] },
      { prompt: "0.09 × 100 = ?", answer: "9", options: ["0.9", "9", "90"] },
      { prompt: "4.305 × 10 = ?", answer: "43.05", options: ["4.305", "43.05", "430.5"] },
      { prompt: "6.7 × 1000 = ?", answer: "6700", options: ["67", "670", "6700"] },
      { prompt: "0.004 × 1000 = ?", answer: "4", options: ["0.4", "4", "40"] },
      { prompt: "2.58 × 10 = ?", answer: "25.8", options: ["2.58", "25.8", "258"] },
      { prompt: "0.705 × 100 = ?", answer: "70.5", options: ["7.05", "70.5", "705"] },
      { prompt: "8.04 × 10 = ?", answer: "80.4", options: ["8.4", "80.4", "804"] },
      { prompt: "0.63 × 1000 = ?", answer: "630", options: ["63", "630", "6300"] },
      { prompt: "1.09 × 100 = ?", answer: "109", options: ["10.9", "109", "1090"] },
      { prompt: "0.008 × 1000 = ?", answer: "8", options: ["0.8", "8", "80"] },
      { prompt: "5.02 × 10 = ?", answer: "50.2", options: ["5.2", "50.2", "502"] },
      { prompt: "0.47 × 100 = ?", answer: "47", options: ["4.7", "47", "470"] },
      { prompt: "9.006 × 100 = ?", answer: "900.6", options: ["90.06", "900.6", "9006"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Check how the value scales.",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "y6_decimal_scale_thinking") {
    const templates = [
      { prompt: "Which is correct? 3.4 × 10 =", answer: "34", options: ["34", "3.04", "340"] },
      {
        prompt: "What happens when multiplying by 100?",
        answer: "digits shift left 2 places",
        options: ["digits shift left 2 places", "digits shift right 2 places", "number gets smaller"],
      },
      { prompt: "Which is greater?", answer: "0.45 × 10", options: ["0.45 × 10", "0.45"] },
      { prompt: "0.78 × 100 = ___", answer: "78", options: ["7.8", "78", "780"] },
      { prompt: "Which is correct? 5.6 × 100 =", answer: "560", options: ["560", "56", "5.6"] },
      {
        prompt: "Spot the error: 0.34 × 10 = 0.034",
        answer: "Decimal moved wrong way",
        options: ["Decimal moved wrong way", "Calculation correct", "Multiplied incorrectly"],
      },
      { prompt: "Which is correct? 0.09 × 100 =", answer: "9", options: ["0.9", "9", "90"] },
      {
        prompt: "What happens when multiplying by 1000?",
        answer: "digits shift left 3 places",
        options: ["digits shift left 3 places", "digits shift right 3 places", "number stays the same"],
      },
      { prompt: "Which is greater?", answer: "6.3 × 100", options: ["6.3", "6.3 × 100"] },
      { prompt: "4.305 × 10 = ___", answer: "43.05", options: ["4.305", "43.05", "430.5"] },
      { prompt: "Which is correct? 0.004 × 1000 =", answer: "4", options: ["0.4", "4", "40"] },
      {
        prompt: "Spot the error: 7.21 × 100 = 72.1",
        answer: "Not enough place-value shift",
        options: ["Not enough place-value shift", "Calculation correct", "Number should get smaller"],
      },
      { prompt: "Which equals 670?", answer: "6.7 × 100", options: ["6.7 × 100", "6.7 × 10", "6.7 × 1000"] },
      { prompt: "Which is correct? 1.09 × 100 =", answer: "109", options: ["10.9", "109", "1090"] },
      {
        prompt: "What is true when multiplying a decimal by 10?",
        answer: "the value gets 10 times larger",
        options: ["the value gets 10 times larger", "the value gets smaller", "the digits stay in the same place"],
      },
      { prompt: "Which is correct? 0.705 × 100 =", answer: "70.5", options: ["7.05", "70.5", "705"] },
      { prompt: "Which is greater?", answer: "0.078 × 1000", options: ["0.078", "0.078 × 1000"] },
      {
        prompt: "Spot the error: 8.04 × 10 = 804",
        answer: "Shifted too many places",
        options: ["Shifted too many places", "Calculation correct", "Number should be smaller"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Think about size and place value.",
    };
  }

  if (explicitMode === "y6_decimal_scale_apply") {
    const templates: Array<{
      prompt: string;
      answer: string;
      visual?: DecimalShiftVisualData;
    }> = [
      { prompt: "A number is multiplied by 100. It becomes 450. What was the original number?", answer: "4.5" },
      { prompt: "Fill in the blank: __ × 100 = 320", answer: "3.2" },
      {
        prompt: "0.078 × 1000 = ?",
        answer: "78",
        visual: { type: "decimal_shift", original: "0.078", factor: 1000, result: "78", hideResult: true },
      },
      { prompt: "A number is multiplied by 10. It becomes 56. What was the original number?", answer: "5.6" },
      { prompt: "__ × 1000 = 7", answer: "0.007" },
      {
        prompt: "If 0.49 × 100 = ?, type the answer.",
        answer: "49",
        visual: { type: "decimal_shift", original: "0.49", factor: 100, result: "49", hideResult: true },
      },
      { prompt: "A value is multiplied by 1000 and becomes 630. What was the original number?", answer: "0.63" },
      { prompt: "Fill in the blank: __ × 10 = 80.4", answer: "8.04" },
      {
        prompt: "6.7 × 100 = ?",
        answer: "670",
        visual: { type: "decimal_shift", original: "6.7", factor: 100, result: "670", hideResult: true },
      },
      { prompt: "A number is multiplied by 100 and becomes 900.6. What was the original number?", answer: "9.006" },
      { prompt: "__ × 10 = 25.8", answer: "2.58" },
      {
        prompt: "0.004 × 1000 = ?",
        answer: "4",
        visual: { type: "decimal_shift", original: "0.004", factor: 1000, result: "4", hideResult: true },
      },
      { prompt: "A number is multiplied by 1000 and becomes 8. What was the original number?", answer: "0.008" },
      { prompt: "Fill in the blank: __ × 100 = 78", answer: "0.78" },
      {
        prompt: "7.21 × 100 = ?",
        answer: "721",
        visual: { type: "decimal_shift", original: "7.21", factor: 100, result: "721", hideResult: true },
      },
      { prompt: "A number is multiplied by 10 and becomes 50.2. What was the original number?", answer: "5.02" },
      { prompt: "__ × 100 = 47", answer: "0.47" },
      {
        prompt: "4.305 × 10 = ?",
        answer: "43.05",
        visual: { type: "decimal_shift", original: "4.305", factor: 10, result: "43.05", hideResult: true },
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Use place value to scale or reverse the scaling.",
      placeholder: "Type the answer",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "y6_decimal_divide_quick") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      visual?: DecimalShiftVisualData;
    }> = [
      {
        prompt: "6 ÷ 10 = ?",
        answer: "0.6",
        options: ["0.6", "6", "60"],
        visual: { type: "decimal_shift", original: "6", factor: 10, result: "0.6" },
      },
      {
        prompt: "32 ÷ 100 = ?",
        answer: "0.32",
        options: ["3.2", "0.32", "0.032"],
        visual: { type: "decimal_shift", original: "32", factor: 100, result: "0.32" },
      },
      { prompt: "34 ÷ 10 = ?", answer: "3.4", options: ["3.4", "0.34", "34"] },
      { prompt: "5.6 ÷ 10 = ?", answer: "0.56", options: ["5.6", "0.56", "0.056"] },
      { prompt: "721 ÷ 100 = ?", answer: "7.21", options: ["7.21", "72.1", "0.721"] },
      { prompt: "9 ÷ 100 = ?", answer: "0.09", options: ["0.9", "0.09", "0.009"] },
      { prompt: "43.05 ÷ 10 = ?", answer: "4.305", options: ["43.05", "4.305", "0.4305"] },
      { prompt: "6700 ÷ 1000 = ?", answer: "6.7", options: ["67", "6.7", "0.67"] },
      { prompt: "4 ÷ 1000 = ?", answer: "0.004", options: ["0.4", "0.04", "0.004"] },
      { prompt: "25.8 ÷ 10 = ?", answer: "2.58", options: ["2.58", "0.258", "25.8"] },
      { prompt: "70.5 ÷ 100 = ?", answer: "0.705", options: ["7.05", "0.705", "0.0705"] },
      { prompt: "80.4 ÷ 10 = ?", answer: "8.04", options: ["8.04", "0.804", "80.4"] },
      { prompt: "630 ÷ 1000 = ?", answer: "0.63", options: ["6.3", "0.63", "0.063"] },
      { prompt: "109 ÷ 100 = ?", answer: "1.09", options: ["10.9", "1.09", "0.109"] },
      { prompt: "8 ÷ 1000 = ?", answer: "0.008", options: ["0.8", "0.08", "0.008"] },
      { prompt: "50.2 ÷ 10 = ?", answer: "5.02", options: ["5.02", "0.502", "50.2"] },
      { prompt: "47 ÷ 100 = ?", answer: "0.47", options: ["4.7", "0.47", "0.047"] },
      { prompt: "900.6 ÷ 100 = ?", answer: "9.006", options: ["90.06", "9.006", "0.9006"] },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Check how the value scales down.",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "y6_decimal_divide_thinking") {
    const templates = [
      { prompt: "Which is correct? 5.6 ÷ 10 =", answer: "0.56", options: ["0.56", "56", "5.06"] },
      {
        prompt: "What happens when dividing by 100?",
        answer: "digits shift right 2 places",
        options: ["digits shift right 2 places", "digits shift left 2 places", "number gets bigger"],
      },
      { prompt: "Which is smaller?", answer: "0.45 ÷ 10", options: ["0.45 ÷ 10", "0.45"] },
      { prompt: "78 ÷ 100 = ___", answer: "0.78", options: ["7.8", "0.78", "0.078"] },
      { prompt: "Which is correct? 56 ÷ 100 =", answer: "0.56", options: ["0.56", "5.6", "56"] },
      {
        prompt: "Spot the error: 3.4 ÷ 10 = 34",
        answer: "Decimal moved wrong way",
        options: ["Decimal moved wrong way", "Calculation correct", "Multiplied instead"],
      },
      { prompt: "Which is correct? 6700 ÷ 1000 =", answer: "6.7", options: ["6.7", "67", "0.67"] },
      {
        prompt: "What happens when dividing by 1000?",
        answer: "digits shift right 3 places",
        options: ["digits shift right 3 places", "digits shift left 3 places", "the value stays the same"],
      },
      { prompt: "Which is smaller?", answer: "7.21 ÷ 100", options: ["7.21", "7.21 ÷ 100"] },
      { prompt: "43.05 ÷ 10 = ___", answer: "4.305", options: ["4.305", "43.05", "0.4305"] },
      { prompt: "Which is correct? 4 ÷ 1000 =", answer: "0.004", options: ["0.4", "0.04", "0.004"] },
      {
        prompt: "Spot the error: 721 ÷ 100 = 72.1",
        answer: "Not enough place-value shift",
        options: ["Not enough place-value shift", "Calculation correct", "Number should get bigger"],
      },
      { prompt: "Which equals 6.7?", answer: "670 ÷ 100", options: ["670 ÷ 100", "67 ÷ 10", "6700 ÷ 100"] },
      { prompt: "Which is correct? 109 ÷ 100 =", answer: "1.09", options: ["10.9", "1.09", "0.109"] },
      {
        prompt: "What is true when dividing a decimal by 10?",
        answer: "the value gets 10 times smaller",
        options: ["the value gets 10 times smaller", "the value gets bigger", "the digits stay in the same place"],
      },
      { prompt: "Which is correct? 70.5 ÷ 100 =", answer: "0.705", options: ["7.05", "0.705", "0.0705"] },
      { prompt: "Which is smaller?", answer: "78 ÷ 1000", options: ["78", "78 ÷ 1000"] },
      {
        prompt: "Spot the error: 5.02 ÷ 10 = 50.2",
        answer: "Decimal moved wrong way",
        options: ["Decimal moved wrong way", "Calculation correct", "Divided incorrectly"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Think about whether the number should get smaller.",
    };
  }

  if (explicitMode === "y6_decimal_divide_apply") {
    const templates: Array<{
      prompt: string;
      answer: string;
      visual?: DecimalShiftVisualData;
    }> = [
      { prompt: "A number is divided by 100. It becomes 4.5. What was the original number?", answer: "450" },
      { prompt: "Fill in the blank: __ ÷ 100 = 3.2", answer: "320" },
      {
        prompt: "78 ÷ 1000 = ?",
        answer: "0.078",
        visual: { type: "decimal_shift", original: "78", factor: 1000, result: "0.078", hideResult: true },
      },
      { prompt: "A number is divided by 10. It becomes 5.6. What was the original number?", answer: "56" },
      { prompt: "__ ÷ 1000 = 0.007", answer: "7" },
      {
        prompt: "49 ÷ 100 = ?",
        answer: "0.49",
        visual: { type: "decimal_shift", original: "49", factor: 100, result: "0.49", hideResult: true },
      },
      { prompt: "A value is divided by 1000 and becomes 0.63. What was the original number?", answer: "630" },
      { prompt: "Fill in the blank: __ ÷ 10 = 8.04", answer: "80.4" },
      {
        prompt: "670 ÷ 100 = ?",
        answer: "6.7",
        visual: { type: "decimal_shift", original: "670", factor: 100, result: "6.7", hideResult: true },
      },
      { prompt: "A number is divided by 100 and becomes 9.006. What was the original number?", answer: "900.6" },
      { prompt: "__ ÷ 10 = 2.58", answer: "25.8" },
      {
        prompt: "8 ÷ 1000 = ?",
        answer: "0.008",
        visual: { type: "decimal_shift", original: "8", factor: 1000, result: "0.008", hideResult: true },
      },
      { prompt: "A number is divided by 1000 and becomes 0.008. What was the original number?", answer: "8" },
      { prompt: "Fill in the blank: __ ÷ 100 = 0.78", answer: "78" },
      {
        prompt: "721 ÷ 100 = ?",
        answer: "7.21",
        visual: { type: "decimal_shift", original: "721", factor: 100, result: "7.21", hideResult: true },
      },
      { prompt: "A number is divided by 10 and becomes 5.02. What was the original number?", answer: "50.2" },
      { prompt: "__ ÷ 100 = 0.47", answer: "47" },
      {
        prompt: "43.05 ÷ 10 = ?",
        answer: "4.305",
        visual: { type: "decimal_shift", original: "43.05", factor: 10, result: "4.305", hideResult: true },
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Use place value to scale down or reverse the division.",
      placeholder: "Type the answer",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "y6_decimal_mixed_choose") {
    const templates = [
      { prompt: "What operation? 3.4 → 34", answer: "×10", options: ["×10", "÷10", "×100"] },
      { prompt: "What operation? 5.6 → 0.56", answer: "÷10", options: ["×10", "÷10", "×100"] },
      { prompt: "What operation? 7.21 → 721", answer: "×100", options: ["×10", "×100", "÷100"] },
      { prompt: "What operation? 450 → 4.5", answer: "÷100", options: ["×100", "÷100", "×10"] },
      { prompt: "What operation? 0.078 → 78", answer: "×1000", options: ["×1000", "÷1000", "×100"] },
      { prompt: "What operation? 6.7 → 6700", answer: "×1000", options: ["×100", "×1000", "÷1000"] },
      { prompt: "What operation? 78 → 0.78", answer: "÷100", options: ["÷10", "÷100", "×100"] },
      { prompt: "What operation? 0.45 → 45", answer: "×100", options: ["×10", "×100", "÷100"] },
      { prompt: "What operation? 32 → 0.32", answer: "÷100", options: ["×100", "÷100", "÷10"] },
      { prompt: "What operation? 4 → 0.004", answer: "÷1000", options: ["÷10", "÷100", "÷1000"] },
      { prompt: "What operation? 0.63 → 630", answer: "×1000", options: ["×100", "×1000", "÷1000"] },
      { prompt: "What operation? 900.6 → 9.006", answer: "÷100", options: ["÷10", "÷100", "÷1000"] },
      { prompt: "What operation? 0.09 → 9", answer: "×100", options: ["×10", "×100", "÷100"] },
      { prompt: "What operation? 721 → 7.21", answer: "÷100", options: ["×100", "÷100", "÷10"] },
      { prompt: "What operation? 5.02 → 50.2", answer: "×10", options: ["×10", "÷10", "×100"] },
      { prompt: "What operation? 109 → 1.09", answer: "÷100", options: ["÷10", "÷100", "×100"] },
      { prompt: "What operation? 0.004 → 4", answer: "×1000", options: ["×100", "×1000", "÷1000"] },
      { prompt: "What operation? 43.05 → 4.305", answer: "÷10", options: ["×10", "÷10", "÷100"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Decide whether the number should scale up or down.",
    };
  }

  if (explicitMode === "y6_decimal_mixed_calculate") {
    const templates: Array<{
      prompt: string;
      answer: string;
      visual?: DecimalShiftVisualData;
    }> = [
      { prompt: "0.45 × 100 = ?", answer: "45", visual: { type: "decimal_shift", original: "0.45", factor: 100, result: "45", hideResult: true } },
      { prompt: "6.7 ÷ 10 = ?", answer: "0.67", visual: { type: "decimal_shift", original: "6.7", factor: 10, result: "0.67", hideResult: true } },
      { prompt: "0.49 × 100 = ?", answer: "49", visual: { type: "decimal_shift", original: "0.49", factor: 100, result: "49", hideResult: true } },
      { prompt: "78 ÷ 100 = ?", answer: "0.78", visual: { type: "decimal_shift", original: "78", factor: 100, result: "0.78", hideResult: true } },
      { prompt: "5.6 × 10 = ?", answer: "56", visual: { type: "decimal_shift", original: "5.6", factor: 10, result: "56", hideResult: true } },
      { prompt: "4 ÷ 1000 = ?", answer: "0.004", visual: { type: "decimal_shift", original: "4", factor: 1000, result: "0.004", hideResult: true } },
      { prompt: "7.21 × 100 = ?", answer: "721", visual: { type: "decimal_shift", original: "7.21", factor: 100, result: "721", hideResult: true } },
      { prompt: "450 ÷ 100 = ?", answer: "4.5", visual: { type: "decimal_shift", original: "450", factor: 100, result: "4.5", hideResult: true } },
      { prompt: "0.078 × 1000 = ?", answer: "78", visual: { type: "decimal_shift", original: "0.078", factor: 1000, result: "78", hideResult: true } },
      { prompt: "6700 ÷ 1000 = ?", answer: "6.7", visual: { type: "decimal_shift", original: "6700", factor: 1000, result: "6.7", hideResult: true } },
      { prompt: "0.56 × 10 = ?", answer: "5.6", visual: { type: "decimal_shift", original: "0.56", factor: 10, result: "5.6", hideResult: true } },
      { prompt: "56 ÷ 100 = ?", answer: "0.56", visual: { type: "decimal_shift", original: "56", factor: 100, result: "0.56", hideResult: true } },
      { prompt: "3.2 × 100 = ?", answer: "320", visual: { type: "decimal_shift", original: "3.2", factor: 100, result: "320", hideResult: true } },
      { prompt: "320 ÷ 100 = ?", answer: "3.2", visual: { type: "decimal_shift", original: "320", factor: 100, result: "3.2", hideResult: true } },
      { prompt: "6.7 × 100 = ?", answer: "670", visual: { type: "decimal_shift", original: "6.7", factor: 100, result: "670", hideResult: true } },
      { prompt: "49 ÷ 100 = ?", answer: "0.49", visual: { type: "decimal_shift", original: "49", factor: 100, result: "0.49", hideResult: true } },
      { prompt: "5.02 ÷ 10 = ?", answer: "0.502", visual: { type: "decimal_shift", original: "5.02", factor: 10, result: "0.502", hideResult: true } },
      { prompt: "0.63 × 1000 = ?", answer: "630", visual: { type: "decimal_shift", original: "0.63", factor: 1000, result: "630", hideResult: true } },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Calculate, then check whether the size makes sense.",
      placeholder: "Type the answer",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "y6_decimal_mixed_reason") {
    const templates = [
      { prompt: "Is this reasonable? 0.56 × 10 = 0.056", answer: "No", options: ["Yes", "No"] },
      { prompt: "Is this reasonable? 6.7 ÷ 10 = 67", answer: "No", options: ["Yes", "No"] },
      { prompt: "Which is wrong?", answer: "4.5 × 10 = 0.45", options: ["4.5 × 100 = 450", "4.5 ÷ 10 = 0.45", "4.5 × 10 = 0.45"] },
      {
        prompt: "What went wrong? 3.4 × 10 = 3.04",
        answer: "Decimal moved wrong way",
        options: ["Decimal moved wrong way", "Multiplied incorrectly", "Correct"],
      },
      { prompt: "Which makes sense?", answer: "0.078 × 1000 = 78", options: ["0.078 × 1000 = 78", "0.078 × 1000 = 0.078", "0.078 × 1000 = 0.78"] },
      { prompt: "Is this reasonable? 78 ÷ 100 = 7.8", answer: "No", options: ["Yes", "No"] },
      { prompt: "Which is wrong?", answer: "0.45 ÷ 10 = 4.5", options: ["0.45 × 100 = 45", "0.45 ÷ 10 = 4.5", "450 ÷ 100 = 4.5"] },
      {
        prompt: "What went wrong? 721 ÷ 100 = 72.1",
        answer: "Not enough place-value shift",
        options: ["Not enough place-value shift", "Too many zeros", "Correct"],
      },
      { prompt: "Which makes sense?", answer: "49 ÷ 100 = 0.49", options: ["49 ÷ 100 = 4.9", "49 ÷ 100 = 0.49", "49 ÷ 100 = 49"] },
      { prompt: "Is this reasonable? 0.004 × 1000 = 4", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "Which is wrong?", answer: "7.21 × 100 = 72.1", options: ["7.21 × 100 = 72.1", "7.21 × 10 = 72.1", "721 ÷ 100 = 7.21"] },
      {
        prompt: "What went wrong? 5.6 ÷ 10 = 56",
        answer: "Decimal moved wrong way",
        options: ["Decimal moved wrong way", "Divided correctly", "Number should get bigger"],
      },
      { prompt: "Which makes sense?", answer: "6700 ÷ 1000 = 6.7", options: ["6700 ÷ 1000 = 670", "6700 ÷ 1000 = 6.7", "6700 ÷ 1000 = 0.67"] },
      { prompt: "Is this reasonable? 3.2 × 100 = 320", answer: "Yes", options: ["Yes", "No"] },
      { prompt: "Which is wrong?", answer: "320 ÷ 100 = 32", options: ["320 ÷ 100 = 32", "3.2 × 100 = 320", "32 ÷ 10 = 3.2"] },
      {
        prompt: "What went wrong? 0.63 × 1000 = 63",
        answer: "Not enough place-value shift",
        options: ["Not enough place-value shift", "Correct", "Number should get smaller"],
      },
      { prompt: "Which makes sense?", answer: "56 ÷ 100 = 0.56", options: ["56 ÷ 100 = 5.6", "56 ÷ 100 = 0.56", "56 ÷ 100 = 56"] },
      { prompt: "Is this reasonable? 0.49 × 100 = 49", answer: "Yes", options: ["Yes", "No"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Check whether the answer got bigger or smaller in the right way.",
    };
  }

  if (explicitMode === "factor_multiple_algorithm") {
    const multipleChoiceTemplates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      visual: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "Follow the rule: if the last digit is 0, the number is divisible by 10. Which number passes the rule?",
        answer: "460",
        options: ["456", "458", "460", "462"],
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 10",
          steps: ["Look at the last digit.", "If it is 0, the number passes the test."],
          decisionLabel: "Pass or fail",
        },
      },
      {
        prompt: "Follow the rule: if a number ends in 0 or 5, it is divisible by 5. Does 135 pass the rule?",
        answer: "Yes",
        options: ["Yes", "No", "Only if even", "Cannot tell"],
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 5",
          steps: ["Look at the last digit.", "If it is 0 or 5, the number passes the test."],
          decisionLabel: "Pass or fail",
        },
      },
      {
        prompt: "Use this algorithm: Step 1 add the digits. Step 2 test the sum for divisibility by 3. Is 89,472 divisible by 3?",
        answer: "Yes",
        options: ["Yes", "No", "Only if it ends in 0", "Cannot tell"],
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 3",
          steps: ["Add 8 + 9 + 4 + 7 + 2.", "Test whether the sum is divisible by 3."],
          decisionLabel: "If yes, 89,472 is divisible by 3",
        },
      },
      {
        prompt: "A rule box says: first test divisibility by 2, then by 5. Which number is divisible by both?",
        answer: "1,250",
        options: ["1,245", "1,248", "1,250", "1,255"],
        visual: {
          type: "rule_box" as const,
          title: "Two-step test",
          steps: ["Check if the number is even.", "Then check if it ends in 0 or 5."],
          decisionLabel: "Passes both tests",
        },
      },
      {
        prompt: "Which instruction belongs in a divisibility-by-3 flowchart?",
        answer: "Add the digits",
        options: ["Add the digits", "Check for a last digit of 0", "Count the decimal places", "Subtract 1"],
        visual: {
          type: "rule_box" as const,
          title: "Flowchart step",
          steps: ["Start with a number.", "Choose the correct rule step to test divisibility by 3."],
        },
      },
      {
        prompt: "Follow the rule: if a number is divisible by 2 and 3, it is divisible by 6. Is 48 divisible by 6?",
        answer: "Yes",
        options: ["Yes", "No", "Only if it is a multiple of 5", "Cannot tell"],
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 6",
          steps: ["Test divisibility by 2.", "Test divisibility by 3.", "If both are true, the number is divisible by 6."],
          decisionLabel: "Pass both tests",
        },
      },
      {
        prompt: "A flowchart says: Step 1 check if the number is even. Step 2 check if the digit sum is divisible by 3. Which number passes both steps?",
        answer: "72",
        options: ["70", "72", "74", "75"],
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 6",
          steps: ["Check if the number is even.", "Add the digits and test divisibility by 3."],
          decisionLabel: "Passes both steps",
        },
      },
      {
        prompt: "Use the rule box. Which number passes the divisibility-by-4 test?",
        answer: "1,248",
        options: ["1,246", "1,248", "1,250", "1,254"],
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 4",
          steps: ["Look at the last two digits.", "If that two-digit number is divisible by 4, the whole number passes."],
          decisionLabel: "Pass or fail",
        },
      },
      {
        prompt: "Use the rule box. Which number passes the divisibility-by-8 test?",
        answer: "4,216",
        options: ["4,214", "4,216", "4,218", "4,222"],
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 8",
          steps: ["Look at the last three digits.", "If that three-digit number is divisible by 8, the whole number passes."],
          decisionLabel: "Pass or fail",
        },
      },
      {
        prompt: "Use this algorithm: add the digits, then test the sum for divisibility by 9. Is 4,347 divisible by 9?",
        answer: "Yes",
        options: ["Yes", "No", "Only if it ends in 0", "Cannot tell"],
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 9",
          steps: ["Add 4 + 3 + 4 + 7.", "Test whether the total is divisible by 9."],
          decisionLabel: "If yes, 4,347 is divisible by 9",
        },
      },
      {
        prompt: "Use the rule box. Which number passes the divisibility-by-2 test?",
        answer: "5,472",
        options: ["5,471", "5,472", "5,475", "5,479"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 2",
          steps: ["Look at the last digit.", "If it is 0, 2, 4, 6, or 8, the number passes."],
          decisionLabel: "Pass or fail",
        },
      },
      {
        prompt: "Use this two-step rule: first test divisibility by 2, then by 3. Which number passes both steps?",
        answer: "1,158",
        options: ["1,152", "1,154", "1,156", "1,158"],
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 6",
          steps: ["Check if the number is even.", "Add the digits and test divisibility by 3."],
          decisionLabel: "Passes both steps",
        },
      },
      {
        prompt: "Which missing step completes this rule for divisibility by 5?",
        answer: "Check whether the last digit is 0 or 5",
        options: [
          "Check whether the last digit is 0 or 5",
          "Add all the digits",
          "Divide by 2",
          "Round to the nearest 10",
        ],
        visual: {
          type: "rule_box" as const,
          title: "Complete the algorithm",
          steps: ["Start with a number.", "____", "Decide whether the number passes the test."],
        },
      },
    ];
    const typedTemplates = [
      {
        prompt: "Use this algorithm: Step 1 add the digits. Step 2 if the sum is a multiple of 3, the number is divisible by 3. What is the digit sum of 372?",
        answer: "12",
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 3",
          steps: ["Add the digits.", "Check whether the total is a multiple of 3."],
          decisionLabel: "If yes, the number is divisible by 3",
        },
      },
      {
        prompt: "Use this step rule: find two factor pairs. Which number fits 4 × __ = 36?",
        answer: "9",
        visual: {
          type: "rule_box" as const,
          title: "Factor check",
          steps: ["Start with 4 × __ = 36.", "Find the missing factor that makes 36 exactly."],
        },
      },
      {
        prompt: "Type the missing instruction: To test divisibility by 10, check whether the number ends in __.",
        answer: "0",
        visual: {
          type: "rule_box" as const,
          title: "Complete the rule",
          steps: ["Look at the last digit.", "If the last digit is ___, the number is divisible by 10."],
        },
      },
      {
        prompt: "A student follows this rule: add the digits of 4,572 to test divisibility by 3. Type the digit sum.",
        answer: "18",
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 3",
          steps: ["Add 4 + 5 + 7 + 2.", "Use the sum to decide divisibility by 3."],
        },
      },
      {
        prompt: "Use the rule box. Type Yes or No: Is 1,248 divisible by 4?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 4",
          steps: ["Look at the last two digits.", "If those digits make a number divisible by 4, the whole number passes."],
        },
      },
      {
        prompt: "Use the rule box. Type Yes or No: Is 4,216 divisible by 8?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 8",
          steps: ["Look at the last three digits.", "If those digits make a number divisible by 8, the whole number passes."],
        },
      },
      {
        prompt: "Use this algorithm: add the digits of 4,347 to test divisibility by 9. Type the digit sum.",
        answer: "18",
        visual: {
          type: "rule_box" as const,
          title: "Divisibility by 9",
          steps: ["Add 4 + 3 + 4 + 7.", "Use the sum to decide divisibility by 9."],
        },
      },
      {
        prompt: "Use the rule box. Type Yes or No: Is 5,472 divisible by 2?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 2",
          steps: ["Look at the last digit.", "If it is 0, 2, 4, 6, or 8, the number passes."],
        },
      },
      {
        prompt: "Use the rule box. Type Yes or No: Is 1,158 divisible by 6?",
        answer: "Yes",
        visual: {
          type: "rule_box" as const,
          title: "Divisible by 6",
          steps: ["Check if the number is even.", "Add the digits and test divisibility by 3."],
        },
      },
    ];
    if (asMultipleChoice) {
      const chosen =
        multipleChoiceTemplates[randInt(0, multipleChoiceTemplates.length - 1)] ??
        multipleChoiceTemplates[0]!;
      return {
        kind: "multiple_choice",
        prompt: chosen.prompt,
        options: shuffle(chosen.options),
        answer: chosen.answer,
        helper: "Follow the factor or divisibility rule step by step.",
        visual: chosen.visual,
      };
    }

    const chosen = typedTemplates[randInt(0, typedTemplates.length - 1)] ?? typedTemplates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Use a factor, multiple, or divisibility rule.",
      placeholder: "Type the answer",
      visual: chosen.visual,
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

  if (explicitMode === "pattern_fast_thinking") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      helper: string;
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "6, 12, 18, 24, __. What comes next?",
        answer: "30",
        options: ["28", "30", "32", "36"],
        helper: "Spot the step size quickly.",
        visual: {
          type: "rule_box",
          title: "Pattern",
          steps: ["Check how much each term increases.", "Use the same increase again."],
        },
      },
      {
        prompt: "Which list shows only multiples of 6?",
        answer: "18, 24, 30, 36",
        options: [
          "18, 24, 30, 36",
          "18, 25, 30, 36",
          "16, 24, 30, 36",
          "18, 24, 31, 36",
        ],
        helper: "Every number in the list must fit the same rule.",
      },
      {
        prompt: "Which pattern increases by 5 each time?",
        answer: "35, 40, 45, 50",
        options: [
          "35, 40, 45, 50",
          "35, 41, 47, 53",
          "35, 45, 55, 65",
          "35, 39, 43, 47",
        ],
        helper: "Look at the difference between terms.",
      },
      {
        prompt: "Which number belongs next: 8, 16, 24, 32, __?",
        answer: "40",
        options: ["36", "40", "44", "48"],
        helper: "This pattern keeps adding the same multiple.",
      },
      {
        prompt: "Which list shows multiples of 8?",
        answer: "24, 32, 40, 48",
        options: [
          "24, 32, 40, 48",
          "24, 30, 40, 48",
          "22, 32, 40, 48",
          "24, 32, 42, 48",
        ],
        helper: "Check each number against the same times-table pattern.",
      },
      {
        prompt: "Which rule matches 45, 60, 75, 90?",
        answer: "Add 15 each time",
        options: ["Add 15 each time", "Add 10 each time", "Multiply by 2 each time", "Add 5 each time"],
        helper: "Check the change from one term to the next.",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.visual,
    };
  }

  if (explicitMode === "pattern_reasoning") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      helper: string;
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "Multiples of 4: 4, 8, 12, 16, 20. Noah says, 'They always go up by 4.' Mia says, 'They are all even numbers.' Who is correct?",
        answer: "Both are correct",
        options: [
          "Both are correct",
          "Only Noah is correct",
          "Only Mia is correct",
          "Neither is correct",
        ],
        helper: "A pattern can have more than one true description.",
      },
      {
        prompt: "Why do multiples of 5 always end in 0 or 5?",
        answer: "Because they are made by adding 5 each time, so the ones digit repeats in a 0, 5 pattern",
        options: [
          "Because they are made by adding 5 each time, so the ones digit repeats in a 0, 5 pattern",
          "Because every odd number is a multiple of 5",
          "Because multiplying always makes the last digit 5",
          "Because only 2-digit numbers can be multiples of 5",
        ],
        helper: "Think about what happens to the ones digit when 5 keeps being added.",
        visual: {
          type: "rule_box",
          title: "Multiples of 5",
          steps: ["Look at the ones digits in the sequence.", "Notice the repeating pattern."],
        },
      },
      {
        prompt: "A student says, '30, 40, 50, 60 are multiples of 10, so they all end in 0.' Which answer is best?",
        answer: "The student is correct because adding 10 keeps the ones digit at 0",
        options: [
          "The student is correct because adding 10 keeps the ones digit at 0",
          "The student is incorrect because some multiples of 10 end in 5",
          "The student is partly correct because only 30 and 40 are multiples of 10",
          "The student is incorrect because ending in 0 means the number is odd",
        ],
        helper: "Use the pattern and the place-value effect of adding 10.",
      },
      {
        prompt: "Which rule best explains 12, 24, 36, 48, 60?",
        answer: "Add 12 each time, so every term stays a multiple of 12",
        options: [
          "Add 12 each time, so every term stays a multiple of 12",
          "Add 10 each time, so every term stays even",
          "Multiply by 2 each time",
          "Add 6 each time, so every term is a multiple of 6 only",
        ],
        helper: "Choose the rule that explains both the step and the pattern property.",
      },
      {
        prompt: "Ella says, 'All multiples of 6 are even.' Zane says, 'All multiples of 6 have a digit sum of 6.' Who is correct?",
        answer: "Only Ella is correct",
        options: [
          "Only Ella is correct",
          "Only Zane is correct",
          "Both are correct",
          "Neither is correct",
        ],
        helper: "Test which statement always works and which works only sometimes.",
      },
      {
        prompt: "Why do multiples of 10 always end in 0?",
        answer: "Because multiplying by 10 makes the ones digit 0 in whole numbers",
        options: [
          "Because multiplying by 10 makes the ones digit 0 in whole numbers",
          "Because every even number ends in 0",
          "Because 10 is an odd number",
          "Because multiples of 10 only use two digits",
        ],
        helper: "Connect the pattern to place value, not just memorising the rule.",
        visual: {
          type: "rule_box",
          title: "Multiples of 10",
          steps: ["Think about multiplying by 10.", "Notice what happens to the ones place."],
        },
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.visual,
    };
  }

  if (explicitMode === "pattern_apply_create") {
    const templates: Array<{
      prompt: string;
      answer: string;
      helper: string;
      placeholder?: string;
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "Type the next 3 numbers in this pattern: 14, 21, 28, __, __, __.",
        answer: "35, 42, 49",
        helper: "The pattern adds 7 each time because these are multiples of 7.",
        placeholder: "Type the next 3 numbers",
        visual: {
          type: "rule_box",
          title: "Create the Pattern",
          steps: ["Find the constant increase.", "Keep the rule going for 3 more terms."],
        },
      },
      {
        prompt: "Explain why multiples of 5 always end in 0 or 5.",
        answer: "Adding 5 each time makes the ones digit alternate between 0 and 5",
        helper: "A strong answer explains what keeps happening to the ones digit.",
        placeholder: "Type your explanation",
      },
      {
        prompt: "Write a multiples pattern of 8 using the first 4 terms.",
        answer: "8, 16, 24, 32",
        helper: "List 4 numbers that increase by 8 each time.",
        placeholder: "Type 4 terms",
        visual: {
          type: "rule_box",
          title: "Build a Pattern",
          steps: ["Start with 8 or another multiple of 8.", "Keep adding 8 each time."],
        },
      },
      {
        prompt: "Type the rule for this pattern: 30, 40, 50, 60.",
        answer: "Add 10 each time",
        helper: "Describe the repeated change clearly.",
        placeholder: "Type the rule",
      },
      {
        prompt: "Explain why 18, 36, 54, and 72 all belong in the same pattern.",
        answer: "They are all multiples of 18 and increase by 18 each time",
        helper: "A strong answer names both the rule and the shared multiple pattern.",
        placeholder: "Type your explanation",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: chosen.helper,
      placeholder: chosen.placeholder ?? "Type the answer",
      visual: chosen.visual,
    };
  }

  if (explicitMode === "spot_pattern_reasoning") {
    const multipleChoiceTemplates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      helper: string;
    }> = [
      {
        prompt: "Which number does not belong: 18, 24, 30, 35, 42?",
        answer: "35, because the others are all multiples of 6",
        options: [
          "35, because the others are all multiples of 6",
          "24, because it is the only even number",
          "30, because it is the only multiple of 5",
          "42, because it is the largest number",
        ],
        helper: "Check which numbers share the same divisibility rule.",
      },
      {
        prompt: "Which number does not belong: 45, 60, 75, 83, 90?",
        answer: "83, because the others are divisible by both 3 and 5",
        options: [
          "83, because the others are divisible by both 3 and 5",
          "60, because it is the only even number",
          "75, because it is the only odd multiple of 5",
          "90, because it has the most factors",
        ],
        helper: "Look for a rule that works for four numbers, not just one feature.",
      },
      {
        prompt: "What rule is being used in 24, 36, 48, 60, 72?",
        answer: "Add 12 each time, so every term stays a multiple of 12",
        options: [
          "Add 12 each time, so every term stays a multiple of 12",
          "Add 10 each time, so every term stays even",
          "Multiply by 2 each time",
          "Add 6 each time, so every term is a multiple of 6 only",
        ],
        helper: "Check the difference between each pair of numbers.",
      },
      {
        prompt: "What rule best describes 135, 150, 165, 180, 195?",
        answer: "Add 15 each time, so every term is divisible by both 3 and 5",
        options: [
          "Add 15 each time, so every term is divisible by both 3 and 5",
          "Add 10 each time, so every term ends in 0",
          "Multiply by 3 each time",
          "Add 5 each time, so every term is odd",
        ],
        helper: "Test both the step size and the divisibility pattern.",
      },
      {
        prompt: "Which statement is true?",
        answer: "All multiples of 4 are even",
        options: [
          "All multiples of 4 are even",
          "All multiples of 6 are odd",
          "A number divisible by 5 must also be divisible by 10",
          "Every even number is a multiple of 4",
        ],
        helper: "Use a rule that always works, not one that works only sometimes.",
      },
      {
        prompt: "A student says, 'If a number is divisible by both 3 and 4, it must be divisible by 12.' Which answer is best?",
        answer: "True, because 12 is made from 3 and 4 with no overlap in factors",
        options: [
          "True, because 12 is made from 3 and 4 with no overlap in factors",
          "False, because every multiple of 3 is odd",
          "False, because divisibility by 4 cancels divisibility by 3",
          "True, but only for numbers below 100",
        ],
        helper: "Think about what numbers divisible by both 3 and 4 must have in common.",
      },
      {
        prompt: "Which number could go in the blank: __, 48, 60, 72, 84?",
        answer: "36, because the pattern adds 12 each time",
        options: [
          "36, because the pattern adds 12 each time",
          "40, because it is close to 48",
          "42, because it is a multiple of 6",
          "24, because it is half of 48",
        ],
        helper: "Work backward using the same step size.",
      },
      {
        prompt: "Which missing number makes the pattern work: 84, 96, __, 120, 132?",
        answer: "108, because the pattern increases by 12 each time",
        options: [
          "108, because the pattern increases by 12 each time",
          "102, because it is between 96 and 120",
          "110, because it is close to 108",
          "112, because it is even",
        ],
        helper: "Find the constant increase first, then check the divisibility pattern.",
      },
      {
        prompt: "Which list shows only numbers divisible by 3?",
        answer: "96, 117, 138",
        options: [
          "96, 117, 138",
          "94, 117, 138",
          "96, 118, 138",
          "96, 117, 140",
        ],
        helper: "Check the divisibility test on every number in the group.",
      },
      {
        prompt: "Which group correctly sorts the numbers by the rule 'divisible by both 3 and 5'?",
        answer: "Divisible by both: 45, 90, 135 | Not both: 48, 75, 124",
        options: [
          "Divisible by both: 45, 90, 135 | Not both: 48, 75, 124",
          "Divisible by both: 45, 75, 124 | Not both: 48, 90, 135",
          "Divisible by both: 48, 90, 124 | Not both: 45, 75, 135",
          "Divisible by both: 45, 48, 75 | Not both: 90, 124, 135",
        ],
        helper: "A number must pass both divisibility tests to belong in the first group.",
      },
      {
        prompt: "Which explanation best fits 128, 136, 144, 152, 160?",
        answer: "Add 8 each time, so the numbers stay even and every second term is divisible by 16",
        options: [
          "Add 8 each time, so the numbers stay even and every second term is divisible by 16",
          "Add 6 each time, so the numbers stay multiples of 6",
          "Multiply by 2 each time",
          "Add 10 each time, so the numbers all end in 0",
        ],
        helper: "Use the actual step size, then describe the pattern it creates.",
      },
      {
        prompt: "Which number belongs with 54, 72, and 90 if the rule is 'divisible by 9'?",
        answer: "108, because 1 + 0 + 8 = 9",
        options: [
          "108, because 1 + 0 + 8 = 9",
          "104, because it is even",
          "111, because all repeated digits are divisible by 9",
          "120, because it ends in 0",
        ],
        helper: "Use the divisibility test that matches the group rule.",
      },
    ];

    const typedTemplates: Array<{
      prompt: string;
      answer: string;
      helper: string;
      placeholder?: string;
    }> = [
      {
        prompt: "Type the missing number in the pattern 36, 48, __, 72, 84.",
        answer: "60",
        helper: "The numbers increase by 12 each time.",
        placeholder: "Type the missing number",
      },
      {
        prompt: "Type one number greater than 100 that is divisible by both 3 and 5.",
        answer: "120",
        helper: "A number divisible by both 3 and 5 must be a multiple of 15.",
        placeholder: "Type a number",
      },
      {
        prompt: "Type the next number in this pattern: 125, 140, 155, 170, __.",
        answer: "185",
        helper: "The pattern increases by 15 each time.",
        placeholder: "Type the next number",
      },
    ];

    if (asMultipleChoice) {
      const chosen =
        multipleChoiceTemplates[randInt(0, multipleChoiceTemplates.length - 1)] ?? multipleChoiceTemplates[0]!;
      return {
        kind: "multiple_choice",
        prompt: chosen.prompt,
        options: shuffle(chosen.options),
        answer: chosen.answer,
        helper: chosen.helper,
      };
    }

    const chosen = typedTemplates[randInt(0, typedTemplates.length - 1)] ?? typedTemplates[0]!;
    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: chosen.helper,
      placeholder: chosen.placeholder ?? "Type the answer",
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

  if (explicitMode === "multiplication_quick_estimate") {
    const variants = [
      { a: 48, b: 21 },
      { a: 63, b: 47 },
      { a: 72, b: 39 },
      { a: 84, b: 26 },
      { a: 57, b: 32 },
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
    const roundedA = Math.round(picked.a / 10) * 10;
    const roundedB = Math.round(picked.b / 10) * 10;
    const estimate = roundedA * roundedB;
    const options = uniqueStringOptions(String(estimate), [
      String(Math.max(100, estimate - 200)),
      String(estimate + 200),
      String(Math.max(100, estimate - 400)),
    ]);
    return {
      kind: "multiple_choice",
      prompt: `Which is the best estimate for ${picked.a} × ${picked.b}?`,
      options: shuffle(options),
      answer: String(estimate),
      helper: `Round ${picked.a} to ${roundedA} and ${picked.b} to ${roundedB}, then multiply.`,
    };
  }

  if (explicitMode === "multiplication_reasoning_check") {
    const variants = [
      {
        a: 48,
        b: 21,
        shown: 808,
        answer: "No, it is too small",
        helper: "48 × 21 is about 50 × 20 = 1,000, so 808 is too small.",
      },
      {
        a: 63,
        b: 47,
        shown: 2961,
        answer: "Yes, it is close to the estimate",
        helper: "63 × 47 is about 60 × 50 = 3,000, so 2,961 is reasonable.",
      },
      {
        a: 57,
        b: 32,
        shown: 3824,
        answer: "No, it is too large",
        helper: "57 × 32 is about 60 × 30 = 1,800, so 3,824 is too large.",
      },
      {
        a: 84,
        b: 26,
        shown: 2184,
        answer: "Yes, it is close to the estimate",
        helper: "84 × 26 is about 80 × 30 = 2,400, so 2,184 still makes sense.",
      },
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
    return {
      kind: "multiple_choice",
      prompt: `${picked.a} × ${picked.b} = ${formatMathNumber(picked.shown)}. Does this answer make sense?`,
      options: shuffle([
        "Yes, it is close to the estimate",
        "No, it is too small",
        "No, it is too large",
        "Yes, because multiplication answers can be any size",
      ]),
      answer: picked.answer,
      helper: picked.helper,
    };
  }

  if (explicitMode === "multiplication_1digit_fast") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      helper: string;
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "What is 300 × 4?",
        answer: "1,200",
        options: ["120", "1,200", "12,000", "700"],
        helper: "Use 3 × 4 = 12, then scale by 100.",
      },
      {
        prompt: "What is 60 × 7?",
        answer: "420",
        options: ["42", "420", "4,200", "360"],
        helper: "Use 6 × 7 = 42, then scale by 10.",
      },
      {
        prompt: "What is 5 × 400?",
        answer: "2,000",
        options: ["200", "2,000", "20,000", "450"],
        helper: "Think of 5 groups of 4 hundreds.",
      },
      {
        prompt: "What is 8 × 90?",
        answer: "720",
        options: ["72", "720", "7,200", "810"],
        helper: "Use 8 × 9 = 72, then scale by 10.",
      },
      {
        prompt: "What is 700 × 3?",
        answer: "2,100",
        options: ["210", "2,100", "21,000", "1,000"],
        helper: "Use 7 × 3 = 21, then scale by 100.",
      },
      {
        prompt: "Which answer matches 40 × 6?",
        answer: "240",
        options: ["24", "240", "2,400", "460"],
        helper: "Use 4 × 6 = 24, then scale by 10.",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.visual,
    };
  }

  if (explicitMode === "multiplication_1digit_reasoning") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      helper: string;
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "324 × 3. Noah says: 300 × 3 = 900 and 24 × 3 = 72, so the total is 972. Mia says: 324 × 3 = 972. Who used a helpful strategy?",
        answer: "Both are correct, but Noah shows a helpful strategy",
        options: [
          "Both are correct, but Noah shows a helpful strategy",
          "Only Noah is correct",
          "Only Mia is correct",
          "Neither is correct",
        ],
        helper: "A correct answer can still be stronger when it explains the place value thinking.",
      },
      {
        prompt: "40 × 6 = 240. A student says, 'I did 4 × 6 = 24 and added a zero.' Why does this work?",
        answer: "Because 40 is 4 tens, so the answer is 24 tens",
        options: [
          "Because 40 is 4 tens, so the answer is 24 tens",
          "Because multiplication always means adding a zero",
          "Because 6 changes into 60 during multiplication",
          "Because 24 is the same as 240",
        ],
        helper: "The zero comes from place value, not from a trick.",
        visual: {
          type: "rule_box",
          title: "Scaling by 10",
          steps: ["Work out the basic fact first.", "Then decide how many tens or hundreds are in the answer."],
        },
      },
      {
        prompt: "Which method is most efficient for 600 × 8?",
        answer: "Use 6 × 8 = 48, then make it 48 hundreds",
        options: [
          "Use 6 × 8 = 48, then make it 48 hundreds",
          "Add 600 eight times with no shortcut",
          "Use 60 × 8 and ignore the zero",
          "Multiply 8 by 0 first and stop there",
        ],
        helper: "Choose the method that uses a known fact and place value.",
      },
      {
        prompt: "A student says 506 × 3 = 1,518 because 500 × 3 = 1,500, 0 × 3 = 0, and 6 × 3 = 18. Is this correct?",
        answer: "Yes, because each place-value part was multiplied correctly",
        options: [
          "Yes, because each place-value part was multiplied correctly",
          "No, because the 0 should become 30",
          "No, because 500 × 3 is 150",
          "No, because 6 × 3 should be added before 500 × 3",
        ],
        helper: "Check each partitioned part, then combine them.",
      },
      {
        prompt: "Why does 5 × 400 = 2,000?",
        answer: "Because 400 is 4 hundreds, and 5 × 4 hundreds is 20 hundreds",
        options: [
          "Because 400 is 4 hundreds, and 5 × 4 hundreds is 20 hundreds",
          "Because 5 × 4 = 20, then a zero is added at random",
          "Because 400 becomes 40 during multiplication",
          "Because all answers with 400 end in 2,000",
        ],
        helper: "Explain the hundreds, not just the digits.",
        visual: {
          type: "rule_box",
          title: "Place Value Strategy",
          steps: ["Name the place value first.", "Multiply the basic fact, then rename the units."],
        },
      },
      {
        prompt: "Which mistake shows a place value misunderstanding?",
        answer: "300 × 4 = 120",
        options: ["300 × 4 = 120", "30 × 4 = 120", "3 × 4 = 12", "600 × 2 = 1,200"],
        helper: "A correct basic fact can still be scaled wrongly.",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.visual,
    };
  }

  if (explicitMode === "multiplication_1digit_apply") {
    const variants = [
      [243, 4],
      [506, 3],
      [1204, 2],
      [324, 3],
      [708, 4],
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
    const answer = picked[0] * picked[1];
    return {
      kind: "typed_response",
      prompt: `Work out ${formatMathNumber(picked[0])} × ${formatMathNumber(picked[1])}.`,
      answer: formatMathNumber(answer),
      helper: "Use partitioning or a written method, but keep each digit in the correct place value column.",
      placeholder: "Type the answer",
      writtenMethod: buildWrittenMethodLayout("Short Multiplication", "×", picked[0], picked[1], answer),
      visual: {
        type: "column_multiplication",
        topValue: picked[0],
        bottomValue: picked[1],
        showWorkedExample: true,
      },
    };
  }

  if (explicitMode === "multiplication_efficient_fast") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      helper: string;
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "Which strategy makes 25 × 16 quickest to work out?",
        answer: "Multiply by 4, then by 4 again",
        options: [
          "Multiply by 4, then by 4 again",
          "Add 25 sixteen times",
          "Round 25 to 20 and stop there",
          "Split 16 into 10 and ignore the 6",
        ],
        helper: "25 works well with friendly factors because 16 = 4 × 4.",
        visual: {
          type: "rule_box",
          title: "Friendly Factor",
          steps: ["Notice a helpful number such as 25.", "Rewrite the other factor in an easier way."],
        },
      },
      {
        prompt: "What is the most efficient first step for 40 × 18?",
        answer: "Work out 4 × 18, then make the answer 10 times larger",
        options: [
          "Work out 4 × 18, then make the answer 10 times larger",
          "Add 40 eighteen times",
          "Turn 18 into 1.8",
          "Ignore the zero in 40 and keep the same answer",
        ],
        helper: "Use the known fact and then scale because 40 is 4 tens.",
      },
      {
        prompt: "Which shortcut helps with 19 × 5?",
        answer: "Find 20 × 5, then subtract 5",
        options: [
          "Find 20 × 5, then subtract 5",
          "Find 10 × 5, then stop",
          "Double 19 and ignore the 5",
          "Add a zero to 19",
        ],
        helper: "19 is close to 20, so compensation is efficient.",
      },
      {
        prompt: "Why is 32 × 25 a good friendly-number question?",
        answer: "Because 25 × 4 = 100, so 32 can be split into groups of 4",
        options: [
          "Because 25 × 4 = 100, so 32 can be split into groups of 4",
          "Because all answers with 25 end in 25",
          "Because 32 should always be rounded to 30",
          "Because 25 and 32 are both even",
        ],
        helper: "Friendly factors can turn the multiplication into hundreds.",
        visual: {
          type: "rule_box",
          title: "Efficient Thinking",
          steps: ["Look for a number like 25 or 50.", "Ask if the other factor can be regrouped."],
        },
      },
      {
        prompt: "Which expression is the best rewrite of 48 × 25?",
        answer: "12 × 100",
        options: ["12 × 100", "48 × 20", "50 × 25", "24 × 25"],
        helper: "Regroup 48 as 12 × 4, then use 4 × 25 = 100.",
      },
      {
        prompt: "What is the fastest way to think about 205 × 3?",
        answer: "200 × 3 and 5 × 3, then combine",
        options: [
          "200 × 3 and 5 × 3, then combine",
          "Change 205 into 25",
          "Multiply 205 by 30 instead",
          "Add 200 and 3",
        ],
        helper: "Partitioning helps when one factor has simple place-value parts.",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.visual,
    };
  }

  if (explicitMode === "multiplication_efficient_reasoning") {
    const templates: Array<{
      prompt: string;
      answer: string;
      options: string[];
      helper: string;
      visual?: {
        type: "rule_box";
        title: string;
        steps: string[];
        decisionLabel?: string;
      };
    }> = [
      {
        prompt: "Which method is most efficient for 48 × 25?",
        answer: "Use a friendly factor strategy because 4 × 25 = 100",
        options: [
          "Use a friendly factor strategy because 4 × 25 = 100",
          "Use repeated addition because 25 is large",
          "Draw an area model every time because it is the only correct method",
          "Round 48 to 50 and keep that answer",
        ],
        helper: "Efficiency means choosing a correct method that reduces the work.",
      },
      {
        prompt: "A student uses the standard algorithm for 20 × 34. Was that efficient?",
        answer: "No, using 2 × 34 and then scaling by 10 is more efficient",
        options: [
          "No, using 2 × 34 and then scaling by 10 is more efficient",
          "Yes, the standard algorithm is always the most efficient",
          "No, because 20 × 34 should be solved by subtraction",
          "Yes, because multiplying by 20 is the same as multiplying by 2",
        ],
        helper: "A formal method can be correct without being the quickest choice.",
        visual: {
          type: "rule_box",
          title: "Choose the Method",
          steps: ["Look for tens, hundreds, or friendly factors first.", "Only use a longer method when it adds value."],
        },
      },
      {
        prompt: "Why is 25 × 16 easier than it looks?",
        answer: "Because 16 can be seen as 4 × 4, and 25 × 4 = 100",
        options: [
          "Because 16 can be seen as 4 × 4, and 25 × 4 = 100",
          "Because 25 can be rounded to 30 with no change",
          "Because any number multiplied by 25 ends in 00",
          "Because 16 should be changed to 10 first",
        ],
        helper: "Friendly factors can turn a tricky fact into a simple chain of facts.",
      },
      {
        prompt: "Noah says 48 × 26 is best solved with a written method. Mia says partitioning into 48 × 20 and 48 × 6 is more efficient. Who is correct?",
        answer: "Both can work, but Mia's partitioning is more efficient to explain the calculation",
        options: [
          "Both can work, but Mia's partitioning is more efficient to explain the calculation",
          "Only Noah is correct because written methods are always best",
          "Only Mia is correct because written methods are never allowed",
          "Neither is correct because 48 × 26 cannot be partitioned",
        ],
        helper: "At this level, students should compare valid methods and choose the more efficient one.",
      },
      {
        prompt: "A student says 32 × 25 = 32 × 20 + 32 × 5. Is that correct?",
        answer: "Yes, because 25 can be partitioned into 20 and 5",
        options: [
          "Yes, because 25 can be partitioned into 20 and 5",
          "No, because only one factor can be split",
          "No, because 20 and 5 should be multiplied together first",
          "Yes, but only if 32 is changed to 30",
        ],
        helper: "Partitioning keeps the total the same when the place values are handled correctly.",
      },
      {
        prompt: "Which mistake shows a strategy misunderstanding?",
        answer: "Thinking 23 × 40 should be treated the same as 23 × 4",
        options: [
          "Thinking 23 × 40 should be treated the same as 23 × 4",
          "Using partitioning for 205 × 3",
          "Using compensation for 19 × 5",
          "Checking 123 × 4 with estimation",
        ],
        helper: "The tens in 40 change the size of the product.",
      },
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.visual,
    };
  }

  if (explicitMode === "multiplication_efficient_apply") {
    const variants = [
      [123, 4],
      [48, 26],
      [205, 3],
      [64, 15],
      [32, 25],
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
    const answer = picked[0] * picked[1];
    return {
      kind: "typed_response",
      prompt: `Work out ${formatMathNumber(picked[0])} × ${formatMathNumber(picked[1])}. Choose an efficient strategy and solve accurately.`,
      answer: formatMathNumber(answer),
      helper: "Use a written method, partitioning, or a friendly-number strategy. Check that your answer is reasonable.",
      placeholder: "Type the answer",
      writtenMethod: buildWrittenMethodLayout("Multiplication", "×", picked[0], picked[1], answer),
      visual: {
        type: "column_multiplication",
        topValue: picked[0],
        bottomValue: picked[1],
        showWorkedExample: true,
      },
    };
  }

  if (explicitMode === "multiplication_strategy_apply") {
    const variants = [
      [45, 65],
      [48, 26],
      [32, 25],
      [34, 18],
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
    const answer = picked[0] * picked[1];
    return {
      kind: "typed_response",
      prompt: `${formatMathNumber(picked[0])} × ${formatMathNumber(picked[1])}`,
      answer: formatMathNumber(answer),
      helper: "Choose one method, complete the working, and check that all parts lead to the same final answer.",
      placeholder: "Type the answer",
      visual: {
        type: "multiplication_strategy",
        topValue: picked[0],
        bottomValue: picked[1],
        showWorkedExample: true,
      },
    };
  }

  if (explicitMode === "multiplication_estimate_apply") {
    const variants = [
      [63, 47],
      [48, 26],
      [72, 34],
      [54, 38],
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0];
    const answer = picked[0] * picked[1];
    return {
      kind: "typed_response",
      prompt: `${formatMathNumber(picked[0])} × ${formatMathNumber(picked[1])}`,
      answer: formatMathNumber(answer),
      helper: "Estimate first by rounding to the nearest 10, then solve and explain why your answer is reasonable.",
      placeholder: "Type the answer",
      visual: {
        type: "multiplication_estimate_strategy",
        topValue: picked[0],
        bottomValue: picked[1],
        showWorkedExample: true,
      },
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

  if (explicitMode === "division_remainders_fast") {
    const templates = [
      {
        prompt: "Find the correct answer: 47 ÷ 5 = ?",
        answer: "9 r2",
        options: ["9 r2", "8 r7", "10 r-3", "9 r5"],
      },
      {
        prompt: "Find the correct answer: 68 ÷ 6 = ?",
        answer: "11 r2",
        options: ["11 r2", "10 r8", "12 r-4", "11 r6"],
      },
      {
        prompt: "Find the correct answer: 94 ÷ 8 = ?",
        answer: "11 r6",
        options: ["11 r6", "12 r2", "10 r14", "11 r8"],
      },
      {
        prompt: "Find the correct answer: 125 ÷ 9 = ?",
        answer: "13 r8",
        options: ["13 r8", "14 r1", "12 r17", "13 r9"],
      },
      {
        prompt: "Find the correct answer: 143 ÷ 7 = ?",
        answer: "20 r3",
        options: ["20 r3", "21 r4", "19 r10", "20 r7"],
      },
      {
        prompt: "Find the correct answer: 176 ÷ 8 = ?",
        answer: "22",
        options: ["22", "21 r8", "23 r-8", "22 r8"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "The remainder must be 0 or greater, and it must always be less than the divisor.",
    };
  }

  if (explicitMode === "division_build_groups") {
    const variants = [
      { dividend: 68, divisor: 8 },
      { dividend: 47, divisor: 5 },
      { dividend: 94, divisor: 8 },
      { dividend: 125, divisor: 9 },
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0]!;
    const multiples: number[] = [];
    let current = picked.divisor;
    while (current <= picked.dividend) {
      multiples.push(current);
      current += picked.divisor;
    }
    const largest = multiples[multiples.length - 1] ?? 0;
    return {
      kind: "typed_response",
      prompt: `Build groups of ${picked.divisor} to solve ${picked.dividend} ÷ ${picked.divisor}. What is left after making equal groups?`,
      answer: String(picked.dividend - largest),
      helper: "Reveal the multiples until the next group would be too large, then work out what is left.",
      placeholder: "Type what is left",
      visual: {
        type: "division_build_groups",
        dividend: picked.dividend,
        divisor: picked.divisor,
        multiples,
        remainder: picked.dividend - largest,
      },
    };
  }

  if (explicitMode === "division_remainders_reasoning") {
    const templates = [
      {
        prompt: "47 ÷ 5 = 9 r3. Is this correct?",
        answer: "No, because 5 × 9 + 3 = 48",
        options: [
          "Yes, because 5 × 9 + 3 = 47",
          "No, because 5 × 9 + 3 = 48",
          "No, because the remainder is too large",
          "Yes, because 9 remainder 3 always works for dividing by 5",
        ],
      },
      {
        prompt: "68 ÷ 6 = 11 r2. Is this correct?",
        answer: "Yes, because 6 × 11 + 2 = 68",
        options: [
          "Yes, because 6 × 11 + 2 = 68",
          "No, because 6 × 11 + 2 = 66",
          "No, because the remainder is too large",
          "Yes, because all division answers need a remainder",
        ],
      },
      {
        prompt: "94 ÷ 8 = 11 r8. Is this correct?",
        answer: "No, because the remainder is too large",
        options: [
          "Yes, because 8 × 11 + 8 = 96",
          "No, because 8 × 11 + 8 = 94",
          "No, because the remainder is too large",
          "Yes, because 11 is the correct quotient",
        ],
      },
      {
        prompt: "125 ÷ 9 = 13 r8. Is this correct?",
        answer: "Yes, because 9 × 13 + 8 = 125",
        options: [
          "Yes, because 9 × 13 + 8 = 125",
          "No, because 9 × 13 + 8 = 126",
          "No, because the remainder is too large",
          "Yes, because 13 is close to 12",
        ],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Check by multiplying the divisor and quotient, then add the remainder.",
    };
  }

  if (explicitMode === "division_remainders_apply") {
    const variants = [
      { dividend: 68, divisor: 6, quotient: 11, remainder: 2, answer: "11 r2" },
      { dividend: 94, divisor: 8, quotient: 11, remainder: 6, answer: "11 r6" },
      { dividend: 125, divisor: 9, quotient: 13, remainder: 8, answer: "13 r8" },
      { dividend: 143, divisor: 7, quotient: 20, remainder: 3, answer: "20 r3" },
      { dividend: 176, divisor: 8, quotient: 22, remainder: 0, answer: "22" },
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0]!;
    return {
      kind: "typed_response",
      prompt: `Solve ${picked.dividend} ÷ ${picked.divisor}. Then check using ${picked.divisor} × quotient + remainder.`,
      answer: picked.answer,
      helper: "Your remainder must be less than the divisor. Check by multiplying back and adding the remainder.",
      placeholder: "Type the quotient and remainder",
      visual: {
        type: "division_remainder_check",
        dividend: picked.dividend,
        divisor: picked.divisor,
        quotient: picked.quotient,
        remainder: picked.remainder,
      },
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

  if (explicitMode === "interpreting_remainders_fast") {
    const templates = [
      {
        prompt: "26 ÷ 4 = 6 r2. What does this mean?",
        answer: "6 groups, 2 left over",
        options: ["6 groups, 2 left over", "7 groups", "6 groups exactly", "2 groups left over"],
      },
      {
        prompt: "32 ÷ 5 = 6 r2. What does this mean?",
        answer: "6 groups, 2 left over",
        options: ["6 groups, 2 left over", "5 groups, 6 left over", "7 groups exactly", "2 groups of 6"],
      },
      {
        prompt: "41 ÷ 6 = 6 r5. What does this mean?",
        answer: "6 groups, 5 left over",
        options: ["6 groups, 5 left over", "7 groups", "6 groups exactly", "5 groups, 6 left over"],
      },
      {
        prompt: "68 ÷ 6 = 11 r2. What does this mean?",
        answer: "11 groups, 2 left over",
        options: ["11 groups, 2 left over", "12 groups", "11 groups exactly", "2 groups of 11"],
      },
      {
        prompt: "91 ÷ 4 = 22 r3. What does this mean?",
        answer: "22 groups, 3 left over",
        options: ["22 groups, 3 left over", "23 groups", "22 groups exactly", "3 groups of 22"],
      },
      {
        prompt: "125 ÷ 8 = 15 r5. What does this mean?",
        answer: "15 groups, 5 left over",
        options: ["15 groups, 5 left over", "16 groups", "15 groups exactly", "5 groups of 15"],
      },
      {
        prompt: "72 ÷ 9 = 8. What does this mean?",
        answer: "8 groups exactly",
        options: ["8 groups exactly", "8 groups, 1 left over", "9 groups", "7 groups, 9 left over"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "The quotient tells how many full groups there are. The remainder tells what is left over.",
    };
  }

  if (explicitMode === "interpreting_remainders_reasoning") {
    const standardTemplates = [
      {
        prompt: "How many buses are needed for 26 students if each bus holds 4?",
        answer: "7 buses",
        options: ["6 buses", "6 r2 buses", "7 buses", "5 buses"],
      },
      {
        prompt: "How many bags are filled and how many apples are left over when 26 apples are packed into bags of 4?",
        answer: "6 bags, 2 left over",
        options: ["6 bags", "7 bags", "6 bags, 2 left over", "Ignore the 2 left over"],
      },
      {
        prompt: "26 lollies are shared equally between 4 children. How many does each child get?",
        answer: "6 each",
        options: ["6 each", "6 r2 each", "7 each", "6 each and 2 left in the answer"],
      },
      {
        prompt: "How many teams are needed if 34 players are put into teams of 5?",
        answer: "7 teams",
        options: ["6 teams", "6 r4 teams", "7 teams", "5 teams"],
      },
      {
        prompt: "How many boxes are filled and how many cupcakes are left over when 34 cupcakes are packed into boxes of 5?",
        answer: "6 boxes, 4 left over",
        options: ["6 boxes", "7 boxes", "6 boxes, 4 left over", "Ignore the 4 left over"],
      },
      {
        prompt: "How many rows are needed for 47 students if each row seats 6?",
        answer: "8 rows",
        options: ["7 rows", "7 r5 rows", "8 rows", "6 rows"],
      },
      {
        prompt: "How many crates are filled and how many oranges are left over when 68 oranges are packed into crates of 6?",
        answer: "11 crates, 2 left over",
        options: ["11 crates", "12 crates", "11 crates, 2 left over", "Ignore the 2 left over"],
      },
      {
        prompt: "91 stickers are shared equally between 4 children. How many stickers does each child get?",
        answer: "22 each",
        options: ["22 each", "22 r3 each", "23 each", "21 each"],
      },
      {
        prompt: "How many teams are needed if 125 players are put into teams of 8?",
        answer: "16 teams",
        options: ["15 teams", "15 r5 teams", "16 teams", "14 teams"],
      },
      {
        prompt: "How many boxes are needed for 72 books if each box holds 9 books?",
        answer: "8 boxes",
        options: ["8 boxes", "7 boxes", "8 boxes, 0 left over", "9 boxes"],
      },
    ] as const;
    const practicalTemplates = [
      {
        prompt: "34 players are put into teams of 5. What is the most practical solution for a real game?",
        answer: "6 teams and 4 players sit out and rotate",
        options: [
          "6 teams and 4 players sit out and rotate",
          "7 full teams",
          "6 teams only",
          "5 teams",
        ],
      },
      {
        prompt: "47 students are seated in rows of 6. What is the most practical seating plan?",
        answer: "7 full rows and 5 students in a shorter row",
        options: [
          "7 full rows and 5 students in a shorter row",
          "8 full rows",
          "7 rows only",
          "6 rows",
        ],
      },
      {
        prompt: "125 players are organised into teams of 8. What is the most practical solution for a real game day?",
        answer: "15 teams and 5 players rotate in",
        options: [
          "15 teams and 5 players rotate in",
          "16 full teams",
          "15 teams only",
          "14 teams",
        ],
      },
    ] as const;
    const multiSelectTemplates = [
      {
        prompt: "34 lollies are shared between 5 children. Which answers could make sense?",
        instruction: "Select all that apply.",
        options: [
          "6 each with 4 left over",
          "7 each (if 1 more lolly is added)",
          "5 each",
          "10 each",
        ],
        correctAnswers: [
          "6 each with 4 left over",
          "7 each (if 1 more lolly is added)",
        ],
        selectionFeedback: {
          "6 each with 4 left over": "This is the exact mathematical answer from 34 ÷ 5.",
          "7 each (if 1 more lolly is added)": "This would work if there were 35 lollies instead of 34.",
        },
        allCorrectFeedback:
          "Great thinking. One answer is mathematically exact, and the other would work if 1 more lolly was added.",
        partialFeedback: "Partly right. There is one more answer that could also make sense.",
        incorrectFeedback: "That selection does not fit 34 shared between 5 children.",
        visual: { type: "array" as const, rows: 5, columns: 6 },
      },
      {
        prompt: "47 stickers are shared between 6 children. Which answers could make sense?",
        instruction: "Select all that apply.",
        options: [
          "7 each with 5 left over",
          "8 each (if 1 more sticker is added)",
          "6 each",
          "10 each",
        ],
        correctAnswers: [
          "7 each with 5 left over",
          "8 each (if 1 more sticker is added)",
        ],
        selectionFeedback: {
          "7 each with 5 left over": "This is the exact mathematical answer from 47 ÷ 6.",
          "8 each (if 1 more sticker is added)": "This would work if there were 48 stickers instead of 47.",
        },
        allCorrectFeedback:
          "Great thinking. One answer is mathematically exact, and the other would work if 1 more sticker was added.",
        partialFeedback: "Partly right. There is one more answer that could also make sense.",
        incorrectFeedback: "That selection does not fit 47 shared between 6 children.",
      },
      {
        prompt: "83 pencils are packed into boxes of 7. Which answers could make sense?",
        instruction: "Select all that apply.",
        options: [
          "11 boxes, 6 left over",
          "12 full boxes (if 1 more pencil is added)",
          "10 boxes",
          "7 boxes, 11 left over",
        ],
        correctAnswers: [
          "11 boxes, 6 left over",
          "12 full boxes (if 1 more pencil is added)",
        ],
        selectionFeedback: {
          "11 boxes, 6 left over": "This is the exact mathematical answer from 83 ÷ 7.",
          "12 full boxes (if 1 more pencil is added)": "This would work if there were 84 pencils instead of 83.",
        },
        allCorrectFeedback:
          "Great thinking. One answer is mathematically exact, and the other would work if 1 more pencil was added.",
        partialFeedback: "Partly right. There is one more answer that could also make sense.",
        incorrectFeedback: "That selection does not fit 83 packed into boxes of 7.",
      },
    ] as const;
    const roll = randInt(0, 6);
    const chosen =
      roll === 0
        ? (multiSelectTemplates[randInt(0, multiSelectTemplates.length - 1)] ?? multiSelectTemplates[0]!)
        : roll === 1
      ? (practicalTemplates[randInt(0, practicalTemplates.length - 1)] ?? practicalTemplates[0]!)
      : (standardTemplates[randInt(0, standardTemplates.length - 1)] ?? standardTemplates[0]!);
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: "answer" in chosen ? chosen.answer : (chosen.correctAnswers?.[0] ?? ""),
      helper: "correctAnswers" in chosen
        ? "Select all the answers that could make sense."
        : roll === 1
        ? "Read the wording carefully. A practical solution can be different from the strict maths answer."
        : "Use the question wording to decide the correct mathematical answer.",
      instruction: "instruction" in chosen ? chosen.instruction : undefined,
      correctAnswers: "correctAnswers" in chosen ? [...chosen.correctAnswers] : undefined,
      selectionFeedback:
        "selectionFeedback" in chosen ? { ...chosen.selectionFeedback } : undefined,
      allCorrectFeedback: "allCorrectFeedback" in chosen ? chosen.allCorrectFeedback : undefined,
      partialFeedback: "partialFeedback" in chosen ? chosen.partialFeedback : undefined,
      incorrectFeedback: "incorrectFeedback" in chosen ? chosen.incorrectFeedback : undefined,
      visual: "visual" in chosen ? chosen.visual : undefined,
    };
  }

  if (explicitMode === "interpreting_remainders_apply") {
    const standardTemplates = [
      {
        prompt: "How many groups are needed if 34 people are put into groups of 5?",
        answer: "7 groups",
        options: [
          "6 groups, 4 left over",
          "7 groups",
          "Ignore the remainder and keep 6 groups",
          "6 groups",
        ],
        visual: { type: "array" as const, rows: 6, columns: 5 },
      },
      {
        prompt: "How many bags are filled and how many apples are left over when 34 apples are packed into bags of 5?",
        answer: "6 bags, 4 left over",
        options: [
          "6 bags",
          "7 bags",
          "6 bags, 4 left over",
          "Ignore the 4 left over",
        ],
        visual: { type: "array" as const, rows: 6, columns: 5 },
      },
      {
        prompt: "How many lollies does each child get when 34 lollies are shared equally between 5 children?",
        answer: "6 each",
        options: [
          "6 each",
          "6 each, 4 left over",
          "7 each",
          "Round up to 7 each",
        ],
        visual: { type: "array" as const, rows: 5, columns: 6 },
      },
      {
        prompt: "How many rows are needed if 47 students are seated in rows of 6?",
        answer: "8 rows",
        options: [
          "7 rows",
          "8 rows",
          "7 rows, 5 left over",
          "Ignore the remainder and keep 7 rows",
        ],
        visual: { type: "array" as const, rows: 7, columns: 6 },
      },
      {
        prompt: "How many crates are filled and how many oranges are left over when 68 oranges are packed into crates of 6?",
        answer: "11 crates, 2 left over",
        options: [
          "11 crates",
          "12 crates",
          "11 crates, 2 left over",
          "Ignore the 2 left over",
        ],
      },
      {
        prompt: "How many stickers does each child get when 91 stickers are shared equally between 4 children?",
        answer: "22 each",
        options: [
          "22 each",
          "22 each, 3 left over",
          "23 each",
          "Round up to 23 each",
        ],
      },
      {
        prompt: "How many teams are needed if 125 players are put into teams of 8?",
        answer: "16 teams",
        options: [
          "15 teams",
          "15 teams, 5 left over",
          "16 teams",
          "Ignore the remainder and keep 15 teams",
        ],
      },
      {
        prompt: "How many boxes are needed for 72 books if each box holds 9 books?",
        answer: "8 boxes",
        options: [
          "8 boxes",
          "7 boxes",
          "8 boxes, 0 left over",
          "9 boxes",
        ],
      },
    ] as const;
    const practicalTemplates = [
      {
        prompt: "34 players are put into teams of 5. What is the most practical solution for a real game?",
        answer: "6 teams and 4 players sit out and rotate",
        options: [
          "6 teams and 4 players sit out and rotate",
          "7 full teams",
          "6 teams only",
          "5 teams",
        ],
        visual: { type: "array" as const, rows: 6, columns: 5 },
      },
      {
        prompt: "47 students are seated in rows of 6. What is the most practical seating plan?",
        answer: "7 full rows and 5 students in a shorter row",
        options: [
          "7 full rows and 5 students in a shorter row",
          "8 full rows",
          "7 rows only",
          "6 rows",
        ],
        visual: { type: "array" as const, rows: 7, columns: 6 },
      },
      {
        prompt: "125 players are organised into teams of 8. What is the most practical solution for a real game day?",
        answer: "15 teams and 5 players rotate in",
        options: [
          "15 teams and 5 players rotate in",
          "16 full teams",
          "15 teams only",
          "14 teams",
        ],
      },
    ] as const;
    const usePractical = randInt(0, 4) === 0;
    const chosen = usePractical
      ? (practicalTemplates[randInt(0, practicalTemplates.length - 1)] ?? practicalTemplates[0]!)
      : (standardTemplates[randInt(0, standardTemplates.length - 1)] ?? standardTemplates[0]!);
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: usePractical
        ? "This asks for the most practical real-world solution, not the strict maths interpretation."
        : "Choose the answer that matches the mathematical interpretation of the situation.",
      visual: "visual" in chosen ? chosen.visual : undefined,
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

  if (explicitMode === "estimate_division") {
    const templates = [
      {
        prompt: "About how much is 68 ÷ 6?",
        answer: "about 12",
        options: ["about 8", "about 10", "about 12", "about 20"],
      },
      {
        prompt: "Which is the best estimate for 91 ÷ 4?",
        answer: "about 23",
        options: ["about 12", "about 20", "about 23", "about 40"],
      },
      {
        prompt: "125 ÷ 8 is about...",
        answer: "about 16",
        options: ["about 8", "about 12", "about 16", "about 24"],
      },
      {
        prompt: "About how much is 143 ÷ 7?",
        answer: "about 20",
        options: ["about 14", "about 18", "about 20", "about 28"],
      },
      {
        prompt: "Which is the best estimate for 176 ÷ 8?",
        answer: "about 22",
        options: ["about 16", "about 20", "about 22", "about 30"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Use nearby facts or compatible numbers to estimate quickly.",
    };
  }

  if (explicitMode === "division_reasonableness") {
    const templates = [
      {
        prompt: "A student says 68 ÷ 6 = 15 r2. Does this make sense?",
        answer: "No, because 6 × 15 + 2 = 92",
        options: [
          "Yes, because 15 is close to 12",
          "No, because 6 × 15 + 2 = 92",
          "No, because the remainder should be 6",
          "Yes, because 15 r2 is bigger than 10",
        ],
      },
      {
        prompt: "Is 84 ÷ 7 = 10 r14 reasonable?",
        answer: "No, because the remainder is too large",
        options: [
          "Yes, because 10 × 7 = 70",
          "No, because the remainder is too large",
          "Yes, because 14 is the leftover",
          "No, because 84 cannot be divided by 7",
        ],
      },
      {
        prompt: "Which answer is most reasonable for 91 ÷ 4?",
        answer: "22 r3",
        options: ["18 r1", "22 r3", "25 r4", "30 r1"],
      },
      {
        prompt: "A student says 125 ÷ 8 = 15 r5. Does this make sense?",
        answer: "Yes, because 8 × 15 + 5 = 125",
        options: [
          "Yes, because 8 × 15 + 5 = 125",
          "No, because 8 × 15 + 5 = 120",
          "No, because the remainder is too large",
          "Yes, because 15 is an even number",
        ],
      },
      {
        prompt: "Which answer is closest to what you would expect for 143 ÷ 7?",
        answer: "20 r3",
        options: ["14 r3", "20 r3", "24 r3", "30 r3"],
      },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle([...chosen.options]),
      answer: chosen.answer,
      helper: "Check with multiplication and make sure the remainder is less than the divisor.",
    };
  }

  if (explicitMode === "solve_and_check_division") {
    const variants = [
      { dividend: 68, divisor: 6, quotient: 11, remainder: 2, answer: "11 r2" },
      { dividend: 91, divisor: 4, quotient: 22, remainder: 3, answer: "22 r3" },
      { dividend: 125, divisor: 8, quotient: 15, remainder: 5, answer: "15 r5" },
      { dividend: 143, divisor: 7, quotient: 20, remainder: 3, answer: "20 r3" },
      { dividend: 176, divisor: 8, quotient: 22, remainder: 0, answer: "22" },
    ] as const;
    const picked = variants[randInt(0, variants.length - 1)] ?? variants[0]!;
    return {
      kind: "typed_response",
      prompt: `Solve ${picked.dividend} ÷ ${picked.divisor}. Then check using ${picked.divisor} × quotient + remainder.`,
      answer: picked.answer,
      helper: "Enter the quotient and remainder, then complete the multiplication check.",
      placeholder: "Type the quotient and remainder",
      visual: {
        type: "division_remainder_check",
        dividend: picked.dividend,
        divisor: picked.divisor,
        quotient: picked.quotient,
        remainder: picked.remainder,
      },
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

  if (
    explicitMode === "real_world_fraction_context" ||
    explicitMode === "real_world_fraction_structured_apply" ||
    explicitMode === "real_world_fraction_decision"
  ) {
    const realWorldTemplates = year5RealWorldFractionTemplates();
    const oneChangeTemplates = realWorldTemplates.filter((template) => {
      const result = relatedDenominatorResult(template);
      const changes =
        (template.denominatorA === result.denominator ? 0 : 1) +
        (template.denominatorB === result.denominator ? 0 : 1);
      return changes === 1;
    });
    const templates =
      explicitMode === "real_world_fraction_structured_apply" ? oneChangeTemplates : realWorldTemplates;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    const result = relatedDenominatorResult(chosen);
    const simplifiedAnswer = simplifyFractionString(result.resultNumerator, result.denominator);

    if (explicitMode === "real_world_fraction_context") {
      return {
        kind: "multiple_choice",
        prompt: chosen.context,
        options: fractionOperationDecisionOptions(chosen),
        answer: simplifiedAnswer,
        helper: "Choose the operation, match denominators, then solve.",
      };
    }

    if (explicitMode === "real_world_fraction_decision") {
      return {
        kind: "multiple_choice",
        prompt: `${relatedDenominatorExpression(chosen)} = ?`,
        options: fractionOperationDecisionOptions(chosen),
        answer: simplifiedAnswer,
        helper: "Watch for denominator and numerator mistakes.",
      };
    }

    return {
      kind: "typed_response",
      prompt: "Complete the working",
      answer: relatedDenominatorAnswer(chosen),
      helper: "Match the denominators, rewrite, then solve.",
      placeholder: "Type numerator",
      fixedDenominator: result.denominator,
      visual: relatedDenominatorVisual(chosen),
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

  if (explicitMode === "fdp_step_conversion") {
    const templates = year5FractionDecimalPercentSets("convert");
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    const { numerator, denominator } = parseFractionParts(chosen.fraction);

    return {
      kind: "typed_response",
      prompt: `Convert ${chosen.fraction}`,
      answer: `${chosen.decimal},${chosen.percent}`,
      helper: "Step 1: divide numerator by denominator. Step 2: multiply the decimal by 100.",
      placeholder: "Type the decimal and percent",
      visual: {
        type: "fraction_decimal_percent_conversion",
        fraction: chosen.fraction,
        numerator,
        denominator,
        decimalAnswer: chosen.decimal,
        percentAnswer: chosen.percent,
      },
    };
  }

  if (explicitMode === "fdp_which_correct") {
    const sets = year5FractionDecimalPercentSets("reasoning");
    const chosen = sets[randInt(0, sets.length - 1)] ?? sets[0]!;
    const targetKind = randInt(0, 2);
    const target =
      targetKind === 0 ? chosen.fraction : targetKind === 1 ? chosen.decimal : chosen.percent;
    const correctAnswers = [chosen.fraction, chosen.decimal, chosen.percent].filter(
      (value) => value !== target
    ).slice(0, 2);
    const distractors = shuffle(
      sets
        .filter((item) => item.id !== chosen.id)
        .flatMap((item) => [item.fraction, item.decimal, item.percent])
    ).slice(0, 2);

    return {
      kind: "multiple_choice",
      prompt: `Which are equal to ${target}?`,
      instruction: "Select all that apply.",
      options: shuffle([...correctAnswers, ...distractors]),
      answer: correctAnswers[0] ?? chosen.decimal,
      correctAnswers,
      helper: "Same value, different form.",
      allCorrectFeedback: "Correct — those representations show the same amount.",
      partialFeedback: "One is correct, but there is another matching form too.",
      incorrectFeedback: "Check the value, not just the digits.",
    };
  }

  if (
    explicitMode === "benchmark_fraction_percent" ||
    explicitMode === "benchmark_closest" ||
    explicitMode === "benchmark_compare_larger"
  ) {
    const templates =
      explicitMode === "benchmark_compare_larger"
        ? [
            { prompt: "Which is larger?", answer: "3/5", options: ["3/5", "1/2", "They are equal", "0"] },
            { prompt: "Which is larger?", answer: "1/2", options: ["0.45", "1/2", "They are equal", "0.4"] },
            { prompt: "Which is larger?", answer: "65%", options: ["65%", "3/5", "They are equal", "50%"] },
            { prompt: "Which is larger?", answer: "1/2", options: ["4/10", "1/2", "They are equal", "40%"] },
            { prompt: "Which is larger?", answer: "0.55", options: ["0.55", "1/2", "They are equal", "45%"] },
            { prompt: "Which is larger?", answer: "7/10", options: ["7/10", "60%", "They are equal", "1/2"] },
          ]
        : [
            { prompt: "Which benchmark is 7/10 closest to?", answer: "1", options: ["0", "1/2", "1", "It is equal to 1/2"] },
            { prompt: "Which benchmark is 0.48 closest to?", answer: "1/2", options: ["0", "1/2", "1", "It is equal to 1"] },
            { prompt: "Which benchmark is 0.2 closest to?", answer: "0", options: ["0", "1/2", "1", "It is equal to 1/2"] },
            { prompt: "Which benchmark is 80% closest to?", answer: "1", options: ["0", "1/2", "1", "It is equal to 1/2"] },
            { prompt: "Which benchmark is 3/8 closest to?", answer: "1/2", options: ["0", "1/2", "1", "It is equal to 1"] },
            { prompt: "Which benchmark is 12% closest to?", answer: "0", options: ["0", "1/2", "1", "It is equal to 1/2"] },
          ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper:
        explicitMode === "benchmark_compare_larger"
          ? "Think about whether each value is below, equal to, or above 1/2."
          : "Estimate the position. You do not need exact conversion.",
    };
  }

  if (
    explicitMode === "real_world_quick_apply" ||
    explicitMode === "real_world_structured_solve" ||
    explicitMode === "real_world_challenge"
  ) {
    if (explicitMode === "real_world_structured_solve") {
      const templates = year5RealWorldFdpStructuredTemplates();
      const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
      const result = relatedDenominatorResult(chosen);

      return {
        kind: "typed_response",
        prompt: chosen.context,
        answer: relatedDenominatorAnswer(chosen),
        helper: "Convert first, match denominators, then solve.",
        placeholder: "Type numerator",
        fixedDenominator: result.denominator,
        visual: relatedDenominatorVisual(chosen),
      };
    }

    const templates =
      explicitMode === "real_world_challenge"
        ? year5RealWorldFdpChallengeTemplates()
        : year5RealWorldFdpQuickApplyTemplates();
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;

    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
    };
  }

  if (
    explicitMode === "decimal_scale_multiply" ||
    explicitMode === "decimal_scale_divide" ||
    explicitMode === "decimal_scale_mixed"
  ) {
    const templateMap = {
      decimal_scale_multiply: [
        { prompt: "3.47 × 10 =", answer: "34.7", options: ["0.347", "3.47", "34.7", "347"] },
        { prompt: "0.608 × 100 =", answer: "60.8", options: ["6.08", "60.8", "608", "0.0608"] },
        { prompt: "4.205 × 1000 =", answer: "4205", options: ["420.5", "4205", "42.05", "4.205"] },
        { prompt: "0.93 × 100 =", answer: "93", options: ["9.3", "93", "930", "0.093"] },
        { prompt: "12.6 × 10 =", answer: "126", options: ["1.26", "12.6", "126", "1,260"] },
      ],
      decimal_scale_divide: [
        { prompt: "34.7 ÷ 10 =", answer: "3.47", options: ["0.347", "3.47", "34.7", "347"] },
        { prompt: "60.8 ÷ 100 =", answer: "0.608", options: ["6.08", "0.608", "0.0608", "608"] },
        { prompt: "4205 ÷ 1000 =", answer: "4.205", options: ["42.05", "4.205", "0.4205", "420.5"] },
        { prompt: "93 ÷ 100 =", answer: "0.93", options: ["0.093", "0.93", "9.3", "93"] },
        { prompt: "126 ÷ 10 =", answer: "12.6", options: ["1.26", "12.6", "126", "0.126"] },
      ],
      decimal_scale_mixed: [
        { prompt: "Which answer is correct for 0.84 × 100?", answer: "84", options: ["8.4", "84", "0.084", "840"] },
        { prompt: "Which answer is correct for 5.2 ÷ 100?", answer: "0.052", options: ["0.52", "0.052", "5.2", "52"] },
        { prompt: "2.305 × 10 =", answer: "23.05", options: ["2.305", "23.05", "230.5", "0.2305"] },
        { prompt: "480 ÷ 1000 =", answer: "0.48", options: ["4.8", "0.48", "48", "0.048"] },
        { prompt: "9.07 × 100 =", answer: "907", options: ["90.7", "907", "9.07", "0.907"] },
      ],
    } as const;
    const templates = templateMap[explicitMode];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "When multiplying or dividing by powers of 10, digits shift by place value.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Track how many places the digits move.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "square_numbers_patterns") {
    const templates = [
      { prompt: "Which number is a square number?", answer: "49", options: ["42", "45", "49", "54"] },
      { prompt: "Complete the pattern: 1, 4, 9, 16, __", answer: "25", options: ["20", "24", "25", "36"] },
      { prompt: "What is 12 squared?", answer: "144", options: ["24", "122", "144", "1,244"] },
      { prompt: "Which pair shows consecutive square numbers?", answer: "25 and 36", options: ["24 and 35", "25 and 36", "30 and 40", "36 and 49"] },
      { prompt: "Type the next square number after 64.", answer: "81" },
      { prompt: "Type the square root of 100.", answer: "10" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Square numbers are made by multiplying a number by itself.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Think about which whole number times itself gives the square.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "integer_number_line") {
    const templates = [
      { prompt: "Which integer is greatest?", answer: "-2", options: ["-9", "-5", "-2", "-11"] },
      { prompt: "Which integer is between -4 and 0?", answer: "-2", options: ["-6", "-5", "-2", "2"] },
      { prompt: "Order these from least to greatest: -3, 4, -1", answer: "-3, -1, 4", options: ["-3, -1, 4", "-1, -3, 4", "4, -1, -3", "-3, 4, -1"] },
      { prompt: "Type the integer that is 3 units to the right of -5.", answer: "-2" },
      { prompt: "Type the integer that is 4 units to the left of 2.", answer: "-2" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "On a number line, numbers further right are greater.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Count the moves on the number line carefully.",
          placeholder: "Type the integer",
        };
  }

  if (explicitMode === "integer_operations") {
    const templates = [
      { prompt: "-3 + 8 =", answer: "5", options: ["-11", "-5", "5", "11"] },
      { prompt: "6 - 9 =", answer: "-3", options: ["-3", "3", "-15", "15"] },
      { prompt: "-7 + 2 =", answer: "-5", options: ["5", "-5", "-9", "9"] },
      { prompt: "-4 - 3 =", answer: "-7", options: ["7", "-7", "-1", "1"] },
      { prompt: "Type the answer: -6 + 11", answer: "5" },
      { prompt: "Type the answer: 3 - 10", answer: "-7" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Use the sign and direction of each move.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Think about whether the result ends up above or below zero.",
          placeholder: "Type the integer",
        };
  }

  if (explicitMode === "integer_real_world") {
    const templates = [
      { prompt: "The temperature is -2°C and rises 5°C. What is the new temperature?", answer: "3", options: ["-7", "-3", "3", "7"] },
      { prompt: "A diver is at -12 m and rises 7 m. What is the new depth?", answer: "-5", options: ["5", "-5", "-19", "19"] },
      { prompt: "A business has a loss of $8, then gains $13. What is the result?", answer: "5", options: ["-21", "-5", "5", "21"] },
      { prompt: "Type the new elevation: -40 m then 18 m higher.", answer: "-22" },
      { prompt: "Type the final result: a loss of 15, then a gain of 9.", answer: "-6" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Negative values can represent below zero, below sea level, or a loss.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Use the context to decide whether the amount increases or decreases.",
          placeholder: "Type the answer",
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

  if (
    explicitMode === "percent_of_amount" ||
    explicitMode === "percent_quick_find" ||
    explicitMode === "percent_structured_method" ||
    explicitMode === "percent_decimal_method" ||
    explicitMode === "percent_real_world"
  ) {
    if (explicitMode === "percent_structured_method" || explicitMode === "percent_decimal_method") {
      const useDecimalMethod = explicitMode === "percent_decimal_method" || randInt(1, 10) <= 3;
      const templates = useDecimalMethod
        ? year5PercentDecimalMethodTemplates()
        : year5PercentStructuredTemplates();
      const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
      const finalStep = chosen.steps[chosen.steps.length - 1] ?? chosen.steps[0]!;

      return {
        kind: "typed_response",
        prompt: `Find ${chosen.percent}% of ${chosen.amount}`,
        answer: finalStep.answer,
        helper:
          chosen.method === "decimal"
            ? "Divide by 100 to make a decimal, then multiply by the amount."
            : "Break the percentage into easier benchmark parts.",
        placeholder: "Type the answer",
        visual: {
          type: "percent_structured_method",
          percent: chosen.percent,
          amount: chosen.amount,
          method: chosen.method ?? "strategy",
          steps: chosen.steps,
        },
      };
    }

    const templates =
      explicitMode === "percent_real_world"
        ? year5PercentRealWorldTemplates()
        : year5PercentQuickFindTemplates();
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;

    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
    };
  }

  if (
    explicitMode === "percentage_discount" ||
    explicitMode === "discount_quick_find" ||
    explicitMode === "discount_step_method" ||
    explicitMode === "discount_real_world"
  ) {
    if (explicitMode === "discount_step_method" || (!asMultipleChoice && explicitMode === "percentage_discount")) {
      const templates = year5DiscountStepTemplates();
      const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
      const visual = discountStepVisual(chosen);
      const finalStep = visual.steps[visual.steps.length - 1] ?? visual.steps[0]!;

      return {
        kind: "typed_response",
        prompt: `${chosen.item}: ${moneyAnswer(chosen.price)} with ${chosen.percent}% off`,
        answer: finalStep.answer,
        helper:
          chosen.method === "decimal"
            ? "Convert the percent to a decimal, multiply, then subtract."
            : "Find the discount first, then subtract from the original price.",
        placeholder: "Type the answer",
        visual,
      };
    }

    const templates =
      explicitMode === "discount_real_world"
        ? year5DiscountRealWorldTemplates()
        : year5DiscountQuickFindTemplates();
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    const answerValue =
      chosen.ask === "discount"
        ? discountAmount(chosen.price, chosen.percent)
        : discountFinalPrice(chosen.price, chosen.percent);

    return {
      kind: "multiple_choice",
      prompt:
        chosen.ask === "discount"
          ? `How much do you save on the ${chosen.item}?`
          : `What is the final price of the ${chosen.item}?`,
      options: shuffle(discountOptions(chosen)),
      answer: moneyAnswer(answerValue),
      helper:
        chosen.ask === "discount"
          ? "Find the percentage of the original price."
          : "Find the discount first, then subtract it from the price.",
      visual: discountVisual(
        chosen,
        explicitMode === "discount_real_world" ? "shop_item" : "price_tag"
      ),
    };
  }

  if (
    explicitMode === "percent_multistep" ||
    explicitMode === "percent_step_selection" ||
    explicitMode === "percent_multi_step_method" ||
    explicitMode === "percent_real_world_multi"
  ) {
    if (explicitMode === "percent_multi_step_method" || (!asMultipleChoice && explicitMode === "percent_multistep")) {
      const templates = year5PercentMultiStepTemplates();
      const visual = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
      const finalStep = visual.steps[visual.steps.length - 1] ?? visual.steps[0]!;

      return {
        kind: "typed_response",
        prompt: `${visual.item}: follow each percentage step`,
        answer: finalStep.answer,
        helper: "Complete each step in order. Do not skip ahead.",
        placeholder: "Type the answer",
        visual,
      };
    }

    if (explicitMode === "percent_step_selection") {
      const templates = year5PercentStepSelectionTemplates();
      const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
      return {
        kind: "multiple_choice",
        prompt: chosen.prompt,
        options: shuffle(chosen.options),
        answer: chosen.answer,
        helper: chosen.helper,
        visual: chosen.visual,
      };
    }

    const templates = year5PercentRealWorldMultiTemplates();
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    const extractedPrice = Number((chosen.prompt.match(/\$(\d+)/) ?? [])[1] ?? 100);
    const extractedPercent = Number((chosen.prompt.match(/(\d+)%/) ?? [])[1] ?? 20);

    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: discountVisual(
        { item: "multi-step deal", price: extractedPrice, percent: extractedPercent, ask: "discount" },
        "shop_item",
        true
      ),
    };
  }

  if (
    explicitMode === "multi_step_decide" ||
    explicitMode === "multi_step_build" ||
    explicitMode === "multi_step_solve"
  ) {
    if (explicitMode === "multi_step_build") {
      const templates = year5MultiStepBuildTemplates();
      const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
      const finalStep = chosen.steps[chosen.steps.length - 1] ?? chosen.steps[0]!;

      return {
        kind: "typed_response",
        prompt: chosen.prompt,
        answer: finalStep.answer,
        helper: "Complete each step in order. Do not skip ahead.",
        placeholder: "Type the answer",
        visual: {
          type: "multi_step_method",
          title: chosen.title,
          contextLabel: chosen.contextLabel,
          steps: chosen.steps,
          supportVisual: chosen.visual,
        },
      };
    }

    const templates =
      explicitMode === "multi_step_solve"
        ? year5MultiStepSolveTemplates()
        : year5MultiStepDecideTemplates();
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;

    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: shuffle(chosen.options),
      answer: chosen.answer,
      helper: chosen.helper,
      visual: chosen.visual,
    };
  }

  if (explicitMode === "best_buy_unit_rate") {
    const templates = [
      { prompt: "Which is the better buy: 6 pens for $12 or 10 pens for $18?", answer: "10 pens for $18", options: ["6 pens for $12", "10 pens for $18", "They cost the same", "Cannot tell"] },
      { prompt: "Which is the better buy: 8 yoghurts for $9.60 or 6 yoghurts for $7.80?", answer: "8 yoghurts for $9.60", options: ["8 yoghurts for $9.60", "6 yoghurts for $7.80", "They cost the same", "Cannot tell"] },
      { prompt: "Which is the cheaper price per item: 4 drinks for $10 or 6 drinks for $18?", answer: "4 drinks for $10", options: ["4 drinks for $10", "6 drinks for $18", "They cost the same", "Cannot tell"] },
      { prompt: "Type the unit price: 5 apples for $7.50.", answer: "1.50" },
      { prompt: "Type the cost per ticket: 8 tickets for $36.", answer: "4.50" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Compare the cost for one item or one unit.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Divide the total cost by the number of items.",
          placeholder: "Type the unit price",
        };
  }

  if (explicitMode === "function_machine_rules") {
    const templates = [
      { prompt: "A function machine adds 6. What is the output for 14?", answer: "20", options: ["8", "20", "24", "84"] },
      { prompt: "A rule doubles then adds 1. What is the output for 7?", answer: "15", options: ["8", "14", "15", "21"] },
      { prompt: "The rule is subtract 4. If the input is 19, what is the output?", answer: "15", options: ["15", "23", "76", "4"] },
      { prompt: "Type the missing output: input 9, rule ×3.", answer: "27" },
      { prompt: "Type the missing input if the rule is +5 and the output is 18.", answer: "13" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Follow the same rule from input to output.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Work forward or backward using the rule.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "build_explain_rules") {
    const templates = [
      { prompt: "What rule matches 4 → 13, 6 → 17, 9 → 23?", answer: "×2 + 5", options: ["×2 + 5", "+9", "×3 + 1", "×2 + 1"] },
      { prompt: "Which rule matches 5 → 16, 8 → 25, 10 → 31?", answer: "×3 + 1", options: ["×2 + 6", "×3 + 1", "×3 - 1", "+11"] },
      { prompt: "Type the output if the rule is ×2 + 3 and the input is 12.", answer: "27" },
      { prompt: "Type the missing input if the rule is ×4 and the output is 36.", answer: "9" },
      { prompt: "Which rule best fits 2 → 9, 3 → 12, 5 → 18?", answer: "×3 + 3", options: ["×3 + 3", "×2 + 5", "×4 + 1", "+7"] },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Look for the same relationship each time.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Use the same rule for every value.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "rules_tables_spreadsheets") {
    const templates = [
      { prompt: "Complete the table for rule ×3: 2 → 6, 4 → 12, 7 → __", answer: "21", options: ["18", "20", "21", "24"] },
      { prompt: "Rule: +8. Complete the table: 5 → 13, 9 → 17, 12 → __", answer: "20", options: ["18", "19", "20", "21"] },
      { prompt: "Rule: ×5 - 2. What is the output for 6?", answer: "28", options: ["26", "28", "30", "32"] },
      { prompt: "Type the missing output: rule ×4 + 1, input 8.", answer: "33" },
      { prompt: "Type the missing input: rule +12, output 35.", answer: "23" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Use the rule consistently down the table.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Treat each row like the same machine or spreadsheet formula.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "bidmas_evaluate") {
    const templates = [
      { prompt: "Evaluate 6 + 4 × 5", answer: "26", options: ["50", "46", "26", "34"] },
      { prompt: "Evaluate (18 - 6) ÷ 3", answer: "4", options: ["2", "4", "6", "12"] },
      { prompt: "Evaluate 7 + (3 × 8)", answer: "31", options: ["24", "31", "56", "80"] },
      { prompt: "Type the value of 20 - 3 × 4.", answer: "8" },
      { prompt: "Type the value of (5 + 7) × 2.", answer: "24" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Work through brackets first, then multiply or divide, then add or subtract.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Keep the operation order clear.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "simple_equations") {
    const templates = [
      { prompt: "Solve x + 8 = 23", answer: "15", options: ["11", "15", "31", "184"] },
      { prompt: "Solve 5x = 35", answer: "7", options: ["5", "6", "7", "8"] },
      { prompt: "Solve y - 12 = 9", answer: "21", options: ["3", "21", "-21", "108"] },
      { prompt: "Type the value of n if 4n = 28.", answer: "7" },
      { prompt: "Type the value of p if p + 19 = 54.", answer: "35" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Use the inverse operation to undo the equation.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Ask what operation reverses the one shown.",
          placeholder: "Type the answer",
        };
  }

  if (explicitMode === "equations_real_context") {
    const templates = [
      { prompt: "A concert ticket costs $12. Three friends spend $36 altogether. How many tickets did they buy each? Solve 12n = 36.", answer: "3", options: ["2", "3", "4", "12"] },
      { prompt: "A bus has some passengers. 18 get on and there are now 47. Solve p + 18 = 47.", answer: "29", options: ["18", "29", "47", "65"] },
      { prompt: "A container holds equal packs of 6 muffins. There are 42 muffins. Solve 6m = 42.", answer: "7", options: ["6", "7", "8", "42"] },
      { prompt: "Type the missing number: A game score was 15, then 9 points were added to make 24. s + 9 = 24.", answer: "15" },
      { prompt: "Type the missing number: 8 boxes hold 64 pencils. 8b = 64.", answer: "8" },
    ] as const;
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return asMultipleChoice && "options" in chosen
      ? {
          kind: "multiple_choice",
          prompt: chosen.prompt,
          options: shuffle([...chosen.options]),
          answer: chosen.answer,
          helper: "Translate the context into the equation, then solve it.",
        }
      : {
          kind: "typed_response",
          prompt: chosen.prompt,
          answer: chosen.answer,
          helper: "Use the equation to find the unknown amount.",
          placeholder: "Type the answer",
        };
  }

  if (
    explicitMode === "choose_strategy_quick" ||
    explicitMode === "choose_strategy_reflect" ||
    explicitMode === "choose_strategy_apply" ||
    explicitMode === "strategy_fluency_addition" ||
    explicitMode === "strategy_fluency_subtraction" ||
    explicitMode === "strategy_fluency_decimal_addition" ||
    explicitMode === "strategy_fluency_decimal_subtraction" ||
    explicitMode === "strategy_fluency_multiplication" ||
    explicitMode === "strategy_fluency_division"
  ) {
    const isFluencyMode = explicitMode.startsWith("strategy_fluency_");
    const templates = isFluencyMode
      ? year5StrategyFluencyTemplates(explicitMode)
      : year5ChooseYourStrategyTemplates(explicitMode);
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;

    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      helper: "Choose a strategy first. Then solve and reflect on how well it worked.",
      placeholder: "Type your answer",
      visual: {
        type: "strategy_ownership",
        missionTitle: isFluencyMode ? "Strategy Sprint" : "Choose Your Strategy",
        missionDescription: isFluencyMode
          ? "Pick a strategy, solve the problem, and notice whether your method was fast or clear."
          : "Pick a strategy that works for you, solve the problem, and reflect on your thinking.",
        supportText:
          "In maths, there is often more than one way to solve a problem. Good mathematicians choose a strategy that makes sense to them.",
        problemLabel: chosen.prompt,
        strategies: chosen.strategies,
        reflectionPrompt: chosen.reflectionPrompt,
        reflectionOptions: chosen.reflectionOptions,
      },
    };
  }

  if (
    explicitMode === "mixed_ops_addition" ||
    explicitMode === "mixed_ops_subtraction" ||
    explicitMode === "mixed_ops_multiplication" ||
    explicitMode === "mixed_ops_division"
  ) {
    const templates = year5MixedOperationsChallengeTemplates(explicitMode);
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;

    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      placeholder: "Enter your answer",
      visual: {
        type: "numeric_input_only",
      },
    };
  }

  if (
    explicitMode === "multi_step_calc_add_sub" ||
    explicitMode === "multi_step_calc_mult_div" ||
    explicitMode === "multi_step_calc_mixed"
  ) {
    const templates = year5MultiStepCalculationTemplates(explicitMode);
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;

    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      placeholder: "Enter your answer",
      visual: {
        type: "numeric_input_only",
      },
    };
  }

  if (explicitMode === "final_tuneup_fluency" || explicitMode === "final_tuneup_challenge") {
    const templates =
      explicitMode === "final_tuneup_challenge"
        ? year5FinalTuneUpChallengeTemplates()
        : year5FinalTuneUpFluencyTemplates();
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;

    return {
      kind: "typed_response",
      prompt: chosen.prompt,
      answer: chosen.answer,
      placeholder: "Enter your answer",
      visual: {
        type: "numeric_input_only",
      },
    };
  }

  if (explicitMode === "final_tuneup_reasoning") {
    const templates = [
      ...year5EstimateReasonablenessTemplates("reasonableness_yes_no"),
      ...year5EstimateReasonablenessTemplates("estimate_closer"),
      ...year5EstimateReasonablenessTemplates("quick_estimate"),
    ];
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: chosen.options,
      answer: chosen.answer,
      helper: chosen.helper,
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

  if (
    explicitMode === "reasonableness_yes_no" ||
    explicitMode === "estimate_closer" ||
    explicitMode === "quick_estimate"
  ) {
    const templates = year5EstimateReasonablenessTemplates(explicitMode);
    const chosen = templates[randInt(0, templates.length - 1)] ?? templates[0]!;
    return {
      kind: "multiple_choice",
      prompt: chosen.prompt,
      options: chosen.options,
      answer: chosen.answer,
      helper: chosen.helper,
    };
  }

  if (explicitMode === "compare_symbols") {
    const minValue = typeof config.min === "number" ? config.min : 1000;
    const maxValue = typeof config.max === "number" ? config.max : 999999;
    const left = randInt(minValue, maxValue);
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
      const values = new Set<number>(
        level >= 5
          ? buildDecimalReasoningSet(count)
          : Array.from({ length: count }, () => randomStepValue(0.1, 9.99, randInt(0, 1) === 0 ? 0.1 : 0.01))
      );
      while (values.size < count) {
        values.add(level >= 5 ? (buildDecimalReasoningSet(1)[0] ?? 0.555) : randomStepValue(0.1, 9.99, 0.01));
      }
      const decimals = [...values];
      const ordered = [...decimals].sort((a, b) => (ascending ? a - b : b - a));
      const displayValues = level >= 5 ? decimals.map(formatReasoningDecimal) : decimals.map(formatMathNumber);
      const prompt = ascending
        ? `Type the smallest decimal from this set: ${displayValues.join(", ")}.`
        : `Type the largest decimal from this set: ${displayValues.join(", ")}.`;
      const answer = level >= 5 ? formatReasoningDecimal(ordered[0] ?? 0) : formatMathNumber(ordered[0] ?? 0);
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: ascending
              ? `Which decimal is the smallest: ${displayValues.join(", ")}?`
              : `Which decimal is the largest: ${displayValues.join(", ")}?`,
            options: shuffle(displayValues),
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
  const violations: Year2PolicyViolation[] = validateLessonRotationStructure(lesson);
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
  const violations: Year2PolicyViolation[] = validateLessonRotationStructure(lesson);

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
    activity.activityType === "fraction_decimal_percent_match" ||
    activity.activityType === "benchmark_sort" ||
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
    const interactiveQuestion = generateInteractiveQuestion(level, activity.activityType, config, lesson);
    if (interactiveQuestion) {
      question = interactiveQuestion;
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
  }

  if (activity.activityType === "multiple_choice") {
    if (question.kind !== "multiple_choice") {
      const answer = question.kind === "typed_response" ? String(question.answer) : "Yes";
      console.warn("Invalid MC Question:", {
        reason: "kind_mismatch",
        activityType: activity.activityType,
        mode: typeof config.mode === "string" ? config.mode : undefined,
        question,
      });
      question = {
        kind: "multiple_choice",
        prompt: question.prompt,
        options: buildGenericMultipleChoiceOptions(answer),
        answer,
        helper: "Use the rule or pattern to choose the best answer.",
      };
    } else if (
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      question.options.some((option) => typeof option !== "string" || option.trim().length === 0) ||
      typeof question.answer !== "string" ||
      !question.options.includes(question.answer)
    ) {
      console.warn("Invalid MC Question:", {
        reason: "invalid_shape",
        activityType: activity.activityType,
        mode: typeof config.mode === "string" ? config.mode : undefined,
        question,
      });
      const answer = typeof question.answer === "string" && question.answer.trim().length > 0
        ? question.answer
        : "Yes";
      question = {
        ...question,
        prompt:
          typeof question.prompt === "string" && question.prompt.trim().length > 0
            ? question.prompt
            : "Choose the best answer.",
        answer,
        options: Array.isArray(question.options) &&
          question.options.every((option) => typeof option === "string" && option.trim().length > 0)
          ? Array.from(new Set([answer, ...question.options]))
          : buildGenericMultipleChoiceOptions(answer),
      };
    }
  }

  if (activity.activityType === "typed_response" && question.kind !== "typed_response") {
    question = {
      kind: "typed_response",
      prompt: question.prompt,
      answer: question.kind === "multiple_choice" ? String(question.answer) : "0",
      helper: "Work it out using the rule or pattern.",
      placeholder: "Type the answer",
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

export type LessonQuestionFingerprint = {
  fingerprint: string;
  templateFingerprint: string;
  numberSetFingerprint: string;
  mode: string;
  contextType: string;
  keyNumbers: string[];
};

function normalizeQuestionTemplatePrompt(prompt: string) {
  return prompt
    .toLowerCase()
    .replace(/-?\d[\d,]*(?:\.\d+)?/g, "#")
    .replace(/\s+/g, " ")
    .trim();
}

function extractQuestionFingerprintNumbers(question: Year2QuestionData) {
  const values = new Set<string>();
  const capture = (text?: string) => {
    if (!text) return;
    for (const match of text.match(/-?\d[\d,]*(?:\.\d+)?/g) ?? []) {
      values.add(match.replace(/,/g, ""));
    }
  };

  capture("prompt" in question ? question.prompt : "");
  if ("answer" in question && typeof question.answer === "string") capture(question.answer);
  if ("options" in question && Array.isArray(question.options)) {
    question.options.forEach((option) => capture(String(option)));
  }
  if ("correctAnswers" in question && Array.isArray(question.correctAnswers)) {
    question.correctAnswers.forEach((option) => capture(String(option)));
  }
  if (question.kind === "fraction_decimal_percent_match") {
    question.sets.forEach((set) => {
      capture(set.fraction);
      capture(set.decimal);
      capture(set.percent);
    });
  }
  if (question.kind === "benchmark_sort") {
    question.values.forEach((value) => capture(value.label));
  }

  const visual = "visual" in question ? question.visual : undefined;
  if (visual && typeof visual === "object") {
    Object.values(visual).forEach((value) => {
      if (typeof value === "number") values.add(String(value));
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "number") values.add(String(item));
        });
      }
    });
  }

  return Array.from(values).sort((left, right) => Number(left) - Number(right));
}

export function getLessonQuestionFingerprint(
  activity: LessonActivity,
  question: Year2QuestionData
): LessonQuestionFingerprint {
  const config = (activity.config ?? {}) as GenericConfig;
  const mode =
    typeof config.mode === "string"
      ? config.mode
      : typeof config.sourceActivityType === "string"
      ? config.sourceActivityType
      : activity.activityType;
  const contextType =
    "visual" in question && question.visual?.type ? String(question.visual.type) : "none";
  const templatePrompt = "prompt" in question ? normalizeQuestionTemplatePrompt(question.prompt) : activity.activityType;
  const templateFingerprint = [activity.activityType, mode, question.kind, contextType, templatePrompt].join("::");
  const keyNumbers = extractQuestionFingerprintNumbers(question);
  const numberSetFingerprint = keyNumbers.join(",");
  const fingerprint = [templateFingerprint, keyNumbers.join(",")].join("::");

  return {
    fingerprint,
    templateFingerprint,
    numberSetFingerprint,
    mode,
    contextType,
    keyNumbers,
  };
}

export const generateYear2QuestionFromActivity = generateQuestionForActivity;
