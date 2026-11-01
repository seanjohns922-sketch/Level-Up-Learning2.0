"use client";
import type {Measurement8Visual} from '@/data/assessments/revisions/year8MeasurementFiveForms';
import {Dim,Facts,Frame,H,INK,Lab,ORANGE,ORANGE_LINE,ORANGE_TEXT,PANEL,shade,useKit,type Kit} from './Measurement8Kit';

// Time, journey, fuel and flow scenes for Level 8 Measurement.
const after=(label?:string)=>label?.split(': ').slice(1).join(': ')??'';
const find=(labels:string[],...names:string[])=>labels.find(l=>names.some(n=>l.startsWith(`${n}:`)));

const CLOCK=/(\d{1,2}):(\d{2})/g;
/** Analog face for one stated time. Faces are neutral so daylight is never evidence. */
function Clock({detail}:{detail:string}){
 const times=[...detail.matchAll(CLOCK)],unknown=detail.includes('?');
 if(times.length>1)return null;
 const [h,m]=times[0]?[Number(times[0][1]),Number(times[0][2])]:[0,0],ma=m/60*2*Math.PI,ha=((h%12)+m/60)/12*2*Math.PI;
 return <svg viewBox="0 0 120 120" aria-hidden="true" className="mx-auto" style={{width:112,height:112}}>
  <circle cx="60" cy="60" r="55" fill="#fff" stroke={unknown?ORANGE_LINE:INK} strokeWidth="5"/>
  {Array.from({length:12},(_,i)=>{const a=i/12*2*Math.PI;return <path key={i} d={`M${60+45*Math.sin(a)} ${60-45*Math.cos(a)}L${60+(i%3?41:37)*Math.sin(a)} ${60-(i%3?41:37)*Math.cos(a)}`} stroke={INK} strokeWidth={i%3?1.5:3}/>;})}
  {unknown?<text x="60" y="78" textAnchor="middle" fontSize="50" fontWeight="800" fill={ORANGE_LINE}>?</text>:<><path d={`M60 60L${60+24*Math.sin(ha)} ${60-24*Math.cos(ha)}`} stroke={INK} strokeWidth="6" strokeLinecap="round"/><path d={`M60 60L${60+36*Math.sin(ma)} ${60-36*Math.cos(ma)}`} stroke="#6d3bd1" strokeWidth="4" strokeLinecap="round"/><circle cx="60" cy="60" r="5" fill={INK}/></>}
 </svg>;
}
const utc=(offset:number)=>`UTC${offset>=0?'+':'−'}${Math.floor(Math.abs(offset))}${Math.abs(offset)%1?':30':''}`;
export function TimeZoneBoard({rows}:{rows:NonNullable<Measurement8Visual['rows']>}){
 const k=useKit(),lo=-10,hi=14,x=(o:number)=>40+(o-lo)/(hi-lo)*680,sorted=[...rows].sort((a,b)=>a.offset-b.offset);
 return <div className="w-full">
  <Frame k={k} horizontalOnly height={124}><rect x="40" y="58" width="680" height="14" rx="7" fill="#d9cff0"/>
   {Array.from({length:hi-lo+1},(_,i)=><path key={i} d={`M${x(lo+i)} ${(lo+i)%6?60:54}V${(lo+i)%6?70:76}`} stroke={INK} strokeWidth={(lo+i)%6?1.5:2.5}/>)}
   <text x={x(0)} y="100" textAnchor="middle" fontSize="18" fontWeight="700" fill={INK}>UTC</text>
   {sorted.map((r,i)=><g key={r.label}><circle cx={x(r.offset)} cy="65" r="10" fill="#6d3bd1" stroke="#fff" strokeWidth="3"/>{Lab(Math.min(Math.max(x(r.offset)+(sorted.length>1&&Math.abs(sorted[1].offset-sorted[0].offset)<3?(i?46:-46):0),76),684),i%2?100:28,r.label.replace(/ (departure|arrival)$/,''),{size:19})}</g>)}
  </Frame>
  <div className="mt-2 flex flex-wrap justify-center gap-3">{rows.map(row=>{const unknown=row.detail.includes('?');return <div key={row.label} className="min-w-0 flex-1 rounded-xl bg-white p-3 text-center shadow-md" style={{flexBasis:190}}>
   <p className="text-lg font-bold" style={{color:INK}}>{row.label}</p><p className="mb-2 text-sm font-bold" style={{color:'#6d3bd1'}}>{utc(row.offset)}</p><Clock detail={row.detail}/>
   <p className="mt-2 inline-block rounded-lg px-3 py-1 text-xl font-black" style={unknown?{background:ORANGE,color:ORANGE_TEXT}:{color:INK}}>{row.detail}</p></div>;})}</div>
 </div>;
}

