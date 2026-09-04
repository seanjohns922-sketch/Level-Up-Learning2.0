import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { MultipleChoiceQuestion, TypedResponseQuestion } from "@/data/activities/year2/lessonEngine";
import type { Question } from "./posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "./assessmentItemStandard";
import {
  getPatternPeaksAssessmentBlueprint,
  type PatternPeaksAssessmentKind,
  type PatternPeaksLevel,
} from "./patternPeaksAssessmentBlueprint";

const CORRECT_TOKEN = "__pattern_peaks_assessment_correct__";
type PatternQuestion = TypedResponseQuestion | MultipleChoiceQuestion;
type AssessmentQuestion = Question & IndependentAssessmentItem;
type FormKey = `${PatternPeaksLevel}-${PatternPeaksAssessmentKind}`;

function expandMix<T extends string>(mix: Record<T, number>): T[] {
  return Object.entries(mix).flatMap(([key, count]) => Array.from({ length: Number(count) }, () => key as T));
}

function difficulty(value: string): AssessmentItemDifficulty {
  return value === "accessible" ? "easy" : value as AssessmentItemDifficulty;
}

function cognition(value: string): AssessmentCognitiveCategory {
  return value as AssessmentCognitiveCategory;
}

function numericChoice(question: TypedResponseQuestion, index: number): MultipleChoiceQuestion {
  const answer = Number(question.answer);
  const candidates = [answer - Math.max(1, (index % 4) + 1), answer + Math.max(1, (index % 5) + 1)]
    .filter((value, position, all) => value >= 0 && value !== answer && all.indexOf(value) === position)
    .map(String);
  while (candidates.length < 2) candidates.push(String(answer + candidates.length + 2));
  const options = candidates.slice(0, 2);
  options.splice(index % 3, 0, question.answer);
  return { kind: "multiple_choice", prompt: question.prompt, answer: question.answer, options, visual: question.visual as MultipleChoiceQuestion["visual"] };
}

