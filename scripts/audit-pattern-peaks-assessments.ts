import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PATTERN_PEAKS_PROGRAMS } from "@/data/programs/patternPeaks";
import { PATTERN_PEAKS_WEEKLY_QUIZ_FORMS, getPatternPeaksWeeklyQuizTasks } from "@/data/activities/patternPeaks/weeklyQuizBank";
import { PATTERN_PEAKS_ASSESSMENT_BLUEPRINTS, getPatternPeaksAssessmentBlueprint, validatePatternPeaksAssessmentBlueprintForLevel } from "@/data/assessments/patternPeaksAssessmentBlueprint";
import { PATTERN_PEAKS_INDEPENDENT_ASSESSMENT_FORMS, getPatternPeaksIndependentAssessment } from "@/data/assessments/patternPeaksIndependentBanks";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import { getPosttestForYearLabel, getPretestForYearLabel, validateAssessmentBlueprintForLevel } from "@/data/assessments/api";
import { isRealmFirstLevel } from "@/lib/realms/realm-registry";

const levels = [3, 4, 5, 6] as const;
const root = process.cwd();
const selectedMaximum = { 3: 4, 4: 3, 5: 2, 6: 1 } as const;
const descriptorStructures: Record<string, string[]> = {
  AC9M3A01: ["extended-sequence", "function-machine"],
  AC9M3A02: ["add-sub-inverse", "relational-equality"],
  AC9M3A03: ["inverse-fact", "derived-fact"],
  AC9M4A01: ["unknown-position", "inverse-add-sub", "regroup-addends"],
  AC9M4A02: ["derived-multiplication"],
  AC9M5A01: ["multiplicative-unknown"],
  AC9M5A02: ["multiplication-property", "distributive", "factor-constraints", "multiple-constraint"],
  AC9M6A01: ["stage-generalisation", "rational-sequence"],
  AC9M6A02: ["multi-representation-rule", "three-step-algorithm"],
  AC9M6A03: ["bracket-order", "reverse-algorithm"],
};

assert.equal(PATTERN_PEAKS_WEEKLY_QUIZ_FORMS.length, 28, "Pattern Peaks must have 28 weekly quiz forms");
const quizIds = new Set<string>();
for (const form of PATTERN_PEAKS_WEEKLY_QUIZ_FORMS) {
  assert.equal(form.tasks.length, 15, `Year ${form.level} Week ${form.week} must have 15 items`);
  assert.deepEqual([0, 1, 2].map((lesson) => form.tasks.slice(lesson * 5, lesson * 5 + 5).length), [5, 5, 5]);
  form.tasks.forEach((task, index) => {
    assert.equal(task.kind, "patternPeaksQuestion");
    assert.ok(task.speakText.length > task.prompt.length, "Read-aloud must include the response instruction/options");
    const key = JSON.stringify(task);
    assert.ok(!quizIds.has(key)); quizIds.add(key);
  });
  const difficultyCounts = new Map<string, number>();
  form.tasks.forEach((task) => difficultyCounts.set(task.difficulty ?? "missing", (difficultyCounts.get(task.difficulty ?? "missing") ?? 0) + 1));
  const expected = form.level === 3 ? [5, 7, 3] : form.level === 4 ? [4, 7, 4] : form.level === 5 ? [3, 7, 5] : [2, 7, 6];
  assert.deepEqual([difficultyCounts.get("easy") ?? 0, difficultyCounts.get("medium") ?? 0, difficultyCounts.get("hard") ?? 0], expected);
}
for (const level of levels) {
  assert.equal(getPatternPeaksWeeklyQuizTasks(level, 8), null, "Week 8 is the Post-Test, not a weekly quiz");
  assert.equal(PATTERN_PEAKS_PROGRAMS[`Year ${level}`].length, 8);
}
assert.equal(quizIds.size, 420, "All 420 weekly questions must be present");

