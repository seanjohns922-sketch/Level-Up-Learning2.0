import type { ProgramProgressStore } from '@/lib/program-progress';
import { getWeekProgress } from '@/lib/program-progress';
import { weeklyQuizMinimumCorrect } from '@/lib/assessment-rules';

export function number7WeekPassed(store:ProgramProgressStore,week:number,realm:"number"|"measurement"="number") {
 const p=getWeekProgress(store,'Year 7',week,realm);
 if(!p.quizCompleted||!p.lessonsCompleted.slice(0,3).every(Boolean))return false;
 // Prefer exact counts when available, so rounding never turns a fail into a pass.
 if(typeof p.quizBestCorrect==='number'&&typeof p.quizTotal==='number'&&p.quizTotal>0)return p.quizBestCorrect>=weeklyQuizMinimumCorrect(p.quizTotal);
 return (p.quizBestScore??p.quizScore??0)>=80;
}
export function number7WeekUnlocked(store:ProgramProgressStore,week:number,realm:"number"|"measurement"="number") {
 return Number.isInteger(week)&&week>=1&&week<=12&&Array.from({length:week-1},(_,i)=>i+1).every(w=>number7WeekPassed(store,w,realm));
}
export function number7ActivityAllowed(store:ProgramProgressStore,week:number,lesson:number|'quiz',realm:"number"|"measurement"="number") {
 if(!number7WeekUnlocked(store,week,realm))return false;
 const p=getWeekProgress(store,'Year 7',week,realm);
 return lesson==='quiz'?week<12&&p.lessonsCompleted.slice(0,3).every(Boolean):Number.isInteger(lesson)&&lesson>=1&&lesson<=3&&p.lessonsCompleted.slice(0,lesson-1).every(Boolean);
}
// Review access is independent of student completion. This does not grant a
// demo session: the route's server guard and useDemoPreviewMode still do that.
export function number7DemoActivityAllowed(demo:boolean,week:number,lesson:number|'quiz') {
 return demo&&Number.isInteger(week)&&week>=1&&week<=12&&((lesson==='quiz'&&week<12)||(typeof lesson==='number'&&Number.isInteger(lesson)&&lesson>=1&&lesson<=3));
}
export function number7ActivityHref(week:number,lesson:number|'quiz'|'posttest',realm:"number"|"measurement"="number") {
 if(lesson==='posttest'||(week===12&&lesson==='quiz'))return `/posttest?year=Year%207&realm_id=${realm}&teacher_preview=1`;
 const params=new URLSearchParams({realm_id:realm,year:'Year 7',week:String(week),teacher_preview:'1',expedition:'1'});
 if(lesson==='quiz'){params.set('type','quiz');params.set('n','1');}else params.set('lessonId',`${realm==='measurement'?'y7-measurement':'y7'}-w${week}-l${lesson}`);
 return `/demo-review/shattered-realms/${realm}/${lesson==='quiz'?'quiz':'lesson'}?${params}`;
}
