import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS } from "../data/assessments/groundNumberNexusIndependentPosttest";
import { getPosttestForYearLabel } from "../data/assessments/api";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { NUMBER_NEXUS_MISCONCEPTION_LIBRARY } from "../data/assessments/numberNexusMisconceptions";
import type { Question } from "../data/assessments/posttests";

type CandidateItem = Question & IndependentAssessmentItem;
const failures: string[] = [];
let checksPassed = 0;

function check(condition: boolean, message: string): void {
  if (condition) checksPassed += 1;
  else failures.push(message);
}

function counts(values: readonly string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((result, value) => {
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}

function sameCounts(actual: Record<string, number>, expected: Record<string, number>): boolean {
  return Object.keys({ ...actual, ...expected }).every((key) => actual[key] === expected[key]);
}

function wrongAnswer(item: CandidateItem): string {
  if (item.type === "numeric") return String(Number(item.correctAnswer) + 1);
  if (item.type === "number_order") return item.correctAnswer.split("||").reverse().join("||");
  if (item.type === "pattern_build") return "robot||robot";
  return String(item.options?.find((option) => String(option) !== item.correctAnswer) ?? "__wrong__");
}

const bank = GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as readonly CandidateItem[];
const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 0);
const form = blueprint?.forms.find((item) => item.kind === "posttest");
const misconceptionById = new Map(NUMBER_NEXUS_MISCONCEPTION_LIBRARY.map((item) => [item.id, item]));

check(Boolean(blueprint && form), "Ground post-test blueprint is missing.");
check(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned") === true, "Ground curriculum is not fully aligned.");
check(bank.length === 20, "Ground candidate bank must contain 20 items.");
check(new Set(bank.map((item) => item.id)).size === 20, "Ground candidate IDs must be unique.");
check(new Set(bank.map((item) => item.contextKey)).size === 20, "Ground candidate contexts must be unique.");
check(new Set(bank.map((item) => item.structureKey)).size === 20, "Ground candidate structures must be unique.");
check(new Set(bank.map((item) => item.prompt)).size === 20, "Ground candidate prompts must be unique.");

const expectedDescriptors = Object.fromEntries(
  (blueprint?.descriptors ?? []).map((item) => [item.code, item.allocation.posttest]),
);
check(sameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), expectedDescriptors), "Descriptor allocation does not match the Ground blueprint.");
check(sameCounts(counts(bank.map((item) => item.difficulty)), { easy: 8, moderate: 8, challenging: 4 }), "Difficulty mix must be 8 easy, 8 moderate and 4 challenging.");
check(sameCounts(counts(bank.map((item) => item.cognitiveCategory)), { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }), "Cognitive mix must be 2 recall, 6 understanding, 7 application, 4 reasoning and 1 transfer.");

const selectedCount = bank.filter((item) => item.responseMode === "selected_response").length;
const generatedCount = bank.filter((item) => item.responseMode === "constructed_response" || item.responseMode === "manipulated_response").length;
check(selectedCount <= (form?.responseMix.selectedResponseMaximum ?? 0), "Selected-response maximum was exceeded.");
check(generatedCount >= (form?.responseMix.constructedOrManipulatedMinimum ?? 20), "Constructed/manipulated response minimum was missed.");
check(bank.every((item) => item.visual && typeof item.visual === "object"), "Every Ground item must include an assessment-native visual.");
check(bank.every((item) => item.prompt.trim().split(/\s+/).length <= 14), "A Ground prompt exceeds the 14-word reading ceiling.");

for (const item of bank) {
  check(item.schemaVersion === 1 && item.version === "1.0.0", `${item.id} has incorrect canonical version metadata.`);
  check(item.realm === "number" && item.level === 0 && item.form === "posttest", `${item.id} targets the wrong assessment form.`);
  check(item.origin === "assessment_authored" && item.sourcePool === "posttest", `${item.id} is not independent assessment-bank content.`);
  check(item.bankId === "number-nexus-level-0-posttest-v1", `${item.id} has the wrong bank ID.`);
  check(item.statistics.calibrationStatus === "uncalibrated" && item.statistics.sampleSize === 0, `${item.id} must start uncalibrated.`);
  check(item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id} omits its primary descriptor.`);
  check(item.curriculumLessonMapping.length > 0, `${item.id} has no curriculum lesson origin.`);
  check(item.misconceptionTags.length > 0, `${item.id} has no misconception metadata.`);
  check(item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id} has a misconception tag outside its descriptor.`);
  check(item.isTransfer === (item.cognitiveCategory === "transfer"), `${item.id} has incorrect transfer metadata.`);
  check(item.requiresReasoning === (item.cognitiveCategory === "reasoning" || item.cognitiveCategory === "transfer"), `${item.id} has incorrect reasoning metadata.`);
  check(isAssessmentAnswerCorrect(item, item.correctAnswer), `${item.id} runtime scoring rejects the expected answer.`);
  check(!isAssessmentAnswerCorrect(item, wrongAnswer(item)), `${item.id} runtime scoring accepts a wrong answer.`);

  if (item.type === "mcq") {
    const options = (item.options ?? []).map(String);
    check(options.includes(item.correctAnswer), `${item.id} options omit the expected answer.`);
    check(item.selectedAnswerPosition === options.indexOf(item.correctAnswer) + 1, `${item.id} selected-answer position is incorrect.`);
  } else {
    check(item.selectedAnswerPosition === undefined, `${item.id} generated response must not have a selected-answer position.`);
  }
}

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/groundNumberNexusIndependentPosttest.ts"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
const cardSource = fs.readFileSync(path.join(process.cwd(), "components/assessment/AssessmentQuestionCard.tsx"), "utf8");
const posttestSource = fs.readFileSync(path.join(process.cwd(), "app/posttest/page.tsx"), "utf8");
check(!/activities\/prep|programs\/prep|weekly|lessonEngine|PracticeTask/.test(bankSource), "Ground bank imports lesson or weekly-quiz content.");
const production = getPosttestForYearLabel("Prep", "number")?.questions ?? [];
check(apiSource.includes("groundNumberNexusIndependentPosttest"), "Production resolver does not import the approved Ground bank.");
check(production.length === 20, "Production resolver does not return 20 Ground questions.");
check(production.every((item, index) => item.id === bank[index]?.id), "Production resolver does not preserve the approved bank order.");
check(cardSource.includes("OptionReadAloudButton") && cardSource.includes('type === "pattern_build"'), "Ground response controls do not provide answer-option read aloud.");
check(posttestSource.includes("<ReadAloudBtn text={q.prompt}"), "Post-test prompt read aloud is missing.");

console.log(`Ground Number Nexus independent-bank audit: ${checksPassed} passed, ${failures.length} failed.`);
console.log(`Production form: ${bank.length} items; ${generatedCount} constructed/manipulated; ${selectedCount} selected.`);
console.log("Release status: Number Nexus Ground Assessment v1.0 PRODUCTION; calibration data pending.");
if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
