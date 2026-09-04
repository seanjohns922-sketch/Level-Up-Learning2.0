import type {
  BalanceEquationCardVisualData,
  BracketEquationCardVisualData,
  ExpressionFlowVisualData,
  FactorPairTreeVisualData,
  FunctionMachineCardVisualData,
  GrowingPatternVisualData,
  InputOutputTableVisualData,
  InverseStepCardVisualData,
  PatternSequenceStripVisualData,
  SupportedMathLevel,
  UnknownTileEquationVisualData,
  Year2QuestionData,
} from "@/data/activities/year2/lessonEngine";
import type { Lesson } from "@/data/programs/year1";
import type { LessonActivity } from "@/data/programs/types";

type QuestionVisual =
  | { type: "array"; rows: number; columns: number; highlightedRows?: number[]; rotatable?: boolean; splitAfterColumns?: number }
  | PatternSequenceStripVisualData
  | GrowingPatternVisualData
  | FunctionMachineCardVisualData
  | InputOutputTableVisualData
  | ExpressionFlowVisualData
  | FactorPairTreeVisualData
  | BalanceEquationCardVisualData
  | InverseStepCardVisualData
  | UnknownTileEquationVisualData
  | BracketEquationCardVisualData;
type RotationRole = "fast_thinking" | "reasoning" | "apply_create";
export type PatternPeaksQuestion = Extract<Year2QuestionData, { kind: "multiple_choice" | "typed_response" }>;

const PATTERN_VISUAL_TYPES = new Set([
  "array",
  "pattern_sequence_strip",
  "growing_pattern",
  "function_machine_card",
  "input_output_table",
  "expression_flow",
  "factor_pair_tree",
  "balance_equation_card",
  "inverse_step_card",
  "unknown_tile_equation",
  "bracket_equation_card",
]);

export const PATTERN_YEAR3_DOUBLE_STARTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25] as const;
export const PATTERN_YEAR3_HALVING_FINAL_TERMS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] as const;
export const PATTERN_YEAR3_WEEK3_RULE_LABELS = ["×2", "+5", "−3"] as const;
export const PATTERN_YEAR3_WEEK5_RECENT_WINDOW = 12;
export const PATTERN_YEAR3_WEEK7_FACTORS = [3, 4, 5, 10] as const;
export const PATTERN_YEAR3_WEEK7_LESSON3_TARGET_FACTORS = [2, 3, 4, 5] as const;
export const PATTERN_YEAR3_WEEK8_LESSON1_RULE_LABELS = [
  "+2",
  "+4",
  "+5",
  "+10",
  "−2",
  "−5",
  "Double",
  "Halve",
] as const;

const recentYear3Week5NumberSets = new Map<number, string[]>();
const year3Week7FactorBags = new Map<number, number[]>();
let year3Week8RuleBag: string[] = [];
let year4Week2EquationFormBag: number[] = [];

export function isPatternPeaksQuestion(question: unknown): question is PatternPeaksQuestion {
  if (!question || typeof question !== "object") return false;
  const candidate = question as { kind?: unknown; visual?: { type?: unknown } };
  if (candidate.kind !== "multiple_choice" && candidate.kind !== "typed_response") return false;
  // A visual is optional. When one is present it must be a supported type, but
  // text-only reasoning questions (e.g. mental-strategy or "spot the error")
  // are allowed to render with no visual rather than a card that restates the
  // working or gives the answer away.
  if (candidate.visual == null) return true;
  return typeof candidate.visual.type === "string" && PATTERN_VISUAL_TYPES.has(candidate.visual.type);
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]) => items[rand(0, items.length - 1)]!;

function freshYear3Week5Numbers(lessonNumber: number) {
  const recent = recentYear3Week5NumberSets.get(lessonNumber) ?? [];
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const a = rand(8, 24);
    const b = rand(5, 18);
    const total = a + b;
    const c = rand(4, total - 4);
    const signature = `${a}:${b}:${c}`;
    if (recent.includes(signature)) continue;
    recent.push(signature);
    recentYear3Week5NumberSets.set(
      lessonNumber,
      recent.slice(-PATTERN_YEAR3_WEEK5_RECENT_WINDOW),
    );
    return { a, b, total, c, d: total - c };
  }

  // The value space is large enough that this should never be reached, but a
  // valid fallback keeps generation safe if Math.random is mocked in a test.
  const a = rand(8, 24);
  const b = rand(5, 18);
  const total = a + b;
  const c = rand(4, total - 4);
  return { a, b, total, c, d: total - c };
}

function shuffle<T>(items: readonly T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = rand(0, index);
    [result[index], result[swap]] = [result[swap]!, result[index]!];
  }
  return result;
}

function nextYear3Week7Factor(
  lessonNumber: number,
  factors: readonly number[] = PATTERN_YEAR3_WEEK7_FACTORS,
) {
  let bag = year3Week7FactorBags.get(lessonNumber) ?? [];
  if (bag.length === 0) {
    bag = shuffle(factors);
  }
  const factor = bag.shift()!;
  year3Week7FactorBags.set(lessonNumber, bag);
  return factor;
}

function nextYear3Week8RuleLabel() {
  if (year3Week8RuleBag.length === 0) {
    year3Week8RuleBag = shuffle(PATTERN_YEAR3_WEEK8_LESSON1_RULE_LABELS);
  }
  return year3Week8RuleBag.shift()!;
}

function nextYear4Week2EquationForm() {
  if (year4Week2EquationFormBag.length === 0) {
    year4Week2EquationFormBag = shuffle([0, 1, 2, 3, 4]);
  }
  return year4Week2EquationFormBag.shift()!;
}

function uniqueOptions(answer: string, distractors: Array<string | number>) {
  return shuffle([...new Set([answer, ...distractors.map(String)])]).slice(0, 4);
}

function mcq(
  prompt: string,
  answer: string | number,
  distractors: Array<string | number>,
  helper: string,
  visual?: QuestionVisual,
  explanation?: string,
): Year2QuestionData {
  return {
    kind: "multiple_choice",
    prompt,
    answer: String(answer),
    options: uniqueOptions(String(answer), distractors),
    helper,
    explanation,
    visual,
  };
}

function typed(
  prompt: string,
  answer: string | number,
  helper: string,
  visual?: QuestionVisual,
  acceptedAnswers?: string[],
  explanation?: string,
): Year2QuestionData {
  return {
    kind: "typed_response",
    prompt,
    answer: String(answer),
    acceptedAnswers,
    helper,
    explanation,
    placeholder: "Type your answer",
    visual,
  };
}

function sequenceVisual(title: string, terms: Array<string | number>, arrows?: Array<string | null>): QuestionVisual {
  return {
    type: "pattern_sequence_strip",
    title,
    terms: terms.map(String),
    arrowLabels: arrows,
  };
}

function growingVisual(title: string, counts: number[], style: "dots" | "tiles" = "tiles"): QuestionVisual {
  return {
    type: "growing_pattern",
    title,
    stages: counts.map((count, index) => ({ label: `Stage ${index + 1}`, count, style })),
  };
}

function machineVisual(title: string, input: string | number, rule: string, output: string | number): QuestionVisual {
  return { type: "function_machine_card", title, input: String(input), rule, output: String(output) };
}

function tableVisual(title: string, pairs: Array<[string | number, string | number]>): QuestionVisual {
  return {
    type: "input_output_table",
    title,
    pairs: pairs.map(([input, output]) => ({ input: String(input), output: String(output) })),
  };
}

function balanceVisual(title: string, left: string, right: string, unknownSymbol = "□"): QuestionVisual {
  return { type: "balance_equation_card", title, left, right, unknownSymbol };
}

function inverseVisual(title: string, equation: string, inverseOperation: string): QuestionVisual {
  return { type: "inverse_step_card", title, equation, inverseOperation, focusLabel: "Undo and check" };
}

function unknownVisual(title: string, left: string, right: string, unknownSymbol = "□"): QuestionVisual {
  return { type: "unknown_tile_equation", title, left, right, unknownSymbol };
}

// A problem/clue presentation card: the big expression-token chips (like the
// worked-flow cards) but WITHOUT a "Result" line, so it looks rich without
// revealing the answer. Use it for reasoning/mental questions.
function promptVisual(
  title: string,
  cards: Array<{ label?: string; tokens: string[]; note?: string }>,
): QuestionVisual {
  return { type: "expression_flow", title, cards };
}

function roleFor(activity: LessonActivity): RotationRole {
  const role = activity.config?.rotationRole;
  return role === "reasoning" || role === "apply_create" ? role : "fast_thinking";
}