const coach=(k:Kit,x:number,y:number)=><g {...shade(k)}><rect x={x} y={y-62} width="176" height="52" rx="10" fill={k.u('violet')} stroke={INK} strokeWidth="2.5"/>{[12,48,84,120].map(d=><rect key={d} x={x+d} y={y-54} width="28" height="20" rx="3" fill="#d9f0fb"/>)}<rect x={x+154} y={y-54} width="18" height="22" rx="3" fill="#d9f0fb"/><circle cx={x+38} cy={y-8} r="11" fill="#27222f"/><circle cx={x+138} cy={y-8} r="11" fill="#27222f"/></g>;
const train=(k:Kit,x:number,y:number)=><g {...shade(k)}><path d={`M${x} ${y-64}H${x+150}Q${x+190} ${y-58} ${x+200} ${y-12}H${x}Z`} fill={k.u('violet')} stroke={INK} strokeWidth="2.5" strokeLinejoin="round"/>{[12,48,84].map(d=><rect key={d} x={x+d} y={y-54} width="28" height="20" rx="3" fill="#d9f0fb"/>)}<path d={`M${x+128} ${y-54}H${x+152}Q${x+170} ${y-50} ${x+176} ${y-34}H${x+128}Z`} fill="#d9f0fb"/>{[30,100,160].map(d=><circle key={d} cx={x+d} cy={y-8} r="8" fill="#27222f"/>)}</g>;
const car=(k:Kit,x:number,y:number)=><g {...shade(k)}><path d={`M${x} ${y-14}V${y-34}Q${x} ${y-42} ${x+12} ${y-44}L${x+42} ${y-68}H${x+104}L${x+136} ${y-44}Q${x+160} ${y-42} ${x+160} ${y-30}V${y-14}Z`} fill={k.u('violet')} stroke={INK} strokeWidth="2.5" strokeLinejoin="round"/><path d={`M${x+50} ${y-62}H${x+78}V${y-44}H${x+30}ZM${x+84} ${y-62}H${x+102}L${x+122} ${y-44}H${x+84}Z`} fill="#d9f0fb"/><circle cx={x+36} cy={y-12} r="13" fill="#27222f"/><circle cx={x+126} cy={y-12} r="13" fill="#27222f"/><circle cx={x+36} cy={y-12} r="5" fill="#b6bdc9"/><circle cx={x+126} cy={y-12} r="5" fill="#b6bdc9"/></g>;
const road=(y:number)=><g><rect x="30" y={y} width="700" height="44" rx="6" fill="#4a4556"/><path d={`M46 ${y+22}H716`} stroke="#fff" strokeWidth="3" strokeDasharray="22 16"/></g>;
const rail=(y:number)=><g><rect x="30" y={y+20} width="700" height="16" fill="#8a7c6c"/><path d={Array.from({length:30},(_,i)=>`M${40+i*23} ${y+14}v26`).join('')} stroke="#6b4a2c" strokeWidth="6"/><path d={`M30 ${y+20}H730`} stroke="#8f98a8" strokeWidth="5"/></g>;
const pin=(x:number,y:number,t:string)=><g><path d={`M${x} ${y}c-6-10-16-18-16-30a16 16 0 1 1 32 0c0 12-10 20-16 30Z`} fill={INK} stroke="#fff" strokeWidth="2"/><text x={x} y={y-24} textAnchor="middle" fontSize="19" fontWeight="800" fill="#fff">{t}</text></g>;

