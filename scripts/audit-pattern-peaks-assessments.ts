import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PATTERN_PEAKS_PROGRAMS } from "@/data/programs/patternPeaks";
import { PATTERN_PEAKS_WEEKLY_QUIZ_FORMS, getPatternPeaksWeeklyQuizTasks } from "@/data/activities/patternPeaks/weeklyQuizBank";
import { PATTERN_PEAKS_ASSESSMENT_BLUEPRINTS, getPatternPeaksAssessmentBlueprint, validatePatternPeaksAssessmentBlueprintForLevel } from "@/data/assessments/patternPeaksAssessmentBlueprint";
import { PATTERN_PEAKS_INDEPENDENT_ASSESSMENT_FORMS, getPatternPeaksIndependentAssessment } from "@/data/assessments/patternPeaksIndependentBanks";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import { getPosttestForYearLabel, getPretestForYearLabel, validateAssessmentBlueprintForLevel } from "@/data/assessments/api";
import { isRealmFirstLevel } from "@/lib/realms/realm-registry";
import { getPatternQuestionReadAloudText } from "@/lib/pattern-question-read-aloud";

const levels = [3, 4, 5, 6] as const;
const root = process.cwd();
const selectedMaximum = { 3: 4, 4: 3, 5: 2, 6: 1 } as const;
const descriptorStructures: Record<string, string[]> = {
  AC9M3A01: ["add-sub-inverse", "subtraction-unknown", "partition-equivalence"],
  AC9M3A02: ["derived-addition-fact", "derived-subtraction-fact"],
  AC9M3A03: ["multiplication-fact", "related-division-fact", "connected-fact-family"],
  AC9M3A04: ["multiple-algorithm", "odd-even-algorithm", "ordered-number-algorithm"],
  AC9M4A01: ["unknown-addend", "unknown-subtrahend", "unknown-minuend", "balanced-addition-equation", "compensating-equivalence", "connected-addition-equations"],
  AC9M4A02: ["multiplication-product", "multiplication-unknown", "division-quotient", "division-unknown", "derived-multiplication-fact", "connected-fact-family"],
  AC9M5A01: ["extended-additive-sequence", "decimal-additive-sequence", "fraction-additive-sequence"],
  AC9M5A02: ["multiplicative-unknown", "division-unknown", "multiplication-property", "distributive-equivalence"],
  AC9M5A03: ["factor-search-algorithm", "common-multiple-algorithm", "multiple-search-algorithm"],
  AC9M6A01: ["natural-number-sequence", "decimal-sequence", "fraction-sequence", "reverse-sequence", "sequence-rule-transfer", "visual-stage-generalisation", "rational-rule-transfer"],
  AC9M6A02: ["bracket-order", "bracketed-unknown", "bracketed-equivalence", "two-sided-unknown", "connected-bracketed-equations", "bracket-placement-comparison"],
  AC9M6A03: ["follow-function-machine", "infer-function-rule", "compare-function-machines", "debug-function-machine", "branching-number-algorithm", "reverse-number-algorithm", "generated-number-set"],
};
const assessmentCoachingPattern = /\b(use the|undo|regroup|check both sides|calculate efficiently|brackets first|inverse operation|follow the full algorithm)\b/i;

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
      if (item.practiceTask?.kind === "patternPeaksQuestion") {
        const question = item.practiceTask.question;
        assert.ok(
          !assessmentCoachingPattern.test(question.prompt),
          `${item.id} assessment prompt must not coach a solving strategy`,
        );
        const independentSpeech = getPatternQuestionReadAloudText(question, { includeSupport: false });
        assert.ok(!independentSpeech.includes("Undo step"), `${item.id} assessment audio must not announce an undo step`);
        if (question.visual?.type === "inverse_step_card") {
          assert.ok(
            !independentSpeech.includes(question.visual.inverseOperation),
            `${item.id} assessment audio must not reveal the inverse operation`,
          );
          assert.ok(
            question.visual.equation.includes("?") || question.visual.equation.includes("□"),
            `${item.id} assessment equation must not reveal its answer`,
          );
        }
      }
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
  3: ["add-sub-inverse", "subtraction-unknown", "partition-equivalence", "derived-addition-fact", "derived-subtraction-fact", "multiplication-fact", "related-division-fact", "connected-fact-family", "multiple-algorithm", "odd-even-algorithm", "ordered-number-algorithm"],
  4: ["unknown-addend", "unknown-subtrahend", "unknown-minuend", "balanced-addition-equation", "compensating-equivalence", "connected-addition-equations", "multiplication-product", "multiplication-unknown", "division-quotient", "division-unknown", "derived-multiplication-fact", "connected-fact-family"],
  5: ["extended-additive-sequence", "decimal-additive-sequence", "fraction-additive-sequence", "multiplicative-unknown", "division-unknown", "multiplication-property", "distributive-equivalence", "factor-search-algorithm", "common-multiple-algorithm", "multiple-search-algorithm"],
  6: ["natural-number-sequence", "decimal-sequence", "fraction-sequence", "reverse-sequence", "sequence-rule-transfer", "visual-stage-generalisation", "rational-rule-transfer", "bracket-order", "bracketed-unknown", "bracketed-equivalence", "two-sided-unknown", "connected-bracketed-equations", "bracket-placement-comparison", "follow-function-machine", "infer-function-rule", "compare-function-machines", "debug-function-machine", "branching-number-algorithm", "reverse-number-algorithm", "generated-number-set"],
};
for (const level of levels) {
  const structures = getPatternPeaksIndependentAssessment(level, "posttest").map((item) => item.structureKey);
  for (const required of requiredStructures[level]) assert.ok(structures.some((value) => value.includes(required)), `Year ${level} must assess ${required}`);
}

