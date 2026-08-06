import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { getPosttestForYearLabel, getPretestForYearLabel } from "../data/assessments/api";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { NUMBER_NEXUS_MISCONCEPTION_LIBRARY } from "../data/assessments/numberNexusMisconceptions";
import type { Question } from "../data/assessments/posttests";
import {
  YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/year1NumberNexusIndependentBanks";
import { buildYear1NumberNexusWeeklyQuiz } from "../data/quizzes/year1NumberNexus";
import { buildYear1Week11PatternQuizItems } from "../data/quizzes/year1Week11Patterns";

type Candidate = Question & IndependentAssessmentItem;
const failures: string[] = [];
let passed = 0;

function check(condition: boolean, message: string) {
  if (condition) passed += 1;
  else failures.push(message);
}

function counts(values: readonly string[]) {
  return values.reduce<Record<string, number>>((result, value) => {
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}

function sameCounts(actual: Record<string, number>, expected: Record<string, number>) {
  return Object.keys({ ...actual, ...expected }).every((key) => (actual[key] ?? 0) === (expected[key] ?? 0));
}

function wrongAnswer(item: Candidate) {
  if (item.type === "numeric") return String(Number(item.correctAnswer) + 1);
  if (item.type === "number_order") return item.correctAnswer.split("||").reverse().join("||");
  if (item.type === "pattern_build") {
    const alternative = (item.options ?? []).map(String).find((option) => !item.correctAnswer.split("||").includes(option)) ?? "__wrong__";
    return item.correctAnswer.split("||").map(() => alternative).join("||");
  }
  return String(item.options?.find((option) => String(option) !== item.correctAnswer) ?? "__wrong__");
}

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((entry) => entry.level === 1);
check(Boolean(blueprint), "Year 1 blueprint is missing.");
check(blueprint?.descriptors.every((entry) => entry.curriculumMapping.implementationStatus === "aligned") === true, "Year 1 curriculum is not fully aligned.");

const forms = [
  { kind: "pretest", bank: YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS, difficulty: { easy: 10, moderate: 8, challenging: 2 }, cognitive: { recall: 4, understanding: 7, application: 6, reasoning: 3, transfer: 0 } },
  { kind: "posttest", bank: YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS, difficulty: { easy: 7, moderate: 8, challenging: 5 }, cognitive: { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 } },
] as const;

const misconceptionById = new Map(NUMBER_NEXUS_MISCONCEPTION_LIBRARY.map((entry) => [entry.id, entry]));
const weeklyPrompts = new Set<string>();
for (let week = 1; week <= 12; week += 1) {
  const questions = week === 11 ? buildYear1Week11PatternQuizItems() : buildYear1NumberNexusWeeklyQuiz(week);
  questions.forEach((question) => weeklyPrompts.add(question.prompt.trim().toLowerCase()));
}

const allItems = forms.flatMap((form) => form.bank) as Candidate[];
check(allItems.length === 40, "Year 1 candidate banks must contain 40 items.");
check(new Set(allItems.map((item) => item.id)).size === 40, "Candidate IDs must be unique across forms.");
check(new Set(allItems.map((item) => item.contextKey)).size === 40, "Candidate contexts must be unique across forms.");
check(new Set(allItems.map((item) => item.structureKey)).size === 40, "Candidate structures must be unique across forms.");
check(new Set(allItems.map((item) => item.prompt)).size === 40, "Candidate prompts must be unique across forms.");
check(allItems.every((item) => !weeklyPrompts.has(item.prompt.trim().toLowerCase())), "An assessment prompt duplicates a weekly quiz prompt.");

for (const form of forms) {
  const bank = form.bank as readonly Candidate[];
  const formBlueprint = blueprint?.forms.find((entry) => entry.kind === form.kind);
  const expectedDescriptors = Object.fromEntries((blueprint?.descriptors ?? []).map((entry) => [entry.code, entry.allocation[form.kind]]));

  check(bank.length === 20, `${form.kind} must contain 20 items.`);
  check(formBlueprint?.passPercent === 85, `${form.kind} must retain the 85% pass threshold.`);
  check(sameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), expectedDescriptors), `${form.kind} descriptor allocation is incorrect.`);
  check(sameCounts(counts(bank.map((item) => item.difficulty)), form.difficulty), `${form.kind} difficulty mix is incorrect.`);
  check(sameCounts(counts(bank.map((item) => item.cognitiveCategory)), form.cognitive), `${form.kind} cognitive mix is incorrect.`);

  const selected = bank.filter((item) => item.responseMode === "selected_response").length;
  const generated = bank.filter((item) => item.responseMode === "constructed_response" || item.responseMode === "manipulated_response").length;
  check(selected <= (formBlueprint?.responseMix.selectedResponseMaximum ?? 0), `${form.kind} exceeds its selected-response maximum.`);
  check(generated >= (formBlueprint?.responseMix.constructedOrManipulatedMinimum ?? 20), `${form.kind} misses its generated-response minimum.`);
  check(bank.every((item) => item.visual && typeof item.visual === "object"), `${form.kind} contains an item without an assessment-native visual.`);
  check(bank.every((item) => item.prompt.trim().split(/\s+/).length <= 16), `${form.kind} contains a prompt above the Year 1 reading ceiling.`);

  for (const item of bank) {
    check(item.version === "1.0.0" && item.schemaVersion === 1, `${item.id} has incorrect version metadata.`);
    check(item.realm === "number" && item.level === 1 && item.form === form.kind, `${item.id} targets the wrong form.`);
    check(item.origin === "assessment_authored" && item.sourcePool === form.kind, `${item.id} is not independent assessment content.`);
    check(item.bankId === `number-nexus-level-1-${form.kind}-v1`, `${item.id} has the wrong bank ID.`);
    check(item.statistics.calibrationStatus === "uncalibrated" && item.statistics.sampleSize === 0, `${item.id} must start uncalibrated.`);
    check(item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id} omits its primary descriptor.`);
    check(item.curriculumLessonMapping.length > 0, `${item.id} has no lesson origin metadata.`);
    check(item.misconceptionTags.length > 0, `${item.id} has no misconception tag.`);
    check(item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id} has a misconception outside its descriptor.`);
    check(item.isTransfer === (item.cognitiveCategory === "transfer"), `${item.id} has incorrect transfer metadata.`);
    check(item.requiresReasoning === (["reasoning", "transfer"].includes(item.cognitiveCategory)), `${item.id} has incorrect reasoning metadata.`);
    check(isAssessmentAnswerCorrect(item, item.correctAnswer), `${item.id} rejects its expected answer.`);
    check(!isAssessmentAnswerCorrect(item, wrongAnswer(item)), `${item.id} accepts a known wrong answer.`);

    if (item.type === "mcq") {
      const options = (item.options ?? []).map(String);
      check(options.includes(item.correctAnswer), `${item.id} options omit the expected answer.`);
      check(item.selectedAnswerPosition === options.indexOf(item.correctAnswer) + 1, `${item.id} has an incorrect answer position.`);
    } else {
      check(item.selectedAnswerPosition === undefined, `${item.id} generated response has a selected-answer position.`);
    }
  }
}

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/year1NumberNexusIndependentBanks.ts"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
const shellSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentShell.tsx"), "utf8");
const cardSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentQuestionCard.tsx"), "utf8");
const year1VisualSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/NumberNexusYear1AssessmentVisual.tsx"), "utf8");
check(!/data\/activities|data\/quizzes/.test(bankSource), "Candidate banks import lesson or weekly-quiz content.");
check(apiSource.includes("YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS") && apiSource.includes("YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS"), "Production resolver does not import both approved Year 1 banks.");
check(getPretestForYearLabel("Year 1", "number").every((item, index) => item.id === YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS[index]?.id), "Year 1 Pre-Test production route does not resolve the independent bank.");
check(getPosttestForYearLabel("Year 1", "number")?.questions.every((item, index) => item.id === YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS[index]?.id) === true, "Year 1 Post-Test production route does not resolve the independent bank.");
check(allItems.every((item) => typeof (item.visual as { type?: unknown })?.type === "string" && String((item.visual as { type: string }).type).startsWith("number_y1_")), "A Year 1 production item does not use the modern Year 1 visual system.");
check(shellSource.includes('isGroundNumber || year === "Year 1"') && shellSource.includes("max-w-6xl"), "Year 1 assessments do not use the modern wide Number Nexus shell.");
check(cardSource.includes('visual.type.startsWith("number_y1_")') && cardSource.includes("isEarlyNumberVisual"), "Year 1 assessments do not use modern light answer controls.");
const moneyItems = allItems.filter((item) => String((item.visual as { type?: unknown })?.type).startsWith("number_y1_money"));
check(moneyItems.length === 4, "Year 1 assessment money-item coverage changed unexpectedly.");
check(moneyItems.every((item) => {
  const visual = item.visual as { type: string; labels?: string[]; groups?: number[][] };
  if (visual.type === "number_y1_money_compare") return visual.groups?.flat().every((value) => [1, 2, 5, 10].includes(value)) === true;
  return Array.isArray(visual.labels) && visual.labels.length > 0;
}), "A Year 1 money item lacks item labels or uses an unsupported denomination.");
check(year1VisualSource.includes('renderCoins } from "@/components/week7/moneyAssets"') && year1VisualSource.includes("renderCoins(amount)"), "Year 1 assessment money visuals do not use the canonical coin and note artwork.");
const mabItems = allItems.filter((item) => (item.visual as { type?: unknown })?.type === "number_y1_place_value" && typeof (item.visual as { tens?: unknown }).tens === "number");
check(mabItems.length === 2 && mabItems.every((item) => item.prompt.includes("10") && item.prompt.includes("small block is 1")), "A Year 1 MAB item does not explain the ten and one convention in read-aloud text.");
check(year1VisualSource.includes('aria-label={`${tens} tens blocks, worth ${tens * 10}`}') && year1VisualSource.includes("Array.from({ length: 10 }"), "Year 1 MAB rods are not visibly segmented into ten units.");

if (failures.length > 0) {
  console.error(`Year 1 Number Nexus bank audit failed: ${failures.length} failure(s), ${passed} checks passed.`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Year 1 Number Nexus production bank audit passed: 40/40 items across 2 forms; ${passed} validation checks passed.`);
