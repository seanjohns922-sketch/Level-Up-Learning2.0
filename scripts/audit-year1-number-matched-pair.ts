import assert from "node:assert/strict";
import { YEAR1_NUMBER_MATCHED_PRE_ITEMS as pre, YEAR1_NUMBER_MATCHED_POST_ITEMS as post } from "../data/assessments/revisions/year1NumberMatchedPair";
import { YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS as oldPre, YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as oldPost } from "../data/assessments/year1NumberNexusIndependentBanks";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { assessmentEvidenceMetadata } from "../lib/assessment-growth";

// Independently worked answers, not read from the banks' answer-key fields.
const answers = [
  ["46", "38", "20", "14", "11", "4", "8", "star", "120", "7", "27", "12 groups of 10", "8", "7", "4", "30", "star||star", "97||110||120", "No. Coin values matter.", "No"],
  ["73", "64", "25", "16", "11", "5", "10", "robot", "119", "7", "34", "11 groups of 10", "9", "8", "5", "35", "robot||robot", "98||109||120", "No. Coin values matter.", "No"],
];
for (const [form, items] of [pre, post].entries()) {
  assert.equal(items.length, 20);
  for (const [index, item] of items.entries()) {
    assert.equal(isAssessmentAnswerCorrect(item, answers[form][index]), true, item.id);
    assert.equal(isAssessmentAnswerCorrect(item, "__wrong__"), false, item.id);
    assert.equal(isAssessmentAnswerCorrect(item, ""), false, item.id);
    assert.equal(item.scoring.correctResponse, answers[form][index]);
    assert.equal((item.renderer.payload as Record<string, unknown>).correctAnswer, answers[form][index]);
    assert.equal(item.primaryDescriptorCode, pre[index].primaryDescriptorCode);
    assert.equal(item.type, pre[index].type);
    assert.equal(item.difficulty, pre[index].difficulty);
    if (item.options) for (const option of item.options) {
      assert.equal(isAssessmentAnswerCorrect(item, String(option)), option === answers[form][index], `${item.id}: ${option}`);
    }
  }
  const choices = (items[11].visual as Record<string, unknown>).choices as { count: number; size: number }[];
  assert.deepEqual(choices.map(c => `${c.count} groups of ${c.size}`), items[11].options);
  assert.equal(choices[items[11].selectedAnswerPosition! - 1].count * choices[items[11].selectedAnswerPosition! - 1].size, form === 0 ? 120 : 110);
  // Both missing-part calculations bridge ten; both money additions stay below ten.
  const part = items[9].visual as { whole: number; parts: number[] };
  assert.ok(part.whole > 10 && part.parts[0] < 10 && part.whole - part.parts[0] < 10);
  assert.ok(((items[13].visual as Record<string, unknown>).amounts as number[]).reduce((a, b) => a + b, 0) < 10);
  assert.equal((items[14].visual as Record<string, unknown>).groupSize, 4);
  assert.equal(((items[15].visual as Record<string, unknown>).values as unknown[]).indexOf(null), 2);
}
for (const items of [oldPre, oldPost]) assert.ok(items.every(q => q.id.endsWith("-v2")));
assert.deepEqual(pre.map(q => q.prompt), oldPre.map(q => q.prompt));
assert.deepEqual(pre.map(q => q.correctAnswer), oldPre.map(q => q.correctAnswer));
for (let i = 0; i < 20; i++) if (![9, 11, 13, 14, 15, 19].includes(i)) {
  assert.equal(post[i].prompt, oldPost[i].prompt);
  assert.deepEqual(post[i].visual, oldPost[i].visual);
}
const v3group = assessmentEvidenceMetadata("number", "Year 1", post).assessment_evidence?.comparison_group;
assert.equal(v3group, "paired-number-Year 1-2026-09-15-v3");
assert.equal(assessmentEvidenceMetadata("number", "Year 1", pre).assessment_evidence?.comparison_group, v3group);
assert.notEqual(assessmentEvidenceMetadata("number", "Year 1", oldPre).assessment_evidence?.comparison_group, v3group);
console.log("Year 1 matched pair: 40 independent answers, distractors, paired demands and released-v2 preservation pass.");


