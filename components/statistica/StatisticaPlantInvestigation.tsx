type Setup={plant:string;weeks:number;perGroup?:number};
/** Illustrates the planned conditions, never an invented growth result. */
export default function PlantInvestigation({setup}:{setup:Setup}){
 return <figure style={{margin:'12px 0'}} data-plant-investigation={setup.plant}>
  <svg viewBox="0 0 520 260" role="img" aria-label={`Two groups of ${setup.plant} seedlings: Group A in sun, Group B in shade. Illustrations show the setup, not measured results.`} style={{width:'100%',display:'block'}}>
   {[0,1].map(group=><g key={group} transform={`translate(${group*260},0)`} data-growing-condition={group===0?'sun':'shade'}>
    <rect x="8" y="8" width="244" height="232" rx="18" fill={group===0?'#fff3ce':'#e5eef1'} stroke={group===0?'#dfb650':'#9fb8bd'}/>
    <text x="130" y="34" textAnchor="middle" fontSize="17" fontWeight="700" fill="#29433a">Group {group===0?'A · Sun':'B · Shade'}</text>
    {group===0?<g stroke="#d59b20" strokeWidth="3"><circle cx="200" cy="76" r="17" fill="#f6cb50"/>{Array.from({length:8},(_,i)=><path key={i} d="M200 49V42" transform={`rotate(${i*45} 200 76)`}/>)}</g>:<g><path d="M30 85L58 60H204L230 85Z" fill="#647f7b"/><path d="M38 85V192M222 85V192" stroke="#647f7b" strokeWidth="5"/><path d="M44 91H216V191H44Z" fill="#647f7b" opacity=".08"/></g>}
    {[65,130,195].map(x=><g key={x} transform={`translate(${x},0)`} data-setup-seedling>
     <path d="M-22 167H22L16 207H-16Z" fill="#bb7851" stroke="#754b33" strokeWidth="2"/>
     <ellipse cy="167" rx="22" ry="5" fill="#634a32"/>
     <path d="M0 167V115" stroke="#367a42" strokeWidth="4"/>
     <path d="M0 145C-26 142-24 122-22 117-6 117 4 128 0 145Z" fill="#64a957" stroke="#367a42"/>
     <path d="M0 131C24 128 24 109 21 104 4 106-3 117 0 131Z" fill="#83bb65" stroke="#367a42"/>
    </g>)}
    <text x="130" y="228" textAnchor="middle" fontSize="14" fill="#29433a">{setup.perGroup?`${setup.perGroup} seedlings in this group`:`${setup.plant[0].toUpperCase()+setup.plant.slice(1)} seedlings`}</text>
   </g>)}
  </svg>
  <figcaption style={{textAlign:'center',fontSize:14,lineHeight:1.5}}>Compare heights after <strong>{setup.weeks} weeks</strong>.<br/>Illustrations show the setup, not measured results.</figcaption>
 </figure>;
}
