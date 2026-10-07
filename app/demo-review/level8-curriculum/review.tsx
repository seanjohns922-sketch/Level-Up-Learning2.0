'use client';
import {useState,type CSSProperties} from 'react';
import Link from 'next/link';
import {level8DemoHref} from '@/lib/level8-routes';
import {useSearchParams} from 'next/navigation';
import {LEVEL8_CURRICULUM,level8ScopeCsv} from '@/data/activities/level8/curriculum';
import {isLevel8Realm,type Level8Realm} from '@/lib/level8-config';
import {getRealmTheme} from '@/lib/useRealmTheme';
import ReadAloudBtn from '@/components/ReadAloudBtn';
const names:Record<Level8Realm,string>={number:'Number Nexus',measurement:'Measurelands',space:'Starpath',pattern:'Pattern Peaks',statistics:'Statistica',chance:'Chance Hollow'};
export default function CurriculumReview(){
 const search=useSearchParams(),requested=search.get('realm')??'number';
 const [realm,setRealm]=useState<Level8Realm>(isLevel8Realm(requested)?requested:'number');
 const theme=getRealmTheme(realm),weeks=LEVEL8_CURRICULUM[realm];
 function download(all=false){
  const url=URL.createObjectURL(new Blob([level8ScopeCsv(all?undefined:realm)],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`level8-${all?'all-realms':realm}-scope-and-sequence.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <main className="min-h-screen bg-slate-950 p-5 pt-24 text-slate-100 sm:p-10 sm:pt-24" style={{'--realm-ring':theme.accentText} as CSSProperties}>
  <div className="mx-auto max-w-6xl space-y-6">
   <header className="rounded-2xl border p-6" style={{background:theme.cardSurface,borderColor:theme.borderRing}}>
    <p className="text-sm font-bold uppercase tracking-widest" style={{color:theme.accentText}}>Level 8 · Curriculum authoring plan</p>
    <h1 className="mt-2 text-3xl font-bold">66 weeks. 198 lesson previews.</h1>
    <p className="mt-3">Three lessons per week. Weekly quizzes: 15 questions, five per lesson, 80% to progress. Each realm’s final week ends with its existing post-test instead of a quiz; 85% recovers the Core.</p>
    <p className="mt-3 font-semibold">This is the scope and sequence. Lesson previews are available below; they are not released to students.</p>
    <p className="mt-2 text-sm">Source: Australian Curriculum v9, supplied Years 7–10 Mathematics PDF, Year 8, pages 17–27. Financial applications sit in Number and Algebra; Measurelands retains its nonfinancial contexts. Cross-realm codes are shown explicitly.</p>
    <Link className="mt-4 inline-block underline" href="/demo-review">Back to demo review</Link>
   </header>
   <div className="flex flex-wrap items-end gap-4">
    <label className="font-semibold">Realm<select className="mt-1 block rounded-lg border bg-slate-900 p-3 focus-visible:outline-2 focus-visible:outline-[var(--realm-ring)]" style={{borderColor:theme.borderRing}} value={realm} onChange={e=>setRealm(e.target.value as Level8Realm)}>{Object.entries(names).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <button className="rounded-lg px-4 py-3 font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--realm-ring)]" style={{background:theme.accentText}} onClick={()=>download()}>Download this realm (CSV)</button>
    <button className="rounded-lg border px-4 py-3 focus-visible:outline-2 focus-visible:outline-[var(--realm-ring)]" style={{borderColor:theme.borderRing}} onClick={()=>download(true)}>Download all realms (CSV)</button>
    <Link className="underline" href={`/demo-review/volcano/${realm}`}>Open stronghold</Link>
   </div>
   <h2 className="text-2xl font-bold">{names[realm]} · {weeks.length} weeks · {weeks.length*3} lessons</h2>
   <p>Every lesson begins with a concise visual skill guide. Prefer typed answers with suitable fraction, decimal, coordinate or equation inputs; use graphing, sorting and simulations when those demonstrate the skill better. Equivalent answers receive constructive simplification guidance.</p>
   <div className="grid gap-5 md:grid-cols-2">{weeks.map(w=><article key={`${realm}-${w.week}`} className="rounded-2xl border bg-slate-900 p-5" style={{borderColor:theme.borderRing}}>
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold" style={{color:theme.accentText}}>WEEK {w.week}</p><h3 className="mt-1 text-xl font-bold">{w.title}</h3></div><ReadAloudBtn text={`Week ${w.week}. ${w.title}. ${w.lessons.map((l,i)=>`Lesson ${i+1}. ${l.title}.`).join(' ')} Planned visual: ${w.visual}. ${w.assessment==='posttest'?'Final post-test.':'Weekly quiz.'}`}/></div>
    <ol className="mt-4 list-decimal space-y-3 pl-5">{w.lessons.map((l,i)=><li key={l.title}><Link className="font-bold underline" href={level8DemoHref(realm,w.week,i+1)}>{l.title}</Link><p className="mt-1 text-xs text-slate-300">{l.codes.join(' · ')}</p></li>)}</ol>
    <p className="mt-4 rounded-lg p-3 text-sm" style={{background:theme.surfaceTint}}><strong>Visual or interaction:</strong> {w.visual}</p>
    <p className="mt-3 font-semibold" style={{color:theme.accentText}}>{w.assessment==='posttest'?'Final week: post-test replaces the quiz':'Weekly quiz: 15 questions · 80% pass'}</p>
   </article>)}</div>
  </div>
 </main>;
}
