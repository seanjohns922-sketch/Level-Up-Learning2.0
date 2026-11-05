import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';
let access=true, duplicate=false;
const calls=[];
const h=domHarness({
 '@/lib/school-platform-server':{requireSchoolPreviewAccess:async()=>access?{user:{id:'admin'}}:null,runSchoolCommand:async(school,rpc,args,token)=>{
  calls.push({school,rpc,args,token});
  if(rpc==='preview_school_student_creation') return {potentialDuplicate:duplicate,requestId:'review',candidates:[]};
  return {studentId:'new',reviewToken:'review-token'};
 }},
 '@/lib/school-admin-invite-email':{},
});
try {
 const {POST}=h.load('app/api/school/[schoolId]/command/route.ts');
 const {schoolCalendarYear}=h.load('lib/school-year-rollover.ts');const year=schoolCalendarYear();
 async function post(payload){return POST(new Request('http://localhost/api/school/school/command',{method:'POST',headers:{'Content-Type':'application/json',authorization:'Bearer test-token'},body:JSON.stringify(payload)}),{params:Promise.resolve({schoolId:'school'})});}
 await post({action:'getSchoolYearRollover',targetYear:year+1});assert.equal(calls.at(-1).rpc,'get_school_year_rollover_preview');assert.equal(calls.at(-1).args.p_target_year,year+1);
 assert.equal((await post({action:'startSchoolYear',targetYear:year+1})).status,400);
 await post({action:'startSchoolYear',targetYear:year+1,reviewToken:'preview'});assert.equal(calls.at(-1).rpc,'start_school_year');assert.equal(calls.at(-1).args.p_review_token,'preview');assert.equal(calls.at(-1).token,'test-token');
 assert.equal((await post({action:'saveSchoolYearPreparation',targetYear:year+1,highestYear:8,reviewToken:'x',students:[null]})).status,400);
 await post({action:'saveSchoolYearPreparation',targetYear:year+1,highestYear:8,reviewToken:'x',students:[{id:'new',calendarYear:year+1,retain:false}]});assert.equal(calls.at(-1).rpc,'save_school_year_preparation');
 const student={firstName:'Future',lastName:'Student',schoolYear:'Year 3',schoolYearCalendarYear:year+1,idempotencyKey:'once'};
 let response=await (await post({action:'createStudents',students:[student]})).json();assert.equal(response.created.length,1);
 assert.equal(calls.at(-2).rpc,'preview_school_student_creation');assert.equal(calls.at(-1).rpc,'create_school_student_for_year');assert.equal(calls.at(-1).args.p_calendar_year,year+1);
 duplicate=true;
 const before=calls.length;
 response=await (await post({action:'createStudents',students:[student]})).json();assert.equal(response.errors[0].code,'potential_duplicate');assert.equal(calls.length,before+1,'duplicate cannot bypass review');
 await post({action:'createStudents',students:[{...student,confirmCreateNew:true,duplicateRequestId:'review'}]});assert.equal(calls.at(-2).rpc,'approve_school_student_creation_override');assert.equal(calls.at(-1).args.p_calendar_year,year+1);
 const invalidBefore=calls.length;
 response=await (await post({action:'createStudents',students:[{...student,schoolYearCalendarYear:year+2,confirmCreateNew:true,duplicateRequestId:'review'}]})).json();assert.equal(response.errors.length,1);assert.equal(calls.length,invalidBefore,'invalid year rejected before duplicate approval');
 access=false;assert.equal((await post({action:'startSchoolYear',targetYear:year+1,reviewToken:'x'})).status,403);assert.equal(calls.length,invalidBefore);
 console.log('PASS school command access, preview tokens, payload validation, explicit import year and preserved duplicate review pipeline.');
} finally {await h.close();}
