import type {Measurement5Visual} from '@/data/assessments/revisions/year5MeasurementFiveForms';

export function areaSpeech(v:Measurement5Visual){
 const [w,h,cw,ch]=v.values;
 if(v.task==='rectangleArea')return `Length ${w} metres. Width ${h} metres.`;
 if(v.task==='combinedArea')return `Garden A: length ${w} metres, width ${h} metres. Garden B: length ${cw} metres, width ${ch} metres.`;
 if(v.task==='compositeArea')return `Outside length ${w} metres, outside height ${h} metres. Top edge ${w-cw} metres. Inset vertical edge ${ch} metres. Inset horizontal edge ${cw} metres. Right lower edge ${h-ch} metres.`;
 return '';
}
export function DimensionedArea({values,cut=false,label='Floor plan'}:{values:number[];cut?:boolean;label?:string}){
 const [w,h,cw=0,ch=0]=values,scale=24,x=76,y=45;
 const pts=cut?[[0,0],[w-cw,0],[w-cw,ch],[w,ch],[w,h],[0,h]]:[[0,0],[w,0],[w,h],[0,h]];
 return <svg viewBox={`0 0 ${w*scale+152} ${h*scale+110}`} style={{width:'100%',maxWidth:590,maxHeight:340}} role="img" aria-label={label}>
  <polygon points={pts.map(([a,b])=>`${x+a*scale},${y+b*scale}`).join(' ')} fill="#d6e8bd" stroke="#58763c" strokeWidth="3"/>
  {pts.map(([a,b],i)=>{if(!cut&&i>1)return null;const[c,d]=pts[(i+1)%pts.length],len=Math.abs(c-a)+Math.abs(d-b);return <text key={i} x={x+(a+c)*scale/2+(d>b?32:d<b?-34:0)} y={y+(b+d)*scale/2+(c>a?-13:c<a?27:5)} textAnchor="middle" fill="#432b15" fontSize="16" fontWeight="700">{len} m</text>;})}
 </svg>;
}
export function TravelScene({coach=false}:{coach?:boolean}){
 return <svg viewBox="0 0 560 180" style={{width:'100%',maxWidth:480,height:155}} aria-hidden="true">
  <path d="M15 155H545" stroke="#766346" strokeWidth="5"/>
  {!coach&&<>{Array.from({length:17},(_,i)=><path key={i} d={`M${25+i*31} 150l-8 18`} stroke="#a48b64" strokeWidth="6"/>)}<path d="M15 166H545" stroke="#766346" strokeWidth="4"/></>}
  <rect x="35" y="36" width="330" height="107" rx="19" fill="#31859b" stroke="#244f60" strokeWidth="3"/>
  <path d="M367 36h83q35 0 47 30l28 65q4 12-12 12H367Z" fill="#d6a13d" stroke="#765823" strokeWidth="3"/>
  {[55,127,199,271].map(x=><g key={x}><rect x={x} y="52" width="54" height="45" rx="7" fill="#d5eff3"/><path d={`M${x+8} 87l32-28`} stroke="white" strokeWidth="4" opacity=".7"/></g>)}
  <path d="M388 53h54q20 0 29 19l11 25h-94Z" fill="#d5eff3"/>
  <path d="M40 111H515" stroke="#fff0ba" strokeWidth="8"/>
  {[90,315,451].map(x=><g key={x}><circle cx={x} cy="144" r="15" fill="#344149"/><circle cx={x} cy="144" r="7" fill="#aebcc1"/></g>)}
  <rect x="497" y="116" width="13" height="9" rx="3" fill="#fff5ac"/>
 </svg>;
}
export function LibraryScene(){return <div style={{position:'relative',width:'100%',maxWidth:330,height:180,margin:'0 auto'}} aria-hidden="true"><svg viewBox="0 0 330 180" width="100%" height="180"><path d="M35 53L165 10l130 43Z" fill="#9b6a31"/><rect x="45" y="53" width="240" height="118" rx="4" fill="#efd7a7"/><rect x="139" y="82" width="53" height="89" fill="#6b4b30"/>{[61,212].map(x=><g key={x}><rect x={x} y="73" width="57" height="74" fill="#b7dfe5" stroke="#a27b48" strokeWidth="5"/><path d={`M${x+28} 74v71M${x} 110h57`} stroke="#a27b48" strokeWidth="4"/></g>)}<circle cx="179" cy="128" r="3" fill="#f6d16b"/></svg><img src="/images/measurelands/week2-3d/book.png" alt="" style={{position:'absolute',width:82,height:95,objectFit:'contain',right:0,bottom:0}}/></div>;}
