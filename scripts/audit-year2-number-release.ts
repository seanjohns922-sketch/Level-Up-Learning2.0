import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { YEAR2_NUMBER_RELEASED_FORMS as forms } from "../data/assessments/revisions/year2NumberReleasedForms";
import { NUMBER_LEVEL2_FIVE_FORMS as review } from "../data/assessments/revisions/year2NumberFiveForms";
import {
  YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as v2Post,
  YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS as v2Pre,
} from "../data/assessments/year2NumberNexusIndependentBanks";
import { getPosttestForYearLabel, getPretestForYearLabel } from "../data/assessments/api";
import { savedYear2NumberVersion, year2NumberPostVersion } from "../lib/year2-number-assessment-version";
import { getDiagnosticQuestions } from "../lib/whole-maths-diagnostic-questions";
import { assessmentEvidenceMetadata, comparableAssessmentGrowth } from "../lib/assessment-growth";
import { buildAssessmentQuestionSnapshots } from "../lib/assessment-replay";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { NormalizedAssessmentAttempt } from "../lib/realm-progress-compat";

// Released content is exactly the owner-approved review content, under production identities.
const FORMS = ["pretest", "posttest", "start", "mid", "end"] as const;
const ids = new Set<string>();
for (const form of FORMS) {
  assert.equal(forms[form].length, 20, `${form} has 20 items`);
  forms[form].forEach((q, i) => {
    const source = review[form][i]!;
    const short = form === "pretest" ? "pre" : form === "posttest" ? "post" : form;
    assert.equal(q.id, `y2-number-${short}-${String(i + 1).padStart(2, "0")}-v3`);
    assert.equal(q.version, "3.0.0");
    assert.equal(q.prompt, source.prompt);
    assert.deepEqual(q.visual, source.visual);
    assert.deepEqual(q.options, source.options);
    assert.equal(q.correctAnswer, source.correctAnswer);
    assert.equal((q.renderer.payload as { correctAnswer?: string }).correctAnswer, q.correctAnswer);
    assert.equal(isAssessmentAnswerCorrect(q, String(q.correctAnswer)), true, q.id);
    ids.add(q.id);
  });
}
assert.equal(ids.size, 100);
assert.ok(forms.pretest.every((q) => q.prompt !== "What number do 5 hundreds, 0 tens and 4 ones make?"));
assert.ok(FORMS.every((form) => !/\d/.test(forms[form][2]!.prompt)), "Q3 must not read out the digits");

// New tests resolve v3; the v2 pair stays available for existing attempts; other levels are unaffected.
assert.deepEqual(getPretestForYearLabel("Year 2", "number").map((q) => q.id), forms.pretest.map((q) => q.id));
assert.deepEqual(getPosttestForYearLabel("Year 2", "number")!.questions.map((q) => q.id), forms.posttest.map((q) => q.id));
assert.deepEqual(getPretestForYearLabel("Year 2", "number", 5, 3, 2).map((q) => q.id), v2Pre.map((q) => q.id));
assert.deepEqual(getPosttestForYearLabel("Year 2", "number", 5, 3, 2)!.questions.map((q) => q.id), v2Post.map((q) => q.id));
for (const version of [2, 3] as const) {
  assert.equal(savedYear2NumberVersion(getPretestForYearLabel("Year 2", "number", 5, 3, version).map((q) => q.id)), version);
  assert.equal(savedYear2NumberVersion(getPosttestForYearLabel("Year 2", "number", 5, 3, version)!.questions.map((q) => q.id)), version);
}
assert.equal(savedYear2NumberVersion(["y1-number-pre-01-v5"]), null);
assert.equal(savedYear2NumberVersion(undefined), null);
assert.ok(getPretestForYearLabel("Year 1", "number").every((q) => q.id.endsWith("-v5")), "Level 1 routing changed");

// Diagnostics: pinned v3 cycles use the Start/Mid/End forms; existing cycles keep the v2 pair.
for (const checkpoint of ["start", "mid", "end"] as const) {
  assert.deepEqual(getDiagnosticQuestions("number", "Year 2", "pinned", checkpoint, 2, 1, 3).map((q) => q.question.id).sort(), forms[checkpoint].map((q) => q.id).sort());
  assert.ok(getDiagnosticQuestions("number", "Year 2", "existing", checkpoint).every((q) => q.question.id.endsWith("-v2")), `${checkpoint} existing cycle must stay v2`);
}
assert.deepEqual(getDiagnosticQuestions("number", "Year 2", "adhoc", "ad_hoc", 2, 1, 3).map((q) => q.question.id).sort(), forms.start.map((q) => q.id).sort());
assert.ok(getDiagnosticQuestions("number", "Year 1", "other", "start", 5, 1, 3).every((q) => q.question.id.endsWith("-v5")), "Level 1 diagnostics changed");