function authoredQuestion(level: PatternPeaksLevel, form: PatternPeaksAssessmentKind, index: number, descriptorCode: string): { question: TypedResponseQuestion; structure: string } {
  const offset = form === "posttest" ? 17 : 3;
  const seed = level * 101 + index * 13 + offset;
  let archetype = index % 5;

  if (level === 3) {
    if (descriptorCode === "AC9M3A01") archetype = index % 2;
    if (descriptorCode === "AC9M3A02") {
      const whole = 38 + (seed % 45); const part = 12 + (index % 18);
      return index % 2 === 0
        ? { question: { kind: "typed_response", prompt: "Use addition and subtraction as inverse operations to find the unknown.", answer: String(whole - part), visual: { type: "inverse_step_card", title: "Addition and subtraction undo", equation: `${part} + ? = ${whole}`, inverseOperation: `${whole} − ${part}` } }, structure: "add-sub-inverse" }
        : { question: { kind: "typed_response", prompt: "Find the missing value that keeps both sides equal.", answer: String(whole - part), visual: { type: "balance_equation_card", title: "Relational equality", left: String(whole), right: `${part} + ?` } }, structure: "relational-equality" };
    }
    if (descriptorCode === "AC9M3A03") archetype = index % 2 === 0 ? 2 : 4;
    if (archetype === 0) {
      const start = 2 + (seed % 6);
      const halve = index % 2 === 1;
      const terms = halve ? [start * 8, start * 4, start * 2, start] : [start, start * 2, start * 4, start * 8];
      return { question: { kind: "typed_response", prompt: "What number replaces the question mark?", answer: String(terms[3]), visual: { type: "pattern_sequence_strip", title: halve ? "Halving pattern" : "Doubling pattern", terms: [...terms.slice(0, 3).map(String), "?"] } }, structure: "extended-sequence" };
    }
    if (archetype === 1) {
      const input = 4 + (seed % 12); const add = 3 + (index % 6);
      return { question: { kind: "typed_response", prompt: "Apply the rule to the new input.", answer: String(input + add), visual: { type: "function_machine_card", title: "One-step function", input: String(input), rule: `+ ${add}`, output: "?" } }, structure: "function-machine" };
    }
    if (archetype === 2) {
      const factor = [3, 4, 5, 10][index % 4]!; const other = 3 + (seed % 8); const product = factor * other;
      return { question: { kind: "typed_response", prompt: "Use the inverse fact to find the missing value.", answer: String(other), visual: { type: "inverse_step_card", title: "Fact family", equation: `${factor} × ? = ${product}`, inverseOperation: `${product} ÷ ${factor}` } }, structure: "inverse-fact" };
    }
    if (archetype === 3) {
      const a = 18 + (seed % 24); const b = 7 + (index % 10); const c = 9 + (seed % 8);
      return { question: { kind: "typed_response", prompt: "Make both sides equal.", answer: String(a + b - c), visual: { type: "balance_equation_card", title: "Equivalent sentence", left: `${a} + ${b}`, right: `${c} + ?` } }, structure: "relational-equality" };
    }
    const base = 4 + (seed % 7); const factor = [3, 4, 5, 10][index % 4]!;
    return { question: { kind: "typed_response", prompt: "Use the known fact to calculate the next fact.", answer: String((base + 1) * factor), visual: { type: "expression_flow", title: "Derived fact", cards: [{ tokens: [String(base), "×", String(factor)], result: String(base * factor) }, { tokens: [String(base + 1), "×", String(factor)], result: "?" }] } }, structure: "derived-fact" };
  }

  if (level === 4) {
    archetype = descriptorCode === "AC9M4A01" ? index % 4 : 4;
    if (archetype <= 1) {
      const whole = 130 + (seed % 160); const part = 35 + (index * 7 % 80);
      const left = archetype === 0 ? `${part} + ?` : `? + ${part}`;
      return { question: { kind: "typed_response", prompt: "Find the unknown addend and check both sides.", answer: String(whole - part), visual: { type: "unknown_tile_equation", title: "Addition unknown", left, right: String(whole) } }, structure: "unknown-position" };
    }
    if (archetype === 2) {
      const whole = 180 + (seed % 170); const remaining = 45 + (index * 9 % 90);
      return { question: { kind: "typed_response", prompt: "Undo the subtraction to find the missing part.", answer: String(whole - remaining), visual: { type: "inverse_step_card", title: "Subtraction unknown", equation: `${whole} − ? = ${remaining}`, inverseOperation: `${whole} − ${remaining}` } }, structure: "inverse-add-sub" };
    }
    if (archetype === 3) {
      const a = 16 + index; const b = 25 + (seed % 16); const c = 24 + (index % 8);
      return { question: { kind: "typed_response", prompt: "Regroup the addends to calculate efficiently.", answer: String(a + b + c), visual: { type: "expression_flow", title: "Associative structure", cards: [{ tokens: [String(a), "+", String(b), "+", String(c)] }, { tokens: [String(a), "+", `(${b} + ${c})`], result: "?" }] } }, structure: "regroup-addends" };
    }
    const factor = [6, 7, 9][index % 3]!; const groups = 5 + (seed % 8); const product = factor * groups;
    return { question: { kind: "typed_response", prompt: "Use the known fact and its related division fact.", answer: String(groups), visual: { type: "inverse_step_card", title: "Related multiplication and division", equation: `${factor} × ${groups} = ${product}`, inverseOperation: `${product} ÷ ${factor}` } }, structure: "derived-multiplication" };
  }

  if (level === 5) {
    archetype = descriptorCode === "AC9M5A01" ? 0 : 1 + (index % 4);
    if (archetype === 0) {
      const factor = 8 + (seed % 14); const other = 4 + (index % 9); const product = factor * other;
      return { question: { kind: "typed_response", prompt: "Find the unknown factor using the inverse operation.", answer: String(factor), visual: { type: "inverse_step_card", title: "Unknown multiplicative part", equation: `? × ${other} = ${product}`, inverseOperation: `${product} ÷ ${other}` } }, structure: "multiplicative-unknown" };
    }
    if (archetype === 1) {
      const a = 3 + (seed % 5); const b = 4 + (index % 6); const c = 2 + (seed % 4);
      return { question: { kind: "typed_response", prompt: "Regroup the factors, then calculate.", answer: String(a * b * c), visual: { type: "expression_flow", title: "Associative multiplication", cards: [{ tokens: [String(a), "×", String(b), "×", String(c)] }, { tokens: [String(a), "×", `(${b} × ${c})`], result: "?" }] } }, structure: "multiplication-property" };
    }
    if (archetype === 2) {
      const factor = 6 + (seed % 9); const extra = 2 + (index % 7);
      return { question: { kind: "typed_response", prompt: "Use the split to calculate the product.", answer: String(factor * (10 + extra)), visual: { type: "expression_flow", title: "Distributive reasoning", cards: [{ tokens: [String(factor), "×", `(10 + ${extra})`] }, { tokens: [`${factor} × 10`, "+", `${factor} × ${extra}`], result: "?" }] } }, structure: "distributive" };
    }
    if (archetype === 3) {
      const product = [24, 30, 36, 42, 48, 60, 72][seed % 7]!; const pairs: Array<[number, number]> = [];
      for (let value = 1; value <= Math.sqrt(product); value += 1) if (product % value === 0) pairs.push([value, product / value]);
      const [left, right] = pairs[index % pairs.length]!;
      return { question: { kind: "typed_response", prompt: `What factor pairs with ${left} to make ${product}?`, answer: String(right), visual: { type: "factor_pair_tree", title: "Complete the factor pair", product, pairs: [{ left: String(left), right: "?" }] } }, structure: "factor-constraints" };
    }
    const base = [4, 6, 7, 8][index % 4]!; const multiplier = 6 + (seed % 7);
    return { question: { kind: "typed_response", prompt: `Find the least multiple of ${base} that is greater than ${base * (multiplier - 1)}.`, answer: String(base * multiplier), visual: { type: "pattern_sequence_strip", title: `Multiples of ${base}`, terms: [multiplier - 3, multiplier - 2, multiplier - 1].map((value) => String(base * value)).concat("?") } }, structure: "multiple-constraint" };
  }

  archetype = descriptorCode === "AC9M6A01" ? 0 : descriptorCode === "AC9M6A02" ? (index % 2 === 0 ? 1 : 4) : (index % 2 === 0 ? 2 : 3);
  if (archetype === 0) {
    if (index % 2 === 1) {
      const denominator = 4 + (seed % 5); const start = 1 + (index % 3); const step = 1 + (seed % 3);
      return { question: { kind: "typed_response", prompt: "Continue the rational-number pattern. Give the missing numerator.", answer: String(start + 4 * step), visual: { type: "pattern_sequence_strip", title: `Equal steps with denominator ${denominator}`, terms: [0, 1, 2, 3].map((position) => `${start + position * step}/${denominator}`).concat(`?/${denominator}`) } }, structure: "rational-sequence" };
    }
    const start = 3 + (seed % 6); const step = 4 + (index % 7);
    return { question: { kind: "typed_response", prompt: "Generalise the growth rule. How many tiles are in Stage 10?", answer: String(start + 9 * step), visual: { type: "growing_pattern", title: "Visual growth", stages: [1, 2, 3, 4].map((stage) => ({ label: `Stage ${stage}`, count: start + (stage - 1) * step, style: "tiles" })) } }, structure: "stage-generalisation" };
  }
  if (archetype === 1) {
    const multiply = 2 + (index % 4); const add = 3 + (seed % 8); const input = 5 + (index % 7);
    return { question: { kind: "typed_response", prompt: "Apply the two-step rule to the new input.", answer: String(input * multiply + add), visual: { type: "input_output_table", title: `Multiply by ${multiply}, then add ${add}`, pairs: [1, 2, 4].map((value) => ({ input: String(value), output: String(value * multiply + add) })).concat({ input: String(input), output: "?" }) } }, structure: "multi-representation-rule" };
  }
  if (archetype === 2) {
    const a = 3 + (seed % 8); const b = 2 + (index % 6); const outside = 2 + (seed % 4);
    return { question: { kind: "typed_response", prompt: "Use the brackets first, then calculate.", answer: String((a + b) * outside), visual: { type: "bracket_equation_card", title: "Order of operations", left: `(${a} + ${b}) × ${outside}`, right: "?", bracketGroup: `${a} + ${b}`, outsideFactor: `× ${outside}` } }, structure: "bracket-order" };
  }
  if (archetype === 3) {
    const unknown = 4 + (seed % 10); const add = 3 + (index % 7); const outside = 2 + (index % 4);
    return { question: { kind: "typed_response", prompt: "Undo the operations in reverse order to find the unknown.", answer: String(unknown), visual: { type: "bracket_equation_card", title: "Complex unknown", left: `(? + ${add}) × ${outside}`, right: String((unknown + add) * outside), bracketGroup: `? + ${add}`, outsideFactor: `× ${outside}` } }, structure: "reverse-algorithm" };
  }
  const input = 4 + (seed % 9); const add = 2 + (index % 6); const multiply = 2 + (seed % 3);
  return { question: { kind: "typed_response", prompt: "Follow the full algorithm and record the final output.", answer: String((input + add) * multiply - 2), visual: { type: "expression_flow", title: "Three-step algorithm", cards: [{ label: "Start", tokens: [String(input)] }, { label: "Step 1", tokens: [String(input), "+", String(add)], result: String(input + add) }, { label: "Steps 2 and 3", tokens: [String(input + add), "×", String(multiply), "−", "2"], result: "?" }] } }, structure: "three-step-algorithm" };
}

