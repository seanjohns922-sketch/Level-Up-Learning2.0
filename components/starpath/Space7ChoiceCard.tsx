'use client';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import Space7LessonVisual from './Space7LessonVisual';
import type {Space7Question} from '@/data/activities/year7Space/questions';
import {getRealmTheme} from '@/lib/useRealmTheme';
const theme=getRealmTheme('space');
export default function Space7ChoiceCard({question:q,selected,onAnswer}:{question:Space7Question;selected?:string;onAnswer:(correct:boolean,response:string)=>void}){
 return <section className="rounded-2xl border bg-white p-5 text-slate-950 sm:p-8" style={{borderColor:theme.borderRing}}>
  <div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold sm:text-2xl">{q.prompt}</h2><ReadAloudBtn text={q.prompt}/></div>
  {q.spaceVisual&&<Space7LessonVisual visual={q.spaceVisual}/>}
  <div className="mt-6 grid gap-4 md:grid-cols-2">{q.options.map((option,i)=><div key={option} className="flex items-center gap-2 rounded-xl border-2 p-2" style={{borderColor:selected===option?theme.ctaFrom:theme.borderRing,background:selected===option?theme.surfaceTint:'white'}}><button type="button" aria-pressed={selected===option} onClick={()=>onAnswer(option===q.answer,option)} className="min-h-20 flex-1 rounded-lg p-3 text-left text-lg font-semibold outline-offset-4 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600"><span className="mr-3" style={{color:theme.ctaFrom}}>{String.fromCharCode(65+i)}.</span>{option}</button><ReadAloudBtn text={option} label={`Read answer ${i+1}`}/></div>)}</div>
 </section>;
}
