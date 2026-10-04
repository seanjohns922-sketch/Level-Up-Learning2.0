'use client';
import {useState} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {markLevel7Answer,scalarAnswer,stripAnswerUnit,level7SimplificationTip,type SimplificationTip,type Level7Answer} from '@/lib/level7-answer';
export default function Level7AnswerInput({spec,onAnswer,realm='number',disabled=false,initialValue='',onEditing}:{spec:Level7Answer;onAnswer:(correct:boolean,response:string)=>void;realm?:string;disabled?:boolean;initialValue?:string;onEditing?:()=>void}){
 const t=getRealmTheme(realm),[alternate,setAlternate]=useState(spec.kind==='fraction'&&!spec.format&&!!initialValue&&!initialValue.includes('/')),[error,setError]=useState('');
 const [tip,setTip]=useState<SimplificationTip|null>(null),[showHow,setShowHow]=useState(false);
 const separator=spec.kind==='ratio'?':':spec.kind==='fraction'?'/':',';
 const count=spec.kind==='ratio'?spec.labels?.length??2:spec.kind==='fraction'||spec.kind==='coordinates'?2:spec.kind==='list'||spec.kind==='points'?spec.labels!.length:1;
 const [values,setValues]=useState<string[]>(()=>{const parts=spec.kind==='set'?[initialValue]:initialValue.replace(/[()]/g,'').split(spec.kind==='points'?/[;,]/:separator);return Array.from({length:count},(_,i)=>parts[i]??'');});
 const numeric=!['text','expression','set'].includes(spec.kind);
 const labels=spec.kind==='fraction'&&!alternate?['Numerator (top)','Denominator (bottom)']:spec.kind==='ratio'?spec.labels??['First amount','Second amount']:spec.labels??['Your answer'];
 const help=spec.kind==='fraction'&&!alternate?'Enter the numerator above the line and the denominator below it.':spec.kind==='set'?'List the outcomes, separated by commas.':spec.kind==='coordinates'||spec.kind==='points'?'Enter x first, then y for each point.':spec.kind==='ratio'?'Enter each part of the ratio.':spec.kind==='expression'?'Type your expression. Use * for multiply, / for divide and ^ for powers.':spec.kind==='list'?'Enter the values in the requested order.':'Type your answer.';
 function submit(e:React.FormEvent){e.preventDefault();const fields=alternate?[values[0]]:values;if(fields.some(v=>!v?.trim())){setError('Fill in each answer box.');return;}if(numeric&&fields.some(v=>scalarAnswer(count===1?stripAnswerUnit(spec,v):v)===null)){setError('Enter a valid number in each box.');return;}if(spec.kind==='fraction'&&!alternate&&(!/^-?\d+$/.test(values[0].trim())||!/^\d+$/.test(values[1].trim())||Number(values[1])===0)){setError('Use a whole-number numerator and a positive, non-zero denominator.');return;}const response=fields.join(alternate?'':spec.kind==='ratio'?':':spec.kind==='fraction'?'/':', ');setError('');const advice=level7SimplificationTip(spec,response);setTip(advice);setShowHow(false);if(advice?.required)return;onAnswer(markLevel7Answer(spec,response),response);}
 return <form onSubmit={submit} className="mt-6 rounded-2xl border-2 bg-white p-5 text-slate-900" style={{borderColor:t.borderRing}}>
 <div className="flex items-center justify-between gap-3"><p className="font-semibold">{help}</p><ReadAloudBtn text={`${help} ${labels.join('. ')}.${spec.unit?` Unit: ${spec.unit}.`:''}`} label="Read answer instructions"/></div>
 <div className="mt-5 flex flex-wrap items-center gap-4"><div className={spec.kind==='fraction'&&!alternate?'flex w-44 flex-col gap-2':'flex flex-wrap items-center gap-3'}>
 {Array.from({length:alternate?1:count},(_,i)=><div key={i} className="flex items-center gap-3">
 {i>0&&spec.kind==='ratio'&&<span className="text-3xl">:</span>}
 <label className={`flex flex-col gap-1 ${spec.kind==='fraction'&&i===1&&!alternate?'border-t-2 border-slate-800 pt-2':''}`}><span className="text-sm">{alternate?'Decimal answer':labels[i]??`Value ${i+1}`}</span><input aria-label={alternate?'Decimal answer':labels[i]} type="text" inputMode={numeric?'text':undefined} autoComplete="off" disabled={disabled} value={values[i]??''} onChange={e=>{setValues(xs=>xs.map((x,j)=>i===j?e.target.value:x));setError('');setTip(null);setShowHow(false);onEditing?.();}} className={`min-h-14 rounded-xl border-2 p-3 text-center text-2xl font-bold outline-offset-2 ${spec.kind==='expression'||spec.kind==='set'?'w-72 max-w-full':spec.kind==='list'?'w-24':'w-40'}`} style={{borderColor:t.ctaFrom,outlineColor:t.ctaFrom}}/></label></div>)}
 </div>{spec.unit&&<span className="text-xl font-bold">{spec.unit}</span>}</div>
 {spec.kind==='fraction'&&!spec.format&&<button type="button" disabled={disabled} className="mt-3 underline" onClick={()=>{setAlternate(!alternate);setValues(Array(count).fill(''));setError('');setTip(null);setShowHow(false);onEditing?.();}}>{alternate?'Use fraction boxes':'Use a decimal instead'}</button>}
 {tip&&<aside className="mt-4 rounded-xl border p-4" style={{borderColor:t.ctaFrom,background:t.surfaceTint}}>
 <div className="flex items-start justify-between gap-3"><p role="status" className="font-semibold">{tip.required?'You have the right value. Can you simplify your answer?':`Correct! ${tip.original} simplifies to ${tip.simplified}.`}</p><ReadAloudBtn text={tip.required?'You have the right value. Can you simplify your answer?':`Correct. ${tip.original} simplifies to ${tip.simplified}.`} label="Read simplification tip"/></div>
 <button type="button" aria-expanded={showHow} className="mt-2 rounded px-2 py-1 font-bold underline focus-visible:outline-2" style={{outlineColor:t.ctaFrom}} onClick={()=>setShowHow(v=>!v)}>{showHow?'Hide steps':'Show me how'}</button>
 {showHow&&<div className="mt-2 flex items-start justify-between gap-3"><p>{tip.instruction} {tip.required&&`Simplest form: ${tip.simplified}.`}</p><ReadAloudBtn text={`${tip.instruction} Simplest form: ${tip.simplified}.`} label="Read simplification steps"/></div>}
 </aside>}
 {error&&<p role="alert" className="mt-3 text-red-700">{error}</p>}
 <button type="submit" disabled={disabled} className="mt-5 min-h-12 rounded-xl px-6 py-3 font-bold text-white disabled:opacity-50" style={{background:t.ctaFrom}}>Check answer</button>
 </form>;
}
