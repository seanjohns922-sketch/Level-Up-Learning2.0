import assert from 'node:assert/strict';
import {LEVEL8_WEEK_COUNTS} from '../lib/level8-config.ts';
import {LEVEL8_CURRICULUM,level8ScopeCsv} from '../data/activities/level8/curriculum.ts';
import {getProgramWeekCount} from '../lib/program-weeks.ts';
import {isWeekCompleteForRealm} from '../lib/program-progress.ts';
import {strongholdLayout} from '../lib/world3d/number-stronghold.ts';
const expected={number:['N',5],measurement:['M',7],space:['SP',4],pattern:['A',4],statistics:['ST',4],chance:['P',3]};
const earlier={number:12,measurement:8,space:8,pattern:8,statistics:6,chance:6};
const onlyLessons={lessonsCompleted:[true,true,true],quizCompleted:false};
let lessons=0,quizzes=0,posttests=0;
for(const [realm,count] of Object.entries(LEVEL8_WEEK_COUNTS)){
 const weeks=LEVEL8_CURRICULUM[realm],codes=new Set();
 assert.equal(weeks.length,count,`${realm} plan length`);
 assert.equal(getProgramWeekCount(realm,'Year 8'),count);
 assert.equal(strongholdLayout(realm).portals.length,count);
 for(const year of ['Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'])assert.equal(getProgramWeekCount(realm,year),earlier[realm]);
 assert.equal(getProgramWeekCount(realm,'Year 7'),realm==='chance'?8:count);
 const titles=new Set();
 weeks.forEach((w,i)=>{
  assert.equal(w.week,i+1);assert.equal(w.lessons.length,3);assert(w.visual.length>10);
  assert.equal(w.assessment,i===count-1?'posttest':'quiz');
  if(w.assessment==='quiz')quizzes++;else posttests++;
  for(const l of w.lessons){lessons++;assert(!titles.has(l.title),`Repeated ${realm} lesson ${l.title}`);titles.add(l.title);assert(l.codes.length);l.codes.forEach(c=>{assert.match(c,/^AC9M8(N0[1-5]|M0[1-7]|A0[1-4]|SP0[1-4]|ST0[1-4]|P0[1-3])$/);codes.add(c);});}
 });
 const [strand,total]=expected[realm];for(let n=1;n<=total;n++)assert(codes.has(`AC9M8${strand}0${n}`),`${realm} missing code ${n}`);
 assert.equal(isWeekCompleteForRealm(onlyLessons,realm,count,'Year 8'),true);
 assert.equal(isWeekCompleteForRealm({...onlyLessons,lessonsCompleted:[true,false,true]},realm,count,'Year 8'),false);
 for(let w=1;w<count;w++){
  assert.equal(isWeekCompleteForRealm({...onlyLessons,quizBestScore:79},realm,w,'Year 8'),false);
  assert.equal(isWeekCompleteForRealm({...onlyLessons,quizBestScore:80},realm,w,'Year 8'),true);
 }
 assert.equal(level8ScopeCsv(realm).split('\r\n').length,1+count*3);
}
assert.equal(lessons,198);assert.equal(quizzes,60);assert.equal(posttests,6);
assert.equal(level8ScopeCsv().split('\r\n').length,199);
assert.equal(isWeekCompleteForRealm(onlyLessons,'chance',6,'Year 6'),true);
assert.equal(isWeekCompleteForRealm(onlyLessons,'chance',6,'Year 8'),false);
assert.equal(isWeekCompleteForRealm(onlyLessons,'chance',8,'Year 8'),false);
console.log('PASS 66 weeks, 198 mapped lessons, all 27 Year 8 descriptors, 60 quizzes, six final post-tests, CSV export, shared stronghold counts, 80% boundary and unchanged earlier levels.');
