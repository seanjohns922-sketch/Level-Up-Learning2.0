'use client';
import {useEffect,useRef} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {cave7Guide,type NewCave7Realm} from '@/data/activities/cave7/curriculum';
import {CAVE7_GENERATORS} from '@/data/activities/cave7/questions';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {level7Answer} from '@/lib/level7-answer';
import {solutionSteps} from '@/lib/level7-guide-steps';
import type {Cave7Question} from '@/data/activities/cave7/shared';
import Cave7Visual from './Cave7Visual';
import Cave7LearningLab from './Cave7LearningLab';
export default function Cave7SkillGuide({realm,week,lesson,onContinue,review=false}:{realm:NewCave7Realm;week:number;lesson:number;onContinue:()=>void;review?:boolean}){
 const guide=cave7Guide(realm,week,lesson);if(!guide)return null;
 const t=getRealmTheme(realm),example=CAVE7_GENERATORS[realm](week,lesson,7007),further=CAVE7_GENERATORS[realm](week,lesson,11027,'apply_create');
 const steps=solutionSteps(example.explanation),answer=answerText(example);
 return <section className="@container rounded-2xl border bg-[#fffdf8] p-5 text-slate-900 shadow-xl sm:p-6" style={{borderColor:t.ctaFrom}} aria-label="Learn the skill">
  <p className="text-xs font-bold uppercase tracking-widest">Learn the skill · Week {week} · Lesson {lesson}</p>
  <div className="mt-2 flex items-start justify-between gap-3"><h2 className="text-2xl font-black sm:text-3xl">{guide.title}</h2><ReadAloudBtn text={`${guide.title}. I am learning to ${guide.goal}. ${guide.idea}`}/></div><p className="mt-2 text-lg leading-relaxed">{guide.idea}</p>
  {/* The worked example sits beside its solution on wide screens, like the practice layout. */}
  <div className="mt-4 grid items-start gap-4 @4xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
   <div className="min-w-0"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold uppercase tracking-wide">Worked example</h3><p className="mt-1 text-xl font-semibold">{example.prompt}</p></div><ReadAloudBtn text={`${example.prompt} ${steps.join(' ')} Answer: ${answer}.`}/></div>{example.cave7Visual&&<Cave7Visual visual={example.cave7Visual} realm={realm}/>}</div>
   <div className="rounded-xl border bg-white p-4" style={{borderColor:t.ctaFrom}}>
    <h3 className="font-bold uppercase tracking-wide">How to solve it</h3>
    <ol className="mt-3 space-y-2">{steps.map((s,i)=><li key={i} className="flex gap-3 leading-relaxed"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{background:t.ctaFrom}}>{i+1}</span><span>{s}</span></li>)}</ol>
    <p className="mt-4 rounded-lg px-4 py-3 text-lg" style={{background:t.surfaceTint}}><span className="font-semibold">Answer: </span><strong>{answer}</strong></p>
    <div className="mt-3 flex items-start justify-between gap-3 border-t pt-3 text-sm"><p><strong>Watch out: </strong>{guide.caution}</p><ReadAloudBtn text={`Watch out. ${guide.caution}`}/></div>
   </div>
  </div>
  <div className="mt-4 grid items-start gap-3 @4xl:grid-cols-2 [&>details]:mt-0">
   <details className="rounded-xl border bg-white p-4"><summary className="cursor-pointer font-bold">Apply the skill · another worked example</summary><div className="mt-3 flex justify-between gap-3"><p className="font-semibold">{further.prompt}</p><ReadAloudBtn text={`${further.prompt} ${further.explanation} Answer: ${answerText(further)}.`}/></div>{further.cave7Visual&&<Cave7Visual realm={realm} visual={further.cave7Visual}/>}<p className="mt-3">{further.explanation}</p><p className="mt-2 font-bold">Answer: {answerText(further)}</p></details>
   <Cave7LearningLab key={`${realm}-${week}-${lesson}`} realm={realm} week={week}/>
  </div>
  <div className="mt-5 text-center"><button type="button" onClick={onContinue} className="min-h-12 rounded-xl px-8 py-3 text-lg font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4" style={{background:t.ctaGradientCss}}>{review?'Back to practice':'Let’s practise'} →</button><p className="mt-2 text-sm">{review?'Your practice timer is paused.':'Read at your own pace. Your timer starts when practice begins.'}</p></div>
 </section>;
}
// Show the same unit the typed answer box shows.
function answerText(q:Cave7Question){const u=level7Answer(q)?.unit;return !u?q.answer:u==='$'?`$${q.answer}`:u==='%'||u==='°'?`${q.answer}${u}`:`${q.answer} ${u}`;}
export function Cave7SkillGuideDialog({realm,week,lesson,onClose}:{realm:NewCave7Realm;week:number;lesson:number;onClose:()=>void}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const d=ref.current;d?.showModal();return()=>d?.close();},[]);return <dialog ref={ref} onCancel={e=>{e.preventDefault();onClose();}} className="fixed inset-0 m-auto max-h-[90vh] w-[min(95vw,1100px)] overflow-y-auto rounded-2xl border-0 p-0 backdrop:bg-slate-950/85" aria-label="Skill guide"><Cave7SkillGuide realm={realm} week={week} lesson={lesson} review onContinue={onClose}/></dialog>;}
