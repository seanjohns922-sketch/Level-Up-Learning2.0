import {createHash} from 'node:crypto';
import {LEVEL8_CURRICULUM} from '../../data/activities/level8/curriculum.ts';
import {level8TeachingGuide} from '../../data/activities/level8/teaching/index.ts';
import {NUMBER7_WEEKS,number7Guide} from '../../data/activities/year7Number/curriculum.ts';
import {MEASUREMENT7_WEEKS,measurement7Guide,measurement7IntroExample} from '../../data/activities/year7Measurement/curriculum.ts';
import {measurement7Question} from '../../data/activities/year7Measurement/questions.ts';
import {SPACE7_WEEKS,space7Guide} from '../../data/activities/year7Space/curriculum.ts';
import {space7Question} from '../../data/activities/year7Space/questions.ts';
import {CAVE7_CURRICULA,cave7Guide} from '../../data/activities/cave7/curriculum.ts';
import {CAVE7_GENERATORS} from '../../data/activities/cave7/questions.ts';
import {level7WorkedSteps} from '../../data/activities/teaching/level7-working.ts';
import {solutionSteps} from '../../lib/level7-guide-steps.ts';
export function guideInventory(){
 const rows=[];
 for(const [realm,weeks] of Object.entries(LEVEL8_CURRICULUM))for(let week=1;week<=weeks.length;week++)for(let lesson=1;lesson<=3;lesson++){
  const g=level8TeachingGuide(realm,week,lesson);
  rows.push({key:`8/${realm}/${week}/${lesson}`,level:8,realm,week,lesson,title:weeks[week-1].lessons[lesson-1].title,idea:g.idea,steps:g.steps,check:g.check,example:g.example});
 }
 const entries=[['number',NUMBER7_WEEKS,number7Guide,(w,l)=>({prompt:number7Guide(w,l).example})],['measurement',MEASUREMENT7_WEEKS,measurement7Guide,(w,l)=>measurement7IntroExample(w,l)??measurement7Question(w,l,7007)],['space',SPACE7_WEEKS,space7Guide,(w,l)=>space7Question(w,l,7007)],...Object.entries(CAVE7_CURRICULA).map(([r,weeks])=>[r,weeks,(w,l)=>cave7Guide(r,w,l),(w,l)=>CAVE7_GENERATORS[r](w,l,7007)])];
 for(const [realm,weeks,getGuide,getExample] of entries)for(let week=1;week<=weeks.length;week++)for(let lesson=1;lesson<=3;lesson++){
  const g=getGuide(week,lesson),example=getExample(week,lesson);
  const fallback=realm==='number'?g.steps:realm==='measurement'?example.steps:solutionSteps(example.explanation);
  rows.push({key:`7/${realm}/${week}/${lesson}`,level:7,realm,week,lesson,title:g.title,idea:g.idea,steps:level7WorkedSteps(realm,week,lesson,fallback),check:g.caution,example});
 }
 return rows;
}
export function exampleSignature(example){
 // Pin question facts, answers, choices and all diagram properties. Exclude
 // generated feedback: authored guide working intentionally supersedes it.
 const {explanation,steps,readabilityRevision,version,...facts}=example;
 void explanation;void steps;void readabilityRevision;void version;
 return createHash('sha256').update(JSON.stringify(facts)).digest('hex');
}
