import { getStarpathQuizTasks } from "../data/activities/starpath/ground/week1Quiz";
import {encodeStarpathResponse, decodeStarpathResponse} from "../lib/starpath-assessment-response";
import {isAssessmentAnswerCorrect} from "../data/assessments/analysis";
import assert from "node:assert/strict";
import fs from "node:fs";
import { getPretestForYearLabel, getPosttestForYearLabel } from "../data/assessments/api";
import { assessmentConstructionIsCorrect } from "../lib/starpath-assessment-construction";
import { groundPlacementIsCorrect } from "../lib/starpath-ground-assessment";
import { samePointSet, tileCells, tilesAreCorrect, axesAreCorrect, type TilePlacement } from "../lib/starpath-independent-construction";
import {starpathAssessmentGrowth, STARPATH_COMPARISON_GROUP} from "../lib/starpath-assessment-growth";
import {isPracticeTaskSafe} from "../lib/task-safety";
import {resolveRealmEntryRoute} from "../lib/realm-entry";
import type {PracticeTask} from "../data/activities/year1/practice-task";
import type {NormalizedAssessmentAttempt} from "../lib/realm-progress-compat";
let items=0, constructions=0;
for(let level=0;level<=6;level++) {
 const year=level?`Year ${level}`:"Prep";
 for(const form of ["pretest","posttest"] as const) {
  const bank=form==="pretest"?getPretestForYearLabel(year,"space"):getPosttestForYearLabel(year,"space")!.questions;
  assert.equal(bank.length,20);
  assert.equal(new Set(bank.map(q=>q.id)).size,20);
  for(const q of bank) {
   items++;
   const task=q.practiceTask as PracticeTask;
   assert.ok(isPracticeTaskSafe(task),q.id+" must be renderable");
   assert.ok("speakText" in task && task.speakText?.trim(),q.id+" narration");
   if(task.kind==="starpathShapeWorkshop" && task.mode==="construct") {
    assert.ok(assessmentConstructionIsCorrect(task,task.points),q.id+" valid reference polygon");
    assert.ok(!assessmentConstructionIsCorrect(task,[task.points[0]!,task.points[0]!,task.points[0]!]),q.id+" repeated points");
   }
   if(task.kind==="starpathGroundAssessment" && task.mode==="placement")assert.ok(groundPlacementIsCorrect(task,task.answer),q.id+" reference placement");
   if(task.kind==="starpathIndependentConstruction") {
    constructions++;
    if(task.mode==="image") {
     assert.equal(new Set(task.expected.map(p=>`${p.x}:${p.y}`)).size,task.expected.length,q.id+" unique vertices");
     assert.ok([...task.original,...task.expected].every(p=>p.x>=task.min&&p.x<=task.max&&p.y>=task.min&&p.y<=task.max),q.id+" vertices fit grid");
     assert.ok(samePointSet([...task.expected].reverse(),task.expected));
     assert.ok(!samePointSet(task.expected.slice(1),task.expected));
    }
    if(task.mode==="axes") {
     assert.ok(axesAreCorrect(task,["x","y","0",`${task.scale}`,`${task.scale*2}`],{x:task.point.x/task.scale,y:task.point.y/task.scale}));
     assert.ok(!axesAreCorrect(task,["y","x","0",`${task.scale}`,`${task.scale*2}`],{x:task.point.x/task.scale,y:task.point.y/task.scale}));
    }
    if(task.mode==="tiles") {
     const tiling = task;
     const expected=new Set(task.outline.map(p=>`${p.x}:${p.y}`));
     const solutions:TilePlacement[]=[];
     function solve(used:Set<string>):boolean {
      if(used.size===expected.size)return tilesAreCorrect(tiling,solutions);
      const next=[...expected].find(k=>!used.has(k))!;
      for(let turn=0;turn<4;turn++)for(let y=0;y<tiling.height;y++)for(let x=0;x<tiling.width;x++) {
       const placement={x,y,turn},cells=tileCells(tiling.piece,placement).map(p=>`${p.x}:${p.y}`);
       if(!cells.includes(next)||cells.some(k=>!expected.has(k)||used.has(k)))continue;
       solutions.push(placement);if(solve(new Set([...used,...cells])))return true;solutions.pop();
      }
      return false;
     }
     assert.ok(solve(new Set()),q.id+" must have a genuine tiling solution");
     assert.ok(!tilesAreCorrect(task,[...solutions,solutions[0]!]),q.id+" overlap rejected");
     assert.ok(!tilesAreCorrect(task,solutions.slice(1)),q.id+" gap rejected");
    }
   }
  }
 }
}
const workshop={kind:"starpathShapeWorkshop",mode:"construct",shapeLabel:"square",constructionRule:"square",prompt:"Make a square.",speakText:"Make a square.",target:1,points:[{r:0,c:2},{r:2,c:4},{r:4,c:2},{r:2,c:0}],feedback:{correct:"",wrong:""}} as const;
assert.ok(assessmentConstructionIsCorrect({...workshop,points:[...workshop.points]},[{r:1,c:1},{r:1,c:3},{r:3,c:3},{r:3,c:1}]));
assert.ok(!assessmentConstructionIsCorrect({...workshop,points:[...workshop.points]},[{r:0,c:2},{r:2,c:3},{r:4,c:2},{r:2,c:1}]),"rhombus is not a square");
const ground=getPosttestForYearLabel("Prep","space")!.questions[18]!.practiceTask!;
assert.ok(ground.kind==="starpathGroundAssessment"&&ground.mode==="placement");
assert.ok(groundPlacementIsCorrect(ground,[{tokenId:"explorer",r:1,c:0}]));
assert.ok(groundPlacementIsCorrect(ground,[{tokenId:"explorer",r:1,c:2}]));
assert.ok(!groundPlacementIsCorrect(ground,[{tokenId:"explorer",r:0,c:1}]));
const attempt=(id:string,type:"pretest"|"posttest",date:string,score:number,group=STARPATH_COMPARISON_GROUP):NormalizedAssessmentAttempt=>({id,realmId:"space",workingLevel:"Prep",assessmentType:type,attemptNumber:1,correctCount:score/5,totalQuestions:20,scorePercent:score,passed:false,completedAt:date,placementResult:{assessment_evidence:{comparison_group:group}},questionResults:[]});
const history=[attempt("first","pretest","2026-01-01",40),attempt("later","pretest","2026-02-01",75),attempt("post","posttest","2026-03-26",90)];
assert.equal(starpathAssessmentGrowth(history,"Prep").change,50);
assert.equal(starpathAssessmentGrowth(history,"Prep").days,84);
assert.equal(starpathAssessmentGrowth([history[0]!,attempt("old","posttest","2025-12-01",90)],"Prep").post,null);
assert.equal(starpathAssessmentGrowth([history[0]!,attempt("other","posttest","2026-03-26",90,"old")],"Prep").change,null);
assert.equal(starpathAssessmentGrowth([history[2]!],"Prep").baseline,null);
assert.equal(resolveRealmEntryRoute({realmId:"space",progress:null,fallbackYear:"Prep",introSeen:true}),"/pretest?year=Prep&realm_id=space");
const symmetry=fs.readFileSync("components/starpath/StarpathSymmetryCard.tsx","utf8");
assert.match(symmetry,/if \(!assessmentMode && !optionsMode\)/);
assert.match(symmetry,/if \(!assessmentMode && task.mode === "repair"/);
assert.match(symmetry,/!assessmentMode && <RotationGuide/);
const migration=fs.readFileSync("supabase/migrations/20260914160000_starpath_ground_baseline.sql","utf8");
assert.match(migration,/'next_working_level', null/);
assert.match(migration,/realm_id = 'space' and assigned_entry_mode in/);
console.log(`Starpath rebuild passed: ${items} items, ${constructions} independent constructions, mathematical scoring, original baseline, chronological/version-safe growth and Ground entry.`);

const encoded = encodeStarpathResponse("q", true, '{"points":[{"x":1,"y":2}]}');
assert.equal(decodeStarpathResponse(encoded)?.response, '{"points":[{"x":1,"y":2}]}');
assert.ok(isAssessmentAnswerCorrect({id:"q",type:"starpathTask",correctAnswer:"__starpath_task_correct__"},encoded));
assert.ok(!isAssessmentAnswerCorrect({id:"other",type:"starpathTask",correctAnswer:"__starpath_task_correct__"},encoded));
assert.ok(!isAssessmentAnswerCorrect({id:"q",type:"starpathTask",correctAnswer:"__starpath_task_correct__"},encodeStarpathResponse("q",false,"{}")));

for (const task of getStarpathQuizTasks("level-1", 5) ?? []) {
  if (task.kind === "starpathShapeWorkshop" && task.mode === "construct") assert.ok(assessmentConstructionIsCorrect(task, task.points), "Weekly shape construction remains scoreable in assessment mode");
}
