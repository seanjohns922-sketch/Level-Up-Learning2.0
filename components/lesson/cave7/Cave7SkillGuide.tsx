'use client';
import {useEffect,useRef} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {cave7Guide,type NewCave7Realm} from '@/data/activities/cave7/curriculum';
import {CAVE7_GENERATORS} from '@/data/activities/cave7/questions';
import {getRealmTheme} from '@/lib/useRealmTheme';
import Cave7Visual from './Cave7Visual';
import Cave7LearningLab from './Cave7LearningLab';
export default function Cave7SkillGuide({realm,week,lesson,onContinue,review=false}:{realm:NewCave7Realm;week:number;lesson:number;onContinue:()=>void;review?:boolean}){
 const guide=cave7Guide(realm,week,lesson);if(!guide)return null;
 const t=getRealmTheme(realm),example=CAVE7_GENERATORS[realm](week,lesson,7007),further=CAVE7_GENERATORS[realm](week,lesson,11027,'apply_create');
 return <section className="rounded-2xl border bg-[#fffdf8] p-5 text-slate-900 shadow-xl sm:p-8" style={{borderColor:t.ctaFrom}} aria-label="Learn the skill">
  <p className="text-xs font-bold uppercase tracking-widest">Learn the skill · Week {week} · Lesson {lesson}</p>
  <div className="mt-3 flex items-start justify-between gap-3"><h2 className="text-2xl font-black sm:text-3xl">{guide.title}</h2><ReadAloudBtn text={`${guide.title}. I am learning to ${guide.goal}. ${guide.idea}`}/></div><p className="mt-3 text-lg leading-relaxed">{guide.idea}</p>
  <div className="my-5 rounded-xl border bg-white p-5" style={{borderColor:t.ctaFrom}}><div className="flex justify-between gap-3"><h3 className="font-bold">Worked example</h3><ReadAloudBtn text={`${example.prompt} Answer: ${example.answer}. ${example.explanation}`}/></div><p className="mt-3 font-semibold">{example.prompt}</p>{example.cave7Visual&&<Cave7Visual visual={example.cave7Visual} realm={realm}/>}<p className="mt-3 text-xl font-bold">{example.answer}</p><p className="mt-2">{example.explanation}</p></div>
  <div className="flex justify-between gap-3"><h3 className="font-bold uppercase tracking-wide">How to solve it</h3><ReadAloudBtn text={example.steps.map((s,i)=>`Step ${i+1}. ${s}`).join(' ')}/></div><ol className="mt-3 space-y-3">{example.steps.map((s,i)=><li key={i} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-bold text-white" style={{background:t.ctaFrom}}>{i+1}</span><span>{s}</span></li>)}</ol>
  <div className="mt-5 flex justify-between gap-3 rounded-xl border p-4" style={{borderColor:t.ctaFrom,background:t.surfaceTint}}><p><strong>Watch out: </strong>{guide.caution}</p><ReadAloudBtn text={`Watch out. ${guide.caution}`}/></div>
  <details className="mt-3 rounded-xl border bg-white p-4"><summary className="cursor-pointer font-bold">Apply the skill · another worked example</summary><div className="mt-3 flex justify-between gap-3"><p>{further.prompt}</p><ReadAloudBtn text={`${further.prompt}. ${further.answer}. ${further.explanation}`}/></div>{further.cave7Visual&&<Cave7Visual realm={realm} visual={further.cave7Visual}/>}<p className="mt-3 font-bold">{further.answer}</p><p>{further.explanation}</p></details>
  <Cave7LearningLab key={`${realm}-${week}-${lesson}`} realm={realm} week={week}/>
  <div className="mt-6 text-center"><button type="button" onClick={onContinue} className="min-h-12 rounded-xl px-8 py-3 text-lg font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4" style={{background:t.ctaGradientCss}}>{review?'Back to practice':'Let’s practise'} →</button><p className="mt-2 text-sm">{review?'Your practice timer is paused.':'Read at your own pace. Your timer starts when practice begins.'}</p></div>
 </section>;
}
export function Cave7SkillGuideDialog({realm,week,lesson,onClose}:{realm:NewCave7Realm;week:number;lesson:number;onClose:()=>void}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const d=ref.current;d?.showModal();return()=>d?.close();},[]);return <dialog ref={ref} onCancel={e=>{e.preventDefault();onClose();}} className="fixed inset-0 m-auto max-h-[90vh] w-[min(95vw,1100px)] overflow-y-auto rounded-2xl border-0 p-0 backdrop:bg-slate-950/85" aria-label="Skill guide"><Cave7SkillGuide realm={realm} week={week} lesson={lesson} review onContinue={onClose}/></dialog>;}
