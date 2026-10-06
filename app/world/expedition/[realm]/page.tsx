import {notFound,redirect} from 'next/navigation';
import {LEVEL7_LIVE} from '@/lib/level7-release';
import {cavernRealm,cavernWeek} from '@/lib/world3d/shattered-realms';
import CoreExpeditionEntry from '@/components/world3d/CoreExpeditionEntry';
import '@/components/world3d/number-summit.css';
import '@/components/world3d/shattered-realm.css';
export default async function StudentCavernPage({params,searchParams}:{params:Promise<{realm:string}>;searchParams:Promise<{week?:string}>}){
 if(!LEVEL7_LIVE)redirect('/world/tower');
 const realm=cavernRealm((await params).realm);if(!realm)notFound();
 // The shell submits the browser's existing student credential to the server gate.
 // No cavern is mounted before the server authorises this specific realm.
 return <CoreExpeditionEntry realm={realm} week={cavernWeek((await searchParams).week,realm)}/>;
}
