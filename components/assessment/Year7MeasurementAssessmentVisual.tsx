"use client";
import type {ReactNode} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import Year7ContextArt from './Year7ContextArt';
import {volumeViewBox} from '@/components/measurelands/MeasurelandsVolumeBuilder';
import type {Measurement7Visual} from '@/data/assessments/revisions/year7MeasurementFiveForms';
const ink='#583714',edge='#856126',purple='#8051a8',fill='#e9daf3';
const text=(x:number,y:number,value:string|number,anchor:'middle'|'start'|'end'='middle')=><text x={x} y={y} textAnchor={anchor} fill={ink} fontSize="23" fontWeight="700">{value}</text>;
function Frame({children,viewBox="0 0 640 390"}:{children:ReactNode;viewBox?:string}){return <svg viewBox={viewBox} aria-hidden="true" style={{width:'100%',maxWidth:700,maxHeight:280,display:'block',margin:'auto'}}>{children}</svg>;}
function Area({b,h,unit,parallel=false,unknown=false}:{b:number;h:number;unit:string;parallel?:boolean;unknown?:boolean}){
 const scale=Math.min(320/b,220/h),w=b*scale,height=h*scale,left=(640-w)/2-25,bottom=305,top=bottom-height,shift=65;
 return <Frame viewBox={`${left-12} ${top-18} ${w+185} ${height+72}`}><path d={parallel?`M${left} ${bottom}h${w}l${shift} ${-height}h${-w}Z`:`M${left} ${bottom}h${w}L${left+w*.35} ${top}Z`} fill={fill} stroke={purple} strokeWidth="4"/><path d={`M${left+(parallel?shift:w*.35)} ${top}V${bottom}`} stroke={edge} strokeWidth="2.5" strokeDasharray="7 5"/><path d={`M${left+(parallel?shift:w*.35)} ${bottom-16}h16v16`} fill="none" stroke={edge} strokeWidth="2"/>{text(left+w/2,bottom+38,`${b} ${unit}`)}<path d={`M${left+w+shift+25} ${top}h10m-5 0V${bottom}m-5 0h10`} fill="none" stroke={edge}/>{text(left+w+shift+40,(top+bottom)/2,`${unknown?'?':h} ${unit}`,'start')}</Frame>;
}
export function RectPrism({dims,unit,unknown=false}:{dims:number[];unit:string;unknown?:boolean}){
 const [l,w,h]=dims;
 // Reuse the lesson volume engine's isometric projection and bounds, without unit-cube counting.
 const {ox,oy,VW,VH}=volumeViewBox({l,w,h});
 const p=(x:number,y:number,z:number)=>[ox+(x-y)*20,oy+(x+y)*10-z*22];
 const polygon=(points:number[][],colour:string)=><polygon points={points.map(v=>v.join(',')).join(' ')} fill={colour} stroke={edge} strokeWidth="2"/>;
 const font=Math.max(25,(VW+145)/22),A=p(0,w,0),B=p(l,w,0),C=p(l,0,0),D=p(l,0,h);
 return <svg viewBox={`-65 -35 ${VW+145} ${VH+115}`} aria-hidden="true" style={{width:'100%',maxWidth:590,maxHeight:340,display:'block',margin:'auto'}}>{polygon([p(0,0,h),p(l,0,h),p(l,w,h),p(0,w,h)],'#f1dfb3')}{polygon([p(0,w,0),p(l,w,0),p(l,w,h),p(0,w,h)],'#cba8df')}{polygon([p(l,0,0),p(l,w,0),p(l,w,h),p(l,0,h)],'#aa7bc2')}<g fill={ink} fontSize={font} fontWeight="700"><text x={(A[0]+B[0])/2-15} y={(A[1]+B[1])/2+font+12} textAnchor="middle">{unknown?'?':l} {unit}</text><text x={(B[0]+C[0])/2+25} y={(B[1]+C[1])/2+font+12} textAnchor="middle">{w} {unit}</text><text x={C[0]+17} y={(C[1]+D[1])/2}>{h} {unit}</text></g></svg>;
}
export function TriPrism({n,unit}:{n:number[];unit:string}){
 const [b,h,d]=n,scale=Math.min(210/b,200/h),w=b*scale,height=h*scale,x=125,y=310,dx=d*scale*.65,dy=-d*scale*.32;
 return <Frame><path d={`M${x} ${y-height}l${dx} ${dy}L${x+w+dx} ${y+dy}L${x+w} ${y}Z`} fill="#cab0dc" stroke={edge} strokeWidth="3"/><path d={`M${x} ${y-height}V${y}h${w}Z`} fill="#e6d5ef" stroke={edge} strokeWidth="3"/><path d={`M${x} ${y-18}h18v18`} fill="none" stroke={edge} strokeWidth="2"/><path d={`M${x+w} ${y}l${dx} ${dy}`} stroke={edge} strokeWidth="3"/>{text(x+w/2,y+38,`${b} ${unit}`)}{text(x-22,y-height/2,`${h} ${unit}`,'end')}{text(x+w+dx/2+30,y+dy/2+34,`${d} ${unit}`)}</Frame>;
}
const rad=(a:number)=>a*Math.PI/180;
function Sector({x,y,start,end,label}:{x:number;y:number;start:number;end:number;label:string}){
 const point=(a:number,r:number)=>[x+Math.cos(rad(a))*r,y+Math.sin(rad(a))*r];
 const a=point(start,42),b=point(end,42),t=point((start+end)/2,74);
 return <><path d={`M${x} ${y}L${a.join(' ')}A42 42 0 ${end-start>180?1:0} 1 ${b.join(' ')}Z`} fill="#ead9f3" stroke={purple} strokeWidth="2"/>{text(t[0],t[1]+7,label)}</>;
}
function Parallel({a,relation}:{a:number;relation:Measurement7Visual['relation']}){
 const upper=350,lower=upper-140/Math.tan(rad(a));
 return <Frame><path d="M60 105H580M60 245H580" stroke={edge} strokeWidth="4"/><path d={`M${lower-70/Math.tan(rad(a))} 315L${upper+65/Math.tan(rad(a))} 40`} stroke={edge} strokeWidth="4"/>{[105,245].map(y=><path key={y} d={`M490 ${y-7}l12 7-12 7m12-14l12 7-12 7`} fill="none" stroke={edge} strokeWidth="3"/>)}<Sector x={upper} y={105} start={relation==='corresponding'?360-a:180-a} end={relation==='corresponding'?360:180} label={`${a}°`}/><Sector x={lower} y={245} start={relation==='cointerior'?180:360-a} end={relation==='cointerior'?360-a:360} label="x"/></Frame>;
}
function AnglePolygon({n,iso=false,quad=false,angleSumModel=false}:{n:number[];iso?:boolean;quad?:boolean;angleSumModel?:boolean}){
 let points:number[][];
 if(quad){const h=175;points=[[100,300],[500,300],[500-h/Math.tan(rad(n[1])),125],[100+h/Math.tan(rad(n[0])),125]];}
 else {const base=340,ta=Math.tan(rad(n[0])),tb=Math.tan(rad(n[1])),height=base*ta*tb/(ta+tb);const factor=Math.min(1,220/height);points=[[150,310],[150+base*factor,310],[150+height/ta*factor,310-height*factor]];}
 const centre=points.reduce((a,b)=>[a[0]+b[0]/points.length,a[1]+b[1]/points.length],[0,0]);
 return <Frame><polygon points={points.map(p=>p.join(',')).join(' ')} fill={fill} stroke={purple} strokeWidth="4"/>{angleSumModel?<path d={`M${points[0].join(" ")}L${points[2].join(" ")}`} stroke={edge} strokeWidth="3" strokeDasharray="8 5"/>:points.map((p,i)=>{const dx=centre[0]-p[0],dy=centre[1]-p[1],len=Math.hypot(dx,dy);const label=iso?(i===0?'x':i===2?`${n[2]}°`:''):(i===points.length-1?'x':`${n[i]}°`);return <g key={i}>{text(p[0]+dx/len*55,p[1]+dy/len*55+7,label)}</g>;})}{iso&&[0,1].map(i=>{const a=points[i],b=points[2],x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return <path key={i} d={`M${x-dy/l*9} ${y+dx/l*9}L${x+dy/l*9} ${y-dx/l*9}`} stroke={edge} strokeWidth="3"/>;})}</Frame>;
}
export function measurement7Speech(v:Measurement7Visual){
 const n=v.values,u=v.unit??'',labels=v.labels?.filter(x=>x!=='isosceles'&&x!=='symbolic')??[];let detail='';
 if(v.task==='triangle'||v.task==='parallelogram')detail=`Base ${n[0]} ${u}. Perpendicular height ${v.unknown==='height'?'unknown':n[1]+' '+u}.`;
 if(v.task==='rectPrism')detail=`Length ${v.unknown==='length'?'unknown':n[0]+' '+u}. Width ${n[1]} ${u}. Height ${n[2]} ${u}.`;
 if(v.task==='triPrism')detail=`Triangular end: base ${n[0]} ${u}, perpendicular height ${n[1]} ${u}. Prism length ${n[2]} ${u}.`;
 if(v.task==='circle')detail=v.labels?.includes('symbolic')?(v.circleMeasure==='radius'?'Radius r.':'Diameter d.'):`${v.circleMeasure} ${n[0]} ${u}.`;
 if(v.task==='parallel')detail=`One marked angle is ${n[0]} degrees. The other marked angle is x. Matching arrow marks identify the parallel lines.`;
 if(v.task==='triangleAngles')detail=v.labels?.includes('isosceles')?`Top angle ${n[2]} degrees. The left base angle is x. The two sloping sides have matching ticks.`:`Given angles ${n[0]} and ${n[1]} degrees. The top angle is x.`;
 if(v.task==='quadAngles')detail=v.angleSumModel?'A quadrilateral with one dashed diagonal joining opposite corners.':`Three interior angles are ${n.slice(0,3).join(', ')} degrees. The remaining angle is x.`;
 if(v.task==='pairTriangles')detail=`Sail A: base ${n[0]} metres, perpendicular height ${n[1]} metres. Sail B: base ${n[2]} metres, perpendicular height ${n[3]} metres.`;
 if(v.task==='pairPrisms')detail=`Box A: length ${n[0]}, width ${n[1]}, height ${n[2]} centimetres. Box B: triangular end base ${n[3]}, perpendicular height ${n[4]}, prism length ${n[5]} centimetres.`;
 return [v.description,...labels,detail].join(' ');
}
export default function Year7MeasurementAssessmentVisual({visual:v}:{visual:Measurement7Visual}){
 const n=v.values,u=v.unit??'cm';let content:ReactNode;
 switch(v.task){
 case 'triangle':case 'parallelogram':content=<Area b={n[0]} h={n[1]} unit={u} parallel={v.task==='parallelogram'} unknown={v.unknown==='height'}/>;break;
 case 'rectPrism':content=<RectPrism dims={n} unit={u} unknown={v.unknown==='length'}/>;break;
 case 'triPrism':content=<TriPrism n={n} unit={u}/>;break;
 case 'circle':content=<Frame><circle cx="320" cy="185" r="135" fill="#f1e6cd" stroke={edge} strokeWidth="4"/><circle cx="320" cy="185" r="5" fill={edge}/><path d={`M${v.circleMeasure==='diameter'?185:320} 185H455`} stroke={purple} strokeWidth="4"/>{text(v.circleMeasure==='diameter'?320:390,220,v.labels?.includes('symbolic')?(v.circleMeasure==='radius'?'r':'d'):`${n[0]} ${u}`)}</Frame>;break;
 case 'parallel':content=<Parallel a={n[0]} relation={v.relation}/>;break;
 case 'triangleAngles':case 'quadAngles':content=<AnglePolygon n={n} iso={v.labels?.includes('isosceles')} quad={v.task==='quadAngles'} angleSumModel={v.angleSumModel}/>;break;
 case 'pairTriangles':case 'pairPrisms':content=<div style={{display:'flex',flexWrap:'wrap',gap:16}}>{[0,1].map(i=><div key={i} style={{flex:'1 1 280px',minWidth:0}}><p className="text-center font-bold">{v.task==='pairTriangles'?'Sail':'Box'} {i===0?'A':'B'}</p>{v.task==='pairTriangles'?<Area b={n[i*2]} h={n[i*2+1]} unit={u}/>:i===0?<RectPrism dims={n.slice(0,3)} unit={u}/>:<TriPrism n={n.slice(3)} unit={u}/>}</div>)}</div>;break;
 case 'ratio':content=<div className="flex flex-col items-center gap-4"><Year7ContextArt kind={v.labels?.[0].includes('Concentrate')?'drink':'paint'}/>{v.labels?.map(label=><p key={label} className="text-center text-xl font-bold">{label}</p>)}</div>;break;
 }
 return <div className="w-full rounded-2xl border-2 border-amber-300 bg-[#fffaf0] p-4 text-amber-950 sm:p-6"><div className="mb-4 flex justify-end"><ReadAloudBtn text={measurement7Speech(v)} label="Read diagram" size="sm" className="!border-amber-600 !bg-[#fffaf0] !text-amber-900"/></div><p className="mb-4 text-center text-lg font-bold">{v.description}</p>{v.task!=='ratio'&&v.labels?.filter(x=>!['symbolic','isosceles'].includes(x)).map(l=><p className="mb-4 text-center text-xl font-black" key={l}>{l}</p>)}{content}</div>;
}
