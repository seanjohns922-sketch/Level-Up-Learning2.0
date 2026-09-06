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

function authoredQuestion(
  level: PatternPeaksLevel,
  form: PatternPeaksAssessmentKind,
  index: number,
  descriptorCode: string,
  descriptorIndex = index,
): { question: TypedResponseQuestion; structure: string } {
  const offset = form === "posttest" ? 17 : 3;
  const seed = level * 101 + index * 13 + offset;
  let archetype = index % 5;

  if (level === 3) {
    if (descriptorCode === "AC9M3A01") {
      archetype = descriptorIndex % 3;
      const whole = 54 + descriptorIndex * 9 + (seed % 18);
      const part = 16 + descriptorIndex * 3 + (seed % 9);
      if (archetype === 0) {
        return { question: { kind: "typed_response", prompt: "Find the unknown addend.", answer: String(whole - part), visual: { type: "unknown_tile_equation", title: "Addition unknown", left: `${part} + ?`, right: String(whole) } }, structure: "add-sub-inverse" };
      }
      if (archetype === 1) {
        const remainder = whole - part;
        return { question: { kind: "typed_response", prompt: "Find the missing part.", answer: String(part), visual: { type: "unknown_tile_equation", title: "Subtraction unknown", left: `${whole} − ?`, right: String(remainder) } }, structure: "subtraction-unknown" };
      }
      const firstPartition = 20 + descriptorIndex * 4;
      return { question: { kind: "typed_response", prompt: "Complete the equivalent number sentence.", answer: String(whole - firstPartition), visual: { type: "balance_equation_card", title: "Partition the same total", left: String(whole), right: `${firstPartition} + ?` } }, structure: "partition-equivalence" };
    }

    if (descriptorCode === "AC9M3A02") {
      archetype = descriptorIndex % 2;
      const first = 6 + ((seed + descriptorIndex) % 5);
      const second = 5 + ((seed + descriptorIndex * 2) % 6);
      if (archetype === 0) {
        const scale = descriptorIndex >= 3 ? 100 : 10;
        return { question: { kind: "typed_response", prompt: "Extend the addition fact to calculate the larger sum.", answer: String((first + second) * scale), visual: { type: "expression_flow", title: "Extend a known addition fact", cards: [{ label: "Known fact", tokens: [String(first), "+", String(second), "=", String(first + second)] }, { label: "Larger calculation", tokens: [String(first * scale), "+", String(second * scale)], result: "?" }] } }, structure: "derived-addition-fact" };
      }
      const total = first + second;
      const scale = descriptorIndex >= 3 ? 100 : 10;
      return { question: { kind: "typed_response", prompt: "Extend the subtraction fact to calculate the larger difference.", answer: String(first * scale), visual: { type: "expression_flow", title: "Extend a known subtraction fact", cards: [{ label: "Known fact", tokens: [String(total), "−", String(second), "=", String(first)] }, { label: "Larger calculation", tokens: [String(total * scale), "−", String(second * scale)], result: "?" }] } }, structure: "derived-subtraction-fact" };
    }

    if (descriptorCode === "AC9M3A03") {
      const factor = [3, 4, 5, 10][descriptorIndex % 4]!;
      const other = 4 + ((seed + descriptorIndex) % 7);
      const product = factor * other;
      if (descriptorIndex === 4) {
        return { question: { kind: "typed_response", prompt: "Find the value that makes both related facts true.", answer: String(other), visual: { type: "expression_flow", title: "Connected multiplication and division facts", cards: [{ tokens: [String(factor), "×", "?", "=", String(product)] }, { tokens: [String(product), "÷", "?", "=", String(factor)] }] } }, structure: "connected-fact-family" };
      }
      if (descriptorIndex % 2 === 0) {
        return { question: { kind: "typed_response", prompt: "Find the product.", answer: String(product), visual: { type: "unknown_tile_equation", title: `${factor} multiplication fact`, left: `${factor} × ${other}`, right: "?" } }, structure: "multiplication-fact" };
      }
      return { question: { kind: "typed_response", prompt: "Find the related quotient.", answer: String(other), visual: { type: "unknown_tile_equation", title: "Related division fact", left: `${product} ÷ ${factor}`, right: "?" } }, structure: "related-division-fact" };
    }

    archetype = descriptorIndex % 3;
    if (archetype === 0) {
      const base = [2, 3, 5, 10][descriptorIndex % 4]!;
      const startMultiplier = 3 + descriptorIndex;
      const terms = Array.from({ length: 6 }, (_, position) => base * (startMultiplier + position));
      const missingPosition = descriptorIndex >= 3 ? 4 : 3;
      return { question: { kind: "typed_response", prompt: "Follow the algorithm. Type the missing multiple.", answer: String(terms[missingPosition]), visual: { type: "pattern_sequence_strip", title: `Add ${base} each step`, terms: terms.map((value, position) => position === missingPosition ? "?" : String(value)) } }, structure: "multiple-algorithm" };
    }
    if (archetype === 1) {
      const input = 23 + descriptorIndex * 7;
      const even = input % 2 === 0;
      const hasFinalStep = descriptorIndex >= 4;
      const branchResult = even ? input / 2 : input + 5;
      const answer = hasFinalStep ? branchResult * 2 : branchResult;
      return { question: { kind: "typed_response", prompt: hasFinalStep ? "Follow the decision branch, then double its result. What is the output?" : "Follow the correct decision branch. What is the output?", answer: String(answer), visual: { type: "decision_path_card", title: "Odd or even decision", input: String(input), decision: "Is the input even?", passLabel: hasFinalStep ? "Yes: halve, then double" : "Yes: halve it", failLabel: hasFinalStep ? "No: add 5, then double" : "No: add 5", activeBranch: even ? "pass" : "fail" } }, structure: "odd-even-algorithm" };
    }
    const input = 4 + descriptorIndex;
    const add = [3, 5, 10][descriptorIndex % 3]!;
    return { question: { kind: "typed_response", prompt: "Follow both steps in order. What is the final output?", answer: String((input + add) * 2), visual: { type: "expression_flow", title: "Two-step number algorithm", cards: [{ label: "Input", tokens: [String(input)] }, { label: "Step 1", tokens: ["add", String(add)] }, { label: "Step 2", tokens: ["double"], result: "?" }] } }, structure: "ordered-number-algorithm" };
  }

  if (level === 4) {
    const descriptorIndex = Math.floor(index / 2);
    if (descriptorCode === "AC9M4A01") {
      archetype = descriptorIndex % 4;
      if (archetype <= 1) {
        const whole = 130 + (seed % 160); const part = 35 + (index * 7 % 80);
        const left = archetype === 0 ? `${part} + ?` : `? + ${part}`;
        return { question: { kind: "typed_response", prompt: "Find the unknown addend.", answer: String(whole - part), visual: { type: "unknown_tile_equation", title: "Addition equation", left, right: String(whole) } }, structure: "unknown-position" };
      }
      if (archetype === 2) {
        const whole = 180 + (seed % 170); const remaining = 45 + (index * 9 % 90);
        return { question: { kind: "typed_response", prompt: "Which value completes the subtraction equation?", answer: String(whole - remaining), visual: { type: "inverse_step_card", title: "Subtraction equation", equation: `${whole} − ? = ${remaining}`, inverseOperation: `${whole} − ${remaining}` } }, structure: "inverse-add-sub" };
      }
      const a = 16 + index; const b = 25 + (seed % 16); const c = 24 + (index % 8);
      return { question: { kind: "typed_response", prompt: "Calculate the total.", answer: String(a + b + c), visual: { type: "expression_flow", title: "Addition expression", cards: [{ tokens: [String(a), "+", String(b), "+", String(c)] }, { tokens: [String(a), "+", `(${b} + ${c})`], result: "?" }] } }, structure: "regroup-addends" };
    }

    archetype = (descriptorIndex + (form === "posttest" ? 2 : 0)) % 4;
    const factor = [6, 7, 8, 9][descriptorIndex % 4]!;
    const groups = 4 + (seed % 9);
    const product = factor * groups;
    if (archetype === 0) {
      return { question: { kind: "typed_response", prompt: "Find the missing second factor.", answer: String(groups), visual: { type: "inverse_step_card", title: "Multiplication equation", equation: `${factor} × ? = ${product}`, inverseOperation: `${product} ÷ ${factor}` } }, structure: "missing-factor-right" };
    }
    if (archetype === 1) {
      return { question: { kind: "typed_response", prompt: "Find the missing first factor.", answer: String(factor), visual: { type: "inverse_step_card", title: "Multiplication equation", equation: `? × ${groups} = ${product}`, inverseOperation: `${product} ÷ ${groups}` } }, structure: "missing-factor-left" };
    }
    if (archetype === 2) {
      return { question: { kind: "typed_response", prompt: "Find the quotient.", answer: String(groups), visual: { type: "inverse_step_card", title: "Division equation", equation: `${product} ÷ ${factor} = ?`, inverseOperation: `${factor} × ${groups}` } }, structure: "related-division-quotient" };
    }
    return { question: { kind: "typed_response", prompt: "Find the missing divisor.", answer: String(factor), visual: { type: "inverse_step_card", title: "Division equation", equation: `${product} ÷ ? = ${groups}`, inverseOperation: `${groups} × ${factor}` } }, structure: "related-division-divisor" };
  }

  if (level === 5) {
    const formShift = form === "posttest" ? 5 : 0;

    if (descriptorCode === "AC9M5A01") {
      archetype = (descriptorIndex + formShift) % 3;
      if (archetype === 0) {
        const step = [7, 9, 12, 14][(descriptorIndex + formShift) % 4]!;
        const start = (form === "pretest" ? 28 : 43) + descriptorIndex * 6;
        const terms = Array.from({ length: 6 }, (_, position) => start + step * position);
        const missingPosition = descriptorIndex % 2 === 0 ? 5 : 3;
        return { question: { kind: "typed_response", prompt: "Find the missing term in the sequence.", answer: String(terms[missingPosition]), visual: { type: "pattern_sequence_strip", title: "Extended natural-number sequence", terms: terms.map((value, position) => position === missingPosition ? "?" : String(value)) } }, structure: "extended-additive-sequence" };
      }
      if (archetype === 1) {
        const start = (form === "pretest" ? 0.35 : 0.6) + descriptorIndex * 0.1;
        const step = [0.2, 0.25, 0.4][(descriptorIndex + formShift) % 3]!;
        const terms = Array.from({ length: 6 }, (_, position) => Number((start + step * position).toFixed(2)));
        const missingPosition = descriptorIndex % 2 === 0 ? 4 : 2;
        return { question: { kind: "typed_response", prompt: "Complete the decimal sequence.", answer: String(terms[missingPosition]), visual: { type: "pattern_sequence_strip", title: "Extended decimal sequence", terms: terms.map((value, position) => position === missingPosition ? "?" : String(value)) } }, structure: "decimal-additive-sequence" };
      }
      const denominator = [4, 5, 6, 8][(descriptorIndex + formShift) % 4]!;
      const numeratorStep = 1 + ((descriptorIndex + formShift) % 3);
      const numeratorStart = 1 + descriptorIndex + (form === "posttest" ? 2 : 0);
      const numerators = Array.from({ length: 6 }, (_, position) => numeratorStart + numeratorStep * position);
      const missingPosition = descriptorIndex % 2 === 0 ? 5 : 3;
      return { question: { kind: "typed_response", prompt: "Complete the fraction sequence. Type the missing numerator.", answer: String(numerators[missingPosition]), visual: { type: "pattern_sequence_strip", title: "Extended fraction sequence", terms: numerators.map((value, position) => position === missingPosition ? `?/${denominator}` : `${value}/${denominator}`) } }, structure: "fraction-additive-sequence" };
    }

    if (descriptorCode === "AC9M5A02") {
      archetype = (descriptorIndex + formShift) % 4;
      if (archetype === 0) {
        const factor = 7 + ((seed + descriptorIndex) % 12) + (form === "posttest" ? 11 : 0); const other = 4 + ((descriptorIndex + formShift) % 8); const product = factor * other;
        return { question: { kind: "typed_response", prompt: "Find the unknown factor.", answer: String(factor), visual: { type: "unknown_tile_equation", title: "Equivalent multiplication sentence", left: `? × ${other}`, right: String(product) } }, structure: "multiplicative-unknown" };
      }
      if (archetype === 1) {
        const divisor = 4 + ((seed + descriptorIndex) % 9) + (form === "posttest" ? 3 : 0); const quotient = 5 + ((descriptorIndex + formShift) % 8); const dividend = divisor * quotient;
        return { question: { kind: "typed_response", prompt: "Find the unknown divisor.", answer: String(divisor), visual: { type: "unknown_tile_equation", title: "Equivalent division sentence", left: `${dividend} ÷ ?`, right: String(quotient) } }, structure: "division-unknown" };
      }
      if (archetype === 2) {
        const a = 3 + ((seed + descriptorIndex) % 6) + (form === "posttest" ? 2 : 0); const b = 4 + ((descriptorIndex + 2) % 7); const c = 2 + ((seed + formShift) % 5);
        return { question: { kind: "typed_response", prompt: "Calculate the value of the expression.", answer: String(a * b * c), visual: { type: "expression_flow", title: "Equivalent multiplication expressions", cards: [{ tokens: [String(a), "×", String(b), "×", String(c)] }, { tokens: [`(${a} × ${b})`, "×", String(c)], result: "?" }] } }, structure: "multiplication-property" };
      }
      const factor = 6 + ((seed + descriptorIndex) % 8) + (form === "posttest" ? 4 : 0); const extra = 3 + ((descriptorIndex + formShift) % 7);
      return { question: { kind: "typed_response", prompt: "Find the value of the equivalent expression.", answer: String(factor * (10 + extra)), visual: { type: "expression_flow", title: "Equivalent distributive expressions", cards: [{ tokens: [String(factor), "×", `(10 + ${extra})`] }, { tokens: [`${factor} × 10`, "+", `${factor} × ${extra}`], result: "?" }] } }, structure: "distributive-equivalence" };
    }

    archetype = (descriptorIndex + formShift) % 3;
    if (archetype === 0) {
      const product = [36, 40, 48, 54, 60, 72, 84, 90][(descriptorIndex + formShift) % 8]!;
      let pairCount = 0;
      for (let value = 1; value <= Math.sqrt(product); value += 1) if (product % value === 0) pairCount += 1;
      return { question: { kind: "typed_response", prompt: `How many factor pairs does ${product} have?`, answer: String(pairCount), visual: { type: "factor_pair_tree", title: "Systematic factor search", product, pairs: [] } }, structure: "factor-search-algorithm" };
    }
    if (archetype === 1) {
      const first = [4, 6, 8, 9][(descriptorIndex + formShift) % 4]!;
      const second = [6, 8, 10, 12][(descriptorIndex + 2 + formShift) % 4]!;
      let common = Math.max(first, second);
      while (common % first !== 0 || common % second !== 0) common += 1;
      return { question: { kind: "typed_response", prompt: `Find the least common multiple of ${first} and ${second}.`, answer: String(common), visual: { type: "pattern_sequence_strip", title: "Compare two multiple sequences", terms: [`Multiples of ${first}`, `Multiples of ${second}`, "First match: ?"] } }, structure: "common-multiple-algorithm" };
    }
    const base = [5, 6, 7, 8, 9][(descriptorIndex + formShift) % 5]!;
    const lower = base * (5 + descriptorIndex);
    const upper = lower + base * (3 + (descriptorIndex % 2));
    const count = Math.floor(upper / base) - Math.floor(lower / base) + 1;
    return { question: { kind: "typed_response", prompt: `How many multiples of ${base} are there from ${lower} to ${upper}, including both endpoints?`, answer: String(count), visual: { type: "pattern_sequence_strip", title: "Systematic multiple search", terms: [String(lower), "…", String(upper)] } }, structure: "multiple-search-algorithm" };
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
    return { question: { kind: "typed_response", prompt: "What is the missing output?", answer: String(input * multiply + add), visual: { type: "input_output_table", title: `Multiply by ${multiply}, then add ${add}`, pairs: [1, 2, 4].map((value) => ({ input: String(value), output: String(value * multiply + add) })).concat({ input: String(input), output: "?" }) } }, structure: "multi-representation-rule" };
  }
  if (archetype === 2) {
    const a = 3 + (seed % 8); const b = 2 + (index % 6); const outside = 2 + (seed % 4);
    return { question: { kind: "typed_response", prompt: "Calculate the value.", answer: String((a + b) * outside), visual: { type: "bracket_equation_card", title: "Bracketed expression", left: `(${a} + ${b}) × ${outside}`, right: "?", bracketGroup: `${a} + ${b}`, outsideFactor: `× ${outside}` } }, structure: "bracket-order" };
  }
  if (archetype === 3) {
    const unknown = 4 + (seed % 10); const add = 3 + (index % 7); const outside = 2 + (index % 4);
    return { question: { kind: "typed_response", prompt: "Find the missing value in the bracketed equation.", answer: String(unknown), visual: { type: "bracket_equation_card", title: "Bracketed equation", left: `(? + ${add}) × ${outside}`, right: String((unknown + add) * outside), bracketGroup: `? + ${add}`, outsideFactor: `× ${outside}` } }, structure: "reverse-algorithm" };
  }
  const input = 4 + (seed % 9); const add = 2 + (index % 6); const multiply = 2 + (seed % 3);
  return { question: { kind: "typed_response", prompt: "What is the final output?", answer: String((input + add) * multiply - 2), visual: { type: "expression_flow", title: "Three-step algorithm", cards: [{ label: "Start", tokens: [String(input)] }, { label: "Step 1", tokens: [String(input), "+", String(add)], result: String(input + add) }, { label: "Steps 2 and 3", tokens: [String(input + add), "×", String(multiply), "−", "2"], result: "?" }] } }, structure: "three-step-algorithm" };
}

