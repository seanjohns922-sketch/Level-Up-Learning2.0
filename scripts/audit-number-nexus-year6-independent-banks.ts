import fs from "node:fs";
import path from "node:path";
import { analyzeAssessmentResult, isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { NUMBER_NEXUS_MISCONCEPTION_LIBRARY } from "../data/assessments/numberNexusMisconceptions";
import type { Question } from "../data/assessments/posttests";
import { YEAR6_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS, YEAR6_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year6NumberNexusIndependentBanks";
import { getYear6WeeklyQuiz } from "../data/quizzes/year6";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";
import { buildAssessmentQuestionSnapshots, isAssessmentQuestionSnapshot } from "../lib/assessment-replay";

type Candidate = Question & IndependentAssessmentItem;
const failures: string[] = [];
let passed = 0;
const check = (condition: boolean, message: string) => condition ? passed += 1 : failures.push(message);
const counts = (values: readonly string[]) => values.reduce<Record<string, number>>((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {});
const sameCounts = (actual: Record<string, number>, expected: Record<string, number>) => Object.keys({ ...actual, ...expected }).every((key) => (actual[key] ?? 0) === (expected[key] ?? 0));

function wrongAnswer(item: Candidate) {
  if (item.type === "number_order") return item.correctAnswer.split("||").reverse().join("||");
  if (item.type === "fraction_order") return item.correctAnswer.split(",").reverse().join(",");
  if (item.correctAnswer.includes(",")) return "0,0";
  return String(Number(item.correctAnswer) + 1);
}

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((entry) => entry.level === 6);
check(Boolean(blueprint), "Year 6 blueprint is missing.");
check(blueprint?.descriptors.every((entry) => entry.curriculumMapping.implementationStatus === "aligned") === true, "Year 6 curriculum is not fully aligned.");
check(blueprint?.crossRealmCoverage?.[0]?.implementationStatus === "owned-by-pattern-peaks", "Year 6 Algebra ownership is unresolved.");

const forms = [
  { kind: "pretest", bank: YEAR6_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS, difficulty: { easy: 4, moderate: 10, challenging: 6 }, cognitive: { recall: 1, understanding: 4, application: 6, reasoning: 6, transfer: 3 } },
  { kind: "posttest", bank: YEAR6_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS, difficulty: { easy: 2, moderate: 8, challenging: 10 }, cognitive: { understanding: 3, application: 6, reasoning: 7, transfer: 4 } },
] as const;
const misconceptionById = new Map(NUMBER_NEXUS_MISCONCEPTION_LIBRARY.map((entry) => [entry.id, entry]));
const weeklyPrompts = new Set<string>();
for (let week = 1; week <= 12; week += 1) for (const question of getYear6WeeklyQuiz(week)?.questions ?? []) weeklyPrompts.add(question.questionText.trim().toLowerCase());

const allItems = forms.flatMap((form) => form.bank) as Candidate[];
check(allItems.length === 40, "Year 6 banks must contain 40 items.");
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
  const generated = bank.filter((item) => item.responseMode !== "selected_response").length;
  check(selected <= 1, `${form.kind} exceeds the 5% selected-response maximum.`);
  check(generated >= 19, `${form.kind} misses the 95% independent-response minimum.`);
  check(bank.every((item) => item.visual && typeof item.visual === "object"), `${form.kind} has an item without a visual.`);
  check(bank.every((item) => item.prompt.trim().split(/\s+/).length <= 16), `${form.kind} exceeds the Level 6 reading ceiling.`);
  check(bank.filter((item) => item.misconceptionDiagnosis).length >= 6, `${form.kind} needs at least six misconception-diagnosis items.`);
  check(bank.filter((item) => item.isTransfer).length >= 2, `${form.kind} needs at least two transfer tasks.`);
  check(bank.filter((item) => item.requiresReasoning).length >= 2, `${form.kind} needs at least two reasoning tasks.`);
  check(bank.filter((item) => item.responseMode === "justification").length >= 2, `${form.kind} needs at least two independent justification tasks.`);

  const completedAt = new Date(0).toISOString();
  const snapshots = buildAssessmentQuestionSnapshots([...bank], (question) => String(question.correctAnswer ?? ""), (question, answer) => isAssessmentAnswerCorrect(question as Candidate, String(answer)), completedAt);
  check(snapshots.length === 20 && snapshots.every(isAssessmentQuestionSnapshot), `${form.kind} cannot create canonical replay snapshots.`);
  check(snapshots.every((snapshot) => snapshot.correct), `${form.kind} replay rejects an approved answer.`);
  check(snapshots.every((snapshot) => (snapshot.curriculum_codes?.length ?? 0) > 0 && snapshot.lesson_mapping.length > 0), `${form.kind} replay loses curriculum metadata.`);
  const answersAt85 = Object.fromEntries(bank.slice(0, 17).map((item) => [item.id, String(item.correctAnswer)]));
  const answersAt80 = Object.fromEntries(bank.slice(0, 16).map((item) => [item.id, String(item.correctAnswer)]));
  const threshold = form.kind === "pretest" ? ASSESSMENT_THRESHOLDS.pretestPassPercent : ASSESSMENT_THRESHOLDS.posttestPassPercent;
  const resultAt85 = analyzeAssessmentResult({ questions: [...bank], answers: answersAt85, yearLevel: 6, testType: form.kind === "pretest" ? "pre" : "post", passThreshold: threshold });
  const resultAt80 = analyzeAssessmentResult({ questions: [...bank], answers: answersAt80, yearLevel: 6, testType: form.kind === "pretest" ? "pre" : "post", passThreshold: threshold });
  check(resultAt85.percentage === 85 && resultAt85.passed, `${form.kind} does not pass exactly at 85%.`);
  check(resultAt80.percentage === 80 && !resultAt80.passed, `${form.kind} passes below 85%.`);
  check(resultAt80.recommendedWeeks.length > 0 && resultAt80.assignedWeek !== undefined, `${form.kind} cannot produce targeted recommendations.`);

  for (const item of bank) {
    check(item.version === "1.0.0" && item.schemaVersion === 1, `${item.id} has incorrect version metadata.`);
    check(item.realm === "number" && item.level === 6 && item.form === form.kind, `${item.id} targets the wrong form.`);
    check(item.origin === "assessment_authored" && item.sourcePool === form.kind, `${item.id} is not independent content.`);
    check(item.bankId === `number-nexus-level-6-${form.kind}-v1`, `${item.id} has the wrong bank ID.`);
    check(item.statistics.calibrationStatus === "uncalibrated" && item.statistics.sampleSize === 0, `${item.id} must start uncalibrated.`);
    check(item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id} omits its primary descriptor.`);
    check(item.curriculumLessonMapping.length > 0, `${item.id} has no lesson-origin metadata.`);
    check(item.misconceptionTags.length > 0, `${item.id} has no misconception tag.`);
    check(item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id} has a misconception outside its descriptor.`);
    check(item.isTransfer === (item.cognitiveCategory === "transfer"), `${item.id} has incorrect transfer metadata.`);
    check(item.requiresReasoning === (["reasoning", "transfer"].includes(item.cognitiveCategory)), `${item.id} has incorrect reasoning metadata.`);
    check(isAssessmentAnswerCorrect(item, item.correctAnswer), `${item.id} rejects its expected answer.`);
    check(!isAssessmentAnswerCorrect(item, wrongAnswer(item)), `${item.id} accepts a known wrong answer.`);
    check(String((item.visual as { type?: unknown })?.type).startsWith("number_y6_"), `${item.id} does not use the Level 6 visual system.`);
  }
}

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/year6NumberNexusIndependentBanks.ts"), "utf8");
const cardSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentQuestionCard.tsx"), "utf8");
const visualSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/NumberNexusYear6AssessmentVisual.tsx"), "utf8");
const shellSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentShell.tsx"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
check(!/data\/activities|data\/quizzes/.test(bankSource), "Banks import lesson or weekly-quiz content.");
check(!/\breported\s*:|Recorded answer|Recorded decimal/.test(bankSource), "Assessment visuals expose an answer banner.");
check(!/\b(hint|helper|solution|worked step)\b/i.test(bankSource), "Assessment banks contain prohibited instructional scaffolding.");
check(cardSource.includes("NumberNexusYear6AssessmentVisual") && cardSource.includes('visual.type.startsWith("number_y6_")'), "Level 6 visual dispatch is missing.");
check(visualSource.includes("rounded-lg") && !visualSource.includes("rounded-2xl"), "Level 6 visuals do not follow the modern radius system.");
check(visualSource.includes("OptionReadAloudButton") && visualSource.includes("ReadableVisual"), "Level 6 visual wording is missing read-aloud support.");
check(shellSource.includes('year === "Year 6"') && shellSource.includes("max-w-6xl"), "Level 6 does not use the modern wide assessment shell.");
check(!apiSource.includes("YEAR6_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS"), "Release candidate was routed to production before educator approval.");
check(ASSESSMENT_THRESHOLDS.pretestPassPercent === 85 && ASSESSMENT_THRESHOLDS.posttestPassPercent === 85, "The 85% assessment threshold changed.");

if (failures.length) {
  console.error(`Year 6 Number Nexus bank audit failed: ${failures.length} failure(s), ${passed} checks passed.`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Year 6 Number Nexus release-candidate bank audit passed: 40/40 items across 2 forms; ${passed} validation checks passed.`);
console.log("Production resolver remains unchanged pending educator approval.");
