import fs from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';

const cache=new Map();
function load(name) {
  if(cache.has(name))return cache.get(name);
  assert.ok(['curriculum','challenges'].includes(name));
  const module={exports:{}};
  const source=fs.readFileSync(`data/activities/year7Number/${name}.ts`,'utf8');
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',js)(path=>load(path.replace('./','')),module,module.exports);
  cache.set(name,module.exports);
  return module.exports;
}
const {NUMBER7_WEEKS}=load('curriculum');
const {number7Challenge}=load('challenges');
const rows=[['Level','Strand','Week','Week topic','Activity','Title','Learning intention','Curriculum codes','Teaching support','Student unlock requirement','Release status','Reasoning example and solution','Application example and solution','Weekly quiz composition']];
const example=q=>`${q.prompt} Solution: ${q.answer}. ${q.explanation}`;
for(const [i,week] of NUMBER7_WEEKS.entries()) {
  for(const [j,lesson] of week.lessons.entries())rows.push([
    '7','Number',i+1,week.title,`Lesson ${j+1}`,lesson.title,`I am learning to ${lesson.goal}`,lesson.code,
    `${lesson.idea} Worked example: ${lesson.example}`,
    j?'Complete the previous lesson':i?'Pass every earlier weekly quiz with at least 80%':'Available from the start',
    'Demo review only; every demo activity is unlocked',
    example(number7Challenge(i+1,j+1,7007,'reasoning')),example(number7Challenge(i+1,j+1,7007,'apply_create')),
    i===11?'Existing Level 7 post-test':'5 from this lesson: 2 fluency, 1 reasoning, 2 application',
  ]);
  if(i===11)rows.push(['7','Number',12,week.title,'Post-Test','Level 7 Post-Test','Demonstrate Level 7 Number mastery','AC9M7N01–AC9M7N09','Existing Level 7 post-test','Complete all three lessons; existing post-test pass threshold is 85%','Demo review only; every demo activity is unlocked','','','Existing post-test; no weekly quiz']);
  else rows.push(['7','Number',i+1,week.title,'Weekly Quiz','Weekly Quiz','Apply all three lesson skills independently',[...new Set(week.lessons.map(l=>l.code))].join('; '),
    '15 questions; 5 from each lesson','Complete all three lessons; score at least 12/15 (80%)','Demo review only; every demo activity is unlocked','','','15 total: 6 fluency, 3 reasoning, 6 application']);
}
const csv='\ufeff'+rows.map(row=>row.map(cell=>`"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n')+'\n';
const file='public/curriculum/number-level7-scope-and-sequence.csv';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),csv,'Scope and sequence is out of date');
else fs.writeFileSync(file,csv);
console.log(`${process.argv.includes('--check')?'Verified':'Generated'} 36 lessons, 11 weekly quizzes and the existing post-test with worked reasoning/application examples.`);
