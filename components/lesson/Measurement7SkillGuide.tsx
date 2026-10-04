'use client';
import {useEffect,useRef} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {MathFormattedText} from '@/components/FractionText';
import Year7MeasurementAssessmentVisual from '@/components/assessment/Year7MeasurementAssessmentVisual';
import {measurement7Guide,measurement7IntroExample} from '@/data/activities/year7Measurement/curriculum';
import {measurement7Question} from '@/data/activities/year7Measurement/questions';
import layout from './Measurement7LessonLayout.module.css';
export default function Measurement7SkillGuide({week,lesson,onContinue,review=false}:{week:number;lesson:number;onContinue:()=>void;review?:boolean}){
 const guide=measurement7Guide(week,lesson);if(!guide)return null;
 const example=measurement7IntroExample(week,lesson)??measurement7Question(week,lesson,7007);
 const further=(['reasoning','apply_create'] as const).map(role=>measurement7Question(week,lesson,7007,role));
 return <section className={`${layout.guide} rounded-2xl border border-amber-200 bg-[#fffdf5] p-5 text-[#422e15] shadow-xl sm:p-8`} aria-label="Learn the skill">
  <div className="text-xs font-bold uppercase tracking-widest text-amber-800">Learn the skill · Week {week} · Lesson {lesson}</div>
  <div className="mt-3 flex items-start justify-between gap-3"><h2 className="text-2xl font-black sm:text-3xl">{guide.title}</h2><ReadAloudBtn text={`${guide.title}. I am learning to ${guide.goal}. ${guide.idea}`}/></div>
  <p className="mt-3 text-lg leading-relaxed">{guide.idea}</p>
  <div data-guide-example className="my-5 rounded-xl border border-amber-200 bg-white p-5">
   <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-bold text-amber-900">Worked example</h3><ReadAloudBtn text={`${example.prompt} Answer: ${example.answer}. ${example.explanation}`}/></div>
   <p className="mb-3 font-semibold"><MathFormattedText text={example.prompt}/></p>
   <div className={example.measurementVisual?'@container':''}><div className={example.measurementVisual?'grid items-center gap-4 @3xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]':''}>
    {example.measurementVisual&&<div className="min-w-0"><Year7MeasurementAssessmentVisual visual={example.measurementVisual}/></div>}
    <p className={`text-xl font-bold ${example.measurementVisual?'mt-3 @3xl:mt-0':'mt-3'}`}><MathFormattedText text={example.explanation??''}/></p>
   </div></div>
  </div>
  <div data-guide-steps>
   <div className="flex items-center justify-between gap-3"><h3 className="font-bold uppercase tracking-wide text-amber-800">How to solve it</h3><ReadAloudBtn text={example.steps.map((s,i)=>`Step ${i+1}. ${s}`).join(' ')}/></div>
   <ol className="mt-3 space-y-3">{example.steps.map((s,i)=><li key={i} className="flex gap-3 leading-relaxed"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-800 font-bold text-white">{i+1}</span><MathFormattedText text={s}/></li>)}</ol>
   <div data-guide-caution className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><p><strong>Watch out: </strong>{guide.caution}</p><ReadAloudBtn text={`Watch out. ${guide.caution}`}/></div>
   <details className="mt-3 rounded-xl border border-amber-200 bg-white p-3"><summary className="cursor-pointer font-bold">Worked examples: reasoning and application</summary>{further.map((q,i)=><div key={q.tier} className="mt-4 border-t border-amber-100 pt-3"><div className="flex justify-between gap-3"><h4 className="font-bold">{i===0?'Explain the method':'Apply the skill'}</h4><ReadAloudBtn text={`${q.prompt} Worked solution: ${q.answer}. ${q.explanation}`}/></div><p className="mt-2"><MathFormattedText text={q.prompt}/></p><p className="mt-2 font-bold"><MathFormattedText text={q.answer}/></p><p className="mt-2"><MathFormattedText text={q.explanation??''}/></p></div>)}</details>
  </div>
  <div data-guide-actions className="mt-6 text-center"><button type="button" onClick={onContinue} className="min-h-12 rounded-xl bg-amber-800 px-8 py-3 text-lg font-bold text-white hover:bg-amber-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800">{review?'Back to practice':'Let’s practise'} →</button><p className="mt-2 text-sm">{review?'Your practice timer is paused.':'Read at your own pace. Your timer starts when practice begins.'}</p></div>
 </section>;
}
export function Measurement7SkillGuideDialog({week,lesson,onClose}:{week:number;lesson:number;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const d=ref.current;d?.showModal();return()=>d?.close();},[]);
 return <dialog ref={ref} onCancel={e=>{e.preventDefault();onClose();}} className="fixed inset-0 m-auto max-h-[90vh] w-[min(95vw,1100px)] overflow-y-auto rounded-2xl border-0 p-0 backdrop:bg-slate-950/85" aria-label="Skill guide"><Measurement7SkillGuide week={week} lesson={lesson} review onContinue={onClose}/></dialog>;
}
