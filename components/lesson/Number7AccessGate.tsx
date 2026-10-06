'use client';
import type {Cave7Realm} from "@/lib/cave7-config";
import {cave7WeekCount} from "@/lib/cave7-config";
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useDemoPreviewMode } from '@/lib/demo-mode';
import { number7DemoActivityAllowed } from '@/lib/number7-demo';
import { cavernWeekHref } from '@/lib/world3d/shattered-realms';
import { LEVEL7_LIVE, level7LiveHref } from '@/lib/level7-release';
import { getActiveStudentIdentity } from '@/lib/studentIdentity';
import { restoreStudentStateFromServer, type StudentProgressRealmId } from '@/lib/student-progress-sync';
import { getWeekProgress, readProgramStore, isWeekPlayable } from '@/lib/program-progress';

/** Live students may take a week's quiz once that week's three lessons are saved. */
async function liveActivityAllowed(week:number,lesson:number|'quiz',realm:Cave7Realm){
 const studentId=getActiveStudentIdentity().studentId;
 if(!studentId)return false;
 let progress;
 try{({progress}=await restoreStudentStateFromServer(studentId,realm as StudentProgressRealmId));}catch{return false;}
 if(!progress||progress.year!=='Year 7'||!progress.placementComplete||!Number.isInteger(week))return false;
 if(!isWeekPlayable(readProgramStore(),'Year 7',week,progress.requiredWeeks,progress.optionalWeeks,realm,progress.teacherAdvancedWeeks,progress.assignedWeek))return false;
 if(lesson!=='quiz')return lesson>=1&&lesson<=3;
 return week>=1&&week<cave7WeekCount(realm)&&getWeekProgress(readProgramStore(),'Year 7',week,realm).lessonsCompleted.slice(0,3).every(Boolean);
}

export default function Number7AccessGate({week,lesson,children,realm="number"}:{week:number;lesson:number|'quiz';children:ReactNode;realm?:Cave7Realm}) {
 const review=useSearchParams().get("review")==="1";
 const pathname=usePathname(),live=LEVEL7_LIVE&&pathname.startsWith('/level7/');
 const demo=useDemoPreviewMode();const [allowed,setAllowed]=useState<boolean|null>(null);
 useEffect(()=>{let active=true;
  if(live&&!demo){liveActivityAllowed(week,lesson,realm).then(ok=>{if(active)setAllowed(ok);});}
  else queueMicrotask(()=>{if(active)setAllowed(number7DemoActivityAllowed(demo,week,lesson,realm));});
  return()=>{active=false;};},[demo,live,week,lesson,review,realm]);
 if(allowed===null)return <main className="min-h-screen p-20 text-center">Loading your lesson…</main>;
 if(live&&!demo){
  if(!allowed)return <main className="min-h-screen bg-slate-950 px-6 py-24 text-center text-white"><h1 className="text-2xl font-bold">Finish this week’s lessons first</h1><p className="my-4">The Week {week} quiz opens once all three lessons are complete.</p><a className="underline" href={level7LiveHref(realm,week,'week')}>Back to Week {week}</a></main>;
  return <>{children}</>;
 }
 if(!demo||!allowed)return <main className="min-h-screen bg-slate-950 px-6 py-24 text-center text-white"><h1 className="text-2xl font-bold">Open Level 7 in demo mode</h1><p className="my-4">Choose a valid lesson or quiz from the demo week page. All demo activities are available for review.</p><a className="underline" href={cavernWeekHref(realm,week)}>Back to Week {week}</a></main>;
 return <>{review&&<div className="bg-slate-950 px-4 pb-3 pt-16 text-center text-sm text-white">Teacher review · All lessons are available. This review does not unlock weeks or change student records.</div>}{children}</>;
}
