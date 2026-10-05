'use client';
import {useState} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {LessonPlane} from '@/components/starpath/Space7Plane';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {markLevel7Answer,type Level7Answer} from '@/lib/level7-answer';

type P={x:number;y:number};
const parse=(s:string):P[]=>[...s.matchAll(/\((-?\d+),\s*(-?\d+)\)/g)].map(m=>({x:+m[1],y:+m[2]}));

/** The student places each corner of the image on the grid in order; the program marks every corner. */
export default function Level7PlaceInput({spec,onAnswer,realm='space',disabled=false,initialValue='',onEditing}:{spec:Level7Answer;onAnswer:(correct:boolean,response:string)=>void;realm?:string;disabled?:boolean;initialValue?:string;onEditing?:()=>void}){
 const t=getRealmTheme(realm),plane=spec.place!,names=plane.labels.map(l=>`${l}′`),n=plane.shape.length;
 const [placed,setPlaced]=useState<P[]>(()=>{const v=parse(initialValue);return v.length===n?v:[];});
 const [error,setError]=useState('');
 const help=`Click the grid to place ${names.slice(0,-1).join(', ')} and ${names.at(-1)}, in that order. Click a placed point to remove it.`;
 const pick=(p:P)=>{setError('');onEditing?.();setPlaced(xs=>xs.some(q=>q.x===p.x&&q.y===p.y)?xs.filter(q=>q.x!==p.x||q.y!==p.y):xs.length<n?[...xs,p]:xs);};
 function submit(e:React.FormEvent){e.preventDefault();if(placed.length<n){setError(`Place all ${n} corners before you check.`);return;}const response=placed.map(p=>`(${p.x}, ${p.y})`).join('; ');onAnswer(markLevel7Answer(spec,response),response);}
 const next=placed.length<n?names[placed.length]:null;
 return <form onSubmit={submit} className="mt-6 max-w-2xl rounded-2xl border-2 bg-white p-4 text-slate-900" style={{borderColor:t.borderRing}} data-place-input>
  <div className="flex items-start justify-between gap-3"><p className="font-semibold">{help}</p><ReadAloudBtn text={help} label="Read answer instructions"/></div>
  <LessonPlane spec={plane} placed={placed} onPick={pick} disabled={disabled}/>
  <p className="text-center font-bold" aria-live="polite">{next?`Next: place ${next}`:'All corners placed.'} {placed.length>0&&<span className="font-normal">({placed.map((p,i)=>`${names[i]} (${p.x}, ${p.y})`).join(', ')})</span>}</p>
  {error&&<p role="alert" className="mt-2 text-red-700">{error}</p>}
  <div className="mt-3 flex flex-wrap gap-3">
   <button type="submit" disabled={disabled} className="min-h-12 rounded-xl px-6 py-3 font-bold text-white disabled:opacity-50" style={{background:t.ctaFrom}}>Check answer</button>
   <button type="button" disabled={disabled||!placed.length} onClick={()=>{setPlaced(xs=>xs.slice(0,-1));onEditing?.();}} className="min-h-12 rounded-xl border-2 px-4 font-bold disabled:opacity-40" style={{borderColor:t.ctaFrom,color:t.ctaFrom}}>Undo last</button>
  </div>
 </form>;
}