assert.equal(PATTERN_PEAKS_ASSESSMENT_BLUEPRINTS.length, 4);
assert.equal(Object.keys(PATTERN_PEAKS_INDEPENDENT_ASSESSMENT_FORMS).length, 7);
assert.deepEqual(getPatternPeaksIndependentAssessment(3, "pretest"), [], "Entry Level 3 must not have a Pre-Test");
assert.equal(isRealmFirstLevel("pattern", "Year 3"), true, "Pattern Peaks Year 3 must bypass placement testing");
assert.deepEqual(getPretestForYearLabel("Year 3", "pattern"), []);

const allIds = new Set<string>();
const allPrompts = new Set<string>();
let totalAssessmentItems = 0;
for (const level of levels) {
  const blueprint = getPatternPeaksAssessmentBlueprint(level)!;
  assert.deepEqual(level < 6 ? validateAssessmentBlueprintForLevel(level as 3 | 4 | 5, "pattern") : validatePatternPeaksAssessmentBlueprintForLevel(level), []);
  assert.equal(getPosttestForYearLabel(`Year ${level}`, "pattern")?.questions.length, 20);
  if (level > 3) assert.equal(getPretestForYearLabel(`Year ${level}`, "pattern").length, 20);
  assert.equal(blueprint.descriptors.reduce((sum, descriptor) => sum + descriptor.allocation.posttest, 0), 20);
  for (const profile of blueprint.forms) {
    const items = getPatternPeaksIndependentAssessment(level, profile.kind);
    totalAssessmentItems += items.length;
    assert.equal(items.length, 20, `Year ${level} ${profile.kind} must have 20 items`);
    assert.equal(items.filter((item) => item.responseMode === "selected_response").length, profile.selectedResponseMaximum);
    assert.ok(items.filter((item) => item.responseMode !== "selected_response").length >= profile.constructedOrManipulatedMinimum);
    assert.equal(Object.values(profile.difficultyMix).reduce((a, b) => a + b, 0), 20);
    assert.equal(Object.values(profile.cognitiveMix).reduce((a, b) => a + b, 0), 20);

    const descriptorCounts = new Map<string, number>();
    const difficultyCounts = new Map<string, number>();
    const cognitiveCounts = new Map<string, number>();
    for (const item of items) {
      assert.equal(item.realm, "pattern");
      assert.equal(item.origin, "assessment_authored");
      assert.equal(item.sourcePool, profile.kind);
      assert.equal(item.type, "patternPeaksTask");
      assert.equal(item.practiceTask?.kind, "patternPeaksQuestion");
      assert.equal(isPracticeTaskSafe(item.practiceTask), true, `${item.id} must be accepted by the production renderer`);
      assert.ok(item.curriculumCodes?.includes(item.primaryDescriptorCode));
      assert.ok(descriptorStructures[item.primaryDescriptorCode]?.some((structure) => item.structureKey.includes(structure)), `${item.id} structure must match ${item.primaryDescriptorCode}`);
      assert.ok(item.misconceptionTags.length > 0);
      assert.ok(!allIds.has(item.id), `Duplicate id ${item.id}`);
      assert.ok(!allPrompts.has(item.prompt), `Duplicate prompt ${item.prompt}`);
      allIds.add(item.id); allPrompts.add(item.prompt);
      descriptorCounts.set(item.primaryDescriptorCode, (descriptorCounts.get(item.primaryDescriptorCode) ?? 0) + 1);
      difficultyCounts.set(item.difficulty, (difficultyCounts.get(item.difficulty) ?? 0) + 1);
      cognitiveCounts.set(item.cognitiveCategory, (cognitiveCounts.get(item.cognitiveCategory) ?? 0) + 1);
    }
    for (const descriptor of blueprint.descriptors) {
      assert.equal(descriptorCounts.get(descriptor.code) ?? 0, descriptor.allocation[profile.kind]);
    }
    const selectedPositions = items.flatMap((item) => item.selectedAnswerPosition == null ? [] : [item.selectedAnswerPosition]);
    assert.equal(new Set(selectedPositions).size, Math.min(3, profile.selectedResponseMaximum), "Correct-answer positions must rotate");
    assert.equal(difficultyCounts.get("easy") ?? 0, profile.difficultyMix.accessible);
    assert.equal(difficultyCounts.get("moderate") ?? 0, profile.difficultyMix.moderate);
    assert.equal(difficultyCounts.get("challenging") ?? 0, profile.difficultyMix.challenging);
    for (const [category, count] of Object.entries(profile.cognitiveMix)) {
      assert.equal(cognitiveCounts.get(category) ?? 0, count);
    }
    assert.ok(items.filter((item) => item.responseMode === "selected_response").length <= selectedMaximum[level]);
  }
}
assert.equal(totalAssessmentItems, 140);

