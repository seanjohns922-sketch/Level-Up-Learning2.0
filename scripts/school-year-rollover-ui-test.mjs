import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';
const calls=[];
let state={calendarYear:2026,targetYear:2027,highestYear:6,enabled:false,firstYear:2027,prepared:false,reviewToken:'initial',
 students:[['a','Prep Child','Prep',2026],['b','Trial Child','Year 3',2026],['c','Future Child','Year 3',2027],['d','Year Seven Child','Year 7',2026]].map(([id,name,yearLevel,calendarYear])=>({id,name,yearLevel,calendarYear,retain:false,processed:false})),lastResults:[]};
const oldFetch=globalThis.fetch;
let failStart=false;
globalThis.fetch=async(_url,options)=>{
 const body=JSON.parse(options.body);calls.push(body);
 if(body.action==='saveSchoolYearPreparation') state={...state,prepared:true,reviewToken:'saved',highestYear:body.highestYear,students:state.students.map(s=>({...s,...body.students.find(x=>x.id===s.id)}))};
 if(body.action==='startSchoolYear') {
  if(failStart) return {ok:false,json:async()=>({error:'The student list changed. Reload the preview and review it again.'})};
  state={...state,reviewToken:'started',students:state.students.map(s=>({...s,calendarYear:2027,processed:s.calendarYear<2027,yearLevel:s.calendarYear===2027||s.retain?s.yearLevel:s.yearLevel==='Prep'?'Year 1':`Year ${Number(s.yearLevel.slice(-1))+1}`})),lastResults:[{id:'b',name:'Trial Child',previousYearLevel:'Year 3',newYearLevel:'Year 4',outcome:'promoted',targetYear:2027}]};
 }
 if(body.action==='retainStudentAfterManualRollover') state={...state,students:state.students.map(s=>s.id==='b'?{...s,yearLevel:'Year 3'}:s),lastResults:state.lastResults.map(s=>({...s,newYearLevel:'Year 3',outcome:'retained'}))};
 return {ok:true,json:async()=>state};
};
const h=domHarness();
const button=text=>[...h.document.querySelectorAll('button')].find(b=>b.textContent===text);
async function select(label,value){const el=h.document.querySelector(`[aria-label="${label}"]`);await h.act(async()=>{el.value=value;el.dispatchEvent(new h.document.defaultView.Event('change',{bubbles:true}));});}
try {
 const {previewSchoolYear,rolloverOutcome}=h.load('lib/school-year-rollover.ts');
 assert.equal(previewSchoolYear('Year 7',8,false),'Year 8');
 assert.equal(previewSchoolYear('Year 8',8,false),'School leaver — review');
 assert.equal(previewSchoolYear('Prep',8,true),'Prep');
 assert.equal(rolloverOutcome({...state.students[0],calendarYear:2024},2027,8),'review');
 const Panel=h.load('components/school/SchoolYearRolloverPanel.tsx').default;
 await h.render(Panel,{schoolId:'school',onChanged(){}});
 assert(h.document.body.textContent.includes('Nothing runs automatically.'));
 assert(h.document.body.textContent.includes('Already set for 2027'));
 assert(button('Review and start 2027').disabled,'must save initial preparation');
 await select('Highest year at this school','8');
 await h.click(h.document.querySelector('[aria-label="Keep Prep Child in the same school year"]'));
 assert(button('Review and start 2027').disabled,'unsaved edits cannot start');
 await h.click(button('Save preparation'));
 const saved=calls.find(c=>c.action==='saveSchoolYearPreparation');
 assert.equal(saved.highestYear,8);assert.equal(saved.targetYear,2027);assert.equal(saved.reviewToken,'initial');
 assert.equal(saved.students.find(s=>s.id==='a').retain,true);
 assert.equal(saved.students.find(s=>s.id==='c').calendarYear,2027);
 assert(!calls.some(c=>c.action==='startSchoolYear'),'saving must not start');
 await h.click(button('Review and start 2027'));
 assert(button('Start 2027 school year').disabled,'confirmation required');
 assert(h.document.querySelector('[aria-label="Confirm new school year"]').textContent.includes('1 already-set students will be skipped'));
 await h.click(button('Cancel'));
 assert(!calls.some(c=>c.action==='startSchoolYear'),'cancelling must not start');
 // Stale preview must block retry until reload.
 failStart=true;
 await h.click(button('Review and start 2027'));
 await h.click(h.document.querySelector('[aria-label="Confirm new school year"] input'));
 await h.click(button('Start 2027 school year'));
 assert(h.document.querySelector('[role="alert"]').textContent.includes('student list changed'));
 assert(button('Review and start 2027').disabled);
 failStart=false;
 await h.click(button('Reload preview'));
 await h.click(button('Review and start 2027'));
 await h.click(h.document.querySelector('[aria-label="Confirm new school year"] input'));
 await h.click(button('Start 2027 school year'));
 assert.equal(calls.at(-1).reviewToken,'saved');
 assert(button('Review and start 2027').disabled,'nothing left to promote');
 assert(h.document.body.textContent.includes('Maths progress is unchanged.'));
 await h.click(button('Keep Trial Child in Year 3'));
 assert.equal(calls.at(-1).action,'retainStudentAfterManualRollover');assert.equal(calls.at(-1).targetYear,2027);
 console.log('PASS mixed-year preview, initial/dirty preparation guards, explicit confirmation/cancel, stale-review recovery, repeat start prevention and retention correction.');
} finally {await h.close();globalThis.fetch=oldFetch;}
