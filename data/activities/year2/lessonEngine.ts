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

export type ArraysQuestion = {
  kind: "arrays";
  prompt: string;
  rows: number;
  columns: number;
  answer: number;
  options: number[];
  mode: "arrays" | "repeated_addition";
};

export type DivisionGroupsQuestion = {
  kind: "division_groups";
  prompt: string;
  total: number;
  groupSize: number;
  answer: number;
  options: number[];
  mode: "sharing" | "grouping" | "inverse_link";
};

export type MixedWordProblemQuestion = {
  kind: "mixed_word_problem";
  prompt: string;
  answer: number;
  options: number[];
  operationLabel: string;
  helper: string;
  mode: "choose_operation" | "two_step_add_sub" | "mult_div_problems";
};

export type ReviewQuizInnerQuestion =
  | PlaceValueBuilderQuestion
  | NumberOrderQuestion
  | PartitionExpandQuestion
  | NumberLineQuestion
  | AdditionStrategyQuestion
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
  answer: string;
  mode: "recognise" | "write_sentences" | "word_problems";
};

export type OddEvenSortQuestion = {
  kind: "odd_even_sort";
  prompt: string;
  numbers: number[];
  answer: {
    odd: number[];
    even: number[];
  };
  mode: "identify" | "pattern" | "odd_even_sums";
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

export type Year2QuestionData =
  | PlaceValueBuilderQuestion
  | NumberOrderQuestion
  | PartitionExpandQuestion
  | NumberLineQuestion
  | AdditionStrategyQuestion
  | ArraysQuestion
  | DivisionGroupsQuestion
  | MixedWordProblemQuestion
  | ReviewQuizQuestion
  | SubtractionStrategyQuestion
  | FactFamilyQuestion
  | OddEvenSortQuestion
  | SkipCountQuestion
  | MultipleChoiceQuestion
  | TypedResponseQuestion;

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
  minRows?: number;
  maxRows?: number;
  minColumns?: number;
  maxColumns?: number;
  minTotal?: number;
  maxTotal?: number;
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
  while (values.size < 4) {
    const offset = randInt(-spread, spread);
    values.add(Math.max(0, answer + offset));
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

function generateInteractiveQuestion(
  activityType: ActivityType,
  config: GenericConfig
): Year2QuestionData | null {
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
    const max = typeof config.max === "number" ? config.max : 100;
    const mode =
      config.mode === "split" || config.mode === "friendly_numbers"
        ? config.mode
        : "jump";
    let a = randInt(min, Math.max(min, max - 10));
    let b = randInt(2, 18);

    if (mode === "split") {
      a = randInt(10, 89);
      b = randInt(10, 19);
    }

    if (mode === "friendly_numbers") {
      a = randInt(20, 89);
      const bridge = 10 - (a % 10 || 10);
      b = bridge + randInt(1, 8);
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

  if (activityType === "arrays") {
    const minRows = typeof config.minRows === "number" ? config.minRows : 2;
    const maxRows = typeof config.maxRows === "number" ? config.maxRows : 5;
    const minColumns =
      typeof config.minColumns === "number" ? config.minColumns : 2;
    const maxColumns =
      typeof config.maxColumns === "number" ? config.maxColumns : 5;
    const rows = randInt(minRows, maxRows);
    const columns = randInt(minColumns, maxColumns);
    const answer = rows * columns;
    const mode = config.mode === "repeated_addition" ? "repeated_addition" : "arrays";

    return {
      kind: "arrays",
      prompt:
        mode === "repeated_addition"
          ? "How many dots are there in the array? Use repeated addition if it helps."
          : "How many dots are in the array?",
      rows,
      columns,
      answer,
      options: uniqueNumberOptions(answer, Math.max(rows, columns) * 2).map(Number),
      mode,
    };
  }

  if (activityType === "division_groups") {
    const minTotal = typeof config.minTotal === "number" ? config.minTotal : 6;
    const maxTotal = typeof config.maxTotal === "number" ? config.maxTotal : 24;
    const mode =
      config.mode === "grouping" || config.mode === "inverse_link"
        ? config.mode
        : "sharing";
    const candidateGroupSizes = [2, 3, 4, 5].filter((size) => size <= maxTotal);
    const groupSize =
      candidateGroupSizes[randInt(0, candidateGroupSizes.length - 1)] ?? 2;
    const minMultiplier = Math.max(2, Math.ceil(minTotal / groupSize));
    const maxMultiplier = Math.max(minMultiplier, Math.floor(maxTotal / groupSize));
    const answer = randInt(minMultiplier, maxMultiplier);
    const total = groupSize * answer;

    return {
      kind: "division_groups",
      prompt:
        mode === "grouping"
          ? `${total} objects are put into groups of ${groupSize}. How many groups are there?`
          : mode === "inverse_link"
          ? `${total} divided into groups of ${groupSize} gives how many groups?`
          : `${total} objects are shared equally into groups of ${groupSize}. How many groups are there?`,
      total,
      groupSize,
      answer,
      options: uniqueNumberOptions(answer, 4).map(Number),
      mode,
    };
  }

  if (activityType === "mixed_word_problem") {
    const min = typeof config.min === "number" ? config.min : 0;
    const max = typeof config.max === "number" ? config.max : 50;
    const mode =
      config.mode === "two_step_add_sub" || config.mode === "mult_div_problems"
        ? config.mode
        : "choose_operation";

    if (mode === "two_step_add_sub") {
      const start = randInt(Math.max(10, min), Math.max(20, max));
      const add = randInt(2, 10);
      const remove = randInt(1, 9);
      const answer = start + add - remove;
      return {
        kind: "mixed_word_problem",
        prompt: `Mia had ${start} stickers. She got ${add} more, then gave ${remove} away. How many stickers does she have now?`,
        answer,
        options: uniqueNumberOptions(answer, 8).map(Number),
        operationLabel: "Two-step add/subtract",
        helper: "Work through the story in order: add first, then subtract.",
        mode,
      };
    }

    if (mode === "mult_div_problems") {
      if (randInt(0, 1) === 0) {
        const groups = randInt(2, 5);
        const perGroup = randInt(2, 6);
        const answer = groups * perGroup;
        return {
          kind: "mixed_word_problem",
          prompt: `Tom has ${groups} bags with ${perGroup} apples in each bag. How many apples does he have altogether?`,
          answer,
          options: uniqueNumberOptions(answer, 8).map(Number),
          operationLabel: "Multiply",
          helper: "Think of equal groups or repeated addition.",
          mode,
        };
      }

      const groups = randInt(2, 5);
      const perGroup = randInt(2, 6);
      const total = groups * perGroup;
      return {
        kind: "mixed_word_problem",
        prompt: `${total} apples are packed into bags of ${perGroup}. How many bags are needed?`,
        answer: groups,
        options: uniqueNumberOptions(groups, 4).map(Number),
        operationLabel: "Divide",
        helper: "Ask how many equal groups fit into the total.",
        mode,
      };
    }

    const operation = shuffle(["+", "-", "x", "/"])[0];
    if (operation === "+") {
      const start = randInt(Math.max(5, min), Math.max(12, max - 10));
      const extra = randInt(2, 10);
      const answer = start + extra;
      return {
        kind: "mixed_word_problem",
        prompt: `A class had ${start} pencils and found ${extra} more. How many pencils are there now?`,
        answer,
        options: uniqueNumberOptions(answer, 8).map(Number),
        operationLabel: "Addition",
        helper: "Look for words like more or altogether.",
        mode,
      };
    }

    if (operation === "-") {
      const start = randInt(Math.max(12, min), Math.max(20, max));
      const used = randInt(2, Math.min(10, start - 1));
      const answer = start - used;
      return {
        kind: "mixed_word_problem",
        prompt: `A jar had ${start} marbles. ${used} were taken out. How many marbles are left?`,
        answer,
        options: uniqueNumberOptions(answer, 8).map(Number),
        operationLabel: "Subtraction",
        helper: "Look for words like left or taken away.",
        mode,
      };
    }

    if (operation === "x") {
      const groups = randInt(2, 5);
      const perGroup = randInt(2, 6);
      const answer = groups * perGroup;
      return {
        kind: "mixed_word_problem",
        prompt: `There are ${groups} trays with ${perGroup} cupcakes on each tray. How many cupcakes are there?`,
        answer,
        options: uniqueNumberOptions(answer, 8).map(Number),
        operationLabel: "Multiplication",
        helper: "Equal groups usually mean multiply.",
        mode,
      };
    }

    const groupSize = randInt(2, 5);
    const groups = randInt(2, 5);
    const total = groupSize * groups;
    return {
      kind: "mixed_word_problem",
      prompt: `${total} toy cars are packed into boxes of ${groupSize}. How many boxes are needed?`,
      answer: groups,
      options: uniqueNumberOptions(groups, 4).map(Number),
      operationLabel: "Division",
      helper: "If a total is split into equal groups, divide.",
      mode,
    };
  }

  if (activityType === "subtraction_strategy") {
    const min = typeof config.min === "number" ? config.min : 0;
    const max = typeof config.max === "number" ? config.max : 100;
    const mode =
      config.mode === "split" || config.mode === "fact_strategy"
        ? config.mode
        : "jump";
    let total = randInt(Math.max(12, min), Math.max(20, max));
    let remove = randInt(2, Math.min(18, total - 1));

    if (mode === "split") {
      total = randInt(30, Math.max(40, max));
      remove = randInt(11, Math.min(19, total - 1));
    }

    if (mode === "fact_strategy") {
      total = randInt(12, Math.max(20, max));
      remove = randInt(2, 9);
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
    const mode =
      config.mode === "write_sentences" || config.mode === "word_problems"
        ? config.mode
        : "recognise";
    const a = randInt(2, 9);
    const b = randInt(1, 9);
    const total = a + b;
    const family: [number, number, number] = [a, b, total];
    const correctSentence =
      mode === "write_sentences"
        ? `${total} - ${a} = ${b}`
        : mode === "word_problems"
        ? `${a} + ${b} = ${total}`
        : `${b} + ${a} = ${total}`;

    const distractors = shuffle([
      `${total} + ${a} = ${b}`,
      `${a} - ${b} = ${total}`,
      `${total} - ${b} = ${a + 1}`,
    ]);

    return {
      kind: "fact_family",
      prompt:
        mode === "write_sentences"
          ? "Choose a correct number sentence from this fact family."
          : mode === "word_problems"
          ? "Choose the number sentence that matches this fact family."
          : "Which sentence belongs to this fact family?",
      family,
      options: shuffle([correctSentence, ...distractors]).slice(0, 4),
      answer: correctSentence,
      mode,
    };
  }

  if (activityType === "odd_even_sort") {
    const min = typeof config.min === "number" ? config.min : 0;
    const max = typeof config.max === "number" ? config.max : 30;
    const count = typeof config.count === "number" ? config.count : 6;
    const mode =
      config.mode === "pattern" || config.mode === "odd_even_sums"
        ? config.mode
        : "identify";
    const values = new Set<number>();

    while (values.size < count) {
      values.add(randInt(min, max));
    }

    const numbers = shuffle(Array.from(values));
    return {
      kind: "odd_even_sort",
      prompt:
        mode === "pattern"
          ? "Sort the numbers into odd and even to spot the pattern."
          : mode === "odd_even_sums"
          ? "Sort the results into odd and even."
          : "Sort the numbers into odd and even.",
      numbers,
      answer: {
        odd: numbers.filter((value) => value % 2 !== 0),
        even: numbers.filter((value) => value % 2 === 0),
      },
      mode,
    };
  }

  if (activityType === "skip_count") {
    const step = typeof config.step === "number" ? config.step : 2;
    const start = randInt(0, 5) * step;
    const sequence = [start, start + step, start + step * 2, start + step * 3];
    const answer = start + step * 4;
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
        step: [2, 5, 10][randInt(0, 2)],
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
        max: 20,
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
  const min = typeof config.min === "number" ? config.min : 0;
  const max = typeof config.max === "number" ? config.max : 100;
  const step = typeof config.step === "number" ? config.step : 10;

  const asMultipleChoice = activityType === "multiple_choice";

  if (sourceActivityType === "place_value_builder") {
    const target = randInt(Math.max(100, min || 100), Math.max(200, max || 999));
    const place = (["hundreds", "tens", "ones"] as PlaceValueName[])[randInt(0, 2)];
    const answer = String(digitForPlace(target, place));
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: `What is the ${placeLabel(place)} digit in ${target}?`,
          options: uniqueNumberOptions(Number(answer), 4),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: `Type the ${placeLabel(place)} digit in ${target}.`,
          answer,
          placeholder: "Type a digit",
        };
  }

  if (sourceActivityType === "number_order") {
    const count = typeof config.count === "number" ? config.count : 4;
    const values = new Set<number>();
    while (values.size < count) {
      values.add(randInt(Math.max(10, min), Math.max(20, max)));
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
    const a = randInt(Math.max(0, min), Math.max(min + 10, max - 5));
    const b = randInt(2, 18);
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
    const total = randInt(20, Math.max(30, max));
    const remove = randInt(2, Math.min(18, total - 1));
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
    const a = randInt(2, 9);
    const b = randInt(1, a - 1);
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
    const groups = randInt(2, 5);
    const perGroup = randInt(2, 5);
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
    const by = typeof config.step === "number" ? config.step : 2;
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
    const perGroup = randInt(2, 5);
    const groups = randInt(2, 5);
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
    const a = randInt(10, 40);
    const b = randInt(2, 15);
    const isAdd = randInt(0, 1) === 0;
    const answer = String(isAdd ? a + b : a - b);
    return asMultipleChoice
      ? {
          kind: "multiple_choice",
          prompt: isAdd
            ? `A student had ${a} stickers and got ${b} more. How many now?`
            : `A student had ${a} stickers and used ${b}. How many left?`,
          options: uniqueNumberOptions(Number(answer), 8),
          answer,
        }
      : {
          kind: "typed_response",
          prompt: isAdd
            ? `A student had ${a} stickers and got ${b} more. How many now?`
            : `A student had ${a} stickers and used ${b}. How many left?`,
          answer,
          placeholder: "Type the answer",
        };
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

export function generateYear2Question(
  lesson: Lesson,
  activity: LessonActivity
): Year2QuestionData {
  const config = (activity.config ?? {}) as GenericConfig;

  if (
    activity.activityType === "place_value_builder" ||
    activity.activityType === "number_order" ||
    activity.activityType === "partition_expand" ||
    activity.activityType === "number_line" ||
    activity.activityType === "addition_strategy" ||
    activity.activityType === "arrays" ||
    activity.activityType === "division_groups" ||
    activity.activityType === "mixed_word_problem" ||
    activity.activityType === "subtraction_strategy" ||
    activity.activityType === "fact_family" ||
    activity.activityType === "odd_even_sort" ||
    activity.activityType === "skip_count"
  ) {
    return generateInteractiveQuestion(activity.activityType, config) as Year2QuestionData;
  }

  if (
    activity.activityType === "multiple_choice" ||
    activity.activityType === "typed_response"
  ) {
    const sourceActivityType = config.sourceActivityType ?? "place_value_builder";
    return generateGenericQuestion(
      activity.activityType,
      sourceActivityType,
      config,
      lesson
    );
  }

  if (activity.activityType === "review_quiz") {
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
    const question = generateQuestionForActivity(
      {
        activityType: selectedType,
        weight: 1,
        config: randomReviewConfig(selectedType),
      },
      lesson.title
    ) as ReviewQuizInnerQuestion;

    return {
      kind: "review_quiz",
      prompt: "Review challenge",
      activityType: selectedType,
      question,
      mode,
    };
  }

  return generateGenericQuestion(
    "multiple_choice",
    activity.activityType,
    config,
    lesson
  );
}

export function generateQuestionForActivity(
  activity: LessonActivity,
  lessonTitle: string
): Year2QuestionData {
  return generateYear2Question(
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

export const generateYear2QuestionFromActivity = generateQuestionForActivity;
