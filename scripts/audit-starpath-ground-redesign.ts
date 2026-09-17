import assert from "node:assert/strict";
import { GROUND_STARPATH_REDESIGNED_FORMS as forms, GROUND_REDESIGN_BLUEPRINT } from "../data/assessments/revisions/groundStarpathRedesignedForms";
import { emptyGroundResponse, scoreGroundResponse, quadrilateralIsCorrect, groundResponseReady } from "../lib/starpath-ground-redesign";
import { STARPATH_BUILD_OBJECTS } from "../data/activities/starpath/ground/shape-builds";
import { getDiagnosticQuestions } from "../lib/whole-maths-diagnostic-questions";
import { GROUND_STARPATH_FIVE_FORMS as liveForms } from "../data/assessments/revisions/groundStarpathFiveForms";
const ids = new Set<string>();
const point = (x:number,y:number) => ({x,y});
for (const [form,items] of Object.entries(forms)) {
 assert.equal(items.length,20);
 const correctPositions=items.filter(i=>i.task.mode==="choice"&&i.task.options!.length===3).map(i=>i.task.options!.findIndex(o=>o.id===i.task.correctIds![0]));
 assert.equal(new Set(correctPositions).size,3,"Correct choices must use all three answer positions within each form");
 assert.ok(Math.max(...[0,1,2].map(p=>correctPositions.filter(v=>v===p).length))<=8,"No dominant answer position");
 assert.deepEqual(items.map(i=>i.skillLabel),GROUND_REDESIGN_BLUEPRINT);
 assert.equal(items.filter(i=>i.primaryDescriptorCode==="AC9MFSP01").length,12);
 assert.equal(items.filter(i=>i.primaryDescriptorCode==="AC9MFSP02").length,8);
 for(const [index,item] of items.entries()) {
  assert.ok(!ids.has(item.id));ids.add(item.id);assert.ok(item.id.endsWith('-v4'));
  const task=item.task; const response=emptyGroundResponse(task);
  assert.ok(item.readAloudText.includes(task.prompt));
  assert.equal(scoreGroundResponse(task,response),false,`${item.id} empty cannot be correct`);
  if(task.mode==='choice'||task.mode==='multi') {
   assert.equal(new Set(task.options!.map(o=>o.id)).size,task.options!.length);
   assert.ok(task.correctIds?.every(id=>task.options!.some(o=>o.id===id)));
   response.selected=[...task.correctIds!];response.reason=task.correctReason??null;
   assert.equal(scoreGroundResponse(task,response),true,`${item.id} correct response`);
   const wrong=task.options!.find(o=>!task.correctIds!.includes(o.id))!;
   assert.equal(scoreGroundResponse(task,{...response,selected:[wrong.id]}),false,`${item.id} distractor rejected`);
   if(task.mode==='multi') assert.equal(scoreGroundResponse(task,{...response,selected:[...response.selected,wrong.id]}),false);
   if(task.reasons) {
    assert.ok(task.reasons.some(r=>r.id===task.correctReason));
    assert.equal(scoreGroundResponse(task,{...response,reason:task.reasons.find(r=>r.id!==task.correctReason)!.id}),false);
   }
   if(index<2) {
    assert.equal(task.visual,undefined,'Recognition must not show a target');
    const correct=task.options!.find(o=>o.id===task.correctIds![0])!.shape!;
    assert.ok(task.prompt.includes(correct.shape));
    assert.equal(new Set(task.options!.map(o=>o.shape!.colour)).size,1,'No colour match cue');
    if(correct.shape==='rectangle')assert.ok(!task.options!.some(o=>o.shape!.shape==='square'));
   }
   if(index===4) {
    assert.equal(task.correctIds!.length,3);
    const correctShape=task.options!.find(o=>o.id===task.correctIds![0])!.shape!.shape;
    assert.ok(task.options!.every(o=>task.correctIds!.includes(o.id)===(o.shape!.shape===correctShape)));
   }
  } else if(task.mode==='draw') {
   response.points=task.drawShape==='triangle'?[point(50,50),point(250,150),point(50,250)]:[point(150,50),point(250,150),point(150,250),point(50,150)];
   assert.equal(scoreGroundResponse(task,response),true,`${item.id} alternative rotated geometry`);
   assert.equal(scoreGroundResponse(task,{...response,points:[point(50,50),point(150,150),point(250,250)]}),false);
  } else if(task.mode==='compose') {
   for(let turn=0;turn<4;turn++) {
    response.pieces=[{x:160,y:120,turn},{x:160,y:120,turn:(turn+2)%4}];
    assert.equal(scoreGroundResponse(task,response),true);
   }
   response.pieces[1].x+=20;assert.equal(scoreGroundResponse(task,response),false);
  } else {
   const valid=task.relation==='beside'?[3,5]:task.relation==='above'?[0,1,2]:[6,7,8];
   for(let cell=0;cell<9;cell++)assert.equal(scoreGroundResponse(task,{...response,cell}),valid.includes(cell));
   response.cell=valid[0];
  }
  assert.equal(groundResponseReady(task,response),true);
  if(task.visual?.kind==='picture') {
   const art=STARPATH_BUILD_OBJECTS[task.visual.object];
   assert.ok(task.visual.pieces.every(id=>art.pieces.some(p=>p.id===id)),'Every visible picture piece exists');
   assert.equal(art.pieces.length-task.visual.pieces.length,1,'Only the intended picture part is missing');
  }
 }
 console.log(`PASS ${form}: 20 questions, coverage, meaningful scoring and correct/distractor paths.`);
}
assert.equal(ids.size,100);
for(let index=0;index<20;index++)assert.equal(new Set(Object.values(forms).map(items=>JSON.stringify(items[index].task))).size,5,`Slot ${index+1} needs five varied tasks`);
assert.equal(quadrilateralIsCorrect([point(0,0),point(2,0),point(2,1),point(0,1)],false),true);
assert.equal(quadrilateralIsCorrect([point(0,0),point(2,0),point(2,1),point(0,1)],true),false);
assert.equal(quadrilateralIsCorrect([point(0,0),point(1,1),point(1,0),point(0,1)],false),false);
// The new design is a review release. Existing diagnostic sessions stay on v3.
const questions=getDiagnosticQuestions('space','Prep','redesign-audit','start',5,3,3,3,3,3,3,8,4,4,4,4,4,1,3);
assert.deepEqual(questions.map(q=>q.question.id).sort(),liveForms.start.map(q=>q.id).sort());
assert.ok(questions.every(q=>!ids.has(q.question.id)));
console.log('PASS 100 unique versioned items, five variations per slot, alternative geometry, and legacy diagnostic isolation.');
