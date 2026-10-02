'use client';
import {useMemo} from 'react';
import Number7AccessGate from '@/components/lesson/Number7AccessGate';
import StarpathVoyageQuiz from '@/components/starpath/StarpathVoyageQuiz';
import {cave7Quiz} from '@/data/activities/cave7/questions';
import {NEW_CAVE7_PROGRAMS,type NewCave7Realm} from '@/data/activities/cave7/curriculum';
import {cavernWeekHref} from '@/lib/world3d/shattered-realms';
import type {PracticeTask} from '@/data/activities/year1/practice-task';
export default function Cave7QuizClient({realm,week}:{realm:NewCave7Realm;week:number}){
 const tasks=useMemo<PracticeTask[]>(()=>cave7Quiz(realm,week).map(q=>({kind:'cave7Question',prompt:q.prompt,speakText:q.prompt,options:q.options,answer:q.answer,question:q,feedback:{correct:q.explanation??'Correct.',wrong:q.explanation??'Review this skill.'}})),[realm,week]),w=NEW_CAVE7_PROGRAMS[realm][week-1];
 return <Number7AccessGate realm={realm} week={week} lesson="quiz"><StarpathVoyageQuiz key={`${realm}-${week}`} realm={realm} tasks={tasks} quiz={{level:'Year 7',levelLabel:'Level 7',week,title:w.topic,coverage:'15 questions: five from each lesson. Score at least 12/15 (80%) to continue.',lessonTitles:w.lessons.map(l=>l.title) as [string,string,string],lessonCurriculumCodes:w.lessons.map(l=>l.curriculum??[]) as [string[],string[],string[]],lessonSkillIds:w.lessons.map(l=>[l.id]) as [string[],string[],string[]],weekHref:cavernWeekHref(realm,week),nextWeekHref:cavernWeekHref(realm,week+1)}}/></Number7AccessGate>;
}