function year3Question(week: number, lessonNumber: number, role: RotationRole): Year2QuestionData {
  if (week <= 2) {
    // Keep the arithmetic varied while ensuring every halving sequence stays in whole numbers.
    // Lesson 1.2 deliberately includes both operations in every three-activity rotation.
    const doubling = week === 1 && lessonNumber === 2
      ? role !== "reasoning" && (role === "fast_thinking" || rand(0, 1) === 0)
      : rand(0, 1) === 0;
    const start = doubling ? pick(PATTERN_YEAR3_DOUBLE_STARTS) : pick(PATTERN_YEAR3_HALVING_FINAL_TERMS) * 8;
    const values = doubling
      ? [start, start * 2, start * 4, start * 8]
      : [start, start / 2, start / 4, start / 8];
    const rule = doubling ? "Double each term" : "Halve each term";
    const compactRule = doubling ? "Double" : "Halve";
    const next = doubling ? values[3]! * 2 : values[3]! / 2;

    if (week === 1 && lessonNumber === 2) {
      if (role === "fast_thinking") {
        return typed(
          "Type the missing term.",
          next,
          `Use the rule: ${rule.toLowerCase()}.`,
          sequenceVisual("Continue the pattern", [...values, "?"], [compactRule, compactRule, compactRule, compactRule]),
        );
      }
      if (role === "reasoning") {
        return typed(
          "Type the missing term.",
          values[2]!,
          `Check the term on both sides using the rule: ${rule.toLowerCase()}.`,
          sequenceVisual("Restore the pattern", [values[0]!, values[1]!, "?", values[3]!], [compactRule, compactRule, compactRule]),
        );
      }
      return typed(
        "Type the missing term.",
        values[0]!,
        `Work backwards from ${values[1]} by undoing the rule.`,
        sequenceVisual("Work backwards", ["?", values[1]!, values[2]!, values[3]!], [compactRule, compactRule, compactRule]),
      );
    }

    const shown = lessonNumber === 3 ? [values[0]!, values[1]!, doubling ? values[2]! + 2 : values[2]! - 1, values[3]!] : values;
    const visual = sequenceVisual(lessonNumber === 3 ? "Find the broken step" : "Follow the pattern", [...shown, "?"], [rule, rule, rule, null]);
    if (role === "fast_thinking") {
      return mcq("Which rule controls this sequence?", rule, [doubling ? "Add 2 each time" : "Subtract 2 each time", doubling ? "Halve each term" : "Double each term"], "Compare one term with the next, then test the same rule again.", visual);
    }
    if (role === "reasoning") {
      if (lessonNumber === 3) {
        const brokenIndex = 2;
        return mcq("Which term breaks the rule?", shown[brokenIndex]!, [shown[1]!, shown[3]!], "Test every jump using the same operation.", visual);
      }
      return mcq("Why is the next term correct?", `${values[3]} ${doubling ? "doubled" : "halved"} is ${next}`, [`${values[3]} + 2 is ${next}`, `${values[3]} - 2 is ${next}`], "Name the operation and show it works on the last term.", visual);
    }
    const missingIndex = lessonNumber === 2 ? 2 : 4;
    const missingAnswer = missingIndex === 2 ? values[2]! : next;
    const terms = missingIndex === 2 ? [values[0]!, values[1]!, "?", values[3]!] : [...values, "?"];
    return typed("Type the missing term.", missingAnswer, `Use the rule: ${rule.toLowerCase()}.`, sequenceVisual("Complete the sequence", terms));
  }

  if (week === 3) {
    const operations = [
      { label: PATTERN_YEAR3_WEEK3_RULE_LABELS[0], apply: (value: number) => value * 2, minimumInput: 1 },
      { label: PATTERN_YEAR3_WEEK3_RULE_LABELS[1], apply: (value: number) => value + 5, minimumInput: 1 },
      { label: PATTERN_YEAR3_WEEK3_RULE_LABELS[2], apply: (value: number) => value - 3, minimumInput: 3 },
    ] as const;
    // Every Week 3 lesson practises all three rules. Subtraction starts at 3 or
    // above so Level 3 learners never encounter a negative input or output.
    const operation = pick(operations);
    const input = rand(Math.max(3, operation.minimumInput), 12);
    const output = operation.apply(input);
    const tableStart = rand(operation.minimumInput, Math.max(operation.minimumInput, 5));
    const pairs: Array<[number, number]> = [tableStart, tableStart + 1, tableStart + 2].map((value) => [value, operation.apply(value)]);
    if (role === "fast_thinking") {
      return mcq("What output does the machine make?", output, [output + 1, output + 2, output + 5], "Apply the operation to the input once.", machineVisual("Function machine", input, operation.label, "?"));
    }
    if (role === "reasoning") {
      return mcq("Which rule matches every input-output pair?", operation.label, operations.filter((item) => item.label !== operation.label).map((item) => item.label), "A rule must work for every row, not just one.", tableVisual("Rule decoder", pairs));
    }
    return typed("Use the rule to calculate the missing output.", output, `Start with ${input}, then apply ${operation.label}.`, machineVisual("Build the output", input, operation.label, "?"));
  }

  if (week === 4) {
    if (lessonNumber === 1) {
      const a = rand(18, 45);
      const b = rand(6, 17);
      const total = a + b;
      if (role === "apply_create") {
        const visual = inverseVisual("Addition and subtraction undo", `${a} + ${b} = ${total}`, `${total} − ${b} = ?`);
        return typed(
          `Use the inverse: ${total} − ${b} = ?`,
          a,
          "Subtraction undoes the addition.",
          visual,
        );
      }
      const visual = inverseVisual(
        "Addition and subtraction undo",
        `${a} + ${b} = ${total}`,
        "Choose the subtraction equation that reverses the addition.",
      );
      return mcq("Which equation proves the addition fact?", `${total} − ${b} = ${a}`, [`${total} + ${b} = ${a}`, `${a} − ${b} = ${total}`], "Use subtraction to undo the addition.", visual);
    }
    const factorA = pick([3, 4, 5, 10]);
    const factorB = rand(2, 10);
    const product = factorA * factorB;
    const visual = { type: "array" as const, rows: factorA, columns: factorB };
    if (role === "apply_create") return typed(`${product} ÷ ${factorA} = ?`, factorB, "Division undoes multiplication.", visual);
    const answer = lessonNumber === 2 ? `${product} ÷ ${factorA} = ${factorB}` : `${factorA} × ${factorB} = ${product}`;
    return mcq(lessonNumber === 2 ? "Which division fact belongs to this array?" : "Which fact checks the division?", answer, [`${product} ÷ ${factorB} = ${product}`, `${factorA} + ${factorB} = ${product}`], "Use the same two factors and product.", visual);
  }

  if (week === 5) {
    const { a, b, total, c, d } = freshYear3Week5Numbers(lessonNumber);
    const visual = balanceVisual("Keep both sides equal", `${a} + ${b}`, `${c} + ${d}`);
    if (role === "fast_thinking") return mcq("Are both sides equal?", "Yes", ["No"], "Calculate both sides separately.", visual);
    if (role === "reasoning") return mcq("Which explanation proves the equation is true?", `Both sides equal ${total}`, [`Only the left side equals ${total}`, "The equals sign means calculate next"], "The equals sign compares two values.", visual);
    return typed(`Complete the equivalent sentence: ${a} + ${b} = ${c} + ?`, d, "Find the total first, then the missing part.", unknownVisual("Build an equivalent sentence", `${a} + ${b}`, `${c} + □`));
  }

  if (week === 6) {
    const multiplication = lessonNumber === 2;
    if (multiplication) {
      const factor = pick([3, 4, 5, 10]);
      const missing = rand(2, 10);
      const product = factor * missing;
      const visual = unknownVisual("Find the missing fact value", `${factor} × □`, String(product));
      return role === "apply_create"
        ? typed(`${factor} × □ = ${product}. Type the unknown.`, missing, "Use the related division fact.", visual)
        : mcq("Which inverse finds the unknown?", `${product} ÷ ${factor}`, [`${product} − ${factor}`, `${product} + ${factor}`], "Division undoes multiplication.", visual);
    }
    const known = rand(12, 35);
    const missing = rand(6, 20);
    const total = known + missing;
    const visual = unknownVisual("Hidden rune equation", `${known} + □`, String(total));
    if (lessonNumber === 1) {
      const prompt = role === "fast_thinking"
        ? `${known} + □ = ${total}. Type the missing addend.`
        : role === "reasoning"
          ? `What value makes ${known} + □ = ${total} true?`
          : `Complete the equation: ${known} + □ = ${total}.`;
      const helper = role === "reasoning"
        ? `Use the inverse: subtract ${known} from ${total}.`
        : "Find the missing part of the total.";
      return typed(prompt, missing, helper, visual);
    }
    if (role === "apply_create") return typed(`${known} + □ = ${total}. Type the unknown.`, missing, "Subtract the known part from the whole.", visual);
    if (role === "reasoning") return mcq("Which check proves the unknown?", `${total} − ${known} = ${missing}`, [`${known} − ${missing} = ${total}`, `${total} + ${known} = ${missing}`], "Use the inverse and substitute the result.", visual);
    return mcq("What is the unknown?", missing, [missing - 2, missing + 2, known], "Find the missing part.", visual);
  }

  if (week === 7) {
    if (lessonNumber === 1) {
      const base = rand(3, 9);
      const visual = sequenceVisual("Related addition facts", [base, base + 10, base + 20, base + 30, "?"], ["+10", "+10", "+10", null]);
      return role === "apply_create"
        ? typed("Type the next related value.", base + 40, "The ones stay the same while the tens increase.", visual)
        : mcq("What stays the same in this fact pattern?", "The ones digit", ["The tens digit", "Every digit changes"], "Compare place values in each term.", visual);
    }

    if (lessonNumber === 2) {
      const factor = nextYear3Week7Factor(lessonNumber);
      const firstMultiplier = rand(1, 5);
      const multipliers = Array.from({ length: 5 }, (_, index) => firstMultiplier + index);
      const products = multipliers.map((multiplier) => multiplier * factor);
      const productLadder = sequenceVisual(
        `${factor} facts product ladder`,
        products,
        Array.from({ length: products.length - 1 }, () => `+${factor}`),
      );

      if (role === "fast_thinking") {
        return mcq(
          `Which rule grows this ${factor} facts pattern?`,
          `Add ${factor} each time`,
          [`Add 1 each time`, `Multiply by ${factor} each time`, `Subtract ${factor} each time`],
          `Each multiplier increases by 1, so each product increases by ${factor}.`,
          productLadder,
        );
      }

      if (role === "reasoning") {
        return mcq(
          "What happens to the product when the multiplier increases by 1?",
          `The product increases by ${factor}`,
          [`The product increases by 1`, `The product doubles`, `The product decreases by ${factor}`],
          "Compare the output in each row with the output directly below it.",
          tableVisual(
            `${factor} facts relationship table`,
            multipliers.map((multiplier, index) => [multiplier, products[index]!] as [number, number]),
          ),
        );
      }

      const missingIndex = rand(1, products.length - 2);
      const missingProduct = products[missingIndex]!;
      const terms = products.map((product, index) => index === missingIndex ? "?" : product);
      return typed(
        `Type the missing product in this ${factor} facts pattern.`,
        missingProduct,
        `The products increase by ${factor} each time. Check the fact ${factor} × ${multipliers[missingIndex]}.`,
        sequenceVisual(
          `${factor} facts missing product`,
          terms,
          Array.from({ length: terms.length - 1 }, () => `+${factor}`),
        ),
      );
    }

    const factor = nextYear3Week7Factor(lessonNumber, PATTERN_YEAR3_WEEK7_LESSON3_TARGET_FACTORS);
    const n = rand(3, 9);
    const product = factor * n;
    const knownFactor = factor - 1;
    const knownProduct = knownFactor * n;
    const nextFactVisual: QuestionVisual = {
      type: "expression_flow",
      title: "Step to the next fact",
      cards: [
        {
          label: "Known fact",
          tokens: [String(knownFactor), "×", String(n), "=", String(knownProduct)],
        },
        {
          label: "Add one equal group",
          tokens: ["+", String(n)],
        },
        {
          label: "Next fact",
          tokens: [String(factor), "×", String(n), "="],
          result: "?",
        },
      ],
    };

    if (role === "reasoning") {
      return typed(
        `How much do you add to move from ${knownFactor} × ${n} to ${factor} × ${n}?`,
        n,
        `One more group contains ${n}.`,
        {
          type: "expression_flow",
          title: "Find the size of one more group",
          cards: [
            {
              label: "Known fact",
              tokens: [String(knownFactor), "×", String(n), "=", String(knownProduct)],
            },
            {
              label: "One more group",
              tokens: ["Add"],
              result: "?",
            },
            {
              label: "Next fact",
              tokens: [String(factor), "×", String(n)],
            },
          ],
        },
      );
    }

    return typed(
      `Use ${knownFactor} × ${n} = ${knownProduct} to work out ${factor} × ${n}.`,
      product,
      `Add one more group of ${n}: ${knownProduct} + ${n}.`,
      nextFactVisual,
    );
  }

  if (week === 8 && lessonNumber === 1) {
    const rules = [
      { label: "+2", apply: (value: number) => value + 2, start: () => rand(2, 15) },
      { label: "+4", apply: (value: number) => value + 4, start: () => rand(2, 15) },
      { label: "+5", apply: (value: number) => value + 5, start: () => rand(2, 15) },
      { label: "+10", apply: (value: number) => value + 10, start: () => rand(2, 15) },
      { label: "−2", apply: (value: number) => value - 2, start: () => rand(12, 28) },
      { label: "−5", apply: (value: number) => value - 5, start: () => rand(25, 45) },
      { label: "Double", apply: (value: number) => value * 2, start: () => rand(2, 6) },
      { label: "Halve", apply: (value: number) => value / 2, start: () => rand(1, 8) * 16 },
    ] as const;
    const nextRuleLabel = nextYear3Week8RuleLabel();
    const rule = rules.find((candidate) => candidate.label === nextRuleLabel)!;
    const terms = [rule.start()];
    while (terms.length < 5) terms.push(rule.apply(terms.at(-1)!));

    if (role === "fast_thinking") {
      return mcq(
        "Which rule generates every term in this investigation?",
        rule.label,
        PATTERN_YEAR3_WEEK8_LESSON1_RULE_LABELS.filter((label) => label !== rule.label).slice(0, 3),
        "Test the same rule on at least two jumps.",
        sequenceVisual("Test the rule", terms),
      );
    }

    if (role === "reasoning") {
      return mcq(
        "Which observation is supported by every step?",
        `Every step follows the ${rule.label} rule`,
        ["Only the first step follows the rule", "The rule changes after each term", "The terms have no rule"],
        "Check each neighbouring pair, not just the first pair.",
        sequenceVisual("Check all the evidence", terms),
      );
    }

    return typed(
      `Use the ${rule.label} rule to complete the investigation.`,
      terms[4]!,
      "Apply the same rule one more time.",
      sequenceVisual("Complete the investigation", [...terms.slice(0, 4), "?"], Array.from({ length: 4 }, () => rule.label)),
    );
  }

  if (week === 8 && lessonNumber === 2) {
    const [smallerStep, largerStep] = pick([[2, 5], [3, 6], [4, 7], [5, 10]] as const);
    const start = rand(2, 12);
    const swapRules = rand(0, 1) === 1;
    const stepA = swapRules ? largerStep : smallerStep;
    const stepB = swapRules ? smallerStep : largerStep;
    const termsA = Array.from({ length: 5 }, (_, index) => start + index * stepA);
    const termsB = Array.from({ length: 5 }, (_, index) => start + index * stepB);
    const comparisonVisual = (hideFinalFor?: "A" | "B"): QuestionVisual => ({
      type: "expression_flow",
      title: "Two rules from the same start",
      cards: [
        {
          label: `Rule A: add ${stepA}`,
          tokens: [String(start), "+", String(stepA), "+", String(stepA), "+", String(stepA), "+", String(stepA)],
          result: hideFinalFor === "A" ? "?" : String(termsA[4]),
        },
        {
          label: `Rule B: add ${stepB}`,
          tokens: [String(start), "+", String(stepB), "+", String(stepB), "+", String(stepB), "+", String(stepB)],
          result: hideFinalFor === "B" ? "?" : String(termsB[4]),
        },
      ],
    });
    const fasterRule = stepA > stepB ? "Rule A" : "Rule B";

    if (role === "fast_thinking") {
      return mcq(
        "After four steps, which rule produces the larger number?",
        fasterRule,
        [fasterRule === "Rule A" ? "Rule B" : "Rule A", "They are equal"],
        "Both rules start together, so compare how much each one adds.",
        comparisonVisual(),
      );
    }

    if (role === "reasoning") {
      const gap = Math.abs(termsA[4]! - termsB[4]!);
      return mcq(
        "How far apart are the two results after four steps?",
        gap,
        [Math.abs(stepA - stepB), gap + 2, gap + 4],
        "Subtract the smaller final result from the larger final result.",
        comparisonVisual(),
      );
    }

    const targetRule = rand(0, 1) === 0 ? "A" : "B";
    return typed(
      `Complete Rule ${targetRule} after four steps.`,
      targetRule === "A" ? termsA[4]! : termsB[4]!,
      `Start at ${start} and add ${targetRule === "A" ? stepA : stepB} four times.`,
      comparisonVisual(targetRule),
    );
  }

  const mixedWeek = ((lessonNumber - 1) % 3) + 3;
  return year3Question(mixedWeek, lessonNumber, role);
}

