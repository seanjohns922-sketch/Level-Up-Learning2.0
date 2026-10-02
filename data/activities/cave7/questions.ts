import type {Lesson} from '@/data/programs/year1';
import type {LessonActivity} from '@/data/programs/types';
import {cave7WeekCount} from '@/lib/cave7-config';
import {pattern7Question} from './pattern-questions';
import {statistics7Question} from './statistics-questions';
import {chance7Question} from './chance-questions';
import type {NewCave7Realm} from './curriculum';
import type {Cave7Role} from './shared';
export const CAVE7_GENERATORS={pattern:pattern7Question,statistics:statistics7Question,chance:chance7Question};
export function generateCave7Question(_level:unknown,lesson:Lesson,activity:LessonActivity){const realm=lesson.id.split('-')[1] as NewCave7Realm;return CAVE7_GENERATORS[realm](lesson.week,lesson.lesson,Math.floor(Math.random()*0x7fffffff),activity.config.rotationRole as Cave7Role);}
export function cave7Quiz(realm:NewCave7Realm,week:number){
 if(!Number.isInteger(week)||week<1||week>=cave7WeekCount(realm))throw Error('No weekly quiz at this week');
 return [1,2,3].flatMap(lesson=>{const seen=new Set<string>();return (['fast_thinking','reasoning','apply_create','fast_thinking','apply_create'] as const).map((role,i)=>{
  for(let attempt=0;attempt<400;attempt++){const q=CAVE7_GENERATORS[realm](week,lesson,731117+week*10007+lesson*101+i*7919+attempt*104729,role),fingerprint=q.prompt+JSON.stringify(q.cave7Visual)+q.options.slice().sort().join('|');if(seen.has(fingerprint))continue;seen.add(fingerprint);return {...q,id:`y7-${realm}-w${week}-quiz-l${lesson}-${i+1}`,lessonTag:lesson as 1|2|3};}
  throw Error(`Insufficient ${realm} quiz variants ${week}/${lesson}/${role}`);
 });});
}
