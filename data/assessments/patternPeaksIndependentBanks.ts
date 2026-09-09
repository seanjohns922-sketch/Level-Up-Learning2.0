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
    const formShift = form === "posttest" ? 3 : 0;
    if (descriptorCode === "AC9M4A01") {
      archetype = descriptorIndex >= 8 ? (descriptorIndex === 8 ? 4 : 5) : (descriptorIndex + formShift) % 6;
      const challengeLift = descriptorIndex >= 6 ? 120 : 0;
      const whole = 145 + challengeLift + ((seed + descriptorIndex * 19) % 180);
      const part = 34 + ((seed + descriptorIndex * 11) % 90);
      const unknown = whole - part;
      if (archetype === 0) {
        const left = descriptorIndex % 2 === 0 ? `${part} + ?` : `? + ${part}`;
        return { question: { kind: "typed_response", prompt: "What number completes this addition equation?", answer: String(unknown), visual: { type: "unknown_tile_equation", title: "Addition equation", left, right: String(whole) } }, structure: "unknown-addend" };
      }
      if (archetype === 1) {
        return { question: { kind: "typed_response", prompt: "What number is subtracted in this equation?", answer: String(part), visual: { type: "unknown_tile_equation", title: "Subtraction equation", left: `${whole} − ?`, right: String(unknown) } }, structure: "unknown-subtrahend" };
      }
      if (archetype === 2) {
        return { question: { kind: "typed_response", prompt: "What starting number completes this subtraction equation?", answer: String(whole), visual: { type: "unknown_tile_equation", title: "Subtraction equation", left: `? − ${part}`, right: String(unknown) } }, structure: "unknown-minuend" };
      }
      if (archetype === 3) {
        const leftFirst = 75 + ((seed + descriptorIndex) % 85);
        const leftSecond = 35 + ((seed + descriptorIndex * 7) % 70);
        const rightKnown = 40 + ((seed + descriptorIndex * 13) % 80);
        const answer = leftFirst + leftSecond - rightKnown;
        return { question: { kind: "typed_response", prompt: "What number makes both addition expressions equal?", answer: String(answer), visual: { type: "balance_equation_card", title: "Balanced addition equation", left: `${leftFirst} + ${leftSecond}`, right: `${rightKnown} + ?` } }, structure: "balanced-addition-equation" };
      }
      if (archetype === 4) {
        const a = 28 + ((seed + descriptorIndex) % 45);
        const b = 32 + ((seed + descriptorIndex * 5) % 48);
        const move = 6 + ((seed + descriptorIndex) % 18);
        return { question: { kind: "typed_response", prompt: "What number keeps these addition expressions equivalent?", answer: String(b - move), visual: { type: "balance_equation_card", title: "Equivalent addition equations", left: `${a} + ${b}`, right: `${a + move} + ?` } }, structure: "compensating-equivalence" };
      }
      const a = 45 + ((seed + descriptorIndex) % 55);
      const b = 25 + ((seed + descriptorIndex * 3) % 45);
      const c = 15 + ((seed + descriptorIndex * 7) % 35);
      return { question: { kind: "typed_response", prompt: "What number makes the connected equations agree?", answer: String(b + c), visual: { type: "expression_flow", title: "Connected equivalent equations", cards: [{ tokens: [String(a), "+", String(b), "+", String(c)] }, { tokens: [String(a), "+", "?"], result: String(a + b + c) }] } }, structure: "connected-addition-equations" };
    }

    archetype = descriptorIndex >= 8 ? (descriptorIndex === 8 ? 4 : 5) : (descriptorIndex + formShift) % 6;
    const factor = [3, 4, 6, 7, 8, 9][(descriptorIndex + formShift) % 6]!;
    const groups = 3 + ((seed + descriptorIndex * 5) % 8);
    const product = factor * groups;
    if (archetype === 0) {
      return { question: { kind: "typed_response", prompt: "What is the product of this multiplication fact?", answer: String(product), visual: { type: "unknown_tile_equation", title: "Multiplication fact", left: `${factor} × ${groups}`, right: "?" } }, structure: "multiplication-product" };
    }
    if (archetype === 1) {
      const left = descriptorIndex % 2 === 0 ? `${factor} × ?` : `? × ${factor}`;
      return { question: { kind: "typed_response", prompt: "What factor completes this multiplication equation?", answer: String(groups), visual: { type: "unknown_tile_equation", title: "Multiplication equation", left, right: String(product) } }, structure: "multiplication-unknown" };
    }
    if (archetype === 2) {
      return { question: { kind: "typed_response", prompt: "What is the quotient of this related division fact?", answer: String(groups), visual: { type: "unknown_tile_equation", title: "Related division fact", left: `${product} ÷ ${factor}`, right: "?" } }, structure: "division-quotient" };
    }
    if (archetype === 3) {
      return { question: { kind: "typed_response", prompt: "What divisor completes this division equation?", answer: String(factor), visual: { type: "unknown_tile_equation", title: "Division equation", left: `${product} ÷ ?`, right: String(groups) } }, structure: "division-unknown" };
    }
    if (archetype === 4) {
      const derivedFactor = descriptorIndex % 2 === 0 ? 9 : 6;
      const knownFactor = descriptorIndex % 2 === 0 ? 10 : 3;
      const other = 4 + ((seed + descriptorIndex) % 7);
      const derivedProduct = derivedFactor * other;
      const knownProduct = knownFactor * other;
      const relationship = derivedFactor === 9 ? `subtract ${other}` : "double the product";
      return { question: { kind: "typed_response", prompt: "What is the connected multiplication product?", answer: String(derivedProduct), visual: { type: "expression_flow", title: "Derive a multiplication fact", cards: [{ label: "Known fact", tokens: [String(knownFactor), "×", String(other), "=", String(knownProduct)] }, { label: relationship, tokens: [String(derivedFactor), "×", String(other)], result: "?" }] } }, structure: "derived-multiplication-fact" };
    }
    return { question: { kind: "typed_response", prompt: "What number makes both connected fact-family equations true?", answer: String(groups), visual: { type: "expression_flow", title: "Connected multiplication and division facts", cards: [{ tokens: [String(factor), "×", "?", "=", String(product)] }, { tokens: [String(product), "÷", "?", "=", String(factor)] }] } }, structure: "connected-fact-family" };
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

  const formShift = form === "posttest" ? 2 : 0;

  if (descriptorCode === "AC9M6A01") {
    archetype = descriptorIndex % 7;
    if (archetype === 0) {
      const start = 18 + formShift * 7 + descriptorIndex * 3;
      const step = 7 + ((seed + descriptorIndex) % 8);
      const terms = Array.from({ length: 7 }, (_, position) => start + position * step);
      const missingPosition = 5;
      return { question: { kind: "typed_response", prompt: "Complete the extended number sequence.", answer: String(terms[missingPosition]), visual: { type: "pattern_sequence_strip", title: "Natural-number sequence", terms: terms.map((value, position) => position === missingPosition ? "?" : String(value)) } }, structure: "natural-number-sequence" };
    }
    if (archetype === 1) {
      const start = 0.4 + formShift * 0.15;
      const step = [0.25, 0.35, 0.45][(descriptorIndex + formShift) % 3]!;
      const terms = Array.from({ length: 7 }, (_, position) => Number((start + position * step).toFixed(2)));
      const missingPosition = 5;
      return { question: { kind: "typed_response", prompt: "Complete the extended decimal sequence.", answer: String(terms[missingPosition]), visual: { type: "pattern_sequence_strip", title: "Decimal sequence", terms: terms.map((value, position) => position === missingPosition ? "?" : String(value)) } }, structure: "decimal-sequence" };
    }
    if (archetype === 2) {
      const denominator = [5, 6, 8, 10][(descriptorIndex + formShift) % 4]!;
      const numeratorStart = 1 + formShift;
      const numeratorStep = 2 + ((descriptorIndex + formShift) % 3);
      const numerators = Array.from({ length: 7 }, (_, position) => numeratorStart + position * numeratorStep);
      const missingPosition = 5;
      return { question: { kind: "typed_response", prompt: "What numerator completes this extended fraction sequence?", answer: String(numerators[missingPosition]), visual: { type: "pattern_sequence_strip", title: "Fraction sequence", terms: numerators.map((value, position) => position === missingPosition ? `?/${denominator}` : `${value}/${denominator}`) } }, structure: "fraction-sequence" };
    }
    if (archetype === 3) {
      const step = 6 + ((seed + formShift) % 7);
      const start = 30 + formShift * 9;
      const terms = Array.from({ length: 6 }, (_, position) => start + position * step);
      return { question: { kind: "typed_response", prompt: "Work backwards to find the missing first term.", answer: String(terms[0]), visual: { type: "pattern_sequence_strip", title: "Reverse an additive sequence", terms: terms.map((value, position) => position === 0 ? "?" : String(value)) } }, structure: "reverse-sequence" };
    }
    if (archetype === 4) {
      const start = 12 + formShift * 5;
      const step = 9 + ((seed + descriptorIndex) % 7);
      const targetPosition = form === "posttest" ? 14 : 12;
      return { question: { kind: "typed_response", prompt: `The sequence adds ${step} each time. What is term ${targetPosition}?`, answer: String(start + (targetPosition - 1) * step), visual: { type: "pattern_sequence_strip", title: "Apply the sequence rule", terms: [0, 1, 2, 3].map((position) => String(start + position * step)).concat(`Term ${targetPosition}: ?`) } }, structure: "sequence-rule-transfer" };
    }
    if (archetype === 5) {
      const start = 4 + formShift;
      const step = 5 + ((seed + descriptorIndex) % 7);
      const stages = [1, 2, 3, 4].map((stage) => ({ label: `Stage ${stage}`, count: start + (stage - 1) * step, style: "tiles" as const }));
      const targetStage = form === "posttest" ? 12 : 10;
      return { question: { kind: "typed_response", prompt: `How many tiles are in Stage ${targetStage}?`, answer: String(start + (targetStage - 1) * step), visual: { type: "growing_pattern", title: "Visually growing pattern", stages } }, structure: "visual-stage-generalisation" };
    }
    const denominator = [6, 8, 10][formShift % 3]!;
    const numeratorStart = 2 + formShift;
    const firstStep = 3 + formShift;
    const secondStep = 5 + formShift;
    const targetPosition = form === "posttest" ? 10 : 9;
    const numerators = [numeratorStart];
    for (let position = 1; position < targetPosition; position += 1) {
      numerators.push(numerators[position - 1]! + (position % 2 === 1 ? firstStep : secondStep));
    }
    return { question: { kind: "typed_response", prompt: `The numerator increases by ${firstStep}, then ${secondStep}, repeating. What is the numerator of term ${targetPosition}?`, answer: String(numerators[targetPosition - 1]), visual: { type: "pattern_sequence_strip", title: "Alternating rational-number rule", terms: numerators.slice(0, 5).map((value) => `${value}/${denominator}`).concat(`Term ${targetPosition}: ?/${denominator}`) } }, structure: "rational-rule-transfer" };
  }

  if (descriptorCode === "AC9M6A02") {
    archetype = descriptorIndex % 6;
    const a = 5 + ((seed + descriptorIndex) % 9);
    const b = 3 + ((seed + formShift) % 7);
    const outside = 2 + ((descriptorIndex + formShift) % 4);
    if (archetype === 0) {
      return { question: { kind: "typed_response", prompt: "Calculate the bracketed expression.", answer: String((a + b) * outside), visual: { type: "bracket_equation_card", title: "Brackets and operation order", left: `(${a} + ${b}) × ${outside}`, right: "?", bracketGroup: `${a} + ${b}`, outsideFactor: `× ${outside}` } }, structure: "bracket-order" };
    }
    if (archetype === 1) {
      const unknown = 7 + ((seed + descriptorIndex) % 12);
      return { question: { kind: "typed_response", prompt: "Find the unknown inside the brackets.", answer: String(unknown), visual: { type: "bracket_equation_card", title: "Unknown inside brackets", left: `(? + ${b}) × ${outside}`, right: String((unknown + b) * outside), bracketGroup: `? + ${b}`, outsideFactor: `× ${outside}` } }, structure: "bracketed-unknown" };
    }
    if (archetype === 2) {
      const known = a * outside;
      return { question: { kind: "typed_response", prompt: "What number completes these equivalent bracketed expressions?", answer: String(b * outside), visual: { type: "balance_equation_card", title: "Equivalent expressions with brackets", left: `(${a} + ${b}) × ${outside}`, right: `${known} + ?` } }, structure: "bracketed-equivalence" };
    }
    if (archetype === 3) {
      const unknown = 8 + ((seed + descriptorIndex) % 13);
      const rightExtra = 4 + formShift;
      return { question: { kind: "typed_response", prompt: "Find the unknown that makes both sides equal.", answer: String(unknown), visual: { type: "balance_equation_card", title: "Unknown on either side", left: `(? + ${b}) × ${outside}`, right: `${(unknown + b) * outside - rightExtra} + ${rightExtra}` } }, structure: "two-sided-unknown" };
    }
    if (archetype === 4) {
      const unknown = 9 + ((seed + descriptorIndex) % 12);
      const total = (unknown + b) * outside;
      return { question: { kind: "typed_response", prompt: "One value makes both equivalent equations true. Find it.", answer: String(unknown), visual: { type: "expression_flow", title: "Connected bracketed equations", cards: [{ tokens: ["(?", "+", String(b), ")", "×", String(outside), "=", String(total)] }, { tokens: ["?", "×", String(outside), "+", String(b * outside), "=", String(total)] }] } }, structure: "connected-bracketed-equations" };
    }
    const withoutBrackets = a + b * outside;
    const withBrackets = (a + b) * outside;
    return { question: { kind: "typed_response", prompt: "How much does adding the brackets change the value?", answer: String(withBrackets - withoutBrackets), visual: { type: "expression_flow", title: "Compare bracket placement", cards: [{ label: "Without brackets", tokens: [String(a), "+", String(b), "×", String(outside)] }, { label: "With brackets", tokens: ["(", String(a), "+", String(b), ")", "×", String(outside)] }, { label: "Difference", tokens: ["?"] }] } }, structure: "bracket-placement-comparison" };
  }

  archetype = descriptorIndex % 7;
  const input = 4 + ((seed + descriptorIndex) % 9);
  const add = 3 + ((seed + formShift) % 7);
  const multiply = 2 + ((descriptorIndex + formShift) % 3);
  const output = (input + add) * multiply;
  if (archetype === 0) {
    return { question: { kind: "typed_response", prompt: "Follow the function machine. What is the output?", answer: String(output), visual: { type: "expression_flow", title: "Two-step function machine", cards: [{ label: "Input", tokens: [String(input)] }, { label: "Step 1", tokens: ["add", String(add)] }, { label: "Step 2", tokens: ["multiply by", String(multiply)], result: "?" }] } }, structure: "follow-function-machine" };
  }
  if (archetype === 1) {
    const tableInputs = [1, 3, 5, input];
    return { question: { kind: "typed_response", prompt: "Infer the machine rule from every row. What is the missing output?", answer: String(input * multiply + add), visual: { type: "input_output_table", title: "Unknown function-machine rule", pairs: tableInputs.map((value, position) => ({ input: String(value), output: position === tableInputs.length - 1 ? "?" : String(value * multiply + add) })) } }, structure: "infer-function-rule" };
  }
  if (archetype === 2) {
    const first = input * multiply + add;
    const second = (input + add) * multiply;
    return { question: { kind: "typed_response", prompt: "Both machines receive the same input. What is the difference between their outputs?", answer: String(Math.abs(second - first)), visual: { type: "expression_flow", title: "Compare function machines", cards: [{ label: "Machine A", tokens: [String(input), "×", String(multiply), "+", String(add)], result: String(first) }, { label: "Machine B", tokens: ["(", String(input), "+", String(add), ")", "×", String(multiply)], result: String(second) }, { label: "Difference", tokens: ["?"] }] } }, structure: "compare-function-machines" };
  }
  if (archetype === 3) {
    const incorrect = output + 2 + formShift;
    return { question: { kind: "typed_response", prompt: "The recorded output is wrong. What should the output be?", answer: String(output), visual: { type: "input_output_table", title: `Add ${add}, then multiply by ${multiply}`, pairs: [{ input: "2", output: String((2 + add) * multiply) }, { input: "5", output: String((5 + add) * multiply) }, { input: String(input), output: `${incorrect} (check)` }] } }, structure: "debug-function-machine" };
  }
  if (archetype === 4) {
    const even = input % 2 === 0;
    const branchResult = even ? input / 2 : input + add;
    const final = branchResult * multiply;
    return { question: { kind: "typed_response", prompt: "Follow the decision and final algorithm step. What is the output?", answer: String(final), visual: { type: "decision_path_card", title: "Branching number algorithm", input: String(input), decision: "Is the input even?", passLabel: `Yes: halve, then multiply by ${multiply}`, failLabel: `No: add ${add}, then multiply by ${multiply}`, activeBranch: even ? "pass" : "fail" } }, structure: "branching-number-algorithm" };
  }
  if (archetype === 5) {
    const finalOutput = output;
    return { question: { kind: "typed_response", prompt: "Reverse the algorithm to find its input.", answer: String(input), visual: { type: "expression_flow", title: "Reverse a two-step algorithm", cards: [{ label: "Unknown input", tokens: ["?"] }, { label: "Step 1", tokens: ["add", String(add)] }, { label: "Step 2", tokens: ["multiply by", String(multiply)] }, { label: "Output", tokens: [String(finalOutput)] }] } }, structure: "reverse-number-algorithm" };
  }
  const inputs = [2, 4, 6];
  const outputs = inputs.map((value) => (value + add) * multiply);
  return { question: { kind: "typed_response", prompt: "The algorithm generates three outputs. What is their total?", answer: String(outputs.reduce((sum, value) => sum + value, 0)), visual: { type: "expression_flow", title: "Generate a number set", cards: [{ label: "Inputs", tokens: inputs.map(String) }, { label: "Rule for each input", tokens: ["add", String(add), "then multiply by", String(multiply)] }, { label: "Total of all three outputs", tokens: ["?"] }] } }, structure: "generated-number-set" };
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
  if (level === 6) {
    const descriptorsByCode = new Map(blueprint.descriptors.map((descriptor) => [descriptor.code, descriptor]));
    const codes = form === "pretest"
      ? [
          "AC9M6A01", "AC9M6A02", "AC9M6A03", "AC9M6A01", "AC9M6A03",
          "AC9M6A02", "AC9M6A01", "AC9M6A03", "AC9M6A02", "AC9M6A01",
          "AC9M6A03", "AC9M6A02", "AC9M6A01", "AC9M6A03", "AC9M6A02",
          "AC9M6A01", "AC9M6A03", "AC9M6A02", "AC9M6A01", "AC9M6A03",
        ]
      : [
          "AC9M6A03", "AC9M6A02", "AC9M6A01", "AC9M6A03", "AC9M6A01",
          "AC9M6A02", "AC9M6A03", "AC9M6A01", "AC9M6A02", "AC9M6A03",
          "AC9M6A01", "AC9M6A02", "AC9M6A03", "AC9M6A01", "AC9M6A02",
          "AC9M6A03", "AC9M6A01", "AC9M6A02", "AC9M6A03", "AC9M6A01",
        ];
    return codes.map((code) => descriptorsByCode.get(code)!);
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
    const contentVersion = level >= 3 ? 2 : 1;
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
      .map((form) => [`${level}-${form}` as FormKey, buildForm(level, form)]),
  ),
) as Record<FormKey, AssessmentQuestion[]>;

export function getPatternPeaksIndependentAssessment(level: number, form: PatternPeaksAssessmentKind) {
  if (!Number.isInteger(level) || level < 3 || level > 6) return [];
  return PATTERN_PEAKS_INDEPENDENT_ASSESSMENT_FORMS[`${level as PatternPeaksLevel}-${form}`] ?? [];
}
