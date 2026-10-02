'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useDemoPreviewMode } from '@/lib/demo-mode';
import { number7DemoActivityAllowed } from '@/lib/number7-demo';
import { cavernWeekHref } from '@/lib/world3d/shattered-realms';
export default function Number7AccessGate({week,lesson,children,realm="number"}:{week:number;lesson:number|'quiz';children:ReactNode;realm?:"number"|"measurement"}) {
 const review=useSearchParams().get("review")==="1";
 const demo=useDemoPreviewMode();const [allowed,setAllowed]=useState<boolean|null>(null);
 useEffect(()=>{let active=true;queueMicrotask(()=>{if(active)setAllowed(number7DemoActivityAllowed(demo,week,lesson));});return()=>{active=false;};},[demo,week,lesson,review]);
 if(allowed===null)return <main className="min-h-screen p-20 text-center">Loading your lesson…</main>;
 if(!demo||!allowed)return <main className="min-h-screen bg-slate-950 px-6 py-24 text-center text-white"><h1 className="text-2xl font-bold">Open Level 7 in demo mode</h1><p className="my-4">Choose a valid lesson or quiz from the demo week page. All demo activities are available for review.</p><a className="underline" href={cavernWeekHref(realm,week)}>Back to Week {week}</a></main>;
 return <>{review&&<div className="bg-slate-950 px-4 pb-3 pt-16 text-center text-sm text-white">Teacher review · All lessons are available. This review does not unlock weeks or change student records.</div>}{children}</>;
}