function descriptorSlots(level: PatternPeaksLevel, form: PatternPeaksAssessmentKind) {
  const blueprint = getPatternPeaksAssessmentBlueprint(level)!;
  if (level === 3) {
    const descriptorsByCode = new Map(blueprint.descriptors.map((descriptor) => [descriptor.code, descriptor]));
    return Array.from({ length: 20 }, (_, index) => descriptorsByCode.get(["AC9M3A01", "AC9M3A02", "AC9M3A03", "AC9M3A04"][index % 4]!)!);
  }
  if (level === 4) {
    const [additionAndSubtraction, multiplicationAndDivision] = blueprint.descriptors;
    if (!additionAndSubtraction || !multiplicationAndDivision) return [];
    return Array.from({ length: 20 }, (_, index) => {
      const pretestStartsWithAddition = form === "pretest";
      const useAddition = index % 2 === (pretestStartsWithAddition ? 0 : 1);
      return useAddition ? additionAndSubtraction : multiplicationAndDivision;
    });
  }
  if (level === 5) {
    const descriptorsByCode = new Map(blueprint.descriptors.map((descriptor) => [descriptor.code, descriptor]));
    const pretestCodes = [
      "AC9M5A01", "AC9M5A02", "AC9M5A03", "AC9M5A02", "AC9M5A01",
      "AC9M5A03", "AC9M5A02", "AC9M5A01", "AC9M5A03", "AC9M5A02",
      "AC9M5A01", "AC9M5A03", "AC9M5A02", "AC9M5A01", "AC9M5A03",
      "AC9M5A02", "AC9M5A01", "AC9M5A03", "AC9M5A02", "AC9M5A02",
    ];
    const posttestCodes = [
      "AC9M5A03", "AC9M5A02", "AC9M5A01", "AC9M5A02", "AC9M5A03",
      "AC9M5A01", "AC9M5A02", "AC9M5A03", "AC9M5A01", "AC9M5A02",
      "AC9M5A03", "AC9M5A01", "AC9M5A02", "AC9M5A03", "AC9M5A01",
      "AC9M5A02", "AC9M5A03", "AC9M5A01", "AC9M5A02", "AC9M5A02",
    ];
    return (form === "pretest" ? pretestCodes : posttestCodes).map((code) => descriptorsByCode.get(code)!);
  }
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
    const descriptorIndex = descriptors.slice(0, index).filter((candidate) => candidate.code === descriptor.code).length;
    const core = authoredQuestion(level, form, index, descriptor.code, descriptorIndex);
    core.question.prompt = `Peak ${form === "pretest" ? "North" : "South"}-${index + 1}: ${core.question.prompt}`;
    const isSelected = index < profile.selectedResponseMaximum;
    const question: PatternQuestion = isSelected ? numericChoice(core.question, index) : core.question;
    const responseMode: AssessmentResponseMode = isSelected ? "selected_response" : "constructed_response";
    const itemDifficulty = difficulty(difficulties[index]!);
    const cognitiveCategory = cognition(cognitive[index]!);
    const week = descriptor.weeks[index % descriptor.weeks.length] ?? 1;
    const levelThreeMisconception = level === 3
      ? core.structure.includes("algorithm")
        ? core.structure.includes("multiple") ? "pp-rule-from-one-step" : "pp-algorithm-branch-error"
        : core.structure.includes("derived-")
          ? "pp-additive-fact-extension"
          : core.structure.includes("multiplication") || core.structure.includes("division") || core.structure.includes("fact-family")
            ? "pp-related-fact-confusion"
            : core.structure.includes("partition")
              ? "pp-equals-answer-cue"
              : "pp-operation-direction"
      : undefined;
    const levelFiveMisconception = level === 5
      ? core.structure.includes("sequence")
        ? "pp-sequence-step-confusion"
        : core.structure.includes("distributive")
          ? "pp-distributive-part-missed"
          : core.structure.includes("multiplication-property")
            ? "pp-property-overgeneralisation"
            : core.structure.includes("unknown")
              ? "pp-related-fact-confusion"
              : core.structure.includes("factor-search") || core.structure.includes("multiple-search")
                ? "pp-systematic-search-gap"
                : "pp-factor-multiple-confusion"
      : undefined;
    const misconception = levelThreeMisconception ?? levelFiveMisconception ?? descriptor.misconceptionIds[index % Math.max(1, descriptor.misconceptionIds.length)];
    const shortForm = form === "pretest" ? "pre" : "post";
    const contentVersion = level === 3 || level === 5 ? 2 : 1;
    const id = `pattern-peaks-y${level}-${shortForm}-q${String(index + 1).padStart(2, "0")}-v${contentVersion}`;
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
      version: `${contentVersion}.0.0`,
      realm: "pattern",
      level,
      form,
      origin: "assessment_authored",
      sourcePool: form,
      bankId: `pattern-peaks-year-${level}-${form}-v${contentVersion}`,
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