function year4Question(
  week: number,
  lessonNumber: number,
  role: RotationRole,
  useDedicatedLessons = false,
): Year2QuestionData {
  if (week === 1 && lessonNumber <= 2) {
    const known = rand(35, 140);
    const missing = rand(12, 70);
    const total = known + missing;

    if (lessonNumber === 1) {
      const unknownPosition = rand(0, 2);
      const left = unknownPosition === 2
        ? String(total)
        : unknownPosition === 1
          ? `□ + ${known}`
          : `${known} + □`;
      const right = unknownPosition === 2 ? `${known} + □` : String(total);
      const helper = role === "reasoning"
        ? `Both sides must equal ${total}. Find the missing part.`
        : `Subtract ${known} from ${total}.`;
      return typed(
        `${left} = ${right}. Type the unknown.`,
        missing,
        helper,
        unknownVisual("Make both sides equal", left, right),
      );
    }

    const completePartA = rand(20, total - 20);
    const completePartB = total - completePartA;
    const mysterySide = rand(0, 1) === 0 ? `${known} + □` : `□ + ${known}`;
    const completeSide = `${completePartA} + ${completePartB}`;
    const unknownOnLeft = rand(0, 1) === 0;
    const left = unknownOnLeft ? mysterySide : completeSide;
    const right = unknownOnLeft ? completeSide : mysterySide;
    const helper = role === "reasoning"
      ? `The complete side totals ${total}. What must the other side add to ${known}?`
      : "Calculate the complete side first, then find the missing part.";
    return typed(
      `${left} = ${right}. Type the unknown.`,
      missing,
      helper,
      unknownVisual("Balance both number sentences", left, right),
    );
  }

  if (week === 2 && useDedicatedLessons) {
    if (lessonNumber === 1) {
      const knownA = rand(20, 90);
      const knownB = rand(10, 60);
      const missing = rand(12, 70);
      const total = knownA + knownB + missing;
      return typed(
        `${knownA} + ${knownB} + □ = ${total}. Type the unknown.`,
        missing,
        role === "reasoning"
          ? `Combine the known parts first: ${knownA} + ${knownB} = ${knownA + knownB}.`
          : `Subtract both known parts from ${total}.`,
        unknownVisual("Combine, then find the missing part", `${knownA} + ${knownB} + □`, String(total)),
      );
    }

    if (lessonNumber === 2) {
      const known = rand(35, 140);
      const missing = rand(12, 70);
      const total = known + missing;
      const form = nextYear4Week2EquationForm();
      let left: string;
      let right: string;
      let answer = missing;

      if (form === 0) {
        left = `□ + ${known}`;
        right = String(total);
      } else if (form === 1) {
        left = `${known} + □`;
        right = String(total);
      } else if (form === 2) {
        left = String(total);
        right = `□ + ${known}`;
      } else if (form === 3) {
        left = `${known} + ${missing}`;
        right = "□";
        answer = total;
      } else {
        const completePartA = rand(20, total - 20);
        const completePartB = total - completePartA;
        left = `${completePartA} + ${completePartB}`;
        right = `${known} + □`;
      }

      return typed(
        `${left} = ${right}. Type the unknown.`,
        answer,
        role === "reasoning"
          ? "Treat the equals sign as a balance: both complete sides need the same value."
          : "Calculate the known value, then find what is missing.",
        unknownVisual("Track the moving unknown", left, right),
      );
    }

    const known = rand(35, 160);
    const missing = rand(12, 80);
    const total = known + missing;
    return typed(
      `Use the inverse to find the unknown in ${known} + □ = ${total}.`,
      missing,
      role === "reasoning"
        ? `Check that ${total} − ${known} gives the same missing value.`
        : "Undo the addition with subtraction.",
      inverseVisual("Solve, then check", `${known} + □ = ${total}`, `${total} − ${known} = ?`),
    );
  }

  if (week === 4 && useDedicatedLessons) {
    if (lessonNumber === 1) {
      const a = rand(20, 160);
      const b = rand(20, 160);
      return typed(
        `${a} + ${b} = ${b} + □. Type the unknown.`,
        a,
        role === "reasoning"
          ? "Commutative means the addends can change order and the total stays the same."
          : "Commutative means order can change: the same two addends appear on both sides.",
        unknownVisual("Order can change — commutative", `${a} + ${b}`, `${b} + □`),
      );
    }

    if (lessonNumber === 2) {
      const a = rand(20, 80);
      const b = rand(15, 70);
      const c = rand(10, 60);
      return typed(
        `(${a} + ${b}) + ${c} = ${a} + (□). Write what goes inside the brackets.`,
        `${b} + ${c}`,
        role === "reasoning"
          ? `Associative means the grouping can change: group ${b} and ${c} together inside the brackets.`
          : "Associative means grouping can change without changing the total. Keep the numbers in order and write the last two as an addition inside the brackets.",
        unknownVisual("Grouping can change — associative", `(${a} + ${b}) + ${c}`, `${a} + (□)`),
        [`${b}+${c}`],
      );
    }

    const a = rand(25, 110);
    const b = rand(15, 80);
    const total = a + b;
    const missing = rand(8, 35);
    const largerNumber = total + missing;
    return typed(
      `${a} + ${b} = ${largerNumber} − □. Type the unknown.`,
      missing,
        role === "reasoning"
          ? `Equivalent means both expressions have the same value: ${a} + ${b} = ${total}.`
          : `Equivalent means the same value. Make the right side equal ${total}.`,
      unknownVisual("Different expression, same value — equivalent", `${a} + ${b}`, `${largerNumber} − □`),
    );
  }

  if (week <= 4) {
    const subtraction = week === 3;
    const regrouping = week === 4;
    const known = rand(35, 180);
    const missing = rand(12, 70);
    const total = known + missing;
    if (regrouping) {
      const c = rand(8, 30);
      const a = rand(20, 60);
      const b = rand(20, 60);
      const answer = a + b + c;
      const visual = balanceVisual("Reorder and regroup", `${a} + ${b} + ${c}`, `${a} + (${b} + ${c})`);
      if (role === "apply_create") return typed(`Calculate ${a} + (${b} + ${c}).`, answer, "Regroup friendly parts without changing the total.", visual);
      return mcq(lessonNumber === 1 ? "Which property lets the addends change order?" : "Why can the addends be regrouped?", lessonNumber === 1 ? "Commutative property" : "The total is preserved", ["Division property", "The equals sign changes the answer"], "Reordering or regrouping addition does not change its value.", visual);
    }
    const left = subtraction ? `${total} − □` : `${known} + □`;
    const right = subtraction ? String(known) : String(total);
    const visual = unknownVisual(subtraction ? "Subtraction unknown" : "Addition unknown", left, right);
    if (role === "apply_create") return typed(`${left} = ${right}. Type the unknown.`, missing, subtraction ? "Use addition to undo the subtraction." : "Subtract the known addend from the total.", visual);
    if (role === "reasoning") {
      const proof = subtraction ? `${known} + ${missing} = ${total}` : `${total} − ${known} = ${missing}`;
      return mcq("Which equation proves the missing value?", proof, [`${known} − ${missing} = ${total}`, `${total} + ${known} = ${missing}`], "Use the inverse relationship, then check both sides.", visual);
    }
    return mcq(week === 1 ? "What must the equals sign tell us?" : "What is the unknown?", week === 1 ? "Both sides have the same value" : missing, week === 1 ? ["Write the answer next", "The left side is always larger"] : [missing - 5, missing + 5, known], "Compare both sides as complete values.", visual);
  }

  // Week 5 — "Multiplication Fact Patterns". Each lesson targets its own idea:
  // L1 reads the fact grid (symmetry + related products), L2 derives a fact from
  // known nearby facts, L3 reveals the related division facts.
  if (week === 5) {
    const n = rand(4, 10);

    if (lessonNumber === 1) {
      // Read the Fact Grid — symmetry (a×b = b×a) and related products.
      const factor = rand(3, 9);
      const product = factor * n;
      const visual = { type: "array" as const, rows: factor, columns: n };
      if (role === "apply_create") {
        return typed(
          `The grid shows ${factor} × ${n} = ${product}. What is ${factor} × ${n + 1}?`,
          product + factor,
          `One more column adds another row of ${factor}: ${product} + ${factor}.`,
          visual,
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Why do ${factor} × ${n} and ${n} × ${factor} give the same product?`,
          "The array is the same grid, just turned on its side",
          ["Because the two numbers are added", "Because the larger factor always wins"],
          "Rows become columns when you rotate the grid — the product does not change.",
          visual,
        );
      }
      return mcq(
        "Which fact shows the same product on the grid, turned on its side?",
        `${n} × ${factor} = ${product}`,
        [`${factor} + ${n} = ${product}`, `${factor} × ${n + 1} = ${product}`],
        "Symmetry on the fact grid: a × b = b × a.",
        visual,
      );
    }

    if (lessonNumber === 2) {
      // Connect Related Facts — derive a fact from known nearby facts.
      const factor = [6, 7, 9][rand(0, 2)]!;
      const product = factor * n;
      const visual = { type: "array" as const, rows: factor, columns: n };
      const strategyText =
        factor === 6 ? `double 3 × ${n} (= ${3 * n})`
        : factor === 9 ? `10 × ${n} then take away one ${n} (${10 * n} − ${n})`
        : `5 × ${n} + 2 × ${n} (${5 * n} + ${2 * n})`;
      if (role === "reasoning") {
        const correct =
          factor === 6 ? `Double 3 × ${n}`
          : factor === 9 ? `10 × ${n} − ${n}`
          : `5 × ${n} + 2 × ${n}`;
        return mcq(
          `Which known facts build ${factor} × ${n}?`,
          correct,
          [`${factor} + ${n}`, `${product} + ${factor}`],
          "Break the harder fact into facts you already know.",
          visual,
        );
      }
      return typed(
        `Use a known fact to work out ${factor} × ${n}.`,
        product,
        `Try ${strategyText}.`,
        visual,
      );
    }

    // Reveal the Division Facts — turn a known product into its division facts.
    const factor = rand(3, 10);
    const product = factor * n;
    const visual = { type: "array" as const, rows: factor, columns: n };
    if (role === "apply_create") {
      return typed(
        `${factor} × ${n} = ${product}. Work out ${product} ÷ ${factor}.`,
        n,
        "Divide the product by one factor to find the other.",
        visual,
      );
    }
    if (role === "reasoning") {
      return mcq(
        `${factor} × ${n} = ${product}. Which division fact does the same array show?`,
        `${product} ÷ ${factor} = ${n}`,
        [`${product} ÷ ${n} = ${product}`, `${factor} ÷ ${n} = ${product}`],
        "The same array splits back into equal groups.",
        visual,
      );
    }
    return mcq(
      "Which related division fact is true?",
      `${product} ÷ ${factor} = ${n}`,
      [`${product} ÷ ${n} = ${product}`, `${factor} ÷ ${n} = ${product}`],
      "Use the rows and columns as factors, then reverse it.",
      visual,
    );
  }

  // Week 6 — "Derive Harder Facts". Each lesson teaches its own strategy:
  // L1 sixes by doubling threes, L2 sevens by the 5+2 split, L3 nines by 10×−1.
  if (week === 6) {
    const n = rand(4, 10);
    const factor = [6, 7, 9][lessonNumber - 1]!;
    const product = factor * n;
    const visual = { type: "array" as const, rows: factor, columns: n };

    if (lessonNumber === 1) {
      if (role === "reasoning") {
        return mcq(
          `Which known fact helps you work out 6 × ${n}?`,
          `Double 3 × ${n}`,
          [`Add 3 + ${n}`, `Double 6 × ${n}`],
          "6 is double 3, so 6 × n is double 3 × n.",
          visual,
        );
      }
      if (role === "apply_create") {
        return typed(
          `3 × ${n} = ${3 * n}. Use it to work out 6 × ${n}.`,
          product,
          `6 is double 3, so double ${3 * n}.`,
          visual,
        );
      }
      return typed(
        `Double 3 × ${n} to find 6 × ${n}.`,
        product,
        `3 × ${n} = ${3 * n}, then double it.`,
        visual,
      );
    }

    if (lessonNumber === 2) {
      if (role === "reasoning") {
        return mcq(
          `How can you split 7 × ${n} into easier facts?`,
          `5 × ${n} + 2 × ${n}`,
          [`7 + ${n}`, `5 × ${n} − 2 × ${n}`],
          "Split 7 into 5 and 2, then add the two products.",
          visual,
        );
      }
      if (role === "apply_create") {
        return typed(
          `5 × ${n} = ${5 * n} and 2 × ${n} = ${2 * n}. What is 7 × ${n}?`,
          product,
          `Add the two parts: ${5 * n} + ${2 * n}.`,
          visual,
        );
      }
      return typed(
        `Split 7 into 5 and 2 to find 7 × ${n}.`,
        product,
        `7 × ${n} = 5 × ${n} + 2 × ${n}.`,
        visual,
      );
    }

    // L3 — nines via ten times minus one.
    if (role === "reasoning") {
      return mcq(
        `Which known fact helps you work out 9 × ${n}?`,
        `10 × ${n} − ${n}`,
        [`10 × ${n} + ${n}`, `9 + ${n}`],
        `9 is one less than 10, so take one ${n} off 10 × ${n}.`,
        visual,
      );
    }
    if (role === "apply_create") {
      return typed(
        `10 × ${n} = ${10 * n}. Use it to work out 9 × ${n}.`,
        product,
        `9 × ${n} = 10 × ${n} − ${n}.`,
        visual,
      );
    }
    return typed(
      `Use 10 × ${n} then subtract one ${n} to find 9 × ${n}.`,
      product,
      `10 × ${n} = ${10 * n}, then take away one ${n}.`,
      visual,
    );
  }

  // Week 7 — "Efficient Fact Strategies" (AC9M4A02): select and apply fact
  // strategies to larger calculations. L1 choose the fastest known fact,
  // L2 scale a fact up by 10, L3 mental strategy for a two-digit product.
  if (week === 7) {
    const n = rand(4, 10);

    if (lessonNumber === 1) {
      const factor = [6, 7, 8, 9][rand(0, 3)]!;
      const product = factor * n;
      const visual = { type: "array" as const, rows: factor, columns: n };
      const best =
        factor === 6 ? `Double 3 × ${n}`
        : factor === 8 ? `Double 4 × ${n}`
        : factor === 9 ? `10 × ${n} − ${n}`
        : `5 × ${n} + 2 × ${n}`;
      if (role === "apply_create") {
        return typed(
          `Choose an efficient known fact to work out ${factor} × ${n}.`,
          product,
          "Start from a fact you know well, then adjust.",
          visual,
        );
      }
      return mcq(
        `What is the most efficient way to work out ${factor} × ${n}?`,
        best,
        [`Add ${factor} + ${n}`, `Count by ${factor} a total of ${n} times`],
        "Pick the known fact that reaches the answer in the fewest steps.",
        visual,
      );
    }

    if (lessonNumber === 2) {
      const factor = rand(3, 9);
      const product = factor * n;
      const visual = { type: "array" as const, rows: factor, columns: n };
      if (role === "reasoning") {
        return mcq(
          `You know ${factor} × ${n} = ${product}. Which fact does that help you find?`,
          `${factor} × ${n * 10} = ${product * 10}`,
          [`${factor} × ${n + 10} = ${product * 10}`, `${factor} × ${n} = ${product * 10}`],
          "Ten times a factor makes the product ten times as big.",
          visual,
        );
      }
      return typed(
        `Use ${factor} × ${n} = ${product} to work out ${factor} × ${n * 10}.`,
        product * 10,
        "The factor is 10 times bigger, so the product is 10 times bigger.",
        visual,
      );
    }

    // L3 Mental Strategy Challenge — two-digit × one-digit by partitioning.
    // No worked visual: the split IS what the student has to find/apply.
    const factor = rand(3, 8);
    const twoDigit = rand(12, 24);
    const tensPart = Math.floor(twoDigit / 10) * 10;
    const onesPart = twoDigit - tensPart;
    const product = factor * twoDigit;
    if (role === "reasoning") {
      return mcq(
        `Which split makes ${factor} × ${twoDigit} easiest to do mentally?`,
        `${factor} × ${tensPart} + ${factor} × ${onesPart}`,
        [`${factor} × ${twoDigit} × 10`, `${factor} + ${twoDigit}`],
        "Only one option has the same value as the original — work each out to check.",
        promptVisual("Mental multiplication", [
          { label: "Which split?", tokens: [`${factor}`, "×", `${twoDigit}`] },
        ]),
      );
    }
    // "?" becomes the answer box the student types into.
    return typed(
      "Work it out in your head.",
      product,
      `Split ${twoDigit} into ${tensPart} and ${onesPart}, multiply each by ${factor}, then add the parts.`,
      promptVisual("Mental multiplication", [
        { label: "Work it out", tokens: [`${factor}`, "×", `${twoDigit}`, "=", "?"] },
      ]),
    );
  }

  // Week 8 — "Equation Expedition" (AC9M4A01 + AC9M4A02): a multiplication fact
  // and a missing number in one equation, plus efficiency and error-spotting.
  // The card carries the maths so the prompts stay short.
  if (week === 8) {
    const f1 = rand(3, 9);
    const f2 = rand(3, 9);
    const product = f1 * f2;

    if (lessonNumber === 1) {
      const missing = rand(6, 40);
      const total = product + missing;
      const equationCard = promptVisual("Find the missing number", [
        { tokens: [`${f1}`, "×", `${f2}`, "+", "?", "=", `${total}`] },
      ]);
      if (role === "reasoning") {
        return mcq(
          "What should you work out first?",
          `${f1} × ${f2}`,
          [`? + ${total}`, "the ? on its own"],
          "Do the multiplication first, then find the missing part.",
          equationCard,
        );
      }
      return typed(
        "Find the missing number.",
        missing,
        `First work out ${f1} × ${f2}, then find what to add to reach ${total}.`,
        equationCard,
      );
    }

    if (lessonNumber === 2) {
      const even = pick([6, 8, 10, 12, 14]);
      const answer = 5 * even;
      return mcq(
        "Whose way is more efficient?",
        `Ari: half of ${even}, then × 10`,
        [`Bo: add ${even} five times`, "Cass: count up in fives"],
        `Both reach 5 × ${even} = ${answer} — pick the way with fewer steps.`,
        promptVisual("Same answer, two ways", [
          { tokens: ["5", "×", `${even}`, "=", `${answer}`] },
        ]),
      );
    }

    // L3 Spot the mistake.
    const missing = rand(5, 30);
    const total = product + missing;
    const studentAnswer = missing + rand(2, 5);
    return mcq(
      "Spot the mistake. What is the correct answer?",
      missing,
      [studentAnswer, total, product],
      `Work out ${f1} × ${f2}, then check the student's answer.`,
      promptVisual("A student's answer", [
        { tokens: [`${f1}`, "×", `${f2}`, "+", "?", "=", `${total}`], note: `The student answered ${studentAnswer}.` },
      ]),
    );
  }

  return year4Question(lessonNumber === 1 ? 2 : lessonNumber === 2 ? 6 : 3, lessonNumber, role);
}

function year5Question(week: number, lessonNumber: number, role: RotationRole): Year2QuestionData {
  // Level 5 pattern: prompts stay short, the card carries the maths, and the
  // "?" token is the answer box the student types into. Cards never show the
  // answer. Each week's three lessons have distinct focuses (see level5Seeds).

  // Week 1 — Multiplication and Division Inverses (AC9M5A01).
  if (week === 1) {
    const a = rand(4, 12);
    const b = rand(4, 12);
    const p = a * b;

    if (lessonNumber === 1) {
      // Operations That Undo — division undoes multiplication.
      if (role === "apply_create") {
        return typed(
          "Find the missing factor.",
          b,
          `Divide: ${p} ÷ ${a}.`,
          promptVisual("Operations that undo", [{ tokens: [`${a}`, "×", "?", "=", `${p}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Which fact undoes ${a} × ${b} = ${p}?`,
          `${p} ÷ ${a} = ${b}`,
          [`${p} − ${a} = ${b}`, `${p} ÷ ${a} = ${b + 1}`],
          "Division splits the product back into equal groups.",
          promptVisual("Operations that undo", [{ tokens: [`${a}`, "×", `${b}`, "=", `${p}`] }]),
        );
      }
      return mcq(
        "Which operation undoes multiplication?",
        "Division",
        ["Addition", "Subtraction"],
        "Inverse operations reverse each other.",
      );
    }

    if (lessonNumber === 2) {
      // Turn Division Around — rewrite division as multiplication.
      if (role === "apply_create") {
        return typed(
          "Work out the quotient.",
          b,
          `Ask: ${a} times what makes ${p}?`,
          promptVisual("Turn division around", [{ tokens: [`${p}`, "÷", `${a}`, "=", "?"] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Which multiplication helps you work out ${p} ÷ ${a}?`,
          `${a} × ? = ${p}`,
          [`${a} + ? = ${p}`, `${p} × ? = ${a}`],
          "Turn the division into a matching multiplication.",
          promptVisual("Turn division around", [{ tokens: [`${p}`, "÷", `${a}`] }]),
        );
      }
      return mcq(
        `What is ${p} ÷ ${a}?`,
        b,
        [b + 1, b - 1, a],
        "Think: a times what makes the total?",
      );
    }

    // L3 Check with the Inverse.
    if (role === "apply_create") {
      return typed(
        "Find the missing factor, then check.",
        a,
        `Divide: ${p} ÷ ${b}.`,
        promptVisual("Check with the inverse", [{ tokens: ["?", "×", `${b}`, "=", `${p}`] }]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `How can you check ${p} ÷ ${a} = ${b} is right?`,
        `${b} × ${a} = ${p}`,
        [`${b} + ${a} = ${p}`, `${p} × ${a} = ${b}`],
        "Multiply the quotient by the divisor to get back the total.",
        promptVisual("Check with the inverse", [{ tokens: [`${p}`, "÷", `${a}`, "=", `${b}`], note: "Claim to check." }]),
      );
    }
    return mcq(
      `To check ${p} ÷ ${a} = ${b}, what should you multiply?`,
      `${b} × ${a}`,
      [`${b} + ${a}`, `${p} × ${a}`],
      "Multiply back to the total.",
    );
  }

  // Week 2 — Fact Families (AC9M5A01).
  if (week === 2) {
    const a = rand(3, 9);
    const b = rand(3, 9);
    const p = a * b;

    if (lessonNumber === 1) {
      // Four Connected Facts.
      if (role === "apply_create") {
        return typed(
          "Complete the fact family.",
          b,
          "The same three numbers make four facts.",
          promptVisual("Four connected facts", [{ tokens: [`${a}`, "×", "?", "=", `${p}`] }]),
        );
      }
      const array = { type: "array" as const, rows: a, columns: b };
      if (role === "reasoning") {
        return mcq(
          `Which fact does NOT belong to ${a} × ${b} = ${p}?`,
          `${a} + ${b} = ${p}`,
          [`${p} ÷ ${a} = ${b}`, `${b} × ${a} = ${p}`],
          "A family uses the same three numbers with × and ÷.",
          array,
        );
      }
      return mcq(
        "Which division fact matches this array?",
        `${p} ÷ ${a} = ${b}`,
        [`${p} ÷ ${a} = ${b + 1}`, `${a} ÷ ${b} = ${p}`],
        "Divide the total by one side.",
        array,
      );
    }

    if (lessonNumber === 2) {
      // Partition the Product — different equal groupings.
      const set = pick([
        { p: 24, shown: [4, 6], other: [3, 8], wrong: [5, 5] },
        { p: 36, shown: [6, 6], other: [4, 9], wrong: [5, 7] },
        { p: 48, shown: [6, 8], other: [4, 12], wrong: [5, 9] },
        { p: 30, shown: [5, 6], other: [3, 10], wrong: [4, 7] },
      ]);
      if (role === "apply_create") {
        return typed(
          "Complete another grouping.",
          set.other[1]!,
          `Find the missing factor for ${set.other[0]} × ? = ${set.p}.`,
          promptVisual("Partition the product", [{ tokens: [`${set.other[0]}`, "×", "?", "=", `${set.p}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Which is another way to make ${set.p}?`,
          `${set.other[0]} × ${set.other[1]}`,
          [`${set.wrong[0]} × ${set.wrong[1]}`, `${set.shown[0]} + ${set.shown[1]}`],
          "Look for a different pair with the same product.",
          promptVisual("Partition the product", [{ tokens: [`${set.shown[0]}`, "×", `${set.shown[1]}`, "=", `${set.p}`] }]),
        );
      }
      return mcq(
        `Which pair multiplies to ${set.p}?`,
        `${set.other[0]} × ${set.other[1]}`,
        [`${set.wrong[0]} × ${set.wrong[1]}`, `${set.shown[0]} + ${set.shown[0]}`],
        "Check the product of each pair.",
      );
    }

    // L3 Complete the Family.
    if (role === "apply_create") {
      return typed(
        "Complete the family.",
        a,
        "Use the same three numbers.",
        promptVisual("Complete the family", [{ tokens: [`${p}`, "÷", "?", "=", `${b}`] }]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `You know ${a} × ${b} = ${p}. Which fact completes the family?`,
        `${p} ÷ ${b} = ${a}`,
        [`${p} ÷ ${b} = ${a + 1}`, `${a} − ${b} = ${p}`],
        "Rearrange the same three numbers.",
        promptVisual("Complete the family", [{ tokens: [`${a}`, "×", `${b}`, "=", `${p}`] }]),
      );
    }
    return mcq(
      `Which fact is also in the family of ${a} × ${b} = ${p}?`,
      `${p} ÷ ${b} = ${a}`,
      [`${p} − ${b} = ${a}`, `${p} + ${a} = ${b}`],
      "A family uses the same three numbers with × and ÷.",
      promptVisual("Complete the family", [{ tokens: [`${a}`, "×", `${b}`, "=", `${p}`] }]),
    );
  }

  // Week 3 — Unknown Multiplicative Parts (AC9M5A01, AC9M5A02).
  if (week === 3) {
    const a = rand(4, 11);
    const b = rand(4, 11);
    const p = a * b;

    if (lessonNumber === 1) {
      // Unknown Products and Factors.
      if (role === "apply_create") {
        return typed(
          "Find the unknown factor.",
          b,
          "Divide to undo the multiplication.",
          promptVisual("Unknown factor", [{ tokens: [`${a}`, "×", "?", "=", `${p}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `In ${a} × ? = ${p}, which operation finds the unknown?`,
          `${p} ÷ ${a}`,
          [`${p} × ${a}`, `${p} − ${a}`],
          "Divide the product by the known factor.",
        );
      }
      return typed(
        "Find the missing product.",
        p,
        "Multiply the two factors.",
        promptVisual("Unknown product", [{ tokens: [`${a}`, "×", `${b}`, "=", "?"] }]),
      );
    }

    if (lessonNumber === 2) {
      // Unknown Dividends and Divisors.
      if (role === "apply_create") {
        return typed(
          "Find the unknown divisor.",
          b,
          `${p} ÷ ? = ${a} means ? × ${a} = ${p}.`,
          promptVisual("Unknown divisor", [{ tokens: [`${p}`, "÷", "?", "=", `${a}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `In ? ÷ ${b} = ${a}, how do you find the dividend?`,
          `${a} × ${b}`,
          [`${a} ÷ ${b}`, `${a} + ${b}`],
          "Multiply the quotient by the divisor.",
        );
      }
      return typed(
        "Find the missing dividend.",
        p,
        "Multiply back to the total.",
        promptVisual("Unknown dividend", [{ tokens: ["?", "÷", `${b}`, "=", `${a}`] }]),
      );
    }

    // L3 Large-Number Inverses — same small fact, scaled up.
    const tens = a * 10;
    const bigP = tens * b;
    if (role === "apply_create") {
      return typed(
        "Find the unknown factor.",
        b,
        `Use the small fact ${a} × ${b}, then scale.`,
        promptVisual("Large-number inverse", [{ tokens: [`${tens}`, "×", "?", "=", `${bigP}`] }]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `You know ${a} × ${b} = ${p}. What is ${tens} × ${b}?`,
        bigP,
        [p * 10 + b, p + tens, p * 2],
        "Ten times the factor gives ten times the product.",
        promptVisual("Scale the fact", [{ tokens: [`${a}`, "×", `${b}`, "=", `${p}`] }]),
      );
    }
    return typed(
      "Divide using the matching small fact.",
      b,
      `${bigP} ÷ ${tens} — think ${p} ÷ ${a}.`,
      promptVisual("Large-number inverse", [{ tokens: [`${bigP}`, "÷", `${tens}`, "=", "?"] }]),
    );
  }

  // Week 4 — Equivalent Multiplicative Equations (AC9M5A02).
  if (week === 4) {
    const a = rand(3, 9);
    const b = 2 * rand(2, 5); // even, so double/halve stays whole
    const p = a * b;

    if (lessonNumber === 1) {
      // Same Value, Different Form.
      if (role === "apply_create") {
        return typed(
          "Make both sides equal.",
          b,
          "The same factors in any order give the same product.",
          promptVisual("Same value", [{ tokens: [`${a}`, "×", `${b}`, "=", "?", "×", `${a}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Which expression has the same value as ${a} × ${b}?`,
          `${b} × ${a}`,
          [`${a} + ${b}`, `${a} × ${b + 1}`],
          "Reordering factors keeps the product.",
          promptVisual("Same value", [{ tokens: [`${a}`, "×", `${b}`] }]),
        );
      }
      return mcq(
        "Does changing the order of factors change the product?",
        "No",
        ["Yes", "Sometimes"],
        "Multiplication is commutative.",
      );
    }

    if (lessonNumber === 2) {
      // True or False Relationships.
      if (role === "apply_create") {
        return typed(
          "Find the value that makes both sides equal.",
          b,
          "Both sides must have the same product.",
          promptVisual("Make it true", [{ tokens: [`${a}`, "×", "?", "=", `${b}`, "×", `${a}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Which statement about ${a} × ${b} is true?`,
          `${a} × ${b} = ${a} × ${b - 1} + ${a}`,
          [`${a} × ${b} = ${a} × ${b - 1}`, `${a} × ${b} = ${a} × ${b - 1} − ${a}`],
          `${a} groups of ${b} is ${a} groups of ${b - 1}, plus one more ${a}.`,
          promptVisual("True or false?", [{ tokens: [`${a}`, "×", `${b}`] }]),
        );
      }
      return mcq(
        "Which statement is FALSE?",
        `${a} × ${b} = ${a} + ${b}`,
        [`${a} × ${b} = ${b} × ${a}`, `${a} × ${b} = ${p}`],
        "Check each one with the values.",
      );
    }

    // L3 Construct an Equivalent — double one factor, halve the other.
    if (role === "apply_create") {
      return typed(
        "Build an equivalent expression.",
        b / 2,
        `Double ${a} to ${a * 2}, so halve ${b}.`,
        promptVisual("Construct an equivalent", [{ tokens: [`${a}`, "×", `${b}`, "=", `${a * 2}`, "×", "?"] }]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `Which keeps the same value as ${a} × ${b}?`,
        `${a * 2} × ${b / 2}`,
        [`${a * 2} × ${b}`, `${a + 2} × ${b}`],
        "Double one factor, halve the other.",
        promptVisual("Construct an equivalent", [{ tokens: [`${a}`, "×", `${b}`] }]),
      );
    }
    return typed(
      "Calculate the missing factor.",
      b / 2,
      `The original product is ${p}. Doubling ${a} means the other factor must be halved to keep the product equal.`,
      promptVisual("Keep the product equal", [
        { label: "Original", tokens: [`${a}`, "×", `${b}`, "=", `${p}`] },
        { label: "Equivalent", tokens: [`${a * 2}`, "×", "?", "=", `${p}`] },
      ]),
    );
  }

  // Week 5 — Properties of Multiplication (AC9M5A02).
  if (week === 5) {
    if (lessonNumber === 1) {
      // Turn the Array — physically transpose the model and calculate what stays invariant.
      const a = rand(3, 8);
      const b = rand(3, 8);
      const product = a * b;
      const visual = { type: "array" as const, rows: a, columns: b, rotatable: true };
      if (role === "apply_create") {
        return typed(
          `Turn the array. Complete ${b} × ? = ${product}.`,
          a,
          "Turning swaps the rows and columns while keeping the total number of dots unchanged.",
          visual,
        );
      }
      if (role === "reasoning") {
        return typed(
          "Turn the array. How many rows does it have now?",
          b,
          "The original columns become the rows after the array is turned.",
          visual,
        );
      }
      return typed(
        "Turn the array. What product stays the same?",
        product,
        "Turning changes the arrangement, but it does not change the number of dots.",
        visual,
      );
    }

    if (lessonNumber === 2) {
      // Regroup Three Factors — calculate both bracketed paths instead of judging a preferred strategy.
      const trio = pick([
        [2, 7, 5],
        [4, 7, 5],
        [3, 8, 5],
        [4, 6, 5],
        [2, 9, 6],
        [6, 4, 5],
        [3, 7, 6],
      ]);
      const [x, y, z] = trio as [number, number, number];
      const answer = x * y * z;
      if (role === "apply_create") {
        return typed(
          "Calculate the full product.",
          answer,
          "Work inside the brackets first, then multiply by the remaining factor.",
          promptVisual("Regroup three factors", [{ tokens: [`(${x}`, "×", `${y})`, "×", `${z}`, "=", "?"] }]),
        );
      }
      if (role === "reasoning") {
        return typed(
          "Calculate the value inside the brackets.",
          y * z,
          "Multiply the two factors inside the brackets and enter that subtotal.",
          promptVisual("Group the last two factors", [{ tokens: [`${x}`, "×", `(${y}`, "×", `${z})`, "=", `${x}`, "×", "?"] }]),
        );
      }
      return typed(
        "Calculate the value inside the brackets.",
        x * y,
        "Multiply the two factors inside the brackets and enter that subtotal.",
        promptVisual("Group the first two factors", [{ tokens: [`(${x}`, "×", `${y})`, "×", `${z}`, "=", "?", "×", `${z}`] }]),
      );
    }

    // L3 Why Division Is Different — calculate both paths and compare their values.
    const m = rand(2, 4);
    const n = m * rand(2, 3);
    const leftAnswer = rand(2, 5);
    const start = n * m * leftAnswer;
    const rightAnswer = start / (n / m);
    if (role === "apply_create") {
      return typed(
        "Calculate the left-grouped division.",
        leftAnswer,
        "Work inside the left-hand brackets first, then divide that result by the final divisor.",
        promptVisual("Divide in two steps", [{ tokens: [`(${start}`, "÷", `${n})`, "÷", `${m}`, "=", "?"] }]),
      );
    }
    if (role === "reasoning") {
      return typed(
        "Calculate the right-grouped division.",
        rightAnswer,
        "Work inside the right-hand brackets first, then divide the starting number by that result.",
        promptVisual("Divide inside the brackets first", [{ tokens: [`${start}`, "÷", `(${n}`, "÷", `${m})`, "=", "?"] }]),
      );
    }
    return typed(
      "How much larger is the right-grouped result?",
      rightAnswer - leftAnswer,
      "Subtract the smaller displayed result from the larger one. Different results show that division cannot be regrouped like multiplication.",
      promptVisual("Compare the grouped results", [
        { label: "Left grouped", tokens: [`(${start}`, "÷", `${n})`, "÷", `${m}`, "=", `${leftAnswer}`] },
        { label: "Right grouped", tokens: [`${start}`, "÷", `(${n}`, "÷", `${m})`, "=", `${rightAnswer}`] },
        { label: "Difference", tokens: [`${rightAnswer}`, "−", `${leftAnswer}`, "=", "?"] },
      ]),
    );
  }

  // Week 6 — Distributive Reasoning (AC9M5A02).
  if (week === 6) {
    const f = rand(3, 8);
    const c = rand(2, 6);
    const target = 10 + c;
    const total = f * target;

    if (lessonNumber === 1) {
      // Split an Array.
      const splitArray = { type: "array" as const, rows: f, columns: target, splitAfterColumns: 10 };
      if (role === "apply_create") {
        return typed(
          "Find the total number of dots in the split array.",
          total,
          "Tap each coloured part, calculate both partial products, then add them.",
          splitArray,
        );
      }
      if (role === "reasoning") {
        return typed(
          "How many dots are in the violet section?",
          f * c,
          "Tap the violet section, then multiply its rows by its columns.",
          splitArray,
        );
      }
      return typed(
        "How many dots are in the teal section?",
        f * 10,
        "Tap the teal section, then multiply its rows by its columns.",
        splitArray,
      );
    }

    if (lessonNumber === 2) {
      // Build from Friendly Numbers.
      if (role === "apply_create") {
        return typed(
          "Use the ten fact to finish.",
          total,
          `Add ${f} × ${c} to ${f * 10}.`,
          promptVisual("Build from friendly numbers", [
            { label: "You know", tokens: [`${f}`, "×", "10", "=", `${f * 10}`] },
            { label: "Now find", tokens: [`${f}`, "×", `${target}`, "=", "?"] },
          ]),
        );
      }
      if (role === "reasoning") {
        return typed(
          `How much must be added to ${f} × 10 to make ${f} × ${target}?`,
          f * c,
          "Multiply the extra columns by the shared factor.",
          promptVisual("Build from friendly numbers", [
            { label: "Friendly fact", tokens: [`${f}`, "×", "10", "=", `${f * 10}`] },
            { label: "Extra part", tokens: [`${f}`, "×", `${c}`, "=", "?"] },
          ]),
        );
      }
      return typed(
        "Calculate the friendly ten fact.",
        f * 10,
        "Multiply the shared factor by 10 before adding the extra part.",
        promptVisual("Start with a friendly fact", [{ tokens: [`${f}`, "×", "10", "=", "?"] }]),
      );
    }

    // L3 Find the Hidden Factor.
    if (role === "apply_create") {
      return typed(
        "Find the missing part.",
        c,
        `Undo the known part: ${total} − ${f * 10}, then divide by ${f}.`,
        promptVisual("Find the hidden factor", [
          { tokens: [`${f}`, "×", "10", "+", `${f}`, "×", "?", "=", `${total}`] },
        ]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `? × 10 + ? × ${c} = ${total}, and both ? are equal. What is the hidden factor?`,
        f,
        [f + 1, f - 1],
        "The factor is shared by both parts.",
      );
    }
    return mcq(
      `In ${f} × 10 + ${f} × ${c}, what is the shared factor?`,
      f,
      [10, c !== f ? c : c + 1],
      "The factor sits outside both parts.",
    );
  }

  // Week 7 — Factors, Multiples and Constraints (AC9M5A02).
  if (week === 7) {
    if (lessonNumber === 1) {
      // Use Factor Clues.
      const set = pick([
        { n: 36, factors: [2, 3, 4, 6, 9, 12, 18], pairs: [[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]] },
        { n: 40, factors: [2, 4, 5, 8, 10, 20], pairs: [[1, 40], [2, 20], [4, 10], [5, 8]] },
        { n: 48, factors: [2, 3, 4, 6, 8, 12, 16, 24], pairs: [[1, 48], [2, 24], [3, 16], [4, 12], [6, 8]] },
        { n: 60, factors: [2, 3, 4, 5, 6, 10, 12, 15, 20, 30], pairs: [[1, 60], [2, 30], [3, 20], [4, 15], [5, 12], [6, 10]] },
      ]);
      const aFactor = pick(set.factors);
      const partner = set.n / aFactor;
      if (role === "apply_create") {
        const missingIndex = rand(0, set.pairs.length - 1);
        const missingPair = set.pairs[missingIndex]!;
        const tree: FactorPairTreeVisualData = {
          type: "factor_pair_tree",
          title: "Complete the factor-pair tree",
          product: set.n,
          pairs: set.pairs.map(([left, right], index) => ({
            left: String(left),
            right: index === missingIndex ? "?" : String(right),
          })),
        };
        return typed(
          `Complete the missing factor pair for ${set.n}.`,
          missingPair[1]!,
          `Every branch must multiply to make ${set.n}. Use the known factor on the incomplete branch.`,
          tree,
        );
      }
      if (role === "reasoning") {
        return typed(
          "Find the missing factor partner.",
          partner,
          `Find the whole number that multiplies by ${aFactor} to make ${set.n}.`,
          unknownVisual("Build a factor pair", `${aFactor} × □`, `${set.n}`),
        );
      }
      return typed(
        "Use exact division to find the quotient.",
        partner,
        "A whole-number quotient with no remainder confirms a factor pair.",
        promptVisual("Factor scanner", [
          { label: "Exact division check", tokens: [`${set.n}`, "÷", `${aFactor}`, "=", "?"] },
          { label: "Remainder", tokens: ["0", "✓"] },
        ]),
      );
    }

    if (lessonNumber === 2) {
      // Use Multiple Clues — combine constraints.
      const factor = pick([4, 6, 7, 8, 9]);
      const k = rand(5, 12);
      const target = factor * k;
      const hi = target + factor;
      if (role === "apply_create") {
        const smallest = factor * (Math.floor(target / factor) + 1);
        return typed(
          `Type the smallest multiple of ${factor} greater than ${target}.`,
          smallest,
          `Count up in ${factor}s from ${target}.`,
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Which value is a multiple of ${factor} AND less than ${hi}?`,
          target,
          [hi, target - 1],
          "Both clues must be true.",
        );
      }
      return mcq(
        `Which is a multiple of ${factor}?`,
        target,
        [target + 1, target - 1],
        `It is in the ${factor} times table.`,
      );
    }

    // L3 Find All Solutions.
    const set = pick([
      { n: 24, pairs: [[1, 24], [2, 12], [3, 8], [4, 6]] },
      { n: 36, pairs: [[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]] },
      { n: 48, pairs: [[1, 48], [2, 24], [3, 16], [4, 12], [6, 8]] },
      { n: 60, pairs: [[1, 60], [2, 30], [3, 20], [4, 15], [5, 12], [6, 10]] },
    ]);
    const count = set.pairs.length;
    if (role === "apply_create") {
      return typed(
        `How many factor pairs does ${set.n} have?`,
        count,
        "Follow the branches in order. Stop when the two factors meet or cross.",
        {
          type: "factor_pair_tree",
          title: "Count every factor-pair branch",
          product: set.n,
          pairs: set.pairs.map(([left, right]) => ({ left: String(left), right: String(right) })),
        },
      );
    }
    const missingIndex = rand(0, set.pairs.length - 1);
    const missingPair = set.pairs[missingIndex]!;
    const hideRight = role === "reasoning";
    return typed(
      hideRight ? "Complete the missing factor partner." : "Complete the missing factor-pair branch.",
      hideRight ? missingPair[1]! : missingPair[0]!,
      `Use the visible factor and the product ${set.n}. Every completed branch must multiply to ${set.n}.`,
      {
        type: "factor_pair_tree",
        title: "Find every solution",
        product: set.n,
        pairs: set.pairs.map(([left, right], index) => ({
          left: index === missingIndex && !hideRight ? "?" : String(left),
          right: index === missingIndex && hideRight ? "?" : String(right),
        })),
      },
    );
  }

  // Week 8 — Multiplicative Mystery (AC9M5A01, AC9M5A02): integrate inverse,
  // property and equivalence reasoning across a connected investigation.
  if (week === 8) {
    const a = rand(4, 10);
    const b = rand(4, 10);
    const p = a * b;

    if (lessonNumber === 1) {
      // Analyse the Evidence — reconstruct a missing value from the fact family.
      if (role === "apply_create") {
        return typed(
          "Reconstruct the missing factor.",
          b,
          `Use the fact family: ${p} ÷ ${a}.`,
          promptVisual("Analyse the evidence", [{ tokens: [`${a}`, "×", "?", "=", `${p}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Which fact recovers the missing factor in ${a} × ? = ${p}?`,
          `${p} ÷ ${a}`,
          [`${p} × ${a}`, `${p} − ${a}`],
          "Divide to recover the factor.",
        );
      }
      return mcq(
        `The array holds ${p} counters in ${a} rows. How many columns?`,
        b,
        [b + 1, b - 1, a],
        "Divide the total by the rows.",
        { type: "array" as const, rows: a, columns: b },
      );
    }

    if (lessonNumber === 2) {
      // Solve the Connected Equations — the first result feeds the second.
      const m = rand(4, 9);
      const second = b * m;
      // Card 1 is already solved (only card 2 holds the "?" the student types).
      const chain = promptVisual("Connected equations", [
        { label: "First (solved)", tokens: [`${a}`, "×", `${b}`, "=", `${p}`] },
        { label: "Second", tokens: [`${b}`, "×", "?", "=", `${second}`] },
      ]);
      if (role === "apply_create") {
        return typed(
          "Solve the second equation.",
          m,
          `The first equation gives ${b}; now divide ${second} ÷ ${b}.`,
          chain,
        );
      }
      if (role === "reasoning") {
        return mcq(
          "Why solve the first equation first?",
          "Its answer is the factor in the next equation",
          ["It uses the biggest numbers", "It is a division"],
          "Each solved unknown feeds the next.",
        );
      }
      return typed(
        "Find the first factor.",
        b,
        `Divide ${p} ÷ ${a} to start the chain.`,
        promptVisual("Connected equations", [{ tokens: [`${a}`, "×", "?", "=", `${p}`] }]),
      );
    }

    // L3 Expose the Flawed Argument — repair a distributive error with concise calculations.
    const extraColumns = rand(2, 4);
    const target = b + extraColumns;
    const extraProduct = a * extraColumns;
    const correctTotal = a * target;
    if (role === "apply_create") {
      return typed(
        "Fix the total.",
        correctTotal,
        "Multiply the outside factor by both parts, then add.",
        promptVisual("Expose the flaw", [
          { label: "Incorrect", tokens: [`${a}`, "×", `(${b}`, "+", `${extraColumns})`, "=", `${p}`, "+", `${extraColumns}`] },
          { label: "Correct", tokens: [`${a}`, "×", `(${b}`, "+", `${extraColumns})`, "=", "?"] },
        ]),
      );
    }
    if (role === "reasoning") {
      return typed(
        "Find the missing partial product.",
        extraProduct,
        `Multiply ${a} by the extra ${extraColumns} columns.`,
        promptVisual("Repair the split", [
          { tokens: [`${a}`, "×", `(${b}`, "+", `${extraColumns})`, "=", `${a}`, "×", `${b}`, "+", "?"] },
        ]),
      );
    }
    return typed(
      `What should replace + ${extraColumns}?`,
      extraProduct,
      `The outside factor ${a} must multiply the extra part too.`,
      promptVisual("Replace the incorrect term", [
        { label: "Incorrect", tokens: [`${p}`, "+", `${extraColumns}`] },
        { label: "Correct", tokens: [`${p}`, "+", "?"] },
      ]),
    );
  }

  return year5Question(lessonNumber === 1 ? 2 : lessonNumber === 2 ? 6 : 7, lessonNumber, role);
}

function year6Question(week: number, lessonNumber: number, role: RotationRole): Year2QuestionData {
  // Level 6 pattern (same house rules as Level 5): short prompts, the card
  // carries the maths, the "?" is the typed answer box, cards never reveal the
  // answer, and each week's three lessons are differentiated (see level6Seeds).
  // Value questions are typed; concept questions are multiple choice with no
  // "?" card.

  // Week 1 — Visually Growing Patterns (AC9M6A01).
  if (week === 1) {
    const growth = rand(3, 6);
    const start = rand(1, 4);
    const counts = [start, start + growth, start + growth * 2, start + growth * 3];
    const nextCount = start + growth * 4;
    const laterStage = rand(10, 18);
    const laterCount = start + growth * (laterStage - 1);
    const tiles = growingVisual("Growing pattern", counts, "tiles");

    if (lessonNumber === 1) {
      // Build the Next Stage.
      if (role === "apply_create") {
        return typed("How many tiles in the next stage?", nextCount, "Add the same amount one more time.", tiles);
      }
      if (role === "reasoning") {
        return mcq(
          "What is the same from each stage to the next?",
          `It adds ${growth}`,
          ["It doubles", "It adds a different amount each time"],
          "Compare each stage with the one before it.",
          tiles,
        );
      }
      return mcq(
        "How many tiles are added each stage?",
        growth,
        [growth + 1, growth - 1, growth * 2],
        "Look at the jump between two stages.",
        tiles,
      );
    }

    if (lessonNumber === 2) {
      // From Picture to Table.
      const pairs: Array<[number | string, number | string]> = [
        [1, counts[0]!], [2, counts[1]!], [3, counts[2]!], [4, counts[3]!],
      ];
      if (role === "apply_create") {
        return typed(
          "Complete the table for Stage 5.",
          nextCount,
          "Keep adding the same step down the table.",
          tableVisual("Picture to table", [...pairs, [5, "?"]]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          "As the stage goes up by 1, the count goes up by...?",
          `${growth}`,
          [`${start}`, "double", `${growth + 1}`],
          "Read down the count column.",
          tableVisual("Picture to table", pairs),
        );
      }
      return mcq(
        `Which stage has ${counts[2]} tiles?`,
        "3",
        ["2", "4"],
        "Find that count in the table.",
        tableVisual("Picture to table", pairs),
      );
    }

    // L3 State and Use the Rule (predict a non-consecutive stage).
    if (role === "apply_create") {
      return typed(
        `How many tiles at Stage ${laterStage}?`,
        laterCount,
        `Rule: start at ${start}, add ${growth} each stage.`,
        tiles,
      );
    }
    if (role === "reasoning") {
      return mcq(
        "Which rule gives the count at any stage?",
        `Start at ${start}, add ${growth} each stage`,
        [`Multiply the stage by ${growth}`, `Add ${growth} to the stage`],
        "Test it on Stage 2 and Stage 3.",
        tiles,
      );
    }
    return mcq(
      `The pattern adds ${growth} each stage. How much does the count grow over 2 stages?`,
      growth * 2,
      [growth, growth * 3],
      `Two stages means two lots of ${growth}.`,
      tiles,
    );
  }

  // Week 2 — Rational Number Patterns (AC9M6A01).
  if (week === 2) {
    if (lessonNumber === 1) {
      // Fraction Sequences — real fractions (whole-number numerator answer).
      const den = pick([4, 5, 6, 8, 10, 12]);
      const s = rand(2, 6);
      const terms = [s, s + 1, s + 2, s + 3, s + 4].map((n) => `${n}/${den}`);
      if (role === "apply_create") {
        return typed(
          `The next fraction is ?/${den}. Type the missing numerator.`,
          s + 5,
          "Look at how the top number changes each step.",
          sequenceVisual("Fraction sequence", terms),
        );
      }
      if (role === "reasoning") {
        return mcq(
          "What is added each step?",
          `1/${den}`,
          [`${den}/1`, `2/${den}`, `1/${den + 1}`],
          "Compare two neighbouring fractions.",
          sequenceVisual("Fraction sequence", terms),
        );
      }
      return mcq(
        "Which is the largest fraction shown?",
        `${s + 4}/${den}`,
        [`${s}/${den}`, `${s + 2}/${den}`],
        "The biggest top number makes the largest fraction.",
        sequenceVisual("Fraction sequence", terms),
      );
    }

    // L2 Decimal Sequences (missing middle term) and L3 Reverse the Pattern.
    const reverse = lessonNumber === 3;
    const step = pick([0.4, 0.6, 0.75, 1.2, 1.25]);
    const start = pick([1.5, 2.4, 3.6, 0.8, 2.5]);
    const t = [0, 1, 2, 3, 4].map((i) => Number((start + step * i).toFixed(2)));
    const show = t.map((v) => `${v}`);

    if (reverse) {
      // Reverse the Pattern — recover an earlier term by reasoning backwards.
      if (role === "apply_create") {
        return typed(
          "Type the starting term.",
          t[0]!.toFixed(2),
          "Work out the step, then step back from the first number.",
          sequenceVisual("Reverse the sequence", ["?", show[1]!, show[2]!, show[3]!, show[4]!]),
          [String(t[0]), t[0]!.toFixed(2)],
        );
      }
      if (role === "reasoning") {
        return mcq(
          `What number comes just before ${t[1]}?`,
          `${t[0]}`,
          [`${t[2]}`, `${t[3]}`],
          "Step back once from the first number shown.",
          sequenceVisual("Reverse the sequence", [show[1]!, show[2]!, show[3]!, show[4]!]),
        );
      }
      return mcq(
        "How much does each step add?",
        `${step}`,
        [`${Number((step * 2).toFixed(2))}`, `${Number((step / 2).toFixed(2))}`],
        "Subtract one term from the next.",
        sequenceVisual("Reverse the sequence", show),
      );
    }

    // L2 Decimal Sequences (missing middle term).
    if (role === "apply_create") {
      return typed(
        "Type the missing term.",
        t[2]!.toFixed(2),
        "Work out the step from two terms you can see, then fill the gap.",
        sequenceVisual("Decimal sequence", [show[0]!, show[1]!, "?", show[3]!, show[4]!]),
        [String(t[2]), t[2]!.toFixed(2)],
      );
    }
    if (role === "reasoning") {
      return mcq(
        "Each term goes up by the same amount. What is it?",
        `${step}`,
        [`${Number((step * 2).toFixed(2))}`, `${Number((step / 2).toFixed(2))}`],
        "Subtract one term from the next.",
        sequenceVisual("Decimal sequence", show),
      );
    }
    return mcq(
      "Which is the largest term shown?",
      `${t[4]}`,
      [`${t[0]}`, `${t[2]}`],
      "The terms increase from left to right.",
      sequenceVisual("Decimal sequence", show),
    );
  }

  // Week 3 — Rules Across Representations (AC9M6A01, AC9M6A03).
  if (week === 3) {
    const mult = rand(2, 5);
    const add = rand(4, 14);
    const rule = (x: number) => x * mult + add;
    const pairs: Array<[number | string, number | string]> = [
      [1, rule(1)], [2, rule(2)], [3, rule(3)],
    ];

    if (lessonNumber === 1) {
      // Match Pattern, Table and Rule.
      if (role === "apply_create") {
        return typed(
          `Rule: × ${mult} then + ${add}. Fill in Stage 10.`,
          rule(10),
          "Put 10 through both steps in order.",
          tableVisual("Match the rule", [...pairs, [10, "?"]]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          "Which rule matches the table?",
          `× ${mult}, then + ${add}`,
          [`+ ${add}, then × ${mult}`, `× ${mult}, then − ${add}`],
          "Test it against two rows.",
          tableVisual("Match the rule", pairs),
        );
      }
      return mcq(
        `Using × ${mult} then + ${add}, what is the output for 5?`,
        rule(5),
        [`${5 * mult}`, `${rule(5) + add}`],
        `Multiply by ${mult}, then add ${add}.`,
        tableVisual("Match the rule", pairs),
      );
    }

    if (lessonNumber === 2) {
      // Compare Growth — additive vs multiplicative.
      const s = rand(2, 4);
      if (role === "apply_create") {
        return typed(
          `A pattern multiplies by ${mult} each step from ${s}. Type step 3.`,
          s * mult * mult,
          "Multiply, then multiply again.",
          sequenceVisual("Multiplying growth", [`${s}`, `${s * mult}`, "?"]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Adding ${add} each step from ${s}: ${s}, ${s + add}, ... What comes next?`,
          s + 2 * add,
          [s + 3 * add, s + add],
          `Add ${add} once more.`,
          sequenceVisual("Adding growth", [`${s}`, `${s + add}`]),
        );
      }
      return mcq(
        `Multiplying by ${mult} from ${s}: ${s}, ${s * mult}, ${s * mult * mult}, ... What comes next?`,
        s * mult * mult * mult,
        [s * mult * mult + mult, s * mult * mult + 1],
        `Multiply by ${mult} once more.`,
        sequenceVisual("Multiplying growth", [`${s}`, `${s * mult}`, `${s * mult * mult}`]),
      );
    }

    // L3 Transfer the Rule (same rule, new representation).
    const input = rand(6, 12);
    if (role === "apply_create") {
      return typed(
        `Rule: × ${mult} then + ${add}. Output for ${input}?`,
        rule(input),
        "The rule works the same in a table.",
        tableVisual("Transfer the rule", [[input, "?"]]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `Apply × ${mult} then + ${add} to ${input + 3}.`,
        rule(input + 3),
        [`${(input + 3) * mult}`, `${rule(input + 3) + add}`],
        `Multiply by ${mult}, then add ${add}.`,
      );
    }
    return mcq(
      `Which shows the same rule as × ${mult} then + ${add}?`,
      `input × ${mult} + ${add}`,
      [`input + ${mult} × ${add}`, `(input + ${mult}) × ${add}`],
      "Match both the operations and their order.",
    );
  }

  // Week 4 — Function Machines and Algorithms (AC9M6A03).
  if (week === 4) {
    const mult = rand(4, 9);
    const add = rand(6, 20);
    const rule = (x: number) => x * mult + add;

    const ruleLabel = `× ${mult}, then + ${add}`;

    if (lessonNumber === 1) {
      // Follow a Multi-Step Machine.
      const input = rand(8, 20);
      if (role === "apply_create") {
        return typed(
          "Run the machine.",
          rule(input),
          "Multiply first, then add.",
          machineVisual("Multi-step machine", input, ruleLabel, "?"),
        );
      }
      if (role === "reasoning") {
        return mcq(
          "Which step happens first?",
          `× ${mult}`,
          [`+ ${add}`, "either order"],
          "Follow the steps in the order written.",
          machineVisual("Multi-step machine", input, ruleLabel, rule(input)),
        );
      }
      const fastIn = rand(5, 9);
      return typed(
        "Run the machine.",
        rule(fastIn),
        "Multiply first, then add.",
        machineVisual("Multi-step machine", fastIn, ruleLabel, "?"),
      );
    }

    if (lessonNumber === 2) {
      // Discover the Algorithm — read the input/output table, find the rule.
      const pairs: Array<[number | string, number | string]> = [
        [2, rule(2)], [3, rule(3)], [4, rule(4)],
      ];
      const ruleReveal = `The rule is × ${mult} then + ${add}.`;
      if (role === "apply_create") {
        return typed(
          "Work out the rule, then fill in for 7.",
          rule(7),
          "Find what turns each input into its output.",
          tableVisual("Discover the rule", [...pairs, [7, "?"]]),
          undefined,
          ruleReveal,
        );
      }
      if (role === "reasoning") {
        return mcq(
          "Which rule fits the table?",
          `× ${mult}, then + ${add}`,
          [`+ ${mult + add}`, `× ${mult + 1}`],
          "A good rule works on every row.",
          tableVisual("Discover the rule", pairs),
          ruleReveal,
        );
      }
      return typed(
        "Work out the rule, then fill in for 6.",
        rule(6),
        "Find what turns each input into its output.",
        tableVisual("Discover the rule", [[2, rule(2)], [3, rule(3)], [4, rule(4)], [6, "?"]]),
        undefined,
        ruleReveal,
      );
    }

    // L3 Create and Test a Machine (edge cases).
    if (role === "apply_create") {
      return typed(
        "Test your machine on 0.",
        add,
        `Multiply first: ${mult} × 0 = 0, then add ${add}.`,
        machineVisual("Test on 0", 0, ruleLabel, "?"),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `Why does input 0 give ${add}?`,
        `${mult} × 0 = 0, then + ${add}`,
        ["0 skips the × step", "0 always gives 0"],
        "Follow both steps on 0.",
        machineVisual("Test on 0", 0, ruleLabel, add),
      );
    }
    const edge = rand(6, 11);
    return typed(
      `Test your machine on ${edge}.`,
      rule(edge),
      "Multiply first, then add.",
      machineVisual(`Test on ${edge}`, edge, ruleLabel, "?"),
    );
  }

  // Week 5 — Brackets and Operation Order (AC9M6A02).
  if (week === 5) {
    const a = rand(6, 15);
    const b = rand(4, 12);
    const c = rand(3, 8);
    const bracketed = (a + b) * c;

    if (lessonNumber === 1) {
      // Why Brackets Matter.
      if (role === "apply_create") {
        return typed(
          `Work out (${a} + ${b}) × ${c}.`,
          bracketed,
          "Do the brackets first.",
          promptVisual("Brackets first", [{ tokens: ["(", `${a}`, "+", `${b}`, ")", "×", `${c}`, "=", "?"] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Why do (${a} + ${b}) × ${c} and ${a} + ${b} × ${c} differ?`,
          "The brackets make the addition happen first",
          ["Brackets are just decoration", "One of them skips the ×"],
          "Brackets change which operation you do first.",
        );
      }
      return mcq(
        `In (${a} + ${b}) × ${c}, what do you do first?`,
        `${a} + ${b}`,
        [`${b} × ${c}`, `${a} + ${b} + ${c}`],
        "Whatever is inside the brackets.",
      );
    }

    if (lessonNumber === 2) {
      // Place the Brackets (insert brackets to hit a target).
      if (role === "apply_create") {
        return typed(
          "What value belongs inside the brackets?",
          a + b,
          `Divide ${bracketed} by ${c}.`,
          promptVisual("Place the brackets", [{ tokens: ["(", "?", ")", "×", `${c}`, "=", `${bracketed}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Where do the brackets go to reach ${bracketed}?`,
          `(${a} + ${b}) × ${c}`,
          [`${a} + (${b} × ${c})`, `(${a} × ${b}) + ${c}`],
          "Group so the addition happens first.",
        );
      }
      return mcq(
        `Without brackets, ${a} + ${b} × ${c} = ?`,
        a + b * c,
        [`${(a + b) * c}`, `${b * c}`],
        `Do ${b} × ${c} first, then add ${a}.`,
      );
    }

    // L3 Construct an Equivalent Expression (evaluate a distributed form).
    if (role === "apply_create") {
      return typed(
        "Work out this equivalent expression.",
        bracketed,
        "Add the two products.",
        promptVisual("Equivalent expression", [{ tokens: [`${c}`, "×", `${a}`, "+", `${c}`, "×", `${b}`, "=", "?"] }]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `Which is equivalent to (${a} + ${b}) × ${c}?`,
        `${c} × ${a} + ${c} × ${b}`,
        [`${c} × ${a} + ${b}`, `${a} + ${c} × ${b}`],
        `Multiply ${c} by each part inside the brackets.`,
      );
    }
    return mcq(
      `What is ${c} × ${a}?`,
      c * a,
      [`${c * a + c}`, `${c * a - c}`],
      "This is one of the two products you add.",
    );
  }

  // Week 6 — Complex Unknowns (AC9M6A02).
  if (week === 6) {
    const mult = rand(3, 8);
    const add = rand(4, 15);
    const unknown = rand(5, 25);
    const total = (unknown + add) * mult;

    if (lessonNumber === 1) {
      // Unknown Inside the Brackets.
      if (role === "apply_create") {
        return typed(
          "Find the unknown.",
          unknown,
          `Divide ${total} by ${mult}, then subtract ${add}.`,
          promptVisual("Unknown in brackets", [{ tokens: ["(", "?", "+", `${add}`, ")", "×", `${mult}`, "=", `${total}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `In (? + ${add}) × ${mult} = ${total}, which do you undo first?`,
          `Divide by ${mult}`,
          [`Subtract ${add}`, `Multiply by ${mult}`],
          "Undo the outer operation first.",
        );
      }
      return mcq(
        `To undo × ${mult}, you...?`,
        `divide by ${mult}`,
        [`multiply by ${mult}`, `subtract ${mult}`],
        "Division reverses multiplication.",
      );
    }

    if (lessonNumber === 2) {
      // Unknown on Either Side.
      if (role === "apply_create") {
        return typed(
          "Find the unknown.",
          unknown,
          `Divide ${total} by ${mult}, then subtract ${add}.`,
          promptVisual("Unknown on the right", [{ tokens: [`${total}`, "=", `${mult}`, "×", "(", "?", "+", `${add}`, ")"] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          "Does it matter which side the unknown is on?",
          "No, you solve it the same way",
          ["Yes, the right side can't be solved", "Yes, you add instead"],
          "An equation balances both ways.",
        );
      }
      return mcq(
        `What is ${total} ÷ ${mult}?`,
        total / mult,
        [`${total - mult}`, `${total + mult}`],
        "Dividing undoes the outer × first.",
      );
    }

    // L3 Find Pairs of Unknowns.
    const target = rand(15, 35);
    const x = rand(3, target - 3);
    if (role === "apply_create") {
      return typed(
        "Find the second number.",
        target - x,
        `Subtract ${x} from ${target}.`,
        promptVisual("Pairs that fit", [{ tokens: [`${x}`, "+", "?", "=", `${target}`] }]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `How many whole-number pairs (each at least 1) make ? + ? = ${target}?`,
        target - 1,
        [target, target + 1, 1],
        "List them: (1, ...), (2, ...) and so on.",
      );
    }
    return mcq(
      `Which pair adds to ${target}?`,
      `${x} + ${target - x}`,
      [`${x} + ${target - x + 1}`, `${target} + ${x}`],
      `The two numbers must total ${target}.`,
    );
  }

  // Week 7 — Algorithms with Decisions (AC9M6A03): decisions on divisibility.
  if (week === 7) {
    const d = pick([3, 4, 6, 9]);

    if (lessonNumber === 1) {
      // Follow the Decision Path.
      const input = pick([d * rand(4, 12), d * rand(4, 12) + 1]);
      const divisible = input % d === 0;
      const output = divisible ? input / d : input - 1;
      if (role === "apply_create") {
        return typed(
          `What does the algorithm output for ${input}?`,
          output,
          `Is ${input} a multiple of ${d}?`,
          promptVisual("Decision algorithm", [
            { tokens: [`${input}`, "→", "?"], note: `If a multiple of ${d}: ÷ ${d}. Otherwise: − 1.` },
          ]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Which branch does ${input} take?`,
          divisible ? `Divide by ${d}` : "Subtract 1",
          [divisible ? "Subtract 1" : `Divide by ${d}`, "Stop straight away"],
          `Check if ${input} is a multiple of ${d}.`,
        );
      }
      return mcq(
        `Is ${input} a multiple of ${d}?`,
        divisible ? "Yes" : "No",
        [divisible ? "No" : "Yes", "Cannot tell"],
        `A multiple of ${d} divides by ${d} with nothing left over.`,
      );
    }

    if (lessonNumber === 2) {
      // Debug the Algorithm.
      const multiple = d * rand(5, 12);
      const correct = multiple / d;
      const wrong = multiple - 1;
      if (role === "apply_create") {
        return typed(
          "Fix the bug. What is the correct output?",
          correct,
          `${multiple} is a multiple of ${d}, so divide by ${d}.`,
          promptVisual("Debug the algorithm", [
            { tokens: [`${multiple}`, "→", "?"], note: `Rule: multiples of ${d} are divided by ${d}. A bug gave ${wrong}.` },
          ]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `The algorithm output ${wrong} for ${multiple}. What went wrong?`,
          "It took the wrong branch",
          ["The input was wrong", "Nothing went wrong"],
          `${multiple} is a multiple of ${d}, so it should divide.`,
        );
      }
      return mcq(
        `Is ${multiple} a multiple of ${d}?`,
        "Yes",
        ["No", "Cannot tell"],
        `${multiple} ÷ ${d} leaves no remainder.`,
      );
    }

    // L3 Design a Number Generator.
    const k = rand(5, 10);
    if (role === "apply_create") {
      return typed(
        "The generator lists multiples. Type the next number.",
        d * (k + 1),
        `It counts up in ${d}s.`,
        sequenceVisual("Number generator", [`${d}`, `${d * 2}`, `${d * k}`, "?"]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `A generator adds ${d} each time. What set does it make?`,
        `Multiples of ${d}`,
        [`Factors of ${d}`, "Odd numbers"],
        `Adding ${d} repeatedly lists its multiples.`,
      );
    }
    const sample = d * rand(6, 14);
    return mcq(
      `Which number is a multiple of ${d}?`,
      sample,
      [`${sample + 1}`, `${sample - 1}`],
      `A multiple of ${d} is in its times table.`,
    );
  }

  // Week 8 — Pattern Peaks Summit (AC9M6A01, A02, A03): integrate growing
  // patterns, bracketed unknowns and algorithms in one investigation.
  if (week === 8) {
    const growth = rand(3, 6);
    const start = rand(1, 3);
    const counts = [start, start + growth, start + growth * 2, start + growth * 3];
    const tiles = growingVisual("Growing structure", counts, "tiles");

    if (lessonNumber === 1) {
      // Model the Growing Structure.
      const stage = rand(10, 16);
      const count = start + growth * (stage - 1);
      if (role === "apply_create") {
        return typed(
          `How many tiles at Stage ${stage}?`,
          count,
          `Rule: start ${start}, add ${growth} each stage.`,
          tiles,
        );
      }
      if (role === "reasoning") {
        return mcq(
          "Which rule models the structure?",
          `Start ${start}, add ${growth} each stage`,
          [`Multiply the stage by ${growth}`, `Add ${stage} each stage`],
          "Test it on two stages.",
          tiles,
        );
      }
      return mcq(
        `The structure adds ${growth} each stage. How much does the count grow over 3 stages?`,
        growth * 3,
        [growth, growth * 2],
        `Three stages means three lots of ${growth}.`,
        tiles,
      );
    }

    if (lessonNumber === 2) {
      // Build the Solving Algorithm (bracketed unknown).
      const mult = rand(3, 7);
      const add = rand(4, 12);
      const unknown = rand(5, 20);
      const total = (unknown + add) * mult;
      if (role === "apply_create") {
        return typed(
          "Solve for the unknown.",
          unknown,
          `Divide ${total} by ${mult}, then subtract ${add}.`,
          promptVisual("Solving algorithm", [{ tokens: ["(", "?", "+", `${add}`, ")", "×", `${mult}`, "=", `${total}`] }]),
        );
      }
      if (role === "reasoning") {
        return mcq(
          "What order should the algorithm undo the operations?",
          "Divide, then subtract",
          ["Subtract, then divide", "Multiply, then add"],
          "Undo the outer operation first.",
        );
      }
      return mcq(
        `First step: what is ${total} ÷ ${mult}?`,
        total / mult,
        [`${total - mult}`, `${total + mult}`],
        "Undo the × before the +.",
      );
    }

    // L3 Defend a Generalisation (evaluate and correct a claim).
    const stage2 = rand(9, 15);
    const trueCount = start + growth * (stage2 - 1);
    if (role === "apply_create") {
      return typed(
        `How many tiles at Stage ${stage2}?`,
        trueCount,
        `Use ${stage2} − 1 steps of ${growth}, starting from ${start}.`,
        tiles,
      );
    }
    if (role === "reasoning") {
      return mcq(
        `A climber claims Stage n has ${start} + ${growth} × n tiles. Stage 1 should give ${start}. Is the claim right?`,
        `No — it adds one ${growth} too many`,
        ["Yes, it is correct", `No — it is too small by ${start}`],
        "Test the claim on Stage 1 before trusting it.",
      );
    }
    return mcq(
      "How many tiles are in Stage 1?",
      start,
      [`${start + growth}`, `${start + 1}`],
      "Stage 1 is the very first stage.",
      tiles,
    );
  }

  return year6Question(lessonNumber === 1 ? 1 : lessonNumber === 2 ? 6 : 7, lessonNumber, role);
}

export function generatePatternPeaksQuestion(
  _level: SupportedMathLevel,
  lesson: Lesson,
  activity: LessonActivity,
): Year2QuestionData {
  const role = roleFor(activity);
  const lessonNumber = lesson.lesson;
  // The shared Number Nexus resolver intentionally caps Year 6 at its Level 5
  // arithmetic contract. Pattern Peaks owns a real Year 6 algebra generator,
  // so select this realm's level from its canonical lesson id instead.
  const patternLevel = Number(lesson.id.match(/^y(\d+)-/)?.[1] ?? _level);
  const question = patternLevel === 3
    ? year3Question(lesson.week, lessonNumber, role)
    : patternLevel === 4
      ? year4Question(lesson.week, lessonNumber, role, true)
      : patternLevel === 5
        ? year5Question(lesson.week, lessonNumber, role)
        : year6Question(lesson.week, lessonNumber, role);

  if (!isPatternPeaksQuestion(question)) {
    const visualType = (question as { visual?: { type?: string } }).visual?.type;
    throw new Error(`Pattern Peaks generated an incompatible ${visualType ?? "missing"} visual.`);
  }
  return question;
}
