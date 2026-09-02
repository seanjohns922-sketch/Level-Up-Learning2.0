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
  | { type: "array"; rows: number; columns: number; highlightedRows?: number[] }
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

export function isPatternPeaksQuestion(question: unknown): question is Year2QuestionData {
  if (!question || typeof question !== "object") return false;
  const candidate = question as { kind?: unknown; visual?: { type?: unknown } };
  if (candidate.kind !== "multiple_choice" && candidate.kind !== "typed_response") return false;
  return typeof candidate.visual?.type === "string" && PATTERN_VISUAL_TYPES.has(candidate.visual.type);
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]) => items[rand(0, items.length - 1)]!;

function shuffle<T>(items: readonly T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = rand(0, index);
    [result[index], result[swap]] = [result[swap]!, result[index]!];
  }
  return result;
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

function expressionVisual(title: string, expressions: string[]): QuestionVisual {
  return {
    type: "expression_flow",
    title,
    cards: expressions.map((expression, index) => ({
      label: index === expressions.length - 1 ? "Result" : `Step ${index + 1}`,
      tokens: expression.split(" "),
      result: index === expressions.length - 1 ? expression : undefined,
    })),
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
    const input = rand(3, 12);
    const operations = [
      { label: "×2", apply: (value: number) => value * 2 },
      { label: "+5", apply: (value: number) => value + 5 },
      { label: "−3", apply: (value: number) => value - 3 },
    ] as const;
    const operation = operations[(lessonNumber - 1) % operations.length]!;
    const output = operation.apply(input);
    const pairs: Array<[number, number]> = [1, 2, 3].map((value) => [value, operation.apply(value)]);
    if (role === "fast_thinking") {
      return mcq("What output does the machine make?", output, [output - 2, output + 2, input], "Apply the operation to the input once.", machineVisual("Function machine", input, operation.label, "?"));
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
      const visual = inverseVisual("Addition and subtraction undo", `${a} + ${b} = ${total}`, `${total} − ${b} = ${a}`);
      return role === "apply_create"
        ? typed(`Use the inverse: ${total} − ${b} = ?`, a, "Subtraction undoes the addition.", visual)
        : mcq("Which equation proves the addition fact?", `${total} − ${b} = ${a}`, [`${total} + ${b} = ${a}`, `${a} − ${b} = ${total}`], "Use subtraction to undo the addition.", visual);
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
    const a = rand(8, 24);
    const b = rand(5, 18);
    const total = a + b;
    const c = rand(4, total - 4);
    const d = total - c;
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
    if (role === "apply_create") return typed(`${known} + □ = ${total}. Type the unknown.`, missing, "Subtract the known part from the whole.", visual);
    if (role === "reasoning") return mcq("Which check proves the unknown?", `${total} − ${known} = ${missing}`, [`${known} − ${missing} = ${total}`, `${total} + ${known} = ${missing}`], "Use the inverse and substitute the result.", visual);
    return mcq("What is the unknown?", missing, [missing - 2, missing + 2, known], "Find the missing part.", visual);
  }

  if (week === 7) {
    const factor = pick([3, 4, 5, 10]);
    const n = rand(3, 9);
    const product = factor * n;
    if (lessonNumber === 1) {
      const base = rand(3, 9);
      const visual = sequenceVisual("Related addition facts", [base, base + 10, base + 20, base + 30, "?"], ["+10", "+10", "+10", null]);
      return role === "apply_create"
        ? typed("Type the next related value.", base + 40, "The ones stay the same while the tens increase.", visual)
        : mcq("What stays the same in this fact pattern?", "The ones digit", ["The tens digit", "Every digit changes"], "Compare place values in each term.", visual);
    }
    const visual = { type: "array" as const, rows: factor, columns: n };
    if (role === "apply_create") return typed(`${factor} groups of ${n} make how many?`, product, "Use a known multiplication fact.", visual);
    return mcq(lessonNumber === 2 ? "Which fact matches the array?" : "Which known fact is most efficient?", `${factor} × ${n} = ${product}`, [`${factor} + ${n} = ${product}`, `${product} ÷ ${factor} = ${product}`], "Choose the fact that matches equal rows and columns.", visual);
  }

  const mixedWeek = ((lessonNumber - 1) % 3) + 3;
  return year3Question(mixedWeek, lessonNumber, role);
}

function year4Question(week: number, lessonNumber: number, role: RotationRole): Year2QuestionData {
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

  if (week <= 7) {
    const factor = week === 6 ? [6, 7, 9][lessonNumber - 1]! : rand(3, 10);
    const n = rand(4, 10);
    const product = factor * n;
    const visual = { type: "array" as const, rows: factor, columns: n };
    if (role === "apply_create") {
      const scaled = week === 7 ? product * 10 : product;
      return typed(week === 7 ? `Use ${factor} × ${n} = ${product} to calculate ${factor} × ${n * 10}.` : `Calculate ${factor} × ${n}.`, scaled, week === 7 ? "Scale one factor by 10, so the product scales by 10." : "Use a connected known fact.", visual);
    }
    if (role === "reasoning") {
      const strategy = factor === 6 ? `Double ${3 * n}` : factor === 9 ? `${10 * n} − ${n}` : `${5 * n} + ${2 * n}`;
      return mcq("Which strategy efficiently derives the product?", strategy, [`${factor} + ${n}`, `${product} + ${factor}`], "Break the harder fact into known facts.", visual);
    }
    return mcq(lessonNumber === 3 ? "Which related division fact is true?" : "What is the product?", lessonNumber === 3 ? `${product} ÷ ${factor} = ${n}` : product, lessonNumber === 3 ? [`${product} ÷ ${n} = ${product}`, `${factor} ÷ ${n} = ${product}`] : [product - factor, product + factor, factor + n], "Use the rows and columns as factors.", visual);
  }

  return year4Question(lessonNumber === 1 ? 2 : lessonNumber === 2 ? 6 : 3, lessonNumber, role);
}

function year5Question(week: number, lessonNumber: number, role: RotationRole): Year2QuestionData {
  if (week <= 3) {
    const factorA = rand(4, 12);
    const factorB = rand(3, 12);
    const product = factorA * factorB;
    const unknownKind = lessonNumber === 2 && week === 3 ? "divisor" : lessonNumber === 1 && week === 3 ? "factor" : "inverse";
    const visual = unknownKind === "factor"
      ? unknownVisual("Unknown factor", `${factorA} × □`, String(product))
      : unknownKind === "divisor"
        ? unknownVisual("Unknown divisor", `${product} ÷ □`, String(factorA))
        : inverseVisual("Multiplication and division inverses", `${factorA} × ${factorB} = ${product}`, `${product} ÷ ${factorA} = ${factorB}`);
    if (role === "apply_create") return typed(unknownKind === "divisor" ? `${product} ÷ □ = ${factorA}` : `${factorA} × □ = ${product}`, factorB, "Use the related inverse fact.", visual);
    if (role === "reasoning") return mcq("Which equation checks the relationship?", `${product} ÷ ${factorA} = ${factorB}`, [`${product} − ${factorA} = ${factorB}`, `${factorA} ÷ ${factorB} = ${product}`], "A complete fact family uses the same factors and product.", visual);
    return mcq(week === 2 ? "Which fact completes the family?" : "What is the missing value?", week === 2 ? `${factorB} × ${factorA} = ${product}` : factorB, week === 2 ? [`${factorA} + ${factorB} = ${product}`, `${product} × ${factorA} = ${factorB}`] : [factorB - 1, factorB + 1, factorA], "Connect multiplication and division using the same three numbers.", visual);
  }

  if (week <= 6) {
    const a = rand(6, 14);
    const b = rand(3, 9);
    const c = rand(2, 7);
    const product = a * b;
    if (week === 4) {
      const visual = balanceVisual("Equivalent multiplication", `${a} × ${b}`, `${b} × ${a}`);
      if (role === "apply_create") {
        const knownFactor = pick([a, b]);
        return typed(`${a} × ${b} = ${knownFactor} × □. Type the unknown.`, product / knownFactor, "Both sides must have the same product.", balanceVisual("Construct an equivalent", `${a} × ${b}`, `${knownFactor} × □`));
      }
      return mcq("Which expression has the same value?", `${b} × ${a}`, [`${a} + ${b}`, `${product} × ${b}`], "Multiplication is commutative.", visual);
    }
    if (week === 5) {
      const answer = a * b * c;
      const visual = balanceVisual("Regroup three factors", `(${a} × ${b}) × ${c}`, `${a} × (${b} × ${c})`);
      if (role === "apply_create") return typed(`Calculate ${a} × (${b} × ${c}).`, answer, "Multiply the friendly pair first.", visual);
      const correct = lessonNumber === 3 ? "Division grouping can change the quotient" : "Multiplication can be regrouped without changing the product";
      return mcq("Which statement is correct?", correct, [lessonNumber === 3 ? "Division is always associative" : "Regrouping changes every product", "The equals sign means calculate left to right"], "Test the grouping with the displayed values.", visual);
    }
    const friendly = 10;
    const factor = rand(4, 9);
    const target = friendly + c;
    const answer = factor * target;
    const visual = balanceVisual("Distribute across a sum", `${factor} × (${friendly} + ${c})`, `(${factor} × ${friendly}) + (${factor} × ${c})`);
    if (role === "apply_create") return typed(`Calculate ${factor} × ${target} by splitting ${target} into ${friendly} + ${c}.`, answer, "Multiply both parts, then combine the partial products.", visual);
    return mcq("Which equation correctly distributes the multiplication?", `${factor} × ${friendly} + ${factor} × ${c}`, [`${factor} × ${friendly} + ${c}`, `${factor + friendly} × ${c}`], "The outside factor multiplies every part inside.", visual);
  }

  if (week === 7) {
    const factor = pick([4, 5, 6, 8, 10]);
    const value = factor * rand(3, 12);
    const visual = sequenceVisual("Factor and multiple clues", [factor, factor * 2, factor * 3, factor * 4, "..."], [`+${factor}`, `+${factor}`, `+${factor}`, null]);
    if (role === "apply_create") return typed(`Type the missing factor: ${factor} × □ = ${value}.`, value / factor, "Use the factor clue and related division.", visual);
    if (role === "reasoning") return mcq(`Which value satisfies both clues: a multiple of ${factor} and less than ${value + factor}?`, value, [value + factor, value - 1, factor + 1], "Test every constraint, not only one.", visual);
    return mcq(`Which number is a multiple of ${factor}?`, value, [value - 1, value + 1, value + 2], "A multiple divides exactly by the factor.", visual);
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
    if (role === "apply_create") return typed(`Use output = input × ${multiplier} + ${add}. What is the output for 10?`, apply(10), "Substitute the input into the complete rule.", visual);
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
    if (role === "apply_create") return typed(`Calculate (${a} + ${b}) × ${c}.`, bracketed, "Calculate inside the brackets first.", visual);
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
    if (role === "apply_create") return typed(`Follow the decision algorithm for input ${input}.`, output, path, visual);
    if (role === "reasoning") return mcq("Why was this branch selected?", even ? `${input} is even` : `${input} is odd`, [even ? `${input} is odd` : `${input} is even`, "The output was chosen first"], "Test the decision condition before following its steps.", visual);
    return mcq("Which path should the algorithm follow?", path, [even ? "Odd → multiply by 2 → add 1" : "Even → divide by 2 → add 3", "Always add 3"], "Classify the input at the decision point.", visual);
  }

  return year6Question(lessonNumber === 1 ? 1 : lessonNumber === 2 ? 6 : 7, lessonNumber, role);
}

export function generatePatternPeaksQuestion(
  level: SupportedMathLevel,
  lesson: Lesson,
  activity: LessonActivity,
): Year2QuestionData {
  const role = roleFor(activity);
  const lessonNumber = lesson.lesson;
  const question = level === 3
    ? year3Question(lesson.week, lessonNumber, role)
    : level === 4
      ? year4Question(lesson.week, lessonNumber, role)
      : level === 5
        ? year5Question(lesson.week, lessonNumber, role)
        : year6Question(lesson.week, lessonNumber, role);

  if (!isPatternPeaksQuestion(question)) {
    const visualType = (question as { visual?: { type?: string } }).visual?.type;
    throw new Error(`Pattern Peaks generated an incompatible ${visualType ?? "missing"} visual.`);
  }
  return question;
}
