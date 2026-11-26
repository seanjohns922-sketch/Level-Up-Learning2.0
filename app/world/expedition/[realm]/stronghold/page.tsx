import {notFound,redirect} from 'next/navigation';
import {LEVEL8_LIVE} from '@/lib/level8-release';
import {cavernRealm} from '@/lib/world3d/shattered-realms';
import RealmStrongholdEntry from '@/components/world3d/RealmStrongholdEntry';
import '@/components/world3d/number-summit.css';
import '@/components/world3d/number-stronghold.css';

/** A student's Level 8 stronghold. The entry checks their Level 8 access with the server before anything is shown. */
export default async function StudentStrongholdPage({params}:{params:Promise<{realm:string}>}){
 if(!LEVEL8_LIVE)redirect('/world/tower');
 const realm=cavernRealm((await params).realm);if(!realm)notFound();
 return <RealmStrongholdEntry realm={realm} live/>;
}