// Release routing, saved response snapshots and teacher growth use the same versions.
const { savedYear1NumberVersion, year1NumberPostVersion } = await import("../lib/year1-number-assessment-version");
const { comparableAssessmentGrowth } = await import("../lib/assessment-growth");
const { buildAssessmentQuestionSnapshots } = await import("../lib/assessment-replay");
const { getPretestForYearLabel, getPosttestForYearLabel } = await import("../data/assessments/api");
const { getDiagnosticQuestions } = await import("../lib/whole-maths-diagnostic-questions");
assert.deepEqual(getPretestForYearLabel("Year 1", "number").map(q => q.id), pre.map(q => q.id));
assert.deepEqual(getPosttestForYearLabel("Year 1", "number", 2)!.questions.map(q => q.id), oldPost.map(q => q.id));
assert.equal(savedYear1NumberVersion(oldPre.map(q => q.id)), 2);
assert.equal(savedYear1NumberVersion(pre.map(q => q.id)), 3);
assert.equal(savedYear1NumberVersion([oldPre[0].id, pre[1].id]), null);
assert.equal(year1NumberPostVersion([]), 2, "Unknown historical baseline stays v2");
const attempt = (id: string, kind: "pretest" | "posttest", questions: typeof pre, percent: number, cycle: string, day: number) => ({
  id, realmId: "number", workingLevel: "Year 1", assessmentType: kind, attemptNumber: 1,
  correctCount: percent / 5, totalQuestions: 20, scorePercent: percent, passed: false,
  completedAt: `2026-09-${day}T00:00:00Z`, questionResults: [],
  placementResult: { assessment_evidence: { ...assessmentEvidenceMetadata("number", "Year 1", questions).assessment_evidence, learning_cycle_id: cycle } },
});
const baseline = attempt("v3-pre", "pretest", pre, 40, "new-cycle", 16);
const endpoint = attempt("v3-post", "posttest", post, 85, "new-cycle", 17);
assert.equal(year1NumberPostVersion([baseline]), 3);
assert.equal(year1NumberPostVersion([baseline], [oldPost[0].id]), 2, "Interrupted v2 post-test remains v2");
assert.equal(comparableAssessmentGrowth([baseline, endpoint], "number", "Year 1").change, 45);
const historical = attempt("v2-pre", "pretest", [...oldPre], 40, "new-cycle", 15);
assert.equal(comparableAssessmentGrowth([historical, endpoint], "number", "Year 1").change, null, "Never subtract v2 from v3");
assert.equal(comparableAssessmentGrowth([baseline, { ...endpoint, placementResult: { assessment_evidence: { ...endpoint.placementResult.assessment_evidence, learning_cycle_id: "other" } } }], "number", "Year 1").change, null);
const snapshots = buildAssessmentQuestionSnapshots(post, (_, i) => answers[1][i], (q, a) => isAssessmentAnswerCorrect(q as typeof post[number], String(a)), "2026-09-16T00:00:00Z");
const saved = JSON.parse(JSON.stringify(snapshots));
assert.equal(saved.length, 20);
assert.equal(saved[9].question_version, "3.0.0");
assert.equal(saved[9].question_text, post[9].prompt);
assert.equal(saved[9].correct_answer, "7");
assert.deepEqual(saved[11].visual, post[11].visual);
for (const checkpoint of ["start", "mid", "end"] as const) {
  assert.ok(getDiagnosticQuestions("number", "Year 1", "existing-sitting", checkpoint).every(q => q.question.id.endsWith("-v2")), "Existing diagnostic sittings stay pinned");
}
console.log("Version routing, snapshot roundtrip, 45-point growth, mixed-version/cycle rejection and legacy diagnostic preservation pass.");
