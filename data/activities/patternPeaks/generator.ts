import type {
  BalanceEquationCardVisualData,
  BracketEquationCardVisualData,
  ExpressionFlowVisualData,
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
): Year2QuestionData {
  return {
    kind: "multiple_choice",
    prompt,
    answer: String(answer),
    options: uniqueOptions(String(answer), distractors),
    helper,
    visual,
  };
}

function typed(
  prompt: string,
  answer: string | number,
  helper: string,
  visual?: QuestionVisual,
  acceptedAnswers?: string[],
): Year2QuestionData {
  return {
    kind: "typed_response",
    prompt,
    answer: String(answer),
    acceptedAnswers,
    helper,
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

function bracketVisual(title: string, left: string, right: string, bracketGroup?: string, outsideFactor?: string): QuestionVisual {
  return { type: "bracket_equation_card", title, left, right, bracketGroup, outsideFactor };
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

function expressionVisual(title: string, expressions: string[]): QuestionVisual {
  return {
    type: "expression_flow",
    title,
    cards: expressions.map((expression, index) => {
      const isResult = index === expressions.length - 1;
      const outputMatch = isResult ? expression.match(/^Output\s+(.+)$/) : null;
      return {
        label: isResult ? "Result" : `Step ${index + 1}`,
        tokens: outputMatch ? ["Output"] : expression.split(" "),
        result: isResult ? (outputMatch?.[1] ?? expression) : undefined,
      };
    }),
  };
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
    const a = rand(3, 9);
    const b = rand(3, 9);
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
          promptVisual("Turn division around", [{ tokens: [`${p}`, "÷", `${a}`, "=", "?"] }]),
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
    const a = rand(3, 9);
    const b = rand(3, 9);
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
          promptVisual("Unknown factor", [{ tokens: [`${a}`, "×", "?", "=", `${p}`] }]),
        );
      }
      return mcq(
        "Which is the missing product?",
        p,
        [p + a, p - b, p + 1],
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
          promptVisual("Unknown dividend", [{ tokens: ["?", "÷", `${b}`, "=", `${a}`] }]),
        );
      }
      return mcq(
        "Find the missing dividend.",
        p,
        [p + b, p - b, a + b],
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
    return mcq(
      `What is ${bigP} ÷ ${tens}?`,
      b,
      [b + 1, b - 1, tens],
      "Divide using the matching small fact.",
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
        [5, 3, 2],
        [2, 9, 5],
        [4, 7, 5],
        [5, 6, 2],
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
        "Both blanks are the same. What is the hidden factor?",
        f,
        [f + 1, f - 1],
        "The factor is shared by both parts.",
        promptVisual("Find the hidden factor", [
          { tokens: ["?", "×", "10", "+", "?", "×", `${c}`, "=", `${total}`] },
        ]),
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
        { n: 24, factors: [2, 3, 4, 6, 8, 12], notFactor: 5 },
        { n: 36, factors: [2, 3, 4, 6, 9, 12, 18], notFactor: 5 },
        { n: 30, factors: [2, 3, 5, 6, 10, 15], notFactor: 4 },
        { n: 40, factors: [2, 4, 5, 8, 10, 20], notFactor: 3 },
      ]);
      const aFactor = pick(set.factors);
      if (role === "apply_create") {
        return typed(
          `Type a factor of ${set.n} (not 1 or ${set.n}).`,
          set.factors[0]!,
          `A factor divides ${set.n} exactly.`,
          undefined,
          set.factors.map(String),
        );
      }
      if (role === "reasoning") {
        return mcq(
          `Which number is a factor of ${set.n}?`,
          aFactor,
          [set.notFactor, set.n + 1],
          `It divides ${set.n} with no remainder.`,
        );
      }
      return mcq(
        `Which number is NOT a factor of ${set.n}?`,
        set.notFactor,
        [set.factors[0]!, set.factors[1]!],
        "A factor divides with no remainder.",
      );
    }

    if (lessonNumber === 2) {
      // Use Multiple Clues — combine constraints.
      const factor = pick([3, 4, 6, 7, 8]);
      const k = rand(3, 8);
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
      { n: 12, all: "1×12, 2×6, 3×4", partial: "1×12, 2×6", extra: "1×12, 2×6, 3×4, 5×2", real: "3×4", fake: "5×3" },
      { n: 18, all: "1×18, 2×9, 3×6", partial: "1×18, 3×6", extra: "1×18, 2×9, 3×6, 4×5", real: "2×9", fake: "4×5" },
      { n: 20, all: "1×20, 2×10, 4×5", partial: "1×20, 4×5", extra: "1×20, 2×10, 4×5, 3×7", real: "4×5", fake: "3×7" },
    ]);
    const count = set.all.split(",").length;
    if (role === "apply_create") {
      return typed(
        `How many factor pairs does ${set.n} have?`,
        count,
        `List them: ${set.all}.`,
      );
    }
    if (role === "reasoning") {
      return mcq(
        `Which lists ALL factor pairs of ${set.n}?`,
        set.all,
        [set.partial, set.extra],
        "Include every pair, and no false ones.",
      );
    }
    return mcq(
      `Which is a factor pair of ${set.n}?`,
      set.real,
      [set.fake, `${set.n}×2`],
      `Their product is ${set.n}.`,
    );
  }

  // Week 8 — Multiplicative Mystery (AC9M5A01, AC9M5A02): integrate inverse,
  // property and equivalence reasoning across a connected investigation.
  if (week === 8) {
    const a = rand(3, 9);
    const b = rand(3, 9);
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
          promptVisual("Analyse the evidence", [{ tokens: [`${a}`, "×", "?", "=", `${p}`] }]),
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
      const m = rand(3, 6);
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
          chain,
        );
      }
      return mcq(
        `In ${a} × ? = ${p}, what is the factor?`,
        b,
        [b + 1, b - 1, m],
        `Divide ${p} ÷ ${a} to start the chain.`,
        promptVisual("Connected equations", [{ tokens: [`${a}`, "×", "?", "=", `${p}`] }]),
      );
    }

    // L3 Expose the Flawed Argument — a misused property.
    if (role === "apply_create") {
      return typed(
        "Correct it. What is the right answer?",
        b,
        `Do the division the right way round: ${p} ÷ ${a}.`,
        promptVisual("Expose the flaw", [
          { tokens: [`${p}`, "÷", `${a}`, "=", "?"], note: `A student swapped it to ${a} ÷ ${p}.` },
        ]),
      );
    }
    if (role === "reasoning") {
      return mcq(
        `A student says ${p} ÷ ${a} = ${a} ÷ ${p}. What is the flaw?`,
        "Division is not commutative",
        ["Nothing, it is correct", "They should have added"],
        "Swapping the numbers in a division changes the answer.",
        promptVisual("Expose the flaw", [{ tokens: [`${p}`, "÷", `${a}`, "=", `${a}`, "÷", `${p}`], note: "A student wrote this." }]),
      );
    }
    return mcq(
      "Which claim is FALSE?",
      `${a} ÷ ${b} = ${b} ÷ ${a}`,
      [`${a} × ${b} = ${b} × ${a}`, `${p} ÷ ${a} = ${b}`],
      "Only multiplication lets you swap freely.",
    );
  }

  return year5Question(lessonNumber === 1 ? 2 : lessonNumber === 2 ? 6 : 7, lessonNumber, role);
}

