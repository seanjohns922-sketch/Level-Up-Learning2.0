import type { Lesson } from "@/data/programs/year1";
import type { ActivityType, LessonActivity } from "@/data/programs/types";

export type PlaceValueName = "hundreds" | "tens" | "ones";

export type PlaceValueBuilderQuestion = {
  kind: "place_value_builder";
  prompt: string;
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

export type AdditionStrategyQuestion = {
  kind: "addition_strategy";
  prompt: string;
  hint: string;
  a: number;
  b: number;
  answer: number;
  options: number[];
  mode: "jump" | "split" | "friendly_numbers";
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
  helper: string;
  mode: "choose_operation" | "two_step_add_sub" | "mult_div_problems";
  showStrategyClue?: boolean;
};

export type ReviewQuizInnerQuestion =
  | PlaceValueBuilderQuestion
  | NumberOrderQuestion
  | PartitionExpandQuestion
  | NumberLineQuestion
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
};

export type FactFamilyQuestion = {
  kind: "fact_family";
  prompt: string;
  family: [number, number, number];
  options: string[];
  answers: string[];
  mode: "recognise" | "write_sentences" | "word_problems";
};

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
};

export type MultipleChoiceQuestion = {
  kind: "multiple_choice";
  prompt: string;
  options: string[];
  answer: string;
  helper?: string;
};

export type TypedResponseQuestion = {
  kind: "typed_response";
  prompt: string;
  answer: string;
  helper?: string;
  placeholder?: string;
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

type Year2DifficultyContract = {
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
        Year2DifficultyContract,
        "weekMin" | "weekMax" | "skipCountExtraSteps"
      >
    >
  >;
  maxFactValue?: number;
  maxByWeek?: number;
  blockedFocusKeywords?: string[];
};

const YEAR2_DIFFICULTY_CONTRACTS: Year2DifficultyContract[] = [
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
    skipCountExtraSteps: [2, 5, 10],
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
    skipCountExtraSteps: [2, 3, 4, 5, 10],
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
    skipCountExtraSteps: [2, 3, 4, 5, 10],
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
    skipCountExtraSteps: [2, 3, 4, 5, 10],
    wordProblemMax: 140,
  },
];

