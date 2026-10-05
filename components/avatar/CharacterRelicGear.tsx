/** Character equipment traced in shape and palette from the existing character artwork. */
export const CHARACTER_GEAR_KEYS = ["meazurex_timewielder_staff","numbot_equationator_calculator","geospin_starweaver_orb"] as const;
export type CharacterGearKey=typeof CHARACTER_GEAR_KEYS[number];
export function CharacterRelicGear({held}:{held:CharacterGearKey}){
 if(held==="meazurex_timewielder_staff")return <g data-character-gear={held}>
  <path d="M0 28V-72" stroke="#624025" strokeWidth="5"/><path d="M-1 28V-72" stroke="#e6bb50" strokeWidth="1.3"/>
  {[-60,-44,-28,-12,7,21].map(y=><g key={y}><path d={`M-4 ${y}h8m-8 3h8`} stroke="#e4b657" strokeWidth="1.5"/><path d={`M-3 ${y+4}l6 9`} stroke="#8b5bc6" strokeWidth="2"/></g>)}
  <g transform="translate(0 -87)">
   {[21,17,12,7].map((r,i)=><circle key={r} r={r} fill={i===0?"#271736":"none"} stroke={i%2?"#b67a29":"#f0cb67"} strokeWidth={i===0?2:1}/>) }
   {Array.from({length:16},(_,i)=>{return <g key={i} transform={`rotate(${i*22.5})`}><path d="M0-20v7" stroke="#e5bd60" strokeWidth=".8"/><circle cy="-17" r="1" fill={i%2?"#ac73ff":"#f0cd6c"}/>{i%2===0&&<path d="M0-24l2 4h-4Z" fill="#efcc67"/>}</g>;})}
   <path d="M0-10L3-3 10 0 3 3 0 10-3 3-10 0-3-3Z" fill="#be92ff" stroke="#eee0ff" strokeWidth=".6"/><circle r="3" fill="#f6eaff"/>
   <path d="M0-33l3 10H-3Z" fill="#e3b44f"/>
   {[-1,1].map(side=><g key={side}><path d={`M${side*17} 14v17`} stroke="#d5ae55" strokeWidth=".9"/><path d={`M${side*17} 27l4 7-4 7-4-7Z`} fill="#8c4ed9" stroke="#eacb72" strokeWidth="1"/></g>)}
  </g><path d="M0 23l5 9-5 8-5-8Z" fill="#6e36ac" stroke="#e6bf63" strokeWidth="1.3"/>
 </g>;
 if(held==="numbot_equationator_calculator")return <g data-character-gear={held} transform="translate(0 -29) rotate(-6)"><rect x="-16" y="-35" width="32" height="53" rx="4" fill="#182d36" stroke="#759ca8" strokeWidth="1.5"/><rect x="-12" y="-30" width="24" height="11" rx="1" fill="#32765f"/><text x="0" y="-22" textAnchor="middle" fill="#f4d86f" fontSize="6" fontFamily="monospace">3.14159</text>{["7","8","9","×","4","5","6","−","1","2","3","+","0",".","="].map((n,i)=><g key={i} transform={`translate(${-11+i%4*7} ${-13+Math.floor(i/4)*7})`}><rect x="-2.8" y="-3" width="5.6" height="5.8" rx=".8" fill="#344955" stroke="#718a8e" strokeWidth=".35"/><text x="0" y="1.1" textAnchor="middle" fill="#e4edf0" fontSize="4" fontFamily="sans-serif">{n}</text></g>)}</g>;
 return <g data-character-gear={held} transform="translate(0 -34)"><circle r="15" fill="#5422a4" stroke="#9e7bf3" strokeWidth="1"/><circle r="8" fill="#9257e5"/><circle r="3" fill="#f0dfff"/>{[-35,35,90].map(a=><ellipse key={a} rx="24" ry="9" transform={`rotate(${a})`} stroke="#e5d496" strokeWidth=".8" fill="none"/>)}<path d="M0-20 19-6 12 17H-12L-19-6Z M0-20 12 17-19-6H19L-12 17Z" stroke="#ddd4ff" strokeWidth=".7" fill="none"/>{Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7;return <circle key={i} cx={Math.cos(a)*24} cy={Math.sin(a)*24} r="2.8" fill="#b68aff" stroke="#f1dd9e" strokeWidth=".7"/>;})}</g>;
}
