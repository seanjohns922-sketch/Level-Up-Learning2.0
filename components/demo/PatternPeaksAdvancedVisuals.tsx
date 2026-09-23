'use client';
import {useState} from 'react';
import type {PPItem,PPResponse,PPVisual} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import pp from './PatternPeaksFiveForms.module.css';
export function PatternGraph({v,select}:{v:Extract<PPVisual,{kind:'graph'}>;select?:(x:number,y:number)=>void}){
 const left=55,top=30,width=310,height=245;
 const x=(n:number)=>left+(n-v.xTicks[0])/(v.xTicks.at(-1)!-v.xTicks[0])*width;
 const y=(n:number)=>top+height-(n-v.yTicks[0])/(v.yTicks.at(-1)!-v.yTicks[0])*height;
 return <div><svg viewBox='0 0 400 335' className={pp.graph} role={select?'group':'img'} aria-label={`${v.xLabel} against ${v.yLabel}`}>
 {v.xTicks.map(n=><g key={n}><line x1={x(n)} x2={x(n)} y1={top} y2={top+height} stroke='#ddd'/><text x={x(n)} y={top+height+18} textAnchor='middle' fontSize='12'>{n}</text></g>)}
 {v.yTicks.map(n=><g key={n}><line x1={left} x2={left+width} y1={y(n)} y2={y(n)} stroke='#ddd'/><text x={left-9} y={y(n)+4} textAnchor='end' fontSize='12'>{n}</text></g>)}
 <path d={`M${left} ${top}V${top+height}H${left+width}`} fill='none' stroke='currentColor' strokeWidth='2'/>
 {!select&&<polyline points={v.points.map(([a,b])=>`${x(a)},${y(b)}`).join(' ')} fill='none' stroke='#7551b2' strokeWidth='3'/>}
 {v.points.map(([a,b])=><circle key={`${a},${b}`} cx={x(a)} cy={y(b)} r='5' fill='#7551b2'/>)}
 {select&&v.xTicks.flatMap(a=>v.yTicks.map(b=><circle key={`${a},${b}`} data-pp-point={`${a},${b}`} cx={x(a)} cy={y(b)} r='9' fill='transparent' role='button' tabIndex={0} aria-label={`Plot or remove (${a}, ${b})`} onClick={()=>select(a,b)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(a,b);}}}/>))}
 <text x='210' y='320' textAnchor='middle' fontSize='14'>{v.xLabel}</text><text transform='translate(15 155) rotate(-90)' textAnchor='middle' fontSize='14'>{v.yLabel}</text>
 </svg><p className={pp.graphCaption}>{v.caption}</p>{v.source&&<a href={v.source} target='_blank' rel='noreferrer'>Source: Australian Bureau of Statistics</a>}</div>;
}
export function PointPlotter({response,update}:{response:PPResponse;update:(r:PPResponse)=>void}){
 const [a,setA]=useState(''),[b,setB]=useState('');const points=response.points??[];
 const toggle=(x:number,y:number)=>update({...response,skipped:false,points:points.some(p=>p[0]===x&&p[1]===y)?points.filter(p=>p[0]!==x||p[1]!==y):[...points,[x,y]]});
 const valid=/^\d+$/.test(a)&&/^\d+$/.test(b)&&Number(a)<=6&&Number(b)<=12;
 return <div className={pp.builder}><PatternGraph v={{kind:'graph',points,xTicks:[0,1,2,3,4,5,6],yTicks:Array.from({length:13},(_,i)=>i),xLabel:'x',yLabel:'y',caption:'Your plotted points. Horizontal coordinate first.'}} select={toggle}/><ReadAloudBtn label='Read plotted points' text={`Horizontal coordinate first. Selected points: ${points.map(p=>`(${p.join(', ')})`).join('; ')||'none'}.`}/><div className={pp.tools}><label>x <input aria-label='Plot x' value={a} onChange={e=>setA(e.target.value)} inputMode='numeric'/></label><label>y <input aria-label='Plot y' value={b} onChange={e=>setB(e.target.value)} inputMode='numeric'/></label></div><button disabled={!valid} onClick={()=>toggle(Number(a),Number(b))}>Add or remove point</button><button onClick={()=>update({...response,points:[],skipped:false})}>Clear points</button></div>;
}
export function FormulaLab({item,response,update}:{item:PPItem;response:PPResponse;update:(r:PPResponse)=>void}){
 const lab=item.lab!,names=lab.kind==='volume'?['Length (cm)','Width (cm)','Height (cm)']:['Speed (km/h)','Time (hours)'];
 const [values,setValues]=useState(lab.initial.map(String));const valid=values.every(v=>/^\d+$/.test(v)&&Number(v)>=1&&Number(v)<=100);
 const runs=response.experiments??[],describe=(row:number[])=>`${names.map((label,i)=>`${label}: ${row[i]}`).join(', ')}. ${lab.kind==='volume'?'Volume':'Distance'}: ${row.reduce((p,n)=>p*n,1)} ${lab.kind==='volume'?'cubic centimetres':'kilometres'}.`;
 return <div className={pp.builder}><h4>Formula lab</h4><p>Change values, then calculate. Start with the given settings and test the change in the question.</p><ReadAloudBtn label='Read formula lab' text={`Change values, then calculate. Start with the given settings and test the change in the question. ${names.map((label,i)=>`${label}: ${values[i]}`).join('. ')}`}/>{names.map((label,i)=><label key={label}>{label}<input aria-label={label} value={values[i]} inputMode='numeric' onChange={e=>setValues(old=>old.map((v,j)=>j===i?e.target.value:v))}/></label>)}<button disabled={!valid} onClick={()=>{const row=values.map(Number);update({...response,skipped:false,experiments:[...runs.filter(r=>r.join(',')!==row.join(',')),row]});}}>Calculate</button>{runs.length>0&&<><ReadAloudBtn label='Read experiment results' text={runs.map(describe).join(' ')}/><ul>{runs.map(row=><li key={row.join(',')}>{describe(row)}</li>)}</ul></>}<p>{item.lab!.required.every(row=>runs.some(run=>run.join(',')===row.join(',')))?'Required comparison recorded.':'Test the original settings and the change requested.'}</p></div>;
}