function year6Question(week: number, lessonNumber: number, role: RotationRole): Year2QuestionData {
  if (week === 1) {
    const growth = rand(2, 5);
    const start = rand(1, 4);
    const counts = [start, start + growth, start + growth * 2, start + growth * 3];
    const stage = rand(6, 10);
    const predicted = start + growth * (stage - 1);
    const visual = growingVisual("Visually growing pattern", counts, lessonNumber === 1 ? "tiles" : "dots");
    if (role === "apply_create") return typed(`The rule is start at ${start}, then add ${growth} each stage. How many are in Stage ${stage}?`, predicted, "Connect the stage number to the repeated growth.", visual);
    if (role === "reasoning") return mcq("Which rule explains every stage?", `Start at ${start}; add ${growth} each stage`, [`Multiply every stage by ${growth}`, `Add ${start} each stage`], "Compare corresponding counts, then test a later stage.", visual);
    return mcq("How many objects are in the next stage?", counts[3]! + growth, [counts[3]!, counts[3]! + growth - 1, counts[3]! * 2], "Continue the constant growth.", visual);
  }

  if (week === 2) {
    const decimal = lessonNumber !== 1;
    const step = decimal ? pick([0.25, 0.5, 1.25]) : pick([0.5, 0.25, 0.75]);
    const start = decimal ? pick([0.5, 1.25, 2.5]) : pick([0.25, 0.5, 1]);
    const terms = [start, start + step, start + step * 2, start + step * 3].map((value) => Number(value.toFixed(2)));
    const answer = Number((start + step * 4).toFixed(2));
    const visual = sequenceVisual(decimal ? "Decimal sequence" : "Fraction sequence", [...terms, "?"], [`+${step}`, `+${step}`, `+${step}`, null]);
    if (role === "apply_create") return typed("Type the next term.", answer, `Add ${step} to the previous term.`, visual, [answer.toFixed(2)]);
    if (role === "reasoning") return mcq("Which statement describes the structure?", `The difference is always ${step}`, [`Each term is multiplied by ${step}`, "The difference changes each time"], "Compare consecutive terms using equivalent decimal forms.", visual);
    return mcq("What is the next term?", answer, [answer - step, answer + step, terms[3]!], "Use the constant difference.", visual);
  }

  if (week === 3) {
    const multiplier = rand(2, 5);
    const add = rand(1, 6);
    const apply = (value: number) => value * multiplier + add;
    const pairs: Array<[number, number]> = [1, 2, 3, 4].map((input) => [input, apply(input)]);
    const visual = tableVisual("Connect table and rule", pairs);
    if (role === "apply_create") {
      return typed(
        `Use output = input × ${multiplier} + ${add}. What is the output for 10?`,
        apply(10),
        "Substitute the input into the complete rule.",
        tableVisual("Connect table and rule", [...pairs, [10, "?"]]),
      );
    }
    if (role === "reasoning") return mcq("How does this growth differ from simply adding the same amount to each output?", "The input is multiplied before the constant is added", ["Only the labels are different", "The output always doubles"], "Connect each table row to both operations in the rule.", visual);
    return mcq("Which rule matches the table?", `×${multiplier}, then +${add}`, [`+${multiplier}, then ×${add}`, `×${add}, then +${multiplier}`], "Test the rule against more than one row.", visual);
  }

  if (week === 4) {
    const multiplier = rand(2, 5);
    const add = rand(2, 9);
    const input = rand(2, 12);
    const output = input * multiplier + add;
    const visual = machineVisual("Multi-step algorithm", input, `×${multiplier}, then +${add}`, "?");
    if (role === "apply_create") return typed(`Follow the algorithm for input ${input}.`, output, "Complete the steps in their stated order.", visual);
    if (role === "reasoning") {
      const secondInput = input + 1;
      return mcq(`The next input is ${secondInput}. Which output should it create?`, secondInput * multiplier + add, [output + 1, output + add, output * 2], "Changing the input by one changes the multiplied part first.", tableVisual("Test the algorithm", [[input, output], [secondInput, "?"]]));
    }
    return mcq("What output does the machine generate?", output, [input + multiplier + add, input * (multiplier + add), output - multiplier], "Follow multiplication before the final addition.", visual);
  }

  if (week === 5) {
    const a = rand(2, 8);
    const b = rand(2, 7);
    const c = rand(2, 6);
    const bracketed = (a + b) * c;
    const unbracketed = a + b * c;
    const visual = bracketVisual("Brackets change the grouping", `(${a} + ${b}) × ${c}`, String(bracketed), `${a} + ${b}`, `× ${c}`);
    if (role === "apply_create") {
      return typed(
        `Calculate (${a} + ${b}) × ${c}.`,
        bracketed,
        "Calculate inside the brackets first.",
        bracketVisual("Brackets change the grouping", `(${a} + ${b}) × ${c}`, "?", `${a} + ${b}`, `× ${c}`),
      );
    }
    if (role === "reasoning") return mcq("Why do the bracketed and unbracketed expressions differ?", "The brackets make the addition happen first", ["Brackets are decorative", "Multiplication is ignored"], "Identify which operation the brackets group.", expressionVisual("Compare operation order", [`(${a} + ${b}) × ${c} = ${bracketed}`, `${a} + ${b} × ${c} = ${unbracketed}`]));
    return mcq("What value does the bracketed expression have?", bracketed, [unbracketed, a + b + c, a * b * c], "Complete the bracketed operation first.", visual);
  }

  if (week === 6) {
    const multiplier = rand(2, 6);
    const add = rand(2, 9);
    const unknown = rand(3, 14);
    const total = (unknown + add) * multiplier;
    const visual = bracketVisual("Unknown inside brackets", `(□ + ${add}) × ${multiplier}`, String(total), `□ + ${add}`, `× ${multiplier}`);
    if (role === "apply_create") return typed(`Solve (□ + ${add}) × ${multiplier} = ${total}.`, unknown, "Undo the outside multiplication, then undo the addition.", visual);
    if (role === "reasoning") return mcq("Which operation should be undone first?", `Divide ${total} by ${multiplier}`, [`Subtract ${add} from ${total}`, `Multiply ${total} by ${multiplier}`], "Reverse the original operations in reverse order.", visual);
    return mcq("What is the unknown?", unknown, [unknown - 1, unknown + add, total / multiplier], "Use inverse operations and then substitute to check.", visual);
  }

  if (week === 7) {
    const input = rand(2, 20);
    const even = input % 2 === 0;
    const output = even ? input / 2 + 3 : input * 2 + 1;
    const path = even ? "Even → divide by 2 → add 3" : "Odd → multiply by 2 → add 1";
    const visual = expressionVisual("Decision algorithm", [`Input ${input}`, even ? `${input} ÷ 2 = ${input / 2}` : `${input} × 2 = ${input * 2}`, `Output ${output}`]);
    if (role === "apply_create") {
      return typed(
        `Follow the decision algorithm for input ${input}.`,
        output,
        path,
        expressionVisual("Decision algorithm", [`Input ${input}`, even ? `${input} ÷ 2 = ${input / 2}` : `${input} × 2 = ${input * 2}`, "Output ?"]),
      );
    }
    if (role === "reasoning") return mcq("Why was this branch selected?", even ? `${input} is even` : `${input} is odd`, [even ? `${input} is odd` : `${input} is even`, "The output was chosen first"], "Test the decision condition before following its steps.", visual);
    return mcq("Which path should the algorithm follow?", path, [even ? "Odd → multiply by 2 → add 1" : "Even → divide by 2 → add 3", "Always add 3"], "Classify the input at the decision point.", visual);
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
