'use client';
import {useState} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {ShapeCard,SorterFlow,FamilyTree,questionText} from '@/components/starpath/Space7Sorter';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {markLevel7Answer,runSorter,sorterSlots,sorterShapeSpeech,SORTER7_TEMPLATES,type Level7Answer} from '@/lib/level7-answer';

/** Sort drawn shapes into groups, build or fix a sorter flowchart, or fill the family tree. The program marks it. */
export default function Level7SorterInput({spec,onAnswer,realm='space',disabled=false,initialValue='',onEditing}:{spec:Level7Answer;onAnswer:(correct:boolean,response:string)=>void;realm?:string;disabled?:boolean;initialValue?:string;onEditing?:()=>void}){
 const t=getRealmTheme(realm),s=spec.sorter!;
 const template=s.template?SORTER7_TEMPLATES[s.template]:undefined,slots=template?sorterSlots(template):undefined;
 const size=s.mode==='sort'?s.shapes.length:s.mode==='tree'?6:slots!.count;
 const [values,setValues]=useState<string[]>(()=>{const v=initialValue?initialValue.split('|'):[];return v.length===size?v:s.start?.slice()??Array(size).fill('');});
 const [active,setActive]=useState<number|null>(null),[ran,setRan]=useState(false),[error,setError]=useState('');
 const editable=Array.from({length:size},(_,i)=>!s.locked?.[i]);
 const set=(i:number,v:string)=>{setValues(xs=>xs.map((x,j)=>j===i?v:s.mode==='tree'&&x===v?'':x));setRan(false);setError('');onEditing?.();};
 const help=s.mode==='sort'?'Choose a group for every shape. Tick marks show equal sides, matching arcs show equal angles, a small square is a right angle and arrowheads show parallel sides.'
  :s.mode==='tree'?'Click a box, then choose the family that belongs there. Each family has every property of the families joined above it.'
  :'Click a box in the sorter, then choose a question or group for it. Press Run to test your sorter on the shapes, then check your answer.';
 function submit(e:React.FormEvent){e.preventDefault();if(values.some((v,i)=>!v&&editable[i])){setError(s.mode==='sort'?'Choose a group for every shape first.':'Fill every box first.');return;}onAnswer(markLevel7Answer(spec,values.join('|')),values.join('|'));}
 const tiles=active===null?[]:s.mode==='tree'?['Trapezium','Parallelogram','Kite','Rectangle','Rhombus','Square']:slots!.questions.includes(active)?s.questions!:s.outputs!;
 const button='min-h-10 rounded-lg border-2 px-3 py-1.5 text-sm font-bold disabled:opacity-40';
 return <form onSubmit={submit} className="mt-6 max-w-4xl rounded-2xl border-2 bg-white p-4 text-slate-900" style={{borderColor:t.borderRing}} data-sorter-input={s.mode}>
  <div className="flex items-start justify-between gap-3"><p className="font-semibold">{help}</p><ReadAloudBtn text={`${help} ${s.shapes.map(sorterShapeSpeech).join(' ')}`} label="Read answer instructions"/></div>
  {s.mode==='sort'&&s.flow&&<div className="mx-auto mt-3 max-w-xl"><p className="mb-1 text-center text-sm font-bold">{s.flow.title}</p><SorterFlow node={SORTER7_TEMPLATES[s.flow.template]} values={s.flow.values}/></div>}
  {s.mode==='sort'&&<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{s.shapes.map((sh,i)=><ShapeCard key={sh.id} shape={sh} caption={<div className="mt-1 flex w-full flex-wrap justify-center gap-1">{s.bins!.map(b=><button key={b} type="button" disabled={disabled} aria-pressed={values[i]===b} aria-label={`Shape ${sh.id}: ${b}`} onClick={()=>set(i,b)} className="rounded-md border px-1.5 py-1 text-xs font-semibold" style={values[i]===b?{background:t.ctaFrom,color:'white',borderColor:t.ctaFrom}:{borderColor:t.borderRing}}>{b}</button>)}</div>}/>)}</div>}
  {s.mode==='flow'&&<div className="mt-3"><SorterFlow node={template!} values={values} editable={editable} active={active} onSlot={disabled?undefined:i=>setActive(i)}/></div>}
  {s.mode==='tree'&&<div className="mt-3"><FamilyTree values={values} active={active} editable={editable} onSlot={disabled?undefined:i=>{if(editable[i])setActive(i);}}/></div>}
  {active!==null&&s.mode!=='sort'&&<div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3" data-tiles>
   <p className="mb-2 text-sm font-bold">{s.mode==='tree'?`Box ${active+1}: choose a family`:slots!.questions.includes(active)?'Choose a question for this box':'Choose a group for this box'}</p>
   <div className="flex flex-wrap gap-2">{tiles.map(v=><button key={v} type="button" disabled={disabled} onClick={()=>{set(active,v);setActive(null);}} className={button} style={{borderColor:t.ctaFrom,color:t.ctaFrom}}>{s.mode==='flow'?questionText(v):v}</button>)}</div>
  </div>}
  {s.mode==='flow'&&<div className="mt-3"><button type="button" disabled={disabled} onClick={()=>setRan(true)} className={button} style={{borderColor:t.ctaFrom,color:t.ctaFrom}}>▶ Run the test shapes</button>
   <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{s.shapes.map((sh,i)=>{const out=ran?runSorter(template!,values,sh.points):null,ok=out===s.target[i];return <ShapeCard key={sh.id} shape={sh} caption={<p className="text-center text-sm font-semibold" aria-live="polite">{ran?<>{out??'No output'} <span className={ok?'text-emerald-700':'text-red-700'}>{ok?'✓':`✗ (should be ${s.target[i]})`}</span></>:<>Should reach: {s.target[i]}</>}</p>}/>;})}</div>
  </div>}
  {error&&<p role="alert" className="mt-3 text-red-700">{error}</p>}
  <button type="submit" disabled={disabled} className="mt-4 min-h-12 rounded-xl px-6 py-3 font-bold text-white disabled:opacity-50" style={{background:t.ctaFrom}}>Check answer</button>
 </form>;
}