for (const form of ["pretest", "posttest"] as const) {
  const levelFourItems = getPatternPeaksIndependentAssessment(4, form);
  assert.equal(levelFourItems.filter((item) => item.primaryDescriptorCode === "AC9M4A01").length, 10);
  assert.equal(levelFourItems.filter((item) => item.primaryDescriptorCode === "AC9M4A02").length, 10);
  for (let index = 1; index < levelFourItems.length; index += 1) {
    assert.notEqual(
      levelFourItems[index]!.primaryDescriptorCode,
      levelFourItems[index - 1]!.primaryDescriptorCode,
      `Year 4 ${form} descriptors must be interleaved`,
    );
  }
  const levelFourStructures = levelFourItems.map((item) => item.structureKey);
  for (const code of ["AC9M4A01", "AC9M4A02"]) {
    for (const structure of descriptorStructures[code]!) {
      assert.ok(
        levelFourItems.some((item) => item.primaryDescriptorCode === code && item.structureKey.includes(structure)),
        `Year 4 ${form} must include ${structure}`,
      );
    }
  }
  const levelFourMaths = levelFourItems.map((item) => {
    assert.equal(item.practiceTask?.kind, "patternPeaksQuestion");
    const question = item.practiceTask.question;
    return JSON.stringify({ ...question, prompt: question.prompt.replace(/^Peak (North|South)-\d+:\s*/, "") });
  });
  assert.equal(new Set(levelFourMaths).size, 20, `Year 4 ${form} must not repeat a mathematical item`);
  assert.ok(!levelFourStructures.some((value) => value.includes("inverse-step")), `Year 4 ${form} must not expose an inverse-operation scaffold`);
}

