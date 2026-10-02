import type {WeekPlan,CurriculumCode} from '@/data/programs/year1';
import pattern from './pattern-curriculum';
import statistics from './statistics-curriculum';
import chance from './chance-curriculum';
export type NewCave7Realm='pattern'|'statistics'|'chance';
export const CAVE7_CURRICULA={pattern,statistics,chance};
export function cave7Guide(realm:NewCave7Realm,week:number,lesson:number){const w=CAVE7_CURRICULA[realm][week-1],l=w?.lessons[lesson-1];return l?{...l,code:w.code as CurriculumCode}:undefined;}
function program(realm:NewCave7Realm):WeekPlan[]{return CAVE7_CURRICULA[realm].map((w,i)=>({id:`y7-${realm}-w${i+1}`,week:i+1,topic:w.title,curriculum:[w.code as CurriculumCode],lessons:w.lessons.map((l,j)=>({id:`y7-${realm}-w${i+1}-l${j+1}`,week:i+1,lesson:j+1,title:l.title,focus:l.goal,curriculum:[(realm==='pattern'&&i===11&&j>0?'AC9M7A06':w.code) as CurriculumCode],config:{teacherPreviewHref:`/demo-review/shattered-realms/${realm}/lesson?realm_id=${realm}&year=Year%207&week=${i+1}&lessonId=y7-${realm}-w${i+1}-l${j+1}&expedition=1&teacher_preview=1&review=1`},activityIdeas:[l.goal,'explain my answer using the given evidence'],quizSafe:true,activities:['fast_thinking','reasoning','apply_create'].map(role=>({activityType:'multiple_choice' as const,weight:1,config:{rotationRole:role,mode:`${realm}7_w${i+1}_l${j+1}_${role}`}}))}))}));}
export const PATTERN7_PROGRAM=program('pattern');
export const STATISTICS7_PROGRAM=program('statistics');
export const CHANCE7_PROGRAM=program('chance');
export const NEW_CAVE7_PROGRAMS={pattern:PATTERN7_PROGRAM,statistics:STATISTICS7_PROGRAM,chance:CHANCE7_PROGRAM};
