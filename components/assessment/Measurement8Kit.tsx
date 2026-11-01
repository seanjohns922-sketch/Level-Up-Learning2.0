"use client";
import {Children,cloneElement,createContext,isValidElement,useContext,useId,type ReactNode,type ReactElement} from 'react';
import type {Measurement8Visual} from '@/data/assessments/revisions/year8MeasurementFiveForms';

// Shared drawing kit for Level 8 Measurement. Every measurement appears once,
// on the shape; the unknown is always orange; proportions come from the data.
export const INK='#3c2a63',PANEL='#f6f3fb',ORANGE='#ffb12e',ORANGE_LINE='#c76f00',ORANGE_TEXT='#2b1800',VIOLET='#6d3bd1';
export const W=760,H=440;
export type Material=NonNullable<Measurement8Visual['material']>;
export type Kit={u:(name:string)=>string;id:string};
export function useKit():Kit{const id=useId().replace(/[^a-zA-Z0-9]/g,'');return{id,u:name=>`url(#m8${id}-${name})`};}
export const Orientation=createContext(0);

function Defs({id}:{id:string}){
 const n=(name:string)=>`m8${id}-${name}`;
 return <defs>
  <pattern id={n('grass')} width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#5fae4e"/><path d="M4 8l2-5M12 20l2-6M20 11l-2-5M7 23l-1-4M23 22l1-5" stroke="#3f8f3a" strokeWidth="2" strokeLinecap="round"/><path d="M15 6l1-4M2 16l2-4" stroke="#8fd076" strokeWidth="2" strokeLinecap="round"/></pattern>
  <pattern id={n('timber')} width="96" height="40" patternUnits="userSpaceOnUse"><rect width="96" height="40" fill="#c99a63"/><rect y="20" width="96" height="20" fill="#bd8c56"/><path d="M0 0H96M0 20H96M34 0V20M78 20V40" stroke="#8f6236" strokeWidth="1.5"/></pattern>
  <pattern id={n('paving')} width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#c9c6cf"/><path d="M0 0H44V44" fill="none" stroke="#9c98a6" strokeWidth="2"/></pattern>
  <pattern id={n('brick')} width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="#b9694a"/><path d="M0 0H60M0 15H60M30 0V15M0 15V30M60 15V30" stroke="#e8cdbb" strokeWidth="2"/></pattern>
  <pattern id={n('cement')} width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#a7adb6"/><circle cx="3" cy="3" r="1" fill="#8a919c"/><circle cx="8" cy="7" r="1" fill="#c3c8cf"/></pattern>
  <pattern id={n('sand')} width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#e6c57f"/><circle cx="3" cy="4" r="1.3" fill="#c9a256"/><circle cx="9" cy="9" r="1.3" fill="#f3dfae"/></pattern>
  <pattern id={n('gravel')} width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="#7f8087"/><ellipse cx="9" cy="10" rx="7" ry="5" fill="#a0a1a8"/><ellipse cx="24" cy="7" rx="6" ry="5" fill="#65666d"/><ellipse cx="22" cy="23" rx="8" ry="6" fill="#94959c"/><ellipse cx="6" cy="25" rx="5" ry="4" fill="#6e6f76"/></pattern>
  <linearGradient id={n('violet')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9a6cf0"/><stop offset="1" stopColor="#5a2fc2"/></linearGradient>
  <linearGradient id={n('violetSide')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7a4fdc"/><stop offset="1" stopColor="#4a249f"/></linearGradient>
  <linearGradient id={n('violetTop')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d3c0f7"/><stop offset="1" stopColor="#a98be8"/></linearGradient>
  <linearGradient id={n('water')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5cc4ee"/><stop offset="1" stopColor="#1d7fc0"/></linearGradient>
  <linearGradient id={n('waterSide')} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2f96d4"/><stop offset="1" stopColor="#1668a6"/></linearGradient>
  <linearGradient id={n('steel')} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c7ccd6"/><stop offset="1" stopColor="#868e9c"/></linearGradient>
  <filter id={n('shadow')} x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#2a1a4a" floodOpacity=".28"/></filter>
 </defs>;
}

// Reflect geometry while counter-reflecting its text so measurements stay readable.
function uprightText(nodes:ReactNode,sx:number,sy:number):ReactNode{return Children.map(nodes,node=>{
 if(!isValidElement(node))return node;
 const el=node as ReactElement<{x?:number;y?:number;children?:ReactNode;transform?:string;textAnchor?:string;'data-flipdy'?:number}>;
 if(el.type==='text'){const x=Number(el.props.x),y=Number(el.props.y),dy=el.props['data-flipdy']??16,ny=sy<0?y+dy:y;return cloneElement(el,{y:ny,transform:`translate(${x} ${ny}) scale(${sx} ${sy}) translate(${-x} ${-ny})`,textAnchor:sx<0&&el.props.textAnchor==='start'?'end':sx<0&&el.props.textAnchor==='end'?'start':el.props.textAnchor});}
 return el.props.children?cloneElement(el,{},uprightText(el.props.children,sx,sy)):el;
});}
export function Frame({k,children,horizontalOnly=false,height=H}:{k:Kit;children:ReactNode;horizontalOnly?:boolean;height?:number}){
 const o=useContext(Orientation),sx=o%2?-1:1,sy=!horizontalOnly&&o>1?-1:1;
 return <svg viewBox={`0 0 ${W} ${height}`} aria-hidden="true" data-orientation={o} style={{width:'100%',maxHeight:400,display:'block',margin:'auto'}}><Defs id={k.id}/><g transform={`translate(${sx<0?W:0} ${sy<0?height:0}) scale(${sx} ${sy})`}>{uprightText(children,sx,sy)}</g></svg>;
}

const isUnknown=(t:string)=>t.includes('?')||/^x\b/.test(t);
/** A measurement on the drawing. Unknowns are always the orange chip. */
export function Lab(x:number,y:number,text:string,{bg=PANEL,size=24}:{bg?:string;size?:number}={}){
 const un=isUnknown(text),w=text.length*size*.54+18;
 return <g><rect x={x-w/2} y={y-size*.75} width={w} height={size*1.5} rx="8" fill={un?ORANGE:bg}/><text x={x} y={y+size*.36} data-flipdy={-size*.72} textAnchor="middle" fontSize={size} fontWeight="700" fill={un?ORANGE_TEXT:INK}>{text}</text></g>;
}
const head=(x:number,y:number,dx:number,dy:number,c:string)=>{const l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;return <path d={`M${x} ${y}L${x-ux*11-uy*5} ${y-uy*11+ux*5}L${x-ux*11+uy*5} ${y-uy*11-ux*5}Z`} fill={c}/>;};
/** A dimension line with arrowheads and its value in the middle. */
export function Dim(x1:number,y1:number,x2:number,y2:number,text:string,o:{bg?:string}={}){
 const un=isUnknown(text),c=un?ORANGE_LINE:INK,len=Math.hypot(x2-x1,y2-y1),chip=text.length*13+18,tight=len<chip+14,dir=x2-x1||0;
 // A short edge keeps its arrows clear and carries the value just outside the line.
 const lx=(x1+x2)/2+(tight&&!dir?-(chip/2+10):0),ly=(y1+y2)/2+(tight&&dir?-26:0);
 return <g><path d={`M${x1} ${y1}L${x2} ${y2}`} stroke={c} strokeWidth={un?3:2.5}/>{head(x1,y1,x1-x2,y1-y2,c)}{head(x2,y2,x2-x1,y2-y1,c)}{text?Lab(lx,ly,text,o):null}</g>;
}
export const matFill=(k:Kit,m?:Material)=>m==='grass'||m==='timber'||m==='paving'||m==='brick'?k.u(m):m==='water'?k.u('water'):k.u('violet');
export const matStroke=(m?:Material)=>m==='grass'?'#2f6b2c':m==='timber'?'#7a4f27':m==='brick'?'#7c3f2a':m==='water'?'#14598f':m==='paving'?'#6d6978':INK;
export const shade=(k:Kit)=>({filter:k.u('shadow')});
export const rightMark=(x:number,y:number,dx:number,dy:number,c=INK)=><path d={`M${x+dx*20} ${y}V${y+dy*20}H${x}`} fill="none" stroke={c} strokeWidth="2.5"/>;

/** Oblique box: x,y is the front bottom-left corner; sizes are in pixels. */
export function Box(k:Kit,x:number,y:number,w:number,h:number,d:number,o:{water?:number;mat?:'violet'|'timber'|'steel'}={}){
 const dx=d*.62,dy=-d*.42,t=y-h,c={stroke:INK,strokeWidth:3,strokeLinejoin:'round' as const};
 const faces=o.mat==='timber'?[k.u('timber'),'#a97a48','#ddb785']:o.mat==='steel'?[k.u('steel'),'#7c8494','#dfe3ea']:[k.u('violet'),k.u('violetSide'),k.u('violetTop')];
 if(o.water!==undefined){const wh=h*o.water,wt=y-wh;return <g>
  <path d={`M${x} ${y}H${x+w}L${x+w+dx} ${y+dy}H${x+dx}Z`} fill="#2a1a4a" opacity=".18" {...shade(k)}/>
  <path d={`M${x+w} ${y}L${x+w+dx} ${y+dy}V${wt+dy}L${x+w} ${wt}Z`} fill={k.u('waterSide')}/><path d={`M${x} ${wt}L${x+dx} ${wt+dy}H${x+w+dx}L${x+w} ${wt}Z`} fill="#9fe0f7"/><rect x={x} y={wt} width={w} height={wh} fill={k.u('water')}/>
  <path d={`M${x} ${t}H${x+w}V${y}H${x}ZM${x+w} ${t}L${x+w+dx} ${t+dy}V${y+dy}L${x+w} ${y}M${x} ${t}L${x+dx} ${t+dy}H${x+w+dx}`} fill="none" {...c}/>
  <path d={`M${x+dx} ${t+dy}V${y+dy}H${x+w+dx}M${x} ${y}L${x+dx} ${y+dy}`} fill="none" stroke={INK} strokeWidth="2" strokeDasharray="7 6"/>
 </g>;}
 return <g><g {...shade(k)}><path d={`M${x} ${t}H${x+w}V${y}H${x}Z`} fill={faces[0]} {...c}/></g><path d={`M${x+w} ${t}L${x+w+dx} ${t+dy}V${y+dy}L${x+w} ${y}Z`} fill={faces[1]} {...c}/><path d={`M${x} ${t}L${x+dx} ${t+dy}H${x+w+dx}L${x+w} ${t}Z`} fill={faces[2]} {...c}/></g>;
}
/** Pixel sizes for a box, keeping thin dimensions visible. */
export function boxFit(l:number,w:number,h:number,maxW=400,maxH=280){
 const big=Math.max(l,w,h),cl=Math.max(l,big*.28),cw=Math.max(w,big*.28),ch=Math.max(h,big*.22),s=Math.min(maxW/(cl+cw*.62),maxH/(ch+cw*.42));
 return{w:cl*s,h:ch*s,d:cw*s};
}
export function TriPrism(k:Kit,base:string,height:string,length:string,b:number,h:number,l:number){
 const s=Math.min(240/Math.max(b,1),270/Math.max(h,1)),bw=Math.max(b*s,120),ht=Math.max(h*s,110),len=Math.min(Math.max(l>0?l*s:190,130),250),x=120,y=360,dx=len*.86,dy=-len*.36,ax=x+bw/2,ay=y-ht;
 return <>
  <path d={`M${x+bw} ${y}L${x+bw+dx} ${y+dy}L${ax+dx} ${ay+dy}L${ax} ${ay}Z`} fill={k.u('violetTop')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/>
  <g {...shade(k)}><path d={`M${x} ${y}L${ax} ${ay}L${x+bw} ${y}Z`} fill={k.u('violet')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/></g>
  <path d={`M${ax} ${ay}V${y}`} stroke="#fff" strokeWidth="2.5" strokeDasharray="8 6"/><path d={`M${ax} ${y-16}h16v16`} fill="none" stroke="#fff" strokeWidth="2.5"/>
  {Lab(ax-46,y-ht*.42,height,{bg:'#fff'})}
  {Dim(x,y+32,x+bw,y+32,base)}
  {Dim(x+bw+22,y+22,x+bw+dx+22,y+dy+22,length)}
 </>;
}
export function WallPlan({n}:{n:number[]}){
 const k=useKit(),s=Math.min(470/n[0],270/n[1]),w=n[0]*s,h=n[1]*s,x=(W-w)/2,y=(H-h)/2+6;
 return <Frame k={k}><g {...shade(k)}><rect x={x} y={y} width={w} height={h} fill={k.u('brick')} stroke="#7c3f2a" strokeWidth="3"/></g>{Dim(x,y+h+28,x+w,y+h+28,`${n[0]} m`)}{Dim(x-36,y,x-36,y+h,`${n[1]} m`)}</Frame>;
}
export function Facts({items}:{items:string[]}){
 if(!items.length)return null;
 return <div className="mt-3 flex flex-wrap justify-center gap-2">{items.map(item=><span key={item} className="rounded-lg px-3 py-1 text-base font-bold" style={item.includes('?')?{background:ORANGE,color:ORANGE_TEXT}:{background:'#e7e0f5',color:INK}}>{item}</span>)}</div>;
}

/** Edge labels in order: top, inner vertical, inner horizontal, lower right, bottom, left. A custom label (e.g. "x") replaces the length. */
export function lPlanLabels(n:number[],labels?:string[]){const[w,h,cw,ch]=n;return [w-cw,ch,cw,h-ch,w,h].map((len,i)=>labels?.[i]??`${len} m`);}

// ── Plans used by the question forms and the post-tests ──────────────────────
export function LPlan({n,labels,mat}:{n:number[];labels?:string[];mat?:Material}){
 const k=useKit(),[w,h,cw,ch]=n,s=Math.min(430/w,280/h),X=(W-w*s)/2,Y=(H-h*s)/2+6,l=lPlanLabels(n,labels);
 const pts=[[0,0],[w-cw,0],[w-cw,ch],[w,ch],[w,h],[0,h]].map(([a,b])=>`${X+a*s},${Y+b*s}`).join(' '),split=X+(w-cw)*s,right=X+w*s,bottom=Y+h*s,step=Y+ch*s;
 return <Frame k={k}><g {...shade(k)}><polygon points={pts} fill={matFill(k,mat)}/></g><polygon points={pts} fill="none" stroke={matStroke(mat)} strokeWidth="3.5" strokeLinejoin="round"/>
  {Dim(X,Y-26,split,Y-26,l[0])}{Dim(split,Y-26,right,Y-26,l[2])}{Dim(right+30,Y,right+30,step,l[1])}{Dim(right+30,step,right+30,bottom,l[3])}{Dim(X,bottom+28,right,bottom+28,l[4])}{Dim(X-34,Y,X-34,bottom,l[5])}
 </Frame>;
}
export function NotchedPlan({n,mat}:{n:number[];mat?:Material}){
 const k=useKit(),[w,h,cw,ch]=n,s=Math.min(450/w,270/h),X=(W-w*s)/2,Y=(H-h*s)/2+6,arm=(w-cw)/2;
 const pts=[[0,0],[arm,0],[arm,ch],[arm+cw,ch],[arm+cw,0],[w,0],[w,h],[0,h]].map(([a,b])=>`${X+a*s},${Y+b*s}`).join(' ');
 return <Frame k={k}><g {...shade(k)}><polygon points={pts} fill={matFill(k,mat)}/></g><polygon points={pts} fill="none" stroke={matStroke(mat)} strokeWidth="3.5" strokeLinejoin="round"/>
  {Dim(X,Y-26,X+arm*s,Y-26,`${arm} m`)}{Dim(X+arm*s,Y-26,X+(arm+cw)*s,Y-26,`${cw} m`)}{Dim(X+(arm+cw)*s,Y-26,X+w*s,Y-26,`${arm} m`)}
  {Dim(X+w*s/2,Y,X+w*s/2,Y+ch*s,`${ch} m`)}{Dim(X-34,Y,X-34,Y+h*s,`${h} m`)}{Dim(X+w*s+34,Y,X+w*s+34,Y+h*s,`${h} m`)}{Dim(X,Y+h*s+28,X+w*s,Y+h*s+28,`${w} m`)}
 </Frame>;
}
export function House({n}:{n:number[]}){
 const k=useKit(),[w,h,r]=n,s=Math.min(400/w,300/(h+r)),bw=w*s,hh=h*s,rr=r*s,x=(W-bw)/2,y=382,top=y-hh,peak=top-rr,cx=x+bw/2;
 return <Frame k={k} horizontalOnly><g {...shade(k)}><rect x={x} y={top} width={bw} height={hh} fill={k.u('timber')} stroke="#7a4f27" strokeWidth="3"/></g><path d={`M${x-10} ${top}L${cx} ${peak}L${x+bw+10} ${top}Z`} fill="#6a5a7f" stroke={INK} strokeWidth="3" strokeLinejoin="round"/>
  <path d={`M${x+bw+10} ${top}H${x+bw+48}M${cx} ${peak}H${x+bw+48}`} stroke={INK} strokeWidth="1.5" strokeDasharray="5 5"/>{Dim(x+bw+40,top,x+bw+40,peak,`${r} m`)}{Dim(x-34,y,x-34,top,`${h} m`)}{Dim(x,y+28,x+bw,y+28,`${w} m`)}
 </Frame>;
}
export function RectPrismPlan({n,unit,water}:{n:number[];unit:string;water?:boolean}){
 const k=useKit(),[l,w,h]=n,f=boxFit(l,w,h),x=(W-f.w-f.d*.62)/2-10,y=372;
 return <Frame k={k}>{Box(k,x,y,f.w,f.h,f.d,water?{water:.72}:{})}{Dim(x,y+30,x+f.w,y+30,`${l} ${unit}`)}{Dim(x-32,y,x-32,y-f.h,`${h} ${unit}`)}{Dim(x+f.w+26,y+12,x+f.w+f.d*.62+26,y-f.d*.42+12,`${w} ${unit}`)}</Frame>;
}
export function TriPrismPlan({n,unit}:{n:number[];unit:string}){const k=useKit();return <Frame k={k}>{TriPrism(k,`${n[0]} ${unit}`,`${n[1]} ${unit}`,`${n[2]} ${unit}`,n[0],n[1],n[2])}</Frame>;}
export function PackingPlan({n}:{n:number[]}){
 const k=useKit(),[l,w,h,a,b,c]=n,f=boxFit(l,w,h,300,250),x=156,y=366,s=f.w/l,ax=Math.max(a*s,26),aw=Math.max(c*s,26),ad=Math.max(b*s,26);
 return <Frame k={k}>{Box(k,x,y,f.w,f.h,f.d,{mat:'timber'})}{Dim(x,y+30,x+f.w,y+30,`${l} cm`)}{Dim(x-32,y,x-32,y-f.h,`${h} cm`)}{Dim(x+f.w+24,y+12,x+f.w+f.d*.62+24,y-f.d*.42+12,`${w} cm`)}
  {Box(k,600,300,ax,aw,ad)}{Lab(640,348,a===b&&b===c?`${a} cm cube`:`${a} × ${b} × ${c} cm`,{size:20})}
 </Frame>;
}
export function RightTrianglePlan({v}:{v:Measurement8Visual}){
 const k=useKit(),[a,b,c]=v.values,u=v.unit??'cm',ladder=v.variant==='ladder',da=Math.max(a,b*.3),db=Math.max(b,a*.3),s=Math.min(380/da,300/db),w=da*s,h=db*s,x=ladder?210:(W-w)/2-20,y=ladder?386:368,side=v.unknown==='height'?`x ${u}`:`${b} ${u}`,hyp=v.unknown==='hypotenuse'?`x ${u}`:`${c} ${u}`,foot=`${a} ${u}`;
 if(ladder){const len=Math.hypot(w,h),nx=h/len*11,ny=w/len*11,rungs=Math.max(5,Math.round(len/44));return <Frame k={k} horizontalOnly><rect x={x-110} y={y-h-30} width="110" height={h+30} fill={k.u('brick')}/><rect y={y} width={W} height={H-y} fill="#7cb86a"/><rect y={y} width={W} height="5" fill="#5a9650"/>
  <g stroke="#8f98a8" strokeWidth="9" strokeLinecap="round"><path d={`M${x-nx} ${y-h-ny}L${x+w-nx} ${y-ny}`}/><path d={`M${x+nx} ${y-h+ny}L${x+w+nx} ${y+ny}`}/></g>
  {Array.from({length:rungs},(_,i)=>{const t=(i+.6)/rungs,px=x+w*t,py=y-h+h*t;return <path key={i} d={`M${px-nx} ${py-ny}L${px+nx} ${py+ny}`} stroke="#b6bdc9" strokeWidth="6"/>;})}
  {rightMark(x,y-20,1,1,'#fff')}{Dim(x-142,y,x-142,y-h,side)}{Dim(x+6,y+28,x+w,y+28,foot,{bg:'#7cb86a'})}{Lab(x+w/2+64,y-h/2-10,hyp)}</Frame>;}
 return <Frame k={k} horizontalOnly><g {...shade(k)}><path d={`M${x} ${y}H${x+w}L${x} ${y-h}Z`} fill={k.u('violet')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/></g>{rightMark(x,y-20,1,1,'#fff')}{Dim(x,y+30,x+w,y+30,foot)}{Dim(x-34,y,x-34,y-h,side)}{Lab(x+w/2+58,y-h/2-16,hyp)}</Frame>;
}
export function CirclePlan({v}:{v:Measurement8Visual}){
 const k=useKit(),n=v.values,u=v.unit??'cm',cx=W/2,cy=222,r=172,semi=v.variant==='semicircle',ring=v.variant==='ring',round=matFill(k,v.material),edge=matStroke(v.material);
 if(semi)return <Frame k={k}><g {...shade(k)}><path d={`M${cx-r} ${cy+80}A${r} ${r} 0 0 1 ${cx+r} ${cy+80}Z`} fill={round} stroke={edge} strokeWidth="3.5"/></g>{Dim(cx-r,cy+112,cx+r,cy+112,`${n[0]} ${u}`)}</Frame>;
 if(ring){const i=r*n[1]/n[0];return <Frame k={k}><g {...shade(k)}><circle cx={cx} cy={cy} r={r} fill={round} stroke={edge} strokeWidth="3.5"/></g><circle cx={cx} cy={cy} r={i} fill={PANEL} stroke={edge} strokeWidth="3"/>{Dim(cx,cy,cx+r,cy,`${n[0]} m`,{bg:'#fff'})}{Dim(cx,cy,cx,cy-i,`${n[1]} m`,{bg:'#fff'})}</Frame>;}
 const dia=v.variant==='diameter',unknown=v.variant==='unknownRadius',t=unknown?'r = ?':`${n[0]} ${u}`;
 return <Frame k={k}><g {...shade(k)}><circle cx={cx} cy={cy} r={r} fill={round} stroke={edge} strokeWidth="3.5"/></g><ellipse cx={cx-52} cy={cy-74} rx="74" ry="40" fill="#fff" opacity=".13"/><circle cx={cx} cy={cy} r="5" fill="#fff"/>{dia?Dim(cx-r,cy,cx+r,cy,t,{bg:'#fff'}):Dim(cx,cy,cx+r,cy,t,{bg:'#fff'})}</Frame>;
}
export function DiagonalPlan({n}:{n:number[]}){
 const k=useKit(),s=Math.min(430/n[0],280/n[1]),w=n[0]*s,h=n[1]*s,x=(W-w)/2,y=(H-h)/2+6;
 return <Frame k={k}><g {...shade(k)}><rect x={x} y={y} width={w} height={h} fill={k.u('timber')} stroke="#7a4f27" strokeWidth="3.5"/></g><path d={`M${x} ${y+h}L${x+w} ${y}`} stroke={ORANGE_LINE} strokeWidth="4" strokeDasharray="10 7"/>{Lab(x+w/2,y+h/2,'x')}{Dim(x,y+h+28,x+w,y+h+28,`${n[0]} m`)}{Dim(x+w+34,y,x+w+34,y+h,`${n[1]} m`)}</Frame>;
}
export function ShapePlan({v}:{v:Measurement8Visual}){
 const k=useKit(),n=v.values,u=v.unit??'cm';
 const fit=(a:number,b:number,mw=400,mh=270)=>{const s=Math.min(mw/a,mh/b),w=Math.max(a*s,170),h=Math.max(b*s,120);return{s,w,h,x:(W-w)/2,y:(H-h)/2+4};};
 const tick=(x1:number,y1:number,x2:number,y2:number)=>{const mx=(x1+x2)/2,my=(y1+y2)/2,d=Math.hypot(x2-x1,y2-y1),px=-(y2-y1)/d*9,py=(x2-x1)/d*9;return <path d={`M${mx-px} ${my-py}L${mx+px} ${my+py}`} stroke={INK} strokeWidth="3"/>;};
 switch(v.variant){
 case 'fence':{const[l,w,g]=n,b=fit(l,w),gap=g?Math.max(g*b.s,46):0,gx=b.x+b.w/2-gap/2,base=b.y+b.h,path=g?`M${gx} ${base}H${b.x}V${b.y}H${b.x+b.w}V${base}H${gx+gap}`:`M${b.x} ${b.y}H${b.x+b.w}V${base}H${b.x}Z`,posts=[[b.x,b.y],[b.x+b.w,b.y],[b.x,base],[b.x+b.w,base],...(g?[[gx,base],[gx+gap,base]]:[])];
  return <Frame k={k}><g {...shade(k)}><rect x={b.x} y={b.y} width={b.w} height={b.h} fill={k.u('grass')}/></g><path d={path} fill="none" stroke="#7a4f27" strokeWidth="11"/><path d={path} fill="none" stroke="#c28d55" strokeWidth="7" strokeDasharray="13 4"/>{posts.map(([x,y],i)=><rect key={i} x={x-7} y={y-7} width="14" height="14" rx="2" fill="#5b3b20"/>)}{g?<path d={`M${gx} ${base}L${gx+gap*.65} ${base+30}`} stroke={ORANGE_LINE} strokeWidth="9" strokeLinecap="round"/>:null}
  {Dim(b.x,b.y-30,b.x+b.w,b.y-30,`${l} ${u}`)}{Dim(b.x+b.w+34,b.y,b.x+b.w+34,base,`${w} ${u}`)}{g?<text x={W/2} y={base+44} data-flipdy={-18} textAnchor="start" fontSize="24" fontWeight="700" fill="#9a5400" dx="30">gate {g} {u}</text>:null}</Frame>;}
 case 'surround':{const[l,w,f]=n,b=fit(l+2*f,w+2*f),band=Math.max(f*b.s,24),lawn=v.edgeLabels?.[0]==='Lawn';
  return <Frame k={k}><g {...shade(k)}><rect x={b.x} y={b.y} width={b.w} height={b.h} fill={lawn?k.u('paving'):k.u('timber')} stroke={lawn?'#6d6978':'#7a4f27'} strokeWidth="3"/></g><rect x={b.x+band} y={b.y+band} width={b.w-2*band} height={b.h-2*band} fill={lawn?k.u('grass'):'#efeaf8'} stroke={INK} strokeWidth="2.5"/>
  {Lab(W/2,b.y+band+30,`${l} ${u}`,{bg:'#fff'})}{Lab(W/2,b.y+b.h/2+16,v.edgeLabels?.[0]??'',{bg:'#fff',size:20})}{Lab(b.x+b.w-band-48,b.y+b.h/2+16,`${w} ${u}`,{bg:'#fff'})}<path d={`M${b.x} ${b.y+b.h+8}v18M${b.x+band} ${b.y+b.h+8}v18M${b.x} ${b.y+b.h+18}h${band}`} stroke={INK} strokeWidth="2.5"/>{Lab(b.x+band/2,b.y+b.h+46,`${f} ${u}`)}</Frame>;}
 case 'wordRect':return <Frame k={k}><g {...shade(k)}><rect x="190" y="110" width="380" height="210" fill={k.u('grass')} stroke="#2f6b2c" strokeWidth="3.5"/></g>{Dim(190,80,570,80,'length')}{Dim(604,110,604,320,'width')}</Frame>;
 case 'isosceles':{const L=180,R=580,B=360,T=60;return <Frame k={k}><g {...shade(k)}><path d={`M${L} ${B}H${R}L380 ${T}Z`} fill={k.u('violet')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/></g>{tick(L,B,380,T)}{tick(R,B,380,T)}{Dim(L,B+32,R,B+32,`${n[0]} ${u}`)}{Lab(232,190,'?')}{Lab(528,190,'?')}</Frame>;}
 case 'trapezium':{const[a,b]=n,s=440/b,bw=b*s,aw=a*s,L=(W-bw)/2,B=340,T=120,tl=L+(bw-aw)/2;return <Frame k={k}><g {...shade(k)}><path d={`M${L} ${B}H${L+bw}L${tl+aw} ${T}H${tl}Z`} fill={k.u('violet')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/></g>{tick(L,B,tl,T)}{tick(L+bw,B,tl+aw,T)}{Dim(tl,T-30,tl+aw,T-30,`${a} ${u}`)}{Dim(L,B+32,L+bw,B+32,`${b} ${u}`)}{Lab(L-14,(B+T)/2,'?')}{Lab(L+bw+14,(B+T)/2,'?')}</Frame>;}
 case 'joined':{const sides=n[0],side=sides>5?104:sides===5?124:150,bx=430,by=(H-side)/2,pts:[number,number][]=[[bx,by+side],[bx,by]];let a=-Math.PI/2;for(let i=2;i<sides;i++){a-=2*Math.PI/sides;const[px,py]=pts[i-1];pts.push([px+side*Math.cos(a),py+side*Math.sin(a)]);}
  const apex:[number,number]=[bx+side*Math.sqrt(3)/2,by+side/2],outer=[pts[1],...pts.slice(2),pts[0],apex,pts[1]];
  return <Frame k={k}><g {...shade(k)}><polygon points={pts.map(p=>p.join(',')).join(' ')} fill={k.u('violet')}/></g><polygon points={`${bx},${by} ${apex.join(',')} ${bx},${by+side}`} fill={k.u('violetTop')}/><path d={`M${outer.map(p=>p.join(' ')).join('L')}Z`} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round"/><path d={`M${bx} ${by}V${by+side}`} stroke="#fff" strokeWidth="2.5" strokeDasharray="7 6"/>{outer.slice(0,-1).map((p,i)=><g key={i}>{tick(p[0],p[1],outer[i+1][0],outer[i+1][1])}</g>)}{Lab(apex[0]+6,by+side*.05,'?')}</Frame>;}
 default:return null;
 }
}
