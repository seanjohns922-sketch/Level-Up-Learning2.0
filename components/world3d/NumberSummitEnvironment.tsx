'use client';
import type { MutableRefObject } from 'react';
import type * as THREE from 'three';
import VolcanoStorm from './VolcanoStorm';
import ExpeditionAtmosphere from './ExpeditionAtmosphere';
import ExpeditionDistanceDetail from './ExpeditionDistanceDetail';
import ExpeditionCrossroads from './ExpeditionCrossroads';
import { ExpeditionOutpost, FoundryDistrict, VolcanoExpedition } from './ExpeditionStructures';
export default function NumberSummitEnvironment({volcanoOpen,unlockedStrongholds=[],position}:{volcanoOpen:boolean;unlockedStrongholds?:string[];position:MutableRefObject<THREE.Vector3>}){
 return <><ExpeditionAtmosphere position={position}/><ExpeditionCrossroads/><ExpeditionOutpost/>
 <ExpeditionDistanceDetail x={-90} z={-25} distance={100}><FoundryDistrict/></ExpeditionDistanceDetail>
 <VolcanoStorm/><VolcanoExpedition open={volcanoOpen} unlockedRealms={unlockedStrongholds}/></>;
}
