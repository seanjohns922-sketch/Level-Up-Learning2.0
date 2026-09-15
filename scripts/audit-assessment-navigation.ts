import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canVisitAssessmentQuestion as canVisit } from "../lib/assessment-navigation";

const blank = Array<boolean>(20).fill(false);
assert.equal(canVisit(0, blank, 0), true);
for (let i=1;i<20;i++) assert.equal(canVisit(i, blank, 0), false);
for (let count=1;count<=20;count++) {
  const restored = blank.map((_,i)=>i<count);
  for (let i=0;i<20;i++) assert.equal(canVisit(i,restored,0),i<=count,`Restored ${count} answers: question ${i+1}`);
}
const clearedEarlier = [true,false,true,true,false,false];
assert.equal(canVisit(3,clearedEarlier,1),true,"Earlier answer edits preserve access to answered items");
assert.equal(canVisit(4,clearedEarlier,1),false,"Cannot skip the cleared response to unlock a later item");
assert.equal(canVisit(4,clearedEarlier,4),true,"Current restored question remains accessible");
for (const invalid of [-1,20,1.5,NaN]) assert.equal(canVisit(invalid,blank,0),false);
assert.equal(canVisit(0,[],0),false);
for (const route of ["app/pretest/page.tsx","app/posttest/page.tsx","app/diagnostic/page.tsx"]) {
  const source=readFileSync(route,"utf8");
  assert.ok(source.includes("answeredFlags="),`${route}: numbered navigation wired`);
  assert.ok(!/\breview(?:Mode|Navigation)[\s=/>]/.test(source),`${route}: no author bypass`);
}
console.log("Assessment navigation passed: sequential unlock, restored answers, edits, bounds and all student routes.");
