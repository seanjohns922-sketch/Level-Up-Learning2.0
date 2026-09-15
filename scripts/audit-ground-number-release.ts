import assert from 'node:assert/strict';
import inventory from '../docs/assessment-blueprints/prep-number-candidate-inventory.json' with {type:'json'};
import {GROUND_NUMBER_V3_FORMS as forms,groundNumberReleaseItem} from '../data/assessments/releases/groundNumber';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import {getPretestForYearLabel,getPosttestForYearLabel} from '../data/assessments/api';
import {savedGroundNumberVersion,groundNumberPostVersion} from '../lib/ground-number-assessment-version';
import {groundNumberHasAnswer} from '../lib/ground-number-answer';
import {decideDiagnosticPlacement} from '../lib/whole-maths-diagnostic';
import {getDiagnosticQuestions} from '../lib/whole-maths-diagnostic-questions';
import {assessmentEvidenceMetadata,comparableAssessmentGrowth} from '../lib/assessment-growth';
import {buildAssessmentQuestionSnapshots} from '../lib/assessment-replay';
import type {NormalizedAssessmentAttempt} from '../lib/realm-progress-compat';
const answers=new Map<string,string>();
for(const [form,questions] of Object.entries(forms)) {
  assert.equal(questions.length,20);
  questions.forEach((q,i)=>{
    const item=groundNumberReleaseItem(q)!;
    const key=inventory.items.find(k=>k.form===form&&k.slot===item.slot.id)!;
    assert.ok(key); assert.deepEqual(item.task,key.task); assert.equal(q.prompt,key.prompt);
    assert.equal(q.version,'3.0.0'); assert.ok(q.id.endsWith('-v3'));
    const raw={itemId:q.id,version:item.version,response:key.workedResponse};
    const answer=JSON.stringify(raw); answers.set(q.id,answer);
    assert.equal(isAssessmentAnswerCorrect(q,answer),true,q.id);
    assert.equal(groundNumberHasAnswer(q,answer),true,q.id);
    for(const bad of ['',String(q.correctAnswer),JSON.stringify({correct:true}),JSON.stringify({...raw,itemId:'wrong'}),JSON.stringify({...raw,version:'old'}),JSON.stringify({...raw,response:{}})]) assert.equal(isAssessmentAnswerCorrect(q,bad),false,q.id);
    assert.equal(groundNumberHasAnswer(q,JSON.stringify({...raw,response:{}})),false,q.id);
    if(i===17) {
      assert.equal(item.task.kind,'supply_shortfall');
      if(item.task.kind==='supply_shortfall') for(const n of [item.task.available,item.task.recipients,item.task.available+item.task.recipients]) assert.equal(isAssessmentAnswerCorrect(q,JSON.stringify({...raw,response:{values:[n]}})),false);
    }
  });
}
assert.deepEqual(getPretestForYearLabel('Prep','number'),forms.pretest);
assert.deepEqual(getPosttestForYearLabel('Prep','number')!.questions,forms.posttest);
for(const version of [1,3] as const) assert.equal(savedGroundNumberVersion(getPretestForYearLabel('Prep','number',5,version).map(q=>q.id)),version);
for(const checkpoint of ['start','mid','end'] as const) assert.deepEqual(getDiagnosticQuestions('number','Prep','new',checkpoint,5,3).map(q=>q.question.id).sort(),forms[`diagnostic-${checkpoint}`].map(q=>q.id).sort());
const attempt=(type:'pretest'|'posttest',questions:readonly {id:string}[],cycle='same'):NormalizedAssessmentAttempt=>({id:type,realmId:'number',workingLevel:'Prep',assessmentType:type,attemptNumber:1,correctCount:type==='pretest'?8:17,totalQuestions:20,scorePercent:type==='pretest'?40:85,passed:false,completedAt:type==='pretest'?'2026-09-15T00:00:00Z':'2026-12-15T00:00:00Z',questionResults:[],placementResult:{assessment_evidence:{...assessmentEvidenceMetadata('number','Prep',questions).assessment_evidence,learning_cycle_id:cycle}}});
const pre=attempt('pretest',forms.pretest),post=attempt('posttest',forms.posttest);
assert.equal(groundNumberPostVersion([pre]),3);assert.equal(groundNumberPostVersion([]),1);
const old=getPretestForYearLabel('Prep','number',5,1);
assert.equal(groundNumberPostVersion([pre],old.map(q=>q.id)),1);
assert.equal(comparableAssessmentGrowth([pre,post],'number','Prep').change,45);
assert.equal(comparableAssessmentGrowth([attempt('pretest',old),post],'number','Prep').change,null);
assert.equal(comparableAssessmentGrowth([pre,attempt('posttest',forms.posttest,'different')],'number','Prep').change,null);
const snapshots=buildAssessmentQuestionSnapshots(forms.posttest,q=>answers.get(q.id)!, (q,a)=>isAssessmentAnswerCorrect(q as typeof forms.posttest[number],String(a)),'2026-09-15T00:00:00Z');
assert.equal(JSON.parse(JSON.stringify(snapshots))[17].question_version,'3.0.0');
assert.equal(snapshots[17].student_answer,answers.get(forms.posttest[17].id));
assert.deepEqual(snapshots[17].visual,forms.posttest[17].visual);
assert.ok(snapshots.every(s=>s.correct));
for(const snapshot of snapshots) assert.ok(groundNumberReleaseItem({id:snapshot.question_id,type:snapshot.question_type,visual:snapshot.visual}));
console.log('Ground release: 100 worked responses, raw evidence validation, Q18, versioned resume, checkpoint forms, snapshots and comparable growth pass.');

for(const percent of [0,25,40,70,85,100]) assert.ok(decideDiagnosticPlacement('Prep',[{level:'Prep',score:percent/5,total:20,percent}],0).measuredLevel>=0);
assert.equal(decideDiagnosticPlacement('Year 1',[{level:'Year 1',score:4,total:20,percent:20}],0).shouldProbeLower,true);
assert.equal(decideDiagnosticPlacement('Year 1',[{level:'Year 1',score:4,total:20,percent:20}]).shouldProbeLower,false);
