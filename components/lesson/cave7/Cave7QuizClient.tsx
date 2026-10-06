'use client';
import {useCallback} from 'react';
import Number7AccessGate from '@/components/lesson/Number7AccessGate';
import StarpathVoyageQuiz from '@/components/starpath/StarpathVoyageQuiz';
import {cave7Quiz} from '@/data/activities/cave7/questions';
import {NEW_CAVE7_PROGRAMS,type NewCave7Realm} from '@/data/activities/cave7/curriculum';
import {cavernWeekHref} from '@/lib/world3d/shattered-realms';
import {usePathname} from 'next/navigation';
import {level7LiveHref} from '@/lib/level7-release';
import type {PracticeTask} from '@/data/activities/year1/practice-task';
export default function Cave7QuizClient({realm,week}:{realm:NewCave7Realm;week:number}){
 const buildTasks=useCallback((attempt:number):PracticeTask[]=>cave7Quiz(realm,week,attempt).map(q=>({kind:'cave7Question',prompt:q.prompt,speakText:q.prompt,options:q.options,answer:q.answer,question:q,feedback:{correct:q.explanation??'Correct.',wrong:q.explanation??'Review this skill.'}})),[realm,week]),w=NEW_CAVE7_PROGRAMS[realm][week-1];
 // Live students return to their week page; demo review returns to the demo week page.
 const live=usePathname().startsWith('/level7/'),weekHome=(w:number)=>live?level7LiveHref(realm,w,'week'):cavernWeekHref(realm,w);
 return <Number7AccessGate realm={realm} week={week} lesson="quiz"><StarpathVoyageQuiz key={`${realm}-${week}`} realm={realm} buildTasks={buildTasks} quiz={{level:'Year 7',levelLabel:'Level 7',week,title:w.topic,coverage:'Five from each lesson. Score at least 12/15 (80%) to continue.',lessonTitles:w.lessons.map(l=>l.title) as [string,string,string],lessonCurriculumCodes:w.lessons.map(l=>l.curriculum??[]) as [string[],string[],string[]],lessonSkillIds:w.lessons.map(l=>[l.id]) as [string[],string[],string[]],weekHref:weekHome(week),nextWeekHref:weekHome(week+1)}}/></Number7AccessGate>;
}