const levelThreeItems = getPatternPeaksIndependentAssessment(3, "posttest");
assert.deepEqual(
  ["AC9M3A01", "AC9M3A02", "AC9M3A03", "AC9M3A04"].map((code) => levelThreeItems.filter((item) => item.primaryDescriptorCode === code).length),
  [5, 5, 5, 5],
  "Year 3 Post-Test must allocate five items to every Algebra descriptor",
);
for (let index = 1; index < levelThreeItems.length; index += 1) {
  assert.notEqual(levelThreeItems[index]!.primaryDescriptorCode, levelThreeItems[index - 1]!.primaryDescriptorCode, "Year 3 standards must be interleaved");
}
for (const code of ["AC9M3A01", "AC9M3A02", "AC9M3A03", "AC9M3A04"]) {
  for (const structure of descriptorStructures[code]!) {
    assert.ok(levelThreeItems.some((item) => item.primaryDescriptorCode === code && item.structureKey.includes(structure)), `Year 3 Post-Test must include ${structure}`);
  }
}
const levelThreeMaths = levelThreeItems.map((item) => {
  assert.equal(item.practiceTask?.kind, "patternPeaksQuestion");
  const question = item.practiceTask.question;
  return JSON.stringify({ ...question, prompt: question.prompt.replace(/^Peak South-\d+:\s*/, "") });
});
assert.equal(new Set(levelThreeMaths).size, 20, "Year 3 Post-Test must not repeat a mathematical item");

for (const form of ["pretest", "posttest"] as const) {
  const levelFiveItems = getPatternPeaksIndependentAssessment(5, form);
  assert.deepEqual(
    ["AC9M5A01", "AC9M5A02", "AC9M5A03"].map((code) => levelFiveItems.filter((item) => item.primaryDescriptorCode === code).length),
    [6, 8, 6],
    `Year 5 ${form} must preserve the 6/8/6 standards allocation`,
  );
  let longestDescriptorRun = 1;
  let currentDescriptorRun = 1;
  for (let index = 1; index < levelFiveItems.length; index += 1) {
    currentDescriptorRun = levelFiveItems[index]!.primaryDescriptorCode === levelFiveItems[index - 1]!.primaryDescriptorCode
      ? currentDescriptorRun + 1
      : 1;
    longestDescriptorRun = Math.max(longestDescriptorRun, currentDescriptorRun);
  }
  assert.ok(longestDescriptorRun <= 2, `Year 5 ${form} must interleave standards rather than block repeated skills`);
  for (const code of ["AC9M5A01", "AC9M5A02", "AC9M5A03"]) {
    for (const structure of descriptorStructures[code]!) {
      assert.ok(
        levelFiveItems.some((item) => item.primaryDescriptorCode === code && item.structureKey.includes(structure)),
        `Year 5 ${form} must include ${structure}`,
      );
    }
  }
}

for (const level of [4, 5, 6] as const) {
  assert.notDeepEqual(
    getPatternPeaksIndependentAssessment(level, "pretest").map((item) => item.practiceTask),
    getPatternPeaksIndependentAssessment(level, "posttest").map((item) => item.practiceTask),
    `Year ${level} Pre and Post forms must be independent`,
  );
}

const normaliseLevelFourTask = (item: ReturnType<typeof getPatternPeaksIndependentAssessment>[number]) => {
  if (item.practiceTask?.kind !== "patternPeaksQuestion") return "";
  const question = item.practiceTask.question;
  return JSON.stringify({
    ...question,
    prompt: question.prompt.replace(/^Peak (North|South)-\d+:\s*/, ""),
  });
};
const levelFourPrePayloads = new Set(getPatternPeaksIndependentAssessment(4, "pretest").map(normaliseLevelFourTask));
const levelFourPostPayloads = getPatternPeaksIndependentAssessment(4, "posttest").map(normaliseLevelFourTask);
assert.equal(
  levelFourPostPayloads.filter((payload) => levelFourPrePayloads.has(payload)).length,
  0,
  "Year 4 Pre-Test and Post-Test must not reuse an identical mathematical item",
);

const normaliseYearFiveTask = (item: ReturnType<typeof getPatternPeaksIndependentAssessment>[number]) => {
  if (item.practiceTask?.kind !== "patternPeaksQuestion") return "";
  const question = item.practiceTask.question;
  return JSON.stringify({
    question: {
      ...question,
      prompt: question.prompt.replace(/^Peak (North|South)-\d+:\s*/, ""),
    },
    descriptor: item.primaryDescriptorCode,
    structure: item.structureKey.replace(/-(pretest|posttest)-/, "-form-").replace(/-\d+$/, ""),
  });
};
const levelFivePrePayloads = new Set(getPatternPeaksIndependentAssessment(5, "pretest").map(normaliseYearFiveTask));
const levelFivePostPayloads = getPatternPeaksIndependentAssessment(5, "posttest").map(normaliseYearFiveTask);
assert.equal(
  levelFivePostPayloads.filter((payload) => levelFivePrePayloads.has(payload)).length,
  0,
  "Year 5 Pre and Post must not reuse mathematically identical items",
);

