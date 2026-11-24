"use client";
import type {ReactNode} from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import Year7ContextArt from './Year7ContextArt';
import type {Measurement7Visual} from '@/data/assessments/revisions/year7MeasurementFiveForms';
import {AreaPlan,CirclePlan7,PairTrianglesPlan,PolygonSplitPlan,RectPrismPlan7,TrackLines,TriPrismPlan7} from './Year7MeasurementPremium';
const ink='#3c2a63',edge='#3c2a63',purple='#5a2fc2',fill='#d3c0f7';
const text=(x:number,y:number,value:string|number,anchor:'middle'|'start'|'end'='middle')=><text x={x} y={y} textAnchor={anchor} fill={ink} fontSize="23" fontWeight="700">{value}</text>;
function Frame({children,viewBox="0 0 640 390"}:{children:ReactNode;viewBox?:string}){return <svg viewBox={viewBox} aria-hidden="true" style={{width:'100%',maxWidth:700,maxHeight:280,display:'block',margin:'auto'}}>{children}</svg>;}
const rad=(a:number)=>a*Math.PI/180;
function Sector({x,y,start,end,label}:{x:number;y:number;start:number;end:number;label:string}){
 const point=(a:number,r:number)=>[x+Math.cos(rad(a))*r,y+Math.sin(rad(a))*r];
 const a=point(start,42),b=point(end,42),t=point((start+end)/2,74);
 return <><path d={`M${x} ${y}L${a.join(' ')}A42 42 0 ${end-start>180?1:0} 1 ${b.join(' ')}Z`} fill="#ead9f3" stroke={purple} strokeWidth="2"/>{text(t[0],t[1]+7,label)}</>;
}
function Parallel({a,relation,labels,positions,scene}:{a:number;relation:Measurement7Visual['relation'];labels?:[string,string];positions?:Measurement7Visual['anglePositions'];scene?:'railway'|'timber'|'road'}){
 const upper=350,lower=upper-140/Math.tan(rad(a));
 const sectors={aboveRight:[360-a,360],aboveLeft:[180,360-a],belowLeft:[180-a,180],belowRight:[0,180-a]};
 const places=positions??[relation==='corresponding'?'aboveRight':'belowLeft',relation==='cointerior'?'aboveLeft':'aboveRight'];
 const cross=`M${lower-70/Math.tan(rad(a))} 315L${upper+65/Math.tan(rad(a))} 40`;
 return <Frame>{scene?<TrackLines y={[105,245]} road={scene!=='timber'}/>:<path d="M60 105H580M60 245H580" stroke={edge} strokeWidth="4"/>}{scene==='road'||scene==='railway'?<g><path d={cross} stroke="#4b5563" strokeWidth="30" strokeLinecap="butt"/><path d={cross} stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="14 12"/></g>:scene==='timber'?<path d={cross} stroke="#8a5a2b" strokeWidth="14"/>:<path d={cross} stroke={edge} strokeWidth="4"/>}{[105,245].map(y=><path key={y} d={`M490 ${y-7}l12 7-12 7m12-14l12 7-12 7`} fill="none" stroke={edge} strokeWidth="3"/>)}{places.map((place,i)=><Sector key={i} x={i?lower:upper} y={i?245:105} start={sectors[place][0]} end={sectors[place][1]} label={labels?.[i]??(i?'x°':`${a}°`)}/>)}</Frame>;
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
 // Describe positions (what a sighted student sees) without naming the relationship.
 if(v.task==='parallel'){const [first,second]=v.angleLabels??[`${n[0]} degrees`,'x'],place=v.anglePositions?v.anglePositions.map((p,i)=>`${p.startsWith('above')?'above':'below'} the ${i?'bottom':'top'} line, ${p.endsWith('Right')?'right':'left'} of the transversal`):v.relation==='corresponding'?['above the top line, right of the transversal','above the bottom line, right of the transversal']:v.relation==='alternate'?['below the top line, left of the transversal','above the bottom line, right of the transversal']:['below the top line, left of the transversal','above the bottom line, left of the transversal'];detail=`One marked angle, ${first}, is ${place[0]}. The other marked angle, ${second}, is ${place[1]}. Matching arrow marks identify the parallel lines.`;}
 if(v.task==='polygonAngles')detail=`${v.polygonPoints?.length}-sided polygon. Interior angles, in order around the shape: ${v.polygonAngleLabels?.join(', ')}.`;
 if(v.task==='triangleAngles')detail=v.labels?.includes('isosceles')?`Top angle ${n[2]} degrees. The left base angle is x. The two sloping sides have matching ticks.`:`Given angles ${n[0]} and ${n[1]} degrees. The top angle is x.`;
 if(v.task==='quadAngles')detail=v.angleSumModel?'A quadrilateral with one dashed diagonal joining opposite corners.':`Three interior angles are ${n.slice(0,3).join(', ')} degrees. The remaining angle is x.`;
 if(v.task==='polygonSplit')detail=`A ${n[0]}-sided polygon. Diagonals from one corner split it into triangles.`;
 if(v.task==='circle'&&v.wheel)detail=`A wheel. ${detail}`;
 if(v.task==='rectPrism'&&v.water)detail=`A tank full of water. ${detail}`;
 if(v.task==='pairTriangles')detail=`Sail A: base ${n[0]} metres, perpendicular height ${n[1]} metres. Sail B: base ${n[2]} metres, perpendicular height ${n[3]} metres.`;
 if(v.task==='pairPrisms')detail=`Box A: length ${n[0]}, width ${n[1]}, height ${n[2]} centimetres. Box B: triangular end base ${n[3]}, perpendicular height ${n[4]}, prism length ${n[5]} centimetres.`;
 return [v.description,...labels,detail].join(' ');
}
export default function Year7MeasurementAssessmentVisual({visual:v}:{visual:Measurement7Visual}){
 const n=v.values,u=v.unit??'cm';let content:ReactNode;
 switch(v.task){
 case 'triangle':case 'parallelogram':content=<AreaPlan b={n[0]} h={n[1]} unit={u} parallel={v.task==='parallelogram'} unknown={v.unknown==='height'}/>;break;
 case 'rectPrism':content=<RectPrismPlan7 n={n} unit={u} water={v.water} unknown={v.unknown==='length'}/>;break;
 case 'triPrism':content=<TriPrismPlan7 n={n} unit={u}/>;break;
 case 'polygonSplit':content=<PolygonSplitPlan sides={n[0]}/>;break;
 case 'circle':content=<CirclePlan7 value={n[0]} unit={u} measure={v.circleMeasure??'radius'} symbolic={!!v.labels?.includes('symbolic')} wheel={!!v.wheel}/>;break;
 case 'parallel':content=<Parallel a={n[0]} relation={v.relation} labels={v.angleLabels} positions={v.anglePositions} scene={v.rails?(/railway|track/i.test(v.description)?'railway':/road/i.test(v.description)?'road':'timber'):undefined}/>;break;
 case 'polygonAngles':{const points=v.polygonPoints??[],centre=points.reduce((s,p)=>[s[0]+p[0]/points.length,s[1]+p[1]/points.length],[0,0]);content=<Frame><polygon points={points.map(p=>p.join(',')).join(' ')} fill={fill} stroke={edge} strokeWidth="3"/>{points.map((p,i)=>{const dx=centre[0]-p[0],dy=centre[1]-p[1],length=Math.hypot(dx,dy);return <g key={i}>{text(p[0]+dx/length*43,p[1]+dy/length*43+7,v.polygonAngleLabels?.[i]??'x°')}</g>;})}</Frame>;break;}
 case 'triangleAngles':case 'quadAngles':content=<AnglePolygon n={n} iso={v.labels?.includes('isosceles')} quad={v.task==='quadAngles'} angleSumModel={v.angleSumModel}/>;break;
 case 'pairTriangles':content=<PairTrianglesPlan n={n} unit={u}/>;break;
 case 'pairPrisms':content=<div style={{display:'flex',flexWrap:'wrap',gap:12}}>{[0,1].map(i=><div key={i} style={{flex:'1 1 220px',minWidth:0}}><p className="text-center font-bold">Box {i===0?'A':'B'}</p>{i===0?<RectPrismPlan7 n={n.slice(0,3)} unit={u}/>:<TriPrismPlan7 n={n.slice(3,6)} unit={u}/>}</div>)}</div>;break;
 case 'ratio':content=<div className="flex flex-col items-center gap-4"><Year7ContextArt kind={v.labels?.[0].includes('Concentrate')?'drink':'paint'}/>{v.labels?.map(label=><p key={label} className="text-center text-xl font-bold">{label}</p>)}</div>;break;
 }
 return <div className="w-full rounded-2xl border-2 border-amber-300 bg-[#fffaf0] p-3 text-amber-950 sm:p-4"><div className="mb-2 flex items-start justify-between gap-3"><p className="text-sm font-semibold leading-snug text-amber-900/80 sm:text-base">{v.description}</p><ReadAloudBtn text={measurement7Speech(v)} label="Read diagram" size="sm" className="shrink-0 !border-amber-600 !bg-[#fffaf0] !text-amber-900"/></div>{v.task!=='ratio'&&v.labels?.filter(x=>!['symbolic','isosceles'].includes(x)).map(l=><p className="mb-2 text-center text-lg font-black" key={l}>{l}</p>)}{content}</div>;
}
