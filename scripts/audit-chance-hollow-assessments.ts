import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getPretestForYearLabel, getPosttestForYearLabel } from "@/data/assessments/api";
import {
  CHANCE_HOLLOW_INDEPENDENT_ASSESSMENT_FORMS,
  getChanceHollowIndependentAssessment,
} from "@/data/assessments/chanceHollowIndependentBanks";
import {
  CHANCE_HOLLOW_ASSESSMENT_BLUEPRINTS,
  validateChanceHollowAssessmentBlueprintForLevel,
} from "@/data/assessments/chanceHollowAssessmentBlueprint";
import type { IndependentAssessmentItem } from "@/data/assessments/assessmentItemStandard";
import type { Question } from "@/data/assessments/posttests";

type AuditedQuestion = Question & IndependentAssessmentItem;

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const bankSource = read("data/assessments/chanceHollowIndependentBanks.ts");
const pretestSource = read("app/pretest/page.tsx");
const posttestSource = read("app/posttest/page.tsx");
const cardSource = read("components/assessment/AssessmentQuestionCard.tsx");
const shellSource = read("components/assessment/AssessmentShell.tsx");
const questionCardSource = read("components/assessment/AssessmentQuestionCard.tsx");
const globalStyles = read("app/globals.css");
const dashboardSource = read("components/world/ChanceHollowMap.tsx");
const taskRendererSource = read("components/TaskRenderer.tsx");
const compareToolsSource = read("components/chance-hollow/ChanceCompareToolsCard.tsx");
const chanceVisualSource = read("components/chance-hollow/ChanceVisual.tsx");
const voiceControlledTaskSources = [
  "components/chance-hollow/ChanceSpinTallyCard.tsx",
  "components/chance-hollow/ChanceAutoTallyCard.tsx",
  "components/chance-hollow/ChanceDependentDrawCard.tsx",
  "components/chance-hollow/ChanceBuildFairCard.tsx",
  "components/chance-hollow/ChancePredictCountCard.tsx",
  "components/chance-hollow/ChanceCompareToolsCard.tsx",
  "components/chance-hollow/ChanceDiceRaceCard.tsx",
  "components/chance-hollow/ChanceLevel6Cards.tsx",
];

assert.equal(CHANCE_HOLLOW_ASSESSMENT_BLUEPRINTS.length, 4);
assert.equal(Object.keys(CHANCE_HOLLOW_INDEPENDENT_ASSESSMENT_FORMS).length, 8);
assert(!bankSource.includes("getChanceHollowLevel3TaskSet"));
assert(!bankSource.includes("getChanceHollowLevel4TaskSet"));
assert(!bankSource.includes("getChanceHollowLevel5TaskSet"));
assert(!bankSource.includes("getChanceHollowLevel6TaskSet"));

const supportedInteractiveKinds = new Set([
  "chanceSpinTally",
  "chanceAutoTally",
  "chanceDependentDraw",
  "chanceBuildFair",
  "chancePredictCount",
  "chanceCompare",
  "chanceDiceRace",
  "chanceScalePortal",
  "chanceFormMatch",
  "chanceProbabilityForge",
  "chanceSimulationLab",
  "chanceModelDebugger",
  "chanceMasterTrial",
]);

