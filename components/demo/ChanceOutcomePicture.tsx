/** A single recorded outcome, repeated beside its matching answer row. */
export default function ChanceOutcomePicture({outcome}:{outcome:string}){
 const colours:Record<string,string>={red:'#e5484d',blue:'#3b82f6',green:'#22c55e',yellow:'#eab308',purple:'#a855f7'};
 const colour=colours[outcome.toLowerCase()];
 if(colour)return <svg viewBox='0 0 64 64' aria-hidden='true' data-outcome-picture={outcome}><circle cx='32' cy='32' r='27' fill={colour} stroke='#30253f' strokeWidth='3'/><circle cx='32' cy='32' r='21' fill='none' stroke='white' strokeWidth='2'/>{outcome==='red'?<path d='M20 21L44 43M20 43L44 21' stroke='white' strokeWidth='5'/>:outcome==='blue'?<path d='M17 26H47M17 38H47' stroke='white' strokeWidth='5'/>:outcome==='green'?<path d='M32 17L46 43H18Z' fill='white'/>:outcome==='yellow'?<circle cx='32' cy='32' r='8' fill='#30253f'/>:<path d='M32 16L48 32L32 48L16 32Z' fill='white'/>}</svg>;
 // Reuse the Australian $1 kangaroo artwork used in money lessons. The
 // matching heads illustration keeps the portrait legible at outcome-tile size.
 if(outcome==='Tails')return <svg viewBox='0 0 64 64' aria-hidden='true' data-outcome-picture={outcome}><image href='/coins/coin-1.png' x='0' y='0' width='64' height='64'/></svg>;
 return <svg viewBox='0 0 64 64' aria-hidden='true' data-outcome-picture={outcome}>
  <circle cx='32' cy='32' r='29' fill='#d5ca6c' stroke='#666039' strokeWidth='1.5'/>
  <circle cx='32' cy='32' r='26' fill='none' stroke='#817b43' strokeWidth='1'/>
  <text x='32' y='15' textAnchor='middle' fontSize='6' fontWeight='700' fill='#514d2c'>AUSTRALIA</text>
  <path d='M19 49C20 42 27 41 28 37L27 34C23 32 22 28 23 24C24 18 30 17 35 19C40 20 41 24 40 28L44 32L40 33V37L35 38V41L44 49Z' fill='#a89e50' stroke='#625c32' strokeWidth='1.2' strokeLinejoin='round'/>
  <path d='M25 25Q27 19 34 21M25 28Q27 25 29 28M28 36L31 38M25 43L34 46' fill='none' stroke='#625c32' strokeWidth='1'/>
  <circle cx='37' cy='27' r='.9' fill='#514d2c'/>
  <text x='32' y='57' textAnchor='middle' fontSize='5' fontWeight='700' fill='#514d2c'>1 DOLLAR</text>
 </svg>;
}
