import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadMeasurement7} from './measurement7-loader.mjs';
const {MEASUREMENT7_WEEKS,measurement7Guide}=loadMeasurement7('curriculum');
const {measurement7Question}=loadMeasurement7('questions');
const rows=[['Level','Strand','Week','Topic','Activity','Title','Learning intention','Curriculum','Teaching support','Worked example','Reasoning example','Application example','Student progression','Release']];
const example=q=>`${q.prompt} Answer: ${q.answer}. ${q.explanation}`;
MEASUREMENT7_WEEKS.forEach((w,i)=>{
 w.lessons.forEach((l,j)=>{const g=measurement7Guide(i+1,j+1);rows.push([7,'Measurement',i+1,w.title,`Lesson ${j+1}`,g.title,`I am learning to ${g.goal}`,g.code,g.idea,...['fast_thinking','reasoning','apply_create'].map(role=>example(measurement7Question(i+1,j+1,7007,role))),j?'Complete the previous lesson':i?'Pass all earlier weekly quizzes at 80% or higher':'Available from the start','Demo only; all activities unlocked for review']);});
 rows.push([7,'Measurement',i+1,w.title,i===11?'Post-Test':'Weekly Quiz',i===11?'Existing Level 7 Post-Test':'Weekly Quiz',i===11?'Demonstrate Level 7 mastery':'Apply the three weekly lesson skills',i===11?'AC9M7M01–AC9M7M06':w.code,i===11?'Existing post-test unchanged':'15 questions: 5 per lesson (2 fluency, 1 reasoning, 2 application)','','','',i===11?'Existing 85% post-test requirement':'Complete all three lessons; 12/15 (80%) to pass','Demo only; all activities unlocked for review']);
});
const csv='\ufeff'+rows.map(r=>r.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n')+'\n';
const path='public/curriculum/measurement-level7-scope-and-sequence.csv';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),csv);else fs.writeFileSync(path,csv);
console.log('PASS Measurement Level 7 scope: 36 lessons, 11 quizzes, existing Week 12 post-test.');
