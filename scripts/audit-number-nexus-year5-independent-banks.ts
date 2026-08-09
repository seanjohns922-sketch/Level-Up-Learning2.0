import fs from "node:fs";
import path from "node:path";
import { analyzeAssessmentResult, isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { getPosttestForLevel, getPosttestForYearLabel, getPretestForLevel, getPretestForYearLabel } from "../data/assessments/api";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { NUMBER_NEXUS_MISCONCEPTION_LIBRARY } from "../data/assessments/numberNexusMisconceptions";
import type { Question } from "../data/assessments/posttests";
import {
  YEAR5_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR5_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/year5NumberNexusIndependentBanks";
import { buildYear5NumberNexusWeeklyQuiz } from "../data/quizzes/year5NumberNexus";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";
import { buildAssessmentQuestionSnapshots, isAssessmentQuestionSnapshot } from "../lib/assessment-replay";

type Candidate = Question & IndependentAssessmentItem;
const failures: string[] = [];
let passed = 0;
const check = (condition: boolean, message: string) => condition ? passed += 1 : failures.push(message);
const counts = (values: readonly string[]) => values.reduce<Record<string, number>>((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {});
const sameCounts = (actual: Record<string, number>, expected: Record<string, number>) => Object.keys({ ...actual, ...expected }).every((key) => (actual[key] ?? 0) === (expected[key] ?? 0));

function wrongAnswer(item: Candidate) {
  if (item.type === "numeric") return String(Number(item.correctAnswer) + 1);
  if (item.type === "number_order") return item.correctAnswer.split("||").reverse().join("||");
  if (item.type === "fraction_order") return item.correctAnswer.split(",").reverse().join(",");
  return String(item.options?.find((option) => String(option) !== item.correctAnswer) ?? "__wrong__");
}

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((entry) => entry.level === 5);
check(Boolean(blueprint), "Year 5 blueprint is missing.");
check(blueprint?.descriptors.every((entry) => entry.curriculumMapping.implementationStatus === "aligned") === true, "Year 5 curriculum is not fully aligned.");

const forms = [
  { kind: "pretest", bank: YEAR5_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS, difficulty: { easy: 5, moderate: 10, challenging: 5 }, cognitive: { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 } },
  { kind: "posttest", bank: YEAR5_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS, difficulty: { easy: 3, moderate: 9, challenging: 8 }, cognitive: { recall: 1, understanding: 3, application: 6, reasoning: 7, transfer: 3 } },
] as const;
const misconceptionById = new Map(NUMBER_NEXUS_MISCONCEPTION_LIBRARY.map((entry) => [entry.id, entry]));
const weeklyPrompts = new Set<string>();
for (let week = 1; week <= 12; week += 1) buildYear5NumberNexusWeeklyQuiz(week).forEach((question) => weeklyPrompts.add(question.prompt.trim().toLowerCase()));

const allItems = forms.flatMap((form) => form.bank) as Candidate[];
check(allItems.length === 40, "Year 5 banks must contain 40 items.");
check(new Set(allItems.map((item) => item.id)).size === 40, "Candidate IDs must be unique.");
check(new Set(allItems.map((item) => item.contextKey)).size === 40, "Candidate contexts must be unique.");
check(new Set(allItems.map((item) => item.structureKey)).size === 40, "Candidate structures must be unique.");
check(new Set(allItems.map((item) => item.prompt.trim().toLowerCase())).size === 40, "Candidate wording must be unique across forms.");
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
  check(bank.every((item) => item.prompt.trim().split(/\s+/).length <= 16), `${form.kind} exceeds the Year 5 reading ceiling.`);
  check(bank.filter((item) => item.misconceptionDiagnosis).length >= 6, `${form.kind} needs at least six explicit misconception-diagnosis items.`);

  const completedAt = new Date(0).toISOString();
  const replayQuestions = [...bank] as Candidate[];
  const snapshots = buildAssessmentQuestionSnapshots(
    replayQuestions,
    (question) => String(question.correctAnswer ?? ""),
    (question, answer) => isAssessmentAnswerCorrect(question as Candidate, String(answer)),
    completedAt,
  );
  check(snapshots.length === 20 && snapshots.every(isAssessmentQuestionSnapshot), `${form.kind} cannot create canonical replay snapshots.`);
  check(snapshots.every((snapshot) => snapshot.correct), `${form.kind} replay rejects an approved answer.`);
  check(snapshots.every((snapshot) => (snapshot.curriculum_codes?.length ?? 0) > 0 && snapshot.lesson_mapping.length > 0), `${form.kind} replay loses curriculum metadata.`);
  const answersAt85 = Object.fromEntries(bank.slice(0, 17).map((item) => [item.id, String(item.correctAnswer)]));
  const answersAt80 = Object.fromEntries(bank.slice(0, 16).map((item) => [item.id, String(item.correctAnswer)]));
  const threshold = form.kind === "pretest" ? ASSESSMENT_THRESHOLDS.pretestPassPercent : ASSESSMENT_THRESHOLDS.posttestPassPercent;
  const resultAt85 = analyzeAssessmentResult({ questions: replayQuestions, answers: answersAt85, yearLevel: 5, testType: form.kind === "pretest" ? "pre" : "post", passThreshold: threshold });
  const resultAt80 = analyzeAssessmentResult({ questions: replayQuestions, answers: answersAt80, yearLevel: 5, testType: form.kind === "pretest" ? "pre" : "post", passThreshold: threshold });
  check(resultAt85.percentage === 85 && resultAt85.passed, `${form.kind} does not pass exactly at 85%.`);
  check(resultAt80.percentage === 80 && !resultAt80.passed, `${form.kind} passes below 85%.`);
  check(resultAt80.recommendedWeeks.length > 0 && resultAt80.assignedWeek !== undefined, `${form.kind} cannot produce targeted curriculum recommendations.`);

  for (const item of bank) {
    check(item.version === "1.0.0" && item.schemaVersion === 1, `${item.id} has incorrect version metadata.`);
    check(item.realm === "number" && item.level === 5 && item.form === form.kind, `${item.id} targets the wrong form.`);
    check(item.origin === "assessment_authored" && item.sourcePool === form.kind, `${item.id} is not independent content.`);
    check(item.bankId === `number-nexus-level-5-${form.kind}-v1`, `${item.id} has the wrong bank ID.`);
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
      check(options.length >= 3 && new Set(options).size === options.length, `${item.id} has invalid options.`);
      check(options.includes(item.correctAnswer), `${item.id} options omit the expected answer.`);
      check(item.selectedAnswerPosition === options.indexOf(item.correctAnswer) + 1, `${item.id} has an incorrect answer position.`);
    } else check(item.selectedAnswerPosition === undefined, `${item.id} generated response has a selected-answer position.`);
  }
}

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/year5NumberNexusIndependentBanks.ts"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
const shellSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentShell.tsx"), "utf8");
const cardSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentQuestionCard.tsx"), "utf8");
const visualSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/NumberNexusYear5AssessmentVisual.tsx"), "utf8");
const pretestSource = fs.readFileSync(path.join(process.cwd(), "app/pretest/page.tsx"), "utf8");
const posttestSource = fs.readFileSync(path.join(process.cwd(), "app/posttest/page.tsx"), "utf8");
check(!/data\/activities|data\/quizzes/.test(bankSource), "Banks import lesson or weekly-quiz content.");
check(apiSource.includes("YEAR5_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS") && apiSource.includes("YEAR5_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS"), "Production resolver does not import both Year 5 banks.");
check(getPretestForYearLabel("Year 5", "number").every((item, index) => item.id === YEAR5_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS[index]?.id), "Year-label Pre-Test route is wrong.");
check(getPretestForLevel(5, "number").every((item, index) => item.id === YEAR5_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS[index]?.id), "Level Pre-Test route is wrong.");
check(getPosttestForYearLabel("Year 5", "number")?.questions.every((item, index) => item.id === YEAR5_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS[index]?.id) === true, "Year-label Post-Test route is wrong.");
check(getPosttestForLevel(5, "number")?.questions.every((item, index) => item.id === YEAR5_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS[index]?.id) === true, "Level Post-Test route is wrong.");
check(allItems.every((item) => String((item.visual as { type?: unknown })?.type).startsWith("number_y5_")), "A production item does not use the Year 5 visual system.");
check(shellSource.includes('year === "Year 5"') && shellSource.includes("max-w-6xl"), "Year 5 does not use the modern wide shell.");
check(cardSource.includes('visual.type.startsWith("number_y5_")') && cardSource.includes("NumberNexusYear5AssessmentVisual"), "Year 5 visuals are not dispatched by the assessment card.");
check(cardSource.includes('visual.type.startsWith("number_y5_")'), "Year 5 does not participate in the modern answer-widget branch.");
check(cardSource.includes("!isYearFiveNumberVisual") && cardSource.includes("FractionBar"), "Year 5 fraction ordering still exposes fraction-bar scaffolding.");
check(visualSource.includes("ReceiptText") && visualSource.includes("number_y5_budget"), "Financial contexts do not use the dedicated visual treatment.");
const visualTypes = new Set(allItems.map((item) => String((item.visual as { type?: unknown })?.type)));
check([...visualTypes].every((type) => visualSource.includes(`type === "${type}"`)), "A Year 5 visual type has no renderer branch.");
check(visualSource.includes("rounded-lg") && !visualSource.includes("rounded-2xl"), "Year 5 visuals do not follow the modern radius system.");
check(!/\b(hint|helper|solution|worked step)\b/i.test(bankSource), "Assessment banks contain prohibited instructional scaffolding.");
check(ASSESSMENT_THRESHOLDS.pretestPassPercent === 85 && ASSESSMENT_THRESHOLDS.posttestPassPercent === 85, "The 85% assessment threshold changed.");
check(pretestSource.includes("saveRealmAssessment") && pretestSource.includes("question_results: questionResults"), "Canonical Pre-Test saving or replay persistence changed.");
check(posttestSource.includes("saveRealmAssessment") && posttestSource.includes("question_results: questionResults"), "Canonical Post-Test saving or replay persistence changed.");
check(pretestSource.includes("buildAssessmentQuestionSnapshots") && posttestSource.includes("buildAssessmentQuestionSnapshots"), "Assessment replay snapshots are not wired for both forms.");

if (failures.length) {
  console.error(`Year 5 Number Nexus bank audit failed: ${failures.length} failure(s), ${passed} checks passed.`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Year 5 Number Nexus production bank audit passed: 40/40 items across 2 forms; ${passed} validation checks passed.`);
