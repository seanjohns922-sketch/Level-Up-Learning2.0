'use client';
import {useMemo} from 'react';
import Number7AccessGate from '@/components/lesson/Number7AccessGate';
import StarpathVoyageQuiz from './StarpathVoyageQuiz';
import {space7Quiz} from '@/data/activities/year7Space/questions';
import {SPACE7_PROGRAM} from '@/data/activities/year7Space/curriculum';
import {cavernWeekHref} from '@/lib/world3d/shattered-realms';
import type {PracticeTask} from '@/data/activities/year1/practice-task';
export default function Space7QuizClient({week}:{week:number}){
 const tasks=useMemo<PracticeTask[]>(()=>space7Quiz(week).map(q=>({kind:'space7Question',prompt:q.prompt,speakText:q.prompt,options:q.options,answer:q.answer,question:q,feedback:{correct:q.explanation??'Correct.',wrong:q.explanation??'Review this skill.'}})),[week]);
 const w=SPACE7_PROGRAM[week-1];
 return <Number7AccessGate realm="space" week={week} lesson="quiz"><StarpathVoyageQuiz key={`space-${week}`} realm="space" tasks={tasks} quiz={{level:'Year 7',levelLabel:'Level 7',week,title:w.topic,coverage:'15 questions: five from each lesson. Score at least 12/15 (80%) to continue.',lessonTitles:w.lessons.map(l=>l.title) as [string,string,string],lessonCurriculumCodes:w.lessons.map(l=>l.curriculum??[]) as [string[],string[],string[]],lessonSkillIds:w.lessons.map(l=>[l.id]) as [string[],string[],string[]],weekHref:cavernWeekHref('space',week),nextWeekHref:cavernWeekHref('space',week+1)}}/></Number7AccessGate>;
}