const allIds = new Set<string>();
for (const level of [3, 4, 5, 6] as const) {
  assert.deepEqual(validateChanceHollowAssessmentBlueprintForLevel(level), []);
  const blueprint = CHANCE_HOLLOW_ASSESSMENT_BLUEPRINTS.find((entry) => entry.level === level)!;
  const expectedCodes = new Set(blueprint.descriptors.map((descriptor) => descriptor.code));
  const prePrompts = new Set<string>();
  const postPrompts = new Set<string>();

  for (const form of ["pretest", "posttest"] as const) {
    const questions = getChanceHollowIndependentAssessment(level, form) as AuditedQuestion[];
    const formBlueprint = blueprint.forms.find((candidate) => candidate.kind === form)!;
    assert.equal(questions.length, 20, `Year ${level} ${form} must contain 20 items.`);
    assert.equal(new Set(questions.map((question) => question.id)).size, 20);
    assert.equal(new Set(questions.map((question) => question.prompt)).size, 20);
    assert.equal(new Set(questions.map((question) => question.structureKey)).size, 20);
    assert(questions.every((question) => question.realm === "chance"));
    assert(questions.every((question) => question.origin === "assessment_authored"));
    assert(questions.every((question) => question.sourcePool === form));
    assert(questions.every((question) => question.linkedWeeks?.[0] && question.linkedWeeks[0] >= 1 && question.linkedWeeks[0] <= 6));
    assert.deepEqual(new Set(questions.flatMap((question) => question.curriculumCodes ?? [])), expectedCodes);
    assert(questions.every((question) => question.reviewFeedback?.trim()));

    const selected = questions.filter((question) => question.responseMode === "selected_response");
    const interactive = questions.filter((question) => question.responseMode === "manipulated_response");
    const countBy = (values: Array<string | undefined>) => values.reduce<Record<string, number>>((counts, value) => {
      if (value) counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {});
    const descriptorCounts = countBy(questions.map((question) => question.primaryDescriptorCode));
    const difficultyCounts = countBy(questions.map((question) => question.difficulty));
    const cognitiveCounts = countBy(questions.map((question) => question.cognitiveCategory));
    assert.deepEqual(
      descriptorCounts,
      Object.fromEntries(blueprint.descriptors.map((descriptor) => [descriptor.code, descriptor.allocation[form]])),
    );
    assert.deepEqual(difficultyCounts, {
      easy: formBlueprint.difficultyMix.accessible,
      moderate: formBlueprint.difficultyMix.moderate,
      challenging: formBlueprint.difficultyMix.challenging,
    });
    assert.deepEqual(
      cognitiveCounts,
      Object.fromEntries(Object.entries(formBlueprint.cognitiveMix).filter(([, count]) => count > 0)),
    );
    assert(selected.length <= formBlueprint.selectedResponseMaximum);
    assert(interactive.length >= formBlueprint.constructedOrManipulatedMinimum);
    assert(interactive.length >= 6, `Year ${level} ${form} needs at least six apparatus tasks.`);

    for (const question of questions) {
      assert(!allIds.has(question.id), `Duplicate assessment id ${question.id}`);
      allIds.add(question.id);
      if (question.type === "chanceHollowTask") {
        assert(question.practiceTask);
        assert(supportedInteractiveKinds.has(question.practiceTask!.kind));
        assert(taskRendererSource.includes(`case "${question.practiceTask!.kind}"`));
        assert.equal(question.correctAnswer, "__chance_hollow_task_correct__");
      } else {
        const labels = (question.options ?? []).map(String);
        assert(labels.length >= 3);
        assert.equal(new Set(labels).size, labels.length);
        assert(labels.includes(question.correctAnswer));
        assert(question.visual);
      }
    }

    const prompts = form === "pretest" ? prePrompts : postPrompts;
    questions.forEach((question) => prompts.add(question.prompt));
  }

  assert.equal([...prePrompts].filter((prompt) => postPrompts.has(prompt)).length, 0, `Year ${level} pre/post prompts must be independent.`);
  assert.equal(getPretestForYearLabel(`Year ${level}`, "chance").length, 20);
  assert.equal(getPosttestForYearLabel(`Year ${level}`, "chance")?.questions.length, 20);
}

assert.equal(allIds.size, 160);
assert(pretestSource.includes('realmId !== "chance"'));
assert(posttestSource.includes('realmId !== "chance"'));
assert(pretestSource.includes('question?.type === "chanceHollowTask"'));
assert(posttestSource.includes('q?.type === "chanceHollowTask"'));
assert(cardSource.includes("<ChanceVisual"));
assert(cardSource.includes("<OptionReadAloudButton"));
assert(shellSource.includes("getChanceHollowBackground"));
assert(shellSource.includes('const isNumber = !realmId || realmId === "number"'));
assert(shellSource.includes("{isChance && ("));
assert(shellSource.includes('data-compact-assessment={wideContent ? "false" : "true"}'));
assert(shellSource.includes('data-assessment-realm={realmId ?? "number"}'));
assert(questionCardSource.includes("assessment-standard-choice-layout"));
assert(questionCardSource.includes("assessment-choice-options"));
assert(globalStyles.includes('.assessment-standard-choice-layout[data-has-visual="true"]'));
assert(globalStyles.includes('grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.35fr)'));
assert(globalStyles.includes('.assessment-shell[data-wide-content="true"]'));
assert(globalStyles.includes('.assessment-shell[data-assessment-realm="chance"] .chance-compare-layout'));
assert(globalStyles.includes('grid-template-columns: minmax(0, 1.35fr) minmax(250px, 0.65fr)'));
assert(globalStyles.includes('data-measurelands-task-kind="chanceMasterTrial"'));
assert(compareToolsSource.includes("chance-compare-layout"));
assert(compareToolsSource.includes("chance-compare-tools"));
assert(compareToolsSource.includes("chance-compare-options"));
assert(chanceVisualSource.includes('data-chance-visual={visual.type}'));
for (const file of voiceControlledTaskSources) {
  const source = read(file);
  assert(source.includes("OptionReadAloudButton"), `${file} must expose answer voice-over controls.`);
  assert(source.includes("ReadAloudBtn"), `${file} must expose prompt voice-over controls.`);
}
assert(dashboardSource.includes("buildPretestHref"));
assert(dashboardSource.includes("buildPosttestHref"));

for (const asset of ["chanzia-roller-cutout.png", "chanzia-master-cutout.png"]) {
  assert(fs.existsSync(path.join(root, "public/images", asset)), `Missing Chance Hollow assessment asset ${asset}`);
}

console.log("Chance Hollow assessment audit passed: 8 independent forms / 160 items, full curriculum coverage, apparatus variety, voice controls and demo routes.");