function descriptorSlots(level: PatternPeaksLevel, form: PatternPeaksAssessmentKind) {
  const blueprint = getPatternPeaksAssessmentBlueprint(level)!;
  return blueprint.descriptors.flatMap((descriptor) => Array.from({ length: descriptor.allocation[form] }, () => descriptor));
}

function buildForm(level: PatternPeaksLevel, form: PatternPeaksAssessmentKind): AssessmentQuestion[] {
  const blueprint = getPatternPeaksAssessmentBlueprint(level)!;
  const profile = blueprint.forms.find((candidate) => candidate.kind === form);
  if (!profile) return [];
  const descriptors = descriptorSlots(level, form);
  const difficulties = expandMix(profile.difficultyMix);
  const cognitive = expandMix(profile.cognitiveMix);

  return Array.from({ length: 20 }, (_, index) => {
    const descriptor = descriptors[index]!;
    const core = authoredQuestion(level, form, index, descriptor.code);
    core.question.prompt = `Peak ${form === "pretest" ? "North" : "South"}-${index + 1}: ${core.question.prompt}`;
    const isSelected = index < profile.selectedResponseMaximum;
    const question: PatternQuestion = isSelected ? numericChoice(core.question, index) : core.question;
    const responseMode: AssessmentResponseMode = isSelected ? "selected_response" : "constructed_response";
    const itemDifficulty = difficulty(difficulties[index]!);
    const cognitiveCategory = cognition(cognitive[index]!);
    const week = descriptor.weeks[index % descriptor.weeks.length] ?? 1;
    const misconception = descriptor.misconceptionIds[index % Math.max(1, descriptor.misconceptionIds.length)];
    const shortForm = form === "pretest" ? "pre" : "post";
    const id = `pattern-peaks-y${level}-${shortForm}-q${String(index + 1).padStart(2, "0")}-v1`;
    const options = question.kind === "multiple_choice" ? question.options.map((label, optionIndex) => ({ id: String(optionIndex), label })) : undefined;
    const correctIndex = question.kind === "multiple_choice" ? question.options.indexOf(question.answer) : -1;
    const task: PracticeTask = {
      kind: "patternPeaksQuestion",
      prompt: question.prompt,
      speakText: `${question.prompt}${/[.!?]$/.test(question.prompt) ? "" : "."} ${question.kind === "multiple_choice" ? `Options: ${question.options.join(", ")}.` : "Type the missing value in the question mark."}`,
      target: Number(question.answer) || 1,
      question,
      answerCount: question.kind === "typed_response" ? Number(question.answer) : undefined,
      options,
      correctOptionIds: correctIndex >= 0 ? [String(correctIndex)] : undefined,
      presentation: "assessment",
      feedback: { correct: "Response recorded.", wrong: "Response recorded." },
    };

    return {
      schemaVersion: 1,
      id,
      version: "1.0.0",
      realm: "pattern",
      level,
      form,
      origin: "assessment_authored",
      sourcePool: form,
      bankId: `pattern-peaks-year-${level}-${form}-v1`,
      primaryDescriptorCode: descriptor.code,
      descriptorCodes: [descriptor.code],
      curriculumLessonMapping: [{ week, lesson: (index % 3) + 1 }],
      cognitiveCategory,
      difficulty: itemDifficulty,
      isTransfer: cognitiveCategory === "transfer",
      requiresReasoning: cognitiveCategory === "reasoning" || cognitiveCategory === "transfer",
      misconceptionDiagnosis: Boolean(misconception),
      responseMode,
      misconceptionTags: misconception ? [misconception] : [],
      contextKey: `pattern-peaks-y${level}-${form}-evidence-${index + 1}`,
      structureKey: `pattern-peaks-y${level}-${form}-${core.structure}-${index + 1}`,
      selectedAnswerPosition: correctIndex >= 0 ? correctIndex : undefined,
      prompt: question.prompt,
      renderer: { type: "pattern_peaks_assessment_task", payload: task },
      scoring: { kind: "interaction", correctResponse: CORRECT_TOKEN },
      statistics: createUncalibratedItemStatistics(itemDifficulty),
      type: "patternPeaksTask",
      correctAnswer: CORRECT_TOKEN,
      answer: CORRECT_TOKEN,
      skillId: descriptor.code.toLowerCase(),
      skillLabel: descriptor.description,
      linkedWeeks: [week],
      linkedLessons: [(index % 3) + 1],
      strand: "Algebra",
      curriculumCodes: [descriptor.code],
      difficultyBand: `year-${level}-pattern-peaks`,
      visual: { type: "pattern_peaks_assessment", questionKind: question.kind, structure: core.structure },
      practiceTask: task,
    };
  });
}

export const PATTERN_PEAKS_INDEPENDENT_ASSESSMENT_FORMS: Record<FormKey, AssessmentQuestion[]> = Object.fromEntries(
  ([3, 4, 5, 6] as const).flatMap((level) =>
    (["pretest", "posttest"] as const)
      .filter((form) => !(level === 3 && form === "pretest"))
      .map((form) => [`${level}-${form}` as FormKey, buildForm(level, form)]),
  ),
) as Record<FormKey, AssessmentQuestion[]>;

export function getPatternPeaksIndependentAssessment(level: number, form: PatternPeaksAssessmentKind) {
  if (!Number.isInteger(level) || level < 3 || level > 6 || (level === 3 && form === "pretest")) return [];
  return PATTERN_PEAKS_INDEPENDENT_ASSESSMENT_FORMS[`${level as PatternPeaksLevel}-${form}`] ?? [];
}
