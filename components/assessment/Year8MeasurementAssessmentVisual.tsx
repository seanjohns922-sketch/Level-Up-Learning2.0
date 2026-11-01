"use client";
import MeasurementDiagram, {measurementLessonDescription} from "@/components/lesson/level8/MeasurementDiagram";
import type {ReactNode} from 'react';
import {FlowScene,FuelScene,JourneyScene,TimeZoneBoard,WallArea} from './Measurement8Scenes';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {CirclePlan,DiagonalPlan,Facts,House,WallPlan,INK,LPlan,lPlanLabels,NotchedPlan,Orientation,PackingPlan,RectPrismPlan,RightTrianglePlan,ShapePlan,TriPrismPlan} from './Measurement8Kit';
import type {Measurement8Visual} from '@/data/assessments/revisions/year8MeasurementFiveForms';
const ink='#583714';
function MapRoute({v}:{v:Measurement8Visual}){
 const two=v.variant==='mapRoute',unit=two?26:40,a=two?v.values[0]:v.values[1],b=two?v.values[1]:0,x=two?112:(560-a*unit)/2,y=two?278:204,bx=x+a*unit,cy=y-b*unit;
 const route=two?`M${x} ${y}H${bx}V${cy}`:`M${x} ${y}H${bx}`;
 const pin=(px:number,py:number,label:string)=><g key={label}><path d={`M${px} ${py}c-5-8-12-15-12-23a12 12 0 1 1 24 0c0 8-7 15-12 23Z`} fill="#a33c41" stroke="white" strokeWidth="2"/><text x={px} y={py-20} textAnchor="middle" fontSize="14" fontWeight="800" fill="white">{label}</text></g>;
 const badge=(px:number,py:number,label:string)=><g><rect x={px-36} y={py-18} width="72" height="27" rx="6" fill="#fffaf0" stroke="#8051a8"/><text x={px} y={py+1} textAnchor="middle" fontSize="19" fontWeight="700" fill={ink}>{label}</text></g>;
 return <div className="w-full">
 <svg viewBox="0 0 560 390" aria-hidden="true" style={{width:'100%',maxWidth:620,maxHeight:320,display:'block',margin:'auto'}}>
 <rect x="20" y="20" width="520" height="302" rx="14" fill="#e6e9e8"/>
 <path d="M22 42H149V105H22Z M380 35H522V121H425Z M33 255H95V309H33Z" fill="#bfddbc"/>
 <path d="M24 144Q119 103 191 130T352 119T536 170" fill="none" stroke="#9bcde3" strokeWidth="23"/>
 {[62,101,151,201,249,294].map((ry,i)=><path key={ry} d={`M30 ${ry}L530 ${ry+(i%2?14:-12)}`} stroke="white" strokeWidth="7" fill="none"/>)}
 {[65,152,241,341,444,501].map((rx,i)=><path key={rx} d={`M${rx} 29L${rx+(i%2?20:-15)} 313`} stroke="white" strokeWidth="7" fill="none"/>)}
 <path d="M38 306L150 222L221 153L333 37" stroke="#e1bf6b" strokeWidth="13" fill="none"/><path d="M38 306L150 222L221 153L333 37" stroke="#fff2b6" strokeWidth="7" fill="none"/>
 <path d={two?`M35 ${y}H520M${bx} 35V310`:`M35 ${y}H520`} stroke="#c5cacc" strokeWidth="19" fill="none"/><path d={two?`M35 ${y}H520M${bx} 35V310`:`M35 ${y}H520`} stroke="white" strokeWidth="14" fill="none"/>
 <g transform={`translate(${x-21} ${y+14})`}><rect width="42" height="22" rx="2" fill="#d9a86b" stroke="#8b6946"/><path d="M-4 0L21-15L46 0Z" fill="#a65e4e"/><rect x="17" y="10" width="9" height="12" fill="#6a737b"/><path d="M7 7h5m18 0h5" stroke="#e9f8ff" strokeWidth="5"/></g>
 <g transform={`translate(${bx-21} ${y+14})`}><rect width="42" height="22" rx="2" fill="#8cabc4" stroke="#567185"/><path d="M-4 0L21-13L46 0Z" fill="#526e89"/><path d="M8 4v15m13-15v15m13-15v15" stroke="#eef5f4" strokeWidth="4"/></g>
 {two&&<g transform={`translate(${bx+26} ${cy-14})`}><rect x="-8" y="-20" width="54" height="46" rx="8" fill="#bed9ad"/>{[4,27].map((tx,i)=><g key={tx}><path d={`M${tx} 4v16`} stroke="#977247" strokeWidth="4"/><circle cx={tx} cy={-3+i*5} r="12" fill="#6c9e64"/></g>)}</g>}
 <path d={route} fill="none" stroke="white" strokeWidth="10" strokeLinejoin="round"/><path d={route} fill="none" stroke="#8051a8" strokeWidth="6" strokeLinejoin="round"/>
 {pin(x,y,'A')}{pin(bx,y,'B')}{two&&pin(bx,cy,'C')}
 {badge((x+bx)/2,y-50,`${a} cm`)}{two&&badge(bx+50,(y+cy)/2,`${b} cm`)}
 <path d={`M42 350h${unit}m-${unit}-5v10m${unit}-10v10`} stroke={ink} strokeWidth="2"/>
 <text x={60+unit} y="356" fill={ink} fontSize="18" fontWeight="700">1 cm on the original map</text>
 </svg>
 <p className="text-center text-base font-bold">{two?'A — School → B — Library → C — Park':'A — School → B — Library'}</p>
 </div>;
}
export function measurement8Speech(v:Measurement8Visual){
 const n=v.values,u=v.unit??'';let detail='';
 if(v.task==='lesson')detail=measurementLessonDescription(v);
 if(v.task==='composite'){const[w,h,cw,ch]=n;detail=v.variant==='notch'?`Outer width ${w} metres. Outer height ${h} metres on each side. Each short outer arm is ${(w-cw)/2} metres. Notch width ${cw} metres. Each inward vertical edge is ${ch} metres.`:`Six boundary edges in order: ${lPlanLabels(n,v.edgeLabels).join(', ')}.`;}
 if(v.task==='packing')detail=`Shipping carton, internal length ${n[0]}, width ${n[1]}, height ${n[2]} centimetres. One tissue box, external length ${n[3]}, width ${n[4]}, height ${n[5]} centimetres.`;
 if(v.task==='plan'){const name=v.edgeLabels?.[0]??'Inside shape';detail=v.variant==='fence'?`Rectangle ${n[0]} ${u} by ${n[1]} ${u}.${n[2]?` A ${n[2]} ${u} gap in the fence is the gate.`:' The fence goes all the way around.'}`:v.variant==='surround'?`${name} ${n[0]} ${u} by ${n[1]} ${u}, with a strip ${n[2]} ${u} wide all the way around it.`:v.variant==='wordRect'?'A rectangle with its length and width marked.':v.variant==='isosceles'?`Base ${n[0]} ${u}. The two equal sides are marked and their length is unknown.`:v.variant==='trapezium'?`Parallel sides ${n[0]} ${u} and ${n[1]} ${u}. The two slanted sides are equal and unknown.`:'The shared side is dashed and is inside the shape. All the outside sides are marked as equal.';}
 if(v.task==='house')detail=`Base width ${n[0]} metres. Rectangular wall height ${n[1]} metres. Gable perpendicular height ${n[2]} metres.`;
 if(v.task==='prism')detail=v.variant==='triangular'?`Triangular end base ${n[0]} ${u}, perpendicular height ${n[1]} ${u}. Prism length ${n[2]} ${u}.`:`Length ${n[0]} ${u}. Width ${n[1]} ${u}. Height ${n[2]} ${u}.`;
 if(v.task==='rightTriangle')detail=`Horizontal side ${n[0]} ${u}. Vertical side ${v.unknown==='height'?'x':n[1]} ${u}. Hypotenuse ${v.unknown==='hypotenuse'?'x':n[2]} ${u}. The square marks the right angle.`;
 if(v.task==='diagonal')detail=`Rectangular floor: ${n[0]} metres by ${n[1]} metres. Diagonal cable marked x.`;
 if(v.task==='circle')detail=v.variant==='ring'?`Outer radius ${n[0]} metres. Inner radius ${n[1]} metres. The ring between the circles is shaded.`:v.variant==='unknownRadius'?'The radius is unknown.':`${v.variant==='diameter'||v.variant==='semicircle'?'Diameter':'Radius'} ${n[0]} ${u}.`;
 if(v.variant==='map'||v.variant==='mapRoute')detail=v.variant==='mapRoute'?`A is the school. B is the library. C is the park. Route A to B: ${n[0]} centimetres on the map. Route B to C: ${n[1]} centimetres on the map. The reference bar represents one centimetre on the original map.`:`A is the school. B is the library. Route A to B: ${n[1]} centimetres on the map. The reference bar represents one centimetre on the original map.`;
 return [v.description,...v.labels??[],detail,...v.rows?.map(r=>`${r.label}. UTC ${r.offset>=0?'plus':'minus'} ${Math.floor(Math.abs(r.offset))} hours${Math.abs(r.offset)%1?' 30 minutes':''}. ${r.detail==='?'?'Time to find':r.detail}.`)??[]].filter(Boolean).join(' ');
}
export default function Year8MeasurementAssessmentVisual({visual:v}:{visual:Measurement8Visual}){
 const n=v.values;let content:ReactNode;
 switch(v.task){
 case 'lesson':content=<MeasurementDiagram visual={v}/>;break;
 case 'composite':content=v.variant==='notch'?<NotchedPlan n={n} mat={v.material}/>:<LPlan n={n} labels={v.edgeLabels} mat={v.material}/>;break;
 case 'plan':content=<ShapePlan v={v}/>;break;
 case 'packing':content=<PackingPlan n={n}/>;break;
 case 'house':content=<House n={n}/>;break;
 case 'prism':content=v.variant==='triangular'?<TriPrismPlan n={n} unit={v.unit??'cm'}/>:<RectPrismPlan n={n} unit={v.unit??'cm'} water={v.material==='water'}/>;break;
 case 'circle':content=<CirclePlan v={v}/>;break;
 case 'rightTriangle':content=<RightTrianglePlan v={v}/>;break;
 case 'diagonal':content=<DiagonalPlan n={n}/>;break;
 case 'timezone':content=<TimeZoneBoard rows={v.rows??[]}/>;break;
 case 'rate':case 'model':content=v.variant==='map'||v.variant==='mapRoute'?<div className="flex flex-col items-center gap-3"><MapRoute v={v}/><Facts items={v.labels??[]}/></div>:v.variant==='paint'?(v.task==='rate'?<><WallPlan n={n}/><Facts items={(v.labels??[]).slice(1)}/></>:<WallArea v={v}/>):v.variant==='coach'||v.variant==='train'?<JourneyScene v={v}/>:v.variant==='fuel'?<FuelScene v={v}/>:<FlowScene v={v}/>;break;
 }
 const extras=['rate','model','lesson'].includes(v.task)?[]:v.labels??[];
 return <Orientation.Provider value={v.orientation??0}><div className="relative w-full rounded-2xl p-3 sm:p-4" style={{background:'#f6f3fb',color:INK}}><div className="mb-1 flex justify-end"><ReadAloudBtn text={measurement8Speech(v)} label="Read diagram" size="sm"/></div>{content}<Facts items={extras}/><p className="mt-2 text-center text-sm font-semibold opacity-70">{v.description}</p></div></Orientation.Provider>;
}