const normaliseLevelSixTask = (item: ReturnType<typeof getPatternPeaksIndependentAssessment>[number]) => {
  if (item.practiceTask?.kind !== "patternPeaksQuestion") return "";
  const question = item.practiceTask.question;
  return JSON.stringify({
    ...question,
    prompt: question.prompt.replace(/^Peak (North|South)-\d+:\s*/, ""),
  });
};
for (const form of ["pretest", "posttest"] as const) {
  const items = getPatternPeaksIndependentAssessment(6, form);
  assert.deepEqual(
    ["AC9M6A01", "AC9M6A02", "AC9M6A03"].map((code) => items.filter((item) => item.primaryDescriptorCode === code).length),
    [7, 6, 7],
    `Year 6 ${form} must preserve the 7/6/7 standards allocation`,
  );
  for (let index = 1; index < items.length; index += 1) {
    assert.notEqual(items[index]!.primaryDescriptorCode, items[index - 1]!.primaryDescriptorCode, `Year 6 ${form} standards must be interleaved`);
  }
  for (const code of ["AC9M6A01", "AC9M6A02", "AC9M6A03"]) {
    for (const structure of descriptorStructures[code]!) {
      assert.ok(
        items.some((item) => item.primaryDescriptorCode === code && item.structureKey.includes(structure)),
        `Year 6 ${form} must include ${structure}`,
      );
    }
  }
  assert.equal(new Set(items.map(normaliseLevelSixTask)).size, 20, `Year 6 ${form} must contain 20 mathematically distinct items`);
}
const levelSixPrePayloads = new Set(getPatternPeaksIndependentAssessment(6, "pretest").map(normaliseLevelSixTask));
const levelSixPostPayloads = getPatternPeaksIndependentAssessment(6, "posttest").map(normaliseLevelSixTask);
assert.equal(
  levelSixPostPayloads.filter((payload) => levelSixPrePayloads.has(payload)).length,
  0,
  "Year 6 Pre-Test and Post-Test must not reuse an identical mathematical item",
);

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
const taskRendererSource = readFileSync(`${root}/components/TaskRenderer.tsx`, "utf8");
const patternQuestionCardSource = readFileSync(`${root}/components/pattern-peaks/PatternPeaksQuestionCard.tsx`, "utf8");
assert.ok(apiSource.includes('case "pattern"'));
assert.ok(programSource.includes("/pattern-peaks/quiz/"));
assert.ok(pretestSource.includes('question?.type === "patternPeaksTask"'));
assert.ok(posttestSource.includes('q?.type === "patternPeaksTask"'));
assert.ok(lessonRouteSource.includes("CanonicalRealmActivityGate") && lessonRouteSource.includes('activity="lesson"'));
assert.ok(quizRouteSource.includes("CanonicalRealmActivityGate") && quizRouteSource.includes('activity="quiz"'));
assert.ok(lessonShellSource.includes("saveRealmLessonAttempt") && lessonShellSource.includes('completionKey, "pattern"'));
assert.ok(lessonShellSource.includes("completionKeyRef.current") && lessonShellSource.includes("exitRequestedRef.current"));
assert.ok(taskRendererSource.includes("assessmentMode={assessmentMode}"), "Task renderer must pass assessment mode into Pattern Peaks");
assert.ok(patternQuestionCardSource.includes("assessmentMode={assessmentMode}"), "Pattern Peaks activities must receive assessment mode");

console.log("Pattern Peaks assessment audit passed: 28 weekly forms / 420 quiz items / 7 independent Pre-Post forms / 140 assessment items.");
