'use client';
import {useState} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {CubeModel} from '@/components/starpath/Level3StarpathAssessmentCard';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {markLevel7Answer,BUILD_MAX_HEIGHT,type Level7Answer} from '@/lib/level7-answer';

const HELP='Use + and − to set the number of cubes in each stack. Your model is drawn as you build.';

/** Builds a cube model on a 2 by 3 height plan; the program marks it against the instructions. */
export default function Level7BuildInput({spec,onAnswer,realm='space',disabled=false,initialValue='',onEditing}:{spec:Level7Answer;onAnswer:(correct:boolean,response:string)=>void;realm?:string;disabled?:boolean;initialValue?:string;onEditing?:()=>void}){
 const t=getRealmTheme(realm);
 const [heights,setHeights]=useState<number[]>(()=>{const v=initialValue.split(',').map(Number);return v.length===6&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=BUILD_MAX_HEIGHT)?v:[0,0,0,0,0,0];});
 const [error,setError]=useState('');
 const total=heights.reduce((s,n)=>s+n,0);
 const change=(i:number,step:number)=>{setHeights(xs=>xs.map((x,j)=>j===i?Math.max(0,Math.min(BUILD_MAX_HEIGHT,x+step)):x));setError('');onEditing?.();};
 function submit(e:React.FormEvent){e.preventDefault();if(!total){setError('Add some cubes before you check.');return;}const response=heights.join(',');setError('');onAnswer(markLevel7Answer(spec,response),response);}
 const place=(i:number)=>`${i<3?'back':'front'} row, column ${i%3+1}`;
 const stepButton='grid h-8 w-8 place-items-center rounded-lg border-2 text-xl font-black leading-none disabled:opacity-30';
 return <form onSubmit={submit} className="mt-6 max-w-2xl rounded-2xl border-2 bg-white p-5 text-slate-900" style={{borderColor:t.borderRing}} data-build-input>
  <div className="flex items-start justify-between gap-3"><p className="font-semibold">{HELP}</p><ReadAloudBtn text={`${HELP} The grid has a back row and a front row, each with three stacks, left to right.`} label="Read answer instructions"/></div>
  <div className="mt-4 flex flex-wrap items-center gap-4">
   <figure className="m-0">
    <figcaption className="mb-1 text-sm font-bold">Height plan · Back</figcaption>
    <div className="grid grid-cols-3 gap-1.5">{heights.map((h,i)=><div key={i} className="flex items-center gap-1 rounded-xl border-2 p-1" style={{borderColor:t.ctaFrom}}>
     <button type="button" aria-label={`Remove a cube from the ${place(i)}`} disabled={disabled||h<=0} onClick={()=>change(i,-1)} className={stepButton} style={{borderColor:t.ctaFrom,color:t.ctaFrom}}>−</button>
     <span className="w-6 text-center text-2xl font-black tabular-nums" aria-live="polite" aria-label={`${place(i)}: ${h} ${h===1?'cube':'cubes'}`}>{h}</span>
     <button type="button" aria-label={`Add a cube to the ${place(i)}`} disabled={disabled||h>=BUILD_MAX_HEIGHT} onClick={()=>change(i,1)} className={stepButton} style={{borderColor:t.ctaFrom,color:t.ctaFrom}}>+</button>
    </div>)}</div>
    <p className="mt-1 text-sm">Front · Left → Right</p>
   </figure>
   <figure className="m-0 flex-1 text-center [&_svg]:mx-auto [&_svg]:max-h-40">
    <CubeModel model={{cols:3,rows:2,height:Math.max(1,...heights)}} heights={heights} showColumnIds={false} label={`Your model: ${total} cubes`}/>
    <figcaption className="text-sm font-bold">Your model · {total} {total===1?'cube':'cubes'}</figcaption>
   </figure>
  </div>
  {error&&<p role="alert" className="mt-3 text-red-700">{error}</p>}
  <button type="submit" disabled={disabled} className="mt-4 min-h-12 rounded-xl px-6 py-3 font-bold text-white disabled:opacity-50" style={{background:t.ctaFrom}}>Check answer</button>
 </form>;
}
