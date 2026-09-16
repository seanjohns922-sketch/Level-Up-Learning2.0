"use client";
import {Children,cloneElement,createContext,isValidElement,useContext,type ReactNode,type ReactElement} from 'react';
import {CityScene,WaterFlow,PackingScene} from './Measurement8ContextScenes';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import Year7ContextArt from './Year7ContextArt';
import {RectPrism,TriPrism} from './Year7MeasurementAssessmentVisual';
import {TravelScene} from './Measurement5Scenes';
import type {Measurement8Visual} from '@/data/assessments/revisions/year8MeasurementFiveForms';
const ink='#583714',line='#8051a8',fill='#e9daf3';
const txt=(x:number,y:number,value:string,anchor:'middle'|'start'|'end'='middle')=><text x={x} y={y} fill={ink} textAnchor={anchor} fontSize="20" fontWeight="700">{value}</text>;
const Orientation=createContext(0);
// Reflect geometry while counter-reflecting its text so measurements stay readable.
function uprightText(nodes:ReactNode,sx:number,sy:number):ReactNode{return Children.map(nodes,node=>{
 if(!isValidElement(node))return node;
 const el=node as ReactElement<{x?:number;y?:number;children?:ReactNode;transform?:string;textAnchor?:string}>;
 if(el.type==='text'){const x=Number(el.props.x),y=Number(el.props.y);return cloneElement(el,{y:sy<0?y+12:y,transform:`translate(${x} ${y}) scale(${sx} ${sy}) translate(${-x} ${-y})`,textAnchor:sx<0?(el.props.textAnchor==='start'?'end':el.props.textAnchor==='end'?'start':'middle'):el.props.textAnchor});}
 return el.props.children?cloneElement(el,{},uprightText(el.props.children,sx,sy)):el;
 });}
