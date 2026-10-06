import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import NumberStrongholdEntry from '@/components/world3d/NumberStrongholdEntry';
import '@/components/world3d/number-summit.css';
import '@/components/world3d/number-stronghold.css';
export default async function NumberStrongholdPreview(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <NumberStrongholdEntry/>;
}
