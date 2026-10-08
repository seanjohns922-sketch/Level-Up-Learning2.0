import assert from 'node:assert/strict';
import { activityHarness } from './test-support/activity-harness.mjs';
let checks = 0;
function typed(component, questionData, value, expected) {
  let correct = 0, wrong = 0;
  const ui = activityHarness(`components/activities/${component}.tsx`, { questionData, onCorrect: () => correct++, onWrong: () => wrong++ });
  ui.input(0, value); ui.click('Check answer');
  assert.equal(correct, expected ? 1 : 0, `${component}: ${JSON.stringify(value)} for ${questionData.prompt}`);
  if (String(value).trim()) assert.equal(wrong, expected ? 0 : 1, `${component}: wrong callback`);
  checks++;
}
const mab = { kind: 'place_value_builder', mode: 'missing_mab_part', targetNumber: 596, placeValues: ['hundreds','tens','ones'], hundreds: 5, tens: 9, ones: null, place: 'ones', prompt: 'The number is 596. How many ones are missing?', answer: 6 };
for (const [value, expected] of [['6',true],['0',false],['596',false],['',false]]) typed('PlaceValueBuilder', mab, value, expected);
for (const [place, answer, hidden] of [['tens',90,{tens:null,ones:6}],['hundreds',500,{hundreds:null,ones:6}]]) {
  const q = {...mab,...hidden,place,answer}; typed('PlaceValueBuilder',q,answer,true);typed('PlaceValueBuilder',q,0,false);
}
for (const [answer, accepted, rejected] of [['6','6','0'],['0','0','1'],['0.5','.5','0.6'],['1200','1,200','120'],['-4','-4','4'],['2.05','2.050','2.04']]) {
  const q = {kind:'typed_response',prompt:'Type the answer.',answer};
  typed('TypedResponseActivity',q,accepted,true);typed('TypedResponseActivity',q,rejected,false);typed('TypedResponseActivity',q,'',false);
}
const visual = {type:'mab',placeValues:mab.placeValues,hundreds:5,tens:9,ones:null};
for (const prompt of [mab.prompt,'The number is 596. The MAB shows 5 hundreds, 9 tens, ? ones. What is the missing value?']) {
  typed('TypedResponseActivity',{kind:'typed_response',prompt,answer:'6',visual},'6',true);
  typed('TypedResponseActivity',{kind:'typed_response',prompt,answer:'6',visual},'0',false);
}

function submit(component, questionData, values, expected, button = 'Check answer') {
  let correct = 0, wrong = 0;
  const ui = activityHarness(`components/activities/${component}.tsx`, {questionData,onCorrect:()=>correct++,onWrong:()=>wrong++});
  values.forEach((value,index)=>ui.input(index,value));ui.click(button);
  assert.equal(correct,expected ? 1 : 0,`${component}: ${JSON.stringify(values)} for ${JSON.stringify(questionData)}`);
  if(expected) assert.equal(wrong,0);
  checks++;
}
for(const [values,expected] of [[['1','2'],true],[['2','4'],true],[['1','0'],false],[['1','3'],false],[['',''],false]]) {
  submit('TypedResponseActivity',{kind:'typed_response',prompt:'Write one half as a fraction.',answer:'1/2'},values,expected);
}
for (const [values,expected] of [[['1','1','2'],true],[['0','3','2'],true],[['1','2','4'],true],[['1','1','3'],false]]) {
  submit('TypedResponseActivity',{kind:'typed_response',prompt:'Write the answer.',answer:'1 1/2',inputType:'flexible_fraction'},values,expected);
}
for(const [mode,values,expected] of [['standard_partition',['5','9','6'],true],['standard_partition',['5','8','6'],false],['flexible_partition',['4','19','6'],true],['flexible_partition',['5','9','6'],false]]) {
  submit('PartitionExpand',{kind:'partition_expand',prompt:'Partition 596.',target:596,standard:{hundreds:500,tens:90,ones:6},mode},values,expected);
}
function choice(component, questionData, answer, expected) {
  let correct=0,wrong=0;const ui=activityHarness(`components/activities/${component}.tsx`,{questionData,onCorrect:()=>correct++,onWrong:()=>wrong++});
  ui.click(String(answer));assert.equal(correct,expected ? 1 : 0,`${component}: ${answer}`);assert.equal(wrong,expected ? 0 : 1);checks++;
}
for(const [component,q,right,wrong] of [
 ['Arrays',{kind:'arrays',prompt:'How many dots?',rows:3,columns:4,mode:'total',answer:12,options:[7,12,16]},12,7],
 ['Arrays',{kind:'arrays',prompt:'Write the repeated addition.',rows:3,columns:4,mode:'repeated_addition',answer:12,repeatedAddition:'4 + 4 + 4',options:['4 + 4 + 4','3 + 3 + 3']},'4 + 4 + 4','3 + 3 + 3'],
 ['AdditionStrategy',{kind:'addition_strategy',prompt:'Add.',a:17,b:9,mode:'jump',answer:26,options:[26,25]},26,25],
 ['SubtractionStrategy',{kind:'subtraction_strategy',prompt:'Subtract.',total:17,remove:9,mode:'jump',answer:8,options:[8,9]},8,9],
 ['DivisionGroups',{kind:'division_groups',prompt:'How many groups?',total:12,groups:3,groupSize:4,answer:3,options:[3,4]},3,4],
]) {choice(component,q,right,true);choice(component,q,wrong,false);}

for(const [value,expected] of [['0',true],['',false],['1',false]]) {
 let complete=0; const ui=activityHarness('components/TypeTheNumber.tsx',{answer:0,mode:'number',rounds:1,onComplete:()=>complete++});
 ui.input(0,value);ui.click('Check');ui.flushTimers();assert.equal(complete,expected ? 1 : 0,`Early number input ${JSON.stringify(value)}`);checks++;
}
for (const answer of [6,5]) {
 let correct=0,wrong=0;
 const task={kind:'rulerMeasure',scene:'measure',prompt:'How long is the leaf?',rulerCm:9,object:{label:'leaf',icon:'🍃',lengthCm:6},options:[7,5,6],correctAnswer:6};
 const ui=activityHarness('components/measurelands/MeasurelandsRulerCard.tsx',{task,onCorrect:()=>correct++,onWrong:()=>wrong++},'MeasurelandsRulerCard');
 ui.click(`${answer} cm`);assert.equal(correct,answer===6 ? 1 : 0);assert.equal(wrong,answer===6 ? 0 : 1);checks++;
}


for(const [values,expected] of [[['2','3','8','10'],true],[['10','8','3','2'],false],[['2','','8','10'],false]]) {
 submit('TypedResponseActivity',{kind:'typed_response',prompt:'Type the numbers from smallest to largest.',answer:'2, 3, 8, 10'},values,expected);
}
console.log(`PASS: ${checks} production input/marking handler cases. Includes equivalent fractions, mixed numbers, ordering, zero, place value, partitions, arithmetic choices and ruler measurement. Shallow interaction tests do not certify browser lifecycle or layout.`);
