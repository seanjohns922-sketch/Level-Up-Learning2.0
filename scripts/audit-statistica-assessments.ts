import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { STATISTICA_WEEKLY_QUIZ_FORMS, getStatisticaWeeklyQuizTasks } from "@/data/activities/statistica/weeklyQuizBank";
import { STATISTICA_INDEPENDENT_ASSESSMENT_FORMS, getStatisticaIndependentAssessment } from "@/data/assessments/statisticaIndependentBanks";
import { getStatisticaAssessmentBlueprint } from "@/data/assessments/statisticaAssessmentBlueprint";
import { ASSESSMENT_THRESHOLDS, posttestPassed, weeklyQuizPassed } from "@/lib/assessment-rules";
import { getPosttestForYearLabel, getPretestForYearLabel } from "@/data/assessments/api";
import { buildAssessmentReturnRoute } from "@/lib/assessment-routes";

const levels = [1, 2, 3, 4, 5, 6] as const;
const descriptorTaskKinds: Record<string, readonly string[]> = {
  AC9M1ST01: ["statisticaTally", "statisticaTable"], AC9M1ST02: ["statisticaGraph", "statisticaInference"],
  AC9M2ST01: ["statisticaClassify", "statisticaTable"], AC9M2ST02: ["statisticaGraph", "statisticaInference"],
  AC9M3ST01: ["statisticaClassify", "statisticaTable"], AC9M3ST02: ["statisticaInference"], AC9M3ST03: ["statisticaClassify"],
  AC9M4ST01: ["statisticaPictograph", "statisticaGraph"], AC9M4ST02: ["statisticaShape"], AC9M4ST03: ["statisticaClassify"],
  AC9M5ST01: ["statisticaClassify", "statisticaShape"], AC9M5ST02: ["statisticaLineGraph"], AC9M5ST03: ["statisticaClassify"],
  AC9M6ST01: ["statisticaClassify", "statisticaShape"], AC9M6ST02: ["statisticaMediaAnalysis"], AC9M6ST03: ["statisticaClassify"],
};

assert.equal(STATISTICA_WEEKLY_QUIZ_FORMS.length, 30, "Statistica must have 30 weekly quiz forms");
const quizSerializations = new Set<string>();
for (const form of STATISTICA_WEEKLY_QUIZ_FORMS) {
  assert.ok(form.week >= 1 && form.week <= 5, `Invalid quiz week ${form.week}`);
  assert.equal(form.tasks.length, 15, `Year ${form.level} Week ${form.week} must have 15 quiz questions`);
  for (const [index, task] of form.tasks.entries()) {
    const prompt = "prompt" in task ? task.prompt : "";
    const speech = "speakText" in task ? String(task.speakText ?? "") : prompt;
    assert.ok(prompt.trim().length >= 18, `Quiz question ${index + 1} needs a specific prompt`);
    assert.ok(speech.trim().length >= 12, `Quiz question ${index + 1} needs read-aloud text`);
    const serialized = JSON.stringify(task);
    assert.ok(!quizSerializations.has(serialized), `Duplicate weekly quiz task in Year ${form.level} Week ${form.week}`);
    quizSerializations.add(serialized);
  }
  assert.deepEqual([0, 1, 2].map((lessonIndex) => form.tasks.slice(lessonIndex * 5, lessonIndex * 5 + 5).length), [5, 5, 5]);
}
for (const level of levels) assert.equal(getStatisticaWeeklyQuizTasks(level, 6), null, `Year ${level} Week 6 must not have a quiz`);
assert.equal(quizSerializations.size, 450, "All 450 quiz tasks must be structurally unique");

assert.equal(Object.keys(STATISTICA_INDEPENDENT_ASSESSMENT_FORMS).length, 11, "Statistica must have 11 pre/post forms");
assert.deepEqual(getStatisticaIndependentAssessment(1, "pretest"), [], "Year 1 must not have a pre-test");

const ids = new Set<string>();
const prompts = new Set<string>();
const contexts = new Set<string>();
const structures = new Set<string>();
let assessmentCount = 0;

