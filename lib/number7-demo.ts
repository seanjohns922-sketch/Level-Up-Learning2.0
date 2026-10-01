import type { ProgramProgressStore } from '@/lib/program-progress';
import { getWeekProgress } from '@/lib/program-progress';
import { weeklyQuizMinimumCorrect } from '@/lib/assessment-rules';

export function number7WeekPassed(store:ProgramProgressStore,week:number) {
 const p=getWeekProgress(store,'Year 7',week,'number');
 if(!p.quizCompleted||!p.lessonsCompleted.slice(0,3).every(Boolean))return false;
 // Prefer exact counts when available, so rounding never turns a fail into a pass.
 if(typeof p.quizBestCorrect==='number'&&typeof p.quizTotal==='number'&&p.quizTotal>0)return p.quizBestCorrect>=weeklyQuizMinimumCorrect(p.quizTotal);
 return (p.quizBestScore??p.quizScore??0)>=80;
}
export function number7WeekUnlocked(store:ProgramProgressStore,week:number) {
 return Number.isInteger(week)&&week>=1&&week<=12&&Array.from({length:week-1},(_,i)=>i+1).every(w=>number7WeekPassed(store,w));
}
export function number7ActivityAllowed(store:ProgramProgressStore,week:number,lesson:number|'quiz') {
 if(!number7WeekUnlocked(store,week))return false;
 const p=getWeekProgress(store,'Year 7',week,'number');
 return lesson==='quiz'?p.lessonsCompleted.slice(0,3).every(Boolean):Number.isInteger(lesson)&&lesson>=1&&lesson<=3&&p.lessonsCompleted.slice(0,lesson-1).every(Boolean);
}
export function number7ActivityHref(week:number,lesson:number|'quiz') {
 const params=new URLSearchParams({realm_id:'number',year:'Year 7',week:String(week),teacher_preview:'1',expedition:'1'});
 if(lesson==='quiz'){params.set('type','quiz');params.set('n','1');}else params.set('lessonId',`y7-w${week}-l${lesson}`);
 return `/demo-review/shattered-realms/number/${lesson==='quiz'?'quiz':'lesson'}?${params}`;
}
