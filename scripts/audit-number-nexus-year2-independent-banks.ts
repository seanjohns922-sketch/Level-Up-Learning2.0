import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { getPosttestForLevel, getPosttestForYearLabel, getPretestForLevel, getPretestForYearLabel } from "../data/assessments/api";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { NUMBER_NEXUS_MISCONCEPTION_LIBRARY } from "../data/assessments/numberNexusMisconceptions";
import type { Question } from "../data/assessments/posttests";
import {
  YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/year2NumberNexusIndependentBanks";
import { buildYear2NumberNexusWeeklyQuiz } from "../data/quizzes/year2NumberNexus";

type Candidate = Question & IndependentAssessmentItem;
const failures: string[] = [];
let passed = 0;
const check = (condition: boolean, message: string) => condition ? passed += 1 : failures.push(message);
const counts = (values: readonly string[]) => values.reduce<Record<string, number>>((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {});
const sameCounts = (actual: Record<string, number>, expected: Record<string, number>) => Object.keys({ ...actual, ...expected }).every((key) => (actual[key] ?? 0) === (expected[key] ?? 0));

function wrongAnswer(item: Candidate) {
  if (item.type === "numeric") return String(Number(item.correctAnswer) + 1);
  if (item.type === "number_order") return item.correctAnswer.split("||").reverse().join("||");
  return String(item.options?.find((option) => String(option) !== item.correctAnswer) ?? "__wrong__");
}

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((entry) => entry.level === 2);
check(Boolean(blueprint), "Year 2 blueprint is missing.");
check(blueprint?.descriptors.every((entry) => entry.curriculumMapping.implementationStatus === "aligned") === true, "Year 2 curriculum is not fully aligned.");

const forms = [
  { kind: "pretest", bank: YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS, difficulty: { easy: 8, moderate: 9, challenging: 3 }, cognitive: { recall: 3, understanding: 6, application: 7, reasoning: 4, transfer: 0 } },
  { kind: "posttest", bank: YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS, difficulty: { easy: 6, moderate: 9, challenging: 5 }, cognitive: { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 } },
] as const;
const misconceptionById = new Map(NUMBER_NEXUS_MISCONCEPTION_LIBRARY.map((entry) => [entry.id, entry]));
const weeklyPrompts = new Set<string>();
for (let week = 1; week <= 12; week += 1) buildYear2NumberNexusWeeklyQuiz(week).forEach((question) => weeklyPrompts.add(question.prompt.trim().toLowerCase()));

const allItems = forms.flatMap((form) => form.bank) as Candidate[];
check(allItems.length === 40, "Year 2 banks must contain 40 items.");
check(new Set(allItems.map((item) => item.id)).size === 40, "Candidate IDs must be unique.");
check(new Set(allItems.map((item) => item.contextKey)).size === 40, "Candidate contexts must be unique.");
check(new Set(allItems.map((item) => item.structureKey)).size === 40, "Candidate structures must be unique.");
check(new Set(allItems.map((item) => item.prompt)).size === 40, "Candidate prompts must be unique across forms.");
check(allItems.every((item) => !weeklyPrompts.has(item.prompt.trim().toLowerCase())), "An assessment prompt duplicates a weekly quiz prompt.");

for (const form of forms) {
  const bank = form.bank as readonly Candidate[];
  const formBlueprint = blueprint?.forms.find((entry) => entry.kind === form.kind);
  const expectedDescriptors = Object.fromEntries((blueprint?.descriptors ?? []).map((entry) => [entry.code, entry.allocation[form.kind]]));
  check(bank.length === 20, `${form.kind} must contain 20 items.`);
  check(formBlueprint?.passPercent === 85, `${form.kind} must retain the 85% threshold.`);
  check(sameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), expectedDescriptors), `${form.kind} descriptor allocation is incorrect.`);
  check(sameCounts(counts(bank.map((item) => item.difficulty)), form.difficulty), `${form.kind} difficulty mix is incorrect.`);
  check(sameCounts(counts(bank.map((item) => item.cognitiveCategory)), form.cognitive), `${form.kind} cognitive mix is incorrect.`);
  const selected = bank.filter((item) => item.responseMode === "selected_response").length;
  const generated = bank.filter((item) => item.responseMode === "constructed_response" || item.responseMode === "manipulated_response").length;
  check(selected <= (formBlueprint?.responseMix.selectedResponseMaximum ?? 0), `${form.kind} exceeds its selected-response maximum.`);
  check(generated >= (formBlueprint?.responseMix.constructedOrManipulatedMinimum ?? 20), `${form.kind} misses its independent-response minimum.`);
  check(bank.every((item) => item.visual && typeof item.visual === "object"), `${form.kind} has an item without a visual.`);
  check(bank.every((item) => item.prompt.trim().split(/\s+/).length <= 18), `${form.kind} exceeds the Year 2 reading ceiling.`);

  for (const item of bank) {
    check(item.version === "1.0.0" && item.schemaVersion === 1, `${item.id} has incorrect version metadata.`);
    check(item.realm === "number" && item.level === 2 && item.form === form.kind, `${item.id} targets the wrong form.`);
    check(item.origin === "assessment_authored" && item.sourcePool === form.kind, `${item.id} is not independent content.`);
    check(item.bankId === `number-nexus-level-2-${form.kind}-v1`, `${item.id} has the wrong bank ID.`);
    check(item.statistics.calibrationStatus === "uncalibrated" && item.statistics.sampleSize === 0, `${item.id} must start uncalibrated.`);
    check(item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id} omits its primary descriptor.`);
    check(item.curriculumLessonMapping.length > 0, `${item.id} has no lesson-origin metadata.`);
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
    } else check(item.selectedAnswerPosition === undefined, `${item.id} generated response has a selected-answer position.`);
  }
}

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/year2NumberNexusIndependentBanks.ts"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
const shellSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentShell.tsx"), "utf8");
const cardSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentQuestionCard.tsx"), "utf8");
const visualSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/NumberNexusYear2AssessmentVisual.tsx"), "utf8");
check(!/data\/activities|data\/quizzes/.test(bankSource), "Banks import lesson or weekly-quiz content.");
check(apiSource.includes("YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS") && apiSource.includes("YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS"), "Production resolver does not import both Year 2 banks.");
check(getPretestForYearLabel("Year 2", "number").every((item, index) => item.id === YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS[index]?.id), "Year-label Pre-Test route is wrong.");
check(getPretestForLevel(2, "number").every((item, index) => item.id === YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS[index]?.id), "Level Pre-Test route is wrong.");
check(getPosttestForYearLabel("Year 2", "number")?.questions.every((item, index) => item.id === YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS[index]?.id) === true, "Year-label Post-Test route is wrong.");
check(getPosttestForLevel(2, "number")?.questions.every((item, index) => item.id === YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS[index]?.id) === true, "Level Post-Test route is wrong.");
check(allItems.every((item) => String((item.visual as { type?: unknown })?.type).startsWith("number_y2_")), "A production item does not use the Year 2 visual system.");
check(shellSource.includes('year === "Year 2"') && shellSource.includes("max-w-6xl"), "Year 2 does not use the modern wide shell.");
check(cardSource.includes('visual.type.startsWith("number_y2_")') && cardSource.includes("NumberNexusYear2AssessmentVisual"), "Year 2 visuals are not dispatched by the assessment card.");
check(visualSource.includes('renderCoins } from "@/components/week7/moneyAssets"') && visualSource.includes("renderCoins(amount)"), "Money visuals do not use canonical artwork.");
check(visualSource.includes('gridTemplateColumns: `repeat(${columns}, 1.5rem)`') && visualSource.includes("FractionBar"), "Core Year 2 arrays or fractions are missing visual construction.");

if (failures.length) {
  console.error(`Year 2 Number Nexus bank audit failed: ${failures.length} failure(s), ${passed} checks passed.`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Year 2 Number Nexus production bank audit passed: 40/40 items across 2 forms; ${passed} validation checks passed.`);
