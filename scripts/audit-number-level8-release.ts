import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {YEAR8_NUMBER_RELEASED_FORMS as forms} from '../data/assessments/revisions/year8NumberReleasedForms';
import {NUMBER_LEVEL8_FIVE_FORMS as review} from '../data/assessments/revisions/year8NumberFiveForms';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {getDiagnosticQuestions} from '../lib/whole-maths-diagnostic-questions';
import {decideDiagnosticPlacement,diagnosticQuestionCount} from '../lib/whole-maths-diagnostic';
import {buildAssessmentQuestionSnapshots} from '../lib/assessment-replay';
import {assessmentEvidenceMetadata} from '../lib/assessment-growth';
for(const name of ['pretest','posttest','start','mid','end'] as const){
 assert.equal(forms[name].length,30);
 forms[name].forEach((q,i)=>{assert.equal(q.prompt,review[name][i].prompt);assert.deepEqual(q.visual,review[name][i].visual);assert.equal(q.correctAnswer,review[name][i].correctAnswer);assert.match(q.id,/^y8-number-/);});
}
assert.equal(getPretestForYearLabel('Year 8','number').length,30);
assert.equal(getPosttestForYearLabel('Year 8','number')?.questions.length,30);
for(const checkpoint of ['start','mid','end'] as const){
 const bank=getDiagnosticQuestions('number','Year 8','test',checkpoint,5,3,3,3,3,3,3,8);
 assert.equal(bank.length,30);assert.ok(bank.every(q=>q.question.id.includes(`-${checkpoint}-`)));
 assert.equal(getDiagnosticQuestions('number','Year 8','old',checkpoint,5,3,3,3,3,3,3,7).length,0);
}
const probe={level:'Year 7',score:27,total:30,percent:90};
assert.equal(decideDiagnosticPlacement('Year 7',[probe],0,8).shouldProbeNext,true);
assert.equal(decideDiagnosticPlacement('Year 7',[probe],0,7).shouldProbeNext,false);
assert.equal(decideDiagnosticPlacement('Year 7',[probe,{level:'Year 8',score:27,total:30,percent:90}],0,8).measuredLevel,8);
assert.equal(diagnosticQuestionCount('number','Year 8'),30);
assert.equal(diagnosticQuestionCount('measurement','Year 6'),20);
const snapshots=buildAssessmentQuestionSnapshots(forms.pretest,()=> 'idk',()=>false,'2026-09-16T00:00:00Z');
assert.equal(snapshots.length,30);assert.ok(snapshots.every(q=>q.response_status==='dont_know'&&!q.correct));
assert.equal(assessmentEvidenceMetadata('number','Year 8',forms.pretest).assessment_evidence?.comparison_group,'paired-number-Year 8-2026-09-16-v1');
for(const file of ['app/pretest/page.tsx','app/posttest/page.tsx','components/assessment/NumberExtensionAssessment.tsx','components/demo/FiveFormAssessmentReview.tsx'])assert.ok(readFileSync(file,'utf8').includes('onIdk='),file);
for(const file of ['app/diagnostic/page.tsx','components/demo/DiagnosticPreview.tsx'])assert.ok(readFileSync(file,'utf8').includes('UNKNOWN_ANSWER'),file);
const panel=readFileSync('components/demo/DemoReviewPanel.tsx','utf8');
assert.ok(panel.includes('id:"Year 8",label:"Level 8"'));assert.ok(!panel.includes('Review Level 8'));assert.ok(!panel.includes('All five forms'));
console.log('Level 8 release: all five approved banks, 30-item diagnostics, legacy ceilings, unknown-answer replay, growth grouping and unified review navigation pass.');
