import assert from "node:assert/strict";
import { YEAR1_NUMBER_RELEASED_FORMS as forms } from "../data/assessments/revisions/year1NumberReleasedForms";
import { NUMBER_LEVEL1_FIVE_FORMS as review } from "../data/assessments/revisions/year1NumberFiveForms";
import { getPretestForYearLabel, getPosttestForYearLabel } from "../data/assessments/api";
import { savedYear1NumberVersion, year1NumberPostVersion } from "../lib/year1-number-assessment-version";
import { getDiagnosticQuestions } from "../lib/whole-maths-diagnostic-questions";
import { assessmentEvidenceMetadata, comparableAssessmentGrowth } from "../lib/assessment-growth";
import { buildAssessmentQuestionSnapshots } from "../lib/assessment-replay";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { NormalizedAssessmentAttempt } from "../lib/realm-progress-compat";
import { readFileSync } from "node:fs";
for(const form of ["pretest","posttest","start","mid","end"] as const) {
  forms[form].forEach((q,i)=>{
    assert.equal(q.prompt,review[form][i].prompt);
    assert.deepEqual(q.visual,review[form][i].visual);
    assert.equal(q.correctAnswer,review[form][i].correctAnswer);
    assert.ok(q.id.endsWith('-v5')&&!q.id.includes('review'));
    assert.equal(q.version,'5.0.0');
  });
}
assert.deepEqual(getPretestForYearLabel('Year 1','number').map(q=>q.id),forms.pretest.map(q=>q.id));
assert.deepEqual(getPosttestForYearLabel('Year 1','number')!.questions.map(q=>q.id),forms.posttest.map(q=>q.id));
for(const version of [2,3,5] as const) {
  const questions=getPretestForYearLabel('Year 1','number',version);
  assert.equal(savedYear1NumberVersion(questions.map(q=>q.id)),version);
  assert.ok(getPosttestForYearLabel('Year 1','number',version)!.questions.every(q=>q.id.endsWith(`-v${version}`)));
}
for(const checkpoint of ['start','mid','end'] as const) {
  const questions=getDiagnosticQuestions('number','Year 1','pinned-sitting',checkpoint,5);
  assert.deepEqual(questions.map(q=>q.question.id).sort(),forms[checkpoint].map(q=>q.id).sort());
  assert.ok(getDiagnosticQuestions('number','Year 1','old-sitting',checkpoint).every(q=>q.question.id.endsWith('-v2')));
}
const attempt=(type:'pretest'|'posttest', percent:number, questions:readonly {id:string}[], cycle='test-cycle'):NormalizedAssessmentAttempt=>({
  id:type, realmId:'number',workingLevel:'Year 1',assessmentType:type,attemptNumber:1,
  correctCount:percent/5,totalQuestions:20,scorePercent:percent,passed:false,
  completedAt:type==='pretest'?'2026-09-15T00:00:00Z':'2026-12-15T00:00:00Z',questionResults:[],
  placementResult:{assessment_evidence:{...assessmentEvidenceMetadata('number','Year 1',questions).assessment_evidence,learning_cycle_id:cycle}},
});
const pre=attempt('pretest',40,forms.pretest), post=attempt('posttest',85,forms.posttest);
assert.equal(year1NumberPostVersion([pre]),5);
assert.equal(year1NumberPostVersion([pre],getPosttestForYearLabel('Year 1','number',3)!.questions.map(q=>q.id)),3);
assert.equal(comparableAssessmentGrowth([pre,post],'number','Year 1').change,45);
assert.equal(comparableAssessmentGrowth([attempt('pretest',40,getPretestForYearLabel('Year 1','number',3)),post],'number','Year 1').change,null);
assert.equal(comparableAssessmentGrowth([pre,attempt('posttest',85,forms.posttest,'other-cycle')],'number','Year 1').change,null);
const snapshots=buildAssessmentQuestionSnapshots(forms.posttest, q=>String(q.correctAnswer), (q,a)=>isAssessmentAnswerCorrect(q as typeof forms.posttest[number],String(a)), '2026-09-15T00:00:00Z');
assert.equal(JSON.parse(JSON.stringify(snapshots))[13].question_version,'5.0.0');
assert.equal(snapshots[13].correct_answer,'9');
const visual=readFileSync('components/assessment/NumberNexusYear1AssessmentVisual.tsx','utf8');
assert.ok(visual.includes('renderCoins(Number(visual.paid))')&&visual.includes('renderCoins(price)'));
for(const bank of Object.values(forms)) {
  assert.match(bank[4].prompt,/How many more/);
  assert.match(bank[18].prompt,/How much more money/);
}
console.log('Live Level 1 release: five approved forms, legacy resume, pinned checkpoints, snapshots, growth and money presentation pass.');
