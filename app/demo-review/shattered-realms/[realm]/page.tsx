import { notFound, redirect } from 'next/navigation';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
import { cavernRealm, cavernWeek } from '@/lib/world3d/shattered-realms';
import ShatteredRealmEntry from '@/components/world3d/ShatteredRealmEntry';
import '@/components/world3d/number-summit.css';
import '@/components/world3d/shattered-realm.css';
export default async function CavernPage({params,searchParams}:{params:Promise<{realm:string}>;searchParams:Promise<{week?:string}>}) {
  const access=await getServerStarpathAccess();
  if(!access.allowed)redirect('/login');
  const realm=cavernRealm((await params).realm);
  if(!realm)notFound();
  return <ShatteredRealmEntry realm={realm} week={cavernWeek((await searchParams).week)}/>;
}