function Frame({children,horizontalOnly=false}:{children:ReactNode;horizontalOnly?:boolean}){const o=useContext(Orientation),sx=o%2?-1:1,sy=!horizontalOnly&&o>1?-1:1;return <svg viewBox="0 0 560 350" aria-hidden="true" data-orientation={o} style={{width:'100%',maxWidth:650,maxHeight:290,display:'block',margin:'auto'}}><g transform={`translate(${sx<0?560:0} ${sy<0?350:0}) scale(${sx} ${sy})`}>{uprightText(children,sx,sy)}</g></svg>;}
function LPlan({n}:{n:number[]}){const[w,h,cw,ch]=n,s=Math.min(320/w,205/h),x=110,y=60;return <Frame><polygon points={[[0,0],[w-cw,0],[w-cw,ch],[w,ch],[w,h],[0,h]].map(([a,b])=>`${x+a*s},${y+b*s}`).join(' ')} fill="#d6e8bd" stroke="#58763c" strokeWidth="3"/>{txt(x+(w-cw)*s/2,y-18,`${w-cw} m`)}{txt(x+(w-cw)*s+15,y+ch*s/2,`${ch} m`,'start')}{txt(x+(w-cw/2)*s,y+ch*s-15,`${cw} m`)}{txt(x+w*s+18,y+(h+ch)*s/2,`${h-ch} m`,'start')}{txt(x+w*s/2,y+h*s+30,`${w} m`)}{txt(x-18,y+h*s/2,`${h} m`,'end')}</Frame>;}
function NotchedPlan({n}:{n:number[]}){
 const[w,h,cw,ch]=n,s=Math.min(350/w,210/h),x=90,y=50,arm=(w-cw)/2;
 const pts=[[0,0],[arm,0],[arm,ch],[arm+cw,ch],[arm+cw,0],[w,0],[w,h],[0,h]];
 return <Frame><polygon points={pts.map(([a,b])=>`${x+a*s},${y+b*s}`).join(' ')} fill="#d6e8bd" stroke="#58763c" strokeWidth="3"/>{txt(x+arm*s/2,y-15,`${arm} m`)}{txt(x+(w-arm/2)*s,y-15,`${arm} m`)}{txt(x+arm*s+10,y+ch*s/2,`${ch} m`,'start')}{txt(x+(arm+cw)*s-10,y+ch*s/2,`${ch} m`,'end')}{txt(x+w*s/2,y+ch*s-12,`${cw} m`)}{txt(x-16,y+h*s/2,`${h} m`,'end')}{txt(x+w*s+16,y+h*s/2,`${h} m`,'start')}{txt(x+w*s/2,y+h*s+30,`${w} m`)}</Frame>;
}
function House({n}:{n:number[]}){
 const[w,h,r]=n,s=Math.min(330/w,230/(h+r)),left=100,bottom=290,top=bottom-h*s,peak=top-r*s,cx=left+w*s/2;
 return <Frame horizontalOnly><path d={`M${left} ${bottom}V${top}L${cx} ${peak}L${left+w*s} ${top}V${bottom}Z`} fill={fill} stroke={line} strokeWidth="3"/><path d={`M${left} ${top}H${left+w*s}M${cx} ${peak}V${top}`} stroke={ink} strokeDasharray="6 5" strokeWidth="2"/><path d={`M${cx} ${top-14}h14v14`} fill="none" stroke={ink}/>{txt(cx,bottom+30,`${w} m`)}{txt(left+w*s+18,(top+bottom)/2,`${h} m`,'start')}<path d={`M${left-20} ${peak}h-8m4 0V${top}m-4 0h8`} stroke={ink} fill="none"/>{txt(left-35,(peak+top)/2+5,`${r} m`,'end')}</Frame>;
}
function RightTriangle({v}:{v:Measurement8Visual}){
 const[a,b,c]=v.values,s=Math.min(290/a,205/b),x=100,y=280,w=a*s,h=b*s;
 const ladder=v.variant==='ladder';
 return <Frame horizontalOnly={ladder}>{ladder?<><path d={`M${x-15} ${y-h-20}V${y+7}H${x+w+20}`} stroke="#a6a29a" strokeWidth="12" fill="none"/><path d={`M${x} ${y-h}L${x+w} ${y}`} stroke="#967343" strokeWidth="12"/>{Array.from({length:8},(_,i)=>{const t=(i+1)/9,px=x+w*t,py=y-h+h*t,len=Math.hypot(w,h);return <path key={i} d={`M${px-h/len*10} ${py+w/len*10}L${px+h/len*10} ${py-w/len*10}`} stroke="#583714" strokeWidth="3"/>;})}</>:<path d={`M${x} ${y}h${w}L${x} ${y-h}Z`} fill={fill} stroke={line} strokeWidth="3"/>}<path d={`M${x} ${y-16}h16v16`} fill="none" stroke={ink} strokeWidth="2"/>{txt(x+w/2,y+32,`${a} ${v.unit}`)}{txt(x-20,y-h/2,v.unknown==='height'?`x ${v.unit}`:`${b} ${v.unit}`,'end')}{txt(x+w/2+28,y-h/2-15,v.unknown==='hypotenuse'?`x ${v.unit}`:`${c} ${v.unit}`,'start')}</Frame>;
}
function Circle({v}:{v:Measurement8Visual}){
 const n=v.values,cx=280,cy=170,r=120,semi=v.variant==='semicircle',ring=v.variant==='ring';
 return <Frame>{semi?<path d={`M${cx-r} ${cy+55}A${r} ${r} 0 0 1 ${cx+r} ${cy+55}Z`} fill={fill} stroke={line} strokeWidth="3"/>:<circle cx={cx} cy={cy} r={r} fill={fill} stroke={line} strokeWidth="3"/>}
 {ring?<><circle cx={cx} cy={cy} r={r*n[1]/n[0]} fill="#fffaf0" stroke={line} strokeWidth="3"/><path d={`M${cx} ${cy}h${r}M${cx} ${cy}v${-r*n[1]/n[0]}`} stroke={ink} strokeWidth="2"/><path d={`M${cx+r/2} ${cy+5}L${cx+r+15} ${cy+90}h35M${cx-5} ${cy-r*n[1]/n[0]/2}L${cx-r-15} ${cy-95}h-35`} stroke={ink} fill="none"/>{txt(cx+r+18,cy+115,`Outer r: ${n[0]} m`)}{txt(cx-r-18,cy-110,`Inner r: ${n[1]} m`)}</>:
 semi?<>{txt(cx,cy+88,`${n[0]} ${v.unit}`)}</>:<><path d={`M${v.variant==='diameter'?cx-r:cx} ${cy}H${cx+r}`} stroke={ink} strokeWidth="3"/>{txt(v.variant==='diameter'?cx:cx+60,cy+32,v.variant==='unknownRadius'?'r = ?':`${n[0]} ${v.unit}`)}</>}
 {!semi&&<circle cx={cx} cy={cy} r="4" fill={ink}/>}</Frame>;
}
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
 if(v.task==='composite'){const[w,h,cw,ch]=n;detail=v.variant==='notch'?`Outer width ${w} metres. Outer height ${h} metres on each side. Each short outer arm is ${(w-cw)/2} metres. Notch width ${cw} metres. Each inward vertical edge is ${ch} metres.`:`Six boundary edges in order: ${w-cw}, ${ch}, ${cw}, ${h-ch}, ${w}, and ${h} metres.`;}
 if(v.task==='packing')detail=`Shipping carton, internal length ${n[0]}, width ${n[1]}, height ${n[2]} centimetres. One tissue box, external length ${n[3]}, width ${n[4]}, height ${n[5]} centimetres.`;
 if(v.task==='house')detail=`Base width ${n[0]} metres. Rectangular wall height ${n[1]} metres. Gable perpendicular height ${n[2]} metres.`;
 if(v.task==='prism')detail=v.variant==='triangular'?`Triangular end base ${n[0]} ${u}, perpendicular height ${n[1]} ${u}. Prism length ${n[2]} ${u}.`:`Length ${n[0]} ${u}. Width ${n[1]} ${u}. Height ${n[2]} ${u}.`;
 if(v.task==='rightTriangle')detail=`Horizontal side ${n[0]} ${u}. Vertical side ${v.unknown==='height'?'x':n[1]} ${u}. Hypotenuse ${v.unknown==='hypotenuse'?'x':n[2]} ${u}. The square marks the right angle.`;
 if(v.task==='diagonal')detail=`Rectangular floor: ${n[0]} metres by ${n[1]} metres. Diagonal cable marked x.`;
 if(v.task==='circle')detail=v.variant==='ring'?`Outer radius ${n[0]} metres. Inner radius ${n[1]} metres. The ring between the circles is shaded.`:v.variant==='unknownRadius'?'The radius is unknown.':`${v.variant==='diameter'||v.variant==='semicircle'?'Diameter':'Radius'} ${n[0]} ${u}.`;
 if(v.variant==='map'||v.variant==='mapRoute')detail=v.variant==='mapRoute'?`A is the school. B is the library. C is the park. Route A to B: ${n[0]} centimetres on the map. Route B to C: ${n[1]} centimetres on the map. The reference bar represents one centimetre on the original map.`:`A is the school. B is the library. Route A to B: ${n[1]} centimetres on the map. The reference bar represents one centimetre on the original map.`;
 return [v.description,...v.labels??[],detail,...v.rows?.map(r=>`${r.label}. UTC ${r.offset>=0?'plus':'minus'} ${Math.abs(r.offset)} hours. ${r.detail}.`)??[]].filter(Boolean).join(' ');
}
export default function Year8MeasurementAssessmentVisual({visual:v}:{visual:Measurement8Visual}){
 const n=v.values;let content:ReactNode;
 switch(v.task){
 case 'composite':content=v.variant==='notch'?<NotchedPlan n={n}/>:<LPlan n={n}/>;break;
 case 'packing':content=<PackingScene n={n}/>;break;
 case 'house':content=<House n={n}/>;break;
 case 'prism':content=v.variant==='triangular'?<TriPrism n={n} unit={v.unit??'cm'}/>:<RectPrism dims={n} unit={v.unit??'cm'}/>;break;
 case 'circle':content=<Circle v={v}/>;break;
 case 'rightTriangle':content=<RightTriangle v={v}/>;break;
 case 'diagonal':{const s=Math.min(320/n[0],210/n[1]),x=110,y=45,w=n[0]*s,h=n[1]*s;content=<Frame><rect x={x} y={y} width={w} height={h} fill={fill} stroke={line} strokeWidth="3"/><path d={`M${x} ${y+h}L${x+w} ${y}`} stroke={ink} strokeWidth="3" strokeDasharray="7 5"/>{txt(x+w/2,y+h+30,`${n[0]} m`)}{txt(x+w+18,y+h/2,`${n[1]} m`,'start')}{txt(x+w/2+20,y+h/2+25,'x')}</Frame>;break;}
 case 'timezone':content=<div className="flex flex-wrap justify-center gap-3">{v.rows?.map(row=><div key={row.label} className="min-w-0 flex-1 rounded-xl border border-amber-200 bg-white p-4 text-center" style={{flexBasis:210}}><CityScene city={row.label}/><p className="text-lg font-bold">{row.label}</p><p className="my-2 font-semibold">UTC{row.offset>=0?'+':''}{row.offset}</p><p className="text-xl font-black">{row.detail}</p></div>)}</div>;break;
 case 'rate':case 'model':content=<div className="flex flex-col items-center gap-3">{v.variant==='map'||v.variant==='mapRoute'?<MapRoute v={v}/>:v.variant==='paint'?<Year7ContextArt kind="paint"/>:v.variant==='coach'||v.variant==='train'?<TravelScene coach={v.variant==='coach'}/>:v.variant==='fuel'?<img src="/images/measurelands/everyday-3d/object-car.png" alt="" className="h-32 w-44 object-contain"/>:<WaterFlow tank={v.task==='model'}/>}{v.labels?.map(label=><p key={label} className="text-center text-lg font-bold">{label}</p>)}</div>;break;
 }
 return <Orientation.Provider value={v.orientation??0}><div className="w-full rounded-2xl border-2 border-amber-300 bg-[#fffaf0] p-4 text-amber-950 sm:p-6"><div className="mb-3 flex justify-end"><ReadAloudBtn text={measurement8Speech(v)} label="Read diagram" size="sm" className="!border-amber-600 !bg-[#fffaf0] !text-amber-900"/></div><p className="mb-3 text-center text-lg font-bold">{v.description}</p>{!['model','rate'].includes(v.task)&&v.labels?.map(label=><p className="mb-3 text-center text-lg font-bold" key={label}>{label}</p>)}{content}</div></Orientation.Provider>;
}
