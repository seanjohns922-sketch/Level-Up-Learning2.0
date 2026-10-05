"use client";
import {WEAPONS} from '@/components/avatar/WeaponArt';
import {AccessoryTube,AccessoryPlate,AccessoryBox,AccessoryGem} from './ExplorerAccessoryParts';

/** All catalogue weapons share the same grip origin as the articulated hand. */
export function ExplorerShopGear({held,colour}:{held:string;colour?:string}){
 const def=WEAPONS[held];if(!def)return null;
 const c=colour||def.color,wood='#7c4a1e',gold='#d7b15a';
 const shaft=(height:number,y:number)=> <mesh position={[0,y,0]} castShadow><cylinderGeometry args={[.023,.027,height,12]}/><meshStandardMaterial color={wood} roughness={.75}/></mesh>;
 const jewel=(y:number,size=.085)=><group position={[0,y,0]}><AccessoryGem colour={c} size={size}/></group>;
 let art;
 switch(def.type){
 case 'sword':case 'dagger':{const h=def.type==='dagger'?.48:1.03;art=<>{shaft(.23,-.025)}<group position={[0,.12,0]}><AccessoryBox width={.29} height={.045} depth={.06} colour={gold}/></group><group position={[0,.15,-.025]}><AccessoryPlate points={[[-.058,0],[.058,0],[.04,h-.12],[0,h],[-.04,h-.12]]} colour={c} depth={.045}/><AccessoryTube points={[[0,.03,.05],[0,h-.12,.05]]} radius={.004} colour="#f8fafc"/></group>{jewel(-.155,.04)}</>;break;}
 case 'wand':art=<>{shaft(.56,.18)}<mesh position={[0,.43,0]}><torusGeometry args={[.065,.012,8,24]}/><meshStandardMaterial color={gold} metalness={.6}/></mesh>{jewel(.52,.105)}</>;break;
 case 'staff':art=<>{shaft(1.32,.27)}<AccessoryTube points={[[-.08,.91,0],[-.14,1.08,0],[0,1.22,0],[.14,1.08,0],[.08,.91,0]]} radius={.02} colour={gold}/>{jewel(1.06,.1)}{[.55,.65,.75].map(y=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.03,.008,6,16]}/><meshStandardMaterial color={c}/></mesh>)}</>;break;
 case 'axe':art=<>{shaft(.94,.3)}<group position={[0,.72,-.035]}><AccessoryPlate points={[[0,-.12],[.29,-.16],[.34,.1],[.12,.21],[0,.12]]} colour={c} depth={.07}/><AccessoryTube points={[[.29,-.15,.08],[.33,.08,.08],[.13,.2,.08]]} radius={.008} colour="#f1f5f9"/></group></>;break;
 case 'hammer':art=<>{shaft(.95,.28)}<group position={[0,.73,0]}><AccessoryBox width={.42} height={.24} depth={.2} colour={c}/></group>{[-1,1].map(side=><group key={side} position={[side*.19,.73,0]}><AccessoryBox width={.045} height={.25} depth={.21} colour={gold}/></group>)}</>;break;
 case 'bow':art=<><AccessoryTube points={[[0,-.52,0],[.2,-.3,0],[.24,0,0],[.2,.3,0],[0,.52,0]]} radius={.027} colour={c}/><AccessoryTube points={[[0,-.52,0],[-.05,0,0],[0,.52,0]]} radius={.003} colour="#eee1ba"/>{shaft(.19,0)}<AccessoryTube points={[[0,-.47,.05],[0,.53,.05]]} radius={.009} colour={wood}/><group position={[0,.53,.05]}><AccessoryPlate points={[[-.036,0],[.036,0],[0,.09]]} colour="#dbe5ec" depth={.015}/></group></>;break;
 case 'shield':art=<group position={[0,.16,.02]}><AccessoryPlate points={[[-.22,.25],[.22,.25],[.2,-.12],[0,-.3],[-.2,-.12]]} colour={gold} depth={.04}/><group position={[0,0,.045]}><AccessoryPlate points={[[-.18,.21],[.18,.21],[.16,-.09],[0,-.25],[-.16,-.09]]} colour={c} depth={.02}/><group position={[0,.03,.045]}><AccessoryGem colour="#e5f5ff" size={.07}/></group></group></group>;break;
 case 'spear':art=<>{shaft(1.4,.3)}<group position={[0,1,-.02]}><AccessoryPlate points={[[-.055,0],[0,.28],[.055,0],[0,-.045]]} colour={c} depth={.035}/></group></>;break;
 case 'torch':art=<>{shaft(.6,.19)}<mesh position={[0,.48,0]}><cylinderGeometry args={[.07,.045,.15,12]}/><meshStandardMaterial color="#564331"/></mesh><mesh position={[0,.64,0]} scale={[.085,.2,.085]}><sphereGeometry args={[1,16,16]}/><meshStandardMaterial color={c} emissive={c} emissiveIntensity={.7}/></mesh><mesh position={[0,.65,.04]}><coneGeometry args={[.045,.24,12]}/><meshStandardMaterial color="#ffe68b" emissive="#ffbc45" emissiveIntensity={.8}/></mesh></>;break;
 case 'trident':art=<>{shaft(1.28,.23)}<AccessoryTube points={[[0,.78,0],[0,1.04,0]]} radius={.023} colour={c}/><AccessoryTube points={[[-.19,1.12,0],[-.18,.86,0],[0,.78,0],[.18,.86,0],[.19,1.12,0]]} radius={.022} colour={c}/>{[-1,0,1].map(side=><group key={side} position={[side*.19,side===0?1.04:1.1,0]}><mesh><coneGeometry args={[.046,.16,6]}/><meshStandardMaterial color={c} metalness={.55}/></mesh></group>)}</>;break;
 case 'scythe':art=<>{shaft(1.35,.26)}<group position={[0,.9,-.025]}><AccessoryPlate points={[[0,.05],[.22,.08],[.48,-.04],[.6,-.29],[.41,-.13],[.2,-.06],[0,-.06]]} colour={c} depth={.04}/></group>{jewel(.84,.045)}</>;break;
 }
 return <group name={`held-${held}`}>{art}</group>;
}
