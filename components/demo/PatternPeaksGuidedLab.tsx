'use client';
import {useState} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import type {PPItem,PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
import pp from './PatternPeaksFiveForms.module.css';
function Box({row,scale}:{row:number[];scale:number}){
 const [l,w,h]=row, left=38, bottom=144, width=l*scale, height=h*scale,dx=w*scale*.65,dy=w*scale*.45;
 return <svg viewBox='0 0 240 190' role='img' aria-label={`Box: length ${l}, width ${w}, height ${h} centimetres`}>
 <path d={`M${left} ${bottom}h${width}v${-height}h${-width}Z`} fill='#c4b5fd' stroke='#65439b' strokeWidth='2'/>
 <path d={`M${left} ${bottom-height}l${dx} ${-dy}h${width}l${-dx} ${dy}Z`} fill='#ede9fe' stroke='#65439b' strokeWidth='2'/>
 <path d={`M${left+width} ${bottom}l${dx} ${-dy}v${-height}l${-dx} ${dy}Z`} fill='#a78bfa' stroke='#65439b' strokeWidth='2'/>
 <text x={left+width/2} y={bottom+22} textAnchor='middle' fontSize='13'>L: {l} cm</text><text x={left+width+dx+6} y={bottom-height/2-dy/2} fontSize='13'>H: {h}</text><text x={left+width/2+dx} y={bottom-height-dy-9} textAnchor='middle' fontSize='13'>W: {w} cm</text>
 </svg>;
}
export default function PatternPeaksGuidedLab({item,response,update}:{item:PPItem;response:PPResponse;update:(r:PPResponse)=>void}){
 const lab=item.lab!,volume=lab.kind==='volume',names=volume?['Length','Width','Height']:['Speed','Time'];
 const baseline=lab.initial;
 // Keep the dimensions named as fixed out of the editable controls.
 const editable=item.slot===18?[0,1]:item.slot===24?[1]:[volume?2:1];
 const preset=item.slot===24?[baseline[0]*2,baseline[1],baseline[2]]:baseline;
 const runs=response.experiments??[],saved=runs.filter(row=>row.join(',')!==baseline.join(',')).at(-1);
 const [values,setValues]=useState((saved??preset).map(String));
 const row=values.map(Number),valid=values.every(v=>/^\d+$/.test(v)&&Number(v)>0&&Number(v)<=100);
 const calculated=runs.some(r=>r.join(',')===row.join(','));
 const product=(r:number[])=>r.reduce((a,b)=>a*b,1);
 const scale=volume?Math.min(14,130/Math.max(baseline[0]+baseline[1]*.65,row[0]+row[1]*.65),100/Math.max(baseline[2]+baseline[1]*.45,row[2]+row[1]*.45)):1;
 const describe=(r:number[],show:boolean)=>`${names.map((n,i)=>`${n}: ${r[i]} ${volume?'centimetres':i===0?'kilometres per hour':'hours'}`).join('. ')}. ${show?`${volume?'Volume':'Distance'}: ${product(r)} ${volume?'cubic centimetres':'kilometres'}.`:'Calculate to see the result.'}`;
 const speech=`Compare the original and your change. Original: ${describe(baseline,true)} Your change: ${valid?describe(row,calculated):'Enter whole numbers from 1 to 100.'}`;
 return <div className={pp.builder}>
 <div className={pp.comparison}>
 {[baseline,valid?row:preset].map((r,i)=><div className={pp.compareCard} key={i}><strong>{i?'Your change':'Original'}</strong>{volume?<Box row={r} scale={Number.isFinite(scale)?scale:10}/>:<div className={pp.journey}><span aria-hidden='true'>🚲</span><p>{r[0]} km/h × {r[1]} hours</p></div>}<p>{i&&!calculated?'Calculate to see':`${product(r)} ${volume?'cm³':'km'}`}</p></div>)}
 </div>
 <ReadAloudBtn label='Read comparison' text={speech}/>
 <p className={pp.graphCaption}>{volume?'Volume = length × width × height.':'Distance = speed × time.'}</p>
 <div className={pp.labControls}>{editable.map(i=><label key={i}>{names[i]} ({volume?'cm':'hours'})<input aria-label={`${names[i]} (${volume?'cm':'hours'})`} inputMode='numeric' value={values[i]} onChange={e=>setValues(old=>old.map((v,j)=>i===j?e.target.value:v))}/></label>)}</div>
 <button disabled={!valid} onClick={()=>update({...response,skipped:false,experiments:[baseline,...runs.filter(r=>r.join(',')!==baseline.join(',')&&r.join(',')!==row.join(',')),row]})}>Calculate</button>
 <p className={pp.graphCaption}>{lab.required.every(r=>runs.some(x=>x.join(',')===r.join(',')))?'Comparison recorded. Choose or enter your answer.':'Make the change in the question, then calculate.'}</p>
 </div>;
}
