import assert from 'node:assert/strict';
import {GROUND_MEASUREMENT_RELEASED_FORMS as forms} from '../data/assessments/releases/groundMeasurement';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {getDiagnosticQuestions} from '../lib/whole-maths-diagnostic-questions';
import {savedGroundMeasurementVersion,groundMeasurementPostVersion} from '../lib/ground-measurement-assessment-version';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import {assessmentEvidenceMetadata,comparableAssessmentGrowth} from '../lib/assessment-growth';
import {buildAssessmentQuestionSnapshots} from '../lib/assessment-replay';
import type {NormalizedAssessmentAttempt} from '../lib/realm-progress-compat';
for(const bank of Object.values(forms)) { assert.equal(bank.length,20);for(const q of bank){assert.equal(isAssessmentAnswerCorrect(q,q.correctAnswer),true,q.id);assert.equal(isAssessmentAnswerCorrect(q,'idk'),false);assert.ok(q.id.endsWith('-v4'));} }
assert.deepEqual(getPretestForYearLabel('Prep','measurement'),forms.pretest);
assert.deepEqual(getPosttestForYearLabel('Prep','measurement')!.questions,forms.posttest);
const legacy=getPretestForYearLabel('Prep','measurement',5,3,3,3,3,3,3,3);
assert.equal(savedGroundMeasurementVersion(legacy.map(q=>q.id)),3);
assert.equal(savedGroundMeasurementVersion(forms.pretest.map(q=>q.id)),4);
assert.equal(groundMeasurementPostVersion([],legacy.map(q=>q.id)),3);
for(const checkpoint of ['start','mid','end'] as const){
 assert.deepEqual(getDiagnosticQuestions('measurement','Prep','new',checkpoint,5,3,3,3,3,3,3,8,4).map(q=>q.question.id).sort(),forms[checkpoint].map(q=>q.id).sort());
 assert.ok(getDiagnosticQuestions('measurement','Prep','old',checkpoint).every(q=>q.question.id.endsWith('-v3')));
}
const attempt=(type:'pretest'|'posttest',questions:readonly {id:string}[]):NormalizedAssessmentAttempt=>({id:type,realmId:'measurement',workingLevel:'Prep',assessmentType:type,attemptNumber:1,correctCount:type==='pretest'?8:17,totalQuestions:20,scorePercent:type==='pretest'?40:85,passed:false,completedAt:type==='pretest'?'2026-09-16T00:00:00Z':'2026-12-16T00:00:00Z',questionResults:[],placementResult:{assessment_evidence:{...assessmentEvidenceMetadata('measurement','Prep',questions).assessment_evidence,learning_cycle_id:'test-cycle'}}});
const pre=attempt('pretest',forms.pretest),post=attempt('posttest',forms.posttest);
assert.equal(groundMeasurementPostVersion([pre]),4);assert.equal(groundMeasurementPostVersion([attempt('pretest',legacy)]),3);
assert.equal(comparableAssessmentGrowth([pre,post],'measurement','Prep').change,45);
assert.equal(comparableAssessmentGrowth([attempt('pretest',legacy),post],'measurement','Prep').change,null);
const snapshots=buildAssessmentQuestionSnapshots(forms.posttest,q=>q.correctAnswer,(q,a)=>isAssessmentAnswerCorrect(q as typeof forms.posttest[number],String(a)),'2026-09-16T00:00:00Z');
assert.ok(snapshots.every(q=>q.correct));assert.deepEqual(snapshots[0].visual,forms.posttest[0].visual);
console.log('Ground Measurement release: 100 answers; live pre/post and three pinned checkpoints; old drafts/baselines retained; 40→85 growth; mixed versions rejected; replay snapshots pass.');
