import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';
const empty={__esModule:true,default:()=>null};
const calls=[];
const h=domHarness({
 '@/lib/supabase':{supabase:{}},'next/dynamic':{__esModule:true,default:()=>()=>null},
 './HomeTrends':empty,'./MyClassSummary':empty,'./TeacherClassDashboard':empty,'./ClassGroupsPanel':empty,
 '@/lib/student-roster-template':{downloadStudentRosterTemplate:async()=>{}},
 '@/lib/school-student-template':{readStudentTemplateFile:async()=>[{id:'row1',firstName:'Future',lastName:'Student',schoolYear:'Year 3'},{id:'row2',firstName:'Known',lastName:'Child',schoolYear:'Year 4'}],templateRowIssue:()=>null,StudentTemplateError:Error},
});
const button=text=>[...h.document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
async function select(label,value){const el=h.document.querySelector(`[aria-label="${label}"]`);await h.act(async()=>{el.value=String(value);el.dispatchEvent(new h.document.defaultView.Event('change',{bubbles:true}));});}
try {
 const {StudentDirectory}=h.load('components/school/SchoolHomeClient.tsx',['StudentDirectory']);
 const {schoolCalendarYear}=h.load('lib/school-year-rollover.ts');const year=schoolCalendarYear();
 await h.render(StudentDirectory,{schoolName:'Fictional',students:[],classes:[],directoryError:null,directoryLoading:false,busy:false,onCreate:async students=>{
  calls.push(students);
  return students[0].confirmCreateNew?{created:[{name:'Future Student'}],errors:[]}:{created:[],errors:[
   {row:1,name:'Future Student',message:'Review',code:'potential_duplicate',requestId:'review',candidates:[{studentId:'x',firstName:'Future',lastInitial:'S',yearLevel:null,schoolName:null,hasHomeAccess:true,sameSchool:false}]},
   {row:2,name:'Known Child',message:'Review',code:'potential_duplicate',requestId:'here',candidates:[{studentId:'y',firstName:'Known',lastInitial:'C',yearLevel:'Year 3',schoolName:'Fictional',hasHomeAccess:false,sameSchool:true}]}]};
 }});
 await h.click(button('Add student'));
 assert.equal(h.document.querySelector('[aria-label="Student year group calendar year"]').value,'','manual add requires explicit choice');
 await select('Student year group calendar year',year+1);
 await h.click(button('Cancel'));
 await h.click(button('Upload student list'));
 const file=h.document.querySelector('input[type="file"]');Object.defineProperty(file,'files',{value:[{name:'fictional.xlsx'}]});
 await h.act(async()=>file.dispatchEvent(new h.document.defaultView.Event('change',{bubbles:true})));
 assert(button('Add 2 students').disabled,'import requires explicit calendar year');
 await select('Import year groups calendar year',year+1);
 await h.click(button('Add 2 students'));
 assert.equal(calls[0][0].schoolYearCalendarYear,year+1);
 const here=h.document.querySelector('[aria-label="Already at your school"]'),elsewhere=h.document.querySelector('[aria-label="Possible matches elsewhere"]');
 assert(here.textContent.includes('Known Child')&&!here.textContent.includes('Future Student'),'same-school match listed as already here');
 assert(elsewhere.textContent.includes('Future Student')&&!elsewhere.textContent.includes('Known Child'),'other matches listed for review');
 assert(![...h.document.querySelectorAll('button')].some(b=>b.textContent.includes('as different children')),'nothing is added again by default');
 await h.click([...h.document.querySelectorAll('label')].find(el=>el.textContent.includes('Future Student')).querySelector('input[type="checkbox"]'));
 const confirm=[...h.document.querySelectorAll('button')].find(b=>b.textContent.includes('Add 1 as different children'));
 assert(confirm,'duplicate review control');await h.click(confirm);
 assert.equal(calls[1][0].schoolYearCalendarYear,year+1,'duplicate retry preserves original import year');assert.equal(calls[1][0].confirmCreateNew,true);assert.equal(calls[1].length,1,'only the ticked child is added');assert.equal(calls[1][0].duplicateRequestId,'review');
 console.log('PASS explicit calendar choice for manual/import, import blocked without year, and duplicate retry retains original year, same-school matches kept apart and never re-added unless ticked.');
} finally {await h.close();}
