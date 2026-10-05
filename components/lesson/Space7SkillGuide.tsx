'use client';
import Space7LearningLab from "./cave7/Space7LearningLab";
import {useEffect,useRef} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {MathFormattedText} from '@/components/FractionText';
import Space7LessonVisual from '@/components/starpath/Space7LessonVisual';
import {solutionSteps} from '@/lib/level7-guide-steps';
import type {Task7,Flow7} from '@/data/assessments/revisions/level7StarpathFiveForms';
import {SORTER7_QUESTIONS,SORTER7_TEMPLATES,type Level7Plane,type Level7Sorter,type Sorter7Node,type Sorter7Question} from '@/lib/level7-answer';
import {space7Guide} from '@/data/activities/year7Space/curriculum';
import {space7Question} from '@/data/activities/year7Space/questions';
import layout from './Space7LessonLayout.module.css';
export default function Space7SkillGuide({week,lesson,onContinue,review=false}:{week:number;lesson:number;onContinue:()=>void;review?:boolean}){
 const guide=space7Guide(week,lesson);if(!guide)return null;
 const example=space7Question(week,lesson,7007);
 const further=(['reasoning','apply_create'] as const).map(role=>space7Question(week,lesson,7007,role));
 // Skip steps that only repeat the lesson's opening idea, which is already shown above.
 const all=solutionSteps(example.explanation),fresh=all.filter(x=>!guide.idea.includes(x.replace(/\.$/,''))),steps=fresh.length?fresh:all,answer=answerText(example);
 return <section className={`${layout.guide} rounded-2xl border border-violet-200 bg-[#faf8ff] p-5 text-[#25133f] shadow-xl sm:p-8`} aria-label="Learn the skill">
  <div className="text-xs font-bold uppercase tracking-widest text-violet-800">Learn the skill · Week {week} · Lesson {lesson}</div>
  <div className="mt-3 flex items-start justify-between gap-3"><h2 className="text-2xl font-black sm:text-3xl">{guide.title}</h2><ReadAloudBtn text={`${guide.title}. I am learning to ${guide.goal}. ${guide.idea}`}/></div>
  <p className="mt-3 text-lg leading-relaxed">{guide.idea}</p>
  <div data-guide-example className="my-5 rounded-xl border border-violet-200 bg-white p-5">
   <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-bold text-violet-900">Worked example</h3><ReadAloudBtn text={`${example.prompt} ${steps.join(' ')} Answer: ${answer}.`}/></div>
   <p className="mb-3 font-semibold"><MathFormattedText text={example.prompt}/></p>
   {guideVisual(example)&&<Space7LessonVisual visual={guideVisual(example)!} reveal/>}
   <p className="mt-3 rounded-lg bg-violet-50 px-4 py-3 text-lg"><span className="font-semibold">Answer: </span><strong><MathFormattedText text={answer}/></strong></p>
  </div>
  <div data-guide-steps>
   <div className="flex items-center justify-between gap-3"><h3 className="font-bold uppercase tracking-wide text-violet-800">How to solve it</h3><ReadAloudBtn text={steps.map((s,i)=>`Step ${i+1}. ${s}`).join(' ')}/></div>
   <ol className="mt-3 space-y-3">{steps.map((s,i)=><li key={i} className="flex gap-3 leading-relaxed"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-800 font-bold text-white">{i+1}</span><MathFormattedText text={s}/></li>)}</ol>
   <div data-guide-caution className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4"><p><strong>Watch out: </strong>{guide.caution}</p><ReadAloudBtn text={`Watch out. ${guide.caution}`}/></div>
   <details className="mt-3 rounded-xl border border-violet-200 bg-white p-3"><summary className="cursor-pointer font-bold">Worked examples: reasoning and application</summary>{further.map((q,i)=><div key={q.tier} className="mt-4 border-t border-violet-100 pt-3"><div className="flex justify-between gap-3"><h4 className="font-bold">{i===0?'Explain the method':'Apply the skill'}</h4><ReadAloudBtn text={`${q.prompt} Worked solution: ${q.answer}. ${q.explanation}`}/></div><p className="mt-2"><MathFormattedText text={q.prompt}/></p>{guideVisual(q)&&<Space7LessonVisual visual={guideVisual(q)!} reveal/>}<p className="mt-2 font-bold"><MathFormattedText text={q.answer}/></p><p className="mt-2"><MathFormattedText text={q.explanation??''}/></p></div>)}</details>
  </div>
  <Space7LearningLab week={week}/>
  <div data-guide-actions className="mt-6 text-center"><button type="button" onClick={onContinue} className="min-h-12 rounded-xl bg-violet-800 px-8 py-3 text-lg font-bold text-white hover:bg-violet-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-800">{review?'Back to practice':'Let’s practise'} →</button><p className="mt-2 text-sm">{review?'Your practice timer is paused.':'Read at your own pace. Your timer starts when practice begins.'}</p></div>
 </section>;
}
export function Space7SkillGuideDialog({week,lesson,onClose}:{week:number;lesson:number;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const d=ref.current;d?.showModal();return()=>d?.close();},[]);
 return <dialog ref={ref} onCancel={e=>{e.preventDefault();onClose();}} className="fixed inset-0 m-auto max-h-[90vh] w-[min(95vw,1100px)] overflow-y-auto rounded-2xl border-0 p-0 backdrop:bg-slate-950/85" aria-label="Skill guide"><Space7SkillGuide week={week} lesson={lesson} review onContinue={onClose}/></dialog>;
}
// A built model reads as back row and front row; everything else is shown as stored.
function answerText(q:{answer:string;build?:unknown;place?:Level7Plane;sorter?:Level7Sorter}){if(q.sorter)return q.sorter.mode==='sort'?q.sorter.shapes.map((sh,i)=>`${sh.id} ${q.sorter!.target[i]}`).join(', '):q.sorter.mode==='tree'?'the completed tree shown':'the sorter shown';if(q.place){const ps=q.answer.split(';');return ps.map((p,i)=>`${q.place!.labels[i]}′ ${p.trim()}`).join(', ');}if(!q.build)return q.answer;const h=q.answer.split(',');return `back row ${h.slice(0,3).join(', ')}; front row ${h.slice(3).join(', ')}`;}
// Place-the-image questions draw their grid in the answer box, so the guide draws it here with the worked image.
function guideVisual(q:{spaceVisual?:Task7;place?:Level7Plane;sorter?:Level7Sorter;answer:string}):Task7|undefined{
 const s=q.sorter;
 if(s?.mode==='tree')return {mode:'choice',diagram:'none',instruction:'The completed family tree.',familyTree7:s.target};
 if(s?.mode==='flow'){const values=q.answer.split('|'),toFlow=(n:Sorter7Node):Flow7=>n.yes&&n.no?{question:SORTER7_QUESTIONS[values[n.slot] as Sorter7Question],yes:toFlow(n.yes),no:toFlow(n.no)}:values[n.slot];return {mode:'choice',diagram:'flow',instruction:'One sorter that works, and the shapes it was tested on.',trees:[{title:'Sorter',root:toFlow(SORTER7_TEMPLATES[s.template!])}],shapes7:s.shapes};}
 if(s?.mode==='sort'){const values=s.flow?.values??[],toFlow=(n:Sorter7Node):Flow7=>n.yes&&n.no?{question:SORTER7_QUESTIONS[values[n.slot] as Sorter7Question],yes:toFlow(n.yes),no:toFlow(n.no)}:values[n.slot];return {mode:'choice',diagram:s.flow?'flow':'none',instruction:'The shapes to sort.',trees:s.flow?[{title:s.flow.title,root:toFlow(SORTER7_TEMPLATES[s.flow.template])}]:undefined,shapes7:s.shapes};}
 return q.spaceVisual??(q.place?{mode:'choice',diagram:'none',instruction:'Triangle and its image.',plane7:q.place}:undefined);}
