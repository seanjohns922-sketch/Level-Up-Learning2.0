import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';
const empty={__esModule:true,default:()=>null};
const calls=[];
const h=domHarness({
 '@/lib/supabase':{supabase:{}},'next/dynamic':{__esModule:true,default:()=>()=>null},
 './HomeTrends':empty,'./MyClassSummary':empty,'./TeacherClassDashboard':empty,'./ClassGroupsPanel':empty,
 '@/lib/student-roster-template':{downloadStudentRosterTemplate:async()=>{}},
 '@/lib/school-student-template':{readStudentTemplateFile:async()=>[{id:'row1',firstName:'Future',lastName:'Student',schoolYear:'Year 3'}],templateRowIssue:()=>null,StudentTemplateError:Error},
});
const button=text=>[...h.document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
async function select(label,value){const el=h.document.querySelector(`[aria-label="${label}"]`);await h.act(async()=>{el.value=String(value);el.dispatchEvent(new h.document.defaultView.Event('change',{bubbles:true}));});}
try {
 const {StudentDirectory}=h.load('components/school/SchoolHomeClient.tsx',['StudentDirectory']);
 const {schoolCalendarYear}=h.load('lib/school-year-rollover.ts');const year=schoolCalendarYear();
 await h.render(StudentDirectory,{schoolName:'Fictional',students:[],classes:[],directoryError:null,directoryLoading:false,busy:false,onCreate:async students=>{
  calls.push(students);
  return students[0].confirmCreateNew?{created:[{name:'Future Student'}],errors:[]}:{created:[],errors:[{row:1,name:'Future Student',message:'Review',code:'potential_duplicate',requestId:'review',candidates:[]}]};
 }});
 await h.click(button('Add student'));
 assert.equal(h.document.querySelector('[aria-label="Student year group calendar year"]').value,'','manual add requires explicit choice');
 await select('Student year group calendar year',year+1);
 await h.click(button('Cancel'));
 await h.click(button('Upload student list'));
 const file=h.document.querySelector('input[type="file"]');Object.defineProperty(file,'files',{value:[{name:'fictional.xlsx'}]});
 await h.act(async()=>file.dispatchEvent(new h.document.defaultView.Event('change',{bubbles:true})));
 assert(button('Add 1 student').disabled,'import requires explicit calendar year');
 await select('Import year groups calendar year',year+1);
 await h.click(button('Add 1 student'));
 assert.equal(calls[0][0].schoolYearCalendarYear,year+1);
 assert(h.document.body.textContent.includes('Possible name matches need your review'));
 await h.click([...h.document.querySelectorAll('label')].find(el=>el.textContent.includes('Future Student')).querySelector('input[type="checkbox"]'));
 const confirm=[...h.document.querySelectorAll('button')].find(b=>b.textContent.includes('as new students'));
 assert(confirm,'duplicate review control');await h.click(confirm);
 assert.equal(calls[1][0].schoolYearCalendarYear,year+1,'duplicate retry preserves original import year');assert.equal(calls[1][0].confirmCreateNew,true);
 console.log('PASS explicit calendar choice for manual/import, import blocked without year, and duplicate retry retains original year.');
} finally {await h.close();}
