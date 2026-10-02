'use client';
import layout from './Number7LessonLayout.module.css';
import {useEffect,useRef} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import { MathFormattedText } from '@/components/FractionText';
import FractionNumberLineVisual from '@/components/activities/FractionNumberLineVisual';
import IntegerNumberLineVisual from '@/components/activities/IntegerNumberLineVisual';
import { number7Guide } from '@/data/activities/year7Number/curriculum';
import { number7Challenge } from '@/data/activities/year7Number/challenges';

export default function Number7SkillGuide({week,lesson,onContinue,review=false}:{week:number;lesson:number;onContinue:()=>void;review?:boolean}) {
 const guide=number7Guide(week,lesson);if(!guide)return null;
 const furtherExamples=(['reasoning','apply_create'] as const).map(role=>number7Challenge(week,lesson,7007,role));
 const square=week===1&&lesson===1;
 const line=week===9&&lesson===2;
 const fractionModel=week===4&&lesson===1?{total:24,shaded:18,label:'18 of 24 equal parts = 3/4'}:week===7&&lesson===2?{total:12,shaded:6,label:'2/3 of 3/4 = 6/12 = 1/2'}:week===7&&lesson===3?{total:8,shaded:6,label:'3/4 contains 6 eighths'}:null;
 const ratioModel=week===10&&lesson===1;
 const visualSpeech=square?'There are four rows, each containing four crystals. Four times four equals sixteen.':line?'Number line from negative six to eight. Start at negative four and move seven places to the right, ending at three.':fractionModel?`${fractionModel.label}. ${fractionModel.shaded} of ${fractionModel.total} equal-sized parts are shaded.`:ratioModel?'Two blue crystals and three gold crystals show the ratio two to three. There are five crystals altogether.':week===5&&lesson===1?'Number line from 0 to 2. Each whole has four equal spaces. P is seven quarter-steps from zero: one and three quarters, or 1.75.':week===5&&lesson===2?'Number line from negative 3 to 0. Each whole has two equal spaces. P is halfway between negative 2 and negative 1, at negative 1.5.':guide.example;
 return <section className={`${layout.guide} rounded-2xl border border-teal-200 bg-[#fffdf5] p-5 text-slate-900 shadow-xl sm:p-8`} aria-label="Learn the skill">
  <div className="text-xs font-bold uppercase tracking-widest text-teal-800">Learn the skill · Week {week} · Lesson {lesson}</div>
  <div className="mt-3 flex items-start justify-between gap-3"><h2 className="text-2xl font-black sm:text-3xl">{guide.title}</h2><ReadAloudBtn text={`${guide.title}. I am learning to ${guide.goal}. ${guide.idea}`} /></div>
  <p className="mt-3 text-lg leading-relaxed">{guide.idea}</p>
  <div data-guide-example className="my-5 rounded-xl border border-teal-200 bg-white p-5">
   <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-bold text-teal-900">Worked example</h3><ReadAloudBtn text={visualSpeech} label="Read diagram" /></div>
   {square&&<div aria-hidden="true" className="mx-auto mb-4 grid w-44 grid-cols-4 gap-3">{Array.from({length:16},(_,i)=><span key={i} className="h-7 w-7 rotate-45 rounded-sm border-2 border-teal-700 bg-gradient-to-br from-teal-100 to-teal-500 shadow-sm"/>)}</div>}
   {fractionModel&&<div className="mx-auto mb-4 max-w-md"><div aria-hidden="true" className="grid gap-1" style={{gridTemplateColumns:`repeat(${fractionModel.total===24?8:4},1fr)`}}>{Array.from({length:fractionModel.total},(_,i)=><div key={i} className={`h-8 border border-teal-700 ${i<fractionModel.shaded?'bg-teal-500':'bg-white'}`}/>)}</div><p className="mt-2 text-center font-semibold">{fractionModel.label}</p></div>}
   {ratioModel&&<div className="mb-4 text-center"><div aria-hidden="true" className="flex justify-center gap-3">{[0,1,2,3,4].map(i=><span key={i} className={`h-8 w-8 rotate-45 rounded-sm border-2 ${i<2?'border-blue-700 bg-blue-400':'border-amber-700 bg-amber-300'}`}/>)}</div><p className="mt-4 font-semibold">2 blue : 3 gold · 5 parts altogether</p></div>}
   {week===5&&lesson===1&&<FractionNumberLineVisual visual={{type:"fraction_number_line",title:"Seven quarter-steps",leftLabel:"",rightLabel:"",leftPosition:0,rightPosition:2,min:0,max:2,subdivisions:4,markers:[{label:"P",position:1.75}]}}/>}
   {week===5&&lesson===2&&<FractionNumberLineVisual visual={{type:"fraction_number_line",title:"Halfway between −2 and −1",leftLabel:"",rightLabel:"",leftPosition:-3,rightPosition:0,min:-3,max:0,subdivisions:2,markers:[{label:"P",position:-1.5}]}}/>}
   {line&&<IntegerNumberLineVisual visual={{type:'integer_number_line',min:-6,max:8,start:-4,jump:7,end:3}}/>}
   <div className="text-center text-xl font-bold leading-relaxed sm:text-2xl"><MathFormattedText text={guide.example}/></div>
  </div>
  <div data-guide-steps><div className="flex items-center justify-between gap-3"><h3 className="font-bold uppercase tracking-wide text-teal-800">How to solve it</h3><ReadAloudBtn text={guide.steps.map((s,i)=>`Step ${i+1}. ${s}`).join(' ')} /></div>
  <ol className="mt-3 space-y-3">{guide.steps.map((s,i)=><li key={s} className="flex gap-3 text-base leading-relaxed sm:text-lg"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-800 font-bold text-white">{i+1}</span><MathFormattedText text={s}/></li>)}</ol>
  <div data-guide-caution className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><p><strong>Watch out: </strong>{guide.caution}</p><ReadAloudBtn text={`Watch out. ${guide.caution}`} /></div>
  <details className="mt-3 rounded-xl border border-teal-200 bg-white p-3">
   <summary className="cursor-pointer font-bold text-teal-900">Worked examples: reasoning and application</summary>
   {furtherExamples.map((example,index)=><div key={example.tier} className="mt-4 border-t border-teal-100 pt-3">
    <div className="flex items-start justify-between gap-3"><h4 className="font-bold text-teal-900">{index===0?'Explain the method':'Apply the skill'}</h4><ReadAloudBtn text={`${example.prompt} ${example.diagramSpeech??''} Worked solution. ${example.answer}. ${example.explanation}`} label="Read example"/></div>
    <p className="mt-2 leading-relaxed"><MathFormattedText text={example.prompt}/></p>
    {example.visual?.type==='fraction_number_line'&&<FractionNumberLineVisual visual={example.visual}/>}
    <p className="mt-2 font-bold"><MathFormattedText text={example.answer}/></p>
    <p className="mt-2 leading-relaxed"><MathFormattedText text={example.explanation}/></p>
   </div>)}
  </details>
  </div>
  <div data-guide-actions className="mt-6 text-center"><button type="button" onClick={onContinue} className="min-h-12 rounded-xl bg-teal-800 px-8 py-3 text-lg font-bold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800">{review?'Back to practice':'Let’s practise'} →</button><p className="mt-2 text-sm text-slate-600">{review?'Your practice timer is paused.':'Read at your own pace. Your timer starts when practice begins.'}</p></div>
 </section>;
}

export function Number7SkillGuideDialog({week,lesson,onClose}:{week:number;lesson:number;onClose:()=>void}) {
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close();},[]);
 return <dialog ref={ref} onCancel={event=>{event.preventDefault();onClose();}} className="fixed inset-0 m-auto max-h-[90vh] w-[min(95vw,900px)] overflow-y-auto rounded-2xl border-0 p-0 backdrop:bg-slate-950/85" aria-label="Skill guide"><Number7SkillGuide week={week} lesson={lesson} review onContinue={onClose}/></dialog>;
}
