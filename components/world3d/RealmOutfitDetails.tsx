import { realmOutfit } from '@/lib/avatar/realm-outfits';
export function RealmOutfitDetails({top}:{top:string}){
 const item=realmOutfit(top);if(!item)return null;
 const k=item.key;
 return <group>
 {['timewielder','starweaver','insightkeeper'].includes(k)&&[-1,1].map(side=><mesh key={side} position={[side*.28,-.06,0]} rotation={[0,0,side*.13]}><boxGeometry args={[.25,.62,.43]}/><meshStandardMaterial color={item.colour}/></mesh>)}
 {k==='equationator'&&<>{[.43,.57].map(y=><mesh key={y} position={[0,y,.25]}><boxGeometry args={[.26,.075,.035]}/><meshStandardMaterial color={item.trim} metalness={.5}/></mesh>)}{[-1,1].map(side=><mesh key={side} position={[side*.4,.68,0]} scale={[.19,.14,.27]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color={item.colour} metalness={.4}/></mesh>)}</>}
 {k==='timewielder'&&<><mesh position={[0,.59,.25]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.12,.12,.03,24]}/><meshStandardMaterial color={item.trim}/></mesh><mesh position={[0,.59,.275]}><torusGeometry args={[.08,.012,6,24]}/><meshStandardMaterial color="#ad83e7"/></mesh></>}
 {k==='starweaver'&&<>{[-1,0,1].map(i=><mesh key={i} position={[i*.16,.56-i*.13,.25]} rotation={[0,0,Math.PI/4]}><boxGeometry args={[.06,.06,.015]}/><meshStandardMaterial color={item.trim} emissive="#b29c65" emissiveIntensity={.3}/></mesh>)}<mesh position={[-.37,.69,0]} scale={[.23,.12,.28]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#9580ca"/></mesh></>}
 {k==='codemaster'&&[-1,1].flatMap(side=>[0,1,2].map(i=><mesh key={`${side}:${i}`} position={[side*(.28+i*.08),.77-i*.04,0]} rotation={[0,0,-side*.3]} scale={[1,2,1]}><octahedronGeometry args={[.065]}/><meshStandardMaterial color="#b781ef" emissive="#873cb8" emissiveIntensity={.2}/></mesh>))}
 {k==='insightkeeper'&&<><mesh position={[0,.48,.235]}><boxGeometry args={[.24,.48,.025]}/><meshStandardMaterial color="#20354c"/></mesh>{[-1,1].map(side=><mesh key={side} position={[side*.17,.6,.25]} rotation={[0,0,side*.35]}><boxGeometry args={[.11,.31,.03]}/><meshStandardMaterial color="#fff5df"/></mesh>)}<mesh position={[0,.7,.27]}><octahedronGeometry args={[.055]}/><meshStandardMaterial color="#77d9ed"/></mesh></>}
 {k==='chanzia'&&<><mesh position={[0,.48,.25]} rotation={[0,0,-.6]}><boxGeometry args={[.095,.68,.025]}/><meshStandardMaterial color="#aa75bc"/></mesh><mesh position={[0,.74,-.08]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.23,.065,8,24]}/><meshStandardMaterial color="#24182e"/></mesh></>}
 <mesh position={[0,.12,.23]}><boxGeometry args={[.66,.06,.03]}/><meshStandardMaterial color={item.trim}/></mesh>
 </group>;
}
