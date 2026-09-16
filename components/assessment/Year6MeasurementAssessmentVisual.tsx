"use client";
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {DimRect} from '@/components/measurelands/MeasurelandsAreaCard';
import {AngleDiagram} from '@/components/measurelands/MeasurelandsAngleReasonCard';
import {DimensionedArea,TravelScene} from './Measurement5Scenes';
import {measurement6Time,type Measurement6Visual} from '@/data/assessments/revisions/year6MeasurementFiveForms';
export function measurement6Speech(v:Measurement6Visual){
 const n=v.values;let details='';
 if(v.task==='rectangle')details=`Length ${n[0]} ${v.unit}. Width ${n[1]} ${v.unit}.`;
 if(v.task==='missingWidth')details=`Length ${n[0]} metres. Width is unknown.`;
 if(v.task==='pairArea'||v.task==='pairPerimeter')details=`Garden A is ${n[0]} metres by ${n[1]} metres. Garden B is ${n[2]} metres by ${n[3]} metres.`;
 if(v.task==='composite')details=`Top edge ${n[0]-n[2]} metres. Inset vertical edge ${n[3]} metres. Inset horizontal edge ${n[2]} metres. Right lower edge ${n[1]-n[3]} metres. Bottom edge ${n[0]} metres. Left edge ${n[1]} metres.`;
 if(v.task==='line'||v.task==='point')details=`Labelled angles: ${n.slice(0,-1).map(a=>`${a} degrees`).join(', ')}. One angle is marked with a question mark.`;
 if(v.task==='finish')details=v.labels!.slice(1).map((label,i)=>`${label}: ${n[i+1]} minutes.`).join(' ');
 if(v.task==='opposite')details=`One angle is labelled ${n[0]} degrees. The angle directly opposite is marked with a question mark.`;
 return [v.description,...(v.task==='finish'?v.labels?.slice(0,1):v.labels)??[],details,v.rows ? 'Timetable. All times use 24-hour time.' : '',...v.rows?.map(r=>`${r.service}. Departs ${measurement6Time(r.departs)}. Arrives ${measurement6Time(r.arrives)}.`)??[]].filter(Boolean).join(' ');
}
export default function Year6MeasurementAssessmentVisual({visual:v}:{visual:Measurement6Visual}){
 const n=v.values;let content;
 if(v.task==='rectangle')content=<DimRect length={n[0]} width={n[1]} unit={v.unit??'m'} size={430}/>;
 else if(v.task==='missingWidth')content=<><p className="mb-4 text-center text-xl font-black text-amber-950">{v.labels![0]}</p><DimRect length={n[0]} width={n[1]} widthLabel="?" unit="m" size={430}/></>;
 else if(v.task==='composite')content=<div className="flex justify-center"><DimensionedArea values={n} cut/></div>;
 else if(v.task==='pairArea'||v.task==='pairPerimeter')content=<div className="flex flex-wrap justify-center gap-6">{[0,2].map(i=><div key={i} style={{flex:'1 1 280px',maxWidth:460}}><p className="mb-4 text-center font-bold text-amber-950">{v.labels![i/2]}</p><DimRect length={n[i]} width={n[i+1]} unit="m" size={340}/></div>)}</div>;
 else if(v.task==='line'||v.task==='point')content=<AngleDiagram type={v.task} sectors={n.map((deg,i)=>({deg,label:i===n.length-1?'?':`${deg}°`,unknown:i===n.length-1}))}/>;
 else if(v.task==='opposite')content=<AngleDiagram type="point" sectors={[{deg:n[0],label:`${n[0]}°`},{deg:180-n[0],label:''},{deg:n[0],label:'?',unknown:true},{deg:180-n[0],label:''}]}/>;
 else if(v.task==='convert')content=<div className="flex flex-wrap justify-center gap-6">{v.labels!.map(label=><div key={label} className="flex flex-col items-center rounded-2xl border border-amber-200 bg-white p-5" style={{minWidth:240}}>{v.art==='route'?<TravelScene/>:<img src={`/images/measurelands/${v.art}`} alt="" style={{height:170,width:260,objectFit:'contain'}}/>}<p className="mt-4 text-center text-2xl font-black text-amber-950">{label}</p></div>)}</div>;
 // Adapt the lesson's ordered itinerary rows without its calculated start/end times.
 else if(v.task==='finish')content=<div className="mx-auto max-w-3xl"><div className="flex justify-center"><TravelScene coach/></div><p className="mb-4 text-center text-xl font-black text-amber-950">{v.labels![0]}</p><ol style={{listStyle:'none',padding:0,display:'grid',gap:12}}>{v.labels!.slice(1).map((label,i)=><li key={label} style={{display:'flex',alignItems:'center',gap:12,padding:16,border:'1px solid #d6b86c',borderRadius:16,background:i===2?'#fff2ce':'#fff'}}><span aria-hidden="true" style={{fontSize:28}}>{['🚌','🏛️','🥪','🚌'][i]}</span><span className="font-bold text-amber-950" style={{flex:1}}>{label}</span><span className="font-black text-amber-950" style={{whiteSpace:'nowrap'}}>{n[i+1]} minutes</span></li>)}</ol></div>;

 else content=<div className="mx-auto max-w-3xl"><div className="flex justify-center"><TravelScene/></div><div style={{overflowX:'auto'}}><table className="w-full border-collapse text-left text-amber-950" style={{minWidth:360}}><caption className="mb-3 font-bold">Timetable · 24-hour time</caption><thead><tr>{['Service','Departs','Arrives'].map(h=><th key={h} className="border border-amber-300 bg-amber-100 p-3">{h}</th>)}</tr></thead><tbody>{v.rows!.map((r,index)=><tr key={index}>{[r.service,measurement6Time(r.departs),measurement6Time(r.arrives)].map((text,i)=><td key={i} className="border border-amber-200 bg-white p-3 font-bold tabular-nums">{text}</td>)}</tr>)}</tbody></table></div></div>;
 return <div className="w-full rounded-2xl border-2 border-amber-300 bg-[#fffaf0] p-4 sm:p-6"><div className="mb-4 flex justify-end"><ReadAloudBtn text={measurement6Speech(v)} size="sm" label="Read diagram" className="!border-amber-600 !bg-[#fffaf0] !text-amber-900"/></div><p className="mb-5 text-center text-lg font-bold text-amber-950">{v.description}</p>{content}</div>;
}