const YEAR2_ACTIVITY_POLICY: Record<ActivityType, ActivityPolicy> = {
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
  odd_even_sort: {
    allowedModes: ["identify", "pattern", "odd_even_sums"],
    blockedFocusKeywords: ["addition", "subtraction", "division"],
  },
  addition_strategy: {
    allowedModes: ["jump", "split", "friendly_numbers"],
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

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
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
  if (place === "hundreds") return Math.floor(value / 100) % 10;
  if (place === "tens") return Math.floor(value / 10) % 10;
  return value % 10;
}

function placeLabel(place: PlaceValueName) {
  if (place === "hundreds") return "hundreds";
  if (place === "tens") return "tens";
  return "ones";
}

function partitionNumber(value: number) {
  return {
    hundreds: Math.floor(value / 100) * 100,
    tens: Math.floor((value % 100) / 10) * 10,
    ones: value % 10,
  };
}

function roundToNearest(value: number, unit: number) {
  return Math.round(value / unit) * unit;
}

function supportedPlaces(config: GenericConfig) {
  const candidates = config.placeValues?.filter(
    (value): value is PlaceValueName =>
      value === "hundreds" || value === "tens" || value === "ones"
  );
  return candidates && candidates.length > 0
    ? candidates
    : (["hundreds", "tens", "ones"] as PlaceValueName[]);
}

function getYear2DifficultyProfile(week: number) {
  const contract =
    YEAR2_DIFFICULTY_CONTRACTS.find(
      (candidate) => week >= candidate.weekMin && week <= candidate.weekMax
    ) ?? YEAR2_DIFFICULTY_CONTRACTS[YEAR2_DIFFICULTY_CONTRACTS.length - 1];

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

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeFocus(focus: string) {
  return focus.trim().toLowerCase();
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
  profile: ReturnType<typeof getYear2DifficultyProfile>,
  violations: Year2PolicyViolation[]
) {
  const config = (activity.config ?? {}) as GenericConfig;
  const mode = typeof config.mode === "string" ? config.mode : undefined;

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
  profile: ReturnType<typeof getYear2DifficultyProfile>,
  violations: Year2PolicyViolation[]
) {
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
}

export function validateLessonActivityIntent(
  lesson: Lesson,
  activity: LessonActivity,
  question?: Year2QuestionData
): Year2PolicyValidation {
  const profile = getYear2DifficultyProfile(lesson.week);
  const policy = YEAR2_ACTIVITY_POLICY[activity.activityType];
  const violations: Year2PolicyViolation[] = [];
  const focus = normalizeFocus(lesson.focus);

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

  if (question) {
    validateQuestionAgainstPolicy(lesson, activity, policy, question, profile, violations);
  }

  return {
    valid: violations.length === 0,
    violations,
  };
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
  activityType: ActivityType,
  config: GenericConfig,
  week: number
): Year2QuestionData | null {
  const profile = getYear2DifficultyProfile(week);

  if (activityType === "place_value_builder") {
    const min = typeof config.min === "number" ? config.min : 100;
    const max = typeof config.max === "number" ? config.max : 999;
    const target = randInt(min, max);
    const places = supportedPlaces(config);
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
        hundreds: place === "hundreds" ? null : hundreds,
        tens: place === "tens" ? null : tens,
        ones: place === "ones" ? null : ones,
        targetNumber: target,
        answer:
          place === "hundreds" ? hundreds * 100 : place === "tens" ? tens * 10 : ones,
        mode,
        place,
        visualMode: "mab",
        placeValues: places,
      };
    }

    return {
      kind: "place_value_builder",
      prompt: "What number is shown by the MAB blocks?",
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
    return {
      kind: "partition_expand",
      prompt:
        mode === "partition"
          ? `Partition ${target} into hundreds, tens, and ones.`
          : mode === "expand"
          ? `Write ${target} in expanded form.`
          : `Partition ${target} in a different valid way.`,
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
      return {
        kind: "number_line",
        prompt: `Round ${value} to the nearest ${targetUnit}.`,
        helper: `Use the number line markers to think about the nearest multiple of ${targetUnit}.`,
        expected: roundToNearest(value, targetUnit),
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

  if (activityType === "addition_strategy") {
    const min = typeof config.min === "number" ? config.min : 0;
    const max = typeof config.max === "number" ? config.max : profile.addSubMax;
    const mode =
      config.mode === "split" || config.mode === "friendly_numbers"
        ? config.mode
        : "jump";
    let a = randInt(min, Math.max(min, max - 10));
    let b = randInt(2, 18);

    if (mode === "split") {
      a = randInt(18, Math.max(30, Math.min(99, max)));
      b = randInt(12, Math.min(39, Math.max(12, profile.addSubMax / 3)));
    }

    if (mode === "friendly_numbers") {
      a = randInt(20, Math.max(29, Math.min(profile.addSubExtensionMax, 189)));
      const bridge = 10 - (a % 10 || 10);
      b = bridge + randInt(2, 12);
    }

    const answer = a + b;
    return {
      kind: "addition_strategy",
      prompt: `Solve ${a} + ${b}.`,
      hint:
        mode === "jump"
          ? `Start at ${a} and jump ${b} more.`
          : mode === "split"
          ? `Split ${b} into tens and ones.`
          : "Make a friendly ten first, then add the rest.",
      a,
      b,
      answer,
      options: uniqueNumberOptions(answer).map(Number),
      mode,
    };
  }

  if (activityType === "equal_groups") {
    const allowed = config.allowedGroupSizes;
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
    const allowed = config.allowedGroupSizes;
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
    const allowedSizes = config.allowedGroupSizes;
    const candidateGroupSizes = (allowedSizes && allowedSizes.length > 0
      ? allowedSizes
      : [2, 3, 4, 5, 6, 8, 10]
    ).filter((size) => size <= maxTotal);
    const groupSize =
      candidateGroupSizes[randInt(0, candidateGroupSizes.length - 1)] ?? 2;
    const minMultiplier = Math.max(2, Math.ceil(minTotal / groupSize));
    const maxMultiplier = Math.max(minMultiplier, Math.floor(maxTotal / groupSize));
    const groups = randInt(minMultiplier, maxMultiplier);
    const total = groupSize * groups;

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
    const min = typeof config.min === "number" ? config.min : 0;
    const max = typeof config.max === "number" ? config.max : profile.wordProblemMax;
    const mode =
      config.mode === "two_step_add_sub" || config.mode === "mult_div_problems"
        ? config.mode
        : "choose_operation";

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
      if (randInt(0, 1) === 0) {
        const groups = randInt(3, Math.min(8, profile.groupsMax));
        const perGroup = randInt(2, Math.min(10, profile.itemsMax));
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

      const groups = randInt(3, Math.min(8, profile.groupsMax));
      const perGroup = randInt(2, Math.min(10, profile.itemsMax));
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

    const operation = shuffle(["+", "-", "x", "/"])[0];
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
        helper: "Read the whole story first. Decide whether the amount is growing, shrinking, grouped, or shared.",
        mode,
        showStrategyClue: false,
      };
    }

    if (operation === "x") {
      const groups = randInt(3, Math.min(8, profile.groupsMax));
      const perGroup = randInt(2, Math.min(10, profile.itemsMax));
      const answer = groups * perGroup;
      return {
        kind: "mixed_word_problem",
        prompt: `There are ${groups} trays with ${perGroup} cupcakes on each tray. How many cupcakes are there?`,
        answer,
        options: uniqueNumberOptions(answer, 8).map(Number),
        operationLabel: "Multiplication",
        helper: "Read the whole story first. Decide whether the amount is growing, shrinking, grouped, or shared.",
        mode,
        showStrategyClue: false,
      };
    }

    const groupSize = randInt(2, Math.min(10, profile.itemsMax));
    const groups = randInt(3, Math.min(8, profile.groupsMax));
    const total = groupSize * groups;
    return {
      kind: "mixed_word_problem",
      prompt: `${total} toy cars are packed into boxes of ${groupSize}. How many boxes are needed?`,
      answer: groups,
      options: uniqueNumberOptions(groups, 4).map(Number),
      operationLabel: "Division",
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
    const configuredMin = typeof config.min === "number" ? Math.max(0, config.min) : 0;
    const configuredMax =
      typeof config.max === "number"
        ? Math.min(config.max, profile.factFamilyMax)
        : profile.factFamilyMax;
    const mode =
      config.mode === "write_sentences" || config.mode === "word_problems"
        ? config.mode
        : "recognise";
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
    const step =
      typeof config.step === "number"
        ? config.step
        : profile.skipCountExtraSteps[randInt(0, profile.skipCountExtraSteps.length - 1)] ?? 2;
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
    };
  }

  return null;
}

function randomReviewConfig(activityType: ActivityType): GenericConfig {
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
        mode: (["jump", "split", "friendly_numbers"] as const)[randInt(0, 2)],
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
  activityType: "multiple_choice" | "typed_response",
  sourceActivityType: ActivityType,
  config: GenericConfig,
  lesson: Lesson
): MultipleChoiceQuestion | TypedResponseQuestion {
  const profile = getYear2DifficultyProfile(lesson.week);
  const min = typeof config.min === "number" ? config.min : 0;
  const max = typeof config.max === "number" ? config.max : profile.addSubMax;
  const step = typeof config.step === "number" ? config.step : 10;

  const asMultipleChoice = activityType === "multiple_choice";

  if (sourceActivityType === "place_value_builder") {
    const target = randInt(Math.max(100, min || 100), Math.max(200, max || 999));
    const place = (["hundreds", "tens", "ones"] as PlaceValueName[])[randInt(0, 2)];
    const partition = partitionNumber(target);
    const mode =
      config.mode === "identify_place" || config.mode === "missing_mab_part"
        ? config.mode
        : "identify_number";
    const mabSummary = `${partition.hundreds / 100} hundreds, ${partition.tens / 10} tens, ${partition.ones} ones`;

    if (mode === "missing_mab_part") {
      const hiddenValue =
        place === "hundreds" ? partition.hundreds : place === "tens" ? partition.tens : partition.ones;
      const visibleSummary = [
        place === "hundreds" ? "? hundreds" : `${partition.hundreds / 100} hundreds`,
        place === "tens" ? "? tens" : `${partition.tens / 10} tens`,
        place === "ones" ? "? ones" : `${partition.ones} ones`,
      ].join(", ");
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: `The number is ${target}. The MAB shows ${visibleSummary}. What is the missing value?`,
            options: uniqueNumberOptions(hiddenValue, Math.max(4, hiddenValue || 4)),
            answer: String(hiddenValue),
          }
        : {
            kind: "typed_response",
            prompt: `The number is ${target}. The MAB shows ${visibleSummary}. What is the missing value?`,
            answer: String(hiddenValue),
            placeholder: "Type the missing value",
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
          }
        : {
            kind: "typed_response",
            prompt: `The MAB shows ${mabSummary}. How many ${placeLabel(place).toLowerCase()} are shown?`,
            answer,
            placeholder: "Type the count",
          };
    }

    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `The MAB shows ${mabSummary}. What number is shown?`,
          options: uniqueNumberOptions(target, 80),
          answer: String(target),
        }
      : {
          kind: "typed_response",
          prompt: `The MAB shows ${mabSummary}. What number is shown?`,
          answer: String(target),
          placeholder: "Type the number",
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
      const answer = String(roundToNearest(value, targetUnit));
      return asMultipleChoice
        ? {
            kind: "multiple_choice",
            prompt: `Round ${value} to the nearest ${targetUnit}.`,
            options: uniqueNumberOptions(Number(answer), targetUnit),
            answer,
          }
        : {
            kind: "typed_response",
            prompt: `Round ${value} to the nearest ${targetUnit}.`,
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
    const a = randInt(Math.max(0, min), Math.max(min + 20, max - 10));
    const b = randInt(4, Math.min(28, Math.max(8, profile.addSubMax / 4)));
    const answer = String(a + b);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `What is ${a} + ${b}?`,
          options: uniqueNumberOptions(Number(answer), 8),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: `Solve ${a} + ${b}.`,
          answer,
          placeholder: "Type the sum",
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
    const total = randInt(20, Math.max(40, max));
    const remove = randInt(3, Math.min(28, total - 1));
    const answer = String(total - remove);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `What is ${total} - ${remove}?`,
          options: uniqueNumberOptions(Number(answer), 8),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: `Solve ${total} - ${remove}.`,
          answer,
          placeholder: "Type the answer",
        };
  }

  if (sourceActivityType === "fact_family") {
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
    const groups = randInt(3, Math.min(8, profile.groupsMax));
    const perGroup = randInt(2, Math.min(10, profile.itemsMax));
    const answer = String(groups * perGroup);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `${groups} groups of ${perGroup} makes how many?`,
          options: uniqueNumberOptions(Number(answer), 6),
          answer,
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
    const sourceQuestion = generateInteractiveQuestion("mixed_word_problem", config, lesson.week);
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
      activityType,
      selectedType,
      randomReviewConfig(selectedType),
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
      const validation = validateLessonActivityIntent(lesson, activity);
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
        config: randomReviewConfig(type),
      } as LessonActivity);
    const validation = validateLessonActivityIntent(lesson, candidate);
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

export function generateYear2Question(
  lesson: Lesson,
  activity: LessonActivity
): Year2QuestionData {
  const config = (activity.config ?? {}) as GenericConfig;
  const preValidation = validateLessonActivityIntent(lesson, activity);
  assertPolicyValidation(preValidation, "pre_generate");

  let question: Year2QuestionData;
  if (
    activity.activityType === "place_value_builder" ||
    activity.activityType === "number_order" ||
    activity.activityType === "partition_expand" ||
    activity.activityType === "number_line" ||
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
    question = generateInteractiveQuestion(activity.activityType, config, lesson.week) as Year2QuestionData;
  } else if (
    activity.activityType === "multiple_choice" ||
    activity.activityType === "typed_response"
  ) {
    const sourceActivityType = config.sourceActivityType ?? "place_value_builder";
    question = generateGenericQuestion(
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
        config: randomReviewConfig(selectedType),
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

  const postValidation = validateLessonActivityIntent(lesson, activity, question);
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
  return generateYear2Question(lesson, activity);
}

export const generateYear2QuestionFromActivity = generateQuestionForActivity;
