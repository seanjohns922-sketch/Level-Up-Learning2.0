type SamplingSetup={unit:string;population:number;selected:number[]};
export default function SamplingDiagram({setup}:{setup:SamplingSetup}){
 const selected=new Set(setup.selected);
 return <figure style={{margin:'12px 0'}} data-sampling-diagram>
  <svg viewBox="0 0 420 205" role="img" aria-label={`${setup.population} ${setup.unit}s in the frame; ${selected.size} highlighted. One symbol represents one ${setup.unit}.`} style={{display:'block',width:'100%',maxHeight:230}}>
   <rect x="5" y="5" width="410" height="192" rx="15" fill="#fffdf5" stroke="#d7bd76"/>
   {Array.from({length:setup.population},(_,i)=><circle key={i} data-sampling-unit={i} data-selected={selected.has(i)} cx={30+(i%12)*32.5} cy={30+Math.floor(i/12)*34} r="10" fill={selected.has(i)?'#3279bd':'#e3e6df'} stroke={selected.has(i)?'#215988':'#a8b3a4'} strokeWidth="1.5"/>)}
  </svg>
  <figcaption style={{textAlign:'center',fontSize:14,lineHeight:1.6}}><strong>{selected.size} of {setup.population} {setup.unit}s highlighted</strong><br/>One symbol = one {setup.unit}. Blue = included.</figcaption>
 </figure>;
}