// Growth compares only the same version and learning cycle.
const attempt = (type: "pretest" | "posttest", percent: number, questions: readonly { id: string }[], cycle = "cycle-a"): NormalizedAssessmentAttempt => ({
  id: type, realmId: "number", workingLevel: "Year 2", assessmentType: type, attemptNumber: 1,
  correctCount: percent / 5, totalQuestions: 20, scorePercent: percent, passed: percent >= 85,
  completedAt: type === "pretest" ? "2026-09-15T00:00:00Z" : "2026-12-15T00:00:00Z", questionResults: [],
  placementResult: { assessment_evidence: { ...assessmentEvidenceMetadata("number", "Year 2", questions).assessment_evidence, learning_cycle_id: cycle } },
});
const pre = attempt("pretest", 40, forms.pretest);
const post = attempt("posttest", 85, forms.posttest);
assert.equal((pre.placementResult.assessment_evidence as { comparison_group?: string }).comparison_group, "paired-number-Year 2-2026-09-15-v3");
assert.equal(year2NumberPostVersion([pre]), 3);
assert.equal(year2NumberPostVersion([]), 2);
assert.equal(year2NumberPostVersion([attempt("pretest", 40, v2Pre)]), 2);
assert.equal(year2NumberPostVersion([pre], v2Post.map((q) => q.id)), 2, "A saved v2 post-test draft keeps v2");
assert.equal(comparableAssessmentGrowth([pre, post], "number", "Year 2").change, 45);
assert.equal(comparableAssessmentGrowth([attempt("pretest", 40, v2Pre), post], "number", "Year 2").change, null);
assert.equal(comparableAssessmentGrowth([pre, attempt("posttest", 85, forms.posttest, "cycle-b")], "number", "Year 2").change, null);

// Saved results snapshot the released question.
const snapshots = buildAssessmentQuestionSnapshots(forms.posttest, (q) => String(q.correctAnswer), (q, a) => isAssessmentAnswerCorrect(q as typeof forms.posttest[number], String(a)), "2026-09-15T00:00:00Z");
assert.equal(JSON.parse(JSON.stringify(snapshots))[2].question_version, "3.0.0");
assert.ok(snapshots.every((snapshot) => snapshot.correct));
assert.deepEqual(snapshots[5]!.visual, forms.posttest[5]!.visual);

// Pages, client and migration carry the pinned version.
const read = (path: string) => readFileSync(path, "utf8");
assert.ok(read("app/pretest/page.tsx").includes("savedYear2NumberVersion(snapshot?.questionIds)"), "Pre-test resume must pin the saved version");
assert.ok(read("app/posttest/page.tsx").includes("year2NumberPostVersion("), "Post-test must match the baseline version");
assert.ok(read("app/diagnostic/page.tsx").includes("pending.number_level2_bank_version??2"), "Diagnostic page must pass the pinned version");
const client = read("lib/whole-maths-diagnostic-client.ts");
assert.ok(client.includes('"get_pending_whole_math_diagnostic_level2"') && client.includes('"get_pending_whole_math_diagnostic_released"'), "Client must fall back until the migration is applied");
const migration = read("supabase/migrations/20260915180000_number_level2_five_form_release.sql");
for (const needle of [
  "number_level2_bank_version integer not null default 2",
  "alter column number_level2_bank_version set default 3",
  "trg_pin_number_level2_diagnostic_version",
  "get_pending_whole_math_diagnostic_level2",
  "get_pending_whole_math_diagnostic_released(p_student_id)",
  "'^y2-number-(pre|post)-[0-9]{2}-v'||v_sitting.number_level2_bank_version::text||'$'",
  "'^y1-number-(pre|post)-[0-9]{2}-v'",
  "'^y0-number-(pre|post)-[0-9]{2}-v'",
]) assert.ok(migration.includes(needle), `Migration is missing: ${needle}`);

console.log("Live Level 2 release: five approved forms, v2 resume and routing preserved, pinned checkpoints, snapshots, comparable growth and migration wiring pass.");
