import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS } from "../data/assessments/groundStarpathIndependentPosttest";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "../data/assessments/starpathAssessmentBlueprint";
import { STARPATH_MISCONCEPTION_LIBRARY } from "../data/assessments/starpathMisconceptions";
import type { Question } from "../data/assessments/posttests";
import { isPracticeTaskSafe } from "../lib/task-safety";

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

const bank = GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS as readonly CandidateItem[];
const blueprint = STARPATH_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 0);
const form = blueprint?.forms.find((item) => item.kind === "posttest");
const misconceptionById = new Map(STARPATH_MISCONCEPTION_LIBRARY.map((item) => [item.id, item]));

check(Boolean(blueprint && form), "Ground Starpath post-test blueprint is missing.");
check(bank.length === 20, "Ground Starpath candidate bank must contain 20 items.");
check(new Set(bank.map((item) => item.id)).size === 20, "Candidate IDs must be unique.");
check(new Set(bank.map((item) => item.contextKey)).size === 20, "Candidate contexts must be unique.");
check(new Set(bank.map((item) => item.structureKey)).size === 20, "Candidate structures must be unique.");
check(new Set(bank.map((item) => item.prompt)).size === 20, "Candidate prompts must be unique.");

const expectedDescriptors = Object.fromEntries(
  (blueprint?.descriptors ?? []).map((item) => [item.code, item.allocation.posttest]),
);
check(sameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), expectedDescriptors), "Descriptor allocation must be 10 AC9MFSP01 and 10 AC9MFSP02.");
check(sameCounts(counts(bank.map((item) => item.difficulty)), { easy: 8, moderate: 8, challenging: 4 }), "Difficulty mix must be 8 easy, 8 moderate and 4 challenging.");
check(sameCounts(counts(bank.map((item) => item.cognitiveCategory)), { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }), "Cognitive mix must be 2 recall, 6 understanding, 7 application, 4 reasoning and 1 transfer.");
check(sameCounts(counts(bank.map((item) => item.responseMode)), { selected_response: 10, manipulated_response: 10 }), "Response mix must be exactly 10 selected and 10 manipulated responses.");
check(bank.every((item) => item.prompt.trim().split(/\s+/).length <= 14), "A prompt exceeds the Foundation 14-word reading ceiling.");

for (const item of bank) {
  check(item.schemaVersion === 1 && item.version === "1.0.0-rc1", `${item.id} has incorrect version metadata.`);
  check(item.realm === "space" && item.level === 0 && item.form === "posttest", `${item.id} targets the wrong assessment form.`);
  check(item.origin === "assessment_authored" && item.sourcePool === "posttest", `${item.id} is not independent assessment content.`);
  check(item.bankId === "starpath-level-0-posttest-rc1", `${item.id} has the wrong bank ID.`);
  check(item.type === "starpathTask" && Boolean(item.practiceTask), `${item.id} is not a launchable Starpath task.`);
  check(isPracticeTaskSafe(item.practiceTask), `${item.id} is blocked by the task-safety gate.`);
  check(item.renderer.type === "starpath_assessment_task", `${item.id} has the wrong renderer metadata.`);
  check(item.scoring.kind === "interaction", `${item.id} must use canonical interaction scoring.`);
  check(item.statistics.calibrationStatus === "uncalibrated" && item.statistics.sampleSize === 0, `${item.id} must start uncalibrated.`);
  check(item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id} omits its primary descriptor.`);
  check(item.curriculumLessonMapping.length > 0, `${item.id} has no curriculum mapping.`);
  check(item.misconceptionTags.length > 0, `${item.id} has no misconception metadata.`);
  check(item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id} has a misconception outside its descriptor.`);
  check(item.isTransfer === (item.cognitiveCategory === "transfer"), `${item.id} has incorrect transfer metadata.`);
  check(item.requiresReasoning === (item.cognitiveCategory === "reasoning" || item.cognitiveCategory === "transfer"), `${item.id} has incorrect reasoning metadata.`);
  check(isAssessmentAnswerCorrect(item, item.correctAnswer), `${item.id} runtime scoring rejects the correct token.`);
  check(!isAssessmentAnswerCorrect(item, `__measurelands_task_incorrect__:${item.id}`), `${item.id} runtime scoring accepts an incorrect token.`);

  const task = item.practiceTask;
  check(Boolean(task && "speakText" in task && task.speakText), `${item.id} has no task read-aloud text.`);
  const feedback = task && "feedback" in task ? task.feedback : undefined;
  check(Boolean(feedback && feedback.correct === feedback.wrong), `${item.id} feedback could reveal correctness during assessment.`);

  if (task?.kind === "starpathGroundAssessment" && task.mode === "placement") {
    check(task.answer.length === task.tokens.length, `${item.id} must require every palette token.`);
    check(task.answer.every((answer) => task.tokens.some((token) => token.id === answer.tokenId)), `${item.id} references an unknown palette token.`);
    check(task.answer.every((answer) => answer.r >= 0 && answer.r < task.rows && answer.c >= 0 && answer.c < task.cols), `${item.id} has an answer outside the grid.`);
    check(new Set(task.answer.map((answer) => `${answer.r}:${answer.c}`)).size === task.answer.length, `${item.id} overlaps answer pieces.`);
    check(task.answer.every((answer) => !task.fixed?.some((fixed) => fixed.r === answer.r && fixed.c === answer.c)), `${item.id} overlaps a fixed reference object.`);
  }

  if (task?.kind === "starpathGroundAssessment" && task.mode === "route") {
    let position = { ...task.start };
    for (const move of task.answerMoves) {
      if (move === "up") position.r -= 1;
      if (move === "down") position.r += 1;
      if (move === "left") position.c -= 1;
      if (move === "right") position.c += 1;
      check(position.r >= 0 && position.r < task.rows && position.c >= 0 && position.c < task.cols, `${item.id} route leaves the grid.`);
    }
    check(!task.goal || (position.r === task.goal.r && position.c === task.goal.c), `${item.id} route does not reach its displayed goal.`);
  }
}

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/groundStarpathIndependentPosttest.ts"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
const posttestSource = fs.readFileSync(path.join(process.cwd(), "app/posttest/page.tsx"), "utf8");
const demoReviewSource = fs.readFileSync(path.join(process.cwd(), "components/demo/DemoReviewPanel.tsx"), "utf8");
check(!/activities\/starpath\/ground\/(week|groundPostTest)|week\dQuiz/.test(bankSource), "Candidate bank imports lesson or weekly-quiz content.");
check(!apiSource.includes("groundStarpathIndependentPosttest"), "Release candidate must not be reachable through the production resolver.");
check(posttestSource.includes('reviewBank === "ground-starpath-rc1"') && posttestSource.includes("isDemoPreviewMode"), "Candidate bank is not protected by the demo review gate.");
check(demoReviewSource.includes("ground-starpath-rc1"), "Demo Review does not expose the candidate bank.");

console.log(`Ground Starpath independent-bank audit: ${checksPassed} passed, ${failures.length} failed.`);
console.log("Candidate form: 20 items; 10 manipulated; 10 selected; resolver unchanged.");
console.log("Release status: RC1 BLOCKED pending educator review and production approval.");
if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
