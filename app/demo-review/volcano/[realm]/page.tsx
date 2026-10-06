import {notFound,redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import {cavernRealm} from '@/lib/world3d/shattered-realms';
import RealmStrongholdEntry from '@/components/world3d/RealmStrongholdEntry';
import '@/components/world3d/number-summit.css';
import '@/components/world3d/number-stronghold.css';
export default async function RealmStrongholdPreview({params}:{params:Promise<{realm:string}>}){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 const realm=cavernRealm((await params).realm);
 if(!realm)notFound();
 return <RealmStrongholdEntry realm={realm}/>;
}