const requiredStructures: Record<number, string[]> = {
  3: ["extended-sequence", "function-machine", "inverse-fact", "relational-equality", "derived-fact"],
  4: ["unknown-position", "inverse-add-sub", "regroup-addends", "derived-multiplication"],
  5: ["multiplicative-unknown", "multiplication-property", "distributive", "factor-constraints", "multiple-constraint"],
  6: ["stage-generalisation", "multi-representation-rule", "bracket-order", "reverse-algorithm", "three-step-algorithm"],
};
for (const level of levels) {
  const structures = getPatternPeaksIndependentAssessment(level, "posttest").map((item) => item.structureKey);
  for (const required of requiredStructures[level]) assert.ok(structures.some((value) => value.includes(required)), `Year ${level} must assess ${required}`);
}

for (const level of [4, 5, 6] as const) {
  assert.notDeepEqual(
    getPatternPeaksIndependentAssessment(level, "pretest").map((item) => item.practiceTask),
    getPatternPeaksIndependentAssessment(level, "posttest").map((item) => item.practiceTask),
    `Year ${level} Pre and Post forms must be independent`,
  );
}

const weeklySource = readFileSync(`${root}/data/activities/patternPeaks/weeklyQuizBank.ts`, "utf8");
const assessmentSource = readFileSync(`${root}/data/assessments/patternPeaksIndependentBanks.ts`, "utf8");
assert.ok(!weeklySource.includes("lessonEngineGenerator"), "Weekly bank cannot import the lesson generator");
assert.ok(!assessmentSource.includes("weeklyQuizBank"), "Assessment bank cannot import the weekly bank");
assert.ok(!assessmentSource.includes("patternPeaksQuestionGenerator"), "Assessment bank cannot import the lesson generator");

const apiSource = readFileSync(`${root}/data/assessments/api.ts`, "utf8");
const programSource = readFileSync(`${root}/app/program/page.tsx`, "utf8");
const pretestSource = readFileSync(`${root}/app/pretest/page.tsx`, "utf8");
const posttestSource = readFileSync(`${root}/app/posttest/page.tsx`, "utf8");
const lessonRouteSource = readFileSync(`${root}/app/pattern-peaks/lesson/[level]/[week]/[lesson]/page.tsx`, "utf8");
const quizRouteSource = readFileSync(`${root}/app/pattern-peaks/quiz/[level]/[week]/page.tsx`, "utf8");
const lessonShellSource = readFileSync(`${root}/components/pattern-peaks/PatternPeaksLessonShell.tsx`, "utf8");
assert.ok(apiSource.includes('case "pattern"'));
assert.ok(programSource.includes("/pattern-peaks/quiz/"));
assert.ok(pretestSource.includes('question?.type === "patternPeaksTask"'));
assert.ok(posttestSource.includes('q?.type === "patternPeaksTask"'));
assert.ok(lessonRouteSource.includes("CanonicalRealmActivityGate") && lessonRouteSource.includes('activity="lesson"'));
assert.ok(quizRouteSource.includes("CanonicalRealmActivityGate") && quizRouteSource.includes('activity="quiz"'));
assert.ok(lessonShellSource.includes("saveRealmLessonAttempt") && lessonShellSource.includes('"pattern" as LiveRealmId'));
assert.ok(lessonShellSource.includes("completionKeyRef.current") && lessonShellSource.includes("exitRequestedRef.current"));

console.log("Pattern Peaks assessment audit passed: 28 weekly forms / 420 quiz items / 7 independent Pre-Post forms / 140 assessment items.");
