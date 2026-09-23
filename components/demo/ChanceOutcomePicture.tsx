import AustralianCoin from '@/components/chance-hollow/AustralianCoin';
/** A single recorded outcome, repeated beside its matching answer row. */
export default function ChanceOutcomePicture({outcome}:{outcome:string}){
 const colours:Record<string,string>={red:'#e5484d',blue:'#3b82f6',green:'#22c55e',yellow:'#eab308',purple:'#a855f7'};
 const colour=colours[outcome.toLowerCase()];
 if(colour)return <svg viewBox='0 0 64 64' aria-hidden='true' data-outcome-picture={outcome}><circle cx='32' cy='32' r='27' fill={colour} stroke='#30253f' strokeWidth='3'/><circle cx='32' cy='32' r='21' fill='none' stroke='white' strokeWidth='2'/>{outcome==='red'?<path d='M20 21L44 43M20 43L44 21' stroke='white' strokeWidth='5'/>:outcome==='blue'?<path d='M17 26H47M17 38H47' stroke='white' strokeWidth='5'/>:outcome==='green'?<path d='M32 17L46 43H18Z' fill='white'/>:outcome==='yellow'?<circle cx='32' cy='32' r='8' fill='#30253f'/>:<path d='M32 16L48 32L32 48L16 32Z' fill='white'/>}</svg>;
 return <span data-outcome-picture={outcome} aria-hidden='true'><AustralianCoin side={outcome==='Heads'?'heads':'tails'} size={56}/></span>;
}