export function JourneyScene({v}:{v:Measurement8Visual}){
 const k=useKit(),labels=v.labels??[],isTrain=v.variant==='train',g=isTrain?250:244,x0=86,x1=674;
 const legs=labels.filter(l=>l.startsWith('Leg ')),dist=after(find(labels,'Distance')),speed=after(find(labels,'Speed')),time=after(find(labels,'Time','Travel time'));
 const known=[dist,speed,time].filter(Boolean).length,vehicle=isTrain?train(k,legs.length?120:250,g+10):coach(k,legs.length?130:270,g+8);
 return <Frame k={k} horizontalOnly height={H-50}>
  {isTrain?rail(g):road(g)}{vehicle}{pin(x0,g+6,'A')}{pin(x1,g+6,'B')}
  {legs.length?<>{pin((x0+x1)/2,g+6,'')}{Dim(x0,g+74,(x0+x1)/2,g+74,legs[0].split(': ')[1])}{Dim((x0+x1)/2,g+74,x1,g+74,legs[1].split(': ')[1])}{Lab(380,84,'Average speed: ?')}</>:<>
   {Dim(x0,g+74,x1,g+74,dist||(known===2?'?':''))}
   {speed?Lab(240,84,speed):known===2?Lab(240,84,'Speed: ?'):null}{time?Lab(520,84,time):known===2?Lab(520,84,'Time: ?'):null}</>}
 </Frame>;
}
export function FuelScene({v}:{v:Measurement8Visual}){
 const k=useKit(),labels=v.labels??[],cars=labels.filter(l=>l.startsWith('Car ')),distance=labels.find(l=>/\bkm$/.test(l)&&!/\/100/.test(l)),value=distance?(distance.includes(': ')?after(distance):distance):'',used=labels.filter(l=>l!==distance&&!l.startsWith('Car ')),atPump=used.find(l=>/\bL\b|L\/100|litre/.test(l)),others=used.filter(l=>l!==atPump);
 if(cars.length)return <><Frame k={k} horizontalOnly height={H-20}>{cars.map((c,i)=>{const y=100+i*176;return <g key={c}>{road(y)}{car(k,90,y+18)}{Lab(460,y-34,c,{size:22})}</g>;})}</Frame><Facts items={used}/></>;
 const y=270,pump=<g {...shade(k)}><rect x="600" y="110" width="90" height="170" rx="10" fill={k.u('violet')} stroke={INK} strokeWidth="2.5"/><rect x="614" y="126" width="62" height="44" rx="5" fill="#d9f0fb"/><path d="M690 180h14q10 0 10 10v60q0 12-12 12" fill="none" stroke={INK} strokeWidth="5"/><rect x="584" y="278" width="122" height="14" rx="3" fill="#6a5a7f"/></g>;
 return <><Frame k={k} horizontalOnly height={H-20}>{road(y+22)}{pump}{car(k,160,y+36)}{Dim(70,y+96,540,y+96,value)}{atPump?Lab(560,70,atPump.includes(': ')?atPump.split(': ')[1]:atPump):null}</Frame><Facts items={others}/></>;
}
export function FlowScene({v}:{v:Measurement8Visual}){
 const k=useKit(),labels=v.labels??[],tank=labels.find(l=>/^(Capacity|Tank)|^[\d.]+ L$/.test(l)),rest=labels.filter(l=>l!==tank),side=rest[0]&&rest[0].length<=24?rest[0]:undefined,below=side?rest.slice(1):rest;
 return <><Frame k={k} horizontalOnly height={H-10}>
  <path d="M90 60H300Q330 60 330 90V126" fill="none" stroke={k.u('steel')} strokeWidth="26"/><path d="M90 60H300Q330 60 330 90V126" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="0"/><rect x="176" y="24" width="72" height="12" rx="4" fill="#6a5a7f"/><rect x="206" y="24" width="12" height="26" fill="#6a5a7f"/>
  <path d="M330 130V210" stroke="#5cc4ee" strokeWidth="9" strokeLinecap="round"/>
  <path d="M190 200V370Q190 410 330 410Q470 410 470 370V200" fill={k.u('water')} stroke="#14598f" strokeWidth="3"/><ellipse cx="330" cy="200" rx="140" ry="34" fill="#9fe0f7" stroke="#14598f" strokeWidth="3"/>
  {tank?Lab(330,310,tank,{bg:'#fff'}):null}{side?Lab(590,100,side,{size:22}):null}
 </Frame><Facts items={below}/></>;
}
export function WallArea({v}:{v:Measurement8Visual}){
 const k=useKit(),labels=v.labels??[];
 return <><Frame k={k} horizontalOnly height={320}><g {...shade(k)}><rect x="130" y="30" width="500" height="250" fill={k.u('brick')} stroke="#7c3f2a" strokeWidth="3"/></g>{Lab(380,155,labels[0]??'',{bg:PANEL})}</Frame><Facts items={labels.slice(1)}/></>;
}
