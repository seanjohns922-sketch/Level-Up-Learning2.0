import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { MultipleChoiceQuestion, TypedResponseQuestion } from "@/data/activities/year2/lessonEngine";
import { PATTERN_PEAKS_PROGRAMS, type PatternPeaksYearLabel } from "@/data/programs/patternPeaks";

export type PatternQuizLevel = 3 | 4 | 5 | 6;
type PatternQuestion = TypedResponseQuestion | MultipleChoiceQuestion;

function typed(prompt: string, answer: number | string, visual: TypedResponseQuestion["visual"], helper?: string): TypedResponseQuestion {
  return { kind: "typed_response", prompt, answer: String(answer), helper, placeholder: "Type the missing value", visual };
}

function choice(prompt: string, answer: string, distractors: string[], visual: MultipleChoiceQuestion["visual"], position: number): MultipleChoiceQuestion {
  const options = [...distractors.slice(0, 2)];
  options.splice(position % 3, 0, answer);
  return { kind: "multiple_choice", prompt, answer, options, visual };
}

function sequenceQuestion(level: PatternQuizLevel, week: number, lesson: number, variant: number): PatternQuestion {
  const seed = level * 100 + week * 20 + lesson * 5 + variant;

  if (level === 3) {
    if (week <= 2) {
      const doubling = (lesson + variant) % 2 === 0;
      const start = doubling ? 2 + (seed % 5) : (3 + (seed % 5)) * 8;
      const terms = doubling
        ? [start, start * 2, start * 4, start * 8]
        : [start, start / 2, start / 4, start / 8];
      const missing = lesson === 2 ? 2 : 3;
      const shown = terms.map((value, index) => index === missing ? "?" : String(value));
      return typed(
        `${PATTERN_PEAKS_PROGRAMS["Year 3"][week - 1]!.lessons[lesson - 1]!.title}: what number replaces the question mark?`,
        terms[missing]!,
        { type: "pattern_sequence_strip", title: doubling ? "Double each term" : "Halve each term", terms: shown },
      );
    }
    if (week === 3) {
      const operations = [{ label: "+ 4", run: (n: number) => n + 4 }, { label: "× 2", run: (n: number) => n * 2 }, { label: "− 3", run: (n: number) => n - 3 }];
      const op = operations[(lesson + variant) % operations.length]!;
      const input = 3 + (seed % 12);
      if (lesson === 2) {
        const pairs = [input, input + 2, input + 5].map((n) => ({ input: String(n), output: String(op.run(n)) }));
        return choice("Which rule matches every input and output?", op.label, operations.filter((item) => item.label !== op.label).map((item) => item.label), { type: "input_output_table", title: "Rule decoder", pairs }, variant);
      }
      return typed("Run the input through the rule. What is the output?", op.run(input), { type: "function_machine_card", title: "Function machine", input: String(input), rule: op.label, output: "?" });
    }
    if (week === 4) {
      if (lesson === 1) {
        const whole = 35 + (seed % 40); const part = 12 + (variant % 15);
        return typed("Use subtraction to undo the addition. Find the missing addend.", whole - part, { type: "inverse_step_card", title: "Addition and subtraction undo", equation: `${part} + ? = ${whole}`, inverseOperation: `${whole} − ${part}` });
      }
      const factor = [3, 4, 5, 10][(variant + lesson) % 4]!;
      const groups = 2 + (seed % 7);
      const product = factor * groups;
      return typed("Use the inverse relationship. What number makes the equation true?", groups, { type: "inverse_step_card", title: "Related multiplication and division", equation: `${factor} × ? = ${product}`, inverseOperation: `${product} ÷ ${factor}` });
    }
    if (week === 5) {
      const a = 12 + (seed % 18);
      const b = 7 + (seed % 11);
      const c = 5 + (seed % 9);
      const target = a + b;
      return typed("Keep both sides equal. What number replaces the question mark?", target - c, { type: "balance_equation_card", title: "Equivalent number sentences", left: `${a} + ${b}`, right: `${c} + ?` });
    }
    if (week === 6) {
      const multiplication = lesson === 2;
      const known = multiplication ? [3, 4, 5, 10][variant % 4]! : 14 + (seed % 25);
      const missing = multiplication ? 2 + (seed % 8) : 6 + (seed % 20);
      const total = multiplication ? known * missing : known + missing;
      return typed("Find the unknown value.", missing, { type: "unknown_tile_equation", title: "Hidden value", left: multiplication ? `${known} × ?` : `${known} + ?`, right: String(total) });
    }
    if (lesson === 1) {
      const a = 6 + variant; const b = 5 + (seed % 7);
      return typed("Use the smaller known fact to calculate the larger related fact.", (a + b) * 10, { type: "expression_flow", title: "Addition fact pattern", cards: [{ tokens: [String(a), "+", String(b)], result: String(a + b) }, { tokens: [String(a * 10), "+", String(b * 10)], result: "?" }] });
    }
    const factor = [3, 4, 5, 10][(variant + lesson) % 4]!;
    const knownGroups = 3 + (seed % 7);
    return typed("Use the known fact to find the next product.", factor * (knownGroups + 1), { type: "expression_flow", title: "Use the next fact", cards: [{ tokens: [String(knownGroups), "×", String(factor)], result: String(knownGroups * factor) }, { tokens: [String(knownGroups + 1), "×", String(factor)], result: "?", note: `Add one more group of ${factor}` }] });
  }

  if (level === 4) {
    if (week <= 3) {
      const a = 45 + (seed % 90);
      const unknown = 18 + (seed % 55);
      if (week === 1) {
        const c = 20 + (seed % 30);
        return typed("Restore equality. What number belongs in the box?", a + unknown - c, { type: "balance_equation_card", title: "Both sides must have the same value", left: `${a} + ${unknown}`, right: `${c} + ?` });
      }
      if (week === 2) return typed("Find the missing addend.", unknown, { type: "unknown_tile_equation", title: "Addition unknown", left: lesson === 2 ? `? + ${a}` : `${a} + ?`, right: String(a + unknown) });
      return typed("Find the missing part.", unknown, { type: "inverse_step_card", title: "Subtraction unknown", equation: `${a + unknown} − ? = ${a}`, inverseOperation: `${a + unknown} − ${a}` });
    }
    if (week === 4) {
      const values = [14 + variant, 25 + lesson, 16 + variant];
      const answer = values.reduce((sum, value) => sum + value, 0);
      return typed("Reorder or regroup the addends, then find the total.", answer, { type: "expression_flow", title: "Equivalent additive equations", cards: [{ tokens: values.map(String).flatMap((value, index) => index ? ["+", value] : [value]) }, { tokens: [String(values[0]), "+", `(${values[1]} + ${values[2]})`], result: "?" }] });
    }
    if (week <= 7) {
      const knownFactor = [4, 6, 7, 9][(lesson + variant) % 4]!;
      const groups = 4 + (seed % 8);
      const product = knownFactor * groups;
      if (week === 5) return typed("Use the related fact. What is the missing quotient?", groups, { type: "inverse_step_card", title: "Related facts", equation: `${knownFactor} × ${groups} = ${product}`, inverseOperation: `${product} ÷ ${knownFactor}` });
      const base = week === 6 ? (knownFactor === 9 ? 10 : Math.max(5, knownFactor - 1)) : knownFactor;
      return typed("Use a known fact strategy to calculate the product.", product, { type: "expression_flow", title: "Derive a harder fact", cards: [{ tokens: [String(base), "×", String(groups)], result: String(base * groups) }, { tokens: [String(knownFactor), "×", String(groups)], result: "?", note: knownFactor > base ? `Add ${(knownFactor - base) * groups}` : "Scale the known fact" }] });
    }
  }

  if (level === 5) {
    if (week <= 3) {
      const factor = 6 + (seed % 9);
      const other = 4 + (seed % 8);
      const product = factor * other;
      const left = lesson === 2 ? `${product} ÷ ? = ${other}` : `? × ${other} = ${product}`;
      return typed("Use multiplication and division as inverse operations. Find the unknown.", factor, { type: "inverse_step_card", title: "Multiplicative inverse", equation: left, inverseOperation: `${product} ÷ ${other}` });
    }
    if (week === 4) {
      const factor = 2 * (2 + (seed % 5));
      const other = 5 + (seed % 9);
      const product = factor * other;
      return typed("Complete the equivalent multiplicative equation.", product / 2, { type: "balance_equation_card", title: "Same product, different form", left: `${factor} × ${other}`, right: `2 × ?` });
    }
    if (week === 5) {
      const a = 2 + (seed % 5);
      const b = 3 + (seed % 6);
      const c = 2 + ((seed + 2) % 5);
      if (lesson === 1) return typed("Turn the array. What product stays unchanged?", a * b, { type: "array", rows: a, columns: b, rotatable: true });
      if (lesson === 3) {
        const dividend = b * c * a;
        return typed("Work inside the brackets first. What is the value?", dividend / b / c, { type: "bracket_equation_card", title: "Division order matters", left: `(${dividend} ÷ ${b}) ÷ ${c}`, right: "?", bracketGroup: `${dividend} ÷ ${b}`, outsideFactor: `÷ ${c}` });
      }
      return typed("Regroup the factors and calculate the product.", a * b * c, { type: "expression_flow", title: "Properties of multiplication", cards: [{ tokens: [String(a), "×", String(b), "×", String(c)] }, { tokens: [String(a), "×", `(${b} × ${c})`], result: "?" }] });
    }
    if (week === 6) {
      const factor = 5 + (seed % 8);
      const friendly = 10;
      const extra = 2 + (variant % 4);
      return typed("Split the factor into friendly parts, then solve.", factor * (friendly + extra), { type: "expression_flow", title: "Distributive reasoning", cards: [{ tokens: [String(factor), "×", `(${friendly} + ${extra})`] }, { tokens: [`${factor} × ${friendly}`, "+", `${factor} × ${extra}`], result: "?" }] });
    }
    const product = [24, 30, 36, 40, 48, 60][seed % 6]!;
    const pairs: Array<[number, number]> = [];
    for (let n = 1; n <= Math.sqrt(product); n += 1) if (product % n === 0) pairs.push([n, product / n]);
    if (lesson === 2) {
      const base = [4, 5, 6][variant % 3]!;
      const multiple = base * (4 + variant);
      return typed(`What is the smallest multiple of ${base} greater than ${multiple - base}?`, multiple, { type: "pattern_sequence_strip", title: `Multiples of ${base}`, terms: Array.from({ length: 5 }, (_, index) => String(base * (index + variant + 1))) });
    }
    const [left, right] = pairs[(variant + lesson) % pairs.length]!;
    return typed(`What factor pairs with ${left} to make ${product}?`, right, { type: "factor_pair_tree", title: `Complete a factor pair of ${product}`, product, pairs: [{ left: String(left), right: "?" }] });
  }

  // Level 6 deliberately requires multi-step structure, changing representations
  // and generalisation; it is not a Level 5 bank with larger numbers.
  if (week === 1) {
    const start = 2 + (seed % 5);
    const step = 3 + ((lesson + variant) % 5);
    const stages = [1, 2, 3, 4].map((stage) => ({ label: `Stage ${stage}`, count: start + (stage - 1) * step, style: "tiles" as const }));
    return typed("Use the growth rule. How many tiles will Stage 7 contain?", start + 6 * step, { type: "growing_pattern", title: "Growing structure", stages });
  }
  if (week === 2) {
    if (lesson === 2) {
      const start = 0.4 + variant * 0.1; const step = 0.25;
      const values = [0, 1, 2, 3, 4].map((position) => Number((start + position * step).toFixed(2)));
      return typed("Continue the decimal pattern.", values[4]!, { type: "pattern_sequence_strip", title: `Add ${step} each time`, terms: values.map((value, index) => index === 4 ? "?" : String(value)) });
    }
    const start = 1 + (seed % 4);
    const numeratorStep = 1 + ((lesson + variant) % 3);
    const denominator = 4 + (variant % 3);
    return typed("Continue the rational-number pattern. Give the missing numerator.", start + 4 * numeratorStep, { type: "pattern_sequence_strip", title: `Denominator stays ${denominator}`, terms: [0, 1, 2, 3, 4].map((index) => index === 4 ? `?/${denominator}` : `${start + index * numeratorStep}/${denominator}`) });
  }
  if (week === 3) {
    const multiplier = 2 + ((lesson + variant) % 3);
    const add = 1 + (variant % 5);
    const inputs = [1, 2, 4];
    return typed("Transfer the rule to a new input. What is the output for input 7?", 7 * multiplier + add, { type: "input_output_table", title: `Multiply by ${multiplier}, then add ${add}`, pairs: inputs.map((input) => ({ input: String(input), output: String(input * multiplier + add) })) });
  }
  if (week === 4) {
    const input = 3 + (seed % 8);
    const multiply = 2 + (lesson % 3);
    const add = 4 + variant;
    return typed("Follow both steps of the algorithm. What is the output?", input * multiply + add, { type: "function_machine_card", title: "Multi-step machine", input: String(input), rule: `× ${multiply}, then + ${add}`, output: "?" });
  }
  if (week === 5) {
    const a = 2 + (seed % 7);
    const b = 3 + (variant % 5);
    const c = 2 + (lesson % 4);
    return typed("Evaluate the expression using the brackets first.", (a + b) * c, { type: "bracket_equation_card", title: "Brackets control the order", left: `(${a} + ${b}) × ${c}`, right: "?", bracketGroup: `${a} + ${b}`, outsideFactor: `× ${c}` });
  }
  if (week === 6) {
    if (lesson === 3) {
      const x = 7 + variant; const y = 3 + (seed % 5);
      return typed("Use both equations. What is the value of x?", x, { type: "expression_flow", title: "Pair of unknowns", cards: [{ tokens: ["x", "+", "y", "=", String(x + y)] }, { tokens: ["x", "−", "y", "=", String(x - y)] }, { tokens: ["x", "=", "?"], note: "Both equations must be true" }] });
    }
    const outside = 2 + (lesson % 4);
    const unknown = 3 + (seed % 8);
    const add = 2 + variant;
    return typed("Undo the outside operation, then find the unknown.", unknown, { type: "bracket_equation_card", title: "Unknown inside brackets", left: `(? + ${add}) × ${outside}`, right: String((unknown + add) * outside), bracketGroup: `? + ${add}`, outsideFactor: `× ${outside}` });
  }
  const input = 2 + (seed % 8);
  const gate = 3 + (lesson % 4);
  return typed("Follow the gate algorithm and record the final output.", (input + gate) * 2 - 1, { type: "expression_flow", title: "Number gatekeeper", cards: [{ label: "Start", tokens: [String(input)] }, { label: "Gate 1", tokens: [String(input), "+", String(gate)], result: String(input + gate) }, { label: "Gate 2", tokens: [String(input + gate), "×", "2", "−", "1"], result: "?" }] });
}

