"use client";
import type {ReactNode} from 'react';
import {Globe2} from 'lucide-react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import Year7ContextArt from './Year7ContextArt';
import {RectPrism,TriPrism} from './Year7MeasurementAssessmentVisual';
import {DimensionedArea,TravelScene} from './Measurement5Scenes';
import type {Measurement8Visual} from '@/data/assessments/revisions/year8MeasurementFiveForms';
const ink='#583714',line='#8051a8',fill='#e9daf3';
const txt=(x:number,y:number,value:string,anchor:'middle'|'start'|'end'='middle')=><text x={x} y={y} fill={ink} textAnchor={anchor} fontSize="20" fontWeight="700">{value}</text>;
function Frame({children}:{children:ReactNode}){return <svg viewBox="0 0 560 350" aria-hidden="true" style={{width:'100%',maxWidth:650,maxHeight:290,display:'block',margin:'auto'}}>{children}</svg>;}
function NotchedPlan({n}:{n:number[]}){
 const[w,h,cw,ch]=n,s=Math.min(350/w,210/h),x=90,y=50,arm=(w-cw)/2;
 const pts=[[0,0],[arm,0],[arm,ch],[arm+cw,ch],[arm+cw,0],[w,0],[w,h],[0,h]];
 return <Frame><polygon points={pts.map(([a,b])=>`${x+a*s},${y+b*s}`).join(' ')} fill="#d6e8bd" stroke="#58763c" strokeWidth="3"/>{txt(x+arm*s/2,y-15,`${arm} m`)}{txt(x+(w-arm/2)*s,y-15,`${arm} m`)}{txt(x+arm*s+10,y+ch*s/2,`${ch} m`,'start')}{txt(x+(arm+cw)*s-10,y+ch*s/2,`${ch} m`,'end')}{txt(x+w*s/2,y+ch*s-12,`${cw} m`)}{txt(x-16,y+h*s/2,`${h} m`,'end')}{txt(x+w*s+16,y+h*s/2,`${h} m`,'start')}{txt(x+w*s/2,y+h*s+30,`${w} m`)}</Frame>;
}
function House({n}:{n:number[]}){
 const[w,h,r]=n,s=Math.min(330/w,230/(h+r)),left=100,bottom=290,top=bottom-h*s,peak=top-r*s,cx=left+w*s/2;
 return <Frame><path d={`M${left} ${bottom}V${top}L${cx} ${peak}L${left+w*s} ${top}V${bottom}Z`} fill={fill} stroke={line} strokeWidth="3"/><path d={`M${left} ${top}H${left+w*s}M${cx} ${peak}V${top}`} stroke={ink} strokeDasharray="6 5" strokeWidth="2"/><path d={`M${cx} ${top-14}h14v14`} fill="none" stroke={ink}/>{txt(cx,bottom+30,`${w} m`)}{txt(left+w*s+18,(top+bottom)/2,`${h} m`,'start')}<path d={`M${left-20} ${peak}h-8m4 0V${top}m-4 0h8`} stroke={ink} fill="none"/>{txt(left-35,(peak+top)/2+5,`${r} m`,'end')}</Frame>;
}
function RightTriangle({v}:{v:Measurement8Visual}){
 const[a,b,c]=v.values,s=Math.min(290/a,205/b),x=100,y=280,w=a*s,h=b*s;
 const ladder=v.variant==='ladder';
 return <Frame>{ladder?<><path d={`M${x-15} ${y-h-20}V${y+7}H${x+w+20}`} stroke="#a6a29a" strokeWidth="12" fill="none"/><path d={`M${x} ${y-h}L${x+w} ${y}`} stroke="#967343" strokeWidth="12"/>{Array.from({length:8},(_,i)=>{const t=(i+1)/9,px=x+w*t,py=y-h+h*t,len=Math.hypot(w,h);return <path key={i} d={`M${px-h/len*10} ${py+w/len*10}L${px+h/len*10} ${py-w/len*10}`} stroke="#583714" strokeWidth="3"/>;})}</>:<path d={`M${x} ${y}h${w}L${x} ${y-h}Z`} fill={fill} stroke={line} strokeWidth="3"/>}<path d={`M${x} ${y-16}h16v16`} fill="none" stroke={ink} strokeWidth="2"/>{txt(x+w/2,y+32,`${a} ${v.unit}`)}{txt(x-20,y-h/2,v.unknown==='height'?`x ${v.unit}`:`${b} ${v.unit}`,'end')}{txt(x+w/2+28,y-h/2-15,v.unknown==='hypotenuse'?`x ${v.unit}`:`${c} ${v.unit}`,'start')}</Frame>;
}
function Circle({v}:{v:Measurement8Visual}){
 const n=v.values,cx=280,cy=170,r=120,semi=v.variant==='semicircle',ring=v.variant==='ring';
 return <Frame>{semi?<path d={`M${cx-r} ${cy+55}A${r} ${r} 0 0 1 ${cx+r} ${cy+55}Z`} fill={fill} stroke={line} strokeWidth="3"/>:<circle cx={cx} cy={cy} r={r} fill={fill} stroke={line} strokeWidth="3"/>}
 {ring?<><circle cx={cx} cy={cy} r={r*n[1]/n[0]} fill="#fffaf0" stroke={line} strokeWidth="3"/><path d={`M${cx} ${cy}h${r}M${cx} ${cy}v${-r*n[1]/n[0]}`} stroke={ink} strokeWidth="2"/><path d={`M${cx+r/2} ${cy+5}L${cx+r+15} ${cy+90}h35M${cx-5} ${cy-r*n[1]/n[0]/2}L${cx-r-15} ${cy-95}h-35`} stroke={ink} fill="none"/>{txt(cx+r+18,cy+115,`Outer r: ${n[0]} m`)}{txt(cx-r-18,cy-110,`Inner r: ${n[1]} m`)}</>:
 semi?<>{txt(cx,cy+88,`${n[0]} ${v.unit}`)}</>:<><path d={`M${v.variant==='diameter'?cx-r:cx} ${cy}H${cx+r}`} stroke={ink} strokeWidth="3"/>{txt(v.variant==='diameter'?cx:cx+60,cy+32,v.variant==='unknownRadius'?'r = ?':`${n[0]} ${v.unit}`)}</>}
 {!semi&&<circle cx={cx} cy={cy} r="4" fill={ink}/>}</Frame>;
}
function MapRoute({v}:{v:Measurement8Visual}){const two=v.variant==='mapRoute';return <svg viewBox="0 0 440 180" style={{maxWidth:440,width:'100%',maxHeight:160}} aria-hidden="true"><rect x="8" y="8" width="424" height="160" rx="14" fill="#e7eed9"/><path d="M20 140Q110 55 175 110T425 38" fill="none" stroke="#c1dbe6" strokeWidth="22"/><path d={two?'M65 125L215 45L370 125':'M65 125L370 45'} fill="none" stroke="#8051a8" strokeWidth="5"/>{(two?[[65,125,'A'],[215,45,'B'],[370,125,'C']]:[[65,125,'A'],[370,45,'B']]).map(([x,y,label])=><g key={label}><circle cx={Number(x)} cy={Number(y)} r="7" fill="#583714"/>{txt(Number(x),Number(y)-15,String(label))}</g>)}</svg>;}
function WaterFlow(){return <svg viewBox="0 0 440 190" style={{width:'100%',maxWidth:400,maxHeight:180}} aria-hidden="true"><path d="M38 45H150V80" fill="none" stroke="#7b8e94" strokeWidth="24"/><path d="M38 40H150" stroke="#c9d8dd" strokeWidth="6"/><path d="M110 18V43m-20-25h40" stroke="#8051a8" strokeWidth="9" strokeLinecap="round"/><path d="M150 93V132" stroke="#55b5d4" strokeWidth="12" strokeDasharray="6 7"/><path d="M113 132V175H370V63" fill="none" stroke="#526d78" strokeWidth="6"/><path d="M117 148Q160 139 202 148T287 148T366 148V172H117Z" fill="#99d5e8"/><path d="M185 105h88m-15-12 15 12-15 12" fill="none" stroke="#8051a8" strokeWidth="4"/></svg>;}
export function measurement8Speech(v:Measurement8Visual){
 const n=v.values,u=v.unit??'';let detail='';
 if(v.task==='composite'){const[w,h,cw,ch]=n;detail=v.variant==='notch'?`Outer width ${w} metres. Outer height ${h} metres on each side. Each top arm is ${(w-cw)/2} metres. Notch width ${cw} metres. Each inward vertical edge is ${ch} metres.`:`Top edge ${w-cw} metres. Inset vertical edge ${ch} metres. Inset horizontal edge ${cw} metres. Right lower edge ${h-ch} metres. Bottom edge ${w} metres. Left edge ${h} metres.`;}
 if(v.task==='house')detail=`Base width ${n[0]} metres. Rectangular wall height ${n[1]} metres. Gable perpendicular height ${n[2]} metres.`;
 if(v.task==='prism')detail=v.variant==='triangular'?`Triangular end base ${n[0]} ${u}, perpendicular height ${n[1]} ${u}. Prism length ${n[2]} ${u}.`:`Length ${n[0]} ${u}. Width ${n[1]} ${u}. Height ${n[2]} ${u}.`;
 if(v.task==='rightTriangle')detail=`Horizontal side ${n[0]} ${u}. Vertical side ${v.unknown==='height'?'x':n[1]} ${u}. Hypotenuse ${v.unknown==='hypotenuse'?'x':n[2]} ${u}. The square marks the right angle.`;
 if(v.task==='diagonal')detail=`Rectangular floor: ${n[0]} metres by ${n[1]} metres. Diagonal cable marked x.`;
 if(v.task==='circle')detail=v.variant==='ring'?`Outer radius ${n[0]} metres. Inner radius ${n[1]} metres. The ring between the circles is shaded.`:v.variant==='unknownRadius'?'The radius is unknown.':`${v.variant==='diameter'||v.variant==='semicircle'?'Diameter':'Radius'} ${n[0]} ${u}.`;
 if(v.variant==='map'||v.variant==='mapRoute')detail=v.variant==='mapRoute'?'Route from A to B, then B to C.':'Route from A to B.';
 return [v.description,...v.labels??[],detail,...v.rows?.map(r=>`${r.label}. UTC ${r.offset>=0?'plus':'minus'} ${Math.abs(r.offset)} hours. ${r.detail}.`)??[]].filter(Boolean).join(' ');
}
export default function Year8MeasurementAssessmentVisual({visual:v}:{visual:Measurement8Visual}){
 const n=v.values;let content:ReactNode;
 switch(v.task){
 case 'composite':content=v.variant==='notch'?<NotchedPlan n={n}/>:<div className="flex justify-center"><DimensionedArea values={n} cut label="L-shaped plan with external dimensions"/></div>;break;
 case 'house':content=<House n={n}/>;break;
 case 'prism':content=v.variant==='triangular'?<TriPrism n={n} unit={v.unit??'cm'}/>:<RectPrism dims={n} unit={v.unit??'cm'}/>;break;
 case 'circle':content=<Circle v={v}/>;break;
 case 'rightTriangle':content=<RightTriangle v={v}/>;break;
 case 'diagonal':{const s=Math.min(320/n[0],210/n[1]),x=110,y=45,w=n[0]*s,h=n[1]*s;content=<Frame><rect x={x} y={y} width={w} height={h} fill={fill} stroke={line} strokeWidth="3"/><path d={`M${x} ${y+h}L${x+w} ${y}`} stroke={ink} strokeWidth="3" strokeDasharray="7 5"/>{txt(x+w/2,y+h+30,`${n[0]} m`)}{txt(x+w+18,y+h/2,`${n[1]} m`,'start')}{txt(x+w/2+20,y+h/2+25,'x')}</Frame>;break;}
 case 'timezone':content=<div className="flex flex-wrap justify-center gap-3">{v.rows?.map(row=><div key={row.label} className="min-w-0 flex-1 rounded-xl border border-amber-200 bg-white p-4 text-center" style={{flexBasis:210}}><Globe2 className="mx-auto mb-2 text-amber-700" size={30} aria-hidden="true"/><p className="text-lg font-bold">{row.label}</p><p className="my-2 font-semibold">UTC{row.offset>=0?'+':''}{row.offset}</p><p className="text-xl font-black">{row.detail}</p></div>)}</div>;break;
 case 'rate':case 'model':content=<div className="flex flex-col items-center gap-3">{v.variant==='map'||v.variant==='mapRoute'?<MapRoute v={v}/>:v.variant==='paint'?<Year7ContextArt kind="paint"/>:v.variant==='coach'||v.variant==='train'?<TravelScene coach={v.variant==='coach'}/>:v.variant==='fuel'?<img src="/images/measurelands/everyday-3d/object-car.png" alt="" className="h-32 w-44 object-contain"/>:<WaterFlow/>}{v.labels?.map(label=><p key={label} className="text-center text-lg font-bold">{label}</p>)}</div>;break;
 }
 return <div className="w-full rounded-2xl border-2 border-amber-300 bg-[#fffaf0] p-4 text-amber-950 sm:p-6"><div className="mb-3 flex justify-end"><ReadAloudBtn text={measurement8Speech(v)} label="Read diagram" size="sm" className="!border-amber-600 !bg-[#fffaf0] !text-amber-900"/></div><p className="mb-3 text-center text-lg font-bold">{v.description}</p>{!['model','rate'].includes(v.task)&&v.labels?.map(label=><p className="mb-3 text-center text-lg font-bold" key={label}>{label}</p>)}{content}</div>;
}
