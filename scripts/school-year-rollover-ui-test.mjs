import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';
const calls=[];
let state={calendarYear:2026,targetYear:2027,highestYear:6,enabled:false,firstYear:2027,prepared:false,reviewToken:'initial',
 students:[['a','Prep Child','Prep',2026],['b','Trial Child','Year 3',2026],['c','Future Child','Year 3',2027],['d','Year Seven Child','Year 7',2026],['e','Old Child','Year 2',2025]].map(([id,name,yearLevel,calendarYear])=>({id,name,yearLevel,calendarYear,retain:false,processed:false})),lastResults:[]};
const oldFetch=globalThis.fetch;
let failStart=false;
globalThis.fetch=async(_url,options)=>{
 const body=JSON.parse(options.body);calls.push(body);
 if(body.action==='saveSchoolYearPreparation') state={...state,prepared:true,reviewToken:'saved',highestYear:body.highestYear,students:state.students.map(s=>({...s,...body.students.find(x=>x.id===s.id)}))};
 if(body.action==='startSchoolYear') {
  if(failStart) return {ok:false,json:async()=>({error:'The student list changed. Reload the preview and review it again.'})};
  assert.equal(body.reviewToken,'saved','start uses the token returned by the save');
  state={...state,reviewToken:'started',students:state.students.map(s=>({...s,calendarYear:2027,processed:s.calendarYear<2027,yearLevel:s.calendarYear===2027||s.retain?s.yearLevel:s.yearLevel==='Prep'?'Year 1':`Year ${Number(s.yearLevel.slice(-1))+1}`})),lastResults:[{id:'b',name:'Trial Child',previousYearLevel:'Year 3',newYearLevel:'Year 4',outcome:'promoted',targetYear:2027}]};
 }
 if(body.action==='retainStudentAfterManualRollover') state={...state,students:state.students.map(s=>s.id==='b'?{...s,yearLevel:'Year 3'}:s),lastResults:state.lastResults.map(s=>({...s,newYearLevel:'Year 3',outcome:'retained'}))};
 return {ok:true,json:async()=>state};
};
const h=domHarness();
const button=text=>[...h.document.querySelectorAll('button')].find(b=>b.textContent===text);
const startButton=()=>button('Review and move into 2027');
async function select(label,value){const el=h.document.querySelector(`[aria-label="${label}"]`);await h.act(async()=>{el.value=value;el.dispatchEvent(new h.document.defaultView.Event('change',{bubbles:true}));});}
try {
 const {previewSchoolYear,rolloverOutcome}=h.load('lib/school-year-rollover.ts');
 assert.equal(previewSchoolYear('Year 7',8,false),'Year 8');
 assert.equal(previewSchoolYear('Year 8',8,false),'School leaver — review');
 assert.equal(previewSchoolYear('Prep',8,true),'Prep');
 assert.equal(rolloverOutcome({...state.students[0],calendarYear:2024},2027,8),'review');
 const Panel=h.load('components/school/SchoolYearRolloverPanel.tsx').default;
 await h.render(Panel,{schoolId:'school',onChanged(){}});
 assert(h.document.body.textContent.includes('Nothing happens until you confirm.'));
 assert(h.document.body.textContent.includes('Check 1 student first'),'an older year group must be checked');
 assert(startButton().disabled,'students needing checks block the move');
 await h.click(button('Year 2 is for 2026: move up'));
 assert(!startButton().disabled,'checked students allow the move');
 await select('Highest year at this school','8');
 await h.click(h.document.querySelector('[aria-label="Move Prep up"]'));
 assert(h.document.body.textContent.includes('Prep (all 1 staying)'));
 await h.click(startButton());
 assert(button('Move students into 2027').disabled,'confirmation required');
 assert(h.document.querySelector('[aria-label="Confirm new school year"]').textContent.includes('1 already-set students will be skipped'));
 await h.click(button('Cancel'));
 assert(!calls.some(c=>c.action==='saveSchoolYearPreparation'||c.action==='startSchoolYear'),'cancelling changes nothing');
 // A stale list blocks the move until the admin reloads and reviews again.
 failStart=true;
 await h.click(startButton());
 await h.click(h.document.querySelector('[aria-label="Confirm new school year"] input'));
 await h.click(button('Move students into 2027'));
 const saved=calls.find(c=>c.action==='saveSchoolYearPreparation');
 assert.equal(saved.highestYear,8);assert.equal(saved.targetYear,2027);assert.equal(saved.reviewToken,'initial');
 assert.equal(saved.students.find(s=>s.id==='a').retain,true);
 assert.equal(saved.students.find(s=>s.id==='c').calendarYear,2027);
 assert.equal(saved.students.find(s=>s.id==='e').calendarYear,2026);
 assert(h.document.querySelector('[role="alert"]').textContent.includes('student list changed'));
 assert(startButton().disabled);
 failStart=false;
 await h.click(button('Reload and review again'));
 await h.click(startButton());
 await h.click(h.document.querySelector('[aria-label="Confirm new school year"] input'));
 await h.click(button('Move students into 2027'));
 assert.equal(calls.at(-1).action,'startSchoolYear');
 assert(startButton().disabled,'nothing left to move');
 assert(h.document.body.textContent.includes('Maths progress is unchanged.'));
 await h.click(button('Keep Trial Child in Year 3'));
 assert.equal(calls.at(-1).action,'retainStudentAfterManualRollover');assert.equal(calls.at(-1).targetYear,2027);
 console.log('PASS year-group roll-over: checks block the move, exceptions saved, explicit confirmation/cancel, stale-list recovery, save-then-start token, repeat prevention and retention correction.');
} finally {await h.close();globalThis.fetch=oldFetch;}
