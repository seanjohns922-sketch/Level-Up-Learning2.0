import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';
const calls=[];
const initial={calendarYear:2026,targetYear:2027,highestYear:6,enabled:false,firstYear:2027,
 students:[{id:'a',name:'Prep Child',yearLevel:'Prep',retain:false},{id:'b',name:'Year Six Child',yearLevel:'Year 6',retain:false},{id:'c',name:'Year Seven Child',yearLevel:'Year 7',retain:false}],
 lastResults:[{id:'d',name:'Retained Child',previousYearLevel:'Year 3',newYearLevel:'Year 4',outcome:'promoted',targetYear:2026}]};
const oldFetch=globalThis.fetch;
globalThis.fetch=async(_url,options)=>{
 const body=JSON.parse(options.body);calls.push(body);
 return {ok:true,json:async()=>body.action==='saveSchoolYearRollover'?{...initial,highestYear:body.highestYear,enabled:body.enabled,students:initial.students.map(s=>({...s,retain:body.retainedStudentIds.includes(s.id)}))}:initial};
};
const h=domHarness();
try {
 const {previewSchoolYear}=h.load('lib/school-year-rollover.ts');
 assert.equal(previewSchoolYear('Year 7',8,false),'Year 8');
 assert.equal(previewSchoolYear('Year 8',8,false),'School leaver — review');
 assert.equal(previewSchoolYear('Prep',8,true),'Prep');
 const labels=h.load('lib/studentLevelLabel.ts');
 assert.deepEqual([...labels.normalizeClassYearLevels(['Years 6–8'])],['Year 6','Year 7','Year 8']);
 const {normalizeRosterStudents}=h.load('lib/roster-import.ts');
 const imported=normalizeRosterStudents([{firstName:'Upper',lastName:'Student',schoolYear:'8'}], 'spreadsheet', '');
 assert.equal(imported[0].schoolYear,'Year 8');
 const Panel=h.load('components/school/SchoolYearRolloverPanel.tsx').default;
 await h.render(Panel,{schoolId:'school',onChanged(){}});
 assert(h.document.body.textContent.includes('School leaver — review'));
 const select=h.document.querySelector('select');
 await h.act(async()=>{select.value='8';select.dispatchEvent(new h.document.defaultView.Event('change',{bubbles:true}));});
 const row=[...h.document.querySelectorAll('tr')].find(row=>row.textContent.includes('Year Seven Child'));
 assert(row.textContent.includes('Year 8'));
 await h.click(h.document.querySelector('[aria-label="Keep Prep Child in the same school year"]'));
 await h.click([...h.document.querySelectorAll('input[type="checkbox"]')][0]);
 await h.click([...h.document.querySelectorAll('button')].find(b=>b.textContent==='Save rollover settings'));
 const saved=calls.find(c=>c.action==='saveSchoolYearRollover');
 assert.equal(saved.highestYear,8);assert.equal(saved.enabled,true);assert.deepEqual(saved.retainedStudentIds,['a']);
 assert.equal(saved.targetYear,2027);
 await h.click([...h.document.querySelectorAll('button')].find(b=>b.textContent.includes('Keep Retained Child')));
 assert.deepEqual(calls.at(-1),{action:'retainStudentAfterRollover',studentId:'d',targetYear:2026});
 console.log('PASS preview, school years 7–8, retention selection, settings payload and post-rollover correction.');
} finally {await h.close();globalThis.fetch=oldFetch;}
