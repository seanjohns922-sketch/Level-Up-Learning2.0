"use client";
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {RulerWithObject} from '@/components/measurelands/MeasurelandsRulerCard';
import {MeasurelandsScale} from '@/components/measurelands/MeasurelandsScale';
import {MeasurelandsJug} from '@/components/measurelands/MeasurelandsJug';
import {MeasurelandsThermometer} from '@/components/measurelands/MeasurelandsThermometer';
import {Tiles} from '@/components/measurelands/MeasurelandsAreaCard';
import {Clock3,ArrowRight} from 'lucide-react';
import type {Measurement4Visual} from '@/data/assessments/revisions/year4MeasurementFiveForms';
export function measurement4Speech(v:Measurement4Visual){
 let extra=(v.labels??[]).join('. ');const [w,h,a,b]=v.values;
 if(v.task==='interval')extra=`Scale labels: zero and ${w} millilitres.`;
 if(v.task==='ruler')extra='Pencil. Ruler labels: zero to fifteen centimetres.';
 if(v.task==='scale')extra='A book rests on the scale. Scale labels: zero to nine hundred grams, in steps of one hundred grams.';
 if(v.task==='jug')extra='Scale labels: zero, zero point five, one, one point five and two litres.';
 if(v.task==='thermometer')extra='Scale labels: zero, ten, twenty, thirty, forty and fifty degrees Celsius.';
 if(v.task==='perimeter')extra=(v.lShape?[w-a,h-b,a,b,w,h]:[w,h,w,h]).map(n=>`${n} metres`).join('. ');
 if(v.task==='angle'&&v.compareArms)extra='A. B.';
 return `${v.description} ${extra}`.trim();
}
function Angle({degrees,rotation=0,length=112}:{degrees:number;rotation?:number;length?:number}){
 const r=degrees*Math.PI/180,point=(radius:number)=>`${160+radius*Math.cos(r)} ${160-radius*Math.sin(r)}`;
 return <svg viewBox="0 0 320 310" className="mx-auto w-full max-w-xs" aria-hidden="true"><g transform={`rotate(${rotation} 160 160)`}><path d={`M160 160L225 160A65 65 0 ${degrees>180?1:0} 0 ${point(65)}Z`} fill="#b790d0" fillOpacity=".65"/><path d={`M${160+length} 160H160L${point(length)}`} fill="none" stroke="#725027" strokeWidth="6" strokeLinecap="round"/><path d={`M225 160A65 65 0 ${degrees>180?1:0} 0 ${point(65)}`} fill="none" stroke="#754596" strokeWidth="3"/><circle cx="160" cy="160" r="5" fill="#b8893a"/></g></svg>;
}
function Perimeter({v}:{v:Measurement4Visual}){
 const [w,h,a,b]=v.values,s=32,x=70,y=50;
 const points=v.lShape?[[0,0],[w-a,0],[w-a,h-b],[w,h-b],[w,h],[0,h]]:[[0,0],[w,0],[w,h],[0,h]];
 return <svg viewBox={`0 0 ${w*s+140} ${h*s+110}`} className="mx-auto max-h-80 w-full max-w-xl" role="img" aria-label={measurement4Speech(v)}><polygon points={points.map(([px,py])=>`${x+px*s},${y+py*s}`).join(' ')} fill="#d3e9bf" stroke="#638447" strokeWidth="4"/>{points.map(([px,py],i)=>{const[nx,ny]=points[(i+1)%points.length];const horizontal=py===ny;const distance=Math.abs(nx-px)+Math.abs(ny-py);return <text key={i} x={x+(px+nx)*s/2+(horizontal?0:ny>py?20:-20)} y={y+(py+ny)*s/2+(horizontal?(nx>px?-16:30):5)} textAnchor={horizontal?'middle':ny>py?'start':'end'} fontSize="19" fontWeight="bold" fill="#513323">{distance} m</text>;})}</svg>;
}
function Grid({w,h,half=false}:{w:number;h:number;half?:boolean}){
 const cells:Array<[number,number]>=Array.from({length:w*h},(_,i)=>[i%w,Math.floor(i/w)]);
 if(!half)return <Tiles cells={cells} gridW={w} gridH={h} filled={new Set(cells.map(c=>c.join(',')))} outline size={w*40}/>;
 return <svg viewBox={`0 0 ${w*44+10} ${h*44+10}`} className="mx-auto w-full max-w-md" role="img" aria-label="A grid with shaded whole squares and two shaded half squares.">{cells.map(([c,r])=><g key={`${c},${r}`} transform={`translate(${5+c*44} ${5+r*44})`}><rect width="44" height="44" fill={c<w-1?'#b38acf':'white'} stroke="#754596" strokeWidth="1.5"/>{c===w-1?<path d="M0 0L44 44H0Z" fill="#b38acf" stroke="#754596" strokeWidth="1.5"/>:null}</g>)}</svg>;
}
export default function Year4MeasurementAssessmentVisual({visual:v}:{visual:Measurement4Visual}){
 const n=v.values;let content;
 if(v.task==='ruler')content=<div className="mx-auto max-w-3xl"><RulerWithObject rulerCm={15} precision objectShape="pencil" object={{label:'Pencil',icon:'✏️',lengthCm:n[0],startCm:v.start}}/></div>;
 else if(v.task==='scale'||v.task==='jug'||v.task==='thermometer')content=<div role="img" aria-label={v.description}><div aria-hidden="true">{v.task==='scale'?<MeasurelandsScale value={n[0]} unit="g" max={1000} majorStep={100} minorStep={50} size={300} object={{label:'Book',emoji:'📕',imageSrc:'/images/measurelands/week2-3d/book.png'}}/>:v.task==='jug'?<MeasurelandsJug value={n[0]} unit="L" max={2} majorStep={.5} minorStep={.25} size={270}/>:<MeasurelandsThermometer value={n[0]} max={50} size={100}/>}</div></div>;
 else if(v.task==='interval')content=<svg viewBox="0 0 620 145" className="mx-auto w-full max-w-2xl" role="img" aria-label={measurement4Speech(v)}><path d="M60 65H560" stroke="#513323" strokeWidth="4"/>{Array.from({length:n[1]+1},(_,i)=><line key={i} x1={60+500*i/n[1]} x2={60+500*i/n[1]} y1="45" y2="85" stroke="#513323" strokeWidth="3"/>)}<text x="60" y="120" textAnchor="middle" fontSize="22" fill="#513323">0 mL</text><text x="560" y="120" textAnchor="middle" fontSize="22" fill="#513323">{n[0]} mL</text></svg>;
 else if(v.task==='perimeter')content=<Perimeter v={v}/>;
 else if(v.task==='area'&&v.areaCells)content=<svg viewBox={`0 0 ${n[0]*44+10} ${n[1]*44+10}`} className="mx-auto w-full max-w-md" role="img" aria-label="An irregular shaded shape on a square grid.">{Array.from({length:n[0]*n[1]},(_,i)=><rect key={i} x={5+(i%n[0])*44} y={5+Math.floor(i/n[0])*44} width="44" height="44" fill="white" stroke="#c3b7cc"/>)}{v.areaCells.map(([c,r,part])=><g key={`${c},${r}`} transform={`translate(${5+c*44} ${5+r*44})`}>{part==='full'?<rect width="44" height="44" fill="#b38acf" stroke="#754596"/>:<path d={{ne:'M0 0H44V44Z',nw:'M0 0H44L0 44Z',se:'M44 0V44H0Z',sw:'M0 0V44H44Z'}[part]} fill="#b38acf" stroke="#754596"/>}</g>)}</svg>;
 else if(v.task==='area')content=n.length===4?<div className="flex flex-wrap justify-center gap-7">{[0,2].map((i)=><div key={i} className="rounded-2xl border border-amber-200 bg-white p-3"><p className="mb-3 text-center text-xl font-bold text-amber-950">{v.labels![i/2]}</p><Grid w={n[i]} h={n[i+1]}/></div>)}</div>:<Grid w={n[0]} h={n[1]} half={v.halfCells}/>;
 else if(v.task==='angle')content=<div className="flex flex-wrap justify-center gap-5">{(v.compareArms?['A','B']:['A']).map((label,i)=><div key={label} className="w-72 rounded-2xl border border-amber-200 bg-white"><p className="pt-3 text-center text-xl font-black text-amber-950">{label}</p><Angle degrees={n[0]} rotation={v.rotation} length={v.compareArms&&i===0?80:120}/></div>)}</div>;
 else content=<div className="flex flex-wrap items-center justify-center gap-4">{v.labels!.map((label,i)=><div key={i} className="flex items-center gap-4">{i>0?<ArrowRight aria-hidden="true" className="text-amber-700"/>:null}<div className="flex min-w-48 flex-col items-center gap-5 rounded-2xl border border-amber-200 bg-white p-6"><Clock3 aria-hidden="true" className="h-10 w-10 text-amber-700"/><span className="text-center text-2xl font-black text-amber-950">{label}</span></div></div>)}</div>;
 return <div className="w-full rounded-2xl border-2 border-amber-300 bg-[#fffaf0] p-4 sm:p-6"><div className="mb-4 flex justify-end"><ReadAloudBtn text={measurement4Speech(v)} size="sm" label="Read diagram" className="!border-amber-600 !bg-[#fffaf0] !text-amber-900"/></div><p className="mb-5 text-center text-lg font-bold text-amber-950">{v.description}</p>{content}</div>;
}
