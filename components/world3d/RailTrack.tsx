import { railPoint } from "@/lib/world3d/railway";
function Box({p,s,c}:{p:[number,number,number];s:[number,number,number];c:string}){return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.7}/></mesh>;}
export function RailTrack({asset}:{asset:string}){
 const n=asset==='rail_corner'?16:8;
 return <group>{Array.from({length:n},(_,i)=>{const a=railPoint(asset,i/n),b=railPoint(asset,(i+1)/n),angle=Math.atan2(b[0]-a[0],b[1]-a[1]),length=Math.hypot(b[0]-a[0],b[1]-a[1]);return <group key={i} position={[(a[0]+b[0])/2,0,(a[1]+b[1])/2]} rotation={[0,angle,0]}>{i%2===0&&<Box p={[0,.035,0]} s={[.95,.07,.14]} c="#80634a"/>}{[-1,1].map(side=><Box key={side} p={[side*.28,.095,0]} s={[.045,.07,length+.025]} c="#73817e"/>)}</group>;})}</group>;
}
