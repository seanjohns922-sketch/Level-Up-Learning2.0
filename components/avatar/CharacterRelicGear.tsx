/** Character equipment traced in shape and palette from the existing character artwork. */
export const CHARACTER_GEAR_KEYS = ["meazurex_timewielder_staff","numbot_equationator_calculator","geospin_starweaver_orb","patternox_codemaster_gauntlet","datara_insightkeeper_tablet","chanzia_master_die"] as const;
export type CharacterGearKey=typeof CHARACTER_GEAR_KEYS[number];
export function CharacterRelicGear({held}:{held:CharacterGearKey}){
 if(held==="patternox_codemaster_gauntlet")return <g data-character-gear={held}>
  <path d="M-12 8-17-30-11-50 12-53 19-31 12 8Z" fill="#1c1930" stroke="#be9654" strokeWidth="1.5"/>
  {[-38,-26,-14,0].map(y=><path key={y} d={`M-13 ${y} 0 ${y+6} 14 ${y-2}`} fill="none" stroke="#927b55" strokeWidth="2"/>)}
  {[-1,0,1].map((i)=><g key={i} transform={`translate(${i*11} ${-36-Math.abs(i)*4}) rotate(${i*23})`}><path d="M0-30 7-10 0 6-7-10Z" fill="#873bcc" stroke="#e2b3ff"/><path d="M0-30 0 6 7-10Z" fill="#c88aff"/><path d="M0-30-7-10 0-5Z" fill="#6731a2"/><path d="M0-25 3-12" stroke="#fff2ff"/></g>)}
  <path d="M0-28 9-17 0-5-9-17Z" fill="#bd7bfd" stroke="#f0d28b"/><path d="M0-25v17l6-9Z" fill="#ead3ff"/>
 </g>;
 if(held==="datara_insightkeeper_tablet")return <g data-character-gear={held} transform="translate(0 -29) rotate(-9)">
  <path d="M-20-33 17-33 21-28 21 23-17 23-21 18-21-28Z" fill="#122e45" stroke="#dcc184" strokeWidth="1.5"/>
  <path d="M-17-28H17V18H-17Z" fill="#1a315b" stroke="#89d5f3"/>
  {[-10,0,10].map((x,i)=><path key={x} d={`M${x-2} 11v${-12-i*7}h4v${12+i*7}Z`} fill={['#66e4e8','#a599ff','#e7baff'][i]}/>)}
  <path d="M-14-17-5-23 5-16 13-25M-14 14H14" stroke="#a8eef8" strokeWidth=".8" fill="none"/>
  {[-14,-5,5,13].map((x,i)=><path key={x} d={`M${x} ${[-20,-26,-19,-28][i]}l2 3-2 3-2-3Z`} fill="#d3bcff"/>)}
  <path d="M-20-29 17 22M-17-32 21 18" stroke="#c4f6ff" strokeOpacity=".25"/>
  <circle cy="20.5" r="1" fill="#eed28a"/>
 </g>;
 if(held==="chanzia_master_die")return <g data-character-gear={held} transform="translate(0 -31)">
  <ellipse rx="26" ry="9" cy="8" fill="none" stroke="#d969ee" strokeWidth="1" transform="rotate(-25)"/>
  <path d="M0-27 21-16 21 9 0 22-21 9-21-16Z" fill="#291336" stroke="#d791ff" strokeWidth="1.5"/>
  <path d="M0-27 21-16 0-4-21-16Z" fill="#6c2587" stroke="#d791ff"/><path d="M0-4V22L21 9V-16Z" fill="#3f1759" stroke="#c778f4"/>
  {[[-10,-16],[10,-16],[0,-10],[-13,-5],[-7,7],[7,0],[15,-5],[7,11],[15,7]].map(([x,y],i)=><g key={i}><ellipse cx={x} cy={y} rx="3.2" ry="3.6" fill="#a23fcb"/><ellipse cx={x} cy={y} rx="1.9" ry="2.3" fill="#f4baff"/></g>)}
  <path d="M-27-12h6m-3-3v6M23-25h6m-3-3v6M20 22h5m-2.5-2.5v5" stroke="#f6caff" strokeWidth="1"/>
 </g>;
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
