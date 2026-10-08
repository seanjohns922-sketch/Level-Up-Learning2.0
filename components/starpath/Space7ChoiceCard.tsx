'use client';
import type { Level8Question } from "@/data/activities/level8/shared";
import Space8Visual from "@/components/lesson/level8/SpaceVisual";
import Number8Visual from "@/components/lesson/level8/NumberVisual";
import Algebra8Visual from "@/components/lesson/level8/AlgebraVisual";
import Chance8Visual from "@/components/lesson/level8/ChanceVisual";
import Year8MeasurementAssessmentVisual from "@/components/assessment/Year8MeasurementAssessmentVisual";
import Cave7Visual from "@/components/lesson/cave7/Cave7Visual";
import type {Cave7Question} from "@/data/activities/cave7/shared";
import Level7AnswerInput from '@/components/activities/Level7AnswerInput';
import {level7Answer} from '@/lib/level7-answer';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import Space7LessonVisual from './Space7LessonVisual';
import type {Space7Question} from '@/data/activities/year7Space/questions';
import {getRealmTheme} from '@/lib/useRealmTheme';

export default function Space7ChoiceCard({question:q,selected,onAnswer,realm="space"}:{question:Space7Question|Cave7Question|Level8Question;realm?:string;selected?:string;onAnswer:(correct:boolean,response:string)=>void}){
 const theme=getRealmTheme(realm),spec=level7Answer(q);
 return <section className="rounded-2xl border bg-white p-5 text-slate-950 sm:p-8" style={{borderColor:theme.borderRing}}>
  <div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold sm:text-2xl">{spec?.prompt??q.prompt}</h2><ReadAloudBtn text={spec?.prompt??q.prompt}/></div>
  {/* Weekly quizzes: diagram beside the answer when the card is wide enough. */}
  <div className="@container"><div className={q.cave7Visual||q.spaceVisual||q.space8Visual||q.measurement8Visual||q.number8Visual||q.algebra8Visual||q.chance8Visual?'grid items-start gap-5 @3xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]':''}>
  {(q.cave7Visual||q.spaceVisual||q.space8Visual||q.measurement8Visual||q.number8Visual||q.algebra8Visual||q.chance8Visual)&&<div className="min-w-0 [&>*:first-child]:mt-0">{q.number8Visual&&<Number8Visual visual={q.number8Visual}/>}{q.algebra8Visual&&<Algebra8Visual visual={q.algebra8Visual}/>}{q.chance8Visual&&<Chance8Visual visual={q.chance8Visual}/>}{q.space8Visual&&<Space8Visual visual={q.space8Visual}/>} {q.measurement8Visual&&<Year8MeasurementAssessmentVisual visual={q.measurement8Visual}/>} {q.cave7Visual&&<Cave7Visual visual={q.cave7Visual} realm={realm}/>}{q.spaceVisual&&<Space7LessonVisual visual={q.spaceVisual}/>}</div>}
  <div className="min-w-0 [&>*:first-child]:mt-0">{spec?<Level7AnswerInput key={q.lessonId+q.prompt+q.answer} spec={spec} realm={realm} initialValue={selected} onEditing={()=>onAnswer(false,'')} onAnswer={onAnswer}/>:<div className={`mt-6 grid gap-4 ${q.cave7Visual||q.spaceVisual||q.space8Visual||q.measurement8Visual||q.number8Visual||q.algebra8Visual||q.chance8Visual?"":"md:grid-cols-2"}`}>{q.options.map((option,i)=><div key={option} className="flex items-center gap-2 rounded-xl border-2 p-2" style={{borderColor:selected===option?theme.ctaFrom:theme.borderRing,background:selected===option?theme.surfaceTint:'white'}}><button type="button" aria-pressed={selected===option} onClick={()=>onAnswer(option===q.answer,option)} style={{outlineColor:theme.ctaFrom}} className="min-h-20 flex-1 rounded-lg p-3 text-left text-lg font-semibold outline-offset-4 hover:brightness-95 focus-visible:outline-2"><span className="mr-3" style={{color:theme.ctaFrom}}>{String.fromCharCode(65+i)}.</span>{option}</button><ReadAloudBtn text={option} label={`Read answer ${i+1}`}/></div>)}</div>}</div></div></div>
 </section>;
}