function buildTask(level: PatternQuizLevel, week: number, lesson: number, variant: number): PracticeTask {
  const question = sequenceQuestion(level, week, lesson, variant);
  const lessonPlan = PATTERN_PEAKS_PROGRAMS[`Year ${level}` as PatternPeaksYearLabel][week - 1]!.lessons[lesson - 1]!;
  const options = question.kind === "multiple_choice" ? question.options.map((label, index) => ({ id: String(index), label })) : undefined;
  const correctIndex = question.kind === "multiple_choice" ? question.options.indexOf(question.answer) : -1;
  const position = (lesson - 1) * 5 + variant;
  const accessible = level === 3 ? 5 : level === 4 ? 4 : level === 5 ? 3 : 2;
  const moderate = level === 3 ? 7 : 7;
  const difficulty = position < accessible ? "easy" : position < accessible + moderate ? "medium" : "hard";
  return {
    kind: "patternPeaksQuestion",
    prompt: question.prompt,
    speakText: `${question.prompt}${/[.!?]$/.test(question.prompt) ? "" : "."} ${question.kind === "multiple_choice" ? `Options: ${question.options.join(", ")}.` : "Type the missing value in the question mark."}`,
    target: Number(question.answer) || 1,
    question,
    answerCount: question.kind === "typed_response" ? Number(question.answer) : undefined,
    options,
    correctOptionIds: correctIndex >= 0 ? [String(correctIndex)] : undefined,
    feedback: {
      correct: `Correct. You used ${lessonPlan.title.toLowerCase()} accurately.`,
      wrong: "Check the complete relationship, then try the rule one step at a time.",
    },
    difficulty,
  };
}

export function getPatternPeaksWeeklyQuizTasks(level: number, week: number): PracticeTask[] | null {
  if (!Number.isInteger(level) || level < 3 || level > 6 || !Number.isInteger(week) || week < 1 || week > 7) return null;
  return [1, 2, 3].flatMap((lesson) =>
    Array.from({ length: 5 }, (_, variant) => buildTask(level as PatternQuizLevel, week, lesson, variant)),
  );
}

export const PATTERN_PEAKS_WEEKLY_QUIZ_FORMS = ([3, 4, 5, 6] as const).flatMap((level) =>
  [1, 2, 3, 4, 5, 6, 7].map((week) => ({ level, week, tasks: getPatternPeaksWeeklyQuizTasks(level, week)! })),
);