for (const level of levels) {
  const blueprint = getStatisticaAssessmentBlueprint(level)!;
  for (const formBlueprint of blueprint.forms) {
    const items = getStatisticaIndependentAssessment(level, formBlueprint.kind);
    assessmentCount += items.length;
    assert.equal(items.length, 20, `Year ${level} ${formBlueprint.kind} must contain 20 items`);
    const descriptorCounts = new Map<string, number>();
    const difficultyCounts = new Map<string, number>();
    const cognitiveCounts = new Map<string, number>();
    let selected = 0;
    for (const item of items) {
      assert.equal(item.realm, "statistics");
      assert.equal(item.origin, "assessment_authored");
      assert.equal(item.sourcePool, formBlueprint.kind);
      assert.equal(item.type, "statisticaTask");
      assert.ok(item.practiceTask, `${item.id} needs a visual interaction`);
      assert.ok(descriptorTaskKinds[item.primaryDescriptorCode]?.includes(item.practiceTask!.kind), `${item.id} renderer ${item.practiceTask!.kind} does not match ${item.primaryDescriptorCode}`);
      assert.ok("speakText" in item.practiceTask! && String(item.practiceTask.speakText).trim().length >= 12, `${item.id} needs read-aloud text`);
      assert.ok(!ids.has(item.id), `Duplicate assessment id ${item.id}`);
      assert.ok(!prompts.has(item.prompt), `Duplicate assessment prompt: ${item.prompt}`);
      assert.ok(!contexts.has(item.contextKey), `Duplicate context key ${item.contextKey}`);
      assert.ok(!structures.has(item.structureKey), `Duplicate structure key ${item.structureKey}`);
      ids.add(item.id); prompts.add(item.prompt); contexts.add(item.contextKey); structures.add(item.structureKey);
      descriptorCounts.set(item.primaryDescriptorCode, (descriptorCounts.get(item.primaryDescriptorCode) ?? 0) + 1);
      difficultyCounts.set(item.difficulty, (difficultyCounts.get(item.difficulty) ?? 0) + 1);
      cognitiveCounts.set(item.cognitiveCategory, (cognitiveCounts.get(item.cognitiveCategory) ?? 0) + 1);
      if (item.responseMode === "selected_response") selected += 1;
    }
    for (const descriptor of blueprint.descriptors) {
      assert.equal(descriptorCounts.get(descriptor.code) ?? 0, descriptor.allocation[formBlueprint.kind], `${level}-${formBlueprint.kind}-${descriptor.code} allocation mismatch`);
    }
    const expectedDifficulty = {
      easy: formBlueprint.difficultyMix.accessible,
      moderate: formBlueprint.difficultyMix.moderate,
      challenging: formBlueprint.difficultyMix.challenging,
    };
    for (const [difficulty, count] of Object.entries(expectedDifficulty)) assert.equal(difficultyCounts.get(difficulty) ?? 0, count, `${level}-${formBlueprint.kind} ${difficulty} mix mismatch`);
    for (const [category, count] of Object.entries(formBlueprint.cognitiveMix)) assert.equal(cognitiveCounts.get(category) ?? 0, count, `${level}-${formBlueprint.kind} ${category} mix mismatch`);
    assert.equal(selected, formBlueprint.selectedResponseMaximum, `${level}-${formBlueprint.kind} selected-response quota mismatch`);
  }
}

assert.equal(assessmentCount, 220, "Statistica must contain 220 independent assessment items");
assert.equal(ids.size, 220);
assert.equal(prompts.size, 220);
assert.equal(contexts.size, 220);
assert.equal(structures.size, 220);
assert.equal(getPretestForYearLabel("Year 1", "statistics").length, 0, "Year 1 resolver must not expose a pre-test");
assert.equal(getPosttestForYearLabel("Year 1", "statistics")?.questions.length, 20);
for (const level of [2, 3, 4, 5, 6]) {
  assert.equal(getPretestForYearLabel(`Year ${level}`, "statistics").length, 20);
  assert.equal(getPosttestForYearLabel(`Year ${level}`, "statistics")?.questions.length, 20);
}
assert.equal(
  buildAssessmentReturnRoute({ year: "Year 4", realmId: "statistics" }),
  "/program?year=Year%204&week=6&legacy=1&realm_id=statistics",
  "Statistica assessments must return to Week 6",
);

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/statisticaIndependentBanks.ts"), "utf8");
assert.ok(!bankSource.includes("weeklyQuizBank"), "Assessment bank must not import weekly quiz content");
assert.ok(!bankSource.includes("data/activities/statistica/level"), "Assessment bank must not import lesson content");
const programPageSource = fs.readFileSync(path.join(process.cwd(), "app/program/page.tsx"), "utf8");
const pretestPageSource = fs.readFileSync(path.join(process.cwd(), "app/pretest/page.tsx"), "utf8");
assert.ok(programPageSource.includes("/statistica/quiz/"), "Program page must route Statistica weekly quizzes to the dedicated runner");
assert.ok(pretestPageSource.includes('realmId === "statistics" && year === "Year 1"'), "Year 1 Statistica pre-test requests must redirect to the program");
assert.equal(ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent, 80);
assert.equal(ASSESSMENT_THRESHOLDS.posttestPassPercent, 85);
assert.equal(weeklyQuizPassed(80), true);
assert.equal(weeklyQuizPassed(79), false);
assert.equal(posttestPassed(85), true);
assert.equal(posttestPassed(84), false);

console.log("Statistica assessment audit passed: 30 weekly forms / 450 questions and 11 independent forms / 220 questions.");
